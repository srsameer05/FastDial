import { useNavigate } from "react-router-dom";
import MapPin from "../../../assets/MapPin.png";
import { APIProvider, Map, Marker } from '@vis.gl/react-google-maps';
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { registerCustomerRequest } from "../../../saga/features/customer/customerSlice";
import { getVendorsRequest } from "../../../saga/features/customer/customerSlice";


const AutomaticLocationModal = ({ isOpen, onClose, onOpenManualLocationModal, formData, setFormData }) => {
    // const navigate = useNavigate();
    const dispatch = useDispatch();
    const {
        registeredCustomerId, registerError, registerLoading
    } = useSelector((state) => state.customer);
    const [openMapScreen, setOpenMapScreen] = useState(false)
    const [locationCoordinate, setLocationCoordinate] = useState({ lat: null, lng: null })
    const [locationList, setLocationList] = useState([])
    const MapKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY

    const toggleMapScreen = async () => {
        setOpenMapScreen(prev => !prev)
        const { latitude, longitude } = await handleLocationAcess()
        getLocationList(latitude, longitude)

    };


    useEffect(() => {
        dispatch(getVendorsRequest());
    }, [dispatch])
    useEffect(() => {
        if (formData?.customer_address?.street &&
            formData?.customer_address?.city &&
            formData?.customer_address?.state)
            handleComplete()
        if (registeredCustomerId) {
            onClose();
            // Force reload before navigating
            window.location.href = "/home";
        }
    }, [formData, registeredCustomerId])

    async function getLocationList(latitude, longitude) {
        try {
            const response = await fetch(`https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=${MapKey}`)
            const res = await response.json()
            console.log(res.results)
            const list = res.results.map(item => {
                let subLocaliy = false
                const addressItem = item.address_components.filter(address => {
                    if (address.types.includes("sublocality")) {
                        if (!subLocaliy) {
                            subLocaliy = true;
                            return true;
                        }
                        else
                            return false

                    }
                    //.some returns true if any condition matches
                    const matchedItem = address.types.some(type => ["locality", "administrative_area_level_1", "postal_code"].includes(type))
                    return matchedItem
                })
                const locationNames = addressItem.map(component => component.long_name);
                return locationNames
            })
            setLocationList(list)

        }
        catch (err) {
            console.log("error in toggleMapscreen", err)
        }
    }

    const handleComplete = () => {
        dispatch(registerCustomerRequest(formData));
        console.log("AutomaticLocationModal: Dispatching registerCustomerRequest")

        // Alternatively, you can use: 
        // navigate("/home");
        // window.location.reload();
    };


    const handleMapClick = (e) => {
        const newLat = e.detail.latLng.lat;
        const newLng = e.detail.latLng.lng
        setLocationCoordinate({ lat: newLat, lng: newLng })
        getLocationList(newLat, newLng)
    }

    const locationItemClicked = (index) => {
        const selectedLocation = locationList?.[index];
        if (!selectedLocation || selectedLocation.length === 0) {
            return;
        }

        setFormData(prev => {
            const safePrev = prev || {};
            const safeAddress = safePrev.customer_address || {};
            const updated = {
                ...safePrev,
                customer_country: "India",
                customer_address: {
                    ...safeAddress,
                    street: selectedLocation[0] || "",
                    city: selectedLocation[1] || "",
                    state: selectedLocation[2] || "",
                    zip: selectedLocation.length > 3 ? selectedLocation[3] : "",
                }
            };

            console.log(updated);
            return updated;
        });
    }


    const handleManualLocation = () => {
        onClose();
        onOpenManualLocationModal()
    }

    //fetching current user Location
    const handleLocationAcess = () => {
        return new Promise((resolve, reject) => {

            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const { latitude, longitude } = position.coords;

                    setLocationCoordinate({ lat: latitude, lng: longitude })
                    resolve({ latitude, longitude });
                },
                (error) => {
                    console.error(" error fetching Location:", error);
                    reject(error)
                }
            );
        })
    }

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
            <div className="bg-white rounded-lg shadow-lg max-w-md w-full p-8 flex flex-col gap-5 relative">
                {/* Close button */}
                <button
                    className="absolute top-2 right-2 text-gray-600 hover:text-gray-800 text-xl"
                    onClick={onClose}
                >
                    ×
                </button>

                {/* Wrapper for using Google Map component here */}
                <APIProvider apiKey={MapKey}>
                    <div className="w-full transition duration-300">
                        {openMapScreen && locationCoordinate.lat && locationCoordinate.lng ?
                            <Map
                                style={{ width: '100%', height: '250px', margin: "auto" }}
                                defaultCenter={locationCoordinate}
                                defaultZoom={13}
                                gestureHandling="greedy"
                                disableDefaultUI={true}
                                onClick={handleMapClick}
                            >
                                <Marker position={locationCoordinate} />
                            </Map> : <div
                                className="w-[200px] h-[200px] p-2 border border-gray-300 rounded-[50%] m-auto flex items-center justify-center bg-[#C6DAFC] focus:outline-none focus:ring-2 focus:ring-[#4285F4] relative"
                            >

                                <img src={MapPin} alt="Location Icon" className="w-[70px] h-[70px]" />
                            </div>}
                    </div>
                </APIProvider>
                {openMapScreen ? <>
                    <p className="text-sm font-semibold">Confirm your Location:</p>
                    <div className="relative flex flex-col rounded-lg bg-white shadow-sm border-2 border-slate-200">

                        {
                            locationList.map((item, i) => {
                                if (i < 3) {
                                    return (
                                        <button
                                            key={`${item.join(",")}-${i}`}
                                            type="button"
                                            onClick={() => locationItemClicked(i)}
                                            className="text-left text-slate-800 border border-black flex w-full items-center rounded-md p-3 transition-all hover:bg-slate-200 focus:bg-slate-200 active:bg-blue-100"
                                        >
                                            {item.join(", ")}
                                        </button>
                                    )
                                }
                            })
                        }
                    </div>
                </>
                    :
                    <>
                        <div className="flex flex-col items-center h-16 justify-between mb-2">
                            <div className="text-xl font-bold text-gray-900 text-center ">
                                What is your Location?
                            </div>
                            <div className="text-sm text-[#9E9E9E]">To find near by service providers.</div>
                        </div>
                        <button
                            // onClick={handleSubmit}
                            className="w-full bg-[#4285F4] text-white py-3 rounded-[30px] text-lg font-thin hover:bg-blue-600 transition duration-300 flex items-center justify-center disabled:bg-gray-400 mb-4"
                            onClick={toggleMapScreen}

                        >
                            Allow Location Access
                        </button>
                    </>}

                <div className="font-semibold text-center text-[16px] hover:text-blue-500 transition duration-300 cursor-pointer " onClick={handleManualLocation}>
                    Enter Location Manually
                </div>



            </div>
        </div>
    );
};

export default AutomaticLocationModal;