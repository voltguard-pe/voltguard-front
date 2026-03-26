import { Building2, Database, QrCode, ShieldCheck } from "lucide-react"
import { NavLink } from "react-router-dom"

const ImgHome = "../../../src/assets/images/switchboard-check-electrician-with-tablet-technology-action.jpg"

const HomePage = () => {
    return (
        <div className="w-full min-h-screen bg-white text-gray-800">

            {/* HERO */}

            <section className="py-24">
                <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-2 gap-16 items-center">

                    <div>

                        <h1 className="text-5xl font-bold leading-tight">
                            Gestión digital de
                            <span className="text-blue-600"> tableros eléctricos </span>
                            con códigos QR
                        </h1>

                        <p className="mt-6 text-lg text-gray-600">
                            Registra, documenta y consulta la ficha técnica de cada tablero
                            eléctrico simplemente escaneando un código QR desde cualquier
                            dispositivo.
                        </p>

                        <div className="mt-8 flex gap-4">

                            <NavLink
                                to={"/auth"}
                                className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 cursor-pointer"
                            >
                                Ingresar al sistema
                            </NavLink>

                            {/* <button className="border px-6 py-3 rounded-lg hover:bg-gray-100">
                                Ver cómo funciona
                            </button> */}

                        </div>

                    </div>

                    <div className="bg-gray-100 rounded-xl h-[400px] flex items-center justify-center text-gray-400 overflow-hidden">

                        <img
                            src={ImgHome}
                            alt="imagen"
                            className="object-cover w-full h-full"
                        />
                    </div>

                </div>
            </section>

            {/* PROBLEMA */}

            <section className="bg-gray-50 py-20">
                <div className="max-w-6xl mx-auto px-6 text-center">

                    <h2 className="text-3xl font-bold">
                        Problema común en la gestión de tableros
                    </h2>

                    <p className="mt-6 text-gray-600 max-w-2xl mx-auto">
                        La información técnica de los tableros eléctricos suele estar
                        dispersa entre documentos físicos, archivos desorganizados o
                        simplemente se pierde con el tiempo.
                    </p>

                    <div className="grid md:grid-cols-3 gap-8 mt-12">

                        <div className="bg-white p-6 rounded-xl shadow-sm">
                            📁 Documentación dispersa
                        </div>

                        <div className="bg-white p-6 rounded-xl shadow-sm">
                            🔎 Difícil acceso a información
                        </div>

                        <div className="bg-white p-6 rounded-xl shadow-sm">
                            ⚠️ Falta de trazabilidad
                        </div>

                    </div>

                </div>
            </section>

            {/* SOLUCION */}

            <section className="py-20">
                <div className="max-w-6xl mx-auto px-6 text-center">

                    <h2 className="text-3xl font-bold">
                        Una solución simple y eficiente
                    </h2>

                    <p className="mt-6 text-gray-600 max-w-2xl mx-auto">
                        Nuestra plataforma centraliza la información técnica de cada
                        tablero eléctrico y la vincula con un código QR único que permite
                        acceder a la ficha técnica en segundos.
                    </p>

                </div>
            </section>

            {/* COMO FUNCIONA */}

            <section className="bg-gray-50 py-20">

                <div className="max-w-6xl mx-auto px-6">

                    <h2 className="text-3xl font-bold text-center">
                        Cómo funciona
                    </h2>

                    <div className="grid md:grid-cols-3 gap-12 mt-16">

                        <div className="text-center">

                            <Database className="mx-auto text-blue-600" size={40} />

                            <h3 className="mt-4 font-semibold text-lg">
                                Registrar tablero
                            </h3>

                            <p className="text-gray-600 mt-2">
                                Ingresa los datos técnicos, ubicación e imágenes del tablero
                                eléctrico.
                            </p>

                        </div>

                        <div className="text-center">

                            <QrCode className="mx-auto text-blue-600" size={40} />

                            <h3 className="mt-4 font-semibold text-lg">
                                Generar código QR
                            </h3>

                            <p className="text-gray-600 mt-2">
                                El sistema genera automáticamente un QR único para cada
                                tablero.
                            </p>

                        </div>

                        <div className="text-center">

                            <ShieldCheck className="mx-auto text-blue-600" size={40} />

                            <h3 className="mt-4 font-semibold text-lg">
                                Consultar información
                            </h3>

                            <p className="text-gray-600 mt-2">
                                Escanea el QR para ver la ficha técnica completa desde tu
                                celular.
                            </p>

                        </div>

                    </div>

                </div>

            </section>

            {/* FEATURES */}

            <section className="py-20">

                <div className="max-w-6xl mx-auto px-6">

                    <h2 className="text-3xl font-bold text-center">
                        Funcionalidades
                    </h2>

                    <div className="grid md:grid-cols-2 gap-8 mt-12">

                        <Feature
                            icon={<Building2 />}
                            title="Multiempresa"
                            text="Cada empresa administra sus propios tableros eléctricos."
                        />

                        <Feature
                            icon={<QrCode />}
                            title="QR único por tablero"
                            text="Identificación rápida mediante escaneo."
                        />

                        <Feature
                            icon={<Database />}
                            title="Ficha técnica digital"
                            text="Datos técnicos centralizados con imágenes."
                        />

                        <Feature
                            icon={<ShieldCheck />}
                            title="Información segura"
                            text="Sistema centralizado y organizado."
                        />

                    </div>

                </div>

            </section>

            {/* CTA */}

            <section className="bg-blue-600 text-white py-20">

                <div className="max-w-4xl mx-auto text-center px-6">

                    <h2 className="text-3xl font-bold">
                        Comienza a gestionar tus tableros eléctricos
                    </h2>

                    <p className="mt-4 text-blue-100">
                        Digitaliza la información técnica de tus tableros y accede a ella
                        en segundos mediante códigos QR.
                    </p>

                    <button className="mt-8 bg-white text-blue-600 px-8 py-3 rounded-lg font-medium">
                        Iniciar sesión
                    </button>

                </div>

            </section>

        </div>
    )
}

function Feature({
    icon,
    title,
    text,
}: {
    icon: React.ReactNode
    title: string
    text: string
}) {
    return (
        <div className="flex gap-4 p-6 border rounded-xl">

            <div className="text-blue-600">
                {icon}
            </div>

            <div>

                <h3 className="font-semibold">
                    {title}
                </h3>

                <p className="text-gray-600 text-sm mt-1">
                    {text}
                </p>

            </div>

        </div>
    )
}

export default HomePage;