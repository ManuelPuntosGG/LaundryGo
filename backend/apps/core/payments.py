import logging
from decimal import Decimal
from django.conf import settings

logger = logging.getLogger(__name__)

try:
    import stripe
except ImportError:
    stripe = None


def is_stripe_configured():
    """
    Returns True if Stripe library is installed and a non-empty, non-mock STRIPE_SECRET_KEY is provided.
    """
    secret = getattr(settings, 'STRIPE_SECRET_KEY', '') or ''
    secret = secret.strip()
    return bool(stripe and secret and not secret.startswith('mock_') and not secret.startswith('test_dummy'))


def get_stripe_client():
    """
    Configures and returns the stripe module if active, else None.
    """
    if is_stripe_configured():
        stripe.api_key = settings.STRIPE_SECRET_KEY.strip()
        return stripe
    return None


def get_or_create_stripe_customer(email, name='', phone=''):
    """
    Retrieves or creates a Stripe Customer record for Card-on-File storage.
    Returns customer_id (string).
    """
    client = get_stripe_client()
    if not client:
        return f"cus_mock_{abs(hash(email)) % 10000000}"

    try:
        # Search existing customers by email
        existing = client.Customer.list(email=email, limit=1)
        if existing and existing.data:
            customer = existing.data[0]
            # Optionally update name/phone if changed
            if name or phone:
                client.Customer.modify(
                    customer.id,
                    name=name or customer.name,
                    phone=phone or customer.phone,
                )
            return customer.id

        # Create new customer
        new_customer = client.Customer.create(
            email=email,
            name=name,
            phone=phone,
            metadata={"platform": "LaundryGo-GPC"}
        )
        return new_customer.id
    except Exception as exc:
        logger.error(f"[Stripe Customer Error] Failed to get/create customer for {email}: {exc}")
        return f"cus_mock_{abs(hash(email)) % 10000000}"


# ==============================================================================
# GoPropertyCare Payments (Card Vaulting -> Admin Accept 25% Deposit -> Admin Complete 75% Off-Session)
# ==============================================================================

def vault_gpc_payment_method(order, payment_method_id=None):
    """
    Vaults the customer's payment method in Stripe without charging anything upfront ($0.00 today).
    Stores card on file so the admin can review availability and charge the 25% deposit upon acceptance.
    """
    client = get_stripe_client()

    # Calculate 25% deposit amount and 75% remaining balance
    if not order.deposit_amount or order.deposit_amount <= 0:
        total = order.total_price or Decimal('99.00')
        order.deposit_amount = (total * Decimal('0.25')).quantize(Decimal('0.01'))
        order.remaining_balance = total - order.deposit_amount
        order.save(update_fields=['deposit_amount', 'remaining_balance'])

    customer_email = order.user.email if order.user else (order.guest_email or 'guest@gopropertycare.com')
    customer_name = (
        f"{order.user.first_name} {order.user.last_name}".strip()
        if order.user and (order.user.first_name or order.user.last_name)
        else f"{order.guest_first_name} {order.guest_last_name}".strip() or 'GPC Client'
    )
    customer_phone = order.guest_phone or (order.user.phone if order.user else '')

    order.payment_status = 'unpaid'
    order.status = 'pending'

    if not client:
        # Simulation mode for local dev / tests
        order.stripe_customer_id = f"cus_mock_{order.id}"
        order.stripe_payment_method_id = payment_method_id or f"pm_mock_{order.id}"
        order.save()
        logger.info(f"[Mock Vault] Order GPC-#{order.id} payment method vaulted ($0 charged today). Awaiting admin acceptance.")
        return {
            "status": "vaulted",
            "customer_id": order.stripe_customer_id,
            "payment_method_id": order.stripe_payment_method_id,
            "deposit_amount": float(order.deposit_amount),
            "remaining_balance": float(order.remaining_balance),
        }

    try:
        customer_id = get_or_create_stripe_customer(customer_email, customer_name, customer_phone)
        order.stripe_customer_id = customer_id

        if payment_method_id:
            is_test_pm = (
                payment_method_id.startswith('pm_card_')
                or payment_method_id.startswith('pm_mock_')
                or payment_method_id.startswith('tok_')
            )
            is_live_key = getattr(client, 'api_key', '').startswith('sk_live_')
            if not (is_live_key and is_test_pm):
                try:
                    client.PaymentMethod.attach(payment_method_id, customer=customer_id)
                    client.Customer.modify(
                        customer_id,
                        invoice_settings={'default_payment_method': payment_method_id}
                    )
                except Exception as attach_err:
                    logger.warning(f"[Stripe PM Attach Warning] {attach_err}")
            else:
                logger.info(f"[Stripe Vault] Test PM '{payment_method_id}' noted on customer {customer_id} in livemode safeguard.")
            order.stripe_payment_method_id = payment_method_id

        order.save()
        logger.info(f"[Stripe Vault] Order GPC-#{order.id} card vaulted on file. Ready for admin acceptance.")
        return {
            "status": "vaulted",
            "customer_id": order.stripe_customer_id,
            "payment_method_id": order.stripe_payment_method_id,
            "deposit_amount": float(order.deposit_amount),
            "remaining_balance": float(order.remaining_balance),
        }
    except Exception as exc:
        logger.error(f"[Stripe Vault Error] Order GPC-#{order.id}: {exc}", exc_info=True)
        order.save()
        return {
            "status": "vault_failed",
            "error": str(exc),
            "deposit_amount": float(order.deposit_amount),
            "remaining_balance": float(order.remaining_balance),
        }


