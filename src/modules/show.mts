import { readFileSync } from "fs";
import { clearTerminal, pager, unchalk, writeListToTerminal } from "./helper.mjs";
import { initiator } from "./initiator.mjs";
import { logger, logLevel } from "./logger.mjs";
import { DomainResult, TlsResult } from "./scanner.mjs";
import { selector } from "./selector.mjs";
import readline from "readline";
import { benchmark } from "./benchmark.js";

interface Result extends DomainResult, TlsResult {}

class Show {
  async showResult() {
    // List result
    const result: {
      subDomainList: Array<string>;
      listDetails: Array<Result>;
    } = {
      subDomainList: [],
      listDetails: [],
    };

    // List subdomains that support sni
    (() => {
      if (!initiator.files.sni) return;
      const snis = JSON.parse(readFileSync(`${initiator.path}/result/${initiator.domain}/sni.json`).toString());

      snis.forEach((sni: { domain: string; tls: string }) => {
        const domain = logger.color(logLevel.success, sni.domain);
        result.listDetails.push({
          domain,
          server: "",
          statusCode: 0,
          tls: sni.tls,
        });

        result.subDomainList.push(domain);
      });
    })();

    // List subdomain hosted on cloudflare or cloudfront
    (() => {
      if (!initiator.files.cdn) return;
      const cdns = JSON.parse(readFileSync(`${initiator.path}/result/${initiator.domain}/cdn.json`).toString());

      for (let cdn of cdns) {
        const sni = logger.color(logLevel.success, cdn.domain);

        let domain = "";
        if (cdn.server?.match(/^cloudflare/i)) {
          domain = logger.color(logLevel.cloudflare, cdn.domain);
        } else if (cdn.server?.match(/^cloudfront/i)) {
        } else {
          domain = logger.color(logLevel.cloudfront, cdn.domain);
          // Ignore server
          continue;
        }

        if (result.subDomainList.includes(sni)) {
          for (let i = 0; i < result.listDetails.length; i++) {
            if (result.listDetails[i].domain == sni) {
              result.listDetails[i] = {
                ...result.listDetails[i],
                ...cdn,
                domain,
              };
              result.subDomainList[result.subDomainList.indexOf(sni)] = domain;
            }
          }
        } else {
          result.listDetails.push({
            ...cdn,
            domain,
          });

          result.subDomainList.push(domain);
        }
      }
    })();

    // write result to terminal
    let select = 0;
    const listPerPage = 10;
    const page = pager(result.subDomainList, listPerPage);

    let resultDetails = [
      "Result:",
      `${logger.wrap(logLevel.success, "Domain")} : `,
      `${logger.wrap(logLevel.success, "IP")} : `,
      `${logger.wrap(logLevel.success, "Server")} : `,
      `${logger.wrap(logLevel.success, "Status")} : `,
      `${logger.wrap(logLevel.success, "TLS")} : `,
      `${logger.wrap(logLevel.warning, "Latency")} :`,
      "",
    ];
    clearTerminal();

    let currPage = 0;
    do {
      writeListToTerminal(resultDetails);
      readline.cursorTo(process.stdout, 0, 8);
      select = parseInt((await selector.make(page[currPage], select - 1)).id.toString()) + 1;

      // Next page
      if (page[currPage + 1] && select == page[currPage].length - 1) {
        currPage += 1;
        continue;
        // Pref page
      } else if (
        (page[currPage - 1] && page[currPage + 1] && select == page[currPage].length - 2) ||
        (page[currPage - 1] && !page[currPage + 1] && select == page[currPage].length - 1)
      ) {
        currPage -= 1;
        continue;
        // Select domain
      } else if (select != page[currPage].length) {
        const selectedResult = listPerPage * currPage + select - 1;
        const info = result.listDetails[selectedResult];
        resultDetails = [
          "Result:",
          `${logger.wrap(logLevel.success, "Domain")} : ${info.domain}`,
          `${logger.wrap(logLevel.success, "IP")} : ${info.ip}`,
          `${logger.wrap(logLevel.success, "Server")} : ${info.server}`,
          `${logger.wrap(logLevel.success, "Status")} : ${info.statusCode}`,
          `${logger.wrap(logLevel.success, "TLS")} : ${info.tls}`,
          `${logger.wrap(logLevel.warning, "Latency")} : Connecting...`,
          "",
        ];
        writeListToTerminal(resultDetails);

        (async () => {
          let performance = "";
          if (info.server?.match(/cloudflare/i)) {
            performance = (await benchmark.cdn(unchalk(info.domain))) as string;
          } else if (info.tls?.match(/TLSv\d\.\d/)) {
            performance = (await benchmark.sni(unchalk(info.domain))) as string;
          }

          resultDetails[resultDetails.length - 2] = performance;
          writeListToTerminal(resultDetails);
          console.log("");
          select = parseInt((await selector.make(page[currPage], select - 1)).id.toString()) + 1;
        })();
        console.log("");
      }
    } while (select != page[currPage].length);
  }
}

const show = new Show();
export { show };
