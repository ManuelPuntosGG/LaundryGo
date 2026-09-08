# AGENTS.md — LaundryGo & GoPropertyCare

Guía completa de arquitectura, estructura, modelos de negocio y funcionamiento del monorepo **LaundryGo** y **GoPropertyCare** para agentes de IA y desarrolladores.

---

## 1. Visión General del Proyecto

Este repositorio aloja una arquitectura desacoplada y multi-tenant que sirve a **dos marcas comerciales independientes** operando en el área metropolitana de Denver y Boulder, Colorado, compartiendo un **único backend de Django REST Framework** y una **única base de datos PostgreSQL** en Render para maximizar la rentabilidad y mantener los costes de infraestructura adicionales en **\$0 USD/mes**:

1. **LaundryGo (`thelaundrygo.com`)**:
   - **Modelo de Negocio**: Lavado de ropa a domicilio cobrado por libra ($2.25, $2.45, $3.85/lb) con opciones de entrega en 2 días (*Standard*), día siguiente (*Go*) o mismo día express (*GoFurther* antes de las 12:00 PM). Permite pedidos puntuales o suscripciones recurrentes con 7.5% de descuento (*Daily*, *Weekly*, *Biweekly*, *Monthly*). Orden mínima de $40.00.
   - **Frontend**: Single Page Application en React 19 + Vite 8 + Tailwind CSS v4 (paleta en azules y grises slate). Puerto local `5173`.
2. **GoPropertyCare (`gopropertycare.com`)**:
   - **Modelo de Negocio**: Servicios profesionales de limpieza y ordenanza a domicilios (residencial y comercial) cobrados por pie cuadrado (**\$/sq ft**), con un umbral de orden mínima de **\$99.00** y recargos por dificultad/cuidados especiales de la propiedad. Agendamiento con antelación (**sin disponibilidad para el mismo día**; citas habilitadas a partir de mañana).
   - **Frontend**: Single Page Application en React 19 + Vite 8 + Tailwind CSS v4 (paleta en blanco y verdes bosque/esmeralda). Puerto local `5174`.

- **Internacionalización Integral**: Ambas plataformas son 100% bilingües (Inglés y Español) en sus interfaces y correos transaccionales automatizados (confirmaciones y cancelaciones).
- **Infraestructura de Producción**: Totalmente automatizada para **Render** mediante `render.yaml` (PostgreSQL gestionado + 1 Web Service Django Gunicorn/WhiteNoise + 2 Static Sites React gratuitos).

---

## 2. Estructura de Directorios

```text
LaundryGo/
├── AGENTS.md                  # Guía y especificación integral para agentes AI y desarrolladores
├── .env.example               # Plantilla de variables de entorno globales / backend
├── .python-version            # Versión de Python fijada para Render (3.12.8)
├── render.yaml                # Blueprint Infrastructure as Code para Render (DB + API + 2 Frontends)
├── backend/                   # Proyecto Backend Django 5+ REST API (Headless unificado)
│   ├── .env.example           # Plantilla de variables de entorno para backend
│   ├── .python-version        # Versión de Python local (3.12.8)
│   ├── build.sh               # Script de compilación, migración y seed data en Render
│   ├── apps/                  # Aplicaciones modulares activas de Django
│   │   ├── core/              # Modelos base abstractos (TimeStampedModel), HealthCheck y comandos CLI
│   │   │   └── management/commands/test_email.py # Diagnóstico SMTP y conectividad en vivo
│   │   ├── users/             # Autenticación JWT, modelo de usuario y autovinculación de pedidos
│   │   ├── orders/            # Tarifas por libra, órdenes de lavandería, suscripciones y emails (LaundryGo)
│   │   └── cleaning/          # Tarifas $/sqft, recargos de dificultad, órdenes y emails (GoPropertyCare)
│   │       ├── models.py      # CleaningServiceRate, CleaningAddon, CleaningOrder
│   │       ├── serializers.py # Cálculo en vivo de base ($99 min), addons y delivery fee
│   │       ├── views.py       # Endpoints públicos y protegidos de limpieza
│   │       ├── emails.py      # Notificaciones transaccionales bilingües (GoPropertyCare)
│   │       ├── admin.py       # Integración con Django Unfold y badges de estado
│   │       ├── urls.py        # Enrutador /api/v1/cleaning/...
│   │       ├── test_cleaning.py # Suite de pruebas pytest para GoPropertyCare
│   │       └── management/commands/seed_cleaning_rates.py # Pobla tarifas y add-ons iniciales
│   ├── config/                # Configuración global Django (settings, urls, wsgi)
│   ├── requirements/          # Dependencias (base.txt, development.txt)
│   ├── db.sqlite3             # Base de datos SQLite local para desarrollo
│   └── manage.py              # CLI de administración de Django
├── frontend/                  # Frontend 1: LaundryGo (React 19 + Vite 8 + Tailwind v4 - Puerto 5173)
│   ├── .env.example           # Plantilla frontend (VITE_API_URL)
│   ├── public/locales/        # Traducciones i18n (en/common.json, es/common.json)
│   ├── src/                   # Código fuente LaundryGo (Hero azul, calculadora por lbs, 4 pasos)
│   ├── package.json
│   └── vite.config.ts
├── frontend-gopropertycare/   # Frontend 2: GoPropertyCare (React 19 + Vite 8 + Tailwind v4 - Puerto 5174)
│   ├── public/
│   │   ├── logo.png           # Logotipo oficial (casa verde, escoba, cubeta con espuma y toallas)
│   │   └── locales/           # Traducciones i18n bilingües de GoPropertyCare
│   ├── src/                   # Código fuente GoPropertyCare (tokens verdes, calculadora sq ft, agendamiento)
│   ├── package.json
│   └── vite.config.ts
└── design-plans/              # Documentos de auditoría de diseño y planes de i18n
```

