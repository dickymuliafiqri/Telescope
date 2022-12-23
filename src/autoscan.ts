import { subfinder } from "./resources/subfinder.js";

const domains = [
  "academia.edu",
  "skillacademi.com",
  //   "microsoft.com",
  //   "spotify.com",
  //   "joox.com",
  //   "kno2fy.com",
  //   "onlymega.com",
  //   "google.com",
  //   "line.me",
  //   "midtrans.com",
  //   "digicert.com",
  //   "millionaireaisle.com",
  //   "skolla.online",
  //   "udemy.com",
  //   "zoom.us",
  //   "ac.id",
];

subfinder.load();
(async () => {
  for (const domain of domains) {
    await subfinder.deepRun(domain);
  }
})();
