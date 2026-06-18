importScripts("config.js", "github.js");

const AUTH_POLL_ALARM = "github-auth-poll";
const MIN_ALARM_MINUTES = 0.5;

function alarmDelayMinutes(seconds) {
  return Math.max(seconds / 60, MIN_ALARM_MINUTES);
}

function getConfig() {
  const config = globalThis.LeetCodeGitHubConfig || {};

  if (!config.clientId || config.clientId === "PASTE_YOUR_GITHUB_OAUTH_CLIENT_ID_HERE") {
    throw new Error("Set your GitHub OAuth App Client ID in config.js.");
  }

  return config;
}

async function startGitHubLogin() {
  const config = getConfig();
  const auth = await globalThis.LeetCodeGitHub.requestDeviceCode(config.clientId, config.scope || "repo");

  await chrome.storage.local.set({
    authStatus: "pending",
    pendingDeviceCode: auth.device_code,
    pendingUserCode: auth.user_code,
    pendingVerificationUri: auth.verification_uri,
    pendingInterval: auth.interval || 5,
    pendingExpiresAt: Date.now() + auth.expires_in * 1000
  });

  chrome.alarms.create(AUTH_POLL_ALARM, {
    delayInMinutes: alarmDelayMinutes(auth.interval || 5),
    periodInMinutes: alarmDelayMinutes(auth.interval || 5)
  });

  await chrome.tabs.create({ url: auth.verification_uri });

  return {
    userCode: auth.user_code,
    verificationUri: auth.verification_uri
  };
}

async function finishGitHubLogin(token) {
  const user = await globalThis.LeetCodeGitHub.getCurrentUser(token);
  const repositories = await globalThis.LeetCodeGitHub.listRepositories(token);

  await chrome.storage.local.set({
    authStatus: "signed-in",
    token,
    username: user.login,
    repositories: repositories.map((repository) => ({
      fullName: repository.full_name,
      owner: repository.owner.login,
      name: repository.name,
      defaultBranch: repository.default_branch || "main",
      writable:
        !repository.permissions ||
        repository.permissions.push ||
        repository.permissions.maintain ||
        repository.permissions.admin
    })),
    pendingDeviceCode: "",
    pendingUserCode: "",
    pendingVerificationUri: "",
    pendingInterval: 0,
    pendingExpiresAt: 0
  });

  chrome.alarms.clear(AUTH_POLL_ALARM);
}

async function pollGitHubLogin() {
  const config = getConfig();
  const settings = await chrome.storage.local.get({
    pendingDeviceCode: "",
    pendingExpiresAt: 0
  });

  if (!settings.pendingDeviceCode) {
    chrome.alarms.clear(AUTH_POLL_ALARM);
    return;
  }

  if (settings.pendingExpiresAt && Date.now() > settings.pendingExpiresAt) {
    await chrome.storage.local.set({ authStatus: "expired" });
    chrome.alarms.clear(AUTH_POLL_ALARM);
    return;
  }

  try {
    const tokenResult = await globalThis.LeetCodeGitHub.pollDeviceToken(
      config.clientId,
      settings.pendingDeviceCode
    );

    await finishGitHubLogin(tokenResult.access_token);
  } catch (error) {
    if (error.code === "authorization_pending") {
      return;
    }

    if (error.code === "slow_down") {
      chrome.alarms.create(AUTH_POLL_ALARM, {
        delayInMinutes: alarmDelayMinutes(10),
        periodInMinutes: alarmDelayMinutes(10)
      });
      return;
    }

    await chrome.storage.local.set({
      authStatus: "error",
      authError: error.message
    });
    chrome.alarms.clear(AUTH_POLL_ALARM);
  }
}

async function refreshRepositories() {
  const settings = await chrome.storage.local.get({ token: "" });

  if (!settings.token) {
    throw new Error("Sign in with GitHub first.");
  }

  await finishGitHubLogin(settings.token);
}

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === "start-github-login") {
    startGitHubLogin().then(sendResponse).catch((error) => {
      sendResponse({ error: error.message });
    });
    return true;
  }

  if (message.type === "refresh-repositories") {
    refreshRepositories().then(() => sendResponse({ ok: true })).catch((error) => {
      sendResponse({ error: error.message });
    });
    return true;
  }

  return false;
});

chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === AUTH_POLL_ALARM) {
    pollGitHubLogin();
  }
});
