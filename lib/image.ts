export function createWikimediaImage(image: string, width = 300): string {
  return `https://commons.wikimedia.org/w/index.php?title=Special:Redirect/file/${encodeURIComponent(
    image
  )}&width=${width}`;
}

export function createCardImage(image: string, width = 300): string {
    let returnvalue="";
    if (image.includes("http")) {
        returnvalue = image;
    } else {
	returnvalue = `https://commons.wikimedia.org/w/index.php?title=Special:Redirect/file/${encodeURIComponent(
                        image
                      )}&width=${width}`;
    }
    return returnvalue;
}
