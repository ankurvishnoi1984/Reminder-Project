import { useQuery } from "react-query";
import api from "../services/api";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";

const Dashboard = () => {
  const { data: stats, isLoading } = useQuery("dashboardStats", async () => {
    const response = await api.get("/dashboard/stats");
    return response.data;
  });

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gray-600">Loading dashboard...</div>
      </div>
    );
  }

  // ✅ REAL DATA (no fake override)
  const chartData = [
    { name: "Success", value: stats?.successCount ?? 0 },
    { name: "Failed", value: stats?.failureCount ?? 0 },
  ];

  const activityData = [
    { day: "Mon", messages: 12 },
    { day: "Tue", messages: 18 },
    { day: "Wed", messages: 10 },
    { day: "Thu", messages: 25 },
    { day: "Fri", messages: 16 },
    { day: "Sat", messages: 22 },
    { day: "Sun", messages: 14 },
  ];

  const recentEmployees = [
    { name: "John Doe", department: "HR", status: "Active" },
    { name: "Sarah Smith", department: "IT", status: "Active" },
    { name: "Mike Johnson", department: "Finance", status: "Inactive" },
    { name: "Priya Sharma", department: "Admin", status: "Active" },
  ];

  const COLORS = ["#10b981", "#ef4444"];

  const cardClass =
    "bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-md hover:shadow-xl border border-slate-200/60 transition-all duration-300";

  return (
    <div className="space-y-8  min-h-screen p-6">
      {/* ===== Header ===== */}
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Dashboard</h1>
       </div>

      {/* ===== Stats ===== */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
        {[
          { label: "Total Employees", value: stats?.totalEmployees ?? 0 },
          { label: "Today's Birthdays", value: stats?.todayBirthdays ?? 0 },
          { label: "Messages Today", value: stats?.messagesToday ?? 0 },
          { label: "This Month", value: stats?.messagesThisMonth ?? 0 },
        ].map((item, i) => (
          <div key={i} className={cardClass}>
            <div className="w-10 h-10 rounded-lg bg-indigo-50 flex items-center justify-center mb-3">
              <div className="w-5 h-5 bg-indigo-600 rounded-sm" />
            </div>

            <p className="text-sm text-slate-500">{item.label}</p>
            <p className="text-3xl font-bold text-slate-900 mt-2 tracking-tight">
              {item.value}
            </p>
          </div>
        ))}
      </div>

      {/* ===== Charts ===== */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Pie */}
        <div className={cardClass}>
          <h3 className="text-lg font-semibold mb-4 text-slate-800">
            Success vs Failure
          </h3>

          <div className="w-full h-72">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  outerRadius="70%"
                  dataKey="value"
                  label={({ percent }) =>
                    `${(percent * 100).toFixed(0)}%`
                  }
                >
                  {chartData.map((entry, index) => (
                    <Cell
                      key={index}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Line */}
        <div className={cardClass}>
          <h3 className="text-lg font-semibold mb-4 text-slate-800">
            Weekly Message Activity
          </h3>

          <div className="w-full h-72">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={activityData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="day" />
                <YAxis />
                <Tooltip />
                <Line
                  type="monotone"
                  dataKey="messages"
                  stroke="#3b82f6"
                  strokeWidth={3}
                  dot={{ r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* ===== Widgets Row ===== */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Quick Actions */}
        <div className={cardClass}>
          <h3 className="font-semibold text-slate-800 mb-4">
            Quick Actions
          </h3>

          <div className="flex flex-wrap gap-3">
            {[
              "Add Employee",
              "Send Message",
              "Upload Bulk",
              "Generate Report",
            ].map((action) => (
              <button
                key={action}
                className="px-4 py-2 rounded-lg bg-indigo-600 text-white text-sm hover:bg-indigo-700 transition shadow-sm"
              >
                {action}
              </button>
            ))}
          </div>
        </div>

        {/* System Health */}
        <div className={cardClass}>
          <h3 className="font-semibold text-slate-800 mb-4">
            System Health
          </h3>

          <div className="space-y-4">
            {[
              { label: "Email Service", value: 92 },
              { label: "SMS Gateway", value: 78 },
              { label: "Server Load", value: 64 },
            ].map((item) => (
              <div key={item.label}>
                <div className="flex justify-between text-sm mb-1">
                  <span>{item.label}</span>
                  <span>{item.value}%</span>
                </div>
                <div className="w-full bg-slate-200 rounded-full h-2">
                  <div
                    className="bg-indigo-600 h-2 rounded-full"
                    style={{ width: `${item.value}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ===== Activity ===== */}
      <div className={cardClass}>
        <h3 className="font-semibold text-slate-800 mb-4">
          Recent Activity
        </h3>

        <div className="space-y-3 text-sm">
          {[
            "Birthday message sent to John Doe",
            "New employee added",
            "Bulk upload completed",
            "Template updated",
          ].map((item, i) => (
            <div key={i} className="flex items-center gap-3">
              <div className="w-2 h-2 bg-indigo-600 rounded-full" />
              <span className="text-slate-600">{item}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ===== Table ===== */}
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-md border border-slate-200/60 overflow-hidden">
        <div className="p-6 border-b border-slate-200">
          <h3 className="text-lg font-semibold text-slate-800">
            Recent Employees
          </h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-slate-600">
              <tr>
                <th className="text-left px-6 py-3">Name</th>
                <th className="text-left px-6 py-3">Department</th>
                <th className="text-left px-6 py-3">Status</th>
              </tr>
            </thead>
            <tbody>
              {recentEmployees.map((emp, i) => (
                <tr
                  key={i}
                  className="border-t border-slate-200 hover:bg-slate-50 transition"
                >
                  <td className="px-6 py-4 font-medium text-slate-800">
                    {emp.name}
                  </td>
                  <td className="px-6 py-4 text-slate-600">
                    {emp.department}
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium ${
                        emp.status === "Active"
                          ? "bg-green-100 text-green-700"
                          : "bg-red-100 text-red-700"
                      }`}
                    >
                      {emp.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;