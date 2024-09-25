import type React from "react";
import { useState } from "react";
import DepositCard from "components/DepositCard/DepositCard";
import WithdrawCard from "components/WithdrawCard/WithdrawCard";

type TabType = "Deposit" | "Withdraw";

interface TabProps {
  label: TabType;
  isActive: boolean;
  onClick: (tab: TabType) => void;
}

const Tab: React.FC<TabProps> = ({ label, isActive, onClick }) => (
  <li
    className={isActive ? "is-active" : ""}
    onClick={() => onClick(label)}
    onKeyUp={() => onClick(label)}
  >
    {/* biome-ignore lint/a11y/useValidAnchor: Biome unfortunately uses anchors for tabs */}
    <a onClick={() => {}}>{label}</a>
  </li>
);

const TabContent: React.FC<{ activeTab: TabType }> = ({ activeTab }) => {
  switch (activeTab) {
    case "Deposit":
      return <DepositCard />;
    case "Withdraw":
      return <WithdrawCard />;
    default:
      return null;
  }
};

export default function BridgePage(): React.ReactElement {
  const [activeTab, setActiveTab] = useState<TabType>("Deposit");

  const tabs: TabType[] = ["Deposit", "Withdraw"];

  return (
    <section className="">
      <div className="container px-2">
        <div className="columns is-centered is-vcentered is-fullheight-with-navbar">
          <div className="column is-12-mobile is-8-tablet">
            <div className="card p-5">
              <div className="tabs is-fullwidth is-large">
                {/* NOTE - just a single Deposit tab for now. Can easily add tab switcher back. */}
                Deposit
              </div>
              <TabContent activeTab={activeTab} />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
