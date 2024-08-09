import type React from "react";

import BridgeCard from "components/BridgeCard/BridgeCard";
import WithdrawCard from "../../components/WithdrawCard/WithdrawCard";

export default function BridgePage(): React.ReactElement {
  return (
    <section className="section">
      <div className="container is-fluid">
        <div className="columns is-centered is-vcentered is-fullheight-with-navbar">
          <div className="column is-6-mobile is-5-tablet">
            <BridgeCard />
          </div>
          <div className="column is-6-mobile is-5-tablet">
            <WithdrawCard />
          </div>
        </div>
      </div>
    </section>
  );
}
