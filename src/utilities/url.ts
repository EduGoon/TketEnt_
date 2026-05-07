export const slugify = (text: string = ''): string =>
  text
    .toString()
    .trim()
    .toLowerCase()
    .replace(/['’]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

export const buildEventPath = (id: string, title?: string): string => {
  const slug = slugify(title || '');
  return slug ? `/events/${id}/${slug}` : `/events/${id}`;
};

export const buildEventUrl = (id: string, title?: string): string => {
  const path = buildEventPath(id, title);
  if (typeof window !== 'undefined' && window.location?.origin) {
    return `${window.location.origin}${path}`;
  }
  return `https://eventify.space${path}`;
};
