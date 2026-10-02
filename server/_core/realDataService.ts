/**
 * Real Data Service - shared contract type for genuine SAM.gov data.
 * (The old generated-mock fallback was removed: when the live SAM.gov API is
 * unreachable, the app now serves real contracts from the synced database.)
 */

export interface RealContract {
  id: string;
  samId: string;
  title: string;
  description: string;
  simplifiedDescription: string;
  agency: string;
  value: number;
  deadline: Date | null;
  contractType: string;
  simplifiedType: string;
  setAside: string;
  url: string;
  naicsCode: string;
  postedDate: Date;
}
