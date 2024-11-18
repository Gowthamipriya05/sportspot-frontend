import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import Constants from 'expo-constants';

const API_BASE_URL = Constants.expoConfig?.extra?.API_BASE_URL;

export default function ProfilePage() {
  const [name, setName] = useState<string | null>(null);
  const [email, setEmail] = useState<string | null>(null);
  const [enrollmentNumber, setEnrollmentNumber] = useState<string | null>(null);
  const navigation = useNavigation();
 

  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        const storedEmail = await AsyncStorage.getItem('email');
        if (storedEmail) {
          setEmail(storedEmail);
          // Fetch additional user data from the backend using the email
          const response = await axios.post(`${API_BASE_URL}/get-user`, { email: storedEmail });
          setName(response.data.name);
          setEnrollmentNumber(response.data.enrollmentNumber);
        } else {
          Alert.alert('Error', 'No email found');
        }
      } catch (error) {
        Alert.alert('Error', 'Failed to load profile data');
      }
    };

    fetchProfileData();
  }, []);

  const handleLogout = () => {
    // Handle the logout logic here
    AsyncStorage.clear(); // Clear AsyncStorage on logout
    navigation.navigate('Home'); // Navigate back to the Home screen
  };

  return (
    <View style={styles.container}>
      {/* Profile Information */}
      <Text style={styles.header}>Profile</Text>
      <View style={styles.infoContainer}>
        <Text style={styles.label}>Name:</Text>
        <Text style={styles.value}>{name || 'Loading...'}</Text>
      </View>
      <View style={styles.infoContainer}>
        <Text style={styles.label}>Email:</Text>
        <Text style={styles.value}>{email || 'Loading...'}</Text>
      </View>
      <View style={styles.infoContainer}>
        <Text style={styles.label}>Enrollment Number:</Text>
        <Text style={styles.value}>{enrollmentNumber || 'Loading...'}</Text>
      </View>

      {/* Logout Button */}
      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Text style={styles.logoutText}>Log Out</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1B212E',
    alignItems: 'center',
    padding: 20,
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 20,
  },
  infoContainer: {
    width: '100%',
    backgroundColor: '#2D3A45',
    padding: 15,
    borderRadius: 5,
    marginVertical: 10,
  },
  label: {
    color: '#B0B0B0',
    fontSize: 16,
  },
  value: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  logoutButton: {
    marginTop: 30,
    padding: 10,
    backgroundColor: '#D9534F',
    borderRadius: 5,
    width: '100%',
    alignItems: 'center',
  },
  logoutText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
