const zlib = require('zlib');
const fs = require('fs');

const crcTable = (() => {
  const t = new Uint32Array(256);
  for (let i = 0; i < 256; i++) {
    let c = i;
    for (let k = 0; k < 8; k++) c = (c & 1) ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    t[i] = c;
  }
  return t;
})();

function crc32(buf) {
  let c = 0xffffffff;
  for (const b of buf) c = crcTable[(c ^ b) & 0xff] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
}

function pngChunk(type, data) {
  const typeB = Buffer.from(type, 'ascii');
  const lenB = Buffer.alloc(4);
  lenB.writeUInt32BE(data.length);
  const crcB = Buffer.alloc(4);
  crcB.writeUInt32BE(crc32(Buffer.concat([typeB, data])));
  return Buffer.concat([lenB, typeB, data, crcB]);
}

function isHeart(nx, ny) {
  const x = (nx - 0.5) * 2.4;
  const y = -(ny - 0.48) * 2.4;
  return Math.pow(x*x + y*y - 1, 3) - x*x * y*y*y <= 0;
}

function isRoundedBg(nx, ny, r) {
  const ax = Math.abs(nx - 0.5);
  const ay = Math.abs(ny - 0.5);
  if (ax > 0.5 - r && ay > 0.5 - r) {
    const dx = ax - (0.5 - r), dy = ay - (0.5 - r);
    return dx*dx + dy*dy <= r*r;
  }
  return true;
}

function generatePNG(size, path) {
  const raw = [];
  for (let y = 0; y < size; y++) {
    raw.push(0); // filter: None
    for (let x = 0; x < size; x++) {
      const nx = x / size, ny = y / size;
      if (!isRoundedBg(nx, ny, 0.18)) {
        raw.push(252, 228, 236, 0); // transparent corners
      } else if (isHeart(nx, ny)) {
        raw.push(233, 30, 140, 255); // #e91e8c
      } else {
        raw.push(252, 228, 236, 255); // #fce4ec
      }
    }
  }

  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(size, 0); ihdr.writeUInt32BE(size, 4);
  ihdr[8] = 8; ihdr[9] = 6; // RGBA

  const png = Buffer.concat([
    Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]),
    pngChunk('IHDR', ihdr),
    pngChunk('IDAT', zlib.deflateSync(Buffer.from(raw))),
    pngChunk('IEND', Buffer.alloc(0)),
  ]);

  fs.writeFileSync(path, png);
  console.log(`✓ ${path} (${size}×${size})`);
}

generatePNG(192, 'icon-192.png');
generatePNG(512, 'icon-512.png');
