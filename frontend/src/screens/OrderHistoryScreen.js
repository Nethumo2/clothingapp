import React, { useState, useEffect, useCallback } from 'react';
import {
    View, Text, FlatList, TouchableOpacity, StyleSheet,
    ActivityIndicator, RefreshControl, Modal, TextInput, Alert, Platform
} from 'react-native';
import { fetchMyOrders, cancelOrder, updateShipping } from '../services/api';

const showAlert = (title, message) => {
    if (Platform.OS === 'web') {
        window.alert(`${title}\n${message}`);
    } else {
        Alert.alert(title, message);
    }
};

const STATUS_COLORS = {
    Pending: '#f39c12',
    Processing: '#3498db',
    Shipped: '#9b59b6',
    Delivered: '#2ecc71',
    Cancelled: '#e63946',
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

    // Cancel modal
    const [cancelModal, setCancelModal] = useState(false);
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [cancelling, setCancelling] = useState(false);

    // Edit shipping modal
    const [editModal, setEditModal] = useState(false);
    const [editOrder, setEditOrder] = useState(null);
    const [fullName, setFullName] = useState('');
    const [address, setAddress] = useState('');
    const [city, setCity] = useState('');
    const [phoneNumber, setPhoneNumber] = useState('');
    const [saving, setSaving] = useState(false);

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

    const handleCancelPress = (order) => {
        setSelectedOrder(order);
        setCancelModal(true);
    };

    const handleCancelConfirm = async () => {
        if (!selectedOrder) return;
        setCancelling(true);
        try {
            await cancelOrder(selectedOrder._id);
            setCancelModal(false);
            setSelectedOrder(null);
            await loadOrders();
            showAlert('Success', 'Order cancelled successfully');
        } catch (e) {
            setCancelModal(false);
            showAlert('Error', e.message || 'Failed to cancel order');
        } finally {
            setCancelling(false);
        }
    };

    const handleEditPress = (order) => {
        setEditOrder(order);
        setFullName(order.shippingAddress?.fullName || '');
        setAddress(order.shippingAddress?.address || '');
        setCity(order.shippingAddress?.city || '');
        setPhoneNumber(order.shippingAddress?.phoneNumber || '');
        setEditModal(true);
    };

    const handleEditSave = async () => {
        if (!fullName || !address || !city || !phoneNumber) {
            showAlert('Error', 'Please fill all fields');
            return;
        }
        setSaving(true);
        try {
            await updateShipping(editOrder._id, { fullName, address, city, phoneNumber });
            setEditModal(false);
            setEditOrder(null);
            await loadOrders();
            showAlert('Success', 'Shipping details updated successfully');
        } catch (e) {
            showAlert('Error', e.message || 'Failed to update shipping details');
        } finally {
            setSaving(false);
        }
    };

    const formatDate = (dateStr) => {
        const d = new Date(dateStr);
        return d.toLocaleDateString('en-LK', { day: 'numeric', month: 'short', year: 'numeric' });
    };

    const canCancel = (status) => status === 'Pending' || status === 'Processing';
    const canEdit = (status) => status === 'Pending';

    const renderOrder = ({ item }) => {
        const isExpanded = expanded === item._id;
        const statusColor = STATUS_COLORS[item.status] || '#888';
        const statusIcon = STATUS_ICONS[item.status] || '📦';

        return (
            <View style={styles.orderCard}>
                {/* Tappable header */}
                <TouchableOpacity
                    onPress={() => setExpanded(isExpanded ? null : item._id)}
                    activeOpacity={0.85}
                >
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

                    <View style={styles.summaryRow}>
                        <Text style={styles.itemCount}>{item.orderItems?.length} item(s)</Text>
                        <Text style={styles.orderTotal}>LKR {Number(item.totalPrice).toLocaleString()}</Text>
                    </View>
                </TouchableOpacity>

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

                        {/* Shipping address with edit button */}
                        <View style={styles.shippingHeader}>
                            <Text style={styles.detailsTitle}>Shipping Details</Text>
                            {canEdit(item.status) && (
                                <TouchableOpacity
                                    style={styles.editShippingBtn}
                                    onPress={() => handleEditPress(item)}
                                >
                                    <Text style={styles.editShippingText}>✏️ Edit</Text>
                                </TouchableOpacity>
                            )}
                        </View>

                        <View style={styles.shippingBox}>
                            <Text style={styles.shippingText}>👤 {item.shippingAddress?.fullName}</Text>
                            <Text style={styles.shippingText}>🏠 {item.shippingAddress?.address}</Text>
                            <Text style={styles.shippingText}>🏙️ {item.shippingAddress?.city}</Text>
                            <Text style={styles.shippingText}>📞 {item.shippingAddress?.phoneNumber}</Text>
                        </View>

                        {/* Action Buttons */}
                        {canCancel(item.status) && (
                            <>
                                <View style={styles.divider} />
                                <TouchableOpacity
                                    style={styles.cancelBtn}
                                    onPress={() => handleCancelPress(item)}
                                >
                                    <Text style={styles.cancelBtnText}>❌ Cancel Order</Text>
                                </TouchableOpacity>
                            </>
                        )}

                        {!canCancel(item.status) && item.status !== 'Cancelled' && (
                            <>
                                <View style={styles.divider} />
                                <Text style={styles.cantCancelText}>
                                    ℹ️ This order cannot be cancelled as it is already {item.status}
                                </Text>
                            </>
                        )}
                    </View>
                )}

                <TouchableOpacity onPress={() => setExpanded(isExpanded ? null : item._id)}>
                    <Text style={styles.expandHint}>{isExpanded ? '▲ Hide details' : '▼ View details'}</Text>
                </TouchableOpacity>
            </View>
        );
    };

    if (loading) return <ActivityIndicator size="large" color="#1a1a1a" style={styles.loader} />;

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

            {/* ── CANCEL MODAL ── */}
            <Modal transparent visible={cancelModal} animationType="fade" onRequestClose={() => setCancelModal(false)}>
                <View style={styles.overlay}>
                    <View style={styles.modal}>
                        <Text style={styles.modalTitle}>❌ Cancel Order</Text>
                        <Text style={styles.modalMessage}>
                            Are you sure you want to cancel Order #{selectedOrder?._id.slice(-8).toUpperCase()}?{'\n\n'}
                            This action cannot be undone.
                        </Text>
                        <View style={styles.modalBtnRow}>
                            <TouchableOpacity style={styles.modalKeepBtn} onPress={() => setCancelModal(false)}>
                                <Text style={styles.modalKeepText}>Keep Order</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.modalCancelBtn, cancelling && { opacity: 0.6 }]}
                                onPress={handleCancelConfirm}
                                disabled={cancelling}
                            >
                                <Text style={styles.modalCancelText}>{cancelling ? 'Cancelling...' : 'Cancel Order'}</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>

            {/* ── EDIT SHIPPING MODAL ── */}
            <Modal transparent visible={editModal} animationType="slide" onRequestClose={() => setEditModal(false)}>
                <View style={styles.overlay}>
                    <View style={[styles.modal, { maxHeight: '85%' }]}>
                        <Text style={styles.modalTitle}>✏️ Edit Shipping Details</Text>
                        <Text style={styles.modalSubtitle}>Order #{editOrder?._id.slice(-8).toUpperCase()}</Text>

                        <Text style={styles.inputLabel}>Full Name *</Text>
                        <TextInput
                            style={styles.modalInput}
                            value={fullName}
                            onChangeText={setFullName}
                            placeholder="Full Name"
                        />

                        <Text style={styles.inputLabel}>Address *</Text>
                        <TextInput
                            style={styles.modalInput}
                            value={address}
                            onChangeText={setAddress}
                            placeholder="Street Address"
                        />

                        <Text style={styles.inputLabel}>City *</Text>
                        <TextInput
                            style={styles.modalInput}
                            value={city}
                            onChangeText={setCity}
                            placeholder="City"
                        />

                        <Text style={styles.inputLabel}>Phone Number *</Text>
                        <TextInput
                            style={styles.modalInput}
                            value={phoneNumber}
                            onChangeText={setPhoneNumber}
                            placeholder="Phone Number"
                            keyboardType="phone-pad"
                        />

                        <View style={[styles.modalBtnRow, { marginTop: 16 }]}>
                            <TouchableOpacity style={styles.modalKeepBtn} onPress={() => setEditModal(false)}>
                                <Text style={styles.modalKeepText}>Cancel</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.modalSaveBtn, saving && { opacity: 0.6 }]}
                                onPress={handleEditSave}
                                disabled={saving}
                            >
                                <Text style={styles.modalSaveText}>{saving ? 'Saving...' : 'Save Changes'}</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
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
    backBtn: { color: '#fff', fontSize: 22, fontWeight: '700' },
    headerTitle: { color: '#fff', fontSize: 20, fontWeight: '800' },
    list: { padding: 14, paddingBottom: 30 },
    orderCard: {
        backgroundColor: '#fff', borderRadius: 14, padding: 16, marginBottom: 14,
        shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 8, elevation: 3,
    },
    orderHeader: {
        flexDirection: 'row', justifyContent: 'space-between',
        alignItems: 'flex-start', marginBottom: 10,
    },
    orderId: { fontSize: 14, fontWeight: '800', color: '#1a1a1a' },
    orderDate: { fontSize: 12, color: '#888', marginTop: 2 },
    statusBadge: { borderRadius: 20, paddingVertical: 5, paddingHorizontal: 12 },
    statusText: { fontSize: 12, fontWeight: '700' },
    summaryRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    itemCount: { fontSize: 13, color: '#888' },
    orderTotal: { fontSize: 16, fontWeight: '900', color: '#1a1a1a' },
    expandedDetails: { marginTop: 12 },
    divider: { height: 1, backgroundColor: '#f0f0f0', marginVertical: 12 },
    detailsTitle: { fontSize: 13, fontWeight: '800', color: '#888', textTransform: 'uppercase' },
    orderItem: { flexDirection: 'row', alignItems: 'center', marginBottom: 6 },
    orderItemName: { flex: 1, fontSize: 13, color: '#1a1a1a' },
    orderItemQty: { fontSize: 12, color: '#888', marginHorizontal: 8 },
    orderItemPrice: { fontSize: 13, fontWeight: '700', color: '#1a1a1a' },
    shippingHeader: {
        flexDirection: 'row', justifyContent: 'space-between',
        alignItems: 'center', marginBottom: 8,
    },
    editShippingBtn: {
        backgroundColor: '#f0f0f0', borderRadius: 8,
        paddingVertical: 4, paddingHorizontal: 10,
    },
    editShippingText: { fontSize: 12, fontWeight: '700', color: '#1a1a1a' },
    shippingBox: {
        backgroundColor: '#f9f9f9', borderRadius: 10,
        padding: 12, gap: 4,
    },
    shippingText: { fontSize: 13, color: '#555', marginBottom: 3 },
    cancelBtn: {
        backgroundColor: '#fff', borderWidth: 1.5, borderColor: '#e63946',
        borderRadius: 10, padding: 14, alignItems: 'center',
    },
    cancelBtnText: { color: '#e63946', fontWeight: '700', fontSize: 14 },
    cantCancelText: { fontSize: 12, color: '#888', fontStyle: 'italic', textAlign: 'center' },
    expandHint: { textAlign: 'center', color: '#bbb', fontSize: 11, marginTop: 12 },
    emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 10 },
    emptyIcon: { fontSize: 60 },
    emptyText: { fontSize: 20, fontWeight: '800', color: '#1a1a1a' },
    emptySubtext: { fontSize: 14, color: '#888' },
    shopBtn: {
        marginTop: 8, backgroundColor: '#1a1a1a',
        borderRadius: 12, paddingVertical: 12, paddingHorizontal: 28,
    },
    shopBtnText: { color: '#fff', fontWeight: '700', fontSize: 15 },

    // Modals
    overlay: {
        flex: 1, backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center', alignItems: 'center', padding: 24,
    },
    modal: {
        backgroundColor: '#fff', borderRadius: 16, padding: 24,
        width: '100%', maxWidth: 420,
        shadowColor: '#000', shadowOpacity: 0.2, shadowRadius: 20, elevation: 10,
    },
    modalTitle: { fontSize: 18, fontWeight: '800', color: '#1a1a1a', marginBottom: 4 },
    modalSubtitle: { fontSize: 12, color: '#888', marginBottom: 16 },
    modalMessage: { fontSize: 14, color: '#555', lineHeight: 22, marginBottom: 24 },
    inputLabel: {
        fontSize: 11, fontWeight: '700', color: '#888',
        textTransform: 'uppercase', marginBottom: 4, marginTop: 10,
    },
    modalInput: {
        borderWidth: 1, borderColor: '#e0e0e0', borderRadius: 10,
        padding: 12, fontSize: 14, color: '#1a1a1a', backgroundColor: '#fafafa',
    },
    modalBtnRow: { flexDirection: 'row', gap: 12 },
    modalKeepBtn: {
        flex: 1, borderWidth: 1.5, borderColor: '#ddd',
        borderRadius: 10, padding: 14, alignItems: 'center',
    },
    modalKeepText: { color: '#555', fontWeight: '700', fontSize: 14 },
    modalCancelBtn: {
        flex: 1, backgroundColor: '#e63946',
        borderRadius: 10, padding: 14, alignItems: 'center',
    },
    modalCancelText: { color: '#fff', fontWeight: '700', fontSize: 14 },
    modalSaveBtn: {
        flex: 1, backgroundColor: '#1a1a1a',
        borderRadius: 10, padding: 14, alignItems: 'center',
    },
    modalSaveText: { color: '#fff', fontWeight: '700', fontSize: 14 },
});