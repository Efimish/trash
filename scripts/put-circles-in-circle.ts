function printSvgCircles(
  centerX: number,
  centerY: number,
  bigRadius: number,
  smallRadius: number,
  count: number,
  startAngleDeg = -90, // -90 = start at top in SVG coordinates
) {
  const step = 360 / count;
  const effectiveRadius = bigRadius - smallRadius;

  for (let i = 0; i < count; i++) {
    const angleDeg = startAngleDeg + step * i;
    const angleRad = (angleDeg * Math.PI) / 180;

    const x = Math.round(centerX + effectiveRadius * Math.cos(angleRad));
    const y = Math.round(centerY + effectiveRadius * Math.sin(angleRad));

    console.log(`<circle cx="${x}" cy="${y}" r="${smallRadius}" />`);
  }
}

console.log("Cut outs");
printSvgCircles(12, 12, 22, 6, 6, 0);
console.log("Inner");
printSvgCircles(12, 12, 10, 2, 6);
console.log("Lines");
printSvgCircles(12, 12, 16, 0, 6);
