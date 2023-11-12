import clear from "console-clear";
import readline from "readline";
import stripAnsi from "strip-ansi";

function clearTerminal(scroll: boolean = true) {
  clear(scroll);
}

async function sleep(ms: number) {
  await new Promise((resolve) => {
    setTimeout(() => {
      resolve(0);
    }, ms);
  });
}

function writeListToTerminal(list: Array<string>, cursorX: number = 0) {
  for (let cursorY = 0; cursorY < list.length; cursorY++) {
    readline.cursorTo(process.stdout, cursorX, cursorY);
    process.stdout.write(" ".repeat(process.stdout.columns));
    readline.cursorTo(process.stdout, cursorX, cursorY);
    process.stdout.write(list[cursorY]);
  }
}

function pager(list: Array<string>, listPerPage: number = 5): Array<Array<string>> {
  let index = 0;
  let result: string[][] = [];

  // If array is empty
  if (list.length == 0) {
    result[0] = ["Back"];
    return result;
  }

  for (const i in list) {
    if (!result[index]) result[index] = [];
    result[index].push(`${result[index].length + 1} ${list[i]}`);
    if (result[index].length >= listPerPage) {
      if (result[index - 1]) result[index].push("Prev");
      if (list[parseInt(i) + 1]) result[index].push("Next");
      result[index].push("Back");
      index += 1;
    } else if (result[index].length == list.length) {
      result[index].push("Back");
    } else if (!list[parseInt(i) + 1]) {
      result[index].push(...["Prev", "Back"]);
    }
  }

  return result;
}

function unchalk(text: string): string {
  return stripAnsi(text);
}

function calculateIPRange(subnet: string): Array<string> {
  if (!subnet.match("/")) return [];

  const [networkAddress, subnetMask] = subnet.split("/");

  const networkAddressNum = ipToNumber(networkAddress);
  const subnetMaskNum = parseInt(subnetMask, 10);

  const numberOfAddresses = Math.pow(2, 32 - subnetMaskNum);

  const ipAddresses: Array<string> = [];
  for (let i = 0; i < numberOfAddresses; i++) {
    const ipAddressNum = networkAddressNum + i;
    ipAddresses.push(numberToIp(ipAddressNum));
  }

  return ipAddresses;
}

function ipToNumber(ip: string): number {
  const octets = ip.split(".").map(Number);
  return octets.reduce((acc, octet, index) => acc + (octet << ((3 - index) * 8)), 0);
}

function numberToIp(num: number): string {
  return `${(num >> 24) & 255}.${(num >> 16) & 255}.${(num >> 8) & 255}.${num & 255}`;
}

export { clearTerminal, sleep, writeListToTerminal, pager, unchalk, calculateIPRange };
