// Rich chapter content for books according to category / genre
// Provides 4 to 5 detailed, interesting chapters for every book type

export const categoryChapters = {
  programming: [
    {
      number: 1,
      title: "Chapter 1: The Art of Clean Craftsmanship",
      content: `Writing clean code is like composing good literature: it is meant to be read by humans first, and executed by machines second.

When Robert C. Martin popularized agile software craftsmanship, the central tenet was simple: "Any fool can write code that a computer can understand. Good programmers write code that humans can understand."

Key Principles of Professional Developers:
1. Meaningful Names: Avoid arbitrary abbreviations like \`chkVal()\` or \`d\`. Use intention-revealing names like \`isUserEligibleForLoan\` or \`elapsedTimeInDays\`.
2. The Boy Scout Rule: Always leave the campground cleaner than you found it. Whenever you touch a module, make one small improvement.
3. Single Responsibility: Every function, class, and component should have exactly one reason to change.

"Clean code always looks like it was written by someone who cares. There is nothing obvious that you can do to make it better."`
    },
    {
      number: 2,
      title: "Chapter 2: Functions, Scope & Defensive Design",
      content: `The first rule of functions is that they should be small. The second rule is that they should be smaller than that.

A function should do one thing, do it well, and do it only. If a function contains nested if-else ladders stretching beyond 20 lines, it is trying to solve multiple responsibilities simultaneously.

Techniques for Pristine Functions:
• Step-down Rule: Keep code readable from top to bottom like a narrative. High-level orchestrators call mid-level processors, which call low-level helpers.
• Pure Functions & Immutability: Strive for deterministic outputs without mutating global variables or external references.
• Eliminate Flag Arguments: Passing a boolean like \`render(true)\` declares that your function does two things depending on that flag. Split it into \`renderWithHeader()\` and \`renderWithoutHeader()\`.

"Functions should be verbs, classes should be nouns, and error handling should never be an afterthought."`
    },
    {
      number: 3,
      title: "Chapter 3: Architecture & Loose Coupling",
      content: `Software architecture is the art of drawing lines between components that matter and details that do not.

Separation of Concerns:
High-level policy should not know about low-level delivery mechanisms. Your core business rules (like calculating loan interest or library book due dates) must remain completely decoupled from Express.js routes, React JSX, or MongoDB connection strings.

Core Architectural Milestones:
1. Inversion of Control (IoC): Depend on abstractions (interfaces), never on concrete implementations.
2. Layered Isolation: The database is a detail. The web framework is a detail. The UI is a detail.
3. Resilience by Design: Build systems that fail gracefully with circuit breakers, retry policies, and structured logging.

Good architecture allows you to postpone major technological decisions until you have collected sufficient empirical evidence.`
    },
    {
      number: 4,
      title: "Chapter 4: Refactoring & Technical Debt",
      content: `Refactoring is the disciplined technique of restructuring an existing body of code without altering its external behavior.

Code Smells to Hunt Down:
• Feature Envy: A method that accesses the data of another object more than its own.
• Long Parameter Lists: If a function requires more than 3 arguments, encapsulate them into a parameter object or configuration model.
• Duplicate Logic: DRY (Don't Repeat Yourself). Duplicate logic leads to divergent bug fixes.

When to Refactor:
The Rule of Three: The first time you do something, just get it done. The second time you do something similar, wince at the repetition. The third time, refactor immediately.

"Technical debt is like financial debt: borrowing time now requires paying compounding interest in every future sprint."`
    },
    {
      number: 5,
      title: "Chapter 5: Testing, Reliability & Production Mastery",
      content: `Untested code is broken code by default. Unit tests and integration tests provide the psychological safety necessary to refactor fearlessly.

The Testing Pyramid:
1. Unit Tests: Rapid, isolated, deterministic assertions of individual business logic components.
2. Integration Tests: Verifying database adapters, API routes, and caching layers interact correctly.
3. End-to-End Tests: Simulating real user workflows through login, book issue, and checkout.

The TDD Cycle (Red-Green-Refactor):
• Red: Write a failing unit test asserting the desired behavior.
• Green: Write the bare minimum code to make the test pass.
• Refactor: Clean up structure, improve readability, and eliminate code smells while keeping all tests green.

Mastery is achieved when deploying code to production is a routine, boring event rather than a stressful crisis.`
    }
  ],

  "self help": [
    {
      number: 1,
      title: "Chapter 1: The Surprising Power of 1% Compounding",
      content: `It is so easy to overestimate the importance of one defining moment and underestimate the value of making daily 1% improvements.

The Math of Incremental Growth:
If you can get 1% better each day for one year, you'll end up thirty-seven times better by the time you're done (1.01³⁶⁵ = 37.78). Conversely, if you get 1% worse each day, you'll decline nearly to zero (0.99³⁶⁵ = 0.03).

Habits are the compound interest of self-improvement. Just as money multiplies through compound interest, the effects of your habits multiply as you repeat them.

"You do not rise to the level of your goals. You fall to the level of your systems."`
    },
    {
      number: 2,
      title: "Chapter 2: Identity-Based Habits & The Habit Loop",
      content: `The most effective way to change your habits is not to focus on what you want to achieve, but on who you wish to become.

The Three Layers of Behavior Change:
1. Outcomes: Changing your results (losing weight, passing an exam, reading 20 books).
2. Processes: Changing your habits and systems (studying for 45 minutes every evening).
3. Identity: Changing your beliefs and worldview (believing "I am a disciplined learner").

The Habit Loop:
• Cue: The trigger that initiates the behavior.
• Craving: The motivational force behind the action.
• Response: The actual habit you perform.
• Reward: The satisfaction that teaches your brain to repeat it.

Every action you take is a vote for the type of person you wish to become.`
    },
    {
      number: 3,
      title: "Chapter 3: The Four Laws of Lasting Change",
      content: `To build good habits, apply the Four Laws of Behavior Change:

1. Make it Obvious: Design your environment. If you want to read more books, place your current book on your pillow in the morning.
2. Make it Attractive: Bundle a habit you need with a habit you enjoy (e.g., only listen to your favorite podcast while walking or working out).
3. Make it Easy: Reduce friction. Prime your workspace the night before. Follow the Two-Minute Rule: when starting a new habit, it should take less than two minutes to begin.
4. Make it Satisfying: Immediate rewards reinforce repetition. Track your progress with a visible visual habit calendar.

"Environment is the invisible hand that shapes human behavior."`
    },
    {
      number: 4,
      title: "Chapter 4: Breaking Bad Habits & The Plateau of Latent Potential",
      content: `When you are trying to break an undesirable pattern, invert the four laws:
• Make it Invisible: Remove triggers from your eyesight (put phone in another room).
• Make it Unattractive: Reframe your mindset to focus on the negative costs of the behavior.
• Make it Difficult: Increase friction (e.g., unplug your gaming console after each session).
• Make it Unsatisfying: Create an accountability partner who checks on your commitments.

The Plateau of Latent Potential:
Progress is rarely linear. Breakthrough moments are often the result of many previous actions that build up the potential required to unleash a major change. Work is never wasted; it is simply being stored.`
    },
    {
      number: 5,
      title: "Chapter 5: Ikigai & Sustained Life Fulfillment",
      content: `True life satisfaction lies at the intersection of four vital dimensions, known in Japanese culture as Ikigai:

1. What you love (Your passion)
2. What the world needs (Your mission)
3. What you can get paid for (Your profession)
4. What you are good at (Your vocation)

When all four dimensions harmonize, daily work ceases to feel like burdensome friction. Instead, it transforms into an engaging flow state characterized by purposeful focus and calm vitality.

"Only staying active will make you want to live a hundred years."`
    }
  ],

  fiction: [
    {
      number: 1,
      title: "Chapter 1: Whispers in the Shadows",
      content: `The clocks were striking thirteen. A chill wind sliced through the cobblestone alleys as the neon signs flickered above the silent metropolis.

Jonathan adjusted his trench coat and stepped beneath the flickering streetlamp. In his hand lay the sealed parchment, its wax seal bearing the insignia of an empire long thought buried in history.

"You should not have come alone," a raspy voice murmured from the doorway.

Jonathan did not flinch. "In times of deceit, truth is the only companion worth keeping."

The shadows stirred. The game had finally begun, and the rules of the old world no longer applied.`
    },
    {
      number: 2,
      title: "Chapter 2: The Forbidden Archive",
      content: `Deep beneath the Citadel lay the Great Archive — an endless labyrinth of marble pillars and towering shelves holding centuries of forbidden manuscripts.

Dust motes danced in the pale moonlight that filtered through the vaulted stained glass. Here, history was not merely recorded; it was preserved as living memory.

As Jonathan ran his fingers along the leather-bound tomes, a faint golden glyph illuminated upon the spine of an unmarked volume. It was said that whoever unlocked this text could decipher the prophecies that governed the rise and fall of kings.

He opened the first page, and the room was suddenly filled with the hum of arcane energy.`
    },
    {
      number: 3,
      title: "Chapter 3: The Gathering Storm",
      content: `Thunder rumbled across the distant mountain passes. The council was divided, whispers of treason echoing within the gilded grand chamber.

"If the northern gates fall," Lady Eleanor warned, her hand resting upon her hilt, "the valley will be drowned in ash before the harvest moon."

Yet the elders remained silent, blinded by centuries of illusory peace. They had forgotten that empires do not perish from external assault, but from the quiet rot that festers within their own walls.

Jonathan stepped into the light of the council torches, holding high the shattered seal of the Vanguard. Every voice in the chamber ceased.`
    },
    {
      number: 4,
      title: "Chapter 4: The Trials of Truth",
      content: `The crossing of the Abyss of Sorrows tested the resolve of every traveler who dared tread its suspended bridges.

Beneath them swirled mists so dense they mirrored the memories of those who gazed too long into the depths. Each step required absolute conviction. Doubts materialized as howling gales, threatening to cast the wanderer into oblivion.

"Keep your eyes on the northern star," Jonathan urged his companions. "The abyss preys on what you regret, not on who you are."

With a final collective leap across the fractured stones, the mist parted, revealing the ancient sanctuary of the First Sentinels.`
    },
    {
      number: 5,
      title: "Chapter 5: A Dawn Reclaimed",
      content: `The morning sun broke across the horizon, casting crimson rays across the battlefield and the glistening spires of the capital.

The struggle had been fierce, but the reign of silence had shattered. For the first time in three generations, the grand bells of the central tower pealed with clear, unhindered notes of liberty.

Jonathan stood upon the citadel parapet, looking out across the awakening lands. The journey had altered everything, yet the greatest lesson remained: courage is not the absence of fear, but the triumph over it.

A new chapter of history was ready to be written.`
    }
  ],

  finance: [
    {
      number: 1,
      title: "Chapter 1: The Psychology of Wealth vs Money",
      content: `Doing well with money has a little to do with how smart you are and a lot to do with how you behave. And behavior is hard to teach, even to really smart people.

The Critical Distinction:
• Riches: Having high current income, visible possessions, luxury vehicles, and lavish spending.
• Wealth: The options, flexibility, and assets you have not spent. Wealth is the financial freedom to wake up in the morning and say, "I can do whatever I want today."

Real wealth is an unpurchased Ferrari and an unconsumed paycheck. It is silence, security, and independent sovereignty.`
    },
    {
      number: 2,
      title: "Chapter 2: Compounding & The Price of Admission",
      content: `Warren Buffett’s skill is investing, but his secret is time. More than 99% of his wealth was accumulated after his 50th birthday.

The Power of Compounding:
If you start investing ₹5,000 monthly at an annualized return of 12% at age 20 versus age 30, the 10-year gap creates a wealth difference of several crores by retirement age.

The Volatility Fee:
Market volatility is not a fine to be avoided; it is an admission fee to long-term outperformance. Those who panic during market corrections pay the fee without claiming the ride.`
    },
    {
      number: 3,
      title: "Chapter 3: Assets vs Liabilities & Cashflow",
      content: `The rich buy assets. The poor only have expenses. The middle class buys liabilities they think are assets.

Definitions That Change Everything:
• Asset: Anything that puts cash flow into your pocket regardless of whether you work or not (dividend stocks, real estate rental yield, intellectual property, profitable business equity).
• Liability: Anything that takes cash flow out of your pocket (luxury car loan payments, excessive credit card interest, non-yielding consumer gadgets).

Focus primarily on expanding your asset column until your cash flow exceeds all baseline monthly expenses.`
    },
    {
      number: 4,
      title: "Chapter 4: Controlling Your Lifestyle Creep",
      content: `The easiest way to gain financial freedom is not to increase your income by 500%, but to master your desires and avoid lifestyle inflation.

Parkinson's Law of Expenses:
"Expenses invariably rise to meet income unless deliberate discipline intervenes."

When people receive a promotion or increment, they instantly upgrade their apartment, clothes, and dinner venues, locking themselves into the same hamster wheel of dependency.

The 50/30/20 Rule:
• 50% for Essentials (housing, food, healthcare)
• 30% for Lifestyle & Discretionary
• 20% for Wealth Accumulation & Debt Elimination`
    },
    {
      number: 5,
      title: "Chapter 5: Financial Freedom & The Freedom Number",
      content: `True wealth is measured in time, not currency symbols. If your monthly expenses are ₹40,000 and you have ₹480,000 in liquid reserves, your wealth is exactly 12 months.

Calculating Your Freedom Number:
Using the classic 4% safe withdrawal rule, your target retirement corpus is 25 times your annual living expenses.

The Hierarchy of Financial Peace:
1. Debt Zero: Elimination of high-interest consumer debt.
2. Emergency Buffer: 6 months of non-negotiable living expenses in liquid funds.
3. Automated Wealth Engine: Systematically investing into index funds and productive equities every salary cycle.

Money buys freedom, but only if you value freedom more than external prestige.`
    }
  ],

  history: [
    {
      number: 1,
      title: "Chapter 1: The Cognitive Revolution",
      content: `One hundred thousand years ago, Earth was inhabited by at least six different human species. Today, only Homo sapiens remains.

The Cognitive Spark:
Between 70,000 and 30,000 years ago, accidental genetic mutations rewired the neural wiring of Sapiens, allowing them to communicate about things that do not exist in the physical realm.

This was the birth of Fiction: myths, religions, legal contracts, and money. Ants and wolves can cooperate in small packs based on intimate acquaintance; only Sapiens can cooperate flexibly in millions around shared imaginative constructs.`
    },
    {
      number: 2,
      title: "Chapter 2: The Agricultural Paradox",
      content: `About 10,000 years ago, Sapiens began domesticating wheat, barley, goats, and cattle. Historians long celebrated this as a glorious leap forward, yet evidence suggests it was history’s biggest trap.

The Wheat Domesticator:
Wheat did not domesticate Sapiens; Sapiens domesticated wheat. The average forager worked fewer hours, ate a far more varied diet, and suffered less from famine and epidemic diseases than the average peasant laborer.

Yet agriculture enabled populations to explode exponentially, creating cities, empires, and monumental architecture at the cost of individual backbreaking labor.`
    },
    {
      number: 3,
      title: "Chapter 3: The Three Unifiers of Humanity",
      content: `Across millennia, the fragmented tribes of Earth were steadily woven into a single global civilization through three universal catalysts:

1. Money: The ultimate system of mutual trust. Money is the only trust system created by humans that can bridge almost any cultural, religious, or political divide.
2. Empires: Political entities that ruled over diverse populations with flexible borders and unified administrative laws.
3. Universal Religions: Providing transcendent moral frameworks that bound strangers together under common codes of duty.`
    },
    {
      number: 4,
      title: "Chapter 4: The Scientific Awakening & Empire",
      content: `The Scientific Revolution began not with the discovery of new truths, but with the revolutionary discovery of human ignorance: "Ignoramus — We do not know."

Previous traditions believed everything of importance had already been revealed by ancient gods or sages. Modern science proposed that by empirical observation and mathematical models, humans could master diseases, navigation, energy, and industry.

When European imperialism wedded scientific exploration, it produced modern capitalism, global maritime networks, and unprecedented technological acceleration.`
    },
    {
      number: 5,
      title: "Chapter 5: The Anthropocene & Future Horizons",
      content: `In the twenty-first century, Homo sapiens stands on the threshold of transcending natural selection itself.

Through genetic engineering, artificial intelligence, and cyborg interfaces, our descendants will likely differ from us far more than we differ from Neanderthals.

As we acquire god-like capabilities to manipulate life, consciousness, and the planetary climate, the most critical question remains:

"What do we want to want? Is there anything more dangerous than dissatisfied and irresponsible gods who don't know what they want?"`
    }
  ]
};

