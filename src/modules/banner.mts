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

${initiator.domain ? logger.wrap(logLevel.success, "Domain") : logger.wrap(logLevel.error, "Domain")} : ${
      initiator.domain
    }
${initiator.subdomain ? logger.wrap(logLevel.success, " ➥ Sub") : logger.wrap(logLevel.error, " ➥ Sub")} : ${
      initiator.subdomain
    }
${initiator.host ? logger.wrap(logLevel.success, "Host") : logger.wrap(logLevel.warning, "Host")} : ${initiator.host}
${logger.wrap(logLevel.success, "Fetch")} : ${initiator.maxFetch}
${logger.wrap(logLevel.cloudflare, "CFlare")} : ${initiator.cdn.cflare}
${logger.wrap(logLevel.cloudfront, "CFront")} : ${initiator.cdn.cfront}
`;

    console.log(banner);
  }

  menu(): Array<string> {
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
        name: "Show Result",
        value: "Show Result",
        show: initiator.files.cdn || initiator.files.sni,
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

      menu.push(_menu[i].value);
    }

    this.numberOfMenu = menu.length;
    return menu;
  }
}

const banner = new Banner();
export { banner };
