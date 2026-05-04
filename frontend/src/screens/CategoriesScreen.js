import React, { useState, useEffect } from 'react';
import {
  View, Text, FlatList, TouchableOpacity, StyleSheet,
  ActivityIndicator, Image,
} from 'react-native';
import { fetchCategories, fetchProducts } from '../services/api';

const CATEGORY_FALLBACKS = [
  'https://images.unsplash.com/photo-1483985988355-763728e1935b?w=900',
  'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=900',
  'https://images.unsplash.com/photo-1529139574466-a303027c1d8b?w=900',
  'https://images.unsplash.com/photo-1496747611176-843222e1e57c?w=900',
  'https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?w=900',
];

export default function CategoriesScreen({ navigation }) {
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [cats, prods] = await Promise.all([fetchCategories(), fetchProducts()]);
        setCategories(Array.isArray(cats) ? cats : []);
        setProducts(Array.isArray(prods) ? prods : []);
      } catch (e) {
        console.log(e);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const getCategoryName = (category) => {
    if (!category) return '';
    if (typeof category === 'string') return category;
    return category.name || category.slug || category._id || '';
  };

  const getCategoryImage = (item, index) => (
    item.image || item.imageUrl || CATEGORY_FALLBACKS[index % CATEGORY_FALLBACKS.length]
  );

  const getProductImage = (item) => {
    if (Array.isArray(item.images) && item.images.length > 0) return item.images[0];
    return item.imageUrl || item.image || 'https://via.placeholder.com/500x650?text=LUSH';
  };

  const filteredProducts = selected
    ? products.filter((p) => getCategoryName(p.category).toLowerCase() === selected.toLowerCase())
    : products;

  const renderCategory = ({ item, index }) => {
    const itemCount = products.filter(
      (p) => getCategoryName(p.category).toLowerCase() === item.name.toLowerCase(),
    ).length;

    return (
      <TouchableOpacity
        style={[styles.catCard, selected === item.name && styles.catCardActive]}
        onPress={() => setSelected(selected === item.name ? null : item.name)}
        activeOpacity={0.85}
      >
        <Image
          source={{ uri: getCategoryImage(item, index) }}
          style={styles.catImage}
          resizeMode="cover"
        />
        <View style={styles.catMeta}>
          <Text style={styles.catName}>{item.name}</Text>
          <Text style={styles.catCount}>{itemCount} pieces</Text>
        </View>
      </TouchableOpacity>
    );
  };

  const renderProduct = ({ item }) => (
    <TouchableOpacity
      style={styles.productCard}
      onPress={() => navigation.navigate('ProductDetails', { productId: item._id })}
      activeOpacity={0.85}
    >
      <Image
        source={{ uri: getProductImage(item) }}
        style={styles.productImage}
        resizeMode="cover"
      />
      <View style={styles.productInfo}>
        <Text style={styles.productName} numberOfLines={1}>{item.name}</Text>
        <Text style={styles.productPrice}>LKR {Number(item.price).toLocaleString()}</Text>
      </View>
    </TouchableOpacity>
  );

  const renderListHeader = () => (
    <View style={styles.listHeader}>
      <Text style={styles.kicker}>LUSH COLLECTIONS</Text>
      <Text style={styles.categoryTitle}>Shop by Category</Text>
      <FlatList
        data={categories}
        keyExtractor={(item) => item._id}
        renderItem={renderCategory}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.categoryRail}
      />
      <View style={styles.productsHeader}>
        <Text style={styles.sectionTitle}>{selected ? selected : 'All Products'}</Text>
        <Text style={styles.countText}>{filteredProducts.length} items</Text>
      </View>
    </View>
  );

  if (loading) return <ActivityIndicator size="large" color="#1B1B1B" style={styles.loader} />;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.headerAction} onPress={() => navigation.navigate('Home')}>
          <Text style={styles.backBtn}>Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Categories</Text>
        <TouchableOpacity
          style={styles.headerAction}
          onPress={() => (selected ? setSelected(null) : navigation.navigate('Home'))}
        >
          <Text style={styles.clearBtn}>{selected ? 'Clear' : 'Home'}</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={filteredProducts}
        keyExtractor={(item) => item._id}
        renderItem={renderProduct}
        numColumns={2}
        columnWrapperStyle={styles.productRow}
        contentContainerStyle={styles.productList}
        ListHeaderComponent={renderListHeader}
        ListEmptyComponent={
          <Text style={styles.empty}>No products in this category.</Text>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FBFAF7' },
  loader: { flex: 1, justifyContent: 'center' },
  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    backgroundColor: '#FFFFFF', padding: 24, paddingTop: 54, borderBottomWidth: 1, borderBottomColor: '#E9E2D8',
  },
  headerAction: { width: 64 },
  backBtn: { color: '#9F8247', fontWeight: '700', fontSize: 14 },
  headerTitle: { color: '#1B1B1B', fontSize: 22, fontWeight: '800' },
  clearBtn: { color: '#9F8247', fontWeight: '700', fontSize: 14 },
  productList: { paddingHorizontal: 16, paddingBottom: 24 },
  listHeader: { paddingTop: 26, paddingBottom: 8 },
  kicker: {
    color: '#9F8247', fontSize: 11, fontWeight: '800',
    letterSpacing: 2, textAlign: 'center', marginBottom: 8,
  },
  categoryTitle: {
    color: '#1B1B1B', fontSize: 24, fontWeight: '800',
    textAlign: 'center', marginBottom: 22,
  },
  categoryRail: { gap: 14, paddingHorizontal: 2, paddingBottom: 22 },
  catCard: {
    width: 188, backgroundColor: '#FFFFFF', borderRadius: 16,
    borderWidth: 1, borderColor: '#E9E2D8', overflow: 'hidden',
    shadowColor: '#1B1B1B', shadowOpacity: 0.06, shadowRadius: 14, elevation: 3,
  },
  catCardActive: { borderColor: '#BFA46A', backgroundColor: '#FFFCF4' },
  catImage: { width: '100%', height: 228, backgroundColor: '#F3EFE8' },
  catMeta: { padding: 12, alignItems: 'center' },
  catName: { fontSize: 15, fontWeight: '800', color: '#1B1B1B', textAlign: 'center' },
  catCount: { fontSize: 11, color: '#8A8175', marginTop: 4, fontWeight: '700' },
  productsHeader: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end',
    marginBottom: 14, paddingHorizontal: 2,
  },
  sectionTitle: {
    fontSize: 26, fontFamily: 'Georgia', fontWeight: '700', color: '#1B1B1B',
  },
  countText: { color: '#8A8175', fontWeight: '700', marginBottom: 3 },
  productRow: { justifyContent: 'space-between', marginBottom: 14 },
  productCard: {
    backgroundColor: '#FFFFFF', borderRadius: 12, width: '48%',
    overflow: 'hidden',
    shadowColor: '#1B1B1B', shadowOpacity: 0.06, shadowRadius: 14, elevation: 3,
  },
  productImage: { width: '100%', height: 210, backgroundColor: '#F3EFE8' },
  productInfo: { padding: 12 },
  productName: { fontSize: 13, fontWeight: '700', color: '#1B1B1B' },
  productPrice: { fontSize: 13, fontWeight: '800', color: '#BFA46A', marginTop: 4 },
  empty: { textAlign: 'center', color: '#8A8175', marginTop: 30, fontSize: 15 },
});
