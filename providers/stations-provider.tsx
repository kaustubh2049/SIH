import { supabase } from "@/lib/supabase";
import createContextHook from "@nkzw/create-context-hook";
import * as Location from 'expo-location';
import { useCallback, useEffect, useMemo, useState } from "react";
import { Platform } from 'react-native';

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
  oxygenLevel?: number;
  temperature?: number;
  week?: number | string;
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
    stationId: "DWLR_001",
    stationName: "Colaba",
    type: "critical",
    title: "Critical Water Level Drop",
    message:
      "Water level has dropped below critical threshold of 2m. Immediate action required to avoid shortages.",
    timestamp: "2025-09-11T09:45:00Z",
    isRead: false,
  },
  {
    id: "alert_002",
    stationId: "DWLR_002",
    stationName: "Worli",
    type: "warning",
    title: "Low Battery Alert",
    message:
      "Station battery level is at 40%. Please schedule maintenance soon.",
    timestamp: "2025-09-11T08:30:00Z",
    isRead: false,
  },
  {
    id: "alert_003",
    stationId: "DWLR_003",
    stationName: "Bandra West",
    type: "info",
    title: "Recharge Event Detected",
    message:
      "Groundwater recharge observed after heavy rainfall across Western Suburbs.",
    timestamp: "2025-09-11T07:15:00Z",
    isRead: true,
  },
  {
    id: "alert_004",
    stationId: "DWLR_004",
    stationName: "Andheri East",
    type: "warning",
    title: "Declining Trend Alert",
    message:
      "Water level showing consistent declining trend over the past 10 days.",
    timestamp: "2025-09-10T16:20:00Z",
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
  const [stations, setStations] = useState<Station[]>(mockStations);
  const alerts = mockAlerts;
  const [userLocation, setUserLocation] = useState<LocationData | null>(null);
  const [locationPermission, setLocationPermission] = useState<Location.LocationPermissionResponse | null>(null);
  const [isLoadingLocation, setIsLoadingLocation] = useState<boolean>(false);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [isLoadingStations, setIsLoadingStations] = useState<boolean>(false);
  const [stationsError, setStationsError] = useState<string | null>(null);

  // Map Supabase row to Station shape
  const getWeekNumber = (dateStr?: string): number | undefined => {
    if (!dateStr) return undefined;
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return undefined;
    const oneJan = new Date(d.getFullYear(), 0, 1);
    const dayOfYear = Math.floor((d.getTime() - oneJan.getTime()) / 86400000) + 1;
    return Math.ceil(dayOfYear / 7);
  };

  const mapRowToStation = (row: any): Station => {
    return {
      id: String(row.id ?? row.station_id ?? row.Station_ID ?? row.P_Key ?? row.pkey ?? row.P_Key),
      name: (row.name ?? row.station_id ?? row.Station_ID ?? `Station ${row.id ?? row.P_Key}`) as string,
      district: row.district ?? "",
      state: row.state ?? "",
      latitude: Number(row.latitude ?? row.Latitude ?? row.lat),
      longitude: Number(row.longitude ?? row.Longitude ?? row.lon),
      currentLevel: Number(row.water_level ?? row.waterlevel ?? row.Water_Level_m ?? 0),
      status: "normal",
      batteryLevel: 100,
      signalStrength: 100,
      availabilityIndex: 1,
      lastUpdated: (row.date ?? row.Date) ? new Date(row.date ?? row.Date).toISOString() : new Date().toISOString(),
      aquiferType: row.aquifer_type ?? "",
      specificYield: Number(row.specific_yield ?? 0),
      installationDate: row.installation_date ?? new Date().toISOString().slice(0,10),
      depth: Number(row.depth ?? 0),
      oxygenLevel: row.Dissolved_Oxygen_mg_L != null ? Number(row.Dissolved_Oxygen_mg_L) : (row.oxygen_level != null ? Number(row.oxygen_level) : (row.oxygen != null ? Number(row.oxygen) : undefined)),
      temperature: row.Temperature_C != null ? Number(row.Temperature_C) : (row.temperature != null ? Number(row.temperature) : undefined),
      week: row.week ?? getWeekNumber(row.date ?? row.Date),
      recentReadings: [
        { timestamp: (row.date ?? row.Date) ? new Date(row.date ?? row.Date).toISOString() : new Date().toISOString(), level: Number(row.water_level ?? row.waterlevel ?? row.Water_Level_m ?? 0), temperature: Number((row.temperature ?? row.Temperature_C) ?? 0) },
      ],
      rechargeData: [],
    };
  };

  // Map from Map_pinpoints2.0 row to Station
  const mapPinpointRowToStation = (row: any): Station => {
    const statusMap: Record<string, Station["status"]> = {
      Light: "normal",
      Moderate: "warning",
      Heavy: "critical",
      None: "normal",
    };
    const lat = parseFloat(String(row.Latitude ?? row.latitude ?? ''));
    const lon = parseFloat(String(row.Longitude ?? row.longitude ?? ''));
    return {
      id: String(row.Serial_No ?? row.id ?? row.P_Key ?? Math.random()),
      name: String(row.Area_Name ?? row.name ?? `Station ${row.Serial_No ?? row.id ?? ''}`),
      district: "",
      state: "",
      latitude: isFinite(lat) ? lat : 0,
      longitude: isFinite(lon) ? lon : 0,
      currentLevel: 0,
      status: statusMap[String(row.DWLR_Status ?? '').trim()] ?? "normal",
      batteryLevel: 100,
      signalStrength: 100,
      availabilityIndex: 1,
      lastUpdated: new Date().toISOString(),
      aquiferType: "",
      specificYield: 0,
      installationDate: new Date().toISOString().slice(0, 10),
      depth: 0,
      oxygenLevel: undefined,
      temperature: undefined,
      week: undefined,
      recentReadings: [],
      rechargeData: [],
    };
  };

  // Fetch stations from Supabase using ONLY recent_data (do not use pin_point_database)
  const fetchStations = useCallback(async () => {
    try {
      setIsLoadingStations(true);
      setStationsError(null);

      // Fetch recent groundwater data (latest first) from recent_data
      const { data: recentData, error: recentErr } = await supabase
        .from('recent_data')
        .select('*')
        .order('Date', { ascending: false });

      if (recentErr) throw recentErr;

      // Deduplicate by Serial_No to keep only the latest record per station
      const latestBySerial: Record<string, any> = {};
      for (const row of (recentData ?? [])) {
        const serial = String(row.Serial_No ?? row.serial_no ?? '');
        if (!serial) continue;
        if (!latestBySerial[serial]) {
          latestBySerial[serial] = row;
        }
      }

      // Map recent_data rows to Station objects
      const mappedFromRecent: Station[] = Object.values(latestBySerial)
        .map((row: any) => {
          const lat = Number(row.Latitude);
          const lon = Number(row.Longitude);
          const level = Number(row.Groundwater_Level_m);
          const temp = row.Temperature_C != null ? Number(row.Temperature_C) : undefined;
          const oxy = row.Oxygen_mgL != null ? Number(row.Oxygen_mgL) : undefined;
          const dateStr = row.Date ? new Date(row.Date).toISOString() : new Date().toISOString();

          return {
            id: String(row.Serial_No),
            name: String(row.Area_Name ?? row.Serial_No),
            district: "",
            state: "",
            latitude: Number.isFinite(lat) ? lat : 0,
            longitude: Number.isFinite(lon) ? lon : 0,
            currentLevel: Number.isFinite(level) ? level : 0,
            status: "normal",
            batteryLevel: 100,
            signalStrength: 100,
            availabilityIndex: 1,
            lastUpdated: dateStr,
            aquiferType: "",
            specificYield: 0,
            installationDate: new Date().toISOString().slice(0,10),
            depth: 0,
            oxygenLevel: oxy,
            temperature: temp,
            week: (() => { const d = new Date(dateStr); const oneJan = new Date(d.getFullYear(), 0, 1); const dayOfYear = Math.floor((d.getTime() - oneJan.getTime()) / 86400000) + 1; return Math.ceil(dayOfYear / 7); })(),
            recentReadings: [ { timestamp: dateStr, level: Number.isFinite(level) ? level : 0, temperature: temp } ],
            rechargeData: [],
          } as Station;
        })
        .filter(s => Number.isFinite(s.latitude) && Number.isFinite(s.longitude));

      console.log('Supabase recent_data rows:', recentData?.length ?? 0, 'mapped(valid):', mappedFromRecent.length);
      setStations(mappedFromRecent);
    } catch (err: any) {
      console.log('Supabase fetch error:', err);
      setStationsError(err?.message || 'Failed to load stations');
    } finally {
      setIsLoadingStations(false);
    }
  }, []);

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

  // Get nearby stations based on user location (within a radius if possible)
  const nearbyStations = useMemo(() => {
    if (!userLocation) {
      // Return first 4 stations if no location available
      return stations.slice(0, 4);
    }

    const RADIUS_KM = 50; // configurable nearby radius

    // Calculate distances
    const stationsWithDistance = stations.map(station => ({
      ...station,
      distance: calculateDistance(
        userLocation.latitude,
        userLocation.longitude,
        station.latitude,
        station.longitude
      )
    }));

    // Filter within radius, else fallback to closest 6
    const withinRadius = stationsWithDistance.filter(s => (s as any).distance <= RADIUS_KM);
    const sorted = (withinRadius.length > 0 ? withinRadius : stationsWithDistance)
      .sort((a, b) => (a as any).distance - (b as any).distance);

    return sorted.slice(0, 6);
  }, [stations, userLocation]);

  // Estimated groundwater level at user's live location via IDW (k-nearest)
  const estimatedLevel = useMemo(() => {
    if (!userLocation) return null as number | null;
    const candidates = stations
      .filter(s => Number.isFinite(s.currentLevel) && Number.isFinite(s.latitude) && Number.isFinite(s.longitude));
    if (candidates.length === 0) return null as number | null;

    // Compute distances
    const withDistance = candidates.map(s => ({
      station: s,
      distanceKm: calculateDistance(userLocation.latitude, userLocation.longitude, s.latitude, s.longitude),
    }));

    // If any station is exactly at user's location, return its level
    const atSameSpot = withDistance.find(x => x.distanceKm === 0);
    if (atSameSpot) return atSameSpot.station.currentLevel;

    // Use k nearest
    const K = 5;
    const P = 1; // IDW power
    const MIN_DIST = 0.001; // km safeguard
    const nearest = withDistance.sort((a, b) => a.distanceKm - b.distanceKm).slice(0, K);

    let numerator = 0;
    let denominator = 0;
    for (const item of nearest) {
      const d = Math.max(item.distanceKm, MIN_DIST);
      const w = 1 / Math.pow(d, P);
      numerator += item.station.currentLevel * w;
      denominator += w;
    }
    if (denominator === 0) return null as number | null;
    return numerator / denominator;
  }, [stations, userLocation]);

  // Auto-request location on mount
  useEffect(() => {
    requestLocationPermission();
  }, [requestLocationPermission]);

  // Load stations on mount and on focus changes in future
  useEffect(() => {
    fetchStations();
  }, [fetchStations]);

  const getStationById = useCallback((id: string) => {
    return stations.find(station => station.id === id);
  }, [stations]);

  const getAnalytics = useCallback(() => {
    const avgWaterLevel = stations.reduce((sum, station) => sum + station.currentLevel, 0) / stations.length;
    const rechargeEvents = stations.reduce((sum, station) => sum + station.rechargeData.length, 0);
    const criticalStations = stations.filter(station => station.status === "critical").length;

    const regionalData = [
      { state: "Pune", avgLevel: 16.2, status: "warning" as const },
      { state: "Thane", avgLevel: 22.8, status: "critical" as const },
      { state: "Mira Bhyandar", avgLevel: 11.5, status: "normal" as const },
      { state: "Nagpur", avgLevel: 18.9, status: "warning" as const },
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
    estimatedLevel,
    userLocation,
    locationPermission,
    isLoadingLocation,
    locationError,
    isLoadingStations,
    stationsError,
    getStationById,
    getAnalytics,
    requestLocationPermission,
  }), [stations, alerts, nearbyStations, userLocation, locationPermission, isLoadingLocation, locationError, isLoadingStations, stationsError, getStationById, getAnalytics, requestLocationPermission]);
});