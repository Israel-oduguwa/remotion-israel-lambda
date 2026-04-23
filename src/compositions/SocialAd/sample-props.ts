import type { SocialAdProps } from "./schema";

const baseAd: SocialAdProps = {
  adId: "launch-batch-august",
  campaignId: "summer-enrollment",
  templateFamily: "proof-driven",
  brandName: "SkillSprint Academy",
  ctaLabel: "Apply for the next cohort",
  ctaUrl: "https://skillsprint.academy/apply",
  trackingSlug: "tiktok-july-proof",
  aspectRatio: "9:16",
  logoUrl:
    "https://images.pexels.com/photos/3861969/pexels-photo-3861969.jpeg?auto=compress&cs=tinysrgb&w=400",
  primaryColor: "#7DE2D1",
  secondaryColor: "#FF7A59",
  textColor: "#F8FAFC",
  accentColor: "#F7E58A",
  surfaceColor: "#08101F",
  voiceoverUrl: "https://samplelib.com/lib/preview/mp3/sample-15s.mp3",
  targetDurationSec: 42,
  scenes: [
    {
      id: "hook-1",
      role: "hook",
      headline: "Still waiting for students to trust your course?",
      supportingText:
        "The first three seconds have to stop the scroll and promise a real outcome.",
      badgeLabel: "Hook",
      badgeValue: "3 sec",
      mediaUrl:
        "https://images.pexels.com/photos/3183150/pexels-photo-3183150.jpeg?auto=compress&cs=tinysrgb&w=1200",
      mediaType: "image",
      captionText:
        "Still waiting for students to trust your course? Your first three seconds need a stronger hook.",
    },
    {
      id: "pain-1",
      role: "pain",
      headline: "Generic videos make every offer feel the same",
      supportingText:
        "If every ad uses the same pacing, same layout, and same weak CTA, people scroll right past it.",
      badgeLabel: "Problem",
      badgeValue: "Low retention",
      mediaUrl:
        "https://images.pexels.com/photos/5212324/pexels-photo-5212324.jpeg?auto=compress&cs=tinysrgb&w=1200",
      mediaType: "image",
      captionText:
        "Generic videos make every offer feel the same, and low retention kills enrollments.",
    },
    {
      id: "solution-1",
      role: "solution",
      headline: "Use dynamic scenes built around the voiceover",
      supportingText:
        "Remotion packages your AI script, media, and OpenAI voiceover into a sharper story with clean timing.",
      badgeLabel: "System",
      badgeValue: "AI + Remotion",
      mediaUrl:
        "https://images.pexels.com/photos/5428836/pexels-photo-5428836.jpeg?auto=compress&cs=tinysrgb&w=1200",
      mediaType: "image",
      captionText:
        "Use dynamic scenes built around the voiceover so the visuals feel intentional, not recycled.",
    },
    {
      id: "proof-1",
      role: "proof",
      headline: "Show proof, not promises",
      supportingText:
        "Highlight outcomes, real student wins, and trust signals so the offer feels credible immediately.",
      badgeLabel: "Goal",
      badgeValue: "4,000 students",
      mediaUrl:
        "https://images.pexels.com/photos/3184423/pexels-photo-3184423.jpeg?auto=compress&cs=tinysrgb&w=1200",
      mediaType: "image",
      captionText:
        "Show proof, not promises. Outcomes and trust signals move people closer to applying.",
    },
    {
      id: "cta-1",
      role: "cta",
      headline: "Turn every generated ad into a clear enrollment push",
      supportingText:
        "Keep the message simple, direct, and impossible to miss with a final CTA that actually lands.",
      badgeLabel: "CTA",
      badgeValue: "Apply now",
      mediaUrl:
        "https://images.pexels.com/photos/3769021/pexels-photo-3769021.jpeg?auto=compress&cs=tinysrgb&w=1200",
      mediaType: "image",
      captionText:
        "Turn every generated ad into a clear enrollment push, then ask them to apply now.",
    },
  ],
  captions: {
    phrases: [
      { sceneId: "hook-1", text: "Still waiting for students to trust your course?" },
      { sceneId: "hook-1", text: "The first three seconds decide if they stay." },
      { sceneId: "pain-1", text: "Generic videos make every offer feel the same." },
      { sceneId: "solution-1", text: "Match motion, media, and voiceover with a stronger story." },
      { sceneId: "proof-1", text: "Lead with proof so the promise feels real." },
      { sceneId: "cta-1", text: "Apply for the next cohort today." },
    ],
  },
};

export const sampleSocialAds: Record<
  "proofDriven" | "problemSolution" | "storyTestimonial",
  SocialAdProps
> = {
  proofDriven: baseAd,
  problemSolution: {
    ...baseAd,
    adId: "launch-batch-august-problem-solution",
    templateFamily: "problem-solution",
    trackingSlug: "instagram-july-problem-solution",
  },
  storyTestimonial: {
    ...baseAd,
    adId: "launch-batch-august-story",
    templateFamily: "story/testimonial",
    trackingSlug: "youtube-shorts-july-story",
  },
};
