"use client";

import { useEffect, useState } from "react";
import { ColumnDef } from "@tanstack/react-table";
import { DataTable } from "@/components/ui/data-table";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

// Model Dosen
interface Kelas {
  id: string;
  nama: string;
  period: string
}

// Definisi kolom

export default function KelasTable() {
  const [data, setData] = useState<Kelas[]>([]);
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState<Kelas>({
    id: "",
    nama: "",
    period: ""
  });
  const [isEditing, setIsEditing] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);


  // Fetch data dari API
  useEffect(() => {
    async function fetchData() {
      const res = await fetch("/api/kelas");
      const result = await res.json();
      console.log(result);
      setData(result);
    }
    fetchData();
  }, []);

  // Handle input perubahan
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Tambah/Edit dosen
  const handleSubmit = async () => {
    if (isEditing) {
      const res = await fetch("/api/kelas", {
        method: "PUT",
        body: JSON.stringify({
          id: formData.id,
          nama: formData.nama,
          period: formData.period
        }),
        headers: { "Content-Type": "application/json" },
      });

      if (res.ok) {
        const updatedKelas = await res.json();
        setData(data.map((d) => (d.id === updatedKelas.id ? updatedKelas : d)));
        toast.success("Kelas berhasil diperbarui!");
      } else {
        toast.error("Gagal memperbarui kelas.");
      }
    } else {
      const res = await fetch("/api/kelas", {
        method: "POST",
        body: JSON.stringify({ nama: formData.nama, period: formData.period }),
        headers: { "Content-Type": "application/json" },
      });

      if (res.ok) {
        const newKelas = await res.json();
        setData([...data, newKelas]);
        toast.success("Kelas berhasil ditambahkan!");
      } else {
        toast.error("Gagal menambahkan kelas.");
      }
    }

    setOpen(false);
  };

  // Hapus dosen
  const handleDelete = async () => {
    if (!deleteId) return;
  
    const res = await fetch("/api/kelas", {
      method: "DELETE",
      body: JSON.stringify({ id: deleteId }),
      headers: { "Content-Type": "application/json" },
    });
  
    if (res.ok) {
      setData((prevData) => prevData.filter((d) => d.id !== deleteId));
      toast.success("Kelas berhasil dihapus");
    } else {
      toast.error("Gagal menghapus kelas");
    }
  
    setConfirmOpen(false);
  };
  

  // Edit dosen
  const handleEdit = (kelas: Kelas) => {
    setFormData(kelas);
    setIsEditing(true);
    setOpen(true);
  };

  const columns: ColumnDef<Kelas>[] = [
    { accessorKey: "nama", header: "Nama" },
    { accessorKey: "period", header: "period" },
    {
      id: "actions",
      header: "Aksi",
      cell: ({ row }) => (
        <div className="flex gap-2">
          <Button size="sm" onClick={() => handleEdit(row.original)}>
            Edit
          </Button>
          <Button size="sm" variant="destructive" onClick={() => {
            setDeleteId(row.original.id);
            setConfirmOpen(true);
          }}>Hapus</Button>
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
          setFormData({ id: "", nama: "", period: "" });
          setOpen(true);
        }}
      >
        Tambah Kelas
      </Button>

      <DataTable columns={columns} data={data} />

      {/* Modal Form */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {isEditing ? "Edit Kelas" : "Tambah Kelas"}
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
              <Label>Period</Label>
              <Input
                name="period"
                value={formData.period}
                onChange={handleChange}
              />
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
          <p>Apakah Anda yakin ingin menghapus kelas ini?</p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmOpen(false)}>Batal</Button>
            <Button variant="destructive" onClick={handleDelete}>Ya, Hapus</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
