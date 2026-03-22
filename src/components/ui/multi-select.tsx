import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { CheckIcon, XCircle, ChevronDown, XIcon } from "lucide-react";

import { cn } from "@/lib/utils";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";

const multiSelectVariants = cva("m-1 transition-all duration-300 ease-in-out", {
  variants: {
    variant: {
      default: "border-foreground/10 text-foreground bg-card hover:bg-card/80",
      secondary:
        "border-foreground/10 bg-secondary text-secondary-foreground hover:bg-secondary/80",
      destructive:
        "border-transparent bg-destructive text-destructive-foreground hover:bg-destructive/80",
      inverted: "inverted",
    },
  },
  defaultVariants: {
    variant: "default",
  },
});

export interface MultiSelectOption {
  label: string;
  value: string;
  icon?: React.ComponentType<{ className?: string }>;
  disabled?: boolean;
}

export interface MultiSelectGroup {
  heading: string;
  options: MultiSelectOption[];
}

interface MultiSelectProps
  extends
    Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, "onChange">,
    VariantProps<typeof multiSelectVariants> {
  options: MultiSelectOption[] | MultiSelectGroup[];
  onValueChange: (value: string[]) => void;
  value?: string[];
  defaultValue?: string[];
  placeholder?: string;
  maxCount?: number;
  modalPopover?: boolean;
  className?: string;
  searchable?: boolean;
  emptyIndicator?: React.ReactNode;
  disabled?: boolean;
}

