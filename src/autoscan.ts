import { existsSync, mkdirSync, readFileSync, writeFileSync } from "fs";
import { sleep } from "./modules/helper.mjs";
import { logLevel, logger } from "./modules/logger.mjs";
import { subfinder } from "./resources/subfinder.js";
import { initiator } from "./modules/initiator.mjs";
import { FinderResult } from "./resources/subfinder.js";
import { DomainResult } from "./modules/scanner.mjs";
import fetch from "node-fetch";

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

      let isStuck = 120;
      if (onRun.length > 3) {
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
      const result: DomainResult[] = [];
      const subdomains: FinderResult[] = JSON.parse(readFileSync(`./result/${domain}/subdomain.json`).toString());

      const onFetch: string[] = [];
      for (const subdomain of subdomains) {
        const controller = new AbortController();
        const timeout = setTimeout(() => {
          controller.abort();
        }, 3000);

        let url = subdomain.domain || subdomain.ip;
        if (url.match("@")) url = url.replace(/^.+@/i, "");
        onFetch.push(url);
        fetch(`https://${url}`, {
          method: "GET",
          signal: controller.signal,
          headers: {
            "User-Agent": initiator.user_agent,
          },
        })
          .then((res) => {
            clearTimeout(timeout);

            if (res.status != 200) throw new Error(res.statusText);

            let server = res.headers.get("server");
            if (server) server = server.match(/^(\w+)/i)?.[1] ?? null;
            if (server) {
              if (server.match(/cloud(front|flare)/i)) {
                result.push({
                  ...subdomain,
                  domain: url,
                  server: server.toLowerCase(),
                  statusCode: res.status,
                });

                logger.log(logLevel.success, `${url} -> [${server}]`);
              }
            }
          })
          .catch((e: Error) => {
            logger.log(logLevel.error, `${url} -> [${e.message}]`);
          })
          .finally(() => {
            onFetch.shift();
          });

        let isStuck = 30;
        while (onFetch.length > 60) {
          --isStuck;
          await sleep(1000);

          if (isStuck <= 0) {
            while (onFetch[0]) {
              onFetch.shift();
            }
            break;
          }
        }
      }
      let isStuck = 30;
      while (onFetch.length > 1) {
        --isStuck;
        await sleep(1000);

        if (isStuck <= 0) {
          while (onFetch[0]) {
            onFetch.shift();
          }
          break;
        }
      }

      writeFileSync(`./result/${domain}/direct.json`, JSON.stringify(result, null, 2));
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
