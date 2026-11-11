/**
 * Geração de slots de agendamento (port de @/lib/availability.ts do Barber App).
 *
 * Dado um dia, o horário de funcionamento do profissional, a duração do serviço,
 * os agendamentos já ocupados e eventuais bloqueios (ausências), gera slots
 * candidatos de 30 em 30 minutos, marcando `available: false` para slots no
 * passado, fora do expediente, colidindo com agendamentos ou bloqueios.
 */

const WEEKDAY_KEYS = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"] as const;

export { WEEKDAY_KEYS };
const SLOT_GRANULARITY_MIN = 30;

export type WorkingHours = Record<string, [string, string] | null>;

export type Slot = {
  start: Date;
  end: Date;
  available: boolean;
};

export type BookedRange = { start: string; end: string };

function parseHHmm(day: Date, hhmm: string): Date {
  const parts = hhmm.split(":");
  const h = Number(parts[0]) || 0;
  const m = Number(parts[1]) || 0;
  const d = new Date(day);
  d.setHours(h, m, 0, 0);
  return d;
}

export { parseHHmm };

function overlaps(aStart: Date, aEnd: Date, bStart: Date, bEnd: Date): boolean {
  return aStart < bEnd && aEnd > bStart;
}

/**
 * Gera slots selecionáveis para `day`.
 * - `workingHours`: mapeia dia da semana -> [abre, fecha] ou null (fechado)
 * - `durationMinutes`: duração do serviço
 * - `booked`: ranges já ocupados (não cancelados)
 * - `blocked`: ranges bloqueados (ausências, almoço, etc.)
 * - `now`: instante de referência para descartar slots no passado
 */
export function generateSlots(
  day: Date,
  workingHours: WorkingHours | null,
  durationMinutes: number,
  booked: BookedRange[] = [],
  blocked: BookedRange[] = [],
  now: Date = new Date(),
): Slot[] {
  if (!workingHours) return [];

  const key = WEEKDAY_KEYS[day.getDay()];
  const hours = workingHours[key as keyof WorkingHours];
  if (!hours) return [];

  const [open, close] = hours;
  const openAt = parseHHmm(day, open);
  const closeAt = parseHHmm(day, close);

  const toRanges = (rs: BookedRange[]) => rs.map((b) => ({ start: new Date(b.start), end: new Date(b.end) }));
  const busy = [...toRanges(booked), ...toRanges(blocked)];

  const slots: Slot[] = [];
  for (
    let start = new Date(openAt);
    start.getTime() + durationMinutes * 60_000 <= closeAt.getTime();
    start = new Date(start.getTime() + SLOT_GRANULARITY_MIN * 60_000)
  ) {
    const end = new Date(start.getTime() + durationMinutes * 60_000);
    const inPast = start <= now;
    const collides = busy.some((r) => overlaps(start, end, r.start, r.end));
    slots.push({ start: new Date(start), end, available: !inPast && !collides });
  }
  return slots;
}
