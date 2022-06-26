import { PageHeader } from "antd";
import React from "react";

// displays a page header

export default function Header() {
  return (
    <a href="/" /*target="_blank" rel="noopener noreferrer"*/>
      <PageHeader
        title="Decentralized staking app"
        subTitle="Collect asserts from many accounts and send them somewhere"
        style={{ cursor: "pointer" }}
      />
    </a>
  );
}
