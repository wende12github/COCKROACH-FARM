import { database } from './config';
import { ref, onValue, set, update, get } from 'firebase/database';
import { SensorData, DeviceStatus, PopulationData, WasteData } from '@/types';

// Subscribe to real-time sensor data
export const subscribeToSensorData = (callback: (data: SensorData) => void) => {
  const sensorRef = ref(database, 'sensor');
  
  return onValue(sensorRef, (snapshot) => {
    const data = snapshot.val();
    callback(data);
  });
};

// Subscribe to device status
export const subscribeToDeviceStatus = (callback: (data: DeviceStatus) => void) => {
  const deviceRef = ref(database, 'status');
  
  return onValue(deviceRef, (snapshot) => {
    const data = snapshot.val();
    callback(data);
  });
};

// Get population analytics data
export const getPopulationData = async (): Promise<PopulationData[]> => {
  const populationRef = ref(database, 'population');
  const snapshot = await get(populationRef);
  return snapshot.val() || [];
};

// Get waste tracking data
export const getWasteData = async (): Promise<WasteData[]> => {
  const wasteRef = ref(database, 'waste');
  const snapshot = await get(wasteRef);
  return snapshot.val() || [];
};

// Control devices
export const controlDevice = async (deviceId: string, status: boolean) => {
  const deviceRef = ref(database, `manual/${deviceId}`);
  await set(deviceRef, status);
};

// Example: ESP32 sends data to this endpoint
export const updateSensorData = async (data: {
  temperature: number;
  humidity: number;
  co2: number;
  ammonia: number;
  timestamp: number;
}) => {
  const sensorRef = ref(database, `sensors/latest`);
  await update(sensorRef, {
    ...data,
    updatedAt: Date.now()
  });
  
  // Also log historical data
  const historyRef = ref(database, `sensors/history/${Date.now()}`);
  await set(historyRef, data);
};