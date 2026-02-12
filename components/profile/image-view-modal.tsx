"use client";

import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { X, Camera, UploadCloud } from "lucide-react";
import { API_BASE_URL } from "@/lib/api/endpoints";
import { cn } from "@/lib/utils";

interface ImageViewModalProps {
    isOpen: boolean;
    onClose: () => void;
    imageUrl: string | null;
    altText: string;
    onUploadClick: () => void;
    isUploading: boolean;
}

export function ImageViewModal({
    isOpen,
    onClose,
    imageUrl,
    altText,
    onUploadClick,
    isUploading,
}: ImageViewModalProps) {
    const getImageUrl = (url: string | null) => {
        if (!url) return null;
        return url.startsWith("http")
            ? url
            : `${API_BASE_URL.replace("/api/v1", "")}${url}`;
    };

    const actualImageUrl = getImageUrl(imageUrl);

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-none w-screen h-screen bg-black/90 border-none p-0 flex flex-col items-center justify-center gap-0 focus:outline-none">

                <DialogTitle className="sr-only">Profile Picture</DialogTitle>

                {/* Close Button */}
                <button
                    onClick={onClose}
                    className="absolute top-6 right-6 p-2 rounded-full bg-black/20 hover:bg-white/10 text-white/70 hover:text-white transition-colors z-50 backdrop-blur-sm"
                >
                    <X className="w-8 h-8" />
                </button>

                {/* Main Image Container */}
                <div className="relative group animate-in zoom-in-95 duration-300">
                    <div className="relative w-[300px] h-[300px] sm:w-[500px] sm:h-[500px] rounded-full overflow-hidden border-4 border-white/10 shadow-2xl bg-neutral-900 flex items-center justify-center">
                        {actualImageUrl ? (
                            <img
                                src={actualImageUrl}
                                alt={altText}
                                className="w-full h-full object-cover"
                            />
                        ) : (
                            <div className="w-full h-full bg-gradient-to-br from-[var(--primary)] to-[var(--primary-light)] flex items-center justify-center text-white text-8xl font-extrabold select-none">
                                {altText.charAt(0).toUpperCase()}
                            </div>
                        )}

                        {/* Uploading Overlay */}
                        {isUploading && (
                            <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center z-20 backdrop-blur-sm gap-3">
                                <div className="animate-spin rounded-full h-12 w-12 border-4 border-white/30 border-t-white"></div>
                                <span className="text-white font-medium tracking-wide">Uploading...</span>
                            </div>
                        )}
                    </div>

                    {/* Floating Action Button for Upload */}
                    <button
                        onClick={onUploadClick}
                        disabled={isUploading}
                        className={cn(
                            "absolute bottom-4 right-4 sm:bottom-8 sm:right-8",
                            "flex items-center justify-center w-14 h-14 sm:w-16 sm:h-16 rounded-full",
                            "bg-[var(--primary)] text-white shadow-xl hover:bg-[var(--primary)]/90 hover:scale-105 active:scale-95 transition-all duration-300",
                            "disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                        )}
                        title="Change Photo"
                    >
                        <Camera className="w-6 h-6 sm:w-8 sm:h-8" />
                    </button>
                </div>

                <p className="mt-8 text-white/50 text-sm font-medium tracking-wide">
                    Tap the camera icon to update your photo
                </p>

            </DialogContent>
        </Dialog>
    );
}
