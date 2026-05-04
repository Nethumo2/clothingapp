import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, FlatList, TouchableOpacity, StyleSheet,
  ActivityIndicator, RefreshControl,
} from 'react-native';
import { fetchMyOrders } from '../services/api';
const STATUS_COLORS = {
  Pending: '#BFA46A',
  Processing: '#0F3D33',
  Shipped: '#BFA46A',
  Delivered: '#0F3D33',
  Cancelled: '#BFA46A',
};

const STATUS_ICONS = {
  Pending: '⏳',
  Processing: '⚙️',
  Shipped: '🚚',
  Delivered: '✅',
  Cancelled: '❌',
};

export default function OrderHistoryScreen({ navigation }) {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [expanded, setExpanded] = useState(null);

  const loadOrders = async () => {
    try {
      const data = await fetchMyOrders();
      setOrders(Array.isArray(data) ? data : []);
    } catch (e) {
      console.log(e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => { loadOrders(); }, []);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadOrders();
  }, []);

  const formatDate = (dateStr) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-LK', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  const renderOrder = ({ item }) => {
    const isExpanded = expanded === item._id;
    const statusColor = STATUS_COLORS[item.status] || '#8A8175';
    const statusIcon = STATUS_ICONS[item.status] || '📦';

    return (
      <TouchableOpacity
        style={styles.orderCard}
        onPress={() => setExpanded(isExpanded ? null : item._id)}
        activeOpacity={0.85}
      >
        {/* Order Header */}
        <View style={styles.orderHeader}>
          <View>
            <Text style={styles.orderId}>Order #{item._id.slice(-8).toUpperCase()}</Text>
            <Text style={styles.orderDate}>{formatDate(item.createdAt)}</Text>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: statusColor + '20' }]}>
            <Text style={[styles.statusText, { color: statusColor }]}>
              {statusIcon} {item.status}
            </Text>
          </View>
        </View>

        {/* Summary Row */}
        <View style={styles.summaryRow}>
          <Text style={styles.itemCount}>{item.orderItems?.length} item(s)</Text>
          <Text style={styles.orderTotal}>LKR {Number(item.totalPrice).toLocaleString()}</Text>
        </View>

        {/* Expanded Details */}
        {isExpanded && (
          <View style={styles.expandedDetails}>
            <View style={styles.divider} />

            <Text style={styles.detailsTitle}>Items</Text>
            {item.orderItems?.map((oi, i) => (
              <View key={i} style={styles.orderItem}>
                <Text style={styles.orderItemName} numberOfLines={1}>{oi.name}</Text>
                <Text style={styles.orderItemQty}>× {oi.qty}</Text>
                <Text style={styles.orderItemPrice}>LKR {(oi.price * oi.qty).toLocaleString()}</Text>
              </View>
            ))}

            <View style={styles.divider} />
            <Text style={styles.detailsTitle}>Shipping To</Text>
            <Text style={styles.shippingText}>{item.shippingAddress?.fullName}</Text>
            <Text style={styles.shippingText}>{item.shippingAddress?.address}</Text>
            <Text style={styles.shippingText}>{item.shippingAddress?.city}</Text>
            <Text style={styles.shippingText}>📞 {item.shippingAddress?.phoneNumber}</Text>
          </View>
        )}

        <Text style={styles.expandHint}>{isExpanded ? '▲ Hide details' : '▼ View details'}</Text>
      </TouchableOpacity>
    );
  };

  if (loading) return <ActivityIndicator size="large" color="#1B1B1B" style={styles.loader} />;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backBtn}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>My Orders</Text>
        <View style={{ width: 24 }} />
      </View>

      {orders.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyIcon}>📦</Text>
          <Text style={styles.emptyText}>No orders yet</Text>
          <Text style={styles.emptySubtext}>Your orders will appear here</Text>
          <TouchableOpacity style={styles.shopBtn} onPress={() => navigation.navigate('Home')}>
            <Text style={styles.shopBtnText}>Start Shopping</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={orders}
          keyExtractor={(item) => item._id}
          renderItem={renderOrder}
          contentContainerStyle={styles.list}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FBFAF7' },
  loader: { flex: 1, justifyContent: 'center' },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    backgroundColor: '#FFFFFF', padding: 24, paddingTop: 54, borderBottomWidth: 1, borderBottomColor: '#E9E2D8',
  },
  backBtn: { color: '#9F8247', fontSize: 22, fontWeight: '700' },
  headerTitle: { color: '#1B1B1B', fontSize: 24, fontFamily: 'Georgia', fontWeight: '700' },
  list: { padding: 14, paddingBottom: 30 },
  orderCard: {
    backgroundColor: '#FFFFFF', borderRadius: 16, padding: 16, marginBottom: 14,
    shadowColor: '#1B1B1B', shadowOpacity: 0.06, shadowRadius: 16, elevation: 3,
  },
  orderHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 },
  orderId: { fontSize: 14, fontWeight: '800', color: '#1B1B1B' },
  orderDate: { fontSize: 12, color: '#8A8175', marginTop: 2 },
  statusBadge: { borderRadius: 20, paddingVertical: 5, paddingHorizontal: 12 },
  statusText: { fontSize: 12, fontWeight: '700' },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  itemCount: { fontSize: 13, color: '#8A8175' },
  orderTotal: { fontSize: 16, fontWeight: '900', color: '#1B1B1B' },
  expandedDetails: { marginTop: 12 },
  divider: { height: 1, backgroundColor: '#F5F1EA', marginVertical: 12 },
  detailsTitle: { fontSize: 13, fontWeight: '800', color: '#8A8175', marginBottom: 8, textTransform: 'uppercase' },
  orderItem: { flexDirection: 'row', alignItems: 'center', marginBottom: 6 },
  orderItemName: { flex: 1, fontSize: 13, color: '#1B1B1B' },
  orderItemQty: { fontSize: 12, color: '#8A8175', marginHorizontal: 8 },
  orderItemPrice: { fontSize: 13, fontWeight: '700', color: '#1B1B1B' },
  shippingText: { fontSize: 13, color: '#3B3B3B', marginBottom: 3 },
  expandHint: { textAlign: 'center', color: '#8A8175', fontSize: 11, marginTop: 12 },
  emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 10 },
  emptyIcon: { fontSize: 60 },
  emptyText: { fontSize: 24, fontFamily: 'Georgia', fontWeight: '700', color: '#1B1B1B' },
  emptySubtext: { fontSize: 14, color: '#8A8175' },
  shopBtn: { marginTop: 8, backgroundColor: '#1B1B1B', borderRadius: 12, paddingVertical: 12, paddingHorizontal: 28 },
  shopBtnText: { color: '#FFFFFF', fontWeight: '700', fontSize: 15 },
});
