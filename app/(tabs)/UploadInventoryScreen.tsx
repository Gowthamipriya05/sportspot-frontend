import React from 'react';
import { View, Button, Alert, Text, StyleSheet } from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
import Papa from 'papaparse';

const UploadInventoryScreen = () => {
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
      const response = await fetch('http://localhost:3000/upload-inventory', {
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
  
      const result = await response.json(); // Parse the JSON response
      console.log('data uploaded');

    // Show success message and acknowledgment in a single alert
      Alert.alert(
      'Success',
      'Data uploaded successfully. Your data has been uploaded successfully.'
    );

    } catch (error:any) {
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
        <Button title="Upload CSV" onPress={pickDocument} />
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
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  instruction: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
  },
  buttonContainer: {
    width: '100%',
    alignItems: 'center',
  },
});

export default UploadInventoryScreen;
