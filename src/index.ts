import { banner } from "./modules/banner.mjs";
import { initiator } from "./modules/initiator.mjs";
import { question } from "./modules/question.mjs";
import { subDomain } from "./modules/subdomain.mjs";
import { existsSync, mkdirSync } from "fs";
import { logger, logLevel } from "./modules/logger.mjs";
import { scanner } from "./modules/scanner.mjs";
import { clearTerminal, writeListToTerminal, pager } from "./modules/helper.mjs";
import { selector } from "./modules/selector.mjs";
import { show } from "./modules/show.mjs";

// Create 'result' folder
if (!existsSync("./result")) mkdirSync("./result");

(async () => {
  let answer = 0;
  do {
    clearTerminal(false);
    initiator.checkFiles();
    initiator.count();
    banner.showBanner();

    answer = parseInt((await selector.make(banner.menu(), answer - 1)).id.toString()) + 1;

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
        logger.log(logLevel.info, "Change estimation time (in second)");
        logger.log(logLevel.info, "Under 30 is recommended");
        initiator.estScan = parseInt(await question.make(" Input value: "));
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
        if (!initiator.files.cdn && !initiator.files.sni) return;
        await show.showResult();
        break;
      // Exit
      case banner.numberOfMenu:
        console.log("");
        console.log("Thank you and have a nice day/night");
        break;
    }
  } while (answer != banner.numberOfMenu);
})();
