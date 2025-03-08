"use client"

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { CheckCircle } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';
import { Dosen, Kelas, MataKuliah, TimeSlot, JadwalFormProps, Prodi } from "@/types/jadwal"

interface FormData {
  dosen_id: string;
  mata_kuliah_id: string;
  kelas_id: string;
  hari: string;
  time_slot_ids: string[]; // Changed to array for multiple selections
  prodi_id: string;
  period: string;
}

interface ConflictCheck {
  hasConflict: boolean;
  message: string;
  type: 'dosen' | 'kelas' | 'none';
  timeSlotId?: string; // Add the specific time slot that has a conflict
}

interface ConflictResponse {
  conflicts: Array<{
    type: 'dosen' | 'kelas';
    jadwal_id: string;
    time_slot_id: string;
    kelas_id?: string;
    kelas_nama?: string;
    dosen_id?: string;
    dosen_nama?: string;
    dosen_kode?: string;
  }>;
  entities: {
    dosen: Dosen[];
    kelas: Kelas[];
    time_slots: TimeSlot[];
  };
}

interface ConflictData {
    type: 'dosen' | 'kelas';
    jadwal_id: string;
    time_slot_id: string;
    kelas_id?: string;
    kelas_nama?: string;
    dosen_id?: string;
    dosen_nama?: string;
    dosen_kode?: string;
  }
  
  // Define the shape of the conflict response
  interface ConflictResponse {
    conflicts: ConflictData[];
    entities: {
      dosen: Dosen[];
      kelas: Kelas[];
      time_slots: TimeSlot[];
    };
  }

