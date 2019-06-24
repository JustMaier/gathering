const ordinals = ['th', 'st', 'nd', 'rd']
export default function getOrdinal (n) {
  const v = n % 100
  return n + (ordinals[(v - 20) % 10] || ordinals[v] || ordinals[0])
}
