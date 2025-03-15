import { fireEvent, render, screen } from "@testing-library/react";
import type React from "react";

import Notification from "./Notification";
import { NotificationType } from "./types";

describe("Notification Component", () => {
  const mockOnRemove = jest.fn();
  const mockOnConfirm = jest.fn();
  const mockOnCancel = jest.fn();
  const mockOnAcknowledge = jest.fn();

  afterEach(() => {
    mockOnRemove.mockReset();
    mockOnConfirm.mockReset();
    mockOnCancel.mockReset();
    mockOnAcknowledge.mockReset();
  });

  test("renders modal when modalOpts passed", () => {
    const modalOpts = {
      modalType: "danger" as NotificationType,
      title: "Modal title",
      message: "Modal message",
      onConfirm: mockOnConfirm,
      onCancel: mockOnCancel,
    };
    render(
      <Notification
        id="1"
        onRemove={mockOnRemove}
        modalOpts={modalOpts}
        createdAt={new Date()}
      />,
    );

    expect(screen.getByText("Modal title")).toBeInTheDocument();
    expect(screen.getByText("Modal message")).toBeInTheDocument();
  });

  test("renders modal when modalOpts with component passed", () => {
    const modalOpts = {
      modalType: "danger" as NotificationType,
      title: "Modal title",
      component: <div>Modal component</div>,
      onConfirm: mockOnConfirm,
      onCancel: mockOnCancel,
    };
    render(
      <Notification
        id="1"
        onRemove={mockOnRemove}
        modalOpts={modalOpts}
        createdAt={new Date()}
      />,
    );

    expect(screen.getByText("Modal title")).toBeInTheDocument();
    expect(screen.getByText("Modal component")).toBeInTheDocument();
  });

  test("calls onConfirm when modal confirm button is clicked", () => {
    const modalOpts = {
      modalType: "danger" as NotificationType,
      title: "Modal title",
      message: "Modal message",
      onConfirm: mockOnConfirm,
      onCancel: mockOnCancel,
    };
    render(
      <Notification
        id="1"
        onRemove={mockOnRemove}
        modalOpts={modalOpts}
        createdAt={new Date()}
      />,
    );

    fireEvent.click(screen.getByText("Confirm"));
    expect(mockOnConfirm).toHaveBeenCalledTimes(1);
    expect(mockOnRemove).toHaveBeenCalledTimes(1);
  });

  test("calls onCancel when modal cancel button is clicked", () => {
    const modalOpts = {
      modalType: "danger" as NotificationType,
      title: "Modal title",
      message: "Modal message",
      onConfirm: mockOnConfirm,
      onCancel: mockOnCancel,
    };
    render(
      <Notification
        id="1"
        onRemove={mockOnRemove}
        modalOpts={modalOpts}
        createdAt={new Date()}
      />,
    );

    fireEvent.click(screen.getByText("Cancel"));
    expect(mockOnCancel).toHaveBeenCalledTimes(1);
    expect(mockOnRemove).toHaveBeenCalledTimes(1);
  });

  test("renders toast when toastOpts passed", () => {
    const toastOpts = {
      toastType: NotificationType.SUCCESS,
      message: "Toast message",
      onAcknowledge: mockOnAcknowledge,
    };
    render(
      <Notification
        id="1"
        onRemove={mockOnRemove}
        toastOpts={toastOpts}
        createdAt={new Date()}
      />,
    );

    expect(screen.getByText("Success")).toBeInTheDocument();
    expect(screen.getByText("Toast message")).toBeInTheDocument();
  });

  test("renders toast when toastOpts with component passed", () => {
    const toastOpts = {
      toastType: NotificationType.SUCCESS,
      component: <div>Toast component</div>,
      onAcknowledge: mockOnAcknowledge,
    };
    render(
      <Notification
        id="1"
        onRemove={mockOnRemove}
        toastOpts={toastOpts}
        createdAt={new Date()}
      />,
    );

    expect(screen.getByText("Success")).toBeInTheDocument();
    expect(screen.getByText("Toast component")).toBeInTheDocument();
  });

  test("calls onAcknowledge when toast is acknowledged", () => {
    const toastOpts = {
      toastType: NotificationType.SUCCESS,
      message: "Toast message",
      onAcknowledge: mockOnAcknowledge,
    };
    render(
      <Notification
        id="1"
        onRemove={mockOnRemove}
        toastOpts={toastOpts}
        createdAt={new Date()}
      />,
    );

    fireEvent.click(screen.getByLabelText("acknowledge"));
    expect(mockOnAcknowledge).toHaveBeenCalledTimes(1);
    expect(mockOnRemove).toHaveBeenCalledTimes(1);
  });
});
