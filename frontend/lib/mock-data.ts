import { Voice, Generation, User } from './types'

export const mockUser: User = {
  id: 'user-1',
  email: 'demo@voicebox.com',
  name: 'Demo User',
}

export const mockVoices: Voice[] = [
  {
    id: 'voice-1',
    userId: 'user-1',
    name: 'My Writing Voice',
    sourceType: 'own',
    samples: [
      "I'm passionate about building products that matter. Every line of code is an opportunity to create something meaningful.",
      "The best ideas come from listening to users. When we shipped that feature, the feedback was incredible.",
      "Technical excellence isn't just about performance—it's about clarity. Code that speaks for itself is code that lasts.",
    ],
    profile: {
      sentenceRhythm: 'Mix of short punchy sentences with occasional longer reflective ones',
      vocabularyTendencies: 'Technical but approachable, uses "meaningful", "incredible", "excellence"',
      punctuationHabits: 'Occasional em dashes for emphasis, conversational tone',
      structuralHabits: 'Often starts with personal perspective, moves to broader insight',
    },
    createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'voice-2',
    userId: 'user-1',
    name: 'Professional Newsletter',
    sourceType: 'own',
    samples: [
      'This week we saw significant progress on our Q3 roadmap. The team shipped three major features and resolved critical infrastructure issues.',
      'Looking ahead, we recommend monitoring these key metrics closely. Data-driven decisions will be essential for Q4.',
      'Our analysis indicates strong market demand. We should accelerate the timeline for this initiative.',
    ],
    profile: {
      sentenceRhythm: 'Formal, structured rhythm with consistent sentence length',
      vocabularyTendencies: 'Business-focused: progress, roadmap, metrics, insights, analysis',
      punctuationHabits: 'Minimal punctuation, straightforward and direct',
      structuralHabits: 'Topic sentences followed by supporting details, data-driven',
    },
    createdAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'voice-3',
    userId: 'user-1',
    name: "Paul Graham's Style",
    sourceType: 'writer',
    samples: [
      'One of the most surprising things I learned is that this is a much simpler problem than most people think.',
      'The reason we miss things is usually not that we lack the intellectual capacity to see them, but that we lack the predisposition to look.',
      'What makes these discoveries interesting is precisely how stupid they seem after they are made.',
    ],
    profile: {
      sentenceRhythm: 'Contemplative, varies between simple observations and complex ideas',
      vocabularyTendencies: 'Uses "surprising", "discover", "precisely", "usually", philosophical but grounded',
      punctuationHabits: 'Frequent use of "is" constructions for emphasis, comma usage',
      structuralHabits: 'Leads with counterintuitive observation, builds argument gradually',
    },
    createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
  },
]

export const mockGenerations: Record<string, Generation[]> = {
  'voice-1': [
    {
      id: 'gen-1',
      userMsg: 'We just launched our new analytics dashboard',
      reply: 'That&apos;s fantastic! Launching analytics is always a milestone moment. The dashboard gives your users real clarity into what matters—and that kind of transparency builds trust. How has the response been so far?',
      draft:
        'You have launched a new analytics dashboard. This is a significant release. Users will now have access to data visualization and metrics.',
      createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: 'gen-2',
      userMsg: 'Trying to decide between two technical approaches',
      reply: 'This is exactly where clarity matters most. Both approaches probably have their merits—the question is which one scales with your team and your vision. What&apos;s pulling you toward each one? Sometimes the answer reveals itself once you articulate the tradeoffs.',
      draft:
        'You are considering two technical implementations. Each has advantages. You should evaluate based on your team capacity and future requirements.',
      createdAt: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
    },
  ],
  'voice-2': [
    {
      id: 'gen-3',
      userMsg: 'Q3 results exceeded targets by 15%',
      reply: 'Excellent performance in Q3 with results exceeding targets by 15%. This strong finish positions us well for accelerated growth in Q4. We recommend capitalizing on this momentum with expanded marketing initiatives.',
      draft: 'Results for Q3 exceeded targets. The variance was positive at 15%. This indicates strong execution.',
      createdAt: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
    },
  ],
}
