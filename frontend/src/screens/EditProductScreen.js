import React, { useState, useEffect } from 'react';
import {
    View, Text, TextInput, TouchableOpacity,
<<<<<<< HEAD
    StyleSheet, ActivityIndicator, ScrollView, Image, Alert, Platform
} from 'react-native';
import { fetchProductById, updateProduct } from '../services/api';

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

=======
    StyleSheet, ActivityIndicator, Alert, ScrollView, Image
} from 'react-native';
import { fetchProductById, updateProduct } from '../services/api';

>>>>>>> 32f1e39a541ce39a126d9cb2c8356ce4d057b6dc
export default function EditProductScreen({ route, navigation }) {
    const { productId } = route.params;

    const [name, setName] = useState('');
    const [price, setPrice] = useState('');
    const [category, setCategory] = useState('');
    const [description, setDescription] = useState('');
    const [countInStock, setCountInStock] = useState('');
    const [size, setSize] = useState('');
    const [imageUrl, setImageUrl] = useState('');
    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(true);

    useEffect(() => {
        loadProduct();
    }, []);

    const loadProduct = async () => {
        try {
            const data = await fetchProductById(productId);
            setName(data.name || '');
            setPrice(String(data.price || ''));

            // Handle category as ObjectId or string
            setCategory(data.category?.toString() || '');
            setDescription(data.description || '');

            // Handle both stock field names
            setCountInStock(String(data.countInStock ?? data.stock ?? ''));

            // Handle both size field names
            const sizeData = data.size || data.sizes || [];
            setSize(Array.isArray(sizeData) ? sizeData.join(', ') : String(sizeData));

            // Handle both image field formats
            const img = data.imageUrl ||
                data.images?.[0]?.url ||
                (typeof data.images?.[0] === 'string' ? data.images[0] : '') ||
                '';
            setImageUrl(img);

        } catch (e) {
<<<<<<< HEAD
            showAlert('Error', 'Failed to load product');
=======
            Alert.alert('Error', 'Failed to load product');
>>>>>>> 32f1e39a541ce39a126d9cb2c8356ce4d057b6dc
        } finally {
            setFetching(false);
        }
    };

    const handleSubmit = async () => {
        if (!name || !price || !size) {
<<<<<<< HEAD
            showAlert('Error', 'Please fill name, price and size');
=======
            Alert.alert('Error', 'Please fill name, price and size');
>>>>>>> 32f1e39a541ce39a126d9cb2c8356ce4d057b6dc
            return;
        }
        setLoading(true);
        try {
            await updateProduct(productId, {
                name,
                price,
                category,
                description,
                countInStock,
                size,
                imageUrl,
            });
<<<<<<< HEAD
            showAlert('Success', 'Product updated!');
            navigation.navigate('Home');
        } catch (e) {
            showAlert(e.message || 'Failed to update product');
=======
            Alert.alert('Success', 'Product updated!', [
                { text: 'OK', onPress: () => navigation.goBack() }
            ]);
        } catch (e) {
            Alert.alert('Error', e.message || 'Failed to update product');
>>>>>>> 32f1e39a541ce39a126d9cb2c8356ce4d057b6dc
        } finally {
            setLoading(false);
        }
    };

    if (fetching) return <ActivityIndicator size="large" color="#1a1a1a" style={{ flex: 1 }} />;

    return (
        <ScrollView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()}>
                    <Text style={styles.backBtn}>←</Text>
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Edit Product</Text>
                <View style={{ width: 30 }} />
            </View>

            <View style={styles.form}>

                <Text style={styles.label}>Product Name *</Text>
                <TextInput style={styles.input} value={name} onChangeText={setName} />

                <Text style={styles.label}>Price (LKR) *</Text>
                <TextInput style={styles.input} keyboardType="numeric" value={price} onChangeText={setPrice} />

                <Text style={styles.label}>Category</Text>
                <TextInput style={styles.input} value={category} onChangeText={setCategory} />

                <Text style={styles.label}>Sizes * (comma separated)</Text>
                <TextInput
                    style={styles.input}
                    placeholder="e.g. S, M, L, XL"
                    value={size}
                    onChangeText={setSize}
                />

                <Text style={styles.label}>Count In Stock</Text>
                <TextInput
                    style={styles.input}
                    keyboardType="numeric"
                    value={countInStock}
                    onChangeText={setCountInStock}
                />

                <Text style={styles.label}>Description</Text>
                <TextInput
                    style={[styles.input, styles.textArea]}
                    value={description}
                    onChangeText={setDescription}
                    multiline
                    numberOfLines={4}
                />

                <Text style={styles.label}>Image URL</Text>
                <TextInput
                    style={styles.input}
                    placeholder="https://example.com/image.jpg"
                    value={imageUrl}
                    onChangeText={setImageUrl}
                    autoCapitalize="none"
                />

                {/* Image Preview */}
                {imageUrl ? (
                    <Image
                        source={{ uri: imageUrl }}
                        style={styles.previewImage}
                        resizeMode="cover"
                    />
                ) : null}

                <Text style={styles.hint}>
                    💡 You can use any image URL or upload to imgur.com for free
                </Text>

                <TouchableOpacity
                    style={[styles.submitBtn, loading && { opacity: 0.6 }]}
                    onPress={handleSubmit}
                    disabled={loading}
                >
                    {loading ? (
                        <ActivityIndicator color="#fff" />
                    ) : (
                        <Text style={styles.submitBtnText}>Update Product</Text>
                    )}
                </TouchableOpacity>
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f5f5f5' },
    header: {
        flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
        backgroundColor: '#1a1a1a', padding: 20, paddingTop: 50,
    },
    backBtn: { color: '#fff', fontSize: 22, fontWeight: '700' },
    headerTitle: { color: '#fff', fontSize: 18, fontWeight: '800' },
    form: { padding: 16 },
    label: {
        fontSize: 13, fontWeight: '700', color: '#555',
        marginBottom: 5, marginTop: 12, textTransform: 'uppercase'
    },
    input: {
        backgroundColor: '#fff', borderRadius: 10, padding: 12,
        borderWidth: 1, borderColor: '#e0e0e0', fontSize: 14, color: '#1a1a1a',
    },
    textArea: { height: 100, textAlignVertical: 'top' },
    previewImage: {
        width: '100%', height: 180, borderRadius: 10, marginTop: 10,
    },
    hint: { fontSize: 12, color: '#888', marginTop: 6, fontStyle: 'italic' },
    submitBtn: {
        backgroundColor: '#e63946', borderRadius: 12,
        padding: 16, alignItems: 'center', marginTop: 24, marginBottom: 40,
    },
    submitBtnText: { color: '#fff', fontWeight: '800', fontSize: 16 },
});