---

## 3. Backend (`/backend`)

### Tecnología
- **Lenguaje / Framework**: Python 3.12+ / Django 5+ / Django REST Framework (DRF).
- **Servidor WSGI de Producción**: `gunicorn` para entornos Linux/Render.
- **Servidor de Archivos Estáticos**: `whitenoise` (`CompressedManifestStaticFilesStorage`) para servir el panel Unfold sin requerir Nginx.
- **Base de Datos Dinámica**: `dj-database-url` con soporte nativo para `DATABASE_URL` (PostgreSQL de Render) y fallback local a SQLite.
- **Resolución de Red Robusta (IPv4 Forzado)**: En `backend/config/settings.py`, `socket.getaddrinfo` está interceptado globalmente para forzar `socket.AF_INET`. Esto previene el error `[Errno 101] Network is unreachable` en contenedores de Render/Linux cuando el DNS retorna registros IPv6 sin ruta de salida habilitada.
- **Panel de Administración**: `django-unfold` (Diseño moderno, minimalista, optimizado para Tailwind CSS y responsivo a móviles).
- **Autenticación**: JSON Web Tokens (JWT) mediante `djangorestframework-simplejwt`.
- **Variables de Entorno**: Gestionadas con `python-decouple` desde `backend/.env`.

### Modelo de Usuarios y Autenticación (`apps.users`)
- **Modelo Personalizado**: `apps.users.models.User` (hereda de `AbstractUser`).
- **Configuración Django**: `AUTH_USER_MODEL = 'users.User'`.
- **Identificador Principal**: El email es el `USERNAME_FIELD` (`email` único).
- **Campos principales**: `email`, `phone`, `first_name`, `last_name`, `street_address`, `city` (default `'Denver'`), `zip_code`.
- **Autovinculación de Huéspedes**: Al registrarse un nuevo usuario en `/api/v1/auth/register/`, el backend busca y vincula automáticamente órdenes previas realizadas como invitado tanto en LaundryGo (`Order`) como en GoPropertyCare (`CleaningOrder`).
- **Endpoints de Autenticación** (`/api/v1/auth/`):
  - `POST /register/`: Registro de usuario + retorno de tokens JWT y perfil.
  - `POST /login/`: Inicio de sesión mediante `email` y `password`.
  - `POST /token/refresh/`: Refresco de access token usando refresh token.
  - `POST /token/verify/`: Verificación de validez de token.
  - `POST /token/blacklist/`: Invalidación de token al cerrar sesión.
  - `GET|PUT|PATCH /me/`: Obtención y actualización del perfil del usuario autenticado.

---

