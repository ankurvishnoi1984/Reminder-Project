import { useState } from 'react';

const Settings = () => {
  const [settings, setSettings] = useState({
    email: {
      enabled: true,
      smtpHost: '',
      smtpPort: '',
      smtpUser: '',
      smtpPass: ''
    },
    sms: {
      enabled: false,
      accountSid: '',
      authToken: '',
      phoneNumber: ''
    },
    whatsapp: {
      enabled: false,
      accountSid: '',
      authToken: '',
      whatsappNumber: ''
    }
  });

  const handleSave = () => {
    // In a real implementation, this would call an API to save settings
    alert('Settings saved! (Note: This is a placeholder. Configure in .env file for backend)');
  };

  return (
    <div>
      <h1 className="text-2xl sm:text-3xl font-bold mb-6">Settings</h1>

      <div className="space-y-4 sm:space-y-6">
        {/* Email Settings */}
        <div className="bg-white p-4 sm:p-6 rounded-lg shadow">
          <h2 className="text-lg sm:text-xl font-bold mb-4">Email Configuration</h2>
          <div className="mb-4">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={settings.email.enabled}
                onChange={(e) => setSettings({
                  ...settings,
                  email: { ...settings.email, enabled: e.target.checked }
                })}
                className="mr-2"
              />
              Enable Email Notifications
            </label>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">SMTP Host</label>
              <input
                type="text"
                value={settings.email.smtpHost}
                onChange={(e) => setSettings({
                  ...settings,
                  email: { ...settings.email, smtpHost: e.target.value }
                })}
                className="w-full px-3 py-2 border rounded-md"
                placeholder="smtp.gmail.com"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">SMTP Port</label>
              <input
                type="number"
                value={settings.email.smtpPort}
                onChange={(e) => setSettings({
                  ...settings,
                  email: { ...settings.email, smtpPort: e.target.value }
                })}
                className="w-full px-3 py-2 border rounded-md"
                placeholder="587"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">SMTP User</label>
              <input
                type="text"
                value={settings.email.smtpUser}
                onChange={(e) => setSettings({
                  ...settings,
                  email: { ...settings.email, smtpUser: e.target.value }
                })}
                className="w-full px-3 py-2 border rounded-md"
                placeholder="your_email@gmail.com"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">SMTP Password</label>
              <input
                type="password"
                value={settings.email.smtpPass}
                onChange={(e) => setSettings({
                  ...settings,
                  email: { ...settings.email, smtpPass: e.target.value }
                })}
                className="w-full px-3 py-2 border rounded-md"
                placeholder="App Password"
              />
            </div>
          </div>
        </div>

        {/* SMS Settings */}
        <div className="bg-white p-4 sm:p-6 rounded-lg shadow">
          <h2 className="text-lg sm:text-xl font-bold mb-4">SMS Configuration (Twilio)</h2>
          <div className="mb-4">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={settings.sms.enabled}
                onChange={(e) => setSettings({
                  ...settings,
                  sms: { ...settings.sms, enabled: e.target.checked }
                })}
                className="mr-2"
              />
              Enable SMS Notifications
            </label>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Account SID</label>
              <input
                type="text"
                value={settings.sms.accountSid}
                onChange={(e) => setSettings({
                  ...settings,
                  sms: { ...settings.sms, accountSid: e.target.value }
                })}
                className="w-full px-3 py-2 border rounded-md"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Auth Token</label>
              <input
                type="password"
                value={settings.sms.authToken}
                onChange={(e) => setSettings({
                  ...settings,
                  sms: { ...settings.sms, authToken: e.target.value }
                })}
                className="w-full px-3 py-2 border rounded-md"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Phone Number</label>
              <input
                type="text"
                value={settings.sms.phoneNumber}
                onChange={(e) => setSettings({
                  ...settings,
                  sms: { ...settings.sms, phoneNumber: e.target.value }
                })}
                className="w-full px-3 py-2 border rounded-md"
                placeholder="+1234567890"
              />
            </div>
          </div>
        </div>

        {/* WhatsApp Settings */}
        <div className="bg-white p-4 sm:p-6 rounded-lg shadow">
          <h2 className="text-lg sm:text-xl font-bold mb-4">WhatsApp Configuration (Twilio)</h2>
          <div className="mb-4">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={settings.whatsapp.enabled}
                onChange={(e) => setSettings({
                  ...settings,
                  whatsapp: { ...settings.whatsapp, enabled: e.target.checked }
                })}
                className="mr-2"
              />
              Enable WhatsApp Notifications
            </label>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Account SID</label>
              <input
                type="text"
                value={settings.whatsapp.accountSid}
                onChange={(e) => setSettings({
                  ...settings,
                  whatsapp: { ...settings.whatsapp, accountSid: e.target.value }
                })}
                className="w-full px-3 py-2 border rounded-md"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Auth Token</label>
              <input
                type="password"
                value={settings.whatsapp.authToken}
                onChange={(e) => setSettings({
                  ...settings,
                  whatsapp: { ...settings.whatsapp, authToken: e.target.value }
                })}
                className="w-full px-3 py-2 border rounded-md"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">WhatsApp Number</label>
              <input
                type="text"
                value={settings.whatsapp.whatsappNumber}
                onChange={(e) => setSettings({
                  ...settings,
                  whatsapp: { ...settings.whatsapp, whatsappNumber: e.target.value }
                })}
                className="w-full px-3 py-2 border rounded-md"
                placeholder="whatsapp:+14155238886"
              />
            </div>
          </div>
        </div>

        <div className="flex justify-end">
          <button
            onClick={handleSave}
            className="w-full sm:w-auto bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700"
          >
            Save Settings
          </button>
        </div>
      </div>

      <div className="mt-4 sm:mt-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <p className="text-sm text-yellow-800">
          <strong>Note:</strong> For production, configure these settings in the backend .env file. 
          This UI is for reference only. Update backend/.env with your actual credentials.
        </p>
      </div>
    </div>
  );
};

export default Settings;
