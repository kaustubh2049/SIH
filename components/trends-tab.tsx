import { Station } from "@/providers/stations-provider";
import { TrendingDown, TrendingUp } from "lucide-react-native";
import React from "react";
import { StyleSheet, Text, View } from "react-native";

interface TrendsTabProps {
  station: Station;
}

export function TrendsTab({ station }: TrendsTabProps) {
  const calculateTrend = (days: number) => {
    if (station.recentReadings.length < 2) return { value: 0, direction: "stable" as const };
    
    const recent = station.recentReadings.slice(-days);
    const first = recent[0]?.level || 0;
    const last = recent[recent.length - 1]?.level || 0;
    const change = last - first;
    
    return {
      value: Math.abs(change),
      direction: change > 0.1 ? "rising" as const : change < -0.1 ? "falling" as const : "stable" as const,
    };
  };

  const weeklyTrend = calculateTrend(7);
  const monthlyTrend = calculateTrend(30);

  const getTrendIcon = (direction: string) => {
    switch (direction) {
      case "rising":
        return <TrendingUp size={16} color="#059669" />;
      case "falling":
        return <TrendingDown size={16} color="#dc2626" />;
      default:
        return null;
    }
  };

  const getTrendColor = (direction: string) => {
    switch (direction) {
      case "rising":
        return "#059669";
      case "falling":
        return "#dc2626";
      default:
        return "#64748b";
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.trendCard}>
        <Text style={styles.cardTitle}>7-Day Trend</Text>
        <View style={styles.trendRow}>
          {getTrendIcon(weeklyTrend.direction)}
          <Text style={[styles.trendValue, { color: getTrendColor(weeklyTrend.direction) }]}>
            {weeklyTrend.direction === "stable" ? "Stable" : `${weeklyTrend.value.toFixed(2)}m ${weeklyTrend.direction}`}
          </Text>
        </View>
        <Text style={styles.trendDescription}>
          {weeklyTrend.direction === "rising" 
            ? "Water level is rising, indicating possible recharge"
            : weeklyTrend.direction === "falling"
            ? "Water level is declining, monitor closely"
            : "Water level remains stable"
          }
        </Text>
      </View>

      <View style={styles.trendCard}>
        <Text style={styles.cardTitle}>30-Day Trend</Text>
        <View style={styles.trendRow}>
          {getTrendIcon(monthlyTrend.direction)}
          <Text style={[styles.trendValue, { color: getTrendColor(monthlyTrend.direction) }]}>
            {monthlyTrend.direction === "stable" ? "Stable" : `${monthlyTrend.value.toFixed(2)}m ${monthlyTrend.direction}`}
          </Text>
        </View>
        <Text style={styles.trendDescription}>
          {monthlyTrend.direction === "rising" 
            ? "Long-term recovery trend observed"
            : monthlyTrend.direction === "falling"
            ? "Long-term decline requires attention"
            : "Long-term stability maintained"
          }
        </Text>
      </View>

      <View style={styles.statsGrid}>
        <View style={styles.statItem}>
          <Text style={styles.statLabel}>Min Level (30d)</Text>
          <Text style={styles.statValue}>
            {Math.min(...station.recentReadings.map(r => r.level)).toFixed(2)}m
          </Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statLabel}>Max Level (30d)</Text>
          <Text style={styles.statValue}>
            {Math.max(...station.recentReadings.map(r => r.level)).toFixed(2)}m
          </Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statLabel}>Average Level</Text>
          <Text style={styles.statValue}>
            {(station.recentReadings.reduce((sum, r) => sum + r.level, 0) / station.recentReadings.length).toFixed(2)}m
          </Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statLabel}>Variability</Text>
          <Text style={styles.statValue}>
            {(Math.max(...station.recentReadings.map(r => r.level)) - Math.min(...station.recentReadings.map(r => r.level))).toFixed(2)}m
          </Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 16,
  },
  trendCard: {
    backgroundColor: "#f8fafc",
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1e293b",
    marginBottom: 12,
  },
  trendRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  trendValue: {
    fontSize: 18,
    fontWeight: "600",
    marginLeft: 8,
  },
  trendDescription: {
    fontSize: 14,
    color: "#64748b",
    lineHeight: 20,
  },
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  statItem: {
    flex: 1,
    minWidth: "45%",
    backgroundColor: "#f8fafc",
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  statLabel: {
    fontSize: 12,
    color: "#64748b",
    marginBottom: 4,
  },
  statValue: {
    fontSize: 16,
    fontWeight: "600",
    color: "#0891b2",
  },
});