import AsyncStorage from '@react-native-async-storage/async-storage';

// ─── BASE URL ─────────────────────────────────────────────
const BASE_URL = 'http://10.92.115.223:5000/api';
// const BASE_URL = 'https://your-backend.onrender.com/api';

// ─── TOKEN HELPERS ────────────────────────────────────────
const getToken = async () => {
    return await AsyncStorage.getItem('userToken');
};

const authHeaders = async () => {
    const token = await getToken();

    return {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };
};

// ─── RESPONSE HANDLER ─────────────────────────────────────
const handleResponse = async (res) => {
    let data;

    try {
        data = await res.json();
    } catch (e) {
        throw new Error('Invalid server response');
    }

    if (!res.ok) {
        throw new Error(data?.message || 'Something went wrong');
    }

    return data;
};

//
// ─────────────────────────────────────────────
// AUTH
// ─────────────────────────────────────────────
//

export const registerUser = async (name, email, password) => {
    const res = await fetch(`${BASE_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password }),
    });

    return handleResponse(res);
};

export const loginUser = async (email, password) => {
    const res = await fetch(`${BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
    });

    return handleResponse(res);
};

export const guestLogin = async () => {
    const res = await fetch(`${BASE_URL}/auth/guest`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
    });

    return handleResponse(res);
};

//
// ─────────────────────────────────────────────
// PRODUCTS (USER)
// ─────────────────────────────────────────────
//

export const fetchProducts = async () => {
    const res = await fetch(`${BASE_URL}/products`);
    return handleResponse(res);
};

export const fetchProductById = async (id) => {
    const res = await fetch(`${BASE_URL}/products/${id}`);
    return handleResponse(res);
};

//
// ─────────────────────────────────────────────
// PRODUCTS (ADMIN CRUD)
// ─────────────────────────────────────────────
//

// CREATE PRODUCT (ADMIN)
export const createProduct = async (product) => {
    const token = await AsyncStorage.getItem('userToken');
    const res = await fetch(`${BASE_URL}/products`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
            name: product.name,
            price: product.price,
            category: product.category,
            description: product.description || '',
            countInStock: product.countInStock || 0,
            size: product.size,
            imageUrl: product.imageUrl || 'https://via.placeholder.com/300x300?text=No+Image',
        }),
    });
    return handleResponse(res);
};

// UPDATE PRODUCT (ADMIN)
export const updateProduct = async (id, product) => {
    const token = await AsyncStorage.getItem('userToken');
    const res = await fetch(`${BASE_URL}/products/${id}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
            name: product.name,
            price: product.price,
            category: product.category,
            description: product.description || '',
            countInStock: product.countInStock || 0,
            size: product.size,
            imageUrl: product.imageUrl || '',
        }),
    });
    return handleResponse(res);
};

// DELETE PRODUCT (ADMIN)
export const deleteProduct = async (id, token) => {
    const res = await fetch(`${BASE_URL}/products/${id}`, {
        method: 'DELETE',
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });
    return handleResponse(res);
};

//
// ─────────────────────────────────────────────
// CATEGORIES
// ─────────────────────────────────────────────
//

export const fetchCategories = async () => {
    const res = await fetch(`${BASE_URL}/categories`);
    return handleResponse(res);
};

//
// ─────────────────────────────────────────────
// CART
// ─────────────────────────────────────────────
//

export const fetchCart = async () => {
    const res = await fetch(`${BASE_URL}/cart`, {
        headers: await authHeaders(),
    });

    return handleResponse(res);
};

export const addToCart = async (productId, quantity, size, price) => {
    const res = await fetch(`${BASE_URL}/cart/add`, {
        method: 'POST',
        headers: await authHeaders(),
        body: JSON.stringify({ productId, quantity, size, price }),
    });

    return handleResponse(res);
};

export const removeFromCart = async (itemId) => {
    const res = await fetch(`${BASE_URL}/cart/remove/${itemId}`, {
        method: 'DELETE',
        headers: await authHeaders(),
    });

    return handleResponse(res);
};

export const clearCart = async () => {
    const res = await fetch(`${BASE_URL}/cart/clear`, {
        method: 'DELETE',
        headers: await authHeaders(),
    });

    return handleResponse(res);
};

//
// ─────────────────────────────────────────────
// ORDERS
// ─────────────────────────────────────────────
//

export const createOrder = async (orderData) => {
    const res = await fetch(`${BASE_URL}/orders`, {
        method: 'POST',
        headers: await authHeaders(),
        body: JSON.stringify(orderData),
    });

    return handleResponse(res);
};

export const fetchMyOrders = async () => {
    const res = await fetch(`${BASE_URL}/orders/myorders`, {
        headers: await authHeaders(),
    });

    return handleResponse(res);
};

export const cancelOrder = async (id) => {
    const token = await AsyncStorage.getItem('userToken');
    const res = await fetch(`${BASE_URL}/orders/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
    });
    return handleResponse(res);
};

export const updateShipping = async (id, shippingData) => {
    const token = await AsyncStorage.getItem('userToken');
    const res = await fetch(`${BASE_URL}/orders/${id}/shipping`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(shippingData),
    });
    return handleResponse(res);
};

export const fetchAllOrders = async () => {
    const token = await AsyncStorage.getItem('userToken');
    const res = await fetch(`${BASE_URL}/orders`, {
        headers: { Authorization: `Bearer ${token}` },
    });
    return handleResponse(res);
};

export const updateOrderStatus = async (id, status) => {
    const token = await AsyncStorage.getItem('userToken');
    const res = await fetch(`${BASE_URL}/orders/${id}/status`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status }),
    });
    return handleResponse(res);
};