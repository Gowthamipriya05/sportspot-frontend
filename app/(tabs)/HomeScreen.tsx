import React from 'react';
import { Image, StyleSheet, View, Button, Text } from 'react-native';
import { useNavigation } from '@react-navigation/native';

export default function HomeScreen() {
  const navigation = useNavigation();

  return (
    <View style={styles.container}>
      {/* Text for the title "SportsSpot" */}
      <Text style={styles.title}>SportsSpot</Text>

      {/* Image */}
      <Image
        source={require('@/assets/images/image1.jpg')} // Replace with your image
        style={styles.image}
      />

      {/* Buttons for Login and Signup */}
      <View style={styles.buttonContainer}>
        <View style={styles.buttonStyle}>
          <Button
            title="Login"
            onPress={() => navigation.navigate('Login')}
          />
        </View>
        <View style={styles.buttonStyle}>
          <Button
            title="Signup"
            onPress={() => navigation.navigate('Signup')}
            color="#1D3D47"
          />
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
    backgroundColor: '#1B212E',
  },
  title: {
    fontSize: 36, // Large font size for a bold title
    fontWeight: 'bold', // Bold text
    color: '#FFFFFF', // White color to contrast with background
    marginBottom: 20, // Space between title and image
    textAlign: 'center', // Center the text
  },
  image: {
    width: 400,
    height: 200,
    marginBottom: 20,
  },
  buttonContainer: {
    width: '80%', // Smaller width to compact the button area
    flexDirection: 'row',
    justifyContent: 'center', // Center the buttons horizontally
    alignItems: 'center', // Center the buttons vertically
  },
  buttonStyle: {
    marginHorizontal: 10, // Reduce the horizontal gap between buttons
  },
});
