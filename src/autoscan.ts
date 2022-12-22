import { subfinder } from "./resources/subfinder.js";

const domains = ["com", "co.id", "ac.id", "go.id", "id"];

subfinder.load();
(async () => {
  for (const domain of domains) {
    await subfinder.deepRun(domain);
  }
})();
