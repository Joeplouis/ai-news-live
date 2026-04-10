export interface NewsItem {
  headline: string;
  summary: string;
  details: string[];
  link: string;
}

export interface ToolItem {
  name: string;
  functionality: string;
  highlights: string[];
  link: string;
}

export interface ResearchItem {
  title: string;
  overview: string;
  significance: string;
  link: string;
}

export interface Newsletter {
  id: string;
  title: string;
  date: string;
  introduction: string;
  topStories: NewsItem[];
  newTools: ToolItem[];
  research: ResearchItem[];
  insights: string[];
  createdAt: string;
}
