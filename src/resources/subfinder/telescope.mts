/**
 * by dickymuliafiqri
 * 23122022
 */

import fetch from "node-fetch";
import { logger, logLevel } from "../../modules/logger.mjs";
import { subfinder, Result, FinderResult } from "../subfinder.js";

async function telescope(domain: string, timeout: AbortSignal): Promise<Result> {
  const subfinder = "tlscp"; // Must not greater than 8 char
  let result: Array<FinderResult> = [];

  try {
    const req = await fetch(
      `https://raw.githubusercontent.com/dickymuliafiqri/Telescope/main/result/${domain}/subdomain.json`,
      {
        method: "GET",
        signal: timeout,
      }
    );

    if (req.status != 200) throw new Error(req.statusText);

    result = JSON.parse(await req.text());
  } catch (e: any) {
    // Return empty array
    return {
      subfinder,
      error: true,
      message: e.message,
      result: [],
    };
  }

  console.log(`${logger.wrap(logLevel.success, subfinder)} : ${result.length}`);
  return {
    subfinder,
    error: false,
    result,
  };
}

subfinder.addFinder(telescope);
