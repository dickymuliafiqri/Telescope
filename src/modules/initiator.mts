import { readFileSync, writeFileSync, existsSync } from "fs";

class Initiator {
  private _author = "Dicky Mulia Fiqri";
  private _repo = "https://github.com/dickymuliafiqri/Telescope";
  private _user_agent =
    "Mozilla/5.0 (Linux; Android 10; SM-G980F Build/QP1A.190711.020; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/78.0.3904.96 Mobile Safari/537.36";
  private _host = "sg4.sshkit.org";
  private _v2host = "194.233.80.103";
  private _path = process.cwd();
  private _domain = "";
  private _cFlare = 0;
  private _cFront = 0;
  private _estScan = 20;
  private _subDomain = 0;
  private _maxFetch = 8;
  private _files = {
    subdomain: false,
    direct: false,
    cdn: false,
    sni: false,
  };

  constructor() {
    if (existsSync(`${this._path}/result/host`)) {
      this._host = readFileSync(`${this._path}/result/host`).toString();
    }

    if (existsSync(`${this._path}/result/domain`)) {
      this._domain = readFileSync(`${this._path}/result/domain`).toString();
    }
  }

  checkFiles() {
    if (existsSync(`${this._path}/result/${this._domain}`)) {
      this._files.subdomain = existsSync(`${this._path}/result/${this._domain}/subdomain.json`);
      this._files.direct = existsSync(`${this._path}/result/${this._domain}/direct.json`);
      this._files.cdn = existsSync(`${this._path}/result/${this._domain}/cdn.json`);
      this._files.sni = existsSync(`${this._path}/result/${this._domain}/sni.json`);
    } else {
      this._files = {
        subdomain: false,
        direct: false,
        cdn: false,
        sni: false,
      };
    }
  }

  count() {
    this._subDomain = 0;
    this._cFlare = 0;
    this._cFront = 0;

    if (existsSync(`${this._path}/result/${this._domain}/subdomain.json`)) {
      this._subDomain = JSON.parse(
        readFileSync(`${this._path}/result/${this._domain}/subdomain.json`).toString()
      ).length;
      this._maxFetch = Math.round(this._subDomain / this._estScan) || 8;
    }

    if (existsSync(`${this._path}/result/${this._domain}/direct.json`)) {
      const cdns = JSON.parse(readFileSync(`${this._path}/result/${this._domain}/direct.json`).toString());

      for (const cdn of cdns) {
        if (cdn.server?.match(/cloudflare/i)) this._cFlare += 1;
        if (cdn.server?.match(/cloudfront/i)) this._cFront += 1;
      }
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

  get subdomain(): number {
    return this._subDomain;
  }

  set host(host: string) {
    this._host = host;

    writeFileSync(`${this._path}/result/host`, this._host);
  }

  get host(): string {
    return this._host;
  }

  get v2host(): string {
    return this._v2host;
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

  set estScan(sec: number) {
    this._estScan = sec;
  }

  set maxFetch(value: number) {
    this._maxFetch = value;
  }

  get maxFetch(): number {
    return this._maxFetch;
  }

  get cdn(): { cflare: number; cfront: number } {
    return {
      cflare: this._cFlare,
      cfront: this._cFront,
    };
  }

  get files() {
    return this._files;
  }
}

const initiator = new Initiator();

export { initiator };
