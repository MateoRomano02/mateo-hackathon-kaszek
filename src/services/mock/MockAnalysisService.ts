import type { AIAnalysisService } from '@/services/ai/AIAnalysisService'
import type { OnboardingData, UserProfile, SkillStock, OnboardingChatResult } from '@/entities/user/types'
import type { SourceMetadata, CanonicalInsight, GeneratedProject } from '@/entities/content/types'

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))
const simulateStream = async (text: string, onStream: (t: string) => void) => {
  for (const char of text) { await delay(18); onStream(char) }
}

const SCRIPTED_RESPONSES = [
  'Great to have you! What tools do you use in your day to day work?',
  'Solid stack. Now tell me, what would you like to be able to do with AI that you can\'t today?',
  'Got it. I\'m going to build your personalized skill diagnostic. Give me a moment...',
]

const MOCK_SKILL_STOCKS: SkillStock[] = [
  { id: 'sk-1', skill: 'AI Prompt Engineering', status: 'rising', rationale: 'Explosive demand for content and analysis.', priorityScore: 9.5, suggestedAction: 'Take on real AI copywriting projects.' },
  { id: 'sk-2', skill: 'Marketing Automation with AI', status: 'rising', rationale: 'Make + ChatGPT replace manual workflows.', priorityScore: 9.0, suggestedAction: 'Build an automated lead nurturing flow.' },
  { id: 'sk-3', skill: 'Predictive Analytics', status: 'rising', rationale: 'GA4 + AI attribution models.', priorityScore: 8.5, suggestedAction: 'Set up an attribution model in GA4.' },
  { id: 'sk-4', skill: 'Google Ads (Performance)', status: 'stable', rationale: 'Solid foundation. Essential but not growing.', priorityScore: 7.0, suggestedAction: 'Keep certifications up to date.' },
  { id: 'sk-5', skill: 'Email Marketing', status: 'stable', rationale: 'High and predictable ROI.', priorityScore: 6.5, suggestedAction: 'Optimize sequences with A/B testing.' },
  { id: 'sk-6', skill: 'Content Strategy', status: 'stable', rationale: 'Inbound pillar. AI changes execution, not strategy.', priorityScore: 7.2, suggestedAction: 'Integrate AI as a tool.' },
  { id: 'sk-7', skill: 'Manual Technical SEO', status: 'degrading', rationale: 'Ahrefs and Screaming Frog automate 80%.', priorityScore: 4.0, suggestedAction: 'Migrate to automated tools.' },
  { id: 'sk-8', skill: 'Manual A/B Testing', status: 'degrading', rationale: 'Optimizely and VWO automate it.', priorityScore: 3.5, suggestedAction: 'Learn automated testing.' },
  { id: 'sk-9', skill: 'Manual Excel Reports', status: 'gone', rationale: 'Real-time dashboards replaced them.', priorityScore: 1.0, suggestedAction: 'Archive. Use dashboards.' },
  { id: 'sk-10', skill: 'Keyword Stuffing', status: 'gone', rationale: 'Google penalizes it. Obsolete.', priorityScore: 0, suggestedAction: 'Remove from any strategy.' },
]

