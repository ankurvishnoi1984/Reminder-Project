# Database Deployment Documentation

This folder contains database deployment scripts and documentation for the Employee Reminder & Communication System.

## Files Overview

### 📄 `database-deployment.sql`
Standalone SQL script for manual database deployment. This script:
- Creates all required database tables
- Sets up indexes for optimal performance
- Includes table structures matching Sequelize migrations
- Can be run directly on MySQL/MariaDB

**Usage:**
```bash
mysql -u root -p reminder_db < database-deployment.sql
```

**Note:** The initial admin user should be created using Sequelize seeders (recommended) or by generating a password hash using the helper script.

---

### 📘 `DEPLOYMENT_GUIDE.md`
Comprehensive deployment guide covering:
- Prerequisites and system requirements
- Multiple deployment methods (SQL script, Sequelize migrations, Docker)
- Environment configuration
- Post-deployment verification
- Troubleshooting common issues
- Production considerations and best practices

**Recommended reading:** Start here for complete deployment instructions.

---

### 🔧 `generate-password-hash.js`
Helper script to generate bcrypt password hashes for the admin user.

**Usage:**
```bash
# From backend directory
node ../Document/generate-password-hash.js

# Or from Document directory (after installing backend dependencies)
cd ../backend
npm install
node ../Document/generate-password-hash.js
```

**Output:** Provides a bcrypt hash that can be used in SQL scripts or database updates.

---

## Quick Start

### Option 1: Using Sequelize Migrations (Recommended)

```bash
cd ../backend

# 1. Install dependencies
npm install

# 2. Configure environment
# Create .env file with database credentials

# 3. Run migrations
npm run migrate

# 4. Seed initial data
npm run seed
```

### Option 2: Using SQL Script

```bash
# 1. Create database
mysql -u root -p -e "CREATE DATABASE reminder_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"

# 2. Run SQL script
mysql -u root -p reminder_db < database-deployment.sql

# 3. Generate and set admin password hash
cd ../backend
npm install
node ../Document/generate-password-hash.js
# Copy the hash and update Users table:
mysql -u root -p reminder_db -e "UPDATE Users SET password = 'YOUR_HASH_HERE' WHERE email = 'admin@company.com';"
```

### Option 3: Using Docker

```bash
# 1. Start services
docker-compose up -d

# 2. Wait for MySQL to be ready
sleep 30

# 3. Run migrations
docker exec -it reminder_backend npm run migrate

# 4. Run seeders
docker exec -it reminder_backend npm run seed
```

---

## Default Credentials

After deployment, you can login with:

- **Email:** `admin@company.com`
- **Password:** `admin123`

⚠️ **SECURITY WARNING:** Change the default password immediately after first login in production environments!

---

## Database Schema

The database consists of 7 main tables:

1. **Users** - System administrators and users
2. **Employees** - Employee information and details
3. **Events** - Event configurations (Birthday, Anniversary, Festival)
4. **Templates** - Message templates for different channels
5. **FestivalMasters** - Festival calendar entries
6. **Notifications** - Notification history and logs
7. **BulkUploadLogs** - Bulk upload operation logs

See `database-deployment.sql` for complete schema details.

---

## Support

For detailed deployment instructions, troubleshooting, and production considerations, refer to `DEPLOYMENT_GUIDE.md`.

For issues or questions:
1. Check the troubleshooting section in `DEPLOYMENT_GUIDE.md`
2. Review application logs
3. Verify database connectivity and permissions
4. Check GitHub issues for known problems

---

**Last Updated:** 2024  
**Version:** 1.0.0
