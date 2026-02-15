'use client';

import React, { useState, useEffect } from 'react';
import {
  Box, Tabs, Tab, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Paper, Button, IconButton, Pagination, TextField,
  Typography, Avatar, Menu, MenuItem, Dialog, DialogTitle, DialogContent, 
  DialogActions, Divider, FormControl, InputLabel, Select, Stack,
  Alert, Snackbar, CircularProgress
} from '@mui/material';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import AddIcon from '@mui/icons-material/Add';
import SearchIcon from '@mui/icons-material/Search';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import DeleteOutlineOutlinedIcon from '@mui/icons-material/DeleteOutlineOutlined';
import CloseIcon from '@mui/icons-material/Close';
import { useRouter } from 'next/navigation';
import medicalStaffService from '../../../../src/app/service/medicalStaffService';

export default function MedicalStaff() {
  // Position translation mapping
  const positionTranslations = {
    'Doctor': 'Эмч',
    'Nurse': 'Сувилагч'
  };

  // Function to get Mongolian position text
  const getMongolianlPosition = (englishPosition) => {
    return positionTranslations[englishPosition] || englishPosition || 'N/A';
  };
  
  const router = useRouter();
  const [tabValue, setTabValue] = useState(0);
  const [page, setPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const ITEMS_PER_PAGE = 6;

  const [medicalStaff, setMedicalStaff] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedStaff, setSelectedStaff] = useState(null);

  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [openDeleteConfirm, setOpenDeleteConfirm] = useState(false);

  const [editFormData, setEditFormData] = useState({
    id: '',
    name: '',
    position: '',
    specialization: '',
    email: '',
    phone: ''
  });

  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });

  // Fetch medical staff on component mount
  useEffect(() => {
    fetchMedicalStaff();
  }, []);

  const fetchMedicalStaff = async () => {
    try {
      setLoading(true);
      const response = await medicalStaffService.getAllMedicalStaff();
      
      // Transform backend data to match frontend structure
      const transformedStaff = response.medicalStaff.map((staff) => ({
        id: staff.id,
        name: `${staff.lastname} ${staff.firstname}`,
        position: staff.position || "N/A",
        specialization: staff.specialization || "N/A",
        phone: staff.phoneNumber || "N/A",
        email: staff.email || "N/A",
      }));
      
      setMedicalStaff(transformedStaff);
      setError(null);
    } catch (err) {
      console.error('Error fetching medical staff:', err);
      setError('Эмч, сувилагч нарын мэдээлэл татахад алдаа гарлаа');
      setSnackbar({
        open: true,
        message: 'Эмч, сувилагч нарын мэдээлэл татахад алдаа гарлаа',
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
    setPage(1); // Reset to first page when changing tabs
  };

  const handlePageChange = (event, value) => {
    setPage(value);
  };

  // Filter data based on the selected tab
  const filteredStaff = medicalStaff.filter((staff) => {
    const matchesSearch = staff.name.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (!matchesSearch) return false;
    
    if (tabValue === 0) return true; // All staff
    if (tabValue === 1) return staff.position === 'Doctor'; // Only doctors
    if (tabValue === 2) return staff.position === 'Nurse';  // Only nurses
    return true;
  });

  const totalPages = Math.ceil(filteredStaff.length / ITEMS_PER_PAGE);
  const currentPageData = filteredStaff.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);

  const handleAddStaff = () => {
    router.push('/employee/employeeRegister');
  };

  // Function to preserve selected staff through re-renders
  const preserveSelectedStaff = (staff) => {
    // Create a persistent reference by caching in a ref
    if (staff && staff.id) {
      // Store staff in sessionStorage to preserve between rendering cycles
      sessionStorage.setItem('selectedStaffId', staff.id);
      sessionStorage.setItem('selectedStaff', JSON.stringify(staff));
    }
  };

  // Function to retrieve preserved staff
  const getPreservedStaff = () => {
    try {
      const savedStaff = sessionStorage.getItem('selectedStaff');
      if (savedStaff) {
        return JSON.parse(savedStaff);
      }
      return null;
    } catch (e) {
      console.error('Error retrieving preserved staff:', e);
      return null;
    }
  };

  const handleMoreClick = (event, staff) => {
    console.log('More clicked for staff:', staff);
    
    if (!staff || !staff.id) {
      console.error('Staff ID is missing in handleMoreClick:', staff);
      setSnackbar({
        open: true,
        message: 'Staff ID is missing',
        severity: 'error'
      });
      return;
    }
  
    // Make a full copy of the staff object to preserve all properties
    const staffCopy = { ...staff };
    console.log('Setting selected staff with ID:', staffCopy.id);
    
    // Preserve staff data in storage
    preserveSelectedStaff(staffCopy);
    
    // Set selected staff first, then the anchor element
    setSelectedStaff(staffCopy);
    setAnchorEl(event.currentTarget);
  };

  const handleCloseMenu = () => {
    // Don't reset selectedStaff here, keep it for edit/delete operations
    setAnchorEl(null);
  };

  useEffect(() => {
    console.log('selectedStaff updated:', selectedStaff);
  }, [selectedStaff]);

  const handleEdit = () => {
    // Get the most up-to-date selected staff
    const currentSelectedStaff = getPreservedStaff() || selectedStaff;
    
    console.log('Edit clicked, currentSelectedStaff:', currentSelectedStaff);
    
    if (!currentSelectedStaff || !currentSelectedStaff.id) {
      console.error('Selected staff ID is missing or undefined:', currentSelectedStaff);
      setSnackbar({
        open: true,
        message: 'Staff ID is missing - cannot edit',
        severity: 'error'
      });
      return;
    }
  
    // Create a fresh form data object with all required fields
    const newFormData = {
      id: currentSelectedStaff.id,
      name: currentSelectedStaff.name || '',
      position: currentSelectedStaff.position || '',
      specialization: currentSelectedStaff.specialization || '',
      email: currentSelectedStaff.email || '',
      phone: currentSelectedStaff.phone || ''
    };
    
    console.log('Setting edit form data:', newFormData);
    setEditFormData(newFormData);
  
    setOpenEditDialog(true);
    handleCloseMenu();
  };

  const handleDelete = () => {
    // Get the most up-to-date selected staff before opening delete dialog
    const currentSelectedStaff = getPreservedStaff() || selectedStaff;
    
    if (!currentSelectedStaff?.id) {
      console.error('Staff ID is missing for delete operation:', currentSelectedStaff);
      setSnackbar({
        open: true,
        message: 'Staff ID is missing - cannot delete',
        severity: 'error'
      });
      return;
    }
    
    // Ensure selected staff is updated with the most current data
    setSelectedStaff(currentSelectedStaff);
    
    setOpenDeleteConfirm(true);
    handleCloseMenu();
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditFormData((prev) => ({ ...prev, [name]: value }));
  };

  const validateStaffForm = (formData) => {
    const errors = {};
    
    if (!formData.name?.trim()) {
      errors.name = 'Нэр шаардлагатай';
    }
    
    if (!formData.position) {
      errors.position = 'Албан тушаал шаардлагатай';
    }
    
    return Object.keys(errors).length ? errors : null;
  };

  const saveEdit = async () => {
    try {
      // Log the edit form data to debug
      console.log('Saving edit form data:', editFormData);
      
      // Check if ID exists to prevent errors
      if (!editFormData || !editFormData.id) {
        console.error('Edit form data or ID is missing:', editFormData);
        setSnackbar({
          open: true,
          message: 'Ажилтны ID олдсонгүй - засварлах боломжгүй',
          severity: 'error'
        });
        return;
      }
      
      // Validate form data first
      const formErrors = validateStaffForm(editFormData);
      if (formErrors) {
        setSnackbar({
          open: true,
          message: 'Шаардлагатай талбаруудыг бөглөнө үү',
          severity: 'error'
        });
        return;
      }
  
      // Transform data for backend
      const { id, ...staffData } = editFormData;
      const nameParts = getNameParts(staffData.name);
      
      const updatedStaffData = {
        firstname: nameParts.firstName,
        lastname: nameParts.lastName,
        position: staffData.position,
        specialization: staffData.specialization,
        phoneNumber: staffData.phone,
        email: staffData.email
      };
      
      console.log('Sending update to backend with ID:', id, 'and data:', updatedStaffData);
  
      // Send update to backend
      await medicalStaffService.updateMedicalStaff(id, updatedStaffData);
      
      // Update local state
      setMedicalStaff(prevStaff => 
        prevStaff.map(staff => 
          staff.id === id 
            ? { 
                ...staff,
                name: staffData.name,
                position: staffData.position,
                specialization: staffData.specialization,
                email: staffData.email,
                phone: staffData.phone
              } 
            : staff
        )
      );
  
      // Show success message
      setSnackbar({
        open: true,
        message: 'Ажилтны мэдээлэл амжилттай шинэчлэгдлээ',
        severity: 'success'
      });
      
      // Close the edit dialog
      setOpenEditDialog(false);
      
    } catch (err) {
      console.error('Update error:', err);
      
      const errorMessage = err.response?.data?.message || 
                         err.message || 
                         'Ажилтны мэдээлэл шинэчлэхэд алдаа гарлаа';
      
      setSnackbar({
        open: true,
        message: errorMessage,
        severity: 'error'
      });
    }
  };

  const confirmDelete = async () => {
    try {
      // Get the most up-to-date selected staff
      const currentSelectedStaff = getPreservedStaff() || selectedStaff;
      
      // Validate selected staff exists and has ID
      if (!currentSelectedStaff?.id) {
        console.error('Staff ID is missing for delete operation:', currentSelectedStaff);
        throw new Error('Staff ID is missing - cannot delete');
      }
  
      // Call delete API
      await medicalStaffService.deleteMedicalStaff(currentSelectedStaff.id);
      
      // Update local state
      setMedicalStaff(prev => prev.filter(staff => staff.id !== currentSelectedStaff.id));
      
      // Reset selection and clear storage
      setSelectedStaff(null);
      sessionStorage.removeItem('selectedStaffId');
      sessionStorage.removeItem('selectedStaff');
      
      // Show success message
      setSnackbar({
        open: true,
        message: 'Ажилтан амжилттай устгагдлаа',
        severity: 'success'
      });
      
      // Close confirmation dialog
      setOpenDeleteConfirm(false);
      
    } catch (err) {
      console.error('Delete error:', err);
      
      const errorMessage = err.response?.data?.message || 
                         err.message || 
                         'Ажилтныг устгахад алдаа гарлаа';
      
      setSnackbar({
        open: true,
        message: errorMessage,
        severity: 'error'
      });
    }
  };

  const cancelDelete = () => {
    setOpenDeleteConfirm(false);
  };

  const handleCloseSnackbar = () => {
    setSnackbar({...snackbar, open: false});
  };

  const getNameParts = (fullName) => {
    const parts = fullName.split(' ');
    if (parts.length === 2) {
      return { lastName: parts[0], firstName: parts[1] };
    } else if (parts.length > 2) {
      return { lastName: parts[0], firstName: parts.slice(1).join(' ') };
    }
    return { lastName: '', firstName: fullName };
  };

  return (
    <Box sx={{ display: 'flex', height: '100vh', bgcolor: 'white' }}>
      <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        <Box sx={{ px: 3, pt: 3, pb: 2 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Box>
              <Typography variant="h4" fontWeight="600">Эмч, сувилагч</Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                Бүх эмч, сувилагчийн дэлгэрэнгүй мэдээллийн жагсаалт
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <TextField
                placeholder="Хайх"
                variant="outlined"
                size="small"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                InputProps={{
                  startAdornment: <SearchIcon color="action" sx={{ mr: 1 }} />,
                }}
                sx={{ width: 250 }}
              />
              <Button 
                variant="contained" 
                color="primary" 
                startIcon={<AddIcon />} 
                onClick={handleAddStaff}
                sx={{ borderRadius: '8px', textTransform: 'none' }}
              >
                Нэмэх
              </Button>
            </Box>
          </Box>

          <Tabs
            value={tabValue}
            onChange={handleTabChange}
            textColor="primary"
            indicatorColor="primary"
            sx={{ borderBottom: 1, borderColor: 'divider' }}
          >
            <Tab label="Бүгд" />
            <Tab label="Эмч" />
            <Tab label="Сувилагч" />
          </Tabs>
        </Box>

        {/* Loading or Error States */}
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
            <CircularProgress />
          </Box>
        ) : error ? (
          <Box sx={{ m: 3 }}>
            <Alert severity="error">{error}</Alert>
          </Box>
        ) : (
          <>
            <TableContainer component={Paper} sx={{ flexGrow: 1, mx: 3, boxShadow: 'none', border: '1px solid #eee', borderRadius: '12px' }}>
              <Table>
                <TableHead sx={{ backgroundColor: '#f5f5f5' }}>
                  <TableRow>
                    <TableCell>Овог</TableCell>
                    <TableCell>Нэр</TableCell>
                    <TableCell>Албан тушаал</TableCell>
                    <TableCell>Мэргэжлийн чиглэл</TableCell>
                    <TableCell>И-мэйл</TableCell>
                    <TableCell>Утасны дугаар</TableCell>
                    <TableCell align="right"></TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {currentPageData.length > 0 ? (
                    currentPageData.map((staff, index) => {
                      const { lastName, firstName } = getNameParts(staff.name);
                      const uniqueKey = `staff-${staff.id}-${index}`;


                      
                      return (
                        <TableRow key={uniqueKey} sx={{ '&:hover': { backgroundColor: '#f9f9f9' } }}>
                          <TableCell>
                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                              <Avatar 
                                sx={{ 
                                  mr: 2, 
                                  width: 36, 
                                  height: 36, 
                                  bgcolor: 'primary.main',
                                  fontSize: '14px',
                                  fontWeight: 'medium' 
                                }}
                              >
                                {staff.name.charAt(0)}
                              </Avatar>
                              {lastName}
                            </Box>
                          </TableCell>
                          <TableCell>{firstName}</TableCell>
                          <TableCell>{getMongolianlPosition(staff.position)}</TableCell>
                          <TableCell>{staff.specialization}</TableCell>
                          <TableCell>{staff.email}</TableCell>
                          <TableCell>{staff.phone}</TableCell>
                          <TableCell align="right">
                            <IconButton 
                              size="small" 
                              onClick={(e) => handleMoreClick(e, staff)}
                              sx={{ 
                                color: 'text.secondary',
                                '&:hover': { 
                                  bgcolor: 'rgba(0, 0, 0, 0.04)' 
                                }
                              }}
                            >
                              <MoreVertIcon />
                            </IconButton>
                          </TableCell>
                        </TableRow>
                      );
                    })
                  ) : (
                    <TableRow>
                      <TableCell colSpan={7} align="center" sx={{ py: 3 }}>
                        <Typography color="text.secondary">
                          Эмч, сувилагч олдсонгүй
                        </Typography>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>

            <Box sx={{ display: 'flex', justifyContent: 'flex-end', p: 2 }}>
              <Pagination count={totalPages} page={page} onChange={handlePageChange} color="primary" size="small" />
            </Box>
          </>
        )}

        {/* Menu */}
        <Menu 
          anchorEl={anchorEl} 
          open={Boolean(anchorEl)} 
          onClose={handleCloseMenu}
          PaperProps={{
            sx: {
              boxShadow: '0px 5px 15px rgba(0, 0, 0, 0.08)',
              borderRadius: '8px',
              minWidth: '160px'
            }
          }}
        >
          <MenuItem 
            onClick={handleEdit}
            sx={{ 
              gap: 1,
              py: 1,
              '&:hover': { 
                bgcolor: 'rgba(25, 118, 210, 0.08)' 
              }
            }}
          >
            <EditOutlinedIcon fontSize="small" color="primary" />
            <Typography>Засах</Typography>
          </MenuItem>
          <MenuItem 
            onClick={handleDelete}
            sx={{ 
              gap: 1,
              py: 1,
              '&:hover': { 
                bgcolor: 'rgba(211, 47, 47, 0.08)' 
              }
            }}
          >
            <DeleteOutlineOutlinedIcon fontSize="small" color="error" />
            <Typography color="error.main">Устгах</Typography>
          </MenuItem>
        </Menu>

        {/* Edit Dialog */}
        <Dialog 
          open={openEditDialog} 
          onClose={() => setOpenEditDialog(false)} 
          fullWidth 
          maxWidth="sm"
          PaperProps={{
            sx: {
              borderRadius: '12px',
              boxShadow: '0px 8px 24px rgba(0, 0, 0, 0.12)'
            }
          }}
        >
          <DialogTitle 
            sx={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center',
              pb: 1
            }}
          >
            <Box component="div">
              <Typography variant="h6" component="span" fontWeight={600}>
                Эмч, сувилагчийн мэдээлэл засах
              </Typography>
            </Box>
            <IconButton 
              size="small" 
              onClick={() => setOpenEditDialog(false)}
              sx={{ 
                color: 'text.secondary',
                '&:hover': { bgcolor: 'rgba(0, 0, 0, 0.04)' }
              }}
            >
              <CloseIcon fontSize="small" />
            </IconButton>
          </DialogTitle>
          
          <Divider />
          
          <DialogContent sx={{ pt: 3 }}>
            <Stack spacing={2.5}>
              <TextField
                fullWidth
                label="Нэр"
                name="name"
                value={editFormData.name}
                onChange={handleEditChange}
                variant="outlined"
                InputLabelProps={{ shrink: true }}
              />
              
              <FormControl fullWidth>
                <InputLabel id="position-label">Албан тушаал</InputLabel>
                <Select
                  labelId="position-label"
                  name="position"
                  value={editFormData.position}
                  onChange={handleEditChange}
                  label="Албан тушаал"
                >
                  <MenuItem value="Doctor">Эмч</MenuItem>
                  <MenuItem value="Nurse">Сувилагч</MenuItem>
                </Select>
              </FormControl>
              
              <TextField
                fullWidth
                label="Мэргэжлийн чиглэл"
                name="specialization"
                value={editFormData.specialization}
                onChange={handleEditChange}
                variant="outlined"
                InputLabelProps={{ shrink: true }}
              />
              
              <TextField
                fullWidth
                label="И-мэйл"
                name="email"
                value={editFormData.email}
                onChange={handleEditChange}
                variant="outlined"
                InputLabelProps={{ shrink: true }}
              />
              
              <TextField
                fullWidth
                label="Утас"
                name="phone"
                value={editFormData.phone}
                onChange={handleEditChange}
                variant="outlined"
                InputLabelProps={{ shrink: true }}
              />
            </Stack>
          </DialogContent>
          
          <DialogActions sx={{ px: 3, py: 2 }}>
            <Button 
              onClick={() => setOpenEditDialog(false)}
              variant="outlined"
              sx={{ 
                borderRadius: '8px', 
                textTransform: 'none',
                px: 3
              }}
            >
              Болих
            </Button>
            <Button 
              variant="contained" 
              onClick={saveEdit}
              sx={{ 
                borderRadius: '8px', 
                textTransform: 'none',
                px: 3
              }}
            >
              Хадгалах
            </Button>
          </DialogActions>
        </Dialog>

        {/* Delete Confirm Dialog */}
        <Dialog 
          open={openDeleteConfirm} 
          onClose={cancelDelete}
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
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <DeleteOutlineOutlinedIcon color="error" />
              <Typography variant="h6" component="span" fontWeight={600} color="error.main">
                Устгах уу?
              </Typography>
            </Box>
            <IconButton 
              size="small" 
              onClick={cancelDelete}
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
              Та <b>{selectedStaff?.name}</b> эмч/сувилагчийг устгахдаа итгэлтэй байна уу?
            </Typography>
            <Typography variant="body2" color="text.secondary" align="center" sx={{ mt: 1 }}>
              Энэ үйлдлийг буцаах боломжгүй.
            </Typography>
          </DialogContent>
          
          <DialogActions sx={{ px: 3, py: 2, justifyContent: 'center' }}>
            <Button 
              onClick={cancelDelete}
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
              color="error" 
              onClick={confirmDelete}
              startIcon={<DeleteOutlineOutlinedIcon />}
              sx={{ 
                borderRadius: '8px', 
                textTransform: 'none',
                px: 3,
                minWidth: '120px'
              }}
            >
              Устгах
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
    </Box>
  );
}