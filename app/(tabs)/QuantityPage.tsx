import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Alert } from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface Product {
    _id: string; // Use _id for MongoDB compatibility
    it_name: string;
    it_quantity: number;
}

const QuantityPage: React.FC = () => {
    const route = useRoute();
    const navigation = useNavigation();
    const { product } = route.params as { product: Product };
    const [quantity, setQuantity] = useState('');
    const [enrollNumber, setEnrollNumber] = useState<string | null>(null);

    useEffect(() => {
        const getEnrollmentNumber = async () => {
            const storedEnrollNumber = await AsyncStorage.getItem('enrollmentNumber');
            setEnrollNumber(storedEnrollNumber);
            console.log('Enrollment number retrieved:', storedEnrollNumber);
        };
        getEnrollmentNumber();
    }, []);

    const handleIssue = async () => {
        const enteredQuantity = parseInt(quantity);
        
        if (!enrollNumber) {
            Alert.alert('Error', 'Enrollment number not found. Please log in again.');
            return;
        }

        if (!quantity || isNaN(enteredQuantity) || enteredQuantity <= 0) {
            Alert.alert('Error', 'Please enter a valid quantity');
            return;
        }

        if (enteredQuantity > product.it_quantity) {
            Alert.alert('Error', 'Insufficient quantity available');
            return;
        }

        try {
            const issueDate = new Date().toISOString().split('T')[0];
            const updatedQuantity = product.it_quantity - enteredQuantity;

            console.log('Issuing item:', {
                s_enroll_number: enrollNumber,
                it_name: product.it_name,
                it_quantity: enteredQuantity,
                issue_date: issueDate,
            });

            await axios.post('http://localhost:3000/issue-item', {
                s_enroll_number: enrollNumber,
                it_name: product.it_name,
                it_quantity: enteredQuantity,
                issue_date: issueDate,
                return_date: null,
            });

            // Use MongoDB _id for the update operation
            await axios.put(`http://localhost:3000/update-item/${product._id}`, {
                it_quantity: updatedQuantity,
            });

            Alert.alert('Success', 'Item issued successfully!');
            navigation.navigate('IssueItem');
        } catch (error) {
            console.error('Error during issuing item:', error);
            Alert.alert('Error', 'Failed to issue item. Please try again.');
        }
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Issue Product</Text>
            <Text>Product Name: {product.it_name}</Text>
            <Text>Available Quantity: {product.it_quantity}</Text>
            
            <TextInput
                style={styles.input}
                placeholder="Enter quantity"
                keyboardType="numeric"
                value={quantity}
                onChangeText={setQuantity}
            />
            
            <Button title="Issue" onPress={handleIssue} />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
    },
    title: {
        fontSize: 24,
        marginBottom: 20,
    },
    input: {
        borderWidth: 1,
        borderColor: '#ccc',
        padding: 10,
        marginBottom: 20,
    },
});

export default QuantityPage;
