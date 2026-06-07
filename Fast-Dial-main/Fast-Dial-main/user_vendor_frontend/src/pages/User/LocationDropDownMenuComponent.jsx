import React, { useRef } from 'react'
import { useJsApiLoader, StandaloneSearchBox } from '@react-google-maps/api'


const LocationDropDownMenuComponent = ({ placeholder, styles, setLocation }) => {
    const MapKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY
    const inputRef = useRef(null)
    //api library to search place
    const libraries = ["places"]

    const { isLoaded } = useJsApiLoader({
        id: 'google-map-script',
        googleMapsApiKey: MapKey,
        libraries
    })
    console.log("LocationDropDownMenuComponent:", isLoaded)

    const extractAddressFields = (addressComponent) => {
        const extractedAddress = {
            street: "",
            city: "",
            state: "",
            zip: ""
        }

        addressComponent.map(addressItem => {
            if (addressItem.types.includes("locality")) {
                if (addressItem.long_name.toLowerCase() === "bengaluru")
                    extractedAddress.city = "Bangalore"
                else
                    extractedAddress.city = addressItem.long_name;
            }
            if (addressItem.types.includes("administrative_area_level_1"))
                extractedAddress.state = addressItem.long_name;
            if (addressItem.types.includes("postal_code"))
                extractedAddress.zip = addressItem.long_name;
            if (extractedAddress.street === "" && ["sublocality_level_1", "sublocality_level_2", "premise"].some(type =>
                addressItem.types.includes(type)
            ))
                extractedAddress.street = addressItem.long_name;
        })
        return extractedAddress
    }

    const handlePlacesChanged = () => {
        const address = inputRef.current.getPlaces();
        console.log("address", address)
        const { street, city, state, zip } = extractAddressFields(address[0].address_components)
        setLocation(prev => {
            if (Object.keys(prev).includes("query")) {
                return { query: city ? city : state }
            }
            else {
                const updated = {
                    ...prev,
                    customer_country: "India",
                    customer_address: {
                        ...prev.customer_address,
                        street, city, state, zip
                    }
                }
                console.log(updated)
                return updated
            }
        })

    }
    return (
        <div className="flex-1">
            {/* StandaloneSearchBox provides autocomplete searchbox component  */}
            {isLoaded && <StandaloneSearchBox
                onLoad={ref => inputRef.current = ref}
                onPlacesChanged={handlePlacesChanged}
                className="w-full outline-none"
            >
                <input
                    type="text"
                    placeholder={placeholder}
                    className={styles ? styles : "w-full outline-none"}
                />
            </StandaloneSearchBox>}
        </div>

    )
}

export default LocationDropDownMenuComponent