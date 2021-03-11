import { useState } from "react";

export default function useRandomElement(elements: string[]) {
  const [rand] = useState(() => Math.floor(Math.random() * elements.length));
  return elements[rand];
}
