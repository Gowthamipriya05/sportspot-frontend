import React, { useState, useEffect } from 'react';
import { View, Text, Button, FlatList, StyleSheet, Alert, ScrollView } from 'react-native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import NavBar from './NavBar';

interface IssuedItem {
  ii_id: number; // Added to track unique id
  s_enroll_number: string;
  it_name: string;
  issue_date: string;
  return_date: string | null;
  it_quantity: number;
}

export default function ReturnItem() {
  const [itemsIssued, setItemsIssued] = useState<IssuedItem[]>([]);
  const [studentEnrollNumber, setStudentEnrollNumber] = useState<string | null>(null);
  const [email, setEmail] = useState<string | null>(null);

  useEffect(() => {
    const fetchEnrollmentNumber = async () => {
      const enrollmentNumber = await AsyncStorage.getItem('enrollmentNumber');
      setStudentEnrollNumber(enrollmentNumber);
      if (enrollmentNumber) {
        fetchIssuedItems(enrollmentNumber);
      }
    };

    const fetchEmail = async () => {
      const storedEmail = await AsyncStorage.getItem('userEmail');
      setEmail(storedEmail);
    };

    fetchEnrollmentNumber();
    fetchEmail();
  }, []);

  const fetchIssuedItems = async (enrollmentNumber: string) => {
    try {
      const response = await axios.get(`http://localhost:3000/issued-items/${enrollmentNumber}`);
      setItemsIssued(response.data);
    } catch (error) {
      Alert.alert('Error', 'Failed to load issued items');
    }
  };

  const handleReturn = async (item: IssuedItem) => {
    try {
      const returnDate = new Date().toISOString().split('T')[0]; // Get current date for return_date
  
      // Update return_date in items_issued
      await axios.put(`http://localhost:3000/return-item/${item.ii_id}`, { return_date: returnDate });
  
      // Add the quantity back to the items table
      await axios.put(`http://localhost:3000/update-item-quantity/${item.it_name}`, { quantity: item.it_quantity });
  
      // Update the state directly after successful return
      setItemsIssued((prevItems) =>
        prevItems.map((issuedItem) =>
          issuedItem.ii_id === item.ii_id ? { ...issuedItem, return_date: returnDate } : issuedItem
        )
      );
  
      Alert.alert('Success', 'Item returned successfully!');
    } catch (error) {
      Alert.alert('Error', 'Failed to return the item');
    }
  };

  const renderItem = ({ item }: { item: IssuedItem }) => (
    <View style={styles.row}>
      <Text style={styles.cell}>{item.it_name}</Text>
      <Text style={styles.cell}>{item.issue_date}</Text>
      <Text style={styles.cell}>{item.return_date ? item.return_date : 'Not Returned'}</Text>
      <View style={styles.cell}>
        {item.return_date ? (
          <Text style={styles.returnedText}>Returned</Text>
        ) : (
          <Button
            title="Return"
            color="red"
            onPress={() => handleReturn(item)}
          />
        )}
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <NavBar email={email} />
      <ScrollView style={{ marginTop: 10 }}>
        <Text style={styles.enrollText}>
          Enrollment Number: {studentEnrollNumber || 'Loading...'}
        </Text>

        <View style={styles.tableHeader}>
          <Text style={styles.headerCell}>Item Name</Text>
          <Text style={styles.headerCell}>Issue Date</Text>
          <Text style={styles.headerCell}>Return Date</Text>
          <Text style={styles.headerCell}>Action</Text>
        </View>

        <FlatList
          data={itemsIssued}
          keyExtractor={(item) => item.ii_id.toString()}
          renderItem={renderItem}
          ListEmptyComponent={<Text>No items issued</Text>}
        />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  enrollText: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 20,
    marginTop: 70, // Pushes content below NavBar
    zIndex: 1,
  },
  tableHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#f0f0f0',
    paddingVertical: 10,
    marginBottom: 10,
    zIndex: 1,
  },
  headerCell: {
    fontWeight: 'bold',
    flex: 1,
    textAlign: 'center',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
    zIndex: 1,
  },
  cell: {
    flex: 1,
    textAlign: 'center',
  },
  returnedText: {
    color: 'green',
    fontWeight: 'bold',
  },
});
