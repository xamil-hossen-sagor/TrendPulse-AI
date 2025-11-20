
import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { TrendChart } from './components/TrendChart';
import { PredictionPanel } from './components/PredictionPanel';
import { ChatWidget } from './components/ChatWidget';
import { KeywordResearchTool } from './components/KeywordResearchTool';
import { fetchLiveTrends } from './services/geminiService';
import { KeywordData, SearchSource, LoadingState } from './types';

const App: React.FC = () => {
  const [trends, setTrends] = useState<KeywordData[]>([]);
  const [sources, setSources] = useState<SearchSource[]>([]);
  const [rawContext, setRawContext] = useState<string>('');
  const [loadingState, setLoadingState] = useState<LoadingState>(LoadingState.IDLE);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const handleFetchTrends = async () => {
    setLoadingState(LoadingState.LOADING);
    try {
      const { trends: newTrends, sources: newSources, rawText } = await fetchLiveTrends();
      setTrends(newTrends);
      setSources(newSources);
      setRawContext(rawText);
      setLastUpdated(new Date());
      setLoadingState(LoadingState.SUCCESS);
    } catch (error) {
      console.error(error);
      setLoadingState(LoadingState.ERROR);
    }
  };

  // Initial fetch on mount
  useEffect(() => {
    handleFetchTrends();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Derived stats
  const breakoutTerms = trends.filter(t => t.status === 'New');
  const newKeywordsCount = breakoutTerms.length;
  const totalVolume = trends.reduce((acc, curr) => acc + curr.volume, 0);
  const topTrend = trends.length > 0 ? trends.reduce((prev, current) => (prev.volume > current.volume) ? prev : current) : null;

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col">
      <Header />
      
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Header Actions */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
          <div>
            <h2 className="text-2xl font-bold text-white">Niche Keyword Dashboard</h2>
            <p className="text-slate-400 text-sm mt-1">
              Real-time low volume & breakout search analysis (10-100 daily searches)
            </p>
          </div>
          <div className="flex items-center gap-4">
            {lastUpdated && (
              <span className="text-xs text-slate-500">
                Updated: {lastUpdated.toLocaleTimeString()}
              </span>
            )}
            <button
              onClick={handleFetchTrends}
              disabled={loadingState === LoadingState.LOADING}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium rounded-lg shadow-lg shadow-blue-900/30 transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loadingState === LoadingState.LOADING ? (
                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              )}
              Refresh Data
            </button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl">
            <p className="text-slate-400 text-sm font-medium mb-1">Top Niche Volume</p>
            <h3 className="text-3xl font-bold text-white">
              {topTrend ? topTrend.volume : '-'}
            </h3>
            <p className="text-green-400 text-xs mt-2 flex items-center gap-1">
               <span className="truncate max-w-[150px]">{topTrend?.keyword || 'No data'}</span>
               {topTrend && <span className="bg-green-900/30 px-1.5 py-0.5 rounded border border-green-800/50">Max</span>}
            </p>
          </div>

          <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl">
            <p className="text-slate-400 text-sm font-medium mb-1">Fresh Breakout Terms</p>
            <h3 className="text-3xl font-bold text-white">{newKeywordsCount}</h3>
            <p className="text-blue-400 text-xs mt-2">
              First-time searches today
            </p>
          </div>

          <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl">
            <p className="text-slate-400 text-sm font-medium mb-1">Aggregate Micro-Volume</p>
            <h3 className="text-3xl font-bold text-white">
              {totalVolume}
            </h3>
            <p className="text-purple-400 text-xs mt-2">
              Total daily searches tracked
            </p>
          </div>
        </div>

        {/* Research Tool */}
        <div className="mb-8">
          <KeywordResearchTool />
        </div>

        {/* Main Content Area */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Left Column: Visualization & List */}
          <div className="lg:col-span-2 space-y-8">
            
            {/* Chart Section */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
              <h3 className="text-lg font-semibold text-white mb-6">Micro-Volume Distribution (Daily Searches)</h3>
              <TrendChart data={trends} />
            </div>

            {/* Breakout Terms Box (New dedicated section) */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-lg shadow-blue-900/10">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <span className="relative flex h-3 w-3">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
                  </span>
                  <h3 className="text-lg font-bold text-white">Live Breakout Terms</h3>
                </div>
                <span className="text-xs text-slate-500 bg-slate-800 px-2 py-1 rounded border border-slate-700">
                  Detected Today
                </span>
              </div>
              
              {breakoutTerms.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {breakoutTerms.map((term, idx) => (
                    <div key={idx} className="bg-slate-800/50 border border-slate-700/50 hover:border-green-500/30 rounded-xl p-4 transition-all hover:bg-slate-800 group">
                      <div className="flex justify-between items-start mb-2">
                        <span className="bg-green-900/30 text-green-400 text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider border border-green-800/50">
                          New
                        </span>
                        <span className="text-slate-400 text-xs font-mono">
                          {term.firstSeen || 'Recently'}
                        </span>
                      </div>
                      <a 
                         href={`https://www.google.com/search?q=${encodeURIComponent(term.keyword)}`}
                         target="_blank"
                         rel="noopener noreferrer"
                         className="text-white font-medium hover:text-blue-400 block mb-2 truncate transition-colors"
                      >
                        {term.keyword}
                      </a>
                      <div className="flex items-center gap-2 text-xs text-slate-400">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                        <span className="font-semibold text-slate-300">{term.volume}</span> searches
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-slate-500 border-2 border-dashed border-slate-800 rounded-xl">
                  {loadingState === LoadingState.LOADING ? 'Scanning for breakouts...' : 'No breakout terms detected yet today.'}
                </div>
              )}
            </div>

            {/* Keyword Table */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
               <div className="p-6 border-b border-slate-800">
                 <h3 className="text-lg font-semibold text-white">Niche & New Keywords List</h3>
               </div>
               <div className="overflow-x-auto">
                 <table className="w-full text-left text-sm text-slate-400">
                   <thead className="bg-slate-800/50 text-slate-200 font-medium">
                     <tr>
                       <th className="px-6 py-3">Keyword (Click to Search)</th>
                       <th className="px-6 py-3">Category</th>
                       <th className="px-6 py-3">Est. Volume</th>
                       <th className="px-6 py-3">Status</th>
                     </tr>
                   </thead>
                   <tbody className="divide-y divide-slate-800">
                     {trends.length > 0 ? (
                       trends.map((trend, idx) => (
                         <tr key={idx} className="hover:bg-slate-800/30 transition-colors group">
                           <td className="px-6 py-4 font-medium text-white">
                             <a 
                               href={`https://www.google.com/search?q=${encodeURIComponent(trend.keyword)}`}
                               target="_blank"
                               rel="noopener noreferrer"
                               className="hover:text-blue-400 hover:underline decoration-blue-400 underline-offset-2 transition-all flex items-center gap-2"
                             >
                               {trend.keyword}
                               <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                               </svg>
                             </a>
                           </td>
                           <td className="px-6 py-4">{trend.category}</td>
                           <td className="px-6 py-4">{trend.volume}</td>
                           <td className="px-6 py-4">
                             <span className={`px-2 py-1 rounded-full text-xs font-medium border ${
                               trend.status === 'New' 
                                 ? 'bg-green-900/30 text-green-400 border-green-800' 
                                 : 'bg-blue-900/30 text-blue-400 border-blue-800'
                             }`}>
                               {trend.status}
                             </span>
                           </td>
                         </tr>
                       ))
                     ) : (
                       <tr>
                         <td colSpan={4} className="px-6 py-8 text-center text-slate-500">
                           {loadingState === LoadingState.LOADING ? 'Searching for fresh niche trends...' : 'No data available. Click refresh.'}
                         </td>
                       </tr>
                     )}
                   </tbody>
                 </table>
               </div>
            </div>

            {/* Sources Section (Grounding Requirement) */}
            {sources.length > 0 && (
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
                <h4 className="text-sm font-semibold text-slate-300 mb-3">Verified Sources (Google Search)</h4>
                <div className="flex flex-wrap gap-2">
                  {sources.map((source, idx) => (
                    <a 
                      key={idx} 
                      href={source.uri} 
                      target="_blank" 
                      rel="noreferrer"
                      className="text-xs bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-blue-400 px-3 py-1 rounded-full border border-slate-700 transition-colors truncate max-w-xs"
                    >
                      {source.title}
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right Column: AI Prediction & Analysis */}
          <div className="space-y-8">
            <PredictionPanel currentContextRaw={rawContext} />
            
            {/* Info Card */}
            <div className="bg-gradient-to-br from-indigo-900/50 to-slate-900 border border-indigo-500/20 rounded-2xl p-6">
              <h3 className="text-white font-semibold mb-2">About Thinking Mode</h3>
              <p className="text-slate-400 text-sm leading-relaxed">
                This dashboard uses the <strong>Gemini 3 Pro</strong> model with an expanded thinking budget of 32k tokens to analyze complex relationships between current news events and potential future search behaviors, simulating a human analyst's reasoning process.
              </p>
            </div>
          </div>
        </div>
      </main>

      <ChatWidget />
    </div>
  );
};

export default App;
