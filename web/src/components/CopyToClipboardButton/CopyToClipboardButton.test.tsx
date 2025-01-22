import { fireEvent, render, screen } from "@testing-library/react";
import { act } from "react";
import CopyToClipboardButton from "./CopyToClipboardButton";

describe("<CopyToClipboardButton />", () => {
  const textToCopy = "test text";

  beforeAll(() => {
    Object.defineProperty(global.navigator, "clipboard", {
      value: {
        writeText: jest.fn(),
      },
    });
  });

  test("renders without crashing", () => {
    render(<CopyToClipboardButton textToCopy={textToCopy} />);
    const button = screen.getByRole("button");
    expect(button).toBeInTheDocument();
  });

  test("copies the URL to clipboard when clicked", () => {
    render(<CopyToClipboardButton textToCopy={textToCopy} />);
    const button = screen.getByRole("button");
    fireEvent.click(button);
    expect(global.navigator.clipboard.writeText).toHaveBeenCalledWith(
      textToCopy,
    );
  });

  test('shows "Copied!" status after click', async () => {
    jest.useFakeTimers();
    render(<CopyToClipboardButton textToCopy={textToCopy} />);

    const button = screen.getByRole("button");

    fireEvent.click(button);

    const status = await screen.findByText(/copied/i);
    expect(status).toHaveTextContent("Copied!");

    // simulate the passage of time for the setTimeout
    act(() => {
      jest.runAllTimers();
      jest.useRealTimers();
    });
    // status text was removed
    expect(status).not.toBeInTheDocument();
  });
});
