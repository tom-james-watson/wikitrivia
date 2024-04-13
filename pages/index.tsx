import React from "react";
import dynamic from "next/dynamic";

const App = dynamic(() => import("../components/App"), { ssr: false });

export default function Index() {
  return <App />;
}
