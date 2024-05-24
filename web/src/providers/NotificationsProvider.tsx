import type React from "react";
import { useState } from "react";
import { v4 as uuidv4 } from "uuid";

import type {
  AddNotificationOpts,
  Notification,
} from "components/Notification/types";
import { NotificationsContext } from "contexts/NotificationsContext";

type NotificationsProviderProps = {
  children: React.ReactNode;
};

export const NotificationsProvider: React.FC<NotificationsProviderProps> = ({
  children,
}) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const addNotification = ({ modalOpts, toastOpts }: AddNotificationOpts) => {
    const notification: Notification = {
      id: uuidv4(),
      createdAt: new Date(),
      modalOpts,
      toastOpts,
    };
    setNotifications((prev) => [...prev, notification]);
  };

  const removeNotification = (id: string) => {
    setNotifications((prev: Notification[]) =>
      prev.filter((notification: Notification) => notification.id !== id),
    );
  };

  return (
    <NotificationsContext.Provider
      value={{ notifications, addNotification, removeNotification }}
    >
      {children}
    </NotificationsContext.Provider>
  );
};
