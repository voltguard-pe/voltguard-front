import React, { useState, useEffect } from "react";
import type { UserProps } from "../../../shared/types/UserProps";

interface UserFormProps {
  user?: UserProps | null;
  onSubmit: (data: any) => void;
  onCancel?: () => void;
}

export default function UserForm({ user, onSubmit, onCancel }: UserFormProps) {
  const [firstname, setFirstname] = useState(user?.firstname || "");
  const [lastname, setLastname] = useState(user?.lastname || "");
  const [email, setEmail] = useState(user?.email || "");
  const [password, setPassword] = useState("");

  useEffect(() => {
    if (user) {
      setFirstname(user.firstname);
      setLastname(user.lastname);
      setEmail(user.email);
      setPassword("");
    }
  }, [user]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const data: any = { firstname, lastname, email };
    if (!user) data.password = password; // solo enviar password al crear
    onSubmit(data);
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white p-4 rounded shadow">
      <h2 className="text-lg font-bold mb-4">{user ? "Editar Usuario" : "Crear Usuario"}</h2>

      <div className="mb-2">
        <label className="block mb-1">Nombre</label>
        <input
          className="border w-full px-2 py-1 rounded"
          value={firstname}
          onChange={e => setFirstname(e.target.value)}
          required
        />
      </div>

      <div className="mb-2">
        <label className="block mb-1">Apellido</label>
        <input
          className="border w-full px-2 py-1 rounded"
          value={lastname}
          onChange={e => setLastname(e.target.value)}
          required
        />
      </div>

      <div className="mb-2">
        <label className="block mb-1">Email</label>
        <input
          type="email"
          className="border w-full px-2 py-1 rounded"
          value={email}
          onChange={e => setEmail(e.target.value)}
          required
        />
      </div>

      {!user && (
        <div className="mb-2">
          <label className="block mb-1">Contraseña</label>
          <input
            type="password"
            className="border w-full px-2 py-1 rounded"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
          />
        </div>
      )}

      <div className="flex space-x-2 mt-4">
        <button
          type="submit"
          className="bg-blue-500 text-white px-4 py-2 rounded"
        >
          {user ? "Actualizar" : "Crear"}
        </button>
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="bg-gray-300 px-4 py-2 rounded"
          >
            Cancelar
          </button>
        )}
      </div>
    </form>
  );
}
