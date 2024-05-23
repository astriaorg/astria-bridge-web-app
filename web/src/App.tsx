import React from "react";
import { Route, Routes } from "react-router-dom";
import Home from "pages/Home";
import Layout from "pages/Layout";
import { NotificationsProvider } from "providers/NotificationsProvider";

/**
 * App component with routes.
 */
export default function App(): React.ReactElement {
  return (
    <NotificationsProvider>
      <Routes>
        <Route element={<Layout />}>
          <Route index element={<Home />} />
        </Route>
      </Routes>
    </NotificationsProvider>
  );
}
