import { GearIcon, ArrowUpDownIcon } from "icons";
import type React from "react";
import { ActionButton } from "components";
export function SwapPage(): React.ReactElement {
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
						<GearIcon className="transition duration-300"/>
					</button>
				</div>
				<div className="flex flex-col bg-neutral-800 rounded-md p-3">
					<div className="flex justify-between">
					<input
						type="number"
						className="max-w-[70%] flex-1 bg-transparent focus:outline-none text-[36px] placeholder:text-neutral-500 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
						placeholder="0"
					/>
					<div className="ml-3 flex items-center space-x-2">
						<span className="text-sm font-medium">TIA</span>
					</div>
					</div>
					<div>
						<span className="text-sm font-medium">$100</span>
					</div>
				</div>
				<div className="flex justify-center mt-2 mb-2">
						<ArrowUpDownIcon size={32} className="cursor-pointer hover:bg-black transition duration-300 rounded-xl"/>
				</div>
				<div className="flex flex-col bg-neutral-800 rounded-md p-3">
					<div className="flex justify-between">
					<input
						type="number"
						className="max-w-[70%] flex-1 bg-transparent focus:outline-none text-[36px] placeholder:text-neutral-500 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
						placeholder="0"
					/>
					<div className="ml-3 flex items-center space-x-2">
						<span className="text-sm font-medium">TIA</span>
					</div>
					</div>
					<div>
						<span className="text-sm font-medium">$100</span>
					</div>
				</div>
				<ActionButton buttonText="Connect Wallet" className="w-full" disabled={true}/>
			</div>
		</section>
	);
}
