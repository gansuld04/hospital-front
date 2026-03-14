'use client'
import dynamic from 'next/dynamic'
import { Suspense } from 'react'
import { Box, Grid, Skeleton } from '@mui/material'
import { useAuth } from '@/app/(DashboardLayout)/context/authContext'

// ─── Skeleton fallback ───────────────────────────────────────────────────────
const DashboardSkeleton = () => (
  <Box sx={{ pt: 1, pb: 2 }}>
    <Skeleton variant="text" width={320} height={44} sx={{ mb: 2, borderRadius: 2 }} />
    <Grid container spacing={2}>
      <Grid item xs={12} lg={8}>
        <Skeleton variant="rectangular" height={220} sx={{ borderRadius: 2 }} />
      </Grid>
      <Grid item xs={12} lg={4}>
        <Skeleton variant="rectangular" height={220} sx={{ borderRadius: 2 }} />
      </Grid>
      <Grid item xs={12}>
        <Skeleton variant="rectangular" height={180} sx={{ borderRadius: 2 }} />
      </Grid>
      <Grid item xs={12} lg={4}>
        <Skeleton variant="rectangular" height={200} sx={{ borderRadius: 2 }} />
      </Grid>
      <Grid item xs={12} lg={8}>
        <Skeleton variant="rectangular" height={200} sx={{ borderRadius: 2 }} />
      </Grid>
    </Grid>
  </Box>
)

// ─── Lazy-loaded dashboards ───────────────────────────────────────────────────
const AdminDashboard = dynamic(
  () => import('@/app/(DashboardLayout)/components/dashboard/AdminDashboard'),
  { loading: () => <DashboardSkeleton />, ssr: false }
)

const NurseDashboard = dynamic(
  () => import('@/app/(DashboardLayout)/components/nurse/NurseDashboard'),
  { loading: () => <DashboardSkeleton />, ssr: false }
)

const PatientDashboard = dynamic(
  () => import('@/app/(DashboardLayout)/components/patient/PatientDashboard'),
  { loading: () => <DashboardSkeleton />, ssr: false }
)

// ─── Client component: зөвхөн auth + role шийдвэрлэлт ───────────────────────
export default function DashboardClient() {
  const { user } = useAuth()

  if (!user) return <DashboardSkeleton />

  const role     = user?.user?.role
  const position = user?.user?.position

  const renderDashboard = () => {
    if (role === 'Patient') return <PatientDashboard />
    if (role === 'MedicalStaff' && position === 'Nurse') return <NurseDashboard />
    return <AdminDashboard />
  }

  return (
    <Suspense fallback={<DashboardSkeleton />}>
      {renderDashboard()}
    </Suspense>
  )
}