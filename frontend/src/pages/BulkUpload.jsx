import { useState } from 'react';
import { useQuery } from 'react-query';
import api from '../services/api';
import { toast } from 'react-toastify';

const BulkUpload = () => {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadResult, setUploadResult] = useState(null);

  const { data: logs } = useQuery('uploadLogs', async () => {
    const response = await api.get('/bulk-upload/logs');
    return response.data;
  });

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
    setUploadResult(null);
  };

  const handleUpload = async () => {
    if (!file) {
      toast.error('Please select a file');
      return;
    }

    const formData = new FormData();
    formData.append('file', file);

    setUploading(true);
    try {
      const response = await api.post('/bulk-upload/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      setUploadResult(response.data);
      toast.success('Upload completed!');
      setFile(null);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div>
      <h1 className="text-2xl sm:text-3xl font-bold mb-6">Bulk Upload</h1>

      <div className="bg-white p-4 sm:p-6 rounded-lg shadow mb-6">
        <h2 className="text-lg sm:text-xl font-bold mb-4">Upload Employees</h2>
        <div className="mb-4 space-y-4">
          <div>
            <input
              type="file"
              accept=".csv,.xlsx,.xls"
              onChange={handleFileChange}
              className="w-full text-sm sm:text-base"
            />
          </div>
          <button
            onClick={handleUpload}
            disabled={uploading || !file}
            className="w-full sm:w-auto bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50"
          >
            {uploading ? 'Uploading...' : 'Upload'}
          </button>
        </div>

        {uploadResult && (
          <div className="mt-4 p-4 bg-gray-50 rounded">
            <h3 className="font-bold mb-2">Upload Results:</h3>
            <div className="space-y-1 text-sm">
              <p>Total: {uploadResult.total}</p>
              <p className="text-green-600">Success: {uploadResult.success}</p>
              <p className="text-red-600">Failed: {uploadResult.failed}</p>
            </div>
            {uploadResult.errors && uploadResult.errors.length > 0 && (
              <div className="mt-2">
                <p className="font-bold text-sm">Errors:</p>
                <ul className="list-disc list-inside text-sm max-h-32 overflow-y-auto">
                  {uploadResult.errors.slice(0, 10).map((error, idx) => (
                    <li key={idx}>Row {error.row}: {error.error}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="bg-white p-4 sm:p-6 rounded-lg shadow overflow-x-auto">
        <h2 className="text-lg sm:text-xl font-bold mb-4">Upload History</h2>
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">File Name</th>
              <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total</th>
              <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Success</th>
              <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Failed</th>
              <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase hidden sm:table-cell">Status</th>
              <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {logs?.map((log) => (
              <tr key={log.id}>
                <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-sm">{log.fileName}</td>
                <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-sm">{log.totalRecords}</td>
                <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-sm text-green-600">{log.successCount}</td>
                <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-sm text-red-600">{log.failureCount}</td>
                <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-sm hidden sm:table-cell">{log.status}</td>
                <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-sm">
                  {new Date(log.createdAt).toLocaleDateString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default BulkUpload;
