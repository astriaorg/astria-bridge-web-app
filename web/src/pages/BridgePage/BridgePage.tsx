import type React from "react";

import BridgeCard from "components/BridgeCard/BridgeCard";

export default function BridgePage(): React.ReactElement {
  return (
    <section className="section">
      <div className="container is-fluid">
        <div className="columns is-centered is-vcentered is-fullheight-with-navbar">
          <div className="column is-12-mobile is-6-tablet">
            <BridgeCard />
          </div>
        </div>
      </div>
    </section>
  );
}
