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
    initiator.countCdn();
    banner.showBanner();

    answer = parseInt((await selector.make(banner.menu())).id.toString()) + 1;

    switch (answer) {
      case 1:
        initiator.domain = await question.make("Input domain: ");
        break;
      case 2:
        initiator.host = await question.make("Input host: ");
        break;
      case 3:
        logger.log(logLevel.info, "Under 64 is recommended");
        initiator.maxFetch = parseInt(await question.make("Input value: "));
        break;
      case 4:
        logger.log(logLevel.info, "Please take a ☕️ while we're working your mark");
        console.log(
          `${logger.wrap(logLevel.info, "Found")} : ${(await subDomain.scan(initiator.domain)).length} subdomain`
        );
        await question.make("Press enter to go back to main menu!");
        break;
      case 5:
        await scanner.direct();
        await question.make("Press enter to go back to main menu!");
        break;
      case 6:
        await scanner.cdn_ssl();
        await question.make("Press enter to go back to main menu!");
        break;
      case 7:
        await scanner.sni();
        await question.make("Press enter to go back to main menu!");
        break;
      case 8:
        let select;
        const cdns = show.cdn();
        do {
          select = parseInt((await selector.make(cdns)).id.toString()) + 1;
        } while (select != cdns.length);
      case banner.numberOfMenu:
        console.log("");
        console.log("Thank you and have a nice day/night");
    }
  } while (answer != banner.numberOfMenu);
})();
