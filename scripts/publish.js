import fs from "node:fs";
import path from "node:path";
import process from "node:process";
import zlib from "node:zlib";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const POSTS_FILE = path.join(ROOT, "posts", "posts90.json.gz.b64");
const PUBLISHED_FILE = path.join(ROOT, "published.json");
const TIME_ZONE = process.env.TIME_ZONE || "America/Belem";

function localDateISO(date = new Date()) {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: TIME_ZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(date);
  const map = Object.fromEntries(parts.filter((part) => part.type !== "literal").map((part) => [part.type, part.value]));
  return `${map.year}-${map.month}-${map.day}`;
}

function readAllPosts() {
  const encoded = fs.readFileSync(POSTS_FILE, "utf8").trim();
  const compressed = Buffer.from(encoded, "base64");
  const json = zlib.gunzipSync(compressed).toString("utf8");
  const posts = JSON.parse(json);
  if (!Array.isArray(posts)) throw new Error("Arquivo de publicações inválido");
  return posts;
}

function readPublished() {
  if (!fs.existsSync(PUBLISHED_FILE)) return [];
  const value = JSON.parse(fs.readFileSync(PUBLISHED_FILE, "utf8"));
  return Array.isArray(value) ? value : [];
}

function writePublished(items) {
  fs.writeFileSync(PUBLISHED_FILE, JSON.stringify(items, null, 2) + "\n", "utf8");
}

async function telegramSend(post) {
  const token = String(process.env.TELEGRAM_BOT_TOKEN || "").trim();
  const chatId = String(process.env.TELEGRAM_CHANNEL_ID || "").trim();
  if (!token) throw new Error("TELEGRAM_BOT_TOKEN não configurado");
  if (!chatId) throw new Error("TELEGRAM_CHANNEL_ID não configurado");

  const body = {
    chat_id: chatId,
    text: post.text,
    parse_mode: post.parseMode || "HTML",
    disable_web_page_preview: true,
  };

  if (post.button?.text && /^https:\/\//i.test(post.button?.url || "")) {
    body.reply_markup = {
      inline_keyboard: [[{ text: String(post.button.text), url: String(post.button.url) }]],
    };
  }

  const response = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok || data?.ok !== true) {
    throw new Error(data?.description || `Telegram HTTP ${response.status}`);
  }
  return data.result;
}

async function main() {
  const requestedDate = String(process.env.FORCE_DATE || "").trim();
  const targetDate = requestedDate || localDateISO();
  const dryRun = String(process.env.DRY_RUN || "").toLowerCase() === "true";

  const posts = readAllPosts();
  const post = posts.find((item) => item.date === targetDate);

  if (!post) {
    console.log(`ℹ️ Nenhuma publicação programada para ${targetDate}.`);
    return;
  }

  const published = readPublished();
  if (published.some((item) => item.id === post.id || item.date === targetDate)) {
    console.log(`ℹ️ Publicação de ${targetDate} já registrada. Nada a fazer.`);
    return;
  }

  if (dryRun) {
    console.log(`🧪 DRY RUN ${targetDate}\n${post.text}`);
    return;
  }

  const result = await telegramSend(post);

  published.push({
    id: post.id,
    date: post.date,
    messageId: result?.message_id ?? null,
    publishedAt: new Date().toISOString(),
  });
  published.sort((a, b) => String(a.date).localeCompare(String(b.date)));
  writePublished(published);

  console.log(`✅ Publicado ${post.id} no Telegram. message_id=${result?.message_id ?? "n/a"}`);
}

main().catch((error) => {
  console.error("⛔ Falha na publicação:", error?.message || error);
  process.exit(1);
});
