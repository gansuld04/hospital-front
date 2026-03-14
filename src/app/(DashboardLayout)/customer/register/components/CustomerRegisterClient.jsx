'use client'
import { useState }                         from 'react'
import { toast, ToastContainer }            from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import {
  Box, Tabs, Tab, Grid, TextField, Button, Typography, Paper,
  IconButton, MenuItem, FormControl, InputLabel, Select,
  InputAdornment, Divider, Dialog, DialogTitle, DialogContent,
  DialogActions,
} from '@mui/material'
import { AdapterDateFns }                   from '@mui/x-date-pickers/AdapterDateFns'
import { LocalizationProvider, DatePicker } from '@mui/x-date-pickers'
import SaveIcon                             from '@mui/icons-material/Save'
import ArrowBackIcon                        from '@mui/icons-material/ArrowBack'
import PersonIcon                           from '@mui/icons-material/Person'
import BadgeIcon                            from '@mui/icons-material/Badge'
import CalendarMonthIcon                    from '@mui/icons-material/CalendarMonth'
import WcIcon                               from '@mui/icons-material/Wc'
import WorkIcon                             from '@mui/icons-material/Work'
import SchoolIcon                           from '@mui/icons-material/School'
import LocationCityIcon                     from '@mui/icons-material/LocationCity'
import HomeIcon                             from '@mui/icons-material/Home'
import ApartmentIcon                        from '@mui/icons-material/Apartment'
import PhoneIcon                            from '@mui/icons-material/Phone'
import NotesIcon                            from '@mui/icons-material/Notes'
import CloseIcon                            from '@mui/icons-material/Close'
import CheckCircleOutlineIcon               from '@mui/icons-material/CheckCircleOutline'
import EmailIcon                            from '@mui/icons-material/Email'
import LockIcon                             from '@mui/icons-material/Lock'

import { useRegisterForm }    from '../hooks/useRegisterForm'
import { useAddressFields }   from '../hooks/useAddressFields'
import { useRegisterDecoder } from '../hooks/useRegisterDecoder'
import { PROVINCES, SCHOOL_OPTIONS } from '../utils/registerUtils'

