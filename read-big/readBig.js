const fs = require("fs/promises");

//Memory usage: 50MB (since we drain the internal buffer before writing more data)

(async () => {
  const fileHandleRead = await fs.open("text-small.txt", "r");
  const fileHandleWrite = await fs.open("dest.txt", "w");

  const streamRead = fileHandleRead.createReadStream();
  const streamWrite = fileHandleWrite.createWriteStream();

  let split = "";

  streamRead.on("data", (chunks) => {
    const numbers = chunks.toString().split("  ");

    if (Number(numbers[0]) != Number(numbers[1]) - 1) {
      if (split) {
        numbers[0] = split + numbers[0];
      }
    }

    if (
      Number(numbers[numbers.length - 2]) + 1 !==
      Number(numbers[numbers.length - 1])
    ) {
      split = numbers.pop();
    }

    numbers.forEach((number) => {
      let n = Number(number);
      if (n % 2 === 0) {
        if (!streamWrite.write(" " + n + " ")) {
          streamRead.pause();
        }
      }
    });
  });

  streamWrite.on("drain", () => {
    streamRead.resume();
  });

  // don't need to trigger event finish/end in read stream
  streamRead.on("end", () => {
    console.log("Done reading");
  });
})();
