// import { useEffect, useState } from "react";
// import { useParams } from "react-router-dom";
// // import { getCompanyBoardById } from "../../services/board.service";
// import type { BoardResponseDTO } from "../../shared/types/BoardProps";

// export default function TechnicalSheetPage() {
//   const { id } = useParams<{ id: string }>();

//   const [board, setBoard] = useState<BoardResponseDTO | null>(null);
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     if (!id) return;

//     const fetchBoard = async () => {
//       try {
//         setLoading(true);
//         const data = await getCompanyBoardById(id);
//         setBoard(data);
//       } catch (error) {
//         console.error("Error obteniendo tablero", error);
//         setBoard(null);
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchBoard();
//   }, [id]);

//   if (loading) {
//     return (
//       <div className="flex min-h-screen items-center justify-center">
//         Cargando información del tablero...
//       </div>
//     );
//   }

//   if (!board) {
//     return (
//       <div className="flex min-h-screen items-center justify-center">
//         Tablero no encontrado
//       </div>
//     );
//   }

//   const companyName =
//     typeof board.company === "string" ? "Empresa no disponible" : board.company.name;

//   return (
//     <div className="min-h-screen bg-gray-50">
//       <div className="bg-blue-600 py-6 text-white">
//         <div className="mx-auto max-w-5xl px-6">
//           <h1 className="text-2xl font-bold">{board.name}</h1>
//           <p className="text-blue-100">Código público: {board.code}</p>
//         </div>
//       </div>

//       <div className="mx-auto grid max-w-5xl gap-10 px-6 py-10 md:grid-cols-2">
//         <div className="rounded-xl bg-white p-6 shadow-sm">
//           <h2 className="mb-4 text-lg font-semibold">Información técnica</h2>

//           <div className="space-y-3 text-sm">
//             <Info label="Empresa" value={companyName} />
//             <Info label="Ubicación" value={board.location || "Sin ubicación"} />
//             <Info
//               label="Fecha de creación"
//               value={new Date(board.createdAt).toLocaleDateString()}
//             />
//             <Info
//               label="Última actualización"
//               value={new Date(board.updatedAt).toLocaleDateString()}
//             />
//           </div>

//           <div className="mt-6">
//             <h3 className="font-medium">Descripción</h3>
//             <p className="mt-2 text-sm text-gray-600">
//               {board.description || "Sin descripción"}
//             </p>
//           </div>
//         </div>

//         <div>
//           <h2 className="mb-4 text-lg font-semibold">Imágenes del tablero</h2>

//           {board.images.length === 0 ? (
//             <div className="rounded-xl bg-white p-6 text-sm text-gray-500 shadow-sm">
//               Este tablero no tiene imágenes registradas.
//             </div>
//           ) : (
//             <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
//               {board.images.map((img, index) => (
//                 <img
//                   key={`${img}-${index}`}
//                   src={img}
//                   alt={`Imagen ${index + 1} del tablero ${board.name}`}
//                   className="h-40 w-full rounded-lg object-cover"
//                 />
//               ))}
//             </div>
//           )}
//         </div>
//       </div>

//       <div className="pb-6 text-center text-xs text-gray-400">
//         Sistema de gestión de tableros eléctricos
//       </div>
//     </div>
//   );
// }

// function Info({ label, value }: { label: string; value: string }) {
//   return (
//     <div className="flex justify-between border-b pb-2">
//       <span className="text-gray-500">{label}</span>
//       <span className="font-medium text-right">{value}</span>
//     </div>
//   );
// }