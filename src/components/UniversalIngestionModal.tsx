import React, { useState } from 'react';
import {
  Inbox,
  X,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  Clock,
  ArrowRight,
  Mail,
  MessageSquare,
  Users,
  Bot,
  Layers,
  Target,
  FileCheck,
  Check
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { triggerHaptic } from '../utils/androidBridge';
import { IngestedArtifact } from '../types';

interface UniversalIngestionModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const UniversalIngestionModal: React.FC<UniversalIngestionModalProps> = ({ isOpen, onClose }) => {
  const { ingestText, isIngesting, applyIngestedAction } = useApp();

  const [rawText, setRawText] = useState('');
  const [sourceType, setSourceType] = useState<'email' | 'sms' | 'conversation' | 'claude_chat' | 'teams_slack' | 'meeting_transcript'>('email');
  const [analysisResult, setAnalysisResult] = useState<IngestedArtifact | null>(null);

  if (!isOpen) return null;

  const samplePresets = [
    {
      title: 'Nuera Research Editorial Email',
      source: 'email' as const,
      text: `From: editor@nueraresearch.com
Subject: Autonomous Foundation Models draft update & new milestone

Hey team,
Good news! We have completed the benchmark section for the Foundation Models Whitepaper. The initial charts are verified and inserted into WordPress draft #1042.

However, the peer review feedback from Dr. Aris requires a new deliverable: We need a dedicated goal to "Publish Nuera Research Autonomous Systems Intelligence Report" by October 18th.

Action items:
- Review and finalize the abstract proofread by tomorrow 5pm (P1 Critical)
- Prepare executive summary slides for stakeholder signoff
- Target publish date is locked for this Friday afternoon.`
    },
    {
      title: 'GitHub PR & Release Slack Thread',
      source: 'teams_slack' as const,
      text: `Lead Engineer (10:14 AM):
Just merged PR #142 into main! CI performance tests passed with 99.98% throughput. The High-Throughput Event Ingestion worker is now deployed to staging.

Next step:
- Need someone to address the Dependabot Security Advisory in the auth service within the next 8 hours. High priority CVE.
- Also, let's set a goal: "Complete Production Core Architecture v2.4 Rollout" by Wednesday next week.`
    },
    {
      title: 'Client Partner Steering Transcript',
      source: 'meeting_transcript' as const,
      text: `TRANSCRIPT EXCERPT:
[00:14:20] Director: "Let's align on Q4 milestones. The Microsoft 365 executive steering deck needs review before Friday."
[00:15:05] Partner: "Agreed. We also need to schedule a dedicated 60-minute Google Workspace roadmap sync next Tuesday."
[00:16:30] Director: "Goal for this month: Enterprise Q4 Partner Deliverables & Stakeholder Sign-Off. Target date is October 24th."`
    }
  ];

  const handleRunAnalysis = async () => {
    if (!rawText.trim() || isIngesting) return;
    const result = await ingestText(rawText, sourceType);
    if (result) {
      setAnalysisResult(result);
    }
  };

  const handleApply = () => {
    if (!analysisResult) return;
    applyIngestedAction(analysisResult);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-700/80 rounded-2xl max-w-3xl w-full p-4 sm:p-6 shadow-2xl my-6 flex flex-col max-h-[92vh]">
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-gradient-to-tr from-indigo-500 to-sky-400 text-white shrink-0">
              <Inbox className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-bold text-white">Universal Ingestion & Verification Engine</h2>
              <p className="text-[11px] text-slate-400">
                Ingest emails, SMS, meeting notes, and human/AI conversations to auto-populate goals & verify deadlines.
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              triggerHaptic('tap');
              onClose();
            }}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Content Scroll Area */}
        <div className="flex-1 overflow-y-auto py-4 space-y-4 text-xs">
          {/* Quick Presets */}
          <div>
            <span className="text-[11px] font-semibold text-slate-300 block mb-1.5">
              Quick Test Presets (Click to load):
            </span>
            <div className="flex flex-wrap gap-2">
              {samplePresets.map((preset, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    triggerHaptic('tap');
                    setRawText(preset.text);
                    setSourceType(preset.source);
                    setAnalysisResult(null);
                  }}
                  className="px-2.5 py-1.5 rounded-xl bg-slate-950 hover:bg-slate-800 text-slate-300 border border-slate-800 text-[11px] transition active:scale-95"
                >
                  {preset.title}
                </button>
              ))}
            </div>
          </div>

          {/* Source Type Selector */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {[
              { id: 'email', label: 'Email Thread', icon: Mail },
              { id: 'sms', label: 'SMS / WhatsApp', icon: MessageSquare },
              { id: 'teams_slack', label: 'Slack / Teams', icon: Users },
              { id: 'meeting_transcript', label: 'Human / AI Call', icon: Bot }
            ].map((s) => {
              const Icon = s.icon;
              return (
                <button
                  key={s.id}
                  onClick={() => setSourceType(s.id as any)}
                  className={`p-2 rounded-xl text-left border flex items-center gap-2 transition ${
                    sourceType === s.id
                      ? 'bg-indigo-600/20 border-indigo-500 text-white font-bold'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5 shrink-0" />
                  <span className="text-[11px] truncate">{s.label}</span>
                </button>
              );
            })}
          </div>

          {/* Text Area */}
          <div>
            <label className="text-[11px] font-semibold text-slate-300 block mb-1">
              Raw Communication Text / Transcript
            </label>
            <textarea
              rows={5}
              value={rawText}
              onChange={(e) => setRawText(e.target.value)}
              placeholder="Paste email bodies, client transcripts, SMS logs, or external AI outputs here..."
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-indigo-500 font-mono"
            />
          </div>

          {/* Ingest Action Button */}
          <button
            onClick={handleRunAnalysis}
            disabled={!rawText.trim() || isIngesting}
            className="w-full py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 via-indigo-500 to-sky-500 hover:opacity-95 text-white text-xs font-bold shadow-lg shadow-indigo-600/30 transition disabled:opacity-40 flex items-center justify-center gap-2 cursor-pointer active:scale-98"
          >
            <Sparkles className={`w-4 h-4 ${isIngesting ? 'animate-spin' : ''}`} />
            <span>{isIngesting ? 'Analyzing Communication & Deadlines...' : 'Ingest & Verify Milestones with AI'}</span>
          </button>

          {/* Analysis Results Display */}
          {analysisResult && (
            <div className="space-y-3.5 p-4 rounded-xl bg-slate-950 border border-indigo-500/30 animate-in fade-in">
              <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                <span className="text-xs font-bold text-white flex items-center gap-1.5">
                  <FileCheck className="w-4 h-4 text-emerald-400" />
                  <span>AI Ingestion Findings</span>
                </span>
                <span className="text-[10px] font-mono text-indigo-400">
                  {analysisResult.extractedGoals.length} Goals • {analysisResult.extractedTasks.length} Tasks • {analysisResult.completedVerifications.length} Verifications
                </span>
              </div>

              {/* Deadline & Goal Hit Verifications */}
              {analysisResult.completedVerifications.length > 0 && (
                <div className="space-y-2">
                  <span className="text-[11px] font-bold text-amber-300 block">
                    Goal & Deadline Verifications (Commitments Hit or Delayed):
                  </span>
                  {analysisResult.completedVerifications.map((v, idx) => (
                    <div
                      key={idx}
                      className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs space-y-1"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-200">{v.matchedTaskTitle || 'Matched Commitment'}</span>
                        <span
                          className={`px-1.5 py-0.5 rounded text-[9px] font-bold uppercase font-mono ${
                            v.status === 'hit_and_completed'
                              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                              : v.status === 'deadline_risk'
                              ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                              : 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                          }`}
                        >
                          {v.status.replace(/_/g, ' ')}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400 italic">"{v.evidenceSnippet}"</p>
                      <div className="text-[10px] text-indigo-400 font-medium">Action: {v.recommendedAction}</div>
                    </div>
                  ))}
                </div>
              )}

              {/* Extracted Goals */}
              {analysisResult.extractedGoals.length > 0 && (
                <div className="space-y-1.5">
                  <span className="text-[11px] font-bold text-slate-300 block">
                    Extracted Strategic Objectives:
                  </span>
                  {analysisResult.extractedGoals.map((g, idx) => (
                    <div key={idx} className="p-2 rounded-lg bg-slate-900 border border-slate-800/80 flex items-center justify-between text-xs">
                      <div>
                        <span className="font-semibold text-slate-200">{g.title}</span>
                        <span className="text-[10px] text-slate-500 ml-2 font-mono">Target: {g.targetDate || 'TBD'}</span>
                      </div>
                      <span className="text-[10px] font-mono text-emerald-400">{(g.confidence * 100).toFixed(0)}% Match</span>
                    </div>
                  ))}
                </div>
              )}

              {/* Extracted Tasks */}
              {analysisResult.extractedTasks.length > 0 && (
                <div className="space-y-1.5">
                  <span className="text-[11px] font-bold text-slate-300 block">
                    Extracted Actionable Tasks & Sprints:
                  </span>
                  {analysisResult.extractedTasks.map((t, idx) => (
                    <div key={idx} className="p-2 rounded-lg bg-slate-900 border border-slate-800/80 flex items-center justify-between text-xs">
                      <div>
                        <span className="font-semibold text-slate-200">{t.title}</span>
                        <span className="text-[10px] text-slate-500 ml-2 font-mono">({t.platform.toUpperCase()} • {t.priority})</span>
                      </div>
                      <span className="text-[10px] font-mono text-indigo-400">{t.estimatedMinutes}m</span>
                    </div>
                  ))}
                </div>
              )}

              {/* Apply Button */}
              <div className="pt-2 flex justify-end">
                <button
                  onClick={handleApply}
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-md shadow-emerald-600/30 transition active:scale-95 cursor-pointer flex items-center gap-1.5"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>Apply & Sync All Changes to OrbitFocus</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
