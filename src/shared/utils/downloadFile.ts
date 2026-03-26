export async function downloadFile(url: string, filename: string) {
  const res = await fetch(url);

  if (!res.ok) {
    throw new Error("Error al descargar el archivo");
  }

  const blob = await res.blob();
  const blobUrl = URL.createObjectURL(blob);

  const link = document.createElement("a");
  link.href = blobUrl;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  URL.revokeObjectURL(blobUrl);
}
