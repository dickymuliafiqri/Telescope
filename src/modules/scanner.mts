import fetch from "node-fetch";
import WebSocket from "ws";
import { initiator } from "./initiator.mjs";
import { readFileSync, writeFileSync } from "fs";
import { logger, logLevel } from "./logger.mjs";
import { clearTerminal } from "./helper.js";
import { bar } from "./progress.mjs";

// AbortController was added in node v14.17.0 globally
const AbortController = globalThis.AbortController;

class Scanner {
  async direct() {
    let result = [];

    const subDomains = JSON.parse(
      readFileSync(`${initiator.path}/result/${initiator.domain}/${initiator.domain}.json`) as unknown as string
    );

    bar.start(subDomains.length, 1);
    for (const i in subDomains) {
      const controller = new AbortController();
      const timeout = setTimeout(() => {
        controller.abort();
      }, 3000);
      try {
        const res = await fetch(`https://${subDomains[i]}`, {
          method: "GET",
          signal: controller.signal,
          headers: {
            "User-Agent": initiator.user_agent,
          },
        });

        result.push({
          domain: subDomains[i],
          statusCode: res.status,
          server: res.headers.get("server"),
        });
      } catch (e) {
      } finally {
        clearTerminal();
        for (const subDomain of result) {
          if (subDomain.server?.match(/cloudflare/i)) {
            console.log(`${logger.wrap(logLevel.cloudflare, String(subDomain.statusCode))}  ${subDomain.domain}`);
          } else if (subDomain.server?.match(/cloudfront/i)) {
            console.log(`${logger.wrap(logLevel.cloudfront, String(subDomain.statusCode))}  ${subDomain.domain}`);
          } else {
            console.log(`${logger.wrap(logLevel.none, String(subDomain.statusCode))}  ${subDomain.domain}`);
          }
        }
        if (subDomains[parseInt(i) + 1]) {
          console.log(`${logger.wrap(logLevel.cloudflare, "CFlare")} ${logger.wrap(logLevel.cloudfront, "CFront")}`);
          console.log(`${logger.wrap(logLevel.info, "SCAN")}  ${subDomains[parseInt(i) + 1]}`);
          bar.increment();
        } else {
          bar.stop();
        }
        clearTimeout(timeout);
      }
    }

    writeFileSync(`${initiator.path}/result/${initiator.domain}/direct.json`, JSON.stringify(result, null, 2));
  }

  async cdn_ssl() {
    let result: Array<{
      domain: string;
      statusCode: number;
      server: string;
    }> = [];

    const cdns = JSON.parse(
      readFileSync(`${initiator.path}/result/${initiator.domain}/direct.json`) as unknown as string
    );

    bar.start(cdns.length, 1);
    for (const i in cdns) {
      if (!cdns[i].server?.match(/^cloudf/i)) continue;

      const ws = new WebSocket(`ws://${cdns[i].domain}`, {
        method: "GET",
        headers: {
          Host: initiator.host,
          Connection: "Upgrade",
          "User-Agent": initiator.user_agent,
          Upgrade: "websocket",
        },
        handshakeTimeout: 3000,
      });

      await new Promise((resolve, reject) => {
        ws.on("error", (error: Error) => {
          console.log(error);
          if (error.message.match(/Unexpected server response: \d+$/)) {
            result.push({
              ...cdns[i],
              statusCode: (error.message.match(/\d+$/) || [])[0],
            });
          }

          resolve(0);
        });

        ws.on("close", () => resolve(0));
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

    writeFileSync(`${initiator.path}/result/${initiator.domain}/cdn.json`, JSON.stringify(result, null, 2));
  }

  sni() {
    logger.log(logLevel.info, "Work In Progress!");
  }
}

const scanner = new Scanner();

export { scanner };
