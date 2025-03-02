"use client"

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, CheckCircle } from 'lucide-react';

// Define TypeScript interfaces
interface TimeSlot {
  id: string;
  display_text: string;
  period: string;
  day_specific: boolean;
  start_time: string;
  end_time: string;
}

interface Kelas {
  id: string;
  nama: string;
  period: string;
}

interface Dosen {
  id: string;
  nama: string;
  kode: string;
}

interface MataKuliah {
  id: string;
  nama: string;
  kode: string;
  prodi_id: string;
  sks: number;
  jam: number;
}

interface Prodi {
  id: string;
  nama: string;
}

interface FormData {
  dosen_id: string;
  mata_kuliah_id: string;
  kelas_id: string;
  hari: string;
  time_slot_id: string;
  prodi_id: string;
  period: string;
}

interface ConflictCheck {
  hasConflict: boolean;
  message: string;
  type: 'dosen' | 'kelas' | 'none';
}

interface ConflictResponse {
  conflicts: Array<{
    type: 'dosen' | 'kelas';
    jadwal_id: string;
    kelas_id?: string;
    kelas_nama?: string;
    dosen_id?: string;
    dosen_nama?: string;
    dosen_kode?: string;
  }>;
  entities: {
    dosen: Dosen[];
    kelas: Kelas[];
  };
}

interface JadwalFormProps {
  defaultPeriod?: string;
  onSuccess?: () => void;
}

