import type { LocaleCode } from "@/i18n";

export interface TimezoneOption {
  offsetMinutes: number;
  cities: Record<LocaleCode, string>;
}

export const TIMEZONE_OPTIONS: TimezoneOption[] = [
  { offsetMinutes: -720, cities: { ru: "Бейкер (о. США)", en: "Baker Island", uk: "Бейкер (о. США)" } },
  { offsetMinutes: -660, cities: { ru: "Самоа", en: "Samoa", uk: "Самоа" } },
  { offsetMinutes: -600, cities: { ru: "Гонолулу", en: "Honolulu", uk: "Гонолулу" } },
  { offsetMinutes: -540, cities: { ru: "Анкоридж", en: "Anchorage", uk: "Анкоридж" } },
  { offsetMinutes: -480, cities: { ru: "Лос-Анджелес", en: "Los Angeles", uk: "Лос-Анджелес" } },
  { offsetMinutes: -420, cities: { ru: "Денвер", en: "Denver", uk: "Денвер" } },
  { offsetMinutes: -360, cities: { ru: "Чикаго, Мехико", en: "Chicago, Mexico City", uk: "Чикаго, Мехіко" } },
  { offsetMinutes: -300, cities: { ru: "Нью-Йорк, Богота", en: "New York, Bogotá", uk: "Нью-Йорк, Богота" } },
  { offsetMinutes: -240, cities: { ru: "Сантьяго, Каракас", en: "Santiago, Caracas", uk: "Сантьяго, Каракас" } },
  { offsetMinutes: -180, cities: { ru: "Буэнос-Айрес, Сан-Паулу", en: "Buenos Aires, São Paulo", uk: "Буенос-Айрес, Сан-Паулу" } },
  { offsetMinutes: -60, cities: { ru: "Азорские о-ва", en: "Azores", uk: "Азорські о-ви" } },
  { offsetMinutes: 0, cities: { ru: "Лондон, Лиссабон", en: "London, Lisbon", uk: "Лондон, Лісабон" } },
  { offsetMinutes: 60, cities: { ru: "Берлин, Варшава", en: "Berlin, Warsaw", uk: "Берлін, Варшава" } },
  { offsetMinutes: 120, cities: { ru: "Киев, Каир, Афины", en: "Kyiv, Cairo, Athens", uk: "Київ, Каїр, Афіни" } },
  { offsetMinutes: 180, cities: { ru: "Москва, Минск, Стамбул", en: "Moscow, Minsk, Istanbul", uk: "Москва, Мінськ, Стамбул" } },
  { offsetMinutes: 210, cities: { ru: "Тегеран", en: "Tehran", uk: "Тегеран" } },
  { offsetMinutes: 240, cities: { ru: "Дубай, Баку", en: "Dubai, Baku", uk: "Дубай, Баку" } },
  { offsetMinutes: 270, cities: { ru: "Кабул", en: "Kabul", uk: "Кабул" } },
  { offsetMinutes: 300, cities: { ru: "Ташкент, Карачи", en: "Tashkent, Karachi", uk: "Ташкент, Карачі" } },
  { offsetMinutes: 330, cities: { ru: "Дели, Мумбаи", en: "Delhi, Mumbai", uk: "Делі, Мумбаї" } },
  { offsetMinutes: 360, cities: { ru: "Алматы, Дакка", en: "Almaty, Dhaka", uk: "Алмати, Дакка" } },
  { offsetMinutes: 420, cities: { ru: "Бангкок, Новосибирск", en: "Bangkok, Novosibirsk", uk: "Бангкок, Новосибірськ" } },
  { offsetMinutes: 480, cities: { ru: "Пекин, Сингапур", en: "Beijing, Singapore", uk: "Пекін, Сінгапур" } },
  { offsetMinutes: 540, cities: { ru: "Токио, Сеул", en: "Tokyo, Seoul", uk: "Токіо, Сеул" } },
  { offsetMinutes: 570, cities: { ru: "Аделаида", en: "Adelaide", uk: "Аделаїда" } },
  { offsetMinutes: 600, cities: { ru: "Сидней, Владивосток", en: "Sydney, Vladivostok", uk: "Сідней, Владивосток" } },
  { offsetMinutes: 660, cities: { ru: "Магадан", en: "Magadan", uk: "Магадан" } },
  { offsetMinutes: 720, cities: { ru: "Окленд", en: "Auckland", uk: "Окленд" } },
];

function formatOffset(minutes: number): string {
  const sign = minutes >= 0 ? "+" : "-";
  const abs = Math.abs(minutes);
  const hours = Math.floor(abs / 60);
  const mins = abs % 60;
  const minsPart = mins === 0 ? "" : `:${String(mins).padStart(2, "0")}`;
  return `UTC${sign}${hours}${minsPart}`;
}

export function timezoneLabel(option: TimezoneOption, locale: LocaleCode): string {
  return `${formatOffset(option.offsetMinutes)} — ${option.cities[locale]}`;
}

export function closestTimezoneOption(offsetMinutes: number): TimezoneOption {
  return TIMEZONE_OPTIONS.reduce((closest, opt) =>
    Math.abs(opt.offsetMinutes - offsetMinutes) < Math.abs(closest.offsetMinutes - offsetMinutes)
      ? opt
      : closest
  );
}

export function detectBrowserOffsetMinutes(): number {
  return -new Date().getTimezoneOffset();
}

const STORAGE_KEY = "calora_tz_auto_applied";

export function shouldAutoApplyTimezone(): boolean {
  try {
    return localStorage.getItem(STORAGE_KEY) !== "1";
  } catch {
    return false;
  }
}

export function markTimezoneAutoApplied(): void {
  try {
    localStorage.setItem(STORAGE_KEY, "1");
  } catch {
    // ignore
  }
}