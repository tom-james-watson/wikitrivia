import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { AppProps } from "next/app";
import { useRouter } from "next/router";
import React from "react";
import { DeckProvider } from "../components/deck-provider";
import MenuFlowShell, {
  shouldUseMenuFlowShell,
} from "../components/menu-flow-shell";
import { NavigationSourceProvider } from "../components/navigation-source-provider";
import { FreePlayDifficultyProvider } from "../lib/use-free-play-difficulty";
import * as uiStyles from "../styles/ui.css";

function getPageTransitionKey(pathname: string, asPath: string): string {
  if (pathname === "/404") {
    return pathname;
  }

  const path = asPath.split("?")[0].split("#")[0];

  if (/^\/play(?:\/.*)?$/.test(path)) {
    return "/play-flow";
  }

  return asPath;
}

function App({ Component, pageProps }: AppProps) {
  const router = useRouter();
  const reduceMotion = useReducedMotion();
  const useMenuFlowShell = React.useMemo(
    () => router.pathname !== "/404" && shouldUseMenuFlowShell(router.asPath),
    [router.asPath, router.pathname],
  );
  const pageTransitionKey = React.useMemo(
    () => getPageTransitionKey(router.pathname, router.asPath),
    [router.asPath, router.pathname],
  );

  return (
    <NavigationSourceProvider>
      <FreePlayDifficultyProvider>
        <DeckProvider>
          <div className={uiStyles.pageTransitionRoot}>
            {useMenuFlowShell ? (
              <MenuFlowShell />
            ) : (
              <AnimatePresence initial={false} mode="wait">
                <motion.div
                  key={pageTransitionKey}
                  animate={{ opacity: 1 }}
                  className={uiStyles.pageTransitionPane}
                  exit={{ opacity: 0 }}
                  initial={{ opacity: 0 }}
                  transition={{
                    duration: reduceMotion ? 0.12 : 0.22,
                    ease: [0.22, 1, 0.36, 1],
                  }}
                >
                  <Component {...pageProps} />
                </motion.div>
              </AnimatePresence>
            )}
          </div>
        </DeckProvider>
      </FreePlayDifficultyProvider>
    </NavigationSourceProvider>
  );
}

export default App;
