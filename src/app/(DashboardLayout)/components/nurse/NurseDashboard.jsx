import { Grid, Box, Typography } from '@mui/material'

// Nurse Components
import TreatmentSchedule from '@/app/(DashboardLayout)/components/nurse/TreatmentSchedule'
import TreatmentStats    from '@/app/(DashboardLayout)/components/nurse/TreatmentStats'
import RecentActivities  from '@/app/(DashboardLayout)/components/nurse/RecentActivities'

export default function NurseDashboard() {
  return (
    <Box sx={{ pt: 1, pb: 2 }}>
      <Typography variant="h4" fontWeight="600" sx={{ mb: 2 }}>
        Сувилагчийн хяналтын самбар
      </Typography>

      <Grid container spacing={3}>
        <Grid item xs={12} lg={8}>
          <TreatmentSchedule />
        </Grid>

        <Grid item xs={12} lg={4}>
          <TreatmentStats />
        </Grid>

        <Grid item xs={12}>
          <RecentActivities />
        </Grid>
      </Grid>
    </Box>
  )
}