export interface Sport {
    slug: string;
    name: string;
    tagline: string;
    featured: boolean;
    season: string | null;
}

export interface Region {
    city: string;
    short_city: string;
    tagline: string;
    country: string;
    sample_areas: string[];
}

export interface Brand {
    name: string;
    tld: string;
}

export interface SportifyConfig {
    sports: Sport[];
    region: Region;
    brand: Brand;
}
