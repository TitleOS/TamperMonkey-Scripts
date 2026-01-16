// ==UserScript==
// @name         Xbox Live Synesis Dashboard Hotpatching
// @namespace    http://tampermonkey.net/
// @version      1.0
// @description  Removes auth overlay and attempts to load a dashboard on Synesis, compatible with prod, dev and ppe.
// @author       TItleOS
// @match        https://synesis.*.soteria.xboxlive.com/dashboards
// @grant        unsafeWindow
// @run-at       document-idle
// ==/UserScript==

(function() {
    'use strict';

    // We use a timer to wait until the 'powerbiConfig' object exists on the page
    const checkExist = setInterval(function() {
        if (typeof unsafeWindow.powerbiConfig !== 'undefined') {
            console.log("powerbiConfig found. Starting script...");
            clearInterval(checkExist);
            runAutomation();
        }
    }, 500); // Check every 500ms

    function runAutomation() {
        // 1. Delete the div with class="auth-overlay"
        const overlay = document.querySelector('.auth-overlay');
        if (overlay) {
            overlay.remove();
            console.log("Overlay removed.");
        } else {
            console.log("No auth-overlay found.");
        }

        // 2. Define const pbConfig = powerbiConfig (Accessing global scope via unsafeWindow)
        const pbConfig = unsafeWindow.powerbiConfig;

        // 3. Log keys from reports
        let firstKey = null;
        const reports = pbConfig.reports || {};

        for (const [key, reportData] of Object.entries(reports)) {
            console.log("Report Key:", key);
            // Capture the first key found
            if (!firstKey) {
                firstKey = key;
            }
        }

        // 4. Execute loadDashboard passing the first key
        if (firstKey && typeof unsafeWindow.loadDashboard === 'function') {
            console.log("Executing loadDashboard with key:", firstKey);
            unsafeWindow.loadDashboard(firstKey);
        } else {
            console.error("Cannot load dashboard: Either no key found or loadDashboard function is missing.");
        }

        // 5. Define powerbiConfig.tenantId
        console.log("Setting Tenant ID...");
        unsafeWindow.powerbiConfig.tenantId = "6bd375ef-1e9d-459e-b34e-5f52afb2af34";

        // 6. Execute retryCurrentDashboard()
        if (typeof unsafeWindow.retryCurrentDashboard === 'function') {
            console.log("Executing retryCurrentDashboard...");
            unsafeWindow.retryCurrentDashboard();
        } else {
            console.error("retryCurrentDashboard function is missing.");
        }
    }
})();
