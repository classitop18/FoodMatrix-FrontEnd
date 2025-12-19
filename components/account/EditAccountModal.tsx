"use client";

import React, { useEffect, useState } from "react";
import { X, Home, MapPin, DollarSign, Loader2 } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { AccountService } from "@/services/account/account.service";
import { toast } from "@/hooks/use-toast";
import { AddressAutocomplete } from "@/components/profile/address-autocomplete";

interface EditAccountModalProps {
    isOpen: boolean;
    onClose: () => void;
    account: any;
}

const accountService = new AccountService();

export default function EditAccountModal({
    isOpen,
    onClose,
    account,
}: EditAccountModalProps) {
    const queryClient = useQueryClient();
    const [formData, setFormData] = useState({
        accountName: "",
        description: "",
        addressLine1: "",
        addressLine2: "",
        city: "",
        state: "",
        zipCode: "",
        country: "",
        formattedAddress: "",
    });

    const [addressData, setAddressData] = useState<any>(null);

    // Populate form when account changes
    useEffect(() => {
        if (account) {
            setFormData({
                accountName: account.accountName || "",
                description: account.description || "",
                addressLine1: account.addressLine1 || "",
                addressLine2: account.addressLine2 || "",
                city: account.city || "",
                state: account.state || "",
                zipCode: account.zipCode || "",
                country: account.country || "",
                formattedAddress: account.formattedAddress || "",
            });
        }
    }, [account]);

    const updateAccountMutation = useMutation({
        mutationFn: async (data: any) => {
            return await accountService.updateAccount(account.id, data);
        },
        onSuccess: () => {
            toast({
                title: "Account updated successfully!",
                description: "Your account information has been updated.",
                variant: "default",
            });

            // Invalidate queries to refresh data
            queryClient.invalidateQueries({ queryKey: ["myaccounts"] });
            queryClient.invalidateQueries({ queryKey: ["account", account.id] });
            onClose();
        },
        onError: (error: any) => {
            toast({
                title: "Failed to update account",
                description:
                    error?.response?.data?.message || "Failed to update account",
                variant: "destructive",
            });
        },
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.accountName.trim()) {
            toast({
                title: "Account name is required",
                description: "Please enter an account name",
                variant: "destructive",
            });
            return;
        }

        // Only send fields that have changed
        const updateData: any = {};

        if (formData.accountName !== account.accountName) {
            updateData.accountName = formData.accountName.trim();
        }
        if (formData.description !== (account.description || "")) {
            updateData.description = formData.description.trim();
        }

        // If address data from Google Places exists, use it
        if (addressData) {
            updateData.addressLine1 = addressData.addressLine1;
            updateData.addressLine2 = addressData.addressLine2;
            updateData.city = addressData.city;
            updateData.state = addressData.state;
            updateData.country = addressData.country;
            updateData.zipCode = addressData.zipCode;
            updateData.formattedAddress = addressData.formattedAddress;
            updateData.latitude = addressData.latitude;
            updateData.longitude = addressData.longitude;
            updateData.placeId = addressData.placeId;
        } else {
            // Otherwise, check manually edited fields
            if (formData.addressLine1 !== (account.addressLine1 || "")) {
                updateData.addressLine1 = formData.addressLine1.trim();
            }
            if (formData.addressLine2 !== (account.addressLine2 || "")) {
                updateData.addressLine2 = formData.addressLine2.trim();
            }
            if (formData.city !== (account.city || "")) {
                updateData.city = formData.city.trim();
            }
            if (formData.state !== (account.state || "")) {
                updateData.state = formData.state.trim();
            }
            if (formData.zipCode !== (account.zipCode || "")) {
                updateData.zipCode = formData.zipCode.trim();
            }
            if (formData.country !== (account.country || "")) {
                updateData.country = formData.country.trim();
            }
            if (formData.formattedAddress !== (account.formattedAddress || "")) {
                updateData.formattedAddress = formData.formattedAddress.trim();
            }
        }

        // If nothing changed, just close
        if (Object.keys(updateData).length === 0) {
            toast({
                title: "No changes detected",
                description: "No changes were made to the account",
                variant: "default",
            });
            onClose();
            return;
        }

        updateAccountMutation.mutate(updateData);
    };

    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
    ) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
            <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] flex flex-col animate-in zoom-in-95 duration-200">
                {/* Header - Fixed */}
                <div className="bg-gradient-to-r from-[#7661d3] to-[#3d326d] text-white p-6 rounded-t-2xl flex-shrink-0">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="h-10 w-10 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
                                <Home size={20} />
                            </div>
                            <div>
                                <h2 className="text-xl font-extrabold">Edit Account Details</h2>
                                <p className="text-sm text-white/80 mt-0.5">
                                    Update your account information
                                </p>
                            </div>
                        </div>
                        <button
                            onClick={onClose}
                            className="h-8 w-8 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center transition-all"
                        >
                            <X size={18} />
                        </button>
                    </div>
                </div>

                {/* Form - Scrollable */}
                <form onSubmit={handleSubmit} className="flex flex-col flex-1 min-h-0">
                    <div className="overflow-y-auto flex-1 p-6 space-y-6">
                        {/* Account Information Section */}
                        <div className="space-y-5">
                            <h3 className="text-sm font-bold text-gray-700 uppercase tracking-widest flex items-center gap-2">
                                <span className="w-1 h-4 bg-[#7661d3] rounded-full"></span>
                                Account Information
                            </h3>

                            {/* Account Name */}
                            <div>
                                <label className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 block">
                                    Account Name *
                                </label>
                                <div className="relative">
                                    <Home
                                        size={18}
                                        className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                                    />
                                    <input
                                        type="text"
                                        name="accountName"
                                        value={formData.accountName}
                                        onChange={handleChange}
                                        placeholder="Enter account name"
                                        className="w-full pl-11 pr-4 py-3 rounded-xl border border-gray-200 focus:border-[#7661d3] focus:ring-2 focus:ring-[#7661d3]/20 outline-none transition-all text-sm font-medium"
                                        required
                                    />
                                </div>
                            </div>

                            {/* Description */}
                            <div>
                                <label className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 block">
                                    Description (Optional)
                                </label>
                                <textarea
                                    name="description"
                                    value={formData.description}
                                    onChange={handleChange}
                                    placeholder="Add a description for this account"
                                    rows={3}
                                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#7661d3] focus:ring-2 focus:ring-[#7661d3]/20 outline-none transition-all text-sm font-medium resize-none"
                                />
                            </div>
                        </div>

                        {/* Address Section */}
                        <div className="space-y-5 pt-4 border-t border-gray-100">
                            <h3 className="text-sm font-bold text-gray-700 uppercase tracking-widest flex items-center gap-2">
                                <MapPin size={16} className="text-[#7661d3]" />
                                Address Information
                            </h3>

                            {/* Google Places Address Autocomplete */}
                            <div>
                                <AddressAutocomplete
                                    onAddressSelect={(address) => {
                                        setAddressData(address);
                                        // Also update form fields for display
                                        setFormData(prev => ({
                                            ...prev,
                                            addressLine1: address.addressLine1 || "",
                                            addressLine2: address.addressLine2 || "",
                                            city: address.city || "",
                                            state: address.state || "",
                                            zipCode: address.zipCode || "",
                                            country: address.country || "",
                                            formattedAddress: address.formattedAddress || "",
                                        }));
                                    }}
                                    initialValue={formData.formattedAddress}
                                    label="Search Address"
                                    placeholder="Start typing your address..."
                                />
                                <p className="text-xs text-gray-500 mt-2">
                                    This will be used for delivery and location-based recommendations
                                </p>
                            </div>

                            {/* Or Manual Entry Label */}
                            <div className="flex items-center gap-3">
                                <div className="flex-1 border-t border-gray-200"></div>
                                <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                                    Or Enter Manually
                                </span>
                                <div className="flex-1 border-t border-gray-200"></div>
                            </div>

                            {/* Address Line 1 */}
                            <div>
                                <label className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 block">
                                    Address Line 1
                                </label>
                                <input
                                    type="text"
                                    name="addressLine1"
                                    value={formData.addressLine1}
                                    onChange={handleChange}
                                    placeholder="Street address, P.O. box"
                                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#7661d3] focus:ring-2 focus:ring-[#7661d3]/20 outline-none transition-all text-sm font-medium"
                                />
                            </div>

                            {/* Address Line 2 */}
                            <div>
                                <label className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 block">
                                    Address Line 2
                                </label>
                                <input
                                    type="text"
                                    name="addressLine2"
                                    value={formData.addressLine2}
                                    onChange={handleChange}
                                    placeholder="Apartment, suite, unit, building, floor, etc."
                                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#7661d3] focus:ring-2 focus:ring-[#7661d3]/20 outline-none transition-all text-sm font-medium"
                                />
                            </div>

                            {/* City, State, Zip */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div>
                                    <label className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 block">
                                        City
                                    </label>
                                    <input
                                        type="text"
                                        name="city"
                                        value={formData.city}
                                        onChange={handleChange}
                                        placeholder="City"
                                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#7661d3] focus:ring-2 focus:ring-[#7661d3]/20 outline-none transition-all text-sm font-medium"
                                    />
                                </div>

                                <div>
                                    <label className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 block">
                                        State
                                    </label>
                                    <input
                                        type="text"
                                        name="state"
                                        value={formData.state}
                                        onChange={handleChange}
                                        placeholder="State"
                                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#7661d3] focus:ring-2 focus:ring-[#7661d3]/20 outline-none transition-all text-sm font-medium"
                                    />
                                </div>

                                <div>
                                    <label className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 block">
                                        ZIP Code
                                    </label>
                                    <input
                                        type="text"
                                        name="zipCode"
                                        value={formData.zipCode}
                                        onChange={handleChange}
                                        placeholder="ZIP"
                                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#7661d3] focus:ring-2 focus:ring-[#7661d3]/20 outline-none transition-all text-sm font-medium"
                                    />
                                </div>
                            </div>

                            {/* Country */}
                            <div>
                                <label className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 block">
                                    Country
                                </label>
                                <input
                                    type="text"
                                    name="country"
                                    value={formData.country}
                                    onChange={handleChange}
                                    placeholder="Country"
                                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#7661d3] focus:ring-2 focus:ring-[#7661d3]/20 outline-none transition-all text-sm font-medium"
                                />
                            </div>
                        </div>

                        {/* Info Box */}
                        <div className="bg-[#F3F0FD] rounded-xl p-4 border border-[#7661d3]/10">
                            <p className="text-xs text-gray-600 leading-relaxed">
                                <span className="font-bold text-[#7661d3]">Note:</span> Budget
                                settings and preferences can be managed separately. Only basic
                                account information and address can be updated here.
                            </p>
                        </div>
                    </div>

                    {/* Action Buttons - Fixed at bottom */}
                    <div className="p-6 pt-0 flex-shrink-0 border-t border-gray-100">
                        <div className="flex gap-3">
                            <button
                                type="button"
                                onClick={onClose}
                                className="flex-1 px-4 py-3 rounded-xl border border-gray-200 text-gray-700 font-bold text-sm hover:bg-gray-50 transition-all"
                                disabled={updateAccountMutation.isPending}
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={updateAccountMutation.isPending}
                                className="flex-1 px-4 py-3 rounded-xl bg-gradient-to-r from-[#7661d3] to-[#3d326d] text-white font-bold text-sm hover:shadow-lg hover:scale-[1.02] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                            >
                                {updateAccountMutation.isPending ? (
                                    <>
                                        <Loader2 size={16} className="animate-spin" />
                                        Updating...
                                    </>
                                ) : (
                                    "Save Changes"
                                )}
                            </button>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
}
