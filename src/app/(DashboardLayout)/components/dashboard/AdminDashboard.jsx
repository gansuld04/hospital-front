import { Grid, Box, Typography } from '@mui/material'

// Admin/Staff Components — энд нэгтгэсэн тул page.jsx-д import хийх шаардлагагүй
import PatientOverview         from '@/app/(DashboardLayout)/components/dashboard/PatientOverview'
import DepartmentBreakdown     from '@/app/(DashboardLayout)/components/dashboard/DepartmentBreakdown'
import RecentAppointments      from '@/app/(DashboardLayout)/components/dashboard/recentAppointment'
import AvailableMedications    from '@/app/(DashboardLayout)/components/dashboard/AvailableMed'
import MonthlyPatientCount     from '@/app/(DashboardLayout)/components/dashboard/MonthlyPatient'
import PatientTreatmentProgress from '@/app/(DashboardLayout)/components/dashboard/PatientTreatmentProgress'

export default function AdminDashboard() {
  return (
    <Box sx={{ pt: 1, pb: 2 }}>
      <Typography variant="h4" fontWeight="600" sx={{ mb: 2 }}>
        Эмнэлгийн хяналтын самбар
      </Typography>

      <Grid container spacing={2}>
        {/* Top row */}
        <Grid item xs={12} lg={8}>
          <PatientOverview />
        </Grid>
        <Grid item xs={12} lg={4}>
          <DepartmentBreakdown />
        </Grid>

        {/* Middle row */}
        <Grid item xs={12}>
          <MonthlyPatientCount />
        </Grid>

        {/* Bottom row */}
        <Grid item xs={12} lg={4}>
          <RecentAppointments />
        </Grid>
        <Grid item xs={12} lg={8}>
          <PatientTreatmentProgress />
        </Grid>

        {/* Full width */}
        <Grid item xs={12}>
          <AvailableMedications />
        </Grid>
      </Grid>
    </Box>
  )
}