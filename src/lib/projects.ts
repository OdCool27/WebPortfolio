export interface ProjectRecord {
  id: string;
  title: string;
  type: string;
  description: string;
  date: string;
  businessName?: string;
  logoUrl?: string;
  image?: string;
  images: string[];
  tags: string[];
  url?: string;
  featuredOnHome?: boolean;
  createdAt?: unknown;
  updatedAt?: unknown;
  [key: string]: unknown;
}

function toMillis(value: unknown): number {
  if (!value) return 0;

  if (typeof value === 'string') {
    const parsed = Date.parse(value);
    return Number.isNaN(parsed) ? 0 : parsed;
  }

  if (typeof value === 'object' && value !== null) {
    if ('toMillis' in value && typeof value.toMillis === 'function') {
      return value.toMillis();
    }

    if ('seconds' in value && typeof value.seconds === 'number') {
      return value.seconds * 1000;
    }
  }

  return 0;
}

export function normalizeProject(raw: any): ProjectRecord {
  const images = Array.isArray(raw.images)
    ? raw.images.filter((image: unknown): image is string => typeof image === 'string' && image.trim().length > 0)
    : typeof raw.image === 'string' && raw.image.trim().length > 0
      ? [raw.image]
      : [];

  const tags = Array.isArray(raw.tags)
    ? raw.tags.filter((tag: unknown): tag is string => typeof tag === 'string' && tag.trim().length > 0)
    : typeof raw.tags === 'string'
      ? raw.tags.split(',').map((tag: string) => tag.trim()).filter(Boolean)
      : [];

  return {
    ...raw,
    id: String(raw.id ?? ''),
    title: String(raw.title ?? ''),
    type: String(raw.type ?? ''),
    description: String(raw.description ?? ''),
    date: String(raw.date ?? ''),
    businessName: typeof raw.businessName === 'string' ? raw.businessName : '',
    logoUrl: typeof raw.logoUrl === 'string' ? raw.logoUrl : '',
    image: typeof raw.image === 'string' ? raw.image : '',
    images,
    tags,
    url: typeof raw.url === 'string' ? raw.url : '',
    featuredOnHome: Boolean(raw.featuredOnHome),
    createdAt: raw.createdAt,
    updatedAt: raw.updatedAt,
  };
}

export function sortProjectsByRecency(projects: ProjectRecord[]): ProjectRecord[] {
  return [...projects].sort((a, b) => {
    const featuredDiff = Number(Boolean(b.featuredOnHome)) - Number(Boolean(a.featuredOnHome));
    if (featuredDiff !== 0) return featuredDiff;

    const createdDiff = toMillis(b.createdAt) - toMillis(a.createdAt);
    if (createdDiff !== 0) return createdDiff;

    const updatedDiff = toMillis(b.updatedAt) - toMillis(a.updatedAt);
    if (updatedDiff !== 0) return updatedDiff;

    return toMillis(b.date) - toMillis(a.date);
  });
}

export function getFeaturedProject(projects: ProjectRecord[]): ProjectRecord | null {
  if (!projects.length) return null;

  const explicitlyFeatured = projects.find((project) => project.featuredOnHome);
  if (explicitlyFeatured) return explicitlyFeatured;

  return sortProjectsByRecency(projects)[0] ?? null;
}
