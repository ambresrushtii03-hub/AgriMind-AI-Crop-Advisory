import { Router, type IRouter } from "express";
import { randomUUID } from "node:crypto";
import {
  CreateChatSessionBody,
  CreateFarmBody,
  CreateZoneBody,
  GenerateAdvisoryBody,
  GetAdvisoryResponse,
  GetDashboardResponse,
  GetFarmResponse,
  GetWeatherResponse,
  ListAdvisoriesQueryParams,
  ListAdvisoriesResponse,
  ListChatMessagesResponse,
  ListChatSessionsResponse,
  ListFarmsResponse,
  SendChatMessageBody,
} from "@workspace/api-zod";

type Farm = ReturnType<typeof createFarm>;
type Advisory = ReturnType<typeof createAdvisory>;
type ChatMessage = {
  id: string;
  sessionId: string;
  role: "user" | "assistant";
  content: string;
  createdAt: string;
};

const now = () => new Date().toISOString();

function createZone(
  name: string,
  crop: string,
  stage: string,
  area: number,
  status = "Healthy",
) {
  return { id: randomUUID(), name, crop, stage, area, status };
}

function createFarm(input: {
  name: string;
  location: string;
  area: number;
  crop: string;
  irrigation?: string;
}) {
  return {
    id: randomUUID(),
    name: input.name,
    location: input.location,
    area: input.area,
    crop: input.crop,
    cropCount: 1,
    zones: [] as ReturnType<typeof createZone>[],
    healthScore: 84,
    moisture: 62,
    status: "On track",
    latitude: 30.7333,
    longitude: 76.7794,
    irrigation: input.irrigation ?? "Drip",
  };
}

function createAdvisory(input: {
  crop: string;
  farm: string;
  diagnosis: string;
  category: string;
  urgency: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  confidence: number;
  summary: string;
  actionPlan: string[];
  soil: { ph: number; nitrogen: number; phosphorus: number; potassium: number };
  forecast: { yieldPotential: number; harvestWindow: string; risks: string[] };
}) {
  return {
    id: randomUUID(),
    crop: input.crop,
    farm: input.farm,
    diagnosis: input.diagnosis,
    category: input.category,
    urgency: input.urgency,
    confidence: input.confidence,
    summary: input.summary,
    createdAt: now(),
    imageUrl: null,
    actionPlan: input.actionPlan,
    soil: input.soil,
    forecast: input.forecast,
  };
}

const farms: Farm[] = [
  createFarm({
    name: "Green Valley Estate",
    location: "Ludhiana, Punjab",
    area: 18.5,
    crop: "Wheat",
    irrigation: "Drip",
  }),
  createFarm({
    name: "Sundarban North",
    location: "Nashik, Maharashtra",
    area: 9.2,
    crop: "Tomato",
    irrigation: "Sprinkler",
  }),
  createFarm({
    name: "Kaveri Field 04",
    location: "Mandya, Karnataka",
    area: 24.8,
    crop: "Sugarcane",
    irrigation: "Flood",
  }),
];

farms[0].zones = [
  createZone("North Block", "Wheat", "Flowering", 10.4, "Healthy"),
  createZone("East Block", "Wheat", "Grain filling", 8.1, "Watch"),
];
farms[1].zones = [
  createZone("Glasshouse A", "Tomato", "Fruiting", 4.7, "Healthy"),
  createZone("Open Field", "Tomato", "Vegetative", 4.5, "Watch"),
];
farms[2].zones = [createZone("Canal Side", "Sugarcane", "Vegetative", 24.8)];

const advisories: Advisory[] = [
  createAdvisory({
    crop: "Wheat",
    farm: "Green Valley Estate",
    diagnosis: "Early nitrogen deficiency",
    category: "NUTRIENT_DEFICIENCY",
    urgency: "MEDIUM",
    confidence: 91,
    summary:
      "Lower leaves are showing a mild, uniform yellowing pattern consistent with early nitrogen stress. The crop is still within a good recovery window.",
    actionPlan: [
      "Apply 42 kg/ha of urea in a narrow band before the next irrigation.",
      "Recheck canopy color across the East Block in 5–7 days.",
      "Avoid a second dose until the soil moisture is above 55%.",
    ],
    soil: { ph: 6.7, nitrogen: 38, phosphorus: 47, potassium: 74 },
    forecast: {
      yieldPotential: 86,
      harvestWindow: "22–28 days",
      risks: ["Dry wind after irrigation", "Patchy nitrogen uptake"],
    },
  }),
  createAdvisory({
    crop: "Tomato",
    farm: "Sundarban North",
    diagnosis: "Fungal leaf spot risk",
    category: "PATHOGEN_FUNGAL",
    urgency: "HIGH",
    confidence: 88,
    summary:
      "Humidity and overnight leaf wetness are favoring a leaf spot cycle in the open field. Containment is recommended before lesions spread to new growth.",
    actionPlan: [
      "Remove the most affected leaves and keep them out of the compost pile.",
      "Open irrigation windows after sunrise so leaves dry quickly.",
      "Use a locally registered copper-based protectant only if spread continues.",
    ],
    soil: { ph: 6.2, nitrogen: 62, phosphorus: 54, potassium: 68 },
    forecast: {
      yieldPotential: 74,
      harvestWindow: "14–18 days",
      risks: ["High overnight humidity", "Rain in the next 72 hours"],
    },
  }),
  createAdvisory({
    crop: "Sugarcane",
    farm: "Kaveri Field 04",
    diagnosis: "Healthy crop profile",
    category: "HEALTHY",
    urgency: "LOW",
    confidence: 95,
    summary:
      "The field profile is balanced for the current vegetative stage. Continue the current irrigation rhythm and monitor the canal-side edge for waterlogging.",
    actionPlan: [
      "Maintain 42–48 mm irrigation every 6 days while temperatures stay above 30°C.",
      "Keep the canal-side drainage channel clear.",
      "Schedule the next soil test after the next split fertilizer application.",
    ],
    soil: { ph: 7.1, nitrogen: 76, phosphorus: 64, potassium: 81 },
    forecast: {
      yieldPotential: 92,
      harvestWindow: "128–145 days",
      risks: ["Canal-side waterlogging"],
    },
  }),
];

