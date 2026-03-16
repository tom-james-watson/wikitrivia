import { useRouter } from "next/router";
import React from "react";

const useIsomorphicLayoutEffect =
  typeof window === "undefined" ? React.useEffect : React.useLayoutEffect;

const NavigationSourceContext = React.createContext<{
  currentEntryWasInternal: boolean;
  ready: boolean;
}>({
  currentEntryWasInternal: false,
  ready: false,
});

export function NavigationSourceProvider(props: { children: React.ReactNode }) {
  const { children } = props;
  const router = useRouter();
  const nextEntryWasInternalRef = React.useRef(false);
  const [currentEntryWasInternal, setCurrentEntryWasInternal] =
    React.useState(false);
  const [ready, setReady] = React.useState(false);

  React.useEffect(() => {
    const handleRouteChangeStart = () => {
      nextEntryWasInternalRef.current = true;
      setReady(false);
    };

    router.events.on("routeChangeStart", handleRouteChangeStart);

    return () => {
      router.events.off("routeChangeStart", handleRouteChangeStart);
    };
  }, [router.events]);

  useIsomorphicLayoutEffect(() => {
    setCurrentEntryWasInternal(nextEntryWasInternalRef.current);
    nextEntryWasInternalRef.current = false;
    setReady(true);
  }, [router.asPath]);

  return (
    <NavigationSourceContext.Provider
      value={{
        currentEntryWasInternal,
        ready,
      }}
    >
      {children}
    </NavigationSourceContext.Provider>
  );
}

export function useNavigationSource() {
  return React.useContext(NavigationSourceContext);
}
