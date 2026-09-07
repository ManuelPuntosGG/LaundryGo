# AGENTS.md — LaundryGo

Guía completa de arquitectura, estructura y funcionamiento del proyecto **LaundryGo** para agentes de IA y desarrolladores.

---

## 1. Visión General del Proyecto

**LaundryGo** es una plataforma web para una empresa de servicios de lavandería a domicilio con recolección y entrega rápida en Denver, Colorado y sus zonas metropolitanas adyacentes (incluyendo Boulder, Lakewood, Aurora, etc.).

- **Modelo de Negocio**: Lavado de ropa cobrado por libra con opciones de entrega en 2 días (*Standard*), día siguiente (*Go*) o mismo día express (*GoFurther* antes de las 12:00 PM). Permite pedidos puntuales (*One-time*) o suscripciones recurrentes con 7.5% de descuento (*Daily*, *Weekly*, *Biweekly*, *Monthly*). Soporta compras de usuarios autenticados e invitados (*guest checkout*).
- **Internacionalización Integral**: Plataforma totalmente bilingüe (Inglés y Español) tanto en la interfaz de usuario como en los correos transaccionales automatizados (confirmación y cancelación de órdenes).
- **Arquitectura**: Desacoplada (Frontend Single Page Application en React 19 + Backend REST API en Django 5+).
- **Infraestructura de Producción**: Totalmente automatizada para **Render** (PostgreSQL gestionado + Web Service Django con Gunicorn/WhiteNoise + Static Site React) sirviendo en el dominio oficial `thelaundrygo.com`.

---

## 2. Estructura de Directorios

