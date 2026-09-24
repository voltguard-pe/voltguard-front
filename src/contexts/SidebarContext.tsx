import React, { createContext, useContext, useState, useCallback } from "react";

interface SidebarContextType {
  refreshKey: number;
  triggerRefresh: (companyCode?: string) => void;
  lastUpdatedCompany: string | null;
}

const SidebarContext = createContext<SidebarContextType | undefined>(undefined);

export const SidebarProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [refreshKey, setRefreshKey] = useState(0);
  const [lastUpdatedCompany, setLastUpdatedCompany] = useState<string | null>(null);

  const triggerRefresh = useCallback((companyCode?: string) => {
    setLastUpdatedCompany(companyCode || null);
    setRefreshKey((prev) => prev + 1);
  }, []);

  return (
    <SidebarContext.Provider value={{ refreshKey, triggerRefresh, lastUpdatedCompany }}>
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