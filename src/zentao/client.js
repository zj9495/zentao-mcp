import { getOption, parseCliArgs } from "../cli/args.js";
import { loadConfig } from "../config/store.js";

function normalizeBaseUrl(url) {
  return url.replace(/\/+$/, "");
}

function parseCookies(setCookieHeaders) {
  const jar = {};
  for (const header of setCookieHeaders) {
    const match = header.match(/^([^=]+)=([^;]*)/);
    if (match) jar[match[1].trim()] = match[2].trim();
  }
  return jar;
}

function formatCookies(jar) {
  return Object.entries(jar)
    .map(([k, v]) => `${k}=${v}`)
    .join("; ");
}

export class ZentaoClient {
  constructor({ baseUrl, account, password }) {
    this.baseUrl = normalizeBaseUrl(baseUrl);
    this.account = account;
    this.password = password;
    this.token = null;
    this.sessionCookies = null;
  }

  async ensureToken() {
    if (this.token) return;
    this.token = await this.getToken();
  }

  async getToken() {
    const url = `${this.baseUrl}/api.php/v1/tokens`;
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        account: this.account,
        password: this.password,
      }),
    });

    const text = await res.text();
    let json;
    try {
      json = JSON.parse(text);
    } catch (error) {
      throw new Error(`Token response parse failed: ${text.slice(0, 200)}`);
    }

    if (json.error) {
      throw new Error(`Token request failed: ${json.error}`);
    }

    if (!json.token) {
      throw new Error(`Token missing in response: ${text.slice(0, 200)}`);
    }

    return json.token;
  }

  async request({ method, path, query = {}, body }) {
    await this.ensureToken();

    const url = new URL(`${this.baseUrl}${path}`);
    Object.entries(query).forEach(([key, value]) => {
      if (value === undefined || value === null) return;
      url.searchParams.set(key, String(value));
    });

    const headers = {
      Token: this.token,
    };

    const options = { method, headers };

    if (body !== undefined) {
      headers["Content-Type"] = "application/json";
      options.body = JSON.stringify(body);
    }

    const res = await fetch(url, options);
    const text = await res.text();
    if (!text || !text.trim()) {
      return { error: `Empty response (HTTP ${res.status})` };
    }
    let json;
    try {
      json = JSON.parse(text);
    } catch (error) {
      throw new Error(`Response parse failed: ${text.slice(0, 200)}`);
    }

    return json;
  }

  async ensureSessionCookies() {
    if (this.sessionCookies) return;

    const loginPageUrl = `${this.baseUrl}/user-login.html`;
    const pageRes = await fetch(loginPageUrl, { redirect: "manual" });
    const setCookies1 = pageRes.headers.getSetCookie?.() || [];
    let cookieJar = parseCookies(setCookies1);

    const loginRes = await fetch(loginPageUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        "Referer": loginPageUrl,
        Cookie: formatCookies(cookieJar),
      },
      body: `account=${encodeURIComponent(this.account)}&password=${encodeURIComponent(this.password)}&keepLogin=on`,
      redirect: "manual",
    });

    const setCookies2 = loginRes.headers.getSetCookie?.() || [];
    cookieJar = { ...cookieJar, ...parseCookies(setCookies2) };

    if (!cookieJar.za && !cookieJar.zentaosid) {
      throw new Error("Session login failed: no session cookie received");
    }

    this.sessionCookies = cookieJar;
  }

  formatSessionCookies() {
    return formatCookies(this.sessionCookies || {});
  }
}

export function createClientFromCli({ argv, env }) {
  const stored = loadConfig({ env }) || {};
  const cliArgs = parseCliArgs(argv);

  const baseUrl =
    getOption(cliArgs, env, "ZENTAO_URL", "zentao-url") || stored.zentaoUrl || null;
  const account =
    getOption(cliArgs, env, "ZENTAO_ACCOUNT", "zentao-account") ||
    stored.zentaoAccount ||
    null;
  const password =
    getOption(cliArgs, env, "ZENTAO_PASSWORD", "zentao-password") ||
    stored.zentaoPassword ||
    null;

  if (!baseUrl) throw new Error("Missing ZENTAO_URL or --zentao-url");
  if (!account) throw new Error("Missing ZENTAO_ACCOUNT or --zentao-account");
  if (!password) throw new Error("Missing ZENTAO_PASSWORD or --zentao-password");

  return new ZentaoClient({ baseUrl, account, password });
}
