import { Routes, Route } from "react-router-dom";

import ManageVendor from "./pages/admin/Managevendor";
import Messages from "./pages/admin/Messages";
import Login from "./pages/admin/auth/Login";
import AddVendor from "./pages/admin/Addvendor";
import UserDetails from "./pages/admin/UserDetails";
import AdminComplaints from "./pages/admin/AdminComplaints";
import PendingApproval from "./pages/admin/PendingApproval";
import AddServicecategory from "./pages/admin/service categories/AddServicecategory";
import VendorPayments from "./pages/admin/VendorPayments";
import Userpaymentdetails from "./pages/admin/Userpaymentdetails";
import Setpricing from "./pages/admin/Setpricing";
import PendingApprovalView from "./pages/admin/PendingApprovalView";
import Servicecategory from "./pages/admin/service categories/Servicecategory";
import Subscriptions from "./pages/admin/subscription/Subscriptions";
import Addsubscription from "./pages/admin/subscription/Addsubscriptions";
import Booking from "./pages/admin/BookingDetails"
import AddSubService from "./pages/admin/service categories/AddSubService";
import ProtectedRoute from "./pages/admin/auth/ProtectedRoute";
import BlockedVendors from "./pages/admin/BlockedVendors";

const App = () => {
  return (
    <>
      <Routes>
        <Route path="/adminlogin" element={<Login />} />
        <Route element={<ProtectedRoute />}>
        <Route path="/managevendor" element={<ManageVendor />} />
        <Route path="/messages" element={<Messages />} />
        <Route path="/addvendor" element={<AddVendor />} />
        <Route path="/userdetails" element={<UserDetails />} />
        <Route path="/admincomplains" element={<AdminComplaints />} />
        <Route path="/pendingapproval" element={<PendingApproval />} />
        <Route path="/vendorpayments" element={<VendorPayments />} />
        <Route path="/addservicecategory" element={<AddServicecategory />} />
        <Route path="/servicecategory" element={<Servicecategory />} />
        <Route path="/userpaymentdetails" element={<Userpaymentdetails />} />
        <Route path="/setpricing" element={<Setpricing />} />
        <Route path="/pendingapprovalview/:vendorId" element={<PendingApprovalView />} />
        <Route path="/subscriptions" element={<Subscriptions/>}/>
        <Route path="/addsubscriptions" element={<Addsubscription/>}/>
        <Route path="/bookingdetails" element={<Booking/>}/>
        <Route path="/addsubservice" element={<AddSubService />} />
        <Route path="/blockedvendors" element={<BlockedVendors />} />
        </Route>
      </Routes>
    </>
  );
};

export default App;