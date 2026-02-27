import { useQuery } from "@tanstack/react-query";
import { ReceiptService } from "./receipt.service";
import type { ReceiptListParams } from "./types/receipt.types";

const receiptService = new ReceiptService();

export const useReceiptsQuery = (params: ReceiptListParams = {}) => {
    return useQuery({
        queryKey: ["receipts", params],
        queryFn: () => receiptService.getReceipts(params),
        staleTime: 30 * 1000, // 30 seconds
        refetchOnWindowFocus: true,
    });
};

export const useReceiptByIdQuery = (id: string) => {
    return useQuery({
        queryKey: ["receipts", id],
        queryFn: () => receiptService.getReceiptById(id),
        staleTime: 60 * 1000,
        enabled: !!id,
    });
};
