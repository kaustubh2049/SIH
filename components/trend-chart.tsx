import React from "react";
import { Dimensions, StyleSheet, Text, View } from "react-native";
import Svg, { Circle, Line, Path, Text as SvgText } from "react-native-svg";

interface TrendChartProps {
  timeframe: "7d" | "30d" | "1y";
}

export function TrendChart({ timeframe }: TrendChartProps) {
  const { width } = Dimensions.get("window");
  const chartWidth = width - 120;
  const chartHeight = 180;

  const generateMockData = () => {
    const points = timeframe === "7d" ? 7 : timeframe === "30d" ? 30 : 12;
    const data = [];
    let baseValue = 15;
    
    for (let i = 0; i < points; i++) {
      baseValue += (Math.random() - 0.5) * 2;
      data.push({
        x: i,
        y: Math.max(5, Math.min(25, baseValue)),
        label: timeframe === "1y" ? `M${i + 1}` : `D${i + 1}`,
      });
    }
    return data;
  };

  const data = generateMockData();
  const maxY = Math.max(...data.map(d => d.y));
  const minY = Math.min(...data.map(d => d.y));
  const yRange = maxY - minY;

  const getScaledX = (x: number) => (x / (data.length - 1)) * chartWidth;
  const getScaledY = (y: number) => chartHeight - ((y - minY) / yRange) * chartHeight;

  const pathData = data
    .map((point, index) => {
      const x = getScaledX(point.x);
      const y = getScaledY(point.y);
      return index === 0 ? `M ${x} ${y}` : `L ${x} ${y}`;
    })
    .join(" ");

  return (
    <View style={styles.container}>
      <View style={styles.chartWrapper}>
        <Svg width={chartWidth} height={chartHeight + 40} style={styles.chart}>
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
        {[0, 0.25, 0.5, 0.75, 1].map((ratio) => {
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
          strokeWidth={2}
          fill="none"
        />

        {/* Data points */}
        {data.map((point, index) => (
          <Circle
            key={index}
            cx={getScaledX(point.x)}
            cy={getScaledY(point.y)}
            r={3}
            fill="#0891b2"
          />
        ))}

        {/* X-axis labels */}
        {data.filter((_, index) => index % Math.ceil(data.length / 6) === 0).map((point, index) => (
          <SvgText
            key={index}
            x={getScaledX(point.x)}
            y={chartHeight + 20}
            fontSize={10}
            fill="#64748b"
            textAnchor="middle"
          >
            {point.label}
          </SvgText>
        ))}
        </Svg>
      </View>

      <View style={styles.legend}>
        <View style={styles.legendItem}>
          <View style={styles.legendLine} />
          <Text style={styles.legendText}>Average Water Level (m below ground)</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
  },
  chartWrapper: {
    alignItems: "center",
    justifyContent: "center",
  },
  chart: {
    marginLeft: 30,
  },
  legend: {
    marginTop: 16,
    alignItems: "center",
  },
  legendItem: {
    flexDirection: "row",
    alignItems: "center",
  },
  legendLine: {
    width: 20,
    height: 2,
    backgroundColor: "#0891b2",
    marginRight: 8,
  },
  legendText: {
    fontSize: 12,
    color: "#64748b",
  },
});