/**
 * Unit Tests for Home Screen / Product List API Logic
 * Member: IT24101992
 * Component: Home Screen (Product List)
 * Framework: Jest
 *
 * Run with:
 *   cd "testing app"
 *   npm install
 *   npm run test:home
 */

// Mock AsyncStorage behavior used by frontend/src/services/api.js
const AsyncStorage = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
};

// Mock fetch for API unit tests
global.fetch = jest.fn();

const BASE_URL = 'http://localhost:5000/api';

const getToken = async () => AsyncStorage.getItem('userToken');

const authHeaders = async () => {
  const token = await getToken();
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
};

const handleResponse = async (res) => {
  let data;
  try {
    data = await res.json();
  } catch (_e) {
    throw new Error('Invalid server response');
  }
  if (!res.ok) {
    throw new Error(data?.message || 'Something went wrong');
  }
  return data;
};

// Recreated product API functions from frontend/src/services/api.js
const fetchProducts = async () => {
  const res = await fetch(`${BASE_URL}/products`, {
    headers: await authHeaders(),
  });
  return handleResponse(res);
};

const fetchProductById = async (productId) => {
  const res = await fetch(`${BASE_URL}/products/${productId}`, {
    headers: await authHeaders(),
  });
  return handleResponse(res);
};

const fetchProductsByCategory = async (categoryId) => {
  const res = await fetch(`${BASE_URL}/products?category=${categoryId}`, {
    headers: await authHeaders(),
  });
  return handleResponse(res);
};

const searchProducts = async (query) => {
  const res = await fetch(`${BASE_URL}/products?search=${encodeURIComponent(query)}`, {
    headers: await authHeaders(),
  });
  return handleResponse(res);
};

const fetchCategories = async () => {
  const res = await fetch(`${BASE_URL}/categories`, {
    headers: await authHeaders(),
  });
  return handleResponse(res);
};

// Business logic helpers used by HomeScreen
const filterByCategory = (products = [], categoryId) => {
  if (!categoryId || categoryId === 'all') return products;
  return products.filter((p) => p.category === categoryId);
};

const filterBySearch = (products = [], query = '') => {
  const q = query.trim().toLowerCase();
  if (!q) return products;
  return products.filter(
    (p) =>
      p.name?.toLowerCase().includes(q) ||
      p.description?.toLowerCase().includes(q)
  );
};

const filterNewArrivals = (products = []) =>
  products.filter((p) => p.isNew === true);

const filterDiscounted = (products = []) =>
  products.filter((p) => p.discount > 0);

const formatPrice = (price) => {
  const num = Number(price || 0);
  return `LKR ${num.toLocaleString()}`;
};

const normalizeProducts = (data) => data?.products || data || [];

const sortByPriceAsc = (products = []) =>
  [...products].sort((a, b) => Number(a.price) - Number(b.price));

const sortByPriceDesc = (products = []) =>
  [...products].sort((a, b) => Number(b.price) - Number(a.price));

// Helpers
const mockFetchSuccess = (data) => {
  fetch.mockResolvedValueOnce({
    ok: true,
    json: async () => data,
  });
};

const mockFetchFail = (message, status = 400) => {
  fetch.mockResolvedValueOnce({
    ok: false,
    status,
    json: async () => ({ message }),
  });
};

// ─── fetchProducts ────────────────────────────────────────────────────────────

