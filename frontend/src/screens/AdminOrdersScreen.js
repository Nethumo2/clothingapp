// AdminOrdersScreen.js
import React, { useState, useEffect, useCallback } from 'react';
import {
    View,
    Text,
    FlatList,
    TouchableOpacity,
    StyleSheet,
    ActivityIndicator,
    RefreshControl,
    Alert,
    Platform,
} from 'react-native';
import { useAuth } from '../context/AuthContext';
import {
    fetchAllOrders,
    updateOrderStatus,
    cancelOrder,
} from '../services/api';

const STATUS_OPTIONS = ['Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled'];

export default function AdminOrdersScreen({ navigation }) {
    const { user } = useAuth();
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [updatingId, setUpdatingId] = useState(null);

    const showAlert = (title, message) => {
        if (Platform.OS === 'web') {
            window.alert(`${title}\n${message}`);
        } else {
            Alert.alert(title, message);
        }
    };

    const loadOrders = async () => {
        try {
            setLoading(true);
            const data = await fetchAllOrders();
            setOrders(Array.isArray(data) ? data : []);
        } catch (err) {
            console.error('Error fetching orders:', err);
            showAlert('Error', 'Failed to load orders');
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        loadOrders();
    }, []);

    const onRefresh = useCallback(() => {
        setRefreshing(true);
        loadOrders();
    }, []);

    const handleUpdateStatus = async (orderId, newStatus) => {
        if (!newStatus) return;

        try {
            setUpdatingId(orderId);
            const updatedOrder = await updateOrderStatus(orderId, newStatus);

            setOrders(prev =>
                prev.map(order => (order._id === orderId ? updatedOrder : order))
            );

            showAlert('Success', `Order status updated to ${newStatus}`);
        } catch (err) {
            console.error(err);
            showAlert('Error', err.message || 'Failed to update status');
        } finally {
            setUpdatingId(null);
        }
    };

    const handleCancelOrder = (orderId) => {
        Alert.alert(
            'Cancel Order',
            'Are you sure you want to cancel this order?',
            [
                { text: 'No', style: 'cancel' },
                {
                    text: 'Yes',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            await cancelOrder(orderId);
                            setOrders(prev => prev.filter(order => order._id !== orderId));
                            showAlert('Success', 'Order cancelled successfully');
                        } catch (err) {
                            showAlert('Error', err.message || 'Failed to cancel order');
                        }
                    },
                },
            ]
        );
    };

    const getStatusColor = (status) => {
        switch (status?.toLowerCase()) {
            case 'pending': return '#f39c12';
            case 'processing': return '#3498db';
            case 'shipped': return '#2ecc71';
            case 'delivered': return '#27ae60';
            case 'cancelled': return '#e74c3c';
            default: return '#777';
        }
    };

    const renderOrder = ({ item }) => {
        const isUpdating = updatingId === item._id;

        return (
            <View style={styles.orderCard}>
                <View style={styles.orderHeader}>
                    <View>
                        <Text style={styles.orderId}>Order #{item._id.slice(-8).toUpperCase()}</Text>
                        <Text style={styles.date}>
                            {new Date(item.createdAt).toLocaleDateString('en-GB', {
                                year: 'numeric',
                                month: 'short',
                                day: 'numeric',
                            })}
                        </Text>
                    </View>
                    <Text style={[styles.status, { color: getStatusColor(item.status) }]}>
                        {item.status || 'Pending'}
                    </Text>
                </View>

                <View style={styles.userInfo}>
                    <Text style={styles.label}>Customer:</Text>
                    <Text style={styles.value}>
                        {item.user?.name || 'Unknown'} ({item.user?.email})
                    </Text>
                </View>

                <View style={styles.shippingInfo}>
                    <Text style={styles.label}>Shipping Address:</Text>
                    <Text style={styles.value}>
                        {item.shippingAddress?.fullName}
                    </Text>
                    <Text style={styles.value}>
                        {item.shippingAddress?.address}, {item.shippingAddress?.city}
                    </Text>
                    <Text style={styles.value}>
                        📞 {item.shippingAddress?.phoneNumber}
                    </Text>
                </View>

                <View style={styles.itemsSummary}>
                    <Text style={styles.label}>Items:</Text>
                    <Text style={styles.value}>
                        {item.orderItems?.length} item{item.orderItems?.length > 1 ? 's' : ''}
                    </Text>
                </View>

                <View style={styles.totalRow}>
                    <Text style={styles.totalLabel}>Total Amount</Text>
                    <Text style={styles.totalAmount}>
                        LKR {Number(item.totalPrice).toLocaleString()}
                    </Text>
                </View>

                {/* Status Update */}
                <View style={styles.actionRow}>
                    <Text style={styles.actionLabel}>Update Status:</Text>
                    <View style={styles.statusButtons}>
                        {STATUS_OPTIONS.map(status => (
                            <TouchableOpacity
                                key={status}
                                style={[
                                    styles.statusBtn,
                                    item.status === status && styles.statusBtnActive,
                                    isUpdating && styles.statusBtnDisabled,
                                ]}
                                onPress={() => handleUpdateStatus(item._id, status)}
                                disabled={isUpdating || item.status === status}
                            >
                                <Text style={[
                                    styles.statusBtnText,
                                    item.status === status && styles.statusBtnTextActive
                                ]}>
                                    {status}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>

                {/* Cancel Button */}
                {item.status !== 'Delivered' && item.status !== 'Cancelled' && (
                    <TouchableOpacity
                        style={styles.cancelBtn}
                        onPress={() => handleCancelOrder(item._id)}
                    >
                        <Text style={styles.cancelBtnText}>Cancel Order</Text>
                    </TouchableOpacity>
                )}
            </View>
        );
    };

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.headerTitle}>All Orders</Text>
                <Text style={styles.orderCount}>{orders.length} orders</Text>
            </View>

            {loading && !refreshing ? (
                <ActivityIndicator size="large" color="#1a1a1a" style={{ marginTop: 100 }} />
            ) : (
                <FlatList
                    data={orders}
                    keyExtractor={(item) => item._id}
                    renderItem={renderOrder}
                    contentContainerStyle={styles.list}
                    refreshControl={
                        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
                    }
                    ListEmptyComponent={
                        <View style={styles.empty}>
                            <Text style={styles.emptyText}>No orders found</Text>
                        </View>
                    }
                />
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f5f5f5' },
    header: {
        backgroundColor: '#1a1a1a',
        padding: 20,
        paddingTop: 60,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    headerTitle: {
        color: '#fff',
        fontSize: 22,
        fontWeight: '700',
    },
    orderCount: {
        color: '#aaa',
        fontSize: 15,
    },
    list: {
        padding: 15,
    },
    orderCard: {
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 15,
        marginBottom: 15,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    orderHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 12,
    },
    orderId: {
        fontWeight: '700',
        fontSize: 16,
    },
    date: {
        color: '#666',
        fontSize: 13,
        marginTop: 2,
    },
    status: {
        fontWeight: '700',
        fontSize: 14,
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 20,
        overflow: 'hidden',
    },
    userInfo: { marginVertical: 8 },
    shippingInfo: { marginVertical: 8 },
    itemsSummary: { marginVertical: 8 },
    label: {
        fontSize: 13,
        color: '#555',
        marginBottom: 2,
    },
    value: {
        fontSize: 15,
        color: '#333',
    },
    totalRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: 12,
        paddingTop: 12,
        borderTopWidth: 1,
        borderTopColor: '#eee',
    },
    totalLabel: { fontWeight: '600', color: '#333' },
    totalAmount: {
        fontSize: 18,
        fontWeight: '700',
        color: '#e63946',
    },
    actionRow: {
        marginTop: 15,
    },
    actionLabel: {
        fontSize: 14,
        fontWeight: '600',
        marginBottom: 8,
        color: '#444',
    },
    statusButtons: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
    },
    statusBtn: {
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: '#ddd',
        backgroundColor: '#f9f9f9',
    },
    statusBtnActive: {
        backgroundColor: '#1a1a1a',
        borderColor: '#1a1a1a',
    },
    statusBtnDisabled: {
        opacity: 0.6,
    },
    statusBtnText: {
        fontSize: 13,
        fontWeight: '600',
    },
    statusBtnTextActive: {
        color: '#fff',
    },
    cancelBtn: {
        marginTop: 12,
        backgroundColor: '#e74c3c',
        padding: 12,
        borderRadius: 8,
        alignItems: 'center',
    },
    cancelBtnText: {
        color: '#fff',
        fontWeight: '700',
    },
    empty: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 100,
    },
    emptyText: {
        fontSize: 18,
        color: '#888',
    },
});