# 🚀 Abel González | Digital Architect & Automation Portfolio

Este es mi ecosistema digital profesional, construido como una Single Page Application (SPA) de alto rendimiento enfocada en la automatización de procesos y la experiencia de usuario (UX).

## 🛠️ Stack Tecnológico

* **Frontend:** Next.js 15 (App Router), TypeScript, Tailwind CSS.
* **Backend & DB:** Supabase (PostgreSQL) para gestión de datos y cifrado.
* **Automatización:** Integración con Airtable API para gestión dinámica de contenidos (Eventos/Cursos).
* **Pagos:** Stripe API para futuras integraciones comerciales.
* **Despliegue:** Vercel (CI/CD).

## 🌟 Características Destacadas

- **Gestión Dinámica (Airtable):** Los cursos y eventos se cargan automáticamente desde una base de datos de Airtable. Añadir contenido nuevo es tan simple como rellenar una fila en una hoja de cálculo.
- **Seguridad:** Implementación de cifrado mediante Supabase para proteger la integridad de los datos del proyecto.
- **Diseño Futurista:** Interfaz de usuario con estética neón optimizada para legibilidad y conversión.
- **Automatización de QR:** Generación dinámica de códigos QR para eventos cargados desde la API.

## 📁 Estructura del Proyecto

```text
├── src/
│   ├── app/            # Rutas y Layouts (Next.js App Router)
│   ├── components/     # Componentes modulares y UI (Neon style)
│   ├── lib/            # Configuraciones de API (Supabase, Stripe, Airtable)
│   └── assets/         # Recursos estáticos (incluyendo CV_2026)
└── public/             # Archivos públicos de acceso directo

## Laboratorio (`/laboratorio`)

Demostración pública de automatización. Las acciones reales de email usan
credenciales **propias**, distintas de las del formulario de contacto.

Variables de entorno (solo servidor, nunca con prefijo `NEXT_PUBLIC_`):

| Variable | Uso |
| --- | --- |
| `LAB_RESEND_API_KEY` | Clave de Resend exclusiva del laboratorio. Si falta, el laboratorio sigue funcionando en modo `SIMULACIÓN` y **no** recurre a `RESEND_API_KEY`. |
| `LAB_CONTACT_EMAIL` | Destinatario del aviso interno de la demo. Si falta, mismo comportamiento: simulación, sin fallback a `CONTACT_EMAIL`. |
| `LAB_EMAIL_FROM` | Opcional. Remitente. Debe pertenecer a un dominio verificado en Resend. |
| `LAB_DAILY_EMAIL_BUDGET` | Opcional. Tope global de emails reales del laboratorio por día (por defecto 40). |
| `LAB_SUPABASE_URL` | URL del proyecto de persistencia **solo del laboratorio**. Si falta, el laboratorio usa memoria de proceso (válido en local; frágil en serverless). |
| `LAB_SUPABASE_SERVICE_ROLE_KEY` | Service role, **solo servidor**. Nunca `NEXT_PUBLIC_`. Sin esta clave no se usa Supabase. No hay fallback a variables genéricas `SUPABASE_*`. |

Aplicar el esquema en el SQL Editor de Supabase o con `npm run lab:apply-sql`: `supabase/lab.sql`. RLS queda activo y `anon`/`authenticated` no tienen privilegios.

El presupuesto diario se reserva con `lab_try_consume_email_budget` (incremento atómico). El PII de reentrada se anula al caducar (`lab_scrub_expired`, llamado en cada lectura/alta; TTL 2 h). No hay `pg_cron` en esta fase.

Pruebas: `npm run test:lab` (requiere el servidor en marcha).

El contacto (`/api/contact`) y el presupuesto (`/api/quote`) continúan usando
exclusivamente `RESEND_API_KEY` y `CONTACT_EMAIL`. El laboratorio no comparte
persistencia ni credenciales con el resto del sitio.
