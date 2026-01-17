import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import api from '../services/api';
import { toast } from 'react-toastify';

const EmployeeManagement = () => {
  const [showModal, setShowModal] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState(null);
  const [formData, setFormData] = useState({
    employeeId: '',
    fullName: '',
    email: '',
    mobileNumber: '',
    whatsappNumber: '',
    dateOfBirth: '',
    dateOfJoining: '',
    department: '',
    status: 'Active'
  });
  const [page, setPage] = useState(1);
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery(['employees', page], async () => {
    const response = await api.get(`/employees?page=${page}&limit=10`);
    return response.data;
  });

  const createMutation = useMutation(
    (data) => api.post('/employees', data),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('employees');
        toast.success('Employee created successfully');
        setShowModal(false);
        resetForm();
      },
      onError: (error) => {
        toast.error(error.response?.data?.message || 'Failed to create employee');
      }
    }
  );

  const updateMutation = useMutation(
    ({ id, data }) => api.put(`/employees/${id}`, data),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('employees');
        toast.success('Employee updated successfully');
        setShowModal(false);
        resetForm();
      },
      onError: (error) => {
        toast.error(error.response?.data?.message || 'Failed to update employee');
      }
    }
  );

  const deleteMutation = useMutation(
    (id) => api.delete(`/employees/${id}`),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('employees');
        toast.success('Employee deleted successfully');
      },
      onError: (error) => {
        toast.error(error.response?.data?.message || 'Failed to delete employee');
      }
    }
  );

  const resetForm = () => {
    setFormData({
      employeeId: '',
      fullName: '',
      email: '',
      mobileNumber: '',
      whatsappNumber: '',
      dateOfBirth: '',
      dateOfJoining: '',
      department: '',
      status: 'Active'
    });
    setEditingEmployee(null);
  };

  const handleEdit = (employee) => {
    setEditingEmployee(employee);
    setFormData({
      employeeId: employee.employeeId,
      fullName: employee.fullName,
      email: employee.email,
      mobileNumber: employee.mobileNumber,
      whatsappNumber: employee.whatsappNumber || '',
      dateOfBirth: employee.dateOfBirth,
      dateOfJoining: employee.dateOfJoining,
      department: employee.department,
      status: employee.status
    });
    setShowModal(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (editingEmployee) {
      updateMutation.mutate({ id: editingEmployee.id, data: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this employee?')) {
      deleteMutation.mutate(id);
    }
  };

  if (isLoading) return <div className="text-center py-8">Loading...</div>;

  return (
    <div>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold">Employee Management</h1>
        <button
          onClick={() => {
            resetForm();
            setShowModal(true);
          }}
          className="w-full sm:w-auto bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
        >
          Add Employee
        </button>
      </div>

      <div className="bg-white rounded-lg shadow overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">ID</th>
              <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
              <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase hidden sm:table-cell">Email</th>
              <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Department</th>
              <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {data?.employees?.map((employee) => (
              <tr key={employee.id}>
                <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-sm">{employee.employeeId}</td>
                <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-sm font-medium">{employee.fullName}</td>
                <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-sm hidden sm:table-cell">{employee.email}</td>
                <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-sm">{employee.department}</td>
                <td className="px-3 sm:px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 py-1 text-xs rounded ${employee.status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                    {employee.status}
                  </span>
                </td>
                <td className="px-3 sm:px-6 py-4 whitespace-nowrap">
                  <div className="flex flex-col sm:flex-row gap-2">
                    <button
                      onClick={() => handleEdit(employee)}
                      className="text-blue-600 hover:text-blue-900 text-sm"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(employee.id)}
                      className="text-red-600 hover:text-red-900 text-sm"
                    >
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white p-4 sm:p-6 rounded-lg w-full max-w-md max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-4">
              {editingEmployee ? 'Edit Employee' : 'Add Employee'}
            </h2>
            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-1">Employee ID</label>
                <input
                  type="text"
                  value={formData.employeeId}
                  onChange={(e) => setFormData({ ...formData, employeeId: e.target.value })}
                  className="w-full px-3 py-2 border rounded-md"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-1">Full Name</label>
                <input
                  type="text"
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  className="w-full px-3 py-2 border rounded-md"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-1">Email</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-3 py-2 border rounded-md"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-1">Mobile Number</label>
                <input
                  type="text"
                  value={formData.mobileNumber}
                  onChange={(e) => setFormData({ ...formData, mobileNumber: e.target.value })}
                  className="w-full px-3 py-2 border rounded-md"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-1">WhatsApp Number</label>
                <input
                  type="text"
                  value={formData.whatsappNumber}
                  onChange={(e) => setFormData({ ...formData, whatsappNumber: e.target.value })}
                  className="w-full px-3 py-2 border rounded-md"
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-1">Date of Birth</label>
                <input
                  type="date"
                  value={formData.dateOfBirth}
                  onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
                  className="w-full px-3 py-2 border rounded-md"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-1">Date of Joining</label>
                <input
                  type="date"
                  value={formData.dateOfJoining}
                  onChange={(e) => setFormData({ ...formData, dateOfJoining: e.target.value })}
                  className="w-full px-3 py-2 border rounded-md"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-1">Department</label>
                <input
                  type="text"
                  value={formData.department}
                  onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                  className="w-full px-3 py-2 border rounded-md"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-1">Status</label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  className="w-full px-3 py-2 border rounded-md"
                >
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                </select>
              </div>
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    resetForm();
                  }}
                  className="px-4 py-2 border rounded-md"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  {editingEmployee ? 'Update' : 'Create'}
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
