export type Messages = {
  brand: string;
  tagline: string;
  nav: {
    discover: string;
    catalogue: string;
    journey: string;
    book: string;
    journal: string;
    signOut: string;
    hub: string;
    preferences: string;
    measure: string;
    account: string;
  };
  login: {
    eyebrow: string;
    title: string;
    subtitle: string;
    signIn: string;
    createAccount: string;
    name: string;
    email: string;
    password: string;
    submitSignIn: string;
    submitRegister: string;
    demoHint: string;
  };
  home: {
    loading: string;
  };
  feed: {
    forUser: string;
    title: string;
    rankingHint: string;
    anyMood: string;
    loading: string;
    openingBar: string;
    shaking: string;
  };
  moods: {
    celebratory: string;
    sophisticated: string;
    cozy: string;
    adventurous: string;
    romantic: string;
    curious: string;
    social: string;
    reflective: string;
    lighthearted: string;
    focused: string;
    playful: string;
    bright: string;
    indulgent: string;
    nostalgic: string;
  };
  weather: {
    hot: string;
    warm: string;
    mild: string;
    cool: string;
    cold: string;
    rainy: string;
    nearYou: string;
    defaultCity: string;
  };
  card: {
    collect: string;
    collected: string;
    tried: string;
    openFullTale: string;
    swipeHint: string;
    loadingPours: string;
  };
  detail: {
    theTale: string;
    ingredients: string;
    toTaste: string;
    howToMake: string;
    glass: string;
    materials: string;
    servingVessel: string;
    utensils: string;
    beforeYouStart: string;
    stepByStep: string;
    stepLabel: string;
    gatherStep: string;
    prepGlassStep: string;
    finishStep: string;
    bestFor: string;
    situations: string;
    inYourBook: string;
    logAsTried: string;
    close: string;
  };
  triedModal: {
    title: string;
    subtitle: string;
    dateTried: string;
    note: string;
    notePlaceholder: string;
    cancel: string;
    save: string;
  };
  book: {
    title: string;
    subtitle: string;
    empty: string;
    collectedOn: string;
  };
  journey: {
    title: string;
    collected: string;
    tried: string;
  };
  catalogue: {
    title: string;
    subtitle: string;
    searchPlaceholder: string;
    count: string;
    empty: string;
    all: string;
  };
  journal: {
    title: string;
    subtitle: string;
    empty: string;
    triedOn: string;
    addNote: string;
    saveNote: string;
    cancel: string;
    deleteEntry: string;
  };
  language: {
    label: string;
    choose: string;
  };
  footer: {
    terms: string;
    contact: string;
    rights: string;
  };
  contact: {
    title: string;
    subtitle: string;
    customerService: string;
    telegram: string;
    email: string;
    hours: string;
  };
  terms: {
    title: string;
    updated: string;
  };
  content: {
    recipeNote: string;
  };
  errors: {
    emailExists: string;
    passwordShort: string;
    invalidCredentials: string;
  };
};

