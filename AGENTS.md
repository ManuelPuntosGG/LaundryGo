# AGENTS.md — LaundryGo

Guía completa de arquitectura, estructura y funcionamiento del proyecto **LaundryGo** para agentes de IA y desarrolladores.

---

## 1. Visión General del Proyecto

**LaundryGo** es una plataforma web para una empresa de servicios de lavandería a domicilio con recolección y entrega rápida en Denver, Colorado y sus zonas metropolitanas adyacentes.

- **Modelo de Negocio**: Lavado de ropa cobrado por libra con opciones de entrega en 2 días, día siguiente o mismo día express (antes de las 12:00 PM). Permite pedidos puntuales o suscripciones recurrentes (diarias, semanales, quincenales, mensuales). Soporta compras de usuarios autenticados e invitados (*guest checkout*).
- **Arquitectura**: Desacoplada (Frontend Single Page Application en React + Backend REST API en Django).

---

## 2. Estructura de Directorios

```text
LaundryGo/
├── AGENTS.md                  # Especificación e instrucciones del proyecto para agentes AI
├── .env.example               # Plantilla de variables de entorno para el backend
├── backend/                   # Proyecto Backend Django 5+ REST API
│   ├── apps/                  # Aplicaciones modulares activas de Django
│   │   ├── core/              # Modelos base abstractos (TimeStampedModel)
│   │   ├── users/             # Autenticación, modelo de usuario personalizado y perfiles
│   │   └── orders/            # Tarifas de servicio, órdenes, suscripciones e i18n/emails
│   ├── config/                # Configuración global del proyecto Django (settings, urls, wsgi)
│   ├── requirements/          # Dependencias (base.txt, development.txt)
│   ├── db.sqlite3             # Base de datos SQLite local para desarrollo
│   └── manage.py              # Script CLI de administración de Django
├── frontend/                  # Proyecto Frontend React 19 + Vite 8
│   ├── public/
│   │   └── locales/           # Archivos de traducción i18n (en/common.json, es/common.json)
│   ├── src/
│   │   ├── api/               # Cliente Axios con interceptores JWT y auto-refresh
│   │   ├── components/        # Componentes UI reusables y estructura de Layout
│   │   │   ├── layout/        # Navbar, Footer, Layout principal
│   │   │   └── ui/            # Button, Card, Input, LanguageSwitcher, PageSkeleton
│   │   ├── constants/         # Ubicaciones de Denver y zonas de entrega (locations.ts)
│   │   ├── hooks/             # Custom hooks (useAuth)
│   │   ├── i18n/              # Configuración de i18next
│   │   ├── pages/             # Páginas (Home, Schedule, Auth, Dashboard)
│   │   ├── providers/         # Contexto de autenticación (AuthProvider)
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
- **Panel de Administración**: `django-unfold` (Diseño moderno, minimalista, optimizado para Tailwind CSS y responsivo a móviles).
- **Autenticación**: JSON Web Tokens (JWT) mediante `djangorestframework-simplejwt`.
- **Variables de Entorno**: Gestionadas con `python-decouple` desde `backend/.env`.

### Modelo de Usuarios y Autenticación (`apps.users`)
- **Modelo Personalizado**: `apps.users.models.User` (hereda de `AbstractUser`).
- **Configuración Django**: `AUTH_USER_MODEL = 'users.User'`.
- **Identificador Principal**: El email es el `USERNAME_FIELD` (`email` único).
- **Campos principales**: `email`, `phone`, `first_name`, `last_name`, `street_address`, `city` (default `'Denver'`), `zip_code`.
- **Endpoints de Autenticación** (`/api/v1/auth/`):
  - `POST /register/`: Registro de usuario + retorno de tokens JWT y perfil.
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
  2. `Order`: Registro de pedidos. Soporta tanto usuarios autenticados (`user`) como invitados (`guest_email`, `guest_first_name`, `guest_last_name`, `guest_phone`). Incluye dirección, zona de entrega (`inner` tarifa $0 / `outer` tarifa $25), `pickup_date`, `pickup_time_slot` (`morning` 8-11 AM / `afternoon` 12-4 PM), estado de la orden (`pending`, `confirmed`, `processing`, `ready`, `delivered`, `cancelled`).
  3. `RecurringSchedule`: Suscripciones asociadas a órdenes (`daily`, `weekly`, `fortnightly`, `monthly`) con fecha calculada del siguiente pedido.
- **Lógica de Negocio Destacada**:
  - **Límite de Hora Express**: El servicio mismo día (`gofurther`) sólo está disponible para el día de hoy si la orden se realiza antes de las 12:00 PM.
  - **Validación de Fechas**: No se permiten recolecciones en fechas pasadas.
  - **Notificaciones por Email**: Al crear una orden, Django envía automáticamente una notificación por email en HTML/Texto al `ADMIN_EMAIL` (`info@thelaundrygo.com`) y al correo del cliente (`fail_silently=True`).
- **Endpoints de Órdenes y Servicios** (`/api/v1/`):
  - `GET /services/rates/`: Lista pública de tarifas activas.
  - `GET|POST /orders/`: Lista de órdenes del usuario autenticado / Creación de orden (pública para invitados o autenticados).
  - `GET|PUT|PATCH /orders/<id>/`: Detalle y actualización de orden.
  - `GET /recurring/`: Suscripciones recurrentes del usuario.
  - `GET|PUT|PATCH|DELETE /recurring/<id>/`: Gestión de suscripción recurrente.
  - `GET /schedule/available-dates/`: Calendario dinámico de los próximos 30 días calculando disponibilidad del servicio express según la hora actual.
- **Comando Custom de Gestión**:
  - `python manage.py seed_service_rates`: Pobla la base de datos con las tres tarifas de servicio por defecto ($2.25, $2.45, $3.85).

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
- **Cliente API (`src/api/index.ts`)**:
  - Instancia de Axios con interceptores que inyectan el encabezado `Authorization: Bearer <access_token>` almacenado en `localStorage`.
  - Captura errores HTTP 401 para intentar renovar el token transparentemente vía `/auth/token/refresh/`. Si falla la renovación, limpia la sesión y redirige a `/login`.
- **Estado de Autenticación (`src/providers/AuthProvider.tsx` & `src/hooks/useAuth.ts`)**:
  - Proporciona el estado del usuario actual, comprobación de token al cargar la aplicación y métodos de `login`, `register` y `logout`.

### Páginas Principales (`src/pages/`)
1. **`Home.tsx` (`/`)**: Landing page informativa con sección Hero, resumen ágil del proceso de 4 pasos con enlace a Sobre Nosotros, tarjetas de precios comparativas ($2.25, $2.45, $3.85), calculadora de costos, mapa de cobertura en Denver, avisos de orden mínima de $40 y 7.5% de descuento recurrente, y tarjetas de contacto oficial (`info@thelaundrygo.com`, `(720) 590-8632`).
2. **`About.tsx` (`/about`)**: Página "Sobre Nosotros" con explicación visual exhaustiva del proceso de negocio en 5 pasos (Agendamiento, Pesaje comercial por libra y clasificación, Lavado ecológico y add-ons, Secado y doblado boutique, Entrega en puerta), misión en Denver, reglas clave de negocio, estándares de calidad y galería con imágenes optimizadas.
3. **`Schedule.tsx` (`/schedule`)**: Flujo interactivo de reserva de lavandería organizado en 4 pasos:
   - *Paso 1*: Selección de servicio, fecha (extraída dinámicamente de `/schedule/available-dates/`), franja horaria y frecuencia con aviso de descuento del 7.5%.
   - *Paso 2*: Selección de ciudad/zona en Denver (Inner gratis vs Outer $25), dirección y datos de contacto (auto-completados si está autenticado).
   - *Paso 3*: Selección de servicio y **Sistema de Add-ons** (Downy Scent Beads $3.50, Stain Treatment $3.50, Comforter Twin-Full $24.99, Comforter Queen-King $29.99, Pillow $6.99, Mattress cover Twin-Full $11.99, Mattress cover Queen-King $14.99) con cálculo de subtotal en vivo y solicitudes especiales.
   - *Paso 4*: Resumen final de la orden, desglose de tarifas y add-ons, aceptación de términos y confirmación con ID de orden generada. Soporta la opción "Reordenar" desde el Dashboard.
4. **`Auth.tsx` (`/login`)**: Formulario unificado de inicio de sesión y registro con validaciones dinámicas y gestión de errores.
5. **`Dashboard.tsx` (`/dashboard`)**: Panel del usuario autenticado dividido en pestañas:
   - *Historial de Órdenes*: Muestra las órdenes activas y pasadas con estado en vivo y botón para "Volver a pedir" (*Reorder*).
   - *Suscripciones Recurrentes*: Administración de planes recurrentes activos.
   - *Perfil de Usuario*: Edición de nombre, teléfono y dirección predeterminada.

---

## 5. Reglas de Negocio Clave

1. **Cálculo de Zonas de Cobertura en Denver**:
   - **Zona Inner (Gratis - $0.00)**: Denver (Downtown / Central), Lakewood, Englewood, Wheat Ridge, Arvada.
   - **Zona Outer (Recargo - $25.00)**: Aurora, Thornton, Westminster, Centennial, Highlands Ranch, Broomfield.
2. **Restricción de Horario Cutoff (Mismo Día)**:
   - Si la hora local del servidor sobrepasa las 12:00 PM, el servicio express `gofurther` no estará disponible para la fecha de hoy.
3. **Descuento Recurrente (7.5%)**:
   - Aplica a todas las tarifas de servicio en pedidos recurrentes a partir del segundo servicio/cobro.
4. **Orden Mínima**:
   - Aplica una orden mínima de $40.00 en servicios de lavado de ropa.
5. **Checkout Flexible (Usuario vs Guest)**:
   - Si el cliente está autenticado, la orden se vincula a su `user_id`.
   - Si el cliente no está autenticado, se validan y guardan sus datos en campos `guest_*` (`guest_email`, `guest_first_name`, etc.).

---

## 6. Comandos Principales

### Backend (`/backend`)
```bash
# Activar entorno virtual (según OS)
# Windows: venv\Scripts\activate

