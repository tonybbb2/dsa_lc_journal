(function () {
  const startLoginButton = document.getElementById("startLogin");
  const repoSection = document.getElementById("repoSection");
  const repoSelect = document.getElementById("repoSelect");
  const refreshReposButton = document.getElementById("refreshRepos");
  const logoutButton = document.getElementById("logout");
  const deviceCode = document.getElementById("deviceCode");
  const deviceHint = document.getElementById("deviceHint");
  const status = document.getElementById("status");

  function setStatus(message, type) {
    status.textContent = message;
    status.className = type || "";
  }

  function sendMessage(message) {
    return chrome.runtime.sendMessage(message);
  }

  function showDeviceCode(userCode) {
    deviceCode.textContent = userCode;
    deviceCode.hidden = false;
    deviceHint.hidden = false;
  }

  function hideDeviceCode() {
    deviceCode.hidden = true;
    deviceHint.hidden = true;
  }

  function renderRepositories(repositories, selectedRepo) {
    repoSelect.innerHTML = "";

    const placeholder = document.createElement("option");
    placeholder.value = "";
    placeholder.textContent = "Choose a repository";
    repoSelect.appendChild(placeholder);

    repositories
      .filter((repository) => repository.writable)
      .forEach((repository) => {
        const option = document.createElement("option");
        option.value = JSON.stringify(repository);
        option.textContent = repository.fullName;

        if (selectedRepo && selectedRepo === repository.name) {
          option.selected = true;
        }

        repoSelect.appendChild(option);
      });

    repoSection.hidden = false;
  }

  async function chooseRepository() {
    if (!repoSelect.value) {
      return;
    }

    const repository = JSON.parse(repoSelect.value);

    await chrome.storage.local.set({
      username: repository.owner,
      repo: repository.name,
      branch: repository.defaultBranch || "main"
    });

    setStatus(`Submissions will sync to ${repository.fullName}.`, "success");
  }

  async function refreshRepositories() {
    refreshReposButton.disabled = true;
    setStatus("Refreshing repositories...", "");

    const response = await sendMessage({ type: "refresh-repositories" });

    if (response && response.error) {
      setStatus(response.error, "error");
      refreshReposButton.disabled = false;
      return;
    }

    await loadState();
    refreshReposButton.disabled = false;
  }

  async function logout() {
    logoutButton.disabled = true;
    setStatus("Logging out...", "");

    const response = await sendMessage({ type: "logout" });

    if (response && response.error) {
      setStatus(response.error, "error");
      logoutButton.disabled = false;
      return;
    }

    repoSelect.innerHTML = '<option value="">Choose a repository</option>';
    repoSection.hidden = true;
    hideDeviceCode();
    setStatus("Logged out. Sign in again to sync submissions.", "success");
    logoutButton.disabled = false;
  }

  async function startLogin() {
    startLoginButton.disabled = true;
    setStatus("Opening GitHub sign-in...", "");

    const response = await sendMessage({ type: "start-github-login" });

    if (response && response.error) {
      setStatus(response.error, "error");
      startLoginButton.disabled = false;
      return;
    }

    showDeviceCode(response.userCode);
    setStatus("Authorize on GitHub. This popup can be closed; sign-in will finish in the background.", "success");
    startLoginButton.disabled = false;
  }

  async function loadState() {
    const settings = await chrome.storage.local.get({
      authStatus: "",
      authError: "",
      pendingUserCode: "",
      token: "",
      username: "",
      repo: "",
      repositories: []
    });

    if (settings.pendingUserCode && settings.authStatus === "pending") {
      showDeviceCode(settings.pendingUserCode);
      repoSection.hidden = true;
      setStatus("Waiting for GitHub authorization...", "");
    }

    if (settings.authStatus === "signed-in" && settings.token) {
      hideDeviceCode();
      renderRepositories(settings.repositories, settings.repo);
      setStatus(
        settings.repo
          ? `Signed in as ${settings.username}. Syncing to ${settings.repo}.`
          : `Signed in as ${settings.username}. Choose a repository.`,
        "success"
      );
    }

    if (settings.authStatus === "expired") {
      hideDeviceCode();
      repoSection.hidden = true;
      setStatus("GitHub sign-in expired. Try signing in again.", "error");
    }

    if (settings.authStatus === "error") {
      hideDeviceCode();
      repoSection.hidden = true;
      setStatus(settings.authError || "GitHub sign-in failed.", "error");
    }

    if (!settings.authStatus || settings.authStatus === "signed-out") {
      hideDeviceCode();
      repoSection.hidden = true;
    }
  }

  startLoginButton.addEventListener("click", startLogin);
  refreshReposButton.addEventListener("click", refreshRepositories);
  logoutButton.addEventListener("click", logout);
  repoSelect.addEventListener("change", chooseRepository);

  chrome.storage.onChanged.addListener((changes, areaName) => {
    if (areaName === "local" && (changes.authStatus || changes.repositories || changes.repo)) {
      loadState();
    }
  });

  loadState().catch((error) => {
    setStatus(`Could not load settings: ${error.message}`, "error");
  });
})();
