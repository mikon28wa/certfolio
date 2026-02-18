/**
 * Manus Debug Collector (agent-friendly)
 *
 * Captures:
 * 1) Console logs
 * 2) Network requests (fetch + XHR)
 * 3) User interactions (semantic uiEvents: click/type/submit/nav/scroll/etc.)
 *
 * Data is periodically sent to /__manus__/logs
 * Note: uiEvents are mirrored to sessionEvents for sessionReplay.log
 */
(function () {
  "use strict";

  if (window.__MANUS_DEBUG_COLLECTOR__) return;

  // ==========================================================================
  // Configuration & Storage
  // ==========================================================================

  var CONFIG = {
    reportEndpoint: "/__manus__/logs",
    bufferSize: { console: 500, network: 200, ui: 500 },
    reportInterval: 2000,
    sensitiveFields: ["password", "token", "secret", "key", "authorization", "cookie", "session"],
    maxBodyLength: 10240,
    uiInputMaxLen: 200,
    uiTextMaxLen: 80,
    scrollThrottleMs: 500,
  };

  var store = {
    consoleLogs: [],
    networkRequests: [],
    uiEvents: [],
    lastReportTime: Date.now(),
    lastScrollTime: 0,
  };

  // ==========================================================================
  // Shared Utilities
  // ==========================================================================

  function sanitizeValue(value, depth) {
    if (depth === void 0) depth = 0;
    if (depth > 5) return "[Max Depth]";
    if (value == null) return value;
    if (typeof value === "string") {
      return value.length > 1000 ? value.slice(0, 1000) + "...[truncated]" : value;
    }
    if (typeof value !== "object") return value;
    if (Array.isArray(value)) {
      return value.slice(0, 100).map(function (v) { return sanitizeValue(v, depth + 1); });
    }
    var out = {};
    for (var k in value) {
      if (!Object.prototype.hasOwnProperty.call(value, k)) continue;
      var isSensitive = CONFIG.sensitiveFields.some(function (f) {
        return k.toLowerCase().indexOf(f) !== -1;
      });
      out[k] = isSensitive ? "[REDACTED]" : sanitizeValue(value[k], depth + 1);
    }
    return out;
  }

  function formatArg(arg) {
    try {
      if (arg instanceof Error) return { type: "Error", message: arg.message, stack: arg.stack };
      if (typeof arg === "object") return sanitizeValue(arg);
      return String(arg);
    } catch (e) {
      return "[Unserializable]";
    }
  }

  function formatArgs(args) {
    var result = [];
    for (var i = 0; i < args.length; i++) result.push(formatArg(args[i]));
    return result;
  }

  function pruneBuffer(buffer, maxSize) {
    if (buffer.length > maxSize) buffer.splice(0, buffer.length - maxSize);
  }

  function tryParseJson(str) {
    if (typeof str !== "string") return str;
    try { return JSON.parse(str); } catch (e) { return str; }
  }

  /** Classify a Content-Type header for body-capture decisions. */
  function classifyContentType(contentType) {
    var ct = (contentType || "").toLowerCase();
    return {
      isStreaming:
        ct.indexOf("text/event-stream") !== -1 ||
        ct.indexOf("application/stream") !== -1 ||
        ct.indexOf("application/x-ndjson") !== -1,
      isBinary:
        ct.indexOf("image/") !== -1 ||
        ct.indexOf("video/") !== -1 ||
        ct.indexOf("audio/") !== -1 ||
        ct.indexOf("application/octet-stream") !== -1 ||
        ct.indexOf("application/pdf") !== -1 ||
        ct.indexOf("application/zip") !== -1,
    };
  }

  /** Decide whether to skip body capture; returns a placeholder string or null. */
  function skipBodyReason(contentType, contentLength) {
    var ct = classifyContentType(contentType);
    if (ct.isStreaming) return "[Streaming response - not captured]";
    if (ct.isBinary) return "[Binary content: " + contentType + "]";
    if (contentLength && parseInt(contentLength, 10) > CONFIG.maxBodyLength) {
      return "[Response too large: " + contentLength + " bytes]";
    }
    return null;
  }

  /** Truncate a text body to CONFIG.maxBodyLength, then sanitize. */
  function captureTextBody(text) {
    if (text.length > CONFIG.maxBodyLength) {
      return text.slice(0, CONFIG.maxBodyLength) + "...[truncated]";
    }
    return sanitizeValue(tryParseJson(text));
  }

  /** Build the reporting payload from current store buffers. */
  function buildPayload(consoleLogs, networkRequests, uiEvents) {
    return {
      timestamp: Date.now(),
      consoleLogs: consoleLogs,
      networkRequests: networkRequests,
      sessionEvents: uiEvents,
      uiEvents: uiEvents,
    };
  }

  // ==========================================================================
  // UI Event Logging (agent-friendly semantic events)
  // ==========================================================================

  function shouldIgnoreTarget(target) {
    try {
      if (!target || !(target instanceof Element)) return false;
      return !!target.closest(".manus-no-record");
    } catch (e) {
      return false;
    }
  }

  function compactText(s, maxLen) {
    try {
      var t = (s || "").trim().replace(/\s+/g, " ");
      return !t ? "" : (t.length > maxLen ? t.slice(0, maxLen) + "\u2026" : t);
    } catch (e) {
      return "";
    }
  }

  function describeElement(el) {
    if (!el || !(el instanceof Element)) return null;
    var attr = function (n) { return el.getAttribute(n); };
    var tag = el.tagName ? el.tagName.toLowerCase() : null;
    var id = el.id || null;
    var testId = attr("data-testid") || attr("data-test-id") || attr("data-test") || null;
    var dataLoc = attr("data-loc") || null;

    var selectorHint = testId
      ? '[data-testid="' + testId + '"]'
      : dataLoc ? '[data-loc="' + dataLoc + '"]'
      : id ? "#" + id
      : tag || "unknown";

    return {
      tag: tag,
      id: id,
      name: attr("name") || null,
      type: tag === "input" ? (attr("type") || "text") : null,
      role: attr("role") || null,
      ariaLabel: attr("aria-label") || null,
      testId: testId,
      dataLoc: dataLoc,
      href: tag === "a" ? (attr("href") || null) : null,
      text: compactText((el.innerText || el.textContent || ""), CONFIG.uiTextMaxLen),
      selectorHint: selectorHint,
    };
  }

  function isSensitiveField(el) {
    if (!el || !(el instanceof Element)) return false;
    var tag = el.tagName ? el.tagName.toLowerCase() : "";
    if (tag !== "input" && tag !== "textarea") return false;
    if ((el.getAttribute("type") || "").toLowerCase() === "password") return true;
    var name = (el.getAttribute("name") || "").toLowerCase();
    var id = (el.id || "").toLowerCase();
    return CONFIG.sensitiveFields.some(function (f) {
      return name.indexOf(f) !== -1 || id.indexOf(f) !== -1;
    });
  }

  function getInputValueSafe(el) {
    if (!el || !(el instanceof Element)) return null;
    var tag = el.tagName ? el.tagName.toLowerCase() : "";
    if (tag !== "input" && tag !== "textarea" && tag !== "select") return null;
    var v = "";
    try { v = el.value != null ? String(el.value) : ""; } catch (e) { v = ""; }
    if (isSensitiveField(el)) return { masked: true, length: v.length };
    return v.length > CONFIG.uiInputMaxLen ? v.slice(0, CONFIG.uiInputMaxLen) + "\u2026" : v;
  }

  function logUiEvent(kind, payload) {
    store.uiEvents.push({
      timestamp: Date.now(),
      kind: kind,
      url: location.href,
      viewport: { width: window.innerWidth, height: window.innerHeight },
      payload: sanitizeValue(payload),
    });
    pruneBuffer(store.uiEvents, CONFIG.bufferSize.ui);
  }

  function logNetworkError(kind, method, url, extra) {
    logUiEvent("network_error", Object.assign({ kind: kind, method: method, url: url }, extra));
  }

  function installUiEventListeners() {
    function on(target, event, handler, opts) {
      target.addEventListener(event, handler, opts || true);
    }

    on(document, "click", function (e) {
      var t = e.target;
      if (shouldIgnoreTarget(t)) return;
      logUiEvent("click", { target: describeElement(t), x: e.clientX, y: e.clientY });
    });

    on(document, "change", function (e) {
      var t = e.target;
      if (shouldIgnoreTarget(t)) return;
      logUiEvent("change", { target: describeElement(t), value: getInputValueSafe(t) });
    });

    on(document, "focusin", function (e) {
      var t = e.target;
      if (shouldIgnoreTarget(t)) return;
      logUiEvent("focusin", { target: describeElement(t) });
    });

    on(document, "focusout", function (e) {
      var t = e.target;
      if (shouldIgnoreTarget(t)) return;
      logUiEvent("focusout", { target: describeElement(t), value: getInputValueSafe(t) });
    });

    on(document, "keydown", function (e) {
      if (e.key !== "Enter" && e.key !== "Escape") return;
      var t = e.target;
      if (shouldIgnoreTarget(t)) return;
      logUiEvent("keydown", { key: e.key, target: describeElement(t) });
    });

    on(document, "submit", function (e) {
      var t = e.target;
      if (shouldIgnoreTarget(t)) return;
      logUiEvent("submit", { target: describeElement(t) });
    });

    on(window, "scroll", function () {
      var now = Date.now();
      if (now - store.lastScrollTime < CONFIG.scrollThrottleMs) return;
      store.lastScrollTime = now;
      logUiEvent("scroll", {
        scrollX: window.scrollX,
        scrollY: window.scrollY,
        documentHeight: document.documentElement.scrollHeight,
        viewportHeight: window.innerHeight,
      });
    }, { passive: true });

    // SPA navigation tracking
    function nav(reason) { logUiEvent("navigate", { reason: reason }); }

    var origPush = history.pushState;
    history.pushState = function () { origPush.apply(this, arguments); nav("pushState"); };

    var origReplace = history.replaceState;
    history.replaceState = function () { origReplace.apply(this, arguments); nav("replaceState"); };

    on(window, "popstate", function () { nav("popstate"); });
    on(window, "hashchange", function () { nav("hashchange"); });
  }

  // ==========================================================================
  // Console Interception
  // ==========================================================================

  var originalConsole = {};
  ["log", "debug", "info", "warn", "error"].forEach(function (method) {
    originalConsole[method] = console[method].bind(console);
    console[method] = function () {
      var args = Array.prototype.slice.call(arguments);
      store.consoleLogs.push({
        timestamp: Date.now(),
        level: method.toUpperCase(),
        args: formatArgs(args),
        stack: method === "error" ? new Error().stack : null,
      });
      pruneBuffer(store.consoleLogs, CONFIG.bufferSize.console);
      originalConsole[method].apply(console, args);
    };
  });

  function logConsoleError(type, message, stack, extra) {
    store.consoleLogs.push({
      timestamp: Date.now(),
      level: "ERROR",
      args: [Object.assign({ type: type, message: message, stack: stack }, extra)],
      stack: stack,
    });
    pruneBuffer(store.consoleLogs, CONFIG.bufferSize.console);
  }

  window.addEventListener("error", function (event) {
    logConsoleError("UncaughtError", event.message, event.error ? event.error.stack : null, {
      filename: event.filename,
      lineno: event.lineno,
      colno: event.colno,
    });
    logUiEvent("error", {
      message: event.message,
      filename: event.filename,
      lineno: event.lineno,
      colno: event.colno,
    });
  });

  window.addEventListener("unhandledrejection", function (event) {
    var reason = event.reason;
    var msg = reason && reason.message ? reason.message : String(reason);
    var stack = reason && reason.stack ? reason.stack : null;
    logConsoleError("UnhandledRejection", msg, stack);
    logUiEvent("unhandledrejection", { reason: msg });
  });

  // ==========================================================================
  // Fetch Interception
  // ==========================================================================

  var originalFetch = window.fetch.bind(window);

  window.fetch = function (input, init) {
    init = init || {};
    var startTime = Date.now();
    var url = typeof input === "string"
      ? input
      : (input && (input.url || input.href || String(input))) || "";
    var method = (init.method || (input && input.method) || "GET").toUpperCase();

    if (url.indexOf("/__manus__/") === 0) return originalFetch(input, init);

    var requestHeaders = {};
    try {
      if (init.headers) requestHeaders = Object.fromEntries(new Headers(init.headers).entries());
    } catch (e) {
      requestHeaders = { _parseError: true };
    }

    var entry = {
      timestamp: startTime,
      type: "fetch",
      method: method,
      url: url,
      request: {
        headers: requestHeaders,
        body: init.body ? sanitizeValue(tryParseJson(init.body)) : null,
      },
      response: null,
      duration: null,
      error: null,
    };

    return originalFetch(input, init)
      .then(function (response) {
        entry.duration = Date.now() - startTime;
        var contentType = response.headers.get("content-type") || "";
        var contentLength = response.headers.get("content-length");

        entry.response = {
          status: response.status,
          statusText: response.statusText,
          headers: Object.fromEntries(response.headers.entries()),
          body: null,
        };

        if (response.status >= 400) {
          logNetworkError("fetch", method, url, {
            status: response.status,
            statusText: response.statusText,
          });
        }

        var skip = skipBodyReason(contentType, contentLength);
        if (skip) {
          entry.response.body = skip;
          store.networkRequests.push(entry);
          pruneBuffer(store.networkRequests, CONFIG.bufferSize.network);
          return response;
        }

        var clonedResponse = response.clone();
        clonedResponse.text()
          .then(function (text) { entry.response.body = captureTextBody(text); })
          .catch(function () { entry.response.body = "[Unable to read body]"; })
          .finally(function () {
            store.networkRequests.push(entry);
            pruneBuffer(store.networkRequests, CONFIG.bufferSize.network);
          });

        return response;
      })
      .catch(function (error) {
        entry.duration = Date.now() - startTime;
        entry.error = { message: error.message, stack: error.stack };
        store.networkRequests.push(entry);
        pruneBuffer(store.networkRequests, CONFIG.bufferSize.network);
        logNetworkError("fetch", method, url, { message: error.message });
        throw error;
      });
  };

  // ==========================================================================
  // XHR Interception
  // ==========================================================================

  var originalXHROpen = XMLHttpRequest.prototype.open;
  var originalXHRSend = XMLHttpRequest.prototype.send;

  XMLHttpRequest.prototype.open = function (method, url) {
    this._manusData = { method: (method || "GET").toUpperCase(), url: url, startTime: null };
    return originalXHROpen.apply(this, arguments);
  };

  XMLHttpRequest.prototype.send = function (body) {
    var xhr = this;
    if (xhr._manusData && xhr._manusData.url && xhr._manusData.url.indexOf("/__manus__/") !== 0) {
      xhr._manusData.startTime = Date.now();
      xhr._manusData.requestBody = body ? sanitizeValue(tryParseJson(body)) : null;

      xhr.addEventListener("load", function () {
        var contentType = xhr.getResponseHeader("content-type") || "";
        var skip = skipBodyReason(contentType, null);
        var responseBody;

        if (skip) {
          responseBody = skip;
        } else {
          try {
            responseBody = captureTextBody(xhr.responseText || "");
          } catch (e) {
            responseBody = "[Unable to read response: " + e.message + "]";
          }
        }

        var entry = {
          timestamp: xhr._manusData.startTime,
          type: "xhr",
          method: xhr._manusData.method,
          url: xhr._manusData.url,
          request: { body: xhr._manusData.requestBody },
          response: { status: xhr.status, statusText: xhr.statusText, body: responseBody },
          duration: Date.now() - xhr._manusData.startTime,
          error: null,
        };

        store.networkRequests.push(entry);
        pruneBuffer(store.networkRequests, CONFIG.bufferSize.network);

        if (xhr.status >= 400) {
          logNetworkError("xhr", entry.method, entry.url, {
            status: xhr.status,
            statusText: xhr.statusText,
          });
        }
      });

      xhr.addEventListener("error", function () {
        var entry = {
          timestamp: xhr._manusData.startTime,
          type: "xhr",
          method: xhr._manusData.method,
          url: xhr._manusData.url,
          request: { body: xhr._manusData.requestBody },
          response: null,
          duration: Date.now() - xhr._manusData.startTime,
          error: { message: "Network error" },
        };
        store.networkRequests.push(entry);
        pruneBuffer(store.networkRequests, CONFIG.bufferSize.network);
        logNetworkError("xhr", entry.method, entry.url, { message: "Network error" });
      });
    }

    return originalXHRSend.apply(this, arguments);
  };

  // ==========================================================================
  // Data Reporting
  // ==========================================================================

  function reportLogs() {
    var consoleLogs = store.consoleLogs.splice(0);
    var networkRequests = store.networkRequests.splice(0);
    var uiEvents = store.uiEvents.splice(0);

    if (consoleLogs.length === 0 && networkRequests.length === 0 && uiEvents.length === 0) {
      return Promise.resolve();
    }

    return originalFetch(CONFIG.reportEndpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(buildPayload(consoleLogs, networkRequests, uiEvents)),
    }).catch(function () {
      store.consoleLogs = consoleLogs.concat(store.consoleLogs);
      store.networkRequests = networkRequests.concat(store.networkRequests);
      store.uiEvents = uiEvents.concat(store.uiEvents);
      pruneBuffer(store.consoleLogs, CONFIG.bufferSize.console);
      pruneBuffer(store.networkRequests, CONFIG.bufferSize.network);
      pruneBuffer(store.uiEvents, CONFIG.bufferSize.ui);
    });
  }

  setInterval(reportLogs, CONFIG.reportInterval);

  window.addEventListener("beforeunload", function () {
    var consoleLogs = store.consoleLogs;
    var networkRequests = store.networkRequests;
    var uiEvents = store.uiEvents;

    if (consoleLogs.length === 0 && networkRequests.length === 0 && uiEvents.length === 0) return;

    var payload = buildPayload(consoleLogs, networkRequests, uiEvents);

    if (navigator.sendBeacon) {
      var payloadStr = JSON.stringify(payload);
      var MAX_BEACON_SIZE = 60000;
      if (payloadStr.length > MAX_BEACON_SIZE) {
        payloadStr = JSON.stringify(buildPayload(
          consoleLogs.slice(-50),
          networkRequests.slice(-20),
          uiEvents.slice(-100)
        ));
        payload._truncated = true;
      }
      navigator.sendBeacon(CONFIG.reportEndpoint, payloadStr);
    }
  });

  // ==========================================================================
  // Initialization
  // ==========================================================================

  try { installUiEventListeners(); } catch (e) {
    console.warn("[Manus] Failed to install UI listeners:", e);
  }

  window.__MANUS_DEBUG_COLLECTOR__ = {
    version: "2.1-refactored",
    store: store,
    forceReport: reportLogs,
  };

  console.debug("[Manus] Debug collector initialized (no rrweb, UI events only)");
})();
