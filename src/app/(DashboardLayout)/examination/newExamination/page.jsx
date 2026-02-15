'use client';

import React, { useState } from 'react';


import { useEffect } from 'react';
import patientService from '../../../service/patientService';
import { Box, Snackbar } from '@mui/material';
import { Alert, message } from 'antd';
import { useRouter } from 'next/navigation';
import { actionOptions, diagnosisOptions, mockPatients } from '../../components/examination/mockdata';
import Header from '../../components/examination/Header';
import PatientInfo from '../../components/examination/PatientInfo';
import PatientAllergies from '../../components/examination/Allergy';
import PatientChronicDiseases from '../../components/examination/ChronicDisease';
import PatientSelection from '../../components/examination/PatientSelection';
import ServiceCategories from '../../components/examination/ServiceCategories';
import VitalSigns from '../../components/examination/VitalSigns';
import DiagnosisTab from '../../components/examination/Diagnosis';
import TreatmentTab from '../../components/examination/Treatment';
import PrescriptionTab from '../../components/examination/Prescription';
import ActionButtons from '../../components/examination/ActionButtons';
import PatientSearchDialog from '../../components/examination/PatientSearchDialog';
import PatientMedicalHistory from '../../components/examination/MedicalHistory';

const calculateAge = (birthDate) => {
  if (!birthDate) return '';
  const birth = new Date(birthDate);
  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  const m = today.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) {
    age--;
  }
  return age;
};

