import { Routes, Route } from "react-router-dom";
import CommonLanding from './pages/common/CommonLanding'

// User Routes Imports

import ServiceList from "./pages/User/ServiceList";
import Services from "./pages/User/Services/Service";
import Home from "./pages/User/Home";
import FeaturedServices from "./pages/User/FeaturedServices";
import GoogleMapsComponent from "./pages/User/GoogleMapsComponent";
import AddressForm from "./pages/User/AddressForm";
import MyBookings from "./pages/User/MyBookings";
import CancelBooking from "./pages/User/Bookings/CancelBooking";
import Rating from "./pages/User/Rating";
import Favourate from "./pages/User/Favourate";
import MessageModal from "./pages/User/MessageModal";
import LoginPage from "./pages/User/Login/LoginModal";
import OtpPage from "./pages/User/Login/OtpModal";
import ProfilePage from "./pages/User/Login/ProfileModal";
import LocationPage from "./pages/User/Login/LocationModal";
import ManualLocationPage from "./pages/User/Login/ManualLocationModal";
import UserProfilePage from "./pages/User/UserProfilePage";
import UserVendorList from './pages/User/UserVendorList';
// import Address from "./pages/User/Address/Address";
// import SlotSection from "./pages/User/Address/SlotSection";
// import ReviewSummary from "./pages/User/Address/ReviewSummary";
// import PaymentMethod from "./pages/User/Address/PaymentMethod";

// Vendor Routes Imports
import VendorLogin from './pages/vendor/Auth/VendorLogin';
import VendorSignUp from './pages/vendor/Auth/VendorSignUp';
import VendorList from './pages/vendor/VendorList';
import VendorDashboard from './pages/vendor/VendorDashboard';
import VendorRequests from './pages/vendor/VendorRequests';
import VendorMessages from './pages/vendor/VendorMessages';
import VendorLogout from './pages/vendor/VendorLogout';
import VendorAccount from './pages/vendor/VendorAccount/VendorAccount';
import Categories from "./pages/User/Categories";
import TermsAndCondition from "./pages/User/TermsAndCondition";
import AddReview from "./pages/User/AddReview";
import ProtectedRoute from "./pages/vendor/Auth/ProtectedRoute";
import RealtimeTracker from "./pages/User/RealtimeTracker";

const App = () => {
  return (
    <>
      <Routes>
        {/* Common landing page */}
      <Route path="/" element={<CommonLanding/>} />
        {/* //User Routes */}
        <Route path="/Home" element={<Home />} />
        <Route path="/User/Login" element={<LoginPage />} />
        <Route path="/login/otp" element={<OtpPage />} />
        <Route path="/login/profile" element={<ProfilePage />} />
        <Route path="/login/location" element={<LocationPage />} />
        <Route path="/login/location/manual" element={<ManualLocationPage />} />
        <Route path="/FeaturedServices" element={<FeaturedServices/>} />
        <Route path="/ServiceList" element={<ServiceList />} />
        <Route path="/Services" element={<Services />} />
        <Route path="/GoogleMapsComponent" element={<GoogleMapsComponent />} />
        <Route path="/AddressForm" element={<AddressForm />} />
        <Route path="/MyBookings" element={<MyBookings />} />
        <Route path="/CancelBooking" element={<CancelBooking />} />
        <Route path="/Rating" element={<Rating />} />
        <Route path="/Favourate" element={<Favourate />} />
        <Route path="/MessageModal" element={<MessageModal />} />
        <Route path="/UserProfilePage" element={<UserProfilePage />} />
        <Route path="/Categories" element={<Categories/>}/>
        <Route path="/T&C" element={<TermsAndCondition/>}/>
        <Route path="/addreview" element={<AddReview/>}/>
        <Route path="/UserVendorList" element={<UserVendorList />} />
        <Route path="/deliverystatus" element={<RealtimeTracker />} />F

        {/* <Route path="/address" element={<Address/>}/>
        <Route path="/slotsection" element={<SlotSection />}/>
        <Route path="/reviewsummary" element={<ReviewSummary />}/>
        <Route path="/paymentmethod" element={<PaymentMethod />}/> */}

      {/* Vendor Routes */}
        <Route path="/vendorlogin" element={<VendorLogin />} />
        <Route path="/vendorsignup" element={<VendorSignUp />} />
        <Route path="/vendorlist" element={<VendorList />} />
        <Route element={<ProtectedRoute />}>
        <Route path="/vendordashboard" element={<VendorDashboard />} />
        <Route path="/vendorrequests" element={<VendorRequests />} />
        <Route path="/vendormessages" element={<VendorMessages />} />
        <Route path="/vendorlogout" element={<VendorLogout />} />
        <Route path="/vendoraccount" element={<VendorAccount />} />
        </Route>
      </Routes>
    </>
  );
};

export default App;