```text
LaundryGo/
├── AGENTS.md                  # Especificación e instrucciones del proyecto para agentes AI
├── .env.example               # Plantilla de variables de entorno globales / backend
├── .python-version            # Versión de Python especificada para Render (3.12.8)
├── render.yaml                # Blueprint Infrastructure as Code para Render
├── backend/                   # Proyecto Backend Django 5+ REST API
│   ├── .env.example           # Plantilla de variables de entorno para backend
│   ├── .python-version        # Versión de Python local para backend (3.12.8)
│   ├── build.sh               # Script de construcción y migración para Render
│   ├── apps/                  # Aplicaciones modulares activas de Django
│   │   ├── core/              # Modelos base abstractos (TimeStampedModel), HealthCheck y comandos CLI
│   │   │   └── management/commands/test_email.py # Utilidad de diagnóstico SMTP y conectividad
│   │   ├── users/             # Autenticación JWT, modelo de usuario personalizado y perfiles
│   │   └── orders/            # Tarifas de servicio, órdenes, suscripciones, migraciones y emails bilingües
│   │       ├── emails.py      # Notificaciones asíncronas bilingües (EN/ES) en HTML y texto plano
│   │       └── migrations/    # Historial de esquemas (incluyendo 0005_order_language)
│   ├── config/                # Configuración global del proyecto Django (settings, urls, wsgi)
│   ├── requirements/          # Dependencias (base.txt, development.txt)
│   ├── db.sqlite3             # Base de datos SQLite local para desarrollo
│   └── manage.py              # Script CLI de administración de Django
├── frontend/                  # Proyecto Frontend React 19 + Vite 8
│   ├── .env.example           # Plantilla de variables de entorno frontend (VITE_API_URL)
│   ├── public/
│   │   └── locales/           # Archivos de traducción i18n (en/common.json, es/common.json)
│   ├── src/
│   │   ├── api/               # Cliente Axios dinámico con interceptores JWT, auto-refresh y Accept-Language
│   │   ├── components/        # Componentes UI reusables y estructura de Layout
│   │   │   ├── layout/        # Navbar, Footer, Layout principal
│   │   │   └── ui/            # Button, Card, Input, LanguageSwitcher, PageSkeleton
│   │   ├── constants/         # Ubicaciones de Denver (locations.ts) y Add-ons (addons.ts)
│   │   ├── hooks/             # Custom hooks (useAuth)
│   │   ├── i18n/              # Configuración de i18next
│   │   ├── pages/             # Páginas (Home, About, Schedule, Auth, Dashboard)
│   │   ├── providers/         # Contexto de autenticación (AuthProvider, auth-context.ts)
│   │   ├── types/             # Interfaces TypeScript (User, Order, ServiceRate, etc.)
│   │   ├── App.tsx            # Enrutamiento React Router v7 y ProtectedRoute
│   │   ├── index.css          # Configuración y tokens de Tailwind CSS v4
│   │   └── main.tsx           # Punto de entrada de React
│   ├── package.json           # Dependencias de Node.js y scripts
│   ├── vite.config.ts         # Configuración de Vite, alias @ y proxy API
│   └── .oxlintrc.json         # Configuración del linter Oxlint
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
- **Endpoints de Autenticación** (`/api/v1/auth/`):
  - `POST /register/`: Registro de usuario + retorno de tokens JWT y perfil. Vincula automáticamente pedidos pasados realizados como invitado con el mismo correo.
  - `POST /login/`: Inicio de sesión mediante `email` y `password`.
  - `POST /token/refresh/`: Refresco de access token usando refresh token.
  - `POST /token/verify/`: Verificación de validez de token.
  - `POST /token/blacklist/`: Invalidación de token al cerrar sesión.
  - `GET|PUT|PATCH /me/`: Obtención y actualización del perfil del usuario autenticado.
- **Comando Custom de Gestión**:
  - `python manage.py create_admin`: Crea o actualiza un superusuario no-interactivamente usando variables del `.env`.

### Gestión de Órdenes y Tarifas (`apps.orders`)
- **Modelos**:
  1. `ServiceRate`: Tarifas de servicio por libra (`standard` - 2 días a $2.25/lb, `go` - siguiente día a $2.45/lb, `gofurther` - mismo día a $3.85/lb).
  2. `Order`: Registro de pedidos. Soporta usuarios autenticados (`user`) e invitados (`guest_email`, `guest_first_name`, `guest_last_name`, `guest_phone`). Incluye dirección, zona de entrega (`inner` tarifa $0 / `outer` tarifa $25), `pickup_date`, `pickup_time_slot` (`morning` 8-11 AM / `afternoon` 12-4 PM), `order_details`, `pickup_instructions`, `status` (`pending`, `confirmed`, `processing`, `ready`, `delivered`, `cancelled`) y **`language`** (`'en'` o `'es'`, default `'en'`).
  3. `RecurringSchedule`: Suscripciones asociadas a órdenes (`daily`, `weekly`, `biweekly`, `monthly`) con fecha calculada del siguiente pedido (+1 día, +7 días, +14 días, +30 días).

- **Sistema de Emails Bilingües y Transaccionales (`apps.orders.emails`)**:
  - **Despacho Primario**: SMTP nativo de Gmail (`smtp.gmail.com:587`, TLS) mediante `django.core.mail.EmailMultiAlternatives`.
  - **Fallback de APIs**: Soporte secundario transparente para APIs HTTPS (Resend / SendGrid) en caso de contingencia.
  - **Ejecución Asíncrona**: Hilos secundarios daemon (`threading.Thread(daemon=True)`) con logging exhaustivo (`[EMAIL SUCCESS - SMTP]` / `[EMAIL FAILURE]`) para respuesta de API inmediata (< 50ms).
  - **Soporte Bilingüe Completo**:
    - `send_order_confirmation_email(order, language=None)`: Renderiza asunto, cuerpo en texto plano y plantilla HTML adaptable en inglés o español según `order.language`.
    - `send_order_cancellation_email(order, language=None)`: Notificación de cancelación en el idioma del cliente con enlace para reprogramación.
    - Notifica simultáneamente al cliente y al `ADMIN_EMAIL` (`info@thelaundrygo.com`) en el idioma seleccionado por el cliente.

- **Endpoints de Órdenes y Servicios** (`/api/v1/`):
  - `GET /health/`: Health check para monitoreo y Render (`HealthCheckView`).
  - `GET /services/rates/`: Lista pública de tarifas activas.
  - `GET|POST /orders/`: Lista de órdenes del usuario autenticado / Creación de orden (pública para invitados o autenticados, guarda `language` del payload o cabecera `Accept-Language`).
  - `GET|PUT|PATCH /orders/<id>/`: Detalle y actualización de orden.
  - `POST /orders/<id>/cancel/`: Cancelación de órdenes pendientes con notificación bilingüe por correo.
  - `GET /recurring/`: Suscripciones recurrentes del usuario.
  - `GET|PUT|PATCH|DELETE /recurring/<id>/`: Gestión de suscripción recurrente.
  - `GET /schedule/available-dates/`: Calendario dinámico de los próximos 30 días calculando disponibilidad del servicio express según la hora actual.

- **Comandos Custom de Gestión**:
  - `python manage.py seed_service_rates`: Pobla la base de datos con las tres tarifas de servicio por defecto ($2.25, $2.45, $3.85).
  - `python manage.py test_email [correo]`: Diagnóstico integral de socket TCP, autenticación SMTP de Gmail y envío de prueba en vivo.

---

## 4. Frontend (`/frontend`)

### Tecnología
- **Stack**: React 19, Vite 8, TypeScript, Tailwind CSS v4.
- **Linter**: `oxlint` (ejecutado con `npm run lint`).
- **Estilos y Diseño**: Tailwind v4 (importado mediante `@import "tailwindcss"` en `src/index.css` y usando `@tailwindcss/vite`). Diseño con estética *Glassmorphism* fluida, tarjetas interactivas y paleta cromática profesional basada en azules y grises Slate.
- **Internacionalización (i18n)**: Configurada con `react-i18next` e `i18next-browser-languagedetector`. Traducciones completas en español e inglés ubicadas en `public/locales/{es,en}/common.json`.

### Arquitectura y Estado
- **Enrutamiento y Proxy**:
  - `vite.config.ts`: Configura el alias `@` a `./src` y redirige solicitudes `/api` al backend Django (`http://localhost:8000`).
  - `App.tsx`: Rutas públicas (`/`, `/about`, `/schedule`, `/login`) y ruta protegida (`/dashboard` envuelta en `ProtectedRoute`).
- **Cliente API Dinámico (`src/api/index.ts`)**:
  - Consume dinámicamente `import.meta.env.VITE_API_URL` en producción y usa el proxy local en desarrollo.
  - Inyecta el encabezado `Authorization: Bearer <access_token>` almacenado en `localStorage`.
  - Inyecta automáticamente el encabezado `Accept-Language: es` o `en` según el idioma seleccionado por el usuario.
  - Captura errores HTTP 401 para intentar renovar el token transparentemente vía `/auth/token/refresh/`. Si falla la renovación, limpia la sesión y redirige a `/login`.
- **Estado de Autenticación (`src/providers/AuthProvider.tsx` & `src/providers/auth-context.ts`)**:
  - Proporciona el estado del usuario actual, comprobación de token al cargar la aplicación y métodos de `login`, `register` y `logout`.

### Páginas Principales (`src/pages/`)
1. **`Home.tsx` (`/`)**: Landing page informativa con sección Hero, resumen ágil del proceso de 4 pasos con enlace a Sobre Nosotros, tarjetas de precios comparativas ($2.25, $2.45, $3.85), calculadora de costos, mapa de cobertura en Denver y Boulder, avisos de orden mínima de $40 y 7.5% de descuento recurrente, y tarjetas de contacto oficial (`info@thelaundrygo.com`, `(720) 590-8632`).
2. **`About.tsx` (`/about`)**: Página "Sobre Nosotros" con explicación visual exhaustiva del proceso de negocio en 5 pasos (Agendamiento, Pesaje comercial por libra y clasificación, Lavado ecológico y add-ons, Secado y doblado boutique, Entrega en puerta), misión en Denver, reglas clave de negocio, estándares de calidad y galería con imágenes optimizadas.
3. **`Schedule.tsx` (`/schedule`)**: Flujo interactivo de reserva de lavandería organizado en 4 pasos con inicialización de fechas resiliente:
   - *Paso 1*: Selección de servicio, fecha (inicializada de inmediato con los próximos 60 días locales mediante `getFallbackAvailableDates` y sincronizada con `/schedule/available-dates/`), franja horaria y frecuencia (*Daily*, *Weekly*, *Biweekly*, *Monthly*) con aviso de descuento del 7.5%.
   - *Paso 2*: Selección de ciudad/zona en Denver (Inner gratis vs Outer $25), dirección y datos de contacto (auto-completados si está autenticado).
   - *Paso 3*: Selección de servicio y **Sistema de Add-ons** (Downy Scent Beads $3.50, Stain Treatment $3.50, Comforter Twin-Full $24.99, Comforter Queen-King $29.99, Pillow $6.99, Mattress cover Twin-Full $11.99, Mattress cover Queen-King $14.99) con cálculo de subtotal en vivo y solicitudes especiales.
   - *Paso 4*: Resumen final de la orden, desglose de tarifas y add-ons, aceptación de términos y confirmación con ID de orden generada. Envía automáticamente `language: i18n.language` para el despacho de correos en el idioma correspondiente.
