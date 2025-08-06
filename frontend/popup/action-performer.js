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

  const waitForLikeButton = (post, maxWaitTime = 5000) => {
    return new Promise((resolve) => {
      const startTime = Date.now();

      const checkForButton = () => {
        const likeButton = post.querySelector(
          "button.react-button__trigger:not(.react-button__trigger--is-active)"
        );

        if (likeButton) {
          resolve(likeButton);
        } else if (Date.now() - startTime > maxWaitTime) {
          console.log(
            `Action Performer: Timeout waiting for like button on post`
          );
          resolve(null); // Timeout reached
        } else {
          // Check again in 100ms
          setTimeout(checkForButton, 100);
        }
      };

      checkForButton();
    });
  };

  const performLikes = async (count) => {
    const postsToLike = getRandomPosts(count);
    console.log(postsToLike);
    console.log(`Action Performer: Found ${postsToLike.length} posts to like.`);

    for (let index = 0; index < postsToLike.length; index++) {
      const post = postsToLike[index];

      if (!post) continue;

      post.scrollIntoView({ behavior: "smooth", block: "center" });

      await new Promise((resolve) => setTimeout(resolve, 500));

      const likeButton = await waitForLikeButton(post);

      if (likeButton) {
        likeButton.scrollIntoView({ behavior: "smooth", block: "center" });

        await new Promise((resolve) => setTimeout(resolve, 200));

        likeButton.click();
        console.log(`Action Performer: Liked post ${index}.`);

        await new Promise((resolve) => setTimeout(resolve, 1000));
      } else {
        console.log(
          `Action Performer: Could not find like button for post ${index}`
        );
      }
    }
  };

  const performComments = (count) => {
    console.log(`Action Performer: Simulating ${count} comments.`);
  };

  chrome.runtime.onMessage.addListener((message) => {
    if (message.action === "executeActions") {
      if (message.likeCount > 0) performLikes(message.likeCount);
      if (message.commentCount > 0) performComments(message.commentCount);
    }
  });

  console.log("Action Performer is loaded and ready.");
})();
