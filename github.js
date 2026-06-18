(function () {
  const GITHUB_API_BASE = "https://api.github.com";
  const GITHUB_LOGIN_BASE = "https://github.com/login";

  async function readJsonResponse(response) {
    const payload = await response.json();

    if (!response.ok || payload.error) {
      const error = new Error(payload.error_description || payload.message || payload.error || response.statusText);
      error.code = payload.error || String(response.status);
      throw error;
    }

    return payload;
  }

  async function requestDeviceCode(clientId, scope) {
    const response = await fetch(`${GITHUB_LOGIN_BASE}/device/code`, {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/x-www-form-urlencoded"
      },
      body: new URLSearchParams({
        client_id: clientId,
        scope
      })
    });

    return readJsonResponse(response);
  }

  async function pollDeviceToken(clientId, deviceCode) {
    const response = await fetch(`${GITHUB_LOGIN_BASE}/oauth/access_token`, {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/x-www-form-urlencoded"
      },
      body: new URLSearchParams({
        client_id: clientId,
        device_code: deviceCode,
        grant_type: "urn:ietf:params:oauth:grant-type:device_code"
      })
    });

    return readJsonResponse(response);
  }

  async function githubGet(token, path) {
    if (!token) {
      throw new Error("GitHub token is missing.");
    }

    const response = await fetch(`${GITHUB_API_BASE}${path}`, {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/vnd.github+json",
        "X-GitHub-Api-Version": "2022-11-28"
      }
    });

    return readJsonResponse(response);
  }

  async function getCurrentUser(token) {
    return githubGet(token, "/user");
  }

  async function listRepositories(token) {
    const query = new URLSearchParams({
      per_page: "100",
      sort: "updated",
      affiliation: "owner,collaborator,organization_member"
    });

    return githubGet(token, `/user/repos?${query.toString()}`);
  }

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
    createFile,
    getCurrentUser,
    listRepositories,
    pollDeviceToken,
    requestDeviceCode
  };
})();
