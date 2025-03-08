interface User {
  id: string;
  nama: string;
  username: string;
  password: string;
}


interface TimeSlot {
  id: string;
  display_text: string;
  period: string;
  day_specific: boolean;
  start_time: string;
  end_time: string;
  group?: number;
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
  semester: number
}

interface Prodi {
  id: string;
  nama: string;
}

interface Jadwal {
  dosen_id: string;
  mata_kuliah_id: string;
  kelas_id: string;
  hari: string;
  time_slot_ids: string[]; // Changed to array for multiple selections
  period: string;
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

interface JadwalEditFormProps {
  jadwal: JadwalEntry;
  onSuccess?: () => void;
}

interface JadwalFormProps {
    defaultPeriod?: string;
    onSuccess?: () => void;
  }

interface FormData {
  id: string;
  dosen_id: string;
  mata_kuliah_id: string;
  kelas_id: string;
  hari: string;
  time_slot_id: string;
  period: string;
  prodi_id: string;
}

interface ConflictCheck {
  hasConflict: boolean;
  message: string;
  type: "dosen" | "kelas" | "none";
}

interface ConflictData {
  type: "dosen" | "kelas";
  jadwal_id: string;
  time_slot_id: string;
  kelas_id?: string;
  kelas_nama?: string;
  dosen_id?: string;
  dosen_nama?: string;
  dosen_kode?: string;
}

interface ConflictResponse {
  conflicts: ConflictData[];
  entities: {
    dosen: Dosen[];
    kelas: Kelas[];
    time_slots: TimeSlot[];
  };
}



export type {User, TimeSlot, Jadwal, Kelas, Dosen, MataKuliah, Prodi, JadwalEntry, JadwalEditFormProps, ConflictCheck, ConflictData, ConflictResponse, FormData, JadwalFormProps}