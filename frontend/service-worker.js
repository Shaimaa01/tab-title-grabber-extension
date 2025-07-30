
const API_ENDPOINT = 'http://localhost:3000/profiles';

chrome.runtime.onMessage.addListener((message) => {
  if (message.action === "startScraping") {
    processAllUrls(message.urls);
  }
  return true; 
});

async function processAllUrls(urls) {
  for (const url of urls) {
    try {
      const data = await scrapeSingleUrl(url);
      await sendDataToBackend(data);
      console.log(`Successfully processed and saved: ${url}`);
    } catch (error) {
      console.error(`Failed to process ${url}:`, error);
    }
  }
  console.log("All URLs processed.");
}

function scrapeSingleUrl(url) {
  return new Promise(async (resolve, reject) => {
    let tabId;
    let scrapeTimeout;

    const onUpdatedListener = (tId, changeInfo, tab) => {
      if (tId === tabId && changeInfo.status === 'complete' && tab.url.includes('linkedin.com')) {
        chrome.scripting.executeScript({
          target: { tabId: tabId },
          files: ['popup/scraper.js']
        });

        scrapeTimeout = setTimeout(() => {
          cleanupAndReject('Scraping timed out.');
        }, 15000);
      }
    };

    const onMessageListener = (message, sender) => {
      if (sender.tab?.id === tabId && message.action === 'scrapedData') {
        const finalData = message.data;
        finalData.url = url;
        cleanupAndResolve(finalData);
      }
    };

    
    const cleanupAndResolve = (data) => {
      clearTimeout(scrapeTimeout);
      chrome.tabs.onUpdated.removeListener(onUpdatedListener);
      chrome.runtime.onMessage.removeListener(onMessageListener);
      resolve(data);
    };
    
    const cleanupAndReject = (errorMessage) => {
      clearTimeout(scrapeTimeout);
      chrome.tabs.onUpdated.removeListener(onUpdatedListener);
      chrome.runtime.onMessage.removeListener(onMessageListener);
      reject(new Error(errorMessage));
    };

    chrome.tabs.onUpdated.addListener(onUpdatedListener);
    chrome.runtime.onMessage.addListener(onMessageListener);

    try {
      tabId = (await chrome.tabs.create({ url, active: false })).id;
    } catch (error) {
      cleanupAndReject(error.message);
    }
  });
}

async function sendDataToBackend(data) {
  try {
    const response = await fetch(API_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error(`Server responded with status: ${response.status}`);
    const result = await response.json();
    console.log('Successfully sent data to backend:', result);
  } catch (error) {
    console.error('Error sending data:', error);
    throw error;
  }
}