export function MultiSelect({
  options,
  onValueChange,
  variant,
  value: controlledValue,
  defaultValue = [],
  placeholder = "Select options",
  maxCount = 3,
  modalPopover = false,
  className,
  searchable = true,
  emptyIndicator,
  disabled = false,
  ...props
}: MultiSelectProps) {
  const isGrouped = (
    opts: MultiSelectOption[] | MultiSelectGroup[],
  ): opts is MultiSelectGroup[] => opts.length > 0 && "heading" in opts[0];

  const allOptions: MultiSelectOption[] = isGrouped(options)
    ? options.flatMap((g) => g.options)
    : options;

  const isControlled = controlledValue !== undefined;
  const [internalValue, setInternalValue] =
    React.useState<string[]>(defaultValue);
  const selectedValues = isControlled ? controlledValue : internalValue;

  const [isPopoverOpen, setIsPopoverOpen] = React.useState(false);

  const renderOption = (option: MultiSelectOption) => {
    const isSelected = selectedValues.includes(option.value);
    return (
      <CommandItem
        key={option.value}
        onSelect={() => toggleOption(option.value)}
        className={cn(
          "cursor-pointer",
          option.disabled && "opacity-50 cursor-not-allowed",
        )}
        disabled={option.disabled}
      >
        <div
          className={cn(
            "mr-2 flex h-4 w-4 items-center justify-center rounded-sm border border-primary",
            isSelected
              ? "bg-primary text-primary-foreground"
              : "opacity-50 [&_svg]:invisible",
          )}
        >
          <CheckIcon className="h-4 w-4" />
        </div>
        {option.icon && (
          <option.icon className="mr-2 h-4 w-4 text-muted-foreground" />
        )}
        <span>{option.label}</span>
      </CommandItem>
    );
  };

  const setSelectedValues = (values: string[]) => {
    if (!isControlled) setInternalValue(values);
    onValueChange(values);
  };

  const toggleOption = (optionValue: string) => {
    if (disabled) return;
    const newSelectedValues = selectedValues.includes(optionValue)
      ? selectedValues.filter((v) => v !== optionValue)
      : [...selectedValues, optionValue];
    setSelectedValues(newSelectedValues);
  };

  const handleClear = () => {
    if (disabled) return;
    setSelectedValues([]);
  };

  const handleTogglePopover = () => {
    if (disabled) return;
    setIsPopoverOpen((prev) => !prev);
  };

  const clearExtraOptions = () => {
    if (disabled) return;
    setSelectedValues(selectedValues.slice(0, maxCount));
  };

  return (
    <Popover
      open={isPopoverOpen}
      onOpenChange={setIsPopoverOpen}
      modal={modalPopover}
    >
      <PopoverTrigger asChild>
        <Button
          {...props}
          onClick={handleTogglePopover}
          disabled={disabled}
          className={cn(
            "flex px-2 py-0 rounded-md border min-h-9 h-auto items-center justify-between bg-inherit hover:bg-inherit [&_svg]:pointer-events-auto w-full",
            disabled && "opacity-50 cursor-not-allowed",
            className,
          )}
        >
          {selectedValues.length > 0 ? (
            <div className="flex justify-between items-center w-full">
              <div className="flex items-center flex-wrap gap-1">
                {selectedValues.slice(0, maxCount).map((value) => {
                  const option = allOptions.find((o) => o.value === value);
                  if (!option) return null;
                  return (
                    <Badge
                      key={value}
                      className={cn(multiSelectVariants({ variant }))}
                    >
                      {option.icon && <option.icon className="h-4 w-4 mr-2" />}
                      {option.label}
                      <div
                        role="button"
                        tabIndex={0}
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleOption(value);
                        }}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" || e.key === " ") {
                            e.preventDefault();
                            e.stopPropagation();
                            toggleOption(value);
                          }
                        }}
                        className="ml-2 h-4 w-4 cursor-pointer hover:bg-white/20 rounded-sm p-0.5 -m-0.5"
                      >
                        <XCircle className="h-3 w-3" />
                      </div>
                    </Badge>
                  );
                })}
                {selectedValues.length > maxCount && (
                  <Badge
                    className={cn(
                      "bg-transparent text-foreground border-foreground/1 hover:bg-transparent",
                      multiSelectVariants({ variant }),
                    )}
                  >
                    {`+ ${selectedValues.length - maxCount} more`}
                    <XCircle
                      className="ml-2 h-4 w-4 cursor-pointer"
                      onClick={(e) => {
                        e.stopPropagation();
                        clearExtraOptions();
                      }}
                    />
                  </Badge>
                )}
              </div>
              <div className="flex items-center">
                <div
                  role="button"
                  tabIndex={0}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleClear();
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      e.stopPropagation();
                      handleClear();
                    }
                  }}
                  className="flex items-center justify-center h-4 w-4 mx-2 cursor-pointer text-muted-foreground hover:text-foreground"
                >
                  <XIcon className="h-4 w-4" />
                </div>
                <Separator
                  orientation="vertical"
                  className="flex min-h-6 h-full"
                />
                <ChevronDown className="h-4 mx-2 cursor-pointer text-muted-foreground" />
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-between w-full mx-auto">
              <span className="text-base md:text-sm text-foreground font-normal mx-3">
                {placeholder}
              </span>
              <ChevronDown className="h-4 cursor-pointer text-foreground mx-2" />
            </div>
          )}
        </Button>
      </PopoverTrigger>

      <PopoverContent
        className="w-auto min-w-[200px] p-0"
        align="start"
        onEscapeKeyDown={() => setIsPopoverOpen(false)}
      >
        <Command>
          {searchable && <CommandInput placeholder="Search..." />}
          <CommandList className="max-h-[360px] overflow-y-auto">
            <CommandEmpty>{emptyIndicator ?? "No results found."}</CommandEmpty>
            {isGrouped(options) ? (
              options.map((group) => (
                <CommandGroup key={group.heading} heading={group.heading}>
                  {group.options.map((option) => renderOption(option))}
                </CommandGroup>
              ))
            ) : (
              <CommandGroup>
                {options.map((option) => renderOption(option))}
              </CommandGroup>
            )}
          </CommandList>
          <div className="border-t">
            <div className="flex items-center">
              {selectedValues.length > 0 && (
                <>
                  <CommandItem
                    onSelect={handleClear}
                    className="flex-1 justify-center cursor-pointer rounded-none"
                  >
                    Clear
                  </CommandItem>
                  <Separator
                    orientation="vertical"
                    className="flex min-h-6 h-full"
                  />
                </>
              )}
              <CommandItem
                onSelect={() => setIsPopoverOpen(false)}
                className="flex-1 justify-center cursor-pointer rounded-none"
              >
                Close
              </CommandItem>
            </div>
          </div>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
