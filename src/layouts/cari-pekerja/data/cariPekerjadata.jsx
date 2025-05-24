import { useEffect, useState } from "react";
import { Table, Alert, Empty, Typography } from "antd";
import { findAbk } from "../../../services/api";

const { Text } = Typography;

function cariPekerjaData({ formData }) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  // Function to format date to Indonesian format (dd/mm/yyyy)
  const formatToIndonesianDate = (dateValue) => {
    if (!dateValue) return '';
    
    let date;
    
    // Handle different input formats
    if (typeof dateValue === 'string') {
      // If already in dd/mm/yyyy format, return as is
      if (/^\d{2}\/\d{2}\/\d{4}$/.test(dateValue)) {
        return dateValue;
      }
      
      // If in yyyy-mm-dd format (from database), convert to dd/mm/yyyy
      if (/^\d{4}-\d{2}-\d{2}$/.test(dateValue)) {
        const [year, month, day] = dateValue.split('-');
        return `${day}/${month}/${year}`;
      }
      
      // If in dd-mm-yyyy format, convert to dd/mm/yyyy
      if (/^\d{2}-\d{2}-\d{4}$/.test(dateValue)) {
        return dateValue.replace(/-/g, '/');
      }
      
      // Try to parse as date
      date = new Date(dateValue);
    } else if (dateValue instanceof Date) {
      date = dateValue;
    } else if (typeof dateValue === 'number') {
      date = new Date(dateValue);
    } else {
      return dateValue;
    }
    
    // Check if date is valid
    if (isNaN(date.getTime())) {
      return dateValue;
    }
    
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    
    return `${day}/${month}/${year}`;
  };

  const columns = [
    { 
      title: "Nama", 
      dataIndex: "NAMA", 
      key: "NAMA",
      width: 200,
      ellipsis: true,
      render: (text) => <Text strong>{text || '-'}</Text>
    },
    { 
      title: "NIK", 
      dataIndex: "NIK", 
      key: "NIK",
      width: 180,
      render: (text) => text || '-'
    },
    { 
      title: "Tempat Lahir", 
      dataIndex: "TEMPAT_LAHIR", 
      key: "TEMPAT_LAHIR",
      width: 150,
      ellipsis: true,
      render: (text) => text || '-'
    },
    { 
      title: "Tanggal Lahir", 
      dataIndex: "TTL", 
      key: "TTL",
      width: 120,
      render: (text) => {
        const formattedDate = formatToIndonesianDate(text);
        return (
          <Text style={{ 
            color: formattedDate && formattedDate !== text ? '#1890ff' : 'inherit',
            fontWeight: formattedDate ? 'normal' : 'inherit'
          }}>
            {formattedDate || '-'}
          </Text>
        );
      }
    },
    { 
      title: "Sekolah", 
      dataIndex: "SEKOLAH", 
      key: "SEKOLAH",
      width: 200,
      ellipsis: true,
      render: (text) => text || '-'
    },
    { 
      title: "Alamat", 
      dataIndex: "ALAMAT", 
      key: "ALAMAT",
      width: 300,
      ellipsis: true,
      render: (text) => text || '-'
    },
  ];

  useEffect(() => {
    // Check if formData exists and has at least one non-empty value
    if (!formData || Object.values(formData).every((v) => !v || (typeof v === 'string' && v.trim() === ""))) {
      return;
    }

    const fetchData = async () => {
      setLoading(true);
      setErrorMsg("");
      
      try {
        console.log("Searching with criteria:", formData);
        const response = await findAbk(formData);
        
        if (response && response.length > 0) {
          // Process the response data to ensure proper formatting
          const processedData = response.map((item, index) => ({
            ...item,
            key: item.NIK || index, // Use NIK as key, fallback to index
            TTL: formatToIndonesianDate(item.TTL), // Format TTL to Indonesian format
          }));
          
          setData(processedData);
          setErrorMsg("");
          console.log(`Found ${processedData.length} records`);
        } else {
          setData([]);
          setErrorMsg("Data tidak ditemukan dengan kriteria pencarian yang diberikan.");
        }
      } catch (err) {
        console.error("Search error:", err);
        setData([]);
        
        // Handle different types of errors
        if (err.response) {
          // Server responded with error status
          const status = err.response.status;
          const message = err.response.data?.message || err.response.statusText;
          
          if (status === 404) {
            setErrorMsg("Data tidak ditemukan.");
          } else if (status === 500) {
            setErrorMsg("Terjadi kesalahan pada server. Silakan coba lagi.");
          } else {
            setErrorMsg(`Error ${status}: ${message}`);
          }
        } else if (err.request) {
          // Network error
          setErrorMsg("Tidak dapat terhubung ke server. Periksa koneksi internet Anda.");
        } else {
          // Other errors
          setErrorMsg("Terjadi kesalahan saat mengambil data. Silakan coba lagi.");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [formData]);

  // Show empty state when no search has been performed
  if (!formData || Object.values(formData).every((v) => !v || (typeof v === 'string' && v.trim() === ""))) {
    return null;
  }

  return (
    <div style={{ marginTop: 20 }}>
      {/* Error message */}
      {errorMsg && (
        <Alert
          message="Pencarian Tidak Berhasil"
          description={errorMsg}
          type="warning"
          showIcon
          style={{ marginBottom: 16 }}
        />
      )}

      {/* Results summary */}
      {!loading && !errorMsg && data.length > 0 && (
        <div style={{ 
          marginBottom: 16, 
          padding: 12, 
          background: '#f6ffed', 
          border: '1px solid #b7eb8f',
          borderRadius: 6 
        }}>
          <Text type="success" strong>
            Ditemukan {data.length} data pekerja yang sesuai dengan kriteria pencarian.
          </Text>
        </div>
      )}

      {/* Results table */}
      <Table
        dataSource={data}
        columns={columns}
        loading={loading}
        rowKey="key"
        pagination={{
          pageSize: 10,
          showSizeChanger: true,
          showQuickJumper: true,
          showTotal: (total, range) => `${range[0]}-${range[1]} dari ${total} data`,
        }}
        scroll={{ x: "max-content" }}
        locale={{
          emptyText: loading ? "Mencari data..." : (
            <Empty 
              description="Tidak ada data yang ditemukan"
              style={{ padding: '20px 0' }}
            />
          )
        }}
        bordered
        size="middle"
      />
    </div>
  );
}

export default cariPekerjaData;