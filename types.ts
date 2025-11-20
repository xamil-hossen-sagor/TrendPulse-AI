
export interface KeywordData {
  keyword: string;
  volume: number;
  status: 'New' | 'Trending' | 'Stable';
  change: string; // e.g. "+15%"
  category?: string;
  firstSeen?: string; // e.g. "2 hours ago"
}

export interface RelatedKeyword {
  keyword: string;
  topicMatch: number; // 0-100
  volume: string; // e.g. "100-500"
  competition: 'Low' | 'Medium' | 'High';
  cpc?: string;
}

export interface TrendPrediction {
  keyword: string;
  probability: number; // 0-100
  reasoning: string;
  timeframe: string;
}

export interface SearchSource {
  title: string;
  uri: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: Date;
  isError?: boolean;
}

export enum LoadingState {
  IDLE = 'IDLE',
  LOADING = 'LOADING',
  SUCCESS = 'SUCCESS',
  ERROR = 'ERROR',
}
