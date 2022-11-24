import { initiator } from "./initiator.mjs";
import WebSocket from "ws";
import { logger, logLevel } from "./logger.mjs";
import { connect, createSecureContext } from "tls";

class Benchmark {
  async cdn(domain: string): Promise<string | void> {
    return await new Promise((resolve) => {
      performance.mark("Connecting");
      const ws = new WebSocket(`ws://${domain}`, {
        method: "GET",
        headers: {
          Host: initiator.host,
          Connection: "Upgrade",
          "User-Agent": initiator.user_agent,
          Upgrade: "websocket",
        },
        handshakeTimeout: 3000,
      });

      ws.on("error", (error: Error) => {
        performance.mark("Connected");
        performance.measure(`${domain}-cdn`, "Connecting", "Connected");

        if (error.message.match(/Unexpected server response: \d+$/)) {
          const performances = performance.getEntriesByName(`${domain}-cdn`);
          resolve(
            `${logger.wrap(logLevel.success, "Latency")} : ${performances[performances.length - 1].duration.toFixed(
              2
            )} ms`
          );
        } else {
          resolve(`${logger.wrap(logLevel.error, "Latency")} : ${error.name}`);
        }
      });

      ws.on("close", () => {
        resolve(`${logger.wrap(logLevel.error, "Latency")} : Unexpected Error!`);
      });
    });
  }

  async sni(domain: string): Promise<string | void> {
    return await new Promise((resolve) => {
      performance.mark("Connecting");

      const socket = connect({
        host: initiator.v2host,
        port: 443,
        servername: domain,
        rejectUnauthorized: false,
        secureContext: createSecureContext({
          maxVersion: "TLSv1.2",
        }),
      });

      socket.on("secureConnect", () => {
        performance.mark("Connected");
        performance.measure(`${domain}-tls`, "Connecting", "Connected");
        const tls = socket.getProtocol()?.match(/(TLSv\d\.\d)$/);

        const performances = performance.getEntriesByName(`${domain}-tls`);
        if (tls) {
          resolve(
            `${logger.wrap(logLevel.success, "Latency")} : ${performances[performances.length - 1].duration.toFixed(
              2
            )} ms`
          );
        }
      });

      socket.on("error", (e: Error) => {
        // Error handler
        socket.end();
        resolve(`${logger.wrap(logLevel.error, "Latency")} : ${e.name}`);
      });

      socket.on("close", () => {
        resolve(`${logger.wrap(logLevel.error, "Latency")} : Unexpected Error!`);
      });

      socket.setTimeout(3000, () => {
        socket.destroy();
      });
    });
  }
}

const benchmark = new Benchmark();

export { benchmark };
