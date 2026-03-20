"use client";

import { useState, useEffect, KeyboardEvent } from "react";
import {
    Upload, X, FileText, Loader2, ScanLine,
    Tag, AlignLeft, ChevronLeft, Files, File
} from "lucide-react";
import { useUploadReceiptMutation } from "@/services/receipt/receipt.mutation";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

// ─── Types ────────────────────────────────────────────────────────────────────

type Step = "type" | "file" | "details";
type BillType = "single" | "multiple";

interface ReceiptUploadButtonProps {
    onSuccess?: () => void;
    variant?: "default" | "compact";
}

// ─── Constants ────────────────────────────────────────────────────────────────

const STEPS: { value: Step; label: string }[] = [
    { value: "type", label: "Choose Option" },
    { value: "file", label: "Upload File" },
    { value: "details", label: "Add Details" },
];

const BILL_TYPES: {
    value: BillType;
    label: string;
    description: string;
    example: { files: string[]; arrow: string; bills: string[] };
    Icon: React.ElementType;
}[] = [
        {
            value: "single",
            label: "Individual Bills",
            description: "Each file is a separate bill/receipt",
            example: {
                files: ["receipt_1.pdf", "receipt_2.jpg", "receipt_3.png"],
                arrow: "→",
                bills: ["Bill 1", "Bill 2", "Bill 3"],
            },
            Icon: Files,
        },
        {
            value: "multiple",
            label: "Multi-page Single Bill",
            description: "All files together form one single bill",
            example: {
                files: ["page_1.jpg", "page_2.jpg", "page_3.jpg"],
                arrow: "→",
                bills: ["1 Bill"],
            },
            Icon: File,
        },
    ];

// ─── Sub-components ───────────────────────────────────────────────────────────

function StepIndicator({ currentStep }: { currentStep: Step }) {
    const currentIndex = STEPS.findIndex((s) => s.value === currentStep);
    return (
        <div className="flex items-center gap-2 mt-4">
            {STEPS.map((s, i) => {
                const isActive = i === currentIndex;
                const isCompleted = i < currentIndex;
                return (
                    <div key={s.value} className="flex items-center gap-2">
                        <div
                            className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-extrabold transition-all ${isActive || isCompleted
                                ? "bg-white text-[#7661d3]"
                                : "bg-white/20 text-white/50"
                                }`}
                        >
                            {isCompleted ? "✓" : i + 1}
                        </div>
                        <span className={`text-xs font-semibold ${isActive ? "text-white" : "text-white/60"}`}>
                            {s.label}
                        </span>
                        {i < STEPS.length - 1 && (
                            <div className={`w-8 h-0.5 rounded ${i < currentIndex ? "bg-white" : "bg-white/20"}`} />
                        )}
                    </div>
                );
            })}
        </div>
    );
}

function BillTypeCard({
    type,
    selected,
    onSelect,
}: {
    type: (typeof BILL_TYPES)[number];
    selected: boolean;
    onSelect: () => void;
}) {
    const { label, description, example, Icon } = type;
    return (
        <button
            type="button"
            onClick={onSelect}
            className={`w-full text-left rounded-xl border-2 p-4 transition-all focus:outline-none ${selected
                ? "border-[#7661d3] bg-[#F3F0FD]"
                : "border-gray-200 bg-gray-50 hover:border-[#7661d3]/40"
                }`}
        >
            {/* Title row */}
            <div className="flex items-center gap-3 mb-3">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${selected ? "bg-[#7661d3]" : "bg-gray-200"}`}>
                    <Icon className={`w-4 h-4 ${selected ? "text-white" : "text-gray-500"}`} />
                </div>
                <div>
                    <p className={`text-sm font-extrabold ${selected ? "text-[#3d326d]" : "text-gray-700"}`}>{label}</p>
                    <p className="text-[11px] text-gray-500">{description}</p>
                </div>
                <div className={`ml-auto w-4 h-4 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${selected ? "border-[#7661d3] bg-[#7661d3]" : "border-gray-300"
                    }`}>
                    {selected && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                </div>
            </div>

            {/* Visual Example */}
            <div className="flex items-center gap-2 flex-wrap bg-white rounded-lg px-3 py-2 border border-gray-100">
                {/* Files */}
                <div className="flex flex-col gap-1">
                    {example.files.map((f) => (
                        <span key={f} className="text-[10px] font-mono bg-gray-100 text-gray-600 px-2 py-0.5 rounded">
                            📄 {f}
                        </span>
                    ))}
                </div>

                {/* Arrow */}
                <span className="text-gray-400 text-sm font-bold">{example.arrow}</span>

                {/* Bills */}
                <div className="flex flex-col gap-1">
                    {example.bills.map((b) => (
                        <span
                            key={b}
                            className={`text-[10px] font-bold px-2 py-0.5 rounded ${selected
                                ? "bg-[#7661d3] text-white"
                                : "bg-gray-200 text-gray-600"
                                }`}
                        >
                            🧾 {b}
                        </span>
                    ))}
                </div>
            </div>
        </button>
    );
}

function TagInput({
    tags,
    tagInput,
    onTagInputChange,
    onTagKeyDown,
    onTagBlur,
    onRemoveTag,
}: {
    tags: string[];
    tagInput: string;
    onTagInputChange: (v: string) => void;
    onTagKeyDown: (e: KeyboardEvent<HTMLInputElement>) => void;
    onTagBlur: () => void;
    onRemoveTag: (i: number) => void;
}) {
    return (
        <div className="space-y-1.5">
            <Label className="text-xs font-extrabold text-gray-500 uppercase tracking-wide flex items-center gap-1.5">
                <Tag className="w-3 h-3" /> Tags{" "}
                <span className="text-gray-300 font-normal normal-case tracking-normal">(optional)</span>
            </Label>
            <div className="min-h-[46px] px-3 py-2 border border-gray-200 rounded-xl bg-gray-50/50 focus-within:border-[#7661d3] focus-within:ring-1 focus-within:ring-[#7661d3]/20 transition-all flex flex-wrap gap-1.5 items-center">
                {tags.map((tag, i) => (
                    <span
                        key={i}
                        className="inline-flex items-center gap-1 bg-[#F3F0FD] text-[#7661d3] text-[11px] font-bold px-2 py-1 rounded-full border border-[#7661d3]/10"
                    >
                        <Tag className="w-2.5 h-2.5" />
                        {tag}
                        <button onClick={() => onRemoveTag(i)} className="ml-0.5 hover:text-red-500">
                            <X className="w-2.5 h-2.5" />
                        </button>
                    </span>
                ))}
                <input
                    value={tagInput}
                    onChange={(e) => onTagInputChange(e.target.value)}
                    onKeyDown={onTagKeyDown}
                    onBlur={onTagBlur}
                    placeholder={tags.length === 0 ? "Type tag, press Enter..." : "Add more..."}
                    className="flex-1 min-w-[100px] bg-transparent text-xs text-gray-700 outline-none placeholder:text-gray-400"
                />
            </div>
            <p className="text-[11px] text-gray-400">
                Press <kbd className="bg-gray-100 px-1 rounded text-[10px]">Enter</kbd> to add ·{" "}
                <kbd className="bg-gray-100 px-1 rounded text-[10px]">Backspace</kbd> to remove last
            </p>
        </div>
    );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export function ReceiptUploadButton({ onSuccess, variant = "default" }: ReceiptUploadButtonProps) {
    const [open, setOpen] = useState(false);
    const [step, setStep] = useState<Step>("type");
    const [billType, setBillType] = useState<BillType>("single");
    const [files, setFiles] = useState<File[]>([]);
    const [previews, setPreviews] = useState<{ file: File; url: string | null }[]>([]);
    const [description, setDescription] = useState("");
    const [tagInput, setTagInput] = useState("");
    const [tags, setTags] = useState<string[]>([]);

    const uploadMutation = useUploadReceiptMutation();

    // ── Helpers ──

    const reset = () => {
        setStep("type");
        setFiles([]);
        setPreviews([]);
        setDescription("");
        setTagInput("");
        setTags([]);
        setBillType("single");
    };

    const handleClose = () => { setOpen(false); reset(); };

    // Cleanup URLs when unmounting or when Previews change
    useEffect(() => {
        return () => {
            previews.forEach((p) => {
                if (p.url) URL.revokeObjectURL(p.url);
            });
        };
    }, [previews]);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selected = e.target.files;
        if (!selected || selected.length === 0) return;

        const filesArray = Array.from(selected);

        // Revoke old URLs beforehand
        previews.forEach((p) => {
            if (p.url) URL.revokeObjectURL(p.url);
        });

        setFiles(filesArray);

        const previewList = filesArray.map((f) => ({
            file: f,
            url: f.type.startsWith("image/") ? URL.createObjectURL(f) : null
        }));

        setPreviews(previewList);

        setTimeout(() => setStep("details"), 150);
    };

    const handleRemoveFile = (index: number) => {
        const newFiles = [...files];
        const newPreviews = [...previews];

        const removed = newPreviews[index];
        if (removed.url) URL.revokeObjectURL(removed.url);

        newFiles.splice(index, 1);
        newPreviews.splice(index, 1);

        setFiles(newFiles);
        setPreviews(newPreviews);

        if (newFiles.length === 0) {
            setStep("file");
        }
    };

    const commitTag = () => {
        const t = tagInput.trim().toLowerCase();
        if (t && !tags.includes(t)) setTags((p) => [...p, t]);
        setTagInput("");
    };

    const handleTagKey = (e: KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Enter" || e.key === ",") { e.preventDefault(); commitTag(); }
        else if (e.key === "Backspace" && !tagInput && tags.length > 0) setTags((p) => p.slice(0, -1));
    };
    const handleUpload = () => {
        if (!files.length) return;

        const finalTags = [...tags];
        if (tagInput.trim()) {
            const t = tagInput.trim().toLowerCase();
            if (!finalTags.includes(t)) finalTags.push(t);
        }

        uploadMutation.mutate(
            {
                files, // send array now
                billType, // useful for backend
                description: description.trim() || undefined,
                tags: finalTags.length ? finalTags : undefined,
            },
            {
                onSuccess: () => {
                    toast.success("Receipts scanned and saved!");
                    handleClose();
                    onSuccess?.();
                },
                onError: (err: any) => {
                    toast.error(err?.response?.data?.message || "Failed to scan receipt");
                },
            }
        );
    };

    const isUploading = uploadMutation.isPending;

    // ── Render ──

    return (
        <>
            <Button
                onClick={() => setOpen(true)}
                className="bg-gradient-to-r from-[#7661d3] to-[#5a468a] hover:from-[#6450c2] hover:to-[#4a3878] text-white font-extrabold shadow-md rounded-xl gap-2 px-5"
            >
                <ScanLine className="w-4 h-4" />
                {variant !== "compact" && "Scan Receipt"}
            </Button>

            <Dialog open={open} onOpenChange={(v) => (v ? setOpen(true) : handleClose())}>
                <DialogContent className="sm:max-w-[480px] rounded-2xl p-0 overflow-hidden gap-0">

                    {/* ── Header ── */}
                    <DialogHeader className="px-6 pt-5 pb-4 bg-gradient-to-br from-[#3d326d] via-[#5a468a] to-[#7661d3]">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-white/15 border border-white/20 flex items-center justify-center flex-shrink-0">
                                <ScanLine className="w-5 h-5 text-white" />
                            </div>
                            <div>
                                <DialogTitle className="text-white font-extrabold text-base leading-tight">
                                    {step === "type" && "Choose Upload Type"}
                                    {step === "file" && "Upload Receipt"}
                                    {step === "details" && "Add Details"}
                                </DialogTitle>
                                <p className="text-white/60 text-xs mt-0.5">
                                    {step === "type" && "Select how your receipt files are organized"}
                                    {step === "file" && "Upload a JPG, PNG, or PDF receipt to scan"}
                                    {step === "details" && "Add a description and tags for this receipt"}
                                </p>
                            </div>
                        </div>
                        <StepIndicator currentStep={step} />
                    </DialogHeader>

                    {/* ── Body ── */}
                    <div className="px-6 py-5 bg-white space-y-4">

                        {/* Step: Type */}
                        {step === "type" && (
                            <>
                                <div className="space-y-3">
                                    {BILL_TYPES.map((bt) => (
                                        <BillTypeCard
                                            key={bt.value}
                                            type={bt}
                                            selected={billType === bt.value}
                                            onSelect={() => setBillType(bt.value)}
                                        />
                                    ))}
                                </div>
                                <Button
                                    onClick={() => setStep("file")}
                                    className="w-full bg-gradient-to-r from-[#7dab4f] to-[#5a8c3e] hover:from-[#6a9a40] hover:to-[#4a7a2e] text-white font-extrabold shadow-md rounded-xl gap-2 py-3"
                                >
                                    <Upload className="w-4 h-4" /> Continue to Upload
                                </Button>
                            </>
                        )}

                        {/* Step: File */}
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
                                <input type="file" className="hidden" accept="image/*,application/pdf" multiple={true} onChange={handleFileChange} />
                            </label>
                        )}

                        {/* Step: Details — Form */}
                        {step === "details" && files.length > 0 && !isUploading && (
                            <div className="space-y-5">
                                {/* File preview chips */}
                                <div className="max-h-48 overflow-y-auto space-y-2 pr-1">
                                    {previews.map((p, i) => {
                                        const fileIsPdf = p.file.type === "application/pdf";
                                        return (
                                            <div key={i} className="flex items-center gap-3 bg-gray-50 border border-gray-100 rounded-xl px-3 py-2.5">
                                                <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${fileIsPdf ? "bg-[#F3F0FD]" : "bg-[#e8f5e0]"}`}>
                                                    {p.url
                                                        ? <img src={p.url} alt="" className="w-10 h-10 object-cover rounded-lg" />
                                                        : <FileText className={`w-5 h-5 ${fileIsPdf ? "text-[#7661d3]" : "text-[#7dab4f]"}`} />
                                                    }
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-sm font-bold text-[#313131] truncate">{p.file.name}</p>
                                                    <p className="text-xs text-gray-400">{(p.file.size / 1024 / 1024).toFixed(2)} MB · {fileIsPdf ? "PDF" : "Image"}</p>
                                                </div>
                                                <button
                                                    onClick={() => handleRemoveFile(i)}
                                                    className="w-6 h-6 rounded-full bg-gray-200 hover:bg-red-100 hover:text-red-500 flex items-center justify-center transition-colors flex-shrink-0"
                                                >
                                                    <X className="w-3 h-3" />
                                                </button>
                                            </div>
                                        );
                                    })}
                                </div>

                                {/* Description */}
                                <div className="space-y-1.5">
                                    <Label className="text-xs font-extrabold text-gray-500 uppercase tracking-wide flex items-center gap-1.5">
                                        <AlignLeft className="w-3 h-3" /> Description{" "}
                                        <span className="text-gray-300 font-normal normal-case tracking-normal">(optional)</span>
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
                                <TagInput
                                    tags={tags}
                                    tagInput={tagInput}
                                    onTagInputChange={setTagInput}
                                    onTagKeyDown={handleTagKey}
                                    onTagBlur={commitTag}
                                    onRemoveTag={(i) => setTags((p) => p.filter((_, j) => j !== i))}
                                />
                            </div>
                        )}

                        {/* Step: Details — Scanning Animation */}
                        {step === "details" && files.length > 0 && isUploading && (
                            <div className="relative w-full h-[320px] rounded-2xl overflow-hidden bg-gray-50 flex items-center justify-center border border-gray-200">
                                {/* Stacked Previews Background */}
                                <div className="absolute inset-0 flex items-center justify-center opacity-60 blur-[4px] scale-105">
                                    {previews.slice(0, 3).map((p, i) => (
                                        <div
                                            key={i}
                                            className="absolute w-full h-full bg-cover bg-center"
                                            style={{
                                                backgroundImage: p.url ? `url(${p.url})` : "none",
                                                transform: `scale(${1 - i * 0.05}) translateY(${i * 10}px) rotate(${i % 2 === 0 ? '-2deg' : '2deg'})`,
                                                zIndex: 3 - i,
                                                opacity: 1 - i * 0.15
                                            }}
                                        >
                                            {!p.url && <div className="w-full h-full flex items-center justify-center bg-gray-200"><FileText className="w-16 h-16 text-gray-400" /></div>}
                                        </div>
                                    ))}
                                </div>

                                <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#7dab4f]/5 to-transparent pointer-events-none z-10" />

                                <div
                                    className="absolute left-0 right-0 h-1 bg-[#7dab4f] shadow-[0_0_20px_5px_rgba(125,171,79,0.5)] z-10 w-full"
                                    style={{ animation: "scanLine 2.5s cubic-bezier(0.4, 0, 0.2, 1) infinite" }}
                                />

                                <div className="relative z-20 flex flex-col items-center">
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
                                        0%   { top: 0%;   opacity: 0; }
                                        5%   { opacity: 1; }
                                        95%  { opacity: 1; }
                                        100% { top: 100%; opacity: 0; }
                                    }
                                `}</style>
                            </div>
                        )}
                    </div>

                    {/* ── Footer ── */}
                    {step === "details" && !isUploading && (
                        <div className="px-6 py-4 bg-white/95 border-t border-gray-100 flex items-center gap-3">
                            <Button
                                variant="ghost"
                                onClick={() => setStep("file")}
                                className="rounded-xl text-gray-500 hover:text-gray-700 gap-1 text-sm"
                            >
                                <ChevronLeft className="w-4 h-4" /> Back
                            </Button>
                            <Button
                                onClick={handleUpload}
                                disabled={isUploading || files.length === 0}
                                className="flex-1 bg-gradient-to-r from-[#7dab4f] to-[#5a8c3e] hover:from-[#6a9a40] hover:to-[#4a7a2e] text-white font-extrabold shadow-md rounded-xl gap-2"
                            >
                                {isUploading
                                    ? <><Loader2 className="w-4 h-4 animate-spin" /> Scanning receipt...</>
                                    : <><ScanLine className="w-4 h-4" /> Scan &amp; Save</>
                                }
                            </Button>
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </>
    );
}