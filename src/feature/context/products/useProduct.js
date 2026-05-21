import { useContext } from "react";
import { ProductContext } from "./ProductContext";

export const useProduct = () => {
  const ctx = useContext(ProductContext);

  if (!ctx) {
    throw new Error("useProduct must be used inside ProductProvider");
  }

  return ctx;
};
