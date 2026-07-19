Exit code: 0
Wall time: 2.4 seconds
Output:
'use client';

import { useEffect, useMemo, useState } from 'react';
import { ContentItem } from '@/lib/types';
import { demoData } from '@/lib/demoData';
import { ContentMetrics, formatNumber, formatRate, getContentMetrics, normalizeContent } from '@/lib/analytics';

type SortKey = 'title' | 'channel' | 'category' | 'type' | 'viewCount' | 'engagementRate' | 'conversionCount' | 'conversionRate' | 'score' | 'action';

const columns: Array<{ key: SortKey; label: string; align?: string }> = [
  { key: 'title', label: 'Title' }, { key: 'channel', label: 'Channel' }, { key: 'category', label: 'Topic' }, { key: 'type', label: 'Format' },
  { key: 'viewCount', label: 'Views', align: 'right' }, { key: 'engagementRate', label: 'Engagement rate', align: 'right' },
  { key: 'conversionCount', label: 'Conversions', align: 'right' }, { key: 'conversionRate', label: 'Conversion rate', align: 'right' },
  { key: 'score', label: 'Score', align: 'right' }, { key: 'action', label: 'Action' },
];

const actionStyles = { Continue: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300', Improve: 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300', Promote: 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300', Reduce: 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300' };

export default function ContentExplorer() {
  const [content, setContent] = useState<ContentItem[]>([]);
  const [query, setQuery] = useState('');
  const [sortKey, setSortKey] = useState<SortKey>('score');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem('contentPulse_data');
      setContent(stored ? normalizeContent(JSON.parse(stored) as ContentItem[]) : demoData);
    } catch { setContent(demoData); }
    setLoaded(true);
  }, []);

  const rows = useMemo(() => {
    const search = query.trim().toLowerCase();
    const filtered = getContentMetrics(content).filter((item) => !search || [item.title, item.channel, item.category, item.type, item.action].some((value) => value.toLowerCase().includes(search)));
    return filtered.sort((left, right) => {
      const first = left[sortKey]; const second = right[sortKey];
      const order = typeof first === 'number' && typeof second === 'number' ? first - second : String(first).localeCompare(String(second));
      return sortDirection === 'asc' ? order : -order;
    });
  }, [content, query, sortDirection, sortKey]);

  const changeSort = (key: SortKey) => { if (key === sortKey) setSortDirection((direction) => direction === 'asc' ? 'desc' : 'asc'); else { setSortKey(key); setSortDirection(key === 'title' || key === 'channel' || key === 'category' || key === 'type' || key === 'action' ? 'asc' : 'desc'); } };
  if (!loaded) return <div className='p-6'>Loading...</div>;

  return <div className='space-y-6 p-6'>
    <div><p className='text-sm font-medium text-blue-600 dark:text-blue-400'>Content performance</p><h1 className='text-3xl font-bold text-slate-900 dark:text-white'>Content Explorer</h1></div>
    <label className='block max-w-xl text-sm font-medium text-slate-700 dark:text-slate-300'>Search content<input value={query} onChange={(event) => setQuery(event.target.value)} placeholder='Search title, channel, topic, format, or action' className='mt-1 block w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900 dark:border-slate-600 dark:bg-slate-900 dark:text-white' /></label>
    <div className='overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-800'>
      <table className='w-full min-w-[1100px] text-sm'><thead className='border-b border-slate-200 bg-slate-50 dark:border-slate-700 dark:bg-slate-900'><tr>{columns.map((column) => <th key={column.key} className={`px-4 py-3 text-${column.align ?? 'left'} font-semibold text-slate-700 dark:text-slate-200`}><button type='button' onClick={() => changeSort(column.key)} className='inline-flex items-center gap-1 hover:text-blue-600'>{column.label}{sortKey === column.key ? (sortDirection === 'asc' ? ' â†‘' : ' â†“') : ''}</button></th>)}</tr></thead>
        <tbody>{rows.length ? rows.map((item) => <ContentRow key={item.id} item={item} />) : <tr><td colSpan={columns.length} className='px-4 py-12 text-center text-slate-500 dark:text-slate-400'>No content matches your search.</td></tr>}</tbody>
      </table>
    </div>
  </div>;
}

function ContentRow({ item }: { item: ContentMetrics }) {
  return <tr className='border-b border-slate-100 last:border-0 hover:bg-slate-50 dark:border-slate-700 dark:hover:bg-slate-700'><td className='max-w-72 px-4 py-3 font-medium text-slate-900 dark:text-white'>{item.title}</td><td className='px-4 py-3 text-slate-600 dark:text-slate-300'>{item.channel}</td><td className='px-4 py-3 capitalize text-slate-600 dark:text-slate-300'>{item.category}</td><td className='px-4 py-3 capitalize text-slate-600 dark:text-slate-300'>{item.type}</td><td className='px-4 py-3 text-right'>{formatNumber(item.viewCount)}</td><td className='px-4 py-3 text-right'>{formatRate(item.engagementRate * 100)}</td><td className='px-4 py-3 text-right'>{formatNumber(item.conversionCount)}</td><td className='px-4 py-3 text-right'>{formatRate(item.conversionRate)}</td><td className='px-4 py-3 text-right font-semibold'>{item.score.toFixed(0)}</td><td className='px-4 py-3'><span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${actionStyles[item.action]}`}>{item.action}</span></td></tr>;
}

