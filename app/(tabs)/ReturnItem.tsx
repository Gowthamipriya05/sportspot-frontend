// import React, { useState, useEffect } from 'react';
// import { View, Text, Button, FlatList, StyleSheet, ScrollView, Alert } from 'react-native';
// import axios from 'axios';
// import AsyncStorage from '@react-native-async-storage/async-storage';

// interface IssuedItem {
//   _id: string; // Unique ID
//   s_enroll_number: string;
//   it_name: string;
//   issue_date: string;
//   return_date: string | null;
//   it_quantity: number;
// }

// export default function ReturnItem() {
//   const [itemsIssued, setItemsIssued] = useState<IssuedItem[]>([]);
//   const [studentEnrollNumber, setStudentEnrollNumber] = useState<string | null>(null);

//   useEffect(() => {
//     const fetchEnrollmentNumber = async () => {
//       const enrollmentNumber = await AsyncStorage.getItem('enrollmentNumber');
//       setStudentEnrollNumber(enrollmentNumber);
//       if (enrollmentNumber) {
//         fetchIssuedItems(enrollmentNumber);
//       }
//     };

//     fetchEnrollmentNumber();
//   }, []);

//   const fetchIssuedItems = async (enrollmentNumber: string) => {
//     try {
//       const response = await axios.get(`http://192.168.0.100:3000/issued-items/${enrollmentNumber}`);
//       console.log('Fetched Items:', response.data); // Log the response data
//       setItemsIssued(response.data);
//     } catch (error) {
//       Alert.alert('Error', 'Failed to load issued items');
//       console.error(error); // Log the error
//     }
//   };

//   const handleReturn = async (item: IssuedItem) => {
//     try {
//       const returnDate = new Date().toISOString().split('T')[0]; // Get current date for return_date
  
//       // Update return_date in items_issued
//       const returnResponse = await axios.put(`http://192.168.0.100:3000/return-item/${item._id}`, { return_date: returnDate });
//       console.log('Return Response:', returnResponse.data); // Log response for debugging
  
//       // Check if returnResponse indicates success
//       if (returnResponse.data.message === "Return date updated successfully") {
//         // Add the quantity back to the items table
//         console.log('Attempting to update quantity for item:', item.it_name, 'with quantity:', item.it_quantity);
//         const quantityResponse = await axios.put(`http://192.168.0.100:3000/update-item-quantity/${item.it_name}`, { quantity: item.it_quantity });
//         console.log('Quantity Response:', quantityResponse.data); // Log response for debugging
  
//         if (quantityResponse.data.message === "Item quantity updated successfully") {
//           // Update the state directly after successful return
//           setItemsIssued((prevItems) =>
//             prevItems.map((issuedItem) =>
//               issuedItem._id === item._id ? { ...issuedItem, return_date: returnDate } : issuedItem
//             )
//           );
  
//           Alert.alert('Success', 'Item returned successfully!');
//         } else {
//           throw new Error(quantityResponse.data.message || "Error updating item quantity");
//         }
//       } else {
//         throw new Error(returnResponse.data.message || "Error updating return date");
//       }
//     } catch (error) {
//       Alert.alert('Error', 'Failed to return the item');
//       console.error('Return Item Error:', error.response ? error.response.data : error); // Log the error details
//     }
//   };
  

//   const renderItem = ({ item }: { item: IssuedItem }) => (
//     <View style={styles.row}>
//       <Text style={styles.cell}>{item.it_name}</Text>
//       <Text style={styles.cell}>{item.it_quantity}</Text>
//       <Text style={styles.cell}>{item.issue_date}</Text>
//       <Text style={styles.cell}>{item.return_date ? item.return_date : 'Not Returned'}</Text>
//       <View style={styles.cell}>
//         {item.return_date ? (
//           <Text style={styles.returnedText}>Returned</Text>
//         ) : (
//           <Button
//             title="Return"
//             color="red"
//             onPress={() => handleReturn(item)}
//           />
//         )}
//       </View>
//     </View>
//   );

