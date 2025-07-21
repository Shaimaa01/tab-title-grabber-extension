const grabTitleBtn = document.getElementById("grab-title-btn");
const titleContainer = document.getElementById("title-container");

grabTitleBtn.addEventListener("click", () => {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    const currentTab = tabs[0];
    const tabTitle = currentTab.title;
    titleContainer.innerText = tabTitle;
  });
});
