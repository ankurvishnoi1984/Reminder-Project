# Employee Reminder & Communication System

A comprehensive automated reminder system for Employee Birthdays, Job Anniversaries, and Festivals with configurable Email, WhatsApp, and SMS notifications.

## Features

- ✅ **Employee Management** - Full CRUD operations for employee data
- ✅ **Bulk Upload** - Upload employees via CSV/Excel with validation
- ✅ **Event Configuration** - Configure Birthday, Anniversary, and Festival reminders
- ✅ **Template Management** - Create and manage message templates with placeholders
- ✅ **Multi-channel Notifications** - Email, SMS, and WhatsApp support
- ✅ **Automated Scheduler** - Daily cron job for automatic reminders
- ✅ **Dashboard & Reports** - View statistics and export reports
- ✅ **Role-based Access** - Admin authentication with JWT

## Tech Stack

### Backend
- Node.js with Express.js
- MySQL with Sequelize ORM
- JWT Authentication
- node-cron for scheduling
- Nodemailer for emails
- Twilio for SMS/WhatsApp

### Frontend
- React with Vite
- React Router for navigation
- React Query for data fetching
- Recharts for charts
- Tailwind CSS for styling

## Setup Instructions

### Prerequisites
- Node.js 18+
- MySQL 8.0+
- npm or yarn

### Backend Setup

1. Navigate to backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Create `.env` file (copy from `.env.example`):
```bash
# Copy and configure environment variables
PORT=5000
NODE_ENV=development
DB_HOST=localhost
DB_PORT=3306
DB_NAME=reminder_db
DB_USER=root
DB_PASSWORD=your_password
JWT_SECRET=your_super_secret_jwt_key
JWT_EXPIRES_IN=7d
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password
SMTP_FROM=noreply@company.com
TWILIO_ACCOUNT_SID=your_twilio_account_sid
TWILIO_AUTH_TOKEN=your_twilio_auth_token
TWILIO_PHONE_NUMBER=+1234567890
TWILIO_WHATSAPP_NUMBER=whatsapp:+14155238886
FRONTEND_URL=http://localhost:3000
```

4. Run migrations:
```bash
npm run migrate
```

5. Run seeders (creates default admin user):
```bash
npm run seed
```

6. Start server:
```bash
npm run dev
```

### Frontend Setup

1. Navigate to frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Start development server:
```bash
npm run dev
```

### Docker Setup

1. Build and start all services:
```bash
docker-compose up -d
```

2. Run migrations and seeders:
```bash
docker exec -it reminder_backend npm run migrate
docker exec -it reminder_backend npm run seed
```

## Default Credentials

- **Email:** admin@company.com
- **Password:** admin123

⚠️ **Important:** Change the default password after first login in production!

## API Endpoints

### Authentication
- `POST /api/auth/login` - Admin login
- `GET /api/auth/profile` - Get user profile

### Employees
- `GET /api/employees` - Get all employees (with pagination)
- `GET /api/employees/:id` - Get employee by ID
- `POST /api/employees` - Create employee
- `PUT /api/employees/:id` - Update employee
- `DELETE /api/employees/:id` - Delete employee

### Bulk Upload
- `POST /api/bulk-upload/upload` - Upload CSV/Excel file
- `GET /api/bulk-upload/logs` - Get upload history

### Templates
- `GET /api/templates` - Get all templates
- `GET /api/templates/:id` - Get template by ID
- `POST /api/templates` - Create template
- `PUT /api/templates/:id` - Update template
- `DELETE /api/templates/:id` - Delete template

### Events
- `GET /api/events` - Get all events
- `GET /api/events/:id` - Get event by ID
- `PUT /api/events/:id` - Update event configuration

### Festivals
- `GET /api/festivals` - Get all festivals
- `POST /api/festivals` - Create festival
- `PUT /api/festivals/:id` - Update festival
- `DELETE /api/festivals/:id` - Delete festival

### Dashboard
- `GET /api/dashboard/stats` - Get dashboard statistics

### Reports
- `GET /api/reports` - Get reports with filters
- `GET /api/reports/export` - Export reports as CSV

## Template Placeholders

- `{EmployeeName}` - Employee's full name
- `{YearsCompleted}` - Years of service (for anniversaries)
- `{FestivalName}` - Festival name (for festivals)

## Bulk Upload Format

CSV/Excel file should contain the following columns:
- `employeeId` (required)
- `fullName` (required)
- `email` (required)
- `mobileNumber` (required)
- `whatsappNumber` (optional)
- `dateOfBirth` (required, format: YYYY-MM-DD)
- `dateOfJoining` (required, format: YYYY-MM-DD)
- `department` (required)
- `status` (optional, default: Active)

## Scheduler

The system runs a daily cron job at 8:00 AM to process reminders. You can modify the schedule in `backend/src/server.js`:

```javascript
cron.schedule('0 8 * * *', async () => {
  // Runs daily at 8 AM
});
```

## Project Structure

```
Reminder_Project/
├── backend/
│   ├── src/
│   │   ├── config/         # Database configuration
│   │   ├── controllers/    # Route controllers
│   │   ├── models/         # Sequelize models
│   │   ├── routes/         # API routes
│   │   ├── middleware/     # Auth & upload middleware
│   │   ├── services/       # Business logic services
│   │   └── server.js       # Entry point
│   ├── migrations/         # Database migrations
│   ├── seeders/           # Database seeders
│   └── uploads/            # Uploaded files
├── frontend/
│   ├── src/
│   │   ├── components/     # Reusable components
│   │   ├── pages/          # Page components
│   │   ├── services/       # API services
│   │   └── App.jsx         # Main app component
│   └── public/             # Static files
└── docker-compose.yml      # Docker configuration
```

## Development

### Running in Development Mode

1. Start MySQL (if not using Docker)
2. Start backend: `cd backend && npm run dev`
3. Start frontend: `cd frontend && npm run dev`

### Building for Production

1. Backend: `cd backend && npm start`
2. Frontend: `cd frontend && npm run build`

## Security Notes

- Change default JWT secret in production
- Use strong passwords for database
- Configure proper CORS settings
- Store sensitive credentials in environment variables
- Use HTTPS in production

## License

This project is open-source and available for use.

## Support

For issues and questions, please create an issue in the repository.
