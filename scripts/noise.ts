import sharp from "sharp";
import alea from "alea";
import { createNoise2D } from "simplex-noise";

const prng = alea("seed");
const noise2D = createNoise2D(prng);

const WIDTH = 88;
const HEIGHT = 31;
const CHANNELS = 1;

const totalBytes = WIDTH * HEIGHT * CHANNELS;
const pixelArray = new Uint8ClampedArray(totalBytes);

for (let y = 0; y < HEIGHT; y++) {
  for (let x = 0; x < WIDTH; x++) {
    // Вычисляем индекс в плоском массиве
    const index = y * WIDTH + x;

    // noise2D возвращает значения от -1 до 1.
    // Масштабируем x и y, чтобы шум не был слишком "мелким" (например, делим на 10)
    const noiseValue = noise2D(x / 10, y / 10);

    // Переводим диапазон [-1, 1] в диапазон байта [0, 255]
    const grayscale = Math.floor((noiseValue + 1) * 127.5);

    pixelArray[index] = grayscale;
  }
}


await sharp(pixelArray, {
  raw: {
    width: WIDTH,
    height: HEIGHT,
    channels: CHANNELS,
  },
})
  .png() // Конвертируем в PNG (или .jpeg())
  .toFile("images/88x31/noise-88x31.png");

console.log("Изображение шума успешно создано!");
