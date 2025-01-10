import { GearIcon, DownArrowIcon } from "icons";
import type React from "react";
import { ActionButton, TokenSelector } from "components";
import type { TokenItem } from "./use-token-modal";
import { useTokenModal } from "./use-token-modal";
import { useState } from "react";

enum TOKEN_INPUTS {
	TOKEN_ONE = "token_one",
	TOKEN_TWO = "token_two"
}

export function SwapPage(): React.ReactElement {
	const { tokens } = useTokenModal();
	const [inputSelected, setInputSelected] = useState(TOKEN_INPUTS.TOKEN_ONE);
	const [tokenInputOne, setTokenInputOne] = useState<TokenItem | null>(tokens[0]);
	const [tokenInputTwo, setTokenInputTwo] = useState<TokenItem | null>(null);

	 const handleArrowClick = () => {
		setInputSelected(inputSelected === TOKEN_INPUTS.TOKEN_ONE ? TOKEN_INPUTS.TOKEN_TWO : TOKEN_INPUTS.TOKEN_ONE)
		setTokenInputOne(tokenInputTwo);
		setTokenInputTwo(tokenInputOne);
	 }


	return (
		<section className="min-h-[calc(100vh-85px-96px)] flex flex-col items-center justify-center">
			<div className="max-w-[480px] mx-auto rounded-2xl p-6 border border-solid border-transparent bg-radial-dark shadow-[inset_1px_1px_1px_-1px_hsla(0,0%,100%,0.5)]">
				<div className="flex items-center justify-between mb-4">
					<h2 className="text-lg font-semibold">Swap</h2>
					<button
						type="button"
						className="text-grey-light hover:text-white"
						aria-label="Settings"
					>
						<GearIcon className="transition duration-300" />
					</button>
				</div>
				<div onKeyDown={() => null} onClick={() => setInputSelected(TOKEN_INPUTS.TOKEN_ONE)} className={`flex flex-col rounded-md p-3 transition duration-300 border border-solid border-border hover:border-grey-light ${
					inputSelected === TOKEN_INPUTS.TOKEN_ONE
						? "bg-background"
						: "bg-grey-dark"
				}`}>
					<div className="flex justify-between">
						<input
							type="number"
							className="max-w-[62%] flex-1 bg-transparent focus:outline-none text-[36px] placeholder:text-grey-light [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
							placeholder="0"
						/>
						<div className="ml-3 flex items-center space-x-2">
							<TokenSelector tokens={tokens} selectedToken={tokenInputOne} setSelectedToken={setTokenInputOne}/>
						</div>
					</div>
					<div>
						<span className="text-sm font-medium">$100</span>
					</div>
				</div>
				<div className="flex justify-center mt-2 mb-2">
				<button type="button" className="cursor-pointer p-1 bg-grey-dark hover:bg-black transition duration-300 rounded-xl" onClick={() => handleArrowClick()}>
					<DownArrowIcon
						aria-label="Swap"
						size={32}
					/>
				</button>
				</div>
				<div onKeyDown={() => null} onClick={() => setInputSelected(TOKEN_INPUTS.TOKEN_TWO)} className={`flex flex-col rounded-md p-3 transition duration-300 border border-solid border-border hover:border-grey-light ${
					inputSelected === TOKEN_INPUTS.TOKEN_TWO
						? "bg-background"
						: "bg-grey-dark"
				}`}>
					<div className="flex justify-between">
						<input
							type="number"
							className="max-w-[62%] flex-1 bg-transparent focus:outline-none text-[36px] placeholder:text-grey-light [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
							placeholder="0"
						/>
						<div className="ml-3 flex items-center space-x-2">
							<TokenSelector tokens={tokens} selectedToken={tokenInputTwo} setSelectedToken={setTokenInputTwo}/>
						</div>
					</div>
					<div>
						<span className="text-sm font-medium">$100</span>
					</div>
				</div>
				<ActionButton
					buttonText="Connect Wallet"
					className="w-full"
					disabled={true}
				/>
			</div>
		</section>
	);
}
