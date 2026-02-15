import React, { useState } from 'react';
import { 
  Box, Typography, Card, CardContent, 
  Button, TextField, Dialog, DialogTitle, DialogContent, 
  DialogActions, IconButton, Divider, Alert,
  Chip, Grid, Paper, Tooltip
} from '@mui/material';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import ReportProblemIcon from '@mui/icons-material/ReportProblem';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import EditIcon from '@mui/icons-material/Edit';
import CloseIcon from '@mui/icons-material/Close';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import DescriptionIcon from '@mui/icons-material/Description';
import patientService from '../../../service/patientService';

const PatientAllergies = ({ allergies = [], onUpdate, patientId, currentPatient }) => {
  const [openDialog, setOpenDialog] = useState(false);
  const [editingIndex, setEditingIndex] = useState(null);
  const [newAllergy, setNewAllergy] = useState({
    allergy_name: '',
    severity: '',
    reaction: '',
    date_of_onset: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const resetForm = () => {
    setNewAllergy({ 
      allergy_name: '', 
      severity: '', 
      reaction: '', 
      date_of_onset: '' 
    });
    setError('');
    setEditingIndex(null);
  };

  const handleOpenDialog = () => {
    setOpenDialog(true);
    resetForm();
  };

  const handleEditAllergy = (index) => {
    setEditingIndex(index);
    setNewAllergy({ ...allergies[index] });
    setOpenDialog(true);
    setError('');
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    resetForm();
  };

  const handleSaveAllergy = async (e) => {
    console.log("🟡 handleSaveAllergy() called");
    if (e?.preventDefault) e.preventDefault();
  
    if (!newAllergy.allergy_name.trim()) {
      setError('Харшлын нэр шаардлагатай');
      return;
    }
  
    setLoading(true);
    try {
      let updatedAllergies = [...allergies];
  
      if (editingIndex !== null) {
        // Update existing allergy
        const current = allergies[editingIndex];
        if (current._id) {
          // Update in database
          const updated = await patientService.updatePatientAllergy(current._id, newAllergy);
          updatedAllergies[editingIndex] = { 
            ...current, 
            ...newAllergy,
            _id: current._id 
          };
        } else {
          // Local update only
          updatedAllergies[editingIndex] = { ...newAllergy };
        }
      } else {
        // Create new allergy
        const allergyData = {
          ...newAllergy,
          patient: patientId || (currentPatient?.id || currentPatient?._id)
        };
        
        if (patientId || currentPatient) {
          const created = await patientService.createPatientAllergy(allergyData);
          console.log("✅ API-с ирсэн:", created);
console.log("✅ Шинээр хадгалагдсан allergy:", created.data);
          updatedAllergies.push(created.data);
        } else {
          updatedAllergies.push({ ...newAllergy });
        }
      }
  
      // Update parent state immediately
      onUpdate(updatedAllergies);
      setOpenDialog(false);
      resetForm();
    } catch (err) {
      console.error("Харшлын хадгалалт алдаа:", err);
      setError("Хадгалах үед алдаа гарлаа");
    } finally {
      setLoading(false);
    }
  };
  
  const handleDeleteAllergy = async (index) => {
    const target = allergies[index];
    setLoading(true);
    
    try {
      if (target._id) {
        await patientService.deletePatientAllergy(target._id);
      }
  
      // Update parent state immediately
      const updatedAllergies = allergies.filter((_, i) => i !== index);
      onUpdate(updatedAllergies);
    } catch (err) {
      console.error("Харшил устгах алдаа:", err);
      setError("Устгах үед алдаа гарлаа");
    } finally {
      setLoading(false);
    }
  };

  const getSeverityColor = (severity) => {
    switch (severity?.toLowerCase()) {
      case 'mild':
      case 'хөнгөн':
        return { color: 'success.main', bgcolor: 'success.light' };
      case 'moderate':
      case 'дунд':
        return { color: 'warning.main', bgcolor: 'warning.light' };
      case 'severe':
      case 'хүнд':
        return { color: 'error.main', bgcolor: 'error.light' };
      default:
        return { color: 'grey.600', bgcolor: 'grey.100' };
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
      boxShadow: '0px 4px 12px rgba(255, 152, 0, 0.2)',
      border: '1px solid #ff9800',
      backgroundColor: 'rgba(255, 152, 0, 0.02)',
      transition: 'all 0.3s ease',
      '&:hover': {
        boxShadow: '0px 6px 16px rgba(255, 152, 0, 0.25)',
        transform: 'translateY(-2px)'
      }
    }}>
      <CardContent sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <ReportProblemIcon sx={{ color: 'warning.main', mr: 1, fontSize: 28 }} />
            <Typography variant="h6" fontWeight="600" color="warning.dark">Анхааруулга: Харшил</Typography>
          </Box>
          <Button
            variant="contained"
            color="warning"
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
            Харшил нэмэх
          </Button>
        </Box>

        {allergies.length > 0 ? (
          <>
            <Alert 
              severity="warning" 
              icon={<WarningAmberIcon />}
              sx={{ 
                mb: 2, 
                fontWeight: 500,
                borderRadius: '8px',
                '& .MuiAlert-icon': {
                  fontSize: '1.5rem'
                }
              }}
            >
              Энэ үйлчлүүлэгч дараах харшилтай тул эмчилгээнд анхаарна уу!
            </Alert>
            
            <Grid container spacing={2}>
              {allergies.map((item, index) => (
                <Grid item xs={12} key={item._id || index}>
                  <Paper
                    sx={{
                      p: 2,
                      borderRadius: '12px',
                      border: '1px solid',
                      borderColor: 'rgba(255, 152, 0, 0.3)',
                      backgroundColor: 'rgba(255, 152, 0, 0.05)',
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        transform: 'translateY(-2px)',
                        boxShadow: '0px 4px 8px rgba(255, 152, 0, 0.15)'
                      }
                    }}
                  >
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <Box sx={{ flex: 1 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                          <Typography variant="h6" fontWeight="600" color="text.primary">
                            {item.allergy_name}
                          </Typography>
                          <Chip
                            label={item.severity || 'Тодорхойгүй'}
                            size="small"
                            sx={{
                              ml: 2,
                              ...getSeverityColor(item.severity),
                              fontWeight: 600,
                              fontSize: '0.75rem'
                            }}
                          />
                        </Box>
                        
                        <Divider sx={{ my: 1.5 }} />
                        
                        <Grid container spacing={2}>
                          <Grid item xs={12} md={6}>
                            <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 1 }}>
                              <DescriptionIcon sx={{ color: 'text.secondary', mr: 1, mt: 0.5, fontSize: '1.1rem' }} />
                              <Box>
                                <Typography variant="caption" color="text.secondary" display="block">
                                  Хариу урвал:
                                </Typography>
                                <Typography variant="body2" color="text.primary">
                                  {item.reaction || 'Тодорхойлоогүй'}
                                </Typography>
                              </Box>
                            </Box>
                          </Grid>
                          
                          <Grid item xs={12} md={6}>
                            <Box sx={{ display: 'flex', alignItems: 'flex-start' }}>
                              <CalendarTodayIcon sx={{ color: 'text.secondary', mr: 1, mt: 0.5, fontSize: '1.1rem' }} />
                              <Box>
                                <Typography variant="caption" color="text.secondary" display="block">
                                  Илэрсэн огноо:
                                </Typography>
                                <Typography variant="body2" color="text.primary">
                                  {formatDate(item.date_of_onset)}
                                </Typography>
                              </Box>
                            </Box>
                          </Grid>
                        </Grid>
                      </Box>
                      
                      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, ml: 2 }}>
                        <Tooltip title="Засварлах">
                          <IconButton 
                            onClick={() => handleEditAllergy(index)}
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
                            onClick={() => handleDeleteAllergy(index)}
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
              ))}
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
            Бүртгэлтэй харшил байхгүй байна
          </Alert>
        )}
      </CardContent>

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
          background: 'linear-gradient(135deg, #ff9800 0%, #ff8f00 100%)',
          color: 'white'
        }}>
          {editingIndex !== null ? 'Харшлын мэдээлэл засварлах' : 'Шинэ харшил нэмэх'}
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
                label="Харшлын нэр"
                fullWidth
                required
                value={newAllergy.allergy_name}
                onChange={(e) => setNewAllergy({ ...newAllergy, allergy_name: e.target.value })}
                sx={{ 
                  mb: 2,
                  '& .MuiOutlinedInput-root': {
                    borderRadius: '8px'
                  }
                }}
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                label="Хүндийн зэрэг"
                select
                SelectProps={{ native: true }}
                fullWidth
                value={newAllergy.severity}
                onChange={(e) => setNewAllergy({ ...newAllergy, severity: e.target.value })}
                sx={{ 
                  mb: 2,
                  '& .MuiOutlinedInput-root': {
                    borderRadius: '8px'
                  }
                }}
              >
                <option value="">Сонгоно уу...</option>
                <option value="mild">Хөнгөн</option>
                <option value="moderate">Дунд</option>
                <option value="severe">Хүнд</option>
              </TextField>
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                label="Илэрсэн огноо"
                type="date"
                InputLabelProps={{ shrink: true }}
                fullWidth
                value={newAllergy.date_of_onset}
                onChange={(e) => setNewAllergy({ ...newAllergy, date_of_onset: e.target.value })}
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
                label="Хариу урвал"
                fullWidth
                multiline
                rows={3}
                value={newAllergy.reaction}
                onChange={(e) => setNewAllergy({ ...newAllergy, reaction: e.target.value })}
                placeholder="Харшлын үеийн хариу урвалыг дэлгэрэнгүй оруулна уу..."
                sx={{ 
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
            onClick={handleSaveAllergy} 
            variant="contained" 
            color="warning"
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

export default PatientAllergies;