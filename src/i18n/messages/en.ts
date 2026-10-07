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
    currency: string;
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
    pageTitle?: string;
    continueWithGoogle?: string;
    orUseEmail?: string;
    googleFailed?: string;
    googleUnavailable?: string;
    continueWithSms?: string;
    smsTitle?: string;
    smsHint?: string;
    smsCountry?: string;
    smsNumber?: string;
    smsNumberPlaceholder?: string;
    smsWillText?: string;
    smsCode?: string;
    smsSend?: string;
    smsVerify?: string;
    smsCodeSent?: string;
    smsChangeNumber?: string;
    smsCancel?: string;
    smsFailed?: string;
  };
  profile?: {
    title: string;
    subtitle: string;
    tabAccount: string;
    tabPassword: string;
    tabPurchases: string;
    loggedInAs: string;
    memberSince: string;
    signedInWithGoogle: string;
    signedInWithEmail: string;
    signedInWithBoth: string;
    signedInWithSms?: string;
    passwordOnlyHint?: string;
    logout: string;
    currentPassword: string;
    newPassword: string;
    confirmPassword: string;
    savePassword: string;
    setPassword: string;
    passwordUpdated: string;
    googleOnlyHint: string;
    purchasesEmpty: string;
    paymentManagement: string;
    paymentHint: string;
    managePayments?: string;
    enabledPayments?: string;
    savedPayments?: string;
    noSavedPayments?: string;
    noMembership?: string;
    shippingTracker: string;
    noTracking: string;
    viewOrder: string;
    contactBilling: string;
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
    googleOnly?: string;
    smsOnly?: string;
    passwordMismatch?: string;
    wrongPassword?: string;
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
    currency: "Currency",
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
    pageTitle: "Log In",
    continueWithGoogle: "Continue with Google",
    orUseEmail: "or use email and password",
    googleFailed: "Google sign-in did not finish. Please try again.",
    googleUnavailable: "Google sign-in is not configured on this site yet.",
    continueWithSms: "Continue with SMS",
    smsTitle: "Sign in with your phone",
    smsHint: "Choose any country calling code, then we will text a 6-digit code.",
    smsCountry: "Country",
    smsNumber: "Mobile number",
    smsNumberPlaceholder: "National number",
    smsWillText: "We will text:",
    smsCode: "SMS code",
    smsSend: "Send SMS code",
    smsVerify: "Verify and sign in",
    smsCodeSent: "Code sent. Check your messages.",
    smsChangeNumber: "Use a different number",
    smsCancel: "Cancel",
    smsFailed: "SMS sign-in did not finish. Please try again.",
  },
  profile: {
    title: "My Profile",
    subtitle: "Your account, password, and market orders live here.",
    tabAccount: "Logged in account",
    tabPassword: "Reset password",
    tabPurchases: "Purchases & shipping",
    loggedInAs: "Logged in as",
    memberSince: "Member since {date}",
    signedInWithGoogle: "Signed in with Google",
    signedInWithEmail: "Signed in with email and password",
    signedInWithBoth: "Google and email/password are both linked",
    signedInWithSms: "Signed in with phone (SMS)",
    passwordOnlyHint: "Password reset is only available after you log in with email and password.",
    logout: "Log out",
    currentPassword: "Current password",
    newPassword: "New password",
    confirmPassword: "Confirm new password",
    savePassword: "Update password",
    setPassword: "Set a password",
    passwordUpdated: "Password updated.",
    googleOnlyHint:
      "You signed in with Google. Set a password if you also want to log in with email.",
    purchasesEmpty: "No purchases yet. Checkout from the market to see orders here.",
    paymentManagement: "Payment management",
    paymentHint:
      "Stripe Checkout charges the payment methods enabled on this account, including cards and wallets. Saved methods can be updated after a payment.",
    managePayments: "Manage payment methods",
    enabledPayments: "Methods Stripe can charge",
    savedPayments: "Saved payment methods",
    noSavedPayments: "Saved cards and wallets appear here after a Stripe payment.",
    noMembership: "Cocktale does not sell a membership. Each order is charged on its own.",
    shippingTracker: "Shipping tracker",
    noTracking: "Tracking details appear after the order ships.",
    viewOrder: "Open order",
    contactBilling: "Contact support about this payment",
  },
  home: {
    loading: "Cocktale",
  },
  feed: {
    forUser: "For {name}",
    title: "Tonight's cocktail picks, matched to weather and mood",
    rankingHint: "Ranked by local weather, mood, flavor, and drinks you have already tried",
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
    title: "Your cocktail collection and tasting journal",
    collected: "Collected",
    tried: "Cocktails I tried",
  },
  catalogue: {
    title: "Cocktail recipes A–Z, from the classics to modern signatures",
    subtitle:
      "Search classic and modern cocktails by name, spirit, ingredient, glass, or origin — Old Fashioned, Margarita, Espresso Martini, Negroni, and 440+ more.",
    searchPlaceholder: "Search cocktails…",
    count: "{n} cocktails",
    empty: "No cocktails match that search.",
    all: "All",
  },
  journal: {
    title: "Cocktail journal",
    subtitle:
      "Log dates and tasting notes for drinks you have actually made — Cocktale uses that history to sharpen tonight's picks.",
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
    title: "Get help with an order, a recipe, or your account",
    subtitle:
      "Message Cocktale for market orders, refunds, a recipe that looks wrong, sign-in trouble, or a drink you think we are missing. We reply within one business day — no account required.",
    customerService: "Customer service",
    telegram: "Message us on Telegram",
    email: "Email",
    hours: "We typically reply within one business day.",
  },
  terms: {
    title: "Terms of use and responsible drinking",
    updated: "Last updated: 15 August 2026",
  },
  content: {
    recipeNote: "Recipe details come from our cocktail database and are shown in their original language.",
  },
  errors: {
    emailExists: "An account with this email already exists.",
    passwordShort: "Password must be at least 4 characters.",
    invalidCredentials: "Invalid email or password.",
    googleOnly: "This account uses Google sign-in. Continue with Google, or set a password first.",
    smsOnly: "This account uses SMS sign-in. Continue with SMS, or set a password first.",
    passwordMismatch: "New passwords do not match.",
    wrongPassword: "Current password is incorrect.",
  },
};
