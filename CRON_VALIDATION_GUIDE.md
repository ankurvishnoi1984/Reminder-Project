# Cron Job Validation Guide

This guide explains how to validate that cron jobs are correctly set up for Email, SMS, and WhatsApp channels.

## Overview

The reminder system has **3 separate cron jobs** that process all configured channels (Email, SMS, WhatsApp) for each event type:

1. **Birthday Reminders** - Runs every 15 minutes
2. **Work Anniversary Reminders** - Runs every 15 minutes  
3. **Festival Reminders** - Runs every 15 minutes

Each cron job processes **all configured channels** (Email, SMS, WhatsApp) based on the event configuration in the database.

## How Channels Are Processed

The cron jobs work as follows:

1. **Event Configuration**: Each event (Birthday, Anniversary, Festival) has a `channels` array that specifies which channels to use (e.g., `["Email", "SMS", "WhatsApp"]`)

2. **Template Lookup**: For each configured channel, the system looks for an active template

3. **Service Check**: The system uses the appropriate service:
   - **Email** → `emailService.js` (Nodemailer/SMTP)
   - **SMS** → `smsService.js` (Twilio)
   - **WhatsApp** → `whatsappService.js` (Twilio)

4. **Notification Sending**: Notifications are sent through the configured channel

## Validation Methods

### Method 1: Automatic Validation on Server Start

Set the environment variable to enable automatic validation:

```bash
VALIDATE_CRON_ON_START=true
```

When the server starts, it will automatically validate cron job configuration and display:
- Service configuration status (Email, SMS, WhatsApp)
- Active templates per channel
- Events and their configured channels
- Warnings if channels are configured but services are not ready

### Method 2: Manual Validation Script

Run the standalone validation script:

```bash
cd backend
npm run validate-cron
```

Or directly:

```bash
node backend/scripts/validate-cron.js
```

This will output:
- Service configuration status
- Number of active templates per channel
- Events with their configured channels
- Warnings for misconfigurations

### Method 3: Check Server Logs

When cron jobs run, they log which channels are being processed:

```
[Cron Birthday] Checking birthday reminders (Email, SMS, WhatsApp)...
[Birthday] Processing Email, SMS, WhatsApp reminders for 150 employees
[Email] Sent to John Doe (EMP001): SUCCESS (250ms)
[SMS] Sent to John Doe (EMP001): SUCCESS (1200ms)
[WhatsApp] Sent to John Doe (EMP001): SUCCESS (1500ms)
[Cron Birthday] Birthday reminder check completed
```

### Method 4: API Check (Reminder Logs)

Check the reminder logs API to see which channels are successfully sending:

```bash
GET /api/reminder-logs?channel=Email
GET /api/reminder-logs?channel=SMS
GET /api/reminder-logs?channel=WhatsApp
```

## What Gets Validated

### 1. Service Configuration

- **Email**: Always considered configured (uses SMTP)
- **SMS**: Checks if `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`, and `TWILIO_PHONE_NUMBER` are set
- **WhatsApp**: Checks if `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`, and `TWILIO_WHATSAPP_NUMBER` are set

### 2. Templates

- Validates that active templates exist for each configured channel
- Checks template count per event type and channel

### 3. Event Configuration

- Verifies that events have channels configured
- Validates reminder days settings

### 4. Warnings

The validator will warn if:
- SMS templates exist but SMS service is not configured
- WhatsApp templates exist but WhatsApp service is not configured
- No active templates exist for any channel

## Example Validation Output

```
=== Cron Job Validation ===

✓ SMS Service: CONFIGURED
✓ WhatsApp Service: CONFIGURED
✓ Email Service: CONFIGURED (SMTP)

✓ Found 3 enabled event(s)

Event: Birthday
  Channels: Email, SMS, WhatsApp
  Reminder Days: [0]
    Email: 1 active template(s)
    SMS: 1 active template(s)
    WhatsApp: 1 active template(s)

Event: JobAnniversary
  Channels: Email, SMS
  Reminder Days: [0,1]
    Email: 1 active template(s)
    SMS: 1 active template(s)

Event: Festival
  Channels: Email
  Reminder Days: [0]
    Email: 1 active template(s)

=== Validation Summary ===

Email:
  Configured: ✓
  Templates: 3
  Events: 3

SMS:
  Configured: ✓
  Templates: 2
  Events: 2

WhatsApp:
  Configured: ✓
  Templates: 1
  Events: 1

=== Warnings ===

✓ No warnings - all configured channels are ready!
```

