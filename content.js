(function () {
  const SUBMIT_DELAY_MS = 1200;
  const OBSERVER_DEBOUNCE_MS = 700;
  const DUPLICATE_COOLDOWN_MS = 45000;
  let lastAcceptedKey = "";
  let lastAcceptedAt = 0;
  let observerTimer = 0;

  function getProblemSlug() {
    const match = window.location.pathname.match(/\/problems\/([^/]+)/);
    return match ? match[1] : "unknown-problem";
  }

  function titleFromSlug(slug) {
    return slug
      .split("-")
      .filter(Boolean)
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  }

  function getProblemTitle() {
    const selectors = [
      "[data-cy='question-title']",
      "a[href^='/problems/']",
      "h1",
      ".text-title-large"
    ];

    for (const selector of selectors) {
      const element = document.querySelector(selector);
      const text = element && element.textContent ? element.textContent.trim() : "";

      if (text && !text.includes("/problems/") && text.length < 140) {
        return text.replace(/^\d+\.\s*/, "");
      }
    }

    return titleFromSlug(getProblemSlug());
  }

  function getLanguage() {
    const selectors = [
      "[data-cy='lang-select']",
      "button[aria-haspopup='listbox']",
      "button[id*='headlessui-listbox-button']"
    ];

    for (const selector of selectors) {
      const element = document.querySelector(selector);
      const text = element && element.textContent ? element.textContent.trim() : "";

      if (text && text.length < 40) {
        return text;
      }
    }

    const pageText = document.body.innerText;
    const knownLanguages = [
      "C++",
      "Java",
      "Python3",
      "Python",
      "JavaScript",
      "TypeScript",
      "C#",
      "Go",
      "Ruby",
      "Swift",
      "Kotlin",
      "Rust",
      "PHP"
    ];

    return knownLanguages.find((language) => pageText.includes(language)) || "text";
  }

  function getCodeFromTextareas() {
    const textareas = Array.from(document.querySelectorAll("textarea"));

    for (const textarea of textareas) {
      const value = textarea.value.trim();

      if (value.length > 20 && /class|function|def|var|let|const|public|return|#include/.test(value)) {
        return value;
      }
    }

    return "";
  }

  function getCodeFromMonacoDom() {
    const lines = Array.from(document.querySelectorAll(".monaco-editor .view-lines .view-line"));

    if (!lines.length) {
      return "";
    }

    const code = lines
      .map((line) => line.textContent || "")
      .join("\n")
      .trim();

    return code.length > 20 ? code : "";
  }

  function getSubmittedCode() {
    return getCodeFromTextareas() || getCodeFromMonacoDom();
  }

  function hasAcceptedResult() {
    const candidates = Array.from(
      document.querySelectorAll(
        "[data-e2e-locator*='submission'], [class*='result'], [class*='status'], [data-cy*='result'], div, span"
      )
    );

    return candidates.some((element) => {
      const text = (element.textContent || "").trim();
      return text === "Accepted" || /^Accepted\s*\d*/.test(text);
    });
  }

  function isoTimestampForPath(date) {
    return date.toISOString().replace(/[:.]/g, "-");
  }

  function markdownForSubmission(details) {
    const codeFenceLanguage = details.language.toLowerCase().replace(/[^a-z0-9#+-]/g, "");
    const code = details.code || "Code was not detected.";

    return [
      `# ${details.title}`,
      "",
      `- LeetCode URL: ${details.url}`,
      `- Status: ${details.status}`,
      `- Language: ${details.language}`,
      `- Timestamp: ${details.timestamp}`,
      "",
      "## Code",
      "",
      `\`\`\`${codeFenceLanguage}`,
      code,
      "```",
      ""
    ].join("\n");
  }

  async function loadSettings() {
    return chrome.storage.local.get({
      token: "",
      username: "",
      repo: "",
      branch: "main"
    });
  }

  async function syncAcceptedSubmission() {
    const slug = getProblemSlug();
    const title = getProblemTitle();
    const now = new Date();
    const timestamp = now.toISOString();
    const pathTimestamp = isoTimestampForPath(now);
    const uniqueKey = `${slug}:${pathTimestamp}`;

    if (Date.now() - lastAcceptedAt < DUPLICATE_COOLDOWN_MS) {
      return;
    }

    lastAcceptedKey = uniqueKey;
    lastAcceptedAt = Date.now();

    const settings = await loadSettings();
    const code = getSubmittedCode();

    if (!settings.token) {
      console.error("[LeetCode to GitHub] Token missing. Save it in the extension popup.");
      return;
    }

    if (!settings.username || !settings.repo) {
      console.error("[LeetCode to GitHub] GitHub username or repo missing. Save them in the extension popup.");
      return;
    }

    if (!code) {
      console.warn("[LeetCode to GitHub] Submitted code was not detected. A note will be saved instead.");
    }

    const details = {
      title,
      url: window.location.href,
      status: "Accepted",
      language: getLanguage(),
      timestamp,
      code
    };

    const path = `solutions/${slug}/${pathTimestamp}.md`;
    const content = markdownForSubmission(details);

    await window.LeetCodeGitHub.createFile({
      token: settings.token,
      username: settings.username,
      repo: settings.repo,
      branch: settings.branch || "main",
      path,
      content,
      message: `Solve ${title}`
    });

    console.info(`[LeetCode to GitHub] Saved accepted submission to ${path}.`);
  }

  function scheduleAcceptedCheck() {
    window.clearTimeout(observerTimer);

    observerTimer = window.setTimeout(() => {
      if (!hasAcceptedResult()) {
        return;
      }

      window.setTimeout(() => {
        syncAcceptedSubmission().catch((error) => {
          console.error("[LeetCode to GitHub] Could not sync submission:", error);
        });
      }, SUBMIT_DELAY_MS);
    }, OBSERVER_DEBOUNCE_MS);
  }

  const observer = new MutationObserver(scheduleAcceptedCheck);
  observer.observe(document.body, {
    childList: true,
    subtree: true,
    characterData: true
  });

  scheduleAcceptedCheck();
})();
