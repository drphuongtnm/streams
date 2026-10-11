const { Readable } = require("node:stream");
const fs = require("node:fs");

class FileReadStream extends Readable {
  constructor({ highWaterMark, fileName }) {
    super({ highWaterMark });
    this.fd = null;
    this.fileName = fileName;
    this.chunks = [];
    this.chunkSize = 0;
  }

  _construct(callback) {
    fs.open(this.fileName, "r", (err, fd) => {
      if (err) {
        // have error => should not proceed
        return callback(err);
      } else {
        this.fd = fd;
        //no argument means it was successful
        callback();
      }
    });
  }

  _read(size) {
    const buff = Buffer.alloc(size);
    fs.read(this.fd, buff, 0, size, null, (err, bytesRead) => {
      // since we don;t have a callback, we can use destroy instead
      if (err) return this.destroy(err);
      //null is to indicate the end of stream
      this.push(bytesRead > 0 ? buff.subarray(0, bytesRead) : null);
    });
  }

  _destroy(error, callback) {
    if (this.fd) {
      fs.close(this.fd, (err) => {
        return callback(err || error);
      });
    } else {
      callback(error);
    }
  }
}

const stream = new FileReadStream({ fileName: "text.txt" });

stream.on("data", (chunk) => {
  console.log(chunk.toString("utf-8"));
});

stream.on("end", () => {
  console.log("Stream is done reading");
});
