export type PostStatus = "draft" | "published";

export type BlogPost = {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  coverImageUrl?: string;
  status: PostStatus;
  tags: string[];
  contentJson: string;
  contentHtml: string;
  publishedAt?: string;
  createdAt?: string;
  updatedAt?: string;
};

export type ProjectPin = {
  name: string;
  description: string;
  githubUrl: string;
  topic: string;
  tech: string[];
};

export type ResumeSchema = {
  basics?: {
    name?: string;
    label?: string;
    email?: string;
    url?: string;
    summary?: string;
    location?: {
      city?: string;
      countryCode?: string;
    };
    profiles?: Array<{
      network?: string;
      username?: string;
      url?: string;
    }>;
  };
  work?: Array<{
    name?: string;
    position?: string;
    url?: string;
    startDate?: string;
    endDate?: string;
    summary?: string;
    highlights?: string[];
  }>;
  education?: Array<{
    institution?: string;
    area?: string;
    studyType?: string;
    startDate?: string;
    endDate?: string;
  }>;
  skills?: Array<{
    name?: string;
    keywords?: string[];
  }>;
  projects?: Array<{
    name?: string;
    description?: string;
    url?: string;
    highlights?: string[];
  }>;
};
