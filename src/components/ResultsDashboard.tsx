import React, { useState } from 'react';
import { Candidate, ElectionInfo, ElectionState, Voter } from '../types';
import { sound } from '../utils/audio';
import { Award, Trophy, Scale, Users, CheckCircle2, TrendingUp, Download, Sparkles, AlertCircle, RefreshCw, BarChart2, Shield } from 'lucide-react';

interface ResultsDashboardProps {
  election: ElectionInfo;
  candidates: Candidate[];
  voters: Voter[];
  onGetWinner: () => {
    winningId: number;
    winningName: string;
    winningVotes: number;
    isTie: boolean;
    tiedCandidates: Candidate[];
    winnerCandidate?: Candidate;
  };
  onEndElection?: () => void;
}

export const ResultsDashboard: React.FC<ResultsDashboardProps> = ({
  election,
  candidates,
  voters,
  onGetWinner,
}) => {
  const [copied, setCopied] = useState(false);
  const result = onGetWinner();

  const totalRegistered = voters.filter((v) => v.isRegistered).length;
  const turnoutPercent = totalRegistered > 0 ? Math.round((election.totalVotes / totalRegistered) * 100) : 0;

  // Sort candidates by vote count descending
  const sortedCandidates = [...candidates].sort((a, b) => b.voteCount - a.voteCount);
  const highestVotes = sortedCandidates.length > 0 ? sortedCandidates[0].voteCount : 0;

  const handleExportJSON = () => {
    sound.playClick();
    const report = {
      electionName: election.name,
      description: election.description,
      state: election.state === ElectionState.ENDED ? 'ENDED' : election.state === ElectionState.ACTIVE ? 'ACTIVE' : 'NOT_STARTED',
      totalRegisteredVoters: totalRegistered,
      totalVotesCast: election.totalVotes,
      turnoutPercentage: `${turnoutPercent}%`,
      winner: {
        winningId: result.winningId,
        winningName: result.winningName,
        votes: result.winningVotes,
        isTie: result.isTie,
      },
      candidates: candidates.map((c) => ({
        id: c.id,
        name: c.name,
        party: c.party,
        voteCount: c.voteCount,
        percentage: election.totalVotes > 0 ? ((c.voteCount / election.totalVotes) * 100).toFixed(2) + '%' : '0%',
      })),
      timestamp: new Date().toISOString(),
      disclaimer: 'Educational Blockchain Project Prototype - Not for official governmental elections.',
    };

    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(report, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `election-results-${Date.now()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <div className="space-y-6">
      {/* Top Header & Export Controls */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Award className="w-5 h-5 text-amber-600" />
            <h2 className="text-lg font-bold text-slate-900">Election Results & Tally Board</h2>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Automated Smart Contract vote tally with zero manual counting overhead.
          </p>
        </div>

        <button
          onClick={handleExportJSON}
          className="flex items-center gap-2 px-3.5 py-2 bg-white hover:bg-sky-50 text-slate-700 border border-sky-200 rounded-xl text-xs font-bold transition-all cursor-pointer shadow-xs"
        >
          <Download className="w-4 h-4 text-sky-600" />
          Export Audit Report (JSON)
        </button>
      </div>

      {/* Official Winner Banner / Status Card */}
      {election.state === ElectionState.ENDED ? (
        result.isTie ? (
          <div className="bg-amber-50 border border-amber-300 rounded-2xl p-6 shadow-sm">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-amber-100 border border-amber-300 flex items-center justify-center text-amber-700 shrink-0 shadow-sm">
                  <Scale className="w-8 h-8" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded bg-amber-100 text-amber-900 border border-amber-300 text-[11px] font-bold font-mono">
                      OFFICIAL OUTCOME: TIE DETECTED
                    </span>
                  </div>
                  <h3 className="text-xl font-bold text-amber-950 mt-1">Deadlock Between Top Candidates</h3>
                  <p className="text-xs text-amber-800 mt-1">
                    The smart contract <code className="font-mono bg-amber-100 px-1 py-0.5 rounded text-amber-900 font-bold">getWinner()</code> algorithm resolved a tie with {result.winningVotes} votes each.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 bg-white border border-amber-300 rounded-xl p-3 shadow-xs">
                <div className="text-xs text-right">
                  <div className="text-slate-500">Tied Candidates:</div>
                  <div className="font-bold text-slate-900">
                    {result.tiedCandidates.map((c) => c.name).join(' & ')}
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : result.winnerCandidate ? (
          <div className="bg-gradient-to-r from-sky-500 via-sky-600 to-indigo-600 text-white rounded-2xl p-6 shadow-lg shadow-sky-500/20">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-xs border border-white/40 flex items-center justify-center text-amber-300 shrink-0 shadow-lg font-black">
                  <Trophy className="w-8 h-8" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded bg-white/20 text-white border border-white/30 text-[11px] font-bold font-mono flex items-center gap-1">
                      <Sparkles className="w-3 h-3 text-amber-300" />
                      OFFICIAL DECLARED WINNER
                    </span>
                  </div>
                  <h3 className="text-2xl font-black text-white mt-1">{result.winnerCandidate.name}</h3>
                  <p className="text-xs text-sky-100 font-medium">{result.winnerCandidate.party}</p>
                </div>
              </div>

              <div className="bg-white/10 backdrop-blur-xs border border-white/20 rounded-xl p-4 text-center md:text-right">
                <span className="text-[11px] uppercase tracking-wider text-sky-100 font-mono">Winning Tally</span>
                <div className="text-2xl font-black text-amber-300 mt-0.5">
                  {result.winningVotes} <span className="text-xs text-white font-normal">Votes</span>
                </div>
                <span className="text-[11px] text-emerald-200 font-bold">
                  {election.totalVotes > 0 ? Math.round((result.winningVotes / election.totalVotes) * 100) : 0}% of Total Ballots
                </span>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-white border border-sky-100 rounded-xl p-5 text-slate-500 text-xs flex items-center gap-3 shadow-xs">
            <AlertCircle className="w-5 h-5 text-slate-400 shrink-0" />
            <span>No votes were cast before the election was closed.</span>
          </div>
        )
      ) : (
        <div className="bg-sky-50 border border-sky-200 rounded-xl p-4 flex items-center justify-between gap-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-3 h-3 rounded-full bg-emerald-500 animate-ping"></div>
            <div>
              <p className="text-xs font-bold text-slate-900">
                {election.state === ElectionState.ACTIVE ? 'Live Election in Progress' : 'Election in Setup Mode'}
              </p>
              <p className="text-xs text-slate-600">
                Official winner declaration is sealed until the Election Authority calls <code className="text-sky-700 font-mono font-bold">endElection()</code>.
              </p>
            </div>
          </div>
          <span className="text-xs font-mono text-sky-900 font-bold px-2.5 py-1 bg-white rounded-lg border border-sky-200 shadow-2xs">
            Phase: {election.state === ElectionState.ACTIVE ? 'ACTIVE (1)' : 'NOT_STARTED (0)'}
          </span>
        </div>
      )}

      {/* Participation & Turnout Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white border border-sky-100 rounded-xl p-4 shadow-xs">
          <span className="text-[11px] text-slate-500 uppercase tracking-wider font-bold">Voter Turnout</span>
          <div className="text-2xl font-black text-slate-900 mt-1">{turnoutPercent}%</div>
          <div className="w-full bg-sky-100 rounded-full h-1.5 mt-3 overflow-hidden">
            <div
              className="bg-sky-600 h-1.5 rounded-full transition-all duration-500"
              style={{ width: `${Math.min(turnoutPercent, 100)}%` }}
            ></div>
          </div>
        </div>

        <div className="bg-white border border-sky-100 rounded-xl p-4 shadow-xs">
          <span className="text-[11px] text-slate-500 uppercase tracking-wider font-bold">Ballots Cast</span>
          <div className="text-2xl font-black text-slate-900 mt-1">
            {election.totalVotes} <span className="text-xs text-slate-500 font-normal">/ {totalRegistered} registered</span>
          </div>
          <p className="text-[11px] text-slate-500 mt-2 font-medium">{totalRegistered - election.totalVotes} voters pending</p>
        </div>

        <div className="bg-white border border-sky-100 rounded-xl p-4 shadow-xs">
          <span className="text-[11px] text-slate-500 uppercase tracking-wider font-bold">Counting Integrity</span>
          <div className="text-2xl font-black text-emerald-600 mt-1">100% On-Chain</div>
          <p className="text-[11px] text-slate-500 mt-2 font-medium">Deterministic EVM state counting</p>
        </div>
      </div>

      {/* Detailed Candidate Tally Breakdown */}
      <div className="bg-white border border-sky-100 rounded-xl p-5 space-y-4 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BarChart2 className="w-4 h-4 text-sky-600" />
            <h3 className="text-sm font-bold text-slate-900">Candidate Vote Breakdown</h3>
          </div>
          <span className="text-xs text-slate-500 font-medium">Total Valid Ballots: {election.totalVotes}</span>
        </div>

        <div className="space-y-4">
          {sortedCandidates.map((c, index) => {
            const percentage = election.totalVotes > 0 ? Math.round((c.voteCount / election.totalVotes) * 100) : 0;
            const isWinner = election.state === ElectionState.ENDED && !result.isTie && result.winningId === c.id;

            return (
              <div
                key={c.id}
                className={`bg-sky-50/40 border rounded-xl p-4 transition-all ${
                  isWinner ? 'border-amber-400 bg-amber-50/40 shadow-xs' : 'border-sky-200'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                  <div className="flex items-center gap-3">
                    <span className="w-6 text-xs font-mono font-bold text-slate-400">#{index + 1}</span>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-slate-900">{c.name}</span>
                        {isWinner && (
                          <span className="px-1.5 py-0.2 rounded bg-amber-100 text-amber-900 border border-amber-300 text-[10px] font-bold">
                            WINNER 👑
                          </span>
                        )}
                      </div>
                      <span className="text-xs text-indigo-600 font-semibold">{c.party}</span>
                    </div>
                  </div>

                  <div className="text-left sm:text-right">
                    <span className="text-base font-bold text-slate-900">{c.voteCount}</span>
                    <span className="text-xs text-slate-500 ml-1">({percentage}%)</span>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="w-full bg-sky-100 rounded-full h-2 overflow-hidden mt-2">
                  <div
                    className={`h-2 rounded-full transition-all duration-700 ${
                      isWinner
                        ? 'bg-gradient-to-r from-amber-500 to-yellow-400'
                        : 'bg-gradient-to-r from-sky-500 to-indigo-600'
                    }`}
                    style={{ width: `${Math.max(percentage, 2)}%` }}
                  ></div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
