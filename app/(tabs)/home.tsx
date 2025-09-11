import { StationCard } from "@/components/station-card";
import { StationMap } from "@/components/station-map";
import { useStations } from "@/providers/stations-provider";
import { router } from "expo-router";
import { Bell, Filter, MapPin, RefreshCw, Search } from "lucide-react-native";
import React, { useState } from "react";
import {
    ActivityIndicator,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

function MapScreenContent() {
  const { 
    stations, 
    nearbyStations, 
    userLocation, 
    isLoadingLocation, 
    locationError, 
    requestLocationPermission,
    estimatedLevel,
  } = useStations();
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [isBottomSheetExpanded, setIsBottomSheetExpanded] = useState<boolean>(false);
  const insets = useSafeAreaInsets();

  const filteredStations = stations.filter(station =>
    station.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    station.district.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={styles.headerTitle}>DWLR Stations</Text>
          <View style={styles.locationContainer}>
            {isLoadingLocation ? (
              <View style={styles.locationStatus}>
                <ActivityIndicator size="small" color="#0891b2" />
                <Text style={styles.locationText}>Getting location...</Text>
              </View>
            ) : userLocation ? (
              <View style={styles.locationStatus}>
                <MapPin size={14} color="#059669" />
                <Text style={styles.locationText}>
                  {userLocation.latitude.toFixed(4)}, {userLocation.longitude.toFixed(4)}
                </Text>
              </View>
            ) : (
              <TouchableOpacity 
                style={styles.locationStatus} 
                onPress={requestLocationPermission}
              >
                <MapPin size={14} color="#dc2626" />
                <Text style={[styles.locationText, { color: '#dc2626' }]}>
                  {locationError || 'Tap to enable location'}
                </Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
        <View style={styles.headerRight}>
          <TouchableOpacity 
            style={styles.headerButton}
            onPress={requestLocationPermission}
            disabled={isLoadingLocation}
          >
            {isLoadingLocation ? (
              <ActivityIndicator size={20} color="#0891b2" />
            ) : (
              <RefreshCw size={20} color="#0891b2" />
            )}
          </TouchableOpacity>
          <TouchableOpacity style={styles.headerButton}>
            <Bell size={24} color="#64748b" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <Search size={20} color="#64748b" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search "
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
        <TouchableOpacity style={styles.filterButton}>
          <Filter size={20} color="#0891b2" />
        </TouchableOpacity>
      </View>

      {/* Live Location Estimated Groundwater Level */}
      <View style={styles.estimateContainer}>
        <View style={styles.estimateCard}>
          <Text style={styles.estimateTitle}>Estimated Groundwater Level (Your Location)</Text>
          <Text style={styles.estimateValue}>
            {estimatedLevel != null ? `${estimatedLevel.toFixed(2)}m` : (userLocation ? '—' : 'Enable location to estimate')}
          </Text>
          {userLocation && (
            <Text style={styles.estimateSubtext}>Based on nearby stations (IDW)</Text>
          )}
        </View>
      </View>

      {/* Map */}
      <View style={styles.mapContainer}>
        <StationMap
          stations={filteredStations}
          userLocation={userLocation}
          onStationPress={(station) => router.push(`/station/${station.id}`)}
        />
      </View>

      {/* Bottom Sheet */}
      <View style={[styles.bottomSheet, isBottomSheetExpanded && styles.bottomSheetExpanded]}>
        <TouchableOpacity
          style={styles.bottomSheetHandle}
          onPress={() => setIsBottomSheetExpanded(!isBottomSheetExpanded)}
        >
          <View style={styles.handle} />
        </TouchableOpacity>

        <View style={styles.bottomSheetHeader}>
          <Text style={styles.bottomSheetTitle}>
            {userLocation ? 'Nearby Stations' : 'Featured Stations'}
          </Text>
          <Text style={styles.bottomSheetCount}>
            {nearbyStations.length} stations
            {userLocation && ' • Sorted by distance'}
          </Text>
        </View>

        <ScrollView style={styles.stationsList} showsVerticalScrollIndicator={false}>
          {nearbyStations.map((station) => (
            <StationCard
              key={station.id}
              station={station}
              onPress={() => router.push(`/station/${station.id}`)}
            />
          ))}
        </ScrollView>
      </View>
    </View>
  );
}

export default function MapScreen() {
  return (
    <MapScreenContent />
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8fafc",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: "white",
    borderBottomWidth: 1,
    borderBottomColor: "#e2e8f0",
  },
  headerLeft: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#1e293b",
  },
  headerSubtitle: {
    fontSize: 14,
    color: "#64748b",
    marginTop: 2,
  },
  locationContainer: {
    marginTop: 4,
  },
  locationStatus: {
    flexDirection: "row",
    alignItems: "center",
  },
  locationText: {
    fontSize: 12,
    color: "#64748b",
    marginLeft: 4,
  },
  headerRight: {
    flexDirection: "row",
    alignItems: "center",
  },
  headerButton: {
    padding: 8,
  },
  searchContainer: {
    flexDirection: "row",
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: "white",
    borderBottomWidth: 1,
    borderBottomColor: "#e2e8f0",
  },
  searchBar: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f1f5f9",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginRight: 12,
  },
  searchInput: {
    flex: 1,
    marginLeft: 12,
    fontSize: 16,
    color: "#1e293b",
  },
  filterButton: {
    backgroundColor: "#e0f2fe",
    borderRadius: 12,
    padding: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  mapContainer: {
    flex: 1,
  },
  estimateContainer: {
    paddingHorizontal: 20,
    paddingTop: 12,
    backgroundColor: "#ffffff",
  },
  estimateCard: {
    backgroundColor: "#e0f2fe",
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: "#bae6fd",
  },
  estimateTitle: {
    fontSize: 14,
    color: "#0369a1",
    marginBottom: 6,
    fontWeight: "600",
  },
  estimateValue: {
    fontSize: 20,
    fontWeight: "700",
    color: "#0ea5e9",
  },
  estimateSubtext: {
    marginTop: 4,
    fontSize: 12,
    color: "#075985",
  },
  bottomSheet: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "white",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingTop: 12,
    height: 280,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
  },
  bottomSheetExpanded: {
    height: "60%",
  },
  bottomSheetHandle: {
    alignItems: "center",
    paddingVertical: 8,
  },
  handle: {
    width: 40,
    height: 4,
    backgroundColor: "#cbd5e1",
    borderRadius: 2,
  },
  bottomSheetHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#f1f5f9",
  },
  bottomSheetTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1e293b",
  },
  bottomSheetCount: {
    fontSize: 14,
    color: "#64748b",
  },
  stationsList: {
    flex: 1,
    paddingHorizontal: 20,
  },
});