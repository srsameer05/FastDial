import { useNavigate, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getSingleServiceRequest } from "../../saga/features/customer/customerSlice";
import bigImg from "../../assets/BigImg.png";
import Small1 from "../../assets/Small1.png";
import Small2 from "../../assets/Small2.png";
import Small3 from "../../assets/Small3.png";
import Small4 from "../../assets/Small4.png";
import Small5 from "../../assets/Small5.png";
import Header from "./Header";
import { FaShareAlt } from "react-icons/fa";
import { AiOutlineHeart } from "react-icons/ai";
import Service from "../User/Services/Service";
import ServiceDetails from "./Services/ServiceDetails";
import ImageGallery from "./Services/ImageGallery";
import ReviewsSection from "./Services/ReviewsSection";
import AddReview from "./AddReview";
import image from "../../assets/image.png";

const ServiceList = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const { service_id } = location.state || {};
  const { singleService, singleServiceLoading, singleServiceError } = useSelector((state) => state.customer);

  const defaultService = {
    name: "Deep House Cleaning",
    category: "Cleaning",
    price: 110,
    rating: 4.8,
    reviews: 678,
    image: bigImg,
    provider: "Adam & Co",
    description: "Comprehensive house cleaning service",
    location: "1012 Ocean Avenue, New York, USA",
  };

  const [selectedImage, setSelectedImage] = useState(bigImg);
  const menuItems = ["Service", "Gallery"];
  const [activeTab, setActiveTab] = useState("Service");
  const [isAddReviewOpen, setIsAddReviewOpen] = useState(false);

  useEffect(() => {
    if (service_id) {
      dispatch(getSingleServiceRequest(service_id));
    }
  }, [dispatch, service_id]);

  useEffect(() => {
    console.log("singleService:", singleService);
    if (singleService && singleService.service_image_url) {
      setSelectedImage(singleService.service_image_url);
    }
  }, [singleService]);

  const handleAddReview = (reviewData) => {
    console.log("Review submitted:", reviewData);
    setIsAddReviewOpen(false);
  };

  const thumbnails = [singleService?.service_image_url || bigImg];

  const selectedService = singleService
    ? {
        name: singleService.service_name,
        category: singleService.service_name,
        price: singleService.service_price,
        rating: singleService.rating || 4.8,
        reviews: singleService.reviews || 678,
        image: singleService.service_image_url || bigImg,
        provider: singleService.provider || "Adam & Co",
        description: singleService.service_description || "Comprehensive service",
      }
    : defaultService;

  return (
    <div>
      <Header />
      <div className="w-[90%] mx-auto pt-5">
        <button className="mb-4 text-gray-600" onClick={() => navigate(-1)}>
          ⬅ Back
        </button>

        {singleServiceLoading ? (
          <div>Loading service...</div>
        ) : singleServiceError ? (
          <div>Error loading service: {singleServiceError}</div>
        ) : (
          <div className="flex gap-6">
            <div className="flex flex-col gap-3">
              {thumbnails.map((img, index) => (
                <img
                  key={index}
                  src={img}
                  alt="Thumbnail"
                  className="w-[88px] h-[88px] cursor-pointer rounded-md border"
                  onClick={() => setSelectedImage(img)}
                  onError={(e) => {
                    console.log(`Thumbnail failed to load: ${e.target.src}`);
                    e.target.src = image;
                  }}
                />
              ))}
            </div>

            <div>
              <img
                src={selectedImage}
                alt={selectedService.name}
                className="w-[720px] h-[560px] rounded-lg object-cover"
                onError={(e) => {
                  console.log(`Image failed to load: ${e.target.src}`);
                  e.target.src = image;
                }}
              />
            </div>

            <div className="flex flex-col gap-5 p-6 bg-white rounded-lg shadow-md w-[400px]">
              <div className="flex justify-between items-center">
                <span className="bg-blue-200 text-blue-600 px-4 py-2 text-sm font-medium w-fit">
                  {selectedService.category || "Unknown Category"}
                </span>
                <span className="text-yellow-500 font-bold text-lg flex items-center">
                  ⭐ {selectedService.rating || "N/A"}{" "}
                  <span className="text-gray-600 text-sm ml-1">
                    ({selectedService.reviews || 0} reviews)
                  </span>
                </span>
              </div>

              <h2 className="text-3xl font-bold text-gray-800">
                {selectedService.name || "Unknown Service"}
              </h2>

              <p className="text-gray-600 flex items-center gap-2 mt-1">
                {singleService?.service_description || "No Description"}
              </p>

              <div className="bg-gray-100 p-5 rounded-lg w-full flex flex-col items-center text-center">
                <p className="text-gray-500 text-sm">Total Price</p>
                <p className="text-2xl font-bold text-gray-800">
                  ₹{selectedService.price || "Contact for Price"}
                </p>
                <button
                  className="bg-blue-500 text-white px-6 py-3 mt-3 rounded-lg font-semibold w-full hover:bg-blue-600 transition"
                  onClick={() => navigate("/AddressForm")}
                >
                  Book Now
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="flex gap-10 mt-6 border-b pb-2">
          {menuItems.map((item) => (
            <button
              key={item}
              className={`text-lg ${
                activeTab === item ? "text-orange-500 font-bold" : "text-gray-600"
              }`}
              onClick={() => setActiveTab(item)}
            >
              {item}
            </button>
          ))}
        </div>
      </div>
      <div className="mt-6">
        {activeTab === "Service" && <Service service={selectedService} />}
        {/* {activeTab === "About" && <ServiceDetails service={selectedService} />} */}
        {activeTab === "Gallery" && <ImageGallery images={thumbnails} />}
        {/* {activeTab === "Review" && (
          <ReviewsSection onAddReviewClick={() => setIsAddReviewOpen(true)} />
        )} */}
      </div>
      {isAddReviewOpen && (
        <AddReview
          onClose={() => setIsAddReviewOpen(false)}
          onSubmit={handleAddReview}
        />
      )}
    </div>
  );
};

export default ServiceList;