export default function CreateExaminationPage() {
  const router = useRouter();
  const [tabValue, setTabValue] = useState(0);
  const [loading, setLoading] = useState(false);
  const [patientDialogOpen, setPatientDialogOpen] = useState(false);
  const [patientSearch, setPatientSearch] = useState('');
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [patients, setPatients] = useState([]);
  const [measurementStep, setMeasurementStep] = useState(null);
  const [loadingVitals, setLoadingVitals] = useState(false);
  const [rightNote, setRightNote] = useState('');
  const [leftNote, setLeftNote] = useState('');


  
  // Notification state
  const [notification, setNotification] = useState(null);
  
  
  // Form state
  const [formData, setFormData] = useState({
    patientId: '',
    patientName: '',
    date: new Date(),
    type: 'Анхан',
    diagnosis: '',
    diagnosisCode: '',
    action: '',
    actionCode: '',
    notes: '',
    status: 'Хийгдэж буй',
    temperature: '', heart_rate: '', respiration_rate: '',
    weight: '', height: '', bmi: '', saturation: '',
    consciousness_status: '', right_systolic: '', right_diastolic: '',
    right_mean_arterial_pressure: '', right_note: '',
    left_systolic: '', left_diastolic: '', left_mean_arterial_pressure: '',
    left_note: ''
  });
  
  useEffect(() => {
    const fetchPatients = async () => {
      try {
        const data = await patientService.getAllPatients();
        console.log("Пациентууд:", data); // 👈 энэ мөр нэмээд шалга
        setPatients(data.patients || []);
      } catch (error) {
        console.error("Пациентууд татахад алдаа:", error);
      }
    };
    fetchPatients();
  }, []);
  
  

  const showNotification = (message, severity = 'success') => {
    setNotification({ message, severity });
    // Auto-clear notification after it's shown
    setTimeout(() => {
      setNotification(null);
    }, 3000);
  };

  const handleTabChange = (newValue) => {
    setTabValue(newValue);
  };

  const handleBack = () => {
    router.push('/examination');
  };
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => {
      const updated = { ...prev, [name]: value };
      if (['weight', 'height'].includes(name)) {
        const weight = name === 'weight' ? parseFloat(value) : parseFloat(prev.weight);
        const height = name === 'height' ? parseFloat(value) : parseFloat(prev.height);
        if (!isNaN(weight) && !isNaN(height) && height > 0) {
          updated.bmi = (weight / ((height / 100) ** 2)).toFixed(1);
        } else {
          updated.bmi = '';
        }
      }
      return updated;
    });
  };
  const fetchVitalsFromDevice = async (side) => {
    setMeasurementStep(side);
    setLoadingVitals(true);
    const token = localStorage.getItem('USER') ? JSON.parse(localStorage.getItem('USER')).token : null;
    if (!token) {
      showNotification('Токен олдсонгүй. Та дахин нэвтэрнэ үү.', 'error');
      setLoadingVitals(false);
      return;
    }
    try {
      showNotification(`${side === 'right' ? 'Баруун' : 'Зүүн'} даралтыг хэмжиж байна...`, 'info');
      const response = await fetch('http://localhost:8000/api/vital/vitalsigns/latest', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
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
      showNotification(`${side === 'right' ? 'Баруун' : 'Зүүн'} даралт амжилттай хэмжигдлээ`, 'success');
    } catch (err) {
      console.error(err);
      showNotification(`${side === 'right' ? 'Баруун' : 'Зүүн'} даралтыг хэмжихэд алдаа гарлаа`, 'error');
    } finally {
      setLoadingVitals(false);
    }
  };

  const handleDateChange = (date) => {
    setFormData(prev => ({ ...prev, date }));
  };

  const handleDiagnosisChange = (event, newValue) => {
    if (newValue) {
      setFormData(prev => ({
        ...prev,
        diagnosis: newValue.label,
        diagnosisCode: newValue.code
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        diagnosis: '',
        diagnosisCode: ''
      }));
    }
  };

  const handleActionChange = (event, newValue) => {
    if (newValue) {
      setFormData(prev => ({
        ...prev,
        action: newValue.label,
        actionCode: newValue.code
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        action: '',
        actionCode: ''
      }));
    }
  };

  const handleOpenPatientDialog = () => {
    setPatientDialogOpen(true);
  };

  const handleClosePatientDialog = () => {
    setPatientDialogOpen(false);
  };

  const handlePatientSearchChange = (e) => {
    setPatientSearch(e.target.value);
  };

  const handleSelectPatient = async (patient) => {
    const translatedType = {
      Teacher: 'Багш',
      Student: 'Оюутан',
      Staff: 'Ажилтан',
      male: 'Эрэгтэй',
      female: 'Эмэгтэй',

    };
  
    try {
      // Fetch allergies
      const allergyData = await patientService.getPatientAllergies(patient._id || patient.id);
      const allergies = allergyData.data || [];

      // Fetch chronic diseases
      const chronicDiseaseData = await patientService.getPatientChronicDiseases(patient._id || patient.id);
      const chronicDiseases = chronicDiseaseData.data || [];

      console.log("Харшлын хариу:", allergyData); 
      console.log("Архаг өвчний хариу:", chronicDiseaseData);
  
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
        allergies, // ⬅️ харшлуудыг холбоно
        chronicDiseases, // ⬅️ архаг өвчнүүдийг холбоно
      });
  
      setFormData((prev) => ({
        ...prev,
        patientId: patient.id || patient._id,
        patientName: `${patient.lastname || patient.lastName || ''} ${patient.firstname || patient.firstName || ''}`
      }));
  
      setPatientDialogOpen(false);
    } catch (err) {
      console.error('Failed to load patient data:', err);
      showNotification('Пациентын мэдээлэл татаж чадсангүй', 'error');
    }
  };
  
  
  
  const handleUpdateAllergies = async (updatedAllergies) => {
    try {
      const patientId = selectedPatient.id || selectedPatient._id;
      console.log(selectedPatient.id);
  
      const newAllergies = [];
      for (const allergy of updatedAllergies) {
        if (!allergy._id) {
          // 🟢 patient ID-г payload дотор оруулж өгнө
          const payload = { ...allergy, patient: patientId };
          const saved = await patientService.createPatientAllergy(payload);
          newAllergies.push(saved.data);
        } else {
          newAllergies.push(allergy);
        }
      }
  
      setSelectedPatient(prev => ({
        ...prev,
        allergies: newAllergies
      }));
  
      showNotification('Харшлын мэдээлэл амжилттай хадгалагдлаа');
    } catch (err) {
      console.error("Харшлын хадгалах алдаа:", err);
      showNotification('Харшлын мэдээлэл хадгалах үед алдаа гарлаа', 'error');
    }
  };
  
  
  
  

  const handleUpdateChronicDiseases = async (updatedDiseases) => {
    try {
      const patientId = selectedPatient.id || selectedPatient._id;
      console.log("Updating chronic diseases for patient:", patientId);
  
      const newDiseases = [];
      for (const disease of updatedDiseases) {
        if (!disease._id) {
          // 🟢 patient ID-г payload дотор оруулж өгнө
          const payload = { ...disease, patient: patientId };
          const saved = await patientService.createPatientChronicDisease(payload);
          newDiseases.push(saved.data);
        } else {
          newDiseases.push(disease);
        }
      }
  
      setSelectedPatient(prev => ({
        ...prev,
        chronicDiseases: newDiseases
      }));
  
      showNotification('Архаг өвчний мэдээлэл амжилттай хадгалагдлаа');
    } catch (err) {
      console.error("Архаг өвчний хадгалах алдаа:", err);
      showNotification('Архаг өвчний мэдээлэл хадгалах үед алдаа гарлаа', 'error');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
  
    // Хэрвээ үйлчлүүлэгч сонгогдоогүй бол
    if (!selectedPatient) {
      showNotification('Та үйлчлүүлэгч сонгоно уу', 'warning');
      setLoading(false);
      return;
    }
  
    // API дуудлага симуляц хийх
    try {
      console.log('Submitting examination data:', formData);
  
      // simulate network delay
      await new Promise(resolve => setTimeout(resolve, 1000));
  
      // Амжилтын мэдэгдэл
      showNotification('Амжилттай хадгалагдлаа');
    } catch (error) {
      console.error('Error submitting examination:', error);
      showNotification('Хадгалах үед алдаа гарлаа', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Filter patients based on search
  const filteredPatients = patients.filter(patient => {
    const fullName = `${patient.lastName} ${patient.firstName}`.toLowerCase();
    const regNum = (patient.register || "").toLowerCase();
    const search = patientSearch.toLowerCase();
  
    return fullName.includes(search) || regNum.includes(search);
  });
  

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', bgcolor: 'white', p: 3 }}>
      {/* Header */}
      <Header onBack={handleBack} />

      <Box component="form" onSubmit={handleSubmit}>
        {/* Patient Selection or Info Card */}
        {selectedPatient ? (
          <>
            <PatientInfo 
              patient={selectedPatient} 
              onChangePatient={() => setSelectedPatient(null)} 
            />
            
            <PatientAllergies 
      key={`allergies-${selectedPatient?.id || selectedPatient?._id}`} // Add unique key
      allergies={selectedPatient.allergies || []}
      onUpdate={handleUpdateAllergies}
      patientId={selectedPatient.id || selectedPatient._id}
      currentPatient={selectedPatient}
    />
    <PatientChronicDiseases 
      key={`chronic-${selectedPatient?.id || selectedPatient?._id}`} // Add unique key
      chronicDiseases={selectedPatient.chronicDiseases || []} 
      onUpdate={handleUpdateChronicDiseases}
      patientId={selectedPatient.id || selectedPatient._id}
      currentPatient={selectedPatient}
    />
            <PatientMedicalHistory patient={selectedPatient} />
          </>
        ) : (
          <PatientSelection onOpenDialog={handleOpenPatientDialog} />
        )}

        {/* Rest of the form is disabled if no patient is selected */}
        <Box sx={{ opacity: selectedPatient ? 1 : 0.5, pointerEvents: selectedPatient ? 'auto' : 'none' }}>
          {/* Service Categories */}
          <ServiceCategories 
            tabValue={tabValue} 
            onChange={handleTabChange} 
          />

          {/* Form Content Based on Selected Tab */}
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

          {tabValue === 2 && (
            <TreatmentTab 
              formData={formData} 
              onChange={handleChange} 
            />
          )}

          {tabValue === 3 && (
            <PrescriptionTab 
              formData={formData} 
              onChange={handleChange} 
            />
          )}
          
          {/* Action Buttons */}
          <ActionButtons 
            onCancel={handleBack} 
            loading={loading} 
          />
        </Box>
      </Box>

      {/* Patient Selection Dialog */}
      <PatientSearchDialog 
        open={patientDialogOpen}
        onClose={handleClosePatientDialog}
        patients={filteredPatients}
        searchValue={patientSearch}
        onSearchChange={handlePatientSearchChange}
        onSelectPatient={handleSelectPatient}
      />

      {/* Notification component */}
      {notification && (
        <Box
          sx={{
            position: 'fixed',
            bottom: 16,
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 2000,
            minWidth: 300,
            maxWidth: '80%'
          }}
        >
          <Alert 
            severity={notification.severity} 
            variant="filled" 
            onClose={() => setNotification(null)}
            sx={{ boxShadow: '0px 3px 8px rgba(0, 0, 0, 0.2)' }}
          >
            {notification.message}
          </Alert>
        </Box>
      )}
    </Box>
  );
}