export const mockAnalysisService: AIAnalysisService = {
  async analyzeOnboarding(data: OnboardingData): Promise<UserProfile> {
    await delay(600)
    return { id: crypto.randomUUID(), name: 'User', role: data.role, seniority: data.seniority, stack: data.stack, createdAt: new Date().toISOString() }
  },

  async analyzeSkillPortfolio(): Promise<SkillStock[]> {
    await delay(1200)
    return MOCK_SKILL_STOCKS
  },

  async conductOnboardingChat(
    messages: { role: 'user' | 'assistant'; content: string }[],
    onStream: (text: string) => void,
  ): Promise<OnboardingChatResult> {
    await delay(400)
    const userMsgs = messages.filter((m) => m.role === 'user')
    const turn = userMsgs.length - 1
    if (turn >= 2) {
      const text = 'Excellent! I have your profile. Generating diagnostic...'
      await simulateStream(text, onStream)
      return { type: 'profile_complete', profile: { id: crypto.randomUUID(), name: 'User', role: 'marketer', seniority: 'mid', stack: ['Google Ads', 'Meta Ads', 'ChatGPT', 'GA4'], goals: ['Automate campaigns'], painPoints: ['Repetitive tasks'], summary: 'Mid-level marketer looking to integrate AI.', createdAt: new Date().toISOString() }, content: text }
    }
    const text = SCRIPTED_RESPONSES[turn] ?? SCRIPTED_RESPONSES[SCRIPTED_RESPONSES.length - 1]
    await simulateStream(text, onStream)
    return { type: 'message', content: text }
  },

  async evaluateSource(): Promise<SourceMetadata> {
    await delay(800)
    return {
      author: 'Marketing AI Institute',
      domainAuthority: 'industry_blog',
      freshnessDate: '2026-03-15',
      sourceType: 'secondary',
      credibilityScore: 7.5,
      credibilityReason: 'Specialized blog with track record in AI marketing coverage. Secondary source referencing data from official platforms.',
    }
  },

  async extractCanonicalInsights(): Promise<{ insights: CanonicalInsight[]; overallRelevance: number }> {
    await delay(1200)
    return {
      overallRelevance: 8.5,
      insights: [
        {
          id: crypto.randomUUID(),
          title: 'Meta Advantage+ replaces manual targeting',
          insight: 'Meta has migrated most of its campaigns to Advantage+, an AI system that automates audiences, creatives, and bids. Manual targeting loses effectiveness against the algorithm.',
          confidenceLevel: 'high',
          confidenceScore: 9.0,
          validationReason: 'Backed by official Meta announcements and published performance data.',
          evidence: [
            { exactQuote: 'Advantage+ campaigns now account for over 60% of ad spend on Meta platforms', inferenceFlag: false },
            { exactQuote: 'Manual audience targeting showed 23% lower ROAS compared to AI-optimized campaigns in Q4 2025', inferenceFlag: false },
          ],
          relatedSkills: [
            { skill: 'Marketing Automation with AI', statusImpact: 'rising', reason: 'Advantage+ is a direct use case of AI automation in ads.' },
            { skill: 'Meta Ads Manual Targeting', statusImpact: 'degrading', reason: 'Manual targeting loses effectiveness vs. Meta\'s algorithm.' },
          ],
          contradictions: [],
          category: 'news',
        },
        {
          id: crypto.randomUUID(),
          title: 'Prompt engineering for ads generates measurable ROI',
          insight: 'Teams using structured prompts for ad copy variants reduce creative production time by 70% and improve CTR by 15% on average.',
          confidenceLevel: 'medium',
          confidenceScore: 7.0,
          validationReason: 'Case study data, not controlled studies. Limited company sample.',
          evidence: [
            { exactQuote: 'Teams using structured prompts for ad copy generation reduced creative production time by 70%', inferenceFlag: false },
            { exactQuote: 'The resulting AI-generated variants showed an average 15% improvement in CTR', inferenceFlag: false },
          ],
          relatedSkills: [
            { skill: 'AI Prompt Engineering', statusImpact: 'rising', reason: 'Direct evidence that prompting generates measurable marketing results.' },
          ],
          contradictions: [
            { description: 'Some creatives argue that AI-generated copy lacks an authentic "brand voice".', resolution: 'The article suggests using AI for variants, not to replace creative strategy.' },
          ],
          category: 'case_study',
        },
      ],
    }
  },

  async generateProject(): Promise<GeneratedProject> {
    await delay(1500)
    return {
      id: crypto.randomUUID(), title: 'Create your first AI ad flow', description: 'Build a flow in Make that generates copy variants with Claude.', difficulty: 'beginner', estimatedTime: '2 hours',
      steps: [
        { step: 1, title: 'Create a Make account', description: 'Sign up at make.com and create a new scenario.' },
        { step: 2, title: 'Set up trigger', description: 'Use Google Sheet as input: product, audience, tone.' },
        { step: 3, title: 'Connect Claude', description: 'HTTP module that calls the Anthropic API.' },
        { step: 4, title: 'Generate variants', description: 'Prompt for 5 headline + description variants.' },
        { step: 5, title: 'Output to Sheet', description: 'Results to another tab in the Google Sheet.' },
      ],
      resources: [
        { title: 'Make.com Tutorials', url: 'https://www.make.com/en/help/tutorials', type: 'tutorial' },
        { title: 'Anthropic API Docs', url: 'https://docs.anthropic.com', type: 'documentation' },
      ],
      expectedOutcome: 'A working flow that automatically generates ad copy.', skillTarget: 'AI Prompt Engineering', createdAt: new Date().toISOString(),
    }
  },
}