//   return (
//     <View style={styles.container}>
//       <ScrollView style={{ marginTop: 10 }}>
//         <Text style={styles.enrollText}>
//           Enrollment Number: {studentEnrollNumber || 'Loading...'}
//         </Text>

//         <View style={styles.tableHeader}>
//           <Text style={styles.headerCell}>Item Name</Text>
//           <Text style={styles.headerCell}>Quantity</Text>
//           <Text style={styles.headerCell}>Issue Date</Text>
//           <Text style={styles.headerCell}>Return Date</Text>
//           <Text style={styles.headerCell}>Action</Text>
//         </View>

//         <FlatList
//           data={itemsIssued}
//           keyExtractor={(item) => item._id.toString()}
//           renderItem={renderItem}
//           ListEmptyComponent={<Text>No items issued</Text>}
//         />
//       </ScrollView>
//     </View>
//   );
// }

// const styles = StyleSheet.create({
//   enrollText: {
//     fontSize: 18,
//     fontWeight: 'bold',
//     marginBottom: 20,
//     marginTop: 70, // Pushes content below NavBar
//     zIndex: 1,
//   },
//   tableHeader: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     backgroundColor: '#f0f0f0',
//     paddingVertical: 10,
//     marginBottom: 10,
//     zIndex: 1,
//   },
//   headerCell: {
//     fontWeight: 'bold',
//     flex: 1,
//     textAlign: 'center',
//   },
//   container: {
//     flex: 1,
//     padding: 16,
//     backgroundColor: '#fff',
//   },
//   row: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     justifyContent: 'space-between',
//     padding: 10,
//     borderBottomWidth: 1,
//     borderBottomColor: '#ccc',
//   },
//   cell: {
//     flex: 1,
//     padding: 8,
//   },
//   returnedText: {
//     color: 'green',
//     fontWeight: 'bold',
//   },
// });

import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, Button, FlatList, StyleSheet, ScrollView, Alert } from 'react-native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';
import Constants from 'expo-constants';

const API_BASE_URL = Constants.expoConfig?.extra?.API_BASE_URL;

interface IssuedItem {
  _id: string;
  s_enroll_number: string;
  it_name: string;
  issue_date: string;
  return_date: string | null;
  it_quantity: number;
  it_status:boolean;
}