# Aplicar migraciones de base de datos
python manage.py migrate

# Poblar tarifas de servicio por defecto
python manage.py seed_service_rates

# Crear o actualizar superusuario no interactivo (usa credenciales del .env)
python manage.py create_admin

# Iniciar servidor de desarrollo (puerto 8000)
python manage.py runserver 8000

# Ejecutar tests con pytest
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
2. **Backend Web Service (`laundrygo-api`)**: Ejecutado con `gunicorn config.wsgi:application`, WhiteNoise para compresión de estáticos, soporte `DATABASE_URL` y healthcheck en `/api/v1/health/`.
3. **Frontend Static Site (`laundrygo-web`)**: Compilado con `npm run build`, publicado desde `dist`, con variable de entorno `VITE_API_URL` conectada a la API y regla de reescritura SPA (`/* -> /index.html`).

### Comandos de Construcción
- **Backend Build (`backend/build.sh`)**:
  ```bash
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

- **Archivo `.env` en Backend**: Es imprescindible contar con un archivo `.env` dentro de `backend/` para que Django funcione correctamente. Copiar desde `.env.example`.
- **Modelo de Usuario Personalizado**: Siempre importar el modelo de usuario utilizando `django.contrib.auth.get_user_model()` o referenciar `settings.AUTH_USER_MODEL`. Nunca importar o usar `django.contrib.auth.models.User` directamente.
- **Estructura de Apps Backend**: Las carpetas activas de Django están dentro de `backend/apps/`. Las carpetas raíz `backend/users`, `backend/orders` y `backend/core` contienen únicamente adaptadores stub.
- **Tailwind CSS v4 en Frontend**: Utiliza el plugin `@tailwindcss/vite` y se configura directamente en `src/index.css`. No existe ni debe crearse `tailwind.config.js`.
- **Traducciones i18n**: Al añadir o editar texto en las vistas, incluir las llaves correspondientes en `public/locales/en/common.json` y `public/locales/es/common.json` usando `useTranslation()`.
- **Render Static Sites SPA**: Requiere regla de rewrite `/*` hacia `/index.html` para evitar errores 404 al recargar rutas en React Router.
- **CORS y CSRF en Producción**: En producción, asegurar que `CORS_ALLOWED_ORIGINS` y `CSRF_TRUSTED_ORIGINS` contengan el dominio del frontend y el dominio del backend de Render.

