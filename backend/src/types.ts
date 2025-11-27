export interface AnalyzeRequest {
  prompt: string;
}

export interface AnalyzeResponse {
  success: boolean;
  data?: string;
  error?: string;
}
