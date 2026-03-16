import classNames from "classnames";
import Link from "next/link";
import React from "react";
import { FreePlayRootView } from "../lib/free-play-navigation";
import { GameDifficulty } from "../types/game";
import { SelectionRoute } from "../types/routes";
import DifficultySelector from "./difficulty-selector";
import SelectorOptionGrid, { SelectorOption } from "./selector-option-grid";
import * as buttonStyles from "../styles/button.css";
import * as styles from "../styles/free-play-selector.css";

interface Props {
  allHref: string;
  allSelectionRoute: SelectionRoute;
  animateBodyHeight?: boolean;
  availableDifficulties?: GameDifficulty[];
  breadcrumbs?: React.ReactNode;
  constrained?: boolean;
  difficulty?: GameDifficulty;
  embedded?: boolean;
  featuredItems?: SelectorOption[];
  insideCard?: boolean;
  introRoute?: SelectionRoute | null;
  items: SelectorOption[];
  onStartIntro?: () => void;
  onSelectPlayRoute: (route: SelectionRoute, targetPath: string) => void;
  onSelectRootView?: (view: FreePlayRootView) => void;
  rootView?: FreePlayRootView;
  showAllButton?: boolean;
  selectorKey?: string;
  setDifficulty?: (difficulty: GameDifficulty) => void;
}

function AllCategoryLink(props: {
  href: string;
  onSelectPlayRoute: (route: SelectionRoute, targetPath: string) => void;
  selectionRoute: SelectionRoute;
}) {
  const { href, onSelectPlayRoute, selectionRoute } = props;

  return (
    <Link
      className={classNames(buttonStyles.button, buttonStyles.fullWidth)}
      href={href}
      onClick={(event) => {
        event.preventDefault();
        onSelectPlayRoute(selectionRoute, href);
      }}
      prefetch
    >
      All
    </Link>
  );
}

function SelectorIntro(props: {
  availableDifficulties?: GameDifficulty[];
  difficulty?: GameDifficulty;
  onStartIntro?: () => void;
  setDifficulty?: (difficulty: GameDifficulty) => void;
}) {
  const { availableDifficulties, difficulty, onStartIntro, setDifficulty } =
    props;

  return (
    <div className={styles.introControls}>
      {difficulty && setDifficulty ? (
        <div className={styles.introControl}>
          <DifficultySelector
            availableDifficulties={availableDifficulties}
            difficulty={difficulty}
            setDifficulty={setDifficulty}
          />
        </div>
      ) : null}
      <div className={styles.introControl}>
        <button
          className={classNames(buttonStyles.button, buttonStyles.fullWidth)}
          onClick={onStartIntro}
          type="button"
        >
          Start
        </button>
      </div>
    </div>
  );
}

function SelectorList(props: {
  allHref: string;
  allSelectionRoute: SelectionRoute;
  featuredItems?: SelectorOption[];
  items: SelectorOption[];
  onSelectPlayRoute: (route: SelectionRoute, targetPath: string) => void;
  onSelectRootView?: (view: FreePlayRootView) => void;
  rootView?: FreePlayRootView;
  showAllButton?: boolean;
}) {
  const {
    allHref,
    allSelectionRoute,
    featuredItems = [],
    items,
    onSelectPlayRoute,
    onSelectRootView,
    rootView = "browse",
    showAllButton = true,
  } = props;
  const hasFeaturedItems = featuredItems.length > 0;
  const resolvedRootView = hasFeaturedItems ? rootView : "browse";
  const showLandingActions = hasFeaturedItems && resolvedRootView === "landing";
  const showFeaturedView = hasFeaturedItems && resolvedRootView === "featured";
  const showBrowseView = !hasFeaturedItems || resolvedRootView === "browse";

  return (
    <div className={styles.transitionSection}>
      {showLandingActions ? (
        <div className={styles.rootSelectorNav}>
          <AllCategoryLink
            href={allHref}
            onSelectPlayRoute={onSelectPlayRoute}
            selectionRoute={allSelectionRoute}
          />
          <button
            className={classNames(
              buttonStyles.button,
              buttonStyles.fullWidth,
              buttonStyles.minimal,
            )}
            onClick={() => onSelectRootView?.("featured")}
            type="button"
          >
            Featured
          </button>
          <button
            className={classNames(
              buttonStyles.button,
              buttonStyles.fullWidth,
              buttonStyles.minimal,
            )}
            onClick={() => onSelectRootView?.("browse")}
            type="button"
          >
            Browse
          </button>
        </div>
      ) : null}
      {showFeaturedView ? (
        <div className={styles.selectorSection}>
          <div className={styles.selectorBody}>
            <SelectorOptionGrid
              items={featuredItems}
              onSelectPlayRoute={onSelectPlayRoute}
            />
          </div>
        </div>
      ) : null}
      {showBrowseView ? (
        <div className={styles.selectorSection}>
          {showAllButton ? (
            <div className={styles.actions}>
              <AllCategoryLink
                href={allHref}
                onSelectPlayRoute={onSelectPlayRoute}
                selectionRoute={allSelectionRoute}
              />
            </div>
          ) : null}
          <div className={styles.selectorBody}>
            <SelectorOptionGrid
              items={items}
              onSelectPlayRoute={onSelectPlayRoute}
            />
          </div>
        </div>
      ) : null}
    </div>
  );
}

export default function FreePlaySelectorScreen(props: Props) {
  const {
    allHref,
    allSelectionRoute,
    availableDifficulties,
    breadcrumbs = null,
    difficulty,
    embedded = false,
    featuredItems = [],
    insideCard = false,
    introRoute = null,
    items,
    onStartIntro,
    onSelectPlayRoute,
    onSelectRootView,
    rootView,
    showAllButton,
    setDifficulty,
  } = props;
  const showIntro = !!introRoute;

  React.useEffect(() => {
    if (
      !showIntro ||
      !difficulty ||
      !setDifficulty ||
      !availableDifficulties ||
      availableDifficulties.length === 0 ||
      availableDifficulties.includes(difficulty)
    ) {
      return;
    }

    setDifficulty(availableDifficulties[0]);
  }, [availableDifficulties, difficulty, setDifficulty, showIntro]);

  const panelContent = (
    <>
      {breadcrumbs ? (
        <div className={styles.optionLabel}>{breadcrumbs}</div>
      ) : null}
      {showIntro ? (
        <SelectorIntro
          availableDifficulties={availableDifficulties}
          difficulty={difficulty}
          onStartIntro={onStartIntro}
          setDifficulty={setDifficulty}
        />
      ) : (
        <SelectorList
          allHref={allHref}
          allSelectionRoute={allSelectionRoute}
          featuredItems={featuredItems}
          items={items}
          onSelectPlayRoute={onSelectPlayRoute}
          onSelectRootView={onSelectRootView}
          rootView={rootView}
          showAllButton={showAllButton}
        />
      )}
    </>
  );

  if (insideCard) {
    return <div className={styles.insideCardPanel}>{panelContent}</div>;
  }

  return (
    <div
      className={classNames(styles.content, {
        [styles.embeddedContent]: embedded,
      })}
    >
      <div className={styles.stage}>{panelContent}</div>
    </div>
  );
}
