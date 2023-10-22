/**
 * by dickymuliafiqri
 * 29082023
 */

import fetch from "node-fetch";
import { logger, logLevel } from "../../modules/logger.mjs";
import { subfinder, Result, FinderResult } from "../subfinder.js";

interface FoolObject {
  error: boolean;
  result: Array<{
    host: string;
    ip: string;
    source: string;
  }>;
}

async function fool(domain: string, timeout: AbortSignal): Promise<Result> {
  const subfinder = "fool"; // Must not greater than 8 char
  let result: Array<FinderResult> = [];
  let res: FoolObject;

  try {
    const req = await fetch(`https://fool.azurewebsites.net/subfinder?ip=1&domain=${domain}`, {
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

  for (const domain of res.result) {
    result.push({
      domain: domain.host,
      ip: domain.ip,
    });
  }

  console.log(result);

  console.log(`${logger.wrap(logLevel.success, subfinder)} : ${result.length}`);
  return {
    subfinder,
    error: false,
    result,
  };
}

subfinder.addFinder(fool);
