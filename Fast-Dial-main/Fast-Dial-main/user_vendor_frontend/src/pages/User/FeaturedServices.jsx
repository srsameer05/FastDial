 import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getServiceCategoriesRequest, loginSuccess } from '../../saga/features/customer/customerSlice';
import {
  FaHeart,
  FaArrowLeft,
  FaUserShield,
  FaStar,
  FaShoppingCart,
} from 'react-icons/fa';
import CarWash from '../../assets/Carwash.png';
import Electrical from '../../assets/Electrical.png';
import Laundrydry from '../../assets/Laundrydry.png';
import Gardening from '../../assets/Gardening.png';
import HouseClean from '../../assets/HouseClean.png';
import Mechanic from '../../assets/Mechanic.png';
import PlumbingService from '../../assets/PlumbingService.png';
import fastdia from "../../assets/Quick Serve 5.png";
import { useNavigate } from 'react-router-dom';
import Header from './Header';
import Footer from './Footer';
import image from "../../assets/image.png";

const categoryColors = {
  Gardening: 'bg-green-500',
  Cleaning: 'bg-blue-500',
  Mechanic: 'bg-yellow-500',
  Laundry: 'bg-pink-500',
  'Pest Control': 'bg-indigo-500',
  Electrical: 'bg-orange-500',
  Plumbing: 'bg-teal-500',
};

const services = [
  {
    id: 1,
    name: 'Gardening Service',
    image: Gardening,
    category: 'Gardening',
    provider: 'Adam & Co',
    rating: 4.8,
    price: 110,
  },
  {
    id: 2,
    name: 'Deep House Clean',
    image: HouseClean,
    category: 'Cleaning',
    provider: 'Adam & Co',
    rating: 4.8,
    price: 110,
  },
  {
    id: 3,
    name: 'Car Mechanic Service',
    image: Mechanic,
    category: 'Mechanic',
    provider: 'Adam & Co',
    rating: 4.8,
    price: 110,
  },
  {
    id: 4,
    name: 'Car Wash Service',
    image: CarWash,
    category: 'Cleaning',
    provider: 'Adam & Co',
    rating: 4.8,
    price: 110,
  },
  {
    id: 5,
    name: 'Electrical Technician',
    image: Electrical,
    category: 'Electrical',
    provider: 'Adam & Co',
    rating: 4.8,
    price: 110,
  },
  {
    id: 6,
    name: 'Laundry & dry clean',
    image: Laundrydry,
    category: 'Laundry',
    provider: 'Adam & Co',
    rating: 4.8,
    price: 110,
  },
  {
    id: 7,
    name: 'Plumbing Service',
    image: PlumbingService,
    category: 'Plumbing',
    provider: 'Adam & Co',
    rating: 4.8,
    price: 110,
  },
];

