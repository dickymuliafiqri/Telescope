import { banner } from "./modules/banner.mjs";
import { initiator } from "./modules/initiator.mjs";
import { question } from "./modules/question.mjs";
import { subDomain } from "./modules/subdomain.mjs";
import { existsSync, mkdirSync } from "fs";
import { logger, logLevel } from "./modules/logger.mjs";
import { scanner } from "./modules/scanner.mjs";
import { clearTerminal } from "./modules/helper.mjs";

// Create 'result' folder
if (!existsSync("./result")) mkdirSync("./result");

(async () => {
  let answer: number;
  do {
    clearTerminal();
    initiator.checkFiles();
    initiator.countCdn();
    banner.showBanner();
    answer = parseInt(await question.make("Select: "));

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
        console.log(JSON.stringify(await subDomain.scan(initiator.domain), null, 2));
        await question.make("Press enter to go back to main menu!");
        break;
      case 5:
        if (!initiator.files.subdomain) break;
        await scanner.direct();
        await question.make("Press enter to go back to main menu!");
        break;
      case 6:
        if (!initiator.files.direct) break;
        await scanner.cdn_ssl();
        await question.make("Press enter to go back to main menu!");
        break;
      case 7:
        if (!initiator.files.subdomain) break;
        await scanner.sni();
        await question.make("Press enter to go back to main menu!");
        break;
    }
  } while (answer != banner.numberOfMenu);
})();
