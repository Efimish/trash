import { parse } from "path";
import sharp from "sharp";

const arg = process.argv.slice(2).at(0);
if (!arg) {
  console.error("Provide an image to transform");
  process.exit();
}

const parsed = parse(arg);

sharp(arg, { animated: parsed.ext === ".gif" })
  .resize({
    width: 88,
    height: 31,
    fit: "fill",
  })
  .toFile(`${parsed.dir}/${parsed.name}-88x31${parsed.ext}`);
