import { existsSync, mkdirSync } from "fs";
import { sleep } from "./modules/helper.mjs";
import { logLevel, logger } from "./modules/logger.mjs";
import { subfinder } from "./resources/subfinder.js";
import { initiator } from "./modules/initiator.mjs";
import { scanner } from "./modules/scanner.mjs";

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
      await subfinder.run(domain).finally(() => {
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
  }

  async run() {
    for (const domain of domains) {
      initiator.domain = domain;
      initiator.estScan = 60;

      initiator.count();
      await scanner.direct();
    }
  }
}

const autoScan = new AutoScan();
(async () => {
  // Wait module to be loaded
  await sleep(1000);

  await autoScan.getSubdomains();
  await autoScan.run();
})();
