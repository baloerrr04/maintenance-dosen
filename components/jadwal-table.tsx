"use client"

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Download, AlertTriangle, Plus } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import JadwalForm from '@/components/jadwal-form';

// Define proper TypeScript interfaces for our data
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

interface JadwalEntry {
  id: string;
  dosen_id: string;
  mata_kuliah_id: string;
  kelas_id: string;
  time_slot_id: string;
  hari: string;
  period: string;
  dosen: Dosen;
  mata_kuliah: MataKuliah;
  kelas: Kelas;
  time_slot: TimeSlot;
}

const JadwalTable: React.FC = () => {
  const [selectedPeriod, setSelectedPeriod] = useState<string>('PAGI');
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([]);
  const [kelas, setKelas] = useState<Kelas[]>([]);
  const [jadwal, setJadwal] = useState<JadwalEntry[]>([]);
  const [availableDays, setAvailableDays] = useState<string[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState<boolean>(false);
  
  // Set default days for each period
  const getDefaultDays = (period: string): string[] => {
    return period === 'SORE' 
      ? ['SENIN', 'SELASA', 'RABU', 'KAMIS', 'JUMAT', 'SABTU'] 
      : ['SENIN', 'SELASA', 'RABU', 'KAMIS', 'JUMAT'];
  };
  
  // Seed function - only use this once to populate your database
  const seedTimeSlots = async () => {
    try {
      const response = await fetch('/api/timeslots', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'seed',
          clear: true
        }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to seed time slots');
      }
      
      const result = await response.json();
      console.log(result.message);
      
      // Refresh the data
      fetchData();
    } catch (error) {
      console.error('Error seeding time slots:', error);
      setError('Failed to seed time slots. Check console for details.');
    }
  };
  
  // Fetch data function
  const fetchData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Fetch time slots
      const timeSlotsResponse = await fetch(`/api/timeslots?period=${selectedPeriod}`);
      if (!timeSlotsResponse.ok) {
        throw new Error(`Failed to fetch time slots: ${timeSlotsResponse.status} ${timeSlotsResponse.statusText}`);
      }
      
      // Get response text first to debug
      const timeSlotText = await timeSlotsResponse.text();
      console.log('Time slots response:', timeSlotText);
      
      // Parse JSON if possible
      let timeSlotsData: TimeSlot[] = [];
      try {
        timeSlotsData = JSON.parse(timeSlotText);
      } catch (e) {
        console.error('Failed to parse time slots JSON:', e);
        throw new Error('Invalid JSON response from time slots API');
      }
      
      // If we have no time slots, we might need to seed the database
      if (timeSlotsData.length === 0) {
        console.warn('No time slots found. You might need to seed the database.');
      }
      
      // Fetch kelas (classrooms)
      const kelasResponse = await fetch(`/api/kelas?period=${selectedPeriod}`);
      if (!kelasResponse.ok) {
        throw new Error(`Failed to fetch kelas: ${kelasResponse.status} ${kelasResponse.statusText}`);
      }
      
      const kelasData: Kelas[] = await kelasResponse.json();
      
      // Fetch jadwal entries
      const jadwalResponse = await fetch(`/api/jadwal?period=${selectedPeriod}`);
      if (!jadwalResponse.ok) {
        throw new Error(`Failed to fetch jadwal: ${jadwalResponse.status} ${jadwalResponse.statusText}`);
      }
      
      const jadwalData: JadwalEntry[] = await jadwalResponse.json();
      
      // Use default days based on period
      const daysData = getDefaultDays(selectedPeriod);
      
      setTimeSlots(timeSlotsData);
      setKelas(kelasData);
      setJadwal(jadwalData);
      setAvailableDays(daysData);
    } catch (error: any) {
      console.error('Error fetching data:', error);
      setError(error.message || 'Failed to fetch data. Check console for details.');
    } finally {
      setLoading(false);
    }
  };
  
  // Fetch data on component mount and when period changes
  useEffect(() => {
    fetchData();
  }, [selectedPeriod]);
  
  // Function to get jadwal entry for a specific cell
  const getJadwalForCell = (day: string, timeSlotId: string, kelasId: string): JadwalEntry | undefined => {
    return jadwal.find(entry => 
      entry.hari === day && 
      entry.time_slot.id === timeSlotId && 
      entry.kelas.id === kelasId
    );
  };
  
  // Function to render a cell's content
  const renderCell = (day: string, timeSlot: TimeSlot, kelasItem: Kelas): React.ReactNode => {
    const entry = getJadwalForCell(day, timeSlot.id, kelasItem.id);
    
    if (!entry) return null;
    
    return (
      <div className="text-xs p-1">
        <div className="font-bold">{entry.mata_kuliah.kode}/{entry.dosen.kode}</div>
      </div>
    );
  };
  
  // Function to export to Excel
  const exportToExcel = async (): Promise<void> => {
    try {
      const response = await fetch(`/api/export?period=${selectedPeriod}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) throw new Error('Export failed');
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `jadwal_${selectedPeriod.toLowerCase()}.xlsx`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error exporting to Excel:', error);
      setError('Failed to export to Excel. Check console for details.');
    }
  };

  // Handle successful form submission
  const handleFormSuccess = () => {
    // Close the dialog
    setDialogOpen(false);
    // Refresh data
    fetchData();
  };
  
  // Show loading indicator while data is being fetched
  if (loading) {
    return <div className="p-4">Loading...</div>;
  }
  
  // Get period title for display
  const getPeriodTitle = (): string => {
    switch(selectedPeriod) {
      case 'PAGI': return 'Jadwal Perkuliahan Pagi';
      case 'SIANG': return 'Jadwal Perkuliahan Siang';
      case 'SORE': return 'Jadwal Perkuliahan Sore';
      default: return 'Jadwal Perkuliahan';
    }
  };
  
  // Function to filter time slots based on day and period
  const filterTimeSlotsByDay = (day: string, allTimeSlots: TimeSlot[]): TimeSlot[] => {
    if (selectedPeriod === 'SORE') {
      if (day === 'SABTU') {
        // Saturday-specific slots for evening schedule
        return allTimeSlots.filter(ts => ts.day_specific);
      } else {
        // Weekday slots for evening schedule
        return allTimeSlots.filter(ts => !ts.day_specific);
      }
    }
    // For morning and afternoon, all slots apply
    return allTimeSlots;
  };
  
  return (
    <Card className="w-full">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>{getPeriodTitle()}</CardTitle>
        <div className="flex space-x-2">
          <Select 
            value={selectedPeriod} 
            onValueChange={(value) => setSelectedPeriod(value)}
          >
            <SelectTrigger className="w-32">
              <SelectValue placeholder="Period" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="PAGI">Pagi</SelectItem>
              <SelectItem value="SIANG">Siang</SelectItem>
              <SelectItem value="SORE">Sore</SelectItem>
            </SelectContent>
          </Select>
          
          {/* Add Schedule Button with Dialog */}
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button className="flex items-center gap-2">
                <Plus size={16} />
                Tambah Jadwal
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl">
              <DialogHeader>
                <DialogTitle>Tambah Jadwal Baru</DialogTitle>
              </DialogHeader>
              <JadwalForm 
                defaultPeriod={selectedPeriod} 
                onSuccess={handleFormSuccess} 
              />
            </DialogContent>
          </Dialog>
          
          <Button onClick={exportToExcel} className="flex items-center gap-2">
            <Download size={16} />
            Export Excel
          </Button>
          
          {/* Only show this during development */}
          {process.env.NODE_ENV === 'development' && (
            <Button onClick={seedTimeSlots} variant="outline">
              Seed TimeSlots
            </Button>
          )}
        </div>
      </CardHeader>
      
      <CardContent className="overflow-x-auto">
        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        
        {timeSlots.length === 0 ? (
          <div className="p-8 text-center">
            <p className="mb-4">No time slots found for this period.</p>
            <Button onClick={seedTimeSlots}>Initialize Time Slots</Button>
          </div>
        ) : kelas.length === 0 ? (
          <div className="p-8 text-center">
            <p>No classrooms found for this period. Please add classrooms first.</p>
          </div>
        ) : (
          <table className="w-full border-collapse border border-gray-300">
            <thead>
              <tr className="bg-gray-100">
                <th colSpan={2} className="border border-gray-300 p-2">HARI/JAM</th>
                {kelas.map(k => (
                  <th key={k.id} className="border border-gray-300 p-2 text-center">{k.nama}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {availableDays.map(day => {
                const dayTimeSlots = filterTimeSlotsByDay(day, timeSlots);
                
                return dayTimeSlots.map((timeSlot, timeIdx) => (
                  <tr key={`${day}-${timeSlot.id}`} className={timeIdx % 2 === 0 ? 'bg-gray-50' : ''}>
                    {timeIdx === 0 && (
                      <td 
                        rowSpan={dayTimeSlots.length} 
                        className="border border-gray-300 p-2 font-bold text-center align-middle"
                      >
                        {day}
                      </td>
                    )}
                    <td className="border border-gray-300 p-2 text-center whitespace-nowrap">
                      {timeSlot.display_text}
                    </td>
                    {kelas.map(k => (
                      <td 
                        key={`${day}-${timeSlot.id}-${k.id}`} 
                        className="border border-gray-300 p-2 text-center min-w-20"
                      >
                        {renderCell(day, timeSlot, k)}
                      </td>
                    ))}
                  </tr>
                ));
              })}
            </tbody>
          </table>
        )}
      </CardContent>
    </Card>
  );
};

export default JadwalTable;