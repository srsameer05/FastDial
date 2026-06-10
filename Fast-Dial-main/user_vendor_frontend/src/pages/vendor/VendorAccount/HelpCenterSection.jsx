import React from "react";

const HelpCenterSection = () => {
  const faqs = [
    {
      question: "1. What is Quick Serve?",
      answer:
        "QUICK SERVE is a platform that connects users with local businesses quickly and efficiently.",
    },
    {
      question: "2. How does Quick Serve work?",
      answer:
        "Quick Serve works by allowing users to search for businesses and contact them directly through the platform.",
    },
    {
      question: "3. Is Quick Serve free to use?",
      answer:
        "Yes, Quick Serve is free for basic use, with optional premium features available.",
    },
    {
      question: "4. How can I list my business on Quick Serve?",
      answer:
        "You can list your business by signing up and submitting your business details through the platform.",
    },
    {
      question: "5. Can users leave reviews on Quick Serve?",
      answer: "Yes, users can leave reviews for businesses listed on Quick Serve.",
    },
    {
      question: "6. How does Quick Serve ensure the authenticity of businesses listed?",
      answer:
        "Quick Serve verifies businesses through a review process to ensure authenticity.",
    },
  ];

  return (
    <>
      <h2 className="text-3xl font-semibold text-[#4285F4] mb-6">
        Help Center
      </h2>
      <div className="space-y-8">
        {faqs.map((faq) => (
          <details key={faq.question} className="group">
            <summary className="flex items-center justify-between p-2 bg-gray-100 rounded-lg cursor-pointer">
              <span className="text-xl font-medium text-gray-700">
                {faq.question}
              </span>
              <svg
                className="w-5 h-5 text-gray-500 transform group-open:rotate-180 transition-transform"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                strokeWidth="2"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M19 9l-7 7-7-7"
                ></path>
              </svg>
            </summary>
            <p className="p-2 text-gray-600">{faq.answer}</p>
          </details>
        ))}
      </div>
    </>
  );
};

export default HelpCenterSection;