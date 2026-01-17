import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import api from '../services/api';
import { toast } from 'react-toastify';

const TemplateEditor = () => {
  const [showModal, setShowModal] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState(null);
  const [formData, setFormData] = useState({
    eventType: 'Birthday',
    channel: 'Email',
    subject: '',
    body: '',
    isActive: true
  });
  const queryClient = useQueryClient();

  const { data: templates, isLoading } = useQuery('templates', async () => {
    const response = await api.get('/templates');
    return response.data;
  });

  const createMutation = useMutation(
    (data) => api.post('/templates', data),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('templates');
        toast.success('Template created successfully');
        setShowModal(false);
        resetForm();
      },
      onError: (error) => {
        toast.error(error.response?.data?.message || 'Failed to create template');
      }
    }
  );

  const updateMutation = useMutation(
    ({ id, data }) => api.put(`/templates/${id}`, data),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('templates');
        toast.success('Template updated successfully');
        setShowModal(false);
        resetForm();
      },
      onError: (error) => {
        toast.error(error.response?.data?.message || 'Failed to update template');
      }
    }
  );

  const deleteMutation = useMutation(
    (id) => api.delete(`/templates/${id}`),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('templates');
        toast.success('Template deleted successfully');
      },
      onError: (error) => {
        toast.error(error.response?.data?.message || 'Failed to delete template');
      }
    }
  );

  const resetForm = () => {
    setFormData({
      eventType: 'Birthday',
      channel: 'Email',
      subject: '',
      body: '',
      isActive: true
    });
    setEditingTemplate(null);
  };

  const handleEdit = (template) => {
    setEditingTemplate(template);
    setFormData({
      eventType: template.eventType,
      channel: template.channel,
      subject: template.subject || '',
      body: template.body,
      isActive: template.isActive
    });
    setShowModal(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (editingTemplate) {
      updateMutation.mutate({ id: editingTemplate.id, data: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  if (isLoading) return <div className="text-center py-8">Loading...</div>;

  return (
    <div>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold">Template Editor</h1>
        <button
          onClick={() => {
            resetForm();
            setShowModal(true);
          }}
          className="w-full sm:w-auto bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
        >
          Add Template
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {templates?.map((template) => (
          <div key={template.id} className="bg-white p-4 rounded-lg shadow">
            <div className="flex justify-between items-start mb-2">
              <div>
                <h3 className="font-bold">{template.eventType}</h3>
                <p className="text-sm text-gray-600">{template.channel}</p>
              </div>
              <span className={`px-2 py-1 text-xs rounded ${template.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                {template.isActive ? 'Active' : 'Inactive'}
              </span>
            </div>
            {template.subject && <p className="text-sm font-medium mb-2">{template.subject}</p>}
            <p className="text-sm text-gray-600 mb-4 line-clamp-3">{template.body}</p>
            <div className="flex gap-2">
              <button
                onClick={() => handleEdit(template)}
                className="text-blue-600 hover:text-blue-900 text-sm"
              >
                Edit
              </button>
              <button
                onClick={() => {
                  if (window.confirm('Are you sure you want to delete this template?')) {
                    deleteMutation.mutate(template.id);
                  }
                }}
                className="text-red-600 hover:text-red-900 text-sm"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white p-4 sm:p-6 rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-4">
              {editingTemplate ? 'Edit Template' : 'Add Template'}
            </h2>
            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-1">Event Type</label>
                <select
                  value={formData.eventType}
                  onChange={(e) => setFormData({ ...formData, eventType: e.target.value })}
                  className="w-full px-3 py-2 border rounded-md"
                  required
                >
                  <option value="Birthday">Birthday</option>
                  <option value="JobAnniversary">Job Anniversary</option>
                  <option value="Festival">Festival</option>
                </select>
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-1">Channel</label>
                <select
                  value={formData.channel}
                  onChange={(e) => setFormData({ ...formData, channel: e.target.value })}
                  className="w-full px-3 py-2 border rounded-md"
                  required
                >
                  <option value="Email">Email</option>
                  <option value="WhatsApp">WhatsApp</option>
                  <option value="SMS">SMS</option>
                </select>
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-1">Subject (for Email)</label>
                <input
                  type="text"
                  value={formData.subject}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                  className="w-full px-3 py-2 border rounded-md"
                  placeholder="Available placeholders: {EmployeeName}"
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-1">Body</label>
                <textarea
                  value={formData.body}
                  onChange={(e) => setFormData({ ...formData, body: e.target.value })}
                  className="w-full px-3 py-2 border rounded-md"
                  rows="8"
                  required
                  placeholder="Available placeholders: {EmployeeName}, {YearsCompleted}, {FestivalName}"
                />
              </div>
              <div className="mb-4">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.isActive}
                    onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                    className="mr-2"
                  />
                  Active
                </label>
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
                  {editingTemplate ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default TemplateEditor;
