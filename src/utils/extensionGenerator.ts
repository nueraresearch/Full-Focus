/**
 * Generates ready-to-load Chrome / Microsoft Edge Extension files
 * for one-click tab and research capture into OrbitFocus.
 */

export function generateManifestJSON(appUrl: string): string {
  return JSON.stringify(
    {
      manifest_version: 3,
      name: "OrbitFocus Web Bridge",
      version: "1.0.0",
      description: "Instantly capture research tabs, GitHub PRs, and WordPress content directly into OrbitFocus.",
      permissions: ["activeTab", "scripting", "storage"],
      action: {
        default_title: "Send to OrbitFocus",
        default_popup: "popup.html",
      },
      icons: {
        "16": "icon.png",
        "48": "icon.png",
        "128": "icon.png"
      }
    },
    null,
    2
  );
}

export function generatePopupHTML(appUrl: string): string {
  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { width: 320px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #0f172a; color: #f8fafc; padding: 14px; margin: 0; }
    h2 { font-size: 14px; font-weight: 700; color: #38bdf8; margin: 0 0 10px 0; display: flex; align-items: center; gap: 6px; }
    input, textarea, select { width: 100%; box-sizing: border-box; background: #1e293b; border: 1px solid #334155; border-radius: 6px; color: #fff; padding: 8px; font-size: 12px; margin-bottom: 8px; }
    button { width: 100%; background: #6366f1; color: white; border: none; border-radius: 6px; padding: 8px 12px; font-weight: 600; cursor: pointer; transition: background 0.2s; }
    button:hover { background: #4f46e5; }
    .status { font-size: 11px; color: #94a3b8; margin-top: 6px; text-align: center; }
  </style>
</head>
<body>
  <h2>🚀 OrbitFocus Quick Capture</h2>
  <input id="title" placeholder="Task title..." />
  <select id="platform">
    <option value="browser">🌐 Chrome / Edge Tab</option>
    <option value="github">🐙 GitHub</option>
    <option value="wordpress">📰 WordPress (Nuera Research)</option>
    <option value="claude">🤖 Claude AI Brief</option>
  </select>
  <textarea id="desc" rows="2" placeholder="Notes / context..."></textarea>
  <button id="captureBtn">Add to Priority Queue</button>
  <div id="status" class="status">Capturing active tab...</div>
  <script src="popup.js"></script>
</body>
</html>`;
}

export function generatePopupJS(appUrl: string): string {
  return `chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
  const currentTab = tabs[0];
  if (!currentTab) return;

  const titleInput = document.getElementById('title');
  const descInput = document.getElementById('desc');
  const platformSelect = document.getElementById('platform');
  const statusDiv = document.getElementById('status');
  
  titleInput.value = currentTab.title || '';
  descInput.value = currentTab.url || '';

  if (currentTab.url.includes('github.com')) {
    platformSelect.value = 'github';
  } else if (currentTab.url.includes('nueraresearch.com') || currentTab.url.includes('wp-admin')) {
    platformSelect.value = 'wordpress';
  } else if (currentTab.url.includes('claude.ai')) {
    platformSelect.value = 'claude';
  }

  statusDiv.innerText = 'Ready to send to OrbitFocus';

  document.getElementById('captureBtn').addEventListener('click', function() {
    const payload = {
      title: titleInput.value,
      description: descInput.value,
      url: currentTab.url,
      platform: platformSelect.value,
      timestamp: new Date().toISOString()
    };

    // Store in chrome storage or dispatch to OrbitFocus webhook
    chrome.storage.local.get({ orbitQueue: [] }, function(result) {
      const queue = result.orbitQueue;
      queue.push(payload);
      chrome.storage.local.set({ orbitQueue: queue }, function() {
        statusDiv.innerText = '✓ Captured to OrbitFocus!';
        statusDiv.style.color = '#34d399';
        setTimeout(() => window.close(), 1000);
      });
    });
  });
});`;
}

/**
 * Intelligent URL / clipboard text parser to detect workflow items
 */
export function parseQuickCaptureText(input: string): {
  title: string;
  url?: string;
  platform: 'github' | 'wordpress' | 'claude' | 'm365' | 'google' | 'browser' | 'general';
  suggestedPriority: 'P1_CRITICAL' | 'P2_HIGH' | 'P3_MEDIUM' | 'P4_LOW';
  tags: string[];
} {
  const trimmed = input.trim();
  const urlMatch = trimmed.match(/https?:\/\/[^\s]+/i);
  const foundUrl = urlMatch ? urlMatch[0] : undefined;

  let platform: 'github' | 'wordpress' | 'claude' | 'm365' | 'google' | 'browser' | 'general' = 'general';
  let suggestedPriority: 'P1_CRITICAL' | 'P2_HIGH' | 'P3_MEDIUM' | 'P4_LOW' = 'P3_MEDIUM';
  const tags: string[] = [];

  if (foundUrl) {
    if (foundUrl.includes('github.com')) {
      platform = 'github';
      tags.push('github', 'code');
      if (foundUrl.includes('/pull/')) tags.push('pr-review');
      if (foundUrl.includes('/issues/')) tags.push('issue');
    } else if (foundUrl.includes('nueraresearch.com') || foundUrl.includes('wp-admin')) {
      platform = 'wordpress';
      tags.push('nuera-research', 'editorial');
    } else if (foundUrl.includes('claude.ai')) {
      platform = 'claude';
      tags.push('claude-ai', 'prompt');
    } else if (foundUrl.includes('teams.microsoft.com') || foundUrl.includes('outlook.office.com')) {
      platform = 'm365';
      tags.push('m365');
    } else if (foundUrl.includes('google.com') || foundUrl.includes('calendar.google') || foundUrl.includes('docs.google')) {
      platform = 'google';
      tags.push('google-workspace');
    } else {
      platform = 'browser';
      tags.push('research', 'tab');
    }
  }

  // Detect urgent keywords in text
  const lower = trimmed.toLowerCase();
  if (lower.includes('urgent') || lower.includes('asap') || lower.includes('critical') || lower.includes('deadline today') || lower.includes('p1')) {
    suggestedPriority = 'P1_CRITICAL';
  } else if (lower.includes('high priority') || lower.includes('important') || lower.includes('eod') || lower.includes('p2')) {
    suggestedPriority = 'P2_HIGH';
  }

  // Extract clean title
  let cleanTitle = trimmed;
  if (foundUrl && trimmed === foundUrl) {
    // If text was only URL, craft an informative title
    try {
      const parsed = new URL(foundUrl);
      cleanTitle = `Review ${parsed.hostname}${parsed.pathname.slice(0, 30)}`;
    } catch {
      cleanTitle = `Inspect link: ${foundUrl.slice(0, 35)}`;
    }
  }

  return {
    title: cleanTitle,
    url: foundUrl,
    platform,
    suggestedPriority,
    tags
  };
}
