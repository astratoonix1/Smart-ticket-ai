import mongoose from "mongoose";
import express from "express";
import { GoogleGenAI } from "@google/genai";
import { Inngest, NonRetriableError } from "inngest";
import { User } from "./users.js";

// ── Model ──────────────────────────────────────────────
const ticketSchema = new mongoose.Schema({
  title: String,
  description: String,
  status: { type: String, default: "TODO" },
  createdByName: { type: String, default: "Anonymous" },
  assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
  priority: String,
  deadline: Date,
  helpfulNotes: String,
  relatedSkills: [String],
  moderatorMessage: { type: String, default: "" },
  createdAt: { type: Date, default: Date.now },
});

const Ticket = mongoose.model("Ticket", ticketSchema);

// ── AI Analysis (Gemini) ───────────────────────────────
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

const analyzeTicket = async (ticket) => {
  const systemInstruction = `You are an expert AI assistant that processes technical support tickets. 

Your job is to:
1. Summarize the issue.
2. Estimate its priority.
3. Provide helpful notes and resource links for human moderators.
4. List relevant technical skills required.
5. Keep Helpul Notes Crisp 2-4 lines only

IMPORTANT:
- Respond with *only* valid raw JSON.
- Do NOT include markdown, code fences, comments, or any extra formatting.
- The format must be a raw JSON object.

Repeat: Do not wrap your output in markdown or code fences.`;

  const userPrompt = `You are a ticket triage agent. Only return a strict JSON object with no extra text, headers, or markdown.
        
Analyze the following support ticket and provide a JSON object with:

- summary: A short 1-2 sentence summary of the issue.
- priority: One of "low", "medium", or "high".
- helpfulNotes: A detailed technical explanation that a moderator can use to solve this issue. Include useful external links or resources if possible.
- relatedSkills: An array of relevant skills required to solve the issue (e.g., ["React", "MongoDB"]).

Respond ONLY in this JSON format and do not include any other text or markdown in the answer:

{
"summary": "Short summary of the ticket",
"priority": "HIGH",
"helpfulNotes": "Here are useful tips...",
"relatedSkills": ["React", "Node.js"]
}

---

Ticket information:

- Title: ${ticket.title}
- Description: ${ticket.description}`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-pro",
      config: {
        responseMimeType: "application/json",
        systemInstruction: systemInstruction,
      },
      contents: [{ role: "user", parts: [{ text: userPrompt }] }],
    });

    const raw = response.text;
    if (!raw) {
      console.error("AI response is empty or undefined.");
      return null;
    }

    let cleanedResponse = String(raw).trim();
    const markdownMatch =
      cleanedResponse.match(/```json\n([\s\S]*?)\n```/i) || cleanedResponse.match(/```([\s\S]*?)```/i);
    if (markdownMatch) cleanedResponse = markdownMatch[1].trim();

    const jsonStart = cleanedResponse.indexOf("{");
    const jsonEnd = cleanedResponse.lastIndexOf("}");
    if (jsonStart !== -1 && jsonEnd !== -1 && jsonEnd > jsonStart) {
      cleanedResponse = cleanedResponse.substring(jsonStart, jsonEnd + 1);
    }

    const parsedResult = JSON.parse(cleanedResponse);

    if (!parsedResult.summary || !parsedResult.priority || !parsedResult.helpfulNotes || !parsedResult.relatedSkills) {
      console.warn("Parsed JSON is missing required fields:", parsedResult);
    }

    const validPriorities = ["LOW", "MEDIUM", "HIGH"];
    if (!validPriorities.includes(parsedResult.priority.toUpperCase())) {
      console.warn(`Invalid priority "${parsedResult.priority}". Setting to "medium".`);
      parsedResult.priority = "MEDIUM";
    }

    if (!Array.isArray(parsedResult.relatedSkills)) {
      parsedResult.relatedSkills = parsedResult.relatedSkills ? [parsedResult.relatedSkills] : [];
    }

    return parsedResult;
  } catch (e) {
    return {
      summary: "Unable to process ticket automatically",
      priority: "MEDIUM",
      helpfulNotes: "Manual review required. AI parsing failed.",
      relatedSkills: ["Manual Review"],
    };
  }
};

// ── Inngest (background job) ───────────────────────────
export const inngest = new Inngest({ id: "smartticket-ai" });

