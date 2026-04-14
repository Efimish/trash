/** @jsxImportSource satori/jsx */

import { readFile } from "fs/promises";
import sharp from "sharp";
import satori from "satori";
import type { SatoriOptions } from "satori";

const options = {
  width: 1200,
  height: 630,
  fonts: [
    {
      name: "Inter",
      data: await readFile(
        "node_modules/@fontsource/inter/files/inter-latin-400-normal.woff",
      ),
      weight: 400,
      style: "normal",
    },
    {
      name: "Inter",
      data: await readFile(
        "node_modules/@fontsource/inter/files/inter-latin-700-normal.woff",
      ),
      weight: 700,
      style: "normal",
    },
  ],
} satisfies SatoriOptions;

const svg = await satori(
  <div
    style={{
      width: "100%",
      height: "100%",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      gap: "1rem",
      fontFamily: "Inter, sans-serif",
      fontSize: "128px",
      color: "#bbb",
      backgroundColor: "#111",
    }}
  >
    <strong>bold text</strong>
    <p>normal text</p>
  </div>,
  options,
);

await sharp(new TextEncoder().encode(svg)).toFile("images/banner.webp");
