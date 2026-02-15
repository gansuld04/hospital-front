'use client';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import React, { useState, useEffect } from 'react';
import {
  Box,
  Tabs,
  Tab,
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
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider, DatePicker } from '@mui/x-date-pickers';
import CreditCardIcon from '@mui/icons-material/CreditCard';
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
import NotesIcon from '@mui/icons-material/Notes';
import CloseIcon from '@mui/icons-material/Close';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import EmailIcon from '@mui/icons-material/Email';
import LockIcon from '@mui/icons-material/Lock';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../context/authContext';


const provinces = [
  'Улаанбаатар', 'Архангай', 'Баян-Өлгий', 'Баянхонгор', 'Булган', 'Говь-Алтай', 'Говьсүмбэр', 'Дархан-Уул', 'Дорноговь', 'Дорнод',
  'Дундговь', 'Завхан', 'Орхон', 'Өвөрхангай', 'Өмнөговь', 'Сүхбаатар', 'Сэлэнгэ', 'Төв', 'Увс', 'Ховд', 'Хөвсгөл', 'Хэнтий',
];

const ulaanbaatarDistricts = [
  'Баянгол', 'Баянзүрх', 'Сүхбаатар', 'Чингэлтэй', 'Хан-Уул', 'Сонгинохайрхан', 'Налайх', 'Багануур', 'Багахангай'
];

const SCHOOL_OPTIONS = ["ШУТ UB парк ", "УТОУХНУС ", "ИТС", "МТЭС", "ШУС", "ХЗС", "БС", "АТС"];

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