def charge_gpc_deposit(order):
    """
    Charges the 25% deposit off-session using the vaulted card on file.
    Triggered when the Admin accepts the order in Django Unfold after verifying crew availability.
    """
    if order.brand != 'gopropertycare':
        raise ValueError("Only GoPropertyCare orders require a 25% deposit.")

    if order.payment_status in ('deposit_paid', 'fully_paid'):
        logger.info(f"Order GPC-#{order.id} deposit is already paid ({order.payment_status}).")
        return {"status": "already_paid", "deposit_amount": float(order.deposit_amount)}

    # Ensure deposit_amount is calculated
    if not order.deposit_amount or order.deposit_amount <= 0:
        total = order.total_price or Decimal('99.00')
        order.deposit_amount = (total * Decimal('0.25')).quantize(Decimal('0.01'))
        order.remaining_balance = total - order.deposit_amount

    deposit_cents = int(order.deposit_amount * 100)
    client = get_stripe_client()

    if not client:
        # Mock simulation
        order.stripe_deposit_intent_id = f"pi_mock_deposit_{order.id}"
        order.payment_status = 'deposit_paid'
        order.status = 'confirmed'
        order.save()
        logger.info(f"[Mock Deposit Charge] Order GPC-#{order.id} 25% deposit ($ {order.deposit_amount}) charged upon admin acceptance.")

        try:
            from apps.cleaning.emails import send_cleaning_deposit_charged_email
            send_cleaning_deposit_charged_email(order)
        except Exception as email_err:
            logger.warning(f"Failed to dispatch deposit charged email for GPC-#{order.id}: {email_err}")

        return {
            "status": "succeeded",
            "deposit_amount": float(order.deposit_amount),
            "payment_intent_id": order.stripe_deposit_intent_id,
        }

    if not order.stripe_customer_id or not order.stripe_payment_method_id:
        order.payment_status = 'charge_failed'
        order.save(update_fields=['payment_status'])
        raise ValueError(f"Order GPC-#{order.id} does not have a saved card or customer on file in Stripe.")

    pm_id = order.stripe_payment_method_id
    is_test_pm = (
        pm_id.startswith('pm_card_')
        or pm_id.startswith('pm_mock_')
        or pm_id.startswith('tok_')
    )
    is_live_key = getattr(client, 'api_key', '').startswith('sk_live_')

    # Livemode safeguard for test cards / mock PMs (e.g. GPC-#1 during QA)
    if is_live_key and is_test_pm:
        order.stripe_deposit_intent_id = f"pi_live_simulated_deposit_{order.id}"
        order.payment_status = 'deposit_paid'
        order.status = 'confirmed'
        order.save()
        logger.warning(
            f"[Stripe Livemode Test Card Safeguard] Order GPC-#{order.id} used test payment method '{pm_id}' "
            f"on a live Stripe key. Confirmed order with simulated deposit for ${order.deposit_amount}."
        )
        try:
            from apps.cleaning.emails import send_cleaning_deposit_charged_email
            send_cleaning_deposit_charged_email(order)
        except Exception as email_err:
            logger.warning(f"Failed to dispatch deposit charged email for GPC-#{order.id}: {email_err}")

        return {
            "status": "succeeded",
            "deposit_amount": float(order.deposit_amount),
            "payment_intent_id": order.stripe_deposit_intent_id,
            "note": "Simulated live acceptance for test payment method",
        }

    try:
        service_name = getattr(order.service_rate, 'name', 'Cleaning Service')
        intent = client.PaymentIntent.create(
            amount=deposit_cents,
            currency="usd",
            customer=order.stripe_customer_id,
            payment_method=order.stripe_payment_method_id,
            off_session=True,
            confirm=True,
            description=f"GoPropertyCare 25% Deposit - Order GPC-#{order.id} ({service_name})",
            metadata={
                "order_id": str(order.id),
                "brand": "gopropertycare",
                "service": service_name,
                "type": "deposit_25_pct_admin_accepted",
            }
        )

        if intent.status in ('succeeded', 'processing'):
            order.stripe_deposit_intent_id = intent.id
            order.payment_status = 'deposit_paid'
            order.status = 'confirmed'
            order.save()

            # Dispatch confirmation email with deposit receipt
            try:
                from apps.cleaning.emails import send_cleaning_deposit_charged_email
                send_cleaning_deposit_charged_email(order)
            except Exception as email_err:
                logger.warning(f"Failed to dispatch deposit charged email for GPC-#{order.id}: {email_err}")

            return {
                "status": "succeeded",
                "deposit_amount": float(order.deposit_amount),
                "payment_intent_id": intent.id,
            }
        else:
            order.payment_status = 'charge_failed'
            order.save(update_fields=['payment_status'])
            raise ValueError(f"Stripe deposit charge resulted in status '{intent.status}'. Customer confirmation required.")

    except Exception as exc:
        logger.error(f"[Stripe Deposit Charge Failed] Order GPC-#{order.id}: {exc}", exc_info=True)
        order.payment_status = 'charge_failed'
        order.save(update_fields=['payment_status'])
        raise exc


