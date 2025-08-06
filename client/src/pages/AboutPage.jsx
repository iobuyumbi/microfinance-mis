// client/src/pages/AboutPage.jsx
import React from "react";
import { Target, Lightbulb, Heart, Handshake } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"; // Import Shadcn Card components

const AboutPage = () => {
  const values = [
    {
      icon: Lightbulb,
      title: "Innovation",
      description:
        "We constantly seek new and better ways to serve our clients and improve our platform.",
    },
    {
      icon: Heart,
      title: "Integrity",
      description:
        "We operate with transparency and honesty, building trust with our partners and communities.",
    },
    {
      icon: Handshake,
      title: "Collaboration",
      description:
        "We believe in working together to achieve shared goals and create a positive impact.",
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-gray-100 py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
            About Our Mission
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
            We are dedicated to empowering communities and fostering financial
            inclusion through our state-of-the-art microfinance management
            system.
          </p>
        </div>

        {/* Mission Section using Shadcn Card */}
        <Card className="p-8 md:p-12 mb-16">
          <div className="flex items-center justify-center mb-6">
            <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center">
              <Target className="h-8 w-8 text-white" />
            </div>
          </div>
          <CardHeader>
            <CardTitle className="text-center text-3xl font-bold text-gray-900 dark:text-white">
              Our Mission
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-center text-lg text-gray-600 dark:text-gray-300 max-w-4xl mx-auto">
              To provide microfinance institutions with the tools they need to
              operate efficiently, transparently, and securely, enabling them to
              better serve their clients and drive sustainable economic growth
              in underserved regions.
            </p>
          </CardContent>
        </Card>

        {/* Values Section */}
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-6">
            Our Core Values
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
            These principles guide our work and our commitment to our users.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {values.map((value, index) => (
            <Card
              key={index}
              className="text-center p-8 shadow-lg hover:shadow-xl transition-shadow duration-300"
            >
              <CardHeader>
                <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <value.icon className="h-8 w-8 text-white" />
                </div>
                <CardTitle className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                  {value.title}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-gray-600 dark:text-gray-300">
                  {value.description}
                </CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AboutPage;
