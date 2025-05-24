import { useEffect, useState } from "react";
import { fetchAbk, addAbk, editAbk, deleteAbk } from "../../../services/api";

const dataPekerjaData = () => {
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
      const result = await fetchAbk();
      setData(result);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  const addWorker = async (formData) => {
    const response = await addAbk(formData);
    if (response.status === "success") await getData();
    return response;
  };
  

  const updateWorker = async (formData) => {
    await editAbk(formData);
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
    { title: "Alamat", dataIndex: "ALAMAT", key: "ALAMAT" },
    { title: "Sekolah", dataIndex: "SEKOLAH", key: "SEKOLAH" },
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

export default dataPekerjaData;