export default function ReturnItem() {
  const [itemsIssued, setItemsIssued] = useState<IssuedItem[]>([]);
  const [studentEnrollNumber, setStudentEnrollNumber] = useState<string | null>(null);

  const fetchEnrollmentNumber = async () => {
    const enrollmentNumber = await AsyncStorage.getItem('enrollmentNumber');
    setStudentEnrollNumber(enrollmentNumber);
    if (enrollmentNumber) {
      fetchIssuedItems(enrollmentNumber);
    }
  };

  useEffect(() => {
    fetchEnrollmentNumber();
  }, []);

  useFocusEffect(
    useCallback(() => {
      if (studentEnrollNumber) {
        fetchIssuedItems(studentEnrollNumber);
      }
    }, [studentEnrollNumber])
  );

  const fetchIssuedItems = async (enrollmentNumber: string) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/issued-items/${enrollmentNumber}`);
      console.log('Fetched Items:', response.data);
      setItemsIssued(response.data);
    } catch (error) {
      Alert.alert('Error', 'Failed to load issued items');
      console.error(error);
    }
  };

  // const handleReturn = async (item: IssuedItem) => {
  //   try {
  //     const returnDate = new Date().toISOString().split('T')[0];

  //     const returnResponse = await axios.put(`${API_BASE_URL}/return-item/${item._id}`, {
  //       return_date: returnDate,
  //       it_status: false
  //     });
  //     console.log('Return Response:', returnResponse.data);

  //     if (returnResponse.data.message === "Return date updated successfully") {
  //       console.log('Attempting to update quantity for item name:', item.it_name, 'with quantity:', item.it_quantity);

  //       const quantityResponse = await axios.put(`${API_BASE_URL}/update-item-quantity/${item.it_name}`, {
  //         quantity: item.it_quantity
  //       });
  //       console.log('Quantity Response:', quantityResponse.data);

  //       if (quantityResponse.data.message === "Item quantity updated successfully") {
  //         fetchIssuedItems(studentEnrollNumber || '');

  //         Alert.alert('Success', 'Item returned successfully!');
  //       } else {
  //         throw new Error(quantityResponse.data.message || "Error updating item quantity");
  //       }
  //     } else {
  //       throw new Error(returnResponse.data.message || "Error updating return date");
  //     }
  //   } catch (error) {
  //     Alert.alert('Error', 'Failed to return the item');
  //     console.error('Return Item Error:', error.response ? error.response.data : error);
  //   }
  // };

  const handleReturn = async (item: IssuedItem) => {
    try {
      const returnDate = new Date().toISOString().split('T')[0];
  
      // Step 1: Update return date
      const returnResponse = await axios.put(`${API_BASE_URL}/return-item/${item._id}`, {
        return_date: returnDate,
        it_status: false,
      });
      console.log('Return Response:', returnResponse.data);
  
      if (returnResponse.data.message === "Return date updated successfully") {
        // Step 2: Update item quantity
        const quantityResponse = await axios.put(`${API_BASE_URL}/update-item-quantity/${item.it_name}`, {
          quantity: item.it_quantity,
        });
        console.log('Quantity Response:', quantityResponse.data);
  
        if (quantityResponse.data.message === "Item quantity updated successfully") {
          // Optimistic UI update
          setItemsIssued((prevItems) =>
            prevItems.map((i) =>
              i._id === item._id
                ? { ...i, it_status: false, return_date: returnDate }
                : i
            )
          );
          Alert.alert('Success', 'Item returned successfully!');
        } else {
          throw new Error(quantityResponse.data.message || "Error updating item quantity");
        }
      } else {
        throw new Error(returnResponse.data.message || "Error updating return date");
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to return the item');
      console.error('Return Item Error:', error.response ? error.response.data : error);
    }
  };
  

  const renderItem = ({ item }: { item: IssuedItem }) => (
    <View style={styles.row}>
      <Text style={styles.cell}>{item.it_name}</Text>
      <Text style={styles.cell}>{item.it_quantity}</Text>
      <Text style={styles.cell}>{item.issue_date}</Text>
      <Text style={styles.cell}>{item.return_date ? item.return_date : 'Not Returned'}</Text>
      <View style={styles.cell}>
        {!item.it_status ? (
          <Text style={styles.returnedText}>Returned</Text>
        ) : (
          <Button
            title="Return"
            color="red"
            onPress={() => handleReturn(item)}
          />
        )}
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <ScrollView style={{ marginTop: 10 }}>
        <Text style={styles.enrollText}>
          Enrollment Number: {studentEnrollNumber || 'Loading...'}
        </Text>

        <View style={styles.tableHeader}>
          <Text style={styles.headerCell}>Item Name</Text>
          <Text style={styles.headerCell}>Quantity</Text>
          <Text style={styles.headerCell}>Issue Date</Text>
          <Text style={styles.headerCell}>Return Date</Text>
          <Text style={styles.headerCell}>Action</Text>
        </View>

        <FlatList
          data={itemsIssued}
          keyExtractor={(item) => item._id.toString()}
          renderItem={renderItem}
          ListEmptyComponent={<Text>No items issued</Text>}
        />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  enrollText: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 20,
    marginTop: 70,
    zIndex: 1,
  },
  tableHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#f0f0f0',
    paddingVertical: 10,
    marginBottom: 10,
    zIndex: 1,
  },
  headerCell: {
    fontWeight: 'bold',
    flex: 1,
    textAlign: 'center',
  },
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#fff',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
  cell: {
    flex: 1,
    padding: 8,
  },
  returnedText: {
    color: 'green',
    fontWeight: 'bold',
  },
});
