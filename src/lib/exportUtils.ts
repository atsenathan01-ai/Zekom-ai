import { ProjectBlueprint, PitchData } from "../types";

export function generateProjectMarkdown(bp: ProjectBlueprint): string {
  const dateStr = new Date(bp.createdAt || Date.now()).toLocaleDateString(
    "fr-FR",
    {
      year: "numeric",
      month: "long",
      day: "numeric",
    }
  );

  return `# ${bp.projectName.toUpperCase()}
> *${bp.slogan || "Architecture générée par ZEKROM V3"}*

**Date de création :** ${dateStr}  
**Idée originale :** ${bp.originalIdea || "Non spécifiée"}

---

## 1. CONCEPT
${bp.concept}

## 2. PROBLÈME RÉSOLU
${bp.problemSolved}

## 3. SOLUTION
${bp.solution || "Solution innovante intégrée."}

## 4. PUBLIC CIBLE
${bp.targetAudience}

## 5. 5 FONCTIONNALITÉS CLÉS
${(bp.mainFeatures || []).map((feat, i) => `${i + 1}. **${feat}**`).join("\n")}

## 6. PROPOSITION DE VALEUR (USP)
${bp.uniqueSellingPoint}

## 7. MODÈLE ÉCONOMIQUE & MONÉTISATION
${bp.monetizationIdea}

## 8. FEUILLE DE ROUTE (ROADMAP)
${(bp.developmentRoadmap || [])
  .map(
    (step) => `### ${step.phase} (${step.timeframe})
${step.description}
`
  )
  .join("\n")}

## 9. DÉFI PRINCIPAL
${bp.mainChallenge || "Adoption et mise à l'échelle rapide."}

## 10. PITCH DE 30 SECONDES
"${bp.pitch || ""}"

---
*Généré avec ZEKROM — Pensez au-delà de l'évidence.*
`;
}

export function downloadProjectFile(
  bp: ProjectBlueprint,
  format: "md" | "txt" = "md"
) {
  const content = generateProjectMarkdown(bp);
  const cleanName = (bp.projectName || "projet-zekrom")
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "-");
  const filename = `${cleanName}-zekrom.${format}`;

  const blob = new Blob([content], {
    type: format === "md" ? "text/markdown;charset=utf-8" : "text/plain;charset=utf-8",
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function generatePitchMarkdown(pitch: PitchData): string {
  return `# PITCH EXÉCUTIF — ${pitch.projectName.toUpperCase()}
*Pitch de 30 secondes préparé par ZEKROM AI*

---

### 1. ACCROCHE
${pitch.hook}

### 2. PROBLÈME
${pitch.problem}

### 3. SOLUTION
${pitch.solution}

### 4. POURQUOI MAINTENANT
${pitch.whyNow}

### 5. CE QUI REND LE PROJET DIFFÉRENT
${pitch.differentiation}

### 6. CONCLUSION
${pitch.conclusion}

---

## 🎙️ SCRIPT ORAL (30 SECONDES)
"${pitch.pitch}"

---
*ZEKROM V3 Concours — Think beyond the obvious.*
`;
}

export function downloadPitchFile(pitch: PitchData) {
  const content = generatePitchMarkdown(pitch);
  const cleanName = (pitch.projectName || "pitch-zekrom")
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "-");
  const filename = `pitch-${cleanName}.${"md"}`;

  const blob = new Blob([content], { type: "text/markdown;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
