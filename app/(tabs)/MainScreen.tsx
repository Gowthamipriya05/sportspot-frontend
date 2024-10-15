import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useNavigation, RouteProp, useRoute } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import NavBar from './NavBar';

// Define the route parameters type for MainScreen
type RootStackParamList = {
  MainScreen: { email: string };
};

export default function MainScreen() {
  const navigation = useNavigation();
  const route = useRoute<RouteProp<RootStackParamList, 'MainScreen'>>();
  const [email, setEmail] = useState('default@nitdelhi.ac.in');
  const [designation, setDesignation] = useState('student'); // Default to 'student'

  useEffect(() => {
    const fetchUserData = async () => {
      const storedEmail = route.params?.email || await AsyncStorage.getItem('email') || 'default@nitdelhi.ac.in';
      const storedDesignation = await AsyncStorage.getItem('designation') || 'student'; // Get designation
      setEmail(storedEmail);
      setDesignation(storedDesignation); // Set designation state
    };
    fetchUserData();
  }, [route.params?.email]);

  const handleLogout = () => {
    navigation.navigate('Home'); // Navigate back to HomeScreen on logout
  };

  return (
    <View style={styles.container}>
      <NavBar email={email} />

      {/* Buttons Container */}
      <View style={styles.buttonsContainer}>
        {designation === 'student' ? (
          <>
            <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('IssueItem')}>
              <Text style={styles.buttonText}>Issue Item</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('ReturnItem')}>
              <Text style={styles.buttonText}>Return Item</Text>
            </TouchableOpacity>
          </>
        ) : (
          <>
            <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('ItemsIssuedScreen')}>
              <Text style={styles.buttonText}>Items Issued by Students</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('UploadInventory')}>
              <Text style={styles.buttonText}>Add Inventory</Text>
            </TouchableOpacity>
          </>
        )}

        <TouchableOpacity style={styles.button} onPress={handleLogout}>
          <Text style={styles.buttonText}>Log Out</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1B212E',
    paddingTop: 60, // Ensure there's enough space for the NavBar
  },
  buttonsContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%', // Ensure full width for buttons
  },
  button: {
    width: '30%', // Make buttons responsive
    padding: 15,
    backgroundColor: '#1D3D47',
    borderRadius: 5,
    alignItems: 'center',
    marginVertical: 10,
  },
  buttonText: {
    color: 'white',
  },
});
