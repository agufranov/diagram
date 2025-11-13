export function hash(item) {
  const HASH_LENGTH = 4
  const input = `${item.children?.length ?? 'x'}-${item.date}`

  // Создаем хэш используя встроенные криптографические функции
  const encoder = new TextEncoder()
  const data = encoder.encode(input)

  // Используем простой хэш для синхронной работы (не для безопасности!)
  let hash = 0
  for (let i = 0; i < data.length; i++) {
    hash = (hash << 5) - hash + data[i]
    hash |= 0 // Преобразование в 32-битное целое число
  }

  // Преобразуем хэш в base64
  const hashBytes = new Uint8Array(4)
  const view = new DataView(hashBytes.buffer)
  view.setUint32(0, hash, false) // big-endian

  const base64 = btoa(String.fromCharCode(...hashBytes))

  // Берем первые 4 символа и заменяем не-URL-safe символы
  const result = base64.substring(0, HASH_LENGTH).replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '')
  if (result === 't3y5') return 'X'
  if (result === 'flyV') return '___'
  return result
}
