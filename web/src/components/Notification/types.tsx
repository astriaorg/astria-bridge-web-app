import React from "react";

export enum NotificationType {
  INFO = "info",
  SUCCESS = "success",
  WARNING = "warning",
  DANGER = "danger",
}

export interface ModalOpts {
  modalType: NotificationType;
  title: string;
  message?: string;
  component?: React.JSX.Element;
  onConfirm: () => void;
  onCancel: () => void;
}

export enum ToastPosition {
  TOP_LEFT = "top-left",
  TOP_MID = "top-mid",
  TOP_RIGHT = "top-right",
  MID = "mid",
  BOTTOM_LEFT = "bottom-left",
  BOTTOM_MID = "bottom-mid",
  BOTTOM_RIGHT = "bottom-right",
}

export interface ToastOpts {
  toastType: NotificationType;
  message?: string;
  component?: React.JSX.Element;
  position?: ToastPosition;
  onAcknowledge: () => void;
}

export interface Notification {
  id: string;
  createdAt: Date;
  modalOpts?: ModalOpts;
  toastOpts?: ToastOpts;
}

export interface AddNotificationOpts {
  modalOpts?: ModalOpts;
  toastOpts?: ToastOpts;
}
