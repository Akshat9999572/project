Exit code: 0
Wall time: 2.8 seconds
Output:
'use client';

import { useEffect, useMemo, useState } from 'react';
import { ContentItem } from '@/lib/types';
import { demoData } from '@/lib/demoData';
import { ContentAction, ContentMetrics, formatNumber, formatRate, getContentMetrics, groupContent, normalizeContent, safeRate } from '@/lib/analytics';

const sections: ContentAction[] = ['Continue', 'Improve', 'Reduce', 'Promote'];
const descriptions: Record<ContentAction, string> = {
  Continue: 'Maintain distribution and build on this proven performance.',
  Improve: 'Refine the conversion path while preserving reach.',
  Reduce: 'Limit investment until performance improves.',
  Promote: 'Increase distribution to test its upside.',
};

export default function EditorialReport() {
  const [content, setContent] = useState<ContentItem[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem('contentPulse_data');
      setContent(stored ? normalizeContent(JSON.parse(stored) as ContentItem[]) : demoData);
    } catch {
      setContent(demoData);
    }
    setLoaded(true);
  }, []);

  const metrics = useMemo(() => getContentMetrics(content), [content]);
  const report = useMemo(() => buildReport(metrics), [metrics]);

  if (!loaded) return <div className='p-6'>Loading...</div>;

  return <div className='space-y-8 p-6'>
    <div>
      <p className='text-sm font-medium text-blue-600 dark:text-blue-400'>Locally calculated editorial guidance</p>
      <h1 className='text-3xl font-bold text-slate-900 dark:text-white'>Editorial Report</h1>
    </div>
    {sections.map((action) => <section key={action}>
      <div className='mb-3'>
        <h2 className='text-xl font-semibold text-slate-900 dark:text-white'>{action}</h2>
        <p className='text-sm text-slate-600 dark:text-slate-400'>{descriptions[action]}</p>
      </div>
      <RecommendationList items={report[action]} empty={`No content is currently marked ${action.toLowerCase()}.`} />
    </section>)}
    <section>
      <h2 className='text-xl font-semibold text-slate-900 dark:text-white'>Create Next</h2>
      <p className='mt-1 text-sm text-slate-600 dark:text-slate-400'>Topics with strong conversion potential and limited coverage.</p>
      <div className='mt-3 grid grid-cols-1 gap-4 md:grid-cols-2'>
        {report.createNext.map((item) => <article key={item.name} className='rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-800'>
          <h3 className='font-semibold capitalize text-slate-900 dark:text-white'>{item.name}</h3>
          <p className='mt-2 text-sm text-slate-600 dark:text-slate-400'>{item.count} item{item.count === 1 ? '' : 's'} Â· {formatRate(item.conversionRate)} conversion Â· {formatNumber(item.views)} views. This exceeds the {formatRate(report.averageConversionRate)} overall conversion rate.</p>
        </article>)}
      </div>
      {!report.createNext.length && <p className='mt-3 text-sm text-slate-500'>No under-covered topic currently exceeds the overall conversion rate.</p>}
    </section>
    <section>
      <h2 className='text-xl font-semibold text-slate-900 dark:text-white'>Two-week plan</h2>
      <p className='mt-1 text-sm text-slate-600 dark:text-slate-400'>Four data-backed ideas sequenced across the next two weeks.</p>
      <div className='mt-3 grid grid-cols-1 gap-4 md:grid-cols-2'>
        {report.plan.map((idea, index) => <article key={`${idea.topic}-${idea.format}-${index}`} className='rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-800'>
          <p className='text-xs font-semibold uppercase tracking-wide text-blue-600 dark:text-blue-400'>Week {Math.floor(index / 2) + 1} Â· {index % 2 ? 'Thursday' : 'Tuesday'}</p>
          <h3 className='mt-1 font-semibold text-slate-900 dark:text-white'>{idea.format} idea: {idea.topic}</h3>
          <p className='mt-2 text-sm text-slate-600 dark:text-slate-400'>Use the {idea.format} format for {idea.topic}: topic conversion {formatRate(idea.topicRate)}, format engagement {formatRate(idea.formatRate)}.</p>
        </article>)}
      </div>
    </section>
  </div>;
}

function RecommendationList({ items, empty }: { items: ContentMetrics[]; empty: string }) {
  return <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
    {items.length ? items.map((item) => <article key={item.id} className='rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-800'>
      <h3 className='font-semibold text-slate-900 dark:text-white'>{item.title}</h3>
      <p className='mt-2 text-sm text-slate-600 dark:text-slate-400'>{formatNumber(item.viewCount)} views Â· {formatRate(item.engagementRate * 100)} engagement Â· {formatNumber(item.conversionCount)} conversions Â· {formatRate(item.conversionRate)} conversion Â· score {item.score.toFixed(0)}</p>
    </article>) : <p className='text-sm text-slate-500'>{empty}</p>}
  </div>;
}

function buildReport(items: ContentMetrics[]) {
  const byAction = Object.fromEntries(sections.map((action) => [action, items.filter((item) => item.action === action).sort((a, b) => b.score - a.score)])) as Record<ContentAction, ContentMetrics[]>;
  const topics = groupContent(items, 'category').sort((a, b) => b.conversionRate - a.conversionRate);
  const formats = groupContent(items, 'type').sort((a, b) => b.engagementRate - a.engagementRate);
  const averageConversionRate = safeRate(items.reduce((sum, item) => sum + item.conversionCount, 0), items.reduce((sum, item) => sum + item.viewCount, 0));
  const createNext = topics.filter((topic) => topic.conversionRate > averageConversionRate && topic.count < 3).slice(0, 4);
  const planTopics = (createNext.length ? createNext : topics).slice(0, 4);
  const plan = Array.from({ length: 4 }, (_, index) => ({
    topic: planTopics[index % Math.max(planTopics.length, 1)]?.name ?? 'performance review',
    format: formats[index % Math.max(formats.length, 1)]?.name ?? 'blog',
    topicRate: planTopics[index % Math.max(planTopics.length, 1)]?.conversionRate ?? 0,
    formatRate: formats[index % Math.max(formats.length, 1)]?.engagementRate ?? 0,
  }));
  return { ...byAction, createNext, averageConversionRate, plan };
}

