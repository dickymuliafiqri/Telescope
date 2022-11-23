import { readFileSync } from "fs";
import { initiator } from "./initiator.mjs";
import { logger, logLevel } from "./logger.mjs";
import { DomainResult } from "./scanner.mjs";

class Show {
  cdn(): {
    subDomainList: Array<string>;
    listDetails: Array<DomainResult>;
  } {
    const result: {
      subDomainList: Array<string>;
      listDetails: Array<DomainResult>;
    } = {
      subDomainList: [],
      listDetails: [],
    };
    const cdns = JSON.parse(readFileSync(`${initiator.path}/result/${initiator.domain}/cdn.json`).toString());

    for (const cdn of cdns) {
      let domain = "";
      if (cdn.server?.match(/^cloudflare/i)) {
        domain = logger.color(logLevel.cloudflare, cdn.domain);
      } else if (cdn.server?.match(/^cloudfront/i)) {
      } else {
        domain = logger.color(logLevel.cloudfront, cdn.domain);
        // Ignore server
        continue;
      }

      result.listDetails.push({
        ...cdn,
        domain,
      });
      result.subDomainList.push(domain);
    }

    return result;
  }
}

const show = new Show();
export { show };