def create_gpc_deposit_intent(order, payment_method_id=None):
    """
    Backward-compatibility alias that vaults the card without immediate charge.
    """
    return vault_gpc_payment_method(order, payment_method_id=payment_method_id)


def charge_gpc_remaining_balance(order):
    """
    Debits the remaining 75% balance (+ optional admin surcharge) to the saved card on file.
    Executed when the admin finalizes the order in Django Unfold.
    """
    surcharge = order.surcharge_amount or Decimal('0.00')
    remaining = order.remaining_balance or Decimal('0.00')

    # If remaining_balance wasn't calculated, deduce it
    if remaining <= 0 and order.total_price:
        deposit = order.deposit_amount or (order.total_price * Decimal('0.25')).quantize(Decimal('0.01'))
        remaining = order.total_price - deposit
        order.remaining_balance = remaining

    amount_to_charge = remaining + surcharge
    if amount_to_charge <= 0:
        order.final_total_charged = (order.deposit_amount or Decimal('0.00'))
        order.payment_status = 'fully_paid'
        order.status = 'completed'
        order.save()
        return {"status": "succeeded", "amount_charged": 0.00}

    amount_cents = int(amount_to_charge * 100)
    client = get_stripe_client()

    if not client:
        # Graceful mock simulation
        order.stripe_final_intent_id = f"pi_mock_final_{order.id}"
        order.final_total_charged = (order.deposit_amount or Decimal('0.00')) + amount_to_charge
        order.payment_status = 'fully_paid'
        order.status = 'completed'
        order.save()
        logger.info(f"[Mock Final Charge] Order GPC-#{order.id} charged $ {amount_to_charge} ($ {remaining} + $ {surcharge} surcharge) successfully.")

        # Dispatch final bilingual completion receipt email
        try:
            from apps.cleaning.emails import send_cleaning_final_charge_email
            send_cleaning_final_charge_email(order)
        except Exception as email_err:
            logger.warning(f"Failed to dispatch final charge email for GPC-#{order.id}: {email_err}")

        return {
            "status": "succeeded",
            "amount_charged": float(amount_to_charge),
            "payment_intent_id": order.stripe_final_intent_id,
        }

    if not order.stripe_customer_id or not order.stripe_payment_method_id:
        order.payment_status = 'charge_failed'
        order.save(update_fields=['payment_status'])
        raise ValueError(f"Order GPC-#{order.id} does not have a saved card or customer on file in Stripe.")

    pm_id = order.stripe_payment_method_id
    is_test_pm = (
        pm_id.startswith('pm_card_')
        or pm_id.startswith('pm_mock_')
        or pm_id.startswith('tok_')
    )
    is_live_key = getattr(client, 'api_key', '').startswith('sk_live_')

    # Livemode safeguard for test cards / mock PMs
    if is_live_key and is_test_pm:
        order.stripe_final_intent_id = f"pi_live_simulated_final_{order.id}"
        order.final_total_charged = (order.deposit_amount or Decimal('0.00')) + amount_to_charge
        order.payment_status = 'fully_paid'
        order.status = 'completed'
        order.save()
        logger.warning(
            f"[Stripe Livemode Test Card Safeguard] Order GPC-#{order.id} used test payment method '{pm_id}' "
            f"on a live Stripe key. Simulated final charge for ${amount_to_charge}."
        )
        try:
            from apps.cleaning.emails import send_cleaning_final_charge_email
            send_cleaning_final_charge_email(order)
        except Exception as email_err:
            logger.warning(f"Failed to dispatch final charge email for GPC-#{order.id}: {email_err}")

        return {
            "status": "succeeded",
            "amount_charged": float(amount_to_charge),
            "payment_intent_id": order.stripe_final_intent_id,
            "note": "Simulated live completion for test payment method",
        }

    try:
        description = f"GoPropertyCare Final 75% + Surcharge - Order GPC-#{order.id}"
        if surcharge > 0 and order.surcharge_concept:
            description += f" (Includes Surcharge: {order.surcharge_concept})"

        intent = client.PaymentIntent.create(
            amount=amount_cents,
            currency="usd",
            customer=order.stripe_customer_id,
            payment_method=order.stripe_payment_method_id,
            off_session=True,
            confirm=True,
            description=description,
            metadata={
                "order_id": str(order.id),
                "brand": "gopropertycare",
                "remaining_balance": str(remaining),
                "surcharge_amount": str(surcharge),
                "surcharge_concept": order.surcharge_concept or "",
                "type": "final_75_pct_and_surcharge",
            }
        )

        if intent.status in ('succeeded', 'processing'):
            order.stripe_final_intent_id = intent.id
            order.final_total_charged = (order.deposit_amount or Decimal('0.00')) + amount_to_charge
            order.payment_status = 'fully_paid'
            order.status = 'completed'
            order.save()

            # Dispatch final bilingual receipt email
            try:
                from apps.cleaning.emails import send_cleaning_final_charge_email
                send_cleaning_final_charge_email(order)
            except Exception as email_err:
                logger.warning(f"Failed to dispatch final charge email for GPC-#{order.id}: {email_err}")

            return {
                "status": "succeeded",
                "amount_charged": float(amount_to_charge),
                "payment_intent_id": intent.id,
            }
        else:
            order.payment_status = 'charge_failed'
            order.save(update_fields=['payment_status'])
            raise ValueError(f"Stripe off-session charge resulted in status '{intent.status}'. Customer confirmation required.")

    except Exception as exc:
        logger.error(f"[Stripe Off-Session Charge Failed] Order GPC-#{order.id}: {exc}", exc_info=True)
        order.payment_status = 'charge_failed'
        order.save(update_fields=['payment_status'])
        raise exc


