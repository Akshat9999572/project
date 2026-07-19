Exit code: 0
Wall time: 3 seconds
Output:
import { ContentChannel, ContentItem } from './types';

const authors = ['Alex Chen', 'Jordan Lee', 'Sam Parker', 'Casey Rodriguez', 'Morgan Taylor', 'Riley Kim', 'Taylor Brown', 'Avery Johnson'];
const categories = ['marketing', 'technology', 'business', 'design'];
const contentTitles = ['Getting Started with React Hooks', 'The Future of Web Design', 'Content Marketing Best Practices', 'Building Scalable APIs', 'User Experience Trends 2024', 'The Rise of AI in Business', 'Design System Implementation Guide', 'Mobile-First Development Strategies', 'SEO Optimization Guide', 'Customer Retention Strategies', 'Cloud Infrastructure Security', 'Remote Team Management Tips', 'E-commerce Conversion Optimization', 'Data Analytics Deep Dive', 'Social Media Marketing ROI', 'Agile Project Management', 'Voice Search Optimization', 'Video Content Strategy', 'Brand Loyalty Programs', 'Technical Debt Management', 'Growth Hacking Techniques', 'Chatbot Implementation', 'Marketing Automation Guide', 'Performance Optimization', 'Customer Journey Mapping', 'Influencer Marketing ROI', 'Content Distribution Strategy', 'User Testing Methodologies', 'Email Marketing Campaigns', 'Competitive Analysis Framework'];

function getRandomDate(daysBack = 90) {
  return new Date(Date.now() - Math.random() * daysBack * 24 * 60 * 60 * 1000).toISOString();
}

function getRandomInt(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function getChannel(type: ContentItem['type']): ContentChannel {
  const channels: Record<ContentItem['type'], ContentChannel> = {
    blog: 'Website',
    video: 'YouTube',
    infographic: 'LinkedIn',
    podcast: 'Podcast',
    whitepaper: 'Email',
  };

  return channels[type];
}

export const demoData: ContentItem[] = Array.from({ length: 30 }, (_, index) => {
  const type = ['blog', 'video', 'infographic', 'podcast', 'whitepaper'][getRandomInt(0, 4)] as ContentItem['type'];
  const viewCount = getRandomInt(100, 50000);
  const engagementRate = Math.round((Math.random() * 0.93 + 0.02) * 100) / 100;

  return {
    id: `content-${index + 1}`,
    title: `${contentTitles[index % contentTitles.length]}${index >= contentTitles.length ? ` - ${Math.floor(index / contentTitles.length)}` : ''}`,
    type,
    status: Math.random() < 0.7 ? 'published' : Math.random() < 0.83 ? 'draft' : 'archived',
    publishedDate: getRandomDate(),
    viewCount,
    engagementRate,
    channel: getChannel(type),
    conversionCount: Math.round(viewCount * engagementRate * (0.08 + (index % 5) * 0.02)),
    author: authors[getRandomInt(0, authors.length - 1)],
    category: categories[getRandomInt(0, categories.length - 1)],
  };
});

