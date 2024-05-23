import React from "react";

import { ModalOpts, ToastOpts, NotificationType, ToastPosition } from "./types";

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
    <div className="modal is-active">
      <div className="modal-background"></div>
      <div className="modal-card has-background-danger">
        <header className={`modal-card-head ${modalBackgroundClass()}`}>
          <p className="modal-card-title has-text-white-ter">
            {modalOpts?.title}
          </p>
          <button
            className="delete"
            aria-label="close"
            onClick={() => onRemove(id)}
          ></button>
        </header>
        <section className="modal-card-body has-text-dark">
          {modalOpts?.message}
          {modalOpts?.component && modalOpts.component}
        </section>
        <footer className="modal-card-foot">
          <button
            className={`button ${modalButtonClass()}`}
            onClick={onModalConfirm}
          >
            Confirm
          </button>
          <button className="button is-light" onClick={onModalCancel}>
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
        return "Danger";
      default:
        return "";
    }
  };

  // toasts are used for notifications that do not need confirmation
  const ToastElem = () => (
    <article className={`message ${toastTypeClass}`}>
      <div className="message-header">
        <p>{getToastTitle()}</p>
        <button
          className="delete"
          aria-label="acknowledge"
          onClick={onToastAcknowledge}
        ></button>
      </div>
      <div className="message-body">
        {toastOpts?.message}
        {toastOpts?.component ? toastOpts.component : null}
      </div>
    </article>
  );

  return (
    <div
      className={`${isModal ? "" : "notifications-toast-container"} ${toastOpts?.position || ToastPosition.TOP_MID}`}
    >
      {isModal ? <ModalElem /> : <ToastElem />}
    </div>
  );
}

export default Notification;
