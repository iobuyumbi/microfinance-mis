// src/pages/Landing.jsx
import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import ConnectionDiagnostic from "@/components/custom/ConnectionDiagnostic";

// Lucide React Icons
import {
  Users,
  TrendingUp,
  Shield,
  Heart,
  ArrowRight,
  CheckCircle,
  Building,
  Target,
  Settings,
} from "lucide-react";

export default function Landing() {
  const features = [
    {
      icon: Users,
      title: "Community Support",
      description:
        "Join a network of like-minded individuals working together for financial growth.",
    },
    {
      icon: TrendingUp,
      title: "Financial Growth",
      description:
        "Access loans and savings opportunities to build your financial future.",
    },
    {
      icon: Shield,
      title: "Secure & Transparent",
      description:
        "All transactions are secure and transparent with full accountability.",
    },
    {
      icon: Heart,
      title: "Social Impact",
      description:
        "Contribute to community development while improving your own financial situation.",
    },
  ];

  const benefits = [
    "Access to affordable loans",
    "Group savings programs",
    "Financial literacy training",
    "Community networking",
    "Transparent record keeping",
    "24/7 support system",
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      {/* Header */}
      <header className="container mx-auto px-4 py-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Building className="h-8 w-8 text-blue-600" />
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Microfinance MIS
            </h1>
          </div>
          <div className="flex items-center space-x-4">
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="ghost" size="sm">
                  <Settings className="h-4 w-4 mr-2" />
                  Connection Test
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-4xl">
                <DialogHeader>
                  <DialogTitle>API Connection Diagnostic</DialogTitle>
                </DialogHeader>
                <ConnectionDiagnostic />
              </DialogContent>
            </Dialog>
            <Button variant="ghost" asChild>
              <Link to="/login">Login</Link>
            </Button>
            <Button asChild>
              <Link to="/register">Sign Up</Link>
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-16">
        <div className="text-center max-w-4xl mx-auto">
          <Badge variant="secondary" className="mb-4">
            <Target className="h-4 w-4 mr-2" />
            Empowering Communities Through Microfinance
          </Badge>
          <h2 className="text-5xl font-bold text-gray-900 dark:text-white mb-6">
            Building Financial
            <span className="text-blue-600"> Futures</span>
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-2xl mx-auto">
            Join our microfinance community to access affordable loans, build
            savings, and create lasting financial stability for you and your
            family.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" asChild>
              <Link to="/register">
                Get Started Today
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <Button variant="outline" size="lg" asChild>
              <Link to="/login">Already a Member?</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h3 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
            Why Choose Our Microfinance Platform?
          </h3>
          <p className="text-lg text-gray-600 dark:text-gray-300">
            We provide comprehensive financial services designed for community
            growth
          </p>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => (
            <Card
              key={index}
              className="text-center hover:shadow-lg transition-shadow"
            >
              <CardHeader>
                <div className="mx-auto w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center mb-4">
                  <feature.icon className="h-6 w-6 text-blue-600" />
                </div>
                <CardTitle className="text-lg">{feature.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 dark:text-gray-300">
                  {feature.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Benefits Section */}
      <section className="container mx-auto px-4 py-16">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div>
            <h3 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">
              Comprehensive Benefits for Members
            </h3>
            <p className="text-lg text-gray-600 dark:text-gray-300 mb-8">
              Our platform offers a wide range of services and benefits designed
              to support your financial journey and community development.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {benefits.map((benefit, index) => (
                <div key={index} className="flex items-center space-x-3">
                  <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0" />
                  <span className="text-gray-700 dark:text-gray-300">
                    {benefit}
                  </span>
                </div>
              ))}
            </div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg p-8 shadow-lg">
            <h4 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              Ready to Get Started?
            </h4>
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              Join thousands of members who have already transformed their
              financial future.
            </p>
            <Button className="w-full" size="lg" asChild>
              <Link to="/register">
                Create Your Account
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="container mx-auto px-4 py-8 border-t border-gray-200 dark:border-gray-700">
        <div className="text-center text-gray-600 dark:text-gray-400">
          <p>
            &copy; {new Date().getFullYear()} Microfinance MIS. All rights
            reserved.
          </p>
          <p className="mt-2 text-sm">
            Empowering communities through accessible financial services
          </p>
        </div>
      </footer>
    </div>
  );
}
