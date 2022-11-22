import clear from "console-clear";

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

export { clearTerminal, sleep };