export const onTicketCreated = inngest.createFunction(
  { id: "on-ticket-create", retries: 2 },
  { event: "ticket/created" },
  async ({ event, step }) => {
    try {
      const { ticketId } = event.data;
      const ticket = await step.run("fetch-ticket", async () => {
        const ticketObject = await Ticket.findById(ticketId);
        if (!ticketObject) throw new NonRetriableError("Ticket not found");
        return ticketObject;
      });

      await step.run("update-ticket-status", async () => {
        await Ticket.findOneAndUpdate({ _id: ticketId }, { status: "TODO" }, { new: true });
      });

      const aiResponse = await analyzeTicket(ticket);

      const relatedSkills = await step.run("ai-processing", async () => {
        let skills = [];
        if (aiResponse) {
          await Ticket.findByIdAndUpdate(ticketId, {
            priority: ["low", "medium", "high"].includes(aiResponse.priority) ? aiResponse.priority : "medium",
            helpfulNotes: aiResponse.helpfulNotes || [],
            status: "IN_PROGRESS",
            relatedSkills: aiResponse.relatedSkills || [],
          });
          skills = aiResponse.relatedSkills || [];
        }
        return skills;
      });

      await step.run("assign-moderator", async () => {
        let user = await User.findOne({
          role: "moderator",
          skills: { $elemMatch: { $regex: relatedSkills.join("|"), $options: "i" } },
        });
        if (!user) user = await User.findOne({ role: "admin" });
        await Ticket.findByIdAndUpdate(ticketId, { assignedTo: user?._id || null });
        return user;
      });

      return { success: true };
    } catch (error) {
      console.error(`❌ Error creating ticket: ${error.message}`);
      return { success: false };
    }
  }
);

// ── Controller ─────────────────────────────────────────
export const createTicket = async (req, res) => {
  try {
    const { title, description, priority, deadline, relatedSkills, assignedTo, createdByName } = req.body;
    if (!title || !description) {
      return res.status(400).json({ message: "Title and description are required" });
    }
    const newTicket = await Ticket.create({
      title,
      description,
      priority: priority || "low",
      deadline,
      relatedSkills: relatedSkills || [],
      assignedTo: assignedTo || null,
      createdByName: createdByName || "Anonymous",
    });

    try {
      await inngest.send({
        name: "ticket/created",
        data: { ticketId: newTicket._id.toString(), title: newTicket.title, description: newTicket.description },
      });
    } catch (inngestError) {
      console.error("Failed to send inngest event (ticket was still created):", inngestError.message);
    }

    return res.status(201).json({ message: "Ticket created successfully", ticket: newTicket });
  } catch (error) {
    console.error("Error creating ticket:", error.message);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

export const getTickets = async (req, res) => {
  try {
    const tickets = await Ticket.find({}).populate("assignedTo", ["name", "email", "_id"]).sort({ createdAt: -1 });
    return res.status(200).json(tickets);
  } catch (error) {
    console.error("Error fetching tickets:", error.message);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

export const getTicket = async (req, res) => {
  try {
    const ticket = await Ticket.findById(req.params.id).populate("assignedTo", ["name", "email", "_id"]);
    if (!ticket) return res.status(404).json({ message: "Ticket not found" });
    return res.status(200).json({ ticket });
  } catch (error) {
    console.error("Error fetching ticket:", error.message);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

export const updateTicket = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, moderatorMessage, assignedTo } = req.body;
    if (!title || !description) {
      return res.status(400).json({ message: "Title and description are required" });
    }
    const ticket = await Ticket.findById(id);
    if (!ticket) return res.status(404).json({ message: "Ticket not found" });

    ticket.title = title;
    ticket.description = description;
    if (moderatorMessage !== undefined) ticket.moderatorMessage = moderatorMessage;
    if (assignedTo !== undefined) ticket.assignedTo = assignedTo || null;

    await ticket.save();
    return res.status(200).json({ message: "Ticket updated successfully", ticket });
  } catch (error) {
    console.error("Error updating ticket:", error.message);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

export const updateTicketStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, moderatorMessage } = req.body;
    if (!status) return res.status(400).json({ message: "Status is required" });

    const allowedStatuses = ["OPEN", "IN_PROGRESS", "RESOLVED", "CLOSED"];
    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({ message: "Invalid status value" });
    }

    const ticket = await Ticket.findById(id);
    if (!ticket) return res.status(404).json({ message: "Ticket not found" });

    ticket.status = status;
    if (moderatorMessage !== undefined) ticket.moderatorMessage = moderatorMessage;

    await ticket.save();
    return res.status(200).json({ message: "Ticket status updated", ticket });
  } catch (error) {
    console.error("Error updating ticket status:", error.message);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

// ── Routes ─────────────────────────────────────────────
export const ticketRoutes = express.Router();
ticketRoutes.get("/", getTickets);
ticketRoutes.get("/:id", getTicket);
ticketRoutes.post("/", createTicket);
ticketRoutes.put("/:id", updateTicket);
ticketRoutes.put("/:id/status", updateTicketStatus);
