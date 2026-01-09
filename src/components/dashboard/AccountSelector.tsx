import { ChevronDown, Wallet } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAccountContext } from "@/contexts/AccountContext";

const AccountSelector = () => {
  const { selectedAccount, setSelectedAccount, accounts, isLoading } = useAccountContext();

  if (isLoading || accounts.length === 0) {
    return null;
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="gap-2">
          <div
            className="w-3 h-3 rounded-full"
            style={{ backgroundColor: selectedAccount?.color || "#10b981" }}
          />
          <Wallet className="w-4 h-4" />
          <span className="max-w-[120px] truncate">{selectedAccount?.name || "Selecionar conta"}</span>
          <ChevronDown className="w-4 h-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        {accounts.map((account) => (
          <DropdownMenuItem
            key={account.id}
            onClick={() => setSelectedAccount(account)}
            className="gap-2"
          >
            <div
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: account.color || "#10b981" }}
            />
            <span>{account.name}</span>
            {account.id === selectedAccount?.id && (
              <span className="ml-auto text-primary">✓</span>
            )}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default AccountSelector;
