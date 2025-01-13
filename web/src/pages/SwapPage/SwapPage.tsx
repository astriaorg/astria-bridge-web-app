import { DownArrowIcon } from "icons";
import type React from "react";
import { ActionButton, TokenSelector, SettingsPopover, SwapTxnInfo } from "components";
import type { TokenItem } from "./use-token-modal";
import { useTokenModal } from "./use-token-modal";
import { useState } from "react";

enum TOKEN_INPUTS {
	TOKEN_ONE = "token_one",
	TOKEN_TWO = "token_two"
}

interface TokenState {
	token: TokenItem | null;
	value: string;
}


export function SwapPage(): React.ReactElement {
	const { tokens } = useTokenModal();
	const [inputSelected, setInputSelected] = useState(TOKEN_INPUTS.TOKEN_ONE);
	const [inputOne, setInputOne] = useState<TokenState>({ token: tokens[0], value: '' });
	const [inputTwo, setInputTwo] = useState<TokenState>({ token: null, value: '' });

	const handleInputChange = (value: string, isInputOne: boolean) => {
		if (isInputOne) {
			setInputOne(prev => ({ ...prev, value }));
		} else {
			setInputTwo(prev => ({ ...prev, value }));
		}
	};

	const handleArrowClick = () => {
		setInputSelected(inputSelected === TOKEN_INPUTS.TOKEN_ONE ? TOKEN_INPUTS.TOKEN_TWO : TOKEN_INPUTS.TOKEN_ONE);
		setInputOne(prev => ({ ...prev, token: inputTwo.token }));
		setInputTwo(prev => ({ ...prev, token: inputOne.token }));
	};

	return (
		<section className="min-h-[calc(100vh-85px-96px)] flex flex-col mt-[100px]">
			<div className="max-w-[550px] mx-auto rounded-2xl p-12 border border-solid border-transparent bg-radial-dark shadow-[inset_1px_1px_1px_-1px_hsla(0,0%,100%,0.5)]">
				<div className="flex items-center justify-between mb-4">
					<h2 className="text-lg font-semibold">Swap</h2>
					<SettingsPopover />
				</div>
				<div onKeyDown={() => null} onClick={() => setInputSelected(TOKEN_INPUTS.TOKEN_ONE)} className={`flex flex-col rounded-md p-3 transition duration-300 border border-solid border-border hover:border-grey-light ${
					inputSelected === TOKEN_INPUTS.TOKEN_ONE
						? "bg-background"
						: "bg-grey-dark"
				}`}>
					<div className="flex justify-between">
						<input
							type="number"
							value={inputOne.value}
							onChange={(e) => handleInputChange(e.target.value, true)}
							className="max-w-[62%] flex-1 bg-transparent focus:outline-none text-[36px] placeholder:text-grey-light [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
							placeholder="0"
						/>
						<div className="ml-3 flex items-center space-x-2">
							<TokenSelector tokens={tokens} selectedToken={inputOne.token} setSelectedToken={(token) => setInputOne(prev => ({ ...prev, token }))}/>
						</div>
					</div>
					<div>
						<span className="text-sm font-medium">$100</span>
					</div>
				</div>
				<div className="relative flex justify-center" style={{ margin: '-20px 0' }}>
					<button type="button" className="z-10 cursor-pointer p-1 bg-grey-medium hover:bg-black transition duration-300 rounded-xl border-4 border-black" onClick={() => handleArrowClick()}>
						<DownArrowIcon
							aria-label="Swap"
							size={28}
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
							value={inputTwo.value}
							onChange={(e) => handleInputChange(e.target.value, false)}
							className="max-w-[62%] flex-1 bg-transparent focus:outline-none text-[36px] placeholder:text-grey-light [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
							placeholder="0"
						/>
						<div className="ml-3 flex items-center space-x-2">
							<TokenSelector tokens={tokens} selectedToken={inputTwo.token} setSelectedToken={(token) => setInputTwo(prev => ({ ...prev, token }))}/>
						</div>
					</div>
					<div>
						<span className="text-sm font-medium">$100</span>
					</div>
				</div>
				<ActionButton
					buttonText="Connect Wallet"
					className="w-full mt-4"
				/>
				<SwapTxnInfo />
			</div>
		</section>
	);
}
