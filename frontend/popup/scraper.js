(function () {
  const getText = (selector) => {
    const element = document.querySelector(selector);
    return element ? element.innerText.trim() : null;
  };

  const scrapeProfileData = () => {
    const name = getText("h1");
    const bio = getText("div.text-body-medium.break-words");
    const location = getText("span.text-body-small.inline.break-words");
    const about = getText(
      'div[class*="inline-show-more-text"] span[aria-hidden="true"]'
    );

    const followerCount =
      Array.from(document.querySelectorAll("li.text-body-small"))
        .find((el) => el.innerText.includes("followers"))
        ?.innerText.trim() || null;

    const connectionCount =
      Array.from(document.querySelectorAll("li.text-body-small"))
        .find((el) => el.innerText.includes("connections"))
        ?.innerText.trim() || null;

    return { name, bio, location, followerCount, connectionCount, about };
  };

  chrome.runtime.sendMessage({
    action: "scrapedData",
    data: scrapeProfileData(),
  });
})();
