import {
  Button,
  Input,
  Modal,
  Select,
  Space,
  Table,
  Form,
  message,
} from "antd";
import { useState } from "react";
import dataPekerjaData from "./data/dataPekerjaData";

import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

const { Option } = Select;

const DataPekerja = () => {
  const {
    data,
    loading,
    baseColumns,
    searchQuery,
    setSearchQuery,
    searchField,
    setSearchField,
    addWorker,
    updateWorker,
    removeWorker,
    selectedRow,
    setSelectedRow,
  } = dataPekerjaData();

  const [modalOpen, setModalOpen] = useState(false);
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

  // Function to convert dd/mm/yyyy to yyyy-mm-dd for date input
  const formatToDateInput = (dateValue) => {
    if (!dateValue) return '';
    
    // If already in yyyy-mm-dd format, return as is
    if (/^\d{4}-\d{2}-\d{2}$/.test(dateValue)) {
      return dateValue;
    }
    
    // If in dd/mm/yyyy format, convert to yyyy-mm-dd
    if (/^\d{2}\/\d{2}\/\d{4}$/.test(dateValue)) {
      const [day, month, year] = dateValue.split('/');
      return `${year}-${month}-${day}`;
    }
    
    // Try to parse as date and convert
    const date = new Date(dateValue);
    if (!isNaN(date.getTime())) {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    }
    
    return dateValue;
  };

  const handleSubmit = () => {
    form.validateFields().then(async (values) => {
      // Convert TTL to Indonesian format before saving
      if (values.TTL) {
        values.TTL = formatToIndonesianDate(values.TTL);
      }
      
      if (selectedRow?.id) {
        await updateWorker({ ...values, id: selectedRow.id });
        message.success("Data berhasil diubah!");
      } else {
        const response = await addWorker(values);
        if (response?.message === "NIK SUDAH ADA") {
          message.error("NIK SUDAH ADA");
          return;
        }
        message.success("Data berhasil ditambahkan!");
      }
      setModalOpen(false);
      form.resetFields();
      setSelectedRow(null);
    });
  };

  const handleEdit = (record) => {
    setSelectedRow(record);
    // Convert TTL to date input format for editing
    const formValues = { ...record };
    if (formValues.TTL) {
      formValues.TTL = formatToDateInput(formValues.TTL);
    }
    form.setFieldsValue(formValues);
    setModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm("Yakin ingin menghapus data ini?")) {
      await removeWorker(id);
      message.success("Data berhasil dihapus!");
    }
  };

  const exportToExcel = () => {
    // Format data for export with proper Indonesian dates
    const exportData = data.map(item => ({
      ...item,
      TTL: formatToIndonesianDate(item.TTL)
    }));

    const worksheet = XLSX.utils.json_to_sheet(exportData);
    
    // Set column widths
    const colWidths = [
      { wch: 25 }, // NAMA
      { wch: 18 }, // NIK
      { wch: 15 }, // TEMPAT_LAHIR
      { wch: 12 }, // TTL
      { wch: 30 }, // ALAMAT
      { wch: 20 }, // SEKOLAH
    ];
    worksheet['!cols'] = colWidths;

    // Format TTL column as text to preserve dd/mm/yyyy format
    const range = XLSX.utils.decode_range(worksheet['!ref']);
    for (let R = range.s.r; R <= range.e.r; ++R) {
      const cellAddress = XLSX.utils.encode_cell({ r: R, c: 3 }); // TTL is column D (index 3)
      if (worksheet[cellAddress]) {
        worksheet[cellAddress].z = '@'; // Set number format to text
      }
    }

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "DataPekerja");
    
    const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
    const file = new Blob([excelBuffer], { type: "application/octet-stream" });
    saveAs(file, `DataPekerja_${new Date().toLocaleDateString('id-ID').replace(/\//g, '-')}.xlsx`);
    
    message.success("Data berhasil diekspor ke Excel!");
  };

  const exportToPDF = () => {
    const doc = new jsPDF();

    // Title at the center
    const pageWidth = doc.internal.pageSize.getWidth();
    const title = "DIKLAT BSTF II";
    doc.setFontSize(16);
    doc.text(title, pageWidth / 2, 15, { align: "center" });

    // Tanggal at the left
    const today = new Date().toLocaleDateString("id-ID");
    doc.setFontSize(12);
    doc.text(`Angkatan :`, 14, 25);
    doc.text(`Tanggal  : ${today}`, 14, 32);

    // Format table data with proper Indonesian dates
    const tableData = data.map((item) => [
      item.NAMA || '',
      item.NIK || '',
      item.TEMPAT_LAHIR || '',
      formatToIndonesianDate(item.TTL) || '',
      item.ALAMAT || '',
      item.SEKOLAH || '',
    ]);

    autoTable(doc, {
      head: [["Nama", "NIK", "Tempat Lahir", "TTL", "Alamat", "Sekolah"]],
      body: tableData,
      startY: 40, // start table after the "Tanggal"
      styles: {
        fontSize: 10,
        cellPadding: 3,
      },
      headStyles: {
        fillColor: [66, 139, 202],
        textColor: 255,
        fontStyle: 'bold',
      },
      columnStyles: {
        0: { cellWidth: 35 }, // NAMA
        1: { cellWidth: 30 }, // NIK
        2: { cellWidth: 25 }, // TEMPAT_LAHIR
        3: { cellWidth: 20 }, // TTL
        4: { cellWidth: 40 }, // ALAMAT
        5: { cellWidth: 30 }, // SEKOLAH
      },
    });

    const fileName = `DataPekerja_${new Date().toLocaleDateString('id-ID').replace(/\//g, '-')}.pdf`;
    doc.save(fileName);
    
    message.success("Data berhasil diekspor ke PDF!");
  };

  // Enhanced columns with proper date formatting
  const enhancedBaseColumns = baseColumns.map(col => {
    if (col.dataIndex === 'TTL') {
      return {
        ...col,
        render: (text) => formatToIndonesianDate(text),
      };
    }
    return col;
  });

  const columns = [
    ...enhancedBaseColumns,
    {
      title: "Aksi",
      key: "actions",
      width: 150,
      render: (_, record) => (
        <Space>
          <Button type="primary" size="small" onClick={() => handleEdit(record)}>
            Edit
          </Button>
          <Button danger size="small" onClick={() => handleDelete(record.id)}>
            Hapus
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <>
      <div style={{ marginBottom: 16 }}>
        <Space wrap>
          <Select
            value={searchField}
            onChange={setSearchField}
            style={{ width: 120 }}
          >
            <Option value="NAMA">Nama</Option>
            <Option value="NIK">NIK</Option>
          </Select>
          <Input
            placeholder={`Cari berdasarkan ${searchField}`}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{ width: 200 }}
          />
          <Button type="primary" onClick={() => setModalOpen(true)}>
            Tambah Pekerja
          </Button>
          <Button type="default" onClick={exportToExcel}>
            Export Excel
          </Button>
          <Button type="default" onClick={exportToPDF}>
            Export PDF
          </Button>
        </Space>
      </div>

      <Table
        dataSource={data}
        columns={columns}
        loading={loading}
        pagination={{
          pageSize: 10,
          showSizeChanger: true,
          showQuickJumper: true,
          showTotal: (total, range) => `${range[0]}-${range[1]} dari ${total} data`,
        }}
        rowKey="id"
        scroll={{ x: 'max-content' }}
      />

      <Modal
        open={modalOpen}
        title={selectedRow ? "Edit Pekerja" : "Tambah Pekerja"}
        onCancel={() => {
          setModalOpen(false);
          form.resetFields();
          setSelectedRow(null);
        }}
        onOk={handleSubmit}
        okText="Simpan"
        cancelText="Batal"
        width={600}
      >
        <Form 
          form={form} 
          layout="vertical" 
          initialValues={selectedRow || {}}
        >
          <Form.Item 
            name="NAMA" 
            label="Nama Lengkap" 
            rules={[
              { required: true, message: 'Nama tidak boleh kosong' },
              { min: 2, message: 'Nama minimal 2 karakter' }
            ]}
          >
            <Input placeholder="Masukkan nama lengkap" />
          </Form.Item>
          
          <Form.Item 
            name="NIK" 
            label="NIK" 
            rules={[
              { required: true, message: 'NIK tidak boleh kosong' },
              { pattern: /^\d{16}$/, message: 'NIK harus 16 digit angka' }
            ]}
          >
            <Input placeholder="Masukkan 16 digit NIK" maxLength={16} />
          </Form.Item>
          
          <Form.Item 
            name="TEMPAT_LAHIR" 
            label="Tempat Lahir" 
            rules={[{ required: true, message: 'Tempat lahir tidak boleh kosong' }]}
          >
            <Input 
              placeholder="Masukkan tempat lahir"
              onChange={(e) => {
                const uppercaseValue = e.target.value.toUpperCase();
                form.setFieldsValue({ TEMPAT_LAHIR: uppercaseValue });
              }}
            />
          </Form.Item>
          
          <Form.Item 
            name="TTL" 
            label="Tanggal Lahir" 
            rules={[{ required: true, message: 'Tanggal lahir tidak boleh kosong' }]}
          >
            <Input 
              type="date" 
              placeholder="Pilih tanggal lahir"
            />
          </Form.Item>
          
          <Form.Item 
            name="ALAMAT" 
            label="Alamat Lengkap" 
            rules={[{ required: true, message: 'Alamat tidak boleh kosong' }]}
          >
            <Input.TextArea 
              rows={3}
              placeholder="Masukkan alamat lengkap"
            />
          </Form.Item>
          
          <Form.Item 
            name="SEKOLAH" 
            label="Sekolah/Pendidikan Terakhir" 
            rules={[{ required: true, message: 'Sekolah tidak boleh kosong' }]}
          >
            <Input placeholder="Masukkan nama sekolah/pendidikan terakhir" />
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
};

export default DataPekerja;