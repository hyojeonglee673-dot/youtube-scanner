'use client';

import { useEffect, useMemo, useState } from 'react';

type RawItem = Record<string, any>;

type SurgeItem = {
  videoId: string;
  title: string;
  channelName: string;
  thumbnailUrl: string;
  currentViews: number;
  deltaToday: number;
  delta1h: number;
  lastCapturedAt: string;
  url: string;
};

function toNumber(value: any) {
  const n = Number(value);
  return Number.isFinite(n) ? n : 0;
}

function normalizeItem(item: RawItem): SurgeItem {
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

  const currentViews = toNumber(
    item.currentViews ??
      item.current_views ??
      item.viewCount ??
      item.view_count ??
      item.views
  );

  const deltaToday = toNumber(
    item.deltaToday ??
      item.delta_today ??
      item.todayDelta ??
      item.today_delta ??
      item.delta
  );

  const delta1h = toNumber(
    item.delta1h ??
      item.delta_1h ??
      item.hourDelta ??
      item.hour_delta
  );

  const lastCapturedAt =
    item.lastCapturedAt ??
    item.last_captured_at ??
    item.capturedHour ??
    item.captured_hour ??
    item.createdAt ??
    item.created_at ??
    '';

  const url =
    item.url ??
    item.videoUrl ??
    item.video_url ??
    (videoId ? `https://www.youtube.com/watch?v=${videoId}` : '#');

  return {
    videoId,
    title,
    channelName,
    thumbnailUrl,
    currentViews,
    deltaToday,
    delta1h,
    lastCapturedAt,
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

export default function DailySurgeVideosCard() {
  const [items, setItems] = useState<SurgeItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchData = async () => {
    try {
      setLoading(true);
      setError('');

      const res = await fetch('/api/surge-videos?limit=6', {
        cache: 'no-store',
      });

      if (!res.ok) {
        throw new Error(`Failed: ${res.status}`);
      }

      const json = await res.json();
      const rawItems =
        json.items ??
        json.videos ??
        json.data ??
        [];

      setItems(rawItems.map(normalizeItem));
    } catch (err) {
      console.error(err);
      setError('급상승 영상을 불러오지 못했습니다.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const topItems = useMemo(() => items.slice(0, 6), [items]);

  return (
    <section className="rounded-3xl bg-white p-6 shadow-sm border border-gray-100">
      <div className="mb-5 flex items-center justify-between">
        <div>
          <p className="text-[11px] font-semibold tracking-[0.18em] text-red-400">
            SURGE WATCH
          </p>
          <h2 className="mt-1 text-2xl font-bold text-slate-900">
            당일 조회수 급상승 영상
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            오늘 기준으로 가장 빠르게 오르는 영상을 보여줍니다.
          </p>
        </div>

        <button
          onClick={fetchData}
          className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800"
        >
          새로고침
        </button>
      </div>

      {loading ? (
        <div className="rounded-2xl bg-slate-50 p-6 text-sm text-slate-500">
          급상승 영상을 불러오는 중...
        </div>
      ) : error ? (
        <div className="rounded-2xl bg-red-50 p-6 text-sm text-red-600">
          {error}
        </div>
      ) : topItems.length === 0 ? (
        <div className="rounded-2xl bg-slate-50 p-6 text-sm text-slate-500">
          표시할 급상승 영상이 없습니다.
        </div>
      ) : (
        <div className="space-y-3">
          {topItems.map((item, index) => (
            <div
              key={`${item.videoId}-${index}`}
              className="flex items-center gap-4 rounded-2xl border border-gray-100 p-4 hover:bg-slate-50"
            >
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-red-50 text-sm font-bold text-red-500">
                {index + 1}
              </div>

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
                <p className="mt-1 text-xs text-slate-500">
                  마지막 수집: {formatDateTime(item.lastCapturedAt)}
                </p>
              </div>

              <div className="hidden min-w-[140px] text-right md:block">
                <p className="text-xs text-slate-500">현재 조회수</p>
                <p className="text-sm font-semibold text-slate-900">
                  {formatNumber(item.currentViews)}
                </p>
              </div>

              <div className="hidden min-w-[120px] text-right md:block">
                <p className="text-xs text-slate-500">오늘 증가</p>
                <p className="text-sm font-bold text-red-500">
                  +{formatNumber(item.deltaToday)}
                </p>
                {!!item.delta1h && (
                  <p className="text-[11px] text-slate-400">
                    1h +{formatNumber(item.delta1h)}
                  </p>
                )}
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
          ))}
        </div>
      )}
    </section>
  );
}
