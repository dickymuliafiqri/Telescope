import fetch from "node-fetch";
import WebSocket from "ws";
import { initiator } from "./initiator.mjs";
import { readFileSync, writeFileSync } from "fs";
import { logger, logLevel } from "./logger.mjs";
import { clearTerminal, sleep } from "./helper.mjs";
import { bar } from "./progress.mjs";

// AbortController was added in node v14.17.0 globally
const AbortController = globalThis.AbortController;

interface DomainResult {
  domain: string;
  statusCode: number;
  server: string;
}

class Scanner {
  private onFetch: Array<string> = [];

  async direct() {
    let result: Array<DomainResult> = [];
    let subDomains: Array<string> = [];

    subDomains = JSON.parse(
      readFileSync(`${initiator.path}/result/${initiator.domain}/${initiator.domain}.json`).toString()
    );

    bar.start(subDomains.length, 1);
    for (const i in subDomains) {
      this.onFetch.push(subDomains[i]);
      const controller = new AbortController();
      const timeout = setTimeout(() => {
        controller.abort();
      }, 5000);

      // Fetch domain
      fetch(`https://${subDomains[i]}`, {
        method: "GET",
        signal: controller.signal,
        headers: {
          "User-Agent": initiator.user_agent,
        },
      })
        .then((res) => {
          result.push({
            domain: subDomains[i],
            statusCode: res.status,
            server: res.headers.get("server") as string,
          });
        })
        .catch((e: Error) => {
          // Error handler
        })
        .finally(() => {
          if (this.onFetch[0]) this.onFetch.shift();
          clearTimeout(timeout);
        });

      await new Promise(async (resolve) => {
        while (this.onFetch.length >= initiator.maxFetch) {
          // Wait for prefious fetch to complete
          await sleep(200);
        }

        resolve(0);
      });

      clearTerminal();
      console.log(`${logger.wrap(logLevel.info, "STATUS")} ${logger.wrap(logLevel.cloudfront, "DOMAIN")}`);
      for (const subDomain of result) {
        if (subDomain.server?.match(/cloudflare/i)) {
          console.log(
            `${logger.wrap(logLevel.cloudflare, String(subDomain.statusCode))}  ${logger.color(
              logLevel.cloudflare,
              subDomain.domain
            )}`
          );
        } else if (subDomain.server?.match(/cloudfront/i)) {
          console.log(
            `${logger.wrap(logLevel.cloudfront, String(subDomain.statusCode))}  ${logger.color(
              logLevel.cloudfront,
              subDomain.domain
            )}`
          );
        } else {
          console.log(`${logger.wrap(logLevel.none, String(subDomain.statusCode))}  ${subDomain.domain}`);
        }
      }
      if (subDomains[parseInt(i) + 1]) {
        console.log(`${logger.wrap(logLevel.cloudflare, "CFlare")} ${logger.wrap(logLevel.cloudfront, "CFront")}`);
        console.log(`${logger.wrap(logLevel.info, "SCAN")}  ${subDomains[parseInt(i) + 1]}`);
        bar.increment();
      }
    }

    // Wait for all fetch
    while (this.onFetch[0]) {
      await sleep(100);
    }
    bar.stop();

    writeFileSync(`${initiator.path}/result/${initiator.domain}/direct.json`, JSON.stringify(result, null, 2));
  }

  async cdn_ssl() {
    let result: Array<DomainResult> = [];
    const cdns = JSON.parse(readFileSync(`${initiator.path}/result/${initiator.domain}/direct.json`).toString());

    bar.start(cdns.length, 1);
    for (const i in cdns) {
      if (!cdns[i].server?.match(/^cloudf/i)) continue;
      this.onFetch.push(cdns[i].domain);

      const ws = new WebSocket(`ws://${cdns[i].domain}`, {
        method: "GET",
        headers: {
          Host: initiator.host,
          Connection: "Upgrade",
          "User-Agent": initiator.user_agent,
          Upgrade: "websocket",
        },
        handshakeTimeout: 5000,
      });

      ws.on("error", (error: Error) => {
        if (error.message.match(/Unexpected server response: \d+$/)) {
          result.push({
            ...cdns[i],
            statusCode: (error.message.match(/\d+$/) || [])[0],
          });
        }
      });

      ws.on("close", () => {
        if (this.onFetch[0]) this.onFetch.shift();
      });

      await new Promise(async (resolve) => {
        while (this.onFetch.length >= initiator.maxFetch) {
          // Wait for prefious fetch to complete
          await sleep(200);
        }

        resolve(0);
      });

      clearTerminal();
      for (const cdn of result) {
        if (cdn.server?.match(/cloudflare/i)) {
          console.log(`${logger.wrap(logLevel.cloudflare, String(cdn.statusCode))}  ${cdn.domain}`);
        } else if (cdn.server?.match(/cloudfront/i)) {
          console.log(`${logger.wrap(logLevel.cloudfront, String(cdn.statusCode))}  ${cdn.domain}`);
        } else {
          console.log(`${logger.wrap(logLevel.none, String(cdn.statusCode))}  ${cdn.domain}`);
        }
      }
      if (cdns[parseInt(i) + 1]) {
        console.log(`${logger.wrap(logLevel.cloudflare, "CFlare")} ${logger.wrap(logLevel.cloudfront, "CFront")}`);
        console.log(`${logger.wrap(logLevel.info, "SCAN")}  ${cdns[parseInt(i) + 1].domain}`);
        bar.increment();
      } else {
        bar.stop();
      }
    }

    // Wait for all fetch
    while (this.onFetch[0]) {
      await sleep(100);
    }
    bar.stop();

    writeFileSync(`${initiator.path}/result/${initiator.domain}/cdn.json`, JSON.stringify(result, null, 2));
  }

  sni() {
    logger.log(logLevel.info, "Work In Progress!");
  }
}

const scanner = new Scanner();

export { scanner };
