function buildFileUrlFromId(baseUrl, id) {
  if (!id) throw new Error("id is required");
  return `${baseUrl}/file-download-${id}.html`;
}

function validateFileUrl(rawUrl) {
  if (!rawUrl) throw new Error("url is required");

  let parsed;
  try {
    parsed = new URL(rawUrl);
  } catch {
    throw new Error("url must be an absolute URL");
  }

  const fileName = parsed.pathname.split("/").pop() || "";
  const isDownload = /^file-download-\d+(?:-[^.\/]+)?\.html$/.test(fileName);
  const isRead = /^file-read-\d+\.[^./]+$/.test(fileName);
  if (!isDownload && !isRead) {
    throw new Error("url must be a ZenTao file-download or file-read URL");
  }

  parsed.searchParams.delete("zentaosid");
  return parsed.toString();
}

export function inferNameFromFileUrl(rawUrl) {
  if (!rawUrl) return null;
  const parsed = new URL(rawUrl);
  const fileName = parsed.pathname.split("/").pop() || "";
  if (/^file-read-\d+\.[^./]+$/.test(fileName)) return fileName;
  return null;
}

export async function fetchZentaoFile(client, { id, url } = {}) {
  if (!id && !url) throw new Error("id or url is required");
  if (id && url) throw new Error("id and url cannot be used together");

  await client.ensureSessionCookies();

  const fileUrl = url ? validateFileUrl(url) : buildFileUrlFromId(client.baseUrl, id);
  const res = await fetch(fileUrl, {
    method: "GET",
    headers: {
      Cookie: client.formatSessionCookies(),
    },
    redirect: "manual",
  });

  if (res.status < 200 || res.status >= 300) {
    const text = await res.text();
    throw new Error(`File request failed (HTTP ${res.status}): ${text.slice(0, 200)}`);
  }

  const buffer = Buffer.from(await res.arrayBuffer());
  return {
    url: fileUrl,
    headers: res.headers,
    buffer,
  };
}
