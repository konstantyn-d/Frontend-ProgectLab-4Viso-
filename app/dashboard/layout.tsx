import { Sidebar } from '@/components/dashboard/sidebar'
import { Header } from '@/components/dashboard/header'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-background flex">
      <Sidebar />
      <div className="flex-1 flex flex-col ml-[248px] min-w-0">
        <Header />
        <main className="flex-1 overflow-auto" style={{ padding: '34px 32px 72px' }}>
          {children}
        </main>
      </div>
    </div>
  )
}
