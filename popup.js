(function () {
  const fields = {
    clientId: document.getElementById("clientId"),
    token: document.getElementById("token"),
    username: document.getElementById("username"),
    repoSelect: document.getElementById("repoSelect"),
    repo: document.getElementById("repo"),
    branch: document.getElementById("branch")
  };

  const status = document.getElementById("status");
  const deviceCode = document.getElementById("deviceCode");
  const startLoginButton = document.getElementById("startLogin");
  const completeLoginButton = document.getElementById("completeLogin");
  const refreshReposButton = document.getElementById("refreshRepos");
  const saveButton = document.getElementById("save");

  function setStatus(message, type) {
    status.textContent = message;
    status.className = type || "";
  }

  async function loadSettings() {
    const settings = await chrome.storage.local.get({
      clientId: "",
      pendingDeviceCode: "",
      pendingUserCode: "",
      pendingVerificationUri: "",
      token: "",
      username: "",
      repo: "",
      branch: "main"
    });

    fields.clientId.value = settings.clientId;
    fields.token.value = settings.token;
    fields.username.value = settings.username;
    fields.repo.value = settings.repo;
    fields.branch.value = settings.branch || "main";

    if (settings.pendingDeviceCode && settings.pendingUserCode) {
      showPendingDeviceCode(settings.pendingUserCode);
    }

    if (settings.token) {
      await refreshRepositories(false);
    }
  }

  function showPendingDeviceCode(userCode) {
    deviceCode.textContent = userCode;
    deviceCode.hidden = false;
    completeLoginButton.hidden = false;
  }

  async function saveSettings() {
    const settings = {
      clientId: fields.clientId.value.trim(),
      token: fields.token.value.trim(),
      username: fields.username.value.trim(),
      repo: fields.repo.value.trim(),
      branch: fields.branch.value.trim() || "main"
    };

    if (!settings.token) {
      setStatus("GitHub token is required.", "error");
      return;
    }

    if (!settings.username || !settings.repo) {
      setStatus("GitHub username and repo are required.", "error");
      return;
    }

    await chrome.storage.local.set(settings);
    setStatus("Settings saved.", "success");
  }

  async function startGitHubLogin() {
    const clientId = fields.clientId.value.trim();

    if (!clientId) {
      setStatus("GitHub OAuth App client ID is required for login.", "error");
      return;
    }

    startLoginButton.disabled = true;
    setStatus("Requesting GitHub device code...", "");

    try {
      const auth = await window.LeetCodeGitHub.requestDeviceCode(clientId, "repo");

      await chrome.storage.local.set({
        clientId,
        pendingDeviceCode: auth.device_code,
        pendingUserCode: auth.user_code,
        pendingVerificationUri: auth.verification_uri
      });

      showPendingDeviceCode(auth.user_code);
      setStatus("Enter this code on GitHub, then return here and complete login.", "success");
      chrome.tabs.create({ url: auth.verification_uri });
    } catch (error) {
      setStatus(`GitHub login failed: ${error.message}`, "error");
    } finally {
      startLoginButton.disabled = false;
    }
  }

  async function completeGitHubLogin() {
    const settings = await chrome.storage.local.get({
      clientId: "",
      pendingDeviceCode: ""
    });

    if (!settings.clientId || !settings.pendingDeviceCode) {
      setStatus("Start GitHub login first.", "error");
      return;
    }

    completeLoginButton.disabled = true;
    setStatus("Checking GitHub authorization...", "");

    try {
      const tokenResult = await window.LeetCodeGitHub.pollDeviceToken(
        settings.clientId,
        settings.pendingDeviceCode
      );
      const user = await window.LeetCodeGitHub.getCurrentUser(tokenResult.access_token);

      await chrome.storage.local.set({
        token: tokenResult.access_token,
        username: user.login,
        pendingDeviceCode: "",
        pendingUserCode: "",
        pendingVerificationUri: ""
      });

      fields.token.value = tokenResult.access_token;
      fields.username.value = user.login;
      deviceCode.hidden = true;
      completeLoginButton.hidden = true;

      await refreshRepositories(false);
      setStatus(`Signed in as ${user.login}. Choose a repository.`, "success");
    } catch (error) {
      if (error.code === "authorization_pending") {
        setStatus("GitHub is still waiting for authorization. Try Complete login again after approving.", "error");
      } else if (error.code === "slow_down") {
        setStatus("GitHub asked us to slow down. Wait a few seconds and try Complete login again.", "error");
      } else if (error.code === "expired_token" || error.code === "token_expired") {
        setStatus("The login code expired. Start GitHub login again.", "error");
      } else {
        setStatus(`Could not complete login: ${error.message}`, "error");
      }
    } finally {
      completeLoginButton.disabled = false;
    }
  }

  function renderRepositories(repositories) {
    fields.repoSelect.innerHTML = "";

    const placeholder = document.createElement("option");
    placeholder.value = "";
    placeholder.textContent = "Choose a repository";
    fields.repoSelect.appendChild(placeholder);

    const writableRepositories = repositories.filter((repository) => {
      return !repository.permissions || repository.permissions.push || repository.permissions.maintain || repository.permissions.admin;
    });

    writableRepositories.forEach((repository) => {
      const option = document.createElement("option");
      option.value = JSON.stringify({
        owner: repository.owner.login,
        name: repository.name,
        defaultBranch: repository.default_branch || "main"
      });
      option.textContent = repository.full_name;
      fields.repoSelect.appendChild(option);
    });
  }

  async function refreshRepositories(showSuccess) {
    const token = fields.token.value.trim();

    if (!token) {
      setStatus("Add a token or sign in with GitHub first.", "error");
      return;
    }

    refreshReposButton.disabled = true;

    try {
      const user = await window.LeetCodeGitHub.getCurrentUser(token);
      const repositories = await window.LeetCodeGitHub.listRepositories(token);

      fields.username.value = user.login;
      renderRepositories(repositories);

      if (showSuccess) {
        setStatus(`Loaded ${fields.repoSelect.options.length - 1} writable repositories.`, "success");
      }
    } catch (error) {
      setStatus(`Could not load repositories: ${error.message}`, "error");
    } finally {
      refreshReposButton.disabled = false;
    }
  }

  async function chooseRepository() {
    if (!fields.repoSelect.value) {
      return;
    }

    const repository = JSON.parse(fields.repoSelect.value);
    fields.username.value = repository.owner;
    fields.repo.value = repository.name;
    fields.branch.value = repository.defaultBranch || "main";

    await chrome.storage.local.set({
      clientId: fields.clientId.value.trim(),
      token: fields.token.value.trim(),
      username: fields.username.value.trim(),
      repo: fields.repo.value.trim(),
      branch: fields.branch.value.trim() || "main"
    });

    setStatus(`Repository set to ${repository.owner}/${repository.name}.`, "success");
  }

  startLoginButton.addEventListener("click", startGitHubLogin);
  completeLoginButton.addEventListener("click", completeGitHubLogin);
  refreshReposButton.addEventListener("click", () => refreshRepositories(true));
  fields.repoSelect.addEventListener("change", chooseRepository);
  saveButton.addEventListener("click", saveSettings);
  loadSettings().catch((error) => {
    setStatus(`Could not load settings: ${error.message}`, "error");
  });
})();
