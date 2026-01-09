import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { useAccounts, Account } from "@/hooks/useAccounts";

interface AccountContextType {
  selectedAccount: Account | null;
  setSelectedAccount: (account: Account | null) => void;
  accounts: Account[];
  isLoading: boolean;
}

const AccountContext = createContext<AccountContextType | undefined>(undefined);

export const AccountProvider = ({ children }: { children: ReactNode }) => {
  const { data: accounts = [], isLoading } = useAccounts();
  const [selectedAccount, setSelectedAccountState] = useState<Account | null>(null);

  // Load selected account from localStorage or set first account
  useEffect(() => {
    if (accounts.length > 0 && !selectedAccount) {
      const savedAccountId = localStorage.getItem("selectedAccountId");
      const savedAccount = accounts.find((a) => a.id === savedAccountId);
      setSelectedAccountState(savedAccount || accounts[0]);
    }
  }, [accounts, selectedAccount]);

  const setSelectedAccount = (account: Account | null) => {
    setSelectedAccountState(account);
    if (account) {
      localStorage.setItem("selectedAccountId", account.id);
    } else {
      localStorage.removeItem("selectedAccountId");
    }
  };

  return (
    <AccountContext.Provider
      value={{
        selectedAccount,
        setSelectedAccount,
        accounts,
        isLoading,
      }}
    >
      {children}
    </AccountContext.Provider>
  );
};

export const useAccountContext = () => {
  const context = useContext(AccountContext);
  if (context === undefined) {
    throw new Error("useAccountContext must be used within an AccountProvider");
  }
  return context;
};
