import React from "react";

interface Props {
  minimal?: boolean;
  big?: boolean;
  small?: boolean;
  disabled?: boolean;
  animated?: boolean;
  onClick: () => void;
  children: React.JSX.Element;
}

export default function Button(props: Props) {
  const { minimal = false, big = false, small = false, disabled = false, animated = false, onClick, children } = props;

  return (
    <button
      onClick={onClick}
      className={"button" + (minimal ? " minimal" : "") + (big ? " big" : "") + (small ? " small" : "") + (animated ? " animated" : "")}
      disabled={disabled}
    >
      {children}
    </button>
  );
}
