Exit code: 0
Wall time: 2.8 seconds
Output:
'use client';

import { useEffect, useMemo, useState } from 'react';
import { ContentItem } from '@/lib/types';
import { demoData } from '@/lib/demoData';
import { ContentMetrics, formatNumber, formatRate, getContentMetrics, groupContent, normalizeContent, safeRate } from '@/lib/analytics';

export default function Insights() {
  const [content, setContent] = useState<ContentItem[]>([]);
  const [loaded, setLoaded] = useState(false);
  useEffect(() => { try { const stored = localStorage.getItem('contentPulse_data'); setContent(stored ? normalizeContent(JSON.parse(stored) as ContentItem[]) : demoData); } catch { setContent(demoData); } setLoaded(true); }, []);
  const findings = useMemo(() => buildInsights(getContentMetrics(content)), [content]);
  if (!loaded) return <div className='p-6'>Loading...</div>;
  return <div className='space-y-6 p-6'><div><p className='text-sm font-medium text-blue-600 dark:text-blue-400'>Rule-based recommendations</p><h1 className='text-3xl font-bold text-slate-900 dark:text-white'>Insights</h1></div><div className='grid grid-cols-1 gap-4 md:grid-cols-2'>{findings.map((finding) => <article key={finding.title} className='rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-800'><h2 className='text-base font-semibold text-slate-900 dark:text-white'>{finding.title}</h2><p className='mt-2 text-lg font-bold text-slate-800 dark:text-slate-100'>{finding.value}</p><p className='mt-2 text-sm leading-6 text-slate-600 dark:text-slate-400'>{finding.detail}</p></article>)}</div></div>;
}

function buildInsights(items: ContentMetrics[]) {
  if (!items.length) return [{ title: 'No insights yet', value: 'No content available', detail: 'Add content to calculate local performance recommendations.' }];
  const topics = groupContent(items, 'category').sort((a, b) => b.score - a.score);
  const formats = groupContent(items, 'type').sort((a, b) => b.score - a.score);
  const averageViews = items.reduce((sum, item) => sum + item.viewCount, 0) / items.length;
  const averageConversionRate = safeRate(items.reduce((sum, item) => sum + item.conversionCount, 0), items.reduce((sum, item) => sum + item.viewCount, 0));
  const highViewLowConversion = items.filter((item) => item.viewCount >= averageViews && item.conversionRate < averageConversionRate).sort((a, b) => b.viewCount - a.viewCount)[0];
  const lowViewHighConversion = items.filter((item) => item.viewCount < averageViews && item.conversionRate >= averageConversionRate).sort((a, b) => b.conversionRate - a.conversionRate)[0];
  const opportunity = topics.filter((topic) => topic.conversionRate > averageConversionRate && topic.count < 3).sort((a, b) => b.conversionRate - a.conversionRate)[0];
  const mostViewed = [...items].sort((a, b) => b.viewCount - a.viewCount)[0];
  const highestConverting = [...items].sort((a, b) => b.conversionCount - a.conversionCount)[0];
  const weakest = [...topics].sort((a, b) => a.score - b.score)[0];
  return [
    { title: 'Best topic', value: topics[0].name, detail: `${formatNumber(topics[0].views)} views, ${formatRate(topics[0].engagementRate)} engagement, ${formatRate(topics[0].conversionRate)} conversion, score ${topics[0].score.toFixed(0)}.` },
    { title: 'Best format', value: formats[0].name, detail: `${formatNumber(formats[0].views)} views, ${formatRate(formats[0].engagementRate)} engagement, ${formatRate(formats[0].conversionRate)} conversion, score ${formats[0].score.toFixed(0)}.` },
    { title: 'Most-viewed content', value: mostViewed.title, detail: `${formatNumber(mostViewed.viewCount)} views with ${formatRate(mostViewed.engagementRate * 100)} engagement and ${formatRate(mostViewed.conversionRate)} conversion.` },
    { title: 'Highest-converting content', value: highestConverting.title, detail: `${formatNumber(highestConverting.conversionCount)} conversions from ${formatNumber(highestConverting.viewCount)} views (${formatRate(highestConverting.conversionRate)} conversion rate).` },
    { title: 'High-view, low-conversion content', value: highViewLowConversion?.title ?? 'No matching content', detail: highViewLowConversion ? `${formatNumber(highViewLowConversion.viewCount)} views exceeds the ${formatNumber(Math.round(averageViews))} average, while ${formatRate(highViewLowConversion.conversionRate)} conversion is below the ${formatRate(averageConversionRate)} average.` : 'No item meets both conditions.' },
    { title: 'Low-view, high-conversion content', value: lowViewHighConversion?.title ?? 'No matching content', detail: lowViewHighConversion ? `${formatNumber(lowViewHighConversion.viewCount)} views is below the ${formatNumber(Math.round(averageViews))} average, while ${formatRate(lowViewHighConversion.conversionRate)} conversion exceeds the ${formatRate(averageConversionRate)} average.` : 'No item meets both conditions.' },
    { title: 'Weakest topic', value: weakest.name, detail: `${formatNumber(weakest.views)} views, ${formatRate(weakest.engagementRate)} engagement, ${formatRate(weakest.conversionRate)} conversion, score ${weakest.score.toFixed(0)}.` },
    { title: 'Content opportunity', value: opportunity?.name ?? 'No qualifying topic', detail: opportunity ? `${opportunity.count} item${opportunity.count === 1 ? '' : 's'} and a ${formatRate(opportunity.conversionRate)} conversion rate, above the ${formatRate(averageConversionRate)} average.` : 'No topic has both an above-average conversion rate and fewer than 3 items.' },
  ];
}

