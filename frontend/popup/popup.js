document.addEventListener("DOMContentLoaded", () => {
  const startBtn = document.getElementById("start-scraping-btn");
  const linksTextarea = document.getElementById("profile-links");
  const statusDiv = document.getElementById("status-message");

  startBtn.addEventListener("click", () => {
    const validUrls = linksTextarea.value.split("\n").filter((url) => {
      return url.trim().startsWith("https://www.linkedin.com/in/");
    });

    if (validUrls.length < 3) {
      statusDiv.innerText =
        "Error: Please provide at least 3 valid LinkedIn profile URLs.";
      statusDiv.style.color = "red";
      return;
    }

    chrome.runtime.sendMessage({
      action: "startScraping",
      urls: validUrls,
    });

    statusDiv.innerText = `Scraping process started for ${validUrls.length} profiles.`;
    statusDiv.style.color = "green";
  });

  const startActionBtn = document.getElementById("start-action-btn");
  const likeCountInput = document.getElementById("like-count");
  const commentCountInput = document.getElementById("comment-count");

  function validateInteractorInputs() {
    const likes = parseInt(likeCountInput.value, 10);
    const comments = parseInt(commentCountInput.value, 10);

    if (likes > 0 && comments > 0) {
      startActionBtn.disabled = false;
    } else {
      startActionBtn.disabled = true;
    }
  }

  likeCountInput.addEventListener("input", validateInteractorInputs);
  commentCountInput.addEventListener("input", validateInteractorInputs);

  interactorForm.addEventListener("submit", (event) => {
    chrome.runtime.sendMessage({
      action: "startAction",
      likeCount: likeCount,
      commentCount: commentCount,
    });
  });
});
