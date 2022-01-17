export function calcReadTime(htmlString: string) {
  const content = htmlString.replace(/(<([^>]+)>)/gi, "");

  const READING_SPEED = 240; // Words per minute
  const TIME_PER_IMAGE = 12; // Takes 12s to process 1 image
  const IMAGE_SPEED = (1 / TIME_PER_IMAGE) * 60; // Images per minute

  const numWords = content.split(" ").length;
  const numImages = (content.match(/\!\[/g) || []).length;

  const readTime = Math.ceil(
    numWords / READING_SPEED + numImages / IMAGE_SPEED
  );

  return readTime;
}
