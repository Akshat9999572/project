Exit code: 0
Wall time: 3 seconds
Output:
'use client';

import { useEffect, useMemo, useState, type ReactElement } from 'react';
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { ContentChannel, ContentItem } from '@/lib/types';
import { demoData } from '@/lib/demoData';

const channelByType: Record<ContentItem['type'], ContentChannel> = {
  blog: 'Website', video: 'YouTube', infographic: 'LinkedIn', podcast: 'Podcast', whitepaper: 'Email',
};

function normalizeContent(items: ContentItem[]) {
  return items.map((item, index) => ({
    ...item,
    channel: item.channel ?? channelByType[item.type],
    conversionCount: item.conversionCount ?? Math.round(item.viewCount * item.engagementRate * (0.08 + (index % 5) * 0.02)),
  }));
}

function formatNumber(value: number) { return value.toLocaleString('en-US'); }
function formatRate(numerator: number, denominator: number) { return denominator ? ((numerator / denominator) * 100).toFixed(1) : '0.0'; }

export default function Overview() {
  const [content, setContent] = useState<ContentItem[]>([]);
  const [selectedChannel, setSelectedChannel] = useState('all');
  const [selectedTopic, setSelectedTopic] = useState('all');
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem('contentPulse_data');
    try { setContent(stored ? normalizeContent(JSON.parse(stored) as ContentItem[]) : demoData); }
    catch { setContent(demoData); }
    setLoaded(true);
  }, []);

  const channels = useMemo(() => [...new Set(content.map((item) => item.channel))].sort(), [content]);
  const topics = useMemo(() => [...new Set(content.map((item) => item.category))].sort(), [content]);
  const filteredContent = useMemo(() => content.filter((item) =>
    (selectedChannel === 'all' || item.channel === selectedChannel) &&
    (selectedTopic === 'all' || item.category === selectedTopic)
  ), [content, selectedChannel, selectedTopic]);

  const metrics = useMemo(() => {
    const views = filteredContent.reduce((sum, item) => sum + item.viewCount, 0);
    const engagements = filteredContent.reduce((sum, item) => sum + Math.round(item.viewCount * item.engagementRate), 0);
    const conversions = filteredContent.reduce((sum, item) => sum + item.conversionCount, 0);
    return { views, engagements, conversions };
  }, [filteredContent]);

  const viewsByChannel = useMemo(() => channels.map((channel) => ({ channel, views: filteredContent.filter((item) => item.channel === channel).reduce((sum, item) => sum + item.viewCount, 0) })), [channels, filteredContent]);
  const conversionsByTopic = useMemo(() => topics.map((topic) => ({ topic, conversions: filteredContent.filter((item) => item.category === topic).reduce((sum, item) => sum + item.conversionCount, 0) })), [topics, filteredContent]);
  const engagementByFormat = useMemo(() => [...new Set(content.map((item) => item.type))].sort().map((format) => {
    const items = filteredContent.filter((item) => item.type === format);
    const views = items.reduce((sum, item) => sum + item.viewCount, 0);
    const engagements = items.reduce((sum, item) => sum + Math.round(item.viewCount * item.engagementRate), 0);
    return { format, engagementRate: Number(formatRate(engagements, views)) };
  }), [content, filteredContent]);

  if (!loaded) return <div className='p-6'>Loading...</div>;

  const summaryCards = [
    ['Total content', formatNumber(filteredContent.length)], ['Total views', formatNumber(metrics.views)],
    ['Total engagements', formatNumber(metrics.engagements)], ['Total conversions', formatNumber(metrics.conversions)],
    ['Average engagement rate', `${formatRate(metrics.engagements, metrics.views)}%`],
    ['Average conversion rate', `${formatRate(metrics.conversions, metrics.views)}%`],
  ];

  return <div className='space-y-6 p-6'>
    <div><p className='text-sm font-medium text-blue-600 dark:text-blue-400'>Performance dashboard</p><h1 className='text-3xl font-bold text-slate-900 dark:text-white'>Overview</h1></div>
    <section className='rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-800'>
      <div className='flex flex-col gap-4 sm:flex-row sm:items-end'>
        <label className='flex-1 text-sm font-medium text-slate-700 dark:text-slate-300'>Channel<select value={selectedChannel} onChange={(event) => setSelectedChannel(event.target.value)} className='mt-1 block w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900 dark:border-slate-600 dark:bg-slate-900 dark:text-white'><option value='all'>All channels</option>{channels.map((channel) => <option key={channel} value={channel}>{channel}</option>)}</select></label>
        <label className='flex-1 text-sm font-medium text-slate-700 dark:text-slate-300'>Topic<select value={selectedTopic} onChange={(event) => setSelectedTopic(event.target.value)} className='mt-1 block w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900 dark:border-slate-600 dark:bg-slate-900 dark:text-white'><option value='all'>All topics</option>{topics.map((topic) => <option key={topic} value={topic}>{topic}</option>)}</select></label>
        <button type='button' onClick={() => { setSelectedChannel('all'); setSelectedTopic('all'); }} className='rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-600 dark:text-slate-200 dark:hover:bg-slate-700'>Clear filters</button>
      </div>
    </section>
    <section className='grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3'>{summaryCards.map(([label, value]) => <div key={label} className='rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-800'><p className='text-sm font-medium text-slate-600 dark:text-slate-400'>{label}</p><p className='mt-2 text-3xl font-bold text-slate-900 dark:text-white'>{value}</p></div>)}</section>
    <section className='grid grid-cols-1 gap-6 xl:grid-cols-2'>
      <ChartCard title='Views by channel'><BarChart data={viewsByChannel}><CartesianGrid strokeDasharray='3 3' stroke='#e2e8f0' /><XAxis dataKey='channel' stroke='#64748b' /><YAxis stroke='#64748b' tickFormatter={(value) => `${Math.round(value / 1000)}k`} /><Tooltip formatter={(value) => formatNumber(Number(value))} /><Bar dataKey='views' fill='#2563eb' radius={[5, 5, 0, 0]} /></BarChart></ChartCard>
      <ChartCard title='Conversions by topic'><BarChart data={conversionsByTopic}><CartesianGrid strokeDasharray='3 3' stroke='#e2e8f0' /><XAxis dataKey='topic' stroke='#64748b' /><YAxis stroke='#64748b' /><Tooltip formatter={(value) => formatNumber(Number(value))} /><Bar dataKey='conversions' fill='#7c3aed' radius={[5, 5, 0, 0]} /></BarChart></ChartCard>
      <div className='xl:col-span-2'><ChartCard title='Engagement rate by format'><BarChart data={engagementByFormat}><CartesianGrid strokeDasharray='3 3' stroke='#e2e8f0' /><XAxis dataKey='format' stroke='#64748b' /><YAxis stroke='#64748b' unit='%' /><Tooltip formatter={(value) => `${Number(value).toFixed(1)}%`} /><Bar dataKey='engagementRate' fill='#0891b2' radius={[5, 5, 0, 0]} /></BarChart></ChartCard></div>
    </section>
  </div>;
}

function ChartCard({ children, title }: { children: ReactElement; title: string }) {
  return <div className='rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-800'><h2 className='text-lg font-semibold text-slate-900 dark:text-white'>{title}</h2><div className='mt-4 h-72'><ResponsiveContainer width='100%' height='100%'>{children}</ResponsiveContainer></div></div>;
}

