import { useEffect, useState } from "react"
import { useParams } from "react-router-dom"
import { getBoardById } from "../../services/board.service"
import type { BoardResponseDTO } from "../../shared/types/BoardProps"

// type Board = {
//   id: number
//   codigo: string
//   nombre: string
//   empresa: string
//   ubicacion: string
//   voltaje: string
//   corriente: string
//   fechaInstalacion: string
//   descripcion: string
//   imagenes: string[]
// }

export default function TechnicalSheetPage() {

  const { id } = useParams<{ id: string }>()

  const [board, setBoard] = useState<BoardResponseDTO | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
 if (!id) return;
    const fetchBoard = async () => {
      setLoading(true);
      try {
        const data = await getBoardById(Number(id));
        setBoard(data);
        // setName(data.name);
        // setType(data.type);
        // setTensionNominal(data.tensionNominal);
        // setNumeroFases(data.numeroFases);
        // setIncluyeNeutro(data.incluyeNeutro);
      } finally {
        setLoading(false);
      }
    };
    fetchBoard();
  }, [id])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        Cargando información del tablero...
      </div>
    )
  }

  if (!board) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        Tablero no encontrado
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">

      {/* HEADER */}

      <div className="bg-blue-600 text-white py-6">
        <div className="max-w-5xl mx-auto px-6">

          <h1 className="text-2xl font-bold">
            {board.name}
          </h1>

          <p className="text-blue-100">
            Código: {board.id}
          </p>

        </div>
      </div>

      {/* CONTENT */}

      <div className="max-w-5xl mx-auto px-6 py-10 grid md:grid-cols-2 gap-10">

        {/* DATOS */}

        <div className="bg-white p-6 rounded-xl shadow-sm">

          <h2 className="text-lg font-semibold mb-4">
            Información técnica
          </h2>

          <div className="space-y-3 text-sm">

            {/* <Info label="Empresa" value={board.empresa} />
            <Info label="Ubicación" value={board.ubicacion} />
            <Info label="Voltaje" value={board.voltaje} />
            <Info label="Corriente" value={board.corriente} />
            <Info label="Fecha instalación" value={board.fechaInstalacion} /> */}
            
            <Info label="Tipo" value={board.type} />
            <Info label="Tension nominal" value={board.tensionNominal.toString()} />
            <Info label="Número de fases" value={board.numeroFases.toString()} />
            <Info label="Incluye neutro" value={board.incluyeNeutro ? "Sí": "No"} />

          </div>

          {/* <div className="mt-6">

            <h3 className="font-medium">
              Descripción
            </h3>

            <p className="text-gray-600 text-sm mt-2">
              {board.descripcion}
            </p>

          </div> */}

        </div>

        {/* IMÁGENES */}

        <div>

          <h2 className="text-lg font-semibold mb-4">
            Imágenes del tablero
          </h2>

          <div className="grid grid-cols-2 gap-4">

            {board.files.map((img, index) => (
              <img
                key={index}
                src={img.url}
                className="rounded-lg object-cover w-full h-40"
              />
            ))}

          </div>

        </div>

      </div>

      {/* FOOTER */}

      <div className="text-center text-xs text-gray-400 pb-6">
        Sistema de gestión de tableros eléctricos
      </div>

    </div>
  )
}

function Info({ label, value }: { label: string, value: string }) {
  return (
    <div className="flex justify-between border-b pb-2">

      <span className="text-gray-500">
        {label}
      </span>

      <span className="font-medium">
        {value}
      </span>

    </div>
  )
}