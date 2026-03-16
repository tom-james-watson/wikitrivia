import { AnimatePresence, motion } from "motion/react";
import { GetStaticPaths, GetStaticProps } from "next";
import { useRouter } from "next/router";
import React from "react";
import AppHead from "../../components/app-head";
import { useDecks } from "../../components/deck-provider";
import FreePlayBreadcrumbs from "../../components/free-play-breadcrumbs";
import FreePlaySelectorScreen from "../../components/free-play-selector-screen";
import GameRouteScreen from "../../components/game-route-screen";
import SiteHeader from "../../components/site-header";
import {
  getAllSelectionRoute,
  getCategoryDefinitions,
  getAllPlayRoutePaths,
  getDeckPath,
  getGroupAllSelectionRouteForNode,
  getFreePlayGroupDefinition,
  getGroupAllSelectionRoute,
  getLeafSelectionRoute,
  getLeafSelectionRouteForNode,
  getSelectionRoutePath,
  getSelectionRouteShareLabel,
  getSelectorBreadcrumbsForNode,
} from "../../lib/categories";
import {
  getSupportedDifficultiesForDeckId,
  hasVisibleGroupChildren,
  isSelectionRouteVisible,
} from "../../lib/free-play-difficulty-rules";
import { FEATURED_FREE_PLAY_DECKS } from "../../lib/free-play-navigation";
import { useFreePlayDifficulty } from "../../lib/use-free-play-difficulty";
import { FreePlayGroupDefinition, SelectionRoute } from "../../types/routes";
import * as layoutStyles from "../../styles/game-route-screen.css";

interface RootSelectorProps {
  kind: "root-selector";
}

interface GroupSelectorProps {
  group: FreePlayGroupDefinition;
  kind: "group-selector";
}

interface GameProps {
  kind: "game";
  selectionRoute: SelectionRoute;
}

type Props = RootSelectorProps | GroupSelectorProps | GameProps;
const FLOW_TRANSITION = {
  duration: 0.18,
  ease: [0.2, 0, 0, 1] as const,
};

export default function FreePlayPage(props: Props) {
  const router = useRouter();
  const { difficulty, setDifficulty } = useFreePlayDifficulty();
  const { deckNodes } = useDecks();
  const [hasStartedPendingRoute, setHasStartedPendingRoute] =
    React.useState(false);
  const [pendingSelectionRoute, setPendingSelectionRoute] =
    React.useState<SelectionRoute | null>(null);
  const previousAsPathRef = React.useRef(router.asPath);
  const selectorStateKey =
    props.kind === "group-selector" ? props.group.nodeId : props.kind;
  const selectorPath =
    props.kind === "group-selector"
      ? getDeckPath(props.group.nodeId)
      : props.kind === "root-selector"
        ? "/play"
        : null;

  React.useEffect(() => {
    setHasStartedPendingRoute(false);
    setPendingSelectionRoute(null);
  }, [selectorStateKey]);

  React.useEffect(() => {
    const previousAsPath = previousAsPathRef.current;

    if (
      !pendingSelectionRoute ||
      !selectorPath ||
      router.asPath !== selectorPath ||
      previousAsPath === selectorPath
    ) {
      previousAsPathRef.current = router.asPath;
      return;
    }

    setHasStartedPendingRoute(false);
    setPendingSelectionRoute(null);
    previousAsPathRef.current = router.asPath;
  }, [pendingSelectionRoute, router.asPath, selectorPath]);

  const group = props.kind === "group-selector" ? props.group : null;
  const allSelectionRoute = group
    ? getGroupAllSelectionRouteForNode(group.nodeId)
    : getAllSelectionRoute();
  const activeSelectionRoute =
    pendingSelectionRoute ??
    (props.kind === "game" ? props.selectionRoute : null);
  const pageTitle = activeSelectionRoute
    ? `${getSelectionRouteShareLabel(activeSelectionRoute)} | Wikitrivia`
    : group
      ? `${group.title} | Wikitrivia`
      : "Free Play | Wikitrivia";
  const items = React.useMemo(() => {
    const visibleCategories = getCategoryDefinitions().filter((category) => {
      if (!deckNodes) {
        return true;
      }

      return hasVisibleGroupChildren(deckNodes, category);
    });
    const parentItems = group ? group.children : visibleCategories;

    return parentItems.flatMap((item) => {
      if (item.kind === "group") {
        if (deckNodes && !hasVisibleGroupChildren(deckNodes, item)) {
          return [];
        }

        return {
          href: getDeckPath(item.nodeId),
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
        href: getSelectionRoutePath(route),
        kind: "play" as const,
        key: item.slug,
        selectionRoute: route,
        text: item.title,
      };
    });
  }, [deckNodes, group]);
  const selectorIntroRoute =
    activeSelectionRoute ??
    (group && items.length === 0 ? allSelectionRoute : null);
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

  const startPendingRoute = React.useCallback(() => {
    setHasStartedPendingRoute(true);
  }, []);

  const returnToSelectionScreen = React.useCallback(() => {
    setHasStartedPendingRoute(false);
  }, []);

  return (
    <>
      <AppHead title={pageTitle} />
      <div className={layoutStyles.page}>
        <SiteHeader />
        <div className={layoutStyles.boardFrame}>
          <AnimatePresence initial={false} mode="wait">
            {hasStartedPendingRoute && activeSelectionRoute ? (
              <motion.div
                key={`game-${getSelectionRoutePath(activeSelectionRoute)}`}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                initial={{ opacity: 0, y: 6 }}
                style={{
                  display: "flex",
                  width: "100%",
                  height: "100%",
                  minHeight: 0,
                }}
                transition={FLOW_TRANSITION}
              >
                <GameRouteScreen
                  hideHeader
                  mode="free-play"
                  onResetGame={returnToSelectionScreen}
                  selectionRoute={activeSelectionRoute}
                  skipRouteIntro
                />
              </motion.div>
            ) : (
              <motion.div
                key="selector"
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                initial={{ opacity: 0, y: 6 }}
                style={{
                  display: "flex",
                  width: "100%",
                  height: "100%",
                  minHeight: 0,
                }}
                transition={FLOW_TRANSITION}
              >
                <FreePlaySelectorScreen
                  allHref={
                    group && allSelectionRoute
                      ? getSelectionRoutePath(allSelectionRoute)
                      : "/play/all"
                  }
                  allSelectionRoute={allSelectionRoute!}
                  availableDifficulties={introAvailableDifficulties}
                  breadcrumbs={
                    selectorIntroRoute ? (
                      <FreePlayBreadcrumbs
                        selectionRoute={selectorIntroRoute}
                      />
                    ) : (
                      <FreePlayBreadcrumbs
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
                  }
                  difficulty={difficulty}
                  embedded
                  introRoute={selectorIntroRoute}
                  items={items}
                  onStartIntro={startPendingRoute}
                  onSelectPlayRoute={openSelectionRoute}
                  setDifficulty={setDifficulty}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </>
  );
}

export const getStaticPaths: GetStaticPaths = async () => {
  return {
    fallback: false,
    paths: getAllPlayRoutePaths().map((slug) => ({
      params: {
        slug,
      },
    })),
  };
};

export const getStaticProps: GetStaticProps<Props> = async (context) => {
  const slugParam = context.params?.slug;

  if (
    slugParam === undefined ||
    (Array.isArray(slugParam) && slugParam.length === 0)
  ) {
    return {
      props: {
        kind: "root-selector",
      },
    };
  }

  if (!Array.isArray(slugParam)) {
    return { notFound: true };
  }

  if (slugParam[0] === "featured") {
    if (slugParam.length === 1) {
      return {
        props: {
          kind: "root-selector",
        },
      };
    }

    if (slugParam.length === 2) {
      const featuredDeck = FEATURED_FREE_PLAY_DECKS.find(
        (deck) => deck.routeSlug === slugParam[1],
      );

      if (!featuredDeck) {
        return { notFound: true };
      }

      const selectionRoute = getLeafSelectionRoute(featuredDeck.slugPath);
      return selectionRoute
        ? {
            props: {
              kind: "game",
              selectionRoute,
            },
          }
        : { notFound: true };
    }

    return { notFound: true };
  }

  const slug = slugParam[0] === "browse" ? slugParam.slice(1) : slugParam;

  if (slug.length === 0) {
    return {
      props: {
        kind: "root-selector",
      },
    };
  }

  if (slug.length === 1 && slug[0] === "all") {
    return {
      props: {
        kind: "game",
        selectionRoute: getAllSelectionRoute(),
      },
    };
  }

  const selectionRoute =
    slug[slug.length - 1] === "all"
      ? getGroupAllSelectionRoute(slug.slice(0, -1))
      : getLeafSelectionRoute(slug);
  if (selectionRoute) {
    return {
      props: {
        kind: "game",
        selectionRoute,
      },
    };
  }

  const group = getFreePlayGroupDefinition(slug);
  if (!group) {
    return { notFound: true };
  }

  return {
    props: {
      group,
      kind: "group-selector",
    },
  };
};
