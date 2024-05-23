import React from "react";

import {
  AddNotificationOpts,
  Notification,
} from "components/Notification/types";

interface NotificationsContextProps {
  notifications: Notification[];
  addNotification: (opts: AddNotificationOpts) => void;
  removeNotification: (id: string) => void;
}

export const NotificationsContext =
  React.createContext<NotificationsContextProps>(
    {} as NotificationsContextProps,
  );
