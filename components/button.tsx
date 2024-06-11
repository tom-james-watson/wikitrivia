import React from "react";

interface Props {
  minimal?: boolean;
  big?: boolean;
  small?: boolean;
  disabled?: boolean;
  onClick: () => void;
  children: React.JSX.Element;
}

export default function Button(props: Props) {
  const { minimal = false, big = false, small = false, disabled = false, onClick, children } = props;

  return (
    <button
      onClick={onClick}
      className={"button" + (minimal ? " minimal" : "") + (big ? " big" : "") + (small ? " small" : "")}
      disabled={disabled}
    >
      {children}
    </button>
  );
}
