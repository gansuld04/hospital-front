import React from 'react';
import { 
  Box, 
  Card, 
  CardContent, 
  Typography, 
  Grid, 
  TextField,
  Button
} from '@mui/material';
import DeviceHubIcon from '@mui/icons-material/DeviceHub';
import { Chip } from '@mui/material';

const VitalSigns = ({ formData, onChange, onFetchVitals, measurementStep, loading }) => {
  const numericFields = [
    'temperature', 'heart_rate', 'respiration_rate', 'weight', 'height', 'bmi',
    'saturation', 'right_systolic', 'right_diastolic', 'right_mean_arterial_pressure',
    'left_systolic', 'left_diastolic', 'left_mean_arterial_pressure'
  ];
  const isButtonDisabled = measurementStep === 'right' || measurementStep === 'left' || loading;


  const handleChange = (e) => {
    const { name, value } = e.target;
    
    // Ensure that numeric fields are valid numbers
    if (numericFields.includes(name) && value !== '' && !/^\d+(\.\d+)?$/.test(value)) {
      return; // Stop if it's not a valid number
    }
    
    onChange(e);
  };

  return (
    <Card sx={{ 
      mb: 3, 
      borderRadius: 2, 
      boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.08)',
      transition: 'box-shadow 0.3s ease',
      '&:hover': {
        boxShadow: '0px 6px 16px rgba(0, 0, 0, 0.12)'
      }
    }}>
      <CardContent sx={{ p: 3 }}>
        <Box>
          <Typography variant="h6" fontWeight="600" sx={{ mb: 3 }}>Амин үзүүлэлт</Typography>
          <Grid container spacing={3}>
            {/* Left Column */}
            <Grid item xs={12} md={6}>
              <TextField
                label="Ухаан санаа"
                name="consciousness_status"
                value={formData.consciousness_status || ''}
                onChange={handleChange}
                fullWidth
                size="small"
                sx={{
                  '& .MuiOutlinedInput-root': {
                    '&:hover fieldset': {
                      borderColor: 'primary.light',
                    },
                  },
                  mb: 2
                }}
              />
              <TextField
                label="Пульс"
                name="heart_rate"
                value={formData.heart_rate || ''}
                onChange={handleChange}
                fullWidth
                size="small"
                type="number"
                inputProps={{ inputMode: 'numeric', pattern: '[0-9]*' }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    '&:hover fieldset': {
                      borderColor: 'primary.light',
                    },
                  },
                  mb: 2
                }}
              />
              <TextField
                label="Амьсгалын тоо"
                name="respiration_rate"
                value={formData.respiration_rate || ''}
                onChange={handleChange}
                fullWidth
                size="small"
                type="number"
                inputProps={{ inputMode: 'numeric', pattern: '[0-9]*' }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    '&:hover fieldset': {
                      borderColor: 'primary.light',
                    },
                  },
                  mb: 2
                }}
              />
              <TextField
                label="Сатураци"
                name="saturation"
                value={formData.saturation || ''}
                onChange={handleChange}
                fullWidth
                size="small"
                type="number"
                inputProps={{ inputMode: 'numeric', pattern: '[0-9]*' }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    '&:hover fieldset': {
                      borderColor: 'primary.light',
                    },
                  },
                  mb: 2
                }}
              />
              <TextField
                label="Биеийн температур (°C)"
                name="temperature"
                value={formData.temperature || ''}
                onChange={handleChange}
                fullWidth
                size="small"
                type="number"
                inputProps={{ inputMode: 'numeric', pattern: '[0-9]*' }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    '&:hover fieldset': {
                      borderColor: 'primary.light',
                    },
                  },
                  mb: 2
                }}
              />
              <TextField
                label="Өндөр (cm)"
                name="height"
                value={formData.height || ''}
                onChange={handleChange}
                fullWidth
                size="small"
                type="number"
                inputProps={{ inputMode: 'numeric', pattern: '[0-9]*' }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    '&:hover fieldset': {
                      borderColor: 'primary.light',
                    },
                  },
                  mb: 2
                }}
              />
              <TextField
                label="Жин (kg)"
                name="weight"
                value={formData.weight || ''}
                onChange={handleChange}
                fullWidth
                size="small"
                type="number"
                inputProps={{ inputMode: 'numeric', pattern: '[0-9]*' }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    '&:hover fieldset': {
                      borderColor: 'primary.light',
                    },
                  },
                  mb: 2
                }}
              />
              <TextField
                label="БЖИ"
                name="bmi"
                value={formData.bmi || ''}
                onChange={handleChange}
                fullWidth
                size="small"
                sx={{
                  '& .MuiOutlinedInput-root': {
                    '&:hover fieldset': {
                      borderColor: 'primary.light',
                    },
                  },
                }}
              />
            </Grid>

            {/* Right Column */}
            <Grid item xs={12} md={6}>
              <TextField
                label="Баруун даралт /Дээд/"
                name="right_systolic"
                value={formData.right_systolic || ''}
                onChange={handleChange}
                fullWidth
                size="small"
                type="number"
                inputProps={{ inputMode: 'numeric', pattern: '[0-9]*' }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    '&:hover fieldset': {
                      borderColor: 'primary.light',
                    },
                  },
                  mb: 2
                }}
              />
              <TextField
                label="Баруун даралт /Доод/"
                name="right_diastolic"
                value={formData.right_diastolic || ''}
                onChange={handleChange}
                fullWidth
                size="small"
                type="number"
                inputProps={{ inputMode: 'numeric', pattern: '[0-9]*' }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    '&:hover fieldset': {
                      borderColor: 'primary.light',
                    },
                  },
                  mb: 2
                }}
              />
              <TextField
                label="Гол судасны даралт /Дундаж/"
                name="right_mean_arterial_pressure"
                value={formData.right_mean_arterial_pressure || ''}
                onChange={handleChange}
                fullWidth
                size="small"
                type="number"
                inputProps={{ inputMode: 'numeric', pattern: '[0-9]*' }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    '&:hover fieldset': {
                      borderColor: 'primary.light',
                    },
                  },
                  mb: 2
                }}
              />
              <TextField
                label="Баруун даралт /Нэмэлт/"
                name="right_note"
                value={formData.right_note || ''}
                onChange={handleChange}
                fullWidth
                size="small"
                sx={{
                  '& .MuiOutlinedInput-root': {
                    '&:hover fieldset': {
                      borderColor: 'primary.light',
                    },
                  },
                  mb: 2
                }}
              />
              <TextField
                label="Зүүн даралт /Дээд/"
                name="left_systolic"
                value={formData.left_systolic || ''}
                onChange={handleChange}
                fullWidth
                size="small"
                type="number"
                inputProps={{ inputMode: 'numeric', pattern: '[0-9]*' }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    '&:hover fieldset': {
                      borderColor: 'primary.light',
                    },
                  },
                  mb: 2
                }}
              />
              <TextField
                label="Зүүн даралт /Доод/"
                name="left_diastolic"
                value={formData.left_diastolic || ''}
                onChange={handleChange}
                fullWidth
                size="small"
                type="number"
                inputProps={{ inputMode: 'numeric', pattern: '[0-9]*' }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    '&:hover fieldset': {
                      borderColor: 'primary.light',
                    },
                  },
                  mb: 2
                }}
              />
              <TextField
                label="Зүүн даралт /Дундаж/"
                name="left_mean_arterial_pressure"
                value={formData.left_mean_arterial_pressure || ''}
                onChange={handleChange}
                fullWidth
                size="small"
                type="number"
                inputProps={{ inputMode: 'numeric', pattern: '[0-9]*' }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    '&:hover fieldset': {
                      borderColor: 'primary.light',
                    },
                  },
                  mb: 2
                }}
              />
              <TextField
                label="Зүүн даралт /Нэмэлт/"
                name="left_note"
                value={formData.left_note || ''}
                onChange={handleChange}
                fullWidth
                size="small"
                sx={{
                  '& .MuiOutlinedInput-root': {
                    '&:hover fieldset': {
                      borderColor: 'primary.light',
                    },
                  },
                }}
              />
            </Grid>
          </Grid>
          
          {/* Device Integration Buttons */}
          <Box display="flex" justifyContent="center" gap={2} mt={3} mb={2}>
  <Button
    variant="outlined"
    onClick={() => onFetchVitals?.('right')}
    disabled={isButtonDisabled}
    startIcon={<DeviceHubIcon />}
    size="small"
    sx={{
      borderRadius: 2,
      textTransform: 'none',
      fontWeight: 500,
      fontSize: '0.875rem',
      px: 2,
      py: 1,
      minWidth: 160,
    }}
  >
    Баруун талаас авах
  </Button>
  <Button
    variant="outlined"
    onClick={() => onFetchVitals?.('left')}
    disabled={isButtonDisabled}
    startIcon={<DeviceHubIcon />}
    size="small"
    sx={{
      borderRadius: 2,
      textTransform: 'none',
      fontWeight: 500,
      fontSize: '0.875rem',
      px: 2,
      py: 1,
      minWidth: 160,
    }}
  >
    Зүүн талаас авах
  </Button>
</Box>



        {/* Status indication */}
        {measurementStep && (
          <Box mt={2} textAlign="center">
            <Chip 
              label={`${measurementStep === 'right' ? 'Баруун' : 'Зүүн'} даралт хэмжиж байна...`}
              color="warning"
              size="small"
              variant="outlined"
              sx={{ borderRadius: '4px' }}
            />
          </Box>
          )}
        </Box>
      </CardContent>
    </Card>
  );
};

export default VitalSigns;