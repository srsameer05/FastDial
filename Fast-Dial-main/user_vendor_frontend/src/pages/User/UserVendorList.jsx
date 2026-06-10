// VendorList.jsx
import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { getVendorsWithServicesRequest } from '../../saga/features/customer/customerSlice';
import Header from './Header';
import Footer from './Footer';

const VendorList = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const { vendorsWithServices, vendorsWithServicesLoading, vendorsWithServicesError } = useSelector((state) => state.customer);

  const service_id = location.state?.service_id;
  const bookingType = location.state?.bookingType || 'now'; // Default to 'now' if not provided
  const locationDetails = location.state?.locationDetails || {};

  useEffect(() => {
    console.log('VendorList: service_id:', service_id, 'bookingType:', bookingType, 'locationDetails:', locationDetails);
    if (!service_id) {
      console.error('VendorList: Missing service_id');
      navigate('/home');
      return;
    }
    dispatch(getVendorsWithServicesRequest());
  }, [dispatch, service_id, navigate]);

  const filteredVendors = vendorsWithServices.filter(vendor => vendor.service_id === service_id);

  const handleBook = (vendor) => {
    console.log('VendorList: Navigating to AddressForm with service_id:', vendor.service_id, 'vendor_id:', vendor.vendor_id, 'bookingType:', bookingType);
    navigate('/AddressForm', {
      state: {
        hideSlot: bookingType === 'now', // hideSlot: false for Book Later, true for Book Now
        service_id: vendor.service_id,
        vendor_id: vendor.vendor_id,
        bookingType,
      }
    });
  };

  return (
    <div className="max-w-screen mx-auto">
      <Header />
      <div className="w-[95%] mx-auto p-6">
        <h2 className="text-2xl font-semibold mb-6">Available Vendors</h2>
        {vendorsWithServicesLoading ? (
          <div>Loading vendors...</div>
        ) : vendorsWithServicesError ? (
          <div className="text-red-500">Error: {vendorsWithServicesError}</div>
        ) : filteredVendors.length === 0 ? (
          <div>No vendors found for this service.</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredVendors.map(vendor => {
              if (vendor?.vendor_address?.city.toLowerCase() === locationDetails?.toLowerCase()) {

                return (
                  <div
                    key={vendor.vendor_id}
                    className="border rounded-lg p-4 bg-white shadow-md hover:shadow-lg transition"
                  >
                    <img
                      src={vendor.service_image_url}
                      alt={vendor.service_name}
                      className="w-full h-48 object-cover rounded-md mb-4"
                      onError={(e) => {
                        console.log(`Image failed to load: ${e.target.src}`);
                        e.target.src = 'https://via.placeholder.com/150';
                      }}
                    />
                    <h3 className="text-lg font-semibold">{vendor.service_name}</h3>
                    <p className="text-gray-600 text-sm mt-1">{vendor.service_description}</p>
                    <p className="text-blue-600 font-semibold mt-2">₹{vendor.service_price}</p>
                    <p className="text-gray-700 mt-2"><strong>Vendor:</strong> {vendor.vendor_name}</p>
                    <p className="text-gray-700"><strong>Business:</strong> {vendor.name_of_bussiness}</p>
                    <button
                      className="w-full bg-blue-500 text-white p-3 rounded-full mt-4 hover:bg-blue-600 transition"
                      onClick={() => handleBook(vendor)}
                    >
                      Book
                    </button>
                  </div>
                )
              }
            }
            )}
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
};

export default VendorList;