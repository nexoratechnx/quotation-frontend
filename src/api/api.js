// Use environment variable for API base URL, fallback to localhost for development
const BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8080/api";

// Helper function to get auth headers
const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    ...(token && { 'Authorization': `Bearer ${token}` })
  };
};

// Helper function to handle API responses with better error handling
const handleResponse = async (response) => {
  if (!response.ok) {
    // Handle 401 Unauthorized - token might be expired
    if (response.status === 401) {
      logout();
      window.location.href = '/';
      throw new Error('Session expired. Please login again.');
    }
    
    // Try to parse error message from response
    let errorMessage = `Request failed with status ${response.status}`;
    try {
      const errorData = await response.json();
      errorMessage = errorData.message || errorMessage;
    } catch (e) {
      // If response is not JSON, use default message
    }
    
    throw new Error(errorMessage);
  }
  return response.json();
};

// Authentication APIs
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
  const res = await fetch(`${BASE_URL}/auth/login`, {
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

export const logout = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
};

export const isAuthenticated = () => {
  return !!localStorage.getItem('token');
};

// Customer APIs
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

// Employee APIs
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

// Category APIs
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

// Item APIs
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

// Order APIs
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
