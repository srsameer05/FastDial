import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchVendorProfileRequest } from "../../../saga/features/vendor/vendorSlice";
import workmanImage from "../../../assets/profile.png";

const ProfileSection = () => {
  const dispatch = useDispatch();
  const { profile, profileLoading, profileError } = useSelector((state) => state.vendor);
  const [brokenImages, setBrokenImages] = useState(new Set());

  useEffect(() => {
    console.log("ProfileSection useEffect - Fetching profile");
    const token = localStorage.getItem('vendorToken');
    console.log("Token from localStorage:", token);

    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        const vendorId = payload.id;
        console.log("Extracted vendorId from token:", vendorId);
        dispatch(fetchVendorProfileRequest(vendorId));
      } catch (e) {
        console.error("Failed to decode token:", e);
      }
    } else {
      console.log("No token found, skipping fetch");
    }
  }, [dispatch]);

  const handleImageError = (e, url) => {
    if (!brokenImages.has(url)) {
      console.log(`Image failed to load: ${url}`);
      setBrokenImages((prev) => new Set(prev).add(url));
      e.target.src = workmanImage;
    }
  };

  if (profileLoading) {
    return <p className="text-gray-600 text-lg">Loading profile...</p>;
  }

  if (profileError) {
    return <p className="text-red-500 text-lg">Error: {profileError}</p>;
  }

  if (!profile) {
    return <p className="text-gray-600 text-lg">No profile data available.</p>;
  }

  return (
    <div className="space-y-8">
      <h2 className="text-3xl font-bold text-[#4285F4] mb-4">Your Profile</h2>

      <div className="bg-white p-8 rounded-xl shadow-lg border border-gray-200 space-y-6">
        <div className="border-b border-gray-200 pb-4">
          <h3 className="text-xl font-semibold text-gray-800">Vendor Information</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="flex flex-col">
            <span className="text-lg font-medium text-[#4285F4]">Name</span>
            <p className="text-gray-900 text-base">{profile.vendor_name || "N/A"}</p>
          </div>
          <div className="flex flex-col">
            <span className="text-lg font-medium text-[#4285F4]">Email</span>
            <p className="text-gray-900 text-base">{profile.vendor_email || "N/A"}</p>
          </div>
          <div className="flex flex-col">
            <span className="text-lg font-medium text-[#4285F4]">Phone Number</span>
            <p className="text-gray-900 text-base">{profile.vendor_mobile || "N/A"}</p>
          </div>
          <div className="flex flex-col">
            <span className="text-lg font-medium text-[#4285F4]">Business Name</span>
            <p className="text-gray-900 text-base">{profile.name_of_bussiness || "N/A"}</p>
          </div>
          <div className="flex flex-col">
            <span className="text-lg font-medium text-[#4285F4]">Business Category</span>
            <p className="text-gray-900 text-base">{profile.bussiness_category || "N/A"}</p>
          </div>
          <div className="flex flex-col">
            <span className="text-lg font-medium text-[#4285F4]">Service Name</span>
            <p className="text-gray-900 text-base">{profile.fast_service_category_name || "N/A"}</p>
          </div>
          <div className="flex flex-col">
            <span className="text-lg font-medium text-[#4285F4]">GST Number</span>
            <p className="text-gray-900 text-base">{profile.gst_number || "N/A"}</p>
          </div>
          <div className="flex flex-col">
            <span className="text-lg font-medium text-[#4285F4]">Company Category</span>
            <p className="text-gray-900 text-base">{profile.company_category || "N/A"}</p>
          </div>
          <div className="flex flex-col">
            <span className="text-lg font-medium text-[#4285F4]">Service Radius</span>
            <p className="text-gray-900 text-base">{profile.service_radius || "N/A"} km</p>
          </div>
          <div className="flex flex-col">
            <span className="text-lg font-medium text-[#4285F4]">Business Address</span>
            <p className="text-gray-900 text-base">{profile.bussiness_address || "N/A"}</p>
          </div>
          <div className="flex flex-col">
            <span className="text-lg font-medium text-[#4285F4]">Pincode</span>
            <p className="text-gray-900 text-base">{profile.pincode || "N/A"}</p>
          </div>
          <div className="flex flex-col">
            <span className="text-lg font-medium text-[#4285F4]">Service Hours</span>
            <p className="text-gray-900 text-base">
              {profile.service_start_time || "N/A"} - {profile.service_end_time || "N/A"}
            </p>
          </div>
          <div className="flex flex-col">
            <span className="text-lg font-medium text-[#4285F4]">Business Proof Document</span>
            <p className="text-gray-900 text-base">
              {profile.bussiness_proof_doc_url ? (
                <a
                  href={profile.bussiness_proof_doc_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#4285F4] hover:underline"
                >
                  View Document
                </a>
              ) : (
                "N/A"
              )}
            </p>
          </div>
        </div>

        <div className="border-t border-gray-200 pt-4">
          <span className="text-lg font-medium text-[#4285F4]">Business Description</span>
          <p className="text-gray-900 text-base mt-2">{profile.bussiness_desc || "N/A"}</p>
        </div>

        <div className="border-t border-gray-200 pt-4">
          <h3 className="text-xl font-semibold text-gray-800 mb-4">Account Details</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex flex-col">
              <span className="text-lg font-medium text-[#4285F4]">Account Number</span>
              <p className="text-gray-900 text-base">
                {profile.account_details?.accountNumber || "N/A"}
              </p>
            </div>
            <div className="flex flex-col">
              <span className="text-lg font-medium text-[#4285F4]">IFSC Code</span>
              <p className="text-gray-900 text-base">{profile.account_details?.ifsc || "N/A"}</p>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-200 pt-4">
          <h3 className="text-xl font-semibold text-gray-800 mb-4">KYC Documents</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex flex-col">
              <span className="text-lg font-medium text-[#4285F4]">PAN Number</span>
              <p className="text-gray-900 text-base">{profile.kyc_docs?.pan || "N/A"}</p>
            </div>
            <div className="flex flex-col">
              <span className="text-lg font-medium text-[#4285F4]">Aadhaar Number</span>
              <p className="text-gray-900 text-base">{profile.kyc_docs?.aadhar || "N/A"}</p>
            </div>
            <div className="flex flex-col">
              <span className="text-lg font-medium text-[#4285F4]">PAN Photo</span>
              <p className="text-gray-900 text-base">
                {profile.kyc_docs?.pan_photo ? (
                  <a
                    href={profile.kyc_docs.pan_photo}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[#4285F4] hover:underline"
                  >
                    View PAN Photo
                  </a>
                ) : (
                  "N/A"
                )}
              </p>
            </div>
            <div className="flex flex-col">
              <span className="text-lg font-medium text-[#4285F4]">Aadhaar Photo</span>
              <p className="text-gray-900 text-base">
                {profile.kyc_docs?.aadhar_photo ? (
                  <a
                    href={profile.kyc_docs.aadhar_photo}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[#4285F4] hover:underline"
                  >
                    View Aadhaar Photo
                  </a>
                ) : (
                  "N/A"
                )}
              </p>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-200 pt-4">
          <h3 className="text-xl font-semibold text-gray-800 mb-4">Services</h3>
          {Array.isArray(profile.services) && profile.services.length > 0 ? (
            <ul className="list-disc pl-5 text-gray-900 text-base">
              {profile.services.map((service, index) => (
                <li key={index}>{service}</li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-900 text-base">No services available</p>
          )}
        </div>

        <div className="border-t border-gray-200 pt-4">
          <span className="text-lg font-medium text-[#4285F4]">Images</span>
          {Array.isArray(profile.image_url) && profile.image_url.length > 0 ? (
            <div className="flex flex-wrap gap-4 mt-2">
              {profile.image_url.map((url, index) => (
                <img
                  key={index}
                  src={brokenImages.has(url) ? workmanImage : url}
                  alt={`Vendor Image ${index + 1}`}
                  className="w-32 h-32 object-cover rounded-lg shadow-sm hover:shadow-md transition-shadow duration-300"
                  onError={(e) => handleImageError(e, url)}
                />
              ))}
            </div>
          ) : (
            <p className="text-gray-900 text-base mt-2">No images available</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProfileSection;