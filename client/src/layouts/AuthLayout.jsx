import React from "react";
import { Outlet } from "react-router-dom";
import { Card } from "../components/ui/card";

const AuthLayout = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600 rounded-full mb-4">
            <span className="text-white text-2xl font-bold">MF</span>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Microfinance MIS
          </h1>
          <p className="text-gray-600">
            Empowering communities through financial inclusion
          </p>
        </div>
        
        <Card className="p-8 shadow-xl border-0 bg-white/80 backdrop-blur-sm">
          <Outlet />
        </Card>
        
        <div className="text-center mt-8 text-sm text-gray-500">
          <p>© 2024 Microfinance MIS. All rights reserved.</p>
        </div>
      </div>
    </div>
  );
};

export default AuthLayout; 