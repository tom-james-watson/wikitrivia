import classNames from "classnames";
import { useRouter } from "next/router";
import React from "react";
import {
  getAllSelectionRoute,
  getCategoryDefinitions,
  getDeckPath,
  getFreePlayGroupDefinition,
  getGroupAllSelectionRouteForNode,
  getGroupAllSelectionRoute,
  getLeafSelectionRoute,
  getLeafSelectionRouteForNode,
  getSelectionRoutePath,
  getSelectionRouteShareLabel,
  getSelectionRouteTitle,
  getSelectorBreadcrumbsForNode,
} from "../lib/categories";
import { getCurrentUtcDateKey } from "../lib/daily";
import { loadDailyGameSnapshot } from "../lib/daily-storage";
import {
  getSupportedDifficultiesForDeckId,
  hasVisibleGroupChildren,
  isSelectionRouteVisible,
} from "../lib/free-play-difficulty-rules";
import {
  FEATURED_FREE_PLAY_DECKS,
  FreePlayRootView,
  getRootFreePlayPath,
  prefixPlayPath,
} from "../lib/free-play-navigation";
import { getShareResults } from "../lib/share";
import { useFreePlayDifficulty } from "../lib/use-free-play-difficulty";
import { FreePlayGroupDefinition, SelectionRoute } from "../types/routes";
import AppHead from "./app-head";
import DailyEntryScreen from "./daily-entry-screen";
import { useDecks } from "./deck-provider";
import FreePlayBreadcrumbs from "./free-play-breadcrumbs";
import FreePlaySelectorScreen from "./free-play-selector-screen";
import GameRouteScreen from "./game-route-screen";
import HomeScreen from "./home-screen";
import PageShell from "./page-shell";
import SiteHeader from "./site-header";
import * as dailyStyles from "../styles/daily-entry-screen.css";
import * as styles from "../styles/menu-flow-shell.css";

type PlayRouteState =
  | {
      group: FreePlayGroupDefinition;
      kind: "group-selector";
      view: FreePlayRootView;
    }
  | {
      kind: "game";
      selectionRoute: SelectionRoute;
      view: FreePlayRootView;
    }
  | {
      kind: "root-selector";
      view: FreePlayRootView;
    };

function getPath(asPath: string): string {
  return asPath.split("?")[0].split("#")[0] || "/";
}

export function shouldUseMenuFlowShell(asPath: string): boolean {
  return /^\/(?:$|daily$|play(?:\/.*)?$)/.test(getPath(asPath));
}

function parseStandardPlayRoute(
  segments: string[],
  view: FreePlayRootView,
): PlayRouteState | null {
  if (segments.length === 0) {
    return { kind: "root-selector", view };
  }

  if (segments.length === 1 && segments[0] === "all") {
    return {
      kind: "game",
      selectionRoute: getAllSelectionRoute(),
      view,
    };
  }

  if (segments[segments.length - 1] === "all") {
    const selectionRoute = getGroupAllSelectionRoute(segments.slice(0, -1));

    return selectionRoute
      ? {
          kind: "game",
          selectionRoute,
          view,
        }
      : null;
  }

  const selectionRoute = getLeafSelectionRoute(segments);
  if (selectionRoute) {
    return {
      kind: "game",
      selectionRoute,
      view,
    };
  }

  const group = getFreePlayGroupDefinition(segments);
  return group
    ? {
        group,
        kind: "group-selector",
        view,
      }
    : null;
}

function parsePlayRoute(path: string): PlayRouteState | null {
  if (!path.startsWith("/play")) {
    return null;
  }

  const segments = path.split("/").filter(Boolean).slice(1);

  if (segments[0] === "browse") {
    return parseStandardPlayRoute(segments.slice(1), "browse");
  }

  if (segments[0] === "featured") {
    if (segments.length === 1) {
      return { kind: "root-selector", view: "featured" };
    }

    if (segments.length === 2) {
      const featuredDeck = FEATURED_FREE_PLAY_DECKS.find(
        (deck) => deck.routeSlug === segments[1],
      );
      if (!featuredDeck) {
        return null;
      }

      const selectionRoute = getLeafSelectionRoute(featuredDeck.slugPath);
      return selectionRoute
        ? {
            kind: "game",
            selectionRoute,
            view: "featured",
          }
        : null;
    }

    return null;
  }

  return parseStandardPlayRoute(segments, "landing");
}

