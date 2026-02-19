import { useMutation } from "@tanstack/react-query";
import { ReceiptService } from "./receipt.service";

const receiptService = new ReceiptService();

export const useUploadReceiptMutation = () => {
    return useMutation({
        mutationFn: (data: { file: File; eventId?: string; shoppingListId?: string }) =>
            receiptService.uploadReceipt(data.file, data.eventId, data.shoppingListId),
    });
};
