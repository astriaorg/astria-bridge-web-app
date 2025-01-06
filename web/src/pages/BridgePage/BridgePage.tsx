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
    <section className="">
      <div className="container px-2">
        <div className="columns is-centered is-vcentered is-fullheight-with-navbar-and-footer">
          <div className="column is-12-mobile is-8-tablet is-8-desktop is-6-widescreen">
            <div className="card">
              <div className="tabs is-fullwidth">
                <ul>
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
        </div>
      </div>
    </section>
  );
}
