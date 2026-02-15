import React, { useState } from 'react';
import { 
  Box, Typography, Card, CardContent, Alert,
  Button, TextField, Dialog, DialogTitle, DialogContent,
  DialogActions, IconButton, Grid, Paper, Tooltip,
  Select, MenuItem, FormControl, InputLabel, Divider
} from '@mui/material';
import MonitorHeartIcon from '@mui/icons-material/MonitorHeart';
import HealthAndSafetyIcon from '@mui/icons-material/HealthAndSafety';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import CloseIcon from '@mui/icons-material/Close';
import EditIcon from '@mui/icons-material/Edit';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import DescriptionIcon from '@mui/icons-material/Description';
import Chip from '@mui/material/Chip';
import LocalHospitalIcon from '@mui/icons-material/LocalHospital';
import AssignmentIcon from '@mui/icons-material/Assignment';
import patientService from '../../../service/patientService';

const PatientChronicDiseases = ({ chronicDiseases = [], onUpdate, patientId, currentPatient }) => {
  const [openDialog, setOpenDialog] = useState(false);
  const [editingIndex, setEditingIndex] = useState(null);
  const [newDisease, setNewDisease] = useState({
    name: '',
    description: '',
    diagnosisDate: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const resetForm = () => {
    setNewDisease({
      name: '',
      description: '',
      diagnosisDate: ''
    });
    setError('');
    setEditingIndex(null);
  };
  
  const handleOpenDialog = () => {
    setOpenDialog(true);
    resetForm();
  };

  const handleEditDisease = (index) => {
    setEditingIndex(index);
    // Handle both old format (string) and new format (object)
    if (typeof chronicDiseases[index] === 'string') {
      setNewDisease({
        name: chronicDiseases[index],
        description: '',
        diagnosisDate: ''
      });
    } else {
      setNewDisease({ ...chronicDiseases[index] });
    }
    setOpenDialog(true);
    setError('');
  };
  
  const handleCloseDialog = () => {
    setOpenDialog(false);
    resetForm();
  };
  
  const handleSaveDisease = async (e) => {
    console.log("🟡 handleSaveDisease() called");
    if (e?.preventDefault) e.preventDefault();
  
    if (!newDisease.name.trim()) {
      setError('Өвчний нэр шаардлагатай');
      return;
    }
  
    // Check for duplicates
    const exists = chronicDiseases.some((disease, index) => {
      const diseaseName = typeof disease === 'string' ? disease : disease.name;
      return diseaseName === newDisease.name.trim() && index !== editingIndex;
    });
    
    if (exists) {
      setError('Энэ өвчин аль хэдийн бүртгэгдсэн байна');
      return;
    }
  
    setLoading(true);
    try {
      let updatedDiseases = [...chronicDiseases];
  
      if (editingIndex !== null) {
        // Update existing disease
        const current = chronicDiseases[editingIndex];
        if (current._id) {
          // Update in database
          const updated = await patientService.updatePatientChronicDisease(current._id, newDisease);
          updatedDiseases[editingIndex] = { 
            ...current, 
            ...newDisease,
            _id: current._id 
          };
        } else {
          // Local update only
          updatedDiseases[editingIndex] = { ...newDisease };
        }
      } else {
        // Create new disease
        const diseaseData = {
          ...newDisease,
          patient: patientId || (currentPatient?.id || currentPatient?._id)
        };
        
        if (patientId || currentPatient) {
          const created = await patientService.createPatientChronicDisease(diseaseData);
          console.log("✅ API-с ирсэн:", created);
          console.log("✅ Шинээр хадгалагдсан chronic disease:", created.data);
          updatedDiseases.push(created.data);
        } else {
          updatedDiseases.push({ ...newDisease });
        }
      }
  
      // Update parent state immediately
      onUpdate(updatedDiseases);
      setOpenDialog(false);
      resetForm();
    } catch (err) {
      console.error("Архаг өвчний хадгалалт алдаа:", err);
      setError("Хадгалах үед алдаа гарлаа");
    } finally {
      setLoading(false);
    }
  };
  
  const handleDeleteDisease = async (index) => {
    const target = chronicDiseases[index];
    setLoading(true);
    
    try {
      if (target._id) {
        await patientService.deletePatientChronicDisease(target._id);
      }
  
      // Update parent state immediately
      const updatedDiseases = chronicDiseases.filter((_, i) => i !== index);
      onUpdate(updatedDiseases);
    } catch (err) {
      console.error("Архаг өвчин устгах алдаа:", err);
      setError("Устгах үед алдаа гарлаа");
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '—';
    return new Date(dateString).toLocaleDateString('mn-MN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <Card sx={{ 
      mb: 3, 
      borderRadius: 2, 
      boxShadow: '0px 4px 12px rgba(229, 57, 53, 0.2)',
      border: '1px solid #e53935',
      backgroundColor: 'rgba(229, 57, 53, 0.02)',
      transition: 'all 0.3s ease',
      '&:hover': {
        boxShadow: '0px 6px 16px rgba(229, 57, 53, 0.25)',
        transform: 'translateY(-2px)'
      }
    }}>
      <CardContent sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <HealthAndSafetyIcon sx={{ color: 'error.main', mr: 1, fontSize: 28 }} />
            <Typography variant="h6" fontWeight="600" color="error.dark">Анхааруулга: Архаг өвчин</Typography>
          </Box>
          <Button
            variant="contained"
            color="error"
            size="small"
            startIcon={<AddCircleOutlineIcon />}
            onClick={handleOpenDialog}
            disabled={loading}
            sx={{ 
              borderRadius: '8px',
              textTransform: 'none',
              fontSize: '0.75rem',
              py: 0.5,
              color: 'white',
              '&:hover': {
                transform: 'scale(1.05)'
              }
            }}
          >
            Өвчин нэмэх
          </Button>
        </Box>
        
        {chronicDiseases.length > 0 ? (
          <>
            <Alert 
              severity="error" 
              icon={<MonitorHeartIcon />}
              sx={{ 
                mb: 2, 
                fontWeight: 500,
                borderRadius: '8px',
                '& .MuiAlert-icon': {
                  fontSize: '1.5rem'
                }
              }}
            >
              Энэ үйлчлүүлэгч дараах архаг өвчинтэй тул эмчилгээнд анхаарна уу!
            </Alert>
            
            <Grid container spacing={2}>
              {chronicDiseases.map((disease, index) => {
                // Handle both old format (string) and new format (object)
                const diseaseData = typeof disease === 'string' 
                  ? { name: disease, description: '', diagnosisDate: '' }
                  : disease;

                // Debug logging
                console.log(`Chronic Disease ${index}:`, {
                  _id: disease._id,
                  key: disease._id ? `chronic-${disease._id}` : `chronic-new-${index}`,
                  disease
                });

                return (
                  <Grid item xs={12} key={disease._id ? `chronic-${disease._id}` : `chronic-new-${index}`}>
                    <Paper
                      sx={{
                        p: 2,
                        borderRadius: '12px',
                        border: '1px solid',
                        borderColor: 'rgba(229, 57, 53, 0.3)',
                        backgroundColor: 'rgba(229, 57, 53, 0.05)',
                        transition: 'all 0.3s ease',
                        '&:hover': {
                          transform: 'translateY(-2px)',
                          boxShadow: '0px 4px 8px rgba(229, 57, 53, 0.15)'
                        }
                      }}
                    >
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <Box sx={{ flex: 1 }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1, flexWrap: 'wrap', gap: 1 }}>
                            <Typography variant="h6" fontWeight="600" color="text.primary">
                              {diseaseData.name}
                            </Typography>
                          </Box>
                          
                          {(diseaseData.diagnosisDate || diseaseData.description) && (
                            <>
                              <Divider sx={{ my: 1.5 }} />
                              
                              <Grid container spacing={2}>
                                {diseaseData.diagnosisDate && (
                                  <Grid item xs={12} md={6}>
                                    <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 1 }}>
                                      <CalendarTodayIcon sx={{ color: 'text.secondary', mr: 1, mt: 0.5, fontSize: '1.1rem' }} />
                                      <Box>
                                        <Typography variant="caption" color="text.secondary" display="block">
                                          Илрүүлсэн огноо:
                                        </Typography>
                                        <Typography variant="body2" color="text.primary">
                                          {formatDate(diseaseData.diagnosisDate)}
                                        </Typography>
                                      </Box>
                                    </Box>
                                  </Grid>
                                )}
                                
                                {diseaseData.description && (
                                  <Grid item xs={12} md={6}>
                                    <Box sx={{ display: 'flex', alignItems: 'flex-start' }}>
                                      <DescriptionIcon sx={{ color: 'text.secondary', mr: 1, mt: 0.5, fontSize: '1.1rem' }} />
                                      <Box>
                                        <Typography variant="caption" color="text.secondary" display="block">
                                          Тайлбар:
                                        </Typography>
                                        <Typography variant="body2" color="text.primary">
                                          {diseaseData.description}
                                        </Typography>
                                      </Box>
                                    </Box>
                                  </Grid>
                                )}
                              </Grid>
                            </>
                          )}
                        </Box>
                        
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, ml: 2 }}>
                          <Tooltip title="Засварлах">
                            <IconButton 
                              onClick={() => handleEditDisease(index)}
                              disabled={loading}
                              sx={{ 
                                color: 'primary.main',
                                '&:hover': { 
                                  color: 'primary.dark',
                                  transform: 'scale(1.1)'
                                }
                              }}
                            >
                              <EditIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Устгах">
                            <IconButton 
                              onClick={() => handleDeleteDisease(index)}
                              disabled={loading}
                              sx={{ 
                                color: 'error.main',
                                '&:hover': { 
                                  color: 'error.dark',
                                  transform: 'scale(1.1)'
                                }
                              }}
                            >
                              <DeleteOutlineIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        </Box>
                      </Box>
                    </Paper>
                  </Grid>
                );
              })}
            </Grid>
          </>
        ) : (
          <Alert 
            severity="info" 
            sx={{ 
              mt: 1,
              borderRadius: '8px',
              '& .MuiAlert-icon': {
                fontSize: '1.5rem'
              }
            }}
          >
            Бүртгэлтэй архаг өвчин байхгүй байна
          </Alert>
        )}
      </CardContent>

      {/* Add/Edit Disease Dialog */}
      <Dialog 
        open={openDialog} 
        onClose={handleCloseDialog} 
        maxWidth="sm" 
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: '12px',
            boxShadow: '0px 8px 32px rgba(0, 0, 0, 0.12)'
          }
        }}
      >
        <DialogTitle sx={{ 
          m: 0, 
          p: 3, 
          fontWeight: 600,
          background: 'linear-gradient(135deg, #e53935 0%, #c62828 100%)',
          color: 'white'
        }}>
          {editingIndex !== null ? 'Архаг өвчний мэдээлэл засварлах' : 'Шинэ архаг өвчин нэмэх'}
          <IconButton
            onClick={handleCloseDialog}
            sx={{
              position: 'absolute',
              right: 8,
              top: 8,
              color: 'white',
              '&:hover': {
                backgroundColor: 'rgba(255, 255, 255, 0.1)'
              }
            }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        
        <DialogContent dividers sx={{ px: 3, py: 2 }}>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                label="Өвчний нэр"
                fullWidth
                required
                value={newDisease.name}
                onChange={(e) => setNewDisease({ ...newDisease, name: e.target.value })}
                sx={{ 
                  mb: 2,
                  '& .MuiOutlinedInput-root': {
                    borderRadius: '8px'
                  }
                }}
              />
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                label="Тайлбар"
                fullWidth
                multiline
                rows={3}
                value={newDisease.description}
                onChange={(e) => setNewDisease({ ...newDisease, description: e.target.value })}
                placeholder="Өвчний тухай дэлгэрэнгүй мэдээлэл..."
                sx={{ 
                  '& .MuiOutlinedInput-root': {
                    borderRadius: '8px'
                  }
                }}
              />
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                label="Илрүүлсэн огноо"
                type="date"
                InputLabelProps={{ shrink: true }}
                fullWidth
                value={newDisease.diagnosisDate}
                onChange={(e) => setNewDisease({ ...newDisease, diagnosisDate: e.target.value })}
                sx={{ 
                  mb: 2,
                  '& .MuiOutlinedInput-root': {
                    borderRadius: '8px'
                  }
                }}
              />
            </Grid>
          </Grid>
          
          {error && (
            <Alert 
              severity="error" 
              sx={{ 
                mt: 2,
                borderRadius: '8px'
              }}
            >
              {error}
            </Alert>
          )}
        </DialogContent>
        
        <DialogActions sx={{ px: 3, py: 2, gap: 1 }}>
          <Button 
            onClick={handleCloseDialog} 
            variant="outlined" 
            color="inherit"
            disabled={loading}
            sx={{ 
              borderRadius: '8px',
              textTransform: 'none',
              px: 3
            }}
          >
            Цуцлах
          </Button>
          <Button 
            onClick={handleSaveDisease} 
            variant="contained" 
            color="error"
            disabled={loading}
            sx={{ 
              color: 'white',
              borderRadius: '8px',
              textTransform: 'none',
              px: 3,
              '&:hover': {
                transform: 'scale(1.05)'
              }
            }}
          >
            {loading ? 'Хадгалж байна...' : (editingIndex !== null ? 'Шинэчлэх' : 'Нэмэх')}
          </Button>
        </DialogActions>
      </Dialog>
    </Card>
  );
};

export default PatientChronicDiseases;