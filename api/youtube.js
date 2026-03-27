/**
 * YouTube Data API v3 — channel statistics.
 * Set YOUTUBE_API_KEY in Vercel env (or .env.local) to your real API key from Google Cloud Console.
 * Set YOUTUBE_CHANNEL_ID (UC…) or YOUTUBE_CHANNEL_HANDLE (handle without @).
 */

function buildChannelsUrl(apiKey) {
  const channelId = process.env.YOUTUBE_CHANNEL_ID?.trim();
  const handle = process.env.YOUTUBE_CHANNEL_HANDLE?.trim()?.replace(/^@/, "");

  const params = new URLSearchParams({
    part: "statistics,snippet",
    key: apiKey,
  });

  if (handle) {
    params.set("forHandle", handle);
  } else if (channelId) {
    params.set("id", channelId);
  }

  return `https://www.googleapis.com/youtube/v3/channels?${params.toString()}`;
}

function parseStatNumber(value) {
  if (value == null || value === "") return null;
  const n = Number(value);
  return Number.isFinite(n) ? n : null;
}

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const apiKey = process.env.YOUTUBE_API_KEY?.trim();
  const hasChannel =
    process.env.YOUTUBE_CHANNEL_ID?.trim() ||
    process.env.YOUTUBE_CHANNEL_HANDLE?.trim();

  if (!apiKey) {
    return res.status(500).json({
      error:
        "Missing YOUTUBE_API_KEY. Add your YouTube Data API key in Vercel Project Settings → Environment Variables.",
    });
  }

  if (!hasChannel) {
    return res.status(500).json({
      error:
        "Set YOUTUBE_CHANNEL_ID (channel ID) or YOUTUBE_CHANNEL_HANDLE (e.g. MrBeast without @).",
    });
  }

  try {
    const url = buildChannelsUrl(apiKey);
    const response = await fetch(url);

    if (!response.ok) {
      const body = await response.text();
      return res.status(response.status).json({
        error: "YouTube API request failed",
        details: body,
      });
    }

    const data = await response.json();
    const item = data?.items?.[0];

    if (!item) {
      return res.status(404).json({
        error: "Channel not found. Check YOUTUBE_CHANNEL_ID or YOUTUBE_CHANNEL_HANDLE.",
      });
    }

    const stats = item.statistics || {};
    const snippet = item.snippet || {};
    const hidden = Boolean(stats.hiddenSubscriberCount);

    const subscriberCount = hidden
      ? null
      : parseStatNumber(stats.subscriberCount);

    return res.status(200).json({
      subscriberCount,
      channel: {
        id: item.id,
        title: snippet.title ?? null,
        customUrl: snippet.customUrl ?? null,
      },
      statistics: {
        subscriberCount,
        viewCount: parseStatNumber(stats.viewCount),
        videoCount: parseStatNumber(stats.videoCount),
        hiddenSubscriberCount: hidden,
      },
    });
  } catch (error) {
    return res.status(500).json({
      error: "Unexpected server error",
      details: error instanceof Error ? error.message : String(error),
    });
  }
}
