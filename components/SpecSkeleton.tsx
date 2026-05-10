"use client";

function Shimmer({ className }: { className: string }) {
  return <div className={`animate-pulse rounded bg-white/30 ${className}`} />;
}

function ShimmerDark({ className, style }: { className: string; style?: React.CSSProperties }) {
  return <div className={`animate-pulse rounded bg-gray-200 ${className}`} style={style} />;
}

function SectionShell({
  headerColor,
  children,
}: {
  headerColor: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white shadow-sm overflow-hidden">
      <div className={`flex items-center gap-2.5 px-6 py-4 border-b border-gray-100 ${headerColor}`}>
        <div className="animate-pulse rounded bg-current opacity-30 h-5 w-5" />
        <div className="animate-pulse rounded bg-current opacity-30 h-3.5 w-28" />
      </div>
      <div className="px-6 py-5">{children}</div>
    </div>
  );
}

export default function SpecSkeleton() {
  return (
    <div className="space-y-4">
      {/* Sticky nav skeleton */}
      <div className="sticky top-0 z-20 -mx-4 px-4 py-2.5 bg-white/95 backdrop-blur-sm border-b border-gray-100 shadow-sm">
        <div className="flex gap-2 overflow-hidden">
          {[80, 64, 96, 56, 80, 72].map((w, i) => (
            <div
              key={i}
              className="animate-pulse shrink-0 h-7 rounded-full bg-gray-100"
              style={{ width: w }}
            />
          ))}
        </div>
      </div>

      {/* Vision skeleton */}
      <div className="rounded-2xl bg-gradient-to-br from-indigo-600 to-violet-600 px-8 py-7 shadow-md">
        <div className="flex items-center gap-2.5 mb-3 opacity-60">
          <Shimmer className="h-5 w-5" />
          <Shimmer className="h-3 w-16" />
        </div>
        <div className="space-y-2">
          <Shimmer className="h-4 w-full" />
          <Shimmer className="h-4 w-5/6" />
          <Shimmer className="h-4 w-4/6" />
        </div>
      </div>

      {/* Users skeleton */}
      <SectionShell headerColor="text-blue-700 bg-blue-50">
        <div className="space-y-3">
          {[0, 1, 2].map((i) => (
            <div key={i} className="flex gap-3 items-start rounded-xl border border-blue-100 bg-blue-50 px-4 py-3">
              <ShimmerDark className="mt-0.5 h-4 w-4 shrink-0" />
              <div className="flex-1 space-y-1.5">
                <ShimmerDark className="h-3.5 w-full" />
                <ShimmerDark className="h-3.5 w-3/4" />
              </div>
            </div>
          ))}
        </div>
      </SectionShell>

      {/* Features skeleton */}
      <SectionShell headerColor="text-indigo-700 bg-indigo-50">
        <div className="space-y-4">
          <div>
            <ShimmerDark className="h-3 w-32 mb-3" />
            <div className="space-y-2.5">
              {[100, 85, 90].map((w, i) => (
                <div key={i} className="flex gap-3 items-center">
                  <ShimmerDark className="h-1.5 w-1.5 shrink-0 rounded-full" />
                  <ShimmerDark className="h-3.5 flex-1" style={{ width: `${w}%` } as React.CSSProperties} />
                </div>
              ))}
            </div>
          </div>
          <div>
            <ShimmerDark className="h-3 w-40 mb-3" />
            <div className="space-y-2.5">
              {[95, 80].map((w, i) => (
                <div key={i} className="flex gap-3 items-center">
                  <ShimmerDark className="h-1.5 w-1.5 shrink-0 rounded-full" />
                  <ShimmerDark className="h-3.5 flex-1" style={{ width: `${w}%` } as React.CSSProperties} />
                </div>
              ))}
            </div>
          </div>
        </div>
      </SectionShell>

      {/* Flows skeleton */}
      <SectionShell headerColor="text-cyan-700 bg-cyan-50">
        <div className="space-y-0">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="flex gap-4">
              <div className="flex flex-col items-center">
                <ShimmerDark className="h-6 w-6 shrink-0 rounded-full" />
                {i < 3 && <div className="mt-1 mb-1 w-px flex-1 bg-cyan-100" style={{ minHeight: "1rem" }} />}
              </div>
              <div className="pb-4 flex-1 space-y-1.5 pt-1">
                <ShimmerDark className="h-3.5 w-full" />
                <ShimmerDark className={`h-3.5 ${i % 2 === 0 ? "w-4/5" : "w-3/5"}`} />
              </div>
            </div>
          ))}
        </div>
      </SectionShell>

      {/* Architecture skeleton */}
      <SectionShell headerColor="text-amber-700 bg-amber-50">
        <div className="space-y-2">
          <ShimmerDark className="h-3.5 w-full" />
          <ShimmerDark className="h-3.5 w-full" />
          <ShimmerDark className="h-3.5 w-5/6" />
          <ShimmerDark className="h-3.5 w-4/6" />
        </div>
      </SectionShell>

      {/* Requirements skeleton */}
      <SectionShell headerColor="text-emerald-700 bg-emerald-50">
        <div className="space-y-2.5">
          {[100, 88, 75, 92, 68].map((w, i) => (
            <div key={i} className="flex gap-3 items-center">
              <ShimmerDark className="h-4 w-4 shrink-0 rounded" />
              <ShimmerDark className="h-3.5 flex-1" style={{ width: `${w}%` } as React.CSSProperties} />
            </div>
          ))}
        </div>
      </SectionShell>
    </div>
  );
}
