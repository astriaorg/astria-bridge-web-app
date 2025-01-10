import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip"
import { InfoIcon } from "icons"

interface InfoTooltipProps {
    content: string;
}

export const InfoTooltip: React.FC<InfoTooltipProps> = ({ content }) => {
    return (
        <TooltipProvider>
            <Tooltip defaultOpen={false}>
                <TooltipTrigger asChild>
                    <span onMouseDown={(e) => e.stopPropagation()}>
                        <InfoIcon size={16} className="text-grey-light hover:text-white cursor-pointer" />
                    </span>
                </TooltipTrigger>
                <TooltipContent
                    className="bg-grey-dark text-white border border-border rounded-md px-3 py-2 w-[200px]"
                    sideOffset={5}
                    side="left"
                >
                    <div>{content}</div>
                </TooltipContent>
            </Tooltip>
        </TooltipProvider>
    );
};
