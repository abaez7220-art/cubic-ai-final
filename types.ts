
export interface MaterialEstimate {
  area_m2: number;
  blocks_count: number;
  rods_count: number;
  cement_bags: number;
  gravel_m3: number;
  sand_m3: number;
  explanation: string;
}

export interface AnalysisResult {
  id: string;
  timestamp: Date;
  imageUrl: string;
  estimate: MaterialEstimate;
}

export enum AnalysisStatus {
  IDLE = 'IDLE',
  LOADING = 'LOADING',
  SUCCESS = 'SUCCESS',
  ERROR = 'ERROR'
}
