import { existsSync, mkdirSync } from "fs";
import { sleep } from "./modules/helper.mjs";
import { logLevel, logger } from "./modules/logger.mjs";
import { subfinder } from "./resources/subfinder.js";

const domains = [
  "academia.edu",
  "skillacademy.com",
  "microsoft.com",
  "spotify.com",
  "joox.com",
  "kno2fy.com",
  "onlymega.com",
  "google.com",
  "line.me",
  "midtrans.com",
  "digicert.com",
  "millionaireaisle.com",
  "skolla.online",
  "udemy.com",
  "zoom.us",
  ".ac.id",
  ".co.id",
  ".go.id",
  ".id",
  ".com",
];

if (!existsSync("./result")) mkdirSync("./result");

subfinder.load();
(async () => {
  await sleep(1000);
  const onRun: Array<number> = [];
  for (const domain of domains) {
    onRun.push(1);
    subfinder.run(domain).finally(() => {
      onRun.shift();
    });

    let isStuck = 120;
    if (onRun.length > 10) {
      logger.log(logLevel.info, "Waiting another process ...");
      await sleep(1000);

      --isStuck;
      if (!isStuck) {
        while (onRun[0]) {
          onRun.shift();
        }
      }
    }
  }

  let isStuck = 120;
  do {
    await sleep(1000);

    --isStuck;
    if (!isStuck) {
      break;
    }
  } while (onRun[0]);
})();
