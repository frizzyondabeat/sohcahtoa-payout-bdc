import { Button } from "@/components/ui/button";
import { HomeCountrySelect } from "@/components/dashboard/home-country-select";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getTransactions } from "@/lib/transactions-service";
import { cn, currencyFormatter, formatDateTime } from "@/lib/utils";
import { escapeHtml } from "@/lib/sanitize";
import type { Transaction } from "@/types/transaction";
import {
  Icon,
  ExportCircle,
  ImportCircle,
  Repeat,
  WalletAdd1,
  WalletMinus,
  Eye,
} from "iconsax-react";
import Link from "next/link";
import Image from "next/image";

const FILTER_CHIPS = ["All", "FX", "PTA", "BTA", "Medicals"] as const;

const ActionButton = ({
  icon: IconComponent,
  label,
}: {
  icon: Icon;
  label: React.ReactNode;
}) => (
  <Button
    variant="outline"
    className="size-20 items-center justify-between flex-col rounded-[20px] border-[#E4E4E7] p-2.5 shadow-none hover:border-gray-200 hover:bg-gray-50"
  >
    <IconComponent
      variant="Outline"
      className="size-5! fill-primary-foreground"
    />
    <span className="whitespace-normal text-center text-xs font-medium text-primary-foreground">
      {label}
    </span>
  </Button>
);

const getTransferVisuals = (description: string) => {
  const normalizedDescription = description.toLowerCase();
  if (normalizedDescription.includes("transfer to")) {
    return {
      icon: ExportCircle,
      iconClassName: "size-[1.125rem] fill-primary",
      containerClassName:
        "size-10 rounded-full bg-[#FFF6F1] flex items-center justify-center",
      amountClassName: "text-[#FF4D4F] font-medium font-space-grotesk",
    };
  }

  if (normalizedDescription.includes("transfer from")) {
    return {
      icon: ImportCircle,
      iconClassName: "size-[1.125rem] fill-[#2F7D01]",
      containerClassName:
        "size-10 rounded-full bg-[#EFF6EC] flex items-center justify-center",
      amountClassName: "text-[#2F7D01] font-medium font-space-grotesk",
    };
  }

  return {
    icon: Repeat,
    iconClassName: "size-[1.125rem] fill-secondary-foreground",
    containerClassName:
      "size-10 rounded-full bg-white flex items-center justify-center",
    amountClassName: "text-primary-foreground font-medium font-space-grotesk",
  };
};

const TransactionRow = ({ transaction }: { transaction: Transaction }) => {
  const visuals = getTransferVisuals(transaction.description);
  const IconComponent = visuals.icon;

  return (
    <div className="flex items-center justify-between w-full">
      <div className="flex items-center gap-2">
        <div className={visuals.containerClassName}>
          <IconComponent variant="Outline" className={visuals.iconClassName} />
        </div>
        <div>
          <p className="text-sm font-medium text-primary-foreground">
            {escapeHtml(transaction.description)}
          </p>
          <p className="text-xs text-secondary-foreground">
            {formatDateTime(transaction.createdAt)}
          </p>
        </div>
      </div>
      <p className={visuals.amountClassName}>
        {currencyFormatter(transaction.amount, transaction.currency)}
      </p>
    </div>
  );
};

