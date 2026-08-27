import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Priority list of valid candidate models to cascade through with gemini-3.1-flash-lite as primary high-quota model
const CANDIDATE_MODELS = [
  "gemini-3.1-flash-lite",
  "gemini-flash-latest",
  "gemini-3.7-flash",
];

// Lazy-initialized GenAI client helper
function getGenAI() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is not configured on the server.");
  }
  return new GoogleGenAI({ apiKey });
}

// Resilient API runner with model cascade, timeout & backoff retry
async function generateWithRetry(
  callFn: (modelName: string, ai: GoogleGenAI) => Promise<any>,
  timeoutMs = 12000
) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.error("[ZEKROM Server] GEMINI_API_KEY is not defined in environment variables.");
    throw new Error("GEMINI_API_KEY is not configured on the server.");
  }

  const ai = getGenAI();
  let lastError: any = null;

  for (const model of CANDIDATE_MODELS) {
    try {
      console.log(`[ZEKROM Server] Dispatching request to model: ${model}`);

      // Wrap call in timeout promise
      const apiCallPromise = callFn(model, ai);
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(
          () => reject(new Error(`Timeout: Gemini model ${model} took longer than ${timeoutMs}ms`)),
          timeoutMs
        )
      );

      const result = await Promise.race([apiCallPromise, timeoutPromise]);
      console.log(`[ZEKROM Server] Successfully received response from ${model}`);
      return result;
    } catch (err: any) {
      lastError = err;
      const msg = err?.message || String(err);
      console.warn(`[ZEKROM Server] Model ${model} failed: ${msg}. Trying next candidate...`);
    }
  }

  throw lastError || new Error("All AI models temporarily busy.");
}

// Fallback Generators in French
function generateFallbackBlueprint(rawIdea: string) {
  const idea = rawIdea.trim();
  const words = idea.split(/\s+/).filter(Boolean);
  const capitalizedKey =
    words
      .slice(0, 2)
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
      .join(" ") || "OmniBuild";
  const projectName = `${capitalizedKey.replace(/[^a-zA-Z0-9 ]/g, "") || "VentureCore"}`;

  return {
    projectName,
    slogan: `L'exécution radicale pour transformer ${idea.toLowerCase().slice(0, 35)} en réalité tangible.`,
    concept: `Une plateforme haute performance conçue pour ${idea.toLowerCase().replace(/^(je veux|créer|faire|une application qui)\s*/i, "")}.`,
    problemSolved: `Élimine la fragmentation des outils actuels, la friction cognitive et les pertes de temps inhérentes aux méthodes traditionnelles.`,
    solution: `Un système unifié automatisant la conception, le prototypage et la mise à l'échelle en une interface fluide et instantanée.`,
    targetAudience: `Fondateurs visionnaires, créateurs indépendants, étudiants et équipes produit exigeant une vitesse d'exécution maximale.`,
    mainFeatures: [
      `Espace de travail collaboratif en temps réel à latence quasi-nulle`,
      `Moteur d'automatisation décisionnelle et d'inférence contextuelle`,
      `Architecture modulaire avec manipulation visuelle des briques de projet`,
      `Exportation multiformat (.md, .json, code source) instantanée`,
      `Tableau de bord de télémétrie prédictive et suivi d'impact continu`,
    ],
    uniqueSellingPoint: `Remplace la dispersion entre multiples outils par un cockpit unifié, réactif et sans la moindre friction.`,
    monetizationIdea: `Modèle SaaS par paliers (accès individuel pour créateurs + sièges d'équipe haute cadence) avec extension API à l'usage.`,
    developmentRoadmap: [
      {
        phase: "Phase 1 : Fondations & Core Engine",
        timeframe: "Semaines 1-4",
        description: "Développement du moteur réactif central, persistance locale et interface utilisateur fluide.",
      },
      {
        phase: "Phase 2 : Intelligence & Réseau",
        timeframe: "Semaines 5-8",
        description: "Déploiement de la synchronisation collaborative et des couches de synthèse avancées.",
      },
      {
        phase: "Phase 3 : Écosystème & Échelle",
        timeframe: "Semaines 9-12",
        description: "Ouverture des intégrations d'API publiques, modules d'extension et sécurisation globale.",
      },
    ],
    mainChallenge: `Garantir une adoption virale immédiate tout en maintenant une simplicité d'utilisation exemplaire face à la richesse des fonctionnalités.`,
    pitch: `Aujourd'hui, créer un projet prend des semaines à cause d'outils fragmentés. Avec ${projectName}, nous unifions toute la chaîne de valeur en un moteur d'exécution 10x plus rapide. Nous redonnons aux créateurs le pouvoir d'expérimenter et de déployer en quelques minutes.`,
    visualDirection: `Esthétique sombre minimaliste anthracite (#0F1013), accents orange chaleureux (#FF5500), typographie nette et micro-interactions fluides.`,
  };
}

