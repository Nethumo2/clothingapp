import React, { useState, useEffect } from 'react';
import {
  View, Text, FlatList, TouchableOpacity, StyleSheet,
  Image, ActivityIndicator, Alert, Platform,
} from 'react-native';
import { fetchCart, removeFromCart, clearCart, updateCartItem } from '../services/api';
import { useCart } from '../context/CartContext';

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
      { text: 'OK', onPress: onConfirm },
    ]);
  }
};

export default function CartScreen({ navigation }) {
  const { refreshCart } = useCart();
  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadCart = async () => {
    try {
      const data = await fetchCart();
      setCart(data);
    } catch (e) {
      console.log(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadCart(); }, []);

  const handleRemove = async (itemId) => {
    try {
      const updated = await removeFromCart(itemId);
      setCart(updated);
      refreshCart();
    } catch (_e) {
      showAlert('Error', 'Failed to remove item');
    }
  };

  const handleQuantityChange = async (item, nextQuantity) => {
    if (nextQuantity < 1) {
      handleRemove(item._id);
      return;
    }

    try {
      const updated = await updateCartItem(item._id, nextQuantity);
      setCart(updated);
      refreshCart();
    } catch (_e) {
      showAlert('Error', 'Failed to update quantity');
    }
  };

  const handleClear = () => {
    showConfirm('Clear Cart', 'Remove all items from cart?', async () => {
      await clearCart();
      await loadCart();
      refreshCart();
    });
  };

  const renderItem = ({ item }) => (
    <View style={styles.cartItem}>
      <Image
        source={{ uri: item.product?.imageUrl || 'https://via.placeholder.com/80x80?text=Item' }}
        style={styles.itemImage}
        resizeMode="cover"
      />
      <View style={styles.itemInfo}>
        <Text style={styles.itemName} numberOfLines={2}>{item.product?.name}</Text>
        <Text style={styles.itemSize}>Size: {item.size}</Text>
        <View style={styles.quantityRow}>
          <TouchableOpacity
            style={styles.quantityBtn}
            onPress={() => handleQuantityChange(item, item.quantity - 1)}
          >
            <Text style={styles.quantityBtnText}>-</Text>
          </TouchableOpacity>
          <Text style={styles.itemQty}>{item.quantity}</Text>
          <TouchableOpacity
            style={styles.quantityBtn}
            onPress={() => handleQuantityChange(item, item.quantity + 1)}
          >
            <Text style={styles.quantityBtnText}>+</Text>
          </TouchableOpacity>
        </View>
        <Text style={styles.itemPrice}>
          LKR {(Number(item.product?.price) * item.quantity).toLocaleString()}
        </Text>
      </View>
      <TouchableOpacity style={styles.removeBtn} onPress={() => handleRemove(item._id)}>
        <Text style={styles.removeBtnText}>x</Text>
      </TouchableOpacity>
    </View>
  );

  if (loading) return <ActivityIndicator size="large" color="#1a1a1a" style={styles.loader} />;

  const items = cart?.items || [];

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backBtn}>Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>My Cart</Text>
        {items.length > 0 && (
          <TouchableOpacity onPress={handleClear}>
            <Text style={styles.clearBtn}>Clear</Text>
          </TouchableOpacity>
        )}
      </View>

      {items.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyIcon}>Cart</Text>
          <Text style={styles.emptyText}>Your cart is empty</Text>
          <TouchableOpacity style={styles.shopBtn} onPress={() => navigation.navigate('Home')}>
            <Text style={styles.shopBtnText}>Start Shopping</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <>
          <FlatList
            data={items}
            keyExtractor={(item) => item._id}
            renderItem={renderItem}
            contentContainerStyle={styles.list}
          />
          <View style={styles.footer}>
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Total ({items.length} items)</Text>
              <Text style={styles.totalValue}>LKR {Number(cart?.totalPrice || 0).toLocaleString()}</Text>
            </View>
            <TouchableOpacity
              style={styles.checkoutBtn}
              onPress={() => navigation.navigate('Checkout', { cart })}
            >
              <Text style={styles.checkoutBtnText}>Proceed to Checkout</Text>
            </TouchableOpacity>
          </View>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  loader: { flex: 1, justifyContent: 'center' },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    backgroundColor: '#1a1a1a', padding: 20, paddingTop: 50,
  },
  backBtn: { color: '#fff', fontSize: 14, fontWeight: '700' },
  headerTitle: { color: '#fff', fontSize: 20, fontWeight: '800' },
  clearBtn: { color: '#e63946', fontWeight: '700', fontSize: 14 },
  list: { padding: 14, paddingBottom: 20 },
  cartItem: {
    flexDirection: 'row', backgroundColor: '#fff', borderRadius: 14,
    padding: 12, marginBottom: 12,
    shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 6, elevation: 2,
  },
  itemImage: { width: 80, height: 80, borderRadius: 10 },
  itemInfo: { flex: 1, marginLeft: 12 },
  itemName: { fontSize: 14, fontWeight: '700', color: '#1a1a1a', marginBottom: 4 },
  itemSize: { fontSize: 12, color: '#888' },
  quantityRow: { flexDirection: 'row', alignItems: 'center', marginTop: 8 },
  quantityBtn: {
    width: 28, height: 28, borderRadius: 8,
    backgroundColor: '#f0f0f0', alignItems: 'center', justifyContent: 'center',
  },
  quantityBtnText: { fontSize: 16, fontWeight: '800', color: '#1a1a1a' },
  itemQty: { minWidth: 32, textAlign: 'center', fontSize: 14, fontWeight: '800', color: '#1a1a1a' },
  itemPrice: { fontSize: 15, fontWeight: '800', color: '#e63946', marginTop: 4 },
  removeBtn: {
    width: 28, height: 28, borderRadius: 14,
    backgroundColor: '#f0f0f0', alignItems: 'center', justifyContent: 'center',
    alignSelf: 'flex-start',
  },
  removeBtnText: { color: '#e63946', fontSize: 12, fontWeight: '700' },
  emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 12 },
  emptyIcon: { fontSize: 24, fontWeight: '800', color: '#1a1a1a' },
  emptyText: { fontSize: 18, fontWeight: '700', color: '#555' },
  shopBtn: { backgroundColor: '#1a1a1a', borderRadius: 12, paddingVertical: 12, paddingHorizontal: 28 },
  shopBtnText: { color: '#fff', fontWeight: '700', fontSize: 15 },
  footer: {
    backgroundColor: '#fff', padding: 16, paddingBottom: 28,
    borderTopWidth: 1, borderTopColor: '#eee',
  },
  totalRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 14 },
  totalLabel: { fontSize: 15, color: '#888' },
  totalValue: { fontSize: 20, fontWeight: '900', color: '#1a1a1a' },
  checkoutBtn: { backgroundColor: '#1a1a1a', borderRadius: 14, padding: 16, alignItems: 'center' },
  checkoutBtnText: { color: '#fff', fontWeight: '800', fontSize: 16 },
});