const HomePage = async () => {
  const data = await getTransactions({
    page: 1,
    pageSize: 10,
    sortBy: "createdAt",
    sortOrder: "desc",
  });

  const transactions = data?.data ?? [];
  const fxTransactions = transactions.slice(0, 5);
  const cardTransactions = transactions.slice(0, 3);

  return (
    <div className="grid  grid-cols-2 gap-8">
      <div className="flex flex-col gap-8">
        <div className="shrink-0 rounded-[.9375rem] bg-white p-4">
          <Tabs defaultValue="fx-bought" className="w-full">
            <div className="mb-6 flex items-center justify-between">
              <TabsList className="h-auto gap-2 bg-transparent p-0">
                <TabsTrigger
                  value="fx-bought"
                  className="rounded-full border px-4 py-1.5 shadow-none  data-[state=active]:border-primary data-[state=active]:bg-primary/10 data-[state=active]:text-primary data-[state=active]:shadow-none!"
                >
                  FX bought
                </TabsTrigger>
                <TabsTrigger
                  value="fx-sold"
                  className="rounded-full border px-4 py-1.5 border-border shadow-none data-[state=active]:border-primary data-[state=active]:bg-primary-2 data-[state=active]:text-primary data-[state=active]:shadow-none!"
                >
                  FX sold
                </TabsTrigger>
                <TabsTrigger
                  value="others"
                  className="rounded-full border px-4 py-1.5 border-border  shadow-none data-[state=active]:border-primary data-[state=active]:bg-primary-2 data-[state=active]:text-primary data-[state=active]:shadow-none!"
                >
                  Others
                </TabsTrigger>
              </TabsList>

              <HomeCountrySelect />
            </div>

            <TabsContent value="fx-bought" className="mt-0 space-y-8">
              <div>
                <div className="mb-2 flex items-center gap-2 text-sm text-muted-foreground">
                  <span>Total FX units</span>
                  <Eye variant="Bulk" className="h-4 w-4 fill-black" />
                </div>
                <div className="flex items-center gap-[5px]">
                  <span className="rounded-full bg-[#ECECEC] px-[6px] py-[6px] font-space-grotesk text-base leading-[1.2] font-medium text-[#232323]">
                    $
                  </span>
                  <p className="font-space-grotesk text-[#232323] leading-[1.2] font-bold">
                    <span className="text-[32px]">67,048</span>
                    <span className="text-base">.00</span>
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <ActionButton icon={WalletMinus} label="Buy FX" />
                <ActionButton icon={WalletAdd1} label={<>Sell FX</>} />
                <ActionButton
                  icon={ImportCircle}
                  label={
                    <>
                      Receive <br /> money
                    </>
                  }
                />
              </div>
            </TabsContent>

            <TabsContent value="fx-sold">
              <div className="py-12 text-center text-muted-foreground">
                FX Sold Content
              </div>
            </TabsContent>
            <TabsContent value="others">
              <div className="py-12 text-center text-muted-foreground">
                Others Content
              </div>
            </TabsContent>
          </Tabs>
        </div>
        <div className="rounded-[.9375rem] bg-white p-4 flex-1">
          <div className="flex items-center justify-between">
            <h3 className="text-primary-foreground text-sm font-normal">
              FX transactions
            </h3>
            <Link
              href="/dashboard/transactions"
              className="rounded-[1.25rem] border border-[#E4E4E7] px-2.5 py-[.3125rem] text-sm"
            >
              See all
            </Link>
          </div>
          <div className="flex items-center gap-2.5 mt-5 mb-9">
            {FILTER_CHIPS.map((item, index) => (
              <div
                key={item}
                className={cn(
                  "rounded-full border border-[#E4E4E7] px-2.5 py-[.3125rem] text-sm text-primary-foreground",
                  {
                    "border-primary text-primary bg-primary/20": index === 0,
                  },
                )}
              >
                {item}
              </div>
            ))}
          </div>
          <div className="flex flex-col gap-10">
            {fxTransactions.map((item) => (
              <TransactionRow key={item.id} transaction={item} />
            ))}
          </div>
        </div>
      </div>
      <div className="bg-white rounded-[.9375rem] p-2.5 flex flex-col gap-2.5">
        {/* Cards */}
        <div className="bg-sidebar p-4 rounded-[.9375rem] shrink-0">
          <div className="flex items-center justify-between">
            <h3 className="text-primary-foreground text-sm font-normal">
              Cards
            </h3>
            {/* <span className="text-xs text-transparent">See all</span> */}
          </div>
          <div className="mt-[15px] flex gap-2.5">
            <div className="relative h-[156px] font-geist w-[60%] overflow-hidden rounded-[20px] p-4 text-[#FAFAFA] shadow-[0_15px_25px_0_rgba(0,0,0,0.15)]">
              <div className="absolute inset-0 bg-[linear-gradient(38deg,#28150B_10%,#FF6813_47%,#423025_107%)]" />
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_85%_15%,rgba(250,250,250,0.20),transparent_45%)]" />
              <div className="absolute inset-0 bg-[linear-gradient(130deg,transparent_35%,rgba(250,250,250,0.1)_50%,transparent_65%)]" />
              <Image
                src={"/images/svg/card-pattern.svg"}
                alt="card-pattern"
                width={238.77}
                height={232.61}
                className="absolute top-10 -left-11 z-40"
              />
              <div className="relative z-10 flex h-full justify-between">
                <div className="flex h-full flex-col justify-between">
                  <div className="flex h-8 items-start gap-2.5">
                    <Image
                      src={"/images/svg/chip.svg"}
                      alt="chip"
                      width={44}
                      height={32}
                      className="shrink-0"
                    />
                    <p className="text-xs font-medium leading-[1.2]">
                      Prepaid card
                    </p>
                  </div>
                  <div className="space-y-0.5">
                    <p className="text-base font-medium leading-[1.2]">
                      •••• 7093
                    </p>
                    <div className="flex items-start gap-1">
                      <div className="text-[6px] leading-[1]">
                        <p>VALID</p>
                        <p>THRU</p>
                      </div>
                      <p className="text-xs leading-[1.2]">08/27</p>
                    </div>
                  </div>
                </div>
                <div className="flex h-full w-[93px] flex-col items-end justify-between">
                  <Image
                    src={"/images/svg/visa.svg"}
                    alt="visa"
                    width={55.92}
                    height={18.33}
                    className="shrink-0"
                  />
                  <div className="text-right">
                    <p className="text-base font-medium leading-[1.2]">
                      $3,048.<span className="text-xs">00</span>
                    </p>
                    <p className="text-xs whitespace-nowrap font-medium leading-[1.2]">
                      Emmanuel Israel
                    </p>
                  </div>
                </div>
              </div>
            </div>
            <button
              type="button"
              className="flex h-[156px] hover:bg-border cursor-pointer duration-200 ease-in-out transition-colors flex-1 items-center justify-center rounded-[20px] border border-dashed border-primary-foreground/70 bg-[#FAFAFA]"
            >
              <span className="text-2xl leading-none text-primary-foreground">
                +
              </span>
            </button>
          </div>
        </div>
        {/* Card transactions */}
        <div className="bg-sidebar p-4 rounded-[.9375rem] shrink-0 space-y-9">
          <div className="flex items-center justify-between">
            <h3 className="text-primary-foreground text-sm font-normal">
              Card transactions
            </h3>
            <Link
              href="#"
              className="rounded-[1.25rem] bg-white border border-[#E4E4E7] px-2.5 py-[.3125rem] text-sm"
            >
              See all
            </Link>
          </div>
          <div className="flex flex-col gap-10">
            {cardTransactions.map((item) => (
              <TransactionRow key={item.id} transaction={item} />
            ))}
          </div>
        </div>
        {/* Card transactions flows */}
        <div className="bg-sidebar p-4 rounded-[.9375rem] shrink-0">
          <div className="flex items-center justify-between">
            <h3 className="text-primary-foreground text-sm font-normal">
              Card transactions flows
            </h3>
            <p className="text-base font-space-grotesk font-bold">
              +$3,048.<span className="text-sm">00</span>
            </p>
          </div>
          <div className="mt-5 space-y-5">
            <div className="rounded-[10px] bg-white px-5 py-[25px]">
              <div className="mb-[10px] flex items-center justify-between text-xs font-normal leading-[1.2] text-primary-foreground">
                <p>Money in</p>
                <p>$4,046.00</p>
              </div>
              <Progress
                value={38}
                className="h-1.5 rounded-[8px] bg-[#E7EBE5]"
                indicatorClassName="rounded-[8px] bg-[#2F7D01] after:absolute after:inset-0 after:bg-[repeating-linear-gradient(135deg,transparent_0_6px,#CFDFC8_6px_8px)] after:opacity-70"
              />
            </div>
            <div className="rounded-[10px] bg-white px-5 py-[25px]">
              <div className="mb-[10px] flex items-center justify-between text-xs font-normal leading-[1.2] text-primary-foreground">
                <p>Money out</p>
                <p>$1,046.00</p>
              </div>
              <Progress
                value={79}
                className="h-1.5 rounded-[8px] bg-[#F2EAE6]"
                indicatorClassName="rounded-[8px] bg-[#FF6813] after:absolute after:inset-0 after:bg-[repeating-linear-gradient(135deg,transparent_0_6px,#F0CEBD_6px_8px)] after:opacity-70"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
