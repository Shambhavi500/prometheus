/** Client-side formatting per the Terminology Contract (07_COPYWRITING). */

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

/** DD-MMM-YYYY */
export function fmtDate(iso: string): string {
  const d = new Date(`${iso.slice(0, 10)}T00:00:00Z`);
  return `${String(d.getUTCDate()).padStart(2, '0')}-${MONTHS[d.getUTCMonth()]}-${d.getUTCFullYear()}`;
}

/** [YYYY-MM-DD HH:MM:SS UTC] */
export function fmtAuditTs(iso: string): string {
  const d = new Date(iso);
  const p = (x: number) => String(x).padStart(2, '0');
  return `${d.getUTCFullYear()}-${p(d.getUTCMonth() + 1)}-${p(d.getUTCDate())} ${p(d.getUTCHours())}:${p(d.getUTCMinutes())}:${p(d.getUTCSeconds())} UTC`;
}

/** HH:MM UTC */
export function fmtTime(iso: string): string {
  const d = new Date(iso);
  const p = (x: number) => String(x).padStart(2, '0');
  return `${p(d.getUTCHours())}:${p(d.getUTCMinutes())} UTC`;
}

export function fmtConfidence(c: number): string {
  return `${Math.round(c * 100)}%`;
}
