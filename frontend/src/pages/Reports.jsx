import { useEffect, useState } from 'react';
import { useQuery } from 'react-query';
import api from '../services/api';
import { format } from 'date-fns';

const Reports = () => {
  const [filters, setFilters] = useState({
    startDate: '',
    endDate: '',
    eventType: '',
    channel: '',
    status: ''
  });

  const { data: reports, isLoading, refetch } = useQuery(
    ['reports', filters],
    async () => {
      const params = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value) params.append(key, value);
      });
      const response = await api.get(`/reports?${params.toString()}`);
      return response.data;
    },
    { enabled: false }
  );

  const handleFilterChange = (key, value) => {
    setFilters({ ...filters, [key]: value });
  };

  const handleSearch = () => {
    refetch();
  };
  useEffect(()=>{
    refetch();
  },[filters])

  const handleExport = async () => {
    try {
      const params = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value) params.append(key, value);
      });
      const response = await api.get(`/reports/export?${params.toString()}`, {
        responseType: 'blob'
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'reports.csv');
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error('Export failed:', error);
    }
  };

return (
  <div className="space-y-6">
    {/* ===== Header ===== */}
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <h1 className="text-3xl font-bold text-slate-900">Reports</h1>

      <button
        onClick={handleExport}
        className="
          bg-gradient-to-r from-emerald-600 to-emerald-500
          text-white px-5 py-2.5 rounded-xl
          shadow-md hover:shadow-lg
          hover:from-emerald-700 hover:to-emerald-600
          transition-all
        "
      >
        Export CSV
      </button>
    </div>

    {/* ================= FILTER CARD ================= */}
    <div className="bg-white rounded-2xl shadow-lg border border-slate-200 overflow-hidden">
      {/* card header */}
      <div className="px-6 py-4 bg-gradient-to-r from-[#0b1735] to-[#1b3e97]">
        <h2 className="text-white font-semibold tracking-wide">
          Filters
        </h2>
      </div>

      {/* card body */}
      <div className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {/* Start Date */}
          <div>
            <label className="label-modern">Start Date</label>
            <input
              type="date"
              value={filters.startDate}
              onChange={(e) =>
                handleFilterChange("startDate", e.target.value)
              }
              className="input-modern"
            />
          </div>

          {/* End Date */}
          <div>
            <label className="label-modern">End Date</label>
            <input
              type="date"
              value={filters.endDate}
              onChange={(e) =>
                handleFilterChange("endDate", e.target.value)
              }
              className="input-modern"
            />
          </div>

          {/* Event Type */}
          <div>
            <label className="label-modern">Event Type</label>
            <select
              value={filters.eventType}
              onChange={(e) =>
                handleFilterChange("eventType", e.target.value)
              }
              className="input-modern"
            >
              <option value="">All</option>
              <option value="Birthday">Birthday</option>
              <option value="JobAnniversary">Job Anniversary</option>
              <option value="Festival">Festival</option>
            </select>
          </div>

          {/* Channel */}
          <div>
            <label className="label-modern">Channel</label>
            <select
              value={filters.channel}
              onChange={(e) =>
                handleFilterChange("channel", e.target.value)
              }
              className="input-modern"
            >
              <option value="">All</option>
              <option value="Email">Email</option>
              <option value="WhatsApp">WhatsApp</option>
              <option value="SMS">SMS</option>
            </select>
          </div>

          {/* Status */}
          <div>
            <label className="label-modern">Status</label>
            <select
              value={filters.status}
              onChange={(e) =>
                handleFilterChange("status", e.target.value)
              }
              className="input-modern"
            >
              <option value="">All</option>
              <option value="Success">Success</option>
              <option value="Failed">Failed</option>
              <option value="Pending">Pending</option>
            </select>
          </div>
        </div>
      </div>
    </div>

    {/* ================= TABLE ================= */}
    <div className="bg-white rounded-2xl shadow-lg border border-slate-200 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gradient-to-b from-[#2c498d] to-[#0b1735] text-white border-b border-slate-200">
            <tr className=" uppercase text-xs tracking-wider">
              <th className="px-6 py-3 text-left">Employee</th>
              <th className="px-6 py-3 text-left">Event Type</th>
              <th className="px-6 py-3 text-left hidden sm:table-cell">
                Channel
              </th>
              <th className="px-6 py-3 text-left">Status</th>
              <th className="px-6 py-3 text-left hidden md:table-cell">
                Sent At
              </th>
              <th className="px-6 py-3 text-left hidden lg:table-cell">
                Response
              </th>
            </tr>
          </thead>

          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan="6" className="py-10 text-center text-slate-500">
                  Loading...
                </td>
              </tr>
            ) : reports?.reports?.length > 0 ? (
              reports.reports.map((report, index) => (
                <tr
                  key={report.id}
                  className={`
                    border-t border-slate-100
                    hover:bg-indigo-50/40
                    transition
                    ${index % 2 === 0 ? "bg-white" : "bg-slate-50/40"}
                  `}
                >
                  <td className="px-6 py-4 font-medium text-slate-900">
                    {report.employee?.fullName || "N/A"}
                  </td>

                  <td className="px-6 py-4">{report.eventType}</td>

                  <td className="px-6 py-4 hidden sm:table-cell">
                    {report.channel}
                  </td>

                  <td className="px-6 py-4">
                    <span
                      className={`status-pill ${
                        report.status === "Success"
                          ? "status-success"
                          : report.status === "Failed"
                          ? "status-failed"
                          : "status-pending"
                      }`}
                    >
                      {report.status}
                    </span>
                  </td>

                  <td className="px-6 py-4 hidden md:table-cell">
                    {report.sentAt
                      ? format(
                          new Date(report.sentAt),
                          "yyyy-MM-dd HH:mm"
                        )
                      : "N/A"}
                  </td>

                  <td className="px-6 py-4 text-slate-600 hidden lg:table-cell truncate max-w-xs">
                    {report.responseMessage || "N/A"}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="6" className="py-12 text-center text-slate-500">
                  No reports found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  </div>
);
};

export default Reports;