export const en: Messages = {
  brand: "Cocktale",
  tagline: "Cocktail stories, poured for you",
  nav: {
    discover: "Discover",
    catalogue: "Catalogue",
    journey: "Journey",
    book: "Book",
    journal: "Journal",
    signOut: "Sign out",
    hub: "My Hub",
    preferences: "Preference",
    measure: "Measure",
    account: "Account",
  },
  login: {
    eyebrow: "Cocktail stories, poured for you",
    title: "Cocktale",
    subtitle:
      "Log in to get pours ranked by weather, popularity, and what you linger on—then swipe right until the night runs out.",
    signIn: "Sign in",
    createAccount: "Create account",
    name: "Name",
    email: "Email",
    password: "Password",
    submitSignIn: "Enter the bar",
    submitRegister: "Join Cocktale",
    demoHint: "Demo: demo@cocktale.app / demo",
  },
  home: {
    loading: "Cocktale",
  },
  feed: {
    forUser: "For {name}",
    title: "Tonight's pours",
    rankingHint: "Ranked by weather · popularity · your browsing history",
    anyMood: "Any mood",
    loading: "Opening the bar…",
    openingBar: "Opening the bar…",
    shaking: "Shaking recommendations…",
  },
  moods: {
    celebratory: "Celebratory",
    sophisticated: "Sophisticated",
    cozy: "Cozy",
    adventurous: "Adventurous",
    romantic: "Romantic",
    curious: "Curious",
    social: "Social",
    reflective: "Reflective",
    lighthearted: "Lighthearted",
    focused: "Focused",
    playful: "Playful",
    bright: "Bright",
    indulgent: "Indulgent",
    nostalgic: "Nostalgic",
  },
  weather: {
    hot: "Hot & sunny",
    warm: "Warm evening",
    mild: "Mild day",
    cool: "Cool air",
    cold: "Cold snap",
    rainy: "Rainy mood",
    nearYou: "Near you",
    defaultCity: "New York (default)",
  },
  card: {
    collect: "Collect",
    collected: "Collected",
    tried: "Tried",
    openFullTale: "Open full tale →",
    swipeHint: "Swipe right for the next pour · left to go back",
    loadingPours: "Loading pours…",
  },
  detail: {
    theTale: "The tale",
    ingredients: "Ingredients",
    toTaste: "to taste",
    howToMake: "How to make it",
    glass: "Glass",
    materials: "Materials & tools",
    servingVessel: "Serving glass / cup",
    utensils: "Utensils & gear",
    beforeYouStart: "Before you start",
    stepByStep: "Step by step",
    stepLabel: "Step {n}",
    gatherStep: "Gather all ingredients and the tools listed below.",
    prepGlassStep: "Prepare your {glass}: chill it for cold drinks, or pre-warm it for hot ones.",
    finishStep: "Taste, adjust if needed, add garnish, and serve.",
    bestFor: "Best for",
    situations: "Situations",
    inYourBook: "In your book",
    logAsTried: "Log as tried",
    close: "Close",
  },
  triedModal: {
    title: "Log {name}",
    subtitle: "Add it to your cocktail journal with a date and optional note.",
    dateTried: "Date tried",
    note: "Note",
    notePlaceholder: "Too sweet? Perfect garnish? Who you shared it with...",
    cancel: "Cancel",
    save: "Save to journal",
  },
  book: {
    title: "Your book",
    subtitle: "Cocktails you collected to revisit, shop for, and make.",
    empty: "Nothing collected yet. Swipe the feed and tap Collect on pours you love.",
    collectedOn: "Collected {date}",
  },
  journey: {
    title: "My cocktail journey",
    collected: "Collected",
    tried: "Cocktails I tried",
  },
  catalogue: {
    title: "Catalogue",
    subtitle: "Every pour, ranked for you — a different slice each visit, most relevant first.",
    searchPlaceholder: "Search cocktails…",
    count: "{n} cocktails",
    empty: "No cocktails match that search.",
    all: "All",
  },
  journal: {
    title: "Cocktail journal",
    subtitle: "Dates, notes, and everything you've actually tasted.",
    empty: "No tastings yet. Tap Tried on a cocktail card to start your journal.",
    triedOn: "Tried {date}",
    addNote: "Add a tasting note…",
    saveNote: "Save note",
    cancel: "Cancel",
    deleteEntry: "Delete entry",
  },
  language: {
    label: "Language",
    choose: "Choose language",
  },
  footer: {
    terms: "Terms of use",
    contact: "Contact us",
    rights: "© {year} Cocktale. All rights reserved.",
  },
  contact: {
    title: "Contact us",
    subtitle: "Questions about an order, a recipe, or your account? Reach the Cocktale team directly.",
    customerService: "Customer service",
    telegram: "Message us on Telegram",
    email: "Email",
    hours: "We typically reply within one business day.",
  },
  terms: {
    title: "Terms of use",
    updated: "Last updated: 15 August 2026",
  },
  content: {
    recipeNote: "Recipe details come from our cocktail database and are shown in their original language.",
  },
  errors: {
    emailExists: "An account with this email already exists.",
    passwordShort: "Password must be at least 4 characters.",
    invalidCredentials: "Invalid email or password.",
  },
};
