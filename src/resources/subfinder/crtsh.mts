/**
 * by dickymuliafiqri
 * 24112022
 *
 * Credit:
 * crt.sh to enum subdomains
 */

import fetch from "node-fetch";
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

async function crtsh(domain: string): Promise<Result> {
  let result: Array<FinderResult> = [];
  let res: Array<CrtObject> = [];
  const req = await fetch(`http://crt.sh/?q=${domain}&output=json`, {
    method: "GET",
  });

  try {
    if (req.status != 200) throw new Error(req.statusText);
    res = JSON.parse(await req.text());
  } catch (e: any) {
    // Return empty array
    return {
      subfinder: "crtsh",
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

  return {
    subfinder: "crtsh",
    error: false,
    result,
  };
}

subfinder.addFinder(crtsh);
