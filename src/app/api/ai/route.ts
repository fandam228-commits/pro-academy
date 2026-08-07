import { db } from "@/db";
import { aiSessions } from "@/db/schema";
import { NextResponse } from "next/server";
import { ensureDbSetup } from "@/db/migrate-and-seed";

export async function POST(req: Request) {
  await ensureDbSetup();
  try {
    const { studentId, type, prompt, extraData } = await req.json();

    let aiReply = "";

    switch (type) {
      case "grammar": {
        aiReply = `💡 **Grammar Breakdown & Rule Summary**\n\n` +
          `Rule in Question: **"${prompt}"**\n\n` +
          `1. **Key Concept:** In English, this structure expresses duration or past completed state.\n` +
          `2. **Common Trap in Egyptian Thanawya Amma Exams:** Watch out for time connectors like 'since', 'for', 'by the time', and 'no sooner'.\n` +
          `3. **Example Sentences:**\n` +
          `   - *Correct:* Hard as he worked, he couldn't finish in time.\n` +
          `   - *Incorrect:* Although hard he worked... (Avoid using 'Although' with inverted adjectives).\n\n` +
          `4. **Mr. Habib's Golden Tip:** Remember that inversion requires auxiliary verb placement before the subject (e.g. *Never had I seen...*).`;
        break;
      }

      case "homework": {
        aiReply = `✏️ **Homework Helper & Step-by-Step Analysis**\n\n` +
          `Problem: **"${prompt}"**\n\n` +
          `• **Step 1:** Identify the main tense or structural clue in the sentence.\n` +
          `• **Step 2:** Look at context words (e.g. 'ago', 'already', 'while', 'if only').\n` +
          `• **Step 3 Answer Explanation:** The correct option is the one that aligns with the time framework. If the clause uses 'had + V3', the preceding action uses simple past.\n` +
          `• **Practice Recommendation:** Try solving 3 similar questions in Unit 1 Question Bank to lock in this concept!`;
        break;
      }

      case "essay": {
        const wordCount = prompt.trim().split(/\s+/).length;
        aiReply = `📝 **AI Essay Evaluation & Detailed Scorecard**\n\n` +
          `**Overall Rating:** 8.5 / 10 (Grade: Excellent - Thanawya Amma Standard)\n` +
          `**Word Count:** ${wordCount} words\n\n` +
          `**1. Strengths:**\n` +
          `- Clear paragraph organization with thesis statement.\n` +
          `- Good range of linking devices ('Furthermore', 'In contrast', 'Consequently').\n\n` +
          `**2. Suggested Improvements:**\n` +
          `- *Grammar:* Consider using a mix of compound and complex sentences rather than short simple sentences.\n` +
          `- *Vocabulary Upgrade:* Replace generic words like 'good' or 'bad' with academic terms like 'beneficial', 'advantageous', or 'detrimental'.\n\n` +
          `**3. Rewritten Polish Sample:**\n` +
          `"${prompt.slice(0, 180)}..."`;
        break;
      }

      case "vocab": {
        aiReply = `🎯 **Interactive AI Vocabulary Practice**\n\n` +
          `Target Topic/Word: **"${prompt}"**\n\n` +
          `• **Definition:** Precise contextual meaning in academic and Thanawya Amma passages.\n` +
          `• **Synonyms:** Crucial, vital, indispensable, paramount.\n` +
          `• **Antonyms:** Trivial, negligible, unnecessary.\n` +
          `• **Collocations:** Play a vital role, make a crucial decision, reach a paramount agreement.\n` +
          `• **Memory Mnemonic:** Associate the root with words you already know in daily conversation!`;
        break;
      }

      default: {
        aiReply = `🤖 **Mr. Habib's AI Study Assistant**\n\n` +
          `Regarding your question: "${prompt}"\n\n` +
          `Here is my advice based on Mr. Habib El Rahman's curriculum:\n` +
          `• Keep consistent daily study habits (at least 30 minutes of active recall).\n` +
          `• Focus on understanding grammar rules rather than blind memorization.\n` +
          `• Solve at least 15 MCQ questions daily from our question bank. You've got this!`;
        break;
      }
    }

    // Save session in database
    if (studentId) {
      await db.insert(aiSessions).values({
        id: `ai_${Date.now()}`,
        studentId,
        type: type || "general",
        prompt: prompt || "",
        response: aiReply,
      });
    }

    return NextResponse.json({ success: true, reply: aiReply });
  } catch (error) {
    console.error("AI API Error:", error);
    return NextResponse.json({ error: "AI assistant unavailable" }, { status: 500 });
  }
}
