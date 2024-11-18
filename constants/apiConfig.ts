// constants/apiConfig.ts
import { NetworkInfo } from 'react-native-network-info';

export const getApiBaseUrl = async () => {
  const ipAddress = await NetworkInfo.getIPAddress();
  return `http://${ipAddress}:3000`;
};
