export interface SensorData {
  temperature: number
  humidity: number
  co2: number
  ammonia: number
  timestamp: number
  updatedAt?: number;
}

export interface DeviceStatus {
  fan: boolean
  heater: boolean
  humidifier: boolean
  autoMode?: boolean;
  lastUpdated?: number;
}

export interface PopulationData {
  week: string
  count: number
  growthRate: number
}

export interface WasteData {
  day: string
  wasteInput: number
  efficiency: number
}

export interface Alert {
  id: string
  message: string
  severity: 'critical' | 'warning' | 'info'
  timestamp: number
  isRead: boolean
  sensor?: string
  value?: number
  unit?: string
}

export interface Chamber {
  id: string
  name: string
  status: 'active' | 'maintenance' | 'inactive'
  temperature: number
  humidity: number
  co2: number
  ammonia: number
  population: number
  capacity: number
  efficiency: number
  devices: DeviceStatus
}

export interface User {
  id: string
  name: string
  email: string
  role: 'admin' | 'manager' | 'operator' | 'viewer'
  status: 'active' | 'inactive' | 'pending'
  createdAt: number
  lastLogin?: number
}