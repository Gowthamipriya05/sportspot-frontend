import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Alert, TouchableOpacity, StyleSheet, Button } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { useNavigation } from '@react-navigation/native';
import CaptchaImage from './CaptchaImage';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import * as Google from 'expo-auth-session/providers/google';
import * as WebBrowser from 'expo-web-browser';
import * as Network from 'expo-network';
import Constants from 'expo-constants';

const API_BASE_URL = Constants.expoConfig?.extra?.API_BASE_URL;

WebBrowser.maybeCompleteAuthSession();

const LoginScreen: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [captchaAnswer, setCaptchaAnswer] = useState('');
  const [correctAnswer, setCorrectAnswer] = useState(0);
  const [captchaProblem, setCaptchaProblem] = useState<{ num1: number; num2: number } | null>(null);
  const [userInfo, setUserInfo] = useState(null);
  const navigation = useNavigation();

/*
  const [request, response, promptAsync] = Google.useAuthRequest({
    androidClientId: "309486654714-lj45du3jpfpfb449endmatqmftjol5up.apps.googleusercontent.com",
  });*/

  const generateMathProblem = () => {
    const num1 = Math.floor(Math.random() * 10);
    const num2 = Math.floor(Math.random() * 10);
    const answer = num1 + num2;
    return { num1, num2, answer };
  };

  const refreshCaptcha = () => {
    const { num1, num2, answer } = generateMathProblem();
    setCaptchaProblem({ num1, num2 });
    setCorrectAnswer(answer);
  };

  useEffect(() => {
    refreshCaptcha();
  }, []);
/*
  useEffect(() => {
    if (response?.type === "success") {
      handleGoogleSignIn(response.authentication.accessToken);
    }
  }, [response]);

  const handleGoogleSignIn = async (token) => {
    if (!token) return;
    try {
      const res = await fetch("https://www.googleapis.com/userinfo/v2/me", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const user = await res.json();
      await AsyncStorage.setItem("@user", JSON.stringify(user));
      setUserInfo(user);
      navigation.navigate("MainScreen");
    } catch (error) {
      Alert.alert("Error", "Failed to log in with Google.");
    }
  };*/

  const handleLogin = async () => {
    console.log('api url', API_BASE_URL);
    if (!email || !password) {
      Alert.alert('Error', 'Please fill in both email and password.');
      return;
    }
  
    if (parseInt(captchaAnswer) !== correctAnswer) {
      Alert.alert('Error', 'CAPTCHA answer is incorrect.');
      return;
    }
  
    try {
      const response = await axios.post(`${API_BASE_URL}/login`, { email, password });
      console.log('Login Response:', response.data); // Log the full response
      if (response.data.message === 'Login successful') {
        const { enroll_number, designation, name } = response.data;
        await AsyncStorage.multiSet([
          ['enrollmentNumber', enroll_number],
          ['email', email],
          ['designation', designation],
          ['name', name]
        ]);
        navigation.navigate('MainScreen');
      } else {
        Alert.alert('Error', response.data.message);
      }
    } catch (error) {
      console.error('Login Error:', error); // Log the full error
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

        <View style={styles.passwordContainer}>
          <TextInput
            style={styles.passwordInput}
            value={password}
            onChangeText={setPassword}
            placeholder="Enter password"
            secureTextEntry={!showPassword}
            placeholderTextColor="#999"
          />
          <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.eyeIcon}>
            <Icon name={showPassword ? 'eye-off' : 'eye'} size={24} color="gray" />
          </TouchableOpacity>
        </View>

        <View style={styles.captchaContainer}>
          <View style={styles.captchaRow}>
            <CaptchaImage num1={captchaProblem?.num1 ?? 0} num2={captchaProblem?.num2 ?? 0} />
            <TouchableOpacity style={styles.refreshButton} onPress={refreshCaptcha}>
              <Text style={styles.refreshButtonText}>Refresh</Text>
            </TouchableOpacity>
          </View>
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

        <Text style={styles.or}>Or</Text>

        <Button color='#00416a' title="Sign in with Google" />

        <TouchableOpacity onPress={() => navigation.navigate('ResetPasswordScreen', { email })}>
          <Text style={styles.forgetText}>Forgot Password?</Text>
        </TouchableOpacity>
        

        <View style={styles.footerContainer}>
          <Text style={styles.footerText}>Don't have an account?</Text>
          <TouchableOpacity onPress={() => navigation.navigate('SignupScreen')}>
            <Text style={styles.signUpLink}> Sign Up</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};


const styles = StyleSheet.create({
  or:{
    textAlign: 'center',
    marginBottom:10,
    fontWeight:'bold' 
  },
 
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
    shadowOffset: { width: 0, height: 2 },
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
  captchaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
  },
  footerContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
  },
  forgetText: {
    color: '#4682B4', // Dark sky blue color for links
    textAlign: 'center',
    marginVertical: 10,
    fontSize: 16,
    fontWeight: '600',
  },
  
  footerText: {
    fontSize: 16,
    color: '#333',
    marginRight: 5, // Space between text and sign-up link
  },
  
  signUpLink: {
    textDecorationLine: 'underline',
    color: '#4682B4', // Blue color for Sign up
    fontSize: 16,
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
  captchaContainer: {
    marginBottom: 15,
    alignItems: 'center',
  },
  refreshButton: {
    backgroundColor: '#00416a',
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 20,
    marginLeft: 10,
  },
  refreshButtonText: {
    color: '#fff',
  },
  captchaText: {
    marginVertical: 10,
  },
  loginButton: {
    backgroundColor: '#00416a',
    borderRadius: 10,
    paddingVertical: 15,
    alignItems: 'center',
  },
  loginButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  linkText: {
    color: '#4682B4', // Dark sky blue color for links
    marginTop: 10,
    textAlign: 'center',
    textDecorationLine: 'underline',
  },
});

export default LoginScreen;


/*
        <Text style={styles.or}>Or</Text>

        <Button color='#00416a' title="Sign in with Google" onPress={() => promptAsync()} />
        <Text>{userInfo ? `Logged in as ${userInfo.name}` : ""}</Text>*/