const sessions = [
  {
    id: "session-1",
    title: "Tomato leaf spot check",
    farm: "Sundarban North",
    updatedAt: now(),
  },
];

const messages: ChatMessage[] = [
  {
    id: "message-1",
    sessionId: "session-1",
    role: "assistant",
    content:
      "I’m ready to help you make a field decision. I have Sundarban North selected, so I can use its tomato crop stage and recent leaf spot advisory as context.",
    createdAt: now(),
  },
];

const router: IRouter = Router();

const weather = () => ({
  location: "Ludhiana, Punjab",
  temperature: 28,
  condition: "Partly cloudy",
  humidity: 68,
  rainChance: 24,
  forecast: [
    { day: "Today", icon: "sun-cloud", high: 31, low: 21, rain: 24 },
    { day: "Tue", icon: "cloud-rain", high: 29, low: 20, rain: 42 },
    { day: "Wed", icon: "sun", high: 32, low: 22, rain: 12 },
    { day: "Thu", icon: "sun-cloud", high: 33, low: 23, rain: 18 },
    { day: "Fri", icon: "cloud", high: 30, low: 21, rain: 35 },
  ],
});

router.get("/dashboard", (_req, res) => {
  const data = {
    farmCount: farms.length,
    activeAlerts: advisories.filter((item) => item.urgency === "HIGH" || item.urgency === "CRITICAL").length,
    advisoryCount: advisories.length,
    soilScore: 78,
    weather: weather(),
    activities: [
      { id: "a1", title: "Tomato diagnostic completed", detail: "Sundarban North · High priority", time: "2 hours ago", type: "diagnostic" },
      { id: "a2", title: "Irrigation window updated", detail: "Green Valley Estate · East Block", time: "Yesterday", type: "water" },
      { id: "a3", title: "Soil test added", detail: "Kaveri Field 04 · pH 7.1", time: "2 days ago", type: "soil" },
      { id: "a4", title: "Harvest outlook refreshed", detail: "Three farms · 14-day projection", time: "3 days ago", type: "forecast" },
    ],
    nutrientData: [
      { label: "Nitrogen", value: 58, target: 72 },
      { label: "Phosphorus", value: 71, target: 68 },
      { label: "Potassium", value: 76, target: 74 },
      { label: "Organic matter", value: 64, target: 70 },
    ],
    yieldData: [
      { label: "May", value: 72, target: 78 },
      { label: "Jun", value: 76, target: 79 },
      { label: "Jul", value: 81, target: 80 },
      { label: "Aug", value: 84, target: 82 },
      { label: "Sep", value: 86, target: 84 },
      { label: "Oct", value: 89, target: 86 },
    ],
  };
  res.json(GetDashboardResponse.parse(data));
});

router.get("/farms", (_req, res) => res.json(ListFarmsResponse.parse(farms)));

router.post("/farms", (req, res) => {
  const input = CreateFarmBody.parse(req.body);
  const farm = createFarm(input);
  farms.unshift(farm);
  res.status(201).json(farm);
});

router.get("/farms/:farmId", (req, res) => {
  const farm = farms.find((item) => item.id === req.params.farmId);
  if (!farm) return res.status(404).json({ error: "Farm not found" });
  return res.json(GetFarmResponse.parse(farm));
});

router.patch("/farms/:farmId", (req, res) => {
  const farm = farms.find((item) => item.id === req.params.farmId);
  if (!farm) return res.status(404).json({ error: "Farm not found" });
  const input = req.body as Record<string, unknown>;
  Object.assign(farm, {
    ...(typeof input.name === "string" && { name: input.name }),
    ...(typeof input.location === "string" && { location: input.location }),
    ...(typeof input.area === "number" && { area: input.area }),
    ...(typeof input.crop === "string" && { crop: input.crop }),
    ...(typeof input.irrigation === "string" && { irrigation: input.irrigation }),
  });
  return res.json(farm);
});

