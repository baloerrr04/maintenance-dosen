import AdminLayout from "@/components/admin-layout";
import JadwalTable from "@/components/jadwal-table";

export default function Page() {
  return (
    <AdminLayout>
      <div className="min-h-[100vh] flex-1 rounded-xl bg-muted/50 md:min-h-min">
        <JadwalTable/>
      </div>
    </AdminLayout>
  );
}
