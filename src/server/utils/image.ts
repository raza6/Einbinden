import { Jimp } from 'jimp';

export async function saveCoverToStatic(buffer: Buffer, isbn: string): Promise<string> {
  const image = await Jimp.read(buffer);
  await image.cover({ w: 400, h: 566 }).write(`./static/img/${isbn}.jpg`);
  return `/static/img/${isbn}.jpg`;
}
