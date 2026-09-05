import { useContext } from "react";
import { UserContext, type UserContextType } from "./UserContext";

export const useUser = (): UserContextType => {
  const ctx = useContext(UserContext);

  if (!ctx) {
    throw new Error("useUser must be used inside UserProvider");
  }

  return ctx;
};

export default useUser;
