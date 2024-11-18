import { RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';

// Define your root stack parameter list
export type RootStackParamList = {
  Home: undefined; // No parameters
  Login: undefined; // No parameters
  Signup: undefined; // No parameters
  MainScreen: undefined; // No parameters
  IssueItem: undefined; // No parameters
  ReturnItem: undefined; // No parameters
  MyProducts: undefined; // No parameters

  VerifyOTPScreen: { email: string ,name:string,enroll_number:string,branch:string,password:string,mobile:string,stream:string };
};

// Define the type for the LoginScreen's navigation prop
export type LoginScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Login'>;
export type LoginScreenRouteProp = RouteProp<RootStackParamList, 'Login'>;

export type LoginScreenProps = {
  navigation: LoginScreenNavigationProp;
  route: LoginScreenRouteProp;
};

// Similarly, define props for other screens as needed


export type SignupScreenProps = {
  navigation: StackNavigationProp<RootStackParamList, 'Signup'>;
  route: RouteProp<RootStackParamList, 'Signup'>;
};

// Add similar props for other screens as needed
