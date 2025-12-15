"use client";

import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import {
  User,
  Mail,
  Shield,
  Users,
  Edit,
  Save,
  X,
  Check,
  Lock,
  UserCircle,
  Phone,
  MapPin,
  Crown,
  Calendar,
  Wallet,
  Settings,
  Bell,
  CreditCard,
  LogOut,
  ChevronRight,
} from "lucide-react";
import Image from "next/image";
import pattern1 from "@/public/hero-pattern-1.svg";
import pattern2 from "@/public/hero-pattern-2.svg";

// Static data for demonstration
const staticAccountData = {
  name: "Vishal Sharma",
  username: "vishal_sharma",
  email: "vishal.sharma@foodmatrix.com",
  isMfaEnabled: true,
  phone: "+91 98765 43210",
  addressLine1: "123 MG Road",
  addressLine2: "Apartment 4B",
  city: "Bangalore",
  state: "Karnataka",
  country: "India",
  zipCode: "560001",
  formattedAddress:
    "123 MG Road, Apartment 4B, Bangalore, Karnataka 560001, India",
  accountNumber: "FM-2024-001234",
  weeklyBudget: "5000.00",
  createdAt: "2024-01-15T10:30:00Z",
  lastLoginAt: "2024-12-12T08:15:00Z",
  isVerified: true,
  isPremium: true,
  memberSince: "Jan 2024",
};

const staticMembers = [
  {
    id: "1",
    name: "Priya Sharma",
    age: 28,
    sex: "female",
    relation: "Spouse",
    healthGoals: ["Weight Loss", "Heart Health"],
    dietaryPreferences: ["Vegetarian"],
    allergies: ["Peanuts"],
    isAdmin: false,
  },
  {
    id: "2",
    name: "Aarav Sharma",
    age: 5,
    sex: "male",
    relation: "Son",
    healthGoals: ["Growth & Development"],
    dietaryPreferences: [],
    allergies: [],
    isAdmin: false,
  },
  {
    id: "3",
    name: "Anita Sharma",
    age: 58,
    sex: "female",
    relation: "Mother",
    healthGoals: ["Diabetes Management", "Blood Pressure"],
    dietaryPreferences: ["Low Sugar", "Low Salt"],
    allergies: [],
    isAdmin: false,
  },
];

const staticInvitations = [
  {
    id: "1",
    email: "rahul.sharma@example.com",
    role: "Member",
    status: "Pending",
    sentAt: "2024-12-10T14:30:00Z",
  },
  {
    id: "2",
    email: "neha.patel@example.com",
    role: "Admin",
    status: "Pending",
    sentAt: "2024-12-11T09:15:00Z",
  },
];

