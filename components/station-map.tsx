import { LocationData, Station } from "@/providers/stations-provider";
import React, { useMemo, useRef } from "react";
import { Dimensions, StyleSheet, View } from "react-native";
import WebView, { WebViewMessageEvent } from "react-native-webview";

interface StationMapProps {
  stations: Station[];
  userLocation?: LocationData | null;
  onStationPress: (station: Station) => void;
}

export function StationMap({ stations, userLocation, onStationPress }: StationMapProps) {
  const { height } = Dimensions.get("window");
  const webRef = useRef<WebView | null>(null);

  const html = useMemo(() => {
    const initialCenter = {
      lat: userLocation?.latitude ?? 22.9734,
      lng: userLocation?.longitude ?? 78.6569,
      zoom: userLocation ? 8 : 5,
    };

    const payload = {
      initialCenter,
      user: userLocation ? { lat: userLocation.latitude, lng: userLocation.longitude } : null,
      stations: stations.map(s => ({
        id: s.id,
        name: s.name,
        district: s.district,
        state: s.state,
        lat: s.latitude,
        lng: s.longitude,
        currentLevel: s.currentLevel,
        oxygenLevel: s.oxygenLevel,
        temperature: s.temperature,
        week: s.week,
      })),
    };

    const dataScript = `window.__MAP_DATA__ = ${JSON.stringify(payload)};`;

    return `<!doctype html>
<html>
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1" />
<link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" integrity="sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY=" crossorigin="" />
<style>
  html, body, #map { height: 100%; margin: 0; }
  .callout-title { font-weight: 600; font-size: 14px; color: #1e293b; }
  .callout-sub { font-size: 12px; color: #64748b; margin-top: 2px; }
  .callout-meta { font-size: 12px; color: #0891b2; margin-top: 6px; }
</style>
</head>
<body>
<div id="map"></div>
<script ${''}src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js" integrity="sha256-20nQCchB9co0qIjJZRGuk2/Z9VM+kNiyxNV1lvTlZBo=" crossorigin=""></script>
<script>
${dataScript}
const RN = window.ReactNativeWebView;
const data = window.__MAP_DATA__;
const map = L.map('map').setView([data.initialCenter.lat, data.initialCenter.lng], data.initialCenter.zoom);
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  maxZoom: 19,
  attribution: '&copy; OpenStreetMap contributors'
}).addTo(map);

function stationPopupHtml(s) {
  var parts = [];
  parts.push('<div>');
  parts.push('<div class="callout-title">' + (s.name || '') + '</div>');
  var sub = (s.district || '') + (s.state ? ((s.district ? ', ' : '') + s.state) : '');
  parts.push('<div class="callout-sub">' + sub + '</div>');
  parts.push('<div class="callout-meta">Water: ' + Number(s.currentLevel || 0).toFixed(1) + 'm</div>');
  if (s.oxygenLevel != null) parts.push('<div class="callout-meta">Oxygen: ' + s.oxygenLevel + '</div>');
  if (s.temperature != null) parts.push('<div class="callout-meta">Temperature: ' + s.temperature + '°C</div>');
  if (s.week != null) parts.push('<div class="callout-meta">Week: ' + s.week + '</div>');
  parts.push('</div>');
  return parts.join('');
}

// User marker
if (data.user) {
  const userIcon = L.icon({
    iconUrl: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="%230891b2"><path d="M12 2C8.686 2 6 4.686 6 8c0 5.25 6 14 6 14s6-8.75 6-14c0-3.314-2.686-6-6-6zm0 8.5c-1.379 0-2.5-1.121-2.5-2.5S10.621 5.5 12 5.5s2.5 1.121 2.5 2.5S13.379 10.5 12 10.5z"/></svg>',
    iconSize: [24, 24], iconAnchor: [12, 24]
  });
  L.marker([data.user.lat, data.user.lng], { icon: userIcon }).addTo(map).bindPopup('You');
}

// Station markers
const markers = [];
(data.stations || []).forEach(s => {
  const m = L.marker([s.lat, s.lng]).addTo(map).bindPopup(stationPopupHtml(s));
  m.on('click', () => {
    RN && RN.postMessage(JSON.stringify({ type: 'stationTap', id: s.id }));
  });
  markers.push(m);
});

// Notify RN when map region changes
function notifyBounds() {
  const b = map.getBounds();
  RN && RN.postMessage(JSON.stringify({ type: 'region', bounds: {
    north: b.getNorth(), south: b.getSouth(), east: b.getEast(), west: b.getWest()
  }, zoom: map.getZoom(), center: map.getCenter() }));
}
map.on('moveend', notifyBounds);
setTimeout(notifyBounds, 0);
</script>
</body>
</html>`;
  }, [stations, userLocation]);

  const handleMessage = (e: WebViewMessageEvent) => {
    try {
      const msg = JSON.parse(e.nativeEvent.data || '{}');
      if (msg.type === 'stationTap') {
        const st = stations.find(s => s.id === msg.id);
        if (st) onStationPress(st);
      }
      // msg.type === 'region' can be used if you need bounds on RN side
    } catch {}
  };

  return (
    <View style={[styles.container, { height: height * 0.5 }]}> 
      <WebView
        ref={(r) => { webRef.current = r; }}
        originWhitelist={["*"]}
        source={{ html }}
        onMessage={handleMessage}
        javaScriptEnabled
        domStorageEnabled
        allowFileAccess
        allowUniversalAccessFromFileURLs
        automaticallyAdjustContentInsets={false}
      />
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
});