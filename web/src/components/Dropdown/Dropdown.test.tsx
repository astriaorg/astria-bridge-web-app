import { fireEvent, render, screen } from "@testing-library/react";
import React from "react";
import "@testing-library/jest-dom";
import Dropdown, { type DropdownOption } from "./Dropdown"; // Adjust the import path as needed

const mockOptions: DropdownOption<string>[] = [
  { label: "Option 1", value: "option1" },
  { label: "Option 2", value: "option2" },
  { label: "Option 3", value: "option3" },
];

describe("Dropdown Component", () => {
  test("renders with placeholder text", () => {
    render(
      <Dropdown
        options={mockOptions}
        onSelect={() => {}}
        placeholder="Select an item"
      />,
    );
    expect(screen.getByText("Select an item")).toBeInTheDocument();
  });

  test("opens dropdown when clicked", () => {
    render(<Dropdown options={mockOptions} onSelect={() => {}} />);
    const dropdownButtons = screen.getAllByRole("button");
    const dropdownButton = dropdownButtons[0];
    fireEvent.click(dropdownButton);
    expect(screen.getByRole("menu")).toBeInTheDocument();
  });

  test("closes dropdown when an option is selected", () => {
    const onSelect = jest.fn();
    render(<Dropdown options={mockOptions} onSelect={onSelect} />);

    const dropdownButtons = screen.getAllByRole("button");
    const dropdownButton = dropdownButtons[0];
    fireEvent.click(dropdownButton);

    const option = screen.getByText("Option 1");
    fireEvent.click(option);

    expect(screen.queryByRole("menu")).not.toHaveClass("is-active");
    expect(onSelect).toHaveBeenCalledWith("option1");
  });

  test("displays selected option", () => {
    render(<Dropdown options={mockOptions} onSelect={() => {}} />);
    expect(screen.getByText("Option 2")).toBeInTheDocument();
  });

  test("highlights selected option in dropdown", () => {
    render(<Dropdown options={mockOptions} onSelect={() => {}} />);
    const dropdownButtons = screen.getAllByRole("button");
    const dropdownButton = dropdownButtons[0];
    fireEvent.click(dropdownButton);

    const selectedOption = screen.getByText("Option 3");
    expect(
      selectedOption?.parentElement?.parentElement?.parentElement
        ?.parentElement,
    ).toHaveClass("is-active");
  });

  test("calls onSelect with correct value when option is clicked", () => {
    const onSelect = jest.fn();
    render(<Dropdown options={mockOptions} onSelect={onSelect} />);

    const dropdownButtons = screen.getAllByRole("button");
    const dropdownButton = dropdownButtons[0];
    fireEvent.click(dropdownButton);

    const option = screen.getByText("Option 3");
    fireEvent.click(option);

    expect(onSelect).toHaveBeenCalledWith("option3");
  });
});
