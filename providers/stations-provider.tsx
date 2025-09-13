import createContextHook from "@nkzw/create-context-hook";
import * as Location from 'expo-location';
import { Platform } from 'react-native';
import { useCallback, useEffect, useMemo, useState } from "react";

export interface Station {
  id: string;
  name: string;
  district: string;
  state: string;
  latitude: number;
  longitude: number;
  currentLevel: number;
  status: "normal" | "warning" | "critical";
  batteryLevel: number;
  signalStrength: number;
  availabilityIndex: number;
  lastUpdated: string;
  aquiferType: string;
  specificYield: number;
  installationDate: string;
  depth: number;
  recentReadings: {
    timestamp: string;
    level: number;
    temperature?: number;
  }[];
  rechargeData: {
    date: string;
    amount: number;
  }[];
}

export interface Alert {
  id: string;
  stationId: string;
  stationName: string;
  type: "critical" | "warning" | "info";
  title: string;
  message: string;
  timestamp: string;
  isRead: boolean;
}

const mockStations: Station[] = [
  {
    id: "DWLR_001",
    name: "Patna Central",
    district: "Patna",
    state: "Bihar",
    latitude: 25.5941,
    longitude: 85.1376,
    currentLevel: 12.45,
    status: "normal",
    batteryLevel: 85,
    signalStrength: 78,
    availabilityIndex: 0.75,
    lastUpdated: "2024-01-15T10:30:00Z",
    aquiferType: "Alluvial",
    specificYield: 0.15,
    installationDate: "2023-03-15",
    depth: 45.0,
    recentReadings: [
      { timestamp: "2024-01-15T10:30:00Z", level: 12.45, temperature: 24.5 },
      { timestamp: "2024-01-15T09:30:00Z", level: 12.48, temperature: 24.2 },
      { timestamp: "2024-01-15T08:30:00Z", level: 12.52, temperature: 23.8 },
      { timestamp: "2024-01-15T07:30:00Z", level: 12.55, temperature: 23.5 },
      { timestamp: "2024-01-15T06:30:00Z", level: 12.58, temperature: 23.2 },
    ],
    rechargeData: [
      { date: "2024-01-10", amount: 15.2 },
      { date: "2024-01-11", amount: 8.7 },
      { date: "2024-01-12", amount: 22.1 },
      { date: "2024-01-13", amount: 5.3 },
      { date: "2024-01-14", amount: 18.9 },
    ],
  },
  {
    id: "DWLR_002",
    name: "Gaya North",
    district: "Gaya",
    state: "Bihar",
    latitude: 24.7914,
    longitude: 85.0002,
    currentLevel: 18.72,
    status: "warning",
    batteryLevel: 45,
    signalStrength: 65,
    availabilityIndex: 0.45,
    lastUpdated: "2024-01-15T10:25:00Z",
    aquiferType: "Hard Rock",
    specificYield: 0.08,
    installationDate: "2023-05-20",
    depth: 38.5,
    recentReadings: [
      { timestamp: "2024-01-15T10:25:00Z", level: 18.72, temperature: 25.1 },
      { timestamp: "2024-01-15T09:25:00Z", level: 18.69, temperature: 24.8 },
      { timestamp: "2024-01-15T08:25:00Z", level: 18.65, temperature: 24.5 },
      { timestamp: "2024-01-15T07:25:00Z", level: 18.62, temperature: 24.2 },
      { timestamp: "2024-01-15T06:25:00Z", level: 18.58, temperature: 23.9 },
    ],
    rechargeData: [
      { date: "2024-01-10", amount: 3.2 },
      { date: "2024-01-11", amount: 1.7 },
      { date: "2024-01-12", amount: 7.1 },
      { date: "2024-01-13", amount: 2.3 },
      { date: "2024-01-14", amount: 4.9 },
    ],
  },
  {
    id: "DWLR_003",
    name: "Muzaffarpur East",
    district: "Muzaffarpur",
    state: "Bihar",
    latitude: 26.1209,
    longitude: 85.3647,
    currentLevel: 25.89,
    status: "critical",
    batteryLevel: 25,
    signalStrength: 42,
    availabilityIndex: 0.25,
    lastUpdated: "2024-01-15T10:20:00Z",
    aquiferType: "Alluvial",
    specificYield: 0.12,
    installationDate: "2023-02-10",
    depth: 42.0,
    recentReadings: [
      { timestamp: "2024-01-15T10:20:00Z", level: 25.89, temperature: 26.2 },
      { timestamp: "2024-01-15T09:20:00Z", level: 25.85, temperature: 25.9 },
      { timestamp: "2024-01-15T08:20:00Z", level: 25.82, temperature: 25.6 },
      { timestamp: "2024-01-15T07:20:00Z", level: 25.78, temperature: 25.3 },
      { timestamp: "2024-01-15T06:20:00Z", level: 25.75, temperature: 25.0 },
    ],
    rechargeData: [
      { date: "2024-01-10", amount: 1.2 },
      { date: "2024-01-11", amount: 0.7 },
      { date: "2024-01-12", amount: 2.1 },
      { date: "2024-01-13", amount: 0.3 },
      { date: "2024-01-14", amount: 1.9 },
    ],
  },
  {
    id: "DWLR_004",
    name: "Darbhanga Central",
    district: "Darbhanga",
    state: "Bihar",
    latitude: 26.1542,
    longitude: 85.8918,
    currentLevel: 8.34,
    status: "normal",
    batteryLevel: 92,
    signalStrength: 88,
    availabilityIndex: 0.85,
    lastUpdated: "2024-01-15T10:35:00Z",
    aquiferType: "Alluvial",
    specificYield: 0.18,
    installationDate: "2023-04-05",
    depth: 35.0,
    recentReadings: [
      { timestamp: "2024-01-15T10:35:00Z", level: 8.34, temperature: 23.8 },
      { timestamp: "2024-01-15T09:35:00Z", level: 8.31, temperature: 23.5 },
      { timestamp: "2024-01-15T08:35:00Z", level: 8.28, temperature: 23.2 },
      { timestamp: "2024-01-15T07:35:00Z", level: 8.25, temperature: 22.9 },
      { timestamp: "2024-01-15T06:35:00Z", level: 8.22, temperature: 22.6 },
    ],
    rechargeData: [
      { date: "2024-01-10", amount: 25.2 },
      { date: "2024-01-11", amount: 18.7 },
      { date: "2024-01-12", amount: 32.1 },
      { date: "2024-01-13", amount: 15.3 },
      { date: "2024-01-14", amount: 28.9 },
    ],
  },
  {
    id: "DWLR_005",
    name: "Bhagalpur South",
    district: "Bhagalpur",
    state: "Bihar",
    latitude: 25.2425,
    longitude: 86.9842,
    currentLevel: 15.67,
    status: "warning",
    batteryLevel: 58,
    signalStrength: 72,
    availabilityIndex: 0.55,
    lastUpdated: "2024-01-15T10:28:00Z",
    aquiferType: "Hard Rock",
    specificYield: 0.10,
    installationDate: "2023-06-12",
    depth: 40.5,
    recentReadings: [
      { timestamp: "2024-01-15T10:28:00Z", level: 15.67, temperature: 24.9 },
      { timestamp: "2024-01-15T09:28:00Z", level: 15.64, temperature: 24.6 },
      { timestamp: "2024-01-15T08:28:00Z", level: 15.61, temperature: 24.3 },
      { timestamp: "2024-01-15T07:28:00Z", level: 15.58, temperature: 24.0 },
      { timestamp: "2024-01-15T06:28:00Z", level: 15.55, temperature: 23.7 },
    ],
    rechargeData: [
      { date: "2024-01-10", amount: 8.2 },
      { date: "2024-01-11", amount: 5.7 },
      { date: "2024-01-12", amount: 12.1 },
      { date: "2024-01-13", amount: 3.3 },
      { date: "2024-01-14", amount: 9.9 },
    ],
  },
];

