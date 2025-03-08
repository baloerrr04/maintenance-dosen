import AdminLayout from "@/components/admin-layout";
import UsersTable from "@/components/user-table";



export default async function Page() {

  return (
    <AdminLayout>
      <div className="min-h-[100vh] p-2 flex-1 rounded-xl bg-muted/50 md:min-h-min">
        <h1 className="text-2xl font-bold mb-4">Kelola Admin</h1>
        <UsersTable />
      </div>
    </AdminLayout>
  );
}
