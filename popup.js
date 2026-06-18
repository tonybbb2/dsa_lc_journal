(function () {
  const fields = {
    token: document.getElementById("token"),
    username: document.getElementById("username"),
    repo: document.getElementById("repo"),
    branch: document.getElementById("branch")
  };

  const status = document.getElementById("status");
  const saveButton = document.getElementById("save");

  function setStatus(message, type) {
    status.textContent = message;
    status.className = type || "";
  }

  async function loadSettings() {
    const settings = await chrome.storage.local.get({
      token: "",
      username: "",
      repo: "",
      branch: "main"
    });

    fields.token.value = settings.token;
    fields.username.value = settings.username;
    fields.repo.value = settings.repo;
    fields.branch.value = settings.branch || "main";
  }

  async function saveSettings() {
    const settings = {
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

  saveButton.addEventListener("click", saveSettings);
  loadSettings().catch((error) => {
    setStatus(`Could not load settings: ${error.message}`, "error");
  });
})();
