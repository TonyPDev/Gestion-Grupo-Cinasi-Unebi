# 🚀 Gestión - Grupo Cinasi Unebi

**Sistema de Gestión - Grupo Cinasi Unebi**  
Este proyecto es una **aplicación web full-stack** diseñada para la **gestión de usuarios y roles** dentro de **Grupo Cinasi**.

---

## 🧩 Prerrequisitos

Asegúrate de tener instaladas las siguientes herramientas antes de comenzar:

- **Python** `3.8+` *(preferentemente 3.13.1)*  
- **Node.js** `v22.20` y **npm**  
- **PostgreSQL**

---

## ⚙️ Configuración del Backend

### 1️⃣ Clona el repositorio

```bash
git clone <URL-DEL-REPOSITORIO>
cd <NOMBRE-DEL-REPOSITORIO>/backend
```

### 2️⃣ Crea y activa un entorno virtual

```bash
python -m venv venv
```

- En **Linux / macOS**:
  ```bash
  source venv/bin/activate
  ```
- En **Windows**:
  ```bash
  venv\Scripts\activate
  ```

### 3️⃣ Instala las dependencias

```bash
pip install -r requirements.txt
```

### 4️⃣ Configura las variables de entorno

Crea un archivo `.env` en la raíz de la carpeta `backend/backend` basándote en el archivo `.env.example`, y añade las credenciales de tu base de datos y una `SECRET_KEY`.

### 5️⃣ Ejecuta las migraciones

```bash
python manage.py migrate
```

### 6️⃣ Inicia el servidor de desarrollo

```bash
python manage.py runserver
```

📍 El backend estará disponible en:  
👉 [http://127.0.0.1:8000](http://127.0.0.1:8000)

---

## 💻 Configuración del Frontend

### 1️⃣ Navega a la carpeta del frontend

```bash
cd ../frontend
```

### 2️⃣ Instala las dependencias

```bash
npm install
```

### 3️⃣ Configura la URL de la API

Crea un archivo `.env` en la raíz de la carpeta `frontend` y define la variable de entorno que apunta a tu backend:

```
VITE_API_URL=http://127.0.0.1:8000
```

### 4️⃣ Inicia el servidor de desarrollo

```bash
npm run dev
```

📍 La aplicación se abrirá en:  
👉 [http://localhost:5173](http://localhost:5173) *(o el puerto que indique Vite)*

---

## 📁 Estructura de Carpetas

El proyecto está organizado en dos carpetas principales:

```
./backend/   → Contiene todo el código relacionado con el servidor Django, la API y la lógica de negocio.
./frontend/  → Contiene la aplicación de React, incluyendo componentes, páginas, estilos y la lógica de la interfaz de usuario.
```

---

## 🧠 Tecnologías Utilizadas

A continuación se listan las tecnologías clave que impulsan este proyecto:

### 🔹 Backend (Django)

| Tecnología | Propósito |
|-------------|------------|
| **Django** | Framework principal para el desarrollo del backend |
| **Django REST Framework** | Creación de APIs RESTful robustas y escalables |
| **Simple JWT** | Implementación de la autenticación basada en tokens JWT |
| **psycopg2-binary** | Adaptador de base de datos para PostgreSQL |
| **django-cors-headers** | Manejo de CORS para permitir la comunicación con el frontend |

---

### 🔹 💻 Frontend (React)

| Tecnología | Propósito |
|-------------|------------|
| **React** | 	Biblioteca principal para construir la interfaz de usuario |
| **Vite**	| Herramienta de desarrollo rápida para React |
| **React Router DOM**	| Manejo de rutas y navegación |
| **Tailwind CSS** | 	Framework CSS para diseño moderno y responsive |
| **Axios** | 	Cliente HTTP para interactuar con la API |
| **Lucide React** | 	Biblioteca de iconos SVG ligera y personalizable |


✨ *Desarrollado con dedicación para optimizar la gestión interna de Grupo Cinasi Unebi.*
