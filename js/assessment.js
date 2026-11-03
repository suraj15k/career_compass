/**
 * Career Compass - Career Assessment Engine
 * Multi-dimensional scoring for Tech, Data, Design, and Product Strategy.
 */

const questions = [
  {
    q: "Which type of challenge genuinely energizes you the most?",
    o: [
      { text: "Architecting software, writing algorithms, and debugging code", cat: "tech" },
      { text: "Finding patterns in messy numbers, statistics, and datasets", cat: "data" },
      { text: "Crafting intuitive layouts, aesthetics, and user journeys in Figma", cat: "design" },
      { text: "Defining product features, pitching vision, and coordinating team goals", cat: "business" }
    ]
  },
  {
    q: "What subject area or elective do you gravitate toward?",
    o: [
      { text: "Computer Science, Data Structures & Operating Systems", cat: "tech" },
      { text: "Probability, Linear Algebra & Machine Learning", cat: "data" },
      { text: "Visual Design, Human-Computer Interaction & Media", cat: "design" },
      { text: "Economics, Product Management & Entrepreneurship", cat: "business" }
    ]
  },
  {
    q: "When approaching a complex assignment, what is your preferred approach?",
    o: [
      { text: "Breaking the system into logic modules, code components, and tests", cat: "tech" },
      { text: "Gathering empirical evidence, running statistical tests, and modeling outcomes", cat: "data" },
      { text: "Prototyping visual wireframes, testing usability, and iterating on feedback", cat: "design" },
      { text: "Prioritizing high-impact objectives, delegating tasks, and analyzing viability", cat: "business" }
    ]
  },
  {
    q: "What type of tools do you feel most natural using or want to master?",
    o: [
      { text: "VS Code, Git, Docker, Python / TypeScript, APIs", cat: "tech" },
      { text: "Jupyter Notebooks, Pandas, SQL, PyTorch, Tableau", cat: "data" },
      { text: "Figma, Adobe Creative Suite, Design Systems, Protopie", cat: "design" },
      { text: "Notion, Jira, Google Analytics, Linear, Strategy Frameworks", cat: "business" }
    ]
  },
  {
    q: "What kind of daily impact would make you feel most satisfied?",
    o: [
      { text: "Building robust, scalable applications used seamlessly by millions", cat: "tech" },
      { text: "Discovering deep insights that predict user behavior or power AI models", cat: "data" },
      { text: "Designing elegant digital products that users find delightful and effortless", cat: "design" },
      { text: "Leading a product to market success and aligning engineering with business", cat: "business" }
    ]
  },
  {
    q: "If you had a weekend to build a project from scratch, what would it be?",
    o: [
      { text: "A full-stack web app or automated AI backend utility", cat: "tech" },
      { text: "A predictive model analyzing financial, health, or sports trends", cat: "data" },
      { text: "A complete mobile app UI redesign and interactive micro-interaction showcase", cat: "design" },
      { text: "A pitch deck, market validation survey, and business prototype", cat: "business" }
    ]
  }
];

const ARCHETYPES = {
  tech: {
    topCareer: "AI / ML Engineer",
    topCategory: "Software & AI Engineering",
    desc: "You demonstrate high analytical logic, architectural thinking, and passion for software systems. You excel at turning conceptual ideas into working computational engines.",
    skills: ["Python & PyTorch", "Algorithms & System Design", "Docker & Cloud Deployments", "API Engineering"],
    secondary: "Full Stack Engineer"
  },
  data: {
    topCareer: "Data Scientist & AI Specialist",
    topCategory: "Data Science & Analytics",
    desc: "You possess a powerful quantitative intuition and love uncovering truth hidden within complex datasets. You excel at bridging mathematical rigor with applied AI.",
    skills: ["Python, Pandas & NumPy", "SQL & Database Pipelines", "Applied Machine Learning", "Data Storytelling"],
    secondary: "Business Intelligence Analyst"
  },
  design: {
    topCareer: "UI/UX Product Designer",
    topCategory: "Design & Creative Tech",
    desc: "You combine empathy for human behavior with an eye for typography, layout harmony, and interactive fluidity. You turn confusing flows into effortless digital experiences.",
    skills: ["Figma Design Systems", "User Research & Usability", "Interactive Prototyping", "Information Architecture"],
    secondary: "Design Engineer"
  },
  business: {
    topCareer: "Associate Product Manager",
    topCategory: "Product & Tech Strategy",
    desc: "You possess high-level strategic perspective, clear communication, and organizational leadership. You thrive at the intersection of business, technology, and user value.",
    skills: ["Agile & Sprint Planning", "Metrics & Product Analytics", "User Story Mapping", "Market Feasibility Analysis"],
    secondary: "Tech Operations Lead"
  }
};

let current = 0;
let answers = Array(questions.length).fill(null);

