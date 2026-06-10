import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getServiceCategoriesRequest, loginSuccess } from '../../../saga/features/customer/customerSlice';
import {
  FaHeart,
  FaArrowLeft,
  FaUserShield,
  FaStar,
  FaShoppingCart,
} from 'react-icons/fa';
import CarWash from '../../../assets/Carwash.png';
import Electrical from '../../../assets/Electrical.png';
import Laundrydry from '../../../assets/Laundrydry.png';
import Gardening from '../../../assets/Gardening.png';
import HouseClean from '../../../assets/HouseClean.png';
import Mechanic from '../../../assets/Mechanic.png';
import PlumbingService from '../../../assets/PlumbingService.png';
import fastdia from "../../../assets/Quick Serve 5.png";
import { useNavigate } from 'react-router-dom';
import image from "../../../assets/image.png";
import Footer from '../Footer';

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
    console.log('Token from localStorage:', token);
    console.log('isAuthenticated:', isAuthenticated);

    if (token && !isAuthenticated) {
      console.log('Restoring authentication from token');
      dispatch(loginSuccess({ token, user: null }));
    }
    console.log('Dispatching getServiceCategoriesRequest');
    dispatch(getServiceCategoriesRequest());
  }, [dispatch]);

  useEffect(() => {
    console.log('serviceCategories:', serviceCategories);
    if (categoriesError) {
      console.error('Categories Error:', categoriesError);
    }
  }, [serviceCategories, categoriesError]);

  const handleImageError = (e) => {
    console.log(`Image failed to load: ${e.target.src}`);
    e.target.src = image;
  };

  return (
    <div className="max-w-screen mx-auto">

      <div className="max-w-7xl mx-auto p-4 grid grid-cols-3 gap-6">
        <div className="col-span-2 space-y-4">
          <div className="flex items-center gap-3 mt-4 ml-2">
            <button
              onClick={() => navigate(-1)}
              className="text-gray-700 hover:text-black"
            >
              <FaArrowLeft className="text-xl" />
            </button>
            <h2 className="text-2xl font-bold">Services</h2>
          </div>

          {serviceCategories.length > 0 ? (
           serviceCategories.map((service, index) => (
            <div
              key={service.service_id || index}
              className="bg-white p-4 rounded-lg shadow-md relative flex gap-4 items-center cursor-pointer"
              onClick={() => navigate('/ServiceList', { state: { service_id: service.service_id } })}
            >
              <img
                src={service.service_image_url || image}
                alt={service.service_name}
                className="h-[30%] w-[30%] object-cover rounded-lg"
                onError={handleImageError}
              />
              <div className="flex-1">
                <span
                  className={`px-3 py-1 text-sm rounded-full text-white justify-center text-center ${
                    categoryColors[service.service_name] || 'bg-blue-500'
                  }`}
                >
                  {service.service_name}
                </span>
                <h3 className="text-lg font-semibold mt-2">{service.service_name}</h3>
                <p className="text-gray-600 flex items-center gap-2 mt-1">
                  {service.service_description || "No Description"}
                </p>
                <p className="text-orange-600 font-bold mt-1">
                  ₹{service.service_price}
                </p>
              </div>
            </div>
          ))
          ) : (
            services.map((service) => (
              <div
                key={service.id}
                className="bg-white p-4 rounded-lg shadow-md relative flex gap-4 items-center cursor-pointer"
                onClick={() => navigate('/ServiceList', { state: { service_id: service.id } })} // Pass service_id
              >
                <img
                  src={service.image || image}
                  alt={service.name}
                  className="h-50 w-50 object-cover rounded-lg"
                  onError={handleImageError}
                />
                <div className="flex-1">
                  <span
                    className={`px-3 py-1 text-sm rounded-full text-white justify-center text-center ${
                      categoryColors[service.category]
                    }`}
                  >
                    credence {service.category}
                  </span>
                  <h3 className="text-lg font-semibold mt-2">{service.name}</h3>
                  <p className="text-gray-600 flex items-center gap-2 mt-1">
                    <FaUserShield className="text-gray-500" /> {service.provider}
                  </p>
                  <p className="text-gray-600 flex items-center gap-2">
                    <FaStar className="text-yellow-500" /> {service.rating}
                  </p>
                  <p className="text-orange-600 font-bold mt-1">
                    ₹{service.price} / Per hour
                  </p>
                </div>
                <FaHeart className="absolute top-4 right-4 text-gray-400 cursor-pointer hover:text-red-500" />
              </div>
            ))
          )}
        </div>

        <div className="space-y-4 mt-20">
          {/* <div className="bg-white p-6 rounded-lg shadow-md flex flex-col items-center">
            <FaShoppingCart className="text-gray-400 text-4xl mb-10" />
            <p className="text-gray-600">No items in your cart</p>
          </div> */}

          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="flex items-center space-x-1">
              <img src={fastdia} alt="Logo" className="h-12" />
            </div>
            <ul className="mt-2 text-gray-600 space-y-1 list-disc list-inside">
              <li>Quality Assured</li>
              <li>Verified Professional</li>
              <li>Transparent Pricing</li>
            </ul>
          </div>
        </div>
      </div>

      <div className="pt-5">
        <Footer />
      </div>
    </div>
  );
};

export default FeaturedServices;