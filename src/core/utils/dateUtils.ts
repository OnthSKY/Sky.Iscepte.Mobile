export const formatDate = (date: Date, locale: string = 'tr-TR'): string =>
  new Intl.DateTimeFormat(locale, { year: 'numeric', month: '2-digit', day: '2-digit' }).format(date);

export const formatDateTime = (date: Date, locale: string = 'tr-TR'): string =>
  new Intl.DateTimeFormat(locale, {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);


