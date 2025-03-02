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
interface Dosen {
  id: string;
  nama: string;
  kode: string;
}

// Definisi kolom

export default function DosenTable() {
  const [data, setData] = useState<Dosen[]>([]);
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState<Dosen>({
    id: "",
    nama: "",
    kode: "",
  });
  const [isEditing, setIsEditing] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);


  // Fetch data dari API
  useEffect(() => {
    async function fetchData() {
      const res = await fetch("/api/dosen");
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
      const res = await fetch("/api/dosen", {
        method: "PUT",
        body: JSON.stringify({
          id: formData.id,
          nama: formData.nama,
          kode: formData.kode,
        }),
        headers: { "Content-Type": "application/json" },
      });

      if (res.ok) {
        const updatedDosen = await res.json();
        setData(data.map((d) => (d.id === updatedDosen.id ? updatedDosen : d)));
        toast.success("Dosen berhasil diperbarui!");
      } else {
        toast.error("Gagal memperbarui dosen.");
      }
    } else {
      const res = await fetch("/api/dosen", {
        method: "POST",
        body: JSON.stringify({ nama: formData.nama, kode: formData.kode }),
        headers: { "Content-Type": "application/json" },
      });

      if (res.ok) {
        const newDosen = await res.json();
        setData([...data, newDosen]);
        toast.success("Dosen berhasil ditambahkan!");
      } else {
        toast.error("Gagal menambahkan dosen.");
      }
    }

    setOpen(false);
  };

  // Hapus dosen
  const handleDelete = async () => {
    if (!deleteId) return;
  
    const res = await fetch("/api/dosen", {
      method: "DELETE",
      body: JSON.stringify({ id: deleteId }),
      headers: { "Content-Type": "application/json" },
    });
  
    if (res.ok) {
      setData((prevData) => prevData.filter((d) => d.id !== deleteId));
      toast.success("Dosen berhasil dihapus");
    } else {
      toast.error("Gagal menghapus dosen");
    }
  
    setConfirmOpen(false);
  };
  

  // Edit dosen
  const handleEdit = (dosen: Dosen) => {
    setFormData(dosen);
    setIsEditing(true);
    setOpen(true);
  };

  const columns: ColumnDef<Dosen>[] = [
    { accessorKey: "kode", header: "Kode" },
    { accessorKey: "nama", header: "Nama" },
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
          setFormData({ id: "", nama: "", kode: "" });
          setOpen(true);
        }}
      >
        Tambah Dosen
      </Button>

      <DataTable columns={columns} data={data} />

      {/* Modal Form */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {isEditing ? "Edit Dosen" : "Tambah Dosen"}
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
          <p>Apakah Anda yakin ingin menghapus dosen ini?</p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmOpen(false)}>Batal</Button>
            <Button variant="destructive" onClick={handleDelete}>Ya, Hapus</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
