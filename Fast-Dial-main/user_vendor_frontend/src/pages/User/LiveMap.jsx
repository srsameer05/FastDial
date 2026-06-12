import React, { useEffect, useRef, useState } from "react";
import {
  GoogleMap,
  Marker,
  useJsApiLoader,
  DirectionsRenderer,
  InfoWindow,
} from "@react-google-maps/api";
import drivericon from "../../assets/bike.svg";

const BASEURL = import.meta.env.VITE_API_URL || "http://localhost:3000/api/v1";

const containerStyle = {
  width: "100%",
  height: "400px",
};

const GOOGLE_MAP_LIBRARIES = ["places"];

class ErrorBoundary extends React.Component {
  state = { hasError: false, error: null };

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("ErrorBoundary in LiveMap caught error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="text-red-500 text-sm sm:text-base p-4">
          Failed to load map. Please try again later or contact support.
        </div>
      );
    }
    return this.props.children;
  }
}

// FIX 4: Accept customerAddress as a prop instead of reading from localStorage
const LiveMap = ({ bookingId, userToken, vendorId, customerAddress }) => {
  const [driverPosition, setDriverPosition] = useState(null);
  const [ETA, setETA] = useState("");
  const [distance, setDistance] = useState("");
  const [directions, setDirections] = useState(null);
  const [showInfo, setShowInfo] = useState(false);
  const [error, setError] = useState(null);
  // FIX: Don't start in loading state — only load when we have a vendor
  const [isLoading, setIsLoading] = useState(false);

  const markerRef = useRef(null);

  // FIX 4: Use prop-based address with fallback to localStorage, then Chennai
  const resolvedAddress = customerAddress
    || JSON.parse(localStorage.getItem("selectedAddressId") || "null");

  const customerLocation = resolvedAddress?.latitude && resolvedAddress?.longitude
    ? { lat: Number(resolvedAddress.latitude), lng: Number(resolvedAddress.longitude) }
    : { lat: 13.0827, lng: 80.2707 }; // Fallback to Chennai

  const { isLoaded, loadError } = useJsApiLoader({
    id: "google-map-script",
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
    libraries: GOOGLE_MAP_LIBRARIES,
  });

  const fetchVendorLocation = async () => {
    console.log("fetchVendorLocation called for bookingId:", bookingId);
    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch(
        `${BASEURL}/customers/data/getVendorLocationTracking/${bookingId}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${userToken}`,
          },
        }
      );

      // FIX 2: Handle 404 gracefully — vendor just hasn't started tracking yet
      if (response.status === 404) {
        console.log("Vendor location not yet available (404) — will retry");
        setDriverPosition(null);
        setDirections(null);
        setIsLoading(false);
        return;
      }

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const result = await response.json();
      console.log("Vendor Location API Response:", result);

      // FIX: Backend now returns array — handle both array and single object
      const locationData = Array.isArray(result.data)
        ? result.data[0]
        : result.data;

      if (locationData?.latitude && locationData?.longitude) {
        const newPos = {
          lat: Number(locationData.latitude),
          lng: Number(locationData.longitude),
        };
        setDriverPosition(newPos);
        console.log("Driver position updated to:", newPos);

        if (window.google && isLoaded) {
          const directionsService = new window.google.maps.DirectionsService();
          directionsService.route(
            {
              origin: newPos,
              destination: customerLocation,
              travelMode: window.google.maps.TravelMode.DRIVING,
            },
            (result, status) => {
              if (status === "OK") {
                const leg = result.routes[0].legs[0];
                setETA(leg.duration.text);
                setDistance(leg.distance.text);
                setDirections(result);
                setShowInfo(true);
              } else {
                console.error("Directions API failed:", status);
                setError("Unable to calculate route. Please try again.");
              }
            }
          );
        }
      } else {
        console.warn("No valid coordinates in vendor location response");
      }
    } catch (err) {
      console.error("Error fetching vendor location:", err.message);
      setError("Failed to fetch vendor location. Please check your connection or try again.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!isLoaded || !bookingId || !userToken) {
      console.log("Skipping fetch — missing isLoaded, bookingId, or userToken");
      return;
    }

    // FIX 3: Don't fetch vendor location if no vendor is assigned yet
    if (!vendorId) {
      console.log("No vendor assigned to this booking — skipping location fetch");
      return;
    }

    fetchVendorLocation();
    const intervalId = setInterval(fetchVendorLocation, 15000);
    return () => clearInterval(intervalId);
  }, [isLoaded, bookingId, userToken, vendorId]);

  if (loadError) {
    return (
      <div className="text-red-500 text-sm sm:text-base p-4">
        Failed to load map. Please check your internet connection or try again later.
      </div>
    );
  }

  if (!isLoaded) {
    return (
      <div className="text-gray-500 text-sm sm:text-base p-4">
        Loading map...
      </div>
    );
  }

  // FIX 3: Show a friendly "waiting" state instead of an error when no vendor yet
  if (!vendorId) {
    return (
      <div className="text-gray-500 text-sm sm:text-base p-4">
        Waiting for a vendor to be assigned to your booking...
      </div>
    );
  }

  if (isLoading && !driverPosition) {
    return (
      <div className="text-gray-500 text-sm sm:text-base p-4">
        Loading vendor location...
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-red-500 text-sm sm:text-base p-4">
        {error}
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <div className="space-y-2 rounded-2xl">
        <GoogleMap
          mapContainerStyle={containerStyle}
          center={driverPosition || customerLocation}
          zoom={14}
        >
          {directions && (
            <DirectionsRenderer
              directions={directions}
              options={{
                suppressMarkers: true,
                polylineOptions: {
                  strokeColor: "#1e90ff",
                  strokeOpacity: 1,
                  strokeWeight: 5,
                },
              }}
            />
          )}
          <Marker
            position={customerLocation}
            label="You"
            icon={{
              url: "https://cdn-icons-png.flaticon.com/512/149/149071.png",
              scaledSize: new window.google.maps.Size(40, 40),
            }}
          />
          {driverPosition && (
            <Marker
              position={driverPosition}
              onLoad={(marker) => (markerRef.current = marker)}
              icon={{
                url: drivericon,
                scaledSize: new window.google.maps.Size(40, 40),
              }}
            />
          )}
          {showInfo && directions?.routes[0]?.overview_path?.length > 0 && (
            <InfoWindow
              position={
                directions.routes[0].overview_path[
                  Math.floor(directions.routes[0].overview_path.length / 2)
                ]
              }
              options={{ pixelOffset: new window.google.maps.Size(0, -30) }}
            >
              <div style={{ fontSize: "14px", fontWeight: "bold" }}>
                {ETA} ({distance})
              </div>
            </InfoWindow>
          )}
        </GoogleMap>

        <div className="flex justify-between text-blue-600 font-semibold text-lg px-2">
          {driverPosition ? (
            <>
              <span>Vendor is on the way!</span>
              <span>Arriving in {ETA}</span>
            </>
          ) : (
            <span>Vendor assigned — waiting for location update...</span>
          )}
        </div>
      </div>
    </ErrorBoundary>
  );
};

export default LiveMap;