const JadwalForm: React.FC<JadwalFormProps> = ({ defaultPeriod = 'PAGI', onSuccess }) => {
  // Form state
  const [formData, setFormData] = useState<FormData>({
    dosen_id: '',
    mata_kuliah_id: '',
    kelas_id: '',
    hari: '',
    time_slot_id: '',
    prodi_id: '',
    period: defaultPeriod,
  });
  
  // Data state
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([]);
  const [kelas, setKelas] = useState<Kelas[]>([]);
  const [dosen, setDosen] = useState<Dosen[]>([]);
  const [mataKuliah, setMataKuliah] = useState<MataKuliah[]>([]);
  const [prodi, setProdi] = useState<Prodi[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  
  // Filtered state
  const [filteredMataKuliah, setFilteredMataKuliah] = useState<MataKuliah[]>([]);
  const [filteredKelas, setFilteredKelas] = useState<Kelas[]>([]);
  const [filteredTimeSlots, setFilteredTimeSlots] = useState<TimeSlot[]>([]);
  const [availableDays, setAvailableDays] = useState<string[]>([]);
  
  // Conflict checking
  const [conflict, setConflict] = useState<ConflictCheck>({ 
    hasConflict: false, 
    message: '', 
    type: 'none' 
  });
  const [checking, setChecking] = useState<boolean>(false);
  
  // Success state
  const [success, setSuccess] = useState<boolean>(false);
  
  // Update form data when defaultPeriod changes
  useEffect(() => {
    setFormData(prev => ({ ...prev, period: defaultPeriod }));
  }, [defaultPeriod]);
  
  // Fetch reference data
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Fetch all necessary data
        const timeSlotsResponse = await fetch('/api/timeslots');
        const kelasResponse = await fetch('/api/kelas');
        const dosenResponse = await fetch('/api/dosen');
        const mataKuliahResponse = await fetch('/api/matkul');
        const prodiResponse = await fetch('/api/prodi');
        
        const timeSlotsData: TimeSlot[] = await timeSlotsResponse.json();
        const kelasData: Kelas[] = await kelasResponse.json();
        const dosenData: Dosen[] = await dosenResponse.json();
        const mataKuliahData: MataKuliah[] = await mataKuliahResponse.json();
        const prodiData: Prodi[] = await prodiResponse.json();
        
        setTimeSlots(timeSlotsData);
        setKelas(kelasData);
        setDosen(dosenData);
        setMataKuliah(mataKuliahData);
        setProdi(prodiData);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);
  
  // Update available days based on period
  useEffect(() => {
    const fetchDays = async () => {
      try {
        let days: string[];
        if (formData.period === 'SORE') {
          days = ['SENIN', 'SELASA', 'RABU', 'KAMIS', 'JUMAT', 'SABTU'];
        } else {
          days = ['SENIN', 'SELASA', 'RABU', 'KAMIS', 'JUMAT'];
        }
        
        setAvailableDays(days);
        
        // Reset day selection if it's not available in the new period
        if (formData.hari && !days.includes(formData.hari)) {
          setFormData(prev => ({ ...prev, hari: '' }));
        }
      } catch (error) {
        console.error('Error setting days:', error);
      }
    };
    
    fetchDays();
  }, [formData.period, formData.hari]);
  
  // Filter mata kuliah based on prodi
  useEffect(() => {
    if (formData.prodi_id) {
      const filtered = mataKuliah.filter(mk => mk.prodi_id === formData.prodi_id);
      setFilteredMataKuliah(filtered);
    } else {
      setFilteredMataKuliah([]);
    }
  }, [formData.prodi_id, mataKuliah]);
  
  // Filter kelas based on period
  useEffect(() => {
    const filtered = kelas.filter(k => k.period === formData.period);
    setFilteredKelas(filtered);
    
    // Reset kelas selection if it's not available in the new period
    if (formData.kelas_id) {
      const stillValid = filtered.some(k => k.id === formData.kelas_id);
      if (!stillValid) {
        setFormData(prev => ({ ...prev, kelas_id: '' }));
      }
    }
  }, [formData.period, kelas, formData.kelas_id]);
  
  // Filter time slots based on period and day
  useEffect(() => {
    let filtered = timeSlots.filter(ts => ts.period === formData.period);
    
    // For sore period, filter time slots based on day
    if (formData.period === 'SORE' && formData.hari) {
      if (formData.hari === 'SABTU') {
        // Only Saturday-specific slots
        filtered = filtered.filter(ts => ts.day_specific === true);
      } else {
        // Only evening slots for weekdays
        filtered = filtered.filter(ts => ts.day_specific !== true);
      }
    }
    
    setFilteredTimeSlots(filtered);
    
    // Reset time slot selection if it's not available in the new period/day
    if (formData.time_slot_id) {
      const stillValid = filtered.some(ts => ts.id === formData.time_slot_id);
      if (!stillValid) {
        setFormData(prev => ({ ...prev, time_slot_id: '' }));
      }
    }
  }, [formData.period, formData.hari, timeSlots, formData.time_slot_id]);
  
  // Handle input changes
  const handleChange = (field: keyof FormData, value: string): void => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Reset conflict state when form changes
    if (conflict.hasConflict) {
      setConflict({ hasConflict: false, message: '', type: 'none' });
    }
    
    // Reset success message when form changes
    if (success) {
      setSuccess(false);
    }
  };
  
  // Check for scheduling conflicts
  const checkConflicts = async (): Promise<void> => {
    if (!formData.dosen_id || !formData.hari || !formData.time_slot_id || 
        !formData.kelas_id || !formData.mata_kuliah_id) {
      return;
    }
    
    setChecking(true);
    
    try {
      const response = await fetch('/api/jadwal/check-conflict', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          dosen_id: formData.dosen_id,
          kelas_id: formData.kelas_id,
          hari: formData.hari,
          time_slot_id: formData.time_slot_id,
          period: formData.period
        }),
      });
      
      const data: ConflictResponse = await response.json();
      
      if (data.conflicts.length > 0) {
        const conflictData = data.conflicts[0];
        let message = '';
        let type: 'dosen' | 'kelas' = 'dosen';
        
        if (conflictData.type === 'dosen') {
          const dosenInfo = data.entities.dosen.find(d => d.id === formData.dosen_id);
          if (dosenInfo) {
            message = `Dosen ${dosenInfo.nama} (${dosenInfo.kode}) sudah dijadwalkan pada hari dan jam yang sama di kelas ${conflictData.kelas_nama}`;
            type = 'dosen';
          }
        } else if (conflictData.type === 'kelas') {
          const kelasInfo = data.entities.kelas.find(k => k.id === formData.kelas_id);
          if (kelasInfo) {
            message = `Kelas ${kelasInfo.nama} sudah dijadwalkan dengan dosen ${conflictData.dosen_nama} (${conflictData.dosen_kode}) pada hari dan jam yang sama`;
            type = 'kelas';
          }
        }
        
        setConflict({
          hasConflict: true,
          message,
          type
        });
      } else {
        setConflict({
          hasConflict: false,
          message: '',
          type: 'none'
        });
      }
    } catch (error) {
      console.error('Error checking conflicts:', error);
    } finally {
      setChecking(false);
    }
  };
  
  // Effect to check conflicts when relevant form fields change
  useEffect(() => {
    if (formData.dosen_id && formData.hari && formData.time_slot_id && formData.kelas_id) {
      const timer = setTimeout(() => {
        checkConflicts();
      }, 500); // Debounce
      
      return () => clearTimeout(timer);
    }
  }, [formData.dosen_id, formData.hari, formData.time_slot_id, formData.kelas_id]);
  
  // Submit the form
  const handleSubmit = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();
    
    if (conflict.hasConflict) {
      return;
    }
    
    try {
      const response = await fetch('/api/jadwal', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });
      
      if (!response.ok) throw new Error('Failed to save jadwal');
      
      // Reset form but keep period and prodi
      setFormData({
        dosen_id: '',
        mata_kuliah_id: '',
        kelas_id: '',
        hari: '',
        time_slot_id: '',
        prodi_id: formData.prodi_id,
        period: formData.period,
      });
      
      // Show success message
      setSuccess(true);
      
      // Call onSuccess callback if provided
      if (onSuccess) {
        setTimeout(() => {
          onSuccess();
        }, 1500); // Give user time to see success message
      } else {
        // Hide success message after 3 seconds if no callback
        setTimeout(() => {
          setSuccess(false);
        }, 3000);
      }
    } catch (error) {
      console.error('Error saving jadwal:', error);
    }
  };
  
  if (loading) {
    return <div className="p-4">Loading...</div>;
  }
  
  return (
    <div className="p-4">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          {/* Period selection */}
          <div className="space-y-2">
            <Label htmlFor="period">Periode</Label>
            <Select 
              value={formData.period} 
              onValueChange={(value) => handleChange('period', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Pilih Periode" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="PAGI">Pagi</SelectItem>
                <SelectItem value="SIANG">Siang</SelectItem>
                <SelectItem value="SORE">Sore</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          {/* Program Study */}
          <div className="space-y-2">
            <Label htmlFor="prodi">Program Studi</Label>
            <Select 
              value={formData.prodi_id} 
              onValueChange={(value) => handleChange('prodi_id', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Pilih Program Studi" />
              </SelectTrigger>
              <SelectContent>
                {prodi.map(p => (
                  <SelectItem key={p.id} value={p.id}>{p.nama}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          {/* Mata Kuliah */}
          <div className="space-y-2">
            <Label htmlFor="mata_kuliah">Mata Kuliah</Label>
            <Select 
              value={formData.mata_kuliah_id} 
              onValueChange={(value) => handleChange('mata_kuliah_id', value)}
              disabled={filteredMataKuliah.length === 0}
            >
              <SelectTrigger>
                <SelectValue placeholder="Pilih Mata Kuliah" />
              </SelectTrigger>
              <SelectContent>
                {filteredMataKuliah.map(mk => (
                  <SelectItem key={mk.id} value={mk.id}>{mk.kode} - {mk.nama}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          {/* Dosen */}
          <div className="space-y-2">
            <Label htmlFor="dosen">Dosen</Label>
            <Select 
              value={formData.dosen_id} 
              onValueChange={(value) => handleChange('dosen_id', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Pilih Dosen" />
              </SelectTrigger>
              <SelectContent>
                {dosen.map(d => (
                  <SelectItem key={d.id} value={d.id}>{d.kode} - {d.nama}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          {/* Kelas */}
          <div className="space-y-2">
            <Label htmlFor="kelas">Kelas</Label>
            <Select 
              value={formData.kelas_id} 
              onValueChange={(value) => handleChange('kelas_id', value)}
              disabled={filteredKelas.length === 0}
            >
              <SelectTrigger>
                <SelectValue placeholder="Pilih Kelas" />
              </SelectTrigger>
              <SelectContent>
                {filteredKelas.map(k => (
                  <SelectItem key={k.id} value={k.id}>{k.nama}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          {/* Hari */}
          <div className="space-y-2">
            <Label htmlFor="hari">Hari</Label>
            <Select 
              value={formData.hari} 
              onValueChange={(value) => handleChange('hari', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Pilih Hari" />
              </SelectTrigger>
              <SelectContent>
                {availableDays.map(day => (
                  <SelectItem key={day} value={day}>
                    {day.charAt(0) + day.slice(1).toLowerCase()}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          {/* Time Slot */}
          <div className="space-y-2">
            <Label htmlFor="time_slot">Jam</Label>
            <Select 
              value={formData.time_slot_id} 
              onValueChange={(value) => handleChange('time_slot_id', value)}
              disabled={filteredTimeSlots.length === 0 || !formData.hari}
            >
              <SelectTrigger>
                <SelectValue placeholder="Pilih Jam" />
              </SelectTrigger>
              <SelectContent>
                {filteredTimeSlots.map(ts => (
                  <SelectItem key={ts.id} value={ts.id}>{ts.display_text}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        
        {conflict.hasConflict && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Konflik Jadwal!</AlertTitle>
            <AlertDescription>{conflict.message}</AlertDescription>
          </Alert>
        )}
        
        {success && (
          <Alert className="bg-green-50 border-green-200">
            <CheckCircle className="h-4 w-4 text-green-500" />
            <AlertTitle>Berhasil!</AlertTitle>
            <AlertDescription>Jadwal berhasil ditambahkan.</AlertDescription>
          </Alert>
        )}
        
        <div className="mt-4">
          <Button 
            type="submit" 
            onClick={handleSubmit}
            disabled={
              conflict.hasConflict || 
              checking || 
              !formData.dosen_id || 
              !formData.mata_kuliah_id || 
              !formData.kelas_id || 
              !formData.hari || 
              !formData.time_slot_id
            }
            className="w-full"
          >
            {checking ? 'Memeriksa Konflik...' : 'Simpan Jadwal'}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default JadwalForm;