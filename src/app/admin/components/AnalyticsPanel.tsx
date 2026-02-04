'use client'

interface AnalyticsStats {
  total: number
  last7Days: number
  last30Days: number
  todayCount: number
  bloodGroupDistribution: Record<string, number>
  ageRangeDistribution: Record<string, number>
  birthDayDistribution: Record<string, number>
  averageLuckyNumber: number
}

interface AnalyticsPanelProps {
  stats: AnalyticsStats
}

export function AnalyticsPanel({ stats }: AnalyticsPanelProps) {
  return (
    <div className="card-mystical p-6 mb-6">
      <h2 className="text-xl font-bold text-white mb-4">📊 สถิติการใช้งาน</h2>
      
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white/5 p-4 rounded-lg border border-white/10">
          <div className="text-white/60 text-xs mb-1">วันนี้</div>
          <div className="text-2xl font-bold text-purple-400">{stats.todayCount}</div>
        </div>
        <div className="bg-white/5 p-4 rounded-lg border border-white/10">
          <div className="text-white/60 text-xs mb-1">7 วันล่าสุด</div>
          <div className="text-2xl font-bold text-blue-400">{stats.last7Days}</div>
        </div>
        <div className="bg-white/5 p-4 rounded-lg border border-white/10">
          <div className="text-white/60 text-xs mb-1">30 วันล่าสุด</div>
          <div className="text-2xl font-bold text-green-400">{stats.last30Days}</div>
        </div>
        <div className="bg-white/5 p-4 rounded-lg border border-white/10">
          <div className="text-white/60 text-xs mb-1">เลขนำโชคเฉลี่ย</div>
          <div className="text-2xl font-bold text-yellow-400">{stats.averageLuckyNumber}</div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white/5 p-4 rounded-lg border border-white/10">
          <div className="text-white font-semibold mb-3 text-sm">กรุ๊ปเลือด</div>
          <div className="space-y-2">
            {Object.entries(stats.bloodGroupDistribution).map(([group, count]) => (
              <div key={group} className="flex justify-between text-xs">
                <span className="text-white/60">{group}</span>
                <span className="text-white font-medium">{count}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white/5 p-4 rounded-lg border border-white/10">
          <div className="text-white font-semibold mb-3 text-sm">ช่วงอายุ</div>
          <div className="space-y-2">
            {Object.entries(stats.ageRangeDistribution).map(([range, count]) => (
              <div key={range} className="flex justify-between text-xs">
                <span className="text-white/60">{range}</span>
                <span className="text-white font-medium">{count}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white/5 p-4 rounded-lg border border-white/10">
          <div className="text-white font-semibold mb-3 text-sm">วันเกิด</div>
          <div className="space-y-2">
            {Object.entries(stats.birthDayDistribution).map(([day, count]) => (
              <div key={day} className="flex justify-between text-xs">
                <span className="text-white/60">{day}</span>
                <span className="text-white font-medium">{count}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
