import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Alert, TouchableOpacity, StyleSheet } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { useNavigation } from '@react-navigation/native';
import CaptchaImage from './CaptchaImage'; // Updated CaptchaImage component

const LoginScreen: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [captchaAnswer, setCaptchaAnswer] = useState('');
  const [correctAnswer, setCorrectAnswer] = useState(0);
  const [captchaProblem, setCaptchaProblem] = useState<{ num1: number; num2: number } | null>(null);

  const navigation = useNavigation();

  // Function to generate a random math problem
  const generateMathProblem = () => {
    const num1 = Math.floor(Math.random() * 10);
    const num2 = Math.floor(Math.random() * 10);
    const answer = num1 + num2;
    return { num1, num2, answer };
  };

  // Refresh CAPTCHA
  const refreshCaptcha = () => {
    const { num1, num2, answer } = generateMathProblem();
    setCaptchaProblem({ num1, num2 });
    setCorrectAnswer(answer);
  };

  useEffect(() => {
    refreshCaptcha();
  }, []);

  // Login function
  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please fill in both email and password.');
      return;
    }

    if (parseInt(captchaAnswer) !== correctAnswer) {
      Alert.alert('Error', 'CAPTCHA answer is incorrect.');
      return;
    }

    try {
      const response = await axios.post('http://localhost:3000/login', { email, password });
      if (response.data.message === 'Login successful') {
        const enrollmentNumber = response.data.enroll_number;

        await AsyncStorage.setItem('enrollmentNumber', enrollmentNumber);
        await AsyncStorage.setItem('email', email);

        navigation.navigate('MainScreen', { email });
      } else {
        Alert.alert('Error', response.data.message);
      }
    } catch (error: any) {
      Alert.alert('Error', error.response?.data?.message || 'Login failed.');
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.title}>Login</Text>

        <TextInput
          style={styles.input}
          value={email}
          onChangeText={setEmail}
          placeholder="Enter email"
          keyboardType="email-address"
          placeholderTextColor="#999"
        />

        <TextInput
          style={styles.input}
          value={password}
          onChangeText={setPassword}
          placeholder="Enter password"
          secureTextEntry
          placeholderTextColor="#999"
        />

        <View style={styles.captchaContainer}>
          <CaptchaImage num1={captchaProblem?.num1 ?? 0} num2={captchaProblem?.num2 ?? 0} />
          <TouchableOpacity style={styles.refreshButton} onPress={refreshCaptcha}>
            <Text style={styles.refreshButtonText}>Refresh</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.captchaText}>
          Evaluate the arithmetic expression and enter the answer below.
        </Text>

        <TextInput
          style={styles.input}
          value={captchaAnswer}
          onChangeText={setCaptchaAnswer}
          placeholder="Your Answer"
          keyboardType="numeric"
          placeholderTextColor="#999"
        />

        <TouchableOpacity style={styles.loginButton} onPress={handleLogin}>
          <Text style={styles.loginButtonText}>Login</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => navigation.navigate('ResetPassword', { email })}>
          <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
        </TouchableOpacity>

        <View style={styles.footer}>
          <Text style={styles.footerText}>Don't have an account?</Text>
          <TouchableOpacity onPress={() => navigation.navigate('Signup')}>
            <Text style={styles.signupLink}> Sign Up</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f9fa', // Light background color
  },
  card: {
    width: '90%',
    padding: 20,
    backgroundColor: 'white',
    borderRadius: 10,
    elevation: 3, // Shadow effect on Android
    shadowColor: '#000', // Shadow effect on iOS
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
  captchaContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  refreshButton: {
    backgroundColor: 'black',
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 8,
  },
  refreshButtonText: {
    color: '#fff',
    fontSize: 16,
  },
  captchaText: {
    color: '#333',
    fontSize: 14,
    marginBottom: 10,
  },
  loginButton: {
    backgroundColor: '#1D3D47',
    borderRadius: 10,
    paddingVertical: 15,
    marginTop: 10,
    alignItems: 'center',
  },
  loginButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  forgotPasswordText: {
    color: '#007bff',
    textAlign: 'center',
    marginTop: 15,
    fontSize: 14,
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
  signupLink: {
    fontSize: 16,
    color: 'blue',
  },
});

export default LoginScreen;
