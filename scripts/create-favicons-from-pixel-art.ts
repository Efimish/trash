import fs from "fs";
import sharp from "sharp";
import ico from "sharp-ico";
// @ts-ignore
import rd from "rectangle-decomposition";
import { optimize } from "svgo";

const name = process.argv.slice(2).at(0);
if (typeof name === "undefined") {
  console.error("Provide an image to transform");
  process.exit();
}

// favicon.ico
ico.sharpsToIco([sharp(name)], "public/favicon.ico", {
  sizes: [48, 32, 16],
  resizeOptions: {
    kernel: sharp.kernel.nearest,
  },
});

// apple-touch-icon.png
// 144 / 180 = 0.8
sharp(name)
  .flatten({ background: "#fff" })
  .resize({
    width: 144,
    height: 144,
    kernel: sharp.kernel.nearest,
  })
  .extend({
    top: 18,
    bottom: 18,
    left: 18,
    right: 18,
    background: "#fff",
  })
  .toFile("public/apple-touch-icon.png");

// favicon-192.png
// 144 / 192 = 0.75
sharp(name)
  .flatten({ background: "#fff" })
  .resize({
    width: 144,
    height: 144,
    kernel: sharp.kernel.nearest,
  })
  .extend({
    top: 24,
    bottom: 24,
    left: 24,
    right: 24,
    background: "#fff",
  })
  .toFile("public/favicon-192.png");

// favicon-512.png
// 384 / 512 = 0.75
sharp(name)
  .flatten({ background: "#fff" })
  .resize({
    width: 384,
    height: 384,
    kernel: sharp.kernel.nearest,
  })
  .extend({
    top: 64,
    bottom: 64,
    left: 64,
    right: 64,
    background: "#fff",
  })
  .toFile("public/favicon-512.png");

// favicon.svg
const {
  data,
  info: { width, height },
} = await sharp(name).ensureAlpha().raw().toBuffer({ resolveWithObject: true });

const colorMap = new Map<string, [number, number][]>();

for (let y = 0; y < height; y++) {
  for (let x = 0; x < width; x++) {
    const idx = (y * width + x) * 4;
    const r = data[idx];
    const g = data[idx + 1];
    const b = data[idx + 2];
    const a = data[idx + 3];

    if (a === 0) continue; // skip transparent pixels

    const colorArray = [r, g, b];
    if (a < 255) colorArray.push(a);
    const hex = new Uint8Array(colorArray).toHex();

    colorMap.getOrInsert(hex, []).push([x, y]);
  }
}

function pixelsToRects(
  coords: [number, number][],
): [number, number, number, number][] {
  const set = new Set(coords.map(([x, y]) => `${x},${y}`));
  const edgeMap = new Map<string, [number, number, number, number]>();

  const addEdge = (x1: number, y1: number, x2: number, y2: number) => {
    edgeMap.set(`${x1},${y1}->${x2},${y2}`, [x1, y1, x2, y2]);
  };

  for (const [x, y] of coords) {
    if (!set.has(`${x},${y - 1}`)) addEdge(x, y, x + 1, y);
    if (!set.has(`${x + 1},${y}`)) addEdge(x + 1, y, x + 1, y + 1);
    if (!set.has(`${x},${y + 1}`)) addEdge(x + 1, y + 1, x, y + 1);
    if (!set.has(`${x - 1},${y}`)) addEdge(x, y + 1, x, y);
  }

  const startMap = new Map<string, [number, number, number, number]>();
  for (const [, edge] of edgeMap) startMap.set(`${edge[0]},${edge[1]}`, edge);

  const loops: [number, number][][] = [];
  const used = new Set<string>();

  for (const [, edge] of edgeMap) {
    const k = `${edge[0]},${edge[1]}->${edge[2]},${edge[3]}`;
    if (used.has(k)) continue;

    const points: [number, number][] = [];
    let cur = edge;
    while (true) {
      const key = `${cur[0]},${cur[1]}->${cur[2]},${cur[3]}`;
      if (used.has(key)) break;
      used.add(key);
      points.push([cur[0], cur[1]]);
      cur = startMap.get(`${cur[2]},${cur[3]}`)!;
      if (!cur) break;
    }
    if (points.length < 3) continue;

    const loop = points.filter((p, i) => {
      const prev = points[(i - 1 + points.length) % points.length];
      const next = points[(i + 1) % points.length];
      return !(
        p[0] - prev[0] === next[0] - p[0] && p[1] - prev[1] === next[1] - p[1]
      );
    });

    if (loop.length >= 4) loops.push(loop);
  }

  // @ts-ignore
  return rd(loops).map(([[x1, y1], [x2, y2]]) => [x1, y1, x2 - x1, y2 - y1]);
}

const svgArray = [
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" shape-rendering="crispEdges">`,
];

colorMap.entries().forEach(([hex, coords]) => {
  // coords.forEach(([x, y]) => {
  //   svgArray.push(
  //     `<rect fill="#${hex}" x="${x}" y="${y}" width="1" height="1" />`,
  //   );
  // });
  for (const [x, y, w, h] of pixelsToRects(coords)) {
    svgArray.push(
      `<rect fill="#${hex}" x="${x}" y="${y}" width="${w}" height="${h}" />`,
    );
  }
});

svgArray.push("</svg>");

const svg = optimize(svgArray.join(""), { multipass: true });

fs.writeFileSync("public/favicon.svg", svg.data + "\n");
