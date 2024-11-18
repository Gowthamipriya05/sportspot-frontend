import React, { useEffect, useState } from 'react';
import { View, Button, Alert, Text, StyleSheet } from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
import Papa from 'papaparse';
import { NetworkInfo } from 'react-native-network-info';
import Constants from 'expo-constants';

const API_BASE_URL = Constants.expoConfig?.extra?.API_BASE_URL;

const UploadInventoryScreen = () => {
  const [ipAddress, setIpAddress] = useState('');

  useEffect(() => {
    // Fetch the IP address when the component mounts
    NetworkInfo.getIPAddress().then(ip => {
      setIpAddress(ip);
    });
  }, []);

  // Function to read and parse the CSV
  const readAndParseCSV = async (uri: string) => {
    try {
      const response = await fetch(uri);
      const csvContent = await response.text(); // Read the content as text

      // Parse the CSV contents
      Papa.parse(csvContent, {
        header: true, // Assuming the CSV has headers
        complete: async (result) => {
          console.log('Parsed CSV Data:', result.data); // Print parsed CSV data to console
          await uploadInventoryData(result.data); // Send data to server
        },
        error: (error: any) => {
          console.error('Error parsing CSV:', error);
          Alert.alert('Error', 'Failed to parse CSV file');
        },
      });
    } catch (error) {
      console.error('Error reading file:', error);
      Alert.alert('Error', 'Failed to read CSV file');
    }
  };

  // Function to upload inventory data to the server
  const uploadInventoryData = async (data: any) => {
    try {
      const response = await fetch(`${API_BASE_URL}/upload-inventory`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorMessage = await response.json(); // Fetch the error message
        throw new Error(errorMessage.message || 'Failed to upload inventory data');
      }

      console.log('Data uploaded');
      Alert.alert('Success', 'Data uploaded successfully.');
    } catch (error: any) {
      console.error('Error uploading inventory data:', error);
      Alert.alert('Error', error.message || 'Failed to upload inventory data');
    }
  };

  const pickDocument = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ['text/csv', 'application/vnd.ms-excel', '.csv'],
      });

      console.log('DocumentPicker result:', result);

      // Check if the result has assets
      if (result && !result.canceled && result.assets && result.assets.length > 0) {
        const file = result.assets[0];
        const { uri } = file;

        console.log('File URI:', uri);

        if (uri) {
          await readAndParseCSV(uri);
        }
      } else {
        Alert.alert('Error', 'Document picking was canceled or failed');
      }
    } catch (error) {
      Alert.alert('Error', 'Error picking document');
      console.error('Error picking document:', error);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Upload Inventory</Text>
      <Text style={styles.instruction}>
        Please upload a CSV file with the following format:
        {"\n"}s.no, Item_Name, Quantity
      </Text>
      <View style={styles.buttonContainer}>
        <Button color='#00416a' title="Upload CSV" onPress={pickDocument} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  title: {
    color: 'gray',
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  instruction: {
    fontSize: 16,
    color: 'gray',
    textAlign: 'center',
    marginBottom: 20,
  },
  buttonContainer: {
    width: '100%',
    alignItems: 'center',
  },
});

export default UploadInventoryScreen;
