import { useContext } from "react";
import { PublicStatusContext } from "./PublicStatusContext";

export const usePublicStatus = (): any => {
  const ctx = useContext(PublicStatusContext);

  if (!ctx) {
    throw new Error(
      "usePublicStatus must be used inside PublicStatusProvider"
    );
  }

  return ctx;
};

export default usePublicStatus;
