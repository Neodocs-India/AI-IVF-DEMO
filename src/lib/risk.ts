import type { RiskAssessment } from '@/data/types';

export const bandFor = (score: number): RiskAssessment['band'] => (score >= 70 ? 'High' : score >= 40 ? 'Moderate' : 'Low');

export function makeRisk(
  factors: { label: string; weight: number }[],
  suggestedActions: string[],
  trend: RiskAssessment['trend'] = 'Stable',
): RiskAssessment {
  const score = factors.reduce((s, f) => s + f.weight, 0);
  return { score, band: bandFor(score), factors, suggestedActions, trend };
}