4. **`Auth.tsx` (`/login`)**: Formulario unificado de inicio de sesión y registro con validaciones dinámicas y gestión de errores.
5. **`Dashboard.tsx` (`/dashboard`)**: Panel del usuario autenticado dividido en pestañas:
   - *Historial de Órdenes*: Muestra las órdenes activas y pasadas con estado en vivo, botón para cancelar órdenes pendientes y botón para "Volver a pedir" (*Reorder*).
   - *Suscripciones Recurrentes*: Administración de planes recurrentes activos.
   - *Perfil de Usuario*: Edición de nombre, teléfono y dirección predeterminada.

---

## 5. Reglas de Negocio Clave

1. **Cálculo de Zonas de Cobertura en Denver y Boulder**:
   - **Zona Inner (Gratis - $0.00)**: Denver (Downtown / Central), Lakewood, Englewood, Wheat Ridge, Arvada, Westminster, Boulder, Broomfield.
   - **Zona Outer (Recargo - $25.00)**: Aurora, Thornton, Centennial, Highlands Ranch.
2. **Restricción de Horario Cutoff (Mismo Día)**:
   - Si la hora local del servidor sobrepasa las 12:00 PM, el servicio express `gofurther` no estará disponible para la fecha de hoy.
3. **Descuento Recurrente (7.5%)**:
   - Aplica a todas las tarifas de servicio en pedidos recurrentes (*Daily*, *Weekly*, *Biweekly*, *Monthly*) a partir del segundo servicio/cobro.
4. **Orden Mínima**:
   - Aplica una orden mínima de $40.00 en servicios de lavado de ropa.
5. **Checkout Flexible (Usuario vs Guest)**:
   - Si el cliente está autenticado, la orden se vincula a su `user_id`.
   - Si el cliente no está autenticado, se validan y guardan sus datos en campos `guest_*` (`guest_email`, `guest_first_name`, etc.).
6. **Internacionalización y Notificaciones Bilingües**:
   - Toda orden almacena el idioma del cliente (`order.language`).
   - Las confirmaciones y cancelaciones se emiten en el idioma correspondiente (*English* o *Español*).

---

## 6. Comandos Principales

### Backend (`/backend`)
```bash
# Activar entorno virtual (según OS)
# Windows: venv\Scripts\activate
# Linux/macOS: source venv/bin/activate

# Aplicar migraciones de base de datos
python manage.py migrate

# Poblar tarifas de servicio por defecto
python manage.py seed_service_rates

# Crear o actualizar superusuario no interactivo (usa credenciales del .env)
python manage.py create_admin

# Probar conectividad y despacho SMTP de correos
python manage.py test_email [correo_destino]

# Iniciar servidor de desarrollo (puerto 8000)
python manage.py runserver 8000

# Ejecutar suite de pruebas completa con pytest (21 tests)
pytest
```

### Frontend (`/frontend`)
```bash
# Iniciar servidor de desarrollo Vite (puerto 5173)
npm run dev

# Compilar proyecto para producción (TypeScript check + Vite build)
npm run build

# Ejecutar linter Oxlint
npm run lint
```

---

## 7. Despliegue en Producción (Render)

El proyecto incluye soporte nativo para despliegue automatizado en **Render** mediante Infrastructure as Code (`render.yaml`).

