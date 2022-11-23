import { banner } from "./modules/banner.mjs";
import { initiator } from "./modules/initiator.mjs";
import { question } from "./modules/question.mjs";
import { subDomain } from "./modules/subdomain.mjs";
import { existsSync, mkdirSync } from "fs";
import { logger, logLevel } from "./modules/logger.mjs";
import { scanner } from "./modules/scanner.mjs";
import { clearTerminal } from "./modules/helper.mjs";
import { selector } from "./modules/selector.mjs";
import { show } from "./modules/show.mjs";

// Create 'result' folder
if (!existsSync("./result")) mkdirSync("./result");

(async () => {
  let answer;
  do {
    clearTerminal(false);
    initiator.checkFiles();
    initiator.count();
    banner.showBanner();

    answer = parseInt((await selector.make(banner.menu())).id.toString()) + 1;

    switch (answer) {
      // Input domain
      case 1:
        initiator.domain = await question.make("Input domain: ");
        break;
      // Input host
      case 2:
        initiator.host = await question.make("Input host: ");
        break;
      // Change max fetch concurrent
      case 3:
        logger.log(logLevel.info, "Under 64 is recommended");
        initiator.maxFetch = parseInt(await question.make("Input value: "));
        break;
      // Scan subdomain
      case 4:
        logger.log(logLevel.info, "Please take a ☕️ while we're working your mark");
        console.log(
          `${logger.wrap(logLevel.info, "Found")} : ${(await subDomain.scan(initiator.domain)).length} subdomain`
        );
        await question.make("Press enter to go back to main menu!");
        break;
      // Scan direct
      case 5:
        if (!initiator.files.subdomain) return;
        await scanner.direct();
        await question.make("Press enter to go back to main menu!");
        break;
      // Scan cdn-ssl
      case 6:
        if (!initiator.files.direct) return;
        await scanner.cdn_ssl();
        await question.make("Press enter to go back to main menu!");
        break;
      // Scan SNI
      case 7:
        if (!initiator.files.subdomain) return;
        await scanner.sni();
        await question.make("Press enter to go back to main menu!");
        break;
      // Show cdn-ssl result
      case 8:
        if (!initiator.files.cdn) return;
        let select;
        const cdns = show.cdn();

        let index = 0;
        const listPerPage = 5;
        let result: string[][] = [];
        for (const i in cdns.subDomainList) {
          if (!result[index]) result[index] = [];
          result[index].push(`${result[index].length + 1} ${cdns.subDomainList[i]}`);
          if (result[index].length >= listPerPage) {
            if (result[index - 1]) result[index].push("Prev");
            if (cdns.subDomainList[parseInt(i) + 1]) result[index].push("Next");
            result[index].push("Main Menu");
            index += 1;
          } else if (result[index].length == cdns.subDomainList.length) {
            result[index].push("Main Menu");
          } else if (!cdns.subDomainList[parseInt(i) + 1]) {
            result[index].push(...["Prev", "Main Menu"]);
          }
        }

        let page = 0;
        do {
          select = parseInt((await selector.make(result[page])).id.toString()) + 1;

          // Next page
          if (result[page + 1] && select == result[page].length - 1) {
            page += 1;
            continue;
            // Pref page
          } else if (
            (result[page - 1] && result[page + 1] && select == result[page].length - 2) ||
            (result[page - 1] && !result[page + 1] && select == result[page].length - 1)
          ) {
            page -= 1;
            continue;
            // Select domain
          } else if (select != result[page].length) {
            clearTerminal(false);
            banner.showBanner();
            const info = cdns.listDetails[listPerPage * page + select - 1];
            console.log(`${logger.wrap(logLevel.success, "Domain")} : ${info.domain}`);
            console.log(`${logger.wrap(logLevel.success, "IP")} : ${info.ip || null}`);
            console.log(`${logger.wrap(logLevel.success, "Server")} : ${info.server}`);
            console.log(`${logger.wrap(logLevel.success, "Status")} : ${info.statusCode}`);
            console.log("");
          }
        } while (select != result[page].length);
        break;
      // Exit
      case banner.numberOfMenu:
        console.log("");
        console.log("Thank you and have a nice day/night");
        break;
    }
  } while (answer != banner.numberOfMenu);
})();
