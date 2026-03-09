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
