interface IconProps {
  className?: string;
  size?: number;
}

export const WalletIcon: React.FC<IconProps> = ({ className = "", size = 24 }) => {
  return (
    <div 
      className={`inline-block bg-contain bg-no-repeat bg-center ${className}`}
      style={{
        width: size,
        height: size,
        backgroundImage: "url(/assets/icons/wallet.png)"
      }}
    />
  );
}; 