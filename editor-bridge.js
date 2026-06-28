(function () {
  const REQUEST_EVENT = "leetcode-github:request-code";
  const RESPONSE_EVENT = "leetcode-github:code-response";

  function getMonaco() {
    if (window.monaco && window.monaco.editor) {
      return window.monaco;
    }

    if (typeof window.require === "function") {
      try {
        const editorModule = window.require("vs/editor/editor.main");
        if (editorModule && editorModule.editor) {
          return editorModule;
        }
      } catch (_error) {
        // Monaco may still be loading or may not be exposed through its AMD loader.
      }
    }

    return null;
  }

  function getFullEditorCode() {
    const monaco = getMonaco();
    const models =
      monaco && monaco.editor && typeof monaco.editor.getModels === "function"
        ? monaco.editor.getModels()
        : [];

    return models
      .map((model) => (typeof model.getValue === "function" ? model.getValue() : ""))
      .filter((value) => value.trim().length > 20)
      .sort((left, right) => right.length - left.length)[0] || "";
  }

  document.addEventListener(REQUEST_EVENT, (event) => {
    const requestId = event.detail;

    document.dispatchEvent(
      new CustomEvent(RESPONSE_EVENT, {
        detail: JSON.stringify({
          requestId,
          code: getFullEditorCode()
        })
      })
    );
  });
})();
