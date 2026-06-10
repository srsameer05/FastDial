import bigImg from "../../../assets/BigImg.png";
import { useState } from "react";

const SlotSection = () => {
  const [selectedDate, setSelectedDate] = useState("10 Mar");
  const [selectedTime, setSelectedTime] = useState("9:00");

  const dates = ["10 Mar", "12 Mar", "13 Mar", "14 Mar", "15 Mar", "16 Mar"];
  const times = ["9:00", "10:00", "11:00", "12:00", "13:00", "14:00"];

  return (
    <div className="border rounded-lg p-6 w-full">
      <img
        src={bigImg}
        alt="Cleaning Service"
        className="rounded-lg w-full max-w-[250px] h-auto mb-4"
      />

      <span className="bg-blue-100 text-blue-600 px-3 py-1 rounded-md text-sm">
        Home Cleaning
      </span>
      <h2 className="text-xl font-semibold mt-2">Deep House Cleaning</h2>
      <p className="text-gray-600 text-sm mb-4">
        1012 Ocean avenue, New York, USA
      </p>

      <h3 className="text-md font-semibold mb-2">BOOK APPOINTMENT</h3>

      <h4 className="text-gray-700 font-medium">Day</h4>
      <div className="flex gap-2 mt-2 mb-4">
        {dates.map((date) => (
          <button
            key={date}
            className={`px-4 py-2 rounded-md border ${
              selectedDate === date ? "bg-blue-500 text-white" : "bg-gray-100"
            }`}
            onClick={() => setSelectedDate(date)}
          >
            {date}
          </button>
        ))}
      </div>

      <h4 className="text-gray-700 font-medium">Time</h4>
      <div className="flex gap-2 mt-2 mb-4">
        {times.map((time) => (
          <button
            key={time}
            className={`px-4 py-2 rounded-md border ${
              selectedTime === time ? "bg-blue-500 text-white" : "bg-gray-100"
            }`}
            onClick={() => setSelectedTime(time)}
          >
            {time}
          </button>
        ))}
      </div>

      <h4 className="text-gray-700 font-medium">
        Send Notes to service provider
      </h4>
      <textarea
        placeholder="Type here"
        className="border rounded-md p-3 w-full mt-2"
        rows="4"
      ></textarea>

      <button className="w-full bg-blue-500 text-white p-3 rounded-full mt-6 hover:bg-blue-600 transition">
        Continue
      </button>
    </div>
  );
};

export default SlotSection;
