import { readFileSync } from "fs";
import { initiator } from "./initiator.mjs";
import { logger, logLevel } from "./logger.mjs";

class Show {
  cdn(): Array<string> {
    const subDomainList = [];
    const cdns = JSON.parse(readFileSync(`${initiator.path}/result/${initiator.domain}/cdn.json`).toString());

    for (const cdn of cdns) {
      if (cdn.server?.match(/^cloudflare/i)) {
        subDomainList.push(logger.color(logLevel.cloudflare, cdn.domain));
      } else if (cdn.server?.match(/^cloudfront/i)) {
        subDomainList.push(logger.color(logLevel.cloudfront, cdn.domain));
      } else {
        // Ignore server
        continue;
      }
    }

    subDomainList.push("Back");
    return subDomainList;
  }
}

const show = new Show();
export { show };
