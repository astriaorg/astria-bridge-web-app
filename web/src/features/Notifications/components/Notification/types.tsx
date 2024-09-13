import type React from "react";

/**
 * Represents the type of notification.
 *
 * Use the NotificationType enum to specify the type of notification, such as INFO, SUCCESS, WARNING, or DANGER.
 * Each type corresponds to a specific style or severity level of the notification.
 *
 * @enum {string}
 */
export enum NotificationType {
  INFO = "info",
  SUCCESS = "success",
  WARNING = "warning",
  DANGER = "danger",
}

/**
 * Represents the options for a modal.
 *
 * @interface ModalOpts
 *
 * @property {NotificationType} modalType - The type of notification displayed in the modal.
 * @property {string} title - The title of the modal.
 * @property {string=} message - The message displayed in the modal. Optional.
 * @property {React.JSX.Element=} component - The React component to be rendered in the modal. Optional.
 * @property {function} onConfirm - Callback function called when the confirm button is clicked.
 * @property {function} onCancel - Callback function called when the cancel button is clicked.
 */
export interface ModalOpts {
  modalType: NotificationType;
  title: string;
  message?: string;
  component?: React.JSX.Element;
  onConfirm: () => void;
  onCancel: () => void;
}

/**
 * The ToastPosition enum represents the possible positions where a toast message can be displayed.
 *
 * @enum {string}
 */
export enum ToastPosition {
  TOP_LEFT = "top-left",
  TOP_MID = "top-mid",
  TOP_RIGHT = "top-right",
  MID = "mid",
  BOTTOM_LEFT = "bottom-left",
  BOTTOM_MID = "bottom-mid",
  BOTTOM_RIGHT = "bottom-right",
}

/**
 * Represents the options for displaying a toast notification.
 * @interface ToastOpts
 *
 * @property {NotificationType} toastType - The type of notification displayed in the toast.
 * @property {string=} message - The message displayed in the toast. Optional.
 * @property {React.JSX.Element=} component - The React component to be rendered in the toast. Optional.
 * @property {ToastPosition=} position - The position where the toast should be displayed. Optional.
 * @property {function} onAcknowledge - Callback function called when the user acknowledges the toast.
 */
export interface ToastOpts {
  toastType: NotificationType;
  message?: string;
  component?: React.JSX.Element;
  position?: ToastPosition;
  onAcknowledge: () => void;
}

/**
 * Represents a notification object.
 *
 * If modalOpts is provided, the notification will be displayed as a modal.
 * If toastOpts is provided, the notification will be displayed as a toast.
 *
 * @interface Notification
 *
 * @property {string} id - The unique identifier for the notification.
 * @property {Date} createdAt - The date and time when the notification was created.
 * @property {ModalOpts=} modalOpts - The options for displaying a modal notification. Optional.
 * @property {ToastOpts=} toastOpts - The options for displaying a toast notification. Optional.
 */
export interface Notification {
  id: string;
  createdAt: Date;
  modalOpts?: ModalOpts;
  toastOpts?: ToastOpts;
}

/**
 * Represents the options for adding a notification.
 *
 * @interface AddNotificationOpts
 *
 * @property {ModalOpts=} modalOpts - The options for displaying a modal notification. Optional.
 * @property {ToastOpts=} toastOpts - The options for displaying a toast notification. Optional.
 */
export interface AddNotificationOpts {
  modalOpts?: ModalOpts;
  toastOpts?: ToastOpts;
}
