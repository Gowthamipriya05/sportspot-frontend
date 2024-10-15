import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';

const isFaculty = (email) => {
  const facultyPattern = /^(?!\d)[\w.-]+@nitdelhi\.ac\.in$/;
  return facultyPattern.test(email);
};

export default function NavBar({ email }) {
  const navigation = useNavigation();
  const [dropdownVisible, setDropdownVisible] = useState(false);

  const toggleDropdown = () => {
    setDropdownVisible(!dropdownVisible);
  };

  const handleLogout = () => {
    setDropdownVisible(false);
    navigation.navigate('Home');
  };

  const navigateToIssueItem = () => {
    setDropdownVisible(false);
    navigation.navigate('IssueItem');
  };

  return (
    <View style={styles.navbarContainer}>
      <View style={styles.navBar}>
        <View style={styles.titleContainer}>
          <TouchableOpacity onPress={toggleDropdown}>
            <Icon name="menu" size={30} color="white" style={styles.icon} />
          </TouchableOpacity>
          <Text style={styles.title}>Sports Spot</Text>
        </View>

        <TouchableOpacity onPress={() => navigation.navigate('ProfilePage')}>
          <Icon name="person" size={30} color="white" style={styles.icon} />
        </TouchableOpacity>
      </View>

      {dropdownVisible && (
        <View style={styles.dropdown}>
          <ScrollView>
            <TouchableOpacity onPress={navigateToIssueItem}>
              <Text style={styles.dropdownText}>Issue Item</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => navigation.navigate('ReturnItem')}>
              <Text style={styles.dropdownText}>Return Item</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => navigation.navigate('MyProducts')}>
              <Text style={styles.dropdownText}>My Products</Text>
            </TouchableOpacity>
            {isFaculty(email) && (
              <TouchableOpacity onPress={() => navigation.navigate('UploadInventory')}>
                <Text style={styles.dropdownText}>Add Inventory</Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity onPress={handleLogout}>
              <Text style={styles.dropdownText}>Log Out</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  navbarContainer: {
    zIndex: 2,  // Ensure the NavBar and dropdown stay above the content
  },
  navBar: {
    width: '100%',
    height: 60,
    backgroundColor: '#1D3D47',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingLeft: 20,
    paddingRight: 20,
    borderRadius: 5,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  icon: {
    marginRight: 10,
  },
  title: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  dropdown: {
    position: 'absolute',     // Ensure dropdown floats over the content
    top: 60,                  // Align the dropdown right below the navbar
    left: 0,
    right: 0,
    backgroundColor: 'white',
    padding: 10,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 5,
    zIndex: 1000,             // Ensure dropdown is above the content
  },
  dropdownText: {
    fontSize: 16,
    color: '#1D3D47',
    marginBottom: 10,
  },
});
