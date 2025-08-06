(() => {
  const getRandomPosts = (count) => {
    const firstPost = document.querySelector("h2.visually-hidden + div");
    const otherPosts = document.querySelectorAll(
      "h2.feed-skip-link__container + div"
    );
    const allPosts = [];
    if (firstPost) allPosts.push(firstPost);
    allPosts.push(...otherPosts);

    const shuffledPosts = allPosts
      .filter((p) => p)
      .sort(() => 0.5 - Math.random());
    return shuffledPosts.slice(0, count);
  };

  const waitForElement = (selector, parent = document, maxWaitTime = 5000) => {
    return new Promise((resolve) => {
      const startTime = Date.now();

      const checkForElement = () => {
        const element = parent.querySelector(selector);

        if (element) {
          resolve(element);
        } else if (Date.now() - startTime > maxWaitTime) {
          console.log(
            `Action Performer: Timeout waiting for element: ${selector}`
          );
          resolve(null);
        } else {
          setTimeout(checkForElement, 100);
        }
      };

      checkForElement();
    });
  };

  const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

  const likePost = async (post, index) => {
    try {
      post.scrollIntoView({ behavior: "smooth", block: "center" });
      await delay(500);

      const likeButton = await waitForElement(
        "button.react-button__trigger:not(.react-button__trigger--is-active)",
        post
      );

      if (likeButton) {
        likeButton.scrollIntoView({ behavior: "smooth", block: "center" });
        await delay(200);
        likeButton.click();
        console.log(`Action Performer: Liked post ${index + 1}`);
        await delay(1000);
        return true;
      } else {
        console.log(
          `Action Performer: Could not find like button for post ${index + 1}`
        );
        return false;
      }
    } catch (error) {
      console.warn(
        `Action Performer: Could not like post ${index + 1}:`,
        error.message
      );
      return false;
    }
  };

  const commentPost = async (post, index) => {
    try {
      post.scrollIntoView({ behavior: "smooth", block: "center" });
      await delay(1000);
      const commentButton = await waitForElement(
        'button[aria-label="Comment"]',
        post
      );
      commentButton.click();
      await delay(1500);

      let commentBox = await waitForElement(
        'div[role="textbox"]',
        document,
        3000
      );

      commentBox.focus();
      commentBox.innerText = "";
      await delay(200);
      commentBox.innerText = "CFBR";

      // Trigger multiple events to ensure the system detects the change
      ["input", "change", "keyup"].forEach((eventType) => {
        const event = new Event(eventType, { bubbles: true });
        commentBox.dispatchEvent(event);
      });

      await delay(1000);
      let postButton = await waitForElement(
        "button.comments-comment-box__submit-button--cr",
        document,
        3000
      );
      postButton.click();
      await delay(2000);
    } catch (error) {
      console.warn(
        `Action Performer: Could not comment on post ${index + 1}:`,
        error.message
      );
      return false;
    }
  };

  const performActions = async (likeCount, commentCount) => {
    const maxPosts = Math.max(likeCount, commentCount);
    const posts = getRandomPosts(maxPosts);

    for (let i = 0; i < posts.length; i++) {
      const post = posts[i];
      if (!post) continue;

      if (i < likeCount) {
        await likePost(post, i);
        if (i < commentCount) await delay(500);
      }

      if (i < commentCount) {
        await commentPost(post, i);
      }

      if (i < posts.length - 1) {
        await delay(2000);
      }
    }
  };

  chrome.runtime.onMessage.addListener((message) => {
    if (message.action === "executeActions") {
      const likeCount = message.likeCount || 0;
      const commentCount = message.commentCount || 0;

      if (likeCount > 0 || commentCount > 0) {
        performActions(likeCount, commentCount);
      }
    }
  });

  console.log("Action Performer is loaded and ready.");
})();
