import AdminLayout from "@/components/admin-layout";
import MatkulTable from "@/components/matkul-table";

export default async function Page() {
  return (
    <AdminLayout>
      <div className="min-h-[100vh] p-2 flex-1 rounded-xl bg-muted/50 md:min-h-min">
        <h1 className="text-2xl font-bold mb-4">Kelola Jadwal Pagi</h1>
        <div className="overflow-x-auto">
          <table className="table-auto border-collapse border border-gray-400 w-full text-sm">
            <thead>
              <tr className="bg-gray-200">
                <th className="border border-gray-400 px-4 py-2">HARI/JAM</th>
                <th className="border border-gray-400 px-4 py-2">2CA</th>
                <th className="border border-gray-400 px-4 py-2">2CB</th>
                <th className="border border-gray-400 px-4 py-2">2CC</th>
                <th className="border border-gray-400 px-4 py-2">4CA</th>
                <th className="border border-gray-400 px-4 py-2">4CB</th>
                <th className="border border-gray-400 px-4 py-2">6CA</th>
                <th className="border border-gray-400 px-4 py-2">6CB</th>
                <th className="border border-gray-400 px-4 py-2">6CC</th>
                <th className="border border-gray-400 px-4 py-2">7IA</th>
                <th className="border border-gray-400 px-4 py-2">7IB</th>
                <th className="border border-gray-400 px-4 py-2">8IA</th>
                <th className="border border-gray-400 px-4 py-2">8IB</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="border bg-slate-500 border-gray-400 px-4 py-2" colSpan={20}>
                  SENIN
                </td>
              </tr>
              <tr>
                <td className="border border-gray-400 px-4 py-2">
                  07:00-07:50
                </td>
                <td className="border border-gray-400 px-4 py-2">H2/04</td>
                <td className="border border-gray-400 px-4 py-2">E2/30</td>
                <td className="border border-gray-400 px-4 py-2">K2/13</td>
                <td className="border border-gray-400 px-4 py-2">F4/28</td>
                <td className="border border-gray-400 px-4 py-2">H4/29</td>
                <td className="border border-gray-400 px-4 py-2">HA/25</td>
                <td className="border border-gray-400 px-4 py-2">OC/11</td>
                <td className="border border-gray-400 px-4 py-2">R2/20</td>
                <td className="border border-gray-400 px-4 py-2">P2/19</td>
                <td className="border border-gray-400 px-4 py-2">O4/09</td>
                <td className="border border-gray-400 px-4 py-2">R4/17</td>
                <td className="border border-gray-400 px-4 py-2">NB/12</td>
              </tr>
              <tr>
                <td className="border border-gray-400 px-4 py-2">
                  07:50-08:40
                </td>
                <td className="border border-gray-400 px-4 py-2">H2/04</td>
                <td className="border border-gray-400 px-4 py-2">E2/30</td>
                <td className="border border-gray-400 px-4 py-2">K2/13</td>
                <td className="border border-gray-400 px-4 py-2">F4/28</td>
                <td className="border border-gray-400 px-4 py-2">H4/29</td>
                <td className="border border-gray-400 px-4 py-2">HA/25</td>
                <td className="border border-gray-400 px-4 py-2">OC/11</td>
                <td className="border border-gray-400 px-4 py-2">R2/20</td>
                <td className="border border-gray-400 px-4 py-2">P2/19</td>
                <td className="border border-gray-400 px-4 py-2">O4/09</td>
                <td className="border border-gray-400 px-4 py-2">R4/17</td>
                <td className="border border-gray-400 px-4 py-2">NB/12</td>
              </tr>
              <tr>
                <td className="border border-gray-400 px-4 py-2">
                  08:40-09:30
                </td>
                <td className="border border-gray-400 px-4 py-2">H2/04</td>
                <td className="border border-gray-400 px-4 py-2">E2/30</td>
                <td className="border border-gray-400 px-4 py-2">K2/13</td>
                <td className="border border-gray-400 px-4 py-2">F4/28</td>
                <td className="border border-gray-400 px-4 py-2">H4/29</td>
                <td className="border border-gray-400 px-4 py-2">HA/25</td>
                <td className="border border-gray-400 px-4 py-2">OC/11</td>
                <td className="border border-gray-400 px-4 py-2">R2/20</td>
                <td className="border border-gray-400 px-4 py-2">P2/19</td>
                <td className="border border-gray-400 px-4 py-2">O4/09</td>
                <td className="border border-gray-400 px-4 py-2">R4/17</td>
                <td className="border border-gray-400 px-4 py-2">NB/12</td>
              </tr>
              <tr>
                <td className="border bg-slate-500 border-gray-400 px-4 py-2" colSpan={20}>
                  BREAK
                </td>
              </tr>
              <tr>
                <td className="border border-gray-400 px-4 py-2">
                  10:00-10:50
                </td>
                <td className="border border-gray-400 px-4 py-2">H2/04</td>
                <td className="border border-gray-400 px-4 py-2">E2/30</td>
                <td className="border border-gray-400 px-4 py-2">K2/13</td>
                <td className="border border-gray-400 px-4 py-2">F4/28</td>
                <td className="border border-gray-400 px-4 py-2">H4/29</td>
                <td className="border border-gray-400 px-4 py-2">HA/25</td>
                <td className="border border-gray-400 px-4 py-2">OC/11</td>
                <td className="border border-gray-400 px-4 py-2">R2/20</td>
                <td className="border border-gray-400 px-4 py-2">P2/19</td>
                <td className="border border-gray-400 px-4 py-2">O4/09</td>
                <td className="border border-gray-400 px-4 py-2">R4/17</td>
                <td className="border border-gray-400 px-4 py-2">NB/12</td>
              </tr>
              <tr>
                <td className="border border-gray-400 px-4 py-2">
                  10:50-11:40
                </td>
                <td className="border border-gray-400 px-4 py-2">H2/04</td>
                <td className="border border-gray-400 px-4 py-2">E2/30</td>
                <td className="border border-gray-400 px-4 py-2">K2/13</td>
                <td className="border border-gray-400 px-4 py-2">F4/28</td>
                <td className="border border-gray-400 px-4 py-2">H4/29</td>
                <td className="border border-gray-400 px-4 py-2">HA/25</td>
                <td className="border border-gray-400 px-4 py-2">OC/11</td>
                <td className="border border-gray-400 px-4 py-2">R2/20</td>
                <td className="border border-gray-400 px-4 py-2">P2/19</td>
                <td className="border border-gray-400 px-4 py-2">O4/09</td>
                <td className="border border-gray-400 px-4 py-2">R4/17</td>
                <td className="border border-gray-400 px-4 py-2">NB/12</td>
              </tr>
              <tr>
                <td className="border border-gray-400 px-4 py-2">
                  11:40-12:30
                </td>
                <td className="border border-gray-400 px-4 py-2">H2/04</td>
                <td className="border border-gray-400 px-4 py-2">E2/30</td>
                <td className="border border-gray-400 px-4 py-2">K2/13</td>
                <td className="border border-gray-400 px-4 py-2">F4/28</td>
                <td className="border border-gray-400 px-4 py-2">H4/29</td>
                <td className="border border-gray-400 px-4 py-2">HA/25</td>
                <td className="border border-gray-400 px-4 py-2">OC/11</td>
                <td className="border border-gray-400 px-4 py-2">R2/20</td>
                <td className="border border-gray-400 px-4 py-2">P2/19</td>
                <td className="border border-gray-400 px-4 py-2">O4/09</td>
                <td className="border border-gray-400 px-4 py-2">R4/17</td>
                <td className="border border-gray-400 px-4 py-2">NB/12</td>
              </tr>
              <tr>
                <td className="border bg-slate-500 border-gray-400 px-4 py-2" colSpan={20}>
                  SELASA
                </td>
              </tr>
              {/* Seterusnya */}
            </tbody>
          </table>
        </div>
      </div>
    </AdminLayout>
  );
}
