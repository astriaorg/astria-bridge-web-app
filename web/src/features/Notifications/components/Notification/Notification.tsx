import type React from "react";

import {
  type ModalOpts,
  NotificationType,
  type ToastOpts,
  ToastPosition,
} from "./types";

interface NotificationProps {
  id: string;
  createdAt: Date;
  modalOpts?: ModalOpts;
  toastOpts?: ToastOpts;
  // called after user confirms/cancels modal or acknowledges toast
  onRemove: (id: string) => void;
}

// Notification is used for toast and modal notifications
function Notification({
  id,
  onRemove,
  modalOpts,
  toastOpts,
}: NotificationProps) {
  // if modalOpts exists, we should display in modal mode
  const isModal: boolean = modalOpts !== undefined;

  const onModalConfirm = () => {
    if (modalOpts?.onConfirm) {
      modalOpts.onConfirm();
    }
    onRemove(id);
  };

  const onModalCancel = () => {
    if (modalOpts?.onCancel) {
      modalOpts.onCancel();
    }
    onRemove(id);
  };

  const modalBackgroundClass = () => {
    return `has-background-${modalOpts?.modalType}`;
  };
  const modalButtonClass = () => {
    return `is-${modalOpts?.modalType}`;
  };

  // modals can be used for confirmation dialogs
  const ModalElem = () => (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="fixed inset-0 bg-black/50" />
      <div className="relative w-full max-w-lg mx-4 bg-radial-dark rounded-xl shadow-lg">
        <header className="flex items-center justify-between p-4 rounded-t-xl">
          <p className="text-lg font-semibold text-white">
            {modalOpts?.title}
          </p>
          <button
            type="button"
            className="p-2 rounded-full hover:bg-gray-700/50"
            aria-label="close"
            onClick={() => {
              onRemove(id);
              onModalCancel();
            }}
          >
            <span className="text-white">&times;</span>
          </button>
        </header>
        <section className="p-6 text-white">
          {modalOpts?.message}
          {modalOpts?.component && modalOpts.component}
        </section>
        <footer className="flex justify-end gap-4 p-4">
          <button
            type="button"
            className="px-6 py-2 font-bold text-white rounded-lg bg-gradient"
            onClick={onModalConfirm}
          >
            Confirm
          </button>
          <button
            type="button"
            className="px-6 py-2 font-bold text-dark bg-gray-200 rounded-lg hover:bg-gray-300"
            onClick={onModalCancel}
          >
            Cancel
          </button>
        </footer>
      </div>
    </div>
  );

  const onToastAcknowledge = () => {
    if (toastOpts?.onAcknowledge) {
      toastOpts.onAcknowledge();
    }
    onRemove(id);
  };
  const toastTypeClass = `is-${toastOpts?.toastType}`;

  const getToastTitle = () => {
    switch (toastOpts?.toastType) {
      case NotificationType.INFO:
        return "Info";
      case NotificationType.SUCCESS:
        return "Success";
      case NotificationType.WARNING:
        return "Warning";
      case NotificationType.DANGER:
        return "Error";
      default:
        return "";
    }
  };

  const getToastColorClass = () => {
    switch (toastOpts?.toastType) {
      case NotificationType.INFO:
        return 'bg-status-info';
      case NotificationType.SUCCESS:
        return 'bg-status-success';
      case NotificationType.WARNING:
        return 'bg-status-warning';
      case NotificationType.DANGER:
        return 'bg-status-danger';
      default:
        return 'bg-gray-700';
    }
  };

  // toasts are used for notifications that do not need confirmation
  const ToastElem = () => (
    <article className={`rounded-lg shadow-lg overflow-hidden ${getToastColorClass()}`}>
      <div className="flex items-center justify-between px-4 py-2 text-white">
        <p>{getToastTitle()}</p>
        <button
          type="button"
          className="p-1 rounded-full hover:bg-black/20"
          aria-label="acknowledge"
          onClick={onToastAcknowledge}
        >
          <span className="text-white">&times;</span>
        </button>
      </div>
      <div className="px-4 py-3 bg-white/10 text-white">
        {toastOpts?.message}
        {toastOpts?.component ? toastOpts.component : null}
      </div>
    </article>
  );

  return (
    <div className={`${
      isModal ? '' : 'fixed z-50'
    } ${toastOpts?.position || ToastPosition.TOP_MID}`}>
      {isModal ? <ModalElem /> : <ToastElem />}
    </div>
  );
}

export default Notification;