### Módulo de Limpieza GoPropertyCare (`apps.cleaning`)
- **Modelos**:
  1. `CleaningServiceRate`: Tarifas dinámicas por pie cuadrado:
     - `regular`: Limpieza Regular a **$0.1000/sqft** (mantenimiento estándar residencial y comercial).
     - `deep`: Limpieza Profunda - GoFurther a **$0.1600/sqft** (suciedad pesada, zócalos, desincrustación).
     - `move_in_out`: Limpieza Move-In / Move-Out a **$0.2000/sqft** (preparación integral para mudanzas).
     - `post_construction`: Limpieza Post-Construcción a **$0.2600/sqft** (aspirado industrial HEPA, yeso, pintura).
     - Campo `min_order_amount`: Umbral mínimo de **$99.00**.
  2. `CleaningAddon`: Recargos por dificultad o áreas adicionales:
     - `pets_presence`: Presencia de Mascotas (+$35.00)
     - `high_ceilings`: Techos Altos / Ventanales (+$30.00)
     - `oven_fridge_interior`: Interior de Horno y Refrigerador (+$45.00)
     - `cabinets_interior`: Interior de Alacenas y Gabinetes (+$35.00)
     - `basement_attic`: Sótano Terminado / Ático (+$50.00)
     - `patio_balcony`: Balcón o Patio Exterior (+$25.00)
  3. `CleaningOrder`: Registro de servicio con `square_feet`, `service_rate`, `selected_addons` (JSON), `service_date`, `time_slot` (`morning` 8AM-12PM / `afternoon` 1PM-5PM), dirección en Denver/Boulder, zona (`inner` $0 / `outer` $25), `base_price` ($\max(\text{sqft} \times \text{rate}, \$99)$), `addons_total`, `delivery_fee`, `total_price`, `special_instructions`, `status` (`pending`, `confirmed`, `in_progress`, `completed`, `cancelled`) e idioma `language` (`'en'` o `'es'`).

- **Reglas de Agendamiento**:
  - **Sin mismo día**: `service_date` debe ser estrictamente mañana o posterior. El endpoint `/api/v1/cleaning/schedule/available-dates/` genera los próximos 60 días iniciando en `today + 1 day`. Si se intenta enviar una orden para hoy, el serializador arroja un error 400.

- **Emails Transaccionales Bilingües (`apps.cleaning.emails`)**:
  - `send_cleaning_order_confirmation_email(order, language=None)`: Notificación inmediata de reserva con la marca GoPropertyCare (`info@gopropertycare.com` y `(720) 590-8632`), desglose de Sq Ft, add-ons y total estimado.
  - `send_cleaning_order_cancellation_email(order, language=None)`: Notificación de cancelación de reserva.
  - Ejecución en hilos secundarios desacoplados pre-extrayendo los atributos de base de datos para evitar bloqueos en SQLite/PostgreSQL.

- **Endpoints de Limpieza** (`/api/v1/cleaning/`):
  - `GET /rates/`: Lista pública de tarifas activas por sq ft.
  - `GET /addons/`: Lista pública de recargos y extras.
  - `GET|POST /orders/`: Lista de órdenes del usuario autenticado / Creación de orden (pública para invitados o autenticados).
  - `GET|PUT|PATCH /orders/<id>/`: Detalle y actualización de reserva.
  - `POST /orders/<id>/cancel/`: Cancelación de orden pendiente.
  - `GET /schedule/available-dates/`: Calendario dinámico de fechas disponibles desde mañana.

- **Comandos de Gestión**:
  - `python manage.py seed_cleaning_rates`: Pobla las 4 tarifas ($0.10, $0.16, $0.20, $0.26, min $99) y los 6 add-ons de dificultad.

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
- **Comandos de Gestión**:
  - `python manage.py seed_service_rates`: Pobla tarifas por libra ($2.25, $2.45, $3.85).

---

## 4. Frontends

### Frontend 1: LaundryGo (`/frontend`)
- **Tecnología**: React 19, Vite 8, TypeScript, Tailwind CSS v4.
- **Puerto Local**: `5173`.
- **Estética**: Azules vivos (`--color-brand-600: #2563eb`) y grises Slate con Glassmorphism.
- **Páginas**:
  - `Home.tsx`: Hero, calculadora de libras, 4 pasos de servicio, tarifas comparativas, cobertura Denver/Boulder.
  - `About.tsx`: Proceso de 5 pasos (agendamiento, pesaje, lavado ecológico, secado/doblado, entrega).
  - `Schedule.tsx`: Flujo de agendamiento en 4 pasos con add-ons de lavandería (scent beads, stain treatment, comforters, etc.).
  - `Auth.tsx`: Inicio de sesión y registro.
  - `Dashboard.tsx`: Historial de órdenes, suscripciones y perfil.

