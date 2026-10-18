# AGENTS.md — LaundryGo, GoPropertyCare & Evolving Solutions LLC

Guía completa de arquitectura, estructura, modelos de negocio y funcionamiento del monorepo multi-marca para agentes de IA y desarrolladores.

---

## 1. Visión General del Proyecto

Este repositorio aloja una arquitectura desacoplada y multi-tenant que sirve a **tres marcas comerciales independientes** operando en el área metropolitana de Denver y Boulder, Colorado, compartiendo un **único backend de Django REST Framework** y una **única base de datos PostgreSQL** en Render para maximizar la rentabilidad y mantener los costes de infraestructura adicionales en **\$0 USD/mes**:

1. **LaundryGo (`thelaundrygo.com`)**:
   - **Modelo de Negocio**: Lavado de ropa a domicilio cobrado por libra ($2.25, $2.45, $3.85/lb) con opciones de entrega en 2 días (*Standard*), día siguiente (*Go*) o mismo día express (*GoFurther* antes de las 12:00 PM). Permite pedidos puntuales o suscripciones recurrentes con 7.5% de descuento (*Daily*, *Weekly*, *Biweekly*, *Monthly*). Orden mínima de $40.00.
   - **Flujo de Pagos**: **$0.00 de anticipo** al agendar (`payment_status = 'unpaid'`). El cobro final se realiza una vez completado el servicio tras pesar y lavar la ropa. El administrador finaliza el pedido en el panel Django Unfold, con opción de aplicar un sobrecargo (*surcharge*) por libras excedentes o manchas especiales, y genera un enlace de pago seguro de Stripe Checkout que se despacha automáticamente por correo bilingüe al cliente.
   - **Frontend**: Single Page Application en React 19 + Vite 8 + Tailwind CSS v4 (paleta en azules y grises slate). Puerto local `5173`.
2. **GoPropertyCare (`gopropertycare.com`)**:
   - **Modelo de Negocio**: Soluciones integrales de limpieza y mantenimiento residencial y turnover vacacional para propietarios, anfitriones de Airbnb/VRBO y administradores de propiedades en el área metropolitana de Denver y Boulder. Ofrece **3 servicios especializados principales**:
     - *Standard Residential Cleaning*: Mantenimiento del hogar regular o profundo con tarifa base de **$0.125/sqft** y matriz de 18 niveles escalados (desde \$155 para 500–999 sq ft hasta \$480 para 5,700–6,099 sq ft; cotización personalizada para > 6,100 sq ft).
     - *Move-In / Move-Out Cleaning*: Desinfección profunda para devoluciones de depósito, mudanzas y propiedades en venta con tarifa base de **$0.200/sqft** y matriz de 18 niveles escalados (desde \$235 hasta \$890).
     - *Short-Term Rental Turnover (Airbnb / VRBO)*: Rotación express y preparación 5 estrellas unificada basada en habitaciones: Studio/1 Hab (\$90), 2 Habs (\$135), 3 Habs (\$185), 4 Habs (\$255), 5 Habs (\$330) con \$25 por baño adicional. Incluye por defecto lavado de ropa blanca en la unidad (\$0.00 adicional).
     - *Commercial Cleaning Walkthrough*: Visita presencial de evaluación de 15 minutos para oficinas, retail, clínicas médicas/dentales y áreas comunes de HOA en Denver y Boulder. Entrega de propuesta personalizada y detallada por escrito el mismo día hábil con **$0.00 anticipo** (100% gratuito y sin compromiso).
     - *Servicio de Lavandería Fuera de la Propiedad (Off-Site Laundry)*: Add-on dinámico escalado por recuento de habitaciones (+$45 Studio/1 Hab, +$70 2 Habs, +$95 3 Habs, +$120 4 Habs, +$145 5 Habs) para propiedades sin lavadora/secadora propia o anfitriones que requieran retiro y reposición externa.
     - *Add-ons con Incidencia en Cotización*: Horno (\$60), Interior de Refrigerador (\$50), Persianas (\$40), Ventanas Interiores (\$35), Mascotas (\$20), Jacuzzi/Hot Tub (\$25), Patio/Balcón/Parrilla (\$20).
     - *Detalle Consultivo y Métodos de Acceso*: Recuento exacto de habitaciones y baños, estado de ocupación (habitada/amueblada vs vacía), método de entrada a la vivienda (*alguien en casa*, *código de teclado/teclera*, *caja de llaves/lockbox*, *abierta/sin cerradura* u *otro método*) y notas de acceso.
     - *Regla de Agendamiento Mismo Día*: Citas habilitadas para el mismo día si se reservan **antes de las 12:00 PM** con un margen mínimo de **3 horas** respecto a la hora actual; posterior a las 12:00 PM, citas disponibles a partir de mañana.
     - *Descuentos por Frecuencia*: Semanal (20%), Quincenal / Biweekly (15%), Mensual (10%), Una vez (0%).
     - *Flujo de Pagos (Reserva $0.00 + Aprobación Admin 25% + Balance 75%)*: Al reservar en `/schedule`, se registra la tarjeta del cliente de forma segura (*Card on File* con `setup_future_usage='off_session'`) con **$0.00 cobrado al agendar** (`payment_status = 'unpaid'`, `status = 'pending'`). El administrador evalúa la disponibilidad de cuadrilla en el panel Django Unfold y, si hay cupo, ejecuta la acción **Accept Order & Charge 25% Deposit**, realizando el cargo off-session del 25% y enviando la confirmación oficial. Si no hay disponibilidad, puede cancelar la orden sin incurrir en reembolsos ni costos de procesamiento. Una vez finalizado el trabajo, el administrador cierra la orden y ejecuta el débito automático *off-session* del 75% restante más el sobrecargo opcional, enviando el recibo detallado por correo.
     - *Personal 100% Asegurado (Insured)*, listas de control rigurosas, suministros aptos para familias y mascotas, y equipos puntuales.
   - **Frontend**: Single Page Application en React 19 + Vite 8 + Tailwind CSS v4 (paleta en blanco y verdes bosque/esmeralda). Puerto local `5174`. Incluye página separada de presentación corporativa (`/about`), página dedicada con selector de pestañas (Residencial vs Comercial) y listas de control detalladas (`/services`), centro integral de preguntas frecuentes (`/faq`), y flujo dinámico de cotización y agendamiento (`/schedule`).
