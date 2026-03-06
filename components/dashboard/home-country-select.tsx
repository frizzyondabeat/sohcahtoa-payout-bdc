"use client";

import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { CheckIcon, ChevronDown } from "lucide-react";
import { useMemo, useState } from "react";
import flags from "react-phone-number-input/flags";
import type { Country } from "react-phone-number-input";

type CurrencyOption = {
  code: "USD" | "EUR" | "GBP" | "CAD";
  country: Country;
  label: string;
};

const CURRENCY_OPTIONS: CurrencyOption[] = [
  { code: "USD", country: "US", label: "US Dollar" },
  { code: "EUR", country: "DE", label: "Euro" },
  { code: "GBP", country: "GB", label: "British Pound" },
  { code: "CAD", country: "CA", label: "Canadian Dollar" },
];

const Flag = ({ country, label }: { country: Country; label: string }) => {
  const FlagIcon = flags[country];

  return (
    <span className="bg-foreground/20 flex h-4 w-6 justify-center overflow-hidden rounded-sm [&_svg]:size-full">
      {FlagIcon ? <FlagIcon title={label} /> : null}
    </span>
  );
};

export const HomeCountrySelect = () => {
  const [selectedCode, setSelectedCode] = useState<CurrencyOption["code"]>("USD");
  const selectedCurrency = useMemo(
    () =>
      CURRENCY_OPTIONS.find((option) => option.code === selectedCode) ??
      CURRENCY_OPTIONS[0],
    [selectedCode]
  );

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          className="flex items-center gap-2 rounded-full border-none bg-black px-4 py-1.5 text-white hover:bg-gray-800 hover:text-white"
        >
          <Flag
            country={selectedCurrency.country}
            label={selectedCurrency.label}
          />
          <span>{selectedCurrency.code}</span>
          <ChevronDown className="h-3 w-3" />
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-[240px] p-0">
        <Command>
          <CommandInput placeholder="Search currency..." />
          <CommandList>
            <ScrollArea className="h-60">
              <CommandEmpty>No currency found.</CommandEmpty>
              <CommandGroup>
                {CURRENCY_OPTIONS.map((currency) => (
                  <CommandItem
                    key={currency.code}
                    className="gap-2"
                    onSelect={() => setSelectedCode(currency.code)}
                  >
                    <Flag country={currency.country} label={currency.label} />
                    <span className="flex-1 text-sm">{currency.code}</span>
                    <span className="text-foreground/50 text-sm">
                      {currency.label}
                    </span>
                    <CheckIcon
                      className={cn(
                        "ml-auto size-4",
                        selectedCode === currency.code
                          ? "opacity-100"
                          : "opacity-0"
                      )}
                    />
                  </CommandItem>
                ))}
              </CommandGroup>
            </ScrollArea>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
};
