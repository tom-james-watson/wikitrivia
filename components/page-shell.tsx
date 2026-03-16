import classNames from "classnames";
import React from "react";
import SiteHeader from "./site-header";
import * as ui from "../styles/ui.css";

interface Props {
  children: React.ReactNode;
  contentClassName?: string;
  pageClassName?: string;
  showHeader?: boolean;
}

export default function PageShell(props: Props) {
  const {
    children,
    contentClassName,
    pageClassName,
    showHeader = true,
  } = props;

  return (
    <div className={classNames(ui.appPage, pageClassName)}>
      {showHeader ? <SiteHeader /> : null}
      <main className={classNames(ui.appPageContent, contentClassName)}>
        {children}
      </main>
    </div>
  );
}
