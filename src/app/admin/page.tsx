'use client'

import { useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { EnvironmentBadge } from '@/components/ui/environment-badge'
import { getEnvironmentInfo } from '@/lib/environment'
import { useAdminAuth } from './hooks/useAdminAuth'
import { useFortuneData } from './hooks/useFortuneData'
import { useAnalytics } from './hooks/useAnalytics'
import { LoginForm } from './components/LoginForm'
import { AnalyticsPanel } from './components/AnalyticsPanel'
import { FortuneTable } from './components/FortuneTable'
import { ExportButton } from './components/ExportButton'

export default function AdminPage() {
  const { isAuthenticated, isLoading: authLoading, error: authError, login, logout } = useAdminAuth()
  const {
    fortunes,
    isLoading: dataLoading,
    error: dataError,
    pagination,
    storageMode,
    deleteFortune,
    clearAll,
    nextPage,
    prevPage,
    jumpToPage,
    setItemsPerPage,
    refresh
  } = useFortuneData()
  const { stats } = useAnalytics(fortunes)

  // Fetch data when authenticated
  useEffect(() => {
    if (isAuthenticated && !authLoading) {
      refresh()
    }
  }, [isAuthenticated, authLoading, refresh])

  const handleLogin = async (password: string) => {
    const result = await login(password)
    if (result.success) {
      refresh()
    }
  }

  const handleLogout = async () => {
    await logout()
  }

  // Loading state
  if (authLoading) {
    return (
      <div className="min-h-screen admin-background flex items-center justify-center p-4">
        <div className="card-mystical max-w-md w-full p-8 text-center">
          <div className="w-12 h-12 border-4 border-purple-500/30 border-t-purple-500 rounded-full animate-spin mx-auto mb-6"></div>
          <h1 className="text-xl font-bold text-white mb-2">🔮 กำลังโหลด...</h1>
          <div className="text-sm text-white/40 tracking-wider">SECURE CONNECTION</div>
        </div>
      </div>
    )
  }

  // Login screen
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen admin-background flex items-center justify-center p-4">
        <EnvironmentBadge 
          forceStorage={storageMode ? (storageMode === 'supabase' ? 'Supabase DB' : 'SQLite') : 'Connecting...'} 
        />
        <LoginForm onLogin={handleLogin} error={authError} isLoading={authLoading} />
      </div>
    )
  }

  // Admin dashboard
  return (
    <div className="min-h-screen admin-background p-4">
      <EnvironmentBadge 
        forceStorage={storageMode === 'supabase' ? 'Supabase DB' : storageMode === 'sqlite' ? 'SQLite' : undefined}
        showPerformance={true}
      />
      
      <div className="max-w-6xl mx-auto">
        {/* Performance Monitoring */}
        <div className="card-mystical p-4 mb-4 border border-blue-500/20">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-2xl">📊</span>
              <div>
                <h3 className="text-sm font-semibold text-white">Performance Monitoring</h3>
                <p className="text-xs text-white/60">View real-time performance metrics on Vercel</p>
              </div>
            </div>
            <a 
              href="https://vercel.com/analytics" 
              target="_blank" 
              rel="noopener noreferrer"
              className="px-4 py-2 bg-blue-600/30 hover:bg-blue-600/50 border border-blue-500/30 rounded-lg text-xs text-white transition-all"
            >
              Open Analytics →
            </a>
          </div>
        </div>

        {/* Header */}
        <div className="card-mystical p-6 mb-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <h1 className="text-2xl font-bold text-white">
              🔮 ข้อมูลการทำนาย ({pagination.totalCount})
            </h1>
            
            <div className="flex flex-wrap gap-2">
              <Button 
                onClick={refresh} 
                disabled={dataLoading} 
                size="sm" 
                className="bg-blue-600/30 hover:bg-blue-600/50 text-xs border border-blue-500/30"
              >
                🔄 รีเฟรช
              </Button>
              <ExportButton fortunes={fortunes} />
              <Button 
                onClick={clearAll} 
                disabled={dataLoading} 
                size="sm" 
                className="bg-red-600/30 hover:bg-red-600/50 text-xs border border-red-500/30"
              >
                🗑 ล้างทั้งหมด
              </Button>
              <Button 
                onClick={handleLogout}
                size="sm"
                className="bg-white/5 hover:bg-white/10 text-xs border border-white/10"
              >
                🚪 ออก
              </Button>
            </div>
          </div>
          
          {(dataError || authError) && (
            <div className="mt-4 p-2 rounded bg-red-500/10 border border-red-500/20 text-red-200 text-xs text-center">
              {dataError || authError}
            </div>
          )}
        </div>

        {/* Analytics */}
        {fortunes.length > 0 && <AnalyticsPanel stats={stats} />}

        {/* Data table */}
        <FortuneTable
          fortunes={fortunes}
          onDelete={deleteFortune}
          pagination={pagination}
          onNextPage={nextPage}
          onPrevPage={prevPage}
          onJumpToPage={jumpToPage}
          onItemsPerPageChange={setItemsPerPage}
          isLoading={dataLoading}
        />
      </div>
    </div>
  )
}
