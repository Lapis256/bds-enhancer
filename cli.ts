import { LogDelimiterStream } from "./src/logDelimiterStream.ts";

function buildCommand(os: string, cwd: string) {
  if (os !== "linux" && os !== "windows") {
    throw Error(`Unsupported platform: ${os}`);
  }

  Deno.chdir(cwd);
  return new Deno.Command("./bedrock_server", {
    env: os === "linux" ? { LD_LIBRARY_PATH: "." } : undefined,
    stdin: "piped",
    stdout: "piped",
    cwd,
  });
}

const encoder = new TextEncoder();
function encodeString(string: string) {
  return encoder.encode(string);
}

enum Color {
  Red = "\u001b[91m",
  Yellow = "\u001b[93m",
  Reset = "\u001b[0m",
}

const regExpBase =
  "\\[[0-9]{4}-[0-9]{2}-[0-9]{2} [0-9]{2}:[0-9]{2}:[0-9]{2}:[0-9]{3}";

const regExpError = new RegExp(`${regExpBase} ERROR\\] `);
const regExpWarn = new RegExp(`${regExpBase} WARN\\] `);
const regExpActionMessage = new RegExp(`.*\\[Scripting\\] bds_enhancer:(.*)?`);
const regExpConnected = new RegExp(
  `${regExpBase} INFO\\] Player connected: (.*)?, xuid: (.*)?`
);
const regExpInfo = new RegExp(`${regExpBase} INFO\\] `);

interface ActionRequest<T extends string, P> {
  action: T;
  payload: P;
}

type EmptyPayload = Record<never, never>;

interface TransferPayload {
  player: string;
  host: string;
  port: number;
}

interface KickByIdPayload {
  playerId: string;
  reason: string;
}

type ReloadAction = ActionRequest<"reload", EmptyPayload>;
type StopAction = ActionRequest<"stop", EmptyPayload>;
type SaveAction = ActionRequest<"save", EmptyPayload>;
type TransferAction = ActionRequest<"transfer", TransferPayload>;
type KickByIdAction = ActionRequest<"kick", KickByIdPayload>;

type Action =
  | ReloadAction
  | StopAction
  | SaveAction
  | TransferAction
  | KickByIdAction;

function createStringWriter(): [
  () => Promise<void>,
  (color: string, string: string) => Promise<void>
] {
  const stdoutWriter = Deno.stdout.writable.getWriter();

  return [
    stdoutWriter.close,
    (color: string, string: string) =>
      stdoutWriter.write(encodeString(color + string + Color.Reset)),
  ];
}

async function handleStdin(
  stdinWriter: WritableStreamDefaultWriter<Uint8Array>
) {
  for await (const chunk of Deno.stdin.readable) {
    await stdinWriter.write(chunk);
  }
}

async function handleStdout(
  child: Deno.ChildProcess,
  executeCommand: (command: string) => Promise<void>
) {
  const [stdoutClose, write] = createStringWriter();

  const stringStream = child.stdout
    .pipeThrough(new TextDecoderStream())
    .pipeThrough(new LogDelimiterStream());

  for await (const string of stringStream) {
    const includeError = regExpError.test(string);
    const includeWarn = regExpWarn.test(string);
    const includeInfo = regExpInfo.test(string);

    const color = includeError ? Color.Red : includeWarn ? Color.Yellow : "";

    if (includeWarn) {
      const match = string.match(regExpActionMessage);
      if (match) {
        const actionData = match[1];
        const data = JSON.parse(actionData) as Action;

        switch (data.action) {
          case "reload":
            await executeCommand("reload");
            break;
          case "stop":
            await executeCommand("stop");
            break;
          case "save":
            await executeCommand("save hold");
            break;
          case "transfer":
            await executeCommand(
              `transfer ${data.payload.player} ${data.payload.host} ${data.payload.port}`
            );
            break;
          case "kick":
            await executeCommand(
              `kick ${data.payload.playerId} ${data.payload.reason}`
            );
            break;
        }
        continue;
      }
    }

    if (includeInfo) {
      if (string.includes("Running AutoCompaction...")) {
        continue;
      }

      const match = string.match(regExpConnected);
      if (match) {
        const player = { name: match[1], xuid: match[2] };
        await executeCommand(
          `scriptevent bds_enhancer:joinPlayer ${JSON.stringify(player)}`
        );
      }
    }

    await write(color, string);
  }

  await child.status;
  await stdoutClose();
}

function main() {
  const command = buildCommand(Deno.build.os, Deno.args[0] ?? ".");
  const child = command.spawn();

  const stdinWriter = child.stdin.getWriter();
  handleStdin(stdinWriter);
  handleStdout(
    child,
    async (cmd: string) => await stdinWriter.write(encodeString(cmd + "\n"))
  );

  (async function () {
    const { code } = await child.status;
    await stdinWriter.close();
    Deno.exit(code);
  })();
}

if (import.meta.main) {
  main();
}
