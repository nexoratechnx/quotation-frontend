const BASE_URL = import.meta.env.VITE_API_BASE_URL || "https://quotation-backend-2-ugvx.onrender.com/api";

console.log('🔗 API Base URL:', BASE_URL);

const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    ...(token && { 'Authorization': `Bearer ${token}` })
  };
};

const handleResponse = async (response) => {
  if (!response.ok) {
    if (response.status === 401) {
      console.warn('⚠️ Unauthorized (401) - Logging out...');
      logout();
      window.location.href = '/';
      throw new Error('Session expired. Please login again.');
    }

    let errorMessage = `Request failed with status ${response.status}`;
    try {
      const errorData = await response.json();
      errorMessage = errorData.message || errorMessage;
      console.error('❌ API Error:', errorMessage, errorData);
    } catch (e) {
      console.error('❌ API Error:', errorMessage);
    }

    throw new Error(errorMessage);
  }
  return response.json();
};

export const register = async (payload) => {
  const res = await fetch(`${BASE_URL}/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  const data = await handleResponse(res);
  if (data.token) {
    localStorage.setItem('token', data.token);
    localStorage.setItem('user', JSON.stringify({ name: data.name, email: data.email }));
  }
  return data;
};

export const login = async (payload) => {
  console.log('🔐 Attempting login for:', payload.email);
  const res = await fetch(`${BASE_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  const data = await handleResponse(res);
  if (data.token) {
    localStorage.setItem('token', data.token);
    localStorage.setItem('user', JSON.stringify({ name: data.name, email: data.email }));
    console.log('✅ Login successful:', data.email);
  }
  return data;
};

export const logout = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
};

export const isAuthenticated = () => {
  return !!localStorage.getItem('token');
};

export const fetchCustomers = async (search = "") => {
  const res = await fetch(`${BASE_URL}/customers?search=${search}`, {
    headers: getAuthHeaders()
  });
  return handleResponse(res);
};

export const fetchCustomerById = async (id) => {
  const res = await fetch(`${BASE_URL}/customers/${id}`, {
    headers: getAuthHeaders()
  });
  return handleResponse(res);
};

export const createCustomer = async (payload) => {
  const res = await fetch(`${BASE_URL}/customers`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify(payload),
  });
  return handleResponse(res);
};

export const updateCustomer = async (id, payload) => {
  const res = await fetch(`${BASE_URL}/customers/${id}`, {
    method: "PUT",
    headers: getAuthHeaders(),
    body: JSON.stringify(payload),
  });
  return handleResponse(res);
};

export const fetchEmployees = async () => {
  const res = await fetch(`${BASE_URL}/employees`, {
    headers: getAuthHeaders()
  });
  return handleResponse(res);
};

export const addEmployee = async (payload) => {
  const res = await fetch(`${BASE_URL}/employees`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify(payload),
  });
  return handleResponse(res);
};

export const fetchCategories = async () => {
  const res = await fetch(`${BASE_URL}/categories`, {
    headers: getAuthHeaders()
  });
  return handleResponse(res);
};

export const addCategory = async (payload) => {
  const res = await fetch(`${BASE_URL}/categories`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify(payload),
  });
  return handleResponse(res);
};

export const deleteCategory = async (id) => {
  const res = await fetch(`${BASE_URL}/categories/${id}`, {
    method: "DELETE",
    headers: getAuthHeaders(),
  });
  if (!res.ok) await handleResponse(res);
};

export const fetchItems = async ({ search = "", categoryId = "" } = {}) => {
  const params = new URLSearchParams();
  if (search) params.append('search', search);
  if (categoryId) params.append('categoryId', categoryId);

  const res = await fetch(`${BASE_URL}/items?${params.toString()}`, {
    headers: getAuthHeaders()
  });
  return handleResponse(res);
};

export const addItem = async (payload) => {
  const res = await fetch(`${BASE_URL}/items`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify(payload),
  });
  return handleResponse(res);
};

export const updateItem = async (id, payload) => {
  const res = await fetch(`${BASE_URL}/items/${id}`, {
    method: "PUT",
    headers: getAuthHeaders(),
    body: JSON.stringify(payload),
  });
  return handleResponse(res);
};

export const deleteItem = async (id) => {
  const res = await fetch(`${BASE_URL}/items/${id}`, {
    method: "DELETE",
    headers: getAuthHeaders(),
  });
  if (!res.ok) await handleResponse(res);
};

export const createOrder = async (payload) => {
  const res = await fetch(`${BASE_URL}/orders`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify(payload),
  });
  return handleResponse(res);
};

export const fetchOrders = async () => {
  const res = await fetch(`${BASE_URL}/orders`, {
    headers: getAuthHeaders()
  });
  return handleResponse(res);
};

export const fetchOrderById = async (orderId) => {
  const res = await fetch(`${BASE_URL}/orders/${orderId}`, {
    headers: getAuthHeaders()
  });
  return handleResponse(res);
};

export const updateOrderStatus = async (orderId, status) => {
  const res = await fetch(`${BASE_URL}/orders/${orderId}/status`, {
    method: "PATCH",
    headers: getAuthHeaders(),
    body: JSON.stringify({ status })
  });
  return handleResponse(res);
};

export const fetchPipeItems = async () => {
  const res = await fetch(`${BASE_URL}/pipe/all`, {
    headers: getAuthHeaders()
  });
  return handleResponse(res);
};

export const calculatePipeWeight = async ({ variant, size, thickness, length }) => {
  const res = await fetch(`${BASE_URL}/pipe/calculate`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify({
      variant: String(variant),
      size: String(size),
      thickness: String(thickness),
      length: String(length)
    })
  });
  return handleResponse(res);
};

export const fetchSteelItems = async () => {
  const res = await fetch(`${BASE_URL}/steel/all`, {
    headers: getAuthHeaders()
  });
  return handleResponse(res);
};

export const calculateSteelWeight = async ({ type, size, length }) => {
  const res = await fetch(`${BASE_URL}/steel/calculate`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify({
      type: String(type),
      size: String(size),
      length: String(length)
    })
  });
  return handleResponse(res);
};

export const fetchSheetItems = async () => {
  const res = await fetch(`${BASE_URL}/sheet/all`, {
    headers: getAuthHeaders()
  });
  return handleResponse(res);
};

export const calculateSheetWeight = async ({ size, thickness, quantity }) => {
  const res = await fetch(`${BASE_URL}/sheet/calculate`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify({
      size: String(size),
      thickness: String(thickness),
      quantity: String(quantity)
    })
  });
  return handleResponse(res);
};
