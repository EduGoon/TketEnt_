import { useEffect } from 'react';

export interface SeoOptions {
  title: string;
  description: string;
  keywords?: string;
  url?: string;
  image?: string;
  type?: string;
  jsonLd?: any;
}

const createOrUpdateMeta = (selector: string, attributes: Record<string, string>) => {
  const existing = document.head.querySelector<HTMLMetaElement>(selector);
  const element = existing || document.createElement('meta');
  if (!existing) {
    document.head.appendChild(element);
  }
  Object.entries(attributes).forEach(([key, value]) => element.setAttribute(key, value));
  return element;
};

const createOrUpdateLink = (rel: string, href: string) => {
  const existing = document.head.querySelector<HTMLLinkElement>(`link[rel='${rel}']`);
  const element = existing || document.createElement('link');
  if (!existing) {
    element.rel = rel;
    document.head.appendChild(element);
  }
  element.href = href;
  return element;
};

const setJsonLd = (jsonLd: any) => {
  if (!jsonLd) return;
  const id = 'seo-json-ld';
  let script = document.head.querySelector<HTMLScriptElement>(`script#${id}`);
  if (!script) {
    script = document.createElement('script');
    script.type = 'application/ld+json';
    script.id = id;
    document.head.appendChild(script);
  }
  script.textContent = JSON.stringify(jsonLd);
};

export const setSeoTags = ({
  title,
  description,
  keywords,
  url,
  image,
  type = 'website',
  jsonLd,
}: SeoOptions) => {
  document.title = title;

  createOrUpdateMeta(`meta[name='description']`, { name: 'description', content: description });
  if (keywords) createOrUpdateMeta(`meta[name='keywords']`, { name: 'keywords', content: keywords });
  createOrUpdateMeta(`meta[name='robots']`, { name: 'robots', content: 'index, follow' });

  createOrUpdateMeta(`meta[property='og:title']`, { property: 'og:title', content: title });
  createOrUpdateMeta(`meta[property='og:description']`, { property: 'og:description', content: description });
  createOrUpdateMeta(`meta[property='og:type']`, { property: 'og:type', content: type });
  if (url) createOrUpdateMeta(`meta[property='og:url']`, { property: 'og:url', content: url });
  if (image) createOrUpdateMeta(`meta[property='og:image']`, { property: 'og:image', content: image });

  createOrUpdateMeta(`meta[name='twitter:card']`, { name: 'twitter:card', content: image ? 'summary_large_image' : 'summary' });
  createOrUpdateMeta(`meta[name='twitter:title']`, { name: 'twitter:title', content: title });
  createOrUpdateMeta(`meta[name='twitter:description']`, { name: 'twitter:description', content: description });
  if (image) createOrUpdateMeta(`meta[name='twitter:image']`, { name: 'twitter:image', content: image });

  if (url) createOrUpdateLink('canonical', url);
  if (jsonLd) setJsonLd(jsonLd);
};

export const useSeo = (options: SeoOptions) => {
  useEffect(() => {
    setSeoTags(options);
  }, [options.title, options.description, options.keywords, options.url, options.image, options.type, JSON.stringify(options.jsonLd)]);
};
