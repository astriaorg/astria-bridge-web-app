import { Dialog, DialogContent, DialogPortal, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import type { TokenItem } from "../../pages/SwapPage/use-token-modal";
import { useState } from "react";
import { ChevronDownIcon } from "icons";

interface TokenSelectorProps {
  tokens: TokenItem[];
  defaultTitle?: string;
  setSelectedToken: (token: TokenItem) => void;
  selectedToken: TokenItem | null;
}

export const TokenSelector: React.FC<TokenSelectorProps> = ({
  tokens,
  defaultTitle = "Select token",
  selectedToken,
  setSelectedToken
}) => {
const [open, setOpen] = useState(false);

const handleSelectToken = (token: TokenItem) => {
  setOpen(false);
  setSelectedToken(token);
}

  return (
    <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger>
          <div className="flex items-center bg-radial-dark px-1 rounded-2xl border border-solid border-border">
          {selectedToken?.Icon && <selectedToken.Icon size={20}/>}
              <h2 className="text-lg font-medium mx-2 whitespace-nowrap">
                {selectedToken?.symbol || defaultTitle}
              </h2>
              <ChevronDownIcon size={20}/>
            </div>  
        </DialogTrigger>
        <DialogPortal>
        <DialogContent className="bg-radial-dark w-[90%] md:w-[90%] lg:w-[480px]">
        <DialogTitle>Select a token</DialogTitle>
            <div>
                {tokens.map(({symbol, title, Icon}) => (
                  // biome-ignore lint/a11y/useKeyWithClickEvents: only click needed
                    <div onClick={() => handleSelectToken({symbol, title, Icon})} key={symbol} className="flex items-center space-x-2 p-2 rounded-md hover:bg-grey-dark transition duration-300 cursor-pointer">
                        <Icon size={32} />
                        <div className="flex flex-col">
                            <span className="text-white text-md font-semibold">{title}</span>
                            <span className="text-grey-light text-sm">{symbol}</span>
                        </div>
                    </div>
                ))}
            </div>
        </DialogContent>
        </DialogPortal>
    </Dialog>
  );
};
