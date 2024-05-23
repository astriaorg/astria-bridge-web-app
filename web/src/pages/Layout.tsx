import React, { useContext } from "react";
import { Outlet } from "react-router-dom";

import Navbar from "components/Navbar/Navbar";
import Notification from "components/Notification/Notification";
import { NotificationsContext } from "contexts/NotificationsContext";

/**
 * Layout component with Navbar and footer.
 * Uses `<Outlet />` to render children.
 */
export default function Layout(): React.ReactElement {
  const { notifications, removeNotification } =
    useContext(NotificationsContext);

  return (
    <div>
      <Navbar />

      <Outlet />

      {notifications.map((notification) => (
        <Notification
          key={notification.id}
          id={notification.id}
          createdAt={notification.createdAt}
          modalOpts={notification.modalOpts}
          toastOpts={notification.toastOpts}
          onRemove={removeNotification}
        />
      ))}
    </div>
  );
}
