import "dotenv/config";
import express from "express";
import cors from "cors";
import { Ollama } from "@langchain/community/llms/ollama";
import { initializeAgentExecutorWithOptions } from "langchain/agents";
import { DynamicTool } from "@langchain/core/tools";
import { schoolTools } from "./mongoTools.js";

const app = express();
app.use(cors());
app.use(express.json());

// Setup Ollama with Gemma 3
const llm = new Ollama({
  model: "gemma3:4b",
  baseUrl: "http://localhost:11434",
});

// Convert raw tools to LangChain dynamic tools
const tools = schoolTools.map(
  (tool) =>
    new DynamicTool({
      name: tool.name,
      description: tool.description,
      func: tool.func,
    })
);

// Initialize Agent
const executor = await initializeAgentExecutorWithOptions(tools, llm, {
  agentType: "zero-shot-react-description",
  verbose: true,
});

app.post("/ask", async (req, res) => {
  const { query } = req.body;
  const result = await executor.invoke({ input: query });
  res.json({ response: result.output });
});

app.listen(3000, () =>
  console.log("✅ LangChain Agent running at http://localhost:3000")
);
