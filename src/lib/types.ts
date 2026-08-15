export type Cocktail = {
  id: string;
  name: string;
  alternateName: string | null;
  image: string;
  category: string;
  iba: string | null;
  alcoholic: boolean;
  glass: string;
  origin: string;
  description: string;
  story: string;
  ingredients: { name: string; measure: string | null }[];
  instructions: string[];
  tags: string[];
  moods: string[];
  situations: string[];
  suitableFor: string[];
  weatherAffinity: ("hot" | "warm" | "mild" | "cool" | "cold" | "rainy")[];
  popularity: number;
  flavorProfile: string[];
};

export type WeatherBucket = Cocktail["weatherAffinity"][number];

export type UserProfile = {
  id: string;
  name: string;
  email: string;
  password: string;
  createdAt: string;
};

export type SessionUser = Omit<UserProfile, "password">;

export type BrowseEvent = {
  cocktailId: string;
  at: string;
  action: "view" | "open" | "collect" | "tried" | "skip";
};

export type CollectionItem = {
  cocktailId: string;
  collectedAt: string;
};

export type JournalEntry = {
  id: string;
  cocktailId: string;
  triedAt: string;
  note: string;
};

export type SurveyPreferences = {
  mood: string;
  flavor: string;
  complexity: "simple" | "complex";
  completedAt: string;
};

export type UserData = {
  collected: CollectionItem[];
  journal: JournalEntry[];
  history: BrowseEvent[];
  moodPreference: string | null;
  surveyPreferences: SurveyPreferences | null;
};
