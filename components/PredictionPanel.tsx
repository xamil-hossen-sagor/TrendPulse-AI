import React, { useState } from 'react';
import { predictFutureTrends } from '../services/geminiService';
import { LoadingState } from '../types';

interface PredictionPanelProps {
  currentContextRaw: string;
}

export const PredictionPanel: React.FC<PredictionPanelProps> = ({ currentContextRaw }) => {
  const [status, setStatus] = useState<LoadingState>(LoadingState.IDLE);
  const [analysis, setAnalysis] = useState<string>('');
  const [isExpanded, setIsExpanded] = useState(false);

  const handlePredict = async () => {
    if (!currentContextRaw) {
      alert("Please fetch live trends first to provide context for the AI.");
      return;
    }
    
    setStatus(LoadingState.LOADING);
    try {
      const { reasoning } = await predictFutureTrends(currentContextRaw);
      setAnalysis(reasoning);
      setStatus(LoadingState.SUCCESS);
      setIsExpanded(true);
    } catch (error) {
      console.error(error);
      setStatus(LoadingState.ERROR);
    }
  };

  return (
    <div className="bg-slate-800 rounded-2xl p-6 border border-slate-700 shadow-xl relative overflow-hidden">
      {/* Background glow effect */}
      <div className="absolute top-0 right-0 -mt-16 -mr-16 w-64 h-64 bg-purple-500 opacity-10 blur-3xl rounded-full pointer-events-none"></div>

      <div className="flex justify-between items-start mb-6 relative z-10">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-purple-900/50 text-purple-400">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </span>
            <h2 className="text-lg font-bold text-white">Future Trend Forecaster</h2>
          </div>
          <p className="text-sm text-slate-400">
            Powered by Gemini 3 Pro (Thinking Mode) • 32k Budget
          </p>
        </div>
        
        <button
          onClick={handlePredict}
          disabled={status === LoadingState.LOADING}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 flex items-center gap-2
            ${status === LoadingState.LOADING 
              ? 'bg-slate-700 text-slate-400 cursor-not-allowed' 
              : 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white hover:shadow-lg hover:scale-105'
            }`}
        >
          {status === LoadingState.LOADING ? (
            <>
              <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Thinking...
            </>
          ) : (
            <>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
              </svg>
              Analyze & Predict
            </>
          )}
        </button>
      </div>

      {status === LoadingState.SUCCESS && (
        <div className={`transition-all duration-500 ${isExpanded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
          <div className="prose prose-invert max-w-none text-slate-300 text-sm bg-slate-900/50 p-4 rounded-xl border border-slate-700/50">
             <h3 className="text-purple-400 font-semibold mb-2">AI Reasoning Chain:</h3>
             <div className="whitespace-pre-wrap font-mono text-xs text-slate-400 leading-relaxed">
               {analysis}
             </div>
          </div>
        </div>
      )}

      {status === LoadingState.ERROR && (
        <div className="p-4 bg-red-900/20 border border-red-800 rounded-lg text-red-200 text-sm mt-4">
          Failed to generate prediction. Please try again later.
        </div>
      )}
      
      {status === LoadingState.IDLE && (
        <div className="text-center py-8 text-slate-500 text-sm border-2 border-dashed border-slate-700/50 rounded-xl">
          Run analysis to see AI-predicted trends for the next 72 hours.
        </div>
      )}
    </div>
  );
};