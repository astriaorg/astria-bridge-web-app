import type React from "react";
import { useState } from "react";

import DepositCard from "components/DepositCard/DepositCard";
import WithdrawCard from "components/WithdrawCard/WithdrawCard";

type TabType = "DEPOSIT" | "WITHDRAW";

interface TabProps {
  label: TabType;
  isActive: boolean;
  onClick: (tab: TabType) => void;
}

const Tab: React.FC<TabProps> = ({ label, isActive, onClick }) => (
  <li
    className={`flex flex-1 h-14 justify-center items-center cursor-pointer ${
      isActive
        ? "bg-[radial-gradient(100%_100%_at_50.15%_0%,#221f1f_0%,#050a0d_100%)] shadow-[inset_3px_3px_3px_-3px_rgba(255,255,255,0.5)] rounded-xl"
        : ""
    }`}
    onClick={() => onClick(label)}
    onKeyUp={() => onClick(label)}
  >
    <a
    /* biome-ignore lint/a11y/useValidAnchor: Biome unfortunately uses anchors for tabs */
      onClick={() => {}}
      className={`px-6 py-4 font-mono font-medium transition-all duration-100 ease-in ${
        isActive
          ? "text-white font-bold"
          : "text-[#9B9B9B] hover:text-[#D9D9D9]"
      }`}
    >
      {label}
    </a>
  </li>
);

const TabContent: React.FC<{ activeTab: TabType }> = ({ activeTab }) => {
  switch (activeTab) {
    case "DEPOSIT":
      return <DepositCard />;
    case "WITHDRAW":
      return <WithdrawCard />;
    default:
      return null;
  }
};

export function BridgePage(): React.ReactElement {
  const [activeTab, setActiveTab] = useState<TabType>("DEPOSIT");

  const tabs: TabType[] = ["DEPOSIT", "WITHDRAW"];

  return (
    <section className="min-h-[calc(100vh-85px-96px)] flex flex-col items-center mt-[100px]">
          <div className="w-full md:w-2/3 lg:w-2/3 xl:w-1/2 max-w-[676px]">
            <div className="p-12 md:p-[48px] bg-[radial-gradient(144.23%_141.13%_at_50.15%_0%,#221F1F_0%,#050A0D_100%)] shadow-[inset_1px_1px_1px_-1px_rgba(255,255,255,0.5)] rounded-2xl">
              <div className="flex items-center justify-center p-1 w-full bg-white/[0.04] border-[1px] border-white/20 rounded-xl border-b-0 border-r-0 mb-5">
                <ul className="flex w-full text-center">
                  {tabs.map((tab) => (
                    <Tab
                      key={tab}
                      label={tab}
                      isActive={activeTab === tab}
                      onClick={setActiveTab}
                    />
                  ))}
                </ul>
              </div>
              <TabContent activeTab={activeTab} />
            </div>
          </div>
    </section>
  );
}
