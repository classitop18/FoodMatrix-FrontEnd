"use client";

import { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
  AlertCircle,
  Loader2,
  XCircle,
  CheckCircle2,
  CloudCog,
} from "lucide-react";

import Image from "next/image";
import pattern1 from "@/public/hero-pattern-1.svg";
import pattern2 from "@/public/hero-pattern-2.svg";
import { useSelector } from "react-redux";
import { RootState } from "@/redux/store.redux";
import { AddressAutocomplete } from "@/components/profile/address-autocomplete";
import Loader from "@/components/common/Loader";
import {
  useChangePassword,
  useCheckProperty,
  useUpdateUserProfile,
} from "@/services/auth/auth.mutation";

import ChangePasswordModal from "@/components/profile/change-password-modal";
import { toast } from "@/hooks/use-toast";

export const usernameRegex = /^[A-Za-z][A-Za-z0-9_]{2,19}$/;

const ProfilePage = () => {
  const [activeTab, setActiveTab] = useState("account");
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState<any>(null);
  const [isChangePasswordEnable, setIsChangePasswordEnable] = useState(false);
  const { user } = useSelector((state: RootState) => state.auth);
  const { account, activeBudget } = useSelector(
    (state: RootState) => state.account,
  );

  console.log({ activeBudget });

  const [isMfaUpdating, setIsMfaUpdating] = useState(false);

  const checkIsExistMutation = useCheckProperty();
  const profileUpdateMutation = useUpdateUserProfile();
  const changePasswordMutation = useChangePassword();
  // Validation states
  const [validation, setValidation] = useState({
    username: {
      checking: false,
      isValid: true,
      exists: false,
      message: "",
    },
    email: {
      checking: false,
      isValid: true,
      exists: false,
      message: "",
    },
  });

  const accountData = useMemo(() => {
    if (!user) return null;

    return {
      name: `${user.firstName ?? ""} ${user.lastName ?? ""}`.trim(),
      firstName: user.firstName?.trim() ?? "",
      lastName: user?.lastName?.trim() ?? "",
      username: user.username,
      email: user.email,
      phone: user.phone ?? "—",

      isVerified: user.isVerified,
      isMfaEnabled: user.isMfaEnabled,

      city: user.city ?? "",
      state: user.state ?? "",
      country: user.country ?? "",
      zipCode: user.zipCode ?? "",

      addressLine1: user.addressLine1 ?? "",
      addressLine2: user.addressLine2 ?? "",
      latitude: user.latitude ?? "",
      longitude: user.longitude ?? "",
      placeId: user.placeId ?? "",

      formattedAddress:
        user.formattedAddress ??
        [
          user.addressLine1,
          user.addressLine2,
          user.city,
          user.state,
          user.country,
          user.zipCode,
        ]
          .filter(Boolean)
          .join(", "),

      createdAt: user.createdAt,
      lastLoginAt: user.lastLoginAt,

      accountNumber: "FM-XXXX-XXXX",
      weeklyBudget: "—",
      memberSince: new Date(user.createdAt).toLocaleDateString("en-US", {
        month: "short",
        year: "numeric",
      }),
      isPremium: false,
    };
  }, [user]);

  const handleEdit = () => {
    setIsEditing(true);
    if (accountData) {
      setEditData({ ...accountData });
    }
    // Reset validation when starting edit
    setValidation({
      username: { checking: false, isValid: true, exists: false, message: "" },
      email: { checking: false, isValid: true, exists: false, message: "" },
    });
  };

  const handleChangePassword = async (payload: any) => {
    try {
      await changePasswordMutation.mutateAsync(payload);
      toast({
        title: "Password Updated Successfully 🎉",
        description: "Your password has been changed.",
      });
      setIsChangePasswordEnable(false); // close modal after success
    } catch (error: any) {
      console.error("Change password error:", error);
      toast({
        title: "Failed to Update Password ❌",
        description:
          error?.response?.data?.message ||
          "Something went wrong, please try again.",
        variant: "destructive",
      });
    }
  };

  // Debounced validation check
  useEffect(() => {
    if (!isEditing || !editData) return;

    const timer = setTimeout(() => {
      validateFields();
    }, 500);

    return () => clearTimeout(timer);
  }, [editData?.username, editData?.email, isEditing]);

  const validateFields = async () => {
    // Validate Username
    if (editData?.username && editData.username !== accountData?.username) {
      // Check format first
      const isValidFormat = usernameRegex.test(editData.username);

      if (!isValidFormat) {
        setValidation((prev) => ({
          ...prev,
          username: {
            checking: false,
            isValid: false,
            exists: false,
            message:
              "Username must start with a letter and be 3-20 characters (letters, numbers, underscore)",
          },
        }));
        return;
      }

      // Check if exists
      setValidation((prev) => ({
        ...prev,
        username: { ...prev.username, checking: true },
      }));

      try {
        const response = await checkIsExistMutation.mutateAsync({
          field: "username",
          value: editData.username,
        });

        const exists = response?.data?.exists;
        setValidation((prev) => ({
          ...prev,
          username: {
            checking: false,
            isValid: !exists,
            exists: exists,
            message: exists
              ? "This username is already taken"
              : "Username is available",
          },
        }));
      } catch (error) {
        setValidation((prev) => ({
          ...prev,
          username: {
            checking: false,
            isValid: false,
            exists: false,
            message: "Failed to check username availability",
          },
        }));
      }
    } else if (editData?.username === accountData?.username) {
      // Same as original, no validation needed
      setValidation((prev) => ({
        ...prev,
        username: {
          checking: false,
          isValid: true,
          exists: false,
          message: "",
        },
      }));
    }

    // Validate Email (if you allow email changes)
    if (editData?.email && editData.email !== accountData?.email) {
      setValidation((prev) => ({
        ...prev,
        email: { ...prev.email, checking: true },
      }));

      try {
        const response = await checkIsExistMutation.mutateAsync({
          field: "email",
          value: editData.email,
        });

        const exists = response?.data?.exists;
        setValidation((prev) => ({
          ...prev,
          email: {
            checking: false,
            isValid: !exists,
            exists: exists,
            message: exists
              ? "This email is already registered"
              : "Email is available",
          },
        }));
      } catch (error) {
        setValidation((prev) => ({
          ...prev,
          email: {
            checking: false,
            isValid: false,
            exists: false,
            message: "Failed to check email availability",
          },
        }));
      }
    } else if (editData?.email === accountData?.email) {
      setValidation((prev) => ({
        ...prev,
        email: {
          checking: false,
          isValid: true,
          exists: false,
          message: "",
        },
      }));
    }
  };

  const handleMfaToggle = async (checked: boolean) => {
    if (!user) return;

    setIsMfaUpdating(true);

    try {
      await profileUpdateMutation.mutateAsync({
        isMfaEnabled: checked,
      });

      toast({
        title: checked ? "MFA Enabled" : "MFA Disabled",
        description: checked
          ? "Two-factor authentication has been enabled."
          : "Two-factor authentication has been disabled.",
      });
    } catch (error: any) {
      toast({
        title: "Failed to update MFA",
        description:
          error?.response?.data?.message ||
          "Something went wrong. Please try again.",
      });
    } finally {
      setIsMfaUpdating(false);
    }
  };

  const handleSave = async () => {
    if (!editData) return;

    // Check if all validations pass
    if (!validation.username.isValid || !validation.email.isValid) {
      toast({
        title: "Validation Error",
        description: "Please fix the validation errors before saving.",
      });
      return;
    }

    // Check if username/email exists
    if (validation.username.exists || validation.email.exists) {
      toast({
        title: "Duplicate Entry",
        description:
          "Username or email already exists. Please choose different values.",
      });
      return;
    }

    try {
      await profileUpdateMutation.mutateAsync(editData);

      toast({
        title: "Profile updated successfully",
        description: "Your changes have been saved.",
      });

      setIsEditing(false);
    } catch (error: any) {
      toast({
        title: "Failed to update profile",
        description:
          error?.response?.data?.message ||
          error?.message ||
          "Something went wrong. Please try again.",
      });
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    if (accountData) {
      setEditData({ ...accountData });
    }
    setValidation({
      username: { checking: false, isValid: true, exists: false, message: "" },
      email: { checking: false, isValid: true, exists: false, message: "" },
    });
  };

  // Validation indicator component
  const ValidationIndicator = ({ field }: { field: "username" | "email" }) => {
    const val = validation[field];

    if (!isEditing) return null;
    if (editData?.[field] === accountData?.[field]) return null;
    if (!editData?.[field]) return null;

    if (val.checking) {
      return (
        <div className="flex items-center gap-2 text-blue-600 text-xs mt-1">
          <Loader2 className="w-3 h-3 animate-spin" />
          <span>Checking availability...</span>
        </div>
      );
    }

    if (!val.isValid || val.exists) {
      return (
        <div className="flex items-center gap-2 text-red-600 text-xs mt-1">
          <XCircle className="w-3 h-3" />
          <span>{val.message}</span>
        </div>
      );
    }

    if (val.isValid && !val.exists && val.message) {
      return (
        <div className="flex items-center gap-2 text-green-600 text-xs mt-1">
          <CheckCircle2 className="w-3 h-3" />
          <span>{val.message}</span>
        </div>
      );
    }

    return null;
  };

  if (!accountData) {
    return <Loader />;
  }

  return (
    <div className="min-h-screen bg-gray-100 relative overflow-hidden w-full">
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

            {accountData?.isPremium && (
              <div className="bg-gradient-to-r from-[var(--primary)] to-[var(--primary-light)] text-white px-5 py-2 rounded-full flex items-center gap-2 shadow-lg">
                <Crown className="w-4 h-4" />
                <span className="font-bold text-sm">Premium Member</span>
              </div>
            )}
          </div>
        </div>

        <div className="rounded-2xl overflow-hidden bg-white p-6">
          {/* Tabs Navigation */}
          <div className="flex gap-3 mb-6 overflow-x-auto pb-2 animate-fade-in">
            <button
              onClick={() => setActiveTab("account")}
              className={`px-5 py-2 rounded-full font-bold text-sm transition-all duration-300 whitespace-nowrap ${
                activeTab === "account"
                  ? "bg-[var(--primary)] text-white shadow-lg"
                  : "bg-white text-gray-600 hover:bg-gray-100"
              }`}
            >
              <div className="flex items-center gap-2">
                <UserCircle className="w-4 h-4" />
                My Profile
              </div>
            </button>

            <button
              onClick={() => setActiveTab("settings")}
              className={`px-5 py-2 rounded-full font-bold text-sm transition-all duration-300 whitespace-nowrap ${
                activeTab === "settings"
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
                <div className="bg-white rounded-2xl p-5 hover:shadow-lg transition-all duration-300 border-2 border-[#7661d3]/20">
                  <div className="flex items-center gap-3">
                    <div className="bg-gradient-to-br from-[var(--primary)] to-[var(--primary-light)] p-3 rounded-xl">
                      <CreditCard className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 font-medium">
                        Active Account Number
                      </p>
                      <p className="text-base font-extrabold text-[var(--primary)]">
                        {account?.accountNumber}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-2xl p-5 hover:shadow-lg transition-all duration-300 border-2 border-[#7661d3]/20">
                  <div className="flex items-center gap-3">
                    <div className="bg-gradient-to-br from-[var(--green)] to-[var(--green-light)] p-3 rounded-xl">
                      <Wallet className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 font-medium">
                        {activeBudget?.label}
                      </p>
                      <p className="text-base font-extrabold text-[var(--green)]">
                        ${activeBudget?.amount}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-2xl p-5 hover:shadow-lg transition-all duration-300 border-2 border-[#7661d3]/20">
                  <div className="flex items-center gap-3">
                    <div className="bg-gradient-to-br from-[var(--primary-light)] to-[var(--primary)] p-3 rounded-xl">
                      <Calendar className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 font-medium">
                        Member Since
                      </p>
                      <p className="text-base font-extrabold text-[var(--primary-light)]">
                        {accountData?.memberSince}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Profile Card */}
              <Card className="bg-white rounded-2xl overflow-hidden transition-all duration-300 border-2 border-[#7661d3]/20 shadow-none">
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
                        disabled={
                          profileUpdateMutation.isPending ||
                          !validation.username.isValid ||
                          !validation.email.isValid ||
                          validation.username.exists ||
                          validation.email.exists
                        }
                        className="bg-[var(--green)] text-white px-5 py-2 rounded-full font-bold text-sm flex items-center gap-2 hover:shadow-lg transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                      >
                        {profileUpdateMutation.isPending ? (
                          <>
                            <Loader2 className="h-4 w-4 animate-spin" />
                            Saving...
                          </>
                        ) : (
                          <>
                            <Save className="h-4 w-4" />
                            Save
                          </>
                        )}
                      </button>
                      <button
                        onClick={handleCancel}
                        disabled={profileUpdateMutation.isPending}
                        className="bg-white text-gray-700 px-5 py-2 rounded-full font-bold text-sm flex items-center gap-2 hover:shadow-lg transition-all duration-300 hover:scale-105 disabled:opacity-50"
                      >
                        <X className="h-4 w-4" />
                        Cancel
                      </button>
                    </div>
                  )}
                </CardHeader>

                <CardContent className="p-6 space-y-6 bg-white">
                  {/* Profile Picture Section */}
                  <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 pb-6 border-b-2 border-gray-200">
                    <div className="relative">
                      <div className="w-24 h-24 rounded-full bg-gradient-to-br from-[var(--primary)] to-[var(--primary-light)] flex items-center justify-center text-white text-4xl font-extrabold shadow-xl ring-4 ring-white">
                        {accountData?.name.charAt(0).toUpperCase()}
                      </div>
                      {accountData?.isVerified && (
                        <div className="absolute -bottom-1 -right-1 bg-[var(--green)] rounded-full p-1.5 border-4 border-white shadow-lg">
                          <Check className="w-5 h-5 text-white" />
                        </div>
                      )}
                    </div>

                    <div className="flex-1 text-center sm:text-left">
                      <div className="flex flex-col sm:flex-row items-center sm:items-start gap-2 mb-2">
                        <h3 className="text-2xl font-extrabold text-gray-800">
                          {accountData?.name}
                        </h3>
                        {accountData?.isVerified && (
                          <Badge className="bg-[var(--green)] text-white border-0 px-2 py-0.5 text-xs font-bold">
                            <Check className="w-3 h-3 mr-1" />
                            Verified
                          </Badge>
                        )}
                      </div>
                      <p className="text-base text-gray-600 mb-1">
                        @{accountData?.username}
                      </p>
                      <p className="text-xs text-gray-500">
                        Last login:{" "}
                        {new Date(accountData?.lastLoginAt!).toLocaleString(
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
                    {/* First Name */}
                    <div className="space-y-1.5">
                      <Label
                        htmlFor="firstName"
                        className="flex items-center gap-2 font-bold text-gray-700 text-sm"
                      >
                        <User className="w-4 h-4 text-[var(--primary)]" />
                        First Name
                      </Label>
                      <Input
                        id="firstName"
                        value={
                          isEditing
                            ? editData?.firstName
                            : accountData?.firstName
                        }
                        onChange={(e) =>
                          setEditData({
                            ...editData,
                            firstName: e.target.value,
                          })
                        }
                        disabled={!isEditing}
                        className="h-11 rounded-lg border border-[#BCBCBC] text-black bg-white focus:ring-0 transition-all text-base font-medium shadow-none"
                      />
                    </div>

                    {/* Last Name */}
                    <div className="space-y-1.5">
                      <Label
                        htmlFor="lastName"
                        className="flex items-center gap-2 font-bold text-gray-700 text-sm"
                      >
                        <User className="w-4 h-4 text-[var(--primary)]" />
                        Last Name
                      </Label>
                      <Input
                        id="lastName"
                        value={
                          isEditing ? editData?.lastName : accountData?.lastName
                        }
                        onChange={(e) =>
                          setEditData({ ...editData, lastName: e.target.value })
                        }
                        disabled={!isEditing}
                        className="h-11 rounded-lg border border-[#BCBCBC] text-black bg-white focus:ring-0 transition-all text-base font-medium shadow-none"
                      />
                    </div>

                    {/* Username with Validation */}
                    <div className="space-y-1.5">
                      <Label
                        htmlFor="username"
                        className="flex items-center gap-2 font-bold text-gray-700 text-sm"
                      >
                        <UserCircle className="w-4 h-4 text-[var(--primary)]" />
                        Username
                      </Label>
                      <div className="relative">
                        <Input
                          id="username"
                          value={
                            isEditing
                              ? editData?.username
                              : accountData.username
                          }
                          onChange={(e) =>
                            setEditData({
                              ...editData,
                              username: e.target.value,
                            })
                          }
                          disabled={!isEditing}
                          className={`h-11 rounded-lg border text-black bg-white focus:ring-0 transition-all text-base font-medium shadow-none pr-10 ${
                            isEditing &&
                            editData?.username !== accountData.username
                              ? validation.username.exists ||
                                !validation.username.isValid
                                ? "border-red-500 focus:border-red-500"
                                : validation.username.isValid &&
                                    validation.username.message
                                  ? "border-green-500 focus:border-green-500"
                                  : "border-[#BCBCBC]"
                              : "border-[#BCBCBC]"
                          }`}
                        />
                        {isEditing &&
                          editData?.username !== accountData.username &&
                          editData?.username && (
                            <div className="absolute right-3 top-1/2 -translate-y-1/2">
                              {validation.username.checking ? (
                                <Loader2 className="w-4 h-4 text-blue-600 animate-spin" />
                              ) : validation.username.exists ||
                                !validation.username.isValid ? (
                                <XCircle className="w-4 h-4 text-red-600" />
                              ) : validation.username.isValid &&
                                validation.username.message ? (
                                <CheckCircle2 className="w-4 h-4 text-green-600" />
                              ) : null}
                            </div>
                          )}
                      </div>
                      <ValidationIndicator field="username" />
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
                        className="h-11 rounded-lg border border-[#BCBCBC] text-black bg-gray-50 focus:ring-0 transition-all text-base font-medium shadow-none cursor-not-allowed"
                      />
                      <p className="text-xs text-gray-500">
                        Email cannot be changed
                      </p>
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
                        value={isEditing ? editData?.phone : accountData?.phone}
                        onChange={(e) =>
                          setEditData({ ...editData, phone: e.target.value })
                        }
                        disabled={!isEditing}
                        className="h-11 rounded-lg border border-[#BCBCBC] text-black bg-white focus:ring-0 transition-all text-base font-medium shadow-none"
                      />
                    </div>

                    {/* Address Autocomplete or Display */}
                    {isEditing ? (
                      <div className="space-y-1.5 md:col-span-2">
                        <AddressAutocomplete
                          initialValue={
                            editData?.formattedAddress ||
                            accountData.formattedAddress
                          }
                          onAddressSelect={(address) => {
                            setEditData({
                              ...editData,
                              addressLine1: address.addressLine1 || "",
                              addressLine2: address.addressLine2 || "",
                              city: address.city || "",
                              state: address.state || "",
                              country: address.country || "",
                              zipCode: address.zipCode || "",
                              formattedAddress: address.formattedAddress || "",
                              latitude: address.latitude?.toString() || "",
                              longitude: address.longitude?.toString() || "",
                              placeId: address.placeId || "",
                            });
                          }}
                          disabled={!isEditing}
                          label="Address"
                          placeholder="Start typing your address..."
                        />
                      </div>
                    ) : (
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
                            accountData?.formattedAddress || "No address set"
                          }
                          disabled
                          className="h-11 rounded-lg border border-[#BCBCBC] text-black bg-gray-50 focus:ring-0 transition-all text-base font-medium shadow-none cursor-not-allowed"
                        />
                      </div>
                    )}

                    {/* City, State, Zip, Country */}
                    <div className="space-y-1.5">
                      <Label
                        htmlFor="city"
                        className="font-bold text-gray-700 text-sm"
                      >
                        City
                      </Label>
                      <Input
                        id="city"
                        value={isEditing ? editData?.city : accountData.city}
                        onChange={(e) =>
                          setEditData({ ...editData, city: e.target.value })
                        }
                        disabled={!isEditing}
                        className="h-11 rounded-lg border border-[#BCBCBC] text-black bg-white focus:ring-0 transition-all text-base font-medium shadow-none"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <Label
                        htmlFor="state"
                        className="font-bold text-gray-700 text-sm"
                      >
                        State
                      </Label>
                      <Input
                        id="state"
                        value={isEditing ? editData?.state : accountData.state}
                        onChange={(e) =>
                          setEditData({ ...editData, state: e.target.value })
                        }
                        disabled={!isEditing}
                        className="h-11 rounded-lg border border-[#BCBCBC] text-black bg-white focus:ring-0 transition-all text-base font-medium shadow-none"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <Label
                        htmlFor="zipCode"
                        className="font-bold text-gray-700 text-sm"
                      >
                        ZIP Code
                      </Label>
                      <Input
                        id="zipCode"
                        value={
                          isEditing ? editData?.zipCode : accountData.zipCode
                        }
                        onChange={(e) =>
                          setEditData({ ...editData, zipCode: e.target.value })
                        }
                        disabled={!isEditing}
                        className="h-11 rounded-lg border border-[#BCBCBC] text-black bg-white focus:ring-0 transition-all text-base font-medium shadow-none"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <Label
                        htmlFor="country"
                        className="font-bold text-gray-700 text-sm"
                      >
                        Country
                      </Label>
                      <Input
                        id="country"
                        value={
                          isEditing ? editData?.country : accountData.country
                        }
                        onChange={(e) =>
                          setEditData({ ...editData, country: e.target.value })
                        }
                        disabled={!isEditing}
                        className="h-11 rounded-lg border border-[#BCBCBC] text-black bg-white focus:ring-0 transition-all text-base font-medium shadow-none"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Settings Tab */}
          {activeTab === "settings" && (
            <div className="space-y-6 animate-scale-in">
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

                    <div className="flex items-center gap-3">
                      {isMfaUpdating && (
                        <Loader2 className="w-4 h-4 animate-spin text-[var(--primary)]" />
                      )}
                      <Switch
                        checked={accountData.isMfaEnabled}
                        disabled={isMfaUpdating}
                        onCheckedChange={handleMfaToggle}
                        className="data-[state=checked]:bg-[var(--green)] border border-gray-600 "
                      />
                    </div>
                  </div>

                  {isChangePasswordEnable && (
                    <ChangePasswordModal
                      open={isChangePasswordEnable}
                      onSave={handleChangePassword}
                      onClose={() => setIsChangePasswordEnable(false)}
                    />
                  )}

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
                      onClick={() => setIsChangePasswordEnable(true)}
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
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
