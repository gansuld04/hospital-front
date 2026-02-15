'use client';

import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  TextField,
  Button,
  Typography,
  Paper,
  IconButton,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  InputAdornment,
  Stack,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  Snackbar
} from '@mui/material';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider, DatePicker } from '@mui/x-date-pickers';
import SaveIcon from '@mui/icons-material/Save';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import PersonIcon from '@mui/icons-material/Person';
import BadgeIcon from '@mui/icons-material/Badge';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import WcIcon from '@mui/icons-material/Wc';
import WorkIcon from '@mui/icons-material/Work';
import SchoolIcon from '@mui/icons-material/School';
import LocationCityIcon from '@mui/icons-material/LocationCity';
import HomeIcon from '@mui/icons-material/Home';
import ApartmentIcon from '@mui/icons-material/Apartment';
import PhoneIcon from '@mui/icons-material/Phone';
import EmailIcon from '@mui/icons-material/Email';
import CloseIcon from '@mui/icons-material/Close';
import LockIcon from '@mui/icons-material/Lock';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import { useRouter } from 'next/navigation';
import medicalStaffService from '../../../../app/service/medicalStaffService';

// Position options
const positions = [
  'Doctor',
  'Nurse'
];

// Displayed position values in Mongolian
const positionLabels = {
  'Doctor': 'Эмч',
  'Nurse': 'Сувилагч'
};

// Mongolian provinces data
const provinces = [
  'Улаанбаатар',
  'Архангай',
  'Баян-Өлгий',
  'Баянхонгор',
  'Булган',
  'Говь-Алтай',
  'Говьсүмбэр',
  'Дархан-Уул',
  'Дорноговь',
  'Дорнод',
  'Дундговь',
  'Завхан',
  'Орхон',
  'Өвөрхангай',
  'Өмнөговь',
  'Сүхбаатар',
  'Сэлэнгэ',
  'Төв',
  'Увс',
  'Ховд',
  'Хөвсгөл',
  'Хэнтий',
];

// District data for Ulaanbaatar
const ulaanbaatarDistricts = [
  'Баянгол',
  'Баянзүрх',
  'Сүхбаатар',
  'Чингэлтэй',
  'Хан-Уул',
  'Сонгинохайрхан',
  'Налайх',
  'Багануур',
  'Багахангай',
];

// Sample soums for other provinces (simplified for demo)
const provinceSoums = {
  'Архангай': ['Эрдэнэбулган', 'Өгийнуур', 'Цэнхэр', 'Өлзийт', 'Хайрхан'],
  'Баян-Өлгий': ['Өлгий', 'Алтай', 'Буянт', 'Ногооннуур', 'Сагсай'],
  'Баянхонгор': ['Баянхонгор', 'Баацагаан', 'Баян-Өндөр', 'Богд', 'Жаргалант'],
  'Булган': ['Булган', 'Баяннуур', 'Бүрэгхангай', 'Дашинчилэн', 'Хутаг-Өндөр'],
  'Дархан-Уул': ['Дархан', 'Хонгор', 'Орхон', 'Шарын гол'],
  'Сэлэнгэ': ['Сүхбаатар', 'Алтанбулаг', 'Баруунхараа', 'Ерөө', 'Мандал'],
  'Төв': ['Зуунмод', 'Алтанбулаг', 'Аргалант', 'Архуст', 'Батсүмбэр'],
  'Орхон': ['Баян-Өндөр', 'Жаргалант'],
};

