const XLSX = require('xlsx');
const csv = require('csv-parser');
const fs = require('fs');
const { Employee, BulkUploadLog } = require('../models');
const { Op } = require('sequelize');

const uploadEmployees = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const filePath = req.file.path;
    const fileExtension = req.file.originalname.split('.').pop().toLowerCase();
    let employees = [];

    // Parse file based on extension
    if (fileExtension === 'csv') {
      employees = await parseCSV(filePath);
    } else if (['xlsx', 'xls'].includes(fileExtension)) {
      employees = await parseExcel(filePath);
    } else {
      fs.unlinkSync(filePath);
      return res.status(400).json({ message: 'Invalid file format' });
    }

    // Create upload log
    const uploadLog = await BulkUploadLog.create({
      fileName: req.file.originalname,
      totalRecords: employees.length,
      uploadedBy: req.user.id,
      status: 'Processing'
    });

    // Process employees
    const results = await processEmployees(employees, uploadLog.id);

    // Update upload log
    await uploadLog.update({
      successCount: results.success,
      failureCount: results.failed,
      errorReport: results.errors,
      status: 'Completed'
    });

    // Delete uploaded file
    fs.unlinkSync(filePath);

    res.json({
      message: 'Upload processed',
      total: employees.length,
      success: results.success,
      failed: results.failed,
      errors: results.errors,
      data:results.data
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const parseCSV = (filePath) => {
  return new Promise((resolve, reject) => {
    const results = [];
    fs.createReadStream(filePath)
      .pipe(csv())
      .on('data', (data) => results.push(data))
      .on('end', () => resolve(results))
      .on('error', reject);
  });
};

const parseExcel = (filePath) => {
  const workbook = XLSX.readFile(filePath);
  const sheetName = workbook.SheetNames[0];
  const worksheet = workbook.Sheets[sheetName];
  return XLSX.utils.sheet_to_json(worksheet);
};

const processEmployees = async (employees, uploadLogId) => {
  const results = {
    success: 0,
    failed: 0,
    errors: [],
    data: [],
  };

  for (let i = 0; i < employees.length; i++) {
    const rowNumber = i + 2; // Excel row number
    const row = employees[i];

    // Base response object for this row
    const rowResult = {
      ...row,
      Status: "",
      Remark: "",
    };

    try {
      // ✅ Validate required fields
      const requiredFields = [
        "employeeId",
        "fullName",
        "email",
        "mobileNumber",
        "dateOfBirth",
        "dateOfJoining",
        "department",
      ];

      const missingFields = requiredFields.filter(
        (field) => !row[field]
      );

      if (missingFields.length > 0) {
        results.failed++;

        const errorMsg = `Missing required fields: ${missingFields.join(", ")}`;

        results.errors.push({
          row: rowNumber,
          employeeId: row.employeeId || "N/A",
          error: errorMsg,
        });

        rowResult.Status = "Failed";
        rowResult.Remark = errorMsg;
        results.data.push(rowResult);

        continue;
      }

      // ✅ Check for duplicates
      const existing = await Employee.findOne({
        where: {
          [Op.or]: [
            { employeeId: row.employeeId },
            { email: row.email },
          ],
        },
      });

      if (existing) {
        results.failed++;

        const errorMsg = "Employee ID or Email already exists";

        results.errors.push({
          row: rowNumber,
          employeeId: row.employeeId,
          error: errorMsg,
        });

        rowResult.Status = "Failed";
        rowResult.Remark = errorMsg;
        results.data.push(rowResult);

        continue;
      }

      // ✅ Create employee
      await Employee.create({
        employeeId: row.employeeId,
        fullName: row.fullName,
        email: row.email,
        mobileNumber: row.mobileNumber,
        whatsappNumber: row.whatsappNumber || row.mobileNumber,
        dateOfBirth: row.dateOfBirth,
        dateOfJoining: row.dateOfJoining,
        department: row.department,
        status: row.status || "Active",
      });

      results.success++;

      rowResult.Status = "Success";
      rowResult.Remark = "";
      results.data.push(rowResult);

    } catch (error) {
      results.failed++;

      const errorMsg = error.message;

      results.errors.push({
        row: rowNumber,
        employeeId: row.employeeId || "N/A",
        error: errorMsg,
      });

      rowResult.Status = "Failed";
      rowResult.Remark = errorMsg;
      results.data.push(rowResult);
    }
  }

  return results;
};


const getUploadLogs = async (req, res) => {
  try {
    const { User } = require('../models');
    const logs = await BulkUploadLog.findAll({
      order: [['createdAt', 'DESC']],
      include: [{ model: User, as: 'uploader', attributes: ['email'] }]
    });
    res.json(logs);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { uploadEmployees, getUploadLogs };
