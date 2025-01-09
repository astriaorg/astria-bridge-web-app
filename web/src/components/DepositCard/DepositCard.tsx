import { Decimal } from "@cosmjs/math";
import type React from "react";
import { useCallback, useEffect, useMemo, useState } from "react";

import AnimatedArrowSpacer from "components/AnimatedDownArrowSpacer/AnimatedDownArrowSpacer";
import Dropdown from "components/Dropdown/Dropdown";
import { useConfig } from "config";
import {
	sendIbcTransfer,
	useCosmosChainSelection,
} from "features/CosmosWallet";
import {
	AddERC20ToWalletButton,
	useEvmChainSelection,
} from "features/EthWallet";
import { NotificationType, useNotifications } from "features/Notifications";
import { ActionButton } from "components/ActionButton/ActionButton";
import {
	ArrowUpDownIcon,
	CosmosIcon,
	EditIcon,
	PlusIcon,
	WalletIcon,
} from "icons";

export default function DepositCard(): React.ReactElement {
	const { evmChains, cosmosChains } = useConfig();
	const { addNotification } = useNotifications();

	const {
		evmAccountAddress,
		selectEvmChain,
		evmChainsOptions,
		selectedEvmChain,
		selectedEvmChainOption,
		defaultEvmCurrencyOption,
		selectEvmCurrency,
		evmCurrencyOptions,
		evmBalance,
		isLoadingEvmBalance,
		connectEVMWallet,
		resetState: resetEvmWalletState,
	} = useEvmChainSelection(evmChains);

	const {
		cosmosAccountAddress: fromAddress,
		selectCosmosChain,
		cosmosChainsOptions,
		selectedCosmosChain,
		selectedCosmosChainOption,
		defaultIbcCurrencyOption,
		selectIbcCurrency,
		selectedIbcCurrency,
		ibcCurrencyOptions,
		cosmosBalance,
		isLoadingCosmosBalance,
		connectCosmosWallet,
		getCosmosSigningClient,
	} = useCosmosChainSelection(cosmosChains);

	// ensure cosmos wallet connection when selected ibc chain changes
	useEffect(() => {
		if (!selectedCosmosChain) {
			return;
		}
		connectCosmosWallet();
	}, [selectedCosmosChain, connectCosmosWallet]);

	// the evm currency selection is controlled by the sender's chosen ibc currency,
	// and should be updated when an ibc currency or evm chain is selected
	const selectedEvmCurrencyOption = useMemo(() => {
		if (!selectedIbcCurrency) {
			return defaultEvmCurrencyOption;
		}
		const matchingEvmCurrency = selectedEvmChain?.currencies.find(
			(currency) => currency.coinDenom === selectedIbcCurrency.coinDenom,
		);
		if (!matchingEvmCurrency) {
			return null;
		}
		return {
			label: matchingEvmCurrency.coinDenom,
			value: matchingEvmCurrency,
			LeftIcon: matchingEvmCurrency.IconComponent,
		};
	}, [selectedIbcCurrency, selectedEvmChain, defaultEvmCurrencyOption]);

	const [amount, setAmount] = useState<string>("");
	const [isAmountValid, setIsAmountValid] = useState<boolean>(false);
	const [isRecipientAddressValid, setIsRecipientAddressValid] =
		useState<boolean>(false);
	const [hasTouchedForm, setHasTouchedForm] = useState<boolean>(false);
	const [isLoading, setIsLoading] = useState<boolean>(false);
	const [isAnimating, setIsAnimating] = useState<boolean>(false);

	// recipientAddressOverride is used to allow manual entry of an address
	const [recipientAddressOverride, setRecipientAddressOverride] =
		useState<string>("");
	const [isRecipientAddressEditable, setIsRecipientAddressEditable] =
		useState<boolean>(false);
	const handleEditRecipientClick = useCallback(() => {
		setIsRecipientAddressEditable(!isRecipientAddressEditable);
	}, [isRecipientAddressEditable]);
	const handleEditRecipientSave = () => {
		setIsRecipientAddressEditable(false);
		// reset evmWalletState when user manually enters address
		resetEvmWalletState();
	};
	const handleEditRecipientClear = () => {
		setIsRecipientAddressEditable(false);
		setRecipientAddressOverride("");
	};
	const updateRecipientAddressOverride = (
		event: React.ChangeEvent<HTMLInputElement>,
	) => {
		setRecipientAddressOverride(event.target.value);
	};

	// check if form is valid whenever values change
	useEffect(() => {
		if (evmAccountAddress || amount || recipientAddressOverride) {
			// have touched form when evmAccountAddress or amount change
			setHasTouchedForm(true);
		}
		const recipientAddress = recipientAddressOverride || evmAccountAddress;
		checkIsFormValid(recipientAddress, amount);
	}, [evmAccountAddress, amount, recipientAddressOverride]);

	const updateAmount = (event: React.ChangeEvent<HTMLInputElement>) => {
		setAmount(event.target.value);
	};

	const checkIsFormValid = (
		addressInput: string | null,
		amountInput: string,
	) => {
		if (addressInput === null) {
			setIsRecipientAddressValid(false);
			return;
		}
		// check that address is correct evm address format
		if (!addressInput.startsWith("0x")) {
			setIsRecipientAddressValid(false);
			return;
		}

		const amount = Number.parseFloat(amountInput);
		const amountValid = amount > 0;
		setIsAmountValid(amountValid);
		// TODO - what validation should we do?
		const addressValid = addressInput.length > 0;
		setIsRecipientAddressValid(addressValid);
	};

	const handleConnectEVMWallet = useCallback(() => {
		// clear recipient address override values when user attempts to connect evm wallet
		setIsRecipientAddressEditable(false);
		setRecipientAddressOverride("");
		connectEVMWallet();
	}, [connectEVMWallet]);

	// ensure evm wallet connection when selected EVM chain changes
	useEffect(() => {
		if (!selectedEvmChain) {
			return;
		}
		// FIXME - there is a bad implicit loop of logic here.
		//  - see comment in `features/EthWallet/hooks/useEvmChainSelection.tsx`
		//  1. user can click "Connect EVM Wallet", which calls `connectEVMWallet`, before selecting a chain
		//  2. `connectEVMWallet` will set the selected evm chain if it's not set
		//  3. this `useEffect` is then triggered, which ultimately calls `connectEVMWallet`,
		//     but now a chain is set so it will open the connect modal
		handleConnectEVMWallet();
	}, [selectedEvmChain, handleConnectEVMWallet]);

	const handleDeposit = async () => {
		if (!selectedCosmosChain || !selectedIbcCurrency) {
			addNotification({
				toastOpts: {
					toastType: NotificationType.WARNING,
					message: "Please select a chain and token to bridge first.",
					onAcknowledge: () => {},
				},
			});
			return;
		}

		const recipientAddress = recipientAddressOverride || evmAccountAddress;
		if (!fromAddress || !recipientAddress) {
			addNotification({
				toastOpts: {
					toastType: NotificationType.WARNING,
					message: "Please connect your Keplr and EVM wallet first.",
					onAcknowledge: () => {},
				},
			});
			return;
		}

		setIsLoading(true);
		setIsAnimating(true);

		try {
			const formattedAmount = Decimal.fromUserInput(
				amount,
				selectedIbcCurrency.coinDecimals,
			).atomics;

			const signer = await getCosmosSigningClient();
			await sendIbcTransfer(
				signer,
				fromAddress,
				recipientAddress,
				formattedAmount,
				selectedIbcCurrency,
			);
			addNotification({
				toastOpts: {
					toastType: NotificationType.SUCCESS,
					message: "Deposit successful!",
					onAcknowledge: () => {},
				},
			});
		} catch (e) {
			setIsAnimating(false);
			console.error("IBC transfer failed", e);
			const message = e instanceof Error ? e.message : "Unknown error.";
			if (/failed to get account from keplr wallet/i.test(message)) {
				addNotification({
					toastOpts: {
						toastType: NotificationType.DANGER,
						message:
							"Failed to get account from Keplr wallet. Does this address have funds for the selected chain?",
						onAcknowledge: () => {},
					},
				});
			} else {
				addNotification({
					toastOpts: {
						toastType: NotificationType.DANGER,
						component: (
							<>
								<p className="mb-1">Failed to send IBC transfer.</p>
								<p className="message-body-inner">{message}</p>
							</>
						),
						onAcknowledge: () => {},
					},
				});
			}
		} finally {
			setIsLoading(false);
			setTimeout(() => setIsAnimating(false), 1000);
		}
	};

	// disable deposit button if form is invalid
	const isDepositDisabled = useMemo<boolean>((): boolean => {
		if (recipientAddressOverride) {
			// there won't be a selected evm chain and currency if user manually
			// enters a recipient address
			return !(isAmountValid && isRecipientAddressValid && fromAddress);
		}
		return !(
			evmAccountAddress &&
			isAmountValid &&
			isRecipientAddressValid &&
			fromAddress &&
			selectedIbcCurrency?.coinDenom ===
				selectedEvmCurrencyOption?.value?.coinDenom
		);
	}, [
		recipientAddressOverride,
		evmAccountAddress,
		isAmountValid,
		isRecipientAddressValid,
		fromAddress,
		selectedIbcCurrency,
		selectedEvmCurrencyOption,
	]);

	const additionalIbcChainOptions = useMemo(
		() => [
			{
				label: "Connect Cosmos Wallet",
				action: connectCosmosWallet,
				LeftIcon: CosmosIcon,
				RightIcon: PlusIcon,
			},
		],
		[connectCosmosWallet],
	);

	const additionalEvmChainOptions = useMemo(() => {
		return [
			{
				label: "Connect EVM Wallet",
				action: handleConnectEVMWallet,
				RightIcon: PlusIcon,
			},
			{
				label: "Enter address manually",
				action: handleEditRecipientClick,
				RightIcon: EditIcon,
			},
		];
	}, [handleConnectEVMWallet, handleEditRecipientClick]);

	return (
		<div>
			<div className="mb-4">
				<div className="flex flex-col">
					<div className="flex flex-row items-center mb-3">
						<div className="mr-4 min-w-[70px] md:min-w-[60px]">From</div>
						<div className="flex-grow">
							<Dropdown
								placeholder="Select..."
								options={cosmosChainsOptions}
								onSelect={selectCosmosChain}
								additionalOptions={additionalIbcChainOptions}
								valueOverride={selectedCosmosChainOption}
								LeftIcon={WalletIcon}
							/>
						</div>
						{selectedCosmosChain && ibcCurrencyOptions && (
							<div className="ml-3">
								<Dropdown
									placeholder="Select a token"
									options={ibcCurrencyOptions}
									defaultOption={defaultIbcCurrencyOption}
									onSelect={selectIbcCurrency}
									LeftIcon={WalletIcon}
								/>
							</div>
						)}
					</div>
					{fromAddress && (
						<div className="bg-grey-dark rounded-xl py-2 px-3">
							{fromAddress && (
								<p className="text-grey-light font-semibold">
									Address: {fromAddress}
								</p>
							)}
							{fromAddress &&
								selectedIbcCurrency &&
								!isLoadingCosmosBalance && (
									<p className="mt-2 text-grey-lighter font-semibold">
										Balance: {cosmosBalance}
									</p>
								)}
							{fromAddress && isLoadingCosmosBalance && (
								<p className="mt-2 text-grey-lighter font-semibold">
									Balance: <i className="fas fa-spinner fa-pulse" />
								</p>
							)}
						</div>
					)}
				</div>
			</div>

			{isAnimating ? (
				<AnimatedArrowSpacer isAnimating={isAnimating} />
			) : (
				<div className="flex flex-row">
					<div>
						<ArrowUpDownIcon size={32} />
					</div>
					<div className="ml-4 border-t border-grey-dark my-4 w-full" />
				</div>
			)}

			<div className="mb-4">
				<div className="flex flex-row items-center">
					<div className="mr-4 min-w-[70px] md:min-w-[60px]">To</div>
					<div className="flex-grow">
						<Dropdown
							placeholder="Connect EVM Wallet or enter address"
							options={evmChainsOptions}
							onSelect={selectEvmChain}
							additionalOptions={additionalEvmChainOptions}
							valueOverride={selectedEvmChainOption}
							LeftIcon={WalletIcon}
						/>
					</div>
					{selectedEvmChain && evmCurrencyOptions && (
						<div className="ml-3">
							<Dropdown
								placeholder="No matching token"
								options={evmCurrencyOptions}
								defaultOption={defaultEvmCurrencyOption}
								onSelect={selectEvmCurrency}
								valueOverride={selectedEvmCurrencyOption}
								disabled={true}
							/>
						</div>
					)}
				</div>
				{evmAccountAddress &&
					!isRecipientAddressEditable &&
					!recipientAddressOverride && (
						<div className="mt-3 bg-grey-dark rounded-xl py-2 px-3">
							{evmAccountAddress && (
								<p
									className="text-grey-light font-semibold cursor-pointer"
									onKeyDown={handleEditRecipientClick}
									onClick={handleEditRecipientClick}
								>
									<span className="mr-2">Address: {evmAccountAddress}</span>
									<i className="fas fa-pen-to-square" />
								</p>
							)}
							{evmAccountAddress &&
								selectedEvmChain &&
								!isLoadingEvmBalance && (
									<p className="mt-2 text-grey-lighter font-semibold">
										Balance: {evmBalance}
									</p>
								)}
							{evmAccountAddress && isLoadingEvmBalance && (
								<p className="mt-2 text-grey-lighter font-semibold">
									Balance: <i className="fas fa-spinner fa-pulse" />
								</p>
							)}
							{selectedEvmCurrencyOption?.value?.erc20ContractAddress && (
								<AddERC20ToWalletButton
									evmCurrency={selectedEvmCurrencyOption.value}
								/>
							)}
						</div>
					)}
				{/* ... other recipient address conditions ... */}
			</div>

			<div className="flex flex-row items-center">
				<div className="border-t border-grey-dark my-4 w-full" />
			</div>

			<div className="mb-4">
				<div className="flex flex-row items-center">
					<div className="mr-4 min-w-[70px] md:min-w-[60px]">Amount</div>
					<div className="mt-1 flex-grow">
						<input
							className="w-full p-3 bg-transparent border border-grey-dark focus:border-white focus:outline-none rounded-xl text-white text-[20px]"
							type="text"
							placeholder="0.00"
							onChange={updateAmount}
							value={amount}
						/>
					</div>
				</div>
				{!isAmountValid && hasTouchedForm && (
					<div className="text-status-danger mt-2">
						Amount must be a number greater than 0
					</div>
				)}
			</div>

			<div className="mt-4">
				<ActionButton
					onClick={handleDeposit}
					disabled={isDepositDisabled}
					isLoading={isLoading}
					buttonText={"Deposit"}
				/>
			</div>
		</div>
	);
}
