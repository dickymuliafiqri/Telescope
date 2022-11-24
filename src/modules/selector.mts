import cliSelect from "cli-select-2";
import { logger, logLevel } from "./logger.mjs";

class Selector {
  async make(values: Array<string>, defaultSelected: number = 0) {
    if (defaultSelected <= 0) defaultSelected = 0;
    const options = await cliSelect({
      values,
      selected: logger.color(logLevel.cloudfront, "▸"),
      unselected: " ",
      defaultValue: values?.length > defaultSelected ? defaultSelected : 0,
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
