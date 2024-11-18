// import React, { useEffect, useState } from 'react';
// import { createStackNavigator } from '@react-navigation/stack';
// import { createDrawerNavigator } from '@react-navigation/drawer';
// import { Alert } from 'react-native'; // Import Alert
// import HomeScreen from './HomeScreen';
// import LoginScreen from './LoginScreen';
// import SignupScreen from './SignupScreen';
// import MainScreen from './MainScreen';
// import IssueItem from './IssueItem';
// import ReturnItem from './ReturnItem';
// import QuantityPage from './QuantityPage'; // Import QuantityPage
// import ResetPasswordScreen from './ResetPasswordScreen';
// import VerifyOTPScreen from './VerifyOTPScreen';
// import UploadInventoryScreen from './UploadInventoryScreen';
// import ProfilePage from './ProfilePage';
// import ItemsIssuedScreen from './ItemsIssuedScreen';
// import AsyncStorage from '@react-native-async-storage/async-storage';

// const Stack = createStackNavigator();
// const Drawer = createDrawerNavigator();

// // Drawer navigator containing the MainScreen and related screens
// function MainDrawer() {
//   const [storedDesignation, setStoredDesignation] = useState(null);

//   useEffect(() => {
//     const fetchProfileData = async () => {
//       try {
//         const designation = await AsyncStorage.getItem('designation');
//         setStoredDesignation(designation);
//       } catch (error) {
//         Alert.alert('Error', 'Failed to load profile data');
//       }
//     };
//     fetchProfileData();
//   }, []);

//   if (storedDesignation === 'student') {
//     return (
//       <Drawer.Navigator>
//         <Drawer.Screen name="MainScreen" component={MainScreen} />
//         <Drawer.Screen name="IssueItem" component={IssueItem} />
//         <Drawer.Screen name="ReturnItem" component={ReturnItem} />
//         <Drawer.Screen name="ProfilePage" component={ProfilePage} />
//       </Drawer.Navigator>
//     );
//   } else {
//     return (
//       <Drawer.Navigator>
//         <Drawer.Screen name="MainScreen" component={MainScreen} />
//         <Drawer.Screen name="UploadInventory" component={UploadInventoryScreen} />
//         <Drawer.Screen name="ItemsIssuedScreen" component={ItemsIssuedScreen} />
//       </Drawer.Navigator>
//     );
//   }
// }

// // Main stack navigator
// export default function App() {
//   return (
//     <Stack.Navigator initialRouteName="Home">
//       <Stack.Screen name="Home" component={HomeScreen} />
//       <Stack.Screen name="Login" component={LoginScreen} />
//       <Stack.Screen name="Signup" component={SignupScreen} />
//       <Stack.Screen name="MainScreen" component={MainDrawer} options={{ headerShown: false }} />
//       <Stack.Screen name="QuantityPage" component={QuantityPage} />
//       <Stack.Screen name="ResetPassword" component={ResetPasswordScreen} />
//       <Stack.Screen name="VerifyOTPScreen" component={VerifyOTPScreen} />
//     </Stack.Navigator>
//   );
// }



import React, { useEffect, useState } from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { Alert } from 'react-native';
import HomeScreen from './HomeScreen';
import LoginScreen from './LoginScreen';
import SignupScreen from './SignupScreen';
import MainScreen from './MainScreen';
import IssueItem from './IssueItem';
import ReturnItem from './ReturnItem';
import QuantityPage from './QuantityPage';
import ResetPasswordScreen from './ResetPasswordScreen';
import VerifyOTPScreen from './VerifyOTPScreen';
import UploadInventoryScreen from './UploadInventoryScreen';
import ProfilePage from './ProfilePage';
import ItemsIssuedScreen from './ItemsIssuedScreen';
import AsyncStorage from '@react-native-async-storage/async-storage';
import AnalyseDataScreen from './AnalyseData';

const Stack = createStackNavigator();
const Drawer = createDrawerNavigator();

function MainDrawer() {
  const [storedDesignation, setStoredDesignation] = useState<string | null>(null);

  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        const designation = await AsyncStorage.getItem('designation');
        setStoredDesignation(designation);
      } catch (error) {
        Alert.alert('Error', 'Failed to load profile data');
      }
    };
    fetchProfileData();
  }, []);

  if (storedDesignation === 'student') {
    return (
      <Drawer.Navigator>
        <Drawer.Screen name="MainScreen" component={MainScreen} />
        <Drawer.Screen name="IssueItem" component={IssueItem} />
        <Drawer.Screen name="ReturnItem" component={ReturnItem} />
        <Drawer.Screen name="ProfilePage" component={ProfilePage} />
      </Drawer.Navigator>
    );
  } else {
    return (
      <Drawer.Navigator>
        <Drawer.Screen name="MainScreen" component={MainScreen} />
        <Drawer.Screen name="UploadInventory" component={UploadInventoryScreen} />
        <Drawer.Screen name="ItemsIssuedScreen" component={ItemsIssuedScreen} />
        <Drawer.Screen name="AnalyseDataScreen" component={AnalyseDataScreen} />
      </Drawer.Navigator>
    );
  }
}

export default function App() {
  return (
    <Stack.Navigator initialRouteName="Home">
      <Stack.Screen name="Home" component={HomeScreen} />
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Signup" component={SignupScreen} />
      <Stack.Screen name="MainScreen" component={MainDrawer} options={{ headerShown: false }} />
      <Stack.Screen name="QuantityPage" component={QuantityPage} />
      <Stack.Screen name="ResetPassword" component={ResetPasswordScreen} />
      <Stack.Screen name="VerifyOTPScreen" component={VerifyOTPScreen} />
    
    </Stack.Navigator>
  );
}
