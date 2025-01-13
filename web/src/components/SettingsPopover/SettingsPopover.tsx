import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Switch } from "@/components/ui/switch";
import { GearIcon } from "icons";
import { InfoTooltip } from "../InfoTooltip/InfoTooltip";
import { useState } from "react"
import {
    AlertDialog,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogCancel,
    AlertDialogAction,
} from "@/components/ui/alert-dialog";

interface SettingsPopoverProps {}

export const SettingsPopover: React.FC<SettingsPopoverProps> = () => {
    const [customSlippage, setCustomSlippage] = useState<string>("");
    const [expertMode, setExpertMode] = useState(false);
    const [showExpertModeDialog, setShowExpertModeDialog] = useState(false);

    const handleCustomSlippageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setCustomSlippage(value);
        const numValue = parseFloat(value);
        if (!isNaN(numValue) && numValue > 0) {
            // TODO: SET SLIPPAGE
        }
    };

    const handleExpertModeChange = () => {
        if (!expertMode) {
            setShowExpertModeDialog(true);
        } else {
            setExpertMode(false);
        }
    };

    return (
        <Popover>
            <PopoverTrigger>
                <button
                    type="button"
                    className="text-grey-light hover:text-white"
                    aria-label="Settings"
                >
                    <GearIcon className="transition duration-300" />
                </button>
            </PopoverTrigger>
            <PopoverContent className="w-80 bg-radial-dark border-border" align="end">
                <div className="space-y-4">
                    <h2 className="text-md font-semibold text-white">Settings</h2>
                    <div className="space-y-2">
                        <div className="flex items-center gap-1">
                            <label className="text-sm text-white">Slippage Tolerance</label>
                            <InfoTooltip content="Your transaction will revert if the price changes unfavorably by more than this percentage." />
                        </div>
                        <div className="flex justify-between">
                            <button className="text-sm text-white bg-accent px-3 py-1 rounded-sm mr-2">Auto</button>
                            <div className="flex-1 relative">
                                <input
                                    type="text"
                                    value={customSlippage}
                                    onChange={handleCustomSlippageChange}
                                    placeholder="0.10"
                                    className="w-full px-3 py-1 pr-7 bg-grey-dark rounded-sm text-white text-right placeholder:text-grey-light placeholder:text-right focus:outline-none focus:ring-1 focus:ring-primary"
                                />
                                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-white">%</span>
                            </div>
                        </div>
                    </div>
                    <div className="space-y-2">
                        <h2 className="text-md font-semibold text-white">Interface Settings</h2>
                        <div className="flex justify-between">
                            <div className="flex items-center gap-1">
                                <label className="text-sm text-white">Expert Mode</label>
                                <InfoTooltip content="Allow high price impact trades and skip the confirm screen. Use at your own risk." />
                            </div>
                            <Switch
                                checked={expertMode}
                                onCheckedChange={handleExpertModeChange}
                                className="h-7 w-12 data-[state=unchecked]:bg-grey-light data-[state=checked]:bg-accent [&>span]:h-6 [&>span]:w-6 [&>span[data-state=checked]]:translate-x-5"
                            />
                        </div>
                    </div>
                </div>
            </PopoverContent>
            
            <AlertDialog open={showExpertModeDialog} onOpenChange={setShowExpertModeDialog}>
                <AlertDialogContent className="bg-radial-dark border-border">
                    <AlertDialogHeader>
                        <AlertDialogTitle className="text-white">Are you sure?</AlertDialogTitle>
                        <AlertDialogDescription className="text-grey-light">
                            Expert mode turns off the confirm transaction prompt and allows high slippage trades that often result in bad rates and lost funds.
                        </AlertDialogDescription>
                        <AlertDialogTitle className="text-white">ONLY USE THIS MODE IF YOU KNOW WHAT YOU ARE DOING.</AlertDialogTitle>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel className="bg-grey-dark text-white hover:bg-grey-light">Cancel</AlertDialogCancel>
                        <AlertDialogAction 
                            className="bg-accent text-white hover:bg-accent/90"
                            onClick={() => {
                                setExpertMode(true);
                                setShowExpertModeDialog(false);
                            }}
                        >
                            Turn On Expert Mode
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </Popover>
    );
};
