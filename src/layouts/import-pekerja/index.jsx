import React, { useState } from 'react';
import { Button, Upload, message, Table, Space, Alert } from 'antd';
import { UploadOutlined, DownloadOutlined } from '@ant-design/icons';
import * as XLSX from 'xlsx';
import { importAbk } from '../../services/api';

const ImportPekerja = () => {
  const [excelData, setExcelData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [parseErrors, setParseErrors] = useState([]);

  const columnHeaders = [
    "NAMA", "NIK", "TEMPAT_LAHIR", "TTL", "SEKOLAH", "KTP", "KK", "IJAZAH",
    "AKTA_KELAHIRAN", "BSTFII", "ALAMAT", "PROVINSI", "KOTA", "KECAMATAN", "KELURAHAN",
    "RT_RW", "WARNA_RAMBUT", "WARNA_MATA", "WARNA_KULIT", "TINGGI_BADAN",
    "BERAT_BADAN", "GOLONGAN_DARAH", "NAMA_KAPAL", "NAMA_IBU", "AGAMA", "PENDIDIKAN_TERAKHIR"
  ];

  // Function to parse Indonesian date format (dd/mm/yyyy or dd-mm-yyyy)
  const parseIndonesianDate = (dateStr) => {
    if (!dateStr) return null;
    
    // Handle Excel serial date numbers
    if (typeof dateStr === 'number') {
      const excelDate = new Date((dateStr - 25569) * 86400 * 1000);
      const day = String(excelDate.getDate()).padStart(2, '0');
      const month = String(excelDate.getMonth() + 1).padStart(2, '0');
      const year = excelDate.getFullYear();
      return `${day}/${month}/${year}`;
    }

    // Convert to string for processing
    const str = String(dateStr).trim();
    
    // Handle dd/mm/yyyy format (1 or 2 digits for day/month)
    if (/^\d{1,2}\/\d{1,2}\/\d{4}$/.test(str)) {
      const [day, month, year] = str.split('/');
      // Always treat as dd/mm/yyyy (Indonesian format)
      return `${day.padStart(2, '0')}/${month.padStart(2, '0')}/${year}`;
    }
    
    // Handle dd-mm-yyyy format (1 or 2 digits for day/month)
    if (/^\d{1,2}-\d{1,2}-\d{4}$/.test(str)) {
      const [day, month, year] = str.split('-');
      // Always treat as dd-mm-yyyy (Indonesian format)
      return `${day.padStart(2, '0')}/${month.padStart(2, '0')}/${year}`;
    }
    
    // Handle dd.mm.yyyy format (1 or 2 digits for day/month)
    if (/^\d{1,2}\.\d{1,2}\.\d{4}$/.test(str)) {
      const [day, month, year] = str.split('.');
      // Always treat as dd.mm.yyyy (Indonesian format)
      return `${day.padStart(2, '0')}/${month.padStart(2, '0')}/${year}`;
    }
    
    // Handle yyyy-mm-dd format (ISO format, convert to dd/mm/yyyy)
    if (/^\d{4}-\d{1,2}-\d{1,2}$/.test(str)) {
      const [year, month, day] = str.split('-');
      return `${day.padStart(2, '0')}/${month.padStart(2, '0')}/${year}`;
    }
    
    // Handle yyyy/mm/dd format (convert to dd/mm/yyyy)
    if (/^\d{4}\/\d{1,2}\/\d{1,2}$/.test(str)) {
      const [year, month, day] = str.split('/');
      return `${day.padStart(2, '0')}/${month.padStart(2, '0')}/${year}`;
    }

    return str; // Return original if no pattern matches
  };

  // Function to validate Indonesian date
  const validateIndonesianDate = (dateStr) => {
    if (!dateStr) return true; // Allow empty dates
    
    const datePattern = /^\d{2}\/\d{2}\/\d{4}$/;
    if (!datePattern.test(dateStr)) {
      return false;
    }
    
    const [day, month, year] = dateStr.split('/').map(Number);
    
    // Basic validation - Indonesian format is dd/mm/yyyy
    if (day < 1 || day > 31) return false;
    if (month < 1 || month > 12) return false;
    if (year < 1900 || year > 2100) return false;
    
    // More detailed day validation based on month
    const daysInMonth = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
    
    // Check for leap year
    if (month === 2 && ((year % 4 === 0 && year % 100 !== 0) || year % 400 === 0)) {
      return day <= 29;
    }
    
    return day <= daysInMonth[month - 1];
  };

  // Function to format Indonesian numbers
  const formatIndonesianNumber = (value) => {
    if (!value) return value;
    
    // If it's already a number, return it
    if (typeof value === 'number') return value;
    
    const str = String(value).trim();
    
    // Remove Indonesian thousand separators (.) and replace decimal comma with dot
    const cleaned = str.replace(/\./g, '').replace(/,/g, '.');
    const parsed = parseFloat(cleaned);
    
    return isNaN(parsed) ? value : parsed;
  };

  const handleUpload = (file) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const workbook = XLSX.read(e.target.result, { 
          type: 'binary',
          cellDates: false, // We'll handle dates manually
          cellNF: false,
          cellStyles: false
        });
        
        const sheet = workbook.Sheets[workbook.SheetNames[0]];
        const rawData = XLSX.utils.sheet_to_json(sheet, { raw: false });
        
        const errors = [];
        const processedData = rawData.map((row, index) => {
          const processedRow = { ...row };
          
          // Process TTL (Tanggal Lahir) field
          if (row.TTL) {
            const formattedDate = parseIndonesianDate(row.TTL);
            if (!validateIndonesianDate(formattedDate)) {
              errors.push(`Baris ${index + 2}: Format tanggal TTL tidak valid (${row.TTL}). Gunakan format dd/mm/yyyy`);
            }
            processedRow.TTL = formattedDate;
          }
          
          // Process numeric fields
          if (row.TINGGI_BADAN) {
            processedRow.TINGGI_BADAN = formatIndonesianNumber(row.TINGGI_BADAN);
          }
          
          if (row.BERAT_BADAN) {
            processedRow.BERAT_BADAN = formatIndonesianNumber(row.BERAT_BADAN);
          }
          
          // Clean up NIK (remove any formatting)
          if (row.NIK) {
            processedRow.NIK = String(row.NIK).replace(/[^\d]/g, '');
          }
          
          // Ensure RT_RW format
          if (row.RT_RW && !String(row.RT_RW).includes('/')) {
            // If it's just numbers, assume it needs formatting
            const rtRw = String(row.RT_RW);
            if (rtRw.length >= 2) {
              const mid = Math.floor(rtRw.length / 2);
              processedRow.RT_RW = `${rtRw.substring(0, mid)}/${rtRw.substring(mid)}`;
            }
          }
          
          return processedRow;
        });
        
        setExcelData(processedData);
        setParseErrors(errors);
        
        if (errors.length > 0) {
          message.warning(`Data berhasil dimuat dengan ${errors.length} peringatan. Periksa detail di bawah.`);
        } else {
          message.success(`Berhasil memuat ${processedData.length} baris data`);
        }
        
      } catch (error) {
        console.error('Error parsing Excel:', error);
        message.error('Gagal membaca file Excel. Pastikan format file benar.');
      }
    };
    reader.readAsBinaryString(file);
    return false;
  };

  const handleImport = async () => {
    if (parseErrors.length > 0) {
      message.warning('Masih ada kesalahan format data. Perbaiki terlebih dahulu sebelum import.');
      return;
    }

    setLoading(true);
    try {
      const response = await importAbk(excelData);
      if (response.status === 'success') {
        message.success(response.message || 'Data berhasil diimpor ke database');
        setExcelData([]);
        setParseErrors([]);
      } else {
        throw new Error(response.message || 'Import gagal');
      }
    } catch (error) {
      console.error('Import error:', error);
      message.error(error.message || 'Import gagal dilakukan');
    } finally {
      setLoading(false);
    }
  };

  const downloadTemplate = () => {
    // Create template with sample data showing correct formats
    const sampleData = [{
      "NAMA": "Contoh Nama Lengkap",
      "NIK": "1234567890123456",
      "TEMPAT_LAHIR": "Jakarta",
      "TTL": "15/08/1990",
      "SEKOLAH": "SMA Negeri 1",
      "KTP": "Ada",
      "KK": "Ada", 
      "IJAZAH": "Ada",
      "AKTA_KELAHIRAN": "Ada",
      "BSTFII": "Ada",
      "ALAMAT": "Jl. Contoh No. 123",
      "PROVINSI": "DKI Jakarta",
      "KOTA": "Jakarta Pusat",
      "KECAMATAN": "Gambir",
      "KELURAHAN": "Kelurahan Contoh",
      "RT_RW": "001/002",
      "WARNA_RAMBUT": "Hitam",
      "WARNA_MATA": "Hitam",
      "WARNA_KULIT": "Sawo Matang",
      "TINGGI_BADAN": "170",
      "BERAT_BADAN": "65",
      "GOLONGAN_DARAH": "O",
      "NAMA_KAPAL": "KM Contoh",
      "NAMA_IBU": "Nama Ibu Kandung",
      "AGAMA": "Islam",
      "PENDIDIKAN_TERAKHIR": "SMA"
    }];

    const worksheet = XLSX.utils.json_to_sheet(sampleData);
    
    // Set column widths
    const colWidths = columnHeaders.map(() => ({ wch: 20 }));
    worksheet['!cols'] = colWidths;
    
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Template');
    
    // Add instructions sheet
    const instructions = [
      { "PETUNJUK": "FORMAT DATA PEKERJA" },
      { "PETUNJUK": "" },
      { "PETUNJUK": "1. TTL harus dalam format dd/mm/yyyy (contoh: 15/08/1990)" },
      { "PETUNJUK": "2. NIK harus 16 digit angka" },
      { "PETUNJUK": "3. TINGGI_BADAN dan BERAT_BADAN dalam angka" },
      { "PETUNJUK": "4. RT_RW dalam format 001/002" },
      { "PETUNJUK": "5. Hapus baris contoh ini sebelum mengisi data" },
      { "PETUNJUK": "" },
      { "PETUNJUK": "CATATAN PENTING:" },
      { "PETUNJUK": "- Semua tanggal akan diperlakukan sebagai format Indonesia (dd/mm/yyyy)" },
      { "PETUNJUK": "- Contoh: 13/1/2001 akan menjadi 13/01/2001 (13 Januari 2001)" },
      { "PETUNJUK": "- Jangan gunakan format Amerika (mm/dd/yyyy)" },
      { "PETUNJUK": "- dd/mm/yyyy (15/08/1990)" },
      { "PETUNJUK": "- dd-mm-yyyy (15-08-1990)" },
      { "PETUNJUK": "- dd.mm.yyyy (15.08.1990)" }
    ];
    
    const instructionSheet = XLSX.utils.json_to_sheet(instructions);
    XLSX.utils.book_append_sheet(workbook, instructionSheet, 'Petunjuk');
    
    XLSX.writeFile(workbook, 'Template_Data_Pekerja_Indonesia.xlsx');
    message.info('Template berhasil diunduh. Periksa sheet "Petunjuk" untuk format yang benar.');
  };

  const columns = excelData[0]
    ? Object.keys(excelData[0]).map((key) => ({
        title: key,
        dataIndex: key,
        key,
        render: (text) => {
          // Highlight dates for easy verification
          if (key === 'TTL' && text) {
            const isValid = validateIndonesianDate(text);
            return (
              <span style={{ 
                color: isValid ? 'green' : 'red',
                fontWeight: isValid ? 'normal' : 'bold'
              }}>
                {text}
              </span>
            );
          }
          return text;
        }
      }))
    : [];

  return (
    <div style={{ padding: 20 }}>
      <h2>Import Data Pekerja</h2>
      
      <Space wrap style={{ marginBottom: 16 }}>
        <Upload 
          beforeUpload={handleUpload} 
          showUploadList={false} 
          accept=".xlsx,.xls"
        >
          <Button icon={<UploadOutlined />}>Upload Excel</Button>
        </Upload>
        <Button icon={<DownloadOutlined />} onClick={downloadTemplate}>
          Download Template
        </Button>
      </Space>

      {parseErrors.length > 0 && (
        <Alert
          message="Peringatan Format Data"
          description={
            <ul style={{ margin: 0, paddingLeft: 20 }}>
              {parseErrors.map((error, index) => (
                <li key={index}>{error}</li>
              ))}
            </ul>
          }
          type="warning"
          showIcon
          style={{ marginBottom: 16 }}
        />
      )}

      {excelData.length > 0 && (
        <>
          <div style={{ marginBottom: 16 }}>
            <strong>Data Preview ({excelData.length} baris)</strong>
            {parseErrors.length === 0 && (
              <span style={{ color: 'green', marginLeft: 10 }}>
                ✓ Semua format data valid
              </span>
            )}
          </div>
          
          <Table
            dataSource={excelData}
            columns={columns}
            rowKey={(row, i) => i}
            style={{ marginBottom: 20 }}
            scroll={{ x: 'max-content' }}
            pagination={{ pageSize: 10 }}
          />
          
          <Button 
            type="primary" 
            onClick={handleImport} 
            loading={loading}
            disabled={parseErrors.length > 0}
          >
            Import ke Database ({excelData.length} data)
          </Button>
          
          {parseErrors.length > 0 && (
            <div style={{ marginTop: 10, color: 'red', fontSize: '12px' }}>
              * Perbaiki kesalahan format sebelum melakukan import
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default ImportPekerja;