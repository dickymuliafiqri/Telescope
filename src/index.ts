import { banner } from "./modules/banner.mjs";
import { initiator } from "./modules/initiator.mjs";
import { question } from "./modules/question.mjs";
import { subDomain } from "./modules/subdomain.mjs";
import { existsSync, mkdirSync } from "fs";
import { logger, logLevel } from "./modules/logger.mjs";
import { scanner } from "./modules/scanner.mjs";
import { clearTerminal } from "./modules/helper.js";

// Create 'result' folder
if (!existsSync("./result")) mkdirSync("./result");

(async () => {
  let answer: number;
  do {
    clearTerminal();
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
        logger.log(logLevel.info, "Please take a coffee while we're working your mark ☕️");
        console.log(JSON.stringify(await subDomain.scan(initiator.domain), null, 2));
        await question.make("Press enter to go back to main menu!");
        break;
      case 4:
        await scanner.direct();
        await question.make("Press enter to go back to main menu!");
        break;
      case 5:
        await scanner.cdn_ssl();
        await question.make("Press enter to go back to main menu!");
        break;
      case 6:
        await scanner.sni();
        await question.make("Press enter to go back to main menu!");
        break;
    }
  } while (answer != banner.numberOfMenu);
})();
