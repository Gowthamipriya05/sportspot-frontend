import React, { useState, useEffect } from 'react';
import { View, Text, Dimensions, StyleSheet, ScrollView } from 'react-native';
import { BarChart } from 'react-native-chart-kit';
import axios from 'axios';
import Constants from 'expo-constants';

const API_BASE_URL = Constants.expoConfig?.extra?.API_BASE_URL;

interface ItemData {
  labels: string[];
  data: number[];
}

const AnalyseData: React.FC = () => {
  const [itemData, setItemData] = useState<ItemData>({ labels: [], data: [] });

  useEffect(() => {
    const fetchItemsData = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/items-issued`);
        const rawData = response.data;

        const itemCounts = rawData.reduce((acc: Record<string, number>, item: any) => {
          acc[item.it_name] = (acc[item.it_name] || 0) + 1;
          return acc;
        }, {});

        const labels = Object.keys(itemCounts);
        const data = Object.values(itemCounts);

        setItemData({ labels, data });
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchItemsData();
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Items Issued to Students</Text>
      {itemData.labels.length > 0 ? (
        <ScrollView horizontal>
          <BarChart
  data={{
    labels: itemData.labels,
    datasets: [{ data: itemData.data }],
  }}
  width={Math.max(itemData.labels.length * 100, Dimensions.get('window').width)} // Adjust width based on the number of items
  height={600} // Increase the height of the chart
  yAxisLabel=""
  yAxisSuffix=""
  chartConfig={{
    backgroundColor: '#1cc910',
    backgroundGradientFrom: '#eff3ff',
    backgroundGradientTo: '#efefef',
    decimalPlaces: 0,
    color: (opacity = 1) => `rgba(0, 0, 255, ${opacity})`,
    style: { borderRadius: 16 },
    propsForLabels: {
      fontSize: 10, // Adjust font size for labels
    },
  }}
  style={{ marginVertical: 8, borderRadius: 16 }}
  withHorizontalLabels={true}
  verticalLabelRotation={30} // Change rotation angle for better visibility
/>

        </ScrollView>
      ) : (
        <Text>Loading data...</Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f8f9fa',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 15,
    fontWeight:'bold',
    marginBottom: 20,
  },
});

export default AnalyseData;



