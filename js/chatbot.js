/**
 * Career Compass - AI Career Advisor Chatbot
 * Powered by Google Gemini API with strict career-guidance guardrails.
 */

const STORAGE_KEY = "career_compass_gemini_key";
const PRIMARY_MODEL = "gemini-2.5-flash";
const FALLBACK_MODELS = ["gemini-flash-latest"];

// (Guardrail prompt now lives in server.py)
const _UNUSED_SYSTEM_INSTRUCTION = `You are Career Compass, a professional, supportive, and dedicated AI Career Advisor.
Your purpose is EXCLUSIVELY to assist students and learners with career planning, skills development, learning roadmaps, educational degrees, branches, job search, resumes, and career transitions.

STRICT DOMAIN GUARDRAILS:
1. You must ONLY answer queries related to careers, education, skills, industries, roadmaps, degrees, job interviews, resumes, and professional development.
2. If a user asks anything unrelated to careers or education (e.g. anime or fictional characters like Goku, superhero lore, gaming, sports trivia, movies, recipes, general homework cheating, personal relationship advice, politics, general trivia, chit-chat), you MUST politely and firmly decline to answer the off-topic query, and gently pivot the conversation back to career advice.
Example off-topic response:
"I am Career Compass, your dedicated AI career advisor, so I can only help with career planning, skills, and education. While I cannot answer questions about anime, gaming, or general pop culture, if you are curious about careers in Animation, Game Development, or Creative Media, feel free to ask!"
3. Keep responses structured, concise, friendly, and actionable. Use bullet points, bold highlights, and numbered roadmap steps where appropriate.`;

// DOM elements
const form = document.getElementById("chatForm");
const input = document.getElementById("userInput");
const messages = document.getElementById("messages");
const submitBtn = form ? form.querySelector("button[type='submit']") : null;

// API Key Modal Elements
const apiKeyModal = document.getElementById("apiKeyModal");
const apiKeyBtn = document.getElementById("apiKeyBtn");
const apiKeyBtnText = document.getElementById("apiKeyBtnText");
const apiStatusDot = document.getElementById("apiStatusDot");
const apiKeyInput = document.getElementById("apiKeyInput");
const saveKeyBtn = document.getElementById("saveKeyBtn");
const clearKeyBtn = document.getElementById("clearKeyBtn");
const closeKeyModalBtn = document.getElementById("closeKeyModalBtn");

// Quick prompt presets for quick pills
const QUICK_PROMPTS = {
  "Career options": "Can you recommend top trending career options for a student in 2026, and how to pick the right one?",
  "Learning roadmap": "Could you provide a practical, step-by-step learning roadmap to build job-ready technical and soft skills?",
  "My strengths": "How can I assess my personal strengths and match them to the best-fit career path?"
};

// Conversation history
const conversationHistory = [];

function getApiKey() {
  return "server"; // key now lives on the backend
}

function updateApiStatusUI() {
  const key = getApiKey();
  if (key) {
    if (apiStatusDot) apiStatusDot.classList.add("active");
    if (apiKeyBtnText) apiKeyBtnText.textContent = "Gemini Connected";
    if (apiKeyBtn) apiKeyBtn.title = "Gemini API key is active. Click to edit.";
  } else {
    if (apiStatusDot) apiStatusDot.classList.remove("active");
    if (apiKeyBtnText) apiKeyBtnText.textContent = "Set Gemini Key";
    if (apiKeyBtn) apiKeyBtn.title = "Click to configure your Gemini API Key.";
  }
}

function openModal() {
  if (apiKeyInput) apiKeyInput.value = getApiKey();
  if (apiKeyModal) {
    apiKeyModal.classList.add("open");
    if (apiKeyInput) apiKeyInput.focus();
  }
}

function closeModal() {
  if (apiKeyModal) apiKeyModal.classList.remove("open");
}

if (apiKeyBtn) apiKeyBtn.addEventListener("click", openModal);
if (closeKeyModalBtn) closeKeyModalBtn.addEventListener("click", closeModal);
if (apiKeyModal) {
  apiKeyModal.addEventListener("click", (e) => {
    if (e.target === apiKeyModal) closeModal();
  });
}

if (saveKeyBtn) {
  saveKeyBtn.addEventListener("click", () => {
    const key = apiKeyInput.value.trim();
    if (key) {
      localStorage.setItem(STORAGE_KEY, key);
      updateApiStatusUI();
      closeModal();
      addMessage("Gemini API key saved successfully. What career questions can I help you explore today?", "bot");
    } else {
      alert("Please enter a valid Gemini API Key.");
    }
  });
}

