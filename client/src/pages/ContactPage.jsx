// client/src/pages/ContactPage.jsx
import React from "react";
import { Mail, Phone, MapPin } from "lucide-react";

const ContactPage = () => {
  const contactDetails = [
    {
      icon: Mail,
      title: "Email",
      info: "support@micromis.com",
    },
    {
      icon: Phone,
      title: "Phone",
      info: "+123 456 7890",
    },
    {
      icon: MapPin,
      title: "Address",
      info: "123 Microfinance St, Fintech City, 54321",
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-gray-100 py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
            Get in Touch
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
            We're here to help! Feel free to reach out to us with any questions
            or support requests.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {contactDetails.map((detail, index) => (
            <div
              key={index}
              className="text-center p-8 rounded-lg bg-white dark:bg-gray-800 shadow-lg hover:shadow-xl transition-shadow duration-300"
            >
              <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <detail.icon className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                {detail.title}
              </h3>
              <p className="text-lg font-medium text-gray-600 dark:text-gray-300">
                {detail.info}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ContactPage;