### Frontend 2: GoPropertyCare (`/frontend-gopropertycare`)
- **Tecnología**: React 19, Vite 8, TypeScript, Tailwind CSS v4.
- **Puerto Local**: `5174` (evita colisiones con LaundryGo).
- **Logotipo**: Casa verde con escoba, cubeta con espuma y toallas plegadas (`public/logo.png`).
- **Estética**: Blanco y verdes bosque/esmeralda (`--color-brand-*` desde `#f0fdf4` hasta `#052e16`).
- **Páginas**:
  - `Home.tsx`: Hero con selector de Denver, **Calculadora interactiva por Sq Ft** (slider 300 a 5,000 sq ft con aviso de mínimo de $99), 4 pasos de servicio, comparativa de las 4 tarifas, cobertura y contacto.
  - `About.tsx`: Misión, pilares de productos ecológicos no tóxicos, personal verificado y checklist de 50 puntos de inspección (cocina, baños, salas, pisos).
  - `Schedule.tsx`: Flujo de reserva en 4 pasos:
    - *Paso 1*: Selección de Sq Ft y nivel de servicio con desglose de precio base en vivo.
    - *Paso 2*: Calendario de fechas (bloquea estrictamente el día de hoy) y franja horaria (Mañana 8AM-12PM / Tarde 1PM-5PM).
    - *Paso 3*: Ubicación en Denver/Boulder (Inner $0 / Outer $25) y recargos de dificultad (mascotas, techos altos, electrodomésticos, etc.).
    - *Paso 4*: Resumen final de cotización, aceptación de términos de orden mínima de $99 y confirmación con ID de orden (ej. `GPC-#12`).
  - `Auth.tsx`: Inicio de sesión y registro (comparte base de usuarios con LaundryGo).
  - `Dashboard.tsx`: Historial de reservas de limpieza, botón de volver a pedir (*Reorder*) y cancelación online de reservas pendientes.

---

## 5. Reglas de Negocio Clave

1. **Zonas de Cobertura en Denver y Boulder (Compartidas por Ambas Marcas)**:
   - **Zona Inner (Gratis - $0.00)**: Denver (Downtown / Central), Lakewood, Englewood, Wheat Ridge, Arvada, Westminster, Boulder, Broomfield.
   - **Zona Outer (Recargo - $25.00)**: Aurora, Thornton, Centennial, Highlands Ranch.
2. **Reglas Específicas de GoPropertyCare (Limpieza)**:
   - **Sin Mismo Día**: Todas las citas deben agendarse al menos para el día siguiente (+1 día en adelante).
   - **Orden Mínima de Limpieza**: **$99.00**. Si $\text{sqft} \times \text{tarifa} < \$99.00$, se cobra el piso de $99.00.
   - **Medición de Precios**: Exclusivamente en **\$/square feet** (\$/sq ft) más recargos por dificultad.
3. **Reglas Específicas de LaundryGo (Lavandería)**:
   - **Cutoff de Mismo Día (GoFurther)**: Solo disponible para hoy si la hora local es anterior a las 12:00 PM.
   - **Orden Mínima de Lavado**: **$40.00**.
   - **Descuento Recurrente (7.5%)**: Aplica a partir del segundo cobro en suscripciones.
4. **Checkout Flexible (Usuario vs Guest)**:
   - Los pedidos pueden realizarse autenticado o como invitado (`guest_*`). Al registrarse posteriormente con el mismo correo, el sistema auto-vincula el historial de ambos servicios.
5. **Notificaciones Bilingües**:
   - Cada orden almacena `language: 'en' | 'es'`. Los correos se emiten en el idioma seleccionado por el cliente con el branding y contacto correspondiente a cada marca.

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

# Poblar tarifas y add-ons de limpieza (GoPropertyCare)
python manage.py seed_cleaning_rates

# Crear superusuario no interactivo
python manage.py create_admin

# Probar envío SMTP de correos
python manage.py test_email [correo_destino]

# Servidor de desarrollo Django (puerto 8000)
python manage.py runserver 8000

# Ejecutar suite de pruebas completa con pytest (28 tests pasando)
pytest
```

### Frontend 1 — LaundryGo (`/frontend`)
```bash
# Iniciar servidor Vite (puerto 5173)
npm run dev

# Compilar para producción
npm run build

# Linter Oxlint
npm run lint
```

### Frontend 2 — GoPropertyCare (`/frontend-gopropertycare`)
```bash
# Iniciar servidor Vite (puerto 5174)
npm run dev

# Compilar para producción
npm run build

