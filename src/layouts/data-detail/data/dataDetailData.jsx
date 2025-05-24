import { useEffect, useState } from "react";
import { fetchAbk, addAbk, editAbk, deleteAbk, fetchAbkDetail, editAbkDetail, addAbkDetail } from "../../../services/api";

const dataDetailData = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchField, setSearchField] = useState("NAMA");
  const [selectedRow, setSelectedRow] = useState(null);

  useEffect(() => {
    getData();
  }, []);

  const getData = async () => {
    try {
      setLoading(true);
      const result = await fetchAbkDetail();
      setData(result);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  const addWorker = async (formData) => {
    const response = await addAbkDetail(formData);
    if (response.status === "success") await getData();
    return response;
  };
  

  const updateWorker = async (formData) => {
    await editAbkDetail(formData);
    await getData();
    // alert("Data berhasil diubah!");
  };

  const removeWorker = async (id) => {
    await deleteAbk(id);
    await getData();
  };

  const filteredData = data.filter((item) => {
    const value = item[searchField]?.toString().toLowerCase() || "";
    return value.includes(searchQuery.toLowerCase());
  });

  // Columns without action buttons
  const columns = [
    { title: "Nama", dataIndex: "NAMA", key: "NAMA" },
    { title: "NIK", dataIndex: "NIK", key: "NIK" },
    { title: "Tempat Lahir", dataIndex: "TEMPAT_LAHIR", key: "TEMPAT_LAHIR" },
    { title: "TTL", dataIndex: "TTL", key: "TTL" },
    { title: "Agama", dataIndex: "AGAMA", key: "AGAMA" },
    { title: "Nama Ibu", dataIndex: "NAMA_IBU", key: "NAMA_IBU" },
    { title: "Pendidikan Terakhir", dataIndex: "PENDIDIKAN_TERAKHIR", key: "PENDIDIKAN_TERAKHIR" },
    { title: "Sekolah", dataIndex: "SEKOLAH", key: "SEKOLAH" },
    { title: "KTP", dataIndex: "KTP", key: "KTP" },
    { title: "KK", dataIndex: "KK", key: "KK" },
    { title: "Ijazah", dataIndex: "IJAZAH", key: "IJAZAH" },
    { title: "Akta Lahir", dataIndex: "AKTA_KELAHIRAN", key: "AKTA_KELAHIRAN" },
    { title: "BSTF II", dataIndex: "BSTFII", key: "BSTFII" },
    { title: "Alamat", dataIndex: "ALAMAT", key: "ALAMAT" },
    { title: "Provinsi", dataIndex: "PROVINSI", key: "PROVINSI" },
    { title: "Kota", dataIndex: "KOTA", key: "KOTA" },
    { title: "Kecamatan", dataIndex: "KECAMATAN", key: "KECAMATAN" },
    { title: "RT/RW", dataIndex: "RT_RW", key: "RT_RW" },
    { title: "Warna Rambut", dataIndex: "WARNA_RAMBUT", key: "WARNA_RAMBUT" },
    { title: "Warna Mata", dataIndex: "WARNA_MATA", key: "WARNA_MATA" },
    { title: "Warna Kulit", dataIndex: "WARNA_KULIT", key: "WARNA_KULIT" },
    { title: "Tinggi Badan", dataIndex: "TINGGI_BADAN", key: "TINGGI_BADAN" },
    { title: "Berat Badan", dataIndex: "BERAT_BADAN", key: "BERAT_BADAN" },
    { title: "Golongan Darah", dataIndex: "GOLONGAN_DARAH", key: "GOLONGAN_DARAH" },
    { title: "Nama Kapal", dataIndex: "NAMA_KAPAL", key: "NAMA_KAPAL" },
  ];

  return {
    data: filteredData,
    loading,
    baseColumns: columns, // renamed
    searchQuery,
    setSearchQuery,
    searchField,
    setSearchField,
    addWorker,
    updateWorker,
    removeWorker,
    selectedRow,
    setSelectedRow,
  };
};

export default dataDetailData;
