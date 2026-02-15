import React, { useState, useEffect } from 'react';
import { 
  Grid, TextField, FormControl, InputLabel, Select, 
  MenuItem, InputAdornment, Autocomplete
} from '@mui/material';
import { LocalizationProvider, DatePicker } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';

// Type options based on your schema
const typeOptions = [
  { value: 'medication', label: 'Эм' },
  { value: 'Supplies', label: 'Эмнэлгийн хэрэгсэл' },
  { value: 'Creams', label: 'Тос/Кремүүд' },
  { value: 'Emergency Items', label: 'Яаралтай тусламжийн бараа' }
];

const ItemForm = ({ 
  itemForm, 
  handleItemFormChange, 
  handleExpiryDateChange,
  medicalStaffList = []  // You'll need to pass this from the parent component
}) => {
  // Function to handle medical staff selection
  const handleMedicalStaffChange = (event, newValue) => {
    handleItemFormChange({ 
      target: { 
        name: 'medicalStaff', 
        value: newValue ? newValue._id : '' 
      } 
    });
  };

  // Get selected medical staff object for Autocomplete
  const selectedMedicalStaff = medicalStaffList.find(
    staff => staff._id === itemForm.medicalStaff
  );

  return (
    <Grid container spacing={2} sx={{ mt: 0.5 }}>
      {/* Medicine Name */}
      <Grid item xs={12} sm={6}>
        <TextField
          label="Эмийн нэр"
          name="name"
          value={itemForm.name || ''}
          onChange={handleItemFormChange}
          fullWidth
          margin="normal"
          required
        />
      </Grid>
      
      {/* Medicine Type */}
      <Grid item xs={12} sm={6}>
        <FormControl fullWidth margin="normal" required>
          <InputLabel>Төрөл</InputLabel>
          <Select
            name="type"
            value={itemForm.type || ''}
            onChange={handleItemFormChange}
            label="Төрөл"
          >
            {typeOptions.map((option) => (
              <MenuItem key={option.value} value={option.value}>
                {option.label}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Grid>
      
      {/* Dosage */}
      <Grid item xs={12} sm={6}>
        <TextField
          label="Тун/Дозировка"
          name="dosage"
          value={itemForm.dosage || ''}
          onChange={handleItemFormChange}
          fullWidth
          margin="normal"
          helperText="Жишээ: 250mg, 5ml, 1 таблетка гэх мэт"
        />
      </Grid>
      
      {/* Quantity */}
      <Grid item xs={12} sm={6}>
        <TextField
          label="Тоо хэмжээ"
          name="quantity"
          type="number"
          value={itemForm.quantity || ''}
          onChange={handleItemFormChange}
          fullWidth
          margin="normal"
          required
          inputProps={{ min: 0 }}
        />
      </Grid>
      
      {/* Price */}
      <Grid item xs={12} sm={6}>
        <TextField
          label="Нэгж үнэ"
          name="price"
          type="number"
          value={itemForm.price || ''}
          onChange={handleItemFormChange}
          fullWidth
          margin="normal"
          required
          InputProps={{
            startAdornment: <InputAdornment position="start">₮</InputAdornment>,
          }}
          inputProps={{ min: 0, step: 0.01 }}
        />
      </Grid>
      
      {/* Expiry Date */}
      <Grid item xs={12} sm={6}>
        <LocalizationProvider dateAdapter={AdapterDateFns}>
          <DatePicker
            label="Хугацаа дуусах огноо"
            value={itemForm.expiryDate}
            onChange={handleExpiryDateChange}
            slotProps={{ 
              textField: { 
                fullWidth: true,
                margin: "normal",
                required: true
              } 
            }}
            format="yyyy-MM-dd"
            minDate={new Date()}
          />
        </LocalizationProvider>
      </Grid>
      
    </Grid>
  );
};

export default ItemForm;