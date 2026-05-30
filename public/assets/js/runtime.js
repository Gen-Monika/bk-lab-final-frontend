(function () {
  const storageKeys = {
    backend: "ciallolab.backendApiPrefix",
    bkvision: "ciallolab.bkvisionDashboardUrl",
  };

  function trimTrailingSlash(value) {
    return String(value || "").trim().replace(/\/+$/, "");
  }

  function configuredBackend() {
    const stored = trimTrailingSlash(window.localStorage.getItem(storageKeys.backend));
    if (stored) return stored;
    const config = window.__APP_CONFIG__ || {};
    return trimTrailingSlash(config.backendApiPrefix || "");
  }

  function configuredBasePath() {
    const config = window.__APP_CONFIG__ || {};
    const basePath = String(config.basePath || "").trim();
    return basePath;
  }

  function inferredBasePath() {
    const firstSegment = window.location.pathname.split("/").filter(Boolean)[0] || "";
    return /^(stag|prod)--/.test(firstSegment) ? `/${firstSegment}/` : "/";
  }

  function appBasePath() {
    const basePath = configuredBasePath() || inferredBasePath();
    return basePath.endsWith("/") ? basePath : `${basePath}/`;
  }

  function runtimeScriptUrl() {
    const current = document.currentScript;
    if (current && current.src) return current.src;
    const scripts = Array.prototype.slice.call(document.getElementsByTagName("script"));
    const runtimeScript = scripts.filter((script) => (
      script.src && script.src.indexOf("assets/js/runtime.js") !== -1
    )).pop();
    return runtimeScript && runtimeScript.src ? runtimeScript.src : "";
  }

  function scriptAssetBase() {
    const scriptUrl = runtimeScriptUrl();
    if (!scriptUrl) return "";
    try {
      return new URL("../../", scriptUrl).href;
    } catch (error) {
      return "";
    }
  }

  function inferredBackend() {
    const firstSegment = window.location.pathname.split("/").filter(Boolean)[0] || "";
    if (/^(stag|prod)--/.test(firstSegment)) {
      return `${window.location.origin}/${firstSegment.replace(/-frontend$/, "")}`;
    }
    if (["localhost", "127.0.0.1", "::1"].includes(window.location.hostname)) {
      return "http://127.0.0.1:8005";
    }
    return window.location.origin;
  }

  function backendBase() {
    return configuredBackend() || inferredBackend();
  }

  function apiUrl(path) {
    const route = String(path || "").startsWith("/") ? path : `/${path}`;
    return `${backendBase()}${route}`;
  }

  function assetUrl(path) {
    const rawPath = String(path || "").trim();
    if (/^(https?:)?\/\//.test(rawPath) || rawPath.indexOf("data:") === 0) {
      return rawPath;
    }
    const assetPath = rawPath.replace(/^(\.\/|\.\.\/)+/, "").replace(/^\/+/, "");
    const base = scriptAssetBase();
    if (base) {
      try {
        return new URL(assetPath, base).href;
      } catch (error) {
        return `${appBasePath()}${assetPath}`;
      }
    }
    return `${appBasePath()}${assetPath}`;
  }

  function rewriteAssetAttributes() {
    document.querySelectorAll("img[src]").forEach((image) => {
      const src = image.getAttribute("src") || "";
      if (/^(\.\/|\.\.\/)*assets\//.test(src)) {
        image.setAttribute("src", assetUrl(src));
      }
    });
  }

  function configuredBkvisionUrl() {
    const stored = trimTrailingSlash(window.localStorage.getItem(storageKeys.bkvision));
    if (stored) return stored;
    const config = window.__APP_CONFIG__ || {};
    return trimTrailingSlash(config.bkvisionDashboardUrl || "");
  }

  function saveRuntimeSettings() {
    const currentBackend = configuredBackend() || backendBase();
    const nextBackend = window.prompt("Backend API prefix", currentBackend);
    if (nextBackend !== null) {
      const normalized = trimTrailingSlash(nextBackend);
      if (normalized) {
        window.localStorage.setItem(storageKeys.backend, normalized);
      } else {
        window.localStorage.removeItem(storageKeys.backend);
      }
    }

    const currentBkvision = configuredBkvisionUrl();
    const nextBkvision = window.prompt("BKVision dashboard URL", currentBkvision);
    if (nextBkvision !== null) {
      const normalized = trimTrailingSlash(nextBkvision);
      if (normalized) {
        window.localStorage.setItem(storageKeys.bkvision, normalized);
      } else {
        window.localStorage.removeItem(storageKeys.bkvision);
      }
    }

    window.location.reload();
  }

  function initRuntimeSettingsButtons() {
    document.querySelectorAll("[data-backend-settings]").forEach((button) => {
      button.addEventListener("click", saveRuntimeSettings);
    });
  }

  window.FinalApp = {
    apiUrl,
    assetUrl,
    assetBase: scriptAssetBase,
    backendBase,
    getBkvisionUrl: configuredBkvisionUrl,
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", () => {
      initRuntimeSettingsButtons();
      rewriteAssetAttributes();
    });
  } else {
    initRuntimeSettingsButtons();
    rewriteAssetAttributes();
  }
})();
