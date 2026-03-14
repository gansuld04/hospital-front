import { Grid, Box, Typography } from '@mui/material'

// Patient Components
import TreatmentGuide  from '@/app/(DashboardLayout)/components/patient/TreatmentGuide'
import VitalSignsChart from '@/app/(DashboardLayout)/components/patient/VitalSignsChart'
import HealthRecords   from '@/app/(DashboardLayout)/components/patient/HealthRecords'

export default function PatientDashboard() {
  return (
    <Box sx={{ pt: 1, pb: 2 }}>
      <Typography variant="h4" fontWeight="600" sx={{ mb: 2 }}>
        Үйлчлүүлэгчийн хяналтын самбар
      </Typography>

      <Grid container spacing={3}>
        <Grid item xs={12}>
          <TreatmentGuide />
        </Grid>

        <Grid item xs={12}>
          <VitalSignsChart />
        </Grid>

        <Grid item xs={12}>
          <HealthRecords />
        </Grid>
      </Grid>
    </Box>
  )
}