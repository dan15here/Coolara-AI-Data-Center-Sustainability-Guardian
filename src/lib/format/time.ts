const JAKARTA_TIME_ZONE = 'Asia/Jakarta';

function part(parts: Intl.DateTimeFormatPart[], type: Intl.DateTimeFormatPartTypes): string {
  return parts.find((item) => item.type === type)?.value ?? '';
}

function dateTimeParts(timestamp: string): Intl.DateTimeFormatPart[] {
  return new Intl.DateTimeFormat('en-GB', {
    timeZone: JAKARTA_TIME_ZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23',
  }).formatToParts(new Date(timestamp));
}

/** A stable Jakarta timestamp for components rendered on both server and client. */
export function formatJakartaTime(timestamp: string): string {
  const parts = dateTimeParts(timestamp);
  return `${part(parts, 'hour')}:${part(parts, 'minute')}`;
}

/** A stable Jakarta date and time for the reports timeline. */
export function formatJakartaDateTime(timestamp: string): string {
  const parts = dateTimeParts(timestamp);
  return `${part(parts, 'day')}/${part(parts, 'month')}/${part(parts, 'year')} ${formatJakartaTime(timestamp)} WIB`;
}
