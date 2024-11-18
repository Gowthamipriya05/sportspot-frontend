import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Alert, FlatList, StyleSheet, TouchableOpacity } from 'react-native';
import axios from 'axios';
import { useNavigation } from '@react-navigation/native';
import { useFocusEffect } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';

const API_BASE_URL = Constants.expoConfig?.extra?.API_BASE_URL;

interface Product {
    _id: string; // Change it_id to _id for MongoDB compatibility
    it_name: string;
    it_quantity: number;
}

const IssueItem: React.FC = () => {
    const [searchQuery, setSearchQuery] = useState('');
    const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
    const [allProducts, setAllProducts] = useState<Product[]>([]);
    const [email, setEmail] = useState<string | null>(null);
    const navigation = useNavigation();

    useFocusEffect(
        React.useCallback(() => {
            fetchProducts();
        }, [])
    );

    useEffect(() => {
        const getEmailFromStorage = async () => {
            try {
                const storedEmail = await AsyncStorage.getItem('userEmail');
                setEmail(storedEmail);
            } catch (error) {
                console.error('Failed to load email from storage:', error);
            }
        };

        getEmailFromStorage();
    }, []);

    const fetchProducts = async () => {
        try {
            const response = await axios.get(`${API_BASE_URL}/products`);
            console.log('Fetched products:', response.data); // Check fetched data
            setAllProducts(response.data);
            setFilteredProducts(response.data);
        } catch (error) {
            console.error('Fetch Error:', error.message);
            Alert.alert('Error', 'Failed to fetch products. Please check your network connection.');
        }
    };
    

    const searchProducts = () => {
        if (!searchQuery.trim()) {
            setFilteredProducts(allProducts);
            return;
        }
        const query = searchQuery.toLowerCase();
        const filtered = allProducts.filter((product) =>
            product.it_name.toLowerCase().includes(query)
        );
        setFilteredProducts(filtered);
    };

    const navigateToQuantityPage = (product: Product) => {
        navigation.navigate('QuantityPage', { product });
    };

    return (
        <View style={styles.container}>
            <View style={styles.searchContainer}>
                <TextInput
                    style={styles.input}
                    placeholder="Search Product"
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                    placeholderTextColor="#999"
                />
                <TouchableOpacity style={styles.searchButton} onPress={searchProducts}>
                    <Text style={styles.searchButtonText}>Search</Text>
                </TouchableOpacity>
            </View>
            <FlatList
                data={filteredProducts}
                keyExtractor={(item) => item._id} // Use _id as the key
                renderItem={({ item }) => (
                    <View style={styles.itemContainer}>
                        <Text style={styles.title}>{item.it_name}</Text>
                        <Text style={styles.title}>Quantity: {item.it_quantity}</Text>
                        <TouchableOpacity style={styles.issueButton} onPress={() => navigateToQuantityPage(item)}>
                            <Text style={styles.issueButtonText}>Issue</Text>
                        </TouchableOpacity>
                    </View>
                )}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 16,
    },
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 20,
    },
    input: {
        flex: 1,
        borderWidth: 1,
        borderColor: '#ccc',
        padding: 10,
        borderRadius: 5,
        marginRight: 10,
    },
    searchButton: {
        backgroundColor: '#00416a',
        padding: 10,
        borderRadius: 5,
    },
    searchButtonText: {
        color: 'white',
        textAlign: 'center',
    },
    itemContainer: {
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#ccc',
        marginBottom: 10,
    },
    title: {
        fontWeight: 'bold',
        color:'gray',
    },
    issueButton: {
        backgroundColor: '#1D3D47',
        padding: 10,
        borderRadius: 5,
        marginTop: 10,
    },
    issueButtonText: {
        color: 'white',
        textAlign: 'center',
    },
});

export default IssueItem;
