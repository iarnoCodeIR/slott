import { MetadataRoute } from 'next';
import { prisma } from '@/lib/prisma';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    const baseUrl = 'https://slott.codeir.net';

    // Fetch all salons to include their booking pages
    const salons = await prisma.salon.findMany({
        select: { slug: true, updatedAt: true }
    });

    const salonUrls = salons.map((salon) => ({
        url: `${baseUrl}/book/${salon.slug}`,
        lastModified: salon.updatedAt,
        changeFrequency: 'weekly' as const,
        priority: 0.8,
    }));

    return [
        {
            url: baseUrl,
            lastModified: new Date(),
            changeFrequency: 'monthly',
            priority: 1,
        },
        ...salonUrls,
    ];
}
