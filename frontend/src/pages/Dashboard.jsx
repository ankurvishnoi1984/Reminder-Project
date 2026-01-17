import { useQuery } from 'react-query';
import api from '../services/api';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const Dashboard = () => {
  const { data: stats, isLoading } = useQuery('dashboardStats', async () => {
    const response = await api.get('/dashboard/stats');
    return response.data;
  });

  if (isLoading) return <div className="text-center py-8">Loading...</div>;

  const chartData = [
    { name: 'Success', value: stats?.successCount || 0 },
    { name: 'Failed', value: stats?.failureCount || 0 }
  ];

  const COLORS = ['#10b981', '#ef4444'];

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-gray-600">Total Employees</h3>
          <p className="text-3xl font-bold">{stats?.totalEmployees || 0}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-gray-600">Today's Birthdays</h3>
          <p className="text-3xl font-bold">{stats?.todayBirthdays || 0}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-gray-600">Messages Today</h3>
          <p className="text-3xl font-bold">{stats?.messagesToday || 0}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-gray-600">This Month</h3>
          <p className="text-3xl font-bold">{stats?.messagesThisMonth || 0}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-xl font-bold mb-4">Success vs Failure</h3>
          <div className="w-full h-72">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius="70%"
                  fill="#8884d8"
                  dataKey="value"
                >
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