# Linter Oxlint
npm run lint
```

---

## 7. Despliegue en Producción (Render)

El archivo `render.yaml` implementa la infraestructura completa en Render como código (IaC):

### Servicios en Render
1. **Base de Datos PostgreSQL (`laundrygo-db`)**: Base de datos gestionada compartida por ambas plataformas (`plan: free`).
2. **Backend Web Service (`laundrygo-api`)**:
   - Gunicorn en Python 3.12.8 con WhiteNoise para servir archivos estáticos del panel Django Unfold.
   - Health check en `/api/v1/health/`.
   - `build.sh` ejecuta:
     ```bash
     #!/usr/bin/env bash
     set -o errexit
     pip install --upgrade pip
     pip install -r requirements/base.txt
     python manage.py collectstatic --no-input
     python manage.py migrate
     python manage.py seed_service_rates
     python manage.py seed_cleaning_rates
     python manage.py create_admin
     ```
   - `ALLOWED_HOSTS`, `CORS_ALLOWED_ORIGINS` y `CSRF_TRUSTED_ORIGINS` configurados para `thelaundrygo.com` y `gopropertycare.com`.
   - Credenciales SMTP de Gmail configuradas para notificaciones bilingües.
3. **Frontend Static Site — LaundryGo (`laundrygo-web`)**:
   - Dominio oficial: `https://thelaundrygo.com` y `https://www.thelaundrygo.com`.
   - Directorio raíz: `frontend`
   - Build: `npm install && npm run build`
   - Directorio de publicación: `./dist`
   - Regla de reescritura SPA: `/* -> /index.html`.
   - Variable de entorno: `VITE_API_URL=https://laundrygo-api.onrender.com`.
4. **Frontend Static Site — GoPropertyCare (`gopropertycare-web`)**:
   - Dominio oficial: `https://gopropertycare.com` y `https://www.gopropertycare.com` (o subdominio asignado por Render).
   - Directorio raíz: `frontend-gopropertycare`
   - Build: `npm install && npm run build`
   - Directorio de publicación: `./dist`
   - Regla de reescritura SPA: `/* -> /index.html`.
   - Variable de entorno: `VITE_API_URL=https://laundrygo-api.onrender.com`.

---

## 8. Gotchas y Notas para Agentes

- **Costes de Render (\$0 extra)**: Los Static Sites en Render son completamente gratuitos. Al agregar nuevas marcas o landings para el cliente, basta con crear una carpeta frontend adicional (`frontend-*`), un módulo en `apps/` en el backend existente, y un servicio `type: web, runtime: static` en `render.yaml`.
- **Puertos de Desarrollo**: LaundryGo corre en `http://localhost:5173` y GoPropertyCare en `http://localhost:5174`. Ambos proxian sus solicitudes `/api` al backend Django en `http://localhost:8000` en entornos locales.
- **Resolución de Red IPv4 en Render**: En `config/settings.py`, `socket.getaddrinfo` fuerza `AF_INET` para garantizar que los contenedores Linux de Render no intenten rutas IPv6 inalcanzables al conectar con `smtp.gmail.com:587`.
- **Hilos de Email y Concurrencia ORM**: Al despachar correos asíncronos en segundo plano (`threading.Thread`), **siempre** extraer todos los campos del modelo (`order.id`, `recipient_email`, `total_price`, etc.) en variables locales *antes* de iniciar el hilo daemon. Acceder a relaciones ORM lazy dentro del hilo puede ocasionar bloqueos de base de datos (`database table is locked`).
- **Control de Calidad y Pruebas**:
  - Backend: 28 pruebas unitarias pasando con `pytest` (`apps/orders`, `apps/cleaning`, `apps/users`, `apps/core`).
  - Frontends: Compilación estricta con TypeScript (`tsc -b && vite build`) y análisis de linter con `oxlint`.
- **Tailwind CSS v4 en Frontend**: Ambos frontends usan `@tailwindcss/vite` e importación directa en `src/index.css`. No crear `tailwind.config.js`.
- **Modelo de Usuario Personalizado**: Siempre importar el modelo de usuario utilizando `django.contrib.auth.get_user_model()` o referenciar `settings.AUTH_USER_MODEL`. Nunca importar `django.contrib.auth.models.User` directamente.
- **Canales de Contacto Oficiales**:
  - **LaundryGo**: `info@thelaundrygo.com` | `(720) 590-8632` | Denver & Boulder, CO.
  - **GoPropertyCare**: `info@gopropertycare.com` | `(720) 590-8632` | Denver & Boulder, CO.
