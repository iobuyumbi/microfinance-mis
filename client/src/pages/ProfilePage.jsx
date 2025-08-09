import React, { useState } from "react";
import { useAuth } from "../hooks/useAuth";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import {
  FacebookCard,
  FacebookCardHeader,
  FacebookCardContent,
} from "../components/ui/facebook-card";
import { Badge } from "../components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "../components/ui/avatar";
import {
  Edit,
  Save,
  X,
  User,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Shield,
  Activity,
  Settings,
  Camera,
} from "lucide-react";

const ProfilePage = () => {
  const { user, updateProfile } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || "",
    email: user?.email || "",
    phone: user?.phone || "",
    address: user?.address || "",
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSave = async () => {
    try {
      await updateProfile(formData);
      setIsEditing(false);
    } catch (error) {
      console.error("Failed to update profile:", error);
    }
  };

  const handleCancel = () => {
    setFormData({
      name: user?.name || "",
      email: user?.email || "",
      phone: user?.phone || "",
      address: user?.address || "",
    });
    setIsEditing(false);
  };

  const profileStats = [
    {
      label: "Total Loans",
      value: "5",
      icon: Shield,
      color: "text-blue-600",
    },
    {
      label: "Active Savings",
      value: "$2,450",
      icon: Activity,
      color: "text-green-600",
    },
    {
      label: "Group Memberships",
      value: "2",
      icon: User,
      color: "text-purple-600",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Profile
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">
          Manage your account information and settings
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Overview */}
        <div className="lg:col-span-2 space-y-6">
          {/* Profile Header */}
          <FacebookCard>
            <FacebookCardContent className="p-8">
              <div className="flex items-center gap-6">
                <div className="relative">
                  <Avatar className="h-24 w-24">
                    <AvatarImage src={user?.avatar} />
                    <AvatarFallback className="text-2xl bg-gradient-to-r from-blue-600 to-purple-600 text-white">
                      {user?.name?.charAt(0) || <User className="h-12 w-12" />}
                    </AvatarFallback>
                  </Avatar>
                  <Button
                    size="sm"
                    variant="outline"
                    className="absolute -bottom-2 -right-2 h-8 w-8 rounded-full p-0"
                  >
                    <Camera className="h-4 w-4" />
                  </Button>
                </div>
                <div className="flex-1">
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                    {user?.name}
                  </h2>
                  <p className="text-gray-600 dark:text-gray-400">
                    {user?.email}
                  </p>
                  <div className="flex items-center gap-2 mt-2">
                    <Badge className="capitalize bg-gradient-to-r from-blue-600 to-purple-600 text-white">
                      {user?.role}
                    </Badge>
                    <Badge
                      variant="outline"
                      className="bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400"
                    >
                      Active
                    </Badge>
                  </div>
                </div>
                {!isEditing ? (
                  <Button
                    onClick={() => setIsEditing(true)}
                    variant="outline"
                    className="bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600"
                  >
                    <Edit className="h-4 w-4 mr-2" />
                    Edit Profile
                  </Button>
                ) : (
                  <div className="flex space-x-2">
                    <Button
                      onClick={handleSave}
                      className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                    >
                      <Save className="h-4 w-4 mr-2" />
                      Save
                    </Button>
                    <Button onClick={handleCancel} variant="outline">
                      <X className="h-4 w-4 mr-2" />
                      Cancel
                    </Button>
                  </div>
                )}
              </div>
            </FacebookCardContent>
          </FacebookCard>

          {/* Personal Information */}
          <FacebookCard>
            <FacebookCardHeader>
              <div className="flex items-center gap-2">
                <User className="h-5 w-5 text-blue-600" />
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Personal Information
                </h2>
              </div>
            </FacebookCardHeader>
            <FacebookCardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label
                    htmlFor="name"
                    className="text-sm font-medium text-gray-700 dark:text-gray-300"
                  >
                    Full Name
                  </Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                    <Input
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                      className="pl-10 h-11 border-gray-300 dark:border-gray-600 focus:border-blue-500 focus:ring-blue-500"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label
                    htmlFor="email"
                    className="text-sm font-medium text-gray-700 dark:text-gray-300"
                  >
                    Email Address
                  </Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                      className="pl-10 h-11 border-gray-300 dark:border-gray-600 focus:border-blue-500 focus:ring-blue-500"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label
                    htmlFor="phone"
                    className="text-sm font-medium text-gray-700 dark:text-gray-300"
                  >
                    Phone Number
                  </Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                    <Input
                      id="phone"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                      className="pl-10 h-11 border-gray-300 dark:border-gray-600 focus:border-blue-500 focus:ring-blue-500"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label
                    htmlFor="address"
                    className="text-sm font-medium text-gray-700 dark:text-gray-300"
                  >
                    Address
                  </Label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                    <Input
                      id="address"
                      name="address"
                      value={formData.address}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                      className="pl-10 h-11 border-gray-300 dark:border-gray-600 focus:border-blue-500 focus:ring-blue-500"
                    />
                  </div>
                </div>
              </div>
            </FacebookCardContent>
          </FacebookCard>

          {/* Profile Stats */}
          <FacebookCard>
            <FacebookCardHeader>
              <div className="flex items-center gap-2">
                <Activity className="h-5 w-5 text-blue-600" />
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Profile Statistics
                </h2>
              </div>
            </FacebookCardHeader>
            <FacebookCardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {profileStats.map((stat, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-3 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl"
                  >
                    <div className={`p-2 rounded-lg bg-white dark:bg-gray-700`}>
                      <stat.icon className={`h-5 w-5 ${stat.color}`} />
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {stat.label}
                      </p>
                      <p className="font-semibold text-gray-900 dark:text-white">
                        {stat.value}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </FacebookCardContent>
          </FacebookCard>
        </div>

        {/* Profile Summary */}
        <div className="space-y-6">
          <FacebookCard>
            <FacebookCardHeader>
              <div className="flex items-center gap-2">
                <Settings className="h-5 w-5 text-blue-600" />
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Account Details
                </h2>
              </div>
            </FacebookCardHeader>
            <FacebookCardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-gray-400" />
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      Member Since:
                    </span>
                  </div>
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    Jan 2024
                  </span>
                </div>
                <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <Activity className="h-4 w-4 text-gray-400" />
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      Last Login:
                    </span>
                  </div>
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    Today
                  </span>
                </div>
                <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <Shield className="h-4 w-4 text-gray-400" />
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      Account Status:
                    </span>
                  </div>
                  <Badge className="bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400">
                    Active
                  </Badge>
                </div>
              </div>
            </FacebookCardContent>
          </FacebookCard>

          <FacebookCard>
            <FacebookCardHeader>
              <div className="flex items-center gap-2">
                <User className="h-5 w-5 text-blue-600" />
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Quick Actions
                </h2>
              </div>
            </FacebookCardHeader>
            <FacebookCardContent>
              <div className="space-y-3">
                <Button variant="outline" className="w-full justify-start h-11">
                  <Settings className="mr-2 h-4 w-4" />
                  Account Settings
                </Button>
                <Button variant="outline" className="w-full justify-start h-11">
                  <Shield className="mr-2 h-4 w-4" />
                  Security Settings
                </Button>
                <Button variant="outline" className="w-full justify-start h-11">
                  <Activity className="mr-2 h-4 w-4" />
                  Activity History
                </Button>
              </div>
            </FacebookCardContent>
          </FacebookCard>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
