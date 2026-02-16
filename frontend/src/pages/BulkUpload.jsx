import { useState } from "react";
import { useQuery } from "react-query";
import { toast } from "react-toastify";
import api from '../services/api';
import * as XLSX from "xlsx";

const REQUIRED_COLUMNS = [
  "employeeId",
  "fullName",
  "email",
  "mobileNumber",
  "dateOfBirth",
  "dateOfJoining",
  "department",
];

const BulkUpload = () => {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadResult, setUploadResult] = useState(null);

  const { data: logs } = useQuery("uploadLogs", async () => {
    const response = await api.get("/bulk-upload/logs");
    return response.data;
  });

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
    setUploadResult(null);
  };

  // ✅ Download sample file (XLSX)
  const handleDownloadSample = () => {
    const sampleData = [
      REQUIRED_COLUMNS.reduce((acc, key) => {
        acc[key] = "";
        return acc;
      }, {}),
    ];

    const worksheet = XLSX.utils.json_to_sheet(sampleData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Sample");

    XLSX.writeFile(workbook, "employee_bulk_sample.xlsx");
  };

  // ✅ Download upload result (XLSX)
  const handleDownloadResults = () => {
    if (!uploadResult?.data?.length) return;

    const worksheet = XLSX.utils.json_to_sheet(uploadResult.data);

    // auto column width (better UX)
    const maxWidths = Object.keys(uploadResult.data[0]).map((key) => ({
      wch: Math.max(
        key.length,
        ...uploadResult.data.map((row) => String(row[key] ?? "").length)
      ) + 2,
    }));
    worksheet["!cols"] = maxWidths;

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Results");

    XLSX.writeFile(workbook, "employee_upload_results.xlsx");
  };

  const handleUpload = async () => {
    if (!file) {
      toast.error("Please select a file");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);

    setUploading(true);
    try {
      const response = await api.post("/bulk-upload/upload", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      setUploadResult(response.data);
      toast.success("Upload completed!");
      setFile(null);
    } catch (error) {
      toast.error(error.response?.data?.message || "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div>
      <h1 className="text-2xl sm:text-3xl font-bold mb-6">Bulk Upload</h1>

      <div className="bg-white p-4 sm:p-6 rounded-2xl shadow mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
          <h2 className="text-lg sm:text-xl font-bold">Upload Employees</h2>

          <button
            onClick={handleDownloadSample}
            className="bg-gray-100 hover:bg-gray-200 text-gray-800 px-4 py-2 rounded-lg text-sm font-medium"
          >
            ⬇ Download Sample
          </button>
        </div>

        <div className="space-y-4">
          <input
            type="file"
            accept=".csv,.xlsx,.xls"
            onChange={handleFileChange}
            className="w-full text-sm sm:text-base border rounded-lg p-2"
          />

          <button
            onClick={handleUpload}
            disabled={uploading || !file}
            className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-lg font-medium disabled:opacity-50"
          >
            {uploading ? "Uploading..." : "Upload File"}
          </button>
        </div>

        {uploadResult && (
          <div className="mt-6 p-4 bg-gray-50 rounded-xl border">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-3">
              <h3 className="font-bold mb-2">Upload Results</h3>

              {uploadResult?.data?.length > 0 && (
                <button
                  onClick={handleDownloadResults}
                  className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-medium"
                >
                  ⬇ Download Results
                </button>
              )}
            </div>

            <div className="space-y-1 text-sm">
              <p>Total: {uploadResult.total}</p>
              <p className="text-green-600">Success: {uploadResult.success}</p>
              <p className="text-red-600">Failed: {uploadResult.failed}</p>
            </div>

            {uploadResult.errors && uploadResult.errors.length > 0 && (
              <div className="mt-3">
                <p className="font-bold text-sm">Errors:</p>
                <ul className="list-disc list-inside text-sm max-h-32 overflow-y-auto">
                  {uploadResult.errors.slice(0, 10).map((error, idx) => (
                    <li key={idx}>
                      Row {error.row}: {error.error}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="bg-white p-4 sm:p-6 rounded-2xl shadow overflow-x-auto">
        <h2 className="text-lg sm:text-xl font-bold mb-4">
          Upload History
        </h2>
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                File Name
              </th>
              <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Total
              </th>
              <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Success
              </th>
              <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Failed
              </th>
              <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase hidden sm:table-cell">
                Status
              </th>
              <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Date
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {logs?.map((log) => (
              <tr key={log.id}>
                <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-sm">
                  {log.fileName}
                </td>
                <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-sm">
                  {log.totalRecords}
                </td>
                <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-sm text-green-600">
                  {log.successCount}
                </td>
                <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-sm text-red-600">
                  {log.failureCount}
                </td>
                <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-sm hidden sm:table-cell">
                  {log.status}
                </td>
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
