import { getSelectionRouteShareLabel } from "../lib/categories";
import { SelectionRoute } from "../types/routes";
import * as styles from "../styles/free-play-selector.css";

interface Props {
  breadcrumbs?: string[];
  selectionRoute?: SelectionRoute;
}

function getLabel(props: Props): string {
  const { breadcrumbs = [], selectionRoute } = props;

  if (selectionRoute) {
    if (selectionRoute.kind === "all") {
      return "Free Play / All";
    }

    return ["Free Play", getSelectionRouteShareLabel(selectionRoute)].join(
      " / ",
    );
  }

  if (breadcrumbs.length > 0) {
    return ["Free Play", ...breadcrumbs].join(" / ");
  }

  return "Free Play";
}

export default function FreePlayRouteTitle(props: Props) {
  return <div className={styles.sectionTitle}>{getLabel(props)}</div>;
}
