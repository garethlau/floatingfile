import React, { createContext, useState } from "react";
import { isMobile } from "react-device-detect";

export const SelectedFilesContext = createContext();

export function SelectedFilesProvider({ children }) {
  const [values, setValues] = useState([]);

  function select(key) {
    // Prevent item select in mobile
    if (isMobile) return;
    setValues((prev) => [...prev, key]);
  }

  function unselect(key) {
    setValues((prev) => {
      let newValues = prev.filter((val) => val !== key);
      return newValues;
    });
  }

  function toggleSelect(key) {
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

  function isSelected(key) {
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
}
