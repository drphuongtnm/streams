# Node.js Streams

Practice exercises for working with streams in Node.js: writing and reading large files efficiently, handling backpressure, and building custom `Writable`, `Readable`, `Duplex` and `Transform` streams.

## Requirements

- Node.js 18+ (uses `fs/promises` `FileHandle.createReadStream()` / `createWriteStream()` and the stream `_construct()` hook)

No dependencies to install.

## Exercises

| Folder | Script | What it shows |
| --- | --- | --- |
| [write-many](write-many/) | `writeMany.js` | Writing 10 million numbers to a file. Compares `fs/promises`, callback and sync writes, a naive stream, and finally a stream that respects backpressure using `write()`'s return value and the `drain` event. |
| [read-big](read-big/) | `readBig.js` | Reading a large file in chunks, fixing numbers that get split across chunk boundaries, and writing only the even numbers. Pauses the read stream when the write stream is full and resumes it on `drain`. |
| [copy](copy/) | `copy.js` | Copying a large file in three ways: `readFile` (loads everything into memory), a manual read/write loop, and streams with `pipe()` / `pipeline()`. `pipeline()` handles errors and cleans up the streams. |
| [custom-writable](custom-writable/) | `customWritable.js` | A custom `Writable` (`FileWriteSteam`) that buffers chunks and flushes them to disk once they exceed `highWaterMark`. Uses `_construct`, `_write`, `_final` and `_destroy`. |
| [custom-readable](custom-readable/) | `customReadable.js` | A custom `Readable` (`FileReadStream`) that reads a file with `fs.read` and ends the stream by pushing `null`. |
| [custom-duplex](custom-duplex/) | `customDuplex.js` | A custom `Duplex` that reads from one file and writes to another, with separate readable and writable buffers. |
| [encrypt-decrypt](encrypt-decrypt/) | `encryption.js`, `decryption.js` | Custom `Transform` streams that "encrypt" a file by adding 1 to each byte (except `0xFF`), and "decrypt" it by subtracting 1. |

## Running

Each script reads and writes files relative to the current directory, so run it from inside its folder:

```bash
cd write-many
node writeMany.js
```

### Input files

The `.txt` data files are not in the repo (they're large and generated). Create them before running the scripts that need them:

| Script | Needs | How to get it |
| --- | --- | --- |
| `write-many/writeMany.js` | nothing | Creates `file.txt` |
| `read-big/readBig.js` | `text-small.txt` | Run `writeMany.js` and copy its `file.txt` here |
| `copy/copy.js` | `text-big.txt` | Any large file, e.g. a copy of `write-many/file.txt` |
| `custom-writable/customWritable.js` | nothing | Creates `text.txt` |
| `custom-readable/customReadable.js` | `text.txt` | Copy `custom-writable/text.txt` here |
| `custom-duplex/customDuplex.js` | `read.txt` | Any text file |
| `encrypt-decrypt/encryption.js` | `read.txt` | Any text file; writes `write.txt` |
| `encrypt-decrypt/decryption.js` | `write.txt` | Run `encryption.js` first; writes `decrypted.txt` |

## Notes

The comments in the scripts record the time and memory each approach used on my machine. The main lesson: streams that handle backpressure keep memory use low and steady, while loading a whole file or ignoring `write()`'s return value can use hundreds of MB or more.
