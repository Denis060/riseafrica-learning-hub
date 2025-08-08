# RiseAfrica Learning Hub

A full‑stack Learning Management System (LMS) built with a PHP (MySQL) backend and a React + Tailwind frontend.

## Features
- User accounts with email verification (students, tutors, admins)
- Course catalog, enrollment, progress tracking
- Admin dashboard: users, courses, metrics
- Public profiles and certificates
- CORS-enabled API for local development

## Tech Stack
- Backend: PHP 7+/8+, MySQL, PDO, PHPMailer, Composer
- Frontend: React 18, React Router, Axios, TailwindCSS, Toastify
- Dev: Laragon (Apache + MySQL), Node.js 18+

## Monorepo Structure
```
backend/          # PHP API + admin panel
  api/            # REST endpoints (PHP)
  config/         # DB and bootstrap
  core/           # CORS/initialize, auth helpers
  uploads/        # User uploads (avatars, etc.)
frontend/         # React app
  src/            # Components, pages, context
  public/         # Static assets
```

## Prerequisites
- Windows + [Laragon](https://laragon.org/) (Apache + MySQL running)
- Node.js 18+ and npm
- PHP extensions: pdo_mysql, openssl, mbstring, curl
- MySQL database access

## Quick Start

### 1) Database
Create the database and essential tables (minimal set; extend as needed):

```sql
CREATE DATABASE IF NOT EXISTS riseafrica_db;
USE riseafrica_db;

CREATE TABLE IF NOT EXISTS users (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  role ENUM('student','tutor','admin') DEFAULT 'student',
  is_admin ENUM('0','1') DEFAULT '0',
  is_tutor ENUM('0','1') DEFAULT '0',
  is_verified TINYINT(1) DEFAULT 0,
  email_verified ENUM('0','1') DEFAULT '0',
  verification_token VARCHAR(255) NULL,
  avatar VARCHAR(255) NULL,
  bio TEXT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  last_login TIMESTAMP NULL
);

CREATE TABLE IF NOT EXISTS courses (
  id INT PRIMARY KEY AUTO_INCREMENT,
  title VARCHAR(255) NOT NULL,
  description TEXT NULL,
  instructor VARCHAR(255) NULL,
  image_url VARCHAR(500) NULL,
  category VARCHAR(100) DEFAULT 'General',
  level ENUM('Beginner','Intermediate','Advanced') DEFAULT 'Beginner',
  duration VARCHAR(50) NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS enrollments (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  course_id INT NOT NULL,
  progress INT DEFAULT 0,
  completed ENUM('0','1') DEFAULT '0',
  enrolled_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE
);
```

Optional seed users (the hash below is for the string "password"):
```sql
INSERT IGNORE INTO users (name,email,password,role,is_admin,is_verified,email_verified)
VALUES
('Admin User','admin@test.com','$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi','admin','1',1,'1'),
('Test Student','student@test.com','$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi','student','0',1,'1');
```

### 2) Backend configuration
The backend uses `backend/config/database.php`. Ensure it points to your local DB.
For development, allow CORS from `http://localhost:3000`.

If you prefer environment variables, you can introduce `backend/.env` and load it in `database.php` (not required by default).

### 3) Frontend environment
Create `frontend/.env`:
```
REACT_APP_API_URL=http://localhost/riseafrica-hub/backend
```

### 4) Install and run

PowerShell (Windows):

```powershell
# Backend (served by Laragon automatically under http://localhost/riseafrica-hub/backend)
# Ensure Apache + MySQL are running in Laragon

# Frontend
cd c:\laragon\www\riseafrica-hub\frontend
npm install
npm start
```

Open:
- Frontend: http://localhost:3000
- Backend API example: http://localhost/riseafrica-hub/backend/api/getCourses.php

## Common Tasks

### Register and verify
- Register from the frontend.
- Click the email verification link (routes to `/verify-email`).
- Login using your verified account.

### Admin panel
- Visit `/admin` (requires admin user).
- Manage users and courses.

### Public profile
- `/profile/:userId`

### Course flow
- View catalog on home.
- Open course page: `/course/:id`
- Enroll, track progress, and obtain certificates.

## API Overview (selected)
- POST `/api/register.php`       → Register user (sends verification mail)
- POST `/api/login.php`          → Login (expects verified user)
- GET  `/api/getCourses.php`     → List courses
- GET  `/api/getCourse.php?id=`  → Course details (auth may be required)
- GET  `/api/getMyCourses.php`   → My enrollments (Authorization: Bearer <token>)
- POST `/api/enrollInCourse.php` → Enroll in course
- POST `/api/updateProfile.php`  → Update profile (multipart/form-data)

Authorization: most protected routes accept `Authorization: Bearer dummy-jwt-for-user-<id>` during development.

## Testing

PowerShell quick checks:

```powershell
# Ping API
Invoke-WebRequest http://localhost/riseafrica-hub/backend/api/getCourses.php

# Login (replace email/password)
$body = @{ email='admin@test.com'; password='password' } | ConvertTo-Json
Invoke-RestMethod -Uri http://localhost/riseafrica-hub/backend/api/login.php -Method Post -ContentType 'application/json' -Body $body
```

## Troubleshooting

- “Could not connect to the server”
  - Verify Laragon Apache/MySQL are running.
  - Check `frontend/.env` REACT_APP_API_URL.
  - Confirm CORS headers in `backend/config/database.php`.

- “Please verify your email before logging in”
  - Ensure `verify-email.php` updated the correct column.
  - For development, ensure both `is_verified` and `email_verified` can be recognized by `login.php`.

- Blank or malformed JSON
  - PHP warnings can break JSON. Output buffering is used in APIs; still, check PHP error logs.

## Development Notes

- Don’t commit secrets: `.env`, DB passwords, uploads, vendor, node_modules are ignored.
- Run Composer if you add PHP deps:
  ```
  cd backend
  composer install
  ```
- Tailwind is already wired via PostCSS.

## Deployment

- Backend: deploy PHP to your host (Apache/Nginx + PHP-FPM), set `Access-Control-Allow-Origin` to your frontend domain.
- Frontend: build and host static files (Netlify/Vercel/S3/Apache):
  ```powershell
  cd frontend
  npm run build
  ```
- Update `REACT_APP_API_URL` to your production backend URL and rebuild.

## License
MIT (or your preferred license)