if (clearKeyBtn) {
  clearKeyBtn.addEventListener("click", () => {
    localStorage.removeItem(STORAGE_KEY);
    if (apiKeyInput) apiKeyInput.value = "";
    updateApiStatusUI();
    closeModal();
    addMessage("API key has been removed. Click 'Set Gemini Key' in the header anytime to reconnect.", "bot");
  });
}

/**
 * Basic Markdown to safe HTML formatter
 */
function formatMarkdown(text) {
  if (!text) return "";
  let html = text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");

  // Bold **text**
  html = html.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>");

  // Italic *text*
  html = html.replace(/\*(.*?)\*/g, "<em>$1</em>");

  // Inline code `code`
  html = html.replace(/`([^`]+)`/g, "<code>$1</code>");

  // Headers (### Header)
  html = html.replace(/^### (.*$)/gim, "<h4>$1</h4>");
  html = html.replace(/^## (.*$)/gim, "<h3>$1</h3>");

  // Process lists and paragraphs
  const lines = html.split("\n");
  let inList = false;
  let inNumList = false;
  let formattedLines = [];

  for (let line of lines) {
    const trimmed = line.trim();
    const isBullet = /^[•\-\*]\s+(.+)/.test(trimmed);
    const isNum = /^\d+\.\s+(.+)/.test(trimmed);

    if (isBullet) {
      if (!inList) {
        if (inNumList) { formattedLines.push("</ol>"); inNumList = false; }
        formattedLines.push("<ul>");
        inList = true;
      }
      formattedLines.push(trimmed.replace(/^[•\-\*]\s+(.+)/, "<li>$1</li>"));
    } else if (isNum) {
      if (!inNumList) {
        if (inList) { formattedLines.push("</ul>"); inList = false; }
        formattedLines.push("<ol>");
        inNumList = true;
      }
      formattedLines.push(trimmed.replace(/^\d+\.\s+(.+)/, "<li>$1</li>"));
    } else {
      if (inList) { formattedLines.push("</ul>"); inList = false; }
      if (inNumList) { formattedLines.push("</ol>"); inNumList = false; }
      if (trimmed.length > 0) {
        formattedLines.push(`<p>${line}</p>`);
      }
    }
  }

  if (inList) formattedLines.push("</ul>");
  if (inNumList) formattedLines.push("</ol>");

  return formattedLines.join("");
}

const BOT_SVG = `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>`;

function addMessage(content, type, isHtml = false) {
  const wrap = document.createElement("div");
  wrap.className = "message " + type;
  const profile = typeof getUserProfile === "function" ? getUserProfile() : { name: "Student" };
  const avatar = type === "bot" ? BOT_SVG : profile.name.charAt(0).toUpperCase();
  const name = type === "bot" ? "Career Compass" : profile.name.split(" ")[0];
  const bubbleContent = isHtml ? content : `<div class="bubble">${formatMarkdown(content)}</div>`;

  wrap.innerHTML = `<div class="msg-avatar">${avatar}</div><div><div class="msg-name">${name}</div>${bubbleContent}</div>`;
  messages.appendChild(wrap);
  
  // Smooth scroll
  messages.scrollTo({ top: messages.scrollHeight, behavior: "smooth" });
  return wrap;
}

function showTypingIndicator() {
  removeTypingIndicator(); // Ensure no duplicates
  const wrap = document.createElement("div");
  wrap.className = "message bot typing-msg";
  wrap.id = "typingIndicator";
  wrap.innerHTML = `<div class="msg-avatar">${BOT_SVG}</div><div><div class="msg-name">Career Compass</div><div class="bubble"><div class="typing-dots"><span></span><span></span><span></span></div></div></div>`;
  messages.appendChild(wrap);
  messages.scrollTo({ top: messages.scrollHeight, behavior: "smooth" });
}

function removeTypingIndicator() {
  const el = document.getElementById("typingIndicator");
  if (el) el.remove();
}


/**
 * Personalization: append the user's saved profile + assessment result
 * (from localStorage, via main.js) to the system instruction.
 */
function buildUserContext() {
  let extra = "";
  try {
    const a = typeof getAssessmentResult === "function" ? getAssessmentResult() : null;
    const p = typeof getUserProfile === "function" ? getUserProfile() : null;
    if (p) {
      extra += `\n\nUSER PROFILE: Name: ${p.name}; Major: ${p.major}; Year: ${p.year}; Stated goal: ${p.goal}.`;
    }
    if (a) {
      const scores = Object.entries(a.categoryScores || {}).map(([k, v]) => `${k}: ${v}%`).join(", ");
      extra += `\nASSESSMENT RESULT: Top match: ${a.topCareer} (${a.score}% fit) in ${a.topCategory}. Secondary match: ${a.secondaryCareer || "n/a"}. Key skills to build: ${(a.skills || []).join(", ")}. Category scores: ${scores}.`;
      extra += `\nPERSONALIZE every answer to this user: address them by first name, reference their top match and skills where relevant, and give roadmaps tailored to it. If they ask about a different career, still help but compare it with their assessment strengths.`;
    } else {
      extra += `\nThe user has NOT taken the career assessment yet. Give helpful general guidance and, when natural, suggest they take the Assessment to get personalized advice.`;
    }
  } catch (e) {}
  return extra;
}

async function callGeminiApi(userMessage) {
  // Calls our own backend (server.py); the Gemini key never reaches the browser.
  conversationHistory.push({ role: "user", content: userMessage });
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 30000);
  try {
    const response = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ messages: conversationHistory.slice(-12), context: buildUserContext() }),
      signal: controller.signal
    });
    clearTimeout(timeoutId);
    const data = await response.json().catch(() => ({}));
    if (!response.ok || !data.reply) throw new Error(data.error || `HTTP ${response.status}`);
    conversationHistory.push({ role: "assistant", content: data.reply });
    return data.reply;
  } catch (err) {
    clearTimeout(timeoutId);
    conversationHistory.pop();
    if (err.name === "AbortError") return "The request timed out. Please try again.";
    return `Unable to reach Career Compass AI (${err.message}).`;
  }
}

async function handleSendMessage(queryText) {
  const q = (queryText || input.value).trim();
  if (!q) return;

  addMessage(q, "user");
  input.value = "";
  input.disabled = true;
  if (submitBtn) submitBtn.disabled = true;

  showTypingIndicator();

  try {
    const answer = await callGeminiApi(q);
    removeTypingIndicator();
    addMessage(answer, "bot");
  } catch (err) {
    console.error("Chat error:", err);
    removeTypingIndicator();
    addMessage("Something went wrong while getting an answer. Please try again in a moment.", "bot");
  } finally {
    removeTypingIndicator();
    input.disabled = false;
    if (submitBtn) submitBtn.disabled = false;
    input.focus();
  }
}

if (form) {
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    handleSendMessage();
  });
}

// Sidebar suggestions
document.querySelectorAll(".suggestion").forEach((btn) => {
  btn.addEventListener("click", () => {
    const text = btn.textContent.trim();
    handleSendMessage(text);
  });
});

// Quick pill buttons
document.querySelectorAll(".quick").forEach((btn) => {
  btn.addEventListener("click", () => {
    const pillText = btn.textContent.trim();
    const promptToSend = QUICK_PROMPTS[pillText] || pillText;
    handleSendMessage(promptToSend);
  });
});

// Initialize on DOM load
window.addEventListener("DOMContentLoaded", () => {
  updateApiStatusUI();

  // Personalize welcome bubble if assessment is done
  const assessment = typeof getAssessmentResult === "function" ? getAssessmentResult() : null;
  const profile = typeof getUserProfile === "function" ? getUserProfile() : { name: "Student" };
  const welcomeEl = document.getElementById("welcomeBubble");
  
  if (welcomeEl && assessment) {
    welcomeEl.innerHTML = `Welcome back, <strong>${profile.name.split(" ")[0]}</strong>. I see you recently matched with <strong>${assessment.topCareer}</strong> (${assessment.score}% alignment). How can I help you build your roadmap or prepare for upcoming opportunities?`;
  }

  const params = new URLSearchParams(window.location.search);
  const careerParam = params.get("career");
  const queryParam = params.get("query");

  if (careerParam) {
    const q = `Tell me about the ${decodeURIComponent(careerParam)} career path, key skills, and how to get started.`;
    setTimeout(() => handleSendMessage(q), 400);
  } else if (queryParam) {
    const q = decodeURIComponent(queryParam);
    setTimeout(() => handleSendMessage(q), 400);
  }
});
