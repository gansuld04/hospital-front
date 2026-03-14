'use client';

import React, { useState, useEffect } from 'react';
import {
  Box, Typography, TextField, Button, Table, TableBody,
  TableCell, TableContainer, TableHead, TableRow, Paper,
  InputAdornment, Chip
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import PersonAddAltIcon from '@mui/icons-material/PersonAddAlt';
import patientService from '../../../service/patientService';
import { Alert } from 'antd';
import { useRouter } from 'next/navigation';
import { actionOptions, diagnosisOptions } from '../../components/examination/mockdata';
import Header from '../../components/examination/Header';
import PatientInfo from '../../components/examination/PatientInfo';
import PatientAllergies from '../../components/examination/Allergy';
import PatientChronicDiseases from '../../components/examination/ChronicDisease';
import ServiceCategories from '../../components/examination/ServiceCategories';
import VitalSigns from '../../components/examination/VitalSigns';
import DiagnosisTab from '../../components/examination/Diagnosis';
import TreatmentTab from '../../components/examination/Treatment';
import PrescriptionTab from '../../components/examination/Prescription';
import ActionButtons from '../../components/examination/ActionButtons';
import PatientMedicalHistory from '../../components/examination/MedicalHistory';

const calculateAge = (birthDate) => {
  if (!birthDate) return '';
  const birth = new Date(birthDate);
  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  const m = today.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
  return age;
};

export default function CreateExaminationPage() {
  const router = useRouter();
  const [tabValue, setTabValue] = useState(0);
  const [loading, setLoading] = useState(false);
  const [patients, setPatients] = useState([]);
  const [patientSearch, setPatientSearch] = useState('');
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [measurementStep, setMeasurementStep] = useState(null);
  const [loadingVitals, setLoadingVitals] = useState(false);
  const [notification, setNotification] = useState(null);
  const [ongoingPatientIds, setOngoingPatientIds] = useState(new Set());

  const [formData, setFormData] = useState({
    patientId: '', patientName: '', date: new Date(), type: 'Анхан',
    diagnosis: '', diagnosisCode: '', action: '', actionCode: '',
    notes: '', status: 'Хийгдэж буй',
    temperature: '', heart_rate: '', respiration_rate: '',
    weight: '', height: '', bmi: '', saturation: '',
    consciousness_status: '', right_systolic: '', right_diastolic: '',
    right_mean_arterial_pressure: '', right_note: '',
    left_systolic: '', left_diastolic: '', left_mean_arterial_pressure: '', left_note: ''
  });

  useEffect(() => {
    const fetchPatients = async () => {
      try {
        const userStr = localStorage.getItem('USER');
        const token = userStr ? JSON.parse(userStr).token : null;

        // Өвчтөнүүд болон "Хийгдэж буй" үзлэгүүдийг зэрэгцүүлэн татах
        const [patientData, examRes] = await Promise.all([
          patientService.getAllPatients(),
          token
            ? fetch('http://localhost:8000/api/examination/doctor/my-examinations', {
                headers: { 'Authorization': `Bearer ${token}` }
              }).then(r => r.json())
            : Promise.resolve({ data: [] })
        ]);

        // "Хийгдэж буй" үзлэгтэй өвчтөний ID-г цуглуулах
        const ongoingIds = new Set(
          (examRes.data || [])
            .filter(exam => exam.status === 'Ongoing')
            .map(exam => exam.patient?._id || exam.patient)
        );

        setOngoingPatientIds(ongoingIds);
        setPatients(patientData.patients || []);
      } catch (error) {
        console.error('Пациентууд татахад алдаа:', error);
      }
    };
    fetchPatients();
  }, []);

  const showNotification = (message, severity = 'success') => {
    setNotification({ message, severity });
    setTimeout(() => setNotification(null), 3000);
  };

  const handleBack = () => router.push('/examination');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => {
      const updated = { ...prev, [name]: value };
      if (['weight', 'height'].includes(name)) {
        const w = name === 'weight' ? parseFloat(value) : parseFloat(prev.weight);
        const h = name === 'height' ? parseFloat(value) : parseFloat(prev.height);
        updated.bmi = (!isNaN(w) && !isNaN(h) && h > 0)
          ? (w / ((h / 100) ** 2)).toFixed(1) : '';
      }
      return updated;
    });
  };

  const fetchVitalsFromDevice = async (side) => {
    setMeasurementStep(side);
    setLoadingVitals(true);
    const token = localStorage.getItem('USER')
      ? JSON.parse(localStorage.getItem('USER')).token : null;
    if (!token) {
      showNotification('Токен олдсонгүй. Та дахин нэвтэрнэ үү.', 'error');
      setLoadingVitals(false);
      return;
    }
    try {
      showNotification(`${side === 'right' ? 'Баруун' : 'Зүүн'} даралтыг хэмжиж байна...`, 'info');
      const response = await fetch('http://localhost:8000/api/vital/vitalsigns/latest', {
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
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
      showNotification(`${side === 'right' ? 'Баруун' : 'Зүүн'} даралт амжилттай хэмжигдлээ`, 'success');
    } catch (err) {
      showNotification(`Даралтыг хэмжихэд алдаа гарлаа`, 'error');
    } finally {
      setLoadingVitals(false);
    }
  };

  const handleDateChange = (date) => setFormData(prev => ({ ...prev, date }));

  const handleDiagnosisChange = (event, newValue) => {
    setFormData(prev => ({
      ...prev,
      diagnosis: newValue ? newValue.label : '',
      diagnosisCode: newValue ? newValue.code : ''
    }));
  };

  const handleActionChange = (event, newValue) => {
    setFormData(prev => ({
      ...prev,
      action: newValue ? newValue.label : '',
      actionCode: newValue ? newValue.code : ''
    }));
  };

  const handleSelectPatient = async (patient) => {
    const translatedType = {
      Teacher: 'Багш', Student: 'Оюутан', Staff: 'Ажилтан',
      male: 'Эрэгтэй', female: 'Эмэгтэй',
    };
    try {
      const allergyData = await patientService.getPatientAllergies(patient._id || patient.id);
      const chronicDiseaseData = await patientService.getPatientChronicDiseases(patient._id || patient.id);

      setSelectedPatient({
        ...patient,
        lastName: patient.lastname || patient.lastName,
        firstName: patient.firstname || patient.firstName,
        registerNum: patient.register || patient.registerNum,
        school: patient.school || '',
        type: translatedType[patient.type] || patient.type || '—',
        gender: translatedType[patient.gender] || patient.gender || '—',
        age: calculateAge(patient.birthOfDate),
        occupation: patient.occupation || '—',
        allergies: allergyData.data || [],
        chronicDiseases: chronicDiseaseData.data || [],
      });

      setFormData(prev => ({
        ...prev,
        patientId: patient.id || patient._id,
        patientName: `${patient.lastname || patient.lastName || ''} ${patient.firstname || patient.firstName || ''}`
      }));
    } catch (err) {
      showNotification('Пациентын мэдээлэл татаж чадсангүй', 'error');
    }
  };

  const handleUpdateAllergies = async (updatedAllergies) => {
    try {
      const patientId = selectedPatient.id || selectedPatient._id;
      const newAllergies = [];
      for (const allergy of updatedAllergies) {
        if (!allergy._id) {
          const saved = await patientService.createPatientAllergy({ ...allergy, patient: patientId });
          newAllergies.push(saved.data);
        } else {
          newAllergies.push(allergy);
        }
      }
      setSelectedPatient(prev => ({ ...prev, allergies: newAllergies }));
      showNotification('Харшлын мэдээлэл амжилттай хадгалагдлаа');
    } catch {
      showNotification('Харшлын мэдээлэл хадгалах үед алдаа гарлаа', 'error');
    }
  };

  const handleUpdateChronicDiseases = async (updatedDiseases) => {
    try {
      const patientId = selectedPatient.id || selectedPatient._id;
      const newDiseases = [];
      for (const disease of updatedDiseases) {
        if (!disease._id) {
          const saved = await patientService.createPatientChronicDisease({ ...disease, patient: patientId });
          newDiseases.push(saved.data);
        } else {
          newDiseases.push(disease);
        }
      }
      setSelectedPatient(prev => ({ ...prev, chronicDiseases: newDiseases }));
      showNotification('Архаг өвчний мэдээлэл амжилттай хадгалагдлаа');
    } catch {
      showNotification('Архаг өвчний мэдээлэл хадгалах үед алдаа гарлаа', 'error');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    if (!selectedPatient) {
      showNotification('Та үйлчлүүлэгч сонгоно уу', 'warning');
      setLoading(false);
      return;
    }

    let token = null;
    try {
      const userStr = localStorage.getItem('USER');
      if (userStr) token = JSON.parse(userStr).token;
    } catch {}

    if (!token) {
      showNotification('Нэвтрэх шаардлагатай', 'error');
      setLoading(false);
      return;
    }

    const headers = { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` };
    const patientId = selectedPatient.id || selectedPatient._id;

    try {
      // 1. Үзлэг үүсгэх
      const examRes = await fetch('http://localhost:8000/api/examination', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          patient: patientId,
          exam_date: new Date(formData.date),
          doctors_examination: formData.type === 'Анхан' ? 'Initial' : 'Follow-up',
          reason: formData.notes || '',
          status: formData.status === 'Дууссан' ? 'Done' : 'Ongoing',
        })
      });
      const examData = await examRes.json();
      if (!examRes.ok) throw new Error(examData?.errors?.[0]?.message || 'Үзлэг үүсгэхэд алдаа');
      const examinationId = examData.data._id;

      // 2. Амин үзүүлэлт
      const hasVitals = [
        formData.temperature, formData.heart_rate, formData.respiration_rate,
        formData.saturation, formData.weight, formData.height,
        formData.right_systolic, formData.right_diastolic,
        formData.left_systolic, formData.left_diastolic
      ].some(v => v !== '' && v != null);

      if (hasVitals) {
        const toNum = (v) => (v !== '' && v != null) ? parseFloat(v) : undefined;
        const vitalsRes = await fetch('http://localhost:8000/api/vital/vitalsigns', {
          method: 'POST',
          headers,
          body: JSON.stringify({
            patientId,
            vital_signs: {
              temperature: toNum(formData.temperature),
              respiration_rate: toNum(formData.respiration_rate),
              saturation: toNum(formData.saturation),
              weight: toNum(formData.weight),
              height: toNum(formData.height),
              right_systolic: toNum(formData.right_systolic),
              right_diastolic: toNum(formData.right_diastolic),
              right_mean_arterial_pressure: toNum(formData.right_mean_arterial_pressure),
              right_note: formData.right_note || undefined,
              left_systolic: toNum(formData.left_systolic),
              left_diastolic: toNum(formData.left_diastolic),
              left_mean_arterial_pressure: toNum(formData.left_mean_arterial_pressure),
              left_note: formData.left_note || undefined,
              right_heart_rate: toNum(formData.heart_rate),
            }
          })
        });
        if (!vitalsRes.ok) showNotification('Амин үзүүлэлт хадгалахад алдаа гарлаа', 'warning');
      }

      // 3. Онош
      if (formData.diagnosisCode) {
        const diagRes = await fetch('http://localhost:8000/api/diagnosis/diagnosis', {
          method: 'POST',
          headers,
          body: JSON.stringify({
            diagnosisCode: formData.diagnosisCode,
            patient: patientId,
            examination: examinationId,
          })
        });
        if (!diagRes.ok) showNotification('Онош хадгалахад алдаа гарлаа', 'warning');
      }

      showNotification('Амжилттай хадгалагдлаа');
      setTimeout(() => router.push('/examination'), 1500);
    } catch (error) {
      showNotification(error.message || 'Хадгалах үед алдаа гарлаа', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Хийгдэж буй үзлэгтэй өвчтөнүүдийг хасаж, хайлтаар шүүнэ
  const filteredPatients = patients.filter(patient => {
    const id = patient.id || patient._id;
    if (ongoingPatientIds.has(id)) return false; // Хийгдэж буй үзлэгтэй бол харуулахгүй
    const fullName = `${patient.lastname || ''} ${patient.firstname || ''}`.toLowerCase();
    const regNum = (patient.register || '').toLowerCase();
    return fullName.includes(patientSearch.toLowerCase()) || regNum.includes(patientSearch.toLowerCase());
  });

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', bgcolor: 'white', p: 3 }}>
      <Header onBack={handleBack} />

      <Box component="form" onSubmit={handleSubmit}>

        {/* ── Өвчтөн сонгоогүй үед: жагсаалт харуулах ── */}
        {!selectedPatient ? (
          <Box sx={{ mt: 2 }}>
            {/* Гарчиг + бүртгэх товч */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6" fontWeight={600}>Үйлчлүүлэгч сонгох</Typography>
              <Button
                variant="contained"
                startIcon={<PersonAddAltIcon />}
                onClick={() => router.push('http://localhost:3000/customer/customerRegister')}
                sx={{ borderRadius: '8px', textTransform: 'none', px: 3 }}
              >
                Өвчтөн бүртгэх
              </Button>
            </Box>

            {/* Хайлтын талбар */}
            <TextField
              fullWidth
              placeholder="Овог, нэр эсвэл регистрийн дугаараар хайх..."
              value={patientSearch}
              onChange={(e) => setPatientSearch(e.target.value)}
              size="small"
              sx={{ mb: 2 }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon fontSize="small" />
                  </InputAdornment>
                )
              }}
            />

            {/* Өвчтөний жагсаалт */}
            <TableContainer component={Paper} sx={{ boxShadow: 'none', border: '1px solid #eee', borderRadius: '12px' }}>
              <Table>
                <TableHead sx={{ backgroundColor: '#f5f5f5' }}>
                  <TableRow>
                    <TableCell>№</TableCell>
                    <TableCell>Овог</TableCell>
                    <TableCell>Нэр</TableCell>
                    <TableCell>Регистр</TableCell>
                    <TableCell>Хүйс</TableCell>
                    <TableCell>Нас</TableCell>
                    <TableCell align="center">Үйлдэл</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredPatients.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} align="center" sx={{ py: 4, color: 'text.secondary' }}>
                        Өвчтөн олдсонгүй
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredPatients.map((patient, idx) => (
                      <TableRow
                        key={patient._id || patient.id}
                        sx={{ '&:hover': { backgroundColor: '#f0f7ff', cursor: 'pointer' } }}
                        onClick={() => handleSelectPatient(patient)}
                      >
                        <TableCell>{idx + 1}</TableCell>
                        <TableCell>{patient.lastname || patient.lastName || '—'}</TableCell>
                        <TableCell>{patient.firstname || patient.firstName || '—'}</TableCell>
                        <TableCell>{patient.register || '—'}</TableCell>
                        <TableCell>
                          {patient.gender === 'male' ? 'Эрэгтэй'
                            : patient.gender === 'female' ? 'Эмэгтэй'
                            : patient.gender || '—'}
                        </TableCell>
                        <TableCell>{calculateAge(patient.birthOfDate) || '—'}</TableCell>
                        <TableCell align="center">
                          <Button
                            size="small"
                            variant="outlined"
                            onClick={(e) => { e.stopPropagation(); handleSelectPatient(patient); }}
                            sx={{ borderRadius: '6px', textTransform: 'none', fontSize: '0.75rem' }}
                          >
                            Сонгох
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </Box>
        ) : (
          /* ── Өвчтөн сонгосон үед: мэдээлэл + форм ── */
          <>
            <PatientInfo
              patient={selectedPatient}
              onChangePatient={() => setSelectedPatient(null)}
            />
            <PatientAllergies
              key={`allergies-${selectedPatient?.id || selectedPatient?._id}`}
              allergies={selectedPatient.allergies || []}
              onUpdate={handleUpdateAllergies}
              patientId={selectedPatient.id || selectedPatient._id}
              currentPatient={selectedPatient}
            />
            <PatientChronicDiseases
              key={`chronic-${selectedPatient?.id || selectedPatient?._id}`}
              chronicDiseases={selectedPatient.chronicDiseases || []}
              onUpdate={handleUpdateChronicDiseases}
              patientId={selectedPatient.id || selectedPatient._id}
              currentPatient={selectedPatient}
            />
            <PatientMedicalHistory patient={selectedPatient} />

            <Box>
              <ServiceCategories tabValue={tabValue} onChange={setTabValue} />

              {tabValue === 0 && (
                <VitalSigns
                  formData={formData}
                  onChange={handleChange}
                  onFetchVitals={fetchVitalsFromDevice}
                  measurementStep={measurementStep}
                  loading={loadingVitals}
                />
              )}
              {tabValue === 1 && (
                <DiagnosisTab
                  formData={formData}
                  onChange={handleChange}
                  onDateChange={handleDateChange}
                  onDiagnosisChange={handleDiagnosisChange}
                  onActionChange={handleActionChange}
                  diagnosisOptions={diagnosisOptions}
                  actionOptions={actionOptions}
                />
              )}
              {tabValue === 2 && <TreatmentTab formData={formData} onChange={handleChange} />}
              {tabValue === 3 && <PrescriptionTab formData={formData} onChange={handleChange} />}

              <ActionButtons onCancel={handleBack} loading={loading} />
            </Box>
          </>
        )}
      </Box>

      {/* Notification */}
      {notification && (
        <Box sx={{
          position: 'fixed', bottom: 16, left: '50%',
          transform: 'translateX(-50%)', zIndex: 2000, minWidth: 300, maxWidth: '80%'
        }}>
          <Alert
            severity={notification.severity}
            variant="filled"
            onClose={() => setNotification(null)}
            sx={{ boxShadow: '0px 3px 8px rgba(0,0,0,0.2)' }}
          >
            {notification.message}
          </Alert>
        </Box>
      )}
    </Box>
  );
}