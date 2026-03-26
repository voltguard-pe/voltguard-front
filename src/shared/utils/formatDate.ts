// utils/date.ts
export const formatDate = (
  date: string | Date,
  withTime: boolean = false
): string => {
  const d = typeof date === 'string' ? new Date(date) : date

  return d.toLocaleString('es-PE', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    ...(withTime && {
      hour: '2-digit',
      minute: '2-digit'
    })
  })
}

export const formatDateShort = (date: string | Date): string => {
  const d = typeof date === 'string' ? new Date(date) : date
  return d.toLocaleDateString('es-PE')
}
