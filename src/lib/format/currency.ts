/** Formats Indonesian Rupiah as a whole currency unit; sub-rupiah decimals are not displayed. */
export function formatIdr(value: number): string {
  return `Rp${Math.round(Math.abs(value)).toLocaleString('id-ID')}`
}

/** Formats a cost change with an explicit positive or negative direction. */
export function formatSignedIdr(value: number): string {
  return `${value >= 0 ? '+' : '-'}${formatIdr(value)}`
}
