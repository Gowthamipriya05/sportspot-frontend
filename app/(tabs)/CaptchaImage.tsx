import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

// Custom CaptchaImage component
const CaptchaImage: React.FC<{ num1: number; num2: number }> = ({ num1, num2 }) => {
  return (
    <View style={styles.captchaContainer}>
      {/* Using selectable={false} to disable text selection */}
      <Text selectable={false} style={styles.captchaText}>{`${num1} + ${num2} = `}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  captchaContainer: {
    backgroundColor: 'white',
    padding: 10,
    borderWidth: 1,
    borderColor: 'black',
    justifyContent: 'center',
    alignItems: 'center',
  },
  captchaText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'black',
  },
});

export default CaptchaImage;
