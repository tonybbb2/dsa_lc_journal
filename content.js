(function () {
  const SUBMIT_DELAY_MS = 1200;
  const OBSERVER_DEBOUNCE_MS = 700;
  const SAME_STATUS_FALLBACK_MS = 4000;
  const FINAL_STATUSES = [
    "Accepted",
    "Wrong Answer",
    "Compile Error",
    "Runtime Error",
    "Time Limit Exceeded",
    "Memory Limit Exceeded",
    "Output Limit Exceeded",
    "Presentation Error"
  ];
  const IN_PROGRESS_STATUSES = ["Pending", "Running", "Judging"];
  let pendingSubmission = null;
  let lastSyncedSubmissionId = "";
  let observerTimer = 0;
  let currentLocation = window.location.href;

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

  function getFinalResult() {
    const candidates = getResultCandidates();
    for (const element of candidates) {
      const text = (element.textContent || "").trim();
      const status = FINAL_STATUSES.find((candidate) => {
        return text === candidate || text.startsWith(`${candidate}\n`) || text.startsWith(`${candidate} `);
      });

      if (status && text.length < 500) {
        return {
          status,
          signature: text
        };
      }
    }

    return null;
  }

  function hasResultChangedAfterSubmit() {
    return getResultCandidates().some((element) => {
      const text = (element.textContent || "").trim();
      return (
        text.length < 500 &&
        IN_PROGRESS_STATUSES.some((status) => {
          return text === status || text.startsWith(`${status}\n`) || text.startsWith(`${status} `);
        })
      );
    });
  }

  function startSubmissionCycle() {
    const finalResult = getFinalResult();

    pendingSubmission = {
      id: `${getProblemSlug()}:${Date.now()}`,
      slug: getProblemSlug(),
      url: window.location.href,
      submittedAt: Date.now(),
      initialFinalSignature: finalResult ? finalResult.signature : "",
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
    const testId = (control.getAttribute("data-testid") || "").trim();
    const id = (control.id || "").trim();
    const submitAttributePattern = /(^|[-_\s])submit($|[-_\s])/i;

    return (
      /^submit$/i.test(text) ||
      /^submit$/i.test(ariaLabel) ||
      submitAttributePattern.test(locator) ||
      submitAttributePattern.test(testId) ||
      submitAttributePattern.test(id)
    );
  }

  function isoTimestampForPath(date) {
    return date.toISOString().replace(/[:.]/g, "-");
  }

  function solutionMarkdown(details) {
    const codeFenceLanguage = details.language.toLowerCase().replace(/[^a-z0-9#+-]/g, "");
    const code = details.code || "Code was not detected.";

    return [`\`\`\`${codeFenceLanguage}`, code, "```", ""].join("\n");
  }

  function summaryMarkdown(details) {
    return [
      `# ${details.title}`,
      "",
      `- LeetCode URL: ${details.url}`,
      `- Status: ${details.status}`,
      `- Language: ${details.language}`,
      `- Timestamp: ${details.timestamp}`,
      `- Problem slug: ${details.slug}`,
      `- Code detected: ${details.codeDetected ? "Yes" : "No"}`,
      "",
      "## Files",
      "",
      "- `summary.md`: human-readable submission summary",
      "- `data.json`: structured submission data for analysis",
      "- `solution.md`: submitted solution only",
      ""
    ].join("\n");
  }

  function dataJson(details) {
    return `${JSON.stringify(
      {
        schemaVersion: 1,
        problem: {
          title: details.title,
          slug: details.slug,
          url: details.url
        },
        submission: {
          status: details.status,
          language: details.language,
          timestamp: details.timestamp,
          codeDetected: details.codeDetected,
          codeLength: details.code ? details.code.length : 0
        },
        files: {
          summary: "summary.md",
          data: "data.json",
          solution: "solution.md"
        }
      },
      null,
      2
    )}\n`;
  }

  async function loadSettings() {
    return chrome.storage.local.get({
      token: "",
      username: "",
      repo: "",
      branch: "main"
    });
  }

  async function syncSubmission(submissionId, finalStatus) {
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

    if (pendingSubmission.slug !== slug) {
      pendingSubmission = null;
      return;
    }

    const settings = await loadSettings();
    const code = getSubmittedCode();
    const language = getLanguage();

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
      slug,
      url: window.location.href,
      status: finalStatus,
      language,
      timestamp,
      code,
      codeDetected: Boolean(code)
    };

    const basePath = `solutions/${slug}/${pathTimestamp}`;
    const files = [
      {
        path: `${basePath}/summary.md`,
        content: summaryMarkdown(details)
      },
      {
        path: `${basePath}/data.json`,
        content: dataJson(details)
      },
      {
        path: `${basePath}/solution.md`,
        content: solutionMarkdown(details)
      }
    ];

    await window.LeetCodeGitHub.createFiles({
      token: settings.token,
      username: settings.username,
      repo: settings.repo,
      branch: settings.branch || "main",
      files,
      message: `${finalStatus}: ${title}`
    });

    console.info(`[LeetCode to GitHub] Saved ${finalStatus} submission to ${basePath}.`);
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

      if (pendingSubmission.slug !== getProblemSlug()) {
        pendingSubmission = null;
        return;
      }

      const finalResult = getFinalResult();

      if (!finalResult) {
        return;
      }

      const sameVisibleResult = finalResult.signature === pendingSubmission.initialFinalSignature;
      const waitedLongEnough = Date.now() - pendingSubmission.submittedAt >= SAME_STATUS_FALLBACK_MS;

      if (!pendingSubmission.sawResultChange && sameVisibleResult && !waitedLongEnough) {
        scheduleAcceptedCheck();
        return;
      }

      const submissionId = pendingSubmission.id;
      const finalStatus = finalResult.status;

      window.setTimeout(() => {
        syncSubmission(submissionId, finalStatus).catch((error) => {
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

  function resetPendingOnNavigation() {
    if (currentLocation === window.location.href) {
      return;
    }

    currentLocation = window.location.href;
    pendingSubmission = null;
    window.clearTimeout(observerTimer);
  }

  const originalPushState = history.pushState;
  history.pushState = function () {
    originalPushState.apply(this, arguments);
    resetPendingOnNavigation();
  };

  const originalReplaceState = history.replaceState;
  history.replaceState = function () {
    originalReplaceState.apply(this, arguments);
    resetPendingOnNavigation();
  };

  window.addEventListener("popstate", resetPendingOnNavigation);

  const observer = new MutationObserver(scheduleAcceptedCheck);
  observer.observe(document.body, {
    childList: true,
    subtree: true,
    characterData: true
  });
})();
