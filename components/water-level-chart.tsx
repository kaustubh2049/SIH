import { Station } from "@/providers/stations-provider";
import React from "react";
import { Dimensions, StyleSheet, Text, View } from "react-native";
import Svg, { Circle, Line, Path, Text as SvgText } from "react-native-svg";

interface WaterLevelChartProps {
  station: Station;
  timeframe: "7d" | "30d" | "1y";
}

export function WaterLevelChart({ station, timeframe }: WaterLevelChartProps) {
  const { width } = Dimensions.get("window");
  const chartWidth = width - 120;
  const chartHeight = 180;

  const data = station.recentReadings.map((reading, index) => ({
    x: index,
    y: reading.level,
    timestamp: reading.timestamp,
  }));

  if (data.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>No data available</Text>
      </View>
    );
  }

  const maxY = Math.max(...data.map(d => d.y));
  const minY = Math.min(...data.map(d => d.y));
  const yRange = Math.max(maxY - minY, 1);

  // Avoid division by zero when there is only a single data point
  const xDenominator = Math.max(data.length - 1, 1);
  const getScaledX = (x: number) => (x / xDenominator) * chartWidth;
  const getScaledY = (y: number) => chartHeight - ((y - minY) / yRange) * chartHeight;

  // For a single point, draw a small horizontal segment to avoid invalid path
  const pathData = (() => {
    if (data.length === 1) {
      const x = getScaledX(0);
      const y = getScaledY(data[0].y);
      return `M ${x - 0.001} ${y} L ${x + 0.001} ${y}`;
    }
    return data
      .map((point, index) => {
        const x = getScaledX(point.x);
        const y = getScaledY(point.y);
        return index === 0 ? `M ${x} ${y}` : `L ${x} ${y}`;
      })
      .join(" ");
  })();

  return (
    <View style={styles.container}>
      <Svg width={chartWidth} height={chartHeight + 30} style={styles.chart}>
        {/* Grid lines */}
        {[0, 0.25, 0.5, 0.75, 1].map((ratio) => {
          const y = ratio * chartHeight;
          return (
            <Line
              key={ratio}
              x1={0}
              y1={y}
              x2={chartWidth}
              y2={y}
              stroke="#f1f5f9"
              strokeWidth={1}
            />
          );
        })}

        {/* Y-axis labels */}
        {[0, 0.5, 1].map((ratio) => {
          const y = ratio * chartHeight;
          const value = maxY - (ratio * yRange);
          return (
            <SvgText
              key={ratio}
              x={-10}
              y={y + 4}
              fontSize={10}
              fill="#64748b"
              textAnchor="end"
            >
              {value.toFixed(1)}
            </SvgText>
          );
        })}

        {/* Chart line */}
        <Path
          d={pathData}
          stroke="#0891b2"
          strokeWidth={3}
          fill="none"
        />

        {/* Data points */}
        {data.map((point, index) => (
          <Circle
            key={index}
            cx={getScaledX(point.x)}
            cy={getScaledY(point.y)}
            r={4}
            fill="#0891b2"
            stroke="white"
            strokeWidth={2}
          />
        ))}

        {/* X-axis labels */}
        {data.filter((_, index) => index % Math.ceil(data.length / 3) === 0).map((point, index) => (
          <SvgText
            key={index}
            x={getScaledX(point.x)}
            y={chartHeight + 20}
            fontSize={9}
            fill="#64748b"
            textAnchor="middle"
          >
            {new Date(point.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </SvgText>
        ))}
      </Svg>

      <View style={styles.info}>
        <Text style={styles.infoText}>
          Current: {station.currentLevel.toFixed(2)}m • 
          Trend: {data.length > 1 ? (data[data.length - 1].y > data[0].y ? "Rising" : "Falling") : "Stable"}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
  },
  chart: {
    marginLeft: 20,
  },
  emptyContainer: {
    height: 180,
    justifyContent: "center",
    alignItems: "center",
  },
  emptyText: {
    fontSize: 14,
    color: "#64748b",
  },
  info: {
    marginTop: 12,
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: "#f8fafc",
    borderRadius: 8,
  },
  infoText: {
    fontSize: 12,
    color: "#64748b",
    textAlign: "center",
  },
});