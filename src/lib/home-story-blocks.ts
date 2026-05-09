export type HomeStoryBlock = {
  kickerEn?: string;
  kickerAr?: string;
  titleEn?: string;
  titleAr?: string;
  bodyEn?: string;
  bodyAr?: string;
  imageUrl?: string;
  href?: string;
  ctaEn?: string;
  ctaAr?: string;
};

export function parseHomeStoryBlocks(raw: string | undefined | null): HomeStoryBlock[] {
  if (!raw?.trim()) return [];
  try {
    const data = JSON.parse(raw) as unknown;
    if (!Array.isArray(data)) return [];
    return data.filter((item): item is HomeStoryBlock => item != null && typeof item === "object");
  } catch {
    return [];
  }
}

