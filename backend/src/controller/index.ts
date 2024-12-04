import express, { Request, Response } from "express";
import Anthropic from "@anthropic-ai/sdk";
// import { TextBlock } from "@anthropic-ai/sdk/resources";
import { ANTHROPIC_API_KEY } from "../config/env.js";
import { BASE_PROMPT, getSystemPrompt } from "../prompts/prompts.js";
import { basePrompt as nodeBasePrompt } from "../defaults/node.js";
import { basePrompt as reactBasePrompt } from "../defaults/react.js";

const anthropic = new Anthropic({
  apiKey: ANTHROPIC_API_KEY,
});

export const templateController = async (req: Request, res: Response) => {
  const prompt = req.body.prompt;

  const response = await anthropic.messages.create({
    messages: [{ role: "user", content: prompt }],
    model: "claude-3-5-sonnet-20241022",
    max_tokens: 200,
    temperature: 0,
    system:
      "Return either node or react based on what do you think this project should be. Only return a single word either 'node' or 'react'. Do not return anything extra",
  });

  const answer = (response.content[0] as Anthropic.TextBlock).text;
  if (answer == "react") {
    res.json({
      prompts: [
        BASE_PROMPT,
        `Here is an artifact that contains all files of the project visible to you.\nConsider the contents of ALL files in the project.\n\n${reactBasePrompt}\n\nHere is a list of files that exist on the file system but are not being shown to you:\n\n  - .gitignore\n  - package-lock.json\n`,
      ],
      uiPrompts: [reactBasePrompt],
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

export const chatController = async (req: Request, res: Response) => {};
