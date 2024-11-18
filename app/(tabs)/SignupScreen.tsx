import React, { useState } from 'react';
import { View, TextInput, StyleSheet, Text, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import axios from 'axios';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useNavigation, NavigationProp } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { RootStackParamList } from '../../types';
import { Picker } from '@react-native-picker/picker';
import Constants from 'expo-constants';

const API_BASE_URL = Constants.expoConfig?.extra?.API_BASE_URL;

export default function SignupScreen() {
  const [name, setName] = useState('');
  const [enrollment, setEnrollment] = useState('');
  const [branch, setBranch] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [phone, setPhone] = useState('');
  const [designation, setDesignation] = useState('');
  const [stream, setStream] = useState('');  // New stream state
  const [loading, setLoading] = useState(false);
  const [year,setYear]=useState('');

  const navigation = useNavigation<NavigationProp<RootStackParamList>>();

  const checkEmailExists = async () => {
    console.log('ipaddress',API_BASE_URL);
    try {
      const response = await axios.post(`${API_BASE_URL}/check-email`, { email });
      return response.data.exists;
    } catch (error) {
      console.error("Error checking email:", error);  // Log the entire error object for debugging
      Alert.alert('Error', error.response?.data?.message || 'Failed to check email. Please try again.');
      return false;
    }
  };
  

  const handleSignup = async () => {
    if (!name || !email || !password || !designation || 
      (designation === 'student' && (!phone || !enrollment || !branch || !stream))) {
        console.log('Error', 'Please fill all the required fields.')
      Alert.alert('Error', 'Please fill all the required fields.');
      return;
    }
  
    setLoading(true);
    const emailExists = await checkEmailExists();
  
    if (emailExists) {
      setLoading(false);
      console.log('Error', 'Email is already registered.');
      Alert.alert('Error', 'Email is already registered.');
    } else {
      try {
        const response = await axios.post(`${API_BASE_URL}/register`, {
          name,
          enroll_number: enrollment,
          email,
          mobile: phone,
          password,
          branch,
          designation,
          stream: designation === 'student' ? stream : undefined,  // Include stream for students
          year,
        });
  
        const storageData = [
          ['name', name],
          ['email', email],
          ['password', password],
          ['designation', designation],

        ];
  
        if (designation === 'student') {
          storageData.push(
            ['phone', phone],
            ['enrollmentNumber', enrollment],
            ['branch', branch],
            ['stream', stream],  // Store stream in AsyncStorage
          );
        }
  
        await AsyncStorage.multiSet(storageData);
  
        setLoading(false);
        Alert.alert('Success', response.data.message);
        navigation.navigate('VerifyOTPScreen', {
          email,
          name,
          enroll_number: enrollment,
          branch,
          password,
          mobile: phone,
          stream,  // Pass stream to the next screen
        });
  
      } catch (error:any) {
        setLoading(false);
        console.log('Error', error.response?.data?.message || 'Registration failed')
        Alert.alert('Error', error.response?.data?.message || 'Registration failed');
      }
    }
  };
  

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.title}>Sign Up</Text>
        <TextInput style={styles.input} placeholder="Name" value={name} onChangeText={setName} placeholderTextColor="#999" />
        <TextInput style={styles.input} placeholder="Email" value={email} onChangeText={setEmail} keyboardType="email-address" placeholderTextColor="#999" />

        <View style={styles.passwordContainer}>
          <TextInput
            style={styles.passwordInput}
            placeholder="Password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry={!showPassword}
            placeholderTextColor="#999"
          />
          <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.eyeIcon}>
            <Icon name={showPassword ? 'eye-off' : 'eye'} size={24} color="gray" />
          </TouchableOpacity>
        </View>

        <View style={styles.pickerContainer}>
          <Picker
            selectedValue={designation}
            style={[styles.picker, !stream && styles.placeholderText]}
            onValueChange={(itemValue:any) => setDesignation(itemValue)}
          >
            <Picker.Item color="gray" label="Please enter your designation" value="" />
            <Picker.Item label="Student" value="student" />
            <Picker.Item label="Admin" value="admin" />
          </Picker>
        </View>

        {designation === 'student' && (
          <>
            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={stream}
                style={[styles.picker, !stream && styles.placeholderText]}
                onValueChange={(itemValue:any) => setStream(itemValue)}
              >
                <Picker.Item color="#999" label="Please enter your Stream" value="" />
                <Picker.Item label="BTech" value="BTech" />
                <Picker.Item label="MTech" value="MTech" />
              </Picker>
            </View>

            
            <TextInput style={styles.input} placeholder="Passout Year" value={year} onChangeText={setYear} keyboardType="phone-pad" placeholderTextColor="#999" />
            <TextInput style={styles.input} placeholder="Phone Number" value={phone} onChangeText={setPhone} keyboardType="phone-pad" placeholderTextColor="#999" />
            <TextInput style={styles.input} placeholder="Enrollment Number" value={enrollment} onChangeText={setEnrollment} keyboardType="numeric" placeholderTextColor="#999" />
            
            <TextInput style={styles.input} placeholder="Branch" value={branch} onChangeText={setBranch} placeholderTextColor="#999" />
          </>
        )}

        <TouchableOpacity onPress={handleSignup} disabled={loading} style={styles.registerButton}>
          {loading ? <ActivityIndicator size="small" color="#fff" /> : <Text style={styles.buttonText}>Register</Text>}
        </TouchableOpacity>

        <View style={styles.footer}>
          <Text style={styles.footerText}>Already has account?</Text>
          <TouchableOpacity onPress={() => navigation.navigate('LoginScreen')}>
            <Text style={styles.signUpLink}> login</Text>
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
    backgroundColor: '#f5f5f5',
  },
  card: {
    width: '90%',
    backgroundColor: '#ffffff',
    borderRadius: 10,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  input: {
    height: 50,
    borderColor: '#cccccc',
    borderWidth: 1,
    borderRadius: 5,
    paddingLeft: 10,
    marginBottom: 15,
  },
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  passwordInput: {
    flex: 1,
    height: 50,
    borderColor: '#cccccc',
    borderWidth: 1,
    borderRadius: 5,
    paddingLeft: 10,
  },
  eyeIcon: {
    marginLeft: 10,
  },
  pickerContainer: {
    marginBottom: 15,
  },
  picker: {
    height: 50,
    borderColor: '#cccccc',
    borderWidth: 1,
    borderRadius: 5,
    backgroundColor: '#ffffff',
  },
  pickerLabel: {
    color: '#333333',
    marginBottom: 5,
  },
  placeholderText: {
    color: '#999',
    marginBottom: 5,
  },
  registerButton: {
    height: 50,
    backgroundColor: '#1D3D47',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 5,
  },
  buttonText: {
    color: '#ffffff',
    fontWeight: 'bold',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 20,
  },
  footerText: {
    color: '#333333',
  },
  signUpLink: {
    color: '#4682B4',
    textDecorationLine: 'underline',
  },
});
