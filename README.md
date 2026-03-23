# SGC - Sistema de Gestión de Condominios v2.4.0

Sistema integral para la administración de edificios y condominios, con motor financiero avanzado, control de acceso RBAC y auditoría.

## 🚀 Funcionalidades Principales
- **Motor Financiero**: Cálculo automático de gastos comunes, fondos especiales y reglas de cobro.
- **Ciclo de Pagos**: Registro de abonos por residentes con actualización automática de estado (Parcial/Pagado).
- **Seguridad (RBAC)**: Control de acceso basado en roles (Admin, Residente, Conserje).
- **Autenticación JWT**: Sesiones seguras mediante tokens firmados.
- **Auditoría Activa**: Registro inmutable de acciones críticas y accesos denegados.
- **Arquitectura Canónica**: Naming estandarizado `snake_case` y mapeo global de entidades.

## 🛠️ Requisitos
- Node.js v18+
- SQLite (Integrado) o MySQL (Configurable)
- Docker & Docker Compose (Opcional para despliegue rápido)

## 📦 Instalación (Modo Manual)

### 1. Clonar el repositorio
```bash
git clone -b release/v2.4.0 https://github.com/proyectoclafis2023/SGC-User-App.git
cd SGC-User-App
```

### 2. Configuración del Backend
```bash
cd sgc-backend
npm install
cp .env.example .env
# Editar .env con tu JWT_SECRET
npx prisma generate
npx prisma db push
node seed_rbac.js
npm run dev
```

### 3. Configuración del Frontend
```bash
cd ../user-crud-app
npm install
npm run dev
```

## 🐳 Docker
```bash
docker-compose up --build
```

## 🔐 Credenciales de Prueba (Demo)
- **Admin**: `test@sgc.cl` / `admin123`
- **Frontend URL**: `http://localhost:5173`
- **Backend API**: `http://localhost:3001/api`

## 📄 Licencia
Este proyecto es de uso privado para el sistema SGC.
