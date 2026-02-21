export type CreativeMetrics = {
  spend: number;
  revenue: number;
  profit: number;
  purchases: number;
  roas: number;
  cpa: number;
  cpm: number;
  impressions: number;
  clicks: number;
  ctr: number;
  cpc: number;
};

export type CreativeRow = {
  creativeId: string;
  status: string;
  winner: string;
  angle: string;
  format: string;
  style: string;
  type: string;
  targetTraffic: string;
  awarenessLevel: string;
  createdBy: string;
  dateLaunched: string | null;
  linkToAsset: string | null;
  metrics: CreativeMetrics;
};
