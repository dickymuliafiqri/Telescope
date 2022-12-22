/**
 * by dickymuliafiqri
 * 23122022
 *
 * Credit:
 * jonlu.ca to enum subdomains
 */

import fetch from "node-fetch";
import { logger, logLevel } from "../../modules/logger.mjs";
import { subfinder, Result, FinderResult } from "../subfinder.js";

async function jonlu(domain: string, timeout: AbortSignal): Promise<Result> {
  const subfinder = "jnlu"; // Must not greater than 8 char
  let result: Array<FinderResult> = [];
  let res: Array<string> = [];

  try {
    const req = await fetch(`https://jonlu.ca/anubis/subdomains/${domain}`, {
      method: "GET",
      signal: timeout,
    });

    if (req.status != 200) throw new Error(req.statusText);

    res = JSON.parse(await req.text());
  } catch (e: any) {
    // Return empty array
    return {
      subfinder,
      error: true,
      message: e.message,
      result: [],
    };
  }

  for (const domain of res) {
    result.push({
      domain,
      ip: "",
    });
  }

  console.log(`${logger.wrap(logLevel.success, subfinder)} : ${result.length}`);
  return {
    subfinder,
    error: false,
    result,
  };
}

subfinder.addFinder(jonlu);
