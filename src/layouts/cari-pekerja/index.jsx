import { useState } from "react";
import { Input, Button, Form, message, DatePicker, Space } from "antd";
import { SearchOutlined, ClearOutlined } from "@ant-design/icons";
import CariPekerjadata from "./data/cariPekerjadata";
import dayjs from 'dayjs';

function CariPekerja() {
  const [formData, setFormData] = useState(null);
  const [form] = Form.useForm();

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
      
      // If in yyyy-mm-dd format (from date input), convert to dd/mm/yyyy
      if (/^\d{4}-\d{2}-\d{2}$/.test(dateValue)) {
        const [year, month, day] = dateValue.split('-');
        return `${day}/${month}/${year}`;
      }
      
      // Try to parse as date
      date = new Date(dateValue);
    } else if (dateValue instanceof Date) {
      date = dateValue;
    } else if (typeof dateValue === 'number') {
      date = new Date(dateValue);
    } else if (dayjs.isDayjs(dateValue)) {
      date = dateValue.toDate();
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

  const onFinish = (values) => {
    // Check if all fields are empty
    const isEmpty = Object.values(values).every((v) => {
      if (!v) return true;
      if (typeof v === 'string' && v.trim() === '') return true;
      if (dayjs.isDayjs(v)) return false; // DatePicker value is not empty
      return false;
    });

    if (isEmpty) {
      message.warning("Silakan isi setidaknya satu kolom pencarian.");
      return;
    }

    // Process form data
    const processedData = { ...values };
    
    // Convert date to Indonesian format if provided
    if (values.TTL) {
      processedData.TTL = formatToIndonesianDate(values.TTL);
    }

    // Clean up NIK (remove any non-numeric characters)
    if (values.NIK) {
      processedData.NIK = values.NIK.replace(/[^\d]/g, '');
    }

    // Clean up name (trim whitespace)
    if (values.NAMA) {
      processedData.NAMA = values.NAMA.trim();
    }

    setFormData(processedData);
    message.success(`Mencari data dengan kriteria yang diberikan...`);
  };

  const onReset = () => {
    form.resetFields();
    setFormData(null);
    message.info("Form pencarian telah direset.");
  };

  // Custom date format for display
  const dateFormat = 'DD/MM/YYYY';

  return (
    <div style={{ padding: 20 }}>
      <h2 style={{ marginBottom: 20 }}>Cari Data Pekerja</h2>
      
      <div style={{ 
        background: '#f5f5f5', 
        padding: 20, 
        borderRadius: 8, 
        marginBottom: 20 
      }}>
        <Form 
          form={form}
          layout="vertical" 
          onFinish={onFinish}
          size="large"
        >
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', 
            gap: 16 
          }}>
            <Form.Item 
              name="NAMA" 
              label="Nama Lengkap"
              style={{ marginBottom: 16 }}
            >
              <Input 
                placeholder="Masukkan nama pekerja"
                allowClear
                style={{ borderRadius: 6 }}
              />
            </Form.Item>

            <Form.Item 
              name="TTL" 
              label="Tanggal Lahir"
              style={{ marginBottom: 16 }}
            >
              <DatePicker
                placeholder="Pilih tanggal lahir"
                format={dateFormat}
                style={{ width: '100%', borderRadius: 6 }}
                allowClear
              />
            </Form.Item>

            <Form.Item 
              name="NIK" 
              label="NIK"
              style={{ marginBottom: 16 }}
            >
              <Input 
                placeholder="Masukkan 16 digit NIK"
                maxLength={16}
                allowClear
                style={{ borderRadius: 6 }}
                onChange={(e) => {
                  // Only allow numbers
                  const value = e.target.value.replace(/[^\d]/g, '');
                  form.setFieldsValue({ NIK: value });
                }}
              />
            </Form.Item>
          </div>

          <div style={{ marginTop: 20 }}>
            <Space>
              <Button 
                type="primary" 
                htmlType="submit"
                icon={<SearchOutlined />}
                size="large"
                style={{ borderRadius: 6 }}
              >
                Cari Data
              </Button>
              <Button 
                onClick={onReset}
                icon={<ClearOutlined />}
                size="large"
                style={{ borderRadius: 6 }}
              >
                Reset
              </Button>
            </Space>
          </div>
        </Form>
      </div>

      {/* Search criteria display */}
      {formData && (
        <div style={{ 
          background: '#e6f7ff', 
          padding: 15, 
          borderRadius: 6, 
          marginBottom: 20,
          border: '1px solid #91d5ff'
        }}>
          <h4 style={{ margin: '0 0 10px 0', color: '#1890ff' }}>
            Kriteria Pencarian:
          </h4>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 15 }}>
            {formData.NAMA && (
              <span><strong>Nama:</strong> {formData.NAMA}</span>
            )}
            {formData.TTL && (
              <span><strong>Tanggal Lahir:</strong> {formData.TTL}</span>
            )}
            {formData.NIK && (
              <span><strong>NIK:</strong> {formData.NIK}</span>
            )}
          </div>
        </div>
      )}

      {/* Results component */}
      {formData && <CariPekerjadata formData={formData} />}
    </div>
  );
}

export default CariPekerja;