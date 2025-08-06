// const API_ENDPOINT = "http://localhost:3000/profiles";

// chrome.runtime.onMessage.addListener((message) => {
//   if (message.action === "startScraping") {
//     processAllUrls(message.urls);
//   }
//   return true;
// });

// async function processAllUrls(urls) {
//   for (const url of urls) {
//     try {
//       const data = await scrapeSingleUrl(url);
//       await sendDataToBackend(data);
//       console.log(`Successfully processed and saved: ${url}`);
//     } catch (error) {
//       console.error(`Failed to process ${url}:`, error);
//     }
//   }
//   console.log("All URLs processed.");
// }

// function scrapeSingleUrl(url) {
//   return new Promise(async (resolve, reject) => {
//     let tabId;
//     let scrapeTimeout;

//     const onUpdatedListener = (tId, changeInfo, tab) => {
//       if (
//         tId === tabId &&
//         changeInfo.status === "complete" &&
//         tab.url.includes("linkedin.com")
//       ) {
//         chrome.scripting.executeScript({
//           target: { tabId: tabId },
//           files: ["popup/scraper.js"],
//         });

//         scrapeTimeout = setTimeout(() => {
//           cleanupAndReject("Scraping timed out.");
//         }, 15000);
//       }
//     };

//     const onMessageListener = (message, sender) => {
//       if (sender.tab?.id === tabId && message.action === "scrapedData") {
//         const finalData = message.data;
//         finalData.url = url;
//         cleanupAndResolve(finalData);
//       }
//     };

//     const cleanupAndResolve = (data) => {
//       clearTimeout(scrapeTimeout);
//       chrome.tabs.onUpdated.removeListener(onUpdatedListener);
//       chrome.runtime.onMessage.removeListener(onMessageListener);
//       resolve(data);
//     };

//     const cleanupAndReject = (errorMessage) => {
//       clearTimeout(scrapeTimeout);
//       chrome.tabs.onUpdated.removeListener(onUpdatedListener);
//       chrome.runtime.onMessage.removeListener(onMessageListener);
//       reject(new Error(errorMessage));
//     };

//     chrome.tabs.onUpdated.addListener(onUpdatedListener);
//     chrome.runtime.onMessage.addListener(onMessageListener);

//     try {
//       tabId = (await chrome.tabs.create({ url, active: false })).id;
//     } catch (error) {
//       cleanupAndReject(error.message);
//     }
//   });
// }

// async function sendDataToBackend(data) {
//   try {
//     const response = await fetch(API_ENDPOINT, {
//       method: "POST",
//       headers: { "Content-Type": "application/json" },
//       body: JSON.stringify(data),
//     });
//     if (!response.ok)
//       throw new Error(`Server responded with status: ${response.status}`);
//     const result = await response.json();
//     console.log("Successfully sent data to backend:", result);
//   } catch (error) {
//     console.error("Error sending data:", error);
//     throw error;
//   }
// }

// chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
//   if (message.action === "startAction") {
//     console.log(
//       "Service Worker: Received startAction message with counts:",
//       message
//     );
//     startFeedInteraction(message.likeCount, message.commentCount);
//   }
//   return true;
// });

// async function startFeedInteraction(likeCount, commentCount) {
//   console.log("Service Worker: Opening LinkedIn feed...");
//   await chrome.tabs.create({
//     url: "https://www.linkedin.com/feed/",
//     active: true,
//   });
//   console.log("Service Worker: LinkedIn feed tab created.");
// }


// This is the complete and final code for service-worker.js

// --- GLOBAL CONSTANTS ---
const API_ENDPOINT = 'http://localhost:3000/profiles';


// --- MAIN MESSAGE LISTENER ---
// This single listener acts as the "brain" and directs messages to the correct function.
chrome.runtime.onMessage.addListener((message) => {
  if (message.action === "startScraping") {
    console.log("Service Worker: Received 'startScraping' command.");
    processAllUrls(message.urls);
  } else if (message.action === "startAction") {
    console.log("Service Worker: Received 'startAction' command.");
    startFeedInteraction(message.likeCount, message.commentCount);
  }
  // Return true to indicate that we will respond asynchronously.
  return true; 
});


// --- TASK 2: PROFILE SCRAPER FUNCTIONS ---

async function processAllUrls(urls) {
  console.log(`Service Worker: Starting to process ${urls.length} URLs for scraping.`);
  for (const url of urls) {
    try {
      const data = await scrapeSingleUrl(url);
      await sendDataToBackend(data);
      console.log(`Successfully scraped and saved: ${url}`);
    } catch (error) {
      console.error(`Failed to process ${url}:`, error);
    }
  }
  console.log("All scraping tasks processed.");
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
        scrapeTimeout = setTimeout(() => cleanupAndReject('Scraping timed out'), 15000);
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
      // We are leaving the scraper tabs open as per the last request.
      resolve(data);
    };
    
    const cleanupAndReject = (errorMessage) => {
      clearTimeout(scrapeTimeout);
      chrome.tabs.onUpdated.removeListener(onUpdatedListener);
      chrome.runtime.onMessage.removeListener(onMessageListener);
      // Also leave the tab open on failure so the user can see what went wrong.
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


// --- TASK 3: FEED INTERACTOR FUNCTION ---

async function startFeedInteraction(likeCount, commentCount) {
  // 1. Open the LinkedIn feed tab
  const tab = await chrome.tabs.create({
    url: "https://www.linkedin.com/feed/",
    active: true
  });

  // 2. Wait for the tab to finish loading completely
  chrome.tabs.onUpdated.addListener(function listener(tabId, changeInfo) {
    if (tabId === tab.id && changeInfo.status === 'complete') {
      // 3. Remove this listener so it doesn't fire again
      chrome.tabs.onUpdated.removeListener(listener);

      // 4. Wait a few seconds for the feed to render its dynamic content
      setTimeout(() => {
        // 5. Now, send the command to the content script (action-performer.js)
        chrome.tabs.sendMessage(tab.id, {
          action: "executeActions",
          likeCount: likeCount,
          commentCount: commentCount
        });
      }, 5000); // 5-second delay for stability
    }
  });
}