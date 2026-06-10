import React from "react";
import Header from "./Header";
import Footer from "./Footer";
import { FaArrowLeft } from "react-icons/fa";
import { Navigate, useNavigate } from "react-router-dom";

const TermsAndCondition = () => {
  const navigate = useNavigate();

  return (
    <div>
      <Header />
      <div className="max-w-6xl mx-auto p-6 bg-white">
        <div className="flex items-center gap-2 mb-4"> 
          <button
            className="flex items-center text-black font-semibold"
            onClick={() => navigate("/home")}
          >
            <FaArrowLeft />
          </button>
          <h1 className="text-2xl font-bold text-blue-800 ml-3">Terms and Condition</h1>
        </div>
        <p className="mb-4 ml-2">
          Welcome to Quick Serve! By accessing or using our app, website, and services, you agree to comply with the following Terms and Conditions. Please read them carefully.
        </p>

        <ol className="list-decimal pl-6 space-y-4">
          <li>
            <strong>Introduction</strong>
            <p>
             Quick Serve is a platform that connects users with local businesses, service providers, and vendors. We act as an intermediary and do not directly provide services or products listed on our platform.
            </p>
          </li>

          <li>
            <strong>Acceptance of Terms</strong>
            <p>
              By usingQuick Serve, you agree to abide by these Terms and our Privacy Policy. If you do not agree, please do not use our services.
            </p>
          </li>

          <li>
            <strong>User Accounts</strong>
            <ul className="list-disc pl-6 mt-2 space-y-2">
              <li>To access certain features, you may need to create an account.</li>
              <li>You are responsible for maintaining the confidentiality of your account credentials.</li>
              <li>Providing false information may result in account suspension.</li>
            </ul>
          </li>

          <li>
            <strong>Listing and Reviews</strong>
            <p>
              Businesses may list their services or products, but they must provide accurate and legal information. Users can leave reviews, but they must not include false, misleading, or defamatory content.
            </p>
          </li>

          <li>
            <strong>Quick Serve's Rights</strong>
            <p>Quick Serve reserves the right to remove any listing or review that violates our policies.</p>
          </li>

          <li>
            <strong>Payments and Transactions</strong>
            <p>
              Some services may require payments, which are securely processed through third-party payment gateways.Quick Serve is not responsible for disputes between users and businesses regarding transactions.
            </p>
          </li>

          <li>
            <strong>Prohibited Activities</strong>
            <p>Users must not:</p>
            <ul className="list-disc pl-6 mt-2 space-y-2">
              <li>Post misleading, illegal, or offensive content.</li>
              <li>Attempt to hack, scrape, or exploit our platform.</li>
            </ul>
          </li>

          <li>
            <strong>Limitation of Liability</strong>
            <p>Quick Serve is not liable for:</p>
            <ul className="list-disc pl-6 mt-2 space-y-2">
              <li>The quality, accuracy, or reliability of services listed on our platform.</li>
              <li>Disputes between users and businesses.</li>
            </ul>
          </li>

          <li>
            <strong>Privacy Policy</strong>
            <p>
              We collect and process user data as outlined in our Privacy Policy. By using Quick Serve, you consent to this data collection.
            </p>
          </li>

          <li>
            <strong>Modifications to Terms</strong>
            <p>
              We may update these Terms at any time. Continued use of Quick Serve after updates means you accept the revised Terms.
            </p>
          </li>

          <li>
            <strong>Termination of Access</strong>
            <p>
              We reserve the right to terminate or suspend accounts violating these Terms without prior notice.
            </p>
          </li>

          <li>
            <strong>Governing Law</strong>
            <p>
              These Terms are governed by the laws of India, Karnataka. Any disputes will be handled in the courts of Bangalore.
            </p>
          </li>

          <li>
            <strong>Contact Information</strong>
            <p>
              For any questions or concerns regarding these Terms, please contact us at{" "}
              <a href="mailto:quickserve@gmail.com" className="text-blue-600 underline">
                quickserve@gmail.com
              </a>
              .
            </p>
          </li>
        </ol>
      </div>
      <Footer />
    </div>
  );
};

export default TermsAndCondition;