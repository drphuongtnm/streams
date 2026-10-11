const { read } = require("fs");
const fs = require("fs/promises");

// Memory usage 1GB
// Execution time 900ms
// (async () => {
//   console.time("copy");
//   const fileHandleWrite = await fs.open("dest.txt", "w");
//   const result = await fs.readFile("text-big.txt");
//   await fileHandleWrite.write(result);
//   console.timeEnd("copy");
// })();

// (async () => {
//   console.time("copy");
//   const srcFile = await fs.open("text-big.txt", "r");
//   const destFile = await fs.open("dest.txt", "w");

//   let bytesRead = -1;

//   while (bytesRead != 0) {
//     const readResult = await srcFile.read();

//     bytesRead = readResult.bytesRead;
//     if (bytesRead != 16384) {
//       const indexOfNotFilled = readResult.buffer.indexOf(0);
//       const newBuffer = Buffer.alloc(indexOfNotFilled);
//       readResult.buffer.copy(newBuffer, 0, 0, indexOfNotFilled);
//       destFile.write(newBuffer);
//     } else {
//       destFile.write(readResult.buffer);
//     }
//   }

//   console.timeEnd("copy");
// })();

// Memory usage 30MB
// Execution time 1s
// (async () => {
//   console.time("copy");
//   const srcFile = await fs.open("text-big.txt", "r");
//   const destFile = await fs.open("dest.txt", "w");

//   const readStream = srcFile.createReadStream();
//   const writeStream = destFile.createWriteStream();
//   readStream.pipe(writeStream)

//   readStream.on('end', () => {
//     console.timeEnd("copy");
//   })

// })();

const { pipeline } = require("node:stream");

(async () => {
  console.time("copy");
  const srcFile = await fs.open("text-big.txt", "r");
  const destFile = await fs.open("dest.txt", "w");

  const readStream = srcFile.createReadStream();
  const writeStream = destFile.createWriteStream();

  //pipeline handle all the error, destroy the stream when it's done => prevent memory leak
  pipeline(readStream, writeStream, (err) => {
    if (err) console.log(err);
    console.timeEnd("copy");
  });
})();
