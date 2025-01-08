interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  isLoading?: boolean;
  disabled?: boolean;
  callback?: () => void;
  buttonText?: string;
  className?: string;
}

export const ActionButton = ({
  isLoading,
  disabled,
  callback,
  buttonText,
  className,
}: ButtonProps) => {

  return (
    <button
      type="button"
      className={`bg-button-gradient text-white font-semibold px-4 py-3 rounded-xl mt-4 ${disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'} ${className}`}
      onClick={callback}
      disabled={disabled}
    >
      {isLoading ? "Processing..." : buttonText}
    </button>
  );
};
