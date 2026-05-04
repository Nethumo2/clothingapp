import React, { useState } from 'react';
import {
    View, Text, TextInput, TouchableOpacity,
    StyleSheet, ActivityIndicator, Alert, Platform, KeyboardAvoidingView, ScrollView, Image,
} from 'react-native';
import { useAuth } from '../context/AuthContext';

const REGISTER_HERO = 'https://images.unsplash.com/photo-1509631179647-0177331693ae?w=1200';

const showAlert = (title, message) => {
    if (Platform.OS === 'web') {
        window.alert(`${title}\n${message}`);
    } else {
        Alert.alert(title, message);
    }
};

export default function RegisterScreen({ navigation }) {
    const { register } = useAuth();

    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);

    const handleRegister = async () => {
        if (!name || !email || !password) {
            return showAlert('Error', 'All fields are required');
        }

        try {
            setLoading(true);
            await register(name, email, password);
        } catch (e) {
            showAlert('Register Failed', e.message || 'Something went wrong');
        } finally {
            setLoading(false);
        }
    };

    return (
        <KeyboardAvoidingView
            style={styles.container}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
            <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
                <View style={styles.topHero}>
                    <Image source={{ uri: REGISTER_HERO }} style={styles.topHeroImage} resizeMode="cover" />
                    <View style={styles.topHeroShade} />
                    <View style={styles.heroBrandRow}>
                        <View style={styles.heroLogoSeal}>
                            <Text style={styles.heroLogoText}>L</Text>
                        </View>
                        <Text style={styles.heroWordmark}>LUSH</Text>
                    </View>
                    <View style={styles.topHeroCopy}>
                        <Text style={styles.topHeroTitle}>Begin your wardrobe story</Text>
                        <Text style={styles.topHeroSubtitle}>Private access to refined fashion</Text>
                    </View>
                </View>

                <View style={styles.footerAccent}>
                    <Text style={styles.footerAccentText}>PRIVATE WARDROBE</Text>
                </View>

                <View style={styles.header}>
                    <Text style={styles.title}>Create Account</Text>
                    <Text style={styles.subtitle}>Join the boutique and save your orders, cart, and style picks.</Text>
                </View>

                <View style={styles.card}>
                    <TextInput
                        style={styles.input}
                        placeholder="Full Name"
                        placeholderTextColor="#8A8175"
                        value={name}
                        onChangeText={setName}
                    />

                    <TextInput
                        style={styles.input}
                        placeholder="Email"
                        placeholderTextColor="#8A8175"
                        value={email}
                        onChangeText={setEmail}
                        autoCapitalize="none"
                    />

                    <TextInput
                        style={styles.input}
                        placeholder="Password"
                        placeholderTextColor="#8A8175"
                        value={password}
                        onChangeText={setPassword}
                        secureTextEntry
                    />

                    <TouchableOpacity
                        style={styles.registerBtn}
                        onPress={handleRegister}
                        activeOpacity={0.85}
                    >
                        {loading ? (
                            <ActivityIndicator color="#FFFFFF" />
                        ) : (
                            <Text style={styles.registerTextBtn}>Register</Text>
                        )}
                    </TouchableOpacity>

                    <TouchableOpacity onPress={() => navigation.navigate('Login')}>
                        <Text style={styles.loginText}>
                            Already have an account? <Text style={styles.loginLink}>Login</Text>
                        </Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#FBFAF7' },

    content: {
        flexGrow: 1,
        paddingBottom: 24,
        position: 'relative',
    },

    topHero: {
        width: '100%',
        height: 230,
        overflow: 'hidden',
        marginBottom: 26,
        borderBottomLeftRadius: 28,
        borderBottomRightRadius: 28,
        backgroundColor: '#F5F1EA',
    },

    topHeroImage: {
        width: '100%',
        height: '100%',
    },

    topHeroShade: {
        position: 'absolute',
        left: 0,
        right: 0,
        top: 0,
        bottom: 0,
        backgroundColor: 'rgba(15,61,51,0.22)',
    },

    heroBrandRow: {
        position: 'absolute',
        top: 18,
        left: 20,
        right: 20,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
    },

    heroLogoSeal: {
        width: 42,
        height: 42,
        borderRadius: 21,
        borderWidth: 1,
        borderColor: 'rgba(232,216,184,0.9)',
        backgroundColor: 'rgba(255,255,255,0.16)',
        alignItems: 'center',
        justifyContent: 'center',
    },

    heroLogoText: {
        color: '#F4E8D0',
        fontFamily: 'Georgia',
        fontSize: 22,
        fontWeight: '700',
    },

    heroWordmark: {
        color: '#FFFFFF',
        fontSize: 14,
        fontWeight: '900',
        letterSpacing: 3,
    },

    topHeroCopy: {
        position: 'absolute',
        left: 24,
        right: 24,
        bottom: 24,
    },

    topHeroTitle: {
        color: '#FFFFFF',
        fontFamily: 'Georgia',
        fontSize: 30,
        fontWeight: '700',
    },

    topHeroSubtitle: {
        color: '#F4E8D0',
        fontSize: 13,
        marginTop: 6,
        fontWeight: '600',
    },

    footerAccent: {
        position: 'absolute',
        bottom: 30,
        alignSelf: 'center',
        borderTopWidth: 1,
        borderColor: '#E8D8B8',
        paddingTop: 10,
    },

    footerAccentText: {
        color: '#9F8247',
        fontSize: 10,
        fontWeight: '900',
        letterSpacing: 2,
    },

    header: {
        alignItems: 'center',
        marginBottom: 20,
        zIndex: 1,
        paddingHorizontal: 24,
    },

    brand: {
        color: '#9F8247',
        fontSize: 12,
        fontWeight: '900',
        letterSpacing: 3,
        marginBottom: 10,
    },
    title: {
        color: '#0F3D33',
        fontSize: 34,
        fontFamily: 'Georgia',
        fontWeight: '700',
        textAlign: 'center',
    },
    subtitle: {
        color: '#8A8175',
        marginTop: 8,
        fontSize: 14,
        lineHeight: 21,
        textAlign: 'center',
        maxWidth: 320,
    },

    card: {
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        padding: 18,
        shadowColor: '#1B1B1B',
        shadowOpacity: 0.06,
        shadowRadius: 18,
        shadowOffset: { width: 0, height: 8 },
        elevation: 3,
        width: '100%',
        maxWidth: 420,
        alignSelf: 'center',
        borderWidth: 1,
        borderColor: '#E9E2D8',
        zIndex: 1,
        marginHorizontal: 24,
    },

    input: {
        backgroundColor: '#FBFAF7',
        borderRadius: 12,
        padding: 14,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: '#E9E2D8',
        color: '#1B1B1B',
    },

    registerBtn: {
        backgroundColor: '#BFA46A',
        padding: 16,
        borderRadius: 14,
        alignItems: 'center',
        marginTop: 4,
    },
    registerTextBtn: {
        color: '#FFFFFF',
        fontWeight: '800',
        fontSize: 15,
        letterSpacing: 0.3,
    },

    loginText: {
        textAlign: 'center',
        marginTop: 16,
        color: '#3B3B3B',
        fontSize: 13,
    },
    loginLink: {
        color: '#BFA46A',
        fontWeight: '800',
    },
});
