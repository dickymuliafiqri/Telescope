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

    if (tag.length > 10) throw logger.log(logLevel.error, "Only 8 character accepted!");
    for (let i = 1; i < 10; i++) {
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
        result = `${chalk.blueBright.bold(this.tagMaker("INFO"))} : ${text}`;
        break;
      case logLevel.warning:
        result = `${chalk.yellowBright.bold(this.tagMaker("WARNING"))} : ${text}`;
        break;
      case logLevel.error:
        result = `${chalk.redBright.bold(this.tagMaker("ERROR"))} : ${text}`;
        break;
      case logLevel.success:
        result = `${chalk.greenBright.bold(this.tagMaker("SUCCESS"))} : ${text}`;
        break;
    }

    console.log(result);
  }

  wrap(level: logLevel, tag: string) {
    let result;
    switch (level) {
      case logLevel.info:
        result = chalk.blueBright.bold(this.tagMaker(tag));
        break;
      case logLevel.warning:
        result = chalk.yellowBright.bold(this.tagMaker(tag));
        break;
      case logLevel.error:
        result = chalk.redBright.bold(this.tagMaker(tag));
        break;
      case logLevel.success:
        result = chalk.greenBright.bold(this.tagMaker(tag));
        break;
      case logLevel.cloudflare:
        result = chalk.rgb(255, 135, 0).bold(this.tagMaker(tag));
        break;
      case logLevel.cloudfront:
        result = chalk.rgb(41, 134, 204).bold(this.tagMaker(tag));
        break;
      case logLevel.none:
        result = this.tagMaker(tag);
        break;
    }

    return result;
  }

  color(level: logLevel, text: string) {
    let result;
    switch (level) {
      case logLevel.info:
        result = chalk.blueBright.bold(text);
        break;
      case logLevel.warning:
        result = chalk.yellowBright.bold(text);
        break;
      case logLevel.error:
        result = chalk.redBright.bold(text);
        break;
      case logLevel.success:
        result = chalk.greenBright.bold(text);
        break;
      case logLevel.cloudflare:
        result = chalk.rgb(255, 135, 0).bold(text);
        break;
      case logLevel.cloudfront:
        result = chalk.rgb(41, 134, 204).bold(text);
        break;
      case logLevel.none:
        result = this.tagMaker(text);
        break;
    }

    return result;
  }
}

const logger = new Logger();

export { logger, logLevel };
