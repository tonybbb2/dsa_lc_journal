# LeetCode Accepted to GitHub

Chrome Extension Manifest V3 extension that saves accepted LeetCode submissions to a GitHub repository. Each accepted submission creates a new Markdown file, which also creates a GitHub contribution.

## What It Does

- Runs on `https://leetcode.com/problems/*`.
- Watches the page for an `Accepted` submission result.
- Collects the problem title, problem slug, LeetCode URL, detected language, timestamp, and editor code when available.
- Creates a new file with the GitHub REST API.
- Stores extension settings in Chrome local storage.
- Uses a unique timestamp filename, so it does not delete or overwrite existing files.

Files are created at:

```text
solutions/{problem-slug}/{timestamp}.md
```

Example commit message:

```text
Solve Two Sum
```

## Files

```text
manifest.json   Chrome extension manifest
popup.html      Settings popup UI
popup.js        Saves GitHub token and repo settings
content.js      Detects accepted LeetCode submissions
github.js       Creates files with the GitHub REST API
README.md       Setup and testing instructions
```

## Install Locally

1. Open Chrome and go to `chrome://extensions`.
2. Turn on `Developer mode`.
3. Click `Load unpacked`.
4. Select this repository folder.
5. Pin or open the extension popup.

## Sign In With GitHub

This extension supports GitHub login with the OAuth device flow. There is still no backend and no client secret in the extension.

You need a GitHub OAuth App client ID:

1. Go to GitHub settings.
2. Open `Developer settings`.
3. Open `OAuth Apps`.
4. Create a new OAuth App.
5. Use any local homepage URL, such as `http://localhost`.
6. Enable `Device flow` in the OAuth App settings.
7. Copy the OAuth App `Client ID`.

Then in the extension popup:

1. Paste the `Client ID`.
2. Click `Sign in with GitHub`.
3. Enter the displayed code on the GitHub page that opens.
4. Return to the extension popup.
5. Click `Complete login`.
6. Choose the repository you want submissions to sync into.

The login asks for the `repo` scope so the extension can list repositories and create files in the selected repository.

## Manual Token Fallback

1. Go to GitHub settings.
2. Open `Developer settings`.
3. Open `Personal access tokens`.
4. Create a fine-grained token.
5. Select the target repository.
6. Give the token repository `Contents` permission with `Read and write` access.
7. Copy the token.

Classic personal access tokens can also work if they have the `repo` scope, but a fine-grained token limited to one repository is safer.

## Configure The Extension

Open the extension popup and enter:

- GitHub OAuth App client ID, then sign in and choose a repository
- Or a GitHub personal access token, username, and repository name
- Branch name, usually `main`

Choosing a repository saves the repo settings automatically. Click `Save settings` after manual edits.

Settings are stored in Chrome local storage on your machine. There is no backend.

## Test With LeetCode

1. Open a problem on `https://leetcode.com/problems/...`.
2. Submit a solution.
3. Wait for the result panel to show `Accepted`.
4. Open the browser DevTools console if you want to see sync messages.
5. Check your GitHub repository for a new file under `solutions/{problem-slug}/`.

## Error Handling

The extension logs errors in the page console:

- Missing token
- Missing GitHub username or repository name
- GitHub API errors
- Code not detected

If code cannot be detected from the LeetCode editor, the extension still creates the Markdown file and writes `Code was not detected.` inside the code block.

## Notes

- Failed submissions are not synced.
- Advanced stats are not included.
- Screen recording is not used.
- Existing files are not overwritten because every accepted submission uses a unique timestamp filename.