function generateFallbackPitch(idea: string, bp?: any) {
  const name = bp?.projectName || "Projet ZEKROM";
  return {
    projectName: name,
    hook: `Et si la création d'un projet d'envergure ne prenait plus des mois, mais seulement quelques minutes d'exécution pure ?`,
    problem: `Les méthodes et outils actuels sont lents, fragmentés et font perdre le momentum créatif aux équipes et porteurs de projet.`,
    solution: `${name} offre un moteur unifié à haute vitesse qui transforme instantanément une vision brute en résultat tangible et structuré.`,
    whyNow: `L'économie de la vitesse récompense ceux qui itèrent en heures plutôt qu'en mois : la barrière d'entrée s'effondre pour les plus agiles.`,
    differentiation: `Contrairement aux solutions généralistes passives, ${name} propose un environnement proactif d'exécution complète sans friction technique.`,
    conclusion: `${name} n'est pas seulement un outil supplémentaire : c'est le catalyseur indispensable pour construire le futur de votre industrie.`,
    pitch: `Aujourd'hui, 90% des idées meurent étouffées par la complexité technique et la dispersion des outils. Avec ${name}, nous changeons la donne. Notre plateforme transforme une simple idée en une architecture complète et opérationnelle en quelques secondes. Le marché exige une exécution immédiate : avec ${name}, vous ne suivez plus le rythme, vous le dictez. Prêts à bâtir avec nous ?`,
    whyItMatters: `La rapidité d'itération est le seul véritable avantage concurrentiel : ceux qui exécutent en heures plutôt qu'en semaines remportent le marché.`,
  };
}

function generateFallbackSecret(rawAnswer: string) {
  const answer = rawAnswer.trim();
  return {
    title: "L'Architecture Souveraine",
    synthesis: `Votre ambition de « ${answer} » marque une rupture nette avec l'incrémentalisme pour viser une création audacieuse et souveraine.`,
    unspokenTruth: "Le plus grand obstacle n'a jamais été la faisabilité technique : c'était l'attente passive d'une permission extérieure que personne ne viendra donner.",
    catalystAction: "Posez dès aujourd'hui les bases du premier prototype sur une seule page, formulez votre hypothèse centrale et lancez l'expérimentation avant ce soir.",
  };
}

function generateFallbackChat(userQuery: string) {
  return `### Analyse Stratégique ZEKROM

Voici une synthèse ciblée pour **${userQuery.slice(0, 45)}...** :

1. **Le Levier Fondamental** : Supprimez les fonctionnalités superficielles. Concentrez tous vos efforts sur le point de friction unique qui génère 10x plus de valeur perçue.
2. **L'Axe Différenciant** : La plupart des projets tentent d'en faire trop ; les vainqueurs s'imposent par la clarté radicale, la réactivité sensorielle et la simplicité d'adoption.
3. **Action Immédiate** : Définissez le plus petit test déployable en moins de 24 heures pour valider un comportement d'usage réel.

*Sur quel aspect souhaitez-vous approfondir maintenant ?*`;
}

// Health check endpoint
app.get("/api/health", (_req, res) => {
  res.json({
    status: "ok",
    hasApiKey: Boolean(process.env.GEMINI_API_KEY),
    timestamp: new Date().toISOString(),
  });
});