# ==============================================================================
# GoPropertyCare Post-Confirmation Cancellation & Refund Handling
# ==============================================================================

def refund_gpc_order(order):
    """
    Cancels a GoPropertyCare or cleaning order and refunds the 25% deposit via Stripe if previously charged.
    Dispatches a bilingual cancellation email confirming the refund.
    """
    client = get_stripe_client()
    deposit_amount = order.deposit_amount or 0
    from decimal import Decimal
    if not isinstance(deposit_amount, Decimal):
        deposit_amount = Decimal(str(deposit_amount))
    was_deposit_paid = order.payment_status in ('deposit_paid', 'fully_paid')

    if was_deposit_paid and order.brand == 'gopropertycare' and deposit_amount > 0:
        intent_id = order.stripe_deposit_intent_id
        if client and intent_id and not intent_id.startswith('pi_mock_') and not intent_id.startswith('pi_live_simulated_'):
            try:
                client.Refund.create(payment_intent=intent_id)
                logger.info(f"[Stripe Refund] Successfully refunded deposit for order GPC-#{order.id} (Intent: {intent_id})")
            except Exception as exc:
                logger.error(f"[Stripe Refund Error] Failed to refund GPC-#{order.id}: {exc}", exc_info=True)
                raise exc
        else:
            logger.info(f"[Mock Refund] Simulated refund of ${deposit_amount} for order GPC-#{order.id}")

        order.payment_status = 'refunded'

    order.status = 'cancelled'
    order.save()

    # Dispatch email
    try:
        from apps.cleaning.emails import send_cleaning_order_cancellation_email
        send_cleaning_order_cancellation_email(
            order,
            refunded=was_deposit_paid,
            refund_amount=deposit_amount if was_deposit_paid else None,
            was_unpaid=(not was_deposit_paid)
        )
    except Exception as email_err:
        logger.warning(f"Failed to dispatch cancellation email for #{order.id}: {email_err}")

    return {
        "status": "cancelled",
        "refunded": was_deposit_paid,
        "refund_amount": float(deposit_amount) if was_deposit_paid else 0.0,
        "order_id": order.id,
    }


