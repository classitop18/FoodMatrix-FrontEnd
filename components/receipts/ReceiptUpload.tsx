"use client";

import { useState } from "react";
import { Upload, X, FileText, Loader2 } from "lucide-react";
import { useUploadReceiptMutation } from "@/services/receipt/receipt.mutation";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Receipt } from "@/services/receipt/types/receipt.types";

interface ReceiptUploadProps {
    onUploadSuccess: (receipt: Receipt) => void;
    eventId?: string;
    shoppingListId?: string;
}

export function ReceiptUpload({ onUploadSuccess, eventId, shoppingListId }: ReceiptUploadProps) {
    const [file, setFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const uploadMutation = useUploadReceiptMutation();

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const selectedFile = e.target.files[0];
            setFile(selectedFile);

            if (selectedFile.type.startsWith("image/")) {
                const url = URL.createObjectURL(selectedFile);
                setPreviewUrl(url);
            } else {
                setPreviewUrl(null);
            }
        }
    };

    const handleUpload = () => {
        if (!file) return;

        uploadMutation.mutate({ files: [file], billType: "single", eventId, shoppingListId }, {
            onSuccess: (receipt) => {
                toast.success("Receipt scanned successfully!");
                const singleReceipt = Array.isArray(receipt) ? receipt[0] : receipt;
                onUploadSuccess(singleReceipt);
                setFile(null);
                setPreviewUrl(null);
            },
            onError: (error: any) => {
                toast.error(error.response?.data?.message || "Failed to scan receipt");
                console.error("Upload error:", error);
            }
        });
    };

    const clearFile = () => {
        setFile(null);
        setPreviewUrl(null);
    };

    return (
        <div className="border-2 border-dashed border-gray-200 hover:border-[#7661d3]/30 rounded-xl p-6 flex flex-col items-center justify-center bg-gray-50/50 hover:bg-[#F3F0FD]/20 transition-all group">
            {file ? (
                <div className="w-full space-y-4">
                    <div className="relative rounded-lg overflow-hidden border border-gray-100 bg-white p-2 flex items-center gap-4 shadow-sm">
                        {previewUrl ? (
                            <img src={previewUrl} alt="Preview" className="w-16 h-16 object-cover rounded-md" />
                        ) : (
                            <div className="w-16 h-16 bg-[#F3F0FD] rounded-md flex items-center justify-center">
                                <FileText className="w-8 h-8 text-[#7661d3]" />
                            </div>
                        )}
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-bold text-[#313131] truncate">{file.name}</p>
                            <p className="text-xs text-gray-500">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                        </div>
                        <Button variant="ghost" size="icon" onClick={clearFile} disabled={uploadMutation.isPending} className="hover:bg-red-50 hover:text-red-500">
                            <X className="w-4 h-4" />
                        </Button>
                    </div>

                    <Button
                        onClick={handleUpload}
                        className="w-full bg-[#7dab4f] hover:bg-[#5a8c3e] text-white font-bold shadow-md hover:shadow-lg transition-all"
                        disabled={uploadMutation.isPending}
                    >
                        {uploadMutation.isPending ? (
                            <>
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                SCANNING...
                            </>
                        ) : (
                            "SCAN RECEIPT"
                        )}
                    </Button>
                </div>
            ) : (
                <label className="cursor-pointer w-full flex flex-col items-center">
                    <div className="w-14 h-14 bg-white rounded-full shadow-sm border border-gray-100 flex items-center justify-center mb-4 text-[#7661d3] group-hover:scale-110 transition-transform">
                        <Upload className="w-6 h-6" />
                    </div>
                    <p className="text-sm font-bold text-[#313131]">Click to upload receipt</p>
                    <p className="text-xs text-gray-500 mt-1">Supports JPG, PNG, PDF</p>
                    <input
                        type="file"
                        className="hidden"
                        accept="image/*,application/pdf"
                        onChange={handleFileChange}
                    />
                </label>
            )}
        </div>
    );
}
