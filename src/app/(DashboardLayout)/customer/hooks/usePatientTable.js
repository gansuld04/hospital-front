'use client'
import { useState, useCallback } from 'react'

const ITEMS_PER_PAGE = 6

// ─── usePatientTable hook ─────────────────────────────────────────────────────
// UI state: tab, search, pagination, context menu, dialogs, edit form
export function usePatientTable() {
  const [tabValue,        setTabValue]        = useState(0)
  const [page,            setPage]            = useState(1)
  const [searchTerm,      setSearchTerm]      = useState('')
  const [anchorEl,        setAnchorEl]        = useState(null)
  const [selectedPatient, setSelectedPatient] = useState(null)
  const [openEditDialog,  setOpenEditDialog]  = useState(false)
  const [openDeleteConfirm, setOpenDeleteConfirm] = useState(false)

  const [editFormData, setEditFormData] = useState({
    id: '', name: '', birthDate: '', age: '', type: '', address: '', phone: '',
  })

  // ── Tab / Search / Page ────────────────────────────────────────────────────
  const handleTabChange = useCallback((_, newValue) => {
    setTabValue(newValue)
    setPage(1)
  }, [])

  const handlePageChange = useCallback((_, value) => setPage(value), [])

  const handleSearchChange = useCallback((e) => {
    setSearchTerm(e.target.value)
    setPage(1)
  }, [])

  // ── Filter + paginate ──────────────────────────────────────────────────────
  const filterPatients = useCallback((patients) => {
    return patients.filter((item) => {
      const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase())
      if (!matchesSearch) return false
      if (tabValue === 1) return item.type === 'Оюутан'
      if (tabValue === 2) return item.type === 'Багш'
      if (tabValue === 3) return item.type === 'Ажилтан'
      return true
    })
  }, [searchTerm, tabValue])

  const paginate = useCallback((filtered) => ({
    totalPages:      Math.ceil(filtered.length / ITEMS_PER_PAGE),
    currentPageData: filtered.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE),
  }), [page])

  // ── Context menu ───────────────────────────────────────────────────────────
  const handleMoreClick = useCallback((event, patient) => {
    setSelectedPatient(patient)
    setAnchorEl(event.currentTarget)
  }, [])

  const handleCloseMenu = useCallback(() => setAnchorEl(null), [])

  // ── Edit dialog ────────────────────────────────────────────────────────────
  const handleEdit = useCallback(() => {
    if (!selectedPatient?.id) return
    setEditFormData({
      id:        selectedPatient.id,
      name:      selectedPatient.name,
      birthDate: selectedPatient.birthDate,
      age:       selectedPatient.age,
      type:      selectedPatient.type,
      address:   selectedPatient.address,
      phone:     selectedPatient.phone,
    })
    setOpenEditDialog(true)
    setAnchorEl(null)
  }, [selectedPatient])

  const handleEditChange = useCallback((e) => {
    const { name, value } = e.target
    setEditFormData(prev => ({ ...prev, [name]: value }))
  }, [])

  const closeEditDialog = useCallback(() => setOpenEditDialog(false), [])

  // ── Delete dialog ──────────────────────────────────────────────────────────
  const handleDelete = useCallback(() => {
    setOpenDeleteConfirm(true)
    setAnchorEl(null)
  }, [])

  const cancelDelete = useCallback(() => setOpenDeleteConfirm(false), [])

  return {
    // state
    tabValue, page, searchTerm, anchorEl,
    selectedPatient, openEditDialog, openDeleteConfirm, editFormData,
    // handlers
    handleTabChange, handlePageChange, handleSearchChange,
    handleMoreClick, handleCloseMenu,
    handleEdit, handleEditChange, closeEditDialog,
    handleDelete, cancelDelete,
    // helpers
    filterPatients, paginate,
  }
}