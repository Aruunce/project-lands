import fs from "fs/promises";
import path from "path";
import { del, put } from "@vercel/blob";

// Photo storage: Vercel Blob when BLOB_READ_WRITE_TOKEN is set, otherwise (local
// development only) files in public/uploads.
const LOCAL_DIR = path.join(process.cwd(), "public", "uploads");
const LOCAL_PREFIX = "/uploads/";

export async function saveFile(pathname: string, file: File): Promise<string> {
  if (process.env.BLOB_READ_WRITE_TOKEN) {
    const blob = await put(pathname, file, { access: "public", addRandomSuffix: true, contentType: file.type });
    return blob.url;
  }
  if (process.env.NODE_ENV === "production") {
    throw new Error("Photo storage is not configured (BLOB_READ_WRITE_TOKEN)");
  }

  const target = path.join(LOCAL_DIR, pathname);
  await fs.mkdir(path.dirname(target), { recursive: true });
  await fs.writeFile(target, Buffer.from(await file.arrayBuffer()));
  return LOCAL_PREFIX + pathname;
}

export async function deleteFiles(urls: string[]): Promise<void> {
  const remote = urls.filter((url) => url.startsWith("https://"));
  const local = urls.filter((url) => url.startsWith(LOCAL_PREFIX));

  if (remote.length > 0 && process.env.BLOB_READ_WRITE_TOKEN) await del(remote);

  await Promise.all(
    local.map((url) => {
      const target = path.join(LOCAL_DIR, url.slice(LOCAL_PREFIX.length));
      return target.startsWith(LOCAL_DIR) ? fs.rm(target, { force: true }) : Promise.resolve();
    }),
  );
}
