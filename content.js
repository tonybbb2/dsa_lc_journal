(function () {
  const SUBMIT_DELAY_MS = 1200;
  const OBSERVER_DEBOUNCE_MS = 700;
  let pendingSubmission = null;
  let lastSyncedSubmissionId = "";
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

  function getResultCandidates() {
    return Array.from(
      document.querySelectorAll(
        "[data-e2e-locator*='submission'], [class*='result'], [class*='status'], [data-cy*='result'], div, span"
      )
    );
  }

  function getAcceptedResultSignature() {
    const candidates = Array.from(
      document.querySelectorAll(
        "[data-e2e-locator*='submission'], [class*='result'], [class*='status'], [data-cy*='result'], div, span"
      )
    );

    for (const element of candidates) {
      const text = (element.textContent || "").trim();

      if ((text === "Accepted" || /^Accepted\s*\d*/.test(text)) && text.length < 500) {
        return text;
      }
    }

    return "";
  }

  function hasResultChangedAfterSubmit() {
    const statusPattern =
      /^(Pending|Running|Judging|Compile Error|Wrong Answer|Runtime Error|Time Limit Exceeded|Memory Limit Exceeded|Output Limit Exceeded)/i;

    return getResultCandidates().some((element) => {
      const text = (element.textContent || "").trim();
      return text.length < 500 && statusPattern.test(text);
    });
  }

  function startSubmissionCycle() {
    pendingSubmission = {
      id: `${getProblemSlug()}:${Date.now()}`,
      initialAcceptedSignature: getAcceptedResultSignature(),
      sawResultChange: false,
      synced: false
    };

    scheduleAcceptedCheck();
  }

  function isSubmitAction(target) {
    const control = target.closest("button, [role='button'], a");

    if (!control) {
      return false;
    }

    const text = (control.textContent || "").trim();
    const ariaLabel = (control.getAttribute("aria-label") || "").trim();
    const locator = (control.getAttribute("data-e2e-locator") || "").trim();

    return (
      /^submit$/i.test(text) ||
      /^submit$/i.test(ariaLabel) ||
      locator.toLowerCase().includes("submit")
    );
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
      branch: "main",
      lastSyncedSubmissionFingerprint: ""
    });
  }

  async function saveSyncedFingerprint(fingerprint) {
    await chrome.storage.local.set({
      lastSyncedSubmissionFingerprint: fingerprint
    });
  }

  function getSubmissionFingerprint(slug, language, code) {
    return [slug, language, code || "Code was not detected."].join("\n---\n");
  }

  async function syncAcceptedSubmission(submissionId) {
    if (!pendingSubmission || pendingSubmission.id !== submissionId || lastSyncedSubmissionId === submissionId) {
      return;
    }

    lastSyncedSubmissionId = submissionId;
    pendingSubmission.synced = true;

    const slug = getProblemSlug();
    const title = getProblemTitle();
    const now = new Date();
    const timestamp = now.toISOString();
    const pathTimestamp = isoTimestampForPath(now);

    const settings = await loadSettings();
    const code = getSubmittedCode();
    const language = getLanguage();
    const fingerprint = getSubmissionFingerprint(slug, language, code);

    if (!settings.token) {
      console.error("[LeetCode to GitHub] Token missing. Save it in the extension popup.");
      return;
    }

    if (!settings.username || !settings.repo) {
      console.error("[LeetCode to GitHub] GitHub username or repo missing. Save them in the extension popup.");
      return;
    }

    if (settings.lastSyncedSubmissionFingerprint === fingerprint) {
      console.info("[LeetCode to GitHub] Skipped duplicate accepted submission.");
      pendingSubmission = null;
      return;
    }

    if (!code) {
      console.warn("[LeetCode to GitHub] Submitted code was not detected. A note will be saved instead.");
    }

    const details = {
      title,
      url: window.location.href,
      status: "Accepted",
      language,
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
    await saveSyncedFingerprint(fingerprint);
    pendingSubmission = null;
  }

  function scheduleAcceptedCheck() {
    if (!pendingSubmission || pendingSubmission.synced) {
      return;
    }

    window.clearTimeout(observerTimer);

    observerTimer = window.setTimeout(() => {
      if (!pendingSubmission || pendingSubmission.synced) {
        return;
      }

      if (hasResultChangedAfterSubmit()) {
        pendingSubmission.sawResultChange = true;
      }

      const acceptedSignature = getAcceptedResultSignature();

      if (!acceptedSignature) {
        return;
      }

      if (!pendingSubmission.sawResultChange && acceptedSignature === pendingSubmission.initialAcceptedSignature) {
        return;
      }

      const submissionId = pendingSubmission.id;

      window.setTimeout(() => {
        syncAcceptedSubmission(submissionId).catch((error) => {
          console.error("[LeetCode to GitHub] Could not sync submission:", error);
        });
      }, SUBMIT_DELAY_MS);
    }, OBSERVER_DEBOUNCE_MS);
  }

  document.addEventListener(
    "click",
    (event) => {
      if (isSubmitAction(event.target)) {
        startSubmissionCycle();
      }
    },
    true
  );

  const observer = new MutationObserver(scheduleAcceptedCheck);
  observer.observe(document.body, {
    childList: true,
    subtree: true,
    characterData: true
  });
})();
