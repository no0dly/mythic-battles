import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-primary text-primary-foreground hover:bg-primary/80",
        secondary:
          "border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80",
        destructive:
          "border-transparent bg-destructive text-destructive-foreground hover:bg-destructive/80",
        outline: "text-foreground",
        available:
          "bg-green-500/20 text-green-600 dark:text-green-400 border-green-500/30",
        draft:
          "bg-yellow-500/20 text-yellow-600 dark:text-yellow-400 border-yellow-500/30",
        inProgress:
          "bg-blue-500/20 text-blue-600 dark:text-blue-400 border-blue-500/30",
        finished:
          "bg-gray-500/20 text-gray-600 dark:text-gray-400 border-gray-500/30",
        error: "bg-red-500/20 text-red-600 dark:text-red-400 border-red-500/30",
        inviteToDraft:
          "bg-purple-500/20 text-purple-600 dark:text-purple-400 border-purple-500/30",
        draftResetRequest:
          "bg-orange-500/20 text-orange-600 dark:text-orange-400 border-orange-500/30",
        pending:
          "bg-orange-500/20 text-orange-600 dark:text-orange-400 border-orange-500/30",
        notification:
          "border-transparent bg-red-500 text-white flex items-center justify-center",
        rankBeginner:
          "bg-slate-500/20 text-slate-700 dark:text-slate-300 border-slate-500/30",
        rankApprentice:
          "bg-green-500/20 text-green-700 dark:text-green-300 border-green-500/30",
        rankExperienced:
          "bg-blue-500/20 text-blue-700 dark:text-blue-300 border-blue-500/30",
        rankExpert:
          "bg-purple-500/20 text-purple-700 dark:text-purple-300 border-purple-500/30",
        rankMaster:
          "bg-amber-500/20 text-amber-700 dark:text-amber-300 border-amber-500/30",
        rankLegend:
          "bg-gradient-to-r from-yellow-500/30 to-orange-500/30 text-orange-800 dark:text-orange-200 border-orange-500/40 font-bold",
        hero:
          "bg-slate-600 text-white border-transparent",
        monster:
          "bg-emerald-600 text-white border-transparent",
        god:
          "bg-amber-500 text-white border-transparent",
        titan:
          "bg-cyan-500 text-white border-transparent",
        troop:
          "bg-orange-600 text-white border-transparent",
        jarl:
          "bg-purple-600 text-white border-transparent",
        art_of_war:
          "bg-red-600 text-white border-transparent",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}

export { Badge, badgeVariants };
