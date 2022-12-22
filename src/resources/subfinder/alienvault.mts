/**
 * by dickymuliafiqri
 * 24112022
 *
 * Credit:
 * alienvault.com to enum subdomains
 */

import fetch from "node-fetch";
import { logger, logLevel } from "../../modules/logger.mjs";
import { subfinder, Result, FinderResult } from "../subfinder.js";

interface AlienObject {
  address: string;
  first: string;
  last: string;
  hostname: string;
  record_type: string;
  indicator_link: string;
  flag_url: string;
  flag_title: string;
  asset_type: string;
  asn: string;
}

async function alienvault(domain: string, timeout: AbortSignal): Promise<Result> {
  const subfinder = "alnvlt"; // Must not greater than 8 char
  let result: Array<FinderResult> = [];
  let res: Array<AlienObject> = [];

  try {
    const req = await fetch(`https://otx.alienvault.com/api/v1/indicators/domain/${domain}/passive_dns`, {
      method: "GET",
      signal: timeout,
    });

    if (req.status != 200) throw new Error(req.statusText);
    res = JSON.parse(await req.text()).passive_dns;
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

  console.log(`${logger.wrap(logLevel.success, subfinder)} : ${result.length}`);
  return {
    subfinder,
    error: false,
    result,
  };
}

subfinder.addFinder(alienvault);