const mockAlerts: Alert[] = [
  {
    id: "alert_001",
    stationId: "DWLR_003",
    stationName: "Muzaffarpur East",
    type: "critical",
    title: "Critical Water Level Drop",
    message: "Water level has dropped below critical threshold of 25m. Immediate attention required.",
    timestamp: "2024-01-15T09:45:00Z",
    isRead: false,
  },
  {
    id: "alert_002",
    stationId: "DWLR_002",
    stationName: "Gaya North",
    type: "warning",
    title: "Low Battery Alert",
    message: "Station battery level is at 45%. Maintenance required soon.",
    timestamp: "2024-01-15T08:30:00Z",
    isRead: false,
  },
  {
    id: "alert_003",
    stationId: "DWLR_004",
    stationName: "Darbhanga Central",
    type: "info",
    title: "Recharge Event Detected",
    message: "Significant groundwater recharge detected after recent rainfall.",
    timestamp: "2024-01-15T07:15:00Z",
    isRead: true,
  },
  {
    id: "alert_004",
    stationId: "DWLR_005",
    stationName: "Bhagalpur South",
    type: "warning",
    title: "Declining Trend Alert",
    message: "Water level showing consistent declining trend over past 7 days.",
    timestamp: "2024-01-14T16:20:00Z",
    isRead: false,
  },
];

