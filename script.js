const youtubeSubscribersElement = document.getElementById("youtubeSubscribers");

async function loadYouTubeSubscribers() {
  if (!youtubeSubscribersElement) return;

  youtubeSubscribersElement.textContent = "Loading...";

  try {
    const response = await fetch("/api/youtube");

    if (!response.ok) {
      throw new Error(`Request failed with status ${response.status}`);
    }

    const data = await response.json();
    const count = data?.subscriberCount;

    if (typeof count !== "number") {
      throw new Error("Invalid subscriber count in API response");
    }

    youtubeSubscribersElement.textContent = count.toLocaleString();
  } catch (error) {
    console.error("Failed to load YouTube subscribers:", error);
    youtubeSubscribersElement.textContent = "Unavailable";
  }
}

loadYouTubeSubscribers();
