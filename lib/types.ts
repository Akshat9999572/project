Exit code: 0
Wall time: 3 seconds
Output:
export type ContentType = 'blog' | 'video' | 'infographic' | 'podcast' | 'whitepaper';
export type ContentStatus = 'draft' | 'published' | 'archived';
export type ContentChannel = 'Website' | 'YouTube' | 'LinkedIn' | 'Podcast' | 'Email';

export interface ContentItem {
  id: string;
  title: string;
  type: ContentType;
  status: ContentStatus;
  publishedDate: string;
  viewCount: number;
  engagementRate: number;
  channel: ContentChannel;
  conversionCount: number;
  author: string;
  category: string;
}

export interface Insight {
  id: string;
  title: string;
  metric: string;
  value: number;
  trend: 'up' | 'down' | 'neutral';
}

