import clear from "console-clear";

function clearTerminal() {
  clear(true);
}

async function sleep(ms: number) {
  await new Promise((resolve) => {
    setTimeout(() => {
      resolve(0);
    }, ms);
  });
}

export { clearTerminal, sleep };
