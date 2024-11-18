import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, ActivityIndicator } from 'react-native';
import axios from 'axios';
import Constants from 'expo-constants';

const API_BASE_URL = Constants.expoConfig?.extra?.API_BASE_URL;

interface IssuedItem {
  _id: string; // Assuming you're using MongoDB's default ID
  s_enroll_number: string;
  email: string;
  it_name: string;
  it_quantity: number;
  issue_date: string;
  return_date:string;
  it_status:string;
}

export default function ItemsIssuedScreen() {
  const [issuedItems, setIssuedItems] = useState<IssuedItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchIssuedItems();
  }, []);

  const fetchIssuedItems = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/items-issued`);
      setIssuedItems(response.data);
    } catch (error) {
      console.error('Error fetching issued items:', error);
    } finally {
      setLoading(false);
    }
  };

  const renderTableHeader = () => (
    <View style={styles.tableHeader}>
      <Text style={styles.headerText}>S.No</Text>
      <Text style={styles.headerText}>Enrollment</Text>
      <Text style={styles.headerText}>Email</Text>
      <Text style={styles.headerText}>Item Name</Text>
      <Text style={styles.headerText}>Quantity</Text>
      <Text style={styles.headerText}>Issue Date</Text>
      <Text style={styles.headerText}>Return Date</Text>
      <Text style={styles.headerText}>Status</Text>
    </View>
  );

  const renderTableRow = ({ item, index }: { item: IssuedItem; index: number }) => (
    <View style={styles.tableRow}>
      <Text style={styles.cell}>{index + 1}</Text>
      <Text style={styles.cell}>{item.s_enroll_number}</Text>
      <Text style={styles.cell}>{item.email}</Text>
      <Text style={styles.cell}>{item.it_name}</Text>
      <Text style={styles.cell}>{item.it_quantity}</Text>
      <Text style={styles.cell}>{new Date(item.issue_date).toLocaleDateString()}</Text>
      <Text style={styles.cell}>{new Date(item.return_date).toLocaleDateString()}</Text>
      <Text style={styles.cell}>{item.it_status ? "not returned" : "returned"}</Text>
    </View>
  );

  if (loading) {
    return <ActivityIndicator size="large" color="#1D3D47" />;
  }

  return (
    <View style={styles.container}>
      {renderTableHeader()}
      <FlatList
        data={issuedItems}
        renderItem={renderTableRow}
        keyExtractor={(item) => item._id} // Use the MongoDB ID for uniqueness
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
    backgroundColor: '#f8f9fa',
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#1D3D47',
    padding: 10,
    borderRadius: 5,
  },
  headerText: {
    color: '#fff',
    flex: 1,
    textAlign: 'center',
    fontWeight: 'bold',
  },
  tableRow: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    paddingVertical: 10,
    marginBottom: 5,
    borderRadius: 5,
  },
  cell: {
    flex: 1,
    textAlign: 'center',
  },
});
