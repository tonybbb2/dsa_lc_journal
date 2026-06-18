(function () {
  const GITHUB_API_BASE = "https://api.github.com";

  function toBase64Unicode(text) {
    const bytes = new TextEncoder().encode(text);
    let binary = "";

    bytes.forEach((byte) => {
      binary += String.fromCharCode(byte);
    });

    return btoa(binary);
  }

  async function createFile(options) {
    const token = options.token;
    const username = options.username;
    const repo = options.repo;
    const branch = options.branch || "main";
    const path = options.path;
    const content = options.content;
    const message = options.message;

    if (!token) {
      throw new Error("GitHub token is missing. Open the extension popup and save your token.");
    }

    if (!username || !repo) {
      throw new Error("GitHub username or repository name is missing.");
    }

    const url =
      `${GITHUB_API_BASE}/repos/${encodeURIComponent(username)}/` +
      `${encodeURIComponent(repo)}/contents/${path.split("/").map(encodeURIComponent).join("/")}`;

    const response = await fetch(url, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/vnd.github+json",
        "Content-Type": "application/json",
        "X-GitHub-Api-Version": "2022-11-28"
      },
      body: JSON.stringify({
        message,
        content: toBase64Unicode(content),
        branch
      })
    });

    if (!response.ok) {
      let detail = "";

      try {
        const payload = await response.json();
        detail = payload.message ? `: ${payload.message}` : "";
      } catch (error) {
        detail = response.statusText ? `: ${response.statusText}` : "";
      }

      throw new Error(`GitHub API error ${response.status}${detail}`);
    }

    return response.json();
  }

  window.LeetCodeGitHub = {
    createFile
  };
})();
