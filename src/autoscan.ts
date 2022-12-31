import { existsSync, mkdirSync, readFileSync, writeFileSync } from "fs";
import { sleep } from "./modules/helper.mjs";
import { logLevel, logger } from "./modules/logger.mjs";
import { subfinder } from "./resources/subfinder.js";

const domains = [
  ".ac.id",
  ".co.id",
  ".go.id",
  ".or.id",
  ".web.id",
  ".id",
  ".com",
  ".net",
  ".org",
  ".us",
  ".info",
  ".edu",
];

if (!existsSync("./result")) mkdirSync("./result");

subfinder.load();

class AutoScan {
  async getSubdomains() {
    const onRun: Array<number> = [];
    for (const domain of domains) {
      onRun.push(1);
      subfinder.run(domain).finally(() => {
        onRun.shift();
      });

      let isStuck = 160;
      if (onRun.length > 3) {
        logger.log(logLevel.info, "Waiting another process ...");
        await sleep(1000);

        --isStuck;
        if (isStuck <= 0) {
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
      if (isStuck <= 0) {
        break;
      }
    } while (onRun[0]);
  }
}

const autoScan = new AutoScan();
(async () => {
  // Wait module to be loaded
  await sleep(1000);

  await autoScan.getSubdomains();
})();
