const youtubeSubscribersElement = document.getElementById("youtubeSubscribers");

function displayYouTubeSubscribers() {
  if (!youtubeSubscribersElement) return;

  // Ingresa el valor manualmente aquí.
  const manualSubscriberCount = 0;

  youtubeSubscribersElement.textContent = manualSubscriberCount.toLocaleString();
}

displayYouTubeSubscribers();
