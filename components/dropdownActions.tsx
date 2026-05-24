import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { EllipsisVertical } from "lucide-react";

interface ActionItem {
    icon: React.ReactNode;
    label: string;
    onClick: (data: any) => void;
    hasPermission?: boolean;
}

interface DropdownActionsProps {
    actionItems: ActionItem[];
    data: any;
    hasPermission?: boolean;
}

export default function DropdownActions({ actionItems, data, hasPermission }: DropdownActionsProps) {
    return (
         <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <EllipsisVertical />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuLabel>Actions</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  {actionItems.map((item, index) => (
                    <DropdownMenuItem key={index} onClick={() => item.onClick(data)} disabled={!item.hasPermission && !hasPermission}>
                      {item.icon}
                      {item.label}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
    );
}