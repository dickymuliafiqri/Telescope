import { readFileSync, writeFileSync, existsSync } from "fs";

class Initiator {
  private _author = "Dicky Mulia Fiqri";
  private _repo = "https://github.com/dickymuliafiqri/Telescope";
  private _user_agent =
    "Mozilla/5.0 (Linux; Android 10; SM-G980F Build/QP1A.190711.020; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/78.0.3904.96 Mobile Safari/537.36";
  private _host = "id-herza.sshws.net";
  private _path = process.cwd();
  private _domain = "";

  constructor() {
    if (existsSync(`${this._path}/result/host`)) {
      this._host = readFileSync(`${this._path}/result/host`).toString();
    }

    if (existsSync(`${this._path}/result/domain`)) {
      this._domain = readFileSync(`${this._path}/result/domain`).toString();
    }
  }

  get user_agent(): string {
    return this._user_agent;
  }

  set domain(domain: string) {
    this._domain = domain;

    writeFileSync(`${this._path}/result/domain`, this._domain);
  }

  get domain(): string {
    return this._domain || "";
  }

  set host(host: string) {
    this._host = host;

    writeFileSync(`${this._path}/result/host`, this._host);
  }

  get host(): string {
    return this._host;
  }

  get author(): string {
    return this._author;
  }

  get repo(): string {
    return this._repo;
  }

  get path(): string {
    return this._path;
  }
}

const initiator = new Initiator();

export { initiator };
