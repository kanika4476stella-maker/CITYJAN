"use client";

import { useState, useMemo } from "react";
import { GoogleMap, Marker, InfoWindow, useJsApiLoader, HeatmapLayer } from "@react-google-maps/api";
import { Report, CATEGORIES } from "@/lib/reports";
import { INDIA_CENTER } from "@/lib/geocoding";
import { Layers, MapPin } from "lucide-react";

const containerStyle = {
  width: "100%",
  height: "400px",
  borderRadius: "1rem",
};

const libraries: ("places" | "visualization")[] = ["places", "visualization"];

export default function CityMap({ reports }: { reports: Report[] }) {
  const [activeMarker, setActiveMarker] = useState<Report | null>(null);
  const [viewMode, setViewMode] = useState<"markers" | "heatmap">("heatmap");
  const [categoryFilter, setCategoryFilter] = useState("All");

  const { isLoaded, loadError } = useJsApiLoader({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "",
    libraries,
  });

  const handleActiveMarker = (report: Report) => {
    if (report.reportId === activeMarker?.reportId) {
      return;
    }
    setActiveMarker(report);
  };

  const validReports = reports.filter(r => r.latitude && r.longitude);
  const filteredReports = validReports.filter(r => 
    categoryFilter === "All" || r.category?.toLowerCase() === categoryFilter.toLowerCase()
  );

  const mapCenter = filteredReports.length > 0
    ? { lat: filteredReports[0].latitude, lng: filteredReports[0].longitude }
    : validReports.length > 0
      ? { lat: validReports[0].latitude, lng: validReports[0].longitude }
      : INDIA_CENTER;

  const heatmapData = useMemo(() => {
    if (!isLoaded || typeof window === 'undefined' || !window.google) return [];
    return filteredReports.map(r => new window.google.maps.LatLng(r.latitude, r.longitude));
  }, [filteredReports, isLoaded]);

  if (loadError) {
    return (
      <div className="w-full h-[400px] bg-red-50 rounded-2xl flex items-center justify-center p-6 text-center border border-red-100">
        <div>
          <p className="text-red-600 font-bold mb-1">Map cannot be loaded</p>
          <p className="text-red-500/70 text-sm">Please check your Google Maps API key.</p>
        </div>
      </div>
    );
  }

  if (!isLoaded) {
    return (
      <div className="w-full h-[400px] bg-primary/5 rounded-2xl flex items-center justify-center animate-pulse">
        <p className="text-primary/40 font-bold">Loading City Map...</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-primary/10 shadow-card p-6 w-full relative">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-5 gap-4">
        <div>
          <h3 className="font-heading font-bold text-primary text-lg flex items-center gap-2">
            City Overview <span className="text-xs bg-primary/10 text-primary px-3 py-1 rounded-full font-bold ml-2">{filteredReports.length} mapped</span>
          </h3>
          <p className="text-xs text-primary/50 mt-1">Visualize high complaint density zones and raw reports.</p>
        </div>

        <div className="flex flex-col sm:flex-row gap-2">
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="text-xs bg-background border border-primary/15 rounded-lg px-3 py-2 text-primary font-medium focus:outline-none focus:ring-1 focus:ring-accent/30 capitalize cursor-pointer shadow-sm"
          >
            <option value="All">All Categories</option>
            {CATEGORIES.map(c => <option key={c.id} value={c.label}>{c.label}</option>)}
          </select>

          <div className="flex bg-background border border-primary/15 rounded-lg p-1">
            <button
              onClick={() => setViewMode("heatmap")}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-md transition-colors ${
                viewMode === "heatmap" ? "bg-white text-primary shadow-sm" : "text-primary/50 hover:text-primary"
              }`}
            >
              <Layers className="w-3.5 h-3.5" /> Heatmap
            </button>
            <button
              onClick={() => setViewMode("markers")}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-md transition-colors ${
                viewMode === "markers" ? "bg-white text-primary shadow-sm" : "text-primary/50 hover:text-primary"
              }`}
            >
              <MapPin className="w-3.5 h-3.5" /> Pins
            </button>
          </div>
        </div>
      </div>

      <GoogleMap
        mapContainerStyle={containerStyle}
        center={mapCenter}
        zoom={11}
        options={{
          disableDefaultUI: false,
          zoomControl: true,
          streetViewControl: false,
          mapTypeControl: false,
          styles: [
            {
              featureType: "poi",
              elementType: "labels",
              stylers: [{ visibility: "off" }],
            },
          ],
        }}
        onClick={() => setActiveMarker(null)}
      >
        {viewMode === "heatmap" && heatmapData.length > 0 && (
          <HeatmapLayer
            data={heatmapData}
            options={{
              radius: 40,
              opacity: 0.8,
              gradient: [
                "rgba(0, 255, 255, 0)",
                "rgba(0, 255, 255, 1)",
                "rgba(0, 191, 255, 1)",
                "rgba(0, 127, 255, 1)",
                "rgba(0, 63, 255, 1)",
                "rgba(0, 0, 255, 1)",
                "rgba(0, 0, 223, 1)",
                "rgba(0, 0, 191, 1)",
                "rgba(0, 0, 159, 1)",
                "rgba(0, 0, 127, 1)",
                "rgba(63, 0, 91, 1)",
                "rgba(127, 0, 63, 1)",
                "rgba(191, 0, 31, 1)",
                "rgba(255, 0, 0, 1)"
              ]
            }}
          />
        )}

        {viewMode === "markers" && filteredReports.map((report) => (
          <Marker
            key={report.reportId}
            position={{ lat: report.latitude, lng: report.longitude }}
            onClick={() => handleActiveMarker(report)}
            animation={window.google?.maps.Animation.DROP}
          />
        ))}

        {activeMarker && (
          <InfoWindow
            position={{ lat: activeMarker.latitude, lng: activeMarker.longitude }}
            onCloseClick={() => setActiveMarker(null)}
          >
            <div className="p-1 max-w-[200px]">
              <span className="text-[10px] bg-primary/10 text-primary px-2 py-0.5 rounded-full font-bold uppercase tracking-wider mb-1 inline-block">
                {activeMarker.category}
              </span>
              <h4 className="font-bold text-primary text-sm leading-tight mb-1">{activeMarker.title}</h4>
              <p className="text-xs text-primary/60 truncate">{activeMarker.address || "Location mapped"}</p>
              <div className="mt-2 pt-2 border-t border-primary/10">
                <span className="text-xs font-bold capitalize text-highlight">{activeMarker.status}</span>
              </div>
            </div>
          </InfoWindow>
        )}
      </GoogleMap>
    </div>
  );
}
