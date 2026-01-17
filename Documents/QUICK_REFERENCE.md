# Quick Reference Guide
## Database Deployment Commands

### Database Setup

```bash
# Create database
mysql -u root -p -e "CREATE DATABASE reminder_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"

# Run SQL script
mysql -u root -p reminder_db < database-deployment.sql

# Verify tables
mysql -u root -p reminder_db -e "SHOW TABLES;"
```

### Using Sequelize (Recommended)

```bash
cd backend

# Install dependencies
npm install

# Run migrations
npm run migrate

# Seed data
npm run seed

# Check migration status
npx sequelize-cli db:migrate:status
```

### Using Docker

```bash
# Start all services
docker-compose up -d

# Run migrations
docker exec -it reminder_backend npm run migrate

# Run seeders
docker exec -it reminder_backend npm run seed

# View logs
docker-compose logs -f
```

### Password Hash Generation

```bash
# Generate admin password hash
cd backend
node -e "const bcrypt = require('bcryptjs'); bcrypt.hash('admin123', 10).then(hash => console.log(hash));"

# Or use helper script
node ../Document/generate-password-hash.js
```

### Verification Queries

```sql
-- Check tables
SHOW TABLES;

-- Count records
SELECT COUNT(*) FROM Users;
SELECT COUNT(*) FROM Events;
SELECT COUNT(*) FROM Templates;
SELECT COUNT(*) FROM Employees;

-- Check admin user
SELECT email, role, isActive FROM Users WHERE email = 'admin@company.com';

-- View table structure
DESCRIBE Users;
DESCRIBE Employees;
```

### Backup & Restore

```bash
# Backup database
mysqldump -u root -p reminder_db > backup_$(date +%Y%m%d).sql

# Restore database
mysql -u root -p reminder_db < backup_YYYYMMDD.sql

# Backup specific table
mysqldump -u root -p reminder_db Users > users_backup.sql
```

### Rollback

```bash
# Rollback last migration
npx sequelize-cli db:migrate:undo

# Rollback all migrations
npx sequelize-cli db:migrate:undo:all

# Rollback specific migration
npx sequelize-cli db:migrate:undo --name 20240101000001-create-tables.js
```

### Environment Variables

```env
DB_HOST=localhost
DB_PORT=3306
DB_NAME=reminder_db
DB_USER=root
DB_PASSWORD=your_password
```

### Default Credentials

- **Email:** admin@company.com
- **Password:** admin123

⚠️ Change password in production!

### Common Issues

**Connection Error:**
```bash
# Check MySQL status
sudo systemctl status mysql  # Linux
net start MySQL80            # Windows

# Test connection
mysql -u root -p -e "SELECT 1;"
```

**Migration Error:**
```bash
# Check status
npx sequelize-cli db:migrate:status

# Reset (WARNING: Deletes data)
npx sequelize-cli db:migrate:undo:all
npx sequelize-cli db:migrate
```

**Docker Issues:**
```bash
# View logs
docker-compose logs mysql
docker-compose logs backend

# Restart services
docker-compose restart

# Rebuild
docker-compose down
docker-compose up -d --build
```

### Useful Links

- Full Guide: `DEPLOYMENT_GUIDE.md`
- SQL Script: `database-deployment.sql`
- Helper Script: `generate-password-hash.js`
