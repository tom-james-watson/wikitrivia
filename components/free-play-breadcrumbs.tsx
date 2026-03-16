import Link from "next/link";
import React from "react";
import {
  getSelectionRouteBreadcrumbs,
  getSelectionRouteTitle,
} from "../lib/categories";
import { breakpointScale } from "../styles/foundation";
import { FreePlayBreadcrumb, SelectionRoute } from "../types/routes";
import * as styles from "../styles/free-play-breadcrumbs.css";

interface BreadcrumbItem {
  href?: string;
  key: string;
  label: string;
}

interface Props {
  leadingBreadcrumbs?: FreePlayBreadcrumb[];
  selectorBreadcrumbs?: FreePlayBreadcrumb[];
  selectionRoute?: SelectionRoute;
}

function formatBreadcrumbLabel(label: string): string {
  return label.toUpperCase();
}

function getBreadcrumbKey(label: string, index: number): string {
  return `breadcrumb-${index}-${label}`;
}

function getBreadcrumbItems(props: Props): BreadcrumbItem[] {
  const {
    leadingBreadcrumbs = [],
    selectorBreadcrumbs = [],
    selectionRoute,
  } = props;
  const rootItems: BreadcrumbItem[] = [
    { href: "/play", key: "free-play", label: "Free Play" },
    ...leadingBreadcrumbs.map((breadcrumb, index) => ({
      href: breadcrumb.href,
      key: getBreadcrumbKey(breadcrumb.label, index + 1),
      label: breadcrumb.label,
    })),
  ];

  if (selectionRoute) {
    const baseItems: BreadcrumbItem[] = [
      ...rootItems,
      ...getSelectionRouteBreadcrumbs(selectionRoute).map(
        (breadcrumb, index) => ({
          href: breadcrumb.href,
          key: getBreadcrumbKey(breadcrumb.label, rootItems.length + index),
          label: breadcrumb.label,
        }),
      ),
    ];

    if (selectionRoute.kind === "all") {
      return [
        ...baseItems,
        { key: getBreadcrumbKey("All", baseItems.length), label: "All" },
      ];
    }

    if (selectionRoute.kind === "group-all") {
      return [
        ...baseItems,
        { key: getBreadcrumbKey("All", baseItems.length), label: "All" },
      ];
    }

    return [
      ...baseItems,
      {
        key: getBreadcrumbKey(
          getSelectionRouteTitle(selectionRoute),
          baseItems.length,
        ),
        label: getSelectionRouteTitle(selectionRoute),
      },
    ];
  }

  return [
    ...rootItems,
    ...selectorBreadcrumbs.map((breadcrumb, index) => ({
      href: breadcrumb.href,
      key: getBreadcrumbKey(breadcrumb.label, rootItems.length + index),
      label: breadcrumb.label,
    })),
  ];
}

function useIsCompactLayout(): boolean {
  const [isCompactLayout, setIsCompactLayout] = React.useState(false);

  React.useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const mediaQuery = window.matchMedia(
      `(max-width: ${breakpointScale.compact})`,
    );
    const updateLayout = () => {
      setIsCompactLayout(mediaQuery.matches);
    };

    updateLayout();
    mediaQuery.addEventListener("change", updateLayout);

    return () => {
      mediaQuery.removeEventListener("change", updateLayout);
    };
  }, []);

  return isCompactLayout;
}

export default function FreePlayBreadcrumbs(props: Props) {
  const items = React.useMemo(() => getBreadcrumbItems(props), [props]);
  const isCompactLayout = useIsCompactLayout();

  return (
    <nav aria-label="Free play navigation" className={styles.breadcrumbs}>
      {items.map((item, index) => {
        const isCurrent = index === items.length - 1 || !item.href;
        const isFirst = index === 0;
        const isLast = index === items.length - 1;
        const isPenultimate = index === items.length - 2;
        const shouldShowFullLabel = isCompactLayout
          ? isFirst || isPenultimate || isLast
          : isFirst || isPenultimate || isLast;
        const label = shouldShowFullLabel
          ? formatBreadcrumbLabel(item.label)
          : "...";

        return (
          <div className={styles.breadcrumbItem} key={item.key}>
            {index > 0 ? (
              <span aria-hidden="true" className={styles.breadcrumbSeparator}>
                /
              </span>
            ) : null}
            {isCurrent || !item.href ? (
              <span aria-current="page" className={styles.breadcrumbCurrent}>
                {label}
              </span>
            ) : (
              <Link className={styles.breadcrumbLink} href={item.href}>
                {label}
              </Link>
            )}
          </div>
        );
      })}
    </nav>
  );
}