describe('fetchProducts', () => {
  beforeEach(() => {
    fetch.mockClear();
    AsyncStorage.getItem.mockClear();
  });

  test('should fetch all products successfully', async () => {
    AsyncStorage.getItem.mockResolvedValueOnce('mock-user-token');
    const mockProducts = [
      { _id: 'p1', name: 'Pleated Midi Skirt', price: 4999, category: 'Women' },
      { _id: 'p2', name: 'Blue Denim', price: 3000, category: 'Men', isNew: true },
      { _id: 'p3', name: 'Summer Dress', price: 1650, category: 'Women' },
    ];
    mockFetchSuccess(mockProducts);

    const result = await fetchProducts();

    expect(result).toEqual(mockProducts);
    expect(result).toHaveLength(3);
  });

  test('should call the correct products endpoint', async () => {
    AsyncStorage.getItem.mockResolvedValueOnce('mock-user-token');
    mockFetchSuccess([]);

    await fetchProducts();

    expect(fetch).toHaveBeenCalledWith(
      `${BASE_URL}/products`,
      expect.objectContaining({
        headers: expect.objectContaining({
          Authorization: 'Bearer mock-user-token',
        }),
      })
    );
  });

  test('should return empty array when no products exist', async () => {
    AsyncStorage.getItem.mockResolvedValueOnce('mock-user-token');
    mockFetchSuccess([]);

    const result = await fetchProducts();

    expect(result).toEqual([]);
    expect(result).toHaveLength(0);
  });

  test('should throw error when user is not authorized', async () => {
    AsyncStorage.getItem.mockResolvedValueOnce('bad-token');
    mockFetchFail('Not authorized, token failed', 401);

    await expect(fetchProducts()).rejects.toThrow('Not authorized, token failed');
  });
});

// ─── fetchProductById ─────────────────────────────────────────────────────────

describe('fetchProductById', () => {
  beforeEach(() => {
    fetch.mockClear();
    AsyncStorage.getItem.mockClear();
  });

  test('should fetch a single product by ID successfully', async () => {
    AsyncStorage.getItem.mockResolvedValueOnce('mock-user-token');
    const mockProduct = {
      _id: 'p1',
      name: 'Pleated Midi Skirt',
      price: 4999,
      category: 'Women',
      description: 'A stylish midi skirt',
    };
    mockFetchSuccess(mockProduct);

    const result = await fetchProductById('p1');

    expect(result).toEqual(mockProduct);
    expect(result._id).toBe('p1');
    expect(result.name).toBe('Pleated Midi Skirt');
  });

  test('should call the correct product detail endpoint', async () => {
    AsyncStorage.getItem.mockResolvedValueOnce('mock-user-token');
    mockFetchSuccess({});

    await fetchProductById('p1');

    expect(fetch).toHaveBeenCalledWith(
      `${BASE_URL}/products/p1`,
      expect.anything()
    );
  });

  test('should throw error when product is not found', async () => {
    AsyncStorage.getItem.mockResolvedValueOnce('mock-user-token');
    mockFetchFail('Product not found', 404);

    await expect(fetchProductById('invalid-id')).rejects.toThrow('Product not found');
  });
});

// ─── fetchProductsByCategory ──────────────────────────────────────────────────

describe('fetchProductsByCategory', () => {
  beforeEach(() => {
    fetch.mockClear();
    AsyncStorage.getItem.mockClear();
  });

  test('should fetch products filtered by category', async () => {
    AsyncStorage.getItem.mockResolvedValueOnce('mock-user-token');
    const womenProducts = [
      { _id: 'p1', name: 'Pleated Midi Skirt', category: 'Women' },
      { _id: 'p3', name: 'Summer Dress', category: 'Women' },
    ];
    mockFetchSuccess(womenProducts);

    const result = await fetchProductsByCategory('Women');

    expect(result).toHaveLength(2);
    expect(result.every((p) => p.category === 'Women')).toBe(true);
  });

  test('should include category query param in the URL', async () => {
    AsyncStorage.getItem.mockResolvedValueOnce('mock-user-token');
    mockFetchSuccess([]);

    await fetchProductsByCategory('Men');

    expect(fetch).toHaveBeenCalledWith(
      `${BASE_URL}/products?category=Men`,
      expect.anything()
    );
  });

  test('should return empty array when no products match category', async () => {
    AsyncStorage.getItem.mockResolvedValueOnce('mock-user-token');
    mockFetchSuccess([]);

    const result = await fetchProductsByCategory('Kids');

    expect(result).toEqual([]);
  });
});

// ─── searchProducts ───────────────────────────────────────────────────────────

