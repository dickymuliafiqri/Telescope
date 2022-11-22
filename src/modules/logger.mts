import chalk from "chalk";

enum logLevel {
  info = "INFO",
  warning = "WARNING",
  error = "ERROR",
  success = "SUCCESS",
  cloudflare = "CFlare",
  cloudfront = "CFront",
  none = "NONE",
}

class Logger {
  private tagMaker(tag: string): string {
    let result: Array<string> = [" "];

    if (tag.length > 8) throw logger.log(logLevel.error, "Only 6 character accepted!");
    for (let i = 1; i < 8; i++) {
      if (tag[i - 1]) {
        result[i] = tag[i - 1];
        continue;
      } else {
        result[i] = " ";
      }
    }

    return result.join("");
  }

  log(level: logLevel, text: string) {
    let result;
    switch (level) {
      case logLevel.info:
        result = `${chalk.white.bgBlue.bold(this.tagMaker("INFO"))} ${text}`;
        break;
      case logLevel.warning:
        result = `${chalk.black.bgYellowBright.bold(this.tagMaker("WARNING"))} ${text}`;
        break;
      case logLevel.error:
        result = `${chalk.black.bgRedBright.bold(this.tagMaker("ERROR"))} ${text}`;
        break;
      case logLevel.success:
        result = `${chalk.black.bgGreenBright.bold(this.tagMaker("SUCCESS"))} ${text}`;
        break;
    }

    console.log(result);
  }

  wrap(level: logLevel, tag: string) {
    let result;
    switch (level) {
      case logLevel.info:
        result = chalk.white.bgBlue.bold(this.tagMaker(tag));
        break;
      case logLevel.warning:
        result = chalk.black.bgYellowBright.bold(this.tagMaker(tag));
        break;
      case logLevel.error:
        result = chalk.black.bgRedBright.bold(this.tagMaker(tag));
        break;
      case logLevel.success:
        result = chalk.black.bgGreenBright.bold(this.tagMaker(tag));
        break;
      case logLevel.cloudflare:
        result = chalk.black.bgRgb(255, 135, 0).bold(this.tagMaker(tag));
        break;
      case logLevel.cloudfront:
        result = chalk.black.bgRgb(41, 134, 204).bold(this.tagMaker(tag));
        break;
      case logLevel.none:
        result = this.tagMaker(tag);
        break;
    }

    return result;
  }
}

const logger = new Logger();

export { logger, logLevel };
