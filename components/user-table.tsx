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
import { useData, useMutateData } from "@/hooks/use-data";
import { User } from "@/types/jadwal"

export default function UsersTable() {
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState<User>({
    id: "",
    nama: "",
    username: "",
    password: ""
  });
  const [isEditing, setIsEditing] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);

  const {data: users, isLoading: loadingUser, isError: errorUser} = useData<User>('user', '/api/users')
  const { addMutation, editMutation, deleteMutation } = useMutateData<User>('user', '/api/users')

  // Handle input perubahan
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Tambah/Edit dosen
  const handleSubmit = async () => {
    if (isEditing) {
      await editMutation.mutateAsync({
        id: formData.id,
        updatedData: {
          id: formData.id,
          nama: formData.nama,
          username: formData.username,
          password: formData.password
        }
      })
    } else {
      await addMutation.mutateAsync({
        nama: formData.nama,
        username: formData.username,
        password: formData.password,
      })
    }

    setOpen(false);
  };

  // Hapus dosen
  const handleDelete = async () => {
    if (!deleteId) return;
    await deleteMutation.mutateAsync(deleteId);
    setConfirmOpen(false);
  };
  

  // Edit dosen
  const handleEdit = (user: User) => {
    setFormData(user);
    setIsEditing(true);
    setOpen(true);
  };

  const columns: ColumnDef<User>[] = [
    { accessorKey: "nama", header: "Nama" },
    { accessorKey: "username", header: "username" },
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
          setFormData({ id: "", nama: "", username: "", password: "" });
          setOpen(true);
        }}
      >
        Tambah Kelas
      </Button>

      <DataTable columns={columns} data={users ?? []} />

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
              <Label>Username</Label>
              <Input
                name="username"
                value={formData.username}
                onChange={handleChange}
              />
            </div>
            <div>
              <Label>Password</Label>
              <Input
                name="password"
                onChange={handleChange}
                type="password"
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
