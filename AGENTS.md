# AGENTS.md — LaundryGo, GoPropertyCare & Evolving Solutions LLC

Guía completa de arquitectura, estructura, modelos de negocio y funcionamiento del monorepo multi-marca para agentes de IA y desarrolladores.

---

## 1. Visión General del Proyecto

Este repositorio aloja una arquitectura desacoplada y multi-tenant que sirve a **tres marcas comerciales independientes** operando en el área metropolitana de Denver y Boulder, Colorado, compartiendo un **único backend de Django REST Framework** y una **única base de datos PostgreSQL** en Render para maximizar la rentabilidad y mantener los costes de infraestructura adicionales en **\$0 USD/mes**:

1. **LaundryGo (`thelaundrygo.com`)**:
   - **Modelo de Negocio**: Lavado de ropa a domicilio cobrado por libra ($2.25, $2.45, $3.85/lb) con opciones de entrega en 2 días (*Standard*), día siguiente (*Go*) o mismo día express (*GoFurther* antes de las 12:00 PM). Permite pedidos puntuales o suscripciones recurrentes con 7.5% de descuento (*Daily*, *Weekly*, *Biweekly*, *Monthly*). Orden mínima de $40.00.
   - **Frontend**: Single Page Application en React 19 + Vite 8 + Tailwind CSS v4 (paleta en azules y grises slate). Puerto local `5173`.
2. **GoPropertyCare (`gopropertycare.com`)**:
   - **Modelo de Negocio**: Servicios profesionales de limpieza y ordenanza exclusivamente para domicilios residenciales particulares (Regular, Profunda, Move-In/Move-Out) cobrados por pie cuadrado (**\$/sq ft**), con un umbral de orden mínima de **\$99.00** y recargos por dificultad/cuidados especiales del hogar. **No realiza servicios de post-construcción ni comerciales**. Agendamiento con antelación (**sin disponibilidad para el mismo día**; citas habilitadas a partir de mañana). Incluye sección destacada de derivación cruzada a Evolving Solutions LLC para servicios de post-construcción, limpieza comercial y demolición selectiva.
   - **Frontend**: Single Page Application en React 19 + Vite 8 + Tailwind CSS v4 (paleta en blanco y verdes bosque/esmeralda). Puerto local `5174`.
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
│   │   ├── core/                   # Modelos base abstractos (TimeStampedModel), HealthCheck, despachador central de emails
│   │   │   ├── emails.py           # Despachador resiliente unificado (SMTP + fallbacks HTTPS Resend/SendGrid)
│   │   │   └── management/commands/test_email.py # Diagnóstico SMTP y conectividad en vivo
│   │   ├── users/                  # Autenticación JWT, modelo de usuario y autovinculación de pedidos
│   │   ├── orders/                 # Tarifas por libra, órdenes de lavandería, suscripciones y emails (LaundryGo)
│   │   └── cleaning/               # Tarifas $/sqft, recargos de dificultad, órdenes y emails (GPC & ESL)
│   │       ├── models.py           # CleaningServiceRate, CleaningAddon, CleaningOrder (con campo brand y prefijos GPC-#/ESL-#)
│   │       ├── serializers.py      # Cálculo en vivo de base ($99 min), addons y delivery fee
│   │       ├── views.py            # Endpoints públicos y protegidos de limpieza
│   │       ├── emails.py           # Notificaciones transaccionales bilingües adaptativas por marca (GPC / ESL)
│   │       ├── admin.py            # Integración con Django Unfold, filtros por marca y badges
│   │       ├── urls.py             # Enrutador /api/v1/cleaning/...
│   │       ├── test_cleaning.py    # Suite de pruebas pytest para GoPropertyCare y Evolving Solutions
│   │       └── management/commands/seed_cleaning_rates.py # Pobla tarifas residenciales y comerciales ($0.10 a $0.35)
│   ├── config/                     # Configuración global Django (settings, urls, wsgi)
│   ├── requirements/               # Dependencias (base.txt, development.txt)
│   ├── db.sqlite3                  # Base de datos SQLite local para desarrollo
│   └── manage.py                   # CLI de administración de Django
├── frontend/                       # Frontend 1: LaundryGo (React 19 + Vite 8 + Tailwind v4 - Puerto 5173)
│   ├── .env.example                # Plantilla frontend (VITE_API_URL)
│   ├── public/locales/             # Traducciones i18n (en/common.json, es/common.json)
│   ├── src/                        # Código fuente LaundryGo (Hero azul, calculadora por lbs, 4 pasos)
│   ├── package.json
│   └── vite.config.ts
├── frontend-gopropertycare/        # Frontend 2: GoPropertyCare (React 19 + Vite 8 + Tailwind v4 - Puerto 5174)
│   ├── public/
│   │   ├── logo.png                # Logotipo oficial (casa verde, escoba, cubeta con espuma y toallas)
│   │   └── locales/                # Traducciones i18n bilingües de GoPropertyCare
│   ├── src/                        # Código fuente GoPropertyCare (tokens verdes, calculadora sq ft residencial, agendamiento)
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

### Módulo de Limpieza y Mano de Obra (`apps.cleaning`)
- **Modelos**:
  1. `CleaningServiceRate`: Tarifas dinámicas por pie cuadrado (estandarizadas a 2 decimales) con asignación estricta de marca (`brand`):
     - **GoPropertyCare (`brand='gopropertycare'`) — 100% Residencial**:
       - `regular`: Limpieza Regular a **$0.10/sqft** (mantenimiento estándar del hogar).
       - `deep`: Limpieza Profunda - GoFurther a **$0.16/sqft** (desincrustación profunda, zócalos, suciedad pesada).
       - `move_in_out`: Limpieza Move-In / Move-Out a **$0.20/sqft** (entrega o recibimiento de viviendas y apartamentos).
       *(Nota: GoPropertyCare NO ofrece servicio de post-construcción ni comercial).*
     - **Evolving Solutions LLC (`brand='evolvingsolutions'`) — Comercial & Post-Construcción**:
       - `commercial`: Limpieza Comercial / Janitorial a **$0.18/sqft** (oficinas, locales, bodegas y corporativos).
       - `post_construction`: Limpieza Post-Construcción a **$0.26/sqft** (aspirado industrial HEPA, yeso, pintura, entrega de obra).
       - `industrial_demolition`: Demolición de Drywall y Mano de Obra Industrial a **$0.35/sqft** (demolición selectiva, ensacado y retiro de escombros).
     - Campo `min_order_amount`: Umbral mínimo de **$99.00**.
  2. `CleaningAddon`: Recargos por dificultad o áreas adicionales segregados por marca:
     - Residenciales (`gopropertycare`): Presencia de mascotas ($35), techos altos/ventanales ($30), interior de horno/refrigerador ($45), alacenas/gabinetes ($35), sótano/ático ($50), balcón/patio ($25).
     - Comerciales (`evolvingsolutions`): Techos altos/vigas industriales ($45), retiro y carga de escombros pesados ($95), lavado mecanizado de pisos ($65), vitrinas/cristales ($55), desinfección de baterías de baño ($45), turno nocturno/fin de semana ($50).
  3. `CleaningOrder`: Registro de servicio con:
     - `brand`: `'gopropertycare'` o `'evolvingsolutions'`.
     - Prefijo de visualización dinámico: `GPC-#{id}` para GoPropertyCare y `ESL-#{id}` para Evolving Solutions LLC.
     - `square_feet`, `service_rate`, `selected_addons` (JSON), `service_date`, `time_slot` (`morning` 8AM-12PM / `afternoon` 1PM-5PM), dirección en Denver/Boulder, zona (`inner` $0 / `outer` $25), `base_price` ($\max(\text{sqft} \times \text{rate}, \$99)$), `addons_total`, `delivery_fee`, `total_price`, `special_instructions`, `status` e idioma `language` (`'en'` o `'es'`).

- **Reglas de Agendamiento y Validación Cruzada de Marcas**:
  - **Sin mismo día**: `service_date` debe ser estrictamente mañana o posterior (+1 día en adelante).
  - **Segregación Estricta de Órdenes en Backend**:
    - Si se intenta reservar un servicio de post-construcción o comercial con `brand='gopropertycare'`, el serializador lanza error 400 y deriva a Evolving Solutions LLC.
    - Si se intenta reservar un servicio residencial con `brand='evolvingsolutions'`, el serializador lanza error 400 y deriva a GoPropertyCare.

