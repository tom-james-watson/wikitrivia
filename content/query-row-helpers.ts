export function cleanDescription(value: string | undefined): string {
  return (value ?? "")
    .replace(/\s*\([^)]*\)\s*$/u, "")
    .replace(/\s*\[[^\]]*\]\s*$/u, "")
    .replace(/^\d{1,2}(?:st|nd|rd|th)-century(?:\s+(?:BCE|BC|CE|AD))?\s+/iu, "")
    .replace(/^(?:BCE|BC|CE|AD)\s+/iu, "")
    .replace(/\s+/g, " ")
    .trim();
}

export function firstLabel(value: string | undefined): string {
  return value?.split("||").find(Boolean) ?? "";
}

export function hasYear(value: string): boolean {
  return /\b-?\d{3,4}\b/.test(value);
}

export function descriptionSubtitle(row: { description?: string }): string {
  return cleanDescription(row.description);
}

export function quoteTitle(value: string | undefined): string {
  const trimmed = (value ?? "").replace(/\s+/g, " ").trim();

  if (trimmed.length === 0) {
    return "";
  }

  return `‘${trimmed}’`;
}

export function quotedItemLabel<Row extends { itemLabel?: string }>(
  suffix: string,
): (row: Row) => string {
  return (row: Row) => {
    const title = quoteTitle(row.itemLabel);

    return title.length > 0 ? `${title} ${suffix}` : suffix;
  };
}

export function personSubtitle(row: { description?: string }): string {
  const description = cleanDescription(row.description);

  return description.length > 0 &&
    description.length <= 80 &&
    !hasYear(description)
    ? description
    : "";
}

export function normalizePlaceLabel(value: string | undefined): string {
  const trimmed = (value ?? "").replace(/\s+/g, " ").trim();
  return (
    trimmed.match(/\bin (.+)$/u)?.[1] ??
    trimmed.match(
      /^(?:People's Republic|Republic|Kingdom|State|Commonwealth) of (.+)$/u,
    )?.[1] ??
    (trimmed === "United States" ? "the United States" : trimmed)
  );
}

function replaceRoleWord(
  positionLabel: string,
  pattern: RegExp,
  replacement: string,
): string {
  return pattern.test(positionLabel)
    ? positionLabel.replace(pattern, replacement)
    : positionLabel;
}

function monarchRoleLabel(
  positionLabel: string,
  sexLabel: string | undefined,
): string {
  if (sexLabel === "female") {
    return replaceRoleWord(
      replaceRoleWord(
        replaceRoleWord(
          replaceRoleWord(
            replaceRoleWord(
              replaceRoleWord(
                replaceRoleWord(
                  replaceRoleWord(
                    replaceRoleWord(
                      positionLabel,
                      /\bArchduke\b/u,
                      "Archduchess",
                    ),
                    /\barchduke\b/u,
                    "archduchess",
                  ),
                  /\bDuke\b/u,
                  "Duchess",
                ),
                /\bduke\b/u,
                "duchess",
              ),
              /\bKing\b/u,
              "Queen",
            ),
            /\bking\b/u,
            "queen",
          ),
          /\bMonarch\b/u,
          "Queen",
        ),
        /\bmonarch\b/u,
        "queen",
      ),
      /\bEmperor\b/u,
      "Empress",
    ).replace(/\bemperor\b/u, "empress");
  }

  if (sexLabel === "male") {
    return replaceRoleWord(
      replaceRoleWord(positionLabel, /\bMonarch\b/u, "King"),
      /\bmonarch\b/u,
      "king",
    );
  }

  return positionLabel;
}

export function monarchTakingOfficeTitle(row: {
  itemLabel?: string;
  positionLabel?: string;
  sexLabel?: string;
}): string {
  if (!row.itemLabel) throw new Error("Expected itemLabel");
  if (!row.positionLabel) throw new Error("Expected positionLabel");

  return `${row.itemLabel} becomes ${monarchRoleLabel(row.positionLabel, row.sexLabel)}`;
}