## Common Issues and Solutions

### Issue: SMS not working
**Check:**
1. `TWILIO_ACCOUNT_SID` is set in `.env`
2. `TWILIO_AUTH_TOKEN` is set in `.env`
3. `TWILIO_PHONE_NUMBER` is set in `.env` (format: `+1234567890`)
4. Active SMS template exists for the event type

**Solution:** Run `npm run validate-cron` to check configuration

### Issue: WhatsApp not working
**Check:**
1. `TWILIO_ACCOUNT_SID` is set in `.env`
2. `TWILIO_AUTH_TOKEN` is set in `.env`
3. `TWILIO_WHATSAPP_NUMBER` is set in `.env` (format: `whatsapp:+14155238886`)
4. Active WhatsApp template exists for the event type

**Solution:** Run `npm run validate-cron` to check configuration

### Issue: No notifications being sent
**Check:**
1. Event is enabled (`isEnabled: true`)
2. Active templates exist for configured channels
3. Employees have valid contact information (email for Email, mobileNumber for SMS/WhatsApp)
4. Today matches the reminder date based on reminder days configuration

**Solution:** Check server logs when cron job runs

## Environment Variables Required

```env
# Email (always available via SMTP)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password
SMTP_FROM=noreply@company.com

# SMS (Twilio)
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=your_auth_token
TWILIO_PHONE_NUMBER=+1234567890

# WhatsApp (Twilio)
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=your_auth_token
TWILIO_WHATSAPP_NUMBER=whatsapp:+14155238886

# Optional: Validation on start
VALIDATE_CRON_ON_START=true

# Optional: Timezone for cron jobs
TZ=America/New_York
```

## Testing Cron Jobs

### Test Email Channel
1. Ensure SMTP is configured
2. Create an Email template for Birthday event
3. Configure Birthday event with `channels: ["Email"]`
4. Wait for cron job to run (or check logs)
5. Verify email sent in reminder logs

### Test SMS Channel
1. Ensure Twilio SMS is configured (run `npm run validate-cron`)
2. Create an SMS template for Birthday event
3. Configure Birthday event with `channels: ["SMS"]`
4. Ensure employee has valid `mobileNumber`
5. Wait for cron job to run
6. Verify SMS sent in reminder logs

### Test WhatsApp Channel
1. Ensure Twilio WhatsApp is configured (run `npm run validate-cron`)
2. Create a WhatsApp template for Birthday event
3. Configure Birthday event with `channels: ["WhatsApp"]`
4. Ensure employee has valid `whatsappNumber` or `mobileNumber`
5. Wait for cron job to run
6. Verify WhatsApp sent in reminder logs

### Test All Channels Together
1. Configure event with `channels: ["Email", "SMS", "WhatsApp"]`
2. Ensure all services are configured
3. Ensure templates exist for all three channels
4. Wait for cron job to run
5. Check reminder logs to verify all channels processed

## Cron Job Schedule

All cron jobs run **every 15 minutes** (`*/15 * * * *`):

- **00:00, 00:15, 00:30, 00:45** - Birthday check
- **00:00, 00:15, 00:30, 00:45** - Anniversary check
- **00:00, 00:15, 00:30, 00:45** - Festival check

Each check determines if today matches the reminder date, and only then sends notifications.

## Summary

✅ **Cron jobs are correctly set up** if:
- Services are initialized on server start
- Events have channels configured
- Active templates exist for configured channels
- No validation warnings appear

✅ **Email, SMS, and WhatsApp are all supported** through the same cron jobs - they process all configured channels for each event type.

✅ **Validation ensures** that channels configured in events have corresponding active templates and service configurations.