- **Emails Transaccionales Bilingües (`apps.cleaning.emails`)**:
  - Detectan automáticamente el campo `order.brand`.
  - Si `brand == 'evolvingsolutions'`: Emite notificaciones con membrete corporativo marrón (`#573725`), remitente `Evolving Solutions LLC <info@evolvingsolutionsllc.com>`, referencia `ESL-#{id}`, y mensaje de solicitud de COI / políticas de seguridad en obra.
  - Si `brand == 'gopropertycare'`: Emite notificaciones con membrete verde (`#16a34a`), remitente `GoPropertyCare <info@gopropertycare.com>`, referencia `GPC-#{id}`.

- **Endpoints de Limpieza** (`/api/v1/cleaning/`):
  - `GET /rates/?brand=<brand>`: Lista de tarifas filtrada por marca comercial.
  - `GET /addons/?brand=<brand>`: Lista de add-ons filtrada por marca comercial.
  - `GET|POST /orders/?brand=<brand>`: Lista de órdenes del usuario autenticado filtradas por marca / Creación de orden validada contra la marca.
  - `GET|PUT|PATCH /orders/<id>/`: Detalle y actualización de reserva.
  - `POST /orders/<id>/cancel/`: Cancelación de orden pendiente.
  - `GET /schedule/available-dates/`: Calendario dinámico de fechas disponibles desde mañana.

---

### Módulo de Lavandería LaundryGo (`apps.orders`)
- **Modelos**:
  1. `ServiceRate`: Tarifas por libra (`standard` - 2 días a $2.25/lb, `go` - siguiente día a $2.45/lb, `gofurther` - mismo día a $3.85/lb).
  2. `Order`: Pedidos de lavado por libra con entrega puerta a puerta.
  3. `RecurringSchedule`: Suscripciones recurrentes (*Daily*, *Weekly*, *Biweekly*, *Monthly*) con 7.5% de descuento.
- **Emails Transaccionales Bilingües (`apps.orders.emails`)**:
  - Despacho asíncrono con la marca LaundryGo (`info@thelaundrygo.com`).
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

### Frontend 2: GoPropertyCare (`/frontend-gopropertycare`)
- **Tecnología**: React 19, Vite 8, TypeScript, Tailwind CSS v4.
- **Puerto Local**: `5174`.
- **Logotipo**: Casa verde con escoba, cubeta con espuma y toallas plegadas (`public/logo.png`).
- **Estética**: Blanco y verdes bosque/esmeralda (`--color-brand-*` desde `#f0fdf4` hasta `#052e16`).
- **Enfoque**: Residencial (Regular, Profunda, Move-In/Move-Out, Post-Construcción) con banner de referencia hacia Evolving Solutions LLC para entes comerciales y demolición.

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
2. **Reglas Específicas de GoPropertyCare y Evolving Solutions LLC**:
   - **Sin Mismo Día**: Todas las citas deben agendarse al menos para el día siguiente (+1 día en adelante).
   - **Orden Mínima de Visita**: **$99.00**. Si $\text{sqft} \times \text{tarifa} < \$99.00$, se cobra el piso de $99.00.
   - **Medición de Precios**: Exclusivamente en **\$/square feet** (\$/sq ft) más recargos por dificultad o servicios especiales.
3. **Reglas Específicas de LaundryGo (Lavandería)**:
   - **Cutoff de Mismo Día (GoFurther)**: Solo disponible para hoy si la hora local es anterior a las 12:00 PM.
   - **Orden Mínima de Lavado**: **$40.00**.
   - **Descuento Recurrente (7.5%)**: Aplica a partir del segundo cobro en suscripciones.
4. **Checkout Flexible (Usuario vs Guest)**:
   - Los pedidos pueden realizarse autenticado o como invitado (`guest_*`). Al registrarse posteriormente con el mismo correo, el sistema auto-vincula el historial de las tres marcas.
5. **Notificaciones Bilingües**:
   - Cada orden almacena `language: 'en' | 'es'`. Los correos se emiten en el idioma seleccionado por el cliente con el branding y contacto correspondiente a cada una de las 3 marcas.

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

# Poblar tarifas y add-ons de limpieza (GPC & ESL)
python manage.py seed_cleaning_rates

# Crear superusuario no interactivo
python manage.py create_admin

# Probar envío SMTP de correos
python manage.py test_email [correo_destino]

# Servidor de desarrollo Django (puerto 8000)
python manage.py runserver 8000

# Ejecutar suite de pruebas completa con pytest (34 tests pasando)
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
