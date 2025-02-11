import { useRouter } from "next/navigation";
import { PlusIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

export default function AddEntryButton({ className }) {
  const router = useRouter();
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button className="ml-4 h-8 w-8" variant="outline" size="icon" onClick={() => router.push("./entries/new")}>
          <PlusIcon className="h-4 w-4" />
        </Button>
      </TooltipTrigger>
      <TooltipContent>
        <p>Create Radar Entry</p>
      </TooltipContent>
    </Tooltip>
  );
}
