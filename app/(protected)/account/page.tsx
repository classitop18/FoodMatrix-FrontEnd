'use client'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useMyAccounts } from "@/services/account/account.query"
import { useAccount } from "@/services/account/account.query"; // assume we created this hook
import { useEffect, useState } from "react";

export default function AccountPage() {
    const [myAccounts, setMyAccounts] = useState<
        { id: string; accountName: string; description: string | null; accountNumber: string }[]
    >([]);
    const [activeAccount, setActiveAccount] = useState<string | null>(null);

    const { data: accounts, isLoading: isAccountsFetching, isError } = useMyAccounts();

    // Fetch selected account details
    const { data: accountDetails, isLoading: isAccountLoading } = useAccount(activeAccount || "");

    useEffect(() => {
        if (!isAccountsFetching) {
            setMyAccounts(accounts?.data || []);
            setActiveAccount(accounts?.data[0]?.id || null)
        }
    }, [isAccountsFetching, accounts]);

    return (
        <div className="w-80">
            <Select
                value={activeAccount || undefined}
                onValueChange={(value) => setActiveAccount(value)}
            >
                <SelectTrigger
                    data-testid="select-account"
                    className="h-12 border-2 border-[#7661d3]/30 focus:border-[#7661d3] rounded-xl bg-white"
                >
                    <SelectValue placeholder="Select account" />
                </SelectTrigger>
                <SelectContent>
                    {myAccounts.map((acc) => (
                        <SelectItem key={acc.id} value={acc.id}>
                            <div className="flex flex-col">
                                <span className="font-medium">{acc.accountName}</span>
                                <span className="text-xs text-gray-500">
                                    {acc.description || "No description"}
                                </span>
                                <span className="text-xs text-gray-400">
                                    Account #: {acc.accountNumber}
                                </span>
                            </div>
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>

            {activeAccount && (
                <div className="mt-4 p-4 border rounded-lg bg-white">
                    {isAccountLoading ? (
                        <p>Loading account details...</p>
                    ) : (
                        <pre>{JSON.stringify(accountDetails?.data, null, 2)}</pre>
                    )}
                </div>
            )}
        </div>
    );
}
