import { useContext } from "react";
import { CollectionReminderContext } from "./CollectionReminderContext";

export const useCollectionReminder = () => {
  const ctx = useContext(CollectionReminderContext);

  if (!ctx) {
    throw new Error(
      "useCollectionReminder must be used inside CollectionReminderProvider",
    );
  }

  return ctx;
};
