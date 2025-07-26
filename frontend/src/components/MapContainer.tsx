import React, { useEffect, useState } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup, Tooltip
} from "react-leaflet";
import "leaflet/dist/leaflet.css";

import L from "leaflet";
import markerIcon from "leaflet/dist/images/marker-icon.png";

const blinkingIcon = new L.DivIcon({
  html: `<div class="blink-marker" style="
    width: 25px;
    height: 41px;
    background: url(${markerIcon}) no-repeat center;
    background-size: contain;
  "></div>`,
  className: "", // removes default Leaflet styling
  iconSize: [25, 41],
});

interface Report {
  location: {
    lat: number;
    lng: number;
  };
  title: string;
  description: string;
  media_file: string;

}

const MapView: React.FC = () => {
  const [reports, setReports] = useState<Report[]>([]);

  useEffect(() => {
    const fetchReports = async () => {
      try {
        console.log("🔄 Fetching reports from Firebase Realtime Database...");
        const response = await fetch("http://localhost:9000/feed");
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        console.log("✅ Raw feed data from Firebase:", data);

        if (data.status === "ok" && data.items) {
          // Handle both array format and Firebase object format
          let reportsArray = data.items;
          
          // If Firebase returns an object instead of array, convert it
          if (typeof data.items === 'object' && !Array.isArray(data.items)) {
            reportsArray = Object.values(data.items);
            console.log("🔄 Converted Firebase object to array:", reportsArray);
          }

          const mapped: Report[] = reportsArray
            .filter((r: any) => r && r.lat && r.lng) // Additional null check
            .map((r: any, index: number) => {
              const lat = parseFloat(r.lat);
              const lng = parseFloat(r.lng);
              const media_file = r.media?.split("\\").pop();

              console.log(`📌 Report ${index}: lat=${lat}, lng=${lng}, media=${media_file}`);

              return {
                location: { lat, lng },
                description: r.description,
                media_file: media_file,
                title: r.title 
              };
            });

          console.log("🗂️ Final mapped reports:", mapped);
          setReports(mapped);
        } else {
          console.error("❌ Invalid feed response format:", data);
        }
      } catch (err) {
        console.error("❌ Error loading feed from Firebase:", err);
      }
    };

    fetchReports();
  }, []);

  return (
    <MapContainer
      center={[12.9716, 77.5946]} // Bangalore
      zoom={12}
      scrollWheelZoom={true}
      style={{
        height: "100vh",
        width: "100vw",
        zIndex: 0,
        filter: "grayscale(10%) brightness(97%)",
      }}
    >
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution="&copy; OpenStreetMap contributors"
      />

 {reports.map((r, i) => {
  if (!r.location) return null; // Skip markers with missing location

  return (
 <Marker position={[r.location.lat, r.location.lng]} key={i} icon={blinkingIcon}>
  <Tooltip direction="top" offset={[0, -10]} opacity={1} permanent={false}>
    <div style={{ maxWidth: "220px", textAlign: "left", lineHeight: "1.4" }}>
      <strong>{r.title}</strong>
    </div>
  </Tooltip>

  <Popup>
  <div
    style={{
      width: "240px",
      padding: "12px",
      background: "#fff",
      borderRadius: "10px",
      boxShadow: "0 2px 10px rgba(0,0,0,0.15)",
      fontFamily: "system-ui, sans-serif",
      lineHeight: "1.5",
      color: "#333"
    }}
  >
    <h4 style={{ margin: "0 0 8px", fontSize: "16px", color: "#222" }}>
      {r.title}
    </h4>
    <p style={{ margin: "0 0 10px", fontSize: "14px", color: "#555" }}>
      {r.description || "No description provided."}
    </p>
    {r.media_file ? (
      <img
        src={`http://localhost:9000/uploads/${r.media_file}`}
        alt="Citizen Report"
        style={{
          width: "100%",
          borderRadius: "8px",
          boxShadow: "0 1px 6px rgba(0,0,0,0.1)"
        }}
      />
    ) : (
      <div style={{ fontStyle: "italic", color: "#999" }}>
        No image provided
      </div>
    )}
  </div>
</Popup>

</Marker>


  );
})}

    </MapContainer>
  );
};

export default MapView;