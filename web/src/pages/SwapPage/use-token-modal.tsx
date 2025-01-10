import { CelestiaIcon, MilkTiaIcon, StrideTiaIcon, UsdcIcon, WrappedTiaIcon } from "icons";
import type { IconProps } from "types";

export interface TokenItem {
    Icon: React.ComponentType<IconProps>;
    title: string;
    symbol: string;
  }
  
  // NOTE: temporary tokens until we have a real token list from a api
  const tokens: TokenItem[] = [
    {
      Icon: CelestiaIcon,
      title: "TIA",
      symbol: "TIA",
    },
    {
      Icon: WrappedTiaIcon,
      title: "Wrapped Celestia",
      symbol: "WTIA",
    },
    {
      Icon: MilkTiaIcon,
      title: "Milk TIA",
      symbol: "milkTIA",
    },
    {
      Icon: StrideTiaIcon,
      title: "Stride TIA",
      symbol: "stTIA",
    },
    {
      Icon: UsdcIcon,
      title: "USDC",
      symbol: "USDC",
    },
  ];

  export function useTokenModal() {
    return {
      tokens,
    };
  }