// ─── CustomerRegisterClient ───────────────────────────────────────────────────
export default function CustomerRegisterClient() {
  const [tabValue,  setTabValue]  = useState(0)
  const [userType,  setUserType]  = useState('')

  // ── Hooks ──────────────────────────────────────────────────────────────────
  const {
    formData, isLoading,
    openConfirmDialog, openSuccessDialog,
    handleFormChange, handleSave, confirmSave,
    setOpenConfirmDialog,
    goToCustomer, goToExamination, goBack,
  } = useRegisterForm()

  const {
    province, district, availableDistricts,
    handleProvinceChange, handleDistrictChange,
  } = useAddressFields()

  const {
    birthDate, gender,
    setBirthDate, setGender,
  } = useRegisterDecoder(formData.registrationNumber)

  // ── Handlers ───────────────────────────────────────────────────────────────
  const onSave = () =>
    handleSave({ province, district, birthDate, gender })

  const onConfirmSave = () =>
    confirmSave({ province, district, birthDate, gender, userType })

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <Box sx={{ display: 'flex', height: '100vh', bgcolor: 'white' }}>
      <ToastContainer position="top-center" autoClose={2000} newestOnTop style={{ zIndex: 9999 }} />

      <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', p: 0 }}>

        {/* ── Header ── */}
        <Box sx={{ px: 3, pt: 3, pb: 2 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <IconButton
                  onClick={goBack}
                  sx={{ color: 'primary.main', bgcolor: 'rgba(25,118,210,0.08)', mr: 1,
                        '&:hover': { bgcolor: 'rgba(25,118,210,0.12)' } }}
                >
                  <ArrowBackIcon />
                </IconButton>
                <Typography variant="h4" fontWeight="600">Үйлчлүүлэгч бүртгэх</Typography>
              </Box>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                Үйлчлүүлэгчийн мэдээллийг үнэн зөв оруулж бүртгэнэ үү.
              </Typography>
            </Box>
            <Button
              variant="contained" color="primary"
              startIcon={<SaveIcon />}
              onClick={onSave}
              disabled={isLoading}
              sx={{ borderRadius: '8px', textTransform: 'none', px: 3 }}
            >
              Хадгалах
            </Button>
          </Box>

          <Tabs value={tabValue} onChange={(_, v) => setTabValue(v)}
            textColor="primary" indicatorColor="primary"
            sx={{ borderBottom: 1, borderColor: 'divider' }}
          >
            <Tab label="Энгийнээр бүртгэх" />
            <Tab label="Иргэний үнэмлэхээр бүртгэх" />
            <Tab label="SISI карт уншуулах" />
          </Tabs>
        </Box>

        {/* ── Content ── */}
        <Box sx={{ flexGrow: 1, mx: 3, mb: 3 }}>
          <Paper sx={{ p: 3, border: '1px solid #eee', boxShadow: 'none', borderRadius: '12px' }}>

            {tabValue === 1 && (
              <Box sx={{ p: 4, textAlign: 'center' }}>
                <Typography>Иргэний үнэмлэхээр бүртгэх боломж удахгүй нэмэгдэнэ.</Typography>
              </Box>
            )}

            {tabValue === 2 && (
              <Box sx={{ p: 4, textAlign: 'center' }}>
                <Typography>SISI карт уншуулах боломж удахгүй нэмэгдэнэ.</Typography>
              </Box>
            )}

            {tabValue === 0 && (
              <Box component="form" noValidate autoComplete="off">
                <Grid container spacing={3}>

                  {/* ── Хувийн мэдээлэл ── */}
                  <Grid item xs={12}>
                    <Typography variant="subtitle1" fontWeight="600">Хувийн мэдээлэл</Typography>
                  </Grid>

                  {[
                    { label: 'Овог',  name: 'lastName',  icon: <PersonIcon color="primary" /> },
                    { label: 'Нэр',   name: 'firstName', icon: <PersonIcon color="primary" /> },
                  ].map(({ label, name, icon }) => (
                    <Grid item xs={12} sm={4} key={name}>
                      <TextField fullWidth label={label} name={name}
                        value={formData[name]} onChange={handleFormChange}
                        variant="outlined" size="small"
                        InputProps={{ startAdornment: <InputAdornment position="start">{icon}</InputAdornment> }}
                      />
                    </Grid>
                  ))}

                  <Grid item xs={12} sm={4}>
                    <TextField fullWidth label="Регистрийн дугаар" name="registrationNumber"
                      value={formData.registrationNumber} onChange={handleFormChange}
                      variant="outlined" size="small"
                      InputProps={{ startAdornment: <InputAdornment position="start"><BadgeIcon color="primary" /></InputAdornment> }}
                    />
                  </Grid>

                  <Grid item xs={12} sm={4}>
                    <LocalizationProvider dateAdapter={AdapterDateFns}>
                      <DatePicker
                        label="Төрсөн он/сар/өдөр"
                        value={birthDate}
                        onChange={setBirthDate}
                        slotProps={{
                          textField: {
                            size: 'small', fullWidth: true,
                            InputProps: {
                              startAdornment: (
                                <InputAdornment position="start">
                                  <CalendarMonthIcon color="primary" />
                                </InputAdornment>
                              ),
                            },
                          },
                        }}
                      />
                    </LocalizationProvider>
                  </Grid>

                  <Grid item xs={12} sm={2}>
                    <FormControl fullWidth size="small">
                      <InputLabel>Төрөл</InputLabel>
                      <Select label="Төрөл" value={userType} onChange={(e) => setUserType(e.target.value)}
                        startAdornment={<InputAdornment position="start"><SchoolIcon color="primary" /></InputAdornment>}
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
                      <Select label="Хүйс" value={gender} onChange={(e) => setGender(e.target.value)}
                        startAdornment={<InputAdornment position="start"><WcIcon color="primary" /></InputAdornment>}
                      >
                        <MenuItem value=""><em>Сонгох</em></MenuItem>
                        <MenuItem value="male">Эрэгтэй</MenuItem>
                        <MenuItem value="female">Эмэгтэй</MenuItem>
                        <MenuItem value="other">Бусад</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>

                  <Grid item xs={12} sm={4}>
                    <TextField fullWidth label="Үйлчлүүлэгчийн мэргэжил" name="profession"
                      value={formData.profession} onChange={handleFormChange}
                      variant="outlined" size="small"
                      InputProps={{ startAdornment: <InputAdornment position="start"><WorkIcon color="primary" /></InputAdornment> }}
                    />
                  </Grid>

                  <Grid item xs={12} sm={4}>
                    <FormControl fullWidth size="small">
                      <InputLabel>Салбар сургууль</InputLabel>
                      <Select label="Салбар сургууль" name="school"
                        value={formData.school} onChange={handleFormChange}
                        startAdornment={<InputAdornment position="start"><LocationCityIcon color="primary" /></InputAdornment>}
                      >
                        <MenuItem value=""><em>Сонгох</em></MenuItem>
                        {SCHOOL_OPTIONS.map((opt) => (
                          <MenuItem key={opt} value={opt}>{opt}</MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>

                  {/* ── Хаягийн мэдээлэл ── */}
                  <Grid item xs={12} sx={{ mt: 1 }}>
                    <Typography variant="subtitle1" fontWeight="600">Хаягийн мэдээлэл</Typography>
                  </Grid>

                  <Grid item xs={12} sm={4}>
                    <FormControl fullWidth size="small">
                      <InputLabel>Хот / Аймаг</InputLabel>
                      <Select label="Хот / Аймаг" value={province} onChange={handleProvinceChange}
                        startAdornment={<InputAdornment position="start"><LocationCityIcon color="primary" /></InputAdornment>}
                      >
                        <MenuItem value=""><em>Сонгох</em></MenuItem>
                        {PROVINCES.map((name) => (
                          <MenuItem key={name} value={name}>{name}</MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>

                  <Grid item xs={12} sm={4}>
                    <FormControl fullWidth size="small" disabled={!province}>
                      <InputLabel>Сум / Дүүрэг</InputLabel>
                      <Select label="Сум / Дүүрэг" value={district} onChange={handleDistrictChange}
                        startAdornment={<InputAdornment position="start"><ApartmentIcon color="primary" /></InputAdornment>}
                      >
                        <MenuItem value=""><em>Сонгох</em></MenuItem>
                        {availableDistricts.map((name) => (
                          <MenuItem key={name} value={name}>{name}</MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>

                  <Grid item xs={12} sm={4}>
                    <TextField fullWidth label="Хороо / Байр" name="apartment"
                      value={formData.apartment} onChange={handleFormChange}
                      variant="outlined" size="small"
                      InputProps={{ startAdornment: <InputAdornment position="start"><HomeIcon color="primary" /></InputAdornment> }}
                    />
                  </Grid>

                  <Grid item xs={12} sm={4}>
                    <TextField fullWidth label="Гудамж / Байр / Тоот" name="street"
                      value={formData.street} onChange={handleFormChange}
                      variant="outlined" size="small"
                      InputProps={{ startAdornment: <InputAdornment position="start"><HomeIcon color="primary" /></InputAdornment> }}
                    />
                  </Grid>

                  <Grid item xs={12} sm={4}>
                    <TextField fullWidth label="Цахим шуудан" name="email"
                      value={formData.email} onChange={handleFormChange}
                      variant="outlined" size="small"
                      InputProps={{ startAdornment: <InputAdornment position="start"><EmailIcon color="primary" /></InputAdornment> }}
                    />
                  </Grid>

                  <Grid item xs={12} sm={4}>
                    <TextField fullWidth label="Нууц үг" name="password" type="password"
                      value={formData.password} onChange={handleFormChange}
                      variant="outlined" size="small"
                      InputProps={{ startAdornment: <InputAdornment position="start"><LockIcon color="primary" /></InputAdornment> }}
                    />
                  </Grid>

                  <Grid item xs={12} sm={4}>
                    <TextField fullWidth label="Утас" name="phone"
                      value={formData.phone} onChange={handleFormChange}
                      variant="outlined" size="small"
                      InputProps={{ startAdornment: <InputAdornment position="start"><PhoneIcon color="primary" /></InputAdornment> }}
                    />
                  </Grid>

                  <Grid item xs={12} sm={4}>
                    <TextField fullWidth label="Тэмдэглэл" name="notes"
                      value={formData.notes} onChange={handleFormChange}
                      variant="outlined" size="small" multiline rows={1}
                      InputProps={{ startAdornment: <InputAdornment position="start"><NotesIcon color="primary" /></InputAdornment> }}
                    />
                  </Grid>

                </Grid>
              </Box>
            )}
          </Paper>
        </Box>
      </Box>

      {/* ── Confirm Dialog ── */}
      <Dialog open={openConfirmDialog} onClose={() => setOpenConfirmDialog(false)}
        PaperProps={{ sx: { borderRadius: '12px', width: 400, boxShadow: '0px 8px 24px rgba(0,0,0,0.12)' } }}
      >
        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6" fontWeight={600}>Мэдээлэл хадгалах</Typography>
          <IconButton size="small" onClick={() => setOpenConfirmDialog(false)}>
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
          <Button onClick={() => setOpenConfirmDialog(false)} variant="outlined"
            sx={{ borderRadius: '8px', textTransform: 'none', px: 3, minWidth: 120 }}>
            Болих
          </Button>
          <Button onClick={onConfirmSave} variant="contained" disabled={isLoading}
            sx={{ borderRadius: '8px', textTransform: 'none', px: 3, minWidth: 120 }}>
            Хадгалах
          </Button>
        </DialogActions>
      </Dialog>

      {/* ── Success Dialog ── */}
      <Dialog open={openSuccessDialog}
        PaperProps={{ sx: { borderRadius: '12px', width: 400, boxShadow: '0px 8px 24px rgba(0,0,0,0.12)' } }}
      >
        <DialogContent sx={{ pt: 4, textAlign: 'center' }}>
          <CheckCircleOutlineIcon color="success" sx={{ fontSize: 60, mb: 2 }} />
          <Typography variant="h6" gutterBottom>Амжилттай!</Typography>
          <Typography>Үйлчлүүлэгчийн мэдээллийг амжилттай хадгаллаа.</Typography>
        </DialogContent>
        <DialogActions sx={{ pb: 3, display: 'flex', flexDirection: 'column', gap: 1.5, px: 3 }}>
          <Button fullWidth variant="contained" onClick={goToExamination}
            sx={{ borderRadius: '8px', textTransform: 'none', height: 40 }}>
            Үзлэг рүү буцах
          </Button>
          <Button fullWidth variant="contained" onClick={goToCustomer}
            sx={{ borderRadius: '8px', textTransform: 'none', height: 40 }}>
            Нийт үйлчлүүлэгчид рүү буцах
          </Button>
        </DialogActions>
      </Dialog>

    </Box>
  )
}