import clear from "console-clear";
import readline from "readline";

function clearTerminal(scroll: boolean = true) {
  clear(scroll);
}

async function sleep(ms: number) {
  await new Promise((resolve) => {
    setTimeout(() => {
      resolve(0);
    }, ms);
  });
}

function writeListToTerminal(list: Array<string>, cursorX: number = 0) {
  for (let cursorY = 0; cursorY < list.length; cursorY++) {
    readline.cursorTo(process.stdout, cursorX, cursorY);
    process.stdout.write(" ".repeat(process.stdout.columns));
    readline.cursorTo(process.stdout, cursorX, cursorY);
    process.stdout.write(list[cursorY]);
  }
}

export { clearTerminal, sleep, writeListToTerminal };
