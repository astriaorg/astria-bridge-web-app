import { screen, fireEvent } from "@testing-library/react";
import { renderWithRouter } from "testHelpers";
import { SwapPage } from "./SwapPage";

describe("SwapPage", () => {
  test("renders swap page correctly", () => {
    renderWithRouter(<SwapPage />);
    
    expect(screen.getByText("Swap")).toBeInTheDocument();
    expect(screen.getByText("Connect Wallet")).toBeInTheDocument();
  });

  test("handles token input changes", () => {
    renderWithRouter(<SwapPage />);
    
    const inputs = screen.getAllByPlaceholderText("0");
    fireEvent.change(inputs[0], { target: { value: "100" } });
    
    expect(inputs[0]).toHaveValue(100);
  });

  test("changes active input on click", () => {
    renderWithRouter(<SwapPage />);
    
    const inputs = screen.getAllByPlaceholderText("0");
    
    // Click second input
    fireEvent.click(inputs[1].parentElement?.parentElement as HTMLElement);
    
    // Check if second input container has background color class
    expect(inputs[1].parentElement?.parentElement).toHaveClass("bg-background");
  });
}); 