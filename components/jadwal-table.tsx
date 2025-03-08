"use client"

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Download, AlertTriangle, Plus, Pencil, Trash2 } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle
} from "@/components/ui/alert-dialog";
import JadwalForm from '@/components/jadwal-form';
import JadwalEditForm, { JadwalEntry } from '@/components/jadwal-edit-form';

// Define proper TypeScript interfaces for our data if not already imported
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

const JadwalTable: React.FC = () => {
  const [selectedPeriod, setSelectedPeriod] = useState<string>('PAGI');
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([]);
  const [kelas, setKelas] = useState<Kelas[]>([]);
  const [jadwal, setJadwal] = useState<JadwalEntry[]>([]);
  const [availableDays, setAvailableDays] = useState<string[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [addDialogOpen, setAddDialogOpen] = useState<boolean>(false);
  const [editDialogOpen, setEditDialogOpen] = useState<boolean>(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState<boolean>(false);
  const [selectedJadwal, setSelectedJadwal] = useState<JadwalEntry | null>(null);
  
  // Set default days for each period
  const getDefaultDays = (period: string): string[] => {
    return period === 'SORE' 
      ? ['SENIN', 'SELASA', 'RABU', 'KAMIS', 'JUMAT', 'SABTU'] 
      : ['SENIN', 'SELASA', 'RABU', 'KAMIS', 'JUMAT'];
  };
  
  // Define time slot groups (before/after break)
  const getGroupedTimeSlots = (slots: TimeSlot[]): {beforeBreak: TimeSlot[], afterBreak: TimeSlot[]} => {
    const beforeBreak: TimeSlot[] = [];
    const afterBreak: TimeSlot[] = [];
    
    slots.forEach(slot => {
      // In your schema, the break comes after 08:40-09:30
      // So we need to identify which time slots are before/after this break point
      const isBeforeBreak = slot.display_text === '08.40-09.30' || 
                           slot.display_text === '07.00-07.50' || 
                           slot.display_text === '07.50-08.40';
      
      if (isBeforeBreak) {
        beforeBreak.push(slot);
      } else {
        afterBreak.push(slot);
      }
    });
    
    // Sort each group by start time
    beforeBreak.sort((a, b) => a.start_time.localeCompare(b.start_time));
    afterBreak.sort((a, b) => a.start_time.localeCompare(b.start_time));
    
    return { beforeBreak, afterBreak };
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
      
      let timeSlotsData: TimeSlot[] = [];
      try {
        const timeSlotText = await timeSlotsResponse.text();
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
  
  // Handle edit jadwal
  const handleEditJadwal = (jadwalEntry: JadwalEntry) => {
    setSelectedJadwal(jadwalEntry);
    setEditDialogOpen(true);
  };
  
  // Handle delete jadwal
  const handleDeleteConfirm = (jadwalEntry: JadwalEntry) => {
    setSelectedJadwal(jadwalEntry);
    setDeleteDialogOpen(true);
  };
  
  // Perform actual delete
  const performDelete = async () => {
    if (!selectedJadwal) return;
    
    try {
      const response = await fetch(`/api/jadwal/${selectedJadwal.id}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        throw new Error('Failed to delete jadwal');
      }
      
      // Refresh data and close dialog
      fetchData();
      setDeleteDialogOpen(false);
      setSelectedJadwal(null);
    } catch (error) {
      console.error('Error deleting jadwal:', error);
      setError('Failed to delete jadwal. Check console for details.');
    }
  };
  
  // Function to render a cell's content with action buttons
  const renderCell = (day: string, timeSlot: TimeSlot, kelasItem: Kelas): React.ReactNode => {
    const entry = getJadwalForCell(day, timeSlot.id, kelasItem.id);
    
    if (!entry) return null;
    
    return (
      <div className="text-xs p-1 group relative">
        <div className="font-bold">{entry.mata_kuliah.kode}/{entry.dosen.kode}</div>
        
        {/* Action buttons - visible on hover */}
        <div className="absolute top-0 right-0 opacity-0 group-hover:opacity-100 transition-opacity">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-6 w-6">
                <svg width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M8.625 2.5C8.625 3.12132 8.12132 3.625 7.5 3.625C6.87868 3.625 6.375 3.12132 6.375 2.5C6.375 1.87868 6.87868 1.375 7.5 1.375C8.12132 1.375 8.625 1.87868 8.625 2.5ZM8.625 7.5C8.625 8.12132 8.12132 8.625 7.5 8.625C6.87868 8.625 6.375 8.12132 6.375 7.5C6.375 6.87868 6.87868 6.375 7.5 6.375C8.12132 6.375 8.625 6.87868 8.625 7.5ZM7.5 13.625C8.12132 13.625 8.625 13.1213 8.625 12.5C8.625 11.8787 8.12132 11.375 7.5 11.375C6.87868 11.375 6.375 11.8787 6.375 12.5C6.375 13.1213 6.87868 13.625 7.5 13.625Z" fill="currentColor" fillRule="evenodd" clipRule="evenodd"></path>
                </svg>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => handleEditJadwal(entry)}>
                <Pencil className="h-4 w-4 mr-2" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={() => handleDeleteConfirm(entry)}
                className="text-red-600"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
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
    // Close the dialogs
    setAddDialogOpen(false);
    setEditDialogOpen(false);
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
  
  // Group time slots for breaks
  const { beforeBreak, afterBreak } = getGroupedTimeSlots(timeSlots);
  
  // Calculate the total number of columns (HARI/JAM column + each kelas column)
  const totalColumns = kelas.length + 1;
  
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
          <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
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
            <Button onClick={() => {}}>Initialize Time Slots</Button>
          </div>
        ) : kelas.length === 0 ? (
          <div className="p-8 text-center">
            <p>No classrooms found for this period. Please add classrooms first.</p>
          </div>
        ) : (
          <table className="w-full border-collapse border border-gray-300">
            <thead>
              <tr className="bg-gray-100">
                <th rowSpan={2} className="border border-gray-300 p-2">HARI/JAM</th>
                <th colSpan={kelas.length} className="border border-gray-300 p-2">KELAS/KODE MATA KULIAH/ KODE DOSEN</th>
              </tr>
              <tr>
              {kelas.map(k => (
                  <th key={k.id} className="border border-gray-300 p-2 text-center">{k.nama}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {availableDays.map((day, dayIndex) => (
                <React.Fragment key={day}>
                  {/* Day header row spanning all columns */}
                  <tr className="bg-blue-50">
                    <td 
                      colSpan={totalColumns}
                      className="border border-gray-300 p-2 font-bold text-center"
                    >
                      {day}
                    </td>
                  </tr>
                  
                  {/* Morning sessions (before break) */}
                  {beforeBreak.map((timeSlot) => (
                    <tr key={`${day}-${timeSlot.id}`} className="bg-gray-50">
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
                  ))}
                  
                  {/* BREAK row */}
                  {(beforeBreak.length > 0 && afterBreak.length > 0) && (
                    <tr className="bg-gray-200">
                      <td 
                        colSpan={totalColumns} 
                        className="border border-gray-300 p-2 text-center font-bold"
                      >
                        BREAK
                      </td>
                    </tr>
                  )}
                  
                  {/* Afternoon sessions (after break) */}
                  {afterBreak.map((timeSlot) => (
                    <tr key={`${day}-${timeSlot.id}`} className="bg-gray-50">
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
                  ))}
                  
                  {/* Add a separator between days, except for the last day */}
                  {dayIndex < availableDays.length - 1 && (
                    <tr className="h-4">
                      <td colSpan={totalColumns} className="border-0"></td>
                    </tr>
                  )}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        )}
      </CardContent>
      
      {/* Edit Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Edit Jadwal</DialogTitle>
          </DialogHeader>
          {selectedJadwal && (
            <JadwalEditForm 
              jadwal={selectedJadwal}
              onSuccess={handleFormSuccess}
            />
          )}
        </DialogContent>
      </Dialog>
      
      {/* Delete Confirmation Dialog */}
      <AlertDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Konfirmasi Hapus Jadwal</AlertDialogTitle>
            <AlertDialogDescription>
              Apakah Anda yakin ingin menghapus jadwal ini?
              {selectedJadwal && (
                <div className="mt-2 p-2 bg-gray-100 rounded">
                  <p><strong>Dosen:</strong> {selectedJadwal.dosen.nama} ({selectedJadwal.dosen.kode})</p>
                  <p><strong>Mata Kuliah:</strong> {selectedJadwal.mata_kuliah.nama} ({selectedJadwal.mata_kuliah.kode})</p>
                  <p><strong>Kelas:</strong> {selectedJadwal.kelas.nama}</p>
                  <p><strong>Waktu:</strong> {selectedJadwal.hari}, {selectedJadwal.time_slot.display_text}</p>
                </div>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction onClick={performDelete} className="bg-red-600 hover:bg-red-700">
              Hapus
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  );
};

export default JadwalTable;