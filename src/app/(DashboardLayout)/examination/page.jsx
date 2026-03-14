'use client';

import React, { useState, useEffect } from 'react';
import {
  Box, Typography, TextField, Button, Table, TableBody,
  TableCell, TableContainer, TableHead, TableRow, Paper,
  IconButton, Pagination, Tabs, Tab, Menu, MenuItem,
  Dialog, DialogTitle, DialogContent, DialogActions,
  Divider, FormControl, InputLabel, Select, Stack
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import AddIcon from '@mui/icons-material/Add';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import DeleteOutlineOutlinedIcon from '@mui/icons-material/DeleteOutlineOutlined';
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';
import CloseIcon from '@mui/icons-material/Close';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import HourglassEmptyIcon from '@mui/icons-material/HourglassEmpty';
import { useRouter } from 'next/navigation';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

export default function ExaminationPage() {
  const [examinations, setExaminations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [tabValue, setTabValue] = useState(0);
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedExam, setSelectedExam] = useState(null);
  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [openDeleteConfirm, setOpenDeleteConfirm] = useState(false);
  const [editFormData, setEditFormData] = useState({
    id: '', date: '', lastName: '', firstName: '',
    type: '', diagnosis: '', action: '', status: '', reason: ''
  });

  const router = useRouter();
  const ITEMS_PER_PAGE = 4;

  useEffect(() => {
    const fetchExaminations = async () => {
      try {
        const userStr = localStorage.getItem('USER');
        if (!userStr) return;
        const token = JSON.parse(userStr).token;
        if (!token) return;

        const res = await fetch(`${API_URL}/examination/doctor/my-examinations`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });

        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Алдаа гарлаа');

        const formatted = data.data.map((exam) => ({
          id: exam._id,
          date: exam.exam_date
            ? new Date(exam.exam_date).toISOString().split('T')[0]
            : '—',
          lastName: exam.patient?.lastname || '—',
          firstName: exam.patient?.firstname || '—',
          type: exam.doctors_examination === 'Initial' ? 'Анхан' : 'Давтан',
          diagnosis: '—',
          action: '—',
          status: exam.status === 'Done' ? 'Дууссан' : 'Хийгдэж буй',
        }));

        setExaminations(formatted);
      } catch (err) {
        console.error('Үзлэг татахад алдаа:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchExaminations();
  }, []);

  const handlePageChange = (event, value) => setPage(value);
  const handleTabChange = (event, newValue) => { setTabValue(newValue); setPage(1); };
  const handleMoreClick = (event, exam) => { setAnchorEl(event.currentTarget); setSelectedExam(exam); };
  const handleCloseMenu = () => setAnchorEl(null);

  const handleEdit = async () => {
    handleCloseMenu();
    try {
      const token = JSON.parse(localStorage.getItem('USER')).token;
      const res = await fetch(`${API_URL}/examination/${selectedExam.id}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      const exam = res.ok ? data.data : selectedExam;

      setEditFormData({
        id: selectedExam.id,
        date: exam.exam_date
          ? new Date(exam.exam_date).toISOString().split('T')[0]
          : selectedExam.date,
        lastName: exam.patient?.lastname || selectedExam.lastName,
        firstName: exam.patient?.firstname || selectedExam.firstName,
        type: exam.doctors_examination === 'Initial' ? 'Анхан' : 'Давтан',
        diagnosis: selectedExam.diagnosis || '—',
        action: selectedExam.action || '—',
        status: exam.status === 'Done' ? 'Дууссан' : 'Хийгдэж буй',
        reason: exam.reason || '',
      });
    } catch {
      setEditFormData({ ...selectedExam, reason: '' });
    }
    setOpenEditDialog(true);
  };

  const handleDelete = () => { setOpenDeleteConfirm(true); handleCloseMenu(); };
  const handleViewDetails = () => { router.push(`/examinations/${selectedExam?.id}`); handleCloseMenu(); };
  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditFormData((prev) => ({ ...prev, [name]: value }));
  };

  const saveEdit = async () => {
    try {
      const token = JSON.parse(localStorage.getItem('USER')).token;

      const typeMap = { 'Анхан': 'Initial', 'Давтан': 'Follow-up' };
      const statusMap = { 'Дууссан': 'Done', 'Хийгдэж буй': 'Ongoing' };

      const res = await fetch(`${API_URL}/examination/${editFormData.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          exam_date: new Date(editFormData.date),
          doctors_examination: typeMap[editFormData.type] || editFormData.type,
          status: statusMap[editFormData.status] || editFormData.status,
          reason: editFormData.reason || '',
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Засахад алдаа гарлаа');

      const updated = data.data;
      setExaminations((prev) =>
        prev.map((exam) =>
          exam.id === editFormData.id
            ? {
                ...exam,
                date: updated.exam_date
                  ? new Date(updated.exam_date).toISOString().split('T')[0]
                  : exam.date,
                type: updated.doctors_examination === 'Initial' ? 'Анхан' : 'Давтан',
                status: updated.status === 'Done' ? 'Дууссан' : 'Хийгдэж буй',
                reason: updated.reason || exam.reason,
                lastName: updated.patient?.lastname || exam.lastName,
                firstName: updated.patient?.firstname || exam.firstName,
              }
            : exam
        )
      );
      setOpenEditDialog(false);
    } catch (err) {
      console.error('Засахад алдаа:', err);
      alert('Засахад алдаа гарлаа: ' + err.message);
    }
  };

  const confirmDelete = async () => {
    try {
      const token = JSON.parse(localStorage.getItem('USER')).token;

      const res = await fetch(`${API_URL}/examination/${selectedExam.id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Устгахад алдаа гарлаа');

      setExaminations((prev) => prev.filter((exam) => exam.id !== selectedExam.id));
      setOpenDeleteConfirm(false);
    } catch (err) {
      console.error('Устгахад алдаа:', err);
      alert('Устгахад алдаа гарлаа: ' + err.message);
    }
  };

  const cancelDelete = () => setOpenDeleteConfirm(false);
  const addNewExamination = () => router.push('/examination/newExamination');

  const filtered = examinations.filter((item) => {
    const matchesSearch =
      item.firstName.toLowerCase().includes(search.toLowerCase()) ||
      item.lastName.toLowerCase().includes(search.toLowerCase());
    const matchesTab =
      tabValue === 0 ||
      (tabValue === 1 && item.status === 'Хийгдэж буй') ||
      (tabValue === 2 && item.type === 'Анхан') ||
      (tabValue === 3 && item.type === 'Давтан');
    return matchesSearch && matchesTab;
  });

  const paginated = filtered.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);
  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);

  return (
    <Box sx={{ display: 'flex', height: '100vh', bgcolor: 'white' }}>
      <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', p: 0 }}>
        <Box sx={{ px: 3, pt: 3, pb: 2 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Box>
              <Typography variant="h4" fontWeight="600">Үзлэг оношилгоо</Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                Эрүүл биед саруул ухаан оршино.
              </Typography>
            </Box>
            <Button
              variant="contained"
              color="primary"
              onClick={addNewExamination}
              startIcon={<AddIcon />}
              sx={{ borderRadius: '8px', textTransform: 'none', px: 3 }}
            >
              Шинэ үзлэг
            </Button>
          </Box>

          <Tabs
            value={tabValue}
            onChange={handleTabChange}
            textColor="primary"
            indicatorColor="primary"
            sx={{ borderBottom: 1, borderColor: 'divider' }}
          >
            <Tab label="Нийт үзлэгүүд" />
            <Tab label="Хийгдэж буй үзлэг" />
            <Tab label="Анхан үзлэг" />
            <Tab label="Давтан үзлэг" />
          </Tabs>
        </Box>

        <Box sx={{ px: 3, pb: 2 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
            <Typography variant="body2">Үр дүн: {filtered.length}</Typography>
            <TextField
              placeholder="Хэрэглэгч хайх"
              size="small"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              InputProps={{ startAdornment: <SearchIcon fontSize="small" sx={{ mr: 1 }} /> }}
              sx={{ width: 240 }}
            />
          </Box>
        </Box>

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
            <Typography color="text.secondary">Уншиж байна...</Typography>
          </Box>
        ) : paginated.length === 0 ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
            <Typography color="text.secondary">Үзлэг байхгүй байна</Typography>
          </Box>
        ) : (
          <TableContainer
            component={Paper}
            sx={{ flexGrow: 1, mx: 3, boxShadow: 'none', border: '1px solid #eee', borderRadius: '12px' }}
          >
            <Table>
              <TableHead sx={{ backgroundColor: '#f5f5f5' }}>
                <TableRow>
                  <TableCell>№</TableCell>
                  <TableCell>Үзлэгийн өдөр</TableCell>
                  <TableCell>Овог</TableCell>
                  <TableCell>Нэр</TableCell>
                  <TableCell>Үзлэгийн төрөл</TableCell>
                  <TableCell>Онош</TableCell>
                  <TableCell>Хийсэн ажилбар</TableCell>
                  <TableCell>Төлөв</TableCell>
                  <TableCell align="right">Үйлдлүүд</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {paginated.map((exam, idx) => (
                  <TableRow key={exam.id} sx={{ '&:hover': { backgroundColor: '#f9f9f9' } }}>
                    <TableCell>{(page - 1) * ITEMS_PER_PAGE + idx + 1}</TableCell>
                    <TableCell>{exam.date}</TableCell>
                    <TableCell>{exam.lastName}</TableCell>
                    <TableCell>{exam.firstName}</TableCell>
                    <TableCell>{exam.type}</TableCell>
                    <TableCell>{exam.diagnosis}</TableCell>
                    <TableCell>{exam.action}</TableCell>
                    <TableCell>
                      <Box
                        sx={{
                          bgcolor: exam.status === 'Хийгдэж буй' ? 'info.100' : 'success.100',
                          color: exam.status === 'Хийгдэж буй' ? 'info.main' : 'success.main',
                          py: 0.5, px: 1.5, borderRadius: '4px',
                          display: 'inline-flex', fontSize: '0.75rem',
                          fontWeight: 500, alignItems: 'center', gap: 0.5
                        }}
                      >
                        {exam.status === 'Хийгдэж буй' ? (
                          <><HourglassEmptyIcon fontSize="small" sx={{ fontSize: '16px' }} />{exam.status}</>
                        ) : (
                          <><CheckCircleOutlineIcon fontSize="small" sx={{ fontSize: '16px' }} />{exam.status}</>
                        )}
                      </Box>
                    </TableCell>
                    <TableCell align="right">
                      <IconButton
                        onClick={(e) => handleMoreClick(e, exam)}
                        sx={{ color: 'text.secondary', '&:hover': { bgcolor: 'rgba(0,0,0,0.04)' } }}
                      >
                        <MoreVertIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}

        <Box sx={{ display: 'flex', justifyContent: 'flex-end', p: 2 }}>
          <Pagination count={totalPages} page={page} onChange={handlePageChange} color="primary" size="small" />
        </Box>

        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={handleCloseMenu}
          PaperProps={{ sx: { boxShadow: '0px 5px 15px rgba(0,0,0,0.08)', borderRadius: '8px', minWidth: '180px' } }}
        >
          <MenuItem onClick={handleViewDetails} sx={{ gap: 1, py: 1, '&:hover': { bgcolor: 'rgba(25,118,210,0.08)' } }}>
            <VisibilityOutlinedIcon fontSize="small" color="primary" />
            <Typography>Дэлгэрэнгүй харах</Typography>
          </MenuItem>
          <MenuItem onClick={handleEdit} sx={{ gap: 1, py: 1, '&:hover': { bgcolor: 'rgba(25,118,210,0.08)' } }}>
            <EditOutlinedIcon fontSize="small" color="primary" />
            <Typography>Засах</Typography>
          </MenuItem>
          <MenuItem onClick={handleDelete} sx={{ gap: 1, py: 1, '&:hover': { bgcolor: 'rgba(211,47,47,0.08)' } }}>
            <DeleteOutlineOutlinedIcon fontSize="small" color="error" />
            <Typography color="error.main">Устгах</Typography>
          </MenuItem>
        </Menu>

        <Dialog
          open={openEditDialog}
          onClose={() => setOpenEditDialog(false)}
          fullWidth maxWidth="md"
          PaperProps={{ sx: { borderRadius: '12px', boxShadow: '0px 8px 24px rgba(0,0,0,0.12)' } }}
        >
          <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', pb: 1 }}>
            <Typography variant="h6" fontWeight={600}>Үзлэгийн мэдээлэл засах</Typography>
            <IconButton size="small" onClick={() => setOpenEditDialog(false)} sx={{ color: 'text.secondary' }}>
              <CloseIcon fontSize="small" />
            </IconButton>
          </DialogTitle>
          <Divider />
          <DialogContent sx={{ pt: 3 }}>
            <Stack spacing={2}>
              <Box sx={{ bgcolor: '#f5f5f5', borderRadius: '8px', px: 2, py: 1.5 }}>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>Өвчтөн</Typography>
                <Typography fontWeight={500}>
                  {editFormData.lastName} {editFormData.firstName}
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', gap: 2 }}>
                <TextField
                  fullWidth label="Үзлэгийн өдөр" name="date" type="date"
                  value={editFormData.date} onChange={handleEditChange}
                  InputLabelProps={{ shrink: true }}
                />
                <FormControl fullWidth>
                  <InputLabel id="type-label">Үзлэгийн төрөл</InputLabel>
                  <Select labelId="type-label" name="type" value={editFormData.type}
                    onChange={handleEditChange} label="Үзлэгийн төрөл">
                    <MenuItem value="Анхан">Анхан</MenuItem>
                    <MenuItem value="Давтан">Давтан</MenuItem>
                  </Select>
                </FormControl>
                <FormControl fullWidth>
                  <InputLabel id="status-label">Төлөв</InputLabel>
                  <Select labelId="status-label" name="status" value={editFormData.status}
                    onChange={handleEditChange} label="Төлөв">
                    <MenuItem value="Хийгдэж буй">
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <HourglassEmptyIcon fontSize="small" /><Typography>Хийгдэж буй</Typography>
                      </Box>
                    </MenuItem>
                    <MenuItem value="Дууссан">
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <CheckCircleOutlineIcon fontSize="small" /><Typography>Дууссан</Typography>
                      </Box>
                    </MenuItem>
                  </Select>
                </FormControl>
              </Box>
              <TextField
                fullWidth label="Үзлэгийн шалтгаан" name="reason"
                value={editFormData.reason} onChange={handleEditChange}
                multiline rows={2} InputLabelProps={{ shrink: true }}
              />
            </Stack>
          </DialogContent>
          <DialogActions sx={{ px: 3, py: 2 }}>
            <Button onClick={() => setOpenEditDialog(false)} variant="outlined"
              sx={{ borderRadius: '8px', textTransform: 'none', px: 3 }}>Болих</Button>
            <Button variant="contained" onClick={saveEdit}
              sx={{ borderRadius: '8px', textTransform: 'none', px: 3 }}>Хадгалах</Button>
          </DialogActions>
        </Dialog>

        <Dialog
          open={openDeleteConfirm}
          onClose={cancelDelete}
          PaperProps={{ sx: { borderRadius: '12px', width: '400px', boxShadow: '0px 8px 24px rgba(0,0,0,0.12)' } }}
        >
          <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <DeleteOutlineOutlinedIcon color="error" />
              <Typography variant="h6" fontWeight={600} color="error.main">Устгах уу?</Typography>
            </Box>
            <IconButton size="small" onClick={cancelDelete} sx={{ color: 'text.secondary' }}>
              <CloseIcon fontSize="small" />
            </IconButton>
          </DialogTitle>
          <Divider />
          <DialogContent sx={{ py: 3 }}>
            <Typography align="center">
              Та <b>{selectedExam?.lastName} {selectedExam?.firstName}</b> үзлэгийг устгахдаа итгэлтэй байна уу?
            </Typography>
            <Typography variant="body2" color="text.secondary" align="center" sx={{ mt: 1 }}>
              Энэ үйлдлийг буцаах боломжгүй.
            </Typography>
          </DialogContent>
          <DialogActions sx={{ px: 3, py: 2, justifyContent: 'center' }}>
            <Button onClick={cancelDelete} variant="outlined"
              sx={{ borderRadius: '8px', textTransform: 'none', px: 3, minWidth: '120px' }}>Болих</Button>
            <Button variant="contained" color="error" onClick={confirmDelete}
              startIcon={<DeleteOutlineOutlinedIcon />}
              sx={{ borderRadius: '8px', textTransform: 'none', px: 3, minWidth: '120px' }}>Устгах</Button>
          </DialogActions>
        </Dialog>
      </Box>
    </Box>
  );
}