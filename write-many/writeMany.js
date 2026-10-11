// const fs = require("fs/promises");

//Execution time: 25s
// CPU usage: 100% (single core)
// Memory usage: 50MB
// (async () => {
//   console.time("writeMany");
//   const fileHandle = await fs.open("file.txt", "w");
//   for (let i = 0; i < 1000000; i++) {
//     await fileHandle.write(` ${i} `);
//   }
//   console.timeEnd("writeMany");
// })();

//callback version is usually faster than promise version
// const fs = require("fs");

// (async () => {
//   console.time("writeMany");
//   fs.open("file.txt", "w", (err, fd) => {
//     const buffer = Buffer.from('a');
//     for (let i = 0; i < 1000000; i++) {

//       //using callback version take much more memory than promise version, but it is faster (up to 900MB memory usage)
//       //   fs.write(fd, ` ${i} `, () => {});

//       //using sync only take 30MB memory usage
//       fs.writeSync(fd, buffer);
//     }
//     console.timeEnd("writeMany");
//   });
// })();

// const fs = require("fs/promises");

// //Not best practice since it uses lots of memory
// // Execution time: 300ms
// // CPU usage: 100% (single core)
// // Memory usage: 200MB
// (async () => {
//   console.time("writeMany");
//   const fileHandle = await fs.open("file.txt", "w");
//   const stream = fileHandle.createWriteStream();
//   for (let i = 0; i < 1000000; i++) {
//     const buffer = Buffer.from(` ${i} `);
//     stream.write(buffer);
//   }
//   console.timeEnd("writeMany");
// })();

const fs = require("fs/promises");

const numberOfWrites = 10000000;

//Memory usage: 50MB (since we drain the internal buffer before writing more data)
(async () => {
  console.time("writeMany");
  const fileHandle = await fs.open("file.txt", "w");
  const stream = fileHandle.createWriteStream();
  let i = 0;
  const writeMany = () => {
    while (i < numberOfWrites) {
      const buffer = Buffer.from(` ${i} `);
      if (i === numberOfWrites - 1) {
        return stream.end(buffer);
        // stream.write(buffer) // error!
      }
      // stream.write returns false if the internal buffer is full
      if (!stream.write(buffer)) {
        i++;
        break;
      }
      i++;
    }
  };
  writeMany();

  //drain event is emitted when the internal buffer is empty and ready for more data
  stream.on("drain", () => {
    writeMany();
  });

  //trigger finish event by calling stream.end() when the last write is done
  stream.on("finish", () => {
    console.timeEnd("writeMany");
    fileHandle.close();
  });

  // can't close here since it close before those callbacks are executed
  // console.timeEnd("writeMany");
})();