### Arquitectura en Render
1. **PostgreSQL Database (`laundrygo-db`)**: Base de datos gestionada con PostgreSQL 16.
2. **Backend Web Service (`laundrygo-api`)**:
   - Ejecutado con `gunicorn config.wsgi:application`.
   - Python `3.12.8` especificado vía `.python-version` y `render.yaml`.
   - WhiteNoise para compresión y entrega de estáticos del panel Unfold.
   - Soporte automático para `DATABASE_URL`.
   - Healthcheck en `/api/v1/health/`.
   - Variables de Correo SMTP configuradas:
     - `EMAIL_BACKEND=django.core.mail.backends.smtp.EmailBackend`
     - `EMAIL_HOST=smtp.gmail.com`
     - `EMAIL_PORT=587`
     - `EMAIL_USE_TLS=True`
     - `EMAIL_HOST_USER=info@thelaundrygo.com`
     - `EMAIL_HOST_PASSWORD=<Google-App-Password-16-chars>`
     - `DEFAULT_FROM_EMAIL=LaundryGo <info@thelaundrygo.com>`
     - `ADMIN_EMAIL=info@thelaundrygo.com`
3. **Frontend Static Site (`laundrygo-web`)**:
   - Dominio oficial: `https://thelaundrygo.com` y `https://www.thelaundrygo.com`.
   - Compilado con `npm run build` y publicado desde `./dist`.
   - Variable `VITE_API_URL` conectada al host de `laundrygo-api.onrender.com`.
   - Regla de reescritura SPA (`/* -> /index.html`) para enrutamiento sin errores 404 en recargas.

### Comandos de Construcción en Producción
- **Backend Build (`backend/build.sh`)**:
  ```bash
  #!/usr/bin/env bash
  set -o errexit
  pip install --upgrade pip
  pip install -r requirements/base.txt
  python manage.py collectstatic --no-input
  python manage.py migrate
  python manage.py seed_service_rates
  ```
- **Frontend Build**:
  ```bash
  npm install && npm run build
  ```

---

## 8. Gotchas y Notas para Agentes

- **Resolución de Red IPv4 en Contenedores Render**: En entornos cloud Linux (Render), el DNS de `smtp.gmail.com` retorna direcciones IPv6 antes de IPv4. Como los contenedores carecen de gateway IPv6 saliente, Python arroja `[Errno 101] Network is unreachable`. En `config/settings.py`, `socket.getaddrinfo` fuerza `AF_INET` para garantizar conexiones directas por IPv4.
- **Contraseñas de Aplicación de Google (App Passwords)**: Si se usa Gmail o Google Workspace (`info@thelaundrygo.com`), la contraseña debe ser un *App Password* de 16 letras generado habiendo iniciado sesión directamente en esa cuenta de Google con 2FA activo.
- **Plantillas de Email Bilingües**: Al editar o añadir notificaciones por correo en `apps/orders/emails.py`, mantener actualizadas ambas ramas (`is_spanish` y default en inglés) tanto para la versión texto plano como para el template HTML.
- **Archivo `.env` en Backend**: Es imprescindible contar con un archivo `.env` dentro de `backend/` para que Django funcione correctamente. Copiar desde `.env.example`.
- **Modelo de Usuario Personalizado**: Siempre importar el modelo de usuario utilizando `django.contrib.auth.get_user_model()` o referenciar `settings.AUTH_USER_MODEL`. Nunca importar o usar `django.contrib.auth.models.User` directamente.
- **Estructura de Apps Backend**: Las carpetas activas de Django están dentro de `backend/apps/`. Las carpetas raíz `backend/users`, `backend/orders` y `backend/core` contienen únicamente adaptadores stub.
- **Frecuencias de Recurrencia**: La terminología estándar es `daily`, `weekly`, `biweekly`, `monthly`.
- **Traducciones i18n**: Al añadir o editar texto en las vistas, incluir las llaves correspondientes en `public/locales/en/common.json` y `public/locales/es/common.json` usando `useTranslation()`.
- **Tailwind CSS v4 en Frontend**: Utiliza el plugin `@tailwindcss/vite` y se configura directamente en `src/index.css`. No existe ni debe crearse `tailwind.config.js`.
- **Render Static Sites SPA**: Requiere regla de rewrite `/*` hacia `/index.html` para evitar errores 404 al recargar rutas en React Router.
- **CORS y CSRF en Producción**: En producción, asegurar que `CORS_ALLOWED_ORIGINS` y `CSRF_TRUSTED_ORIGINS` contengan tanto los subdominios de Render como el dominio oficial `https://thelaundrygo.com` y `https://www.thelaundrygo.com`.
