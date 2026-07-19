Exit code: 0
Wall time: 3.3 seconds
Output:
import { ContentChannel, ContentItem } from './types';

export type ContentAction = 'Continue' | 'Improve' | 'Promote' | 'Reduce';

export interface ContentMetrics extends ContentItem {
  engagements: number;
  conversionRate: number;
  score: number;
  action: ContentAction;
}

export interface GroupMetrics {
  name: string;
  count: number;
  views: number;
  engagements: number;
  conversions: number;
  engagementRate: number;
  conversionRate: number;
  score: number;
}

const channelByType: Record<ContentItem['type'], ContentChannel> = {
  blog: 'Website',
  video: 'YouTube',
  infographic: 'LinkedIn',
  podcast: 'Podcast',
  whitepaper: 'Email',
};

export function normalizeContent(items: ContentItem[]): ContentItem[] {
  return items.map((item, index) => ({
    ...item,
    channel: item.channel ?? channelByType[item.type],
    conversionCount:
      item.conversionCount ?? Math.round(item.viewCount * item.engagementRate * (0.08 + (index % 5) * 0.02)),
  }));
}

export function safeRate(numerator: number, denominator: number): number {
  return denominator > 0 ? (numerator / denominator) * 100 : 0;
}

function normalized(value: number, maximum: number): number {
  return maximum > 0 ? (value / maximum) * 100 : 0;
}

export function getAction(score: number): ContentAction {
  if (score >= 75) return 'Continue';
  if (score >= 55) return 'Improve';
  if (score >= 35) return 'Promote';
  return 'Reduce';
}

export function getContentMetrics(content: ContentItem[]): ContentMetrics[] {
  const base = content.map((item) => ({
    ...item,
    engagements: Math.round(item.viewCount * item.engagementRate),
    conversionRate: safeRate(item.conversionCount, item.viewCount),
  }));
  const maxViews = Math.max(0, ...base.map((item) => item.viewCount));
  const maxEngagementRate = Math.max(0, ...base.map((item) => item.engagementRate * 100));
  const maxConversionRate = Math.max(0, ...base.map((item) => item.conversionRate));

  return base.map((item) => {
    const score =
      normalized(item.viewCount, maxViews) * 0.3 +
      normalized(item.engagementRate * 100, maxEngagementRate) * 0.3 +
      normalized(item.conversionRate, maxConversionRate) * 0.4;

    return { ...item, score, action: getAction(score) };
  });
}

export function groupContent(items: ContentMetrics[], key: 'category' | 'type'): GroupMetrics[] {
  const groups = new Map<string, ContentMetrics[]>();
  items.forEach((item) => groups.set(item[key], [...(groups.get(item[key]) ?? []), item]));

  const base = [...groups.entries()].map(([name, group]) => {
    const views = group.reduce((sum, item) => sum + item.viewCount, 0);
    const engagements = group.reduce((sum, item) => sum + item.engagements, 0);
    const conversions = group.reduce((sum, item) => sum + item.conversionCount, 0);
    return { name, count: group.length, views, engagements, conversions, engagementRate: safeRate(engagements, views), conversionRate: safeRate(conversions, views) };
  });
  const maxViews = Math.max(0, ...base.map((item) => item.views));
  const maxEngagementRate = Math.max(0, ...base.map((item) => item.engagementRate));
  const maxConversionRate = Math.max(0, ...base.map((item) => item.conversionRate));

  return base.map((item) => ({
    ...item,
    score: normalized(item.views, maxViews) * 0.3 + normalized(item.engagementRate, maxEngagementRate) * 0.3 + normalized(item.conversionRate, maxConversionRate) * 0.4,
  }));
}

export function formatNumber(value: number): string { return value.toLocaleString('en-US'); }
export function formatRate(value: number): string { return `${value.toFixed(1)}%`; }