export default function CustomerRegister() {
  const [isLoading, setIsLoading] = useState(false);
  const { register } = useAuth();
  const router = useRouter();
  const [tabValue, setTabValue] = useState(0);
  const [birthDate, setBirthDate] = useState(null);
  const [gender, setGender] = useState('');
  const [province, setProvince] = useState('');
  const [district, setDistrict] = useState('');
  const [userType, setUserType] = useState('');
  const [availableDistricts, setAvailableDistricts] = useState([]);

  const [formData, setFormData] = useState({
    lastName: '',
    firstName: '',
    registrationNumber: '',
    profession: '',
    school: '',
    apartment: '',
    street: '',
    phone: '',
    notes: '',
    email: '',
    password: '',
  });

  const [openSuccessDialog, setOpenSuccessDialog] = useState(false);
  const [openConfirmDialog, setOpenConfirmDialog] = useState(false);
  const decodeRegisterNumber = (register) => {
    if (!register || register.length !== 10) return null;
    
    try {
      // Extract components from register number
      // Format: АBYYMMDDX where YY=year, MM=month, DD=day, X=gender digit
      const yy = parseInt(register.substring(2, 4), 10);
      const mm = parseInt(register.substring(4, 6), 10);
      const dd = parseInt(register.substring(6, 8), 10);
      const genderDigit = parseInt(register.substring(8, 9), 10);
      
      // Determine year based on month code
      // If MM > 20, birth year is 2000+YY, otherwise 1900+YY
      let year, month;
      if (mm > 20) {
        year = 2000 + yy;
        month = mm - 20;
      } else {
        year = 1900 + yy;
        month = mm;
      }
      
      // Format date as YYYY-MM-DD for the DatePicker
      const dateString = `${year}-${month.toString().padStart(2, '0')}-${dd.toString().padStart(2, '0')}`;
      
      // Determine gender based on the gender digit
      // Even number = female, Odd number = male
      const gender = genderDigit % 2 === 0 ? 'female' : 'male';
      
      return { birthDate: new Date(dateString), gender };
    } catch (error) {
      console.error('Error decoding register number:', error);
      return null;
    }
  };
  useEffect(() => {
    if (province === 'Улаанбаатар') {
      setAvailableDistricts(ulaanbaatarDistricts);
    } else if (provinceSoums[province]) {
      setAvailableDistricts(provinceSoums[province]);
    } else {
      setAvailableDistricts([]);
    }
    setDistrict('');
  }, [province]);
  useEffect(() => {
    const regNumber = formData.registrationNumber;
    if (regNumber && regNumber.length === 10) {
      const decoded = decodeRegisterNumber(regNumber);
      if (decoded) {
        // Auto-fill birth date and gender
        setBirthDate(decoded.birthDate);
        setGender(decoded.gender);
      }
    }
  }, [formData.registrationNumber]);

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = () => {
    setOpenConfirmDialog(true);
  };

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const confirmSave = async () => {
    // Validate required fields
    const requiredFields = {
      firstName: 'Нэр',
      lastName: 'Овог',
      registrationNumber: 'Регистрийн дугаар',
      phone: 'Утас',
      email: 'Цахим шуудан',
      password: 'Нууц үг'
    };
    
    const missingFields = [];
    for (const [field, label] of Object.entries(requiredFields)) {
      if (!formData[field]) {
        missingFields.push(label);
      }
    }
    
    if (!province) missingFields.push('Хот / Аймаг');
    if (!district) missingFields.push('Сум / Дүүрэг');
    if (!birthDate) missingFields.push('Төрсөн он/сар/өдөр');
    if (!gender) missingFields.push('Хүйс');
    
    if (missingFields.length > 0) {
      alert(`Дараах талбаруудыг бөглөнө үү: ${missingFields.join(', ')}`);
      return;
    }
    
    // Format birthDate correctly
    let formattedBirthDate = null;
    if (birthDate) {
      formattedBirthDate = birthDate.toISOString().split('T')[0]; // Format as YYYY-MM-DD
    }
    
    // Combine address-related fields into a single string
    const combinedAddress = [
      province, 
      district, 
      formData.apartment, 
      formData.street
    ].filter(Boolean).join(', ');
    
    const dataToSend = {
      lastname: formData.lastName,
      firstname: formData.firstName,
      register: formData.registrationNumber,
      occupation: formData.profession,
      school: formData.school,
      phoneNumber: formData.phone,
      notes: formData.notes,
      email: formData.email,
      password: formData.password,
      birthOfDate: formattedBirthDate,
      gender,
      type: userType,
      address: combinedAddress // Send as a single combined string instead of separate fields
    };

    try {
      // Set loading state if needed
      setIsLoading(true);
      
      const result = await register(dataToSend);
      
      // Check if result exists and has a success property
      if (result && result.success) {
        toast.success("Амжилттай хадгалагдлаа!", {
          position: "top-center",
          autoClose: 2000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
        });

        setTimeout(() => {
          setOpenSuccessDialog(true);
        }, 3000);
        setOpenConfirmDialog(false);
        
      } else {
        // Extract error message from result if available
        const errorMessage = result && result.error 
    ? result.error 
    : 'Бүртгэл амжилтгүй боллоо. Дахин оролдоно уу.';
  
  toast.error(errorMessage, {
    position: "top-center",
    autoClose: 3000,
  });
      }
    } catch (error) {
      console.error('Registration error:', error);
      alert('Серверийн алдаа гарлаа. Та дахин оролдоно уу.');
    } finally {
      // Reset loading state if needed
      setIsLoading(false);
    }
  };

  const handleBack = () => router.push('/customer');
  const handleSuccessClose = () => router.push('/customer');
  const handleCustomerClose = () => router.push('/customer');
  const handleExaminationClose = () => router.push('/examination');

  return (
    <Box sx={{ display: 'flex', height: '100vh', bgcolor: 'white' }}>
       {/* Toast notification container */}
    <ToastContainer
      position="top-center"
      autoClose={2000}
      hideProgressBar={false}
      newestOnTop
      closeOnClick
      rtl={false}
      pauseOnFocusLoss
      draggable
      pauseOnHover
      style={{ zIndex: 9999 }}
    />
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
                <Typography variant="h4" component="h1" fontWeight="600">Үйлчлүүлэгч бүртгэх</Typography>
              </Box>
              <Box sx={{ mt: 2 }}>
                <Typography variant="body2" color="text.secondary">
                  Үйлчлүүлэгчийн мэдээллийг үнэн зөв оруулж бүртгэнэ үү.
                </Typography>
              </Box>
            </Box>
            <Button 
              variant="contained" 
              color="primary" 
              startIcon={<SaveIcon />}
              onClick={handleSave}
              sx={{ 
                borderRadius: '8px', 
                textTransform: 'none',
                px: 3
              }}
            >
              Хадгалах
            </Button>
          </Box>
          
          {/* Tabs */}
          <Tabs
            value={tabValue}
            onChange={handleTabChange}
            textColor="primary"
            indicatorColor="primary"
            sx={{ borderBottom: 1, borderColor: 'divider' }}
          >
            <Tab label="Энгийнээр бүртгэх" />
            <Tab label="Иргэний үнэмлэхээр бүртгэх" />
            <Tab label="SISI карт уншуулах" />
          </Tabs>
        </Box>

        {/* Content for each tab */}
        <Box sx={{ flexGrow: 1, mx: 3, mb: 3 }}>
          <Paper sx={{ p: 3, border: '1px solid #eee', boxShadow: 'none', borderRadius: '12px' }}>
            {tabValue === 1 && (
              <Box sx={{ p: 4, textAlign: 'center' }}>
                <Typography>Иргэний үнэмлэхээр бүртгэх боломж удахгүй нэмэгдэнэ.</Typography>
              </Box>
            )}

            {tabValue === 0 && (
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
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <PersonIcon color="primary" />
                          </InputAdornment>
                        ),
                      }}
                    />
                  </Grid>
                  
                  {/* Row 2 */}
                  <Grid item xs={12} sm={4}>
                  <TextField
  fullWidth
  label="Регистрийн дугаар"
  name="registrationNumber"
  value={formData.registrationNumber}
  onChange={handleFormChange}
  variant="outlined"
  size="small"
  InputProps={{
    startAdornment: (
      <InputAdornment position="start">
        <BadgeIcon color="primary" />
      </InputAdornment>
    ),
  }}
/>
                  </Grid>
                  <Grid item xs={12} sm={4}>
                    <LocalizationProvider dateAdapter={AdapterDateFns}>
                      <DatePicker
                        label="Төрсөн он/сар/өдөр"
                        value={birthDate}
                        onChange={(newValue) => setBirthDate(newValue)}
                        slotProps={{
                          textField: { 
                            size: 'small', 
                            fullWidth: true,
                            InputProps: {
                              startAdornment: (
                                <InputAdornment position="start">
                                  <CalendarMonthIcon color="primary" />
                                </InputAdornment>
                              ),
                            }
                          }
                        }}
                      />
                    </LocalizationProvider>
                  </Grid>
                  <Grid item xs={12} sm={2}>
                    <FormControl fullWidth size="small">
                      <InputLabel>Төрөл</InputLabel>
                      <Select
                        label="Төрөл"
                        value={userType}
                        onChange={(e) => setUserType(e.target.value)}
                        startAdornment={
                          <InputAdornment position="start">
                            <SchoolIcon color="primary" />
                          </InputAdornment>
                        }
                      >
                        <MenuItem value=""><em>Сонгох</em></MenuItem>
                        <MenuItem value="Student">Оюутан</MenuItem>
                        <MenuItem value="Teacher">Багш</MenuItem>
                        <MenuItem value="Staff">Ажилтан</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid item xs={12} sm={2}>
                    <FormControl fullWidth size="small">
                      <InputLabel>Хүйс</InputLabel>
                      <Select
                        label="Хүйс"
                        value={gender}
                        onChange={(e) => setGender(e.target.value)}
                        startAdornment={
                          <InputAdornment position="start">
                            <WcIcon color="primary" />
                          </InputAdornment>
                        }
                      >
                        <MenuItem value=""><em>Сонгох</em></MenuItem>
                        <MenuItem value="male">Эрэгтэй</MenuItem>
                        <MenuItem value="female">Эмэгтэй</MenuItem>
                        <MenuItem value="other">Бусад</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>

                  {/* Row 3 */}
                  <Grid item xs={12} sm={4}>
                    <TextField
                      fullWidth
                      label="Үйлчлүүлэгчийн мэргэжил"
                      name="profession"
                      value={formData.profession}
                      onChange={handleFormChange}
                      variant="outlined"
                      size="small"
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <WorkIcon color="primary" />
                          </InputAdornment>
                        ),
                      }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={4}>
                    <FormControl fullWidth size="small">
                      <InputLabel>Салбар сургууль</InputLabel>
                      <Select
                        label="Салбар сургууль"
                        name="school"
                        value={formData.school}
                        onChange={handleFormChange}
                        startAdornment={
                          <InputAdornment position="start">
                            <LocationCityIcon color="primary" />
                          </InputAdornment>
                        }
                      >
                        <MenuItem value=""><em>Сонгох</em></MenuItem>
                        {SCHOOL_OPTIONS.map((option) => (
                          <MenuItem key={option} value={option}>
                            {option}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>

                  {/* Address Section */}
                  <Grid item xs={12} sx={{ mt: 2 }}>
                    <Typography variant="subtitle1" fontWeight="600" sx={{ mb: 2 }}>
                      Хаягийн мэдээлэл
                    </Typography>
                  </Grid>

                  {/* Row 4 */}
                  <Grid item xs={12} sm={4}>
                    <FormControl fullWidth size="small">
                      <InputLabel>Хот / Аймаг</InputLabel>
                      <Select
                        label="Хот / Аймаг"
                        value={province}
                        onChange={(e) => setProvince(e.target.value)}
                        startAdornment={
                          <InputAdornment position="start">
                            <LocationCityIcon color="primary" />
                          </InputAdornment>
                        }
                      >
                        <MenuItem value=""><em>Сонгох</em></MenuItem>
                        {provinces.map((name) => (
                          <MenuItem key={name} value={name}>
                            {name}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid item xs={12} sm={4}>
                    <FormControl fullWidth size="small" disabled={!province}>
                      <InputLabel>Сум / Дүүрэг</InputLabel>
                      <Select
                        label="Сум / Дүүрэг"
                        value={district}
                        onChange={(e) => setDistrict(e.target.value)}
                        startAdornment={
                          <InputAdornment position="start">
                            <ApartmentIcon color="primary" />
                          </InputAdornment>
                        }
                      >
                        <MenuItem value=""><em>Сонгох</em></MenuItem>
                        {availableDistricts.map((name) => (
                          <MenuItem key={name} value={name}>
                            {name}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid item xs={12} sm={4}>
                    <TextField
                      fullWidth
                      label="Хороо / Байр"
                      name="apartment"
                      value={formData.apartment}
                      onChange={handleFormChange}
                      variant="outlined"
                      size="small"
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <HomeIcon color="primary" />
                          </InputAdornment>
                        ),
                      }}
                    />
                  </Grid>

                  {/* Row 5 */}
                  <Grid item xs={12} sm={4}>
                    <TextField
                      fullWidth
                      label="Гудамж / Байр / Тоот"
                      name="street"
                      value={formData.street}
                      onChange={handleFormChange}
                      variant="outlined"
                      size="small"
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <HomeIcon color="primary" />
                          </InputAdornment>
                        ),
                      }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={4}>
                    <TextField
                      fullWidth
                      label="Цахим шуудан"
                      name="email"
                      value={formData.email}
                      onChange={handleFormChange}
                      variant="outlined"
                      size="small"
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
                      type="password"
                      name="password"
                      value={formData.password}
                      onChange={handleFormChange}
                      variant="outlined"
                      size="small"
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <LockIcon color="primary" />
                          </InputAdornment>
                        ),
                      }}
                    />
                  </Grid>

                  <Grid item xs={12} sm={4}>
                    <TextField
                      fullWidth
                      label="Утас"
                      name="phone"
                      value={formData.phone}
                      onChange={handleFormChange}
                      variant="outlined"
                      size="small"
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
                      label="Тэмдэглэл"
                      name="notes"
                      value={formData.notes}
                      onChange={handleFormChange}
                      variant="outlined"
                      size="small"
                      multiline
                      rows={1}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <NotesIcon color="primary" />
                          </InputAdornment>
                        ),
                      }}
                    />
                  </Grid>
                </Grid>
              </Box>
            )}

            {tabValue === 2 && (
              <Box sx={{ p: 4, textAlign: 'center' }}>
                <Typography>SISI карт уншуулах боломж удахгүй нэмэгдэнэ.</Typography>
              </Box>
            )}
          </Paper>
        </Box>
      </Box>
      
      {/* Confirmation Dialog */}
      <Dialog 
        open={openConfirmDialog} 
        onClose={() => setOpenConfirmDialog(false)}
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
            onClick={() => setOpenConfirmDialog(false)}
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
            Үйлчлүүлэгчийн мэдээллийг хадгалахдаа итгэлтэй байна уу?
          </Typography>
        </DialogContent>
        
        <DialogActions sx={{ px: 3, py: 2, justifyContent: 'center' }}>
          <Button 
            onClick={() => setOpenConfirmDialog(false)}
            variant="outlined"
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
            sx={{ 
              borderRadius: '8px', 
              textTransform: 'none',
              px: 3,
              minWidth: '120px'
            }}
          >
            Хадгалах
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Success Dialog */}
      <Dialog 
        open={openSuccessDialog} 
        PaperProps={{
          sx: {
            borderRadius: '12px',
            width: '400px',
            boxShadow: '0px 8px 24px rgba(0, 0, 0, 0.12)'
          }
        }}
      >
        <DialogContent sx={{ pt: 3, textAlign: 'center' }}>
          <CheckCircleOutlineIcon color="success" sx={{ fontSize: 60, mb: 2 }} />
          <Typography variant="h6" gutterBottom>
            Амжилттай!
          </Typography>
          <Typography>
            Үйлчлүүлэгчийн мэдээллийг амжилттай хадгаллаа.
          </Typography>
        </DialogContent>
        
        <DialogActions sx={{ 
          pb: 3, 
          py: 2, 
          display: 'flex',
          flexDirection: 'column',
          gap: 2
        }}>
          <Button
            fullWidth
            variant="contained"
            onClick={handleExaminationClose}
            sx={{
              borderRadius: '8px',
              textTransform: 'none',
              px: 3,
              height: '40px'
            }}
          >
            Үзлэг рүү буцах
          </Button>
          <Button
            fullWidth
            variant="contained"
            onClick={handleCustomerClose}
            sx={{
              borderRadius: '8px',
              textTransform: 'none',
              px: 3,
              height: '40px'
            }}
          >
            Нийт үйлчлүүлэгчид рүү буцах
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}