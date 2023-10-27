import { TextDelimiterStream } from "std/streams/mod.ts";

export class LogDelimiterStream extends TransformStream<string, string> {
  readable: ReadableStream<string>;
  writable: WritableStream<string>;

  #buffer = "";

  constructor() {
    super({});

    const textLineDelimiter = new TextDelimiterStream("\n", {
      disposition: "suffix",
    });
    const logDelimiter = new TransformStream<string, string>({
      transform: (chunk, controller) => this.#handleLine(chunk, controller),
      flush: (controller) => controller.enqueue(this.#buffer),
    });

    this.writable = textLineDelimiter.writable;
    this.readable = logDelimiter.readable;

    textLineDelimiter.readable.pipeTo(logDelimiter.writable);
  }

  #handleLine(
    chunk: string,
    controller: TransformStreamDefaultController<string>
  ) {
    const logHead = "[" + new Date().getFullYear();
    if (chunk.startsWith(logHead) && this.#buffer !== "") {
      controller.enqueue(this.#buffer);
      this.#buffer = chunk;
    } else {
      this.#buffer += chunk;
    }

    setTimeout(() => {
      if (!(this.readable.locked && this.writable.locked)) {
        return;
      }

      controller.enqueue(this.#buffer);
      this.#buffer = "";
    }, 50);
  }
}
