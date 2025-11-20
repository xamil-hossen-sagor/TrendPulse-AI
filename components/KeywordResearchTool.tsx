
import React, { useState } from 'react';
import { fetchRelatedKeywords } from '../services/geminiService';
import { RelatedKeyword, LoadingState } from '../types';

export const KeywordResearchTool: React.FC = () => {
  const [seed, setSeed] = useState('');
  const [results, setResults] = useState<RelatedKeyword[]>([]);
  const [status, setStatus] = useState<LoadingState>(LoadingState.IDLE);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!seed.trim()) return;

    setStatus(LoadingState.LOADING);
    try {
      const data = await fetchRelatedKeywords(seed);
      setResults(data);
      setStatus(LoadingState.SUCCESS);
    } catch (error) {
      setStatus(LoadingState.ERROR);
    }
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
      <div className="mb-6">
        <h3 className="text-xl font-bold text-white mb-2">Deep Dive Research</h3>
        <p className="text-slate-400 text-sm">
          Enter a seed keyword to discover related long-tail opportunities and metrics.
        </p>
      </div>

      <form onSubmit={handleSearch} className="flex gap-3 mb-6">
        <input
          type="text"
          value={seed}
          onChange={(e) => setSeed(e.target.value)}
          placeholder="Enter a topic (e.g. 'solar charger')"
          className="flex-1 bg-slate-800 border border-slate-700 text-white rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder-slate-500"
        />
        <button
          type="submit"
          disabled={status === LoadingState.LOADING || !seed.trim()}
          className="px-6 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
        >
          {status === LoadingState.LOADING ? (
            <>
              <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Analyzing
            </>
          ) : (
            'Analyze'
          )}
        </button>
      </form>

      {status === LoadingState.ERROR && (
        <div className="text-red-400 text-sm mb-4 bg-red-900/20 p-3 rounded-lg border border-red-900/50">
          Failed to fetch data. Please try again.
        </div>
      )}

      <div className="overflow-hidden rounded-xl border border-slate-800">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-800/80 text-slate-300">
            <tr>
              <th className="px-4 py-3 font-medium">Keyword</th>
              <th className="px-4 py-3 font-medium">Topic Match</th>
              <th className="px-4 py-3 font-medium">Est. Volume</th>
              <th className="px-4 py-3 font-medium">Competition</th>
              <th className="px-4 py-3 font-medium">CPC</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800 bg-slate-900/50">
            {results.length > 0 ? (
              results.map((item, idx) => (
                <tr key={idx} className="hover:bg-slate-800/30 transition-colors">
                  <td className="px-4 py-3 text-white font-medium">
                    <a 
                      href={`https://www.google.com/search?q=${encodeURIComponent(item.keyword)}`}
                      target="_blank"
                      rel="noreferrer"
                      className="hover:text-blue-400 hover:underline decoration-blue-400 underline-offset-2"
                    >
                      {item.keyword}
                    </a>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="w-16 h-1.5 bg-slate-700 rounded-full overflow-hidden">
                        <div 
                          className={`h-full rounded-full ${
                            item.topicMatch > 80 ? 'bg-green-500' : 
                            item.topicMatch > 50 ? 'bg-yellow-500' : 'bg-slate-500'
                          }`}
                          style={{ width: `${item.topicMatch}%` }}
                        />
                      </div>
                      <span className="text-xs text-slate-400">{item.topicMatch}%</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-slate-300">{item.volume}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 rounded text-xs font-medium border ${
                      item.competition === 'Low' 
                        ? 'bg-green-900/20 text-green-400 border-green-900/50' 
                        : item.competition === 'Medium'
                        ? 'bg-yellow-900/20 text-yellow-400 border-yellow-900/50'
                        : 'bg-red-900/20 text-red-400 border-red-900/50'
                    }`}>
                      {item.competition}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-slate-400">{item.cpc}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-slate-500">
                  {status === LoadingState.IDLE 
                    ? 'Enter a keyword above to start researching' 
                    : status === LoadingState.LOADING 
                    ? 'Generating related keywords...' 
                    : 'No results found'}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
