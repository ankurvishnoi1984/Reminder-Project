# Deployment Guide
## Employee Reminder & Communication System

This guide provides step-by-step instructions for deploying the Reminder System database and application in various environments.

---

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Database Deployment](#database-deployment)
3. [Application Deployment](#application-deployment)
4. [Environment Configuration](#environment-configuration)
5. [Post-Deployment Verification](#post-deployment-verification)
6. [Troubleshooting](#troubleshooting)
7. [Production Considerations](#production-considerations)

---

## Prerequisites

### Required Software

- **MySQL 8.0+** or **MariaDB 10.3+**
- **Node.js 18+** and **npm** (for backend)
- **Docker** and **Docker Compose** (optional, for containerized deployment)
- **Git** (for cloning the repository)

### System Requirements

- **Minimum RAM:** 2GB
- **Minimum Disk Space:** 5GB
- **Operating System:** Linux, macOS, or Windows

### Database User Permissions

The database user needs the following permissions:
- `CREATE DATABASE`
- `CREATE TABLE`
- `INSERT`, `UPDATE`, `DELETE`, `SELECT`
- `CREATE INDEX`
- `ALTER TABLE` (for migrations)

---

## Database Deployment

### Option 1: Using SQL Script (Manual Deployment)

This method uses the standalone SQL script for direct database setup.

#### Step 1: Create Database

```bash
# Login to MySQL
mysql -u root -p

# Create database
CREATE DATABASE reminder_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

# Exit MySQL
exit;
```

#### Step 2: Run SQL Script

```bash
# Run the deployment script
mysql -u root -p reminder_db < database-deployment.sql

# Or if you're already in MySQL:
mysql -u root -p
USE reminder_db;
SOURCE database-deployment.sql;
```

#### Step 3: Verify Database

```bash
mysql -u root -p reminder_db -e "SHOW TABLES;"
mysql -u root -p reminder_db -e "SELECT COUNT(*) FROM Users;"
mysql -u root -p reminder_db -e "SELECT COUNT(*) FROM Events;"
```

**Expected Output:**
- 7 tables: Users, Employees, Events, Templates, FestivalMasters, Notifications, BulkUploadLogs
- 1 user record
- 3 event records
- 3 template records

---

### Option 2: Using Sequelize Migrations (Recommended)

This method uses Sequelize CLI for database migrations, which is the standard approach for this project.

#### Step 1: Configure Environment

Create a `.env` file in the `backend` directory:

```env
DB_HOST=localhost
DB_PORT=3306
DB_NAME=reminder_db
DB_USER=root
DB_PASSWORD=your_password
NODE_ENV=development
```

#### Step 2: Install Dependencies

```bash
cd backend
npm install
```

#### Step 3: Run Migrations

```bash
# Run all migrations
npm run migrate

# Or using Sequelize CLI directly
npx sequelize-cli db:migrate
```

#### Step 4: Seed Initial Data

```bash
# Run all seeders
npm run seed

# Or using Sequelize CLI directly
npx sequelize-cli db:seed:all
```

#### Step 5: Verify Migration Status

```bash
# Check migration status
npx sequelize-cli db:migrate:status
```

---

### Option 3: Using Docker Compose

This method deploys the entire stack including database using Docker.

#### Step 1: Configure Environment

Update `docker-compose.yml` or create `.env` file:

```env
DB_HOST=mysql
DB_PORT=3306
DB_NAME=reminder_db
DB_USER=root
DB_PASSWORD=rootpassword
```

#### Step 2: Start Services

```bash
# Build and start all services
docker-compose up -d

# Check service status
docker-compose ps
```

#### Step 3: Run Migrations

```bash
# Wait for MySQL to be ready (about 30 seconds)
sleep 30

# Run migrations
docker exec -it reminder_backend npm run migrate

# Run seeders
docker exec -it reminder_backend npm run seed
```

#### Step 4: Verify Database

```bash
# Connect to MySQL container
docker exec -it reminder_mysql mysql -u root -prootpassword reminder_db

# Run verification queries
SHOW TABLES;
SELECT COUNT(*) FROM Users;
SELECT COUNT(*) FROM Events;
```

---

## Application Deployment

### Backend Deployment

#### Step 1: Install Dependencies

```bash
cd backend
npm install --production
```

#### Step 2: Configure Environment Variables

Create `.env` file with all required variables (see [Environment Configuration](#environment-configuration)).

#### Step 3: Run Database Migrations

```bash
npm run migrate
npm run seed
```

#### Step 4: Start Application

**Development:**
```bash
npm run dev
```

**Production:**
```bash
npm start
```

**Using PM2 (Recommended for Production):**
```bash
npm install -g pm2
pm2 start src/server.js --name reminder-backend
pm2 save
pm2 startup
```

---

### Frontend Deployment

#### Step 1: Install Dependencies

```bash
cd frontend
npm install
```

#### Step 2: Build for Production

```bash
npm run build
```

#### Step 3: Serve Static Files

**Using Nginx:**
```nginx
server {
    listen 80;
    server_name your-domain.com;
    root /path/to/frontend/dist;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    location /api {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

**Using Docker:**
The frontend Dockerfile already includes Nginx configuration.

---

## Environment Configuration

### Backend Environment Variables

Create a `.env` file in the `backend` directory:

```env
# Server Configuration
PORT=5000
NODE_ENV=production

# Database Configuration
DB_HOST=localhost
DB_PORT=3306
DB_NAME=reminder_db
DB_USER=your_db_user
DB_PASSWORD=your_db_password

# JWT Configuration
JWT_SECRET=your_super_secret_jwt_key_change_in_production
JWT_EXPIRES_IN=7d

# Email Configuration (SMTP)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password
SMTP_FROM=noreply@company.com

# Twilio Configuration (SMS/WhatsApp)
TWILIO_ACCOUNT_SID=your_twilio_account_sid
TWILIO_AUTH_TOKEN=your_twilio_auth_token
TWILIO_PHONE_NUMBER=+1234567890
TWILIO_WHATSAPP_NUMBER=whatsapp:+14155238886

# Frontend URL
FRONTEND_URL=http://localhost:3000
```

### Security Best Practices

1. **Never commit `.env` files** to version control
2. **Use strong passwords** for database and JWT secret
3. **Rotate secrets** regularly in production
4. **Use environment-specific** configuration files
5. **Restrict database access** to application server only

---

## Post-Deployment Verification

### Database Verification

```sql
-- Check all tables exist
SHOW TABLES;

-- Verify initial data
SELECT COUNT(*) as user_count FROM Users;
SELECT COUNT(*) as event_count FROM Events;
SELECT COUNT(*) as template_count FROM Templates;

-- Check table structures
DESCRIBE Users;
DESCRIBE Employees;
DESCRIBE Events;
```

### Application Verification

1. **Backend Health Check:**
   ```bash
   curl http://localhost:5000/api/health
   # Or visit in browser
   ```

2. **Test Login:**
   ```bash
   curl -X POST http://localhost:5000/api/auth/login \
     -H "Content-Type: application/json" \
     -d '{"email":"admin@company.com","password":"admin123"}'
   ```

3. **Frontend Access:**
   - Open browser: `http://localhost:3000`
   - Login with default credentials
   - Verify dashboard loads

### Default Credentials

- **Email:** `admin@company.com`
- **Password:** `admin123`

⚠️ **IMPORTANT:** Change the default password immediately after first login in production!

---

## Troubleshooting

### Database Connection Issues

**Problem:** Cannot connect to database

**Solutions:**
1. Verify MySQL service is running:
   ```bash
   # Linux/Mac
   sudo systemctl status mysql
   # Windows
   net start MySQL80
   ```

2. Check database credentials in `.env` file

3. Verify database exists:
   ```bash
   mysql -u root -p -e "SHOW DATABASES;"
   ```

4. Check firewall settings (port 3306)

### Migration Errors

**Problem:** Migration fails with "Table already exists"

**Solutions:**
1. Check migration status:
   ```bash
   npx sequelize-cli db:migrate:status
   ```

2. Rollback and re-run:
   ```bash
   npx sequelize-cli db:migrate:undo:all
   npx sequelize-cli db:migrate
   ```

3. If using SQL script, drop tables first:
   ```sql
   DROP TABLE IF EXISTS BulkUploadLogs;
   DROP TABLE IF EXISTS Notifications;
   DROP TABLE IF EXISTS FestivalMasters;
   DROP TABLE IF EXISTS Templates;
   DROP TABLE IF EXISTS Events;
   DROP TABLE IF EXISTS Employees;
   DROP TABLE IF EXISTS Users;
   ```

### Docker Issues

**Problem:** Container fails to start

**Solutions:**
1. Check logs:
   ```bash
   docker-compose logs mysql
   docker-compose logs backend
   ```

2. Verify ports are not in use:
   ```bash
   # Linux/Mac
   lsof -i :3306
   lsof -i :5000
   # Windows
   netstat -ano | findstr :3306
   ```

3. Rebuild containers:
   ```bash
   docker-compose down
   docker-compose build --no-cache
   docker-compose up -d
   ```

### Permission Errors

**Problem:** Database user lacks permissions

**Solutions:**
```sql
-- Grant necessary permissions
GRANT ALL PRIVILEGES ON reminder_db.* TO 'your_user'@'localhost';
FLUSH PRIVILEGES;
```

---

## Production Considerations

### Database

1. **Backup Strategy:**
   ```bash
   # Daily backup script
   mysqldump -u root -p reminder_db > backup_$(date +%Y%m%d).sql
   ```

2. **Performance Optimization:**
   - Enable query caching
   - Configure connection pooling
   - Add appropriate indexes (already included in script)
   - Regular table optimization

3. **Security:**
   - Use dedicated database user with minimal privileges
   - Enable SSL connections
   - Regular security updates
   - Monitor for suspicious activity

### Application

1. **Process Management:**
   - Use PM2 or similar process manager
   - Configure auto-restart on failure
   - Set up log rotation

2. **Monitoring:**
   - Set up application monitoring (e.g., PM2 Plus, New Relic)
   - Database monitoring
   - Error tracking (e.g., Sentry)

3. **Scaling:**
   - Use load balancer for multiple instances
   - Configure database replication for high availability
   - Use Redis for session management (if needed)

4. **SSL/HTTPS:**
   - Configure SSL certificates (Let's Encrypt)
   - Force HTTPS redirects
   - Secure cookie settings

### Environment Variables

- Store sensitive variables in secure vault (e.g., AWS Secrets Manager, HashiCorp Vault)
- Use different credentials for each environment
- Never expose credentials in logs or error messages

---

## Rollback Procedures

### Database Rollback

```bash
# Rollback last migration
npx sequelize-cli db:migrate:undo

# Rollback all migrations
npx sequelize-cli db:migrate:undo:all

# Restore from backup
mysql -u root -p reminder_db < backup_YYYYMMDD.sql
```

### Application Rollback

```bash
# Using PM2
pm2 restart reminder-backend

# Using Docker
docker-compose restart backend

# Full rollback
git checkout previous-version
docker-compose down
docker-compose up -d --build
```

---

## Support and Maintenance

### Regular Maintenance Tasks

1. **Weekly:**
   - Review application logs
   - Check database performance
   - Verify backups are running

2. **Monthly:**
   - Update dependencies
   - Review security patches
   - Performance optimization

3. **Quarterly:**
   - Full system audit
   - Disaster recovery testing
   - Capacity planning review

### Getting Help

- Check application logs: `backend/logs/` or `docker-compose logs`
- Review database logs: MySQL error log
- Check GitHub issues for known problems
- Contact system administrator

---

## Appendix

### Database Schema Diagram

```
Users (1) ──┐
            │
            ├── BulkUploadLogs (N)
            │
Employees (N) ──┐
                │
                └── Notifications (N)

Events (1) ──┐
             │
             └── Templates (N)

FestivalMasters (N)
```

### Table Relationships

- `Users` → `BulkUploadLogs` (One-to-Many)
- `Employees` → `Notifications` (One-to-Many)
- `Events` → `Templates` (One-to-Many via eventType)

### Useful Commands

```bash
# Database backup
mysqldump -u root -p reminder_db > backup.sql

# Database restore
mysql -u root -p reminder_db < backup.sql

# Check table sizes
mysql -u root -p reminder_db -e "
SELECT 
    table_name AS 'Table',
    ROUND(((data_length + index_length) / 1024 / 1024), 2) AS 'Size (MB)'
FROM information_schema.TABLES
WHERE table_schema = 'reminder_db'
ORDER BY (data_length + index_length) DESC;
"

# Check database connections
mysql -u root -p -e "SHOW PROCESSLIST;"
```

---

**Last Updated:** 2024
**Version:** 1.0.0
