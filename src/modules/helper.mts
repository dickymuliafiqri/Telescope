import clear from "console-clear";
import readline from "readline";
import stripAnsi from "strip-ansi";

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

function pager(list: Array<string>, listPerPage: number = 5): Array<Array<string>> {
  let index = 0;
  let result: string[][] = [];
  for (const i in list) {
    if (!result[index]) result[index] = [];
    result[index].push(`${result[index].length + 1} ${list[i]}`);
    if (result[index].length >= listPerPage) {
      if (result[index - 1]) result[index].push("Prev");
      if (list[parseInt(i) + 1]) result[index].push("Next");
      result[index].push("Back");
      index += 1;
    } else if (result[index].length == list.length) {
      result[index].push("Back");
    } else if (!list[parseInt(i) + 1]) {
      result[index].push(...["Prev", "Back"]);
    }
  }

  return result;
}

function unchalk(text: string): string {
  return stripAnsi(text);
}

export { clearTerminal, sleep, writeListToTerminal, pager, unchalk };
