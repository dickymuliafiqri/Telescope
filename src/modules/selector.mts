import cliSelect from "cli-select";
import { logger, logLevel } from "./logger.mjs";

class Selector {
  async make(values: Array<string>) {
    const options = await cliSelect({
      values,
      selected: logger.color(logLevel.cloudfront, "▸"),
      unselected: " ",
      valueRenderer: (value, selected) => {
        if (selected) {
          return logger.color(logLevel.cloudfront, value);
        }

        return value;
      },
    });

    return options;
  }
}

const selector = new Selector();
export { selector };