describe('searchProducts', () => {
  beforeEach(() => {
    fetch.mockClear();
    AsyncStorage.getItem.mockClear();
  });

  test('should search products by keyword successfully', async () => {
    AsyncStorage.getItem.mockResolvedValueOnce('mock-user-token');
    const mockResults = [
      { _id: 'p2', name: 'Blue Denim', price: 3000, category: 'Men' },
    ];
    mockFetchSuccess(mockResults);

    const result = await searchProducts('denim');

    expect(result).toHaveLength(1);
    expect(result[0].name).toBe('Blue Denim');
  });

  test('should encode the search query in the URL', async () => {
    AsyncStorage.getItem.mockResolvedValueOnce('mock-user-token');
    mockFetchSuccess([]);

    await searchProducts('summer dress');

    expect(fetch).toHaveBeenCalledWith(
      `${BASE_URL}/products?search=summer%20dress`,
      expect.anything()
    );
  });

  test('should return empty array when no products match search', async () => {
    AsyncStorage.getItem.mockResolvedValueOnce('mock-user-token');
    mockFetchSuccess([]);

    const result = await searchProducts('xyznotexist');

    expect(result).toEqual([]);
  });
});

// ─── fetchCategories ──────────────────────────────────────────────────────────

describe('fetchCategories', () => {
  beforeEach(() => {
    fetch.mockClear();
    AsyncStorage.getItem.mockClear();
  });

  test('should fetch all categories successfully', async () => {
    AsyncStorage.getItem.mockResolvedValueOnce('mock-user-token');
    const mockCategories = [
      { _id: 'c1', name: 'Women' },
      { _id: 'c2', name: 'Men' },
      { _id: 'c3', name: 'Kids' },
    ];
    mockFetchSuccess(mockCategories);

    const result = await fetchCategories();

    expect(result).toHaveLength(3);
    expect(result[0].name).toBe('Women');
  });

  test('should call the correct categories endpoint', async () => {
    AsyncStorage.getItem.mockResolvedValueOnce('mock-user-token');
    mockFetchSuccess([]);

    await fetchCategories();

    expect(fetch).toHaveBeenCalledWith(
      `${BASE_URL}/categories`,
      expect.anything()
    );
  });

  test('should throw error when categories fetch fails', async () => {
    AsyncStorage.getItem.mockResolvedValueOnce('mock-user-token');
    mockFetchFail('Failed to load categories', 500);

    await expect(fetchCategories()).rejects.toThrow('Failed to load categories');
  });
});

// ─── Home Screen Business Logic ───────────────────────────────────────────────

