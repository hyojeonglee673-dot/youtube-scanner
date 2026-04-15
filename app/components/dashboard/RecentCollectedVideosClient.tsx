'use client';

import { useMemo, useState } from 'react';

type RawItem = Record<string, any>;

type VideoItem = {
  id: string;
  title: string;
  channelName: string;
  thumbnailUrl: string;
  viewCount: number;
  collectedAt: string;
  url: string;
};

function toNumber(value: any) {
  const n = Number(value);
  return Number.isFinite(n) ? n : 0;
}

function normalizeItem(item: RawItem): VideoItem {
  const videoId =
    item.videoId ??
    item.video_id ??
    item.id ??
    '';

  const title =
    item.title ??
    item.videoTitle ??
    item.video_title ??
    '제목 없음';

  const channelName =
    item.channelName ??
    item.channel_name ??
    item.channel ??
    '알 수 없음';

  const thumbnailUrl =
    item.thumbnailUrl ??
    item.thumbnail_url ??
    item.thumbnail ??
    (videoId ? `https://i.ytimg.com/vi/${videoId}/mqdefault.jpg` : '');

  const viewCount = toNumber(
    item.viewCount ??
      item.view_count ??
      item.currentViews ??
      item.current_views ??
      item.views
  );

  const collectedAt =
    item.collectedAt ??
    item.collected_at ??
    item.capturedAt ??
    item.captured_at ??
    item.createdAt ??
    item.created_at ??
    '';

  const url =
    item.url ??
    item.videoUrl ??
    item.video_url ??
    (videoId ? `https://www.youtube.com/watch?v=${videoId}` : '#');

  return {
    id: videoId || `${title}-${collectedAt}`,
    title,
    channelName,
    thumbnailUrl,
    viewCount,
    collectedAt,
    url,
  };
}

function formatNumber(value: number) {
  return new Intl.NumberFormat('ko-KR').format(value);
}

function formatDateTime(value: string) {
  if (!value) return '-';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  return new Intl.DateTimeFormat('ko-KR', {
    dateStyle: 'short',
    timeStyle: 'short',
  }).format(d);
}

type Props = {
  items: RawItem[];
};

export default function RecentCollectedVideosClient({ items }: Props) {
  const [sort, setSort] = useState<'latest' | 'views_desc' | 'views_asc'>('latest');
  const [minViews, setMinViews] = useState('0');

  const normalized = useMemo(() => items.map(normalizeItem), [items]);

  const filtered = useMemo(() => {
    const min = Number(minViews);

    let next = normalized.filter((item) => item.viewCount >= min);

    if (sort === 'views_desc') {
      next = [...next].sort((a, b) => b.viewCount - a.viewCount);
    } else if (sort === 'views_asc') {
      next = [...next].sort((a, b) => a.viewCount - b.viewCount);
    } else {
      next = [...next].sort((a, b) => {
        const ad = new Date(a.collectedAt).getTime();
        const bd = new Date(b.collectedAt).getTime();
        return bd - ad;
      });
    }

    return next;
  }, [normalized, sort, minViews]);

  return (
    <section className="rounded-3xl bg-white p-6 shadow-sm border border-gray-100">
      <div className="mb-5 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-[11px] font-semibold tracking-[0.18em] text-slate-400">
            LATEST VIDEOS
          </p>
          <h2 className="mt-1 text-2xl font-bold text-slate-900">
            최근 수집 영상
          </h2>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value as 'latest' | 'views_desc' | 'views_asc')}
            className="rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm text-slate-700"
          >
            <option value="latest">최신순</option>
            <option value="views_desc">조회수 높은순</option>
            <option value="views_asc">조회수 낮은순</option>
          </select>

          <select
            value={minViews}
            onChange={(e) => setMinViews(e.target.value)}
            className="rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm text-slate-700"
          >
            <option value="0">최소 조회수: 전체</option>
            <option value="100">100+</option>
            <option value="1000">1,000+</option>
            <option value="10000">10,000+</option>
            <option value="100000">100,000+</option>
          </select>

          <div className="rounded-full bg-slate-100 px-3 py-2 text-xs font-medium text-slate-600">
            {filtered.length}개 표시
          </div>
        </div>
      </div>

      <div className="space-y-3">
        {filtered.length === 0 ? (
          <div className="rounded-2xl bg-slate-50 p-6 text-sm text-slate-500">
            조건에 맞는 영상이 없습니다.
          </div>
        ) : (
          filtered.map((item) => (
            <div
              key={item.id}
              className="flex items-center gap-4 rounded-2xl border border-gray-100 p-4 hover:bg-slate-50"
            >
              <img
                src={item.thumbnailUrl}
                alt={item.title}
                className="h-16 w-28 rounded-xl object-cover bg-slate-100"
              />

              <div className="min-w-0 flex-1">
                <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-red-400">
                  {item.channelName}
                </p>

                <p className="line-clamp-2 text-sm font-semibold text-slate-900">
                  {item.title}
                </p>

                <div className="mt-2 flex flex-wrap items-center gap-3 text-xs">
                  <span className="font-semibold text-red-500">
                    조회수 {formatNumber(item.viewCount)}
                  </span>
                  <span className="text-slate-500">
                    {formatDateTime(item.collectedAt)}
                  </span>
                </div>
              </div>

              <a
                href={item.url}
                target="_blank"
                rel="noreferrer"
                className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800"
              >
                Open
              </a>
            </div>
          ))
        )}
      </div>
    </section>
  );
}
