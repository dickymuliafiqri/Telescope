import fetch from "node-fetch";
import { writeFileSync, mkdirSync, existsSync } from "fs";
import { logger, logLevel } from "./logger.mjs";
import { initiator } from "./initiator.mjs";

interface crtObject {
  issuer_ca_id: number;
  issuer_name: string;
  common_name: string;
  name_value: string;
  id: number;
  entry_timestamp: string;
  not_before: string;
  not_after: string;
  serial_number: string;
}

class SubDomain {
  // Fetch to crt.sh to enum subdomains
  private async fetch(domain: string): Promise<Array<crtObject>> {
    const req = await fetch(`http://crt.sh/?q=${domain}&output=json`, {
      method: "GET",
    });

    try {
      if (req.status != 200) throw new Error(req.statusText);

      return JSON.parse(await req.text());
    } catch (e: any) {
      logger.log(logLevel.error, e.message);

      // Return empty array
      return [];
    }
  }

  async scan(domain: string): Promise<Array<string>> {
    const result = await this.fetch(domain);
    const subDomains: Array<string> = [];

    for (const subDomain of result) {
      if (subDomains.includes(subDomain.name_value)) continue;

      if (subDomain.name_value.match(/\n/)) {
        const subSubDomain = subDomain.name_value.split("\n");

        for (const i in subSubDomain) {
          if (subDomains.includes(subSubDomain[i])) continue;
          if (subSubDomain[i].startsWith("*")) continue;
          subDomains.push(subSubDomain[i]);
        }
      } else {
        if (subDomain.name_value.startsWith("*")) continue;
        subDomains.push(subDomain.name_value);
      }
    }

    this.writeResult(domain, subDomains);
    return subDomains;
  }

  private writeResult(name: string, data: any) {
    const path: string = `${initiator.path}/result/${name}`;
    if (!existsSync(path)) mkdirSync(path);
    writeFileSync(`${path}/${name}.json`, JSON.stringify(data, null, 2));
  }
}

const subDomain = new SubDomain();

export { subDomain };
