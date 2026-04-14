import sharp from "sharp";

const WIDTH = 88;
const HEIGHT = 31;

const background = sharp({
  create: {
    width: WIDTH - 2,
    height: HEIGHT - 2,
    channels: 3,
    background: "#000",
  },
}).extend({
  top: 1,
  bottom: 1,
  left: 1,
  right: 1,
  background: "#fff",
});

const image = sharp("images/moon.png");
const { width: imageWidth, height: imageHeight } = await image.metadata();

const text = sharp({
  text: {
    text: "Efim\nIshenin",
    align: "center",
  },
});
const { width: textWidth, height: textHeight } = await text.metadata();

const imageMargin = Math.round((HEIGHT - imageHeight) / 2);
const textMargin = Math.round((HEIGHT - textHeight) / 2);
background
  .composite([
    {
      input: await image.png().toBuffer(),
      top: imageMargin,
      left: imageMargin,
    },
    {
      input: await text.png().toBuffer(),
      top: textMargin,
      left: imageWidth + imageMargin * 2,
    },
  ])
  .toFile("images/badge.png");
