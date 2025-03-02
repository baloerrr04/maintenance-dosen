"use client";

import { useEffect, useState } from "react";
import { ColumnDef } from "@tanstack/react-table";
import { DataTable } from "@/components/ui/data-table";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";

// Model Mata Kuliah
interface MataKuliah {
  id: string;
  nama: string;
  sks: number;
  jam: number;
  kode: string;
  semester: number
  prodi_id: string
}

interface Prodi {
  id: string;
  nama: string;
}

export default function MatkulTable() {
  const [data, setData] = useState<MataKuliah[]>([]);
  const [open, setOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [formData, setFormData] = useState<MataKuliah>({
    id: "",
    nama: "",
    sks: 0,
    jam: 0,
    kode: "",
    prodi_id: "",
    semester: 0
  });
  const [isEditing, setIsEditing] = useState(false);
  const [prodis, setProdis] = useState<Prodi[]>([]);

  useEffect(() => {
    async function fetchData() {
      const res = await fetch("/api/matkul");
      const result = await res.json();
      setData(result);

      const prodiRes = await fetch("/api/prodi");
      const prodiData = await prodiRes.json();
      setProdis(prodiData);
    }
    fetchData();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleProdiChange = (value: string) => {
    setFormData((prev) => ({ ...prev, prodi_id: value }));
  };

  const handleSemesterChange = (value: string) => {
    setFormData((prev) => ({ ...prev, semester: parseInt(value) }));
  };

  const handleSubmit = async () => {
    const method = isEditing ? "PUT" : "POST";
    const url = "/api/matkul";

    const res = await fetch(url, {
      method,
      body: JSON.stringify(formData),
      headers: { "Content-Type": "application/json" },
    });

    if (res.ok) {
      const result = await res.json();
      setData((prevData) =>
        isEditing
          ? prevData.map((m) => (m.id === result.id ? result : m))
          : [...prevData, result]
      );
      toast.success(
        `Mata kuliah berhasil ${isEditing ? "diperbarui" : "ditambahkan"}`
      );
    } else {
      toast.error(
        `Gagal ${isEditing ? "memperbarui" : "menambahkan"} mata kuliah`
      );
    }

    setOpen(false);
  };

  const handleDelete = async () => {
    if (!deleteId) return;

    const res = await fetch("/api/matkul", {
      method: "DELETE",
      body: JSON.stringify({ id: deleteId }),
      headers: { "Content-Type": "application/json" },
    });

    if (res.ok) {
      setData((prevData) => prevData.filter((m) => m.id !== deleteId));
      toast.success("Mata kuliah berhasil dihapus");
    } else {
      toast.error("Gagal menghapus mata kuliah");
    }

    setConfirmOpen(false);
  };

  const handleEdit = (matkul: MataKuliah) => {
    setFormData(matkul);
    setIsEditing(true);
    setOpen(true);
  };

  const columns: ColumnDef<MataKuliah>[] = [
    { accessorKey: "kode", header: "Kode" },
    { accessorKey: "nama", header: "Nama" },
    { accessorKey: "sks", header: "SKS" },
    { accessorKey: "jam", header: "Jam" },
    { accessorKey: "prodi_id", header: "Program Studi", cell: ({row}) => prodis.find((p) => p.id == row.original.prodi_id)?.nama || "-"  },
    {
      id: "actions",
      header: "Aksi",
      cell: ({ row }) => (
        <div className="flex gap-2">
          <Button size="sm" onClick={() => handleEdit(row.original)}>
            Edit
          </Button>
          <Button
            size="sm"
            variant="destructive"
            onClick={() => {
              setDeleteId(row.original.id);
              setConfirmOpen(true);
            }}
          >
            Hapus
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div>
      <Button
        className="mb-4"
        onClick={() => {
          setIsEditing(false);
          setFormData({ id: "", nama: "", sks: 0, jam: 0, kode: "", prodi_id: "", semester: 0 });
          setOpen(true);
        }}
      >
        Tambah Mata Kuliah
      </Button>

      <DataTable columns={columns} data={data} />

      {/* Modal Form */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {isEditing ? "Edit Mata Kuliah" : "Tambah Mata Kuliah"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Nama</Label>
              <Input
                name="nama"
                value={formData.nama}
                onChange={handleChange}
              />
            </div>
            <div>
              <Label>Kode</Label>
              <Input
                name="kode"
                value={formData.kode}
                onChange={handleChange}
              />
            </div>
            <div>
              <Label>SKS</Label>
              <Input
                type="number"
                name="sks"
                value={formData.sks}
                onChange={handleChange}
              />
            </div>
            <div>
              <Label>Jam</Label>
              <Input
                type="number"
                name="jam"
                value={formData.jam}
                onChange={handleChange}
              />
            </div>
            <div>
              <Label>Prodi</Label>
              <Select value={formData.prodi_id} onValueChange={handleProdiChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Pilih Prodi" />
                </SelectTrigger>
                <SelectContent>
                  {prodis.map((prodi) => (
                    <SelectItem key={prodi.id} value={prodi.id}>
                      {prodi.nama}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Semester</Label>
              <Select value={formData.semester.toString()} onValueChange={handleSemesterChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Pilih Semester" />
                </SelectTrigger>
                <SelectContent>
                  {[1, 2, 3, 4, 5, 6, 7, 8].map((semester) => (
                    <SelectItem key={semester} value={semester.toString()}>
                      Semester {semester}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Button onClick={handleSubmit}>
              {isEditing ? "Simpan Perubahan" : "Tambah"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Modal Konfirmasi Hapus */}
      <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Konfirmasi Hapus</DialogTitle>
          </DialogHeader>
          <p>Apakah Anda yakin ingin menghapus mata kuliah ini?</p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmOpen(false)}>
              Batal
            </Button>
            <Button variant="destructive" onClick={handleDelete}>
              Ya, Hapus
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