const FeaturedServices = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { serviceCategories, isAuthenticated, categoriesError } = useSelector((state) => state.customer);

  useEffect(() => {
    const token = localStorage.getItem('token');
    console.log('FeaturedServices: Token from localStorage:', token);
    console.log('FeaturedServices: isAuthenticated:', isAuthenticated);

    if (token && !isAuthenticated) {
      console.log('FeaturedServices: Restoring authentication from token');
      dispatch(loginSuccess({ token, user: null }));
    }
    console.log('FeaturedServices: Dispatching getServiceCategoriesRequest');
    dispatch(getServiceCategoriesRequest());
  }, [dispatch]);

  useEffect(() => {
    console.log('FeaturedServices: serviceCategories:', serviceCategories);
    if (categoriesError) {
      console.error('FeaturedServices: Categories Error:', categoriesError);
    }
  }, [serviceCategories, categoriesError]);

  const handleImageError = (e) => {
    console.log(`FeaturedServices: Image failed to load: ${e.target.src}`);
    e.target.src = image;
  };

  return (
    <>
      <style>
        {`
          .services-container {
            min-height: calc(100vh - 120px); /* Adjust for header and footer */
            -webkit-overflow-scrolling: touch;
          }
          .service-card {
            transition: transform 0.2s ease, box-shadow 0.2s ease;
          }
          .service-card:hover {
            transform: translateY(-4px);
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
          }
          @media (max-width: 640px) {
            .services-grid {
              grid-template-columns: 1fr;
            }
            .sidebar {
              width: 100%;
              margin-top: 1rem;
            }
          }
          @media (min-width: 641px) and (max-width: 1024px) {
            .services-grid {
              grid-template-columns: 2fr 1fr;
            }
          }
        `}
      </style>
      <div className="min-h-screen bg-gray-100">
        <Header />
        <div className="w-full max-w-[95%] mx-auto p-4 sm:p-6 services-container">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 services-grid">
            <div className="col-span-1 sm:col-span-2 space-y-4">
              <div className="flex items-center gap-2 sm:gap-3 mt-2 sm:mt-4 ml-2">
                <button
                  onClick={() => navigate(-1)}
                  className="text-gray-700 hover:text-black p-2 rounded-full"
                  aria-label="Go back"
                >
                  <FaArrowLeft className="text-lg sm:text-xl" />
                </button>
                <h2 className="text-xl sm:text-2xl font-bold">Featured Services</h2>
              </div>

              {serviceCategories.length > 0 ? (
                serviceCategories.map((service, index) => (
                  <div
                    key={service.service_id || index}
                    className="service-card bg-white p-3 sm:p-4 rounded-lg shadow-md relative flex flex-col sm:flex-row gap-3 sm:gap-4 items-center cursor-pointer"
                    onClick={() => navigate("/AddressForm", { state: { service_id: service.service_id, bookingType: 'now' } })}
                  >
                    <img
                      src={service.service_image_url || image}
                      alt={service.service_name}
                      className="w-24 sm:w-32 h-24 sm:h-32 object-cover rounded-lg"
                      onError={handleImageError}
                    />
                    <div className="flex-1">
                      <span
                        className={`px-2 sm:px-3 py-1 text-xs sm:text-sm rounded-full text-white text-center ${
                          categoryColors[service.service_name] || 'bg-blue-500'
                        }`}
                      >
                        {service.service_name}
                      </span>
                      <h3 className="text-base sm:text-lg font-semibold mt-2">{service.service_name}</h3>
                      <p className="text-gray-600 text-xs sm:text-sm mt-1">
                        {service.service_description || "No Description"}
                      </p>
                      <p className="text-orange-600 font-bold mt-1 text-sm sm:text-base">
                        ₹{service.service_price}
                      </p>
                    </div>
                    <FaHeart className="absolute top-3 sm:top-4 right-3 sm:right-4 text-gray-400 cursor-pointer hover:text-red-500 text-base sm:text-lg" />
                  </div>
                ))
              ) : (
                services.map((service) => (
                  <div
                    key={service.id}
                    className="service-card bg-white p-3 sm:p-4 rounded-lg shadow-md relative flex flex-col sm:flex-row gap-3 sm:gap-4 items-center cursor-pointer"
                    onClick={() => navigate('/ServiceList', { state: { service_id: service.id } })}
                  >
                    <img
                      src={service.image || image}
                      alt={service.name}
                      className="w-24 sm:w-32 h-24 sm:h-32 object-cover rounded-lg"
                      onError={handleImageError}
                    />
                    <div className="flex-1">
                      <span
                        className={`px-2 sm:px-3 py-1 text-xs sm:text-sm rounded-full text-white text-center ${
                          categoryColors[service.category]
                        }`}
                      >
                        credence {service.category}
                      </span>
                      <h3 className="text-base sm:text-lg font-semibold mt-2">{service.name}</h3>
                      <p className="text-gray-600 flex items-center gap-2 mt-1 text-xs sm:text-sm">
                        <FaUserShield className="text-gray-500" /> {service.provider}
                      </p>
                      <p className="text-gray-600 flex items-center gap-2 text-xs sm:text-sm">
                        <FaStar className="text-yellow-500" /> {service.rating}
                      </p>
                      <p className="text-orange-600 font-bold mt-1 text-sm sm:text-base">
                        ₹{service.price} / Per hour
                      </p>
                    </div>
                    <FaHeart className="absolute top-3 sm:top-4 right-3 sm:right-4 text-gray-400 cursor-pointer hover:text-red-500 text-base sm:text-lg" />
                  </div>
                ))
              )}
            </div>

            <div className="sidebar space-y-4 sm:mt-20">
              {/* Commented out cart section as per original code */}
              {/* <div className="bg-white p-4 sm:p-6 rounded-lg shadow-md flex flex-col items-center">
                <FaShoppingCart className="text-gray-400 text-3xl sm:text-4xl mb-6 sm:mb-10" />
                <p className="text-gray-600 text-sm sm:text-base">No items in your cart</p>
              </div> */}

              <div className="bg-white p-4 sm:p-6 rounded-lg shadow-md">
                <div className="flex items-center space-x-1">
                  <img src={fastdia} alt="Logo" className="h-10 sm:h-12" />
                </div>
                <ul className="mt-2 text-gray-600 space-y-1 sm:space-y-2 list-disc list-inside text-xs sm:text-sm">
                  <li>Quality Assured</li>
                  <li>Verified Professional</li>
                  <li>Transparent Pricing</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    </>
  );
};

export default FeaturedServices;