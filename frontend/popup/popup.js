document.addEventListener('DOMContentLoaded', () => {
  const startBtn = document.getElementById('start-scraping-btn');
  const linksTextarea = document.getElementById('profile-links');
  const statusDiv = document.getElementById('status-message');

  startBtn.addEventListener('click', () => {
    const validUrls = linksTextarea.value.split('\n').filter(url => {
      return url.trim().startsWith('https://www.linkedin.com/in/');
    });

    if (validUrls.length < 3) {
      statusDiv.innerText = 'Error: Please provide at least 3 valid LinkedIn profile URLs.';
      statusDiv.style.color = 'red';
      return;
    }
    
    chrome.runtime.sendMessage({
      action: "startScraping",
      urls: validUrls
    });

    statusDiv.innerText = `Scraping process started for ${validUrls.length} profiles.`;
    statusDiv.style.color = 'green';
  });
});