const area = document.getElementById("questionArea");
const bar = document.getElementById("progressBar");
const prev = document.getElementById("prevBtn");
const next = document.getElementById("nextBtn");
const actions = document.getElementById("assessmentActions");

function renderQuestion() {
  const item = questions[current];
  bar.style.width = ((current + 1) / questions.length * 100) + "%";

  area.innerHTML = `
    <div class="question-number">QUESTION ${current + 1} OF ${questions.length}</div>
    <h2 class="question-title">${item.q}</h2>
    ${item.o.map((opt, i) => `
      <label class="option ${answers[current] === i ? "selected" : ""}">
        <input type="radio" name="answer" value="${i}" ${answers[current] === i ? "checked" : ""}>
        <span>${opt.text}</span>
      </label>
    `).join("")}
  `;

  area.querySelectorAll("input").forEach((r) => {
    r.onchange = () => {
      answers[current] = Number(r.value);
      renderQuestion();
    };
  });

  prev.disabled = current === 0;
  prev.style.opacity = current === 0 ? "0.4" : "1";
  next.innerHTML = current === questions.length - 1 
    ? 'Calculate Results <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>'
    : 'Next <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>';
}

function calculateResults() {
  const counts = { tech: 0, data: 0, design: 0, business: 0 };
  
  answers.forEach((ansIndex, qIndex) => {
    const chosenCat = questions[qIndex].o[ansIndex].cat;
    counts[chosenCat]++;
  });

  // Sort categories by highest score
  const sorted = Object.entries(counts).sort((a, b) => b[1] - a[1]);
  const primaryKey = sorted[0][0];
  const secondaryKey = sorted[1][0];

  const primaryData = ARCHETYPES[primaryKey];
  const primaryMatchScore = Math.min(96, Math.round(75 + (sorted[0][1] / questions.length) * 22));
  const secondaryMatchScore = Math.min(88, Math.round(60 + (sorted[1][1] / questions.length) * 25));

  const categoryScores = {
    "Technology & AI": Math.round(40 + (counts.tech / questions.length) * 55),
    "Data Science": Math.round(40 + (counts.data / questions.length) * 55),
    "UI/UX Design": Math.round(40 + (counts.design / questions.length) * 55),
    "Product Strategy": Math.round(40 + (counts.business / questions.length) * 55)
  };

  const resultObj = {
    topCareer: primaryData.topCareer,
    topCategory: primaryData.topCategory,
    score: primaryMatchScore,
    description: primaryData.desc,
    skills: primaryData.skills,
    secondaryCareer: primaryData.secondary,
    secondaryScore: secondaryMatchScore,
    categoryScores: categoryScores,
    completedAt: new Date().toLocaleDateString()
  };

  saveAssessmentResult(resultObj);
  renderResultsView(resultObj);
}

function renderResultsView(result) {
  bar.style.width = "100%";
  actions.style.display = "none";

  area.innerHTML = `
    <div class="result-box">
      <div class="result-badge">
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
        Assessment Completed
      </div>

      <div class="result-score-circle">
        <span>${result.score}%</span>
      </div>

      <div class="eyebrow">${result.topCategory}</div>
      <h2>${result.topCareer}</h2>
      <p class="result-desc">${result.description}</p>

      <div class="result-dimensions">
        ${Object.entries(result.categoryScores).map(([cat, score]) => `
          <div class="dim-item">
            <div class="dim-item-top">
              <span>${cat}</span>
              <b>${score}%</b>
            </div>
            <div class="dim-meter"><span style="width: ${score}%"></span></div>
          </div>
        `).join("")}
      </div>

      <div class="drawer-section" style="text-align: left; margin-bottom: 24px;">
        <h4 style="font-size: 14px; text-transform: uppercase; color: var(--navy); margin-bottom: 8px;">Recommended Core Skills to Learn</h4>
        <div class="skill-tags">
          ${result.skills.map(s => `<span class="skill-tag">${s}</span>`).join("")}
        </div>
      </div>

      <div class="result-actions">
        <a class="btn" href="chatbot.html?v=5&query=I+completed+my+career+assessment+and+matched+with+${encodeURIComponent(result.topCareer)}+at+${result.score}%25.+Can+you+give+me+a+personalized+roadmap+and+next+steps%3F">
          Discuss Roadmap in AI Chat →
        </a>
        <a class="btn btn-outline" href="dashboard.html?v=5">
          View My Dashboard
        </a>
      </div>
    </div>
  `;
}

prev.onclick = () => {
  if (current > 0) {
    current--;
    renderQuestion();
  }
};

next.onclick = () => {
  if (answers[current] === null) {
    alert("Please select an answer to proceed.");
    return;
  }
  if (current < questions.length - 1) {
    current++;
    renderQuestion();
  } else {
    calculateResults();
  }
};

renderQuestion();
