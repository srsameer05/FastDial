import React, { useEffect, useRef, useState } from "react";
import {
  GoogleMap,
  Marker,
  useJsApiLoader,
  DirectionsRenderer,
  InfoWindow,
} from "@react-google-maps/api";
import drivericon from "../../assets/bike.svg";

const containerStyle = {
  width: "100%",
  height: "400px", // Fit inside card
};

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

const LiveMap = ({ bookingId, userToken }) => {
  const [driverPosition, setDriverPosition] = useState(null);
  const [ETA, setETA] = useState("");
  const [distance, setDistance] = useState("");
  const [directions, setDirections] = useState(null);
  const [showInfo, setShowInfo] = useState(false);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const markerRef = useRef(null);

  const customerAddress = JSON.parse(localStorage.getItem("selectedAddressId"));
  console.log("Customer Address from localStorage:", customerAddress);
  const customerLocation = customerAddress
    ? { lat: Number(customerAddress.latitude), lng: Number(customerAddress.longitude) }
    : { lat: 13.0827, lng: 80.2707 }; // Fallback to Chennai if no address

  const { isLoaded, loadError } = useJsApiLoader({
    id: "google-map-script",
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
    libraries: ["places"], // Only need places if used elsewhere
  });

  const fetchVendorLocation = async () => {
    console.log("fetchVendorLocation Called for bookingId:", bookingId);
    try {
      setIsLoading(true);
      setError(null);
      const response = await fetch(
        `https://quickserve.info/api/v1/customers/data/getVendorLocationTracking/${bookingId}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${userToken}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const result = await response.json();
      console.log("Vendor Location API Response:", result);

      if (result?.data?.latitude && result?.data?.longitude) {
        const newPos = {
          lat: Number(result.data.latitude),
          lng: Number(result.data.longitude),
        };
        setDriverPosition(newPos);
        console.log("Driver position updated to:", newPos);

        // Calculate route, ETA, and distance
        if (window.google && isLoaded) {
          const directionsService = new window.google.maps.DirectionsService();
          directionsService.route(
            {
              origin: newPos,
              destination: customerLocation,
              travelMode: window.google.maps.TravelMode.DRIVING,
            },
            (result, status) => {
              console.log("Directions API Status:", status);
              console.log("Directions API Result:", result);
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
        console.warn("Vendor Location API: No valid coordinates found in response");
        setError("Vendor location not available. Please try again later.");
      }
    } catch (error) {
      console.error("Error fetching vendor location:", error.message);
      setError("Failed to fetch vendor location. Please check your connection or try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // Poll vendor location every 5 seconds
  useEffect(() => {
    if (!isLoaded || !bookingId || !userToken) {
      console.log("fetchVendorLocation skipped: isLoaded, bookingId, userToken:", {
        isLoaded,
        bookingId,
        userToken,
      });
      setError("Missing required parameters. Please ensure you are logged in and a booking is selected.");
      setIsLoading(false);
      return;
    }

    fetchVendorLocation(); // Initial fetch
    const intervalId = setInterval(fetchVendorLocation, 15000);

    return () => clearInterval(intervalId);
  }, [isLoaded, bookingId, userToken]);

  if (loadError) {
    return (
      <div className="text-red-500 text-sm sm:text-base p-4">
        Failed to load map. Please check your internet connection or try again later.
      </div>
    );
  }

  if (!isLoaded || isLoading) {
    return (
      <div className="text-gray-500 text-sm sm:text-base p-4">
        Loading map...
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
          <span>Vendor is on the way!</span>
          <span>Arriving in {ETA}</span>
        </div>
      </div>
    </ErrorBoundary>
  );
};

export default LiveMap;