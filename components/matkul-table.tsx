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
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";
import { useData, useMutateData } from "@/hooks/use-data";
import {MataKuliah, Prodi} from "@/types/jadwal"


export default function MatkulTable() {
  const [open, setOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [formData, setFormData] = useState<MataKuliah>({
    id: "",
    nama: "",
    sks: 1,
    jam: 1,
    kode: "",
    prodi_id: "",
    semester: 1,
  });
  const [isEditing, setIsEditing] = useState(false);
  // const [prodis, setProdis] = useState<Prodi[]>([]);

  const {
    data: matkul,
    isLoading,
    isError,
  } = useData<MataKuliah>("matakuliah", "/api/matkul");
  const { data: prodis } = useData<Prodi>("prodi", "/api/prodi");
  const { addMutation, editMutation, deleteMutation } =
    useMutateData<MataKuliah>("matakuliah", "/api/matkul");

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
    if (isEditing) {
      await editMutation.mutateAsync({
        id: formData.id,
        updatedData: {
          id: formData.id,
          nama: formData.nama,
          sks: formData.sks,
          jam: formData.jam,
          kode: formData.kode,
          prodi_id: formData.prodi_id,
          semester: formData.semester,
        },
      });
    } else {
      await addMutation.mutateAsync({
        nama: formData.nama,
        sks: formData.sks,
        jam: formData.jam,
        kode: formData.kode,
        prodi_id: formData.prodi_id,
        semester: formData.semester,
      });
    }

    setOpen(false);
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    await deleteMutation.mutateAsync(deleteId);
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
    {
      accessorKey: "prodi_id",
      header: "Program Studi",
      cell: ({ row }) =>
        prodis?.find((p) => p.id == row.original.prodi_id)?.nama || "-",
    },
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
          setFormData({
            id: "",
            nama: "",
            sks: 0,
            jam: 0,
            kode: "",
            prodi_id: "",
            semester: 0,
          });
          setOpen(true);
        }}
      >
        Tambah Mata Kuliah
      </Button>

      <DataTable columns={columns} data={matkul ?? []} />

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
              <Select
                value={formData.prodi_id}
                onValueChange={handleProdiChange}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Pilih Prodi" />
                </SelectTrigger>
                <SelectContent>
                  {prodis?.map((prodi) => (
                    <SelectItem key={prodi.id} value={prodi.id}>
                      {prodi.nama}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Semester</Label>
              <Select
                value={formData.semester.toString()}
                onValueChange={handleSemesterChange}
              >
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
