'use client'
import {
  Box, Tabs, Tab, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Paper, Button, IconButton, Pagination,
  TextField, Typography, Avatar, Menu, MenuItem, Dialog,
  DialogTitle, DialogContent, DialogActions, Divider,
  FormControl, InputLabel, Select, Stack, Alert, Snackbar,
  CircularProgress,
} from '@mui/material'
import MoreVertIcon               from '@mui/icons-material/MoreVert'
import AddIcon                    from '@mui/icons-material/Add'
import SearchIcon                 from '@mui/icons-material/Search'
import EditOutlinedIcon           from '@mui/icons-material/EditOutlined'
import DeleteOutlineOutlinedIcon  from '@mui/icons-material/DeleteOutlineOutlined'
import CloseIcon                  from '@mui/icons-material/Close'
import { useRouter }              from 'next/navigation'

import { usePatients }     from '../hooks/usePatients'
import { usePatientTable } from '../hooks/usePatientTable'
import { getNameParts }    from '../utils/patientUtils'

// ─── Validation ───────────────────────────────────────────────────────────────
const validateForm = (formData) => {
  if (!formData.name?.trim())  return 'Нэр шаардлагатай'
  if (!formData.birthDate)     return 'Төрсөн огноо шаардлагатай'
  if (!formData.type)          return 'Төрөл шаардлагатай'
  return null
}

// ─── PatientClient ────────────────────────────────────────────────────────────
export default function PatientClient() {
  const router = useRouter()

  // data layer
  const {
    patients, loading, error,
    snackbar, closeSnackbar, showSnackbar,
    updatePatient, deletePatient,
  } = usePatients()

  // UI layer
  const {
    tabValue, page, searchTerm, anchorEl,
    selectedPatient, openEditDialog, openDeleteConfirm, editFormData,
    handleTabChange, handlePageChange, handleSearchChange,
    handleMoreClick, handleCloseMenu,
    handleEdit, handleEditChange, closeEditDialog,
    handleDelete, cancelDelete,
    filterPatients, paginate,
  } = usePatientTable()

  // ── Derived data ─────────────────────────────────────────────────────────
  const filtered                   = filterPatients(patients)
  const { totalPages, currentPageData } = paginate(filtered)

  // ── Actions ───────────────────────────────────────────────────────────────
  const handleSaveEdit = async () => {
    const err = validateForm(editFormData)
    if (err) { showSnackbar(err, 'error'); return }

    try {
      await updatePatient(editFormData.id, editFormData, selectedPatient)
      closeEditDialog()
    } catch (err) {
      showSnackbar(err.response?.data?.message || err.message || 'Шинэчлэхэд алдаа гарлаа', 'error')
    }
  }

  const handleConfirmDelete = async () => {
    try {
      await deletePatient(selectedPatient?.id)
      cancelDelete()
    } catch (err) {
      showSnackbar(err.response?.data?.message || err.message || 'Устгахад алдаа гарлаа', 'error')
    }
  }

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <Box sx={{ display: 'flex', height: '100vh', bgcolor: 'white' }}>
      <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', p: 0 }}>

        {/* ── Header ── */}
        <Box sx={{ px: 3, pt: 3, pb: 2 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Box>
              <Typography variant="h4" fontWeight="600">Үйлчлүүлэгч</Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                Бүх үйлчлүүлэгчийн дэлгэрэнгүй мэдээллийг жагсаалт
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <TextField
                placeholder="Хайх"
                variant="outlined"
                size="small"
                value={searchTerm}
                onChange={handleSearchChange}
                InputProps={{ startAdornment: <SearchIcon color="action" sx={{ mr: 1 }} /> }}
                sx={{ width: 250 }}
              />
              <Button
                variant="contained"
                color="primary"
                startIcon={<AddIcon />}
                onClick={() => router.push('/customer/register')}
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
            <Tab label="Бүх үйлчлүүлэгч" />
            <Tab label="Оюутан" />
            <Tab label="Багш" />
            <Tab label="Ажилтан" />
          </Tabs>
        </Box>

        {/* ── Loading / Error / Table ── */}
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
            <CircularProgress />
          </Box>
        ) : error ? (
          <Box sx={{ m: 3 }}><Alert severity="error">{error}</Alert></Box>
        ) : (
          <>
            <TableContainer component={Paper} sx={{
              flexGrow: 1, mx: 3, boxShadow: 'none',
              border: '1px solid #eee', borderRadius: '12px',
            }}>
              <Table sx={{ minWidth: 650 }}>
                <TableHead sx={{ backgroundColor: '#f5f5f5' }}>
                  <TableRow>
                    {['Нэр','Төрсөн огноо','Нас','Төрөл','Хаяг','Утас',''].map((h, i) => (
                      <TableCell key={i} align={i === 6 ? 'right' : 'left'}>
                        {h && <strong>{h}</strong>}
                      </TableCell>
                    ))}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {currentPageData.length > 0 ? currentPageData.map((item, idx) => (
                    <TableRow key={`${item.id}-${idx}`} sx={{ '&:hover': { backgroundColor: '#f9f9f9' } }}>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <Avatar sx={{ mr: 2, width: 36, height: 36, bgcolor: 'primary.main', fontSize: '14px' }}>
                            {item.name.charAt(0)}
                          </Avatar>
                          {item.name}
                        </Box>
                      </TableCell>
                      <TableCell>{item.birthDate}</TableCell>
                      <TableCell>{item.age}</TableCell>
                      <TableCell>{item.type}</TableCell>
                      <TableCell>{item.address}</TableCell>
                      <TableCell>{item.phone}</TableCell>
                      <TableCell align="right">
                        <IconButton size="small" onClick={(e) => handleMoreClick(e, item)}>
                          <MoreVertIcon />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  )) : (
                    <TableRow>
                      <TableCell colSpan={7} align="center" sx={{ py: 3 }}>
                        <Typography color="text.secondary">Үйлчлүүлэгч олдсонгүй</Typography>
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

        {/* ── Context Menu ── */}
        <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleCloseMenu}
          PaperProps={{ sx: { boxShadow: '0px 5px 15px rgba(0,0,0,0.08)', borderRadius: '8px', minWidth: 160 } }}
        >
          <MenuItem onClick={handleEdit} sx={{ gap: 1, py: 1, '&:hover': { bgcolor: 'rgba(25,118,210,0.08)' } }}>
            <EditOutlinedIcon fontSize="small" color="primary" />
            <Typography>Засах</Typography>
          </MenuItem>
          <MenuItem onClick={handleDelete} sx={{ gap: 1, py: 1, '&:hover': { bgcolor: 'rgba(211,47,47,0.08)' } }}>
            <DeleteOutlineOutlinedIcon fontSize="small" color="error" />
            <Typography color="error.main">Устгах</Typography>
          </MenuItem>
        </Menu>

        {/* ── Edit Dialog ── */}
        <Dialog open={openEditDialog} onClose={closeEditDialog} fullWidth maxWidth="sm"
          PaperProps={{ sx: { borderRadius: '12px', boxShadow: '0px 8px 24px rgba(0,0,0,0.12)' } }}
        >
          <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', pb: 1 }}>
            <Typography variant="h6" fontWeight={600}>Үйлчлүүлэгчийн мэдээлэл засах</Typography>
            <IconButton size="small" onClick={closeEditDialog}><CloseIcon fontSize="small" /></IconButton>
          </DialogTitle>
          <Divider />
          <DialogContent sx={{ pt: 3 }}>
            <Stack spacing={2.5}>
              {[
                { label: 'Нэр',          name: 'name' },
                { label: 'Төрсөн огноо', name: 'birthDate' },
                { label: 'Нас',          name: 'age', type: 'number' },
              ].map(({ label, name, type }) => (
                <TextField
                  key={name}
                  fullWidth
                  label={label}
                  name={name}
                  type={type || 'text'}
                  value={editFormData[name]}
                  onChange={handleEditChange}
                  variant="outlined"
                  InputLabelProps={{ shrink: true }}
                />
              ))}
              <FormControl fullWidth>
                <InputLabel id="type-label">Төрөл</InputLabel>
                <Select labelId="type-label" name="type" value={editFormData.type} onChange={handleEditChange} label="Төрөл">
                  <MenuItem value="Оюутан">Оюутан</MenuItem>
                  <MenuItem value="Багш">Багш</MenuItem>
                  <MenuItem value="Ажилтан">Ажилтан</MenuItem>
                </Select>
              </FormControl>
              {[
                { label: 'Хаяг', name: 'address' },
                { label: 'Утас', name: 'phone' },
              ].map(({ label, name }) => (
                <TextField
                  key={name}
                  fullWidth
                  label={label}
                  name={name}
                  value={editFormData[name]}
                  onChange={handleEditChange}
                  variant="outlined"
                  InputLabelProps={{ shrink: true }}
                />
              ))}
            </Stack>
          </DialogContent>
          <DialogActions sx={{ px: 3, py: 2 }}>
            <Button onClick={closeEditDialog} variant="outlined" sx={{ borderRadius: '8px', textTransform: 'none', px: 3 }}>
              Болих
            </Button>
            <Button onClick={handleSaveEdit} variant="contained" sx={{ borderRadius: '8px', textTransform: 'none', px: 3 }}>
              Хадгалах
            </Button>
          </DialogActions>
        </Dialog>

        {/* ── Delete Confirm Dialog ── */}
        <Dialog open={openDeleteConfirm} onClose={cancelDelete}
          PaperProps={{ sx: { borderRadius: '12px', width: 400, boxShadow: '0px 8px 24px rgba(0,0,0,0.12)' } }}
        >
          <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <DeleteOutlineOutlinedIcon color="error" />
              <Typography variant="h6" fontWeight={600} color="error.main">Устгах уу?</Typography>
            </Box>
            <IconButton size="small" onClick={cancelDelete}><CloseIcon fontSize="small" /></IconButton>
          </DialogTitle>
          <Divider />
          <DialogContent sx={{ py: 3 }}>
            <Typography align="center">
              Та <b>{selectedPatient?.name}</b> үйлчлүүлэгчийг устгахдаа итгэлтэй байна уу?
            </Typography>
            <Typography variant="body2" color="text.secondary" align="center" sx={{ mt: 1 }}>
              Энэ үйлдлийг буцаах боломжгүй.
            </Typography>
          </DialogContent>
          <DialogActions sx={{ px: 3, py: 2, justifyContent: 'center' }}>
            <Button onClick={cancelDelete} variant="outlined"
              sx={{ borderRadius: '8px', textTransform: 'none', px: 3, minWidth: 120 }}>
              Болих
            </Button>
            <Button onClick={handleConfirmDelete} variant="contained" color="error"
              startIcon={<DeleteOutlineOutlinedIcon />}
              sx={{ borderRadius: '8px', textTransform: 'none', px: 3, minWidth: 120 }}>
              Устгах
            </Button>
          </DialogActions>
        </Dialog>

        {/* ── Snackbar ── */}
        <Snackbar open={snackbar.open} autoHideDuration={6000} onClose={closeSnackbar}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}>
          <Alert onClose={closeSnackbar} severity={snackbar.severity} variant="filled" sx={{ width: '100%' }}>
            {snackbar.message}
          </Alert>
        </Snackbar>

      </Box>
    </Box>
  )
}