import React, { createContext, useContext, useState } from "react";

// Context erstellen
const ModuleContext = createContext();

export const ModuleProvider = ({ children }) => {
  const [moduleChosen, setModuleChosen] = useState(null);

  return (
    <ModuleContext.Provider value={{ moduleChosen, setModuleChosen }}>
      {children}
    </ModuleContext.Provider>
  );
};

// Custom Hook zum Zugriff auf den Context
export const useModule = () => {
  return useContext(ModuleContext);
};