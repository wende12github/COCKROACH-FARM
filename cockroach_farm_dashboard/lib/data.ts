import { BarChart, Bell, Droplets, Fan, Heater, Home, LayoutGrid, Lightbulb, Settings, Thermometer, Users, Wind, TrendingUp, Trash2, GitCommitHorizontal } from 'lucide-react';

export const navLinks = [
  { href: "/", icon: Home, label: "Dashboard" },
  { href: "/chambers", icon: LayoutGrid, label: "Chambers" },
  { href: "/reports", icon: BarChart, label: "Reports & Logs" },
  { href: "/settings", icon: Settings, label: "Settings" },
  { href: "/users", icon: Users, label: "User Management" },
];

export const environmentMetrics = {
  temperature: { value: 28, unit: "°C", icon: Thermometer, color: "#FF6384" },
  humidity: { value: 75, unit: "%", icon: Droplets, color: "#36A2EB" },
  co2: { value: 600, unit: "ppm", icon: Wind, color: "#FFCE56" },
  ammonia: { value: 15, unit: "ppm", icon: GitCommitHorizontal, color: "#4BC0C0" },
  light: { value: 800, unit: "lux", icon: Lightbulb, color: "#9966FF" },
};

export const deviceControls = [
  { id: "fan", label: "Fan", icon: Fan, status: "On" },
  { id: "heater", label: "Heater", icon: Heater, status: "Off" },
  { id: "humidifier", label: "Humidifier", icon: Droplets, status: "On" },
  { id: "ventilation", label: "Ventilation", icon: Wind, status: "On" },
];

export const populationAnalytics = {
  count: 250000,
  growthRate: 15,
  feedConsumption: 50,
  harvestTime: "12 days",
  growthData: [
    { name: 'Jan', growth: 10 },
    { name: 'Feb', growth: 12 },
    { name: 'Mar', growth: 18 },
    { name: 'Apr', growth: 15 },
    { name: 'May', growth: 22 },
    { name: 'Jun', growth: 25 },
  ],
};

export const wasteIntake = {
  dailyInput: 120,
  conversionEfficiency: 85,
};

export const alerts = [
  { id: 1, message: "Chamber 3: Overheating detected!", level: "critical", icon: Thermometer },
  { id: 2, message: "Low humidity in Chamber 1.", level: "warning", icon: Droplets },
  { id: 3, message: "Ventilation system failure in Chamber 2.", level: "critical", icon: Wind },
  { id: 4, message: "CO₂ levels are high in Chamber 4.", level: "warning", icon: Wind },
];