import { initiator } from "./initiator.mjs";
import { logger, logLevel } from "./logger.mjs";

class Banner {
  numberOfMenu = 0;

  showBanner() {
    let banner = `
o-O-o o--o o    o--o  o-o    o-o  o-o  o--o  o--o 
  |   |    |    |    |      /    o   o |   | |    
  |   O-o  |    O-o   o-o  O     |   | O--o  O-o  
  |   |    |    |        |  \\    o   o |     |    
  o   o--o O---oo--o o--o    o-o  o-o  o     o--o
    Simple tool to scan and find domain's bug
        made with 💩 by ${initiator.author}

${initiator.domain ? logger.wrap(logLevel.success, "Domain") : logger.wrap(logLevel.warning, "Domain")} : ${
      initiator.domain
    }
${initiator.host ? logger.wrap(logLevel.success, "Host") : logger.wrap(logLevel.warning, "Host")} : ${initiator.host}


${this.menu()}`;

    console.log(banner);
  }

  private menu(): string {
    let menu = ["Input domain", "Input host", "Scan subdomain", "Scan direct", "Scan cdn-ssl", "Scan SNI", "Exit"];
    for (const i in menu) {
      menu[i] = `${parseInt(i) + 1}. ${menu[i]}`;
    }

    this.numberOfMenu = menu.length;
    return menu.join("\n");
  }
}

const banner = new Banner();
export { banner };
