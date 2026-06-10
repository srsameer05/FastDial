 import React from "react";
import { FaInstagram, FaFacebookF, FaXTwitter } from "react-icons/fa6";
import fastdia from "../../assets/Quick Serve 10.png";
import { useNavigate } from "react-router-dom";

const Footer = () => {
  const navigate = useNavigate();
  return (
    <footer className="bg-blue-400 text-white">
      <div className="max-w-7xl mx-auto px-6 py-12">

        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
       <div>
            <img src={fastdia} alt="Quick Serve Logo" className="h-13 mb-4"/>
            <h2 className="text-xl font-bold mb-2 text-black">
              Get Trusted Help for All Your Daily Needs Anytime, Anywhere.
            </h2>
            <p className="text-base leading-relaxed">
              From plumbing and electrical repairs to cleaning and handyman services, Quick Serve connects you with local professionals in just a few taps.
            </p>
            <div className="mt-4 text-base space-y-1">
              <p>📞 +91 96666 96666</p>
              <p>📧 support@flutterflirt.com</p>
              <p>📍</p>
            </div>
          </div>

          <div>
            <h3 className="font-bold text-black text-xl mb-3">Categories</h3>
            <ul className="space-y-2 text-base">
              {[
                "Cleaning", "Painting", "Electric", "Carpenter",
                "Plumbing", "Shipping", "Taxi", "Driving School", "Bike Rental"
              ].map((item, index) => (
                <li key={index} className="hover:text-blue-800 cursor-pointer">{item}</li>
              ))}
            </ul>
          </div>
          <div>
            <h3 className="font-bold text-black text-xl mb-3" >Privacy & Policy</h3>
            <ul className="space-y-2 text-base mb-5">
              <li className="hover:text-blue-800 cursor-pointer" onClick={() => { navigate("/T&C"); window.scrollTo({ top: 0, behavior: "smooth" }); }} >Terms and Conditions</li>
              <li className="hover:text-blue-800 cursor-pointer"  onClick={() => {navigate("/UserProfilePage");window.scrollTo({ top: 0, behavior: "smooth" });}}>Help Center</li>
            </ul>
            <h3 className="font-bold text-black text-xl mb-2">Social Media</h3>
            <div className="flex space-x-4 mt-2">
              <a href="https://www.instagram.com/quick__serve?igsh=bW5veWZpc2E2dWtx" target="_blank" rel="noopener noreferrer">
                <FaInstagram className="hover:text-pink-500 cursor-pointer" size={24} />
              </a>
              <a href="https://www.facebook.com/profile.php?id=61573637712804" target="_blank" rel="noopener noreferrer">
                <FaFacebookF className="hover:text-blue-700 cursor-pointer" size={24} />
              </a>
              <a href="https://x.com/Flutter_flirt?t=HGN_sGg8YWNAnJ7gEWTbgw&s=08" target="_blank" rel="noopener noreferrer">
              <FaXTwitter className="hover:text-black cursor-pointer" size={24} />
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="bg-blue-500 text-white text-center text-base py-3 font-medium">
        Quick Serve was designed and developed by FlutterFlirt
      </div>
    </footer>
  );
};

export default Footer;