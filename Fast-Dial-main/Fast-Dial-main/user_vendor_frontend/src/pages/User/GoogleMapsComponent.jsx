import { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { GoogleMap, LoadScript, Marker } from "@react-google-maps/api";
import { useLocation, useNavigate } from "react-router-dom";
import Header from "./Header";
import Footer from "./Footer";
import image from "../../assets/image.png";
import { getServiceCategoriesRequest } from "../../saga/features/customer/customerSlice";
import { getVendorsRequest } from "../../saga/features/customer/customerSlice";


const containerStyle = {
  width: "100%",
  height: "400px",
};



const darkTheme = [
  { elementType: "geometry", stylers: [{ color: "#212121" }] },
  { elementType: "labels.icon", stylers: [{ visibility: "off" }] },
  { elementType: "labels.text.fill", stylers: [{ color: "#757575" }] },
  { elementType: "labels.text.stroke", stylers: [{ color: "#212121" }] },
  {
    featureType: "road",
    elementType: "geometry",
    stylers: [{ color: "#383838" }],
  },
];

const GoogleMapsComponent = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const navigationState = useLocation()
  const { locationDetails } = navigationState.state || {};
  const MapKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY
  const { vendors, vendorsError, vendorsLoading, serviceCategories, categoriesLoading, categoriesError } = useSelector(
    (state) => state.customer
  );

  const [center, setCenter] = useState({
    lat: 37.8044,
    lng: -122.2711,
  })


  useEffect(() => {
    console.log("GoogleMapsComponent: Dispatching getVendorsRequest");
    dispatch(getVendorsRequest());
    console.log("GoogleMapsComponent", locationDetails)
  }, [dispatch]);

  useEffect(() => {
    if (locationDetails) {
      const fetchCoords = async () => {
        try {
          const coords = await getCoordinates(locationDetails);
          setCenter({ ...coords })
        } catch (err) {
          console.error(err);
        }
      };
      fetchCoords();
    }

  }, []);

  const getCoordinates = async (address) => {
    const response = await fetch(
      `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(
        address
      )}&key=${MapKey}`
    );
    const data = await response.json();
    if (data.status === "OK") {
      const { lat, lng } = data.results[0].geometry.location;
      return { lat, lng };
    } else {
      throw new Error("Geocoding failed: " + data.status);
    }
  };

  const handleImageError = (e) => {
    console.log(`Image failed to load: ${e.target.src}`);
    e.target.src = image; // Fallback to default image
  };
  const MapsApiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY

  return (
    <div>
      <div className="flex flex-col items-center">
        <Header />
        <div className="w-[95%] mt-5">
          <button
            className="mb-4 text-gray-600 font-bold"
            onClick={() => navigate(-1)}
          >
            ⬅ Back
          </button>

          <LoadScript googleMapsApiKey={MapsApiKey}>
            <GoogleMap
              mapContainerStyle={containerStyle}
              center={center}
              zoom={12}
              options={{ styles: darkTheme }}
            >
              <Marker position={center} />
            </GoogleMap>
          </LoadScript>

          <div className="mt-8">
            <div
              className="flex justify-between items-center cursor-pointer"
              onClick={() => navigate("/ServiceList")} // Updated to navigate to ServiceList
            >
              <h2 className="text-xl font-bold">Nearby Service</h2>
            </div>
            <div
              className="flex overflow-x-auto space-x-6 mt-4 pb-2 scrollbar-hidden"
              style={{ msOverflowStyle: "none", scrollbarWidth: "none" }}
            >
              {vendorsLoading ? (
                <div>Loading...</div>
              ) : vendorsError ? (
                <div>Error loading services: {vendorsError}</div>
              ) : vendors.length > 0 ? (
                vendors.map((service, index) => {
                  if (service?.vendor_address?.city === locationDetails) {

                    return (
                      <div
                        key={index}
                        className="border p-4 rounded-md flex-shrink-0 w-64"
                      >
                        <img
                          src={service.image_url[0] || service.image_url[1] || image}
                          alt={service.service_name || "Service"}
                          className="w-full mt-5 h-40 object-cover rounded-md block"
                          onError={handleImageError}
                          onClick={() => navigate("/AddressForm", { state: { service_id: service.service_id, bookingType: 'now' } })}
                        />
                        <h3 className="text-lg mt-5 font-semibold mt-2 truncate whitespace-nowrap overflow-hidden">{service.name_of_bussiness}</h3>
                        <h4>{service.vendor_name.toUpperCase()}</h4>
                        <button
                          className="w-full bg-blue-500 text-white font-semibold py-2 rounded-md mt-2"
                          onClick={() => navigate("/AddressForm", { state: { service_id: service.service_id, bookingType: 'now' } })}
                        >
                          ₹{service.service_price || "Contact for Price"}
                        </button>
                      </div>
                    )
                  }
                }
                )
              ) : (
                <div>No services available</div>
              )}
            </div>
          </div>
        </div>
      </div>
      <div className="pt-10">
        <Footer />
      </div>
    </div>
  );
};

export default GoogleMapsComponent;