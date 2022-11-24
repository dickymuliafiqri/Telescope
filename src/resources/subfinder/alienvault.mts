/**
 * by dickymuliafiqri
 * 24112022
 *
 * Credit:
 * alienvault.com to enum subdomains
 */

import fetch from "node-fetch";
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

async function alienvault(domain: string): Promise<Result> {
  let result: Array<FinderResult> = [];
  let res: Array<AlienObject> = [];
  const req = await fetch(`https://otx.alienvault.com/api/v1/indicators/domain/${domain}/passive_dns`, {
    method: "GET",
  });

  try {
    if (req.status != 200) throw new Error(req.statusText);
    res = JSON.parse(await req.text()).passive_dns;
  } catch (e: any) {
    // Return empty array
    return {
      subfinder: "alienvault",
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

  return {
    subfinder: "alienvault",
    error: false,
    result,
  };
}

subfinder.addFinder(alienvault);
