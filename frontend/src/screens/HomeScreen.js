import React, { useState, useEffect, useCallback } from 'react';
import {
    View, Text, FlatList, TouchableOpacity, StyleSheet,
    Image, TextInput, ActivityIndicator, RefreshControl, Alert, Platform
} from 'react-native';

import { fetchProducts } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useFocusEffect } from '@react-navigation/native';
export default function HomeScreen({ navigation }) {
    const { user, logout } = useAuth();
    const { cartCount } = useCart();

    const showAlert = (title, message) => {
        if (Platform.OS === 'web') {
            window.alert(`${title}\n${message}`);
        } else {
            Alert.alert(title, message);
        }
    };

    const showConfirm = (title, message, onConfirm) => {
        if (Platform.OS === 'web') {
            if (window.confirm(`${title}\n${message}`)) onConfirm();
        } else {
            Alert.alert(title, message, [
                { text: 'Cancel', style: 'cancel' },
                { text: 'OK', onPress: onConfirm }
            ]);
        }
    };

    // 🛠️ ADMIN MODE
    const isAdmin = user?.isAdmin === true;

    const [products, setProducts] = useState([]);
    const [filtered, setFiltered] = useState([]);
    const [search, setSearch] = useState('');
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const loadProducts = async () => {
        try {
            const data = await fetchProducts();
            setProducts(Array.isArray(data) ? data : []);
            setFiltered(Array.isArray(data) ? data : []);
        } catch (e) {
            console.log('Error loading products', e);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };
    const styles = StyleSheet.create({
        container: {
            flex: 1,
            backgroundColor: '#f5f5f5',
        },

        header: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            backgroundColor: '#1a1a1a',
            padding: 20,
            paddingTop: 50,
        },

        greeting: {
            color: '#fff',
            fontSize: 20,
            fontWeight: '800',
        },

        tagline: {
            color: '#aaa',
            fontSize: 13,
        },

        cartBtn: {
            position: 'relative',
        },

        cartIcon: {
            fontSize: 24,
        },

        badge: {
            position: 'absolute',
            top: -5,
            right: -5,
            backgroundColor: 'red',
            borderRadius: 10,
            paddingHorizontal: 5,
        },

        badgeText: {
            color: '#fff',
            fontSize: 10,
        },

        adminAddBtn: {
            backgroundColor: '#e63946',
            margin: 10,
            padding: 12,
            borderRadius: 10,
            alignItems: 'center',
        },

        adminAddText: {
            color: '#fff',
            fontWeight: '700',
        },

        search: {
            backgroundColor: '#fff',
            margin: 10,
            padding: 10,
            borderRadius: 10,
        },

        quickNav: {
            flexDirection: 'row',
            justifyContent: 'space-around',
            marginVertical: 10,
        },

        navBtn: {
            backgroundColor: '#fff',
            padding: 10,
            borderRadius: 10,
        },

        navBtnText: {
            fontSize: 12,
            fontWeight: '600',
        },

        list: {
            padding: 10,
        },

        row: {
            justifyContent: 'space-between',
        },

        card: {
            backgroundColor: '#fff',
            width: '48%',
            marginBottom: 10,
            borderRadius: 10,
            overflow: 'hidden',
        },

        image: {
            width: '100%',
            height: 150,
        },

        cardInfo: {
            padding: 10,
        },

        cardName: {
            fontWeight: '700',
        },

        cardCategory: {
            fontSize: 12,
            color: '#777',
        },

        cardPrice: {
            color: 'red',
            fontWeight: '700',
            marginTop: 5,
        },
    });

    useFocusEffect(
        useCallback(() => {
            loadProducts();
        }, [])
    );

    useEffect(() => { loadProducts(); }, []);

    useEffect(() => {
        const q = search.toLowerCase();
        setFiltered(products.filter(p =>
            p.name?.toLowerCase().includes(q) || p.category?.toLowerCase().includes(q)
        ));
    }, [search, products]);

    const onRefresh = useCallback(() => {
        setRefreshing(true);
        loadProducts();
    }, []);

    const renderProduct = ({ item }) => (
        <TouchableOpacity
            style={styles.card}
            onPress={() => navigation.navigate('ProductDetails', { productId: item._id })}
            activeOpacity={0.85}
        >
            <Image
                source={{ uri: item.imageUrl || 'https://via.placeholder.com/200' }}
                style={styles.image}
            />
            <View style={styles.cardInfo}>
                <Text style={styles.cardName} numberOfLines={2}>{item.name}</Text>
                <Text style={styles.cardCategory}>{item.category}</Text>
                <Text style={styles.cardPrice}>LKR {Number(item.price).toLocaleString()}</Text>
            </View>
        </TouchableOpacity>
    );

    return (
        <View style={styles.container}>

            {/* HEADER */}
            <View style={styles.header}>
                <View>
                    <Text style={styles.greeting}>Hi, {user?.name?.split(' ')[0]} 👋</Text>
                    <Text style={styles.tagline}>What are you looking for?</Text>
                </View>

                <TouchableOpacity style={styles.cartBtn} onPress={() => navigation.navigate('Cart')}>
                    <Text style={styles.cartIcon}>🛒</Text>
                    {cartCount > 0 && (
                        <View style={styles.badge}>
                            <Text style={styles.badgeText}>{cartCount}</Text>
                        </View>
                    )}
                </TouchableOpacity>
            </View>

            {/* 🛠️ ADMIN BUTTON (NEW) */}
            {isAdmin && (
                <TouchableOpacity
                    style={styles.adminAddBtn}
                    onPress={() => navigation.navigate('AddProduct')}
                >
                    <Text style={styles.adminAddText}>➕ Add New Product</Text>
                </TouchableOpacity>
            )}

            {/* SEARCH */}
            <TextInput
                style={styles.search}
                placeholder="Search products..."
                value={search}
                onChangeText={setSearch}
            />

            {/* QUICK NAV */}
            <View style={styles.quickNav}>
                <TouchableOpacity style={styles.navBtn} onPress={() => navigation.navigate('Categories')}>
                    <Text style={styles.navBtnText}>🏷️ Categories</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.navBtn} onPress={() => navigation.navigate('OrderHistory')}>
                    <Text style={styles.navBtnText}>📦 Orders</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.navBtn} onPress={logout}>
                    <Text style={styles.navBtnText}>🚪 Logout</Text>
                </TouchableOpacity>
            </View>

            {/* LIST */}
            {loading ? (
                <ActivityIndicator size="large" color="#1a1a1a" style={{ marginTop: 60 }} />
            ) : (
                <FlatList
                    data={filtered}
                    keyExtractor={(item) => item._id}
                    renderItem={renderProduct}
                    numColumns={2}
                    columnWrapperStyle={styles.row}
                    contentContainerStyle={styles.list}
                    refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
                />
            )}

        </View>
    );
}