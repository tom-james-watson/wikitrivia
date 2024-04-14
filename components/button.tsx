import React from "react";

interface Props {
  minimal?: boolean;
  big?: boolean;
  disabled?: boolean;
  onClick: () => void;
  children: React.JSX.Element;
}

export default function Button(props: Props) {
  const { minimal = false, big = false, disabled = false, onClick, children } = props;

  return (
    <button
      onClick={onClick}
      className={"button" + (minimal ? " minimal" : "") + (big ? " big" : "")}
      disabled={disabled}
    >
      {children}
    </button>
  );
}
