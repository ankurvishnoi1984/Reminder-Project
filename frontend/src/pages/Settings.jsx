import { useState } from "react";

const Settings = () => {
  const [settings, setSettings] = useState({
    email: {
      enabled: true,
      smtpHost: "",
      smtpPort: "",
      smtpUser: "",
      smtpPass: "",
    },
    sms: {
      enabled: false,
      accountSid: "",
      authToken: "",
      phoneNumber: "",
    },
    whatsapp: {
      enabled: false,
      accountSid: "",
      authToken: "",
      whatsappNumber: "",
    },
  });

  const handleSave = () => {
    alert(
      "Settings saved! (Note: Configure in backend .env for production)"
    );
  };

  const SectionCard = ({ title, enabled, onToggle, children }) => (
    <div className="bg-white rounded-2xl shadow-lg border border-slate-200 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 bg-gradient-to-r from-[#0b1735] to-[#1b3e97]">
        <h2 className="text-white font-semibold tracking-wide">
          {title}
        </h2>

        {/* Toggle */}
        <label className="relative inline-flex cursor-pointer items-center">
          <input
            type="checkbox"
            checked={enabled}
            onChange={onToggle}
            className="sr-only peer"
          />
          <div className="h-6 w-11 rounded-full bg-white/30 peer-checked:bg-emerald-400 transition"></div>
          <div className="absolute left-1 top-1 h-4 w-4 rounded-full bg-white transition peer-checked:translate-x-5"></div>
        </label>
      </div>

      {/* Body */}
      <div className="p-6">{children}</div>
    </div>
  );

  const Input = (props) => (
    <input
      {...props}
      className="w-full px-4 py-2.5 rounded-xl border border-slate-300 bg-white
      focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500
      outline-none transition"
    />
  );

  return (
    <div className="space-y-6">
      {/* ===== Page Header ===== */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <h1 className="text-3xl font-bold text-slate-900">
          Settings
        </h1>

        <button
          onClick={handleSave}
          className="
            bg-gradient-to-r from-[#0b1735] to-[#1b3e97]
            text-white px-6 py-2.5 rounded-xl
            shadow-lg hover:shadow-xl
            hover:from-indigo-700 hover:to-blue-700
            transition-all
          "
        >
          Save Settings
        </button>
      </div>

      {/* ================= EMAIL ================= */}
      <SectionCard
        title="Email Configuration"
        enabled={settings.email.enabled}
        onToggle={(e) =>
          setSettings({
            ...settings,
            email: { ...settings.email, enabled: e.target.checked },
          })
        }
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div>
            <label className="label-modern">SMTP Host</label>
            <Input
              placeholder="smtp.gmail.com"
              value={settings.email.smtpHost}
              onChange={(e) =>
                setSettings({
                  ...settings,
                  email: {
                    ...settings.email,
                    smtpHost: e.target.value,
                  },
                })
              }
            />
          </div>

          <div>
            <label className="label-modern">SMTP Port</label>
            <Input
              type="number"
              placeholder="587"
              value={settings.email.smtpPort}
              onChange={(e) =>
                setSettings({
                  ...settings,
                  email: {
                    ...settings.email,
                    smtpPort: e.target.value,
                  },
                })
              }
            />
          </div>

          <div>
            <label className="label-modern">SMTP User</label>
            <Input
              placeholder="your_email@gmail.com"
              value={settings.email.smtpUser}
              onChange={(e) =>
                setSettings({
                  ...settings,
                  email: {
                    ...settings.email,
                    smtpUser: e.target.value,
                  },
                })
              }
            />
          </div>

          <div>
            <label className="label-modern">SMTP Password</label>
            <Input
              type="password"
              placeholder="App Password"
              value={settings.email.smtpPass}
              onChange={(e) =>
                setSettings({
                  ...settings,
                  email: {
                    ...settings.email,
                    smtpPass: e.target.value,
                  },
                })
              }
            />
          </div>
        </div>
      </SectionCard>

      {/* ================= SMS ================= */}
      <SectionCard
        title="SMS Configuration (Twilio)"
        enabled={settings.sms.enabled}
        onToggle={(e) =>
          setSettings({
            ...settings,
            sms: { ...settings.sms, enabled: e.target.checked },
          })
        }
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div>
            <label className="label-modern">Account SID</label>
            <Input
              value={settings.sms.accountSid}
              onChange={(e) =>
                setSettings({
                  ...settings,
                  sms: {
                    ...settings.sms,
                    accountSid: e.target.value,
                  },
                })
              }
            />
          </div>

          <div>
            <label className="label-modern">Auth Token</label>
            <Input
              type="password"
              value={settings.sms.authToken}
              onChange={(e) =>
                setSettings({
                  ...settings,
                  sms: {
                    ...settings.sms,
                    authToken: e.target.value,
                  },
                })
              }
            />
          </div>

          <div className="md:col-span-2">
            <label className="label-modern">Phone Number</label>
            <Input
              placeholder="+1234567890"
              value={settings.sms.phoneNumber}
              onChange={(e) =>
                setSettings({
                  ...settings,
                  sms: {
                    ...settings.sms,
                    phoneNumber: e.target.value,
                  },
                })
              }
            />
          </div>
        </div>
      </SectionCard>

      {/* ================= WHATSAPP ================= */}
      <SectionCard
        title="WhatsApp Configuration (Twilio)"
        enabled={settings.whatsapp.enabled}
        onToggle={(e) =>
          setSettings({
            ...settings,
            whatsapp: {
              ...settings.whatsapp,
              enabled: e.target.checked,
            },
          })
        }
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div>
            <label className="label-modern">Account SID</label>
            <Input
              value={settings.whatsapp.accountSid}
              onChange={(e) =>
                setSettings({
                  ...settings,
                  whatsapp: {
                    ...settings.whatsapp,
                    accountSid: e.target.value,
                  },
                })
              }
            />
          </div>

          <div>
            <label className="label-modern">Auth Token</label>
            <Input
              type="password"
              value={settings.whatsapp.authToken}
              onChange={(e) =>
                setSettings({
                  ...settings,
                  whatsapp: {
                    ...settings.whatsapp,
                    authToken: e.target.value,
                  },
                })
              }
            />
          </div>

          <div className="md:col-span-2">
            <label className="label-modern">WhatsApp Number</label>
            <Input
              placeholder="whatsapp:+14155238886"
              value={settings.whatsapp.whatsappNumber}
              onChange={(e) =>
                setSettings({
                  ...settings,
                  whatsapp: {
                    ...settings.whatsapp,
                    whatsappNumber: e.target.value,
                  },
                })
              }
            />
          </div>
        </div>
      </SectionCard>

      {/* ===== Note ===== */}
      <div className="rounded-xl border border-amber-200 bg-amber-50 p-4">
        <p className="text-sm text-amber-800">
          <strong>Note:</strong> For production, configure these in
          backend <code>.env</code>.
        </p>
      </div>
    </div>
  );
};

export default Settings;