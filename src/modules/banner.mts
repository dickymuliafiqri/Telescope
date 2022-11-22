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
${logger.wrap(logLevel.success, "Fetch")} : ${initiator.maxFetch}
${logger.wrap(logLevel.cloudflare, "CFlare")} : ${initiator.cdn.cflare}
${logger.wrap(logLevel.cloudfront, "CFront")} : ${initiator.cdn.cfront}


${this.menu()}`;

    console.log(banner);
  }

  private menu(): string {
    const _menu = [
      {
        name: "Domain",
        value: "Input domain",
        show: true,
      },
      {
        name: "Host",
        value: "Input host",
        show: true,
      },
      {
        name: "Fetch",
        value: "Change max fetch concurrent",
        show: true,
      },
      {
        name: "SubDomain",
        value: "Scan subdomain",
        show: true,
      },
      {
        name: "Direct",
        value: "Scan direct",
        show: initiator.files.subdomain,
      },
      {
        name: "CDN",
        value: "Scan cdn-ssl",
        show: initiator.files.direct,
      },
      {
        name: "SNI",
        value: "Scan SNI",
        show: initiator.files.subdomain,
      },
      {
        name: "Exit",
        value: "Exit",
        show: true,
      },
    ];

    const menu = [];
    for (const i in _menu) {
      if (!_menu[i].show) {
        continue;
      }

      menu.push(`${parseInt(i) + 1}. ${_menu[i].value}`);
    }

    this.numberOfMenu = _menu.length;
    return menu.join("\n");
  }
}

const banner = new Banner();
export { banner };
