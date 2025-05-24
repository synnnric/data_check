// Set the base URL relative to your frontend
const BASEURL = "http://localhost/data_check_backend";

export async function fetchAbk() {
  try {
    const response = await fetch(`${BASEURL}/fetch_abk.php`);
    const result = await response.json();

    if (result.status === 'success') {
      return result.data;
    } else {
      throw new Error(result.message || "Unknown error from backend");
    }
  } catch (error) {
    console.error("API Error:", error);
    return [];
  }
}

export async function findAbk(data) {
  try {
    const response = await fetch(`${BASEURL}/find_abk.php`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    const result = await response.json();

    if (result.status === 'success') {
      return result.data;
    } else {
      throw new Error(result.message || "Unknown error from backend");
    }
  } catch (error) {
    console.error("API Error:", error);
    return [];
  }
}

export async function fetchAbkDetail() {
  try {
    const response = await fetch(`${BASEURL}/fetch_abk_detail.php`);
    const result = await response.json();

    if (result.status === 'success') {
      return result.data;
    } else {
      throw new Error(result.message || "Unknown error from backend");
    }
  } catch (error) {
    console.error("API Error:", error);
    return [];
  }
}

export async function addAbk(newData) {
    try {
      const response = await fetch(`${BASEURL}/add_abk.php`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newData),
      });
  
      const result = await response.json();
      return result; // ✅ always return the full response
    } catch (error) {
      console.error("API Error:", error);
      return { status: "error", message: error.message };
    }
  }

export async function addAbkDetail(newData) {
    try {
      const response = await fetch(`${BASEURL}/add_abk_detail.php`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newData),
      });
  
      const result = await response.json();
      return result; // ✅ always return the full response
    } catch (error) {
      console.error("API Error:", error);
      return { status: "error", message: error.message };
    }
  }
  

  export async function editAbk(data) {
    const response = await fetch(`${BASEURL}/edit_abk.php`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data)
    });
    return await response.json();
  
  }
  export async function editAbkDetail(data) {
    const response = await fetch(`${BASEURL}/edit_abk_detail.php`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data)
    });
    return await response.json();
  }
  
  export async function deleteAbk(id) {
    const response = await fetch(`${BASEURL}/delete_abk.php`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id })
    });
    return await response.json();
  }

  export async function importAbk(data) {
    try {
      const response = await fetch(`${BASEURL}/import_abk.php`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
  
      const result = await response.json();
      return result; // ✅ always return the full response
    } catch (error) {
      console.error("API Error:", error);
      return { status: "error", message: error.message };
    }
  }
  
