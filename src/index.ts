import { banner } from "./modules/banner.mjs";
import { initiator } from "./modules/initiator.mjs";
import { question } from "./modules/question.mjs";
import { existsSync, mkdirSync } from "fs";
import { logger, logLevel } from "./modules/logger.mjs";
import { scanner } from "./modules/scanner.mjs";
import { clearTerminal } from "./modules/helper.mjs";
import { selector } from "./modules/selector.mjs";
import { show } from "./modules/show.mjs";
import { subfinder } from "./resources/subfinder.js";
import { exit } from "process";

// Create 'result' folder
if (!existsSync("./result")) mkdirSync("./result");
subfinder.load();

(async () => {
  let selectedIndex = 0;
  let indexValue = "";
  let answer;
  while (true) {
    clearTerminal(false);
    initiator.checkFiles();
    initiator.count();
    banner.showBanner();

    answer = await selector.make(banner.menu(), selectedIndex - 1);
    selectedIndex = parseInt(answer.id.toString()) + 1;
    indexValue = answer.value;

    switch (indexValue) {
      // Input domain
      case "Input domain":
        initiator.domain = await question.make("Input domain: ");
        break;
      // Input host
      case "Input host":
        initiator.host = await question.make("Input host: ");
        break;
      // Change max fetch concurrent
      case "Change est. scan":
        logger.log(logLevel.info, "Change estimation time (in second)");
        logger.log(logLevel.info, "Under 30 is recommended");
        initiator.estScan = parseInt(await question.make(" Input value: "));
        break;
      // Scan subdomain
      case "Scan subdomain":
        logger.log(logLevel.info, "Please take a ☕️ while we're working your mark");
        console.log(`${logger.wrap(logLevel.info, "Total")} : ${await subfinder.run()} subdomain`);
        await question.make("Press enter to go back to main menu!");
        break;
      // Scan direct
      case "Scan direct":
        if (!initiator.files.subdomain) return;
        await scanner.direct();
        await question.make("Press enter to go back to main menu!");
        break;
      // Scan cdn-ssl
      case "Scan cdn-ssl":
        if (!initiator.files.direct) return;
        await scanner.cdn_ssl();
        await question.make("Press enter to go back to main menu!");
        break;
      // Scan SNI
      case "Scan SNI":
        if (!initiator.files.subdomain) return;
        await scanner.sni();
        await question.make("Press enter to go back to main menu!");
        break;
      // Show cdn-ssl result
      case "Show result":
        if (!initiator.files.cdn && !initiator.files.sni) return;
        await show.showResult();
        break;
      // Exit
      case "Exit":
        console.log("");
        console.log("Thank you and have a nice day/night");
        exit(0);
    }
  }
})();
