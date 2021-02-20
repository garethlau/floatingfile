import { useState } from "react";

const useFormInput = (initialValue: string) => {
  const [value, setValue] = useState<string>(initialValue);
  const [hasError, setHasError] = useState<boolean>(false);
  const [helperText, setHelperText] = useState<string>("");

  function setError(msg: string): void {
    setHasError(true);
    setHelperText(msg);
  }

  function clearError(): void {
    setHasError(false);
    setHelperText("");
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    clearError();
    setValue(e.target.value);
  }

  function clear(): void {
    setValue("");
  }
  return {
    value: value,
    onChange: handleChange,
    clear: clear,
    hasError: hasError,
    helperText: helperText,
    setError: setError,
    clearError: clearError,
  };
};

export default useFormInput;
