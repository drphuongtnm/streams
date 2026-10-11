const { Transform } = require("node:stream");
const fs = require("node:fs/promises");


class Encrypt extends Transform {
  constructor(totalBytes) {
    super();
    this.totalBytes = totalBytes;
    this.bytesRead = 0;
    this.lastPercent = -1
  }

  _transform(chunk, encoding, callback) {
    // <34 + 1, ff, a4 + 1, 11 + 1, 22 + 1....>
    this.bytesRead += chunk.length;
    const newPercent = Math.floor(this.bytesRead / this.totalBytes * 100)
    if(newPercent > this.lastPercent){
      this.lastPercent = newPercent;
      process.stdout.write(`\rEncrypting... ${this.lastPercent}%`)
    }
    for (let i = 0; i < chunk.length; ++i) {
      if (chunk[i] !== 255) {
        chunk[i] = chunk[i] + 1;
      }
    }

    
    callback(null, chunk);
  }

  _flush(callback) {
    
    console.log("\nEncryption done...");
    callback();
  }
}

(async () => {
  const readFileHandle = await fs.open("read.txt", "r");
  const writeFileHandle = await fs.open("write.txt", "w");

  const { size } = await readFileHandle.stat();
  const readStream = readFileHandle.createReadStream();
  const writeStream = writeFileHandle.createWriteStream();

  const encrypt = new Encrypt(size);

  readStream.pipe(encrypt).pipe(writeStream);
})();
