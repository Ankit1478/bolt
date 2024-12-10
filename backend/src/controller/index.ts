import express, { Request, Response } from "express";
import { BASE_PROMPT, getSystemPrompt } from "../prompts/prompts.js";
import { basePrompt as nodeBasePrompt } from "../defaults/node.js";
import { basePrompt as reactBasePrompt } from "../defaults/react.js";
import { basePrompt as nextBasePrompt } from "../defaults/next.js";
import OpenAI from "openai";
import dotenv from 'dotenv'
dotenv.config()

const openai = new OpenAI({
  apiKey: process.env.X_KEY,
  baseURL: "https://api.x.ai/v1",
});


export const templateController = async (req: Request, res: Response) => {
  const prompt = req.body.prompt;

  const completion = await openai.chat.completions.create({
    model: "grok-beta",
    max_tokens: 200,
    messages: [
      { role: "system", content: "Return either node , react or next based on what do you think this project should be. Only return a single word either 'node' , 'react' or 'next'. Do not return anything extra"},
      { role: "user", content: prompt },
    ],
  });

  console.log(completion.choices[0].message.content);

  const answer = (completion.choices[0].message).content;
  if (answer === "react") {
    res.json({
      prompts: [
        BASE_PROMPT,
        `Here is an artifact that contains all files of the project visible to you.\nConsider the contents of ALL files in the project.\n\n${reactBasePrompt}\n\nHere is a list of files that exist on the file system but are not being shown to you:\n\n  - .gitignore\n  - package-lock.json\n`,
      ],
      uiPrompts: [reactBasePrompt],
    });
    return;
  }

  if (answer === "next") {
    res.json({
      prompts: [
        BASE_PROMPT,
        `Here is an artifact that contains all files of the project visible to you.\nConsider the contents of ALL files in the project.\n\n${nextBasePrompt}\n\nHere is a list of files that exist on the file system but are not being shown to you:\n\n  - .gitignore\n  - package-lock.json\n  - .bolt/ignore\n  - .bolt/prompt\n  - hooks/use-toast.ts\n  - components/ui/accordion.tsx\n  - components/ui/alert-dialog.tsx\n  - components/ui/alert.tsx\n  - components/ui/aspect-ratio.tsx\n  - components/ui/avatar.tsx\n  - components/ui/badge.tsx\n  - components/ui/breadcrumb.tsx\n  - components/ui/button.tsx\n  - components/ui/calendar.tsx\n  - components/ui/card.tsx\n  - components/ui/carousel.tsx\n  - components/ui/chart.tsx\n  - components/ui/checkbox.tsx\n  - components/ui/collapsible.tsx\n  - components/ui/command.tsx\n  - components/ui/context-menu.tsx\n  - components/ui/dialog.tsx\n  - components/ui/drawer.tsx\n  - components/ui/dropdown-menu.tsx\n  - components/ui/form.tsx\n  - components/ui/hover-card.tsx\n  - components/ui/input-otp.tsx\n  - components/ui/input.tsx\n  - components/ui/label.tsx\n  - components/ui/menubar.tsx\n  - components/ui/navigation-menu.tsx\n  - components/ui/pagination.tsx\n  - components/ui/popover.tsx\n  - components/ui/progress.tsx\n  - components/ui/radio-group.tsx\n  - components/ui/resizable.tsx\n  - components/ui/scroll-area.tsx\n  - components/ui/select.tsx\n  - components/ui/separator.tsx\n  - components/ui/sheet.tsx\n  - components/ui/skeleton.tsx\n  - components/ui/slider.tsx\n  - components/ui/sonner.tsx\n  - components/ui/switch.tsx\n  - components/ui/table.tsx\n  - components/ui/tabs.tsx\n  - components/ui/textarea.tsx\n  - components/ui/toast.tsx\n  - components/ui/toaster.tsx\n  - components/ui/toggle-group.tsx\n  - components/ui/toggle.tsx\n  - components/ui/tooltip.tsx`,
      ],
      uiPrompts: [nextBasePrompt],
    });
    return;
  }

  if (answer === "node") {
    res.json({
      prompts: [
        `Here is an artifact that contains all files of the project visible to you.\nConsider the contents of ALL files in the project.\n\n${nodeBasePrompt}\n\nHere is a list of files that exist on the file system but are not being shown to you:\n\n  - .gitignore\n  - package-lock.json\n`,
      ],
      uiPrompts: [nodeBasePrompt],
    });
    return;
  }

  res.status(403).json({ message: "You can't access this" });
  return;
};

export const chatController = async (req: Request, res: Response) => {
  const messages = req.body.messages;

  const completion = await openai.chat.completions.create({
    model: "grok-beta",
    max_tokens: 8192,
    messages: [
      { role: "system", content: getSystemPrompt()},
      ...messages,
    ],
  });
  

  console.log(completion.choices[0].message.content);

  res.json({
    response: completion.choices[0].message.content,
  });
};
