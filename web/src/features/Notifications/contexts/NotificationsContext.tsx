import React from "react";
import { useState } from "react";
import { v4 as uuidv4 } from "uuid";

import type {
  AddNotificationOpts,
  Notification,
} from "features/Notifications/components/Notification/types";

interface NotificationsContextProps {
  notifications: Notification[];
  addNotification: (opts: AddNotificationOpts) => void;
  removeNotification: (id: string) => void;
}

export const NotificationsContext =
  React.createContext<NotificationsContextProps>(
    {} as NotificationsContextProps,
  );

type NotificationsProviderProps = {
  children: React.ReactNode;
};

/**
 * NotificationsProvider component to provide notifications context to children.
 * @param children
 */
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
