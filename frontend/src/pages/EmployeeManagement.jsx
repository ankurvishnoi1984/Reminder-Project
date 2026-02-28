import { useState,useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "react-query";
import api from "../services/api";
import { toast } from "react-toastify";

const EmployeeManagement = () => {
  const [showModal, setShowModal] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState(null);
  const [search, setSearch] = useState("");
  const [openMenuId, setOpenMenuId] = useState(null);
  const [formData, setFormData] = useState({
    employeeId: "",
    fullName: "",
    email: "",
    mobileNumber: "",
    whatsappNumber: "",
    dateOfBirth: "",
    dateOfJoining: "",
    department: "",
    status: "Active",
  });

  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery(["employees"], async () => {
    const response = await api.get(`/employees?page=1&limit=10`);
    return response.data;
  });

  const createMutation = useMutation((data) => api.post("/employees", data), {
    onSuccess: () => {
      queryClient.invalidateQueries("employees");
      toast.success("Employee created successfully");
      setShowModal(false);
      resetForm();
    },
  });

  const updateMutation = useMutation(
    ({ id, data }) => api.put(`/employees/${id}`, data),
    {
      onSuccess: () => {
        queryClient.invalidateQueries("employees");
        toast.success("Employee updated successfully");
        setShowModal(false);
        resetForm();
      },
    }
  );

  const deleteMutation = useMutation((id) => api.delete(`/employees/${id}`), {
    onSuccess: () => {
      queryClient.invalidateQueries("employees");
      toast.success("Employee deleted successfully");
    },
  });

  const resetForm = () => {
    setFormData({
      employeeId: "",
      fullName: "",
      email: "",
      mobileNumber: "",
      whatsappNumber: "",
      dateOfBirth: "",
      dateOfJoining: "",
      department: "",
      status: "Active",
    });
    setEditingEmployee(null);
  };

  const handleEdit = (employee) => {
    setEditingEmployee(employee);
    setFormData({ ...employee });
    setShowModal(true);
  };
useEffect(() => {
  const handleClickOutside = () => setOpenMenuId(null);

  document.addEventListener("click", handleClickOutside);

  return () => {
    document.removeEventListener("click", handleClickOutside);
  };
}, []);
  const handleSubmit = (e) => {
    e.preventDefault();
    if (editingEmployee) {
      updateMutation.mutate({ id: editingEmployee.id, data: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  const handleDelete = (id) => {
    if (window.confirm("Delete this employee?")) {
      deleteMutation.mutate(id);
    }
  };

  const filteredEmployees =
    data?.employees?.filter(
      (e) =>
        e.fullName.toLowerCase().includes(search.toLowerCase()) ||
        e.email.toLowerCase().includes(search.toLowerCase())
    ) || [];

  if (isLoading)
    return <div className="text-center py-10">Loading...</div>;

  return (
    <div className="space-y-6">
      {/* ===== Header ===== */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <h1 className="text-3xl font-bold text-slate-900">
          Employee Management
        </h1>

        <div className="flex gap-3 flex-col sm:flex-row">
          <input
            placeholder="Search employee..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="px-4 py-2 rounded-xl border border-slate-200 bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />

          <button
            onClick={() => {
              resetForm();
              setShowModal(true);
            }}
            className="bg-gradient-to-b from-[#2c498d] to-[#0b1735] text-white px-5 py-2 rounded-xl shadow hover:shadow-lg transition"
          >
            + Add Employee
          </button>
        </div>
      </div>

      {/* ===== Table Card ===== */}
     <div className="bg-white rounded-2xl shadow-lg border border-slate-200 overflow-hidden">
     <table className="w-full text-sm">
        <thead className="bg-gradient-to-b from-[#2c498d] to-[#0b1735] text-white">
  <tr>
    <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider">
      ID
    </th>
    <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider">
      Name
    </th>
    <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider hidden md:table-cell">
      Email
    </th>
    <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider">
      Department
    </th>
    <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider">
      Status
    </th>
    <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider">
      Actions
    </th>
  </tr>
</thead>

          <tbody>
         {filteredEmployees.map((employee, index) => (
             <tr
  key={employee.id}
  className={`
    border-t border-slate-100
    hover:bg-indigo-50/40
    transition-colors
    ${index % 2 === 0 ? "bg-white" : "bg-slate-50/40"}
  `}
>
                <td className="px-6 py-4">{employee.employeeId}</td>
                <td className="px-6 py-4 font-medium text-slate-900">
                  {employee.fullName}
                </td>
                <td className="px-6 py-4 hidden md:table-cell">
                  {employee.email}
                </td>
                <td className="px-6 py-4">{employee.department}</td>
                <td className="px-6 py-4">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      employee.status === "Active"
                        ? "bg-emerald-100 text-emerald-700"
                        : "bg-rose-100 text-rose-700"
                    }`}
                  >
                    {employee.status}
                  </span>
                </td>
     <td className="px-6 py-4">
  <div className="relative inline-block">
    
    {/* Three dots button */}
    <button
      onClick={(e) => {
        e.stopPropagation();
        setOpenMenuId(openMenuId === employee.id ? null : employee.id);
      }}
      className="p-2 rounded-lg hover:bg-slate-100 transition"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className="h-5 w-5 text-slate-600"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={2}
      >
        <circle cx="12" cy="5" r="1.5" />
        <circle cx="12" cy="12" r="1.5" />
        <circle cx="12" cy="19" r="1.5" />
      </svg>
    </button>

    {/* Dropdown */}
    {openMenuId === employee.id && (
      <div
        onClick={(e) => e.stopPropagation()}
        className="absolute right-0 mt-2 w-36 rounded-xl bg-white shadow-xl border border-slate-200 py-1 z-30"
      >
        <button
          onClick={() => {
            handleEdit(employee);
            setOpenMenuId(null);
          }}
          className="w-full text-left px-4 py-2 text-sm hover:bg-slate-50 text-indigo-600 font-medium"
        >
          Edit
        </button>

        <button
          onClick={() => {
            handleDelete(employee.id);
            setOpenMenuId(null);
          }}
          className="w-full text-left px-4 py-2 text-sm hover:bg-rose-50 text-rose-600 font-medium"
        >
          Delete
        </button>
      </div>
    )}
  </div>
</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* ===== Modal ===== */}
 {showModal && (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
    <div className="w-full max-w-2xl rounded-2xl bg-white shadow-2xl overflow-hidden">
      
      {/* Header */}
      <div className="relative px-6 py-4 border-b bg-gradient-to-r from-[#0b1735] to-[#1b3e97]">
        <h2 className="text-lg font-semibold text-white">
          {editingEmployee ? "Edit Employee" : "Add Employee"}
        </h2>

        {/* Close button */}
        <button
          onClick={() => {
            setShowModal(false);
            resetForm();
          }}
          className="absolute right-4 top-4 text-white/90 hover:text-white text-xl"
          aria-label="Close"
        >
          ✕
        </button>
      </div>

      {/* Form */}
      <form
        onSubmit={handleSubmit}
        className="p-6 space-y-5 max-h-[75vh] overflow-y-auto"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

          {/* Employee ID */}
          <div>
            <label className="block text-sm font-medium mb-1">
              Employee ID
            </label>
            <input
              type="text"
              value={formData.employeeId}
              onChange={(e) =>
                setFormData({ ...formData, employeeId: e.target.value })
              }
              className="w-full px-4 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-indigo-500 outline-none"
              required
            />
          </div>

          {/* Full Name */}
          <div>
            <label className="block text-sm font-medium mb-1">
              Full Name
            </label>
            <input
              type="text"
              value={formData.fullName}
              onChange={(e) =>
                setFormData({ ...formData, fullName: e.target.value })
              }
              className="w-full px-4 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-indigo-500 outline-none"
              required
            />
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-medium mb-1">Email</label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) =>
                setFormData({ ...formData, email: e.target.value })
              }
              className="w-full px-4 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-indigo-500 outline-none"
              required
            />
          </div>

          {/* Mobile */}
          <div>
            <label className="block text-sm font-medium mb-1">
              Mobile Number
            </label>
            <input
              type="text"
              value={formData.mobileNumber}
              onChange={(e) =>
                setFormData({ ...formData, mobileNumber: e.target.value })
              }
              className="w-full px-4 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-indigo-500 outline-none"
              required
            />
          </div>

          {/* WhatsApp */}
          <div>
            <label className="block text-sm font-medium mb-1">
              WhatsApp Number
            </label>
            <input
              type="text"
              value={formData.whatsappNumber}
              onChange={(e) =>
                setFormData({ ...formData, whatsappNumber: e.target.value })
              }
              className="w-full px-4 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-indigo-500 outline-none"
            />
          </div>

          {/* Department */}
          <div>
            <label className="block text-sm font-medium mb-1">
              Department
            </label>
            <input
              type="text"
              value={formData.department}
              onChange={(e) =>
                setFormData({ ...formData, department: e.target.value })
              }
              className="w-full px-4 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-indigo-500 outline-none"
              required
            />
          </div>

          {/* DOB */}
          <div>
            <label className="block text-sm font-medium mb-1">
              Date of Birth
            </label>
            <input
              type="date"
              value={formData.dateOfBirth}
              onChange={(e) =>
                setFormData({ ...formData, dateOfBirth: e.target.value })
              }
              className="w-full px-4 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-indigo-500 outline-none"
              required
            />
          </div>

          {/* DOJ */}
          <div>
            <label className="block text-sm font-medium mb-1">
              Date of Joining
            </label>
            <input
              type="date"
              value={formData.dateOfJoining}
              onChange={(e) =>
                setFormData({ ...formData, dateOfJoining: e.target.value })
              }
              className="w-full px-4 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-indigo-500 outline-none"
              required
            />
          </div>

          {/* Status (full width) */}
          <div className="md:col-span-2">
            <label className="block text-sm font-medium mb-1">Status</label>
            <select
              value={formData.status}
              onChange={(e) =>
                setFormData({ ...formData, status: e.target.value })
              }
              className="w-full px-4 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-indigo-500 outline-none"
            >
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
            </select>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end pt-2">
          <button
            type="submit"
            className="px-6 py-2 rounded-xl text-white font-medium
            bg-gradient-to-b from-[#0b1735] to-[#1b3e97]
              hover:from-indigo-700 hover:to-blue-700
              shadow-md hover:shadow-lg transition"
          >
            {editingEmployee ? "Update Employee" : "Create Employee"}
          </button>
        </div>
      </form>
    </div>
  </div>
)}
    </div>
  );
};

export default EmployeeManagement;