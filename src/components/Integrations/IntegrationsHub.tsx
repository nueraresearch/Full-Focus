import React, { useState } from 'react';
import {
  Share2,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Code2,
  FileText,
  Calendar,
  Layers,
  Sparkles,
  Bot,
  Chrome,
  Download,
  Settings,
  Send,
  Sliders,
  Copy,
  Check
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { IntegrationPlatform, PlatformConnection } from '../../types';
import { generateManifestJSON, generatePopupHTML, generatePopupJS } from '../../utils/extensionGenerator';
import { generateClaudePromptBrief, parseAIResponseIntoTasks } from '../../utils/claudeHelper';
import { mcpServersRegistry, generateClaudeDesktopConfig, MCPServerDefinition } from '../../utils/mcpRegistry';
import { triggerHaptic } from '../../utils/androidBridge';

export const IntegrationsHub: React.FC = () => {
  const {
    connections,
    triggerPlatformSync,
    toggleConnection,
    tasks,
    addTask
  } = useApp();

  const [hubTab, setHubTab] = useState<'platforms' | 'mcp'>('platforms');
  const [activeModalPlatform, setActiveModalPlatform] = useState<IntegrationPlatform | null>(null);
  const [selectedMcpServer, setSelectedMcpServer] = useState<MCPServerDefinition | null>(null);
  const [syncingPlatform, setSyncingPlatform] = useState<string | null>(null);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // States for interactive integration modals
  // 1. WordPress (nueraresearch.com)
  const [wpNewDraftTitle, setWpNewDraftTitle] = useState('');
  const [wpPostType, setWpPostType] = useState('Research Paper');
  
  // 2. Claude Brief Generator
  const [selectedTaskIdForClaude, setSelectedTaskIdForClaude] = useState<string>(tasks[0]?.id || '');
  const [claudeBriefContext, setClaudeBriefContext] = useState<'deep_work' | 'nuera_editorial' | 'code_review' | 'executive_summary'>('nuera_editorial');
  const [generatedClaudeBrief, setGeneratedClaudeBrief] = useState('');
  const [claudeImportText, setClaudeImportText] = useState('');

  // 3. GitHub PR importer
  const [ghRepo, setGhRepo] = useState('nuera-core/gateway-service');
  const [ghPrNumber, setGhPrNumber] = useState('');

  const handleSync = async (platform: IntegrationPlatform) => {
    setSyncingPlatform(platform);
    await triggerPlatformSync(platform);
    setSyncingPlatform(null);
  };

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  // Generate Claude prompt on the fly
  const handleGenerateClaudePrompt = () => {
    const task = tasks.find((t) => t.id === selectedTaskIdForClaude);
    if (!task) return;
    const brief = generateClaudePromptBrief(task, claudeBriefContext);
    setGeneratedClaudeBrief(brief);
  };

  // Import Claude extracted tasks
  const handleImportClaudeTasks = () => {
    if (!claudeImportText.trim()) return;
    const parsed = parseAIResponseIntoTasks(claudeImportText, 'claude');
    parsed.forEach((t) => {
      addTask({
        title: t.title || 'Claude AI Subtask',
        platform: 'claude',
        status: 'todo',
        priority: 'P2_HIGH',
        impact: 4,
        effort: 2,
        estimatedMinutes: 45,
        actualMinutes: 0,
        tags: ['claude-extracted'],
        subtasks: []
      });
    });
    setClaudeImportText('');
    setActiveModalPlatform(null);
  };

  // Create WordPress editorial task
  const handleCreateNueraEditorialTask = () => {
    if (!wpNewDraftTitle.trim()) return;
    addTask({
      title: `[Nuera Editorial] ${wpNewDraftTitle.trim()}`,
      description: `Target publication on nueraresearch.com. Category: ${wpPostType}. Complete SEO optimization, chart verification, and executive review.`,
      platform: 'wordpress',
      status: 'todo',
      priority: 'P1_CRITICAL',
      impact: 5,
      effort: 3,
      estimatedMinutes: 90,
      actualMinutes: 0,
      tags: ['nuera-research', 'editorial', 'wordpress'],
      subtasks: [
        { id: `st-${Date.now()}-1`, title: 'Draft research content in WordPress editor', completed: false },
        { id: `st-${Date.now()}-2`, title: 'Audit SEO meta title & description for nueraresearch.com', completed: false },
        { id: `st-${Date.now()}-3`, title: 'Review citations & benchmarks', completed: false },
        { id: `st-${Date.now()}-4`, title: 'Schedule publication date', completed: false }
      ],
      externalRef: {
        platform: 'wordpress',
        url: 'https://nueraresearch.com/wp-admin/',
        postType: wpPostType,
        postStatus: 'draft'
      }
    });
    setWpNewDraftTitle('');
    setActiveModalPlatform(null);
  };

  const getPlatformIcon = (platform: IntegrationPlatform) => {
    switch (platform) {
      case 'wordpress':
        return <FileText className="w-5 h-5 text-sky-400" />;
      case 'github':
        return <Code2 className="w-5 h-5 text-emerald-400" />;
      case 'claude':
        return <Bot className="w-5 h-5 text-amber-400" />;
      case 'm365':
        return <Calendar className="w-5 h-5 text-blue-400" />;
      case 'google':
        return <Layers className="w-5 h-5 text-rose-400" />;
      case 'browser':
        return <Chrome className="w-5 h-5 text-purple-400" />;
      default:
        return <Share2 className="w-5 h-5 text-slate-400" />;
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black tracking-tight text-white font-sans">
            Cross-Platform Integrations Hub
          </h1>
          <p className="text-xs text-slate-400">
            Real-time synchronization across GitHub, WordPress (nueraresearch.com), Microsoft 365, Google Workspace, Chrome/Edge, and Claude.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              connections.forEach((c) => triggerPlatformSync(c.platform));
            }}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-md shadow-indigo-600/30 transition cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Sync All Platforms</span>
          </button>
        </div>
      </div>

      {/* Hub Tabs Header */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-1 bg-slate-900/90 p-1 rounded-xl border border-slate-800 shadow-inner">
          <button
            onClick={() => {
              triggerHaptic('tap');
              setHubTab('platforms');
            }}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
              hubTab === 'platforms'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Connected Platforms & Sync
          </button>
          <button
            onClick={() => {
              triggerHaptic('tap');
              setHubTab('mcp');
            }}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
              hubTab === 'mcp'
                ? 'bg-gradient-to-r from-amber-600 to-indigo-600 text-white shadow-md'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span>MCP Servers (Claude Protocol)</span>
          </button>
        </div>

        {hubTab === 'mcp' && (
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                triggerHaptic('tap');
                const configStr = generateClaudeDesktopConfig();
                copyToClipboard(configStr, 'mcp-config');
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-xs text-slate-300 font-semibold border border-slate-800 transition active:scale-95"
            >
              {copiedKey === 'mcp-config' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3 text-amber-400" />}
              <span>{copiedKey === 'mcp-config' ? 'Copied Config!' : 'Copy claude_desktop_config.json'}</span>
            </button>

            <button
              onClick={() => {
                triggerHaptic('success');
                const configStr = generateClaudeDesktopConfig();
                const blob = new Blob([configStr], { type: 'application/json' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = 'claude_desktop_config.json';
                a.click();
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition active:scale-95"
            >
              <Download className="w-3 h-3" />
              <span>Download Config</span>
            </button>
          </div>
        )}
      </div>

      {/* Render MCP Servers Architecture Tab */}
      {hubTab === 'mcp' ? (
        <div className="space-y-4">
          <div className="bg-gradient-to-r from-amber-950/30 via-slate-900 to-indigo-950/30 border border-amber-500/30 rounded-2xl p-4 sm:p-5 shadow-xl">
            <div className="flex items-start gap-3">
              <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400 shrink-0">
                <Bot className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono font-bold uppercase tracking-wider text-amber-400">
                    Model Context Protocol (MCP) Ecosystem
                  </span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    All 6 Platforms Supported
                  </span>
                </div>
                <h3 className="text-base sm:text-lg font-bold text-white">
                  Yes, MCP servers exist for all of your chosen platforms!
                </h3>
                <p className="text-xs text-slate-300 max-w-3xl leading-relaxed">
                  Claude connects directly to <strong>GitHub</strong>, <strong>WordPress (nueraresearch.com)</strong>, <strong>Microsoft 365</strong>, <strong>Google Workspace</strong>, and <strong>Chrome/Edge</strong> through standard MCP servers via <code className="bg-slate-950 px-1 py-0.5 rounded text-amber-300 font-mono text-[11px]">stdio</code> or <code className="bg-slate-950 px-1 py-0.5 rounded text-amber-300 font-mono text-[11px]">sse</code>. Claude Desktop acts as the primary MCP Host client that seamlessly triggers their automation tools.
                </p>
              </div>
            </div>
          </div>

          {/* MCP Server Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {mcpServersRegistry.map((srv) => (
              <div
                key={srv.id}
                className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4.5 shadow-xl flex flex-col justify-between hover:border-indigo-500/50 transition group"
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="flex items-center gap-2">
                      <div className="p-1.5 rounded-lg bg-slate-950 border border-slate-800">
                        {getPlatformIcon(srv.platform)}
                      </div>
                      <h4 className="text-sm font-bold text-white">{srv.name}</h4>
                    </div>
                    <span
                      className={`text-[9px] font-mono uppercase font-bold px-1.5 py-0.5 rounded border ${
                        srv.status === 'official'
                          ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                          : srv.status === 'native_host'
                          ? 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                          : 'bg-sky-500/10 text-sky-400 border-sky-500/20'
                      }`}
                    >
                      {srv.status.replace('_', ' ')}
                    </span>
                  </div>

                  <p className="text-xs text-slate-400 mt-2 min-h-[32px]">{srv.description}</p>

                  <div className="mt-3 p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-[11px] font-mono text-slate-300 space-y-1">
                    <div className="text-[10px] text-slate-500 uppercase font-bold">Package / Command</div>
                    <div className="text-indigo-400 truncate">{srv.command}</div>
                    <div className="text-[10px] text-slate-500 uppercase font-bold mt-2">Transport</div>
                    <div className="text-slate-300 uppercase">{srv.transport}</div>
                  </div>

                  <div className="mt-3">
                    <div className="text-[11px] font-bold text-slate-300 mb-1.5">
                      Provided Tools ({srv.toolsProvided.length}):
                    </div>
                    <div className="space-y-1">
                      {srv.toolsProvided.slice(0, 3).map((t) => (
                        <div key={t.name} className="flex items-center gap-1.5 text-[11px] text-slate-400">
                          <span className="h-1 w-1 rounded-full bg-indigo-400" />
                          <span className="font-mono text-slate-200">{t.name}</span>
                          <span className="text-[10px] text-slate-500 truncate">- {t.description}</span>
                        </div>
                      ))}
                      {srv.toolsProvided.length > 3 && (
                        <div className="text-[10px] text-indigo-400 font-mono">
                          +{srv.toolsProvided.length - 3} additional tools
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between">
                  <button
                    onClick={() => {
                      triggerHaptic('tap');
                      setSelectedMcpServer(srv);
                    }}
                    className="text-xs font-semibold text-indigo-400 hover:text-indigo-300 transition"
                  >
                    View Config JSON & Tools →
                  </button>

                  <button
                    onClick={() => {
                      triggerHaptic('tap');
                      copyToClipboard(JSON.stringify(srv.sampleConfig, null, 2), srv.id);
                    }}
                    className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition"
                    title="Copy this server's config block"
                  >
                    {copiedKey === srv.id ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        /* Grid of Platform Cards (Original live sync tab) */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {connections.map((conn) => {
          const isSyncing = syncingPlatform === conn.platform;
          return (
            <div
              key={conn.platform}
              className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 shadow-xl flex flex-col justify-between hover:border-slate-700 transition"
            >
              <div>
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2.5">
                    <div className="p-2 rounded-xl bg-slate-950 border border-slate-800">
                      {getPlatformIcon(conn.platform)}
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-white">{conn.name}</h3>
                      <span className="text-[10px] font-mono text-slate-500">
                        {conn.connected ? 'Active Bridge' : 'Offline'}
                      </span>
                    </div>
                  </div>

                  <span
                    className={`h-2.5 w-2.5 rounded-full ${
                      conn.connected ? 'bg-emerald-400 shadow-sm shadow-emerald-400/50' : 'bg-slate-600'
                    }`}
                  />
                </div>

                <p className="text-xs text-slate-400 mt-3 min-h-[36px]">{conn.statusText}</p>

                {conn.details && (
                  <div className="mt-3 pt-3 border-t border-slate-800/80 space-y-1.5 text-[11px] font-mono text-slate-400">
                    {conn.details.siteUrl && (
                      <div className="flex items-center justify-between">
                        <span className="text-slate-500">Target Site:</span>
                        <span className="text-slate-200">{conn.details.siteUrl}</span>
                      </div>
                    )}
                    {conn.details.accountName && (
                      <div className="flex items-center justify-between">
                        <span className="text-slate-500">Account:</span>
                        <span className="text-slate-200 truncate max-w-[150px]">{conn.details.accountName}</span>
                      </div>
                    )}
                    {conn.lastSyncedAt && (
                      <div className="flex items-center justify-between">
                        <span className="text-slate-500">Last Synced:</span>
                        <span className="text-slate-300">
                          {new Date(conn.lastSyncedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between gap-2">
                <button
                  onClick={() => handleSync(conn.platform)}
                  disabled={isSyncing}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-950 hover:bg-slate-800 text-xs text-slate-300 font-semibold border border-slate-800 transition active:scale-95 disabled:opacity-50 cursor-pointer"
                >
                  <RefreshCw className={`w-3 h-3 ${isSyncing ? 'animate-spin text-indigo-400' : ''}`} />
                  <span>{isSyncing ? 'Syncing...' : 'Sync Now'}</span>
                </button>

                <button
                  onClick={() => setActiveModalPlatform(conn.platform)}
                  className="px-3 py-1.5 rounded-xl bg-indigo-600/20 hover:bg-indigo-600/40 text-indigo-300 text-xs font-semibold border border-indigo-500/30 transition cursor-pointer"
                >
                  Configure & Tools
                </button>
              </div>
            </div>
          );
        })}
      </div>
      )}

      {/* PLATFORM CONFIG MODALS */}
      {/* 1. WordPress (nueraresearch.com) Modal */}
      {activeModalPlatform === 'wordpress' && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full p-6 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-sky-400" />
                <h3 className="text-base font-bold text-white">WordPress Integration • nueraresearch.com</h3>
              </div>
              <button onClick={() => setActiveModalPlatform(null)} className="text-slate-400 hover:text-white">✕</button>
            </div>

            <div className="mt-4 space-y-4">
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-300 space-y-1">
                <div className="font-semibold text-sky-400">Target Endpoint:</div>
                <div className="font-mono text-slate-400">https://nueraresearch.com/wp-json/wp/v2/posts</div>
                <div className="text-[11px] text-slate-500 mt-1">
                  Synchronizes post drafts, scheduled publication calendar, author assignments, and word count targets.
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-200 block mb-1">
                  Create Nuera Research Editorial Task
                </label>
                <input
                  type="text"
                  value={wpNewDraftTitle}
                  onChange={(e) => setWpNewDraftTitle(e.target.value)}
                  placeholder="e.g. Autonomous Foundation Models: Q4 Whitepaper"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-sky-500"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-200 block mb-1">Content Category / Type</label>
                <select
                  value={wpPostType}
                  onChange={(e) => setWpPostType(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
                >
                  <option value="Research Paper">Research Paper (Whitepaper)</option>
                  <option value="Executive Brief">Executive Brief & Technical Opinion</option>
                  <option value="Benchmark Analysis">Benchmark Analysis & Case Study</option>
                  <option value="Editorial Announcement">Editorial Announcement</option>
                </select>
              </div>

              <div className="flex items-center justify-between pt-2">
                <a
                  href="https://nueraresearch.com/wp-admin/"
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-1 text-xs text-sky-400 hover:underline"
                >
                  <span>Open nueraresearch.com WP Admin</span>
                  <ExternalLink className="w-3 h-3" />
                </a>

                <button
                  onClick={handleCreateNueraEditorialTask}
                  className="px-4 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold transition"
                >
                  Create & Schedule Task
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 2. Claude AI Prompt Brief Generator Modal */}
      {activeModalPlatform === 'claude' && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-2xl w-full p-6 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Bot className="w-5 h-5 text-amber-400" />
                <h3 className="text-base font-bold text-white">Claude AI Workspace Bridge</h3>
              </div>
              <button onClick={() => setActiveModalPlatform(null)} className="text-slate-400 hover:text-white">✕</button>
            </div>

            <div className="mt-4 space-y-4">
              <p className="text-xs text-slate-400">
                Transform any OrbitFocus task into an executive prompt optimized for Claude 3.7 Sonnet / Opus, or paste Claude outputs to auto-extract prioritized tasks.
              </p>

              {/* Step 1: Select task to brief */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-200 block mb-1">Select Task to Brief</label>
                  <select
                    value={selectedTaskIdForClaude}
                    onChange={(e) => setSelectedTaskIdForClaude(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
                  >
                    {tasks.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.title.slice(0, 45)}...
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-200 block mb-1">Prompt Persona / Goal</label>
                  <select
                    value={claudeBriefContext}
                    onChange={(e) => setClaudeBriefContext(e.target.value as any)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
                  >
                    <option value="nuera_editorial">Nuera Research Technical Editor</option>
                    <option value="code_review">Principal Architect Code Review</option>
                    <option value="executive_summary">Executive Briefing & Synthesis</option>
                    <option value="deep_work">Deep Work Tactical Co-Pilot</option>
                  </select>
                </div>
              </div>

              <button
                onClick={handleGenerateClaudePrompt}
                className="w-full py-2 rounded-xl bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-white text-xs font-bold transition flex items-center justify-center gap-2"
              >
                <Sparkles className="w-4 h-4" />
                <span>Generate Claude Prompt Brief</span>
              </button>

              {/* Generated Brief Box */}
              {generatedClaudeBrief && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs text-slate-400">
                    <span className="font-semibold text-amber-300">Generated Prompt Ready for Claude.ai:</span>
                    <button
                      onClick={() => copyToClipboard(generatedClaudeBrief, 'claude')}
                      className="flex items-center gap-1 text-slate-300 hover:text-white"
                    >
                      {copiedKey === 'claude' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copiedKey === 'claude' ? 'Copied!' : 'Copy to Clipboard'}</span>
                    </button>
                  </div>
                  <textarea
                    readOnly
                    rows={6}
                    value={generatedClaudeBrief}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs font-mono text-slate-300 focus:outline-none"
                  />
                  <div className="flex justify-end">
                    <a
                      href="https://claude.ai"
                      target="_blank"
                      rel="noreferrer"
                      className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-white flex items-center gap-1"
                    >
                      <span>Open Claude.ai</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                </div>
              )}

              {/* Step 2: Import Claude Response */}
              <div className="pt-4 border-t border-slate-800 space-y-2">
                <label className="text-xs font-semibold text-slate-200 block">
                  Paste Claude Response to Auto-Extract Tasks
                </label>
                <textarea
                  rows={3}
                  value={claudeImportText}
                  onChange={(e) => setClaudeImportText(e.target.value)}
                  placeholder="Paste numbered recommendations or action items from Claude chat here..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-slate-200 focus:outline-none focus:border-amber-500"
                />
                <button
                  onClick={handleImportClaudeTasks}
                  disabled={!claudeImportText.trim()}
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-xs font-bold transition"
                >
                  Extract into Priority Queue
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 3. Chrome / Edge Extension Bridge Modal */}
      {activeModalPlatform === 'browser' && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full p-6 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Chrome className="w-5 h-5 text-purple-400" />
                <h3 className="text-base font-bold text-white">Chrome & Microsoft Edge Extension Bridge</h3>
              </div>
              <button onClick={() => setActiveModalPlatform(null)} className="text-slate-400 hover:text-white">✕</button>
            </div>

            <div className="mt-4 space-y-3 text-xs text-slate-300">
              <p>
                Install the OrbitFocus browser extension to capture research tabs, arXiv papers, and URLs into your priority queue with one click.
              </p>

              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                <div className="font-semibold text-purple-400">How to install (takes 15 seconds):</div>
                <ol className="list-decimal pl-4 space-y-1 text-slate-400 text-[11px]">
                  <li>Click "Download Extension Files" below.</li>
                  <li>In Chrome or Edge, navigate to <span className="font-mono text-slate-300">chrome://extensions</span> (or <span className="font-mono text-slate-300">edge://extensions</span>).</li>
                  <li>Toggle <strong>Developer mode</strong> in the top-right corner.</li>
                  <li>Click <strong>Load unpacked</strong> and select the downloaded folder!</li>
                </ol>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  onClick={() => {
                    const manifest = generateManifestJSON(window.location.origin);
                    const popup = generatePopupHTML(window.location.origin);
                    const js = generatePopupJS(window.location.origin);

                    const blob = new Blob([
                      `--- manifest.json ---\n${manifest}\n\n--- popup.html ---\n${popup}\n\n--- popup.js ---\n${js}`
                    ], { type: 'text/plain' });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = 'orbitfocus-browser-extension-files.txt';
                    a.click();
                  }}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold transition cursor-pointer"
                >
                  <Download className="w-4 h-4" />
                  <span>Download Extension Files</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 4. GitHub / M365 / Google Workspace Modals */}
      {(activeModalPlatform === 'github' || activeModalPlatform === 'm365' || activeModalPlatform === 'google') && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                {getPlatformIcon(activeModalPlatform)}
                <h3 className="text-base font-bold text-white capitalize">{activeModalPlatform} Integration</h3>
              </div>
              <button onClick={() => setActiveModalPlatform(null)} className="text-slate-400 hover:text-white">✕</button>
            </div>

            <div className="mt-4 space-y-3 text-xs text-slate-300">
              <p>
                Connected to {activeModalPlatform.toUpperCase()}. All event webhooks and task synchronization are active.
              </p>
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1 text-slate-400 text-[11px] font-mono">
                <div>Status: High-Availability Connected</div>
                <div>Sync Frequency: Every 15 minutes</div>
                <div>Bidirectional Webhook: Enabled</div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  onClick={() => setActiveModalPlatform(null)}
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition"
                >
                  Done
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 5. Selected MCP Server Detail & Config Modal */}
      {selectedMcpServer && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-xl w-full p-5 sm:p-6 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-slate-950 border border-slate-800">
                  {getPlatformIcon(selectedMcpServer.platform)}
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">{selectedMcpServer.name}</h3>
                  <span className="text-[10px] font-mono text-indigo-400">{selectedMcpServer.packageName}</span>
                </div>
              </div>
              <button
                onClick={() => setSelectedMcpServer(null)}
                className="text-slate-400 hover:text-white p-1 rounded-lg"
              >
                ✕
              </button>
            </div>

            <div className="mt-4 space-y-4">
              <p className="text-xs text-slate-300 leading-relaxed">
                {selectedMcpServer.description}
              </p>

              <div>
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="font-bold text-slate-200">Claude Desktop Config Block</span>
                  <button
                    onClick={() => {
                      triggerHaptic('tap');
                      copyToClipboard(JSON.stringify(selectedMcpServer.sampleConfig, null, 2), 'mcp-modal-config');
                    }}
                    className="flex items-center gap-1 text-indigo-400 hover:text-indigo-300 font-mono text-[11px]"
                  >
                    {copiedKey === 'mcp-modal-config' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                    <span>{copiedKey === 'mcp-modal-config' ? 'Copied' : 'Copy JSON'}</span>
                  </button>
                </div>
                <pre className="p-3 bg-slate-950 border border-slate-800 rounded-xl text-xs font-mono text-slate-300 overflow-x-auto">
                  {JSON.stringify(selectedMcpServer.sampleConfig, null, 2)}
                </pre>
              </div>

              <div>
                <span className="text-xs font-bold text-slate-200 block mb-2">
                  Exposed MCP Tools & Functions:
                </span>
                <div className="space-y-2">
                  {selectedMcpServer.toolsProvided.map((tool) => (
                    <div
                      key={tool.name}
                      className="p-2.5 rounded-xl bg-slate-950/70 border border-slate-800/80 text-xs"
                    >
                      <div className="font-mono font-bold text-indigo-400">{tool.name}</div>
                      <div className="text-slate-400 mt-0.5 text-[11px]">{tool.description}</div>
                    </div>
                  ))}
                </div>
              </div>

              {selectedMcpServer.envVarsRequired.length > 0 && (
                <div className="p-3 rounded-xl bg-amber-950/20 border border-amber-500/30 text-xs">
                  <span className="font-bold text-amber-300 block mb-1">Environment Variables Required:</span>
                  <div className="flex flex-wrap gap-1.5">
                    {selectedMcpServer.envVarsRequired.map((env) => (
                      <span key={env} className="px-2 py-0.5 rounded bg-slate-950 font-mono text-[11px] text-amber-200 border border-amber-500/20">
                        {env}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex justify-end pt-2">
                <button
                  onClick={() => setSelectedMcpServer(null)}
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition"
                >
                  Done
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
