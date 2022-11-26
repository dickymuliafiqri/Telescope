/**
 * by dickymuliafiqri
 * 26112022
 *
 * Credit:
 * hackertarget.com to enum subdomains
 */

import fetch from "node-fetch";
import { logger, logLevel } from "../../modules/logger.mjs";
import { subfinder, Result, FinderResult } from "../subfinder.js";

interface HackerObject {
  hostname: string;
  address: string;
}

async function alienvault(domain: string, timeout: AbortSignal): Promise<Result> {
  const subfinder = "hkrtrgt"; // Must not greater than 8 char
  let result: Array<FinderResult> = [];
  let res: Array<HackerObject> = [];

  try {
    const req = await fetch(`https://api.hackertarget.com/hostsearch/?q=${domain}`, {
      method: "GET",
      signal: timeout,
    });

    if (req.status != 200) throw new Error(req.statusText);

    for (const subdomain of (await req.text()).split("\n")) {
      const [hostname, address] = subdomain.split(",");

      res.push({
        hostname,
        address,
      });
    }
  } catch (e: any) {
    // Return empty array
    return {
      subfinder,
      error: true,
      message: e.message,
      result: [],
    };
  }

  for (const data of res) {
    result.push({
      domain: data.hostname,
      ip: data.address,
    });
  }

  console.log(`${logger.wrap(logLevel.info, subfinder)} : ${result.length}`);
  return {
    subfinder,
    error: false,
    result,
  };
}

subfinder.addFinder(alienvault);
