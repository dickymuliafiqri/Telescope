import { existsSync, mkdirSync, writeFileSync, readdirSync } from "fs";
import { sleep } from "../modules/helper.mjs";
import { initiator } from "../modules/initiator.mjs";
import { logger, logLevel } from "../modules/logger.mjs";

export interface FinderResult {
  domain: string;
  ip: string;
}

export interface Result {
  subfinder: string;
  error: boolean;
  message?: string;
  result: Array<FinderResult>;
}

class SubFinder {
  private subfinder: Array<Function> = [];
  private result: Array<FinderResult> = [];

  addFinder(finder: Function) {
    this.subfinder.push(finder);
  }

  load() {
    const subFinderPath = `${initiator.path}/app/resources/subfinder`;
    const subFinderList = readdirSync(subFinderPath);

    for (let i = 0; i < subFinderList.length; i++) {
      import(`${subFinderPath}/${subFinderList[i]}`);
    }
  }

  async run(): Promise<number> {
    const onRun = [];

    for (const finder of this.subfinder) {
      onRun.push(1);
      const res: Result = await finder(initiator.domain);

      // Print error message from subfinder
      if (res.error) {
        console.log(`${logger.wrap(logLevel.error, res.subfinder)} : ${res.message}`);
        continue;
      }

      while (onRun.length >= 3) {
        // Wait for previous finder
        await sleep(1000);
      }

      this.result.push(...this.result, ...res.result);
      sleep(200);
    }

    this.filter();
    this.saveResult();

    return this.result.length;
  }

  private filter() {
    // Filter \n
    for (const i in this.result) {
      const subDomain = this.result[i].domain;
      if (subDomain.match(/\n/)) {
        const subsubDomain = subDomain.split("\n");

        for (let y = 1; y < subsubDomain.length; y++) {
          this.result.push({
            domain: subsubDomain[y],
            ip: "",
          });
        }

        this.result[i].domain = subsubDomain[0];
      }
    }

    // filter *
    for (const i in this.result) {
      const subDomain = this.result[i].domain;
      if (subDomain.startsWith("*")) {
        delete this.result[i];
      }
    }

    // filter duplicate
    for (const i in this.result) {
      const subDomain = this.result[i].domain;
      for (const y in this.result) {
        if (subDomain == this.result[y].domain && i != y) {
          if (this.result[y]?.ip) {
            delete this.result[i];
          } else if (this.result[i]?.ip) {
            delete this.result[y];
          } else {
            delete this.result[i];
          }
        }
      }
    }

    // Delete orphans and re-asign filtered result
    const temp_result: Array<FinderResult> = [];
    for (const subDomain of this.result) {
      if (subDomain?.domain || subDomain?.ip) {
        temp_result.push(subDomain);
      }
    }

    this.result = temp_result;
  }

  private saveResult() {
    const savePath = `${initiator.path}/result/${initiator.domain}`;
    if (!existsSync(`${savePath}`)) mkdirSync(`${savePath}`);

    writeFileSync(`${savePath}/subdomain.json`, JSON.stringify(this.result, null, 2));
  }
}

const subfinder = new SubFinder();
export { subfinder };