// 1. ZEKROM AI Chat Endpoint
app.post("/api/ai/chat", async (req, res) => {
  try {
    const { messages, message } = req.body;
    console.log("[ZEKROM Server] POST /api/ai/chat received");

    let contents: any[] = [];
    let lastUserQuery = "";
    if (Array.isArray(messages) && messages.length > 0) {
      contents = messages.map((m: { role: string; content: string }) => ({
        role: m.role === "user" ? "user" : "model",
        parts: [{ text: m.content }],
      }));
      const lastUser = [...messages].reverse().find((m) => m.role === "user");
      lastUserQuery = lastUser ? lastUser.content : "";
    } else if (message) {
      contents = [{ role: "user", parts: [{ text: message }] }];
      lastUserQuery = message;
    } else {
      return res.status(400).json({ error: "Le contenu du message est requis." });
    }

    const systemInstruction = `Tu es ZEKROM AI. Tu réponds toujours en français, sauf si l'utilisateur demande explicitement une autre langue.
Tu es le cœur d'intelligence créative de ZEKROM (« Pensez au-delà de l'évidence »).
Ta personnalité :
- Très créatif, percutant, moderne, intellectuellement honnête et visionnaire.
- Professionnel, direct et humain. Aucun jargon d'entreprise creux ou formules convenues.
- Tu remets en question les évidences, synthétises les concepts complexes en réflexions limpides et aides les créateurs à bâtir des projets réels.
- Réponses engageantes, structurées et soignées en markdown sans surcharge.`;

    try {
      const response = await generateWithRetry(async (modelName, ai) => {
        return await ai.models.generateContent({
          model: modelName,
          contents,
          config: {
            systemInstruction,
            temperature: 0.75,
          },
        });
      });

      const replyText = response.text || generateFallbackChat(lastUserQuery);
      return res.json({ text: replyText });
    } catch (apiErr: any) {
      console.warn(
        "[ZEKROM Server] AI Chat API call failed/timed out, serving fallback:",
        apiErr?.message
      );
      if (!process.env.GEMINI_API_KEY) {
        return res.status(503).json({
          error: "GEMINI_NOT_CONFIGURED",
          message: "La variable GEMINI_API_KEY n'est pas configurée dans l'environnement serveur.",
        });
      }
      return res.json({ text: generateFallbackChat(lastUserQuery) });
    }
  } catch (error: any) {
    console.error("[ZEKROM Server] Error in /api/ai/chat:", error);
    res.status(500).json({
      error: error?.message || "Une erreur est survenue lors de la communication avec ZEKROM IA.",
    });
  }
});

// 2. CREATE Project Generator Endpoint
app.post("/api/ai/create-project", async (req, res) => {
  try {
    const { idea } = req.body;
    if (!idea || typeof idea !== "string" || !idea.trim()) {
      return res.status(400).json({ error: "La description de l'idée est requise." });
    }

    const systemInstruction = `Tu es ZEKROM AI, l'Architecte Produit et Venture de ZEKROM. Tu réponds toujours en français.
Ta mission est de prendre une idée brute ou simple et de la transformer en une architecture de projet ambitieuse, claire et originale.
Évite les clichés. Propose des solutions singulières, audacieuses et à haute valeur d'exécution.`;

    const prompt = `Analyse et développe cette idée en un plan d'architecture de projet concret et immédiatement exécutable :
"${idea.trim()}"

Rédige toutes les réponses en français selon le schéma JSON demandé.`;

    try {
      const response = await generateWithRetry(async (modelName, ai) => {
        return await ai.models.generateContent({
          model: modelName,
          contents: prompt,
          config: {
            systemInstruction,
            temperature: 0.8,
            responseMimeType: "application/json",
            responseSchema: {
              type: Type.OBJECT,
              properties: {
                projectName: {
                  type: Type.STRING,
                  description: "Un nom de projet percutant, moderne et mémorable (1-2 mots).",
                },
                slogan: {
                  type: Type.STRING,
                  description: "Un slogan accrocheur et visionnaire.",
                },
                concept: {
                  type: Type.STRING,
                  description: "Une phrase unique et aiguisée décrivant le cœur du concept.",
                },
                problemSolved: {
                  type: Type.STRING,
                  description: "La friction exacte ou le problème fondamental résolu.",
                },
                solution: {
                  type: Type.STRING,
                  description: "La solution innovante et son fonctionnement clé.",
                },
                targetAudience: {
                  type: Type.STRING,
                  description: "Le public cible et les personas prioritaires.",
                },
                mainFeatures: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING },
                  description: "Exactement 5 fonctionnalités innovantes et à fort impact.",
                },
                uniqueSellingPoint: {
                  type: Type.STRING,
                  description: "La proposition de valeur unique et avantage concurrentiel décisif.",
                },
                monetizationIdea: {
                  type: Type.STRING,
                  description: "Modèle économique pérenne et leviers de monétisation.",
                },
                developmentRoadmap: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      phase: { type: Type.STRING },
                      timeframe: { type: Type.STRING },
                      description: { type: Type.STRING },
                    },
                    required: ["phase", "timeframe", "description"],
                  },
                  description: "3 phases structurées de développement (ex: Phase 1 : Fondations & MVP, Phase 2 : Couche Réseau & Scale, Phase 3 : Écosystème Global).",
                },
                mainChallenge: {
                  type: Type.STRING,
                  description: "Le défi technique ou stratégique principal à surmonter.",
                },
                pitch: {
                  type: Type.STRING,
                  description: "Un pitch oral percutant de 30 secondes résumant le projet.",
                },
                visualDirection: {
                  type: Type.STRING,
                  description: "Style esthétique, ton visuel, ambiance et identité sensorielle.",
                },
              },
              required: [
                "projectName",
                "slogan",
                "concept",
                "problemSolved",
                "solution",
                "targetAudience",
                "mainFeatures",
                "uniqueSellingPoint",
                "monetizationIdea",
                "developmentRoadmap",
                "mainChallenge",
                "pitch",
              ],
            },
          },
        });
      });

      const parsed = JSON.parse(response.text || "{}");
      return res.json(parsed);
    } catch (apiErr: any) {
      console.warn("[ZEKROM Server] AI Create Project API fallback:", apiErr?.message);
      return res.json(generateFallbackBlueprint(idea));
    }
  } catch (error: any) {
    console.error("[ZEKROM Server] Error in /api/ai/create-project:", error);
    res.status(500).json({
      error: error?.message || "Échec de la génération de l'architecture du projet.",
    });
  }
});

