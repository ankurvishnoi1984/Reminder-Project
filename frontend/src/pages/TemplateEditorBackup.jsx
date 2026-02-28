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
  const [attachments, setAttachments] = useState([]);
  const [existingAttachments, setExistingAttachments] = useState([]);
  const queryClient = useQueryClient();

  const { data: templates, isLoading } = useQuery('templates', async () => {
    const response = await api.get('/templates');
    return response.data;
  });

  const createMutation = useMutation(
    (data) => api.post('/templates', data, {
      headers: { "Content-Type": "multipart/form-data" },
    }),
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
    ({ id, data }) => api.put(`/templates/${id}`, data, {
      headers: { "Content-Type": "multipart/form-data" },
    }),
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

  /* const resetForm = () => {
     setFormData({
       eventType: 'Birthday',
       channel: 'Email',
       subject: '',
       body: '',
       isActive: true
     });
     setEditingTemplate(null);
   };*/

  const resetForm = () => {
    setFormData({
      eventType: 'Birthday',
      channel: 'Email',
      subject: '',
      body: '',
      isActive: true
    });
    setAttachments([]);
    setExistingAttachments([]);
    setEditingTemplate(null);
  };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);

    // basic validation
    const allowedTypes = [
      "application/pdf",
      "image/png",
      "image/jpeg",
      "image/jpg",
    ];

    const validFiles = files.filter((file) =>
      allowedTypes.includes(file.type)
    );

    if (validFiles.length !== files.length) {
      toast.error("Only PDF and Image files are allowed");
    }

    setAttachments((prev) => [...prev, ...validFiles]);
  };

  const removeAttachment = (index) => {
    setAttachments((prev) => prev.filter((_, i) => i !== index));
  };

  /*const handleEdit = (template) => {
    setEditingTemplate(template);
    setFormData({
      eventType: template.eventType,
      channel: template.channel,
      subject: template.subject || '',
      body: template.body,
      isActive: template.isActive
    });
    setShowModal(true);
  };*/

  const handleEdit = (template) => {
    setEditingTemplate(template);
    setExistingAttachments(template.attachments || []);
    setAttachments([]);

    setFormData({
      eventType: template.eventType,
      channel: template.channel,
      subject: template.subject || '',
      body: template.body,
      isActive: template.isActive
    });

    setShowModal(true);
  };

  /*const handleSubmit = (e) => {
    e.preventDefault();
    if (editingTemplate) {
      updateMutation.mutate({ id: editingTemplate.id, data: formData });
    } else {
      createMutation.mutate(formData);
    }
  };*/

  const handleSubmit = (e) => {
    e.preventDefault();

    const formDataToSend = new FormData();

    // append template fields
    Object.keys(formData).forEach((key) => {
      formDataToSend.append(key, formData[key]);
    });

    // append files
    attachments.forEach((file) => {
      formDataToSend.append("attachments", file);
    });

    if (editingTemplate) {
      updateMutation.mutate({
        id: editingTemplate.id,
        data: formDataToSend,
      });
    } else {
      createMutation.mutate(formDataToSend);
    }
  };

  if (isLoading) return <div className="text-center py-8">Loading...</div>;

  return (
    <div>
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
  <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">
    Template Editor
  </h1>

  <button
    onClick={() => {
      resetForm();
      setShowModal(true);
    }}
    className="
      w-full sm:w-auto
      px-5 py-2.5
      rounded-xl
      text-white font-medium
      bg-gradient-to-r from-[#1b3e97] to-[#0b1735]
      hover:from-indigo-700 hover:to-blue-700
      shadow-md hover:shadow-lg
      transition-all duration-200
    "
  >
    + Add Template
  </button>
</div>

     <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
  {templates?.map((template) => (
    <div
      key={template.id}
      className="group bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 overflow-hidden"
    >
      {/* Top Accent Bar */}
      <div className="h-1 bg-gradient-to-r from-indigo-600 to-blue-600" />

      <div className="p-5">
        {/* Header */}
        <div className="flex justify-between items-start mb-3">
          <div>
            <h3 className="font-semibold text-slate-900 text-base">
              {template.eventType}
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              {template.channel}
            </p>
          </div>

          {/* Status Badge */}
          <span
            className={`px-2.5 py-1 text-xs font-medium rounded-full ${
              template.isActive
                ? "bg-emerald-100 text-emerald-700"
                : "bg-slate-200 text-slate-600"
            }`}
          >
            {template.isActive ? "Active" : "Inactive"}
          </span>
        </div>

        {/* Subject */}
        {template.subject && (
          <p className="text-sm font-semibold text-slate-800 mb-2">
            {template.subject}
          </p>
        )}

        {/* Body Preview */}
        <p className="text-sm text-slate-600 mb-5 line-clamp-3 leading-relaxed">
          {template.body}
        </p>

        {/* Actions */}
        <div className="flex items-center justify-between pt-3 border-t border-slate-100">
          <button
            onClick={() => handleEdit(template)}
            className="text-sm font-medium text-indigo-600 hover:text-indigo-800 transition"
          >
            Edit
          </button>

          <button
            onClick={() => {
              if (
                window.confirm(
                  "Are you sure you want to delete this template?"
                )
              ) {
                deleteMutation.mutate(template.id);
              }
            }}
            className="text-sm font-medium text-rose-600 hover:text-rose-800 transition"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  ))}
</div>

   {showModal && (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
    
    {/* Modal */}
    <div className="w-full max-w-3xl bg-white rounded-2xl shadow-2xl overflow-hidden">

      {/* Header */}
      <div className="relative px-6 py-4 bg-gradient-to-r from-[#0b1735] to-[#1b3e97]">
        <h2 className="text-lg font-semibold text-white">
          {editingTemplate ? "Edit Template" : "Add Template"}
        </h2>

        <button
          onClick={() => {
            setShowModal(false);
            resetForm();
          }}
          className="absolute right-4 top-4 text-white/80 hover:text-white text-xl"
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

          {/* Event Type */}
          <div>
            <label className="block text-sm font-medium mb-1">
              Event Type
            </label>
            <select
              value={formData.eventType}
              onChange={(e) =>
                setFormData({ ...formData, eventType: e.target.value })
              }
              className="input-modern"
              required
            >
              <option value="Birthday">Birthday</option>
              <option value="JobAnniversary">Job Anniversary</option>
              <option value="Festival">Festival</option>
            </select>
          </div>

          {/* Channel */}
          <div>
            <label className="block text-sm font-medium mb-1">
              Channel
            </label>
            <select
              value={formData.channel}
              onChange={(e) =>
                setFormData({ ...formData, channel: e.target.value })
              }
              className="input-modern"
              required
            >
              <option value="Email">Email</option>
              <option value="WhatsApp">WhatsApp</option>
              <option value="SMS">SMS</option>
            </select>
          </div>

          {/* Subject */}
          <div className="md:col-span-2">
            <label className="block text-sm font-medium mb-1">
              Subject (for Email)
            </label>
            <input
              type="text"
              value={formData.subject}
              onChange={(e) =>
                setFormData({ ...formData, subject: e.target.value })
              }
              placeholder="Available placeholders: {EmployeeName}"
              className="input-modern"
            />
          </div>

          {/* Body */}
          <div className="md:col-span-2">
            <label className="block text-sm font-medium mb-1">
              Body
            </label>
            <textarea
              rows={6}
              value={formData.body}
              onChange={(e) =>
                setFormData({ ...formData, body: e.target.value })
              }
              placeholder="Available placeholders: {EmployeeName}, {YearsCompleted}, {FestivalName}"
              className="input-modern resize-none"
              required
            />
          </div>

          {/* Active Toggle */}
          <div className="md:col-span-2 flex items-center justify-between bg-slate-50 rounded-xl px-4 py-3">
            <span className="text-sm font-medium text-slate-700">
              Template Status
            </span>

            <label className="relative inline-flex cursor-pointer items-center">
              <input
                type="checkbox"
                checked={formData.isActive}
                onChange={(e) =>
                  setFormData({ ...formData, isActive: e.target.checked })
                }
                className="sr-only peer"
              />
              <div className="h-6 w-11 rounded-full bg-slate-300 peer-checked:bg-indigo-600 transition"></div>
              <div className="absolute left-1 top-1 h-4 w-4 rounded-full bg-white transition peer-checked:translate-x-5"></div>
            </label>
          </div>

          {/* File Upload */}
          <div className="md:col-span-2">
            <label className="block text-sm font-medium mb-2">
              Attachments (PDF/Image)
            </label>

            <div className="border-2 border-dashed border-slate-300 rounded-xl p-4 text-center hover:border-indigo-400 transition">
              <input
                type="file"
                multiple
                accept=".pdf,image/*"
                onChange={handleFileChange}
                className="w-full text-sm"
              />
              <p className="text-xs text-slate-500 mt-2">
                Max 5 files • PDF, JPG, PNG
              </p>
            </div>
          </div>
        </div>

        {/* Existing Files */}
        {existingAttachments.length > 0 && (
          <div>
            <p className="text-sm font-medium mb-2">
              Existing Attachments
            </p>
            <div className="space-y-2">
              {existingAttachments.map((file) => (
                <div
                  key={file.id}
                  className="flex justify-between items-center bg-indigo-50 px-3 py-2 rounded-lg"
                >
                  <span className="text-sm truncate">
                    {file.fileName}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="flex justify-end pt-2">
          <button
            type="submit"
            className="
              px-6 py-2.5
              rounded-xl
              text-white font-medium
              bg-gradient-to-r from-[#0b1735] to-[#1b3e97]
              hover:from-indigo-700 hover:to-blue-700
              shadow-md hover:shadow-lg
              transition
            "
          >
            {editingTemplate ? "Update Template" : "Create Template"}
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
