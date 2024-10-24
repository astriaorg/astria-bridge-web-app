import { useContext } from "react";

import {
  NotificationsContext,
  type NotificationsContextProps,
} from "features/Notifications/contexts/NotificationsContext";

// hook to make NotificationsContext easier to access
export const useNotifications = (): NotificationsContextProps => {
  const context = useContext(NotificationsContext);
  if (!context) {
    throw new Error(
      "useNotifications must be used within an NotificationsContextProvider",
    );
  }
  return context;
};
