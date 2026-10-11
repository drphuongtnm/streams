const { Writable } = require("node:stream");
const fs = require("node:fs");

class FileWriteSteam extends Writable {
  constructor({ highWaterMark, fileName }) {
    super({ highWaterMark });
    this.fd = null;
    this.fileName = fileName;
    this.chunks = [];
    this.chunkSize = 0;
    this.writesCount = 0;
  }

  // This will run after the constructor, and it will put off calling all the other methods
  // until we call the callback function
  _construct(callback) {
    fs.open(this.fileName, "w", (err, fd) => {
      if (err) {
        // have error => should not proceed
        callback(err);
      } else {
        this.fd = fd;
        //no argument means it was successful
        callback();
      }
    });
  }

  // use underscore write (Node js recommendation)
  _write(chunk, encoding, callback) {
    this.chunks.push(chunk);
    this.chunkSize += chunk.length;

    if (this.chunkSize > this.writableHighWaterMark) {
      fs.write(this.fd, Buffer.concat(this.chunks), (err) => {
        if (err) return callback(err);
        this.chunks = [];
        this.chunkSize = 0;
        ++this.writesCount;
        callback();
      });
    } else {
      //when we're done, call the callback function
      callback();
    }
  }

  //only get executed when we call end func
  _final(callback) {
    fs.write(this.fd, Buffer.concat(this.chunks), (err) => {
      if (err) return callback(err);

      this.chunks = [];
      callback();
    });
  }

  _destroy(error, callback) {
    console.log("Number of writes:", this.writesCount);
    if (this.fd) {
      fs.close(this.fd, (err) => {
        callback(err || error);
      });
    } else {
      callback(error);
    }
  }
}

const stream = new FileWriteSteam({
  highWaterMark: 1800,
  fileName: "text.txt",
});

const numberOfWrites = 1000000;

//Memory usage: 50MB (since we drain the internal buffer before writing more data)
(async () => {
  console.time("writeMany");
  const stream = new FileWriteSteam({
    fileName: "text.txt",
  });
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

  stream.on("drain", () => {
    writeMany();
  });

  stream.on("finish", () => {
    console.timeEnd("writeMany");
  });
})();
