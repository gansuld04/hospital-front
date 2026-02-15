'use client';

import { useSearchParams } from 'next/navigation';
import React, { useState, useEffect } from 'react';
import {
  Box, Typography, TextField, Button, Dialog, DialogTitle,
  DialogContent, DialogActions, List, ListItem, ListItemButton,
  ListItemText, Snackbar, Alert, Grid, Paper, Avatar, InputAdornment, IconButton
} from '@mui/material';
import PersonIcon from '@mui/icons-material/Person';
import SearchIcon from '@mui/icons-material/Search';
import { useRouter } from 'next/navigation';

export default function NewVitalSignsPage() {
  const router = useRouter();
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [patients, setPatients] = useState([]); // Ensure it's initialized as an empty array
  const [measurementStep, setMeasurementStep] = useState(null); // 'right', 'left', or null
  const [rightNote, setRightNote] = useState('');
  const [leftNote, setLeftNote] = useState('');
  const searchParams = useSearchParams();
  const patientId = searchParams.get('patientId');

  useEffect(() => {
    if (!patientId) return;
  
    const token = getTokenFromLocalStorage();
    if (!token) return;
  
    fetch(`http://localhost:8000/api/patient/${patientId}`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
      .then(res => res.json())
      .then(data => {
        if (data && data.patient) {
          setSelectedPatient(data.patient); // ✅ directly set
        }
      })
      .catch(err => {
        console.error("Failed to fetch patient:", err);
      });
  }, [patientId]);
  
  

  const [formData, setFormData] = useState({
    date: new Date().toISOString().slice(0, 10),
    temperature: '',
    heart_rate: '',
    respiration_rate: '',
    weight: '',
    height: '',
    bmi: '',
    saturation: '',
    consciousness_status: '',
    right_systolic: '',
    right_diastolic: '',
    right_mean_arterial_pressure: '',
    right_note: '',
    left_systolic: '',
    left_diastolic: '',
    left_mean_arterial_pressure: '',
    left_note: ''
  });
  const [notification, setNotification] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSelectPatient = (patient) => {
    console.log('Patient Selected:', patient);
    setSelectedPatient(patient);  // patient._id must be present
  };


  const saveVitalSigns = async () => {
    if (!selectedPatient) {
      setNotification({ message: 'Та үйлчлүүлэгч сонгоно уу', severity: 'warning' });
      return;
    }

    console.log('Selected Patient:', selectedPatient);
  
    const vitalData = {
      patientId: selectedPatient.id, // Get the selected patient ID
      vital_signs: {
        heart_rate: parseFloat(formData.heart_rate),
        right_systolic: parseFloat(formData.right_systolic),
        right_diastolic: parseFloat(formData.right_diastolic),
        right_mean_arterial_pressure: parseFloat(formData.right_mean_arterial_pressure),
        right_note: formData.right_note,
        left_systolic: parseFloat(formData.left_systolic),
        left_diastolic: parseFloat(formData.left_diastolic),
        left_mean_arterial_pressure: parseFloat(formData.left_mean_arterial_pressure),
        left_note: formData.left_note,
        temperature: parseFloat(formData.temperature),
        respiration_rate: parseFloat(formData.respiration_rate),
        oxygen_saturation: parseFloat(formData.saturation),
        height: parseFloat(formData.height),
        weight: parseFloat(formData.weight),
        bmi: parseFloat(formData.bmi),
        consciousness_status: formData.consciousness_status
  
      }
    };
  
    console.log("Vital Data Being Sent:", JSON.stringify(vitalData)); 

    const token = getTokenFromLocalStorage();
  
    try {
      const response = await fetch('http://localhost:8000/api/vital/vitalsigns', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(vitalData),
      });
  
      const data = await response.json();
      if (response.ok) {
        setNotification({ message: 'Амжилттай хадгалагдлаа', severity: 'success' });
      } else {
        setNotification({ message: data.message || 'Алдаа гарлаа', severity: 'error' });
      }
    } catch (error) {
      console.error('Алдаа гарлаа', error);
      setNotification({ message: 'Сервертэй холболт алдаатай', severity: 'error' });
    }
  };
  
  

  const numericFields = [
    'temperature', 'heart_rate', 'respiration_rate', 'weight', 'height', 'bmi',
    'saturation', 'right_systolic', 'right_diastolic', 'right_mean_arterial_pressure',
    'left_systolic', 'left_diastolic', 'left_mean_arterial_pressure'
  ];

  useEffect(() => {
    const fetchPatients = async () => {
      const token = getTokenFromLocalStorage();
      console.log("Token: ", token);
      if (!token) {
        setNotification({ message: 'Токен олдсонгүй. Та дахин нэвтэрч орно уу.', severity: 'error' });
        return;
      }
    
      try {
        const response = await fetch('http://localhost:8000/api/patient/view', {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });
    
        if (!response.ok) {
          throw new Error('Failed to fetch patients');
        }
    
        const data = await response.json();
        console.log(data);
        setPatients(data.patients || []); // Set the fetched patient data
      } catch (error) {
        setNotification({ message: 'Өвчтөний мэдээлэл авахад алдаа гарлаа', severity: 'error' });
      }
    };
    

    fetchPatients();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => {
      const updated = { ...prev, [name]: value };

      // Ensure that numeric fields are valid numbers
      if (numericFields.includes(name) && value !== '' && !/^\d+(\.\d+)?$/.test(value)) {
        return prev; // Stop if it's not a valid number
      }

      // Calculate BMI
      if (['weight', 'height'].includes(name)) {
        const weight = parseFloat(name === 'weight' ? value : prev.weight);
        const heightCm = parseFloat(name === 'height' ? value : prev.height);
        if (!isNaN(weight) && !isNaN(heightCm) && heightCm > 0) {
          const heightM = heightCm / 100;
          const bmi = weight / (heightM ** 2);
          updated.bmi = bmi.toFixed(1);
        } else {
          updated.bmi = ''; // Clear BMI if input is invalid
        }
      }

      return updated;
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedPatient) {
      setNotification({ message: 'Та үйлчлүүлэгч сонгоно уу', severity: 'warning' });
      return;
    }
  
    setLoading(true);
    try {
      await saveVitalSigns();  // ✅ Call the function that actually saves the data
      setNotification({ message: 'Амжилттай хадгалагдлаа', severity: 'success' });
    } catch (error) {
      setNotification({ message: 'Алдаа гарлаа', severity: 'error' });
    } finally {
      setLoading(false);
    }
  };
  

  // Filter patients when the patients array is defined and search term is entered
  const filteredPatients = patients.filter(p =>
    (`${p.lastname} ${p.firstname}`.toLowerCase().includes(search.toLowerCase()) ||
     p.register?.toLowerCase().includes(search.toLowerCase()))
  );
  
  
  console.log("Filtered Patients:", filteredPatients);  // Debugging filter
  // If patients is not an array, return an empty array


  const getTokenFromLocalStorage = () => {
    const user = localStorage.getItem('USER');
    if (user) {
      const parsedUser = JSON.parse(user);
      return parsedUser.token;
    }
    return null;
  };

  const fetchVitalsFromDevice = async (side) => {
    setMeasurementStep(side);
    setLoading(true);
    setNotification(null);
    
    const token = getTokenFromLocalStorage();
    if (!token) {
      setNotification({ message: 'Токен олдсонгүй. Та дахин нэвтэрч орно уу.', severity: 'error' });
      setLoading(false);
      return;
    }
  
    try {
      // First, show a message that we're waiting for data
      setNotification({ 
        message: `${side === 'right' ? 'Баруун' : 'Зүүн'} цусны даралтыг хэмжиж байна...`, 
        severity: 'info' 
      });
  
      // Poll for latest data
      const response = await fetch('http://localhost:8000/api/vital/vitalsigns/latest', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });
  
      if (!response.ok) throw new Error('Failed to fetch vitals');
  
      const data = await response.json();
  
      setFormData(prev => ({
        ...prev,
        [`${side}_systolic`]: data.systolic,
        [`${side}_diastolic`]: data.diastolic,
        [`${side}_mean_arterial_pressure`]: data.mean_arterial_pressure,
        heart_rate: data.heart_rate || prev.heart_rate
      }));
  
      setNotification({ 
        message: `${side === 'right' ? 'Баруун' : 'Зүүн'} цусны даралт амжилттай хэмжигдлээ. Тайлбар бичнэ үү.`, 
        severity: 'success' 
      });
    } catch (err) {
      console.error(err);
      setNotification({ 
        message: `${side === 'right' ? 'Баруун' : 'Зүүн'} цусны даралтыг хэмжихэд алдаа гарлаа. Дахин оролдоно уу.`, 
        severity: 'error' 
      });
    } finally {
      setLoading(false);
    }
  };
  
  const handleNoteSubmit = (side) => {
    setFormData(prev => ({
      ...prev,
      [`${side}_note`]: side === 'right' ? rightNote : leftNote
    }));
    setMeasurementStep(null);
    setNotification({ 
      message: `${side === 'right' ? 'Баруун' : 'Зүүн'} талын тайлбар амжилттай хадгалагдлаа.`, 
      severity: 'success' 
    });
  };

  return (
    <Box sx={{ p: 4, maxWidth: 960, mx: 'auto' }}>
      <Typography variant="h5" fontWeight={600} mb={3}>Амин үзүүлэлт бүртгэх</Typography>

      {/* Patient Selection UI */}
      {selectedPatient ? (
        <Paper sx={{ p: 2, mb: 4 }}>
        <Typography variant="subtitle1" fontWeight={600}>Үйлчлүүлэгч:</Typography>
        <Typography variant="body1" mt={1}>
          {selectedPatient?.lastname} {selectedPatient?.firstname}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {selectedPatient?.register} | {selectedPatient?.gender}, {
            selectedPatient?.birthOfDate
              ? new Date().getFullYear() - new Date(selectedPatient.birthOfDate).getFullYear()
              : 'насгүй'
          } настай
        </Typography>
        <Button variant="outlined" sx={{ mt: 1 }} onClick={() => setDialogOpen(true)}>
          Өөрчлөх
        </Button>
      </Paper>
      
      ) : (
        <Paper elevation={0} sx={{ textAlign: 'center', py: 6, mb: 4, border: '1px solid #e0e0e0', borderRadius: 3 }}>
          <Avatar sx={{ mx: 'auto', mb: 2, width: 72, height: 72 }}>
            <PersonIcon fontSize="large" />
          </Avatar>
          <Typography variant="h6" gutterBottom>Үйлчлүүлэгч сонгоно уу</Typography>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            Үзлэг бүртгэлийн өмнө үйлчлүүлэгчийг сонгоно уу
          </Typography>
          <Button variant="contained" onClick={() => setDialogOpen(true)}>Үйлчлүүлэгч сонгох</Button>
        </Paper>
      )}

      {/* Form */}
      {selectedPatient && (
         <form onSubmit={handleSubmit}>
         <Grid container spacing={2}>
           {/* Left Column */}
           <Grid item xs={12} sm={6}>
             <TextField fullWidth label="Ухаан санаа" name="consciousness_status" value={formData.consciousness_status || ''} onChange={handleChange} />
             <TextField fullWidth label="Пульс" name="heart_rate" value={formData.heart_rate || ''} onChange={handleChange} type="number" inputProps={{ inputMode: 'numeric', pattern: '[0-9]*' }} sx={{ mt: 2 }} />
             <TextField fullWidth label="Амьсгалын тоо" name="respiration_rate" value={formData.respiration_rate || ''} onChange={handleChange} type="number" inputProps={{ inputMode: 'numeric', pattern: '[0-9]*' }} sx={{ mt: 2 }} />
             <TextField fullWidth label="Сатураци" name="saturation" value={formData.saturation || ''} onChange={handleChange} type="number" inputProps={{ inputMode: 'numeric', pattern: '[0-9]*' }} sx={{ mt: 2 }} />
             <TextField fullWidth label="Биеийн температур (°C)" name="temperature" value={formData.temperature || ''} onChange={handleChange} type="number" inputProps={{ inputMode: 'numeric', pattern: '[0-9]*' }} sx={{ mt: 2 }} />
             <TextField fullWidth label="Өндөр (cm)" name="height" value={formData.height || ''} onChange={handleChange} type="number" inputProps={{ inputMode: 'numeric', pattern: '[0-9]*' }} sx={{ mt: 2 }} />
             <TextField fullWidth label="Жин (kg)" name="weight" value={formData.weight || ''} onChange={handleChange} type="number" inputProps={{ inputMode: 'numeric', pattern: '[0-9]*' }} sx={{ mt: 2 }} />
             <TextField fullWidth label="БЖИ" name="bmi" value={formData.bmi || ''} onChange={handleChange} sx={{ mt: 2 }} />
           </Grid>

           {/* Right Column */}
           <Grid item xs={12} sm={6}>
             <TextField fullWidth label="Баруун даралт /Дээд/" name="right_systolic" value={formData.right_systolic || ''} onChange={handleChange} type="number" inputProps={{ inputMode: 'numeric', pattern: '[0-9]*' }} />
             <TextField fullWidth label="Баруун даралт /Доод/" name="right_diastolic" value={formData.right_diastolic || ''} onChange={handleChange} type="number" inputProps={{ inputMode: 'numeric', pattern: '[0-9]*' }} sx={{ mt: 2 }} />
             <TextField fullWidth label="Гол судасны даралт /Дундаж/" name="right_mean_arterial_pressure" value={formData.right_mean_arterial_pressure || ''} onChange={handleChange} type="number" inputProps={{ inputMode: 'numeric', pattern: '[0-9]*' }} sx={{ mt: 2 }} />
             <TextField fullWidth label="Баруун даралт /Нэмэлт/" name="right_note" value={formData.right_note || ''} onChange={handleChange} sx={{ mt: 2 }} />
             <TextField fullWidth label="Зүүн даралт /Дээд/" name="left_systolic" value={formData.left_systolic || ''} onChange={handleChange} type="number" inputProps={{ inputMode: 'numeric', pattern: '[0-9]*' }} sx={{ mt: 2 }} />
             <TextField fullWidth label="Зүүн даралт /Доод/" name="left_diastolic" value={formData.left_diastolic || ''} onChange={handleChange} type="number" inputProps={{ inputMode: 'numeric', pattern: '[0-9]*' }} sx={{ mt: 2 }} />
             <TextField fullWidth label="Зүүн даралт /Дундаж/" name="left_mean_arterial_pressure" value={formData.left_mean_arterial_pressure || ''} onChange={handleChange} type="number" inputProps={{ inputMode: 'numeric', pattern: '[0-9]*' }} sx={{ mt: 2 }} />
             <TextField fullWidth label="Зүүн даралт /Нэмэлт/" name="left_note" value={formData.left_note || ''} onChange={handleChange} sx={{ mt: 2 }} />
           </Grid>
           </Grid>
           <Box mt={3} display="flex" justifyContent="space-between" flexWrap="wrap" gap={2}>
            <Button variant="outlined" onClick={() => router.push('/vitals')}>Буцах</Button>
              <Box display="flex" gap={2}>
                <Button 
                  variant="outlined" 
                  onClick={() => fetchVitalsFromDevice('right')}
                  disabled={measurementStep !== null}
                >
                  📡 Баруун талаас авах
                </Button>
                <Button 
                  variant="outlined" 
                  onClick={() => fetchVitalsFromDevice('left')}
                  disabled={measurementStep !== null}
                >
                  📡 Зүүн талаас авах
                </Button>
                <Button 
                  type="submit" 
                  variant="contained" 
                  disabled={loading} 
                >
                  Хадгалах
                </Button>

              </Box>
            </Box>
        </form>
      )}

      {/* Measurement Dialogs */}
      <Dialog open={measurementStep === 'right'} onClose={() => setMeasurementStep(null)}>
        <DialogTitle>Баруун цусны даралт</DialogTitle>
        <DialogContent>
          <Typography variant="body1" gutterBottom>
            Даралт: {formData.right_systolic} / {formData.right_diastolic} mmHg
          </Typography>
          <Typography variant="body1" gutterBottom>
            Дундаж даралт: {formData.right_mean_arterial_pressure} mmHg
          </Typography>
          <TextField
            fullWidth
            label="Тайлбар"
            value={rightNote}
            onChange={(e) => setRightNote(e.target.value)}
            multiline
            rows={3}
            sx={{ mt: 2 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setMeasurementStep(null)}>Цуцлах</Button>
          <Button 
            onClick={() => handleNoteSubmit('right')} 
            variant="contained"
            disabled={!rightNote}
          >
            Хадгалах
          </Button>
        </DialogActions>
      </Dialog>
      
      <Dialog open={measurementStep === 'left'} onClose={() => setMeasurementStep(null)}>
        <DialogTitle>Зүүн цусны даралт</DialogTitle>
        <DialogContent>
          <Typography variant="body1" gutterBottom>
            Даралт: {formData.left_systolic}/{formData.left_diastolic} mmHg
          </Typography>
          <Typography variant="body1" gutterBottom>
            Дундаж даралт: {formData.left_mean_arterial_pressure} mmHg
          </Typography>
          <TextField
            fullWidth
            label="Тайлбар"
            value={leftNote}
            onChange={(e) => setLeftNote(e.target.value)}
            multiline
            rows={3}
            sx={{ mt: 2 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setMeasurementStep(null)}>Цуцлах</Button>
          <Button 
            onClick={() => handleNoteSubmit('left')} 
            variant="contained"
            disabled={!leftNote}
          >
            Хадгалах
          </Button>
        </DialogActions>
      </Dialog>

      {/* Patient Dialog */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle>Үйлчлүүлэгч сонгох</DialogTitle>
        <DialogContent>
          <TextField
            placeholder="Нэр эсвэл регистрийн дугаараар хайх"
            fullWidth
            variant="outlined"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            size="small"
            margin="dense"
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              )
            }}
          />
         <List>
          {filteredPatients.map((p) => {
            const birthYear = p.birthOfDate ? new Date(p.birthOfDate).getFullYear() : null;
            const currentYear = new Date().getFullYear();
            const age = birthYear ? currentYear - birthYear : 'насгүй';

            return (
              <ListItem key={p.id} disablePadding>
                <ListItemButton onClick={() => {
                  setSelectedPatient(p);
                  setDialogOpen(false);
                }}>
                  <ListItemText
                    primary={`${p.lastname ?? ''} ${p.firstname ?? ''}`}
                    secondary={`${p.register ?? 'Регистер байхгүй'} | ${p.gender ?? 'Хүйсгүй'}, ${age} настай`}
                  />
                </ListItemButton>
              </ListItem>
            );
          })}
        </List>


        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Цуцлах</Button>
        </DialogActions>
      </Dialog>

      {/* Notifications */}
      <Snackbar
        open={!!notification}
        autoHideDuration={3000}
        onClose={() => setNotification(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        {notification && (
          <Alert severity={notification.severity} onClose={() => setNotification(null)}>
            {notification.message}
          </Alert>
        )}
      </Snackbar>
    </Box>
  );
}
