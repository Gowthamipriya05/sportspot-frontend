import React, { useState } from 'react';
import { View, TextInput, StyleSheet, Text, TouchableOpacity, Alert, Picker } from 'react-native';
import axios from 'axios';
import { useNavigation, NavigationProp } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { RootStackParamList } from '../../types';

export default function SignupScreen() {
  const [name, setName] = useState('');
  const [enrollment, setEnrollment] = useState('');
  const [branch, setBranch] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [designation, setDesignation] = useState('student'); // Add designation state
  const [loading, setLoading] = useState(false);

  const navigation = useNavigation<NavigationProp<RootStackParamList>>();

  const checkEmailExists = async () => {
    try {
      const response = await axios.post('http://localhost:3000/check-email', { email });
      return response.data.exists; // Assuming the backend returns { exists: true/false }
    } catch (error: any) {
      Alert.alert('Error', error.response?.data?.message || 'Failed to check email');
      return false;
    }
  };

  const handleSignup = async () => {
    if (!name || !enrollment || !branch || !email || !password || !phone || !designation) {
      Alert.alert('Please fill all the fields.');
      return;
    }

    setLoading(true);
    const emailExists = await checkEmailExists();

    if (emailExists) {
      setLoading(false);
      Alert.alert('Error', 'Email is already registered.');
    } else {
      try {
        const response = await axios.post('http://localhost:3000/register', {
          name,
          enroll_number: enrollment,
          email,
          mobile: phone,
          password,
          branch,
          designation, // Send designation to the backend
        });

        // Store user details in AsyncStorage
        await AsyncStorage.setItem('name', name);
        await AsyncStorage.setItem('enrollmentNumber', enrollment);
        await AsyncStorage.setItem('email', email);
        await AsyncStorage.setItem('password', password);
        await AsyncStorage.setItem('branch', branch);
        await AsyncStorage.setItem('phone', phone);
        await AsyncStorage.setItem('designation', designation); // Store designation

        setLoading(false);
        Alert.alert('Success', response.data.message);

        // Navigate based on designation
        if (designation === 'admin') {
          navigation.navigate('AdminDashboard');
        } else {
          navigation.navigate('VerifyOTPScreen', {
            email,
            name,
            enroll_number: enrollment,
            branch,
            password,
            mobile: phone,
          });
        }
      } catch (error: any) {
        setLoading(false);
        Alert.alert('Error', error.response?.data?.message || 'Registration failed');
      }
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.title}>Sign Up</Text>
        <TextInput style={styles.input} placeholder="Name" value={name} onChangeText={setName} />
        <TextInput style={styles.input} placeholder="Enrollment Number" value={enrollment} onChangeText={setEnrollment} keyboardType="numeric" />
        <TextInput style={styles.input} placeholder="Branch" value={branch} onChangeText={setBranch} />
        <TextInput style={styles.input} placeholder="Email" value={email} onChangeText={setEmail} keyboardType="email-address" />
        <TextInput style={styles.input} placeholder="Password" value={password} onChangeText={setPassword} secureTextEntry />
        <TextInput style={styles.input} placeholder="Phone Number" value={phone} onChangeText={setPhone} keyboardType="phone-pad" />

        {/* Designation Picker */}
        <Picker
          selectedValue={designation}
          style={styles.picker}
          onValueChange={(itemValue:any) => setDesignation(itemValue)}
        >
          <Picker.Item label="Student" value="student" />
          <Picker.Item label="Admin" value="admin" />
        </Picker>

        <TouchableOpacity onPress={handleSignup} disabled={loading} style={styles.registerButton}>
          <Text style={styles.buttonText}>{loading ? 'Registering...' : 'Register'}</Text>
        </TouchableOpacity>

        <View style={styles.footer}>
          <Text style={styles.footerText}>Already registered?</Text>
          <TouchableOpacity onPress={() => navigation.navigate('LoginScreen')}>
            <Text style={styles.loginLink}> Login</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
  },
  card: {
    width: '90%',
    padding: 20,
    backgroundColor: 'white',
    borderRadius: 10,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#333',
    textAlign: 'center',
  },
  input: {
    height: 50,
    borderColor: '#ccc',
    borderWidth: 1,
    marginBottom: 15,
    paddingLeft: 15,
    borderRadius: 10,
    backgroundColor: '#fff',
  },
  picker: {
    height: 50,
    marginBottom: 15,
    borderRadius: 10,
  },
  registerButton: {
    backgroundColor: '#1D3D47',
    borderRadius: 10,
    paddingVertical: 15,
    marginTop: 10,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 20,
  },
  footerText: {
    fontSize: 16,
    color: '#333',
  },
  loginLink: {
    fontSize: 16,
    color: 'blue',
  },
});