3. **Evolving Solutions LLC (`evolvingsolutionsllc.com`)**:
   - **Modelo de Negocio**: Socio confiable en Denver para limpieza comercial de corporativos y locales, limpieza post-construcción y fin de obra (gruesa, fina y entrega) y cuadrillas de mano de obra para demolición selectiva de drywall/tablaroca. Tarifas por pie cuadrado (**$0.18/sqft** comercial, **$0.26/sqft** post-obra, **$0.35/sqft** demolición de drywall) con umbral mínimo de visita de **\$99.00**. 100% de cumplimiento en seguros de responsabilidad civil (General Liability), compensación laboral (Workers' Comp) y estándares de seguridad OSHA. Incluye sección de derivación cruzada a GoPropertyCare para propietarios particulares que busquen limpieza residencial de casas y apartamentos.
   - **Frontend**: Single Page Application en React 19 + Vite 8 + Tailwind CSS v4 (paleta en blanco, bronces cálidos y marrones tierra: `#9c6843`, `#815133`, `#573725`, `#2f1b11`). Puerto local `5175`.

- **Internacionalización Integral**: Las tres plataformas son 100% bilingües (Inglés y Español) en sus interfaces y correos transaccionales automatizados (confirmaciones y cancelaciones).
- **Infraestructura de Producción**: Totalmente automatizada para **Render** mediante `render.yaml` (PostgreSQL gestionado + 1 Web Service Django Gunicorn/WhiteNoise + 3 Static Sites React gratuitos).

---

## 2. Estructura de Directorios

```text
LaundryGo/
├── AGENTS.md                       # Guía y especificación integral para agentes AI y desarrolladores
├── .env.example                    # Plantilla de variables de entorno globales / backend
├── .python-version                 # Versión de Python fijada para Render (3.12.8)
├── render.yaml                     # Blueprint Infrastructure as Code para Render (DB + API + 3 Frontends)
├── backend/                        # Proyecto Backend Django 5+ REST API (Headless unificado)
│   ├── .env.example                # Plantilla de variables de entorno para backend
│   ├── .python-version             # Versión de Python local (3.12.8)
│   ├── build.sh                    # Script de compilación, migración y seed data en Render
│   ├── apps/                       # Aplicaciones modulares activas de Django
│   │   ├── core/                   # Modelos base abstractos (TimeStampedModel), HealthCheck, despachador central de emails, pasarela Stripe
│   │   │   ├── emails.py           # Despachador resiliente unificado (SMTP + fallbacks HTTPS Resend/SendGrid)
│   │   │   ├── payments.py         # Módulo de integración Stripe (depósitos 25%, cobros off-session 75%, payment links y modo mock)
│   │   │   ├── views.py            # HealthCheck y Stripe Webhook (/api/v1/stripe/webhook/)
│   │   │   └── management/commands/test_email.py # Diagnóstico SMTP y conectividad en vivo
│   │   ├── users/                  # Autenticación JWT, modelo de usuario y autovinculación de pedidos
│   │   ├── orders/                 # Tarifas por libra, órdenes de lavandería, suscripciones y emails (LaundryGo)
│   │   └── cleaning/               # Tarifas $/sqft, niveles escalados, add-ons, órdenes y emails (GPC & ESL)
│   │       ├── models.py           # CleaningServiceRate, CleaningPricingTier, CleaningAddon, CleaningOrder
│   │       ├── serializers.py      # Cálculo en vivo de base (tiers sqft y matriz STR habitaciones), addons y delivery fee
│   │       ├── views.py            # Endpoints públicos y protegidos (/rates/, /tiers/, /addons/, /orders/, etc.)
│   │       ├── emails.py           # Notificaciones transaccionales bilingües adaptativas por marca (GPC / ESL)
│   │       ├── admin.py            # Integración con Django Unfold (list_editable para edición en vivo de tiers)
│   │       ├── urls.py             # Enrutador /api/v1/cleaning/...
│   │       ├── test_cleaning.py    # Suite de pruebas pytest para GoPropertyCare y Evolving Solutions (16 tests)
│   │       └── management/commands/seed_cleaning_rates.py # Pobla tarifas, add-ons y los 18 tiers de metraje
│   ├── config/                     # Configuración global Django (settings, urls, wsgi)
│   ├── requirements/               # Dependencias (base.txt, development.txt)
│   ├── db.sqlite3                  # Base de datos SQLite local para desarrollo
│   └── manage.py                   # CLI de administración de Django
├── frontend/                       # Frontend 1: LaundryGo (React 19 + Vite 8 + Tailwind v4 - Puerto 5173)
│   ├── .env.example                # Plantilla frontend (VITE_API_URL)
│   ├── public/
│   │   ├── locales/                # Traducciones i18n (en/common.json, es/common.json)
│   │   ├── robots.txt              # Reglas de indexación SEO
│   │   └── sitemap.xml             # Mapa del sitio XML para buscadores
│   ├── scripts/
│   │   └── prerender.js            # Generador estático SSG post-build para SEO (/about, /schedule, /login)
│   ├── src/
│   │   ├── components/common/SEO.tsx # Sincronizador dinámico de metadatos, OpenGraph y JSON-LD
│   │   └── pages/                  # Hero azul, fondo de agua interactivo con oleaje dinámico, calculadora por lbs
│   ├── package.json
│   └── vite.config.ts
├── frontend-gopropertycare/        # Frontend 2: GoPropertyCare (React 19 + Vite 8 + Tailwind v4 - Puerto 5174)
│   ├── public/
│   │   ├── logo.png                # Logotipo oficial (casa verde, escoba, cubeta con espuma y toallas)
│   │   ├── locales/                # Traducciones i18n bilingües de GoPropertyCare
│   │   ├── images/services/        # Fotografías optimizadas de servicios (standard, deep, move-in/out, str)
│   │   ├── robots.txt              # Reglas de indexación SEO
│   │   └── sitemap.xml             # Mapa del sitio XML para buscadores
│   ├── scripts/
│   │   └── prerender.js            # Generador estático SSG post-build para SEO (/, /about, /services, /schedule, /login, /faq)
│   ├── src/
│   │   ├── components/common/SEO.tsx # Gestor SEO dinámico (títulos, descripciones y canonicals)
│   │   ├── constants/
│   │   │   ├── pricingTiers.ts     # Matriz de 18 niveles residenciales ($155 a $480)
│   │   │   ├── strPricing.ts       # Matriz STR por recuento de habitaciones y baños ($90 a $330)
│   │   │   └── cleaningAddons.ts   # Add-ons activos (horno, refri, persianas, ventanas, lavandería off-site, etc.)
│   │   └── pages/
│   │       ├── Home.tsx            # Portada sin precios fijos, enfoque en propuestas de valor y confianza
│   │       ├── Services.tsx        # Página de checklists detallados habitación por habitación y Mini-FAQs
│   │       ├── About.tsx           # Historia corporativa, personal 100% asegurado y mapa de cobertura
│   │       ├── FAQ.tsx             # Centro de ayuda y FAQ en 4 categorías con buscador y tarjeta 24/7
│   │       └── Schedule.tsx        # Cotizador y flujo de reserva en 4 pasos con cálculo en tiempo real
│   ├── package.json
│   └── vite.config.ts
├── frontend-evolvingsolutions/     # Frontend 3: Evolving Solutions LLC (React 19 + Vite 8 + Tailwind v4 - Puerto 5175)
│   ├── public/
│   │   └── locales/                # Traducciones i18n bilingües de Evolving Solutions LLC
│   ├── src/                        # Código fuente Evolving Solutions (tokens marrones/bronce, cotizador comercial, despacho)
│   ├── package.json
│   └── vite.config.ts
└── design-plans/                   # Documentos de auditoría de diseño y planes de i18n
```

---

## 3. Backend (`/backend`)

### Tecnología
- **Lenguaje / Framework**: Python 3.12+ / Django 5+ / Django REST Framework (DRF).
- **Servidor WSGI de Producción**: `gunicorn` para entornos Linux/Render.
- **Servidor de Archivos Estáticos**: `whitenoise` (`CompressedManifestStaticFilesStorage`) para servir el panel Unfold sin requerir Nginx.
- **Base de Datos Dinámica**: `dj-database-url` con soporte nativo para `DATABASE_URL` (PostgreSQL de Render) y fallback local a SQLite.
- **Resolución de Red Robusta (IPv4 Forzado)**: En `backend/config/settings.py`, `socket.getaddrinfo` está interceptado globalmente para forzar `socket.AF_INET`. Esto previene el error `[Errno 101] Network is unreachable` en contenedores de Render/Linux cuando el DNS retorna registros IPv6 sin ruta de salida habilitada.
- **Panel de Administración**: `django-unfold` con navegación modular dedicada en la barra lateral:
  - *LaundryGo Operations*: Laundry Orders, Recurring Schedules, Per-Pound Rates.
  - *GoPropertyCare & Evolving Solutions Operations*: Cleaning Reservations (con filtro y badge de marca), Rates per Sq Ft, Difficulty Add-ons.
  - *User & Access Management*: Customers & Staff.
- **Autenticación & Seguridad JWT**: JSON Web Tokens (JWT) mediante `djangorestframework-simplejwt` con validación defensiva de longitud de clave HMAC-SHA256 según RFC 7518 ($\ge 32$ bytes).
- **Seguridad HTTP en Producción**:
  - HSTS forzado (`SECURE_HSTS_SECONDS = 31536000`, `SECURE_HSTS_INCLUDE_SUBDOMAINS`, `SECURE_HSTS_PRELOAD`).
  - Cabeceras `X_FRAME_OPTIONS = 'SAMEORIGIN'` y protección XSS/Sniffing activa.
  - CORS configurado de forma estricta: `CORS_ALLOW_ALL_ORIGINS = DEBUG` (solo permisivo en desarrollo local; en producción se exige coincidencia con lista blanca o expresiones regulares de `thelaundrygo.com`, `gopropertycare.com`, `evolvingsolutionsllc.com` y `*.onrender.com` con `CORS_ALLOW_CREDENTIALS = True`).
- **Despacho Resiliente de Emails (`apps.core.emails`)**: Módulo unificado con `send_mail_worker` que intenta primero SMTP estándar y, en caso de fallo, activa automáticamente fallbacks mediante API REST HTTPS (Resend y SendGrid), permitiendo remitentes dedicados para cada marca (`info@thelaundrygo.com`, `info@gopropertycare.com` e `info@evolvingsolutionsllc.com`).
- **Pasarela de Pagos Stripe (`apps.core.payments`)**:
  - Gestión híbrida adaptada por marca con la librería oficial `stripe>=8.0.0`.
  - Configuración vía variables de entorno: `STRIPE_SECRET_KEY`, `STRIPE_PUBLISHABLE_KEY`, y `STRIPE_WEBHOOK_SECRET`.
  - **Modo Simulación / Mock Defensivo**: Si las claves no están presentes en el entorno o contienen prefijos de prueba (`mock_`, `test_dummy`), el módulo opera de forma completamente autónoma retornando IDs y URLs simuladas (`pi_mock_...`, `cs_mock_...`), permitiendo que el entorno local y la suite de pruebas automatizadas se ejecuten con 100% de éxito y cero dependencias de red externas.
  - **Stripe Webhook (`/api/v1/stripe/webhook/`)**: Endpoint público CSRF-exempt que escucha eventos `checkout.session.completed` y `payment_intent.succeeded` para actualizar automáticamente el estado a `paid` / `deposit_paid` y registrar los metadatos de transacción.
- **Variables de Entorno**: Gestionadas con `python-decouple` desde `backend/.env`.

### Modelo de Usuarios y Autenticación (`apps.users`)
- **Modelo Personalizado**: `apps.users.models.User` (hereda de `AbstractUser`).
- **Configuración Django**: `AUTH_USER_MODEL = 'users.User'`.
- **Identificador Principal**: El email es el `USERNAME_FIELD` (`email` único).
- **Campos principales**: `email`, `phone`, `first_name`, `last_name`, `street_address`, `city` (default `'Denver'`), `zip_code`.
- **Autovinculación de Huéspedes**: Al registrarse un nuevo usuario en `/api/v1/auth/register/`, el backend busca y vincula automáticamente órdenes previas realizadas como invitado en LaundryGo (`Order`), GoPropertyCare (`CleaningOrder` con `brand='gopropertycare'`) y Evolving Solutions LLC (`CleaningOrder` con `brand='evolvingsolutions'`).
- **Endpoints de Autenticación** (`/api/v1/auth/`):
  - `POST /register/`: Registro de usuario + retorno de tokens JWT y perfil.
  - `POST /login/`: Inicio de sesión mediante `email` y `password`.
  - `POST /token/refresh/`: Refresco de access token usando refresh token.
  - `POST /token/verify/`: Verificación de validez de token.
  - `POST /token/blacklist/`: Invalidación de token al cerrar sesión.
  - `GET|PUT|PATCH /me/`: Obtención y actualización del perfil del usuario autenticado.

---

#### Módulo de Limpieza y Mano de Obra (`apps.cleaning`)
- **Modelos**:
  1. `CleaningServiceRate`: Tarifas dinámicas por pie cuadrado (estandarizadas a 2 decimales) con asignación estricta de marca (`brand`):
     - **GoPropertyCare (`brand='gopropertycare'`) — Soluciones Residenciales y Alquiler Temporal**:
       - `residential`: Standard Residential Cleaning a **$0.125/sqft** (mantenimiento regular o profundo con matriz de 18 niveles desde \$155).
       - `move_in_out`: Move-In / Move-Out Cleaning a **$0.200/sqft** (devoluciones de depósito y venta con matriz de 18 niveles desde \$235).
       - `str_on_site` / `short_term_rental`: Short-Term Rental Turnover (Airbnb / VRBO) a **$0.170/sqft** y cotización por matriz de habitaciones ($90 Studio/1 Hab, $135 2 Habs, $185 3 Habs, $255 4 Habs, $330 5 Habs + $25/baño adicional excedente).
       - Campo `min_order_amount`: Umbral mínimo de **$99.00**.
     - **Evolving Solutions LLC (`brand='evolvingsolutions'`) — Comercial & Demolición**:
       - `commercial`: Limpieza Comercial / Janitorial a **$0.18/sqft** (oficinas, locales, bodegas y corporativos).
       - `post_construction`: Limpieza Post-Construcción a **$0.26/sqft** (aspirado industrial HEPA, yeso, pintura, entrega de obra).
       - `industrial_demolition`: Demolición de Drywall y Mano de Obra Industrial a **$0.35/sqft** (demolición selectiva, ensacado y retiro de escombros).
       - Campo `min_order_amount`: Umbral mínimo de **$99.00**.
  2. `CleaningPricingTier`: Matriz escalada de 18 niveles de metraje cuadrado para GoPropertyCare (`brand='gopropertycare'`), administrable y sobreescribible desde Django Unfold:
     - Campos: `tier_number`, `label`, `min_sqft`, `max_sqft`, `standard_price`, `deep_price`, `str_on_site_price`, `str_off_site_price`, `is_custom_quote`, `is_active`.
     - Tiers 0 al 16 abarcan desde 500 sq ft hasta 6,099 sq ft. Tier 17 (6,100+ sq ft) activa captura de prospectos para cotización personalizada (*Custom Quote*).
  3. `CleaningAddon`: Recargos por dificultad o extras segregados por marca:
     - Residenciales & STR (`gopropertycare`): Limpieza de horno ($60), interior de refrigerador ($50), persianas ($40), ventanas interiores ($35), servicio de lavandería externa off-site (+$45 a +$145 escalado por habitación), mascotas ($20), jacuzzi / hot tub ($25), patio / balcón / parrilla ($20).
     - Comerciales (`evolvingsolutions`): Techos altos/vigas industriales ($45), retiro y carga de escombros pesados ($95), lavado mecanizado de pisos ($65), vitrinas/cristales ($55), desinfección de baterías de baño ($45), turno nocturno/fin de semana ($50).
  4. `CleaningOrder`: Registro de servicio con:
     - `brand`: `'gopropertycare'` o `'evolvingsolutions'`.
     - Prefijo de visualización dinámico: `GPC-#{id}` para GoPropertyCare y `ESL-#{id}` para Evolving Solutions LLC.
     - `square_feet`, `bedrooms`, `bathrooms`, `is_occupied`, `entry_method`, `entry_notes`, `service_rate`, `selected_addons` (JSON), `service_date`, `time_slot`, dirección en Denver/Boulder, zona (`inner` $0 / `outer` $25), `frequency`, `base_price`, `addons_total`, `delivery_fee`, `total_price`, `special_instructions`, `status` e idioma `language` (`'en'` o `'es'`).
     - **Campos Financieros y de Pasarela Stripe**:
       - `deposit_amount`: Depósito del 25% cobrado al momento de la reserva ($25\% \times \text{total\_price}$).
       - `remaining_balance`: Balance restante del 75% pendiente a cobrar tras la finalización del servicio.
       - `surcharge_amount`: Monto de sobrecargo opcional en USD configurable por el administrador.
       - `surcharge_concept`: Concepto o motivo descriptivo del sobrecargo (ej. suciedad extrema, horas extra).
       - `final_total_charged`: Total neto efectivamente cobrado al cliente (`deposit_amount` + `remaining_balance` + `surcharge_amount`).
       - `payment_status`: Estado del pago (`unpaid`, `deposit_paid`, `fully_paid`, `refunded`, `failed`).
       - `stripe_customer_id`: Identificador de cliente en Stripe para el usuario o huésped.
       - `stripe_payment_method_id`: Método de pago / tarjeta tokenizada guardada en Stripe (*Card on File* con `setup_future_usage='off_session'`).
       - `stripe_deposit_intent_id`: ID del PaymentIntent de Stripe del depósito inicial del 25%.
       - `stripe_final_intent_id`: ID del PaymentIntent de Stripe del cobro final del 75% + sobrecargo.

- **Reglas de Agendamiento y Validación**:
  - **Mismo día condicional**: En GoPropertyCare y LaundryGo se permite reservar para el mismo día si la orden se crea antes de las **12:00 PM** local, con una antelación mínima de **3 horas** respecto a la hora de llegada elegida. Posterior a las 12:00 PM, se exige agendar a partir de mañana (+1 día). En Evolving Solutions LLC las visitas se programan con al menos 24 horas de antelación.
  - **Validación de Pertenencia de Marca**: El serializador valida que la tarifa seleccionada pertenezca a la marca correspondiente de la orden (`gopropertycare` o `evolvingsolutions`), garantizando total autonomía entre plataformas.

- **Panel de Administración Django Unfold (`apps.cleaning.admin`)**:
  - Filtros por marca (`brand`) y estado de pago (`payment_status`).
  - Badge visual dinámico de estado de pago: `Unpaid` (ámbar), `Deposit Paid (25%)` (azul), `Fully Paid` (verde), `Refunded` (rojo).
  - Fieldset interactivo *Financials & Surcharge (GoPropertyCare)*: Muestra campos calculados en solo lectura y permite editar `surcharge_amount` y `surcharge_concept`.
  - Acción de Unfold `accept_and_charge_deposit` (**Accept Order & Charge 25% Deposit**): Permite al administrador verificar la disponibilidad de cuadrilla antes de comprometer fondos. Al ejecutarla, debita el depósito del 25% a la tarjeta registrada en Stripe, actualiza la orden a `status = 'confirmed'` y `payment_status = 'deposit_paid'`, y despacha el correo de confirmación de cita al cliente.
  - Acción de Unfold `complete_and_charge_order` (**Complete Order & Charge Remaining Balance + Surcharge**): Ejecuta el cargo *off-session* en Stripe del 75% restante más el sobrecargo a la tarjeta guardada, actualiza la orden a `completed` y `fully_paid`, y despacha el correo transaccional de recibo final desglosado.

- **Emails Transaccionales Bilingües (`apps.cleaning.emails`)**:
  - Detectan automáticamente el campo `order.brand`.
  - Si `brand == 'evolvingsolutions'`: Emite notificaciones con membrete corporativo marrón (`#573725`), remitente `Evolving Solutions LLC <info@evolvingsolutionsllc.com>`, referencia `ESL-#{id}`, y mensaje de solicitud de COI / políticas de seguridad en obra.
  - Si `brand == 'gopropertycare'`: Emite notificaciones de solicitud recibida con membrete verde (`#16a34a`), remitente `GoPropertyCare <info@gopropertycare.com>`, referencia `GPC-#{id}`, indicando que el pedido está en revisión ($0.00 cobrado hoy) y que el depósito del 25% solo se debitará tras la confirmación del administrador.
  - `send_cleaning_deposit_charged_email`: Emite confirmación oficial cuando el administrador acepta la orden en el panel, confirmando el débito del 25% y desglosando el 75% restante pendiente al finalizar.
  - `send_cleaning_final_charge_email`: Emite recibo final detallado bilingüe desglosando base, add-ons, tarifa de zona, depósito previo (25%), cargo final (75%), sobrecargo aplicado con su concepto, y total neto facturado.

- **Endpoints de Limpieza** (`/api/v1/cleaning/`):
  - `GET /rates/?brand=<brand>`: Lista de tarifas filtrada por marca comercial.
  - `GET /tiers/?brand=<brand>`: Lista de niveles de precios escalados (CleaningPricingTier) para GoPropertyCare.
  - `GET /addons/?brand=<brand>`: Lista de add-ons filtrada por marca comercial.
  - `GET|POST /orders/?brand=<brand>`: Lista de órdenes del usuario autenticado filtradas por marca / Creación de orden validada contra la marca (crea automáticamente el PaymentIntent del 25% y asocia el método de pago para GoPropertyCare).
  - `GET|PUT|PATCH /orders/<id>/`: Detalle y actualización de reserva.
  - `POST /orders/<id>/cancel/`: Cancelación de orden pendiente.
  - `GET /schedule/available-dates/`: Calendario dinámico de fechas disponibles.
  - `POST /walkthrough-inquiry/`: Solicitud pública de walkthrough presencial comercial para GoPropertyCare. Valida los 5 campos obligatorios (`name`, `phone`, `email`, `zip_code`, `details`) y despacha emails transaccionales asíncronos tanto al equipo comercial (`info@gopropertycare.com`) como al cliente con confirmación el mismo día hábil.

---

### Módulo de Lavandería LaundryGo (`apps.orders`)
- **Modelos**:
  1. `ServiceRate`: Tarifas por libra (`standard` - 2 días a $2.25/lb, `go` - siguiente día a $2.45/lb, `gofurther` - mismo día a $3.85/lb).
  2. `Order`: Pedidos de lavado por libra con entrega puerta a puerta.
     - **Campos Financieros y de Pasarela Stripe**:
       - `base_price`: Subtotal base estimado calculado a partir de las libras estimadas y la tarifa seleccionada (respetando el mínimo de $40.00).
       - `total_price`: Total estimado inicial incluyendo tarifa de zona ($0.00 inner / $25.00 outer).
       - `surcharge_amount`: Monto de sobrecargo configurable por el administrador (por exceso de libras reales, prendas delicadas o manchas difíciles).
       - `surcharge_concept`: Concepto descriptivo del sobrecargo.
       - `final_total_price`: Monto total definitivo a facturar (`total_price` + `surcharge_amount`).
       - `payment_status`: Estado del pago (`unpaid`, `paid`, `refunded`, `failed`).
       - `stripe_customer_id`: Identificador de cliente en Stripe.
       - `stripe_payment_link_url`: URL de la sesión de Stripe Checkout generada para el pago del cliente.
       - `stripe_checkout_session_id`: ID de la sesión de Stripe Checkout.
  3. `RecurringSchedule`: Suscripciones recurrentes (*Daily*, *Weekly*, *Biweekly*, *Monthly*) con 7.5% de descuento.

- **Panel de Administración Django Unfold (`apps.orders.admin`)**:
  - Filtros por estado (`status`) y estado de pago (`payment_status`).
  - Badge visual de estado de pago: `Unpaid` (ámbar), `Paid` (verde), `Refunded` (rojo).
  - Fieldset interactivo *Financials & Surcharge*: Permite revisar los totales y editar `surcharge_amount` y `surcharge_concept`.
  - Acción de Unfold `finalize_and_send_payment_link` (**Finalize Order & Send Payment Link to Customer**): Actualiza el pedido a `completed`, genera la sesión de Stripe Checkout / Payment Link con el monto final desglosado (base + delivery fee + sobrecargo) y despacha el correo transaccional bilingüe al cliente con el botón de pago seguro.

- **Emails Transaccionales Bilingües (`apps.orders.emails`)**:
  - `send_order_confirmation_email`: Confirmación inicial bilingüe con marca LaundryGo (`info@thelaundrygo.com`), indicando que el pedido se procesará a $0.00 inicial y se enviará el enlace de pago tras el pesado y lavado.
  - `send_laundry_payment_link_email`: Correo bilingüe con el desglose del total final, concepto de sobrecargo (si aplica) y botón directo a Stripe Checkout para efectuar el pago seguro.

- **Endpoints de Lavandería** (`/api/v1/`):
  - `GET /services/rates/`: Lista de tarifas por libra.
  - `GET|POST /orders/`: Creación y listado de órdenes de lavado.
  - `POST /orders/<id>/cancel/`: Cancelación de orden.
  - `GET /schedule/available-dates/`: Fechas para recolección (soporta mismo día si es antes de las 12:00 PM).

---

## 4. Frontends

### Frontend 1: LaundryGo (`/frontend`)
- **Tecnología**: React 19, Vite 8, TypeScript, Tailwind CSS v4.
- **Puerto Local**: `5173`.
- **Estética**: Azules vivos (`--color-brand-600: #2563eb`) y grises Slate con Glassmorphism.
- **Efecto Visual de Fondo (Agua Reactiva)**: Corriente dinámica de agua en la parte baja con oleaje animado SVG que se eleva suavemente conforme el usuario desciende en la página (alcanzando hasta un 86vh en el footer). En la página de agendamiento (`/schedule`), el nivel del agua asciende automáticamente en sincronía con el avance de los 4 pasos del pedido. El diseño integra el cuerpo del agua con el mismo gradiente de las olas sin bordes rectos artificiales.
- **Flujo de Agendamiento y Notificación de Pago (`/schedule`)**: El usuario agenda su recolección indicando libras estimadas y horario a $0.00 de anticipo. La pantalla de confirmación y los correos bilingües informan con claridad que una vez pesado y lavado el pedido, recibirá un enlace de pago seguro de Stripe para liquidar el servicio antes de la entrega.
- **SEO & Prerenderizado Estático (SSG)**: Componente dinámico `<SEO>` que sincroniza `title`, `meta description`, canonicals y OpenGraph/Twitter Cards por ruta. Script post-compilación `scripts/prerender.js` que genera archivos estáticos con metadatos y esquemas JSON-LD LocalBusiness para `/`, `/about`, `/schedule` y `/login`.

### Frontend 2: GoPropertyCare (`/frontend-gopropertycare`)
- **Tecnología**: React 19, Vite 8, TypeScript, Tailwind CSS v4.
- **Puerto Local**: `5174`.
- **Logotipo**: Casa verde con escoba, cubeta con espuma y toallas plegadas (`public/logo.png`).
- **Estética**: Blanco y verdes bosque/esmeralda (`--color-brand-*` desde `#f0fdf4` hasta `#052e16`).
- **Efecto Visual de Fondo (Partículas Ambientales)**: Sistema de partículas sutiles flotantes que imitan micro-partículas de polvo en tonos verdes esmeralda acordes a la paleta, aportando dinamismo visual sin sobrecargar el rendimiento.
- **Enfoque de Negocio y Páginas Clave**:
  - *Home (`/`)*: Portada orientada a la confianza y la propuesta de valor sin exponer tecnicismos ni tasas por pie cuadrado. Destaca los 3 servicios principales, garantías de personal asegurado y testimonios.
  - *Página de Servicios (`/services`)*: Selector de pestañas limpio y directo entre **Limpieza Residencial** y **Limpieza Comercial** (sin insignias adicionales en el toggle). En Residencial incluye checklists exhaustivos para Cocina, Baños, Dormitorios y Áreas Comunes (Standard, Deep, Move-In/Out y STR) con Mini-FAQs contextuales. En Comercial presenta los 4 servicios corporativos clave (Office, Retail, Medical & Dental, HOA & Property Management) de manera intuitiva y dirigida al cliente final, reservando los llamados a la acción (CTA) de "Request a Walkthrough" exclusivamente al inicio (banner de anuncio) y al final de la sección (tarjeta de cierre), los cuales abren el modal interactivo `<CommercialWalkthroughModal />`.
  - *Modal de Walkthrough Comercial (`<CommercialWalkthroughModal />`)*: Modal accesible de captura de prospectos comerciales que solicita 5 campos obligatorios: Nombre, Teléfono, Correo Electrónico, Código Postal del Inmueble y Detalles del Espacio o Negocio. Al enviar, invoca `/api/v1/cleaning/walkthrough-inquiry/` y despacha automáticamente notificaciones por email al equipo comercial y acuse de recibo bilingüe al prospecto ($0.00 anticipo y propuesta por escrito el mismo día hábil).
  - *Página Corporativa (`/about`)*: Historia y estándares de GoPropertyCare, política de personal 100% asegurado, suministros amigables con mascotas y niños, y áreas de atención metropolitana.
  - *Página de Preguntas Frecuentes (`/faq`)*: Centro integral de ayuda bilingüe estructurado en las 4 categorías del cliente (General con 8 Q&As, Residencial con 13 Q&As, Comercial con 11 Q&As y Pagos y Políticas con 9 Q&As) con buscador dinámico en tiempo real, selector de categorías por píldoras, acordeones accesibles, marcado estructurado JSON-LD `FAQPage` y tarjeta de contacto y soporte 24/7 (`(720) 590-8632` / `info@gopropertycare.com`).
  - *Flujo de Cotización y Reserva Exclusivamente Residencial (`/schedule`)*:
    - Diseñado exclusivamente para clientes residenciales y anfitriones de alquileres vacacionales.
    - **Paso 1 (Servicio, Dimensiones y Frecuencia)**: Tres opciones residenciales directas: *Standard Cleaning*, *Deep / Move-In / Move-Out*, y *Short-Term Rental Turnover* con matriz de 18 niveles de metraje cuadrado o selector de habitaciones/baños para STR, más descuentos por frecuencia (Semanal 20%, Quincenal 15%, Mensual 10%).
    - **Paso 2 (Fecha y Hora)**: Calendario interactivo con regla de agendamiento para el mismo día (si se reserva antes de las 12:00 PM con margen de 3 horas) y selector de hora exacta de llegada.
    - **Paso 3 (Ubicación, Contacto, Acceso y Add-ons)**: Captura de dirección residencial en Denver/Boulder, método de entrada a la vivienda y add-ons con incidencia en el precio.
    - **Paso 4 (Revisión, Depósito y Pago Seguro con Stripe)**:
      - Desglose transparente en vivo: Subtotal base, add-ons, tarifa de zona, total estimado de la reserva, **Depósito del 25% a pagar hoy** y **Balance del 75% a pagar tras la finalización**.
      - Formulario integrado de captura de tarjeta con insignia de cifrado SSL de 256 bits y respaldo de Stripe (*Card on File* con `setup_future_usage='off_session'`).
      - Botón de confirmación dinámico ("Pay 25% Deposit ($XX.XX) & Confirm Booking").
      - Pantalla de éxito con resumen del depósito abonado, balance pendiente, y confirmación de la orden con prefijo `GPC-#{id}`.
- **SEO & SSG**: Generación estática post-compilación en `scripts/prerender.js` para 6 rutas clave (`/`, `/about`, `/services`, `/schedule`, `/login`, `/faq`) con `sitemap.xml` y `robots.txt`.

### Frontend 3: Evolving Solutions LLC (`/frontend-evolvingsolutions`)
- **Tecnología**: React 19, Vite 8, TypeScript, Tailwind CSS v4.
- **Puerto Local**: `5175`.
- **Estética**: Blanco, bronces cálidos y marrones tierra (`#9c6843`, `#815133`, `#573725`, `#2f1b11`).
- **Logotipo / Emblema**: Isotipo arquitectónico tipográfico con gradiente bronce e ícono de edificio corporativo / casco de construcción.
- **Enfoque**: Comercial e Industrial (Janitorial comercial $0.18, Post-construcción $0.26, Demolición selectiva de drywall $0.35, mínimo $99). Flujo de despacho en 4 pasos enviando `brand: 'evolvingsolutions'`.

---

## 5. Reglas de Negocio Clave

1. **Zonas de Cobertura en Denver y Boulder (Compartidas por las Tres Marcas)**:
   - **Zona Inner (Gratis - $0.00)**: Denver (Downtown / Central), Lakewood, Englewood, Wheat Ridge, Arvada, Westminster, Boulder, Broomfield.
   - **Zona Outer (Recargo - $25.00)**: Aurora, Thornton, Centennial, Highlands Ranch.
2. **Reglas Específicas de GoPropertyCare**:
   - **Mismo Día con Cutoff de 12:00 PM**: Reservas para el mismo día disponibles únicamente si se efectúan antes de las 12:00 PM local y seleccionando una hora con al menos 3 horas de margen respecto a la hora actual. A partir de las 12:00 PM, las reservas se habilitan a partir de mañana.
   - **Precios Escalonados Upfront (Residencial)**: 18 niveles para Standard ($155 a $480) y Move-In/Out ($235 a $890). Metrajes superiores a 6,100 sq ft activan el formulario de captura para cotización a medida.
   - **Rotación STR Unificada (Airbnb / VRBO)**: Basada en el recuento de habitaciones y baños en lugar de metraje, con lavado en la propiedad incluido por defecto ($0.00 extra):
     - Studio / 1 Hab: $90 (1 baño incluido, recargo off-site $45)
     - 2 Habs: $135 (2 baños incluidos, recargo off-site $70)
     - 3 Habs: $185 (2 baños incluidos, recargo off-site $95)
     - 4 Habs: $255 (3 baños incluidos, recargo off-site $120)
     - 5 Habs: $330 (4 baños incluidos, recargo off-site $145)
     - 6+ Habs o > 3,500 sq ft: Activa cotización personalizada a medida.
     - Baños adicionales excedentes: +$25.00 por cada baño por encima del cupo incluido.
     - Add-on de lavandería externa (Off-Site): Escala según las habitaciones de la propiedad para anfitriones sin lavadora/secadora propia o requerimiento de retiro y reposición externa.
   - **Descuentos por Frecuencia Recurrente**: 20% semanal, 15% quincenal (biweekly), 10% mensual y 0% pago único (one-time).
   - **Gestión Administrativa en Vivo**: El panel Django Unfold permite modificar los precios de los 18 tiers de manera directa en tabla (`list_editable`), impactando de inmediato en el backend y frontend.
3. **Reglas Específicas de Evolving Solutions LLC**:
   - **Antelación de 24 Horas**: Todas las visitas se agendan con al menos 24 horas de antelación para coordinación de cuadrillas y equipos industriales.
   - **Orden Mínima de Visita**: **$99.00**. Si $\text{sqft} \times \text{tarifa} < \$99.00$, se cobra el piso de $99.00.
   - **Medición de Precios**: Exclusivamente en **\$/square feet** (\$/sq ft) más recargos por dificultad o servicios especiales.
4. **Reglas Específicas de LaundryGo (Lavandería)**:
   - **Cutoff de Mismo Día (GoFurther)**: Solo disponible para hoy si la hora local es anterior a las 12:00 PM.
   - **Orden Mínima de Lavado**: **$40.00**.
   - **Descuento Recurrente (7.5%)**: Aplica a partir del segundo cobro en suscripciones.
5. **Checkout Flexible (Usuario vs Guest)**:
   - Los pedidos pueden realizarse autenticado o como invitado (`guest_*`). Al registrarse posteriormente con el mismo correo, el sistema auto-vincula el historial de las tres marcas.
6. **Notificaciones Bilingües**:
   - Cada orden almacena `language: 'en' | 'es'`. Los correos se emiten en el idioma seleccionado por el cliente con el branding y contacto correspondiente a cada una de las 3 marcas.
7. **Estrategia y Flujo de Pagos por Marca (Integración Stripe)**:
   - **GoPropertyCare (Flujo en 3 Fases: Tokenización $0.00 -> Aceptación Admin 25% -> Finalización 75% + Sobrecargo)**:
     - *1. Reserva y Registro Seguro ($0.00 cobrado al agendar)*: Al agendar en `/schedule`, el cliente ingresa su información de tarjeta. El método de pago se tokeniza y adjunta al cliente en Stripe (*Card on File* con `setup_future_usage='off_session'`) con **$0.00 cobrado hoy**. La orden se crea con `status = 'pending'`, `payment_status = 'unpaid'` y se calcula el 25% de depósito y 75% de saldo restante.
     - *2. Verificación de Cuadrilla & Aprobación Admin*: El administrador inspecciona la orden en Django Unfold para validar la disponibilidad operativa de la fecha y hora seleccionada.
       - Si hay disponibilidad: Ejecuta la acción **Accept Order & Charge 25% Deposit** (`accept_and_charge_deposit`). Stripe debita el 25% *off-session*, el pedido pasa a `status = 'confirmed'` y `payment_status = 'deposit_paid'`, y se despacha un correo de confirmación oficial con el desglose del depósito cobrado y el 75% restante.
       - Si NO hay disponibilidad: El administrador cancela la orden directamente sin necesidad de procesar reembolsos ni sufrir comisiones bancarias perdidas.
     - *3. Finalización del Trabajo & Sobrecargo Opcional*: Cuando la cuadrilla concluye la limpieza, el administrador revisa si hubo servicios adicionales (ej. horno no declarado, horas extra) e ingresa `surcharge_amount` y `surcharge_concept`. Al ejecutar la acción `complete_and_charge_order`, el sistema debita el 75% restante más el sobrecargo *off-session*, marca el pedido como `completed` y `fully_paid`, y emite el recibo final bilingüe.
   - **LaundryGo (Cobro Post-Servicio mediante Payment Link)**:
     - *Upfront Booking*: El cliente agenda su recolección con **$0.00 de anticipo** (`payment_status = 'unpaid'`).
     - *Pesado, Lavado & Sobrecargo*: Tras recolectar la ropa, el operario la pesa en el centro de lavado. Si el pesaje real difiere del estimado o hay cargos adicionales por manchas difíciles, el administrador en Django Unfold asigna `surcharge_amount` y `surcharge_concept`.
     - *Enlace de Pago Seguro*: Al ejecutar la acción `finalize_and_send_payment_link`, el backend genera una sesión de Stripe Checkout / Payment Link con el desglose exacto (base + tarifa de zona + sobrecargo) y despacha un correo bilingüe con el botón de pago. Al completar la transacción, el webhook de Stripe marca la orden como `paid`.
   - **Resiliencia & Modo Simulación (Mock)**: Tanto para GoPropertyCare como para LaundryGo, si no se configuran credenciales reales de Stripe o se utilizan claves de prueba/mock, el backend simula todas las respuestas de Stripe sin interrumpir el flujo del usuario ni de las pruebas unitarias.

---

## 6. Comandos Principales

### Backend (`/backend`)
```bash
# Activar entorno virtual
# Windows: .\venv\Scripts\activate
# Linux/macOS: source venv/bin/activate

# Aplicar migraciones
python manage.py migrate

# Poblar tarifas de lavandería (LaundryGo)
python manage.py seed_service_rates

# Poblar tarifas, add-ons y niveles de precios de limpieza (GPC & ESL)
python manage.py seed_cleaning_rates

# Crear superusuario no interactivo
python manage.py create_admin

# Probar envío SMTP de correos
python manage.py test_email [correo_destino]

# Servidor de desarrollo Django (puerto 8000)
python manage.py runserver 8000

# Ejecutar suite de pruebas completa con pytest (44 tests pasando)
pytest
```

### Frontend 1 — LaundryGo (`/frontend`)
```bash
npm run dev     # Puerto 5173
npm run build   # Compilar para producción
npm run lint    # Linter Oxlint
```

### Frontend 2 — GoPropertyCare (`/frontend-gopropertycare`)
```bash
npm run dev     # Puerto 5174
npm run build   # Compilar para producción
npm run lint    # Linter Oxlint
```

### Frontend 3 — Evolving Solutions LLC (`/frontend-evolvingsolutions`)
```bash
npm run dev     # Puerto 5175
npm run build   # Compilar para producción
npm run lint    # Linter Oxlint
```

---

## 7. Despliegue en Producción (Render)

El archivo `render.yaml` implementa la infraestructura completa en Render como código (IaC):

### Servicios en Render
1. **Base de Datos PostgreSQL (`laundrygo-db`)**: Base de datos gestionada compartida por las 3 plataformas (`plan: free`).
2. **Backend Web Service (`laundrygo-api`)**:
   - Gunicorn en Python 3.12.8 con WhiteNoise para servir archivos estáticos del panel Django Unfold.
   - Health check en `/api/v1/health/`.
   - `build.sh` ejecuta migraciones, collectstatic y seeds de ambas tarifas.
   - `ALLOWED_HOSTS`, `CORS_ALLOWED_ORIGINS` y `CSRF_TRUSTED_ORIGINS` configurados para `thelaundrygo.com`, `gopropertycare.com` y `evolvingsolutionsllc.com`.
3. **Frontend Static Site — LaundryGo (`laundrygo-web`)**:
   - Raíz: `frontend` (Puerto local `5173`).
4. **Frontend Static Site — GoPropertyCare (`gopropertycare-web`)**:
   - Raíz: `frontend-gopropertycare` (Puerto local `5174`).
5. **Frontend Static Site — Evolving Solutions LLC (`evolvingsolutions-web`)**:
   - Raíz: `frontend-evolvingsolutions` (Puerto local `5175`).
   - Build: `npm install && npm run build`
   - Static publish: `./dist`
   - Rewrite rule: `/* -> /index.html`
   - Variable de entorno: `VITE_API_URL=https://laundrygo-api.onrender.com`.

---

## 8. Canales de Contacto Oficiales

- **LaundryGo**: `info@thelaundrygo.com` | `(720) 590-8632` | Denver & Boulder, CO.
- **GoPropertyCare**: `info@gopropertycare.com` | `(720) 590-8632` | Denver & Boulder, CO.
- **Evolving Solutions LLC**: `info@evolvingsolutionsllc.com` | `(720) 590-8632` | Denver & Boulder, CO.
