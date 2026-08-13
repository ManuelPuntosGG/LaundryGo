# Internationalize Step 4 of Schedule flow

Written against: `2542b38`

## Evidence chain

- Surface: `frontend/src/pages/Schedule.tsx` lines 393-422 (Step 4: Review & Confirm)
- Problem: Five hardcoded English strings in Step 4 while Steps 1-3 use `t()` for all labels
- Design evidence: `frontend/public/locales/{en,es}/common.json` — the `schedule` namespace governs all labels for this page; Steps 1-3 consume them consistently
- Owner: `Schedule.tsx` (consumer), `locales/{en,es}/common.json` (label source)
- Scope and affected surfaces: `Schedule.tsx`, `en/common.json`, `es/common.json`
- Uncertainty: None

## Design decision

Replace 5 hardcoded strings in Step 4 with `t()` calls and add corresponding translation keys to both locale files. This resolves the i18n inconsistency where Steps 1-3 are translated but Step 4 is not.

## Reuse

- `schedule.orderDetails` exists in `en/common.json:90` but is already used for the Step 3 section title. A distinct key (`schedule.orderDetailsSummary`) is needed for the Step 4 label.
- Exemplar: `Schedule.tsx:408` — `t('schedule.morning')` / `t('schedule.afternoon')` shows the established pattern for Step 4 review values.

## Changes

1. `frontend/public/locales/en/common.json`
   - Change: Add 5 keys inside `"schedule"` (after `"reserve"` at line 94):
     ```json
     "reviewTitle": "Review & Confirm",
     "pickupDateLabel": "Pickup Date",
     "timeSlotLabel": "Time Slot",
     "serviceLabel": "Service",
     "orderDetailsSummary": "Order Details"
     ```
   - Preserve: All existing keys and structure
   - Verify: JSON remains valid

2. `frontend/public/locales/es/common.json`
   - Change: Add 5 keys inside `"schedule"` (after `"reserve"` at line 94):
     ```json
     "reviewTitle": "Revisar y Confirmar",
     "pickupDateLabel": "Fecha de Recogida",
     "timeSlotLabel": "Horario",
     "serviceLabel": "Servicio",
     "orderDetailsSummary": "Detalles del Pedido"
     ```
   - Preserve: All existing keys and structure
   - Verify: JSON remains valid

3. `frontend/src/pages/Schedule.tsx`
   - Change: Replace 5 hardcoded strings with `t()` calls:
     - Line 397: `"Review & Confirm"` → `{t('schedule.reviewTitle')}`
     - Line 402: `"Pickup Date"` → `{t('schedule.pickupDateLabel')}`
     - Line 406: `"Time Slot"` → `{t('schedule.timeSlotLabel')}`
     - Line 412: `"Service"` → `{t('schedule.serviceLabel')}`
     - Line 418: `"Order Details"` → `{t('schedule.orderDetailsSummary')}`
   - Preserve: All existing layout, styling, and logic
   - Verify: Step 4 renders identically in English; switching to Spanish shows translated labels

## Scope

- Inherit: No other consumers — these keys are Step 4-only
- Verify: `Schedule.tsx` (all 4 steps), both locale files
- Exclude: Other pages (Home, Auth, Dashboard), Navbar, Footer

## Validation

- Product: Navigate to `/schedule`, complete Steps 1-3, verify Step 4 renders with translated labels. Switch language to Spanish via `LanguageSwitcher`, repeat flow, verify Spanish labels.
- Interface: `/schedule` Step 4 at desktop and mobile viewports. No layout shift expected.
- System: Confirm no other file references the hardcoded strings. Confirm `schedule.orderDetails` (Step 3) is unchanged.
- Repository: `npm run lint` → no new warnings; `npm run build` → succeeds

## Stop conditions

- Stop if any locale file fails JSON validation after edit.
- Stop if `Schedule.tsx` lint or build fails.

## Design documentation

- After acceptance and none: no documentation changes needed — this is a pure bug fix bringing Step 4 in line with the existing i18n pattern.