function readDailyCompletionState(dailyDateKey: string): {
  completedResults: boolean[] | null;
  completedScore: number | null;
} {
  if (typeof window === "undefined") {
    return {
      completedResults: null,
      completedScore: null,
    };
  }

  const snapshot = loadDailyGameSnapshot();

  if (!snapshot || snapshot.dateKey !== dailyDateKey || snapshot.lives > 0) {
    return {
      completedResults: null,
      completedScore: null,
    };
  }

  return {
    completedResults: getShareResults(snapshot.played),
    completedScore:
      snapshot.played.filter((item) => item.played.correct).length - 1,
  };
}

function DailyCardPlaceholder() {
  return (
    <div aria-hidden="true" className={styles.dailyCardPlaceholder}>
      <div className={styles.dailyPlaceholderMeta} />
      <div className={dailyStyles.score}>
        <div className={styles.dailyPlaceholderScore} />
      </div>
      <div className={styles.dailyPlaceholderButton} />
      <div className={styles.dailyPlaceholderMeta} />
    </div>
  );
}

export default function MenuFlowShell() {
  const router = useRouter();
  const path = getPath(router.asPath);
  const freePlayDifficulty = useFreePlayDifficulty();
  const { deckNodes } = useDecks();
  const [hasStartedPendingRoute, setHasStartedPendingRoute] =
    React.useState(false);
  const [pendingSelectionRoute, setPendingSelectionRoute] =
    React.useState<SelectionRoute | null>(null);
  const [dailyStarted, setDailyStarted] = React.useState(false);
  const previousPathRef = React.useRef("");
  const playRoute = React.useMemo(() => parsePlayRoute(path), [path]);
  const rootFreePlayView =
    playRoute?.kind === "root-selector" ? playRoute.view : "landing";
  const dailyDateKey = React.useMemo(() => getCurrentUtcDateKey(), []);
  const [dailyCompletionReady, setDailyCompletionReady] = React.useState(
    path !== "/daily",
  );
  const [completedState, setCompletedState] = React.useState({
    completedResults: null as boolean[] | null,
    completedScore: null as number | null,
  });
  const { completedResults, completedScore } = completedState;

  const syncDailyCompletionState = React.useCallback(() => {
    setCompletedState(readDailyCompletionState(dailyDateKey));
    setDailyCompletionReady(true);
  }, [dailyDateKey]);

  React.useEffect(() => {
    if (path !== "/daily") {
      setDailyCompletionReady(true);
      setCompletedState({
        completedResults: null,
        completedScore: null,
      });
      return;
    }

    syncDailyCompletionState();
  }, [path, syncDailyCompletionState]);

  React.useEffect(() => {
    if (path !== "/daily") {
      setDailyStarted(false);
    }
  }, [path]);

  React.useEffect(() => {
    if (!path.startsWith("/play")) {
      setHasStartedPendingRoute(false);
      setPendingSelectionRoute(null);
    }
  }, [path]);

  const currentPlayView = playRoute?.view ?? "landing";

  const selectorStateKey =
    playRoute?.kind === "group-selector"
      ? `${playRoute.view}:${playRoute.group.nodeId}`
      : playRoute?.kind === "root-selector"
        ? `${playRoute.kind}:${playRoute.view}`
        : null;
  const selectorPath =
    playRoute?.kind === "group-selector"
      ? prefixPlayPath(getDeckPath(playRoute.group.nodeId), playRoute.view)
      : playRoute?.kind === "root-selector"
        ? getRootFreePlayPath(playRoute.view)
        : null;

  React.useEffect(() => {
    if (!selectorStateKey) {
      return;
    }

    setHasStartedPendingRoute(false);
    setPendingSelectionRoute(null);
  }, [selectorStateKey]);

  React.useEffect(() => {
    const previousPath = previousPathRef.current;

    if (
      !pendingSelectionRoute ||
      !selectorPath ||
      path !== selectorPath ||
      previousPath === selectorPath
    ) {
      previousPathRef.current = path;
      return;
    }

    setHasStartedPendingRoute(false);
    setPendingSelectionRoute(null);
    previousPathRef.current = path;
  }, [path, pendingSelectionRoute, selectorPath]);

  const group = playRoute?.kind === "group-selector" ? playRoute.group : null;
  const allSelectionRoute = group
    ? getGroupAllSelectionRouteForNode(group.nodeId)
    : getAllSelectionRoute();
  const activeSelectionRoute =
    pendingSelectionRoute ??
    (playRoute?.kind === "game" ? playRoute.selectionRoute : null);
  const pageTitle =
    path === "/"
      ? undefined
      : path === "/daily"
        ? "Daily | Wikitrivia"
        : activeSelectionRoute
          ? `${getSelectionRouteShareLabel(activeSelectionRoute)} | Wikitrivia`
          : group
            ? `${group.title} | Wikitrivia`
            : currentPlayView === "featured"
              ? "Featured | Wikitrivia"
              : currentPlayView === "browse"
                ? "Browse | Wikitrivia"
                : "Free Play | Wikitrivia";
  const freePlayItems = React.useMemo(() => {
    const visibleCategories = getCategoryDefinitions().filter((category) => {
      if (!deckNodes) {
        return true;
      }

      return hasVisibleGroupChildren(deckNodes, category);
    });
    const parentItems = group ? group.children : visibleCategories;

    return parentItems
      .flatMap((item) => {
        if (item.kind === "group") {
          if (deckNodes && !hasVisibleGroupChildren(deckNodes, item)) {
            return [];
          }

          return {
            href: prefixPlayPath(getDeckPath(item.nodeId), currentPlayView),
            key: item.slug,
            kind: "drilldown" as const,
            text: item.title,
          };
        }

        const route = getLeafSelectionRouteForNode(item.nodeId);
        if (!route) {
          return [];
        }

        if (deckNodes && !isSelectionRouteVisible(deckNodes, route)) {
          return [];
        }

        return {
          href: prefixPlayPath(getSelectionRoutePath(route), currentPlayView),
          key: item.slug,
          kind: "play" as const,
          selectionRoute: route,
          text: item.title,
        };
      })
      .filter(Boolean);
  }, [currentPlayView, deckNodes, group]);
  const featuredFreePlayItems = React.useMemo(() => {
    if (group) {
      return [];
    }

    return FEATURED_FREE_PLAY_DECKS.flatMap((deck) => {
      const route = getLeafSelectionRoute(deck.slugPath);
      if (!route) {
        return [];
      }

      if (deckNodes && !isSelectionRouteVisible(deckNodes, route)) {
        return [];
      }

      return {
        href: `${getRootFreePlayPath("featured")}/${deck.routeSlug}`,
        key: deck.key,
        kind: "play" as const,
        selectionRoute: route,
        text: deck.text,
      };
    });
  }, [deckNodes, group]);
  const featuredBreadcrumbLabel = React.useMemo(() => {
    if (currentPlayView !== "featured" || !activeSelectionRoute) {
      return null;
    }

    const featuredDeck = FEATURED_FREE_PLAY_DECKS.find((deck) => {
      const route = getLeafSelectionRoute(deck.slugPath);
      return route?.nodeId === activeSelectionRoute.nodeId;
    });

    return featuredDeck?.text ?? getSelectionRouteTitle(activeSelectionRoute);
  }, [activeSelectionRoute, currentPlayView]);
  const selectorIntroRoute =
    activeSelectionRoute ??
    (group && freePlayItems.length === 0 ? allSelectionRoute : null);
  const introAvailableDifficulties = React.useMemo(() => {
    if (!deckNodes || !selectorIntroRoute) {
      return undefined;
    }

    return getSupportedDifficultiesForDeckId(
      deckNodes,
      selectorIntroRoute.nodeId,
    );
  }, [deckNodes, selectorIntroRoute]);

  const openSelectionRoute = React.useCallback(
    (selectionRoute: SelectionRoute, targetPath: string) => {
      setHasStartedPendingRoute(false);
      setPendingSelectionRoute(selectionRoute);
      void router.push(targetPath, undefined, {
        scroll: false,
        shallow: true,
      });
    },
    [router],
  );

  const openRootFreePlayView = React.useCallback(
    (view: FreePlayRootView) => {
      void router.push(getRootFreePlayPath(view), undefined, {
        scroll: false,
        shallow: true,
      });
    },
    [router],
  );

  const startPendingRoute = React.useCallback(() => {
    setHasStartedPendingRoute(true);
  }, []);

  const returnToSelectionScreen = React.useCallback(() => {
    setHasStartedPendingRoute(false);
  }, []);

  const returnToDailyEntry = React.useCallback(() => {
    setDailyStarted(false);
    syncDailyCompletionState();
  }, [syncDailyCompletionState]);

  const showDailyGame =
    path === "/daily" && dailyStarted && completedScore === null;
  const showFreePlayGame = hasStartedPendingRoute && !!activeSelectionRoute;
  const showGameScreen = showDailyGame || showFreePlayGame;
  const contextualAllHref = React.useMemo(() => {
    if (!allSelectionRoute) {
      return "/play/all";
    }

    return prefixPlayPath(
      getSelectionRoutePath(allSelectionRoute),
      currentPlayView,
    );
  }, [allSelectionRoute, currentPlayView]);
  const leadingBreadcrumbs =
    currentPlayView === "browse"
      ? [{ href: getRootFreePlayPath("browse"), label: "Browse" }]
      : [];
  const freePlayBreadcrumbs = path.startsWith("/play") ? (
    currentPlayView === "featured" ? (
      activeSelectionRoute ? (
        <FreePlayBreadcrumbs
          selectorBreadcrumbs={[
            { href: getRootFreePlayPath("featured"), label: "Featured" },
            { label: featuredBreadcrumbLabel ?? "Featured" },
          ]}
        />
      ) : (
        <FreePlayBreadcrumbs selectorBreadcrumbs={[{ label: "Featured" }]} />
      )
    ) : selectorIntroRoute ? (
      <FreePlayBreadcrumbs
        leadingBreadcrumbs={leadingBreadcrumbs}
        selectionRoute={selectorIntroRoute}
      />
    ) : (
      <FreePlayBreadcrumbs
        leadingBreadcrumbs={leadingBreadcrumbs}
        selectorBreadcrumbs={
          group
            ? [
                ...getSelectorBreadcrumbsForNode(group.nodeId),
                { label: group.title },
              ]
            : []
        }
      />
    )
  ) : null;

  return (
    <>
      <AppHead title={pageTitle} />
      {path === "/" ? (
        <HomeScreen />
      ) : showGameScreen ? (
        <PageShell>
          {showDailyGame ? (
            <GameRouteScreen
              hideHeader
              mode="daily"
              onResetGame={returnToDailyEntry}
              skipRouteIntro
            />
          ) : showFreePlayGame && activeSelectionRoute ? (
            <GameRouteScreen
              hideHeader
              mode="free-play"
              onResetGame={returnToSelectionScreen}
              selectionRoute={activeSelectionRoute}
              skipRouteIntro
            />
          ) : null}
        </PageShell>
      ) : (
        <div
          className={classNames(styles.page, {
            [styles.pageHome]: path === "/",
          })}
        >
          {path !== "/" ? <SiteHeader /> : null}
          <main className={styles.screen}>
            <div
              className={classNames(styles.wrapper, {
                [styles.wrapperMenu]: !!playRoute,
              })}
            >
              {path === "/daily" ? (
                <div className={classNames(styles.stage, styles.stageMenu)}>
                  {dailyCompletionReady ? (
                    <DailyEntryScreen
                      embedded
                      completedResults={completedResults}
                      completedScore={completedScore}
                      dailyDateKey={dailyDateKey}
                      onStart={() => setDailyStarted(true)}
                    />
                  ) : (
                    <DailyCardPlaceholder />
                  )}
                </div>
              ) : playRoute ? (
                <FreePlaySelectorScreen
                  allHref={contextualAllHref}
                  allSelectionRoute={allSelectionRoute!}
                  breadcrumbs={freePlayBreadcrumbs}
                  difficulty={freePlayDifficulty.difficulty}
                  featuredItems={featuredFreePlayItems}
                  introRoute={selectorIntroRoute}
                  items={freePlayItems}
                  onSelectPlayRoute={openSelectionRoute}
                  onSelectRootView={openRootFreePlayView}
                  onStartIntro={startPendingRoute}
                  availableDifficulties={introAvailableDifficulties}
                  rootView={rootFreePlayView}
                  showAllButton={
                    !(
                      playRoute?.kind === "root-selector" &&
                      currentPlayView === "browse"
                    )
                  }
                  setDifficulty={freePlayDifficulty.setDifficulty}
                />
              ) : null}
            </div>
          </main>
        </div>
      )}
    </>
  );
}
