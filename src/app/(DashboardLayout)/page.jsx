import PageContainer from '@/app/(DashboardLayout)/components/container/PageContainer'
import DashboardClient from '@/app/(DashboardLayout)/components/UseClientPage'

export default function Dashboard() {
  return (
    <PageContainer
      title="Эмнэлгийн хяналтын самбар"
      description="Hospital Dashboard"
    >
      <DashboardClient />
    </PageContainer>
  )
}