// Helper to get chapters for any book based on title or category
export function getBookChapters(book) {
  // If book has custom saved chapters from Admin, prioritize them!
  if (book?.chapters && Array.isArray(book.chapters) && book.chapters.length > 0) {
    return book.chapters.map((ch, idx) => ({
      number: ch.number || idx + 1,
      title: ch.title || `Chapter ${idx + 1}`,
      content: ch.content || "",
      displayTitle: `${book?.title ? `[${book.title}] ` : ""}${ch.title || `Chapter ${idx + 1}`}`,
    }));
  }

  const cat = (book?.category || "").toLowerCase();
  const title = (book?.title || "").toLowerCase();

  let chapters = null;

  if (cat.includes("program") || title.includes("code") || title.includes("algorithm")) {
    chapters = categoryChapters.programming;
  } else if (cat.includes("self") || cat.includes("product") || title.includes("habit") || title.includes("ikigai")) {
    chapters = categoryChapters["self help"];
  } else if (cat.includes("finance") || title.includes("money") || title.includes("rich") || title.includes("dad")) {
    chapters = categoryChapters.finance;
  } else if (cat.includes("history") || title.includes("sapiens")) {
    chapters = categoryChapters.history;
  } else {
    // Default to Fiction / Classic / Fantasy
    chapters = categoryChapters.fiction;
  }

  // Personalize chapter titles with book's name
  return chapters.map((ch, idx) => ({
    ...ch,
    displayTitle: `${book?.title ? `[${book.title}] ` : ""}${ch.title}`,
  }));
}
