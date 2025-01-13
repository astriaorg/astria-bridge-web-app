interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  isLoading?: boolean;
  disabled?: boolean;
  callback?: () => void;
  buttonText?: string;
  className?: string;
  PrefixIcon?: React.ComponentType<{ className?: string, size?: number }>;
}

export const ActionButton = ({
  isLoading,
  disabled,
  callback,
  buttonText,
  className,
  PrefixIcon,
}: ButtonProps) => {

  return (
    <button
      type="button"
      className={`flex items-center justify-center bg-button-gradient text-white font-semibold px-4 py-3 rounded-xl ${disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'} ${className || ''}`}
      onClick={callback}
      disabled={disabled}
    >
      {PrefixIcon && <PrefixIcon className="mr-1"/>}
      {isLoading ? "Processing..." : buttonText}
    </button>
  );
};
