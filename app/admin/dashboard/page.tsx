"use client";

import AdminLayout from "@/components/admin-layout";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import {
  CalendarDays,
  Users,
  GraduationCap,
  BookOpen,
  BarChart4,
  Clock,
  Plus,
  Download,
  Building2,
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import JadwalTable from "@/components/jadwal-table";
import JadwalForm from "@/components/jadwal-form";

interface DashboardStats {
  totalJadwal: number;
  totalDosen: number;
  totalKelas: number;
  totalMataKuliah: number;
  jadwalByPeriod: Record<string, number>;
  jadwalByDay: Record<string, number>;
  dosenWithMostClasses: {
    nama: string;
    kode: string;
    count: number;
  };
  mostUsedClassroom: {
    nama: string;
    count: number;
  };
}

export default function Page() {
  const router = useRouter();
  const [period, setPeriod] = useState<string>("PAGI");
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  // Fetch dashboard statistics
  useEffect(() => {
    const fetchStats = async () => {
      setLoading(true);
      try {
        const response = await fetch("/api/stats");
        if (!response.ok) {
          throw new Error("Failed to fetch statistics");
        }
        const data = await response.json();
        setStats(data);
      } catch (error) {
        console.error("Error fetching dashboard statistics:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  const handlePeriodChange = (value: string) => {
    setPeriod(value);
  };

  const dayNames: Record<string, string> = {
    SENIN: "Senin",
    SELASA: "Selasa",
    RABU: "Rabu",
    KAMIS: "Kamis",
    JUMAT: "Jumat",
    SABTU: "Sabtu",
    MINGGU: "Minggu",
  };

  // Dummy data for when stats are loading
  const dummyStats: DashboardStats = {
    totalJadwal: 0,
    totalDosen: 0,
    totalKelas: 0,
    totalMataKuliah: 0,
    jadwalByPeriod: {
      PAGI: 0,
      SIANG: 0,
      SORE: 0,
    },
    jadwalByDay: {
      SENIN: 0,
      SELASA: 0,
      RABU: 0,
      KAMIS: 0,
      JUMAT: 0,
      SABTU: 0,
      MINGGU: 0,
    },
    dosenWithMostClasses: {
      nama: "-",
      kode: "-",
      count: 0,
    },
    mostUsedClassroom: {
      nama: "-",
      count: 0,
    },
  };

  const displayStats = stats || dummyStats;

  const relevantDays = Object.entries(displayStats.jadwalByDay).filter(
    ([_, count]) =>
      count > 0 ||
      ["SENIN", "SELASA", "RABU", "KAMIS", "JUMAT", "SABTU"].includes(_)
  );
  return (
    <AdminLayout>
      <div className="flex flex-col">
        <div className="flex-1 space-y-4 p-8 pt-6">
          <div className="flex items-center justify-between space-y-2">
            <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
            <div className="flex items-center space-x-2">
              <Select value={period} onValueChange={handlePeriodChange}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Pilih Periode" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="PAGI">Pagi</SelectItem>
                  <SelectItem value="SIANG">Siang</SelectItem>
                  <SelectItem value="SORE">Sore</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Overview Stats Cards */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Total Jadwal
                </CardTitle>
                <CalendarDays className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {displayStats.totalJadwal}
                </div>
                <p className="text-xs text-muted-foreground">
                  Jadwal aktif dalam sistem
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Total Dosen
                </CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {displayStats.totalDosen}
                </div>
                <p className="text-xs text-muted-foreground">
                  Dosen terdaftar dalam sistem
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Total Kelas
                </CardTitle>
                <Building2 className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {displayStats.totalKelas}
                </div>
                <p className="text-xs text-muted-foreground">
                  Ruang kelas tersedia
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Total Mata Kuliah
                </CardTitle>
                <BookOpen className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {displayStats.totalMataKuliah}
                </div>
                <p className="text-xs text-muted-foreground">
                  Mata kuliah aktif
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Tabs for Main Content */}
          <Tabs defaultValue="overview" className="space-y-4">
            <TabsList>
              <TabsTrigger value="overview">Ikhtisar</TabsTrigger>
              <TabsTrigger value="view">Lihat Jadwal</TabsTrigger>
              <TabsTrigger value="manage">Kelola Jadwal</TabsTrigger>
            </TabsList>

            {/* Overview Tab */}
            <TabsContent value="overview" className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                {/* Detailed Stats - Left Column */}
                <Card className="lg:col-span-4">
                  <CardHeader>
                    <CardTitle>Distribusi Jadwal</CardTitle>
                    <CardDescription>
                      Distribusi jadwal berdasarkan hari dan periode
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pl-2">
                    <div className="grid gap-6 md:grid-cols-2">
                      {/* Distribution by Period */}
                      <div>
                        <h4 className="text-sm font-semibold mb-2">
                          Berdasarkan Periode
                        </h4>
                        <div className="space-y-2">
                          {Object.entries(displayStats.jadwalByPeriod).map(
                            ([period, count]) => (
                              <div key={period} className="flex items-center">
                                <div className="w-16 text-sm">{period}</div>
                                <div className="flex-1">
                                  <div className="h-2 rounded-full bg-gray-100 overflow-hidden">
                                    <div
                                      className="h-full bg-blue-500"
                                      style={{
                                        width: `${Math.min(
                                          100,
                                          (count /
                                            (displayStats.totalJadwal || 1)) *
                                            100
                                        )}%`,
                                      }}
                                    />
                                  </div>
                                </div>
                                <div className="w-10 text-right text-sm">
                                  {count}
                                </div>
                              </div>
                            )
                          )}
                        </div>
                      </div>

                      {/* Distribution by Day */}
                      <div>
                        <h4 className="text-sm font-semibold mb-2">
                          Berdasarkan Hari
                        </h4>
                        <div className="space-y-2">
                          {/* Only show relevant days */}
                          {relevantDays.map(([day, count]) => (
                            <div key={day} className="flex items-center">
                              <div className="w-16 text-sm">
                                {dayNames[day] || day}
                              </div>
                              <div className="flex-1">
                                <div className="h-2 rounded-full bg-gray-100 overflow-hidden">
                                  <div
                                    className="h-full bg-green-500"
                                    style={{
                                      width: `${Math.min(
                                        100,
                                        (count /
                                          (displayStats.totalJadwal || 1)) *
                                          100
                                      )}%`,
                                    }}
                                  />
                                </div>
                              </div>
                              <div className="w-10 text-right text-sm">
                                {count}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Summary Stats - Right Column */}
                <div className="grid gap-4 lg:col-span-3">
                  {/* Dosen with Most Classes */}
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium">
                        Dosen dengan Kelas Terbanyak
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-xl font-bold">
                        {displayStats.dosenWithMostClasses.nama} (
                        {displayStats.dosenWithMostClasses.kode})
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">
                        {displayStats.dosenWithMostClasses.count} jadwal
                        terjadwal
                      </p>
                    </CardContent>
                  </Card>

                  {/* Most Used Classroom */}
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium">
                        Kelas Paling Banyak Digunakan
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-xl font-bold">
                        {displayStats.mostUsedClassroom.nama}
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">
                        {displayStats.mostUsedClassroom.count} jadwal terjadwal
                      </p>
                    </CardContent>
                  </Card>

                  {/* Quick Actions */}
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium">
                        Aksi Cepat
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <Button
                        className="w-full flex justify-between items-center"
                        onClick={() => router.push("/dosen")}
                      >
                        <span>Kelola Dosen</span>
                        <Users className="h-4 w-4" />
                      </Button>
                      <Button
                        className="w-full flex justify-between items-center"
                        onClick={() => router.push("/kelas")}
                      >
                        <span>Kelola Kelas</span>
                        <Building2 className="h-4 w-4" />
                      </Button>
                      <Button
                        className="w-full flex justify-between items-center"
                        variant="outline"
                        onClick={() => router.push("/matakuliah")}
                      >
                        <span>Kelola Mata Kuliah</span>
                        <BookOpen className="h-4 w-4" />
                      </Button>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </TabsContent>

            {/* View Schedule Tab */}
            <TabsContent value="view">
              <Card>
                <CardHeader>
                  <CardTitle>Lihat Jadwal Perkuliahan</CardTitle>
                  <CardDescription>
                    Tampilan jadwal perkuliahan berdasarkan periode
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-2">
                  <JadwalTable />
                </CardContent>
              </Card>
            </TabsContent>

            {/* Manage Schedule Tab */}
            <TabsContent value="manage">
              <div className="grid gap-4 md:grid-cols-2">
                <Card>
                  <CardHeader>
                    <CardTitle>Tambah Jadwal Baru</CardTitle>
                    <CardDescription>
                      Tambahkan jadwal perkuliahan baru ke dalam sistem
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <JadwalForm defaultPeriod={period} />
                  </CardContent>
                </Card>
                <div className="space-y-4">
                  <Card>
                    <CardHeader>
                      <CardTitle>Petunjuk Penyusunan Jadwal</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="list-disc pl-5 space-y-2">
                        <li>
                          Pilih Program Studi dan Periode untuk memfilter mata
                          kuliah dan kelas yang tersedia.
                        </li>
                        <li>
                          Sistem akan otomatis memeriksa konflik jadwal untuk:
                          <ul className="list-disc pl-5 mt-2">
                            <li>
                              Dosen yang sudah dijadwalkan pada hari dan jam
                              yang sama.
                            </li>
                            <li>
                              Kelas yang sudah digunakan pada hari dan jam yang
                              sama.
                            </li>
                          </ul>
                        </li>
                        <li>
                          Jadwal yang sudah disimpan dapat dilihat pada tab
                          "Lihat Jadwal".
                        </li>
                        <li>
                          Jadwal dapat diekspor ke Excel dengan menekan tombol
                          "Export Excel".
                        </li>
                      </ul>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader>
                      <CardTitle>Ekspor Data</CardTitle>
                      <CardDescription>
                        Ekspor jadwal perkuliahan ke Excel
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <div className="grid grid-cols-3 gap-2">
                        <Button
                          className="w-full"
                          variant="outline"
                          onClick={() =>
                            (window.location.href = "/api/export?period=PAGI")
                          }
                        >
                          <Download className="mr-2 h-4 w-4" />
                          Pagi
                        </Button>
                        <Button
                          className="w-full"
                          variant="outline"
                          onClick={() =>
                            (window.location.href = "/api/export?period=SIANG")
                          }
                        >
                          <Download className="mr-2 h-4 w-4" />
                          Siang
                        </Button>
                        <Button
                          className="w-full"
                          variant="outline"
                          onClick={() =>
                            (window.location.href = "/api/export?period=SORE")
                          }
                        >
                          <Download className="mr-2 h-4 w-4" />
                          Sore
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </AdminLayout>
  );
}
