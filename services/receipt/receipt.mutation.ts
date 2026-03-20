import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ReceiptService } from "./receipt.service";
import type { UpdateReceiptPayload, AddToPantryPayload } from "./types/receipt.types";

const receiptService = new ReceiptService();

export const useUploadReceiptMutation = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (data: { files: File[]; billType: "single" | "multiple"; eventId?: string; shoppingListId?: string; description?: string; tags?: string[] }) =>
            receiptService.uploadReceipt(data.files, data.billType, data.eventId, data.shoppingListId, data.description, data.tags),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["receipts"] });
        },
    });
};

export const useUpdateReceiptMutation = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ id, data }: { id: string; data: UpdateReceiptPayload }) =>
            receiptService.updateReceipt(id, data),
        onSuccess: (_, { id }) => {
            queryClient.invalidateQueries({ queryKey: ["receipts"] });
            queryClient.invalidateQueries({ queryKey: ["receipts", id] });
        },
    });
};

export const useDeleteReceiptMutation = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (id: string) => receiptService.deleteReceipt(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["receipts"] });
        },
    });
};

export const useAddToPantryMutation = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ receiptId, payload }: { receiptId: string; payload: AddToPantryPayload }) =>
            receiptService.addReceiptItemsToPantry(receiptId, payload),
        onSuccess: (_, { receiptId }) => {
            queryClient.invalidateQueries({ queryKey: ["receipts"] });
            queryClient.invalidateQueries({ queryKey: ["receipts", receiptId] });
            queryClient.invalidateQueries({ queryKey: ["pantry"] });
        },
    });
};
