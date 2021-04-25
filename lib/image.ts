export function createWikimediaImage(image: string, width = 300): string {
  return `https://commons.wikimedia.org/w/index.php?title=Special:Redirect/file/${encodeURIComponent(
    image
  )}&width=${width}`;
}
