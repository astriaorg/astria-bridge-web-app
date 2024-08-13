import React, { useState } from "react";
import BridgeCard from "components/BridgeCard/BridgeCard";
import WithdrawCard from "components/WithdrawCard/WithdrawCard";

type TabType = "Deposit" | "Withdraw";

interface TabProps {
  label: TabType;
  isActive: boolean;
  onClick: (tab: TabType) => void;
}

const Tab: React.FC<TabProps> = ({ label, isActive, onClick }) => (
  <li className={isActive ? "is-active" : ""} onClick={() => onClick(label)}>
    <a>{label}</a>
  </li>
);

const TabContent: React.FC<{ activeTab: TabType }> = ({ activeTab }) => {
  switch (activeTab) {
    case "Deposit":
      return <BridgeCard />;
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
    <section className="section">
      <div className="container is-fluid">
        <div className="columns is-centered is-vcentered is-fullheight-with-navbar">
          <div className="column is-6-mobile is-6-tablet">
            <div className="card p-5">
              <div className="tabs is-fullwidth is-large">
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
