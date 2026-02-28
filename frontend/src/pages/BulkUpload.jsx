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
  const [dragActive, setDragActive] = useState(false);
const [uploadProgress, setUploadProgress] = useState(0);
const [previewRows, setPreviewRows] = useState([]);

  const { data: logs } = useQuery("uploadLogs", async () => {
    const response = await api.get("/bulk-upload/logs");
    return response.data;
  });

 const handleFileChange = (fileInput) => {
  const selectedFile =
    fileInput instanceof File ? fileInput : fileInput.target.files[0];

  if (!selectedFile) return;

  setFile(selectedFile);
  setUploadResult(null);

  // 🔥 preview first few rows
  const reader = new FileReader();
  reader.onload = (e) => {
    try {
      const data = new Uint8Array(e.target.result);
      const workbook = XLSX.read(data, { type: "array" });
      const sheet = workbook.Sheets[workbook.SheetNames[0]];
      const json = XLSX.utils.sheet_to_json(sheet);
      setPreviewRows(json.slice(0, 5));
    } catch (err) {
      console.error("Preview failed");
    }
  };
  reader.readAsArrayBuffer(selectedFile);
};
const handleDrag = (e) => {
  e.preventDefault();
  e.stopPropagation();
  if (e.type === "dragenter" || e.type === "dragover") {
    setDragActive(true);
  } else {
    setDragActive(false);
  }
};

const handleDrop = (e) => {
  e.preventDefault();
  e.stopPropagation();
  setDragActive(false);

  if (e.dataTransfer.files?.[0]) {
    handleFileChange(e.dataTransfer.files[0]);
  }
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
  setUploadProgress(0);

  try {
    const response = await api.post("/bulk-upload/upload", formData, {
      headers: { "Content-Type": "multipart/form-data" },
      onUploadProgress: (progressEvent) => {
        const percent = Math.round(
          (progressEvent.loaded * 100) / progressEvent.total
        );
        setUploadProgress(percent);
      },
    });

    setUploadResult(response.data);
    toast.success("Upload completed!");
    setFile(null);
    setPreviewRows([]);
  } catch (error) {
    toast.error(error.response?.data?.message || "Upload failed");
  } finally {
    setUploading(false);
  }
};

  return (
    <div>
      <h1 className="text-2xl sm:text-3xl font-bold mb-6">Bulk Upload</h1>

   <div className="bg-white rounded-2xl shadow-lg border border-slate-200 overflow-hidden mb-6">

  {/* Header */}
  <div className="px-6 py-4 bg-gradient-to-r from-[#0b1735] to-[#1b3e97] flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
    <h2 className="text-white font-semibold">
      Bulk Upload Employees
    </h2>

 
  </div>

  <div className="p-6 space-y-5">

    {/* ✅ Instructions + sample together */}
    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 bg-indigo-50 border border-indigo-100 rounded-xl p-4">

      <div>
        <p className="font-semibold text-indigo-900 mb-1">
          📋 Upload Instructions
        </p>
        <ul className="text-sm text-indigo-800 space-y-1">
          <li>• Download the sample file</li>
          <li>• Fill employee data in same format</li>
          <li>• Upload XLSX, XLS or CSV</li>
        </ul>
      </div>

      {/* secondary download button (mobile friendly) */}
      <button
        onClick={handleDownloadSample}
        className="
        
          bg-indigo-600 text-white
          px-4 py-2 rounded-lg
          text-sm font-medium
          hover:bg-indigo-700
          transition
        "
      >
        Download Sample
      </button>
    </div>

    {/* 🔥 COMPACT DROP ZONE */}
    <div
      onDragEnter={handleDrag}
      onDragLeave={handleDrag}
      onDragOver={handleDrag}
      onDrop={handleDrop}
      className={`
        relative
        border border-dashed rounded-xl
        px-4 py-4
        text-center
        transition-all
        ${dragActive
          ? "border-indigo-500 bg-indigo-50"
          : "border-slate-300 hover:border-indigo-400 hover:bg-slate-50"}
      `}
    >
      <input
        type="file"
        accept=".csv,.xlsx,.xls"
        onChange={handleFileChange}
        className="hidden"
        id="bulkFile"
      />

      <label htmlFor="bulkFile" className="cursor-pointer block">

        {/* small icon */}
        <div className="text-3xl mb-2">📤</div>

        <p className="font-medium text-slate-800 text-sm sm:text-base">
          {file ? file.name : "Drag & drop file here"}
        </p>

        <p className="text-xs text-slate-500 mt-1">
          or click to browse • XLSX, XLS, CSV
        </p>
      </label>
    </div>

    {/* 🔥 Upload button row */}
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">

      {/* file selected badge */}
      {file && (
        <div className="text-xs text-slate-500 bg-slate-100 px-3 py-1 rounded-full w-fit">
          Selected: {file.name}
        </div>
      )}

      <button
        onClick={handleUpload}
        disabled={!file || uploading}
        className="
          sm:ml-auto
          px-6 py-2.5 rounded-xl
          text-white font-semibold
          bg-gradient-to-r from-indigo-600 to-blue-600
          hover:from-indigo-700 hover:to-blue-700
          shadow-md hover:shadow-lg
          disabled:opacity-50
          transition-all
        "
      >
        {uploading ? "Uploading..." : "Upload File"}
      </button>
    </div>

  </div>
</div>

      <div className="bg-white rounded-2xl shadow-lg border border-slate-200 overflow-hidden">
  <div className="px-6 py-4 border-b bg-slate-50">
    <h2 className="text-lg font-semibold text-slate-800">
      Upload History
    </h2>
  </div>

  <div className="overflow-x-auto">
    <table className="w-full text-sm">
      <thead className="bg-gradient-to-b from-[#2c498d] to-[#0b1735] text-white border-b border-slate-200">
        <tr className="text-xs uppercase  tracking-wider">
          <th className="px-6 py-3 text-left">File Name</th>
          <th className="px-6 py-3 text-left">Total</th>
          <th className="px-6 py-3 text-left">Success</th>
          <th className="px-6 py-3 text-left">Failed</th>
          <th className="px-6 py-3 text-left hidden sm:table-cell">
            Status
          </th>
          <th className="px-6 py-3 text-left">Date</th>
        </tr>
      </thead>

      <tbody>
        {logs?.map((log, index) => (
          <tr
            key={log.id}
            className={`
              border-t border-slate-100
              hover:bg-indigo-50/40
              transition
              ${index % 2 === 0 ? "bg-white" : "bg-slate-50/40"}
            `}
          >
            <td className="px-6 py-4 font-medium text-slate-900">
              {log.fileName}
            </td>
            <td className="px-6 py-4">{log.totalRecords}</td>
            <td className="px-6 py-4 text-emerald-600 font-medium">
              {log.successCount}
            </td>
            <td className="px-6 py-4 text-rose-600 font-medium">
              {log.failureCount}
            </td>
            <td className="px-6 py-4 hidden sm:table-cell">
              <span className="status-pill status-success">
                {log.status}
              </span>
            </td>
            <td className="px-6 py-4">
              {new Date(log.createdAt).toLocaleDateString()}
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

export default BulkUpload;