router.delete("/farms/:farmId", (req, res) => {
  const index = farms.findIndex((item) => item.id === req.params.farmId);
  if (index < 0) return res.status(404).json({ error: "Farm not found" });
  farms.splice(index, 1);
  return res.status(204).send();
});

router.post("/farms/:farmId/zones", (req, res) => {
  const farm = farms.find((item) => item.id === req.params.farmId);
  if (!farm) return res.status(404).json({ error: "Farm not found" });
  const input = CreateZoneBody.parse(req.body);
  const zone = createZone(input.name, input.crop, input.stage ?? "Seedling", input.area);
  farm.zones.push(zone);
  farm.cropCount = new Set(farm.zones.map((item) => item.crop)).size;
  return res.status(201).json(zone);
});

router.get("/advisories", (req, res) => {
  const params = ListAdvisoriesQueryParams.parse(req.query);
  const filtered = advisories.filter((item) =>
    (!params.urgency || item.urgency === params.urgency) &&
    (!params.crop || item.crop.toLowerCase().includes(params.crop.toLowerCase())),
  );
  return res.json(ListAdvisoriesResponse.parse(filtered));
});

router.post("/advisories", (req, res) => {
  const input = GenerateAdvisoryBody.parse(req.body);
  const farm = farms.find((item) => item.id === input.farmId);
  const crop = input.crop;
  const lowerSymptoms = input.symptoms.join(" ").toLowerCase();
  const isDisease = lowerSymptoms.includes("spot") || lowerSymptoms.includes("powder") || lowerSymptoms.includes("lesion");
  const advisory = createAdvisory({
    crop,
    farm: farm?.name ?? "Selected field",
    diagnosis: isDisease ? "Fungal disease pressure" : "Early nutrient imbalance",
    category: isDisease ? "PATHOGEN_FUNGAL" : "NUTRIENT_DEFICIENCY",
    urgency: isDisease ? "HIGH" : "MEDIUM",
    confidence: isDisease ? 86 : 82,
    summary: isDisease
      ? "Observed symptoms and current field conditions suggest fungal disease pressure. Start with sanitation and leaf-dryness controls while monitoring spread."
      : "The current crop profile suggests an early nutrient imbalance. The crop is still within a useful correction window if the next application is timed with irrigation.",
    actionPlan: isDisease
      ? ["Remove heavily affected leaves and dispose of them away from the field.", "Irrigate early so foliage dries before evening.", "Recheck the affected area in 48 hours before choosing a registered protectant."]
      : ["Use a soil test to confirm the limiting nutrient.", "Apply a modest corrective dose before the next irrigation.", "Recheck canopy color and new growth in 5–7 days."],
    soil: {
      ph: input.ph ?? 6.6,
      nitrogen: input.nitrogen ?? 54,
      phosphorus: input.phosphorus ?? 61,
      potassium: input.potassium ?? 70,
    },
    forecast: {
      yieldPotential: isDisease ? 76 : 84,
      harvestWindow: input.growthStage === "Fruiting" ? "12–18 days" : "28–36 days",
      risks: isDisease ? ["High leaf wetness", "Rapid lesion spread"] : ["Uneven nutrient uptake", "Dry wind after irrigation"],
    },
  });
  advisories.unshift(advisory);
  return res.status(201).json(advisory);
});

router.get("/advisories/:advisoryId", (req, res) => {
  const advisory = advisories.find((item) => item.id === req.params.advisoryId);
  if (!advisory) return res.status(404).json({ error: "Advisory not found" });
  return res.json(GetAdvisoryResponse.parse(advisory));
});

router.get("/weather", (_req, res) => res.json(GetWeatherResponse.parse(weather())));

router.get("/chat/sessions", (_req, res) => res.json(ListChatSessionsResponse.parse(sessions)));

router.post("/chat/sessions", (req, res) => {
  const input = CreateChatSessionBody.parse(req.body ?? {});
  const session = { id: randomUUID(), title: input.title ?? "New agronomic consultation", farm: input.farmId ?? "All farms", updatedAt: now() };
  sessions.unshift(session);
  return res.status(201).json(session);
});

router.get("/chat/sessions/:sessionId/messages", (req, res) => {
  return res.json(ListChatMessagesResponse.parse(messages.filter((item) => item.sessionId === req.params.sessionId)));
});

router.post("/chat/messages", (req, res) => {
  const input = SendChatMessageBody.parse(req.body);
  const userMessage: ChatMessage = { id: randomUUID(), sessionId: input.sessionId, role: "user", content: input.content, createdAt: now() };
  messages.push(userMessage);
  const response: ChatMessage = {
    id: randomUUID(),
    sessionId: input.sessionId,
    role: "assistant",
    content: "Based on the current farm context, I’d start with the lowest-risk intervention: confirm the symptom pattern across at least 10 plants, keep irrigation timed for early morning, and recheck the field after 48 hours. If the affected area grows, share a close leaf photo and I can narrow the differential.",
    createdAt: now(),
  };
  messages.push(response);
  return res.status(201).json(response);
});

export default router;