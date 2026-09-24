import React, { createContext, useContext, useState, useCallback } from "react";

interface SidebarContextType {
  refreshKey: number;
  triggerRefresh: (companyCode?: string | string[]) => void;
  lastUpdatedCompanies: string[];
}

const SidebarContext = createContext<SidebarContextType | undefined>(undefined);

export const SidebarProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [refreshKey, setRefreshKey] = useState(0);
  const [lastUpdatedCompanies, setLastUpdatedCompanies] = useState<string[]>([]);

  const triggerRefresh = useCallback((companyCode?: string | string[]) => {
    if (Array.isArray(companyCode)) {
      setLastUpdatedCompanies(companyCode);
    } else if (companyCode) {
      setLastUpdatedCompanies([companyCode]);
    } else {
      setLastUpdatedCompanies([]);
    }
    setRefreshKey((prev) => prev + 1);
  }, []);

  return (
    <SidebarContext.Provider value={{ refreshKey, triggerRefresh, lastUpdatedCompanies }}>
      {children}
    </SidebarContext.Provider>
  );
};

export const useSidebar = () => {
  const context = useContext(SidebarContext);
  if (!context) {
    throw new Error("useSidebar debe utilizarse dentro de un SidebarProvider");
  }
  return context;
};