export default function MedicalStaffRegister() {
  const router = useRouter();
  const [birthDate, setBirthDate] = useState(null);
  const [startDate, setStartDate] = useState(null);
  const [position, setPosition] = useState('');
  const [specialization, setSpecialization] = useState('');
  const [province, setProvince] = useState('');
  const [district, setDistrict] = useState('');
  const [availableDistricts, setAvailableDistricts] = useState([]);
  const [loading, setLoading] = useState(false);
  
  // Success dialog state
  const [openSuccessDialog, setOpenSuccessDialog] = useState(false);
  // Confirmation dialog state
  const [openConfirmDialog, setOpenConfirmDialog] = useState(false);
  
  // Snackbar state
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });
  
  // Form data
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    specialization: '',
    email: '',
    apartment: '',
    street: '',
    phone: '',
    password: '',
  });

  // Form validation state
  const [formErrors, setFormErrors] = useState({});

  
  // Update available districts based on selected province
  useEffect(() => {
    if (province === 'Улаанбаатар') {
      setAvailableDistricts(ulaanbaatarDistricts);
    } else if (provinceSoums[province]) {
      setAvailableDistricts(provinceSoums[province]);
    } else {
      setAvailableDistricts([]);
    }
    // Reset district selection when province changes
    setDistrict('');
  }, [province]);
  
  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    
    // Clear validation error when field is changed
    if (formErrors[name]) {
      setFormErrors(prev => ({ ...prev, [name]: null }));
    }
  };
  
  const handleBack = () => {
    router.push('/employee');
  };
  
  const handleSave = () => {
    // Validate form before showing confirmation
    const errors = validateForm();
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      
      setSnackbar({
        open: true,
        message: 'Талбаруудын мэдээллийг зөв оруулна уу',
        severity: 'error'
      });
      
      return;
    }
    
    setOpenConfirmDialog(true);
  };
  
  const validateForm = () => {
    const errors = {};
    
    if (!formData.lastName) errors.lastName = 'Овог оруулна уу';
    if (!formData.firstName) errors.firstName = 'Нэр оруулна уу';
    if (!position) errors.position = 'Албан тушаал сонгоно уу';
    if (!formData.email) errors.email = 'Имэйл хаяг оруулна уу';
    if (!formData.password || formData.password.length < 6) {
      errors.password = 'Нууц үг 6-аас дээш тэмдэгт байх ёстой';
    }
    if (!formData.phone) errors.phone = 'Утасны дугаар оруулна уу';
    
    return errors;
  };
  
  const confirmSave = async () => {
    setLoading(true);
    
    const combinedAddress = [province, district, formData.apartment, formData.street].filter(Boolean).join(', ');
    const formattedBirthDate = birthDate ? birthDate.toISOString().split('T')[0] : null;
  
    const dataToSend = {
      lastname: formData.lastName,
      firstname: formData.firstName,
      position: position,
      specialization: formData.specialization,
      phoneNumber: formData.phone,
      email: formData.email,
      birthOfDate: formattedBirthDate,
      address: combinedAddress,
      password: formData.password
    };
  
    try {
      // Use the medical staff service to register the new staff member
      const result = await medicalStaffService.createMedicalStaff(dataToSend);
      
      setOpenConfirmDialog(false);
      setOpenSuccessDialog(true);
      setLoading(false);
    } catch (err) {
      console.error("Error registering medical staff:", err);
      
      setLoading(false);
      setOpenConfirmDialog(false);
      
      setSnackbar({
        open: true,
        message: err.response?.data?.message || 'Бүртгэл амжилтгүй. Алдаа гарлаа.',
        severity: 'error'
      });
    }
  };
  
  const handleSuccessClose = () => {
    setOpenSuccessDialog(false);
    router.push('/employee');
  };
  
  const handleCloseSnackbar = () => {
    setSnackbar({...snackbar, open: false});
  };

  return (
    <Box sx={{ display: 'flex', height: '100vh', bgcolor: 'white' }}>
      <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', p: 0 }}>
        {/* Header Section */}
        <Box sx={{ px: 3, pt: 3, pb: 2 }}>
          {/* Title and actions */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <IconButton 
                  onClick={handleBack}
                  sx={{ 
                    color: 'primary.main',
                    bgcolor: 'rgba(25, 118, 210, 0.08)',
                    mr: 1,
                    '&:hover': { bgcolor: 'rgba(25, 118, 210, 0.12)' }
                  }}
                >
                  <ArrowBackIcon />
                </IconButton>
                <Typography variant="h4" component="h1" fontWeight="600">Эмч/Сувилагч бүртгэх</Typography>
              </Box>
              <Box sx={{ mt: 2 }}>
                <Typography variant="body2" color="text.secondary">
                  Эмч, сувилагчийн дэлгэрэнгүй мэдээллийг үнэн зөв оруулж бүртгэнэ үү.
                </Typography>
              </Box>
            </Box>
            <Button 
              variant="contained" 
              color="primary" 
              startIcon={<SaveIcon />}
              onClick={handleSave}
              disabled={loading}
              sx={{ 
                borderRadius: '8px', 
                textTransform: 'none',
                px: 3
              }}
            >
              Хадгалах
            </Button>
          </Box>
        </Box>

        {/* Main Content */}
        <Box sx={{ flexGrow: 1, mx: 3, mb: 3, overflowY: 'auto' }}>
          <Paper sx={{ p: 3, border: '1px solid #eee', boxShadow: 'none', borderRadius: '12px' }}>
            <Box component="form" noValidate autoComplete="off">
              <Grid container spacing={3}>
                {/* Personal Information Section */}
                <Grid item xs={12}>
                  <Typography variant="subtitle1" fontWeight="600" sx={{ mb: 2 }}>
                    Хувийн мэдээлэл
                  </Typography>
                </Grid>
                
                {/* Row 1 */}
                <Grid item xs={12} sm={4}>
                  <TextField
                    fullWidth
                    label="Овог"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleFormChange}
                    variant="outlined"
                    size="small"
                    error={Boolean(formErrors.lastName)}
                    helperText={formErrors.lastName}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <PersonIcon color="primary" />
                        </InputAdornment>
                      ),
                    }}
                  />
                </Grid>
                <Grid item xs={12} sm={4}>
                  <TextField
                    fullWidth
                    label="Нэр"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleFormChange}
                    variant="outlined"
                    size="small"
                    error={Boolean(formErrors.firstName)}
                    helperText={formErrors.firstName}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <PersonIcon color="primary" />
                        </InputAdornment>
                      ),
                    }}
                  />
                </Grid>
                <Grid item xs={12} sm={4}>
                  <TextField
                    fullWidth
                    label="Утасны дугаар"
                    name="phone"
                    value={formData.phone}
                    onChange={handleFormChange}
                    variant="outlined"
                    size="small"
                    error={Boolean(formErrors.phone)}
                    helperText={formErrors.phone}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <PhoneIcon color="primary" />
                        </InputAdornment>
                      ),
                    }}
                  />
                </Grid>

                <Grid item xs={12} sm={4}>
                  <TextField
                    fullWidth
                    label="Имэйл хаяг"
                    name="email"
                    value={formData.email}
                    onChange={handleFormChange}
                    variant="outlined"
                    size="small"
                    error={Boolean(formErrors.email)}
                    helperText={formErrors.email}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <EmailIcon color="primary" />
                        </InputAdornment>
                      ),
                    }}
                  />
                </Grid>
                
                <Grid item xs={12} sm={4}>
                  <TextField
                    fullWidth
                    label="Нууц үг"
                    name="password"
                    type="password"
                    value={formData.password}
                    onChange={handleFormChange}
                    variant="outlined"
                    size="small"
                    error={Boolean(formErrors.password)}
                    helperText={formErrors.password}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <LockIcon color="primary" />
                        </InputAdornment>
                      ),
                    }}
                  />
                </Grid>

                {/* Professional Information */}
                <Grid item xs={12} sx={{ mt: 2 }}>
                  <Typography variant="subtitle1" fontWeight="600" sx={{ mb: 2 }}>
                    Мэргэжлийн мэдээлэл
                  </Typography>
                </Grid>

                {/* Row 3 */}
                <Grid item xs={12} sm={4}>
                  <FormControl fullWidth size="small" error={Boolean(formErrors.position)}>
                    <InputLabel>Албан тушаал</InputLabel>
                    <Select
                      label="Албан тушаал"
                      value={position}
                      onChange={(e) => setPosition(e.target.value)}
                      startAdornment={
                        <InputAdornment position="start">
                          <WorkIcon color="primary" />
                        </InputAdornment>
                      }
                    >
                      <MenuItem value=""><em>Сонгох</em></MenuItem>
                      {positions.map((pos) => (
                        <MenuItem key={pos} value={pos}>{positionLabels[pos]}</MenuItem>
                      ))}
                    </Select>
                    {formErrors.position && <Typography color="error" variant="caption">{formErrors.position}</Typography>}
                  </FormControl>
                </Grid>
            
                <Grid item xs={12} sm={4}>
                  <TextField
                    fullWidth
                    label="Мэргэшил"
                    name="specialization"
                    value={formData.specialization}
                    onChange={handleFormChange}
                    variant="outlined"
                    size="small"
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <SchoolIcon color="primary" />
                        </InputAdornment>
                      ),
                    }}
                  />
                </Grid>

                
              </Grid>
            </Box>
          </Paper>
        </Box>
      </Box>
      
      {/* Confirmation Dialog */}
      <Dialog 
        open={openConfirmDialog} 
        onClose={() => !loading && setOpenConfirmDialog(false)}
        PaperProps={{
          sx: {
            borderRadius: '12px',
            width: '400px',
            boxShadow: '0px 8px 24px rgba(0, 0, 0, 0.12)'
          }
        }}
      >
        <DialogTitle 
          sx={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center' 
          }}
        >
          <Box component="div">
            <Typography variant="h6" component="span" fontWeight={600}>
              Мэдээлэл хадгалах
            </Typography>
          </Box>
          <IconButton 
            size="small" 
            onClick={() => !loading && setOpenConfirmDialog(false)}
            disabled={loading}
            sx={{ 
              color: 'text.secondary',
              '&:hover': { bgcolor: 'rgba(0, 0, 0, 0.04)' }
            }}
          >
            <CloseIcon fontSize="small" />
          </IconButton>
        </DialogTitle>
        
        <Divider />
        
        <DialogContent sx={{ py: 3 }}>
          <Typography align="center">
            Эмч/Сувилагчийн мэдээллийг хадгалахдаа итгэлтэй байна уу?
          </Typography>
        </DialogContent>
        
        <DialogActions sx={{ px: 3, py: 2, justifyContent: 'center' }}>
          <Button 
            onClick={() => setOpenConfirmDialog(false)}
            variant="outlined"
            disabled={loading}
            sx={{ 
              borderRadius: '8px', 
              textTransform: 'none',
              px: 3,
              minWidth: '120px'
            }}
          >
            Болих
          </Button>
          <Button 
            variant="contained" 
            onClick={confirmSave}
            disabled={loading}
            sx={{ 
              borderRadius: '8px', 
              textTransform: 'none',
              px: 3,
              minWidth: '120px'
            }}
          >
            {loading ? 'Хадгалж байна...' : 'Хадгалах'}
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Success Dialog */}
      <Dialog 
        open={openSuccessDialog} 
        onClose={handleSuccessClose}
        PaperProps={{
          sx: {
            borderRadius: '12px',
            width: '400px',
            boxShadow: '0px 8px 24px rgba(0, 0, 0, 0.12)'
          }
        }}
      >
        <DialogContent sx={{ py: 4, textAlign: 'center' }}>
          <CheckCircleOutlineIcon color="success" sx={{ fontSize: 60, mb: 2 }} />
          <Typography variant="h6" gutterBottom>
            Амжилттай!
          </Typography>
          <Typography>
            Эмч/Сувилагчийн мэдээллийг амжилттай бүртгэлээ.
          </Typography>
        </DialogContent>
        
        <DialogActions sx={{ px: 3, py: 2, justifyContent: 'center' }}>
          <Button 
            variant="contained" 
            onClick={handleSuccessClose}
            sx={{ 
              borderRadius: '8px', 
              textTransform: 'none',
              px: 3,
              minWidth: '120px'
            }}
          >
            Эмч, Сувилагч
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Snackbar for notifications */}
      <Snackbar 
        open={snackbar.open} 
        autoHideDuration={6000} 
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert 
          onClose={handleCloseSnackbar} 
          severity={snackbar.severity} 
          variant="filled"
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}