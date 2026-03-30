import { Eye, Pencil, Trash2, UserPlus } from "lucide-react";
import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import DeleteUserModal from "../../../components/dashboard/modals/DeleteUserModal";
import Pagination from "../../../shared/components/Pagination";
import { mockAdmins } from "../../../shared/mocks/data";
import type { PageProps } from "../../../shared/types/PageProps";
import type { UserProps } from "../../../shared/types/UserProps";
// import type { User } from "../../../shared/mocks/users.mock";

// const users = [
//   {
//     id: 1,
//     name: "Juan Pérez",
//     email: "juan@example.com",
//     role: "Administrador",
//     status: "Activo",
//   },
//   {
//     id: 2,
//     name: "María López",
//     email: "maria@example.com",
//     role: "Usuario",
//     status: "Activo",
//   },
//   {
//     id: 3,
//     name: "Carlos Gómez",
//     email: "carlos@example.com",
//     role: "Editor",
//     status: "Bloqueado",
//   },
// ];

const UserDashboardPage = () => {
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<any>(null);

  const navigate = useNavigate();

  // const [users, setUsers] = useState<PageProps<UserProps>>();
  // const [loading, setLoading] = useState(true);
  const [searchParams, setSearchParams] = useSearchParams();
  const page = Number(searchParams.get("page") || 1) - 1;

  // const pageSize = 5;

  // const handleDelete = async () => {
  //   if (!selectedUser) return;

  //   setShowDeleteModal(false);

  //   await deleteUser(selectedUser.id);

  //   setUsers((prev) =>
  //     prev.filter((user) => user.id !== selectedUser.id)
  //   );

  //   setSelectedUser(null);
  // };

  // console.log(mockAdmins)

  // if (loading) {
  //   return <p className="text-sm text-gray-500">Cargando usuarios...</p>;
  // }

  return (
    // <div className="p-4 md:p-6">
    //   <h1 className="text-2xl font-bold mb-4">
    //     Administradores
    //   </h1>

    //   <div className="overflow-x-auto bg-white rounded-xl shadow">
    //     <table className="w-full text-sm md:text-base">
    //       <thead>
    //         <tr className="text-left bg-gray-100">
    //           <th className="p-3">Nombre</th>
    //           <th>Empresa</th>
    //           <th>Acciones</th>
    //         </tr>
    //       </thead>

    //       <tbody>
    //         {mockAdmins.map((a) => (
    //           <tr key={a.id} className="border-t">
    //             <td className="p-3">{a.name}</td>
    //             <td>{a.empresa}</td>
    //             <td className="space-x-2">
    //               <button className="text-blue-600">
    //                 Editar
    //               </button>
    //               <button className="text-red-600">
    //                 Eliminar
    //               </button>
    //             </td>
    //           </tr>
    //         ))}
    //       </tbody>
    //     </table>
    //   </div>
    // </div>

    <section className="flex flex-col gap-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">
            Usuarios
          </h1>
          <p className="text-sm text-gray-500">
            Lista de todos los usuarios registrados en el sistema
          </p>
        </div>

        <button className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-indigo-700 transition" onClick={() => navigate("/dashboard/users/create")}>
          <UserPlus size={18} />
          Nuevo usuario
        </button>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-gray-600">
            <tr>
              <th className="px-6 py-4 text-left font-medium">Nombre</th>
              <th className="px-6 py-4 text-left font-medium">Email</th>
              <th className="px-6 py-4 text-left font-medium">Rol</th>
              <th className="px-6 py-4 text-left font-medium">Estado</th>
              <th className="px-6 py-4 text-right font-medium">Acciones</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-gray-200">
            {mockAdmins.map((user) => (
              <tr key={user._id} className="hover:bg-gray-50">
                <td className="px-6 py-4 font-medium text-gray-800">
                  {user.firstname} {user.lastname}
                </td>
                <td className="px-6 py-4 text-gray-600">
                  {user.email}
                </td>
                {/* <td className="px-6 py-4">
                  <span className="px-3 py-1 rounded-full text-xs bg-indigo-100 text-indigo-700">
                    {user.role}
                  </span>
                </td> */}
                <td className="px-6 py-4">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-medium ${user.isActive
                      ? "bg-green-100 text-green-700"
                      : "bg-red-100 text-red-700"
                      }`}
                  >
                    {user.isActive ? "Activo" : "Inactivo"}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <div className="flex justify-end gap-3 text-gray-500">
                    <button className="hover:text-indigo-600" onClick={() => navigate(`/dashboard/users/${user._id}`)}>
                      <Eye size={18} />
                    </button>
                    <button className="hover:text-yellow-600" onClick={() => navigate(`/dashboard/users/${user._id}/edit`)}>
                      <Pencil size={18} />
                    </button>
                    <button className="hover:text-red-600" onClick={() => {
                      setSelectedUser(user);
                      setShowDeleteModal(true);
                    }}>
                      <Trash2 size={18} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {mockAdmins && (
        <Pagination
          page={page}
          totalPages={mockAdmins.length}
          onPageChange={(newPage) => setSearchParams({ page: String(newPage + 1) })}
        />
      )}

      {/* {showDeleteModal && (
        <DeleteUserModal
          onClose={() => setShowDeleteModal(false)}
          onConfirm={() => {}}
        />
      )} */}
    </section>
  );
};

export default UserDashboardPage;
