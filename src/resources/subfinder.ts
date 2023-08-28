import { existsSync, mkdirSync, writeFileSync, readdirSync } from "fs";
import { sleep } from "../modules/helper.mjs";
import { initiator } from "../modules/initiator.mjs";
import { logger, logLevel } from "../modules/logger.mjs";
import url from "url";

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

  addFinder(finder: Function) {
    this.subfinder.push(finder);
  }

  load() {
    const subFinderPath = `${initiator.path}/app/resources/subfinder`;
    const subFinderList = readdirSync(subFinderPath);

    for (let i = 0; i < subFinderList.length; i++) {
      import(url.pathToFileURL(`${subFinderPath}/${subFinderList[i]}`).href);
    }
  }

  async run(domain?: string): Promise<number> {
    let finalResult: Array<FinderResult> = [];

    const onRun: Array<number> = [];
    const fetchResult: Array<Result> = [];

    logger.log(logLevel.info, `Scanning ${domain ?? initiator.domain} ...`);
    for (const finder of this.subfinder) {
      onRun.push(1);

      const controller = new globalThis.AbortController();
      const timeout = setTimeout(() => {
        controller.abort();
      }, 120000);

      finder(domain ?? initiator.domain, controller.signal)
        .then((res: Result) => {
          if (res.error) {
            console.log(
              `${logger.wrap(logLevel.error, res.subfinder)} : ${res.message}`
            );
          } else if (res.result) {
            fetchResult.push(res);
          }
        })
        .finally(() => {
          clearTimeout(timeout);
          if (onRun[0]) onRun.shift();
        });

      // Print error message from subfinder

      while (onRun.length >= 3) {
        // Wait for previous finder
        await sleep(1000);
      }

      await sleep(200);
    }

    let loop = 0;
    do {
      if (loop >= 120) break;
      loop++;
      await sleep(1000);
    } while (onRun[0]);

    for (const result of fetchResult) {
      if (result.error) continue;

      finalResult.push(...finalResult, ...result.result);
    }

    finalResult = this.filter(finalResult);
    this.saveResult(finalResult, domain);

    return finalResult.length;
  }

  private filter(result: Array<FinderResult>): Array<FinderResult> {
    logger.log(logLevel.info, "Filtering result ...");
    // Filter \n
    for (const i in result) {
      const subDomain = result[i].domain;
      if (subDomain.match(/\n/)) {
        const subsubDomain = subDomain.split("\n");

        for (let y = 1; y < subsubDomain.length; y++) {
          result.push({
            domain: subsubDomain[y],
            ip: "",
          });
        }

        result[i].domain = subsubDomain[0];
      }
    }

    // filter *
    for (const i in result) {
      const subDomain = result[i].domain;
      if (subDomain.startsWith("*")) {
        delete result[i];
      }
    }

    // filter duplicate
    for (const i in result) {
      const subDomain = result[i].domain;
      for (const y in result) {
        if (subDomain == result[y].domain && i != y) {
          if (result[y]?.ip) {
            delete result[i];
          } else if (result[i]?.ip) {
            delete result[y];
          } else {
            delete result[i];
          }
        }
      }
    }

    // Delete orphans and re-asign filtered result
    const temp_result: Array<FinderResult> = [];
    for (const subDomain of result) {
      if (subDomain?.domain || subDomain?.ip) {
        temp_result.push(subDomain);
      }
    }

    return temp_result;
  }

  private saveResult(result: Array<FinderResult>, domain?: string) {
    const savePath = `${initiator.path}/result/${domain ?? initiator.domain}`;
    if (!existsSync(`${savePath}`)) mkdirSync(`${savePath}`);

    writeFileSync(
      `${savePath}/subdomain.json`,
      JSON.stringify(result, null, 2)
    );
  }
}

const subfinder = new SubFinder();
export { subfinder };
