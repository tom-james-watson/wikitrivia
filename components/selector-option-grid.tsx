import { SelectionRoute } from "../types/routes";
import ButtonLink from "./button-link";
import * as styles from "../styles/free-play-selector.css";

export interface SelectorOption {
  href: string;
  kind: "drilldown" | "play";
  key: string;
  onClick?: () => void;
  selectionRoute?: SelectionRoute;
  text: string;
}

interface Props {
  items: SelectorOption[];
  onSelectPlayRoute?: (route: SelectionRoute, targetPath: string) => void;
}

export default function SelectorOptionGrid(props: Props) {
  const { items, onSelectPlayRoute } = props;
  const validItems = items.filter(
    (item): item is SelectorOption => typeof item.href === "string",
  );
  const hasOddItemCount = validItems.length % 2 === 1;

  return (
    <div className={styles.grid}>
      {validItems.map((item) => (
        <ButtonLink
          key={item.key}
          href={item.href}
          minimal
          onClick={
            item.kind === "play" && item.selectionRoute && onSelectPlayRoute
              ? (event) => {
                  event.preventDefault();
                  onSelectPlayRoute(item.selectionRoute!, item.href);
                }
              : item.kind === "drilldown" && item.onClick
                ? (event) => {
                    event.preventDefault();
                    item.onClick?.();
                  }
                : undefined
          }
          text={item.text}
          trailingIcon={item.kind === "drilldown" ? "chevron" : undefined}
        />
      ))}
      {hasOddItemCount ? (
        <div aria-hidden className={styles.gridFiller} />
      ) : null}
    </div>
  );
}