// 3. PITCH MY IDEA Generator Endpoint
app.post("/api/ai/pitch", async (req, res) => {
  try {
    const { idea, projectContext } = req.body;
    if (!idea && !projectContext) {
      return res.status(400).json({ error: "L'idée ou le contexte de projet est requis." });
    }

    const systemInstruction = `Tu es ZEKROM AI, coach de pitch et associé venture d'élite. Tu réponds toujours en français.
Ton rôle est de transformer ce projet en une présentation orale magnétique et ultra-convaincante de 30 secondes.
Structure requise :
1. ACCROCHE : phrase d'ouverture captivante
2. PROBLÈME : la douleur réelle du marché
3. SOLUTION : comment le projet résout ce problème de façon radicale
4. POURQUOI MAINTENANT : le timing parfait
5. CE QUI REND LE PROJET DIFFÉRENT : le fossé concurrentiel
6. CONCLUSION : appel à l'action ou vision finale
7. PITCH : le script parlé continu fluide et naturel (environ 75-95 mots).`;

    const prompt = `Formule un pitch exécutif structuré en français pour :
${projectContext ? JSON.stringify(projectContext, null, 2) : idea}`;

    try {
      const response = await generateWithRetry(async (modelName, ai) => {
        return await ai.models.generateContent({
          model: modelName,
          contents: prompt,
          config: {
            systemInstruction,
            temperature: 0.7,
            responseMimeType: "application/json",
            responseSchema: {
              type: Type.OBJECT,
              properties: {
                projectName: {
                  type: Type.STRING,
                  description: "Nom du projet.",
                },
                hook: {
                  type: Type.STRING,
                  description: "Accroche d'ouverture captivante (1 phrase).",
                },
                problem: {
                  type: Type.STRING,
                  description: "Le problème central en 1-2 phrases percutantes.",
                },
                solution: {
                  type: Type.STRING,
                  description: "La solution de rupture en 1-2 phrases.",
                },
                whyNow: {
                  type: Type.STRING,
                  description: "Pourquoi ce projet arrive au moment parfait (Pourquoi maintenant).",
                },
                differentiation: {
                  type: Type.STRING,
                  description: "Ce qui rend ce projet unique et incomparable.",
                },
                conclusion: {
                  type: Type.STRING,
                  description: "Conclusion marquante ou appel à l'action.",
                },
                pitch: {
                  type: Type.STRING,
                  description: "Un script continu de pitch parlé de 30 secondes.",
                },
              },
              required: [
                "projectName",
                "hook",
                "problem",
                "solution",
                "whyNow",
                "differentiation",
                "conclusion",
                "pitch",
              ],
            },
          },
        });
      });

      const parsed = JSON.parse(response.text || "{}");
      return res.json(parsed);
    } catch (apiErr: any) {
      console.warn("[ZEKROM Server] AI Pitch fallback:", apiErr?.message);
      return res.json(generateFallbackPitch(idea || projectContext?.projectName, projectContext));
    }
  } catch (error: any) {
    console.error("[ZEKROM Server] Error in /api/ai/pitch:", error);
    res.status(500).json({
      error: error?.message || "Échec de la génération du pitch.",
    });
  }
});

// 4. SECRET MODE - Experiment 01 Endpoint
app.post("/api/ai/secret-experiment", async (req, res) => {
  try {
    const { answer } = req.body;
    if (!answer || typeof answer !== "string" || !answer.trim()) {
      return res.status(400).json({ error: "La réponse est requise." });
    }

    const systemInstruction = `Tu es ZEKROM AI (Sous-routine confidentielle ZEKROM // EXPÉRIENCE 01). Tu réponds toujours en français.
La question posée était : « Que construiriez-vous si l'échec n'existait pas ? »
Ton rôle :
- Fournir une synthèse inspirante, lucide et viscérale de ce rêve.
- T'adresser à l'utilisateur comme à un créateur audacieux.
- Débloquer la friction psychologique sous-jacente et donner une action catalytique pour commencer immédiatement.
- Ton : Cinématique, profond, intense, élégant, sans clichés.`;

    const prompt = `L'utilisateur a répondu : "${answer.trim()}"

Fournis une réponse structurée en français.`;

    try {
      const response = await generateWithRetry(async (modelName, ai) => {
        return await ai.models.generateContent({
          model: modelName,
          contents: prompt,
          config: {
            systemInstruction,
            temperature: 0.85,
            responseMimeType: "application/json",
            responseSchema: {
              type: Type.OBJECT,
              properties: {
                title: {
                  type: Type.STRING,
                  description: "Un titre marquant pour cette ambition visionnaire.",
                },
                synthesis: {
                  type: Type.STRING,
                  description: "L'essence de cette création audacieuse en 2-3 phrases.",
                },
                unspokenTruth: {
                  type: Type.STRING,
                  description: "La vérité subtile sur les raisons pour lesquelles ce projet compte.",
                },
                catalystAction: {
                  type: Type.STRING,
                  description: "Le premier geste courageux et concret à poser aujourd'hui.",
                },
              },
              required: ["title", "synthesis", "unspokenTruth", "catalystAction"],
            },
          },
        });
      });

      const parsed = JSON.parse(response.text || "{}");
      return res.json(parsed);
    } catch (apiErr: any) {
      console.warn("[ZEKROM Server] AI Secret experiment fallback:", apiErr?.message);
      return res.json(generateFallbackSecret(answer));
    }
  } catch (error: any) {
    console.error("[ZEKROM Server] Error in /api/ai/secret-experiment:", error);
    res.status(500).json({
      error: error?.message || "Échec du traitement de la synthèse expérimentale.",
    });
  }
});

// 5. Game Hub Creative Duel / Challenge Generator
app.get("/api/ai/challenges", async (_req, res) => {
  try {
    const response = await generateWithRetry(async (modelName, ai) => {
      return await ai.models.generateContent({
        model: modelName,
        contents: "Génère en français 3 défis de sprint créatif originaux et 2 duels créatifs.",
        config: {
          systemInstruction: "Tu es ZEKROM AI. Tu réponds toujours en français.",
          temperature: 0.9,
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              sprintChallenges: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    id: { type: Type.STRING },
                    category: { type: Type.STRING },
                    prompt: { type: Type.STRING },
                    constraint: { type: Type.STRING },
                    rewardScore: { type: Type.NUMBER },
                  },
                  required: ["id", "category", "prompt", "constraint", "rewardScore"],
                },
              },
              duels: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    id: { type: Type.STRING },
                    theme: { type: Type.STRING },
                    optionA: {
                      type: Type.OBJECT,
                      properties: {
                        title: { type: Type.STRING },
                        premise: { type: Type.STRING },
                        vibe: { type: Type.STRING },
                      },
                      required: ["title", "premise", "vibe"],
                    },
                    optionB: {
                      type: Type.OBJECT,
                      properties: {
                        title: { type: Type.STRING },
                        premise: { type: Type.STRING },
                        vibe: { type: Type.STRING },
                      },
                      required: ["title", "premise", "vibe"],
                    },
                    critiqueA: { type: Type.STRING },
                    critiqueB: { type: Type.STRING },
                  },
                  required: ["id", "theme", "optionA", "optionB", "critiqueA", "critiqueB"],
                },
              },
            },
            required: ["sprintChallenges", "duels"],
          },
        },
      });
    });

    const parsed = JSON.parse(response.text || "{}");
    res.json(parsed);
  } catch (error: any) {
    res.json({
      fallback: true,
      error: error?.message,
    });
  }
});

// Vite middleware and static serving (used in local and standalone container environments)
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[ZEKROM Server] Écoute sur http://0.0.0.0:${PORT}`);
    console.log(`[ZEKROM Server] Clé GEMINI_API_KEY disponible: ${Boolean(process.env.GEMINI_API_KEY)}`);
  });
}

// Only launch standalone server if not running as a Vercel Serverless Function
if (!process.env.VERCEL) {
  startServer();
}

export default app;
export { app };
