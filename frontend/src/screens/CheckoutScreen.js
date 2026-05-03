import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  ScrollView, ActivityIndicator, Alert, KeyboardAvoidingView, Platform,
} from 'react-native';
import { createOrder, clearCart } from '../services/api';
import { useCart } from '../context/CartContext';

export default function CheckoutScreen({ route, navigation }) {
  const { cart } = route.params || {};
  const { refreshCart } = useCart();
  const [loading, setLoading] = useState(false);

  const [fullName, setFullName] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');

  const validate = () => {
    if (!fullName.trim()) { Alert.alert('Error', 'Please enter your full name'); return false; }
    if (!address.trim()) { Alert.alert('Error', 'Please enter your address'); return false; }
    if (!city.trim()) { Alert.alert('Error', 'Please enter your city'); return false; }
    if (!phoneNumber.trim() || phoneNumber.length < 9) { Alert.alert('Error', 'Please enter a valid phone number'); return false; }
    return true;
  };

  const handlePlaceOrder = async () => {
    if (!validate()) return;
    setLoading(true);
    try {
      const orderItems = (cart?.items || []).map(item => ({
        name: item.product?.name,
        qty: item.quantity,
        image: item.product?.imageUrl,
        price: item.product?.price,
        product: item.product?._id,
      }));

      const orderData = {
        orderItems,
        shippingAddress: { fullName, address, city, phoneNumber },
        totalPrice: cart?.totalPrice || 0,
      };

      const result = await createOrder(orderData);

      if (result._id) {
        await clearCart();
        refreshCart();
        Alert.alert(
          '🎉 Order Placed!',
          `Your order has been placed successfully.\nOrder ID: ${result._id.slice(-8).toUpperCase()}`,
          [{ text: 'View Orders', onPress: () => navigation.navigate('OrderHistory') }]
        );
      } else {
        Alert.alert('Error', result.message || 'Failed to place order');
      }
    } catch (e) {
      Alert.alert('Error', 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const items = cart?.items || [];

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backBtn}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Checkout</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {/* Order Summary */}
        <Text style={styles.sectionTitle}>Order Summary</Text>
        <View style={styles.summaryBox}>
          {items.map((item, i) => (
            <View key={i} style={styles.summaryRow}>
              <Text style={styles.summaryItem} numberOfLines={1}>
                {item.product?.name} ({item.size}) × {item.quantity}
              </Text>
              <Text style={styles.summaryPrice}>
                LKR {(item.product?.price * item.quantity).toLocaleString()}
              </Text>
            </View>
          ))}
          <View style={[styles.summaryRow, styles.totalRow]}>
            <Text style={styles.totalLabel}>Total</Text>
            <Text style={styles.totalValue}>LKR {Number(cart?.totalPrice || 0).toLocaleString()}</Text>
          </View>
        </View>

        {/* Shipping Details */}
        <Text style={styles.sectionTitle}>Shipping Details</Text>
        <View style={styles.formBox}>
          <Text style={styles.inputLabel}>Full Name *</Text>
          <TextInput
            style={styles.input}
            placeholder="John Doe"
            placeholderTextColor="#bbb"
            value={fullName}
            onChangeText={setFullName}
          />
          <Text style={styles.inputLabel}>Address *</Text>
          <TextInput
            style={styles.input}
            placeholder="123 Main Street"
            placeholderTextColor="#bbb"
            value={address}
            onChangeText={setAddress}
          />
          <Text style={styles.inputLabel}>City *</Text>
          <TextInput
            style={styles.input}
            placeholder="Colombo"
            placeholderTextColor="#bbb"
            value={city}
            onChangeText={setCity}
          />
          <Text style={styles.inputLabel}>Phone Number *</Text>
          <TextInput
            style={styles.input}
            placeholder="0771234567"
            placeholderTextColor="#bbb"
            keyboardType="phone-pad"
            value={phoneNumber}
            onChangeText={setPhoneNumber}
          />
        </View>

        {/* Payment Note */}
        <View style={styles.paymentNote}>
          <Text style={styles.paymentNoteIcon}>💳</Text>
          <Text style={styles.paymentNoteText}>Cash on Delivery — Pay when your order arrives.</Text>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.placeOrderBtn, loading && styles.placeOrderBtnDisabled]}
          onPress={handlePlaceOrder}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.placeOrderBtnText}>
              Place Order — LKR {Number(cart?.totalPrice || 0).toLocaleString()}
            </Text>
          )}
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    backgroundColor: '#1a1a1a', padding: 20, paddingTop: 50,
  },
  backBtn: { color: '#fff', fontSize: 22, fontWeight: '700' },
  headerTitle: { color: '#fff', fontSize: 20, fontWeight: '800' },
  content: { padding: 16, paddingBottom: 30 },
  sectionTitle: { fontSize: 17, fontWeight: '800', color: '#1a1a1a', marginBottom: 12, marginTop: 8 },
  summaryBox: {
    backgroundColor: '#fff', borderRadius: 14, padding: 16, marginBottom: 20,
    shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 6, elevation: 2,
  },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 },
  summaryItem: { fontSize: 13, color: '#555', flex: 1, marginRight: 8 },
  summaryPrice: { fontSize: 13, fontWeight: '700', color: '#1a1a1a' },
  totalRow: { borderTopWidth: 1, borderTopColor: '#eee', paddingTop: 10, marginTop: 4, marginBottom: 0 },
  totalLabel: { fontSize: 15, fontWeight: '800', color: '#1a1a1a' },
  totalValue: { fontSize: 16, fontWeight: '900', color: '#e63946' },
  formBox: {
    backgroundColor: '#fff', borderRadius: 14, padding: 16, marginBottom: 16,
    shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 6, elevation: 2,
  },
  inputLabel: { fontSize: 12, fontWeight: '700', color: '#888', marginBottom: 5, textTransform: 'uppercase' },
  input: {
    borderWidth: 1, borderColor: '#eee', borderRadius: 10,
    padding: 12, fontSize: 14, color: '#1a1a1a', marginBottom: 14,
    backgroundColor: '#fafafa',
  },
  paymentNote: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff',
    borderRadius: 12, padding: 14, gap: 10,
    borderLeftWidth: 4, borderLeftColor: '#2ecc71',
  },
  paymentNoteIcon: { fontSize: 22 },
  paymentNoteText: { flex: 1, fontSize: 13, color: '#555', lineHeight: 18 },
  footer: {
    backgroundColor: '#fff', padding: 16, paddingBottom: 28,
    borderTopWidth: 1, borderTopColor: '#eee',
  },
  placeOrderBtn: { backgroundColor: '#1a1a1a', borderRadius: 14, padding: 18, alignItems: 'center' },
  placeOrderBtnDisabled: { backgroundColor: '#aaa' },
  placeOrderBtnText: { color: '#fff', fontWeight: '800', fontSize: 16 },
});
