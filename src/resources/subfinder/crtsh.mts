/**
 * by dickymuliafiqri
 * 24112022
 *
 * Credit:
 * crt.sh to enum subdomains
 */

import fetch from "node-fetch";
import { logger, logLevel } from "../../modules/logger.mjs";
import { subfinder, Result, FinderResult } from "../subfinder.js";

interface CrtObject {
  issuer_ca_id: number;
  issuer_name: string;
  common_name: string;
  name_value: string;
  id: number;
  entry_timestamp: string;
  not_before: string;
  not_after: string;
  serial_number: string;
}

async function crtsh(domain: string, timeout: AbortSignal): Promise<Result> {
  const subfinder = "crtsh"; // Must not greater than 8 char
  let result: Array<FinderResult> = [];
  let res: Array<CrtObject> = [];

  try {
    const req = await fetch(`http://crt.sh/?q=${domain}&output=json`, {
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

  for (const data of res) {
    result.push({
      domain: data.name_value,
      ip: "", // Ignore since crt.sh didn't provide ip result
    });
  }

  console.log(`${logger.wrap(logLevel.success, subfinder)} : ${result.length}`);
  return {
    subfinder,
    error: false,
    result,
  };
}

subfinder.addFinder(crtsh);