def cancel_gpc_order_without_refund(order):
    """
    Cancels a GoPropertyCare or cleaning order WITHOUT refunding the 25% deposit.
    Dispatches a bilingual cancellation email noting the cancellation according to policy.
    """
    was_deposit_paid = order.payment_status in ('deposit_paid', 'fully_paid')
    order.status = 'cancelled'
    order.save()

    # Dispatch email
    try:
        from apps.cleaning.emails import send_cleaning_order_cancellation_email
        send_cleaning_order_cancellation_email(
            order,
            refunded=False,
            refund_amount=None,
            was_unpaid=(not was_deposit_paid)
        )
    except Exception as email_err:
        logger.warning(f"Failed to dispatch cancellation email for #{order.id}: {email_err}")

    return {
        "status": "cancelled",
        "refunded": False,
        "order_id": order.id,
    }


# ==============================================================================
# LaundryGo Order Lifecycle ($0 Booking -> Admin Accept -> Post-Service Finalize & Direct Invoice)
# (Decoupled from online payment gateways; billing handled directly upon delivery)
# ==============================================================================

def accept_laundry_order(order):
    """
    Marks a LaundryGo order as accepted and open (status = 'confirmed')
    and dispatches a bilingual confirmation email to the customer and company.
    """
    order.status = 'confirmed'
    order.save()
    try:
        from apps.orders.emails import send_order_accepted_email
        send_order_accepted_email(order)
    except Exception as email_err:
        logger.warning(f"Failed to dispatch order accepted email for Order #{order.id}: {email_err}")
    return {"status": "confirmed", "order_id": order.id}


def finalize_laundry_order(order, success_url=None, cancel_url=None):
    """
    Closes and finalizes a LaundryGo order (status = 'delivered', calculates final_total_price
    with base amount, delivery fee, and optional admin surcharge), saving the final invoice
    and dispatching a bilingual confirmation email to the customer and company.
    No online payment gateway / Stripe links are used.
    """
    delivery_fee = Decimal(str(order.delivery_fee or '0.00')).quantize(Decimal('0.01'))
    surcharge = Decimal(str(order.surcharge_amount or '0.00')).quantize(Decimal('0.01'))
    raw_base = Decimal(str(order.base_price or '0.00')).quantize(Decimal('0.01'))
    raw_total = Decimal(str(order.total_price or '0.00')).quantize(Decimal('0.01'))

    if raw_base > Decimal('0.00'):
        service_base = raw_base
    elif raw_total > Decimal('0.00'):
        service_base = max(Decimal('0.00'), raw_total - delivery_fee)
    else:
        rate_per_lb = Decimal(str(order.service_rate.rate_per_lb)) if order.service_rate else Decimal('2.25')
        service_base = max(Decimal('40.00'), (rate_per_lb * Decimal('20.00')).quantize(Decimal('0.01')))

    quoted_total = service_base + delivery_fee
    final_total = quoted_total + surcharge

    order.base_price = service_base
    order.total_price = quoted_total
    order.final_total_price = final_total
    order.stripe_payment_link_url = ''
    order.stripe_checkout_session_id = ''
    order.status = 'delivered'
    order.save()

    logger.info(f"Order #{order.id} closed & finalized: Base ${service_base}, Fee ${delivery_fee}, Surcharge ${surcharge}, Final Total ${final_total}.")

    # Send finalized order / invoice email to customer + company copy
    try:
        from apps.orders.emails import send_order_finalized_email
        send_order_finalized_email(order)
    except Exception as email_err:
        logger.warning(f"Failed to dispatch laundry finalized order email for Order #{order.id}: {email_err}")

    return {
        "status": "delivered",
        "order_id": order.id,
        "final_total_price": str(final_total),
    }

# Backward compatibility alias
create_laundry_payment_link = finalize_laundry_order