// Helper function to calculate distance between two coordinates
const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
  const R = 6371; // Radius of the Earth in kilometers
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
};

export interface LocationData {
  latitude: number;
  longitude: number;
  accuracy?: number;
}

export const [StationsProvider, useStations] = createContextHook(() => {
  const stations = mockStations;
  const alerts = mockAlerts;
  const [userLocation, setUserLocation] = useState<LocationData | null>(null);
  const [locationPermission, setLocationPermission] = useState<Location.LocationPermissionResponse | null>(null);
  const [isLoadingLocation, setIsLoadingLocation] = useState<boolean>(false);
  const [locationError, setLocationError] = useState<string | null>(null);

  // Request location permission and get current location
  const requestLocationPermission = useCallback(async () => {
    try {
      setIsLoadingLocation(true);
      setLocationError(null);
      
      // Check if location services are available on web
      if (Platform.OS === 'web') {
        if (!navigator.geolocation) {
          setLocationError('Geolocation is not supported by this browser');
          setIsLoadingLocation(false);
          return;
        }
        
        // Use web geolocation API
        navigator.geolocation.getCurrentPosition(
          (position) => {
            setUserLocation({
              latitude: position.coords.latitude,
              longitude: position.coords.longitude,
              accuracy: position.coords.accuracy,
            });
            setIsLoadingLocation(false);
          },
          (error) => {
            console.log('Web geolocation error:', error);
            setLocationError('Failed to get location: ' + error.message);
            setIsLoadingLocation(false);
          },
          { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 }
        );
        return;
      }
      
      // For mobile platforms, use expo-location
      const { status } = await Location.requestForegroundPermissionsAsync();
      setLocationPermission({ status } as Location.LocationPermissionResponse);
      
      if (status !== 'granted') {
        setLocationError('Location permission denied');
        setIsLoadingLocation(false);
        return;
      }

      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });
      
      setUserLocation({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        accuracy: location.coords.accuracy || undefined,
      });
      setIsLoadingLocation(false);
    } catch (error) {
      console.log('Location error:', error);
      setLocationError('Failed to get location');
      setIsLoadingLocation(false);
    }
  }, []);

  // Get nearby stations based on user location
  const nearbyStations = useMemo(() => {
    if (!userLocation) {
      // Return first 4 stations if no location available
      return stations.slice(0, 4);
    }
    
    // Calculate distances and sort by proximity
    const stationsWithDistance = stations.map(station => ({
      ...station,
      distance: calculateDistance(
        userLocation.latitude,
        userLocation.longitude,
        station.latitude,
        station.longitude
      )
    }));
    
    return stationsWithDistance
      .sort((a, b) => a.distance - b.distance)
      .slice(0, 6); // Return top 6 nearest stations
  }, [stations, userLocation]);

  // Auto-request location on mount
  useEffect(() => {
    requestLocationPermission();
  }, [requestLocationPermission]);

  const getStationById = useCallback((id: string) => {
    return stations.find(station => station.id === id);
  }, [stations]);

  const getAnalytics = useCallback(() => {
    const avgWaterLevel = stations.reduce((sum, station) => sum + station.currentLevel, 0) / stations.length;
    const rechargeEvents = stations.reduce((sum, station) => sum + station.rechargeData.length, 0);
    const criticalStations = stations.filter(station => station.status === "critical").length;

    const regionalData = [
      { state: "Bihar", avgLevel: 16.2, status: "warning" as const },
      { state: "Uttar Pradesh", avgLevel: 22.8, status: "critical" as const },
      { state: "West Bengal", avgLevel: 11.5, status: "normal" as const },
      { state: "Jharkhand", avgLevel: 18.9, status: "warning" as const },
    ];

    return {
      avgWaterLevel,
      rechargeEvents,
      criticalStations,
      regionalData,
    };
  }, [stations]);

  return useMemo(() => ({
    stations,
    alerts,
    nearbyStations,
    userLocation,
    locationPermission,
    isLoadingLocation,
    locationError,
    getStationById,
    getAnalytics,
    requestLocationPermission,
  }), [stations, alerts, nearbyStations, userLocation, locationPermission, isLoadingLocation, locationError, getStationById, getAnalytics, requestLocationPermission]);
});