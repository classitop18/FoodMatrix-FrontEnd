import { Receipt } from "@/services/receipt/types/receipt.types";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Store } from "lucide-react";
import { format } from "date-fns";

interface ReceiptPreviewProps {
    receipt: Receipt;
}

export function ReceiptPreview({ receipt }: ReceiptPreviewProps) {
    return (
        <Card className="bg-white border border-gray-100 shadow-sm overflow-hidden">
            <CardHeader className="border-b border-gray-100 pb-3 bg-gray-50/30">
                <CardTitle className="flex items-center justify-between text-base">
                    <div className="flex items-center gap-2">
                        <div className="p-1.5 bg-[#7dab4f]/10 rounded-md">
                            <Store className="w-4 h-4 text-[#7dab4f]" />
                        </div>
                        <span className="font-bold text-[#313131]">{receipt.storeName && receipt.storeName !== "Unknown Store" ? receipt.storeName : "Scanned Receipt"}</span>
                    </div>
                    <span className="text-xs font-medium text-gray-400 bg-white border border-gray-100 px-2 py-1 rounded-full shadow-sm">
                        {receipt.purchaseDate ? format(new Date(receipt.purchaseDate), "PPP") : "No Date"}
                    </span>
                </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
                <Table>
                    <TableHeader>
                        <TableRow className="hover:bg-transparent border-gray-100">
                            <TableHead className="text-xs font-semibold text-gray-400 h-9">Item</TableHead>
                            <TableHead className="text-xs font-semibold text-gray-400 h-9 text-right bg-gray-50/50">Price</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {receipt.items.length > 0 ? (
                            receipt.items.map((item, idx) => (
                                <TableRow key={idx} className="border-gray-50 hover:bg-transparent">
                                    <TableCell className="font-medium text-xs text-gray-700 py-2">{item.name}</TableCell>
                                    <TableCell className="text-right py-2 text-gray-600 bg-gray-50/30">
                                        {item.price ? `$${Number(item.price).toFixed(2)}` : "-"}
                                    </TableCell>
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={2} className="text-center py-4 text-gray-400 text-xs">
                                    No items extracted
                                </TableCell>
                            </TableRow>
                        )}

                        <TableRow className="bg-[#F3F0FD]/30 border-t border-gray-100">
                            <TableCell className="font-bold text-[#313131] py-3">Total</TableCell>
                            <TableCell className="text-right font-bold text-[#7661d3] py-3">
                                {receipt.totalAmount ? `$${Number(receipt.totalAmount).toFixed(2)}` : "-"}
                            </TableCell>
                        </TableRow>
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    );
}
