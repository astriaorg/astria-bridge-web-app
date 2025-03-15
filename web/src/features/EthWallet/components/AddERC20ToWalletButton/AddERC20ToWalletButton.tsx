import type { EvmCurrency } from "config";

import { useEthWallet } from "../../hooks/useEthWallet";

interface AddERC20ToWalletButtonProps {
  evmCurrency: EvmCurrency;
  buttonClassNameOverride?: string;
}

export default function AddERC20ToWalletButton({
  evmCurrency,
  buttonClassNameOverride,
}: AddERC20ToWalletButtonProps) {
  const { provider } = useEthWallet();
  const buttonClassName =
    buttonClassNameOverride ?? "p-0 is-size-7 has-text-light is-ghost";

  const addCoinToWallet = async () => {
    if (!provider) {
      return;
    }
    try {
      const wasAdded = await provider.send("wallet_watchAsset", {
        type: "ERC20",
        options: {
          address: evmCurrency.erc20ContractAddress,
          symbol: evmCurrency.coinDenom,
          decimals: evmCurrency.coinDecimals,
        },
      });

      if (wasAdded) {
        console.debug("ERC20 token added: ", evmCurrency.erc20ContractAddress);
      } else {
        console.debug(
          "User declined to add ERC20 token: ",
          evmCurrency.erc20ContractAddress,
        );
      }
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <>
      <button
        type="button"
        key={evmCurrency.coinMinimalDenom}
        onClick={() => addCoinToWallet()}
        className={`button is-underlined ${buttonClassName}`}
      >
        Add ERC20 to wallet
      </button>
    </>
  );
}
