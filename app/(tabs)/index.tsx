import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { createDrawerNavigator } from '@react-navigation/drawer';
import HomeScreen from './HomeScreen';
import LoginScreen from './LoginScreen';
import SignupScreen from './SignupScreen';
import MainScreen from './MainScreen';
import IssueItem from './IssueItem';
import ReturnItem from './ReturnItem';
import MyProducts from './MyProducts';
import QuantityPage from './QuantityPage'; // Import QuantityPage
import ResetPasswordScreen from './ResetPasswordScreen';
import VerifyOTPScreen from './VerifyOTPScreen';
import UploadInventoryScreen from './UploadInventoryScreen';
import ProfilePage from './ProfilePage';
import ItemsIssuedScreen from './ItemsIssuedScreen'

const Stack = createStackNavigator();
const Drawer = createDrawerNavigator();

// Drawer navigator containing the MainScreen and related screens
function MainDrawer() {
  return (
    <Drawer.Navigator>
      <Drawer.Screen name="MainScreen" component={MainScreen} />
      <Drawer.Screen name="IssueItem" component={IssueItem} />
      <Drawer.Screen name="ReturnItem" component={ReturnItem} />
    </Drawer.Navigator>
  );
}

// Main stack navigator
export default function App() {
  return (
    <Stack.Navigator initialRouteName="Home">
      <Stack.Screen name="Home" component={HomeScreen} />
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Signup" component={SignupScreen} />
      <Stack.Screen name="MainScreen" component={MainDrawer} options={{ headerShown: false }} />
      <Stack.Screen name="IssueItem" component={IssueItem} />
      <Stack.Screen name="QuantityPage" component={QuantityPage} />
      <Stack.Screen name="ResetPassword" component={ResetPasswordScreen} />
      <Stack.Screen name="VerifyOTPScreen" component={VerifyOTPScreen} />
      <Stack.Screen name="UploadInventory" component={UploadInventoryScreen} />
      <Stack.Screen name="ProfilePage" component={ProfilePage} />
      <Stack.Screen name="ItemsIssuedScreen" component={ItemsIssuedScreen} />
    </Stack.Navigator>
  );
}
