'use client';

import React, { useState, useEffect } from 'react';
import { Box, Tabs, Tab, Snackbar, Alert } from '@mui/material';
import { useRouter } from 'next/navigation';
import InventoryIcon from '@mui/icons-material/Inventory';
import MedicationIcon from '@mui/icons-material/Medication';
import WarningIcon from '@mui/icons-material/Warning';
import ReceiptIcon from '@mui/icons-material/Receipt';
import medicineService from '../../../service/medicineService.js'; 
import medicalStaffService from '../../../service/medicalStaffService.js';

// Import components


import StockTable from './comp/StockTable';

// Import dialogs


// Import constants and helpers
import { mockStockItems } from './constants';
import StockHeader from './comp/StockHeader';
import StatusSummary from './comp/StatusSummary';
import SearchAndFilter from './comp/SearchAndFilter';
import FilterDialog from './dialog/FilterDialog';
import AddItemDialog from './dialog/AddItemDialog';
import EditItemDialog from './dialog/EditItemDialog';
import DeleteConfirmationDialog from './dialog/DeleteDialog';
import StockTransactionDialog from './dialog/TransactionDialog'; // path нь зөв эсэхийг шалгаарай


const PharmacyStockManagement = ({ onOpenTransaction }) => {
  const router = useRouter();
  const [stockItems, setStockItems] = useState(mockStockItems);
  const [filteredItems, setFilteredItems] = useState(mockStockItems);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [filterDialogOpen, setFilterDialogOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [loading, setLoading] = useState(false);
  const [tabValue, setTabValue] = useState(0);
  const [medicalStaffList, setMedicalStaffList] = useState([]);

  
  // Pagination state
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [itemForm, setItemForm] = useState({
    name: '',
    type: ["medication", "Supplies", "Creams", "Emergency Items"],
    dosage: '',
    quantity: 0,
    price: 0,
    expiryDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
    medicalStaff: '', // This will store the medical staff ID
  
  });
  
  // New item/edit item form state
  
  const determineStatus = (medicine) => {
    // Add logic to determine status based on quantity, expiry date, etc.
    const today = new Date();
    const expiryDate = new Date(medicine.expiryDate);
    const threeMonthsFromNow = new Date();
    threeMonthsFromNow.setMonth(threeMonthsFromNow.getMonth() + 3);
    
    if (medicine.quantity <= 10) { // Assuming reorder level is 10
      return 'Дахин захиалах';
    } else if (medicine.quantity <= 50) {
      return 'Дуусаж байгаа';
    } else if (expiryDate <= threeMonthsFromNow && expiryDate >= today) {
      return 'Хугацаа дуусах дөхсөн';
    }
    return 'Хангалттай';
  };
  useEffect(() => {
    const fetchMedicines = async () => {
      try {
        setLoading(true);
        const res = await medicineService.getAll();
        const items = res.data ? res.data.map((med) => ({
          ...med,
          id: med._id,
          // Keep the original type value from database
          type: med.type,
          // For compatibility with existing code that uses category
          category: med.type,
          status: determineStatus(med),
          lastUpdated: med.updatedAt || med.createdAt,
        })) : [];
        setStockItems(items);
        setFilteredItems(items);
      } catch (err) {
        console.error('Эмийн жагсаалт татаж чадсангүй:', err);
        setSnackbar({ 
          open: true, 
          message: 'Эмийн өгөгдөл татаж чадсангүй', 
          severity: 'error' 
        });
      } finally {
        setLoading(false);
      }
    };
  
    fetchMedicines();
  }, []);
  
  // Handle tab change
  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };
  
  useEffect(() => {
    const fetchMedicalStaff = async () => {
      try {
        const res = await medicalStaffService.getAllMedicalStaff();
        setMedicalStaffList(res.data || res); // Handle both response formats
      } catch (err) {
        console.error("Эмнэлгийн ажилтан татаж чадсангүй:", err);
        setSnackbar({
          open: true,
          message: "Ажилтнуудын жагсаалт татаж чадсангүй",
          severity: "error",
        });
      }
    };
  
    fetchMedicalStaff();
  }, []);
  // Filter items based on search and filters
  useEffect(() => {
    let result = stockItems;
    
    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        item => 
          item.name.toLowerCase().includes(query) ||
          item.id.toLowerCase().includes(query) ||
          (item.batchNumber && item.batchNumber.toLowerCase().includes(query))
      );
    }
    
    // Apply category filter
    if (categoryFilter !== 'all') {
      result = result.filter(item => item.category === categoryFilter);
    }
    
    // Apply status filter
    if (statusFilter !== 'all') {
      result = result.filter(item => item.status === statusFilter);
    }
    
    setFilteredItems(result);
  }, [stockItems, searchQuery, categoryFilter, statusFilter]);
  
  // Handle filter dialog
  const handleOpenFilterDialog = () => {
    setFilterDialogOpen(true);
  };
  
  const handleCloseFilterDialog = () => {
    setFilterDialogOpen(false);
  };
  
  const applyFilters = () => {
    handleCloseFilterDialog();
  };
  
  // Handle item form changes
  const handleItemFormChange = (e) => {
    const { name, value } = e.target;
    setItemForm(prev => ({ ...prev, [name]: value }));
    
    // Handle category-dependent dropdowns
    if (name === 'category') {
      setItemForm(prev => ({
        ...prev,
        subCategory: '',
        form: ''
      }));
    }
  };
  
  const handleExpiryDateChange = (date) => {
    setItemForm(prev => ({ ...prev, expiryDate: date }));
  };
  
  // Handle add new item
  const handleOpenAddDialog = () => {
    // Generate a new ID based on category
    const prefix = itemForm.category === 'Эм' ? 'MED-' : 'SUP-';
    const randomNum = Math.floor(1000 + Math.random() * 9000);
    const newId = `${prefix}${randomNum}`;
    
    // Reset form with new ID
    setItemForm({
      id: newId,
      name: '',
      category: 'Эм',
      subCategory: '',
      form: '',
      dosage: '',
      manufacturer: '',
      supplier: '',
      batchNumber: '',
      expiryDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
      quantity: 0,
      unit: '',
      location: '',
      reorderLevel: 0,
      price: 0,
      status: 'Хангалттай',
      description: ''
    });
    
    setAddDialogOpen(true);
  };
  
  const handleCloseAddDialog = () => {
    setAddDialogOpen(false);
  };
  
  const handleAddItem = async () => {
    setLoading(true);
    
    try {
      // Validate form
      if (!itemForm.name || !itemForm.type) {
        setSnackbar({
          open: true,
          message: 'Шаардлагатай талбаруудыг бөглөнө үү',
          severity: 'error'
        });
        setLoading(false);
        return;
      }
  
      // Prepare data for API (match your medicine schema)
      const medicineData = {
        name: itemForm.name,
        type: itemForm.type,
        dosage: itemForm.dosage,
        quantity: parseInt(itemForm.quantity),
        price: parseFloat(itemForm.price),
        expiryDate: itemForm.expiryDate.toISOString(),
        medicalStaff: itemForm.medicalStaff, // This is the medical staff ID
        description: itemForm.description
      };
  
      // Call API to create medicine
      const result = await medicineService.create(medicineData);
      
      if (result.success) {
        // Add to local state with proper format
        const newItem = {
          ...result.data,
          id: result.data._id,
          category: result.data.type,
          status: 'Хангалттай',
          lastUpdated: new Date().toISOString().split('T')[0]
        };
        
        setStockItems(prev => [...prev, newItem]);
        setSnackbar({
          open: true,
          message: 'Эм амжилттай нэмэгдлээ',
          severity: 'success'
        });
        setAddDialogOpen(false);
        
        // Reset form
        setItemForm({
          name: '',
          type: ["medication", "Supplies", "Creams", "Emergency Items"],
          dosage: '',
          quantity: 0,
          price: 0,
          expiryDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
          medicalStaff: '',
        });
      }
    } catch (error) {
      console.error('Эм нэмэхэд алдаа:', error);
      setSnackbar({
        open: true,
        message: error.response?.data?.message || 'Эм нэмэхэд алдаа гарлаа',
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };
  
// Add these functions to your StockManagement.jsx

// Handle edit item
const handleOpenEditDialog = (item) => {
  setSelectedItem(item);
  setItemForm({
    ...item,
    // Ensure expiryDate is a Date object
    expiryDate: new Date(item.expiryDate),
    // Make sure medicalStaff field is properly set
    medicalStaff: item.medicalStaff || '',
    // Convert type if needed
    type: item.type || item.category
  });
  setEditDialogOpen(true);
};

const handleCloseEditDialog = () => {
  setEditDialogOpen(false);
  setSelectedItem(null);
};

const handleUpdateItem = async () => {
  setLoading(true);
  
  try {
    // Validate form
    if (!itemForm.name || !itemForm.type) {
      setSnackbar({
        open: true,
        message: 'Шаардлагатай талбаруудыг бөглөнө үү',
        severity: 'error'
      });
      setLoading(false);
      return;
    }

    // Prepare data for API (match your medicine schema)
    const medicineData = {
      name: itemForm.name,
      type: itemForm.type,
      dosage: itemForm.dosage,
      quantity: parseInt(itemForm.quantity),
      price: parseFloat(itemForm.price),
      expiryDate: itemForm.expiryDate.toISOString(),
      medicalStaff: itemForm.medicalStaff,
      description: itemForm.description
    };

    // Call API to update medicine
    const result = await medicineService.update(selectedItem._id || selectedItem.id, medicineData);
    
    if (result.success) {
      // Update local state with proper format
      const updatedItem = {
        ...result.data,
        id: result.data._id,
        type: result.data.type,
        category: result.data.type,
        status: determineStatus(result.data),
        lastUpdated: new Date().toISOString()
      };
      
      setStockItems(prev => 
        prev.map(item => 
          (item.id === selectedItem.id || item._id === selectedItem._id) 
            ? updatedItem 
            : item
        )
      );
      
      setSnackbar({
        open: true,
        message: 'Эм амжилттай шинэчлэгдлээ',
        severity: 'success'
      });
      setEditDialogOpen(false);
      setSelectedItem(null);
    }
  } catch (error) {
    console.error('Эм шинэчлэхэд алдаа:', error);
    setSnackbar({
      open: true,
      message: error.response?.data?.message || 'Эм шинэчлэхэд алдаа гарлаа',
      severity: 'error'
    });
  } finally {
    setLoading(false);
  }
};

// Handle delete item
const handleOpenDeleteDialog = (item) => {
  setSelectedItem(item);
  setDeleteDialogOpen(true);
};

const handleCloseDeleteDialog = () => {
  setDeleteDialogOpen(false);
  setSelectedItem(null);
};

const handleDeleteItem = async () => {
  setLoading(true);
  
  try {
    // Call API to delete medicine
    const result = await medicineService.delete(selectedItem._id || selectedItem.id);
    
    if (result.success) {
      // Remove from local state
      setStockItems(prev => 
        prev.filter(item => 
          item.id !== selectedItem.id && item._id !== selectedItem._id
        )
      );
      
      setSnackbar({
        open: true,
        message: 'Эм амжилттай устгагдлаа',
        severity: 'success'
      });
      setDeleteDialogOpen(false);
      setSelectedItem(null);
    }
  } catch (error) {
    console.error('Эм устгахад алдаа:', error);
    setSnackbar({
      open: true,
      message: error.response?.data?.message || 'Эм устгахад алдаа гарлаа',
      severity: 'error'
    });
  } finally {
    setLoading(false);
  }
};
  
  
  
  // Handle snackbar close
  const handleCloseSnackbar = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }
    setSnackbar(prev => ({ ...prev, open: false }));
  };
  
  // Pagination handlers
  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };
  
  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };
  
  // Handle back button
  const handleBack = () => {
    router.push('/dashboard');
  };
  
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', bgcolor: 'white', p: 3 }}>
      {/* Header */}
      <StockHeader onAddItem={handleOpenAddDialog} onBack={handleBack} />
      
      {/* Tabs */}
      <Tabs 
        value={tabValue} 
        onChange={handleTabChange}
        sx={{ 
          borderBottom: 1, 
          borderColor: 'divider',
          mb: 3
        }}
      >
        <Tab 
          icon={<InventoryIcon />} 
          iconPosition="start"
          label="Бүх бараа" 
          sx={{ textTransform: 'none' }}
        />
        
      </Tabs>
      
      {/* Status summary */}
      <StatusSummary stockItems={stockItems} />
      
      {/* Search and filter */}
      <SearchAndFilter 
        searchQuery={searchQuery} 
        setSearchQuery={setSearchQuery}
        onOpenFilterDialog={handleOpenFilterDialog}
      />
      
      {/* Items Table */}
      <StockTable 
        filteredItems={filteredItems}
        page={page}
        rowsPerPage={rowsPerPage}
        handleChangePage={handleChangePage}
        handleChangeRowsPerPage={handleChangeRowsPerPage}
        onEdit={handleOpenEditDialog}
        onDelete={handleOpenDeleteDialog}
      />
      
      {/* Filter Dialog */}
      <FilterDialog 
        open={filterDialogOpen}
        onClose={handleCloseFilterDialog}
        categoryFilter={categoryFilter}
        setCategoryFilter={setCategoryFilter}
        statusFilter={statusFilter}
        setStatusFilter={setStatusFilter}
        onApply={applyFilters}
      />
      
      {/* Add Item Dialog */}
      <AddItemDialog 
  open={addDialogOpen}
  onClose={handleCloseAddDialog}
  loading={loading}
  itemForm={itemForm}
  handleItemFormChange={handleItemFormChange}
  handleExpiryDateChange={handleExpiryDateChange}
  onAdd={handleAddItem}
  medicalStaffList={medicalStaffList} // Add this line
/>
      
<EditItemDialog 
        open={editDialogOpen}
        onClose={handleCloseEditDialog}
        loading={loading}
        itemForm={itemForm}
        selectedItem={selectedItem}
        handleItemFormChange={handleItemFormChange}
        handleExpiryDateChange={handleExpiryDateChange}
        onUpdate={handleUpdateItem}
        medicalStaffList={medicalStaffList} // Add this line
      />
      
      {/* Delete Confirmation Dialog */}
      <DeleteConfirmationDialog 
        open={deleteDialogOpen}
        onClose={handleCloseDeleteDialog}
        selectedItem={selectedItem}
        loading={loading}
        onDelete={handleDeleteItem}
      />
      
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
};

// Export both components
export { PharmacyStockManagement, StockTransactionDialog };
export default PharmacyStockManagement;