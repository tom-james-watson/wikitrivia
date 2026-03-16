import type React from "react";

function toCustomPropertyName(variable: string): `--${string}` {
  const match = /^var\((--[^)]+)\)$/.exec(variable);

  if (!match) {
    throw new Error(
      `Expected a vanilla-extract variable, received "${variable}"`,
    );
  }

  return match[1] as `--${string}`;
}

export function assignInlineCssVars(
  entries: ReadonlyArray<readonly [string, string | undefined]>,
): React.CSSProperties {
  const styles: Record<`--${string}`, string> = {} as Record<
    `--${string}`,
    string
  >;

  for (const [variable, value] of entries) {
    if (value === undefined) {
      continue;
    }

    styles[toCustomPropertyName(variable)] = value;
  }

  return styles as React.CSSProperties;
}
