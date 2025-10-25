// CELPIP prompt catalog and helper utilities for random rotations.

export const TASKS = {
  task1: {
    label: "Task 1 (Email/Letter)",
    minutes: 27,
    description: "Email writing (27 minutes).",
    prompts: [
      {
        id: "t1-1",
        title: "Gym Membership Refund",
        text:
          "You recently canceled a gym membership but were still charged for next month. Write an email to the gym manager explaining the situation and requesting a refund.",
      },
      {
        id: "t1-2",
        title: "Noisy Neighbors",
        text:
          "Your neighbors have been making noise late at night. Write to your building manager explaining the disturbance and asking for help to resolve it.",
      },
      {
        id: "t1-3",
        title: "Delayed Flight Compensation",
        text:
          "Your flight was delayed for six hours, causing you to miss an important meeting. Write to the airline customer service requesting compensation.",
      },
      {
        id: "t1-4",
        title: "Broken Appliance",
        text:
          "You purchased a dishwasher that stopped working within a week. Write an email to the store explaining the issue and asking for a repair or replacement.",
      },
      {
        id: "t1-5",
        title: "Library Volunteer",
        text:
          "You want to volunteer at your local library's weekend reading program. Write an email introducing yourself and explaining why you would be a good volunteer.",
      },
      {
        id: "t1-6",
        title: "Heating Maintenance Request",
        text:
          "The heating in your apartment has not been working for three days during winter. Write to the property manager requesting urgent maintenance.",
      },
      {
        id: "t1-7",
        title: "Declining an Invitation",
        text:
          "A colleague invited you to speak at a weekend event, but you have family commitments. Write a polite email declining the invitation and suggesting an alternative way to help.",
      },
      {
        id: "t1-8",
        title: "Remote Work Request",
        text:
          "You would like to work from home one day a week to manage family responsibilities. Write to your supervisor requesting this arrangement and explaining how you will stay productive.",
      },
      {
        id: "t1-9",
        title: "Subscription Cancellation",
        text:
          "You canceled a streaming service, but the company continued to charge you. Write to the customer support team asking for confirmation of cancellation and a refund.",
      },
      {
        id: "t1-10",
        title: "School Field Trip Reply",
        text:
          "Your child's teacher asked for parent chaperones for a field trip. Write an email confirming your availability and asking any necessary questions.",
      },
    ],
  },
  task2: {
    label: "Task 2 (Opinion/Survey)",
    minutes: 26,
    description: "Opinion response (26 minutes).",
    prompts: [
      {
        id: "t2-1",
        title: "Public Park Renovation",
        text:
          "Your city plans to renovate a public park with either a playground for children or a fitness area for adults. Which option do you support and why?",
      },
      {
        id: "t2-2",
        title: "Library Funding",
        text:
          "The local government is deciding whether to increase funding for the public library or for road maintenance. Which should be prioritized and why?",
      },
      {
        id: "t2-3",
        title: "Bike Lanes vs Parking",
        text:
          "Your city is deciding whether to remove street parking to add protected bike lanes. Do you agree with this change? Explain your reasoning.",
      },
      {
        id: "t2-4",
        title: "Four-Day Workweek",
        text:
          "A company is considering moving to a four-day workweek with longer hours each day. Do you support this change? Provide reasons for your opinion.",
      },
      {
        id: "t2-5",
        title: "Online vs. In-Person Classes",
        text:
          "A college is debating whether to offer more online classes or require students to attend in person. Which approach do you prefer and why?",
      },
      {
        id: "t2-6",
        title: "Support Local Markets",
        text:
          "The city council wants to promote either local farmer's markets or large supermarkets. Which should receive funding and why?",
      },
      {
        id: "t2-7",
        title: "School Uniform Policy",
        text:
          "Your school district is considering mandatory uniforms for students. Do you agree with this policy? Give reasons to support your position.",
      },
      {
        id: "t2-8",
        title: "Tourism vs. Environment",
        text:
          "A coastal town must choose between expanding tourism facilities or investing in environmental protection. Which should be prioritized and why?",
      },
      {
        id: "t2-9",
        title: "Public Art Funding",
        text:
          "Your city can either fund new public art installations or improve public safety programs. Which option should be chosen and why?",
      },
      {
        id: "t2-10",
        title: "Renewable Energy Investment",
        text:
          "The government is deciding whether to invest more in renewable energy projects or keep electricity prices low in the short term. Which do you support? Explain your reasoning.",
      },
    ],
  },
};

export const PROMPT_DISPLAY_COUNT = 3;

export function getPromptById(taskKey, promptId) {
  return getPrompts(taskKey).find((prompt) => prompt.id === promptId) || null;
}

export function getPrompts(taskKey) {
  return TASKS[taskKey]?.prompts || [];
}

export function getRandomPrompt(taskKey, excludeId) {
  const prompts = getPrompts(taskKey);
  if (!prompts.length) return null;
  const filtered = prompts.filter((item) => item.id !== excludeId);
  const pool = filtered.length ? filtered : prompts;
  return pool[Math.floor(Math.random() * pool.length)] || null;
}

export function getRandomTask1(excludeId) {
  return getRandomPrompt("task1", excludeId);
}

export function getRandomTask2(excludeId) {
  return getRandomPrompt("task2", excludeId);
}

export function getPromptSelection(taskKey, includeId, count = PROMPT_DISPLAY_COUNT) {
  const prompts = getPrompts(taskKey);
  if (!prompts.length) return [];
  const uniqueCount = Math.min(count, prompts.length);
  const result = [];

  if (includeId) {
    const included = getPromptById(taskKey, includeId);
    if (included) {
      result.push(included);
    }
  }

  const excludeIds = new Set(result.map((item) => item.id));
  const shuffled = shuffle(prompts.filter((item) => !excludeIds.has(item.id)));

  for (const prompt of shuffled) {
    if (result.length >= uniqueCount) break;
    result.push(prompt);
  }

  return result.slice(0, uniqueCount);
}

function shuffle(array) {
  const copied = [...array];
  for (let i = copied.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [copied[i], copied[j]] = [copied[j], copied[i]];
  }
  return copied;
}