describe('Home Screen Business Logic', () => {
  const sampleProducts = [
    { _id: 'p1', name: 'Pleated Midi Skirt', price: 4999, category: 'Women', isNew: false, discount: 0, description: 'Stylish skirt' },
    { _id: 'p2', name: 'Blue Denim', price: 3000, category: 'Men', isNew: true, discount: 0, description: 'Classic denim jeans' },
    { _id: 'p3', name: 'Summer Dress', price: 1650, category: 'Women', isNew: false, discount: 10, description: 'Light summer dress' },
    { _id: 'p4', name: 'Floral Summer Dress', price: 3400, category: 'Women', isNew: true, discount: 20, description: 'Floral pattern dress' },
  ];

  test('should filter products by category', () => {
    const result = filterByCategory(sampleProducts, 'Women');
    expect(result).toHaveLength(3);
    expect(result.every((p) => p.category === 'Women')).toBe(true);
  });

  test('should return all products when category is "all"', () => {
    const result = filterByCategory(sampleProducts, 'all');
    expect(result).toHaveLength(4);
  });

  test('should return all products when no category is provided', () => {
    const result = filterByCategory(sampleProducts);
    expect(result).toHaveLength(4);
  });

  test('should filter products by search query (name)', () => {
    const result = filterBySearch(sampleProducts, 'denim');
    expect(result).toHaveLength(1);
    expect(result[0].name).toBe('Blue Denim');
  });

  test('should filter products by search query (description)', () => {
    const result = filterBySearch(sampleProducts, 'classic');
    expect(result).toHaveLength(1);
    expect(result[0]._id).toBe('p2');
  });

  test('should return all products when search query is empty', () => {
    expect(filterBySearch(sampleProducts, '')).toHaveLength(4);
    expect(filterBySearch(sampleProducts)).toHaveLength(4);
  });

  test('should be case-insensitive when filtering by search', () => {
    const result = filterBySearch(sampleProducts, 'SUMMER');
    expect(result).toHaveLength(2);
  });

  test('should filter new arrivals only', () => {
    const result = filterNewArrivals(sampleProducts);
    expect(result).toHaveLength(2);
    expect(result.every((p) => p.isNew === true)).toBe(true);
  });

  test('should return empty array when no new arrivals exist', () => {
    const noNew = sampleProducts.map((p) => ({ ...p, isNew: false }));
    expect(filterNewArrivals(noNew)).toHaveLength(0);
  });

  test('should filter discounted products only', () => {
    const result = filterDiscounted(sampleProducts);
    expect(result).toHaveLength(2);
    expect(result.every((p) => p.discount > 0)).toBe(true);
  });

  test('should format price correctly as LKR string', () => {
    expect(formatPrice(4999)).toBe('LKR 4,999');
    expect(formatPrice(1650)).toBe('LKR 1,650');
    expect(formatPrice(0)).toBe('LKR 0');
  });

  test('should normalize product data from API response wrapper', () => {
    const wrapped = { products: sampleProducts };
    expect(normalizeProducts(wrapped)).toHaveLength(4);
    expect(normalizeProducts(sampleProducts)).toHaveLength(4);
    expect(normalizeProducts(null)).toEqual([]);
  });

  test('should sort products by price ascending', () => {
    const sorted = sortByPriceAsc(sampleProducts);
    expect(sorted[0].price).toBe(1650);
    expect(sorted[sorted.length - 1].price).toBe(4999);
  });

  test('should sort products by price descending', () => {
    const sorted = sortByPriceDesc(sampleProducts);
    expect(sorted[0].price).toBe(4999);
    expect(sorted[sorted.length - 1].price).toBe(1650);
  });
});

// ─── Home Screen Edge Cases ───────────────────────────────────────────────────

describe('Home Screen Edge Cases', () => {
  beforeEach(() => {
    fetch.mockClear();
    AsyncStorage.getItem.mockClear();
  });

  test('should handle network error when fetching products', async () => {
    AsyncStorage.getItem.mockResolvedValueOnce('mock-user-token');
    fetch.mockRejectedValueOnce(new Error('Network request failed'));

    await expect(fetchProducts()).rejects.toThrow('Network request failed');
  });

  test('should handle invalid server response when fetching products', async () => {
    AsyncStorage.getItem.mockResolvedValueOnce('mock-user-token');
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => {
        throw new Error('bad json');
      },
    });

    await expect(fetchProducts()).rejects.toThrow('Invalid server response');
  });

  test('should not send Authorization header when token is missing', async () => {
    AsyncStorage.getItem.mockResolvedValueOnce(null);
    mockFetchSuccess([]);

    await fetchProducts();

    const [, requestOptions] = fetch.mock.calls[0];
    expect(requestOptions.headers.Authorization).toBeUndefined();
  });

  test('should handle string price values when sorting', () => {
    const products = [
      { name: 'A', price: '3000' },
      { name: 'B', price: '1500' },
    ];
    const sorted = sortByPriceAsc(products);
    expect(sorted[0].name).toBe('B');
  });

  test('should handle undefined price when formatting', () => {
    expect(formatPrice(undefined)).toBe('LKR 0');
    expect(formatPrice(null)).toBe('LKR 0');
  });

  test('should return empty array for filterBySearch with empty products list', () => {
    expect(filterBySearch([], 'dress')).toEqual([]);
    expect(filterBySearch()).toEqual([]);
  });

  test('should not mutate original array when sorting', () => {
    const products = [
      { name: 'A', price: 3000 },
      { name: 'B', price: 1500 },
    ];
    const original = [...products];
    sortByPriceAsc(products);
    expect(products).toEqual(original);
  });
});