const AccountPage = () => {
  const [activeTab, setActiveTab] = useState("account");
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({ ...staticAccountData });
  const [accountData] = useState(staticAccountData);
  const [members] = useState(staticMembers);
  const [invitations] = useState(staticInvitations);

  const handleEdit = () => {
    setIsEditing(true);
    setEditData({ ...accountData });
  };

  const handleSave = () => {
    // Save logic would go here
    setIsEditing(false);
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditData({ ...accountData });
  };

  return (
    <div className="min-h-screen bg-gradient-to-r from-[#F3F0FD] to-[#F3F0FD00] relative overflow-hidden w-full">
      {/* Background Patterns */}
      <Image
        src={pattern1}
        className="absolute -top-64 -left-32 opacity-30 pointer-events-none"
        width={818}
        height={818}
        alt="Pattern-1"
      />
      <Image
        src={pattern2}
        className="absolute right-0 -top-48 opacity-30 pointer-events-none"
        width={818}
        height={600}
        alt="Pattern-2"
      />

      <div className="relative z-10 w-full mx-auto px-6 py-8">
        {/* Header Section */}
        <div className="mb-6 animate-slide-up">
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl lg:text-3xl font-extrabold text-[var(--primary)] mb-1">
                Profile Management
              </h1>
              <p className="text-sm text-gray-600">
                Manage your profile, settings & connected family members
              </p>
            </div>

            {accountData.isPremium && (
              <div className="bg-gradient-to-r from-[var(--primary)] to-[var(--primary-light)] text-white px-5 py-2 rounded-full flex items-center gap-2 shadow-lg">
                <Crown className="w-4 h-4" />
                <span className="font-bold text-sm">Premium Member</span>
              </div>
            )}
          </div>
        </div>

        {/* Tabs Navigation */}
        <div className="flex gap-3 mb-6 overflow-x-auto pb-2 animate-fade-in">
          <button
            onClick={() => setActiveTab("account")}
            className={`px-5 py-2 rounded-full font-bold text-sm transition-all duration-300 whitespace-nowrap ${activeTab === "account"
              ? "bg-[var(--primary)] text-white shadow-lg"
              : "bg-white text-gray-600 hover:bg-gray-100"
              }`}
          >
            <div className="flex items-center gap-2">
              <UserCircle className="w-4 h-4" />
              My Account
            </div>
          </button>

          <button
            onClick={() => setActiveTab("members")}
            className={`px-5 py-2 rounded-full font-bold text-sm transition-all duration-300 whitespace-nowrap ${activeTab === "members"
              ? "bg-[var(--primary)] text-white shadow-lg"
              : "bg-white text-gray-600 hover:bg-gray-100"
              }`}
          >
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              Members ({members.length})
            </div>
          </button>

          <button
            onClick={() => setActiveTab("invitations")}
            className={`px-5 py-2 rounded-full font-bold text-sm transition-all duration-300 whitespace-nowrap ${activeTab === "invitations"
              ? "bg-[var(--primary)] text-white shadow-lg"
              : "bg-white text-gray-600 hover:bg-gray-100"
              }`}
          >
            <div className="flex items-center gap-2">
              <Mail className="w-4 h-4" />
              Invitations ({invitations.length})
            </div>
          </button>

          <button
            onClick={() => setActiveTab("settings")}
            className={`px-5 py-2 rounded-full font-bold text-sm transition-all duration-300 whitespace-nowrap ${activeTab === "settings"
              ? "bg-[var(--primary)] text-white shadow-lg"
              : "bg-white text-gray-600 hover:bg-gray-100"
              }`}
          >
            <div className="flex items-center gap-2">
              <Settings className="w-4 h-4" />
              Settings
            </div>
          </button>
        </div>

        {/* Account Tab */}
        {activeTab === "account" && (
          <div className="space-y-6 animate-scale-in">
            {/* Quick Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white rounded-2xl p-5 shadow-lg hover:shadow-xl transition-all duration-300 border-2 border-transparent hover:border-[var(--primary)]">
                <div className="flex items-center gap-3">
                  <div className="bg-gradient-to-br from-[var(--primary)] to-[var(--primary-light)] p-3 rounded-xl">
                    <CreditCard className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 font-medium">
                      Account Number
                    </p>
                    <p className="text-base font-extrabold text-[var(--primary)]">
                      {accountData.accountNumber}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-2xl p-5 shadow-lg hover:shadow-xl transition-all duration-300 border-2 border-transparent hover:border-[var(--green)]">
                <div className="flex items-center gap-3">
                  <div className="bg-gradient-to-br from-[var(--green)] to-[var(--green-light)] p-3 rounded-xl">
                    <Wallet className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 font-medium">
                      Weekly Budget
                    </p>
                    <p className="text-base font-extrabold text-[var(--green)]">
                      ₹{accountData.weeklyBudget}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-2xl p-5 shadow-lg hover:shadow-xl transition-all duration-300 border-2 border-transparent hover:border-[var(--primary-light)]">
                <div className="flex items-center gap-3">
                  <div className="bg-gradient-to-br from-[var(--primary-light)] to-[var(--primary)] p-3 rounded-xl">
                    <Calendar className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 font-medium">
                      Member Since
                    </p>
                    <p className="text-base font-extrabold text-[var(--primary-light)]">
                      {accountData.memberSince}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Profile Card */}
            <Card className="border-0 shadow-xl bg-white gap-0 rounded-xl overflow-hidden">
              <CardHeader className="bg-gradient-to-r from-[var(--primary)] to-[var(--primary-light)] text-white py-4 flex justify-between items-center">
                <CardTitle className="flex items-center gap-3 text-xl font-extrabold p-0">
                  <User className="h-6 w-6" />
                  Profile Information
                </CardTitle>

                {!isEditing ? (
                  <button
                    onClick={handleEdit}
                    className="bg-white text-[var(--primary)] px-5 py-2 rounded-full font-bold text-sm flex items-center gap-2 hover:shadow-lg transition-all duration-300 hover:scale-105"
                  >
                    <Edit className="h-4 w-4" />
                    Edit Profile
                  </button>
                ) : (
                  <div className="flex gap-2">
                    <button
                      onClick={handleSave}
                      className="bg-[var(--green)] text-white px-5 py-2 rounded-full font-bold text-sm flex items-center gap-2 hover:shadow-lg transition-all duration-300 hover:scale-105"
                    >
                      <Save className="h-4 w-4" />
                      Save
                    </button>
                    <button
                      onClick={handleCancel}
                      className="bg-white text-gray-700 px-5 py-2 rounded-full font-bold text-sm flex items-center gap-2 hover:shadow-lg transition-all duration-300 hover:scale-105"
                    >
                      <X className="h-4 w-4" />
                      Cancel
                    </button>
                  </div>
                )}
              </CardHeader>

              <CardContent className="p-6 space-y-6 bg-white">
                {/* Profile Picture Section */}
                <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 pb-6 border-b-2 border-gray-100">
                  <div className="relative">
                    <div className="w-24 h-24 rounded-full bg-gradient-to-br from-[var(--primary)] to-[var(--primary-light)] flex items-center justify-center text-white text-4xl font-extrabold shadow-xl ring-4 ring-white">
                      {accountData.name.charAt(0).toUpperCase()}
                    </div>
                    {accountData.isVerified && (
                      <div className="absolute -bottom-1 -right-1 bg-[var(--green)] rounded-full p-1.5 border-4 border-white shadow-lg">
                        <Check className="w-5 h-5 text-white" />
                      </div>
                    )}
                  </div>

                  <div className="flex-1 text-center sm:text-left">
                    <div className="flex flex-col sm:flex-row items-center sm:items-start gap-2 mb-2">
                      <h3 className="text-2xl font-extrabold text-gray-800">
                        {accountData.name}
                      </h3>
                      {accountData.isVerified && (
                        <Badge className="bg-[var(--green)] text-white border-0 px-2 py-0.5 text-xs font-bold">
                          <Check className="w-3 h-3 mr-1" />
                          Verified
                        </Badge>
                      )}
                    </div>
                    <p className="text-base text-gray-600 mb-1">
                      @{accountData.username}
                    </p>
                    <p className="text-xs text-gray-500">
                      Last login:{" "}
                      {new Date(accountData.lastLoginAt).toLocaleString(
                        "en-GB",
                      )}
                    </p>
                    <button className="mt-3 bg-[var(--primary-bg)] text-[var(--primary)] px-5 py-2 rounded-full font-bold text-sm hover:bg-[var(--primary)] hover:text-white transition-all duration-300">
                      Change Photo
                    </button>
                  </div>
                </div>

                {/* Form Fields */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Full Name */}
                  <div className="space-y-1.5">
                    <Label
                      htmlFor="name"
                      className="flex items-center gap-2 font-bold text-gray-700 text-sm"
                    >
                      <User className="w-4 h-4 text-[var(--primary)]" />
                      Full Name
                    </Label>
                    <Input
                      id="name"
                      value={isEditing ? editData.name : accountData.name}
                      onChange={(e) =>
                        setEditData({ ...editData, name: e.target.value })
                      }
                      disabled={!isEditing}
                      className="h-11 rounded-lg border border-[#E5E5E5] text-black bg-white focus:ring-0 transition-all text-base font-medium shadow-none"
                    />
                  </div>

                  {/* Username */}
                  <div className="space-y-1.5">
                    <Label
                      htmlFor="username"
                      className="flex items-center gap-2 font-bold text-gray-700 text-sm"
                    >
                      <UserCircle className="w-4 h-4 text-[var(--primary)]" />
                      Username
                    </Label>
                    <Input
                      id="username"
                      value={
                        isEditing ? editData.username : accountData.username
                      }
                      onChange={(e) =>
                        setEditData({ ...editData, username: e.target.value })
                      }
                      disabled={!isEditing}
                      className="h-11 rounded-lg border border-[#E5E5E5] text-black bg-white focus:ring-0 transition-all text-base font-medium shadow-none"
                    />
                  </div>

                  {/* Email */}
                  <div className="space-y-1.5">
                    <Label
                      htmlFor="email"
                      className="flex items-center gap-2 font-bold text-gray-700 text-sm"
                    >
                      <Mail className="w-4 h-4 text-[var(--primary)]" />
                      Email Address
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      value={accountData.email}
                      disabled
                      className="h-11 rounded-lg border border-[#E5E5E5] text-black bg-white focus:ring-0 transition-all text-base font-medium shadow-none"
                    />
                  </div>

                  {/* Phone */}
                  <div className="space-y-1.5">
                    <Label
                      htmlFor="phone"
                      className="flex items-center gap-2 font-bold text-gray-700 text-sm"
                    >
                      <Phone className="w-4 h-4 text-[var(--primary)]" />
                      Phone Number
                    </Label>
                    <Input
                      id="phone"
                      value={isEditing ? editData.phone : accountData.phone}
                      onChange={(e) =>
                        setEditData({ ...editData, phone: e.target.value })
                      }
                      disabled={!isEditing}
                      className="h-11 rounded-lg border border-[#E5E5E5] text-black bg-white focus:ring-0 transition-all text-base font-medium shadow-none"
                    />
                  </div>

                  {/* Address */}
                  <div className="space-y-1.5 md:col-span-2">
                    <Label
                      htmlFor="address"
                      className="flex items-center gap-2 font-bold text-gray-700 text-sm"
                    >
                      <MapPin className="w-4 h-4 text-[var(--primary)]" />
                      Full Address
                    </Label>
                    <Input
                      id="address"
                      value={
                        isEditing
                          ? editData.formattedAddress
                          : accountData.formattedAddress
                      }
                      onChange={(e) =>
                        setEditData({
                          ...editData,
                          formattedAddress: e.target.value,
                        })
                      }
                      disabled={!isEditing}
                      className="h-11 rounded-lg border border-[#E5E5E5] text-black bg-white focus:ring-0 transition-all text-base font-medium shadow-none"
                    />
                  </div>

                  {/* City */}
                  <div className="space-y-1.5">
                    <Label
                      htmlFor="city"
                      className="font-bold text-gray-700 text-sm"
                    >
                      City
                    </Label>
                    <Input
                      id="city"
                      value={isEditing ? editData.city : accountData.city}
                      onChange={(e) =>
                        setEditData({ ...editData, city: e.target.value })
                      }
                      disabled={!isEditing}
                      className="h-11 rounded-lg border border-[#E5E5E5] text-black bg-white focus:ring-0 transition-all text-base font-medium shadow-none"
                    />
                  </div>

                  {/* State */}
                  <div className="space-y-1.5">
                    <Label
                      htmlFor="state"
                      className="font-bold text-gray-700 text-sm"
                    >
                      State
                    </Label>
                    <Input
                      id="state"
                      value={isEditing ? editData.state : accountData.state}
                      onChange={(e) =>
                        setEditData({ ...editData, state: e.target.value })
                      }
                      disabled={!isEditing}
                      className="h-11 rounded-lg border border-[#E5E5E5] text-black bg-white focus:ring-0 transition-all text-base font-medium shadow-none"
                    />
                  </div>

                  {/* ZIP Code */}
                  <div className="space-y-1.5">
                    <Label
                      htmlFor="zipCode"
                      className="font-bold text-gray-700 text-sm"
                    >
                      ZIP Code
                    </Label>
                    <Input
                      id="zipCode"
                      value={isEditing ? editData.zipCode : accountData.zipCode}
                      onChange={(e) =>
                        setEditData({ ...editData, zipCode: e.target.value })
                      }
                      disabled={!isEditing}
                      className="h-11 rounded-lg border border-[#E5E5E5] text-black bg-white focus:ring-0 transition-all text-base font-medium shadow-none"
                    />
                  </div>

                  {/* Country */}
                  <div className="space-y-1.5">
                    <Label
                      htmlFor="country"
                      className="font-bold text-gray-700 text-sm"
                    >
                      Country
                    </Label>
                    <Input
                      id="country"
                      value={isEditing ? editData.country : accountData.country}
                      onChange={(e) =>
                        setEditData({ ...editData, country: e.target.value })
                      }
                      disabled={!isEditing}
                      className="h-11 rounded-lg border border-[#E5E5E5] text-black bg-white focus:ring-0 transition-all text-base font-medium shadow-none"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-xl bg-white gap-0 rounded-xl overflow-hidden">
              <CardHeader className="bg-gradient-to-r from-[var(--primary)] to-[var(--primary-light)] text-white py-4 flex justify-between items-center">
                <CardTitle className="flex items-center gap-3 text-xl font-extrabold p-0">
                  <Shield className="h-6 w-6" />
                  Security Settings
                </CardTitle>
              </CardHeader>

              <CardContent className="p-6 space-y-4">
                {/* MFA Toggle */}
                <div
                  className="flex items-center justify-between p-5 
      bg-gradient-to-r from-[#F3F0FD] to-[#F3F0FD00] 
      rounded-2xl border border-[#E6E1FF] shadow-md"
                >
                  <div className="flex items-center gap-3">
                    <div className="bg-[var(--primary)] p-3 rounded-xl shadow-lg">
                      <Shield className="w-5 h-5 text-white" />
                    </div>

                    <div>
                      <h4 className="font-extrabold text-base text-gray-900">
                        Two-Factor Authentication
                      </h4>
                      <p className="text-xs text-gray-600">
                        Add an extra layer of security to your account
                      </p>
                    </div>
                  </div>

                  <Switch
                    checked={accountData.isMfaEnabled}
                    className="data-[state=checked]:bg-[var(--green)]"
                  />
                </div>

                <div
                  className="flex items-center justify-between p-5 
      bg-gradient-to-r from-[#F3F0FD] to-[#F3F0FD00] 
      rounded-2xl border border-[#E6E1FF] shadow-md"
                >
                  <div className="flex items-center gap-3">
                    <div className="bg-[var(--green)] p-3 rounded-xl shadow-lg">
                      <Lock className="w-5 h-5 text-white" />
                    </div>

                    <div>
                      <h4 className="font-extrabold text-base text-gray-900">
                        Change Password
                      </h4>
                      <p className="text-xs text-gray-600">
                        Update your password regularly for security
                      </p>
                    </div>
                  </div>

                  <button
                    className="
        bg-[var(--green)] text-white px-5 py-2 rounded-full font-bold text-sm 
        hover:bg-[var(--green-light)] transition-all duration-300 hover:scale-105"
                  >
                    Change
                  </button>
                </div>

                {/* Logout */}
                <div
                  className="flex items-center justify-between p-5 
      bg-gradient-to-r from-red-50 to-red-100 
      rounded-2xl border border-red-200 shadow-md"
                >
                  <div className="flex items-center gap-3">
                    <div className="bg-red-600 p-3 rounded-xl shadow-lg">
                      <LogOut className="w-5 h-5 text-white" />
                    </div>

                    <div>
                      <h4 className="font-extrabold text-base text-gray-900">
                        Logout from Account
                      </h4>
                      <p className="text-xs text-gray-600">
                        Sign out from your current session
                      </p>
                    </div>
                  </div>

                  <button
                    className="
        bg-red-600 text-white px-5 py-2 rounded-full font-bold text-sm 
        hover:bg-red-700 transition-all duration-300 hover:scale-105"
                  >
                    Logout
                  </button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Members Tab */}
        {activeTab === "members" && (
          <div className="space-y-6 animate-scale-in">
            <Card className="border-0 shadow-xl bg-white gap-0 rounded-xl overflow-hidden">
              <CardHeader className="bg-gradient-to-r from-[var(--primary)] to-[var(--primary-light)] text-white py-4 flex justify-between items-center">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <CardTitle className="flex items-center gap-3 text-xl font-extrabold p-0">
                    <Users className="h-6 w-6" />
                    Family Members ({members.length})
                  </CardTitle>
                  <button className="bg-white text-[var(--green)] px-5 py-2 rounded-full font-bold text-sm flex items-center gap-2 hover:shadow-lg transition-all duration-300 hover:scale-105">
                    <User className="h-4 w-4" />
                    Add Member
                  </button>
                </div>
              </CardHeader>
              <CardContent className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {members.map((member) => (
                    <div
                      key={member.id}
                      className="bg-white rounded-xl p-5 shadow-md hover:shadow-lg transition-all duration-300 hover:-translate-y-1 border-2 border-gray-100 hover:border-[var(--primary)]"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div className="w-14 h-14 rounded-full bg-gradient-to-br from-[var(--primary)] to-[var(--primary-light)] flex items-center justify-center text-white text-xl font-extrabold">
                            {member.name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <h4 className="font-extrabold text-base text-gray-800">
                              {member.name}
                            </h4>
                            <p className="text-xs text-gray-500">
                              {member.relation}
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-gray-600 font-medium">
                            Age:
                          </span>
                          <span className="font-bold text-gray-800">
                            {member.age} years
                          </span>
                        </div>
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-gray-600 font-medium">
                            Gender:
                          </span>
                          <span className="font-bold text-gray-800 capitalize">
                            {member.sex}
                          </span>
                        </div>

                        {member.healthGoals.length > 0 && (
                          <div className="pt-2 border-t border-gray-100">
                            <p className="text-xs text-gray-500 font-medium mb-1.5">
                              Health Goals:
                            </p>
                            <div className="flex flex-wrap gap-1.5">
                              {member.healthGoals.map((goal, idx) => (
                                <Badge
                                  key={idx}
                                  className="bg-[var(--primary-bg)] text-[var(--primary)] border-0 text-xs px-2 py-0.5"
                                >
                                  {goal}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}

                        {member.allergies.length > 0 && (
                          <div className="pt-2 border-t border-gray-100">
                            <p className="text-xs text-gray-500 font-medium mb-1.5">
                              Allergies:
                            </p>
                            <div className="flex flex-wrap gap-1.5">
                              {member.allergies.map((allergy, idx) => (
                                <Badge
                                  key={idx}
                                  className="bg-red-100 text-red-700 border-0 text-xs px-2 py-0.5"
                                >
                                  {allergy}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>

                      <button className="w-full mt-3 bg-[var(--primary-bg)] text-[var(--primary)] py-2 rounded-xl font-bold text-sm hover:bg-[var(--primary)] hover:text-white transition-all duration-300">
                        View Details
                      </button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Invitations Tab */}
        {activeTab === "invitations" && (
          <div className="space-y-6 animate-scale-in">
            <Card className="border-0 shadow-2xl rounded-3xl overflow-hidden">
              <CardHeader className="bg-gradient-to-r from-[var(--primary)] to-[var(--primary-light)] text-white p-5">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <CardTitle className="flex items-center gap-3 text-2xl font-extrabold">
                    <Mail className="h-7 w-7" />
                    Pending Invitations ({invitations.length})
                  </CardTitle>
                  <button className="bg-white text-[var(--primary)] px-6 py-2 rounded-full font-bold flex items-center gap-2 hover:shadow-lg transition-all duration-300 hover:scale-105">
                    <Mail className="h-4 w-4" />
                    Send Invitation
                  </button>
                </div>
              </CardHeader>
              <CardContent className="p-8">
                <div className="space-y-4">
                  {invitations.map((invitation) => (
                    <div
                      key={invitation.id}
                      className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 border-2 border-gray-100 hover:border-[var(--primary)]"
                    >
                      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                        <div className="flex items-center gap-4 flex-1">
                          <div className="bg-gradient-to-br from-[var(--primary)] to-[var(--primary-light)] p-3 rounded-xl">
                            <Mail className="w-6 h-6 text-white" />
                          </div>
                          <div className="flex-1">
                            <h4 className="font-extrabold text-lg text-gray-800">
                              {invitation.email}
                            </h4>
                            <p className="text-sm text-gray-500">
                              Sent on{" "}
                              {new Date(invitation.sentAt).toLocaleDateString(
                                "en-GB",
                              )}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-3">
                          <Badge className="bg-amber-100 text-amber-700 border-0 px-4 py-1 font-bold">
                            {invitation.status}
                          </Badge>
                          <Badge className="bg-[var(--primary-bg)] text-[var(--primary)] border-0 px-4 py-1 font-bold">
                            {invitation.role}
                          </Badge>
                          <button className="bg-red-100 text-red-600 px-4 py-2 rounded-xl font-bold hover:bg-red-600 hover:text-white transition-all duration-300">
                            Cancel
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Settings Tab */}
        {activeTab === "settings" && (
          <div className="space-y-6 animate-scale-in">
            <Card className="border-0 shadow-2xl rounded-3xl overflow-hidden">
              <CardHeader className="bg-gradient-to-r from-gray-700 to-gray-800 text-white p-5">
                <CardTitle className="flex items-center gap-3 text-2xl font-extrabold">
                  <Settings className="h-7 w-7" />
                  Application Settings
                </CardTitle>
              </CardHeader>
              <CardContent className="p-8 space-y-6">
                {/* Notifications */}
                <div className="flex items-center justify-between p-6 bg-gradient-to-r from-purple-50 to-purple-100 rounded-2xl border-2 border-purple-200">
                  <div className="flex items-center gap-4">
                    <div className="bg-purple-600 p-3 rounded-xl">
                      <Bell className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h4 className="font-extrabold text-lg text-gray-800">
                        Push Notifications
                      </h4>
                      <p className="text-sm text-gray-600">
                        Receive notifications about meal plans and updates
                      </p>
                    </div>
                  </div>
                  <Switch className="data-[state=checked]:bg-[var(--green)]" />
                </div>

                {/* Email Notifications */}
                <div className="flex items-center justify-between p-6 bg-gradient-to-r from-green-50 to-green-100 rounded-2xl border-2 border-green-200">
                  <div className="flex items-center gap-4">
                    <div className="bg-green-600 p-3 rounded-xl">
                      <Mail className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h4 className="font-extrabold text-lg text-gray-800">
                        Email Notifications
                      </h4>
                      <p className="text-sm text-gray-600">
                        Get weekly meal plan summaries via email
                      </p>
                    </div>
                  </div>
                  <Switch
                    defaultChecked
                    className="data-[state=checked]:bg-[var(--green)]"
                  />
                </div>

                {/* Weekly Budget Alert */}
                <div className="flex items-center justify-between p-6 bg-gradient-to-r from-amber-50 to-amber-100 rounded-2xl border-2 border-amber-200">
                  <div className="flex items-center gap-4">
                    <div className="bg-amber-600 p-3 rounded-xl">
                      <Wallet className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h4 className="font-extrabold text-lg text-gray-800">
                        Budget Alerts
                      </h4>
                      <p className="text-sm text-gray-600">
                        Get notified when approaching budget limits
                      </p>
                    </div>
                  </div>
                  <Switch
                    defaultChecked
                    className="data-[state=checked]:bg-[var(--green)]"
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};

export default AccountPage;
