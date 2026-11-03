/**
 * Career Compass - Shared Utilities & State Management
 */

const DEFAULT_PROFILE = {
  name: "Alex Rivera",
  major: "Computer Engineering",
  year: "3rd Year Undergraduate",
  goal: "AI & Software Engineering"
};

const DEFAULT_ASSESSMENT = {
  topCareer: "AI / ML Engineer",
  topCategory: "Technology & AI",
  score: 92,
  description: "Your strong orientation toward programming, mathematical modeling, and problem-solving makes AI/ML Engineering an ideal match.",
  skills: ["Python & PyTorch", "Linear Algebra", "Machine Learning", "System Design"],
  secondaryCareer: "Data Scientist",
  secondaryScore: 84,
  categoryScores: {
    "Technology & AI": 92,
    "Data Science": 84,
    "UI/UX Design": 65,
    "Product Strategy": 58
  },
  completedAt: new Date().toLocaleDateString()
};

function getUserProfile() {
  try {
    const raw = localStorage.getItem("cc_user_profile");
    if (raw) return JSON.parse(raw);
    const legacyName = localStorage.getItem("ccName");
    if (legacyName) {
      const p = { ...DEFAULT_PROFILE, name: legacyName };
      saveUserProfile(p);
      return p;
    }
  } catch (e) {}
  saveUserProfile(DEFAULT_PROFILE);
  return DEFAULT_PROFILE;
}

function saveUserProfile(profile) {
  localStorage.setItem("cc_user_profile", JSON.stringify(profile));
  localStorage.setItem("ccName", profile.name);
  updateNavbarProfileChip();
}

function getAssessmentResult() {
  try {
    const raw = localStorage.getItem("cc_assessment_result");
    if (raw) return JSON.parse(raw);
    if (localStorage.getItem("ccAssessment") === "completed") {
      saveAssessmentResult(DEFAULT_ASSESSMENT);
      return DEFAULT_ASSESSMENT;
    }
  } catch (e) {}
  return null;
}

function saveAssessmentResult(result) {
  localStorage.setItem("cc_assessment_result", JSON.stringify(result));
  localStorage.setItem("ccAssessment", "completed");
}

function updateNavbarProfileChip() {
  const profile = getUserProfile();
  const chip = document.getElementById("navUserChip");
  if (chip) {
    const nameEl = chip.querySelector(".nav-user-name");
    const avatarEl = chip.querySelector(".nav-user-avatar");
    if (nameEl) nameEl.textContent = profile.name.split(" ")[0];
    if (avatarEl) avatarEl.textContent = profile.name.charAt(0).toUpperCase();
  }
}

// Global modal triggers
function setupModals() {
  document.querySelectorAll("[data-close-modal]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const modal = btn.closest(".modal-overlay") || btn.closest(".drawer-overlay");
      if (modal) modal.classList.remove("open");
    });
  });

  document.querySelectorAll(".modal-overlay, .drawer-overlay").forEach((overlay) => {
    overlay.addEventListener("click", (e) => {
      if (e.target === overlay) overlay.classList.remove("open");
    });
  });
}

document.addEventListener("DOMContentLoaded", () => {
  updateNavbarProfileChip();
  setupModals();

  // Prevent dead hashtag links
  document.querySelectorAll("a[href='#']").forEach((a) => {
    a.addEventListener("click", (e) => e.preventDefault());
  });
});
