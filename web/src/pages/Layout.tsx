import type React from "react";
import { Outlet } from "react-router-dom";

import Footer from "components/Footer/Footer";
import Navbar from "components/Navbar/Navbar";
import SideTag from "components/SideTag/SideTag";
import { useConfig } from "config";
import { Notification, useNotifications } from "features/Notifications";

/**
 * Layout component with Navbar and footer.
 * Uses `<Outlet />` to render children.
 * Layout is also where notifications are rendered.
 */
export default function Layout(): React.ReactElement {
  const { feedbackFormURL } = useConfig();
  const { notifications, removeNotification } = useNotifications();

  return (
    <div>
      <Navbar />
      <Outlet />
      {feedbackFormURL && (
        <SideTag
          iconClass="fa-up-right-from-square"
          label="Get Help"
          url={feedbackFormURL}
        />
      )}
      <Footer />
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
