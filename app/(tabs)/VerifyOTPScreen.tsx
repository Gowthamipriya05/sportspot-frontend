import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Alert, TextInput, TouchableOpacity } from 'react-native';
import axios from 'axios';
import { useRoute, useNavigation } from '@react-navigation/native';
import { RouteProp } from '@react-navigation/native';
import { RootStackParamList } from '../../types';
import Constants from 'expo-constants';

const API_BASE_URL = Constants.expoConfig?.extra?.API_BASE_URL;

export default function VerifyOTPScreen() {
  const route = useRoute<RouteProp<RootStackParamList, 'VerifyOTPScreen'>>();
  const navigation = useNavigation();
  const { email } = route.params;
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
  
    sendOtp();
  }, [email]);

  const sendOtp = async () => {
    try {
      await axios.post(`${API_BASE_URL}/send-otp`, { email });
      Alert.alert('Check your email', 'An OTP has been sent to your email. Please check your inbox and spam folder.');
    } catch (error: any) {
      Alert.alert('Error', error.response?.data?.message || 'Failed to send OTP');
    }
  };

  const verifyOtp = async () => {
    setLoading(true);
    try {
      const response = await axios.post(`${API_BASE_URL}/verify-otp`, { email, otp });
      Alert.alert('Success', response.data.message);
      navigation.navigate('MainScreen');
    } catch (error: any) {
      Alert.alert('Error', error.response?.data?.message || 'OTP verification failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Enter OTP</Text>
      <TextInput style={styles.input} placeholder="Enter OTP" value={otp} onChangeText={setOtp} keyboardType="numeric" />
      <TouchableOpacity onPress={verifyOtp} disabled={loading} style={styles.verifyButton}>
        <Text style={styles.buttonText}>{loading ? 'Verifying...' : 'Verify OTP'}</Text>
      </TouchableOpacity>
      <Text style={styles.instructionText}>If you don't see the email, check your spam folder.</Text>
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
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  input: {
    height: 50,
    borderColor: '#ccc',
    borderWidth: 1,
    marginBottom: 15,
    paddingLeft: 15,
    borderRadius: 10,
    backgroundColor: '#fff',
    width: '80%',
  },
  verifyButton: {
    backgroundColor: '#1D3D47',
    borderRadius: 10,
    paddingVertical: 15,
    width: '80%',
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  instructionText: {
    color: '#555',
    marginTop: 20,
  },
});