const JadwalForm: React.FC<JadwalFormProps> = ({ defaultPeriod = 'PAGI', onSuccess }) => {
  const [formData, setFormData] = useState<FormData>({
    dosen_id: '',
    mata_kuliah_id: '',
    kelas_id: '',
    hari: '',
    time_slot_ids: [], // Changed to array for multiple selections
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
  const [conflicts, setConflicts] = useState<ConflictCheck[]>([]); 
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
    
    // Sort by start_time to ensure they appear in chronological order
    filtered.sort((a, b) => {
      return a.start_time.localeCompare(b.start_time);
    });
    
    setFilteredTimeSlots(filtered);
    
    // Reset time slot selections that are no longer valid
    const validTimeSlotIds = filtered.map(ts => ts.id);
    const stillValidIds = formData.time_slot_ids.filter(id => validTimeSlotIds.includes(id));
    
    if (stillValidIds.length !== formData.time_slot_ids.length) {
      setFormData(prev => ({ ...prev, time_slot_ids: stillValidIds }));
    }
  }, [formData.period, formData.hari, timeSlots, formData.time_slot_ids]);
  
  // Handle input changes for single-value fields
  const handleChange = (field: keyof Omit<FormData, 'time_slot_ids'>, value: string): void => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Reset conflicts when form changes
    if (conflicts.length > 0) {
      setConflicts([]);
    }
    
    // Reset success message when form changes
    if (success) {
      setSuccess(false);
    }
    
    // Clear time slot selections when changing day or period
    if (field === 'hari' || field === 'period') {
      setFormData(prev => ({ ...prev, time_slot_ids: [] }));
    }
  };
  
  // Handle time slot selection/deselection
  const handleTimeSlotToggle = (timeSlotId: string): void => {
    setFormData(prev => {
      const currentSelections = [...prev.time_slot_ids];
      
      if (currentSelections.includes(timeSlotId)) {
        // Remove if already selected
        return {
          ...prev,
          time_slot_ids: currentSelections.filter(id => id !== timeSlotId)
        };
      } else {
        // Add if not selected
        return {
          ...prev,
          time_slot_ids: [...currentSelections, timeSlotId]
        };
      }
    });
    
    // Reset conflicts
    if (conflicts.length > 0) {
      setConflicts([]);
    }
    
    // Reset success message
    if (success) {
      setSuccess(false);
    }
  };
  
  // Check for scheduling conflicts
  const checkConflicts = async (): Promise<void> => {
    if (!formData.dosen_id || !formData.hari || formData.time_slot_ids.length === 0 || 
        !formData.kelas_id || !formData.mata_kuliah_id) {
      return;
    }
    
    setChecking(true);
    
    try {
      const response = await fetch('/api/jadwal/check-conflict-multi', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          dosen_id: formData.dosen_id,
          kelas_id: formData.kelas_id,
          hari: formData.hari,
          time_slot_ids: formData.time_slot_ids,
          period: formData.period
        }),
      });
      
      const data: ConflictResponse = await response.json();
      
      if (data.conflicts && data.conflicts.length > 0) {
        // Process conflicts with proper typing
        const newConflicts: ConflictCheck[] = data.conflicts.map((conflict: ConflictData) => {
          let message = '';
          let type: 'dosen' | 'kelas' = conflict.type;
          
          // Find the time slot info
          const timeSlot = data.entities.time_slots.find(ts => ts.id === conflict.time_slot_id);
          const timeSlotDisplay = timeSlot ? timeSlot.display_text : 'unknown time';
          
          if (conflict.type === 'dosen') {
            const dosenInfo = data.entities.dosen.find(d => d.id === formData.dosen_id);
            message = `Dosen ${dosenInfo?.nama} (${dosenInfo?.kode}) sudah dijadwalkan pada hari ${formData.hari} jam ${timeSlotDisplay} di kelas ${conflict.kelas_nama}`;
          } else if (conflict.type === 'kelas') {
            const kelasInfo = data.entities.kelas.find(k => k.id === formData.kelas_id);
            message = `Kelas ${kelasInfo?.nama} sudah dijadwalkan dengan dosen ${conflict.dosen_nama} (${conflict.dosen_kode}) pada hari ${formData.hari} jam ${timeSlotDisplay}`;
          }
          
          return {
            hasConflict: true,
            message,
            type,
            timeSlotId: conflict.time_slot_id
          };
        });
        
        setConflicts(newConflicts);
      } else {
        setConflicts([]);
      }
    } catch (error) {
      console.error('Error checking conflicts:', error);
    } finally {
      setChecking(false);
    }
  };
  
  // Effect to check conflicts when relevant form fields change
  useEffect(() => {
    if (formData.dosen_id && formData.hari && formData.time_slot_ids.length > 0 && formData.kelas_id) {
      const timer = setTimeout(() => {
        checkConflicts();
      }, 500); // Debounce
      
      return () => clearTimeout(timer);
    }
  }, [formData.dosen_id, formData.hari, formData.time_slot_ids, formData.kelas_id]);
  
  // Submit the form
  const handleSubmit = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();
    
    if (conflicts.length > 0) {
      return;
    }
    
    if (formData.time_slot_ids.length === 0) {
      return;
    }
    
    try {
      // Create a batch request to add multiple jadwal entries
      const response = await fetch('/api/jadwal/batch', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          dosen_id: formData.dosen_id,
          mata_kuliah_id: formData.mata_kuliah_id,
          kelas_id: formData.kelas_id,
          hari: formData.hari,
          time_slot_ids: formData.time_slot_ids,
          period: formData.period
        }),
      });
      
      if (!response.ok) throw new Error('Failed to save jadwal');
      
      // Reset form but keep period and prodi
      setFormData({
        dosen_id: '',
        mata_kuliah_id: '',
        kelas_id: '',
        hari: '',
        time_slot_ids: [],
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
  
  // Get time slot display name
  const getTimeSlotName = (id: string): string => {
    const timeSlot = timeSlots.find(ts => ts.id === id);
    return timeSlot ? timeSlot.display_text : '';
  };
  
  // Check if a specific time slot has conflicts
  const hasConflictForTimeSlot = (timeSlotId: string): boolean => {
    return conflicts.some(conflict => conflict.timeSlotId === timeSlotId);
  };
  
  // Get conflict message for a specific time slot
  const getConflictMessage = (timeSlotId: string): string => {
    const conflict = conflicts.find(c => c.timeSlotId === timeSlotId);
    return conflict ? conflict.message : '';
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
        </div>
        
        {/* Multiple Time Slots Selection */}
        {formData.hari && (
          <div className="space-y-2 mt-4">
            <Label htmlFor="time_slots">Jam (Pilih satu atau lebih)</Label>
            <div className="grid grid-cols-2 gap-2 border rounded-md p-3">
              {filteredTimeSlots.map((timeSlot) => {
                const isChecked = formData.time_slot_ids.includes(timeSlot.id);
                const hasConflict = hasConflictForTimeSlot(timeSlot.id);
                
                return (
                  <div 
                    key={timeSlot.id} 
                    className={`flex items-center space-x-2 p-2 rounded ${isChecked ? (hasConflict ? 'bg-red-50' : 'bg-blue-50') : ''}`}
                  >
                    <Checkbox 
                      id={`timeSlot-${timeSlot.id}`}
                      checked={isChecked}
                      onCheckedChange={() => handleTimeSlotToggle(timeSlot.id)}
                    />
                    <label 
                      htmlFor={`timeSlot-${timeSlot.id}`}
                      className={`text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 ${hasConflict ? 'text-red-600' : ''}`}
                    >
                      {timeSlot.display_text}
                    </label>
                    
                    {hasConflict && (
                      <div className="text-xs text-red-600 ml-2">
                        {getConflictMessage(timeSlot.id)}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
            
            {/* Selected Time Slots Summary */}
            {formData.time_slot_ids.length > 0 && (
              <div className="bg-gray-50 p-2 rounded-md mt-2">
                <Label className="text-sm">Slot Terpilih: {formData.time_slot_ids.length}</Label>
                <div className="flex flex-wrap gap-1 mt-1">
                  {formData.time_slot_ids.map(id => (
                    <span key={id} className={`px-2 py-1 text-xs rounded ${hasConflictForTimeSlot(id) ? 'bg-red-100 text-red-800' : 'bg-blue-100 text-blue-800'}`}>
                      {getTimeSlotName(id)}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
        
        {/* General success message */}
        {success && (
          <Alert className="bg-green-50 border-green-200">
            <CheckCircle className="h-4 w-4 text-green-500" />
            <AlertTitle>Berhasil!</AlertTitle>
            <AlertDescription>
              {formData.time_slot_ids.length > 1 
                ? `${formData.time_slot_ids.length} jadwal berhasil ditambahkan.` 
                : 'Jadwal berhasil ditambahkan.'
              }
            </AlertDescription>
          </Alert>
        )}
        
        <div className="mt-4">
          <Button 
            type="submit" 
            onClick={handleSubmit}
            disabled={
              conflicts.length > 0 || 
              checking || 
              !formData.dosen_id || 
              !formData.mata_kuliah_id || 
              !formData.kelas_id || 
              !formData.hari || 
              formData.time_slot_ids.length === 0
            }
            className="w-full"
          >
            {checking ? 'Memeriksa Konflik...' : (
              formData.time_slot_ids.length > 1 
                ? `Simpan ${formData.time_slot_ids.length} Jadwal` 
                : 'Simpan Jadwal'
            )}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default JadwalForm;