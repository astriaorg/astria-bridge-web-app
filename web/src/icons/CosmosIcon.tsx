import type { IconProps } from "../types";

export const CosmosIcon: React.FC<IconProps> = ({ className = "", size = 24 }) => {
  return (
    <div 
      className={`inline-block bg-contain bg-no-repeat bg-center ${className}`}
      style={{
        width: size,
        height: size,
        backgroundImage: "url(/assets/icons/logos/cosmos-logo-color.png)"
      }}
    />
  );
}; 