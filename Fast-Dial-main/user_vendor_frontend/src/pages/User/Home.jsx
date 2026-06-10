 import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { getSliderImagesRequest, getServiceCategoriesRequest, getService_CategoriesRequest, getServicesRequest, getCustomerDataRequest, getComplaintsRequest } from "../../saga/features/customer/customerSlice";
import Cleaning from "../../assets/Cleaning.png";
import Painting from "../../assets/Painting.png";
import Electric from "../../assets/Electric.png";
import Plumbing from "../../assets/Plumbing.png";
import plumbingimg from "../../assets/Plumbingimg.png";
import Shipping from "../../assets/Shipping.png";
import Taxi from "../../assets/Taxi.png";
import DrivingSchool from "../../assets/DrivingSchool.png";
import Header from "./Header";
import image from "../../assets/image.png";
import Laundry from "../../assets/Laundry.png";
import Electr from "../../assets/Electr.png";
import Pest from "../../assets/Pest.png";
import Footer from "./Footer";
import MagnifyingGlass from "../../assets/MagnifyingGlass.png";
import Byke from "../../assets/Byke.png";
import Carpenter from "../../assets/carpenter.png";
import Gardening from "../../assets/Gardening.png";
import HouseClean from "../../assets/HouseClean.png";
import Mechanic from "../../assets/Mechanic.png";
import CarWash from "../../assets/Carwash.png";
import MapPin from "../../assets/MapPin.png";
import { getVendorsRequest } from "../../saga/features/customer/customerSlice";
import { jwtDecode } from 'jwt-decode';
import LocationDropDownMenuComponent from "./LocationDropDownMenuComponent";

const categories = [
  { name: "Cleaning", icon: Cleaning, color: "text-blue-500", isImage: true },
  { name: "Painting", icon: Painting, color: "text-red-500", isImage: true },
  { name: "Electric", icon: Electric, color: "text-yellow-500", isImage: true },
  { name: "Plumbing", icon: plumbingimg, color: "text-red-600", isImage: true },
  { name: "Taxi", icon: Taxi, color: "text-green-500", isImage: true },
  { name: "Driving School", icon: DrivingSchool, color: "text-pink-500", isImage: true },
  { name: "Shipping", icon: Shipping, color: "text-sky-500", isImage: true },
  { name: "Byke Rental", icon: Byke, color: "text-yellow-500", isImage: true },
  { name: "Carpenter", icon: Carpenter, color: "text-red-500", isImage: true },
];

const HomeServices = [
  { name: "Pest Control", image: Pest },
  { name: "Electrician", image: Electr },
  { name: "Plumbing", image: Plumbing },
  { name: "Laundry", image: Laundry },
];

const services = [
  {
    id: 1,
    name: "Gardening Service",
    image: Gardening,
    category: "Gardening",
    provider: "Adam & Co",
    rating: 4.8,
    price: 110,
  },
  {
    id: 2,
    name: "Deep House Clean",
    image: HouseClean,
    category: "Cleaning",
    provider: "Adam & Co",
    rating: 4.8,
    price: 110,
  },
  {
    id: 3,
    name: "Car Mechanic Service",
    image: Mechanic,
    category: "Mechanic",
    provider: "Adam & Co",
    rating: 4.8,
    price: 110,
  },
  {
    id: 4,
    name: "Car Wash Service",
    image: CarWash,
    category: "Cleaning",
    provider: "Adam & Co",
    rating: 4.8,
    price: 110,
  },
];

const Home = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const {
    sliderImages, sliderLoading, sliderError,
    serviceCategories, categoriesLoading, categoriesError, servicecategoriesLoading, serviceCategoriesget, servicecategoriesError,
    services: reduxServices, servicesLoading, servicesError, vendors, vendorsError, vendorsLoading, user, customerData, customerLoading
  } = useSelector((state) => state.customer);

  const [currentSlide, setCurrentSlide] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [locationQuery, setLocationQuery] = useState({ query: "" });
  const [filteredServices, setFilteredServices] = useState([]);
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [selectedServiceId, setSelectedServiceId] = useState(null);
  const [customerCurrentCity, setCustomerCurrentCity] = useState("");
  const [showWarning, setShowWarning] = useState(false);

  const searchRef = useRef(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    console.log("HomePage: Token from localStorage:", token);
    if (!token) {
      console.warn("HomePage: No token found, redirecting to login");
      navigate("/Home");
    } else {
      try {
        const decoded = token ? jwtDecode(token) : null;
        console.log("HomePage: Decoded token:", decoded);
        if (decoded?.customer_id || user?.customer_id) {
          console.log(
            "HomePage: Dispatching getCustomerDataRequest with customer_id:",
            decoded?.customer_id || user?.customer_id
          );
          dispatch(getCustomerDataRequest({ customer_id: decoded?.customer_id || user?.customer_id }));
          dispatch(getComplaintsRequest());
        } else {
          console.warn("HomePage: No customer_id found, redirecting to login");
          navigate("/Home");
          alert("Please Login");
        }
      } catch (error) {
        console.error("HomePage: Error decoding token:", error.message);
        navigate("/Home");
        alert("Please Login");
      }
    }
  }, [user]);

  useEffect(() => {
    console.log("city", customerData);
    if (!customerLoading && customerData !== null) {
      if (customerData.customer_address !== null) {
        console.log("Customer City loaded", customerData?.customer_address.city);
        setCustomerCurrentCity(customerData?.customer_address.city);
      }
    }
  }, [customerData, customerLoading]);

  useEffect(() => {
    console.log('Home: Dispatching getService_CategoriesRequest');
    dispatch(getService_CategoriesRequest());
    dispatch(getSliderImagesRequest());
    dispatch(getServiceCategoriesRequest());
    dispatch(getServicesRequest());
    dispatch(getVendorsRequest());
  }, [dispatch]);

  useEffect(() => {
    console.log('Home: serviceCategoriesget:', serviceCategoriesget);
    console.log('Home: servicecategoriesError:', servicecategoriesError);
    console.log('Home: servicecategoriesLoading:', servicecategoriesLoading);
  }, [serviceCategoriesget, servicecategoriesError, servicecategoriesLoading]);

  useEffect(() => {
    if (sliderImages.length > 0) {
      const interval = setInterval(() => {
        setCurrentSlide((prev) => (prev + 1) % sliderImages.length);
      }, 3000);
      return () => clearInterval(interval);
    }
  }, [sliderImages]);

  useEffect(() => {
    if (searchQuery.trim() === "") {
      setFilteredServices([]);
    } else {
      const query = searchQuery.toLowerCase();
      let serviceList;
      if (reduxServices.length > 0)
        serviceList = reduxServices;
      else
        serviceList = serviceCategories.map(item => item);
      const matches = serviceList.filter(
        (service) =>
          service.service_name?.toLowerCase().includes(query) ||
          service.service_description?.toLowerCase().includes(query)
      );
      setFilteredServices(matches);
    }
  }, [searchQuery, reduxServices]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setIsSearchFocused(false);
      }
    };

    if (isSearchFocused) {
      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("touchstart", handleClickOutside);
      return () => {
        document.removeEventListener("mousedown", handleClickOutside);
        document.removeEventListener("touchstart", handleClickOutside);
      };
    }
  }, [isSearchFocused]);

  const handleImageError = (e) => {
    console.log(`Image failed to load: ${e.target.src}`);
    e.target.src = image;
  };

  const handleServiceSelect = (serviceId) => {
    setSelectedServiceId(serviceId);
    setSearchQuery("");
    setFilteredServices([]);
    setIsSearchFocused(false);
    setShowWarning(false);
  };

  const handleClearSelection = () => {
    setSelectedServiceId(null);
    setShowWarning(false);
  };

  const handleBookNow = () => {
    if (selectedServiceId) {
      console.log('Home: Navigating to AddressForm with service_id:', selectedServiceId, 'bookingType: now');
      navigate("/AddressForm", { state: { service_id: selectedServiceId, bookingType: 'now' } });
    } else {
      setShowWarning(true);
    }
  };

  const handleBookLater = () => {
    if (selectedServiceId) {
      console.log('Home: Navigating to UserVendorList with service_id:', selectedServiceId, 'bookingType: later', locationQuery);
      navigate("/UserVendorList", { state: { service_id: selectedServiceId, bookingType: 'later', locationDetails: (locationQuery.query !== "" ? locationQuery.query : customerCurrentCity) } });
    } else {
      setShowWarning(true);
    }
  };

  const selectedService = selectedServiceId
    ? reduxServices.find((service) => service.service_id === selectedServiceId)
    : null;

  return (
    <div className="max-w-screen mx-auto">
      <Header />
      <div className="w-[90%] mx-auto px-4 sm:px-6">
        <div className="flex flex-col md:flex-row items-center mt-4 gap-4 md:gap-8">
          <div className="w-full md:w-[65%] rounded-lg p-2 sm:p-4">
            {sliderLoading ? (
              <div className="text-center">Loading...</div>
            ) : sliderError ? (
              <div className="text-center text-red-500">Error loading images</div>
            ) : sliderImages.length > 0 ? (
              <div className="relative w-full">
                <img
                  src={sliderImages[currentSlide].image_path}
                  alt={sliderImages[currentSlide].title || "Slider Image"}
                  className="w-full h-auto rounded-lg block"
                  onError={handleImageError}
                />
              </div>
            ) : (
              <img
                src={image}
                alt="Fallback"
                className="w-full h-auto rounded-lg block"
                onError={handleImageError}
              />
            )}
          </div>
          <div ref={searchRef} className="w-full md:w-[35%] flex flex-col justify-center relative">
            <div className="flex items-center border p-2 rounded-md mb-2">
              <img
                src={MagnifyingGlass}
                alt="Search Icon"
                className="h-5 w-5 sm:h-6 sm:w-6 mr-2 block"
                onError={handleImageError}
              />
              <input
                type="text"
                placeholder="Search for service"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => setIsSearchFocused(true)}
                className="w-full outline-none text-sm sm:text-base"
              />
            </div>
            {isSearchFocused && filteredServices.length > 0 && (
              <div className="absolute top-12 left-0 w-full bg-white border rounded-md shadow-md z-10 max-h-60 overflow-y-auto">
                {servicesLoading ? (
                  <div className="p-2 text-sm">Loading services...</div>
                ) : servicesError ? (
                  <div className="p-2 text-red-500 text-sm">{servicesError}</div>
                ) : filteredServices.map((service) => (
                  <div
                    key={service.service_id}
                    className="p-2 hover:bg-gray-100 cursor-pointer flex items-center"
                    onClick={() => handleServiceSelect(service.service_id)}
                  >
                    <img
                      src={service.service_image_url || image}
                      alt={service.service_name}
                      className="w-8 h-8 sm:w-10 sm:h-10 object-cover rounded-md mr-2"
                      onError={handleImageError}
                    />
                    <div>
                      <p className="font-semibold text-sm sm:text-base">{service.service_name}</p>
                      <p className="text-xs sm:text-sm text-gray-500">{service.service_description}</p>
                      <p className="text-xs sm:text-sm font-semibold">₹{service.service_price}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
            {isSearchFocused && filteredServices.length === 0 && !servicesLoading && (
              <div className="absolute top-12 left-0 w-full bg-white border rounded-md shadow-md z-10 p-2">
                <p className="text-sm">No services found</p>
              </div>
            )}
            {selectedService && (
              <div className="mt-2 p-3 sm:p-4 bg-gray-50 rounded-md flex items-center">
                <img
                  src={selectedService.service_image_url || image}
                  alt={selectedService.service_name}
                  className="w-12 h-12 sm:w-16 sm:h-16 object-cover rounded-md mr-3 sm:mr-4"
                  onError={handleImageError}
                />
                <div className="flex-1">
                  <p className="font-semibold text-sm sm:text-base">{selectedService.service_name}</p>
                  <p className="text-xs sm:text-sm text-gray-500">{selectedService.service_description}</p>
                  <p className="text-xs sm:text-sm font-semibold">₹{selectedService.service_price}</p>
                </div>
                <button
                  className="text-red-500 hover:text-red-700 text-sm"
                  onClick={handleClearSelection}
                >
                  Clear
                </button>
              </div>
            )}
            {showWarning && (
              <div className="mt-2 text-red-500 text-xs sm:text-sm">
                Please select a service
              </div>
            )}
            <div className="flex items-center border p-2 rounded-md mb-2">
              <img
                src={MapPin}
                alt="Location Icon"
                className="h-5 w-5 sm:h-6 sm:w-6 mr-2 block grayscale"
                onError={handleImageError}
              />
              <LocationDropDownMenuComponent placeholder="Search city (e.g. Bangalore)" setLocation={setLocationQuery} />
            </div>
            <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2 mt-4">
              <button
                className="bg-blue-500 text-white px-3 py-2 sm:px-4 sm:py-2 rounded-md hover:bg-blue-600 text-sm sm:text-base"
                onClick={handleBookNow}
              >
                Book Now
              </button>
              <button
                className="bg-green-500 text-white px-3 py-2 sm:px-4 sm:py-2 rounded-md hover:bg-green-600 text-sm sm:text-base"
                onClick={handleBookLater}
              >
                Book Later
              </button>
            </div>
          </div>
        </div>

        <div className="mt-6 sm:mt-8">
          <div className="flex justify-between items-center">
            <h2 className="text-lg sm:text-xl font-bold">Categories</h2>
            <button
              className="text-blue-500 font-medium hover:underline text-sm sm:text-base"
              onClick={() => navigate("/Categories")}
            >
              See all
            </button>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-9 gap-2 sm:gap-4 mt-4">
            {servicecategoriesLoading ? (
              <div className="text-center">Loading...</div>
            ) : servicecategoriesError ? (
              <div className="text-center text-red-500 text-sm">{servicecategoriesError}</div>
            ) : serviceCategoriesget.length > 0 ? (
              serviceCategoriesget.map((category) => (
                <div
                  key={category.service_cat_id}
                  className="flex flex-col items-center cursor-pointer"
                  onClick={() =>
                    navigate("/Categories", { state: { service_cat_id: category.service_cat_id } })
                  }
                >
                  <div className="p-2">
                    <div className="w-16 h-16 sm:w-20 sm:h-20 flex items-center justify-center">
                      {category.service_category_url ? (
                        <img
                          src={category.service_category_url}
                          alt={category.service_category_name}
                          className="w-full h-full object-cover rounded-md"
                          onError={handleImageError}
                        />
                      ) : (
                        <span className="text-lg font-semibold text-gray-600">
                          {category.service_category_name[0]}
                        </span>
                      )}
                    </div>
                  </div>
                  <span className="text-xs sm:text-sm mt-1 sm:mt-2 font-semibold text-blue-500 text-center">
                    {category.service_category_name}
                  </span>
                </div>
              ))
            ) : (
              <div className="text-center text-sm">No categories available</div>
            )}
          </div>
        </div>

        <div className="mt-6 sm:mt-8">
          <div
            className="flex justify-between items-center cursor-pointer"
            onClick={() => navigate("/FeaturedServices")}
          >
            <h2 className="text-lg sm:text-xl font-bold">Featured Services</h2>
            <button className="text-blue-500 font-medium hover:underline text-sm sm:text-base">See all</button>
          </div>
          <div
            className="flex overflow-x-auto space-x-4 sm:space-x-6 mt-4 pb-2 scrollbar-hidden"
            style={{ msOverflowStyle: "none", scrollbarWidth: "none" }}
          >
            {categoriesLoading ? (
              <div className="text-center">Loading...</div>
            ) : categoriesError ? (
              <div className="text-center text-red-500 text-sm">Error loading services</div>
            ) : serviceCategories.length > 0 ? (
              serviceCategories.map((service, index) => (
                <div key={index} className="border p-3 sm:p-4 rounded-md flex-shrink-0 w-48 sm:w-64">
                  <img
                    src={service.service_image_url || image}
                    alt={service.title}
                    className="w-full h-32 sm:h-40 object-cover rounded-md block"
                    onError={handleImageError}
                    onClick={() => navigate("/AddressForm", { state: { service_id: service.service_id, bookingType: 'now' } })}
                  />
                  <h3 className="text-base sm:text-lg font-semibold mt-2 sm:mt-3 truncate">{service.service_name}</h3>
                  <button
                    className="w-full bg-blue-500 text-white font-semibold py-2 rounded-md mt-2 text-sm sm:text-base"
                    onClick={() => navigate("/AddressForm", { state: { service_id: service.service_id, bookingType: 'now' } })}
                  >
                    ₹{service.service_price || "Contact for Price"}
                  </button>
                </div>
              ))
            ) : (
              <div className="text-center text-sm">No services available</div>
            )}
          </div>
        </div>

        <div className="mt-6 sm:mt-8">
          <h2 className="text-lg sm:text-xl font-bold mb-4">Popular Services</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {HomeServices.map((service, index) => (
              <div
                key={index}
                className="relative w-full h-48 sm:h-60 md:h-70"
                onClick={() =>
                  navigate("/AddressForm", {
                    state: { service_id: index + 1, bookingType: 'now' },
                  })
                }
              >
                <img
                  src={service.image}
                  alt={service.name}
                  className="w-full h-full object-cover rounded-md block"
                  onError={handleImageError}
                />
                <div className="absolute bottom-0 w-full bg-black bg-opacity-50 text-white text-center py-2 rounded-b-md">
                  <span className="text-sm sm:text-base">{service.name}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {customerCurrentCity && (
          <div className="mt-6 sm:mt-8">
            <div
              className="flex justify-between items-center cursor-pointer"
              onClick={() => navigate("/GoogleMapsComponent", {
                state: { locationDetails: customerCurrentCity }
              })}
            >
              <h2 className="text-lg sm:text-xl font-bold">Nearby Service</h2>
              <button className="text-blue-500 font-medium hover:underline text-sm sm:text-base">See all</button>
            </div>
            <div
              className="flex overflow-x-auto space-x-4 sm:space-x-6 mt-4 pb-2 scrollbar-hidden"
              style={{ msOverflowStyle: "none", scrollbarWidth: "none" }}
            >
              {vendorsLoading ? (
                <div className="text-center">Loading...</div>
              ) : vendorsError ? (
                <div className="text-center text-red-500 text-sm">Error loading services</div>
              ) : vendors.length > 0 ? (
                vendors.map((service, index) => {
                  if (service?.vendor_address?.city.toLowerCase() === customerCurrentCity.toLowerCase()) {
                    return (
                      <div key={index} className="border p-3 sm:p-4 rounded-md flex-shrink-0 w-48 sm:w-64">
                        <img
                          src={service.image_url[0] || service.image_url[1] || image}
                          alt={service.title}
                          className="w-full h-32 sm:h-40 object-cover rounded-md block"
                          onError={handleImageError}
                          onClick={() => navigate("/AddressForm", { state: { service_id: service.service_id, bookingType: 'now' } })}
                        />
                        <h3 className="text-base sm:text-lg font-semibold mt-2 sm:mt-3 truncate">{service.name_of_bussiness}</h3>
                        <h4 className="text-sm sm:text-base">{service.vendor_name.toUpperCase()}</h4>
                        <button
                          className="w-full bg-blue-500 text-white font-semibold py-2 rounded-md mt-2 text-sm sm:text-base"
                          onClick={() => navigate("/AddressForm")}
                        >
                          ₹{service.service_price || "Contact for Price"}
                        </button>
                      </div>
                    );
                  }
                  return null;
                })
              ) : (
                <div className="text-center text-sm">No services available</div>
              )}
            </div>
          </div>
        )}
      </div>
      <div className="pt-8 sm:pt-10">
        <Footer />
      </div>
    </div>
  );
};

export default Home;