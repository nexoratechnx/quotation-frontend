const BASE_URL = "http://localhost:8080/api";

// Helper function to get auth headers
const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    ...(token && { 'Authorization': `Bearer ${token}` })
  };
};

// Authentication APIs
export const register = async (payload) => {
  const res = await fetch(`${BASE_URL}/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error("Failed to register");
  const data = await res.json();
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
  if (!res.ok) throw new Error("Failed to login");
  const data = await res.json();
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
  if (!res.ok) throw new Error("Failed to fetch customers");
  return res.json();
};

export const fetchCustomerById = async (id) => {
  const res = await fetch(`${BASE_URL}/customers/${id}`, {
    headers: getAuthHeaders()
  });
  if (!res.ok) throw new Error("Failed to fetch customer");
  return res.json();
};

export const createCustomer = async (payload) => {
  const res = await fetch(`${BASE_URL}/customers`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error("Failed to create customer");
  return res.json();
};

export const updateCustomer = async (id, payload) => {
  const res = await fetch(`${BASE_URL}/customers/${id}`, {
    method: "PUT",
    headers: getAuthHeaders(),
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error("Failed to update customer");
  return res.json();
};

// Employee APIs
export const fetchEmployees = async () => {
  const res = await fetch(`${BASE_URL}/employees`, {
    headers: getAuthHeaders()
  });
  if (!res.ok) throw new Error("Failed to fetch employees");
  return res.json();
};

export const addEmployee = async (payload) => {
  const res = await fetch(`${BASE_URL}/employees`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error("Failed to add employee");
  return res.json();
};

// Category APIs
export const fetchCategories = async () => {
  const res = await fetch(`${BASE_URL}/categories`, {
    headers: getAuthHeaders()
  });
  if (!res.ok) throw new Error("Failed to fetch categories");
  return res.json();
};

export const addCategory = async (payload) => {
  const res = await fetch(`${BASE_URL}/categories`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error("Failed to add category");
  return res.json();
};

// Item APIs
export const fetchItems = async ({ search = "", categoryId = "" } = {}) => {
  const params = new URLSearchParams();
  if (search) params.append('search', search);
  if (categoryId) params.append('categoryId', categoryId);
  
  const res = await fetch(`${BASE_URL}/items?${params.toString()}`, {
    headers: getAuthHeaders()
  });
  if (!res.ok) throw new Error("Failed to fetch items");
  return res.json();
};

export const addItem = async (payload) => {
  const res = await fetch(`${BASE_URL}/items`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error("Failed to add item");
  return res.json();
};

// Order APIs
export const createOrder = async (payload) => {
  const res = await fetch(`${BASE_URL}/orders`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error("Failed to create order");
  return res.json();
};

export const fetchOrders = async () => {
  const res = await fetch(`${BASE_URL}/orders`, {
    headers: getAuthHeaders()
  });
  if (!res.ok) throw new Error("Failed to fetch orders");
  return res.json();
};

export const fetchOrderById = async (orderId) => {
  const res = await fetch(`${BASE_URL}/orders/${orderId}`, {
    headers: getAuthHeaders()
  });
  if (!res.ok) throw new Error("Failed to fetch order");
  return res.json();
};
