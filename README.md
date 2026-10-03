# ATLAS

ATLAS le sirve a quien explora la biodiversidad para guardar y organizar criaturas que descubre en iNaturalist, en lugar de llevar sus observaciones en notas dispersas.

## Demo

- App: pendiente de despliegue en Vercel
- API: https://atlas-tu-enciclopedia-de-animalitos.onrender.com
- Cuenta demo local: `atlas.demo@example.test` / `Atlas-Demo-Only-2026!` (cuenta de prueba sin rol admin; cambia o elimina esta cuenta antes de publicar la base de datos)

## Capturas

Pendiente: agrega una o dos capturas de la app funcionando.

## Stack

HTML, CSS y JavaScript; Node.js, Express, Supabase (PostgreSQL), bcrypt y JWT.

## Base de datos Supabase

1. Crea un proyecto en Supabase.
2. Abre **SQL Editor** en el dashboard, pega el contenido actualizado de [`schema.sql`](schema.sql) y ejecuta el script. Crea `users`, `discoveries` y `taxon_views`, sus índices, RLS y las vistas agregadas del panel admin. Puedes volver a ejecutarlo para aplicar estas adiciones.
3. En **Project Settings > API**, copia la URL y la clave `service_role` (o la nueva secret key equivalente). La clave se usa solo en el backend; nunca la pongas en `config.js`, el frontend ni el repositorio. El backend utiliza Supabase desde el servidor y la clave privilegiada evita que RLS bloquee sus consultas.
4. Para que una cuenta tuya pueda usar la ruta admin, regístrala primero y ejecuta en SQL Editor, reemplazando el correo:

```sql
update public.users
set role = 'admin'
where email = 'tu-correo@example.com';
```

La cuenta demo sembrada es un usuario normal. No eleves esa cuenta en una base publicada. Después de cambiar un usuario a `admin`, cierra sesión e inicia nuevamente para que el JWT contenga el rol actualizado.

## Endpoints

| Método | Ruta | Protegida | Qué hace |
|---|---|---|---|
| GET | `/` | No | Comprueba que la API responde |
| POST | `/auth/registro` | No | Crea una cuenta con contraseña bcrypt |
| POST | `/auth/login` | No | Valida credenciales y devuelve JWT de 24 horas |
| GET | `/api/discoveries` | JWT | Lista los descubrimientos propios |
| POST | `/api/discoveries` | JWT | Guarda un descubrimiento |
| POST | `/api/discoveries/views` | JWT | Registra la apertura de una ficha |
| PUT | `/api/discoveries/:id` | JWT | Actualiza estado, notas o favorito propio |
| DELETE | `/api/discoveries/:id` | JWT | Elimina un descubrimiento propio |
| GET | `/api/admin/users` | JWT + admin | Lista usuarios sin hashes de contraseña |
| GET | `/api/admin/metrics` | JWT + admin | Devuelve los 10 animales más guardados y más vistos |

## Cómo correrlo en local

Requisitos: Node.js y pnpm.

1. Instala dependencias:

```powershell
cd backend
pnpm install
```

2. Desde la raíz del proyecto, copia el ejemplo y completa `SUPABASE_URL` y `SUPABASE_KEY` con los valores de Supabase. `SUPABASE_KEY` debe ser la clave privilegiada de servidor y mantenerse solo en el backend:

```powershell
Copy-Item .env.example backend/.env
```

Genera un secreto JWT aleatorio con:

```powershell
node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"
```

Pega el resultado en `JWT_SECRET`. No lo compartas ni lo subas al repo.

3. Inicia la API desde la carpeta `backend`:

```powershell
pnpm dev
```

La API queda en `http://localhost:3000`. Para abrir la interfaz, sirve la carpeta raíz con VS Code Live Server en el puerto `5500` (o `5502`, ambos están permitidos por defecto). También puedes probar el flujo HTTP de [`requests.http`](requests.http) con la extensión REST Client.

## Despliegue

La API está desplegada en Render. Falta desplegar la interfaz en Vercel y completar CORS con su dominio.

- **Render:** la API responde en `https://atlas-tu-enciclopedia-de-animalitos.onrender.com`. Configura `SUPABASE_URL`, `SUPABASE_KEY`, `JWT_SECRET` y `CORS_ORIGINS` en las variables del servicio. Cuando tengas la URL de Vercel, agrega ese origen exacto a `CORS_ORIGINS`, sin `*` ni barra final.
- **Vercel:** publica la carpeta raíz como sitio estático. `config.js` conserva `localhost:3000` en desarrollo local y usa automáticamente la URL HTTPS de Render en producción. No pongas claves de Supabase ni el JWT secret en el frontend.
- Cuando estén desplegados, reemplaza los enlaces pendientes de **Demo** por las URLs reales y prueba registro, login y CRUD desde el dominio de Vercel.

## Seguridad aplicada

- bcrypt para hashes; respuestas de registro/login y ruta admin no exponen `password_hash`.
- JWT firmado con secreto de entorno y expiración de 24 horas; middleware para rutas privadas y verificación de rol admin.
- Cada consulta de descubrimientos filtra por el `user_id` del JWT; la base también impone FK y unicidad por usuario.
- Las vistas se registran al abrir fichas con sesión; solo administración puede consultar los rankings agregados.
- Validadores limitan y verifican cuerpos e IDs; las consultas se hacen con el cliente Supabase y filtros estructurados, sin concatenar SQL.
- CORS permite solo los orígenes configurados, auth tiene rate limit y Express aplica Helmet.
- `.env` está ignorado por Git; RLS está habilitado en las tablas y la clave privilegiada permanece únicamente en el backend.

## Revisión de requisitos de entrega

- **Implementado en el repo:** esquema SQL, API con arquitectura separada, autenticación, rol admin y panel de tendencias, CRUD aislado por usuario, validación y seguridad, pantallas de registro/login, CRUD de Mi Atlas, logout, manejo de sesión vencida y estados de interfaz, flujo REST Client con tres casos negativos.
- **Pendiente fuera del código:** ejecutar `schema.sql` en Supabase, configurar credenciales, desplegar API y frontend, publicar el repositorio, reemplazar URLs y agregar capturas. No marques la entrega como completa hasta probar las tres URLs con dos cuentas distintas.
