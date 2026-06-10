import { useState } from "react";
import Header from "./Header";
import Footer from "./Footer";
import Upcoming from "../User/Bookings/Upcoming";
import Completed from "../User/Bookings/Completed";
import Cancelled from "../User/Bookings/Cancelled";

export default function MyBookings() {
  const [activeTab, setActiveTab] = useState("Upcoming");

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 p-6 w-full max-w-6xl mx-auto">
        <div className="flex justify-between border-b mb-4 relative">
          <button
            className={`pb-2 text-sm font-medium transition ${
              activeTab === "Upcoming"
                ? "text-blue-600 border-b-2 border-blue-600"
                : "text-gray-400"
            }`}
            onClick={() => setActiveTab("Upcoming")}
          >
            Upcoming
          </button>

          <button
            className={`pb-2 text-sm font-medium transition absolute left-1/2 transform -translate-x-1/2 ${
              activeTab === "Completed"
                ? "text-blue-600 border-b-2 border-blue-600"
                : "text-gray-400"
            }`}
            onClick={() => setActiveTab("Completed")}
          >
            Completed
          </button>

          <button
            className={`pb-2 text-sm font-medium transition ${
              activeTab === "Cancelled"
                ? "text-blue-600 border-b-2 border-blue-600"
                : "text-gray-400"
            }`}
            onClick={() => setActiveTab("Cancelled")}
          >
            Cancelled
          </button>
        </div>

        {activeTab === "Upcoming" && <Upcoming />}
        {activeTab === "Completed" && <Completed />}
        {activeTab === "Cancelled" && <Cancelled />}
      </main>

      <Footer />
    </div>
  );
}
