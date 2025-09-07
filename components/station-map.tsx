import { LocationData, Station } from "@/providers/stations-provider";
import { MapPin } from "lucide-react-native";
import React from "react";
import { Dimensions, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";

interface StationMapProps {
  stations: Station[];
  userLocation?: LocationData | null;
  onStationPress: (station: Station) => void;
}

export function StationMap({ stations, userLocation, onStationPress }: StationMapProps) {
  const { width, height } = Dimensions.get("window");
  const mapHeight = height * 0.5;

  const getStatusColor = (status: string) => {
    switch (status) {
      case "normal": return "#059669";
      case "warning": return "#ea580c";
      case "critical": return "#dc2626";
      default: return "#64748b";
    }
  };

  const normalizeCoordinate = (value: number, min: number, max: number, screenSize: number) => {
    return ((value - min) / (max - min)) * (screenSize - 60) + 30;
  };

  const latitudes = stations.map(s => s.latitude);
  const longitudes = stations.map(s => s.longitude);
  
  // Include user location in bounds calculation if available
  if (userLocation) {
    latitudes.push(userLocation.latitude);
    longitudes.push(userLocation.longitude);
  }
  
  const minLat = Math.min(...latitudes);
  const maxLat = Math.max(...latitudes);
  const minLng = Math.min(...longitudes);
  const maxLng = Math.max(...longitudes);

  return (
    <View style={[styles.container, { height: mapHeight }]}>
      <ScrollView
        style={styles.mapContainer}
        contentContainerStyle={[styles.mapContent, { width: width - 40, height: mapHeight - 40 }]}
        showsVerticalScrollIndicator={false}
        showsHorizontalScrollIndicator={false}
        bounces={false}
      >
        <View style={styles.mapBackground}>
          <Text style={styles.mapTitle}>Bihar Groundwater Monitoring</Text>
          <Text style={styles.mapSubtitle}>DWLR Station Network</Text>
          
          {stations.map((station) => {
            const x = normalizeCoordinate(station.longitude, minLng, maxLng, width - 40);
            const y = normalizeCoordinate(station.latitude, minLat, maxLat, mapHeight - 40);
            
            return (
              <TouchableOpacity
                key={station.id}
                style={[
                  styles.stationPin,
                  {
                    left: x,
                    top: y,
                    backgroundColor: getStatusColor(station.status),
                  },
                ]}
                onPress={() => onStationPress(station)}
              >
                <View style={styles.pinInner}>
                  <Text style={styles.pinText}>{station.name.split(" ")[0]}</Text>
                </View>
                <View style={[styles.pinTail, { backgroundColor: getStatusColor(station.status) }]} />
              </TouchableOpacity>
            );
          })}
          
          {/* User Location Pin */}
          {userLocation && (
            <View
              style={[
                styles.userLocationPin,
                {
                  left: normalizeCoordinate(userLocation.longitude, minLng, maxLng, width - 40),
                  top: normalizeCoordinate(userLocation.latitude, minLat, maxLat, mapHeight - 40),
                },
              ]}
            >
              <View style={styles.userLocationInner}>
                <MapPin size={12} color="#0891b2" />
              </View>
              <View style={styles.userLocationPulse} />
            </View>
          )}
        </View>
      </ScrollView>

      <View style={styles.legend}>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: "#059669" }]} />
          <Text style={styles.legendText}>Normal</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: "#ea580c" }]} />
          <Text style={styles.legendText}>Warning</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: "#dc2626" }]} />
          <Text style={styles.legendText}>Critical</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#e0f2fe",
    margin: 20,
    borderRadius: 16,
    overflow: "hidden",
  },
  mapContainer: {
    flex: 1,
  },
  mapContent: {
    position: "relative",
  },
  mapBackground: {
    flex: 1,
    backgroundColor: "#f0f9ff",
    position: "relative",
    borderRadius: 12,
    margin: 20,
    padding: 20,
  },
  mapTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#0891b2",
    textAlign: "center",
  },
  mapSubtitle: {
    fontSize: 12,
    color: "#64748b",
    textAlign: "center",
    marginBottom: 20,
  },
  stationPin: {
    position: "absolute",
    alignItems: "center",
    zIndex: 10,
  },
  pinInner: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "white",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "white",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  pinText: {
    fontSize: 8,
    fontWeight: "600",
    color: "#1e293b",
    textAlign: "center",
  },
  pinTail: {
    width: 2,
    height: 8,
    marginTop: -1,
  },
  legend: {
    flexDirection: "row",
    justifyContent: "center",
    paddingVertical: 12,
    paddingHorizontal: 20,
    backgroundColor: "white",
    borderTopWidth: 1,
    borderTopColor: "#e2e8f0",
  },
  legendItem: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: 12,
  },
  legendDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  legendText: {
    fontSize: 12,
    color: "#64748b",
  },
  userLocationPin: {
    position: "absolute",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 15,
  },
  userLocationInner: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "white",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#0891b2",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 6,
  },
  userLocationPulse: {
    position: "absolute",
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#0891b2",
    opacity: 0.2,
    zIndex: -1,
  },
});