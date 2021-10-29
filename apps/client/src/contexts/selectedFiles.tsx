import React, { createContext, useState, useContext } from "react";
import { isMobile } from "react-device-detect";

interface ContextType {
  selected: string[];
  setSelected: React.Dispatch<React.SetStateAction<string[]>>;
  toggleSelect: (key: string) => void;
  select: (key: string) => void;
  unselect: (key: string) => void;
  clear: () => void;
  isSelected: (key: string) => boolean;
}

export const SelectedFilesContext = createContext<ContextType>({
  selected: [""],
  setSelected: () => {},
  toggleSelect: () => {},
  select: () => {},
  unselect: () => {},
  clear: () => {},
  isSelected: () => false,
});

export const SelectedFilesProvider: React.FC<{
  children: React.ReactNode;
}> = ({ children }) => {
  const [values, setValues] = useState<string[]>([]);

  function select(key: string) {
    // Prevent item select in mobile
    if (isMobile) return;
    setValues((prev) => [...prev, key]);
  }

  function unselect(key: string) {
    setValues((prev) => {
      const newValues = prev.filter((val) => val !== key);
      return newValues;
    });
  }

  function toggleSelect(key: string) {
    // Item is already selected
    if (values.includes(key)) {
      unselect(key);
    } else {
      select(key);
    }
  }

  function clear() {
    setValues([]);
  }

  function isSelected(key: string) {
    return values.includes(key);
  }

  return (
    <SelectedFilesContext.Provider
      value={{
        selected: values,
        setSelected: setValues,
        toggleSelect,
        select,
        unselect,
        clear,
        isSelected,
      }}
    >
      {children}
    </SelectedFilesContext.Provider>
  );
};

export const useSelectedFiles = () => {
  const context = useContext(SelectedFilesContext);
  if (context === undefined) {
    throw new Error(
      "useSelectedFiles must be used within a SekectedFilesProvider"
    );
  }
  return context;
};
