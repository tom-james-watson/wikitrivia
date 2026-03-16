import React from "react";

type ImageStatus = "error" | "loaded" | "loading";

type ImageCacheEntry = {
  image: HTMLImageElement;
  listeners: Set<() => void>;
  status: ImageStatus;
};

const imageCache = new Map<string, ImageCacheEntry>();

function notify(entry: ImageCacheEntry): void {
  entry.listeners.forEach((listener) => {
    listener();
  });
}

function ensureImage(src: string): ImageCacheEntry | null {
  if (!src || typeof Image === "undefined") {
    return null;
  }

  const cachedEntry = imageCache.get(src);
  if (cachedEntry) {
    return cachedEntry;
  }

  const image = new Image();
  image.crossOrigin = "anonymous";
  image.decoding = "async";

  const entry: ImageCacheEntry = {
    image,
    listeners: new Set(),
    status: "loading",
  };

  image.addEventListener(
    "load",
    () => {
      entry.status = "loaded";
      notify(entry);
    },
    { once: true },
  );
  image.addEventListener(
    "error",
    () => {
      entry.status = "error";
      notify(entry);
    },
    { once: true },
  );
  image.src = src;

  if (image.complete) {
    entry.status = image.naturalWidth > 0 ? "loaded" : "error";
  }

  imageCache.set(src, entry);
  return entry;
}

export function preloadCardImageCandidates(
  candidates: string[],
): HTMLImageElement | null {
  let firstImage: HTMLImageElement | null = null;

  for (const candidate of candidates) {
    const entry = ensureImage(candidate);

    if (!firstImage && entry) {
      firstImage = entry.image;
    }
  }

  return firstImage;
}

function getLoadedEntry(candidates: string[]): ImageCacheEntry | null {
  for (const candidate of candidates) {
    const entry = candidate ? imageCache.get(candidate) : null;
    if (entry?.status === "loaded") {
      return entry;
    }
  }

  return null;
}

type UseCardImageResult = {
  image: HTMLImageElement | null;
  imageSrc: string;
};

export function useCardImage(candidates: string[]): UseCardImageResult {
  const [resolvedImage, setResolvedImage] =
    React.useState<HTMLImageElement | null>(
      () => getLoadedEntry(candidates)?.image ?? null,
    );
  const [resolvedSrc, setResolvedSrc] = React.useState<string>(
    () =>
      getLoadedEntry(candidates)?.image.currentSrc ??
      getLoadedEntry(candidates)?.image.src ??
      candidates[0] ??
      "",
  );

  React.useEffect(() => {
    const loadedEntry = getLoadedEntry(candidates);

    if (loadedEntry) {
      setResolvedImage(loadedEntry.image);
      setResolvedSrc(loadedEntry.image.currentSrc || loadedEntry.image.src);
      return;
    }

    setResolvedImage(null);
    setResolvedSrc(candidates[0] ?? "");

    const cleanups: Array<() => void> = [];
    let settled = false;

    const pickCandidate = () => {
      if (settled) {
        return;
      }

      for (const candidate of candidates) {
        const entry = ensureImage(candidate);

        if (!entry) {
          continue;
        }

        if (entry.status === "loaded") {
          settled = true;
          setResolvedImage(entry.image);
          setResolvedSrc(
            entry.image.currentSrc || entry.image.src || candidate,
          );
          return;
        }
      }

      const pendingEntry = candidates
        .map((candidate) => ensureImage(candidate))
        .find((entry) => entry?.status === "loading");

      if (!pendingEntry) {
        settled = true;
        setResolvedImage(null);
        setResolvedSrc(candidates[0] ?? "");
      }
    };

    for (const candidate of candidates) {
      const entry = ensureImage(candidate);

      if (!entry) {
        continue;
      }

      const listener = () => {
        pickCandidate();
      };

      entry.listeners.add(listener);
      cleanups.push(() => {
        entry.listeners.delete(listener);
      });
    }

    pickCandidate();

    return () => {
      for (const cleanup of cleanups) {
        cleanup();
      }
    };
  }, [candidates]);

  return { image: resolvedImage, imageSrc: resolvedSrc };
}
