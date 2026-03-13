"use client";

import { useState, KeyboardEvent } from "react";
import { Upload, X, FileText, Loader2, ScanLine, Tag, AlignLeft, ChevronRight, ChevronLeft } from "lucide-react";
import { useUploadReceiptMutation } from "@/services/receipt/receipt.mutation";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

interface ReceiptUploadButtonProps {
    onSuccess?: () => void;
    variant?: "default" | "compact";
}

type Step = "file" | "details";

export function ReceiptUploadButton({ onSuccess, variant = "default" }: ReceiptUploadButtonProps) {
    const [open, setOpen] = useState(false);
    const [step, setStep] = useState<Step>("file");
    const [file, setFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [description, setDescription] = useState("");
    const [tagInput, setTagInput] = useState("");
    const [tags, setTags] = useState<string[]>([]);

    const uploadMutation = useUploadReceiptMutation();

    const resetAll = () => {
        setStep("file");
        setFile(null);
        setPreviewUrl(null);
        setDescription("");
        setTagInput("");
        setTags([]);
    };

    const handleClose = () => {
        setOpen(false);
        resetAll();
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const selectedFile = e.target.files[0];
            setFile(selectedFile);
            setPreviewUrl(
                selectedFile.type.startsWith("image/")
                    ? URL.createObjectURL(selectedFile)
                    : null
            );
            // Auto-advance to details step
            setTimeout(() => setStep("details"), 150);
        }
    };

    const addTag = () => {
        const trimmed = tagInput.trim().toLowerCase();
        if (trimmed && !tags.includes(trimmed)) setTags((p) => [...p, trimmed]);
        setTagInput("");
    };

    const handleTagKey = (e: KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Enter" || e.key === ",") { e.preventDefault(); addTag(); }
        else if (e.key === "Backspace" && !tagInput && tags.length > 0) {
            setTags((p) => p.slice(0, -1));
        }
    };

    const handleUpload = () => {
        if (!file) return;

        // Append any pending tag
        const finalTags = [...tags];
        if (tagInput.trim()) {
            const t = tagInput.trim().toLowerCase();
            if (!finalTags.includes(t)) finalTags.push(t);
        }

        uploadMutation.mutate(
            {
                file,
                description: description.trim() || undefined,
                tags: finalTags.length > 0 ? finalTags : undefined,
            },
            {
                onSuccess: () => {
                    toast.success("Receipt scanned and saved!");
                    handleClose();
                    onSuccess?.();
                },
                onError: (err: any) => {
                    toast.error(err?.response?.data?.message || "Failed to scan receipt");
                },
            }
        );
    };

    const isPdf = file?.type === "application/pdf";

    return (
        <>
            <Button
                onClick={() => setOpen(true)}
                className="bg-gradient-to-r from-[#7661d3] to-[#5a468a] hover:from-[#6450c2] hover:to-[#4a3878] text-white font-extrabold shadow-md rounded-xl gap-2 px-5"
            >
                <ScanLine className="w-4 h-4" />
                {variant !== "compact" && "Scan Receipt"}
            </Button>

            <Dialog open={open} onOpenChange={(v) => { if (!v) handleClose(); else setOpen(true); }}>
                <DialogContent className="sm:max-w-[480px] rounded-2xl p-0 overflow-hidden gap-0">
                    {/* Header */}
                    <DialogHeader className="px-6 pt-5 pb-4 bg-gradient-to-br from-[#3d326d] via-[#5a468a] to-[#7661d3]">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-white/15 border border-white/20 flex items-center justify-center flex-shrink-0">
                                <ScanLine className="w-5 h-5 text-white" />
                            </div>
                            <div>
                                <DialogTitle className="text-white font-extrabold text-base leading-tight">
                                    {step === "file" ? "Upload Receipt" : "Add Details"}
                                </DialogTitle>
                                <p className="text-white/60 text-xs mt-0.5">
                                    {step === "file"
                                        ? "Upload a JPG, PNG or PDF receipt to scan"
                                        : "Add a description and tags for this receipt"}
                                </p>
                            </div>
                        </div>

                        {/* Step indicators */}
                        <div className="flex items-center gap-2 mt-4">
                            {(["file", "details"] as Step[]).map((s, i) => (
                                <div key={s} className="flex items-center gap-2">
                                    <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-extrabold transition-all ${step === s ? "bg-white text-[#7661d3]" : step === "details" && s === "file" ? "bg-white/30 text-white" : "bg-white/15 text-white/50"}`}>
                                        {step === "details" && s === "file" ? "✓" : i + 1}
                                    </div>
                                    <span className={`text-xs font-semibold capitalize ${step === s ? "text-white" : "text-white/50"}`}>
                                        {s === "file" ? "Choose file" : "Add details"}
                                    </span>
                                    {i === 0 && <div className="w-8 h-0.5 bg-white/20 rounded" />}
                                </div>
                            ))}
                        </div>
                    </DialogHeader>

                    {/* Body */}
                    <div className="px-6 py-5 bg-white">
                        {/* ── Step 1: File ── */}
                        {step === "file" && (
                            <label className="cursor-pointer w-full flex flex-col items-center border-[1.5px] border-dashed border-[#7661d3]/30 hover:border-[#7661d3] rounded-2xl p-10 bg-[#f8f7fc] hover:bg-[#F3F0FD]/80 transition-all group">
                                <div className="w-16 h-16 bg-white rounded-full shadow-sm border border-[#7661d3]/15 flex items-center justify-center mb-4 text-[#7661d3] group-hover:scale-110 transition-transform group-hover:shadow-md">
                                    <Upload className="w-7 h-7" />
                                </div>
                                <p className="text-sm font-extrabold text-[#313131]">Click to select a document</p>
                                <p className="text-[11px] text-gray-500 mt-1 font-medium">JPEG, PNG, or PDF format</p>
                                <div className="mt-4 px-3 py-1 bg-white border border-[#7661d3]/20 text-[#7661d3] text-[10px] font-bold rounded-full">
                                    Up to 10MB
                                </div>
                                <input type="file" className="hidden" accept="image/*,application/pdf" onChange={handleFileChange} />
                            </label>
                        )}

                        {/* ── Step 2: Details ── */}
                        {step === "details" && file && !uploadMutation.isPending && (
                            <div className="space-y-5">
                                {/* File preview */}
                                <div className="flex items-center gap-3 bg-gray-50 border border-gray-100 rounded-xl px-3 py-2.5">
                                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${isPdf ? "bg-[#F3F0FD]" : "bg-[#e8f5e0]"}`}>
                                        {previewUrl ? (
                                            <img src={previewUrl} alt="" className="w-10 h-10 object-cover rounded-lg" />
                                        ) : (
                                            <FileText className={`w-5 h-5 ${isPdf ? "text-[#7661d3]" : "text-[#7dab4f]"}`} />
                                        )}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-bold text-[#313131] truncate">{file.name}</p>
                                        <p className="text-xs text-gray-400">{(file.size / 1024 / 1024).toFixed(2)} MB · {isPdf ? "PDF" : "Image"}</p>
                                    </div>
                                    <button onClick={() => { setFile(null); setPreviewUrl(null); setStep("file"); }} className="w-6 h-6 rounded-full bg-gray-200 hover:bg-red-100 hover:text-red-500 flex items-center justify-center transition-colors">
                                        <X className="w-3 h-3" />
                                    </button>
                                </div>

                                {/* Description */}
                                <div className="space-y-1.5">
                                    <Label className="text-xs font-extrabold text-gray-500 uppercase tracking-wide flex items-center gap-1.5">
                                        <AlignLeft className="w-3 h-3" /> Description <span className="text-gray-300 font-normal normal-case tracking-normal">(optional)</span>
                                    </Label>
                                    <Textarea
                                        value={description}
                                        onChange={(e) => setDescription(e.target.value)}
                                        placeholder="e.g. Weekly groceries, Diwali party supplies, Birthday dinner..."
                                        className="resize-none h-[72px] text-sm border-gray-200 rounded-xl focus:border-[#7661d3] bg-gray-50/50"
                                        maxLength={300}
                                    />
                                    <p className="text-right text-[11px] text-gray-400">{description.length}/300</p>
                                </div>

                                {/* Tags */}
                                <div className="space-y-1.5">
                                    <Label className="text-xs font-extrabold text-gray-500 uppercase tracking-wide flex items-center gap-1.5">
                                        <Tag className="w-3 h-3" /> Tags <span className="text-gray-300 font-normal normal-case tracking-normal">(optional)</span>
                                    </Label>
                                    <div className="min-h-[46px] px-3 py-2 border border-gray-200 rounded-xl bg-gray-50/50 focus-within:border-[#7661d3] focus-within:ring-1 focus-within:ring-[#7661d3]/20 transition-all flex flex-wrap gap-1.5 items-center">
                                        {tags.map((tag, i) => (
                                            <span key={i} className="inline-flex items-center gap-1 bg-[#F3F0FD] text-[#7661d3] text-[11px] font-bold px-2 py-1 rounded-full border border-[#7661d3]/10">
                                                <Tag className="w-2.5 h-2.5" />
                                                {tag}
                                                <button onClick={() => setTags((p) => p.filter((_, j) => j !== i))} className="ml-0.5 hover:text-red-500">
                                                    <X className="w-2.5 h-2.5" />
                                                </button>
                                            </span>
                                        ))}
                                        <input
                                            value={tagInput}
                                            onChange={(e) => setTagInput(e.target.value)}
                                            onKeyDown={handleTagKey}
                                            onBlur={addTag}
                                            placeholder={tags.length === 0 ? "Type tag, press Enter..." : "Add more..."}
                                            className="flex-1 min-w-[100px] bg-transparent text-xs text-gray-700 outline-none placeholder:text-gray-400"
                                        />
                                    </div>
                                    <p className="text-[11px] text-gray-400">
                                        Press <kbd className="bg-gray-100 px-1 rounded text-[10px]">Enter</kbd> to add · <kbd className="bg-gray-100 px-1 rounded text-[10px]">Backspace</kbd> to remove last
                                    </p>
                                </div>
                            </div>
                        )}

                        {/* ── Step 2: Scanning Animation ── */}
                        {step === "details" && file && uploadMutation.isPending && (
                            <div className="relative w-full h-[320px] rounded-2xl overflow-hidden bg-gray-50 flex items-center justify-center border border-gray-200">
                                {previewUrl ? (
                                    <div
                                        className="absolute inset-0 bg-cover bg-center blur-[4px] opacity-60 scale-105"
                                        style={{ backgroundImage: `url(${previewUrl})` }}
                                    />
                                ) : (
                                    <FileText className="w-16 h-16 text-gray-300 blur-sm" />
                                )}

                                <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#7dab4f]/5 to-transparent pointer-events-none" />

                                <div
                                    className="absolute left-0 right-0 h-1 bg-[#7dab4f] shadow-[0_0_20px_5px_rgba(125,171,79,0.5)] z-10 w-full"
                                    style={{
                                        animation: "scanLine 2.5s cubic-bezier(0.4, 0, 0.2, 1) infinite"
                                    }}
                                />

                                <div className="relative z-20 flex flex-col items-center justify-center">
                                    <div className="bg-white/95 backdrop-blur-md px-5 py-3 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] flex items-center gap-3 border border-white/50">
                                        <Loader2 className="w-5 h-5 text-[#7dab4f] animate-spin" />
                                        <span className="text-sm font-extrabold text-[#313131] tracking-tight">Extracting Data...</span>
                                    </div>
                                    <p className="text-[11px] text-gray-500 font-semibold mt-3 bg-white/90 px-3 py-1 rounded-full shadow-sm">
                                        Items • Amount • Taxes • Date
                                    </p>
                                </div>

                                <style>{`
                                    @keyframes scanLine {
                                        0% { top: 0%; opacity: 0; }
                                        5% { opacity: 1; }
                                        95% { opacity: 1; }
                                        100% { top: 100%; opacity: 0; }
                                    }
                                `}</style>
                            </div>
                        )}
                    </div>

                    {/* Footer */}
                    {step === "details" && !uploadMutation.isPending && (
                        <div className="px-6 py-4  bg-white/95  border-t border-gray-100 flex items-center gap-3">
                            <Button
                                variant="ghost"
                                onClick={() => setStep("file")}
                                disabled={uploadMutation.isPending}
                                className="rounded-xl text-gray-500 hover:text-gray-700 gap-1 text-sm"
                            >
                                <ChevronLeft className="w-4 h-4" /> Back
                            </Button>
                            <Button
                                onClick={handleUpload}
                                disabled={uploadMutation.isPending || !file}
                                className="flex-1 bg-gradient-to-r from-[#7dab4f] to-[#5a8c3e] hover:from-[#6a9a40] hover:to-[#4a7a2e] text-white font-extrabold shadow-md rounded-xl gap-2"
                            >
                                {uploadMutation.isPending ? (
                                    <><Loader2 className="w-4 h-4 animate-spin" /> Scanning receipt...</>
                                ) : (
                                    <><ScanLine className="w-4 h-4" /> Scan &amp; Save</>
                                )}
                            </Button>
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </>
    );
}
