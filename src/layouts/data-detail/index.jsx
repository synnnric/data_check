import {
  Button,
  Input,
  Modal,
  Select,
  Space,
  Table,
  Form,
  message,
  Checkbox,
  Row,
  Col,
} from "antd";
import { useEffect, useState } from "react";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import dataDetailData from "./data/dataDetailData";

const { Option } = Select;

const DataDetail = () => {
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
  } = dataDetailData();

  const [modalOpen, setModalOpen] = useState(false);
  const [columnSelectModalOpen, setColumnSelectModalOpen] = useState(false);
  const [pdfTitle, setPdfTitle] = useState("ANKAPIN III");
  const [form] = Form.useForm();

  // Available columns for export
  const availableColumns = [
    { key: "NAMA", label: "Nama" },
    { key: "NIK", label: "NIK" },
    { key: "TEMPAT_LAHIR", label: "Tempat Lahir" },
    { key: "TTL", label: "Tanggal Lahir" },
    { key: "AGAMA", label: "Agama" },
    { key: "NAMA_IBU", label: "Nama Ibu" },
    { key: "PENDIDIKAN_TERAKHIR", label: "Pendidikan Terakhir" },
    { key: "SEKOLAH", label: "Sekolah" },
    { key: "KTP", label: "KTP" },
    { key: "KK", label: "KK" },
    { key: "IJAZAH", label: "Ijazah" },
    { key: "AKTA_KELAHIRAN", label: "Akta Lahir" },
    { key: "BSTFII", label: "BSTF II" },
    { key: "ALAMAT", label: "Alamat" },
    { key: "PROVINSI", label: "Provinsi" },
    { key: "KOTA", label: "Kota" },
    { key: "KECAMATAN", label: "Kecamatan" },
    { key: "RT_RW", label: "RT/RW" },
    { key: "WARNA_RAMBUT", label: "Warna Rambut" },
    { key: "WARNA_MATA", label: "Warna Mata" },
    { key: "WARNA_KULIT", label: "Warna Kulit" },
    { key: "TINGGI_BADAN", label: "Tinggi Badan" },
    { key: "BERAT_BADAN", label: "Berat Badan" },
    { key: "GOLONGAN_DARAH", label: "Golongan Darah" },
    { key: "NAMA_KAPAL", label: "Nama Kapal" },
  ];

  // Selected columns for export (default: all columns selected)
  const [selectedColumns, setSelectedColumns] = useState(
    availableColumns.map(col => col.key)
  );

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

  useEffect(() => {
    if (selectedRow) {
      // Convert TTL to date input format for editing
      const formValues = { ...selectedRow };
      if (formValues.TTL) {
        formValues.TTL = formatToDateInput(formValues.TTL);
      }
      form.setFieldsValue(formValues);
    }
  }, [selectedRow, form]);

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
    setModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm("Yakin ingin menghapus data ini?")) {
      await removeWorker(id);
      message.success("Data berhasil dihapus!");
    }
  };

  const handleColumnSelection = (checkedValues) => {
    setSelectedColumns(checkedValues);
  };

  const selectAllColumns = () => {
    setSelectedColumns(availableColumns.map(col => col.key));
  };

  const deselectAllColumns = () => {
    setSelectedColumns([]);
  };

  const exportToExcel = () => {
    if (selectedColumns.length === 0) {
      message.warning("Pilih minimal satu kolom untuk diekspor!");
      return;
    }

    // Filter data to include only selected columns
    const filteredData = data.map(item => {
      const filteredItem = {};
      selectedColumns.forEach(col => {
        // Format specific columns
        if (col === "TTL") {
          filteredItem[col] = formatToIndonesianDate(item[col]);
        } else if (col === "TINGGI_BADAN") {
          filteredItem[col] = item[col] ? `${item[col]} CM` : '';
        } else if (col === "BERAT_BADAN") {
          filteredItem[col] = item[col] ? `${item[col]} KG` : '';
        } else {
          filteredItem[col] = item[col] || '';
        }
      });
      return filteredItem;
    });

    const worksheet = XLSX.utils.json_to_sheet(filteredData);
    
    // Set column widths for better readability
    const colWidths = selectedColumns.map(col => {
      switch(col) {
        case 'NAMA': return { wch: 25 };
        case 'NIK': return { wch: 18 };
        case 'ALAMAT': return { wch: 35 };
        case 'TTL': return { wch: 12 };
        case 'TEMPAT_LAHIR': return { wch: 15 };
        case 'SEKOLAH': return { wch: 25 };
        default: return { wch: 15 };
      }
    });
    worksheet['!cols'] = colWidths;

    // Format TTL column as text to preserve dd/mm/yyyy format
    if (selectedColumns.includes('TTL')) {
      const range = XLSX.utils.decode_range(worksheet['!ref']);
      const ttlIndex = selectedColumns.indexOf('TTL');
      for (let R = range.s.r; R <= range.e.r; ++R) {
        const cellAddress = XLSX.utils.encode_cell({ r: R, c: ttlIndex });
        if (worksheet[cellAddress]) {
          worksheet[cellAddress].z = '@'; // Set number format to text
        }
      }
    }

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "DataPekerja");
    const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
    const file = new Blob([excelBuffer], { type: "application/octet-stream" });
    
    const timestamp = new Date().toLocaleDateString('id-ID').replace(/\//g, '-');
    saveAs(file, `DataPekerja_${timestamp}.xlsx`);
    
    setColumnSelectModalOpen(false);
    message.success("Data berhasil diekspor ke Excel!");
  };

  const exportToPDF = () => {
    const doc = new jsPDF({ orientation: "landscape", format: 'a4' });
    const pageWidth = doc.internal.pageSize.getWidth();
    
    // Title
    doc.setFontSize(16);
    doc.text(`DIKLAT ${pdfTitle}`, pageWidth / 2, 15, { align: "center" });

    // Date info
    const today = formatToIndonesianDate(new Date());
    doc.setFontSize(12);
    doc.text("Angkatan :", 14, 25);
    doc.text(`Tanggal   : ${today}`, 14, 32);

    // Prepare table data with proper formatting
    const tableData = data.map((item) => [
      item.NAMA || '',
      item.NIK || '',
      item.TEMPAT_LAHIR || '',
      formatToIndonesianDate(item.TTL) || '',
      item.AGAMA || '',
      item.NAMA_IBU || '',
      item.PENDIDIKAN_TERAKHIR || '',
      item.SEKOLAH || '',
      item.KTP || '',
      item.KK || '',
      item.IJAZAH || '',
      item.AKTA_KELAHIRAN || '',
      item.BSTFII || '',
      item.ALAMAT || '',
      item.PROVINSI || '',
      item.KOTA || '',
      item.KECAMATAN || '',
      item.RT_RW || '',
      item.WARNA_RAMBUT || '',
      item.WARNA_MATA || '',
      item.WARNA_KULIT || '',
      item.TINGGI_BADAN ? `${item.TINGGI_BADAN} CM` : '',
      item.BERAT_BADAN ? `${item.BERAT_BADAN} KG` : '',
      item.GOLONGAN_DARAH || '',
      item.NAMA_KAPAL || ''
    ]);

    autoTable(doc, {
      head: [[
        "Nama", "NIK", "Tempat Lahir", "TTL", "Agama", "Nama Ibu", "Pendidikan Terakhir", "Sekolah", "KTP", "KK", "Ijazah",
        "Akta Lahir", "BSTF II", "Alamat", "Provinsi", "Kota", "Kecamatan", "RT/RW", "Warna Rambut", "Warna Mata",
        "Warna Kulit", "Tinggi Badan", "Berat Badan", "Golongan Darah", "Nama Kapal"
      ]],
      body: tableData,
      startY: 38,
      styles: {
        fontSize: 8,
        cellPadding: 2,
      },
      headStyles: {
        fillColor: [66, 139, 202],
        textColor: 255,
        fontStyle: 'bold',
        fontSize: 8,
      },
      columnStyles: {
        0: { cellWidth: 25 }, // NAMA
        1: { cellWidth: 20 }, // NIK
        2: { cellWidth: 18 }, // TEMPAT_LAHIR
        3: { cellWidth: 15 }, // TTL
        4: { cellWidth: 12 }, // AGAMA
        5: { cellWidth: 20 }, // NAMA_IBU
        6: { cellWidth: 15 }, // PENDIDIKAN_TERAKHIR
        7: { cellWidth: 20 }, // SEKOLAH
        8: { cellWidth: 8 },  // KTP
        9: { cellWidth: 8 },  // KK
        10: { cellWidth: 8 }, // IJAZAH
        11: { cellWidth: 12 }, // AKTA_KELAHIRAN
        12: { cellWidth: 10 }, // BSTFII
        13: { cellWidth: 30 }, // ALAMAT
        14: { cellWidth: 15 }, // PROVINSI
        15: { cellWidth: 15 }, // KOTA
        16: { cellWidth: 15 }, // KECAMATAN
        17: { cellWidth: 12 }, // RT_RW
        18: { cellWidth: 12 }, // WARNA_RAMBUT
        19: { cellWidth: 12 }, // WARNA_MATA
        20: { cellWidth: 12 }, // WARNA_KULIT
        21: { cellWidth: 12 }, // TINGGI_BADAN
        22: { cellWidth: 12 }, // BERAT_BADAN
        23: { cellWidth: 10 }, // GOLONGAN_DARAH
        24: { cellWidth: 15 }, // NAMA_KAPAL
      },
    });

    const timestamp = new Date().toLocaleDateString('id-ID').replace(/\//g, '-');
    doc.save(`DataPekerja_${pdfTitle}_${timestamp}.pdf`);
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
    if (col.dataIndex === 'TINGGI_BADAN') {
      return {
        ...col,
        render: (text) => text ? `${text} CM` : '',
      };
    }
    if (col.dataIndex === 'BERAT_BADAN') {
      return {
        ...col,
        render: (text) => text ? `${text} KG` : '',
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
      fixed: 'right',
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
          <Select value={searchField} onChange={setSearchField} style={{ width: 120 }}>
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
            Tambah Data
          </Button>
          <Select value={pdfTitle} onChange={setPdfTitle} style={{ width: 150 }}>
            <Option value="ANKAPIN III">ANKAPIN III</Option>
            <Option value="ATKAPIN III">ATKAPIN III</Option>
          </Select>
          <Button type="default" onClick={() => setColumnSelectModalOpen(true)}>
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
        rowKey="NIK" 
        scroll={{ x: "max-content" }} 
      />

      {/* Column Selection Modal for Excel Export */}
      <Modal
        open={columnSelectModalOpen}
        title="Pilih Kolom untuk Export Excel"
        onCancel={() => setColumnSelectModalOpen(false)}
        onOk={exportToExcel}
        okText="Export Excel"
        cancelText="Batal"
        width={800}
      >
        <div style={{ marginBottom: 16 }}>
          <Space>
            <Button size="small" onClick={selectAllColumns}>
              Pilih Semua
            </Button>
            <Button size="small" onClick={deselectAllColumns}>
              Hapus Semua
            </Button>
            <span style={{ marginLeft: 16, color: '#666' }}>
              {selectedColumns.length} dari {availableColumns.length} kolom dipilih
            </span>
          </Space>
        </div>
        
        <Checkbox.Group 
          value={selectedColumns} 
          onChange={handleColumnSelection}
          style={{ width: '100%' }}
        >
          <Row gutter={[16, 8]}>
            {availableColumns.map(column => (
              <Col span={8} key={column.key}>
                <Checkbox value={column.key}>
                  {column.label}
                </Checkbox>
              </Col>
            ))}
          </Row>
        </Checkbox.Group>
      </Modal>

      {/* Add/Edit Worker Modal */}
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
        width={800}
      >
        <Form form={form} layout="vertical">
          <Row gutter={16}>
            {[
              { name: "NAMA", label: "Nama Lengkap", span: 12 },
              { name: "NIK", label: "NIK", span: 12 },
              { name: "TEMPAT_LAHIR", label: "Tempat Lahir", span: 12 },
              { name: "TTL", label: "Tanggal Lahir", type: "date", span: 12 },
              { name: "AGAMA", label: "Agama", type: "select", options: ["Islam", "Kristen", "Katolik", "Hindu", "Buddha", "Konghucu"], span: 12 },
              { name: "NAMA_IBU", label: "Nama Ibu", span: 12 },
              { name: "PENDIDIKAN_TERAKHIR", label: "Pendidikan Terakhir", type: "select", options: ["SD", "SMP", "SMA", "D1", "D2", "D3", "D4", "S1", "S2"], span: 12 },
              { name: "SEKOLAH", label: "Sekolah", span: 12 },
              { name: "KTP", label: "KTP", type: "select", options: ["Ada", "Tidak Ada"], span: 8 },
              { name: "KK", label: "KK", type: "select", options: ["Ada", "Tidak Ada"], span: 8 },
              { name: "IJAZAH", label: "Ijazah", type: "select", options: ["Ada", "Tidak Ada"], span: 8 },
              { name: "AKTA_KELAHIRAN", label: "Akta Lahir", type: "select", options: ["Ada", "Tidak Ada"], span: 12 },
              { name: "BSTFII", label: "BSTF II", span: 12 },
              { name: "ALAMAT", label: "Alamat Lengkap", span: 24 },
              { name: "PROVINSI", label: "Provinsi", span: 8 },
              { name: "KOTA", label: "Kota", span: 8 },
              { name: "KECAMATAN", label: "Kecamatan", span: 8 },
              { name: "RT_RW", label: "RT/RW", span: 8 },
              { name: "WARNA_RAMBUT", label: "Warna Rambut", span: 8 },
              { name: "WARNA_MATA", label: "Warna Mata", span: 8 },
              { name: "WARNA_KULIT", label: "Warna Kulit", span: 8 },
              { name: "TINGGI_BADAN", label: "Tinggi Badan", span: 8 },
              { name: "BERAT_BADAN", label: "Berat Badan", span: 8 },
              { name: "GOLONGAN_DARAH", label: "Golongan Darah", type: "select", options: ["A", "B", "AB", "O"], span: 8 },
              { name: "NAMA_KAPAL", label: "Nama Kapal", span: 8 },
            ].map((field) => (
              <Col span={field.span || 12} key={field.name}>
                <Form.Item
                  name={field.name}
                  label={field.label}
                  rules={field.name === "NAMA" || field.name === "NIK" ? 
                    [{ required: true, message: `${field.label} wajib diisi` }] : []
                  }
                >
                  {field.name === "TINGGI_BADAN" ? (
                    <Input type="number" placeholder="170" addonAfter="CM" />
                  ) : field.name === "BERAT_BADAN" ? (
                    <Input type="number" placeholder="65" addonAfter="KG" />
                  ) : field.name === "ALAMAT" ? (
                    <Input.TextArea rows={3} placeholder="Masukkan alamat lengkap" />
                  ) : field.type === "select" ? (
                    <Select placeholder="- Pilih -" allowClear>
                      {field.options.map((opt) => (
                        <Option key={opt} value={opt}>
                          {opt}
                        </Option>
                      ))}
                    </Select>
                  ) : (
                    <Input 
                      type={field.type || "text"} 
                      placeholder={`Masukkan ${field.label.toLowerCase()}`}
                    />
                  )}
                </Form.Item>
              </Col>
            ))}
          </Row>
        </Form>
      </Modal>
    </>
  );
};

export default DataDetail;