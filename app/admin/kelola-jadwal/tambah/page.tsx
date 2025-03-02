import AdminLayout from "@/components/admin-layout";
import JadwalForm from "@/components/jadwal-form";
import MatkulTable from "@/components/matkul-table";



export default async function Page() {

  return (
    <AdminLayout>
      <div className="min-h-[100vh] p-2 flex-1 rounded-xl bg-muted/50 md:min-h-min">
        <JadwalForm/>
      </div>
    </AdminLayout>
  );
}
