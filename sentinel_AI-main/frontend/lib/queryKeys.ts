// ============================================================
// SentinelAI — React Query: Query Key Factory
// Centralised key management for cache invalidation correctness.
// ============================================================

export const queryKeys = {
  // Auth
  auth: {
    current: () => ["auth", "current"] as const,
  },

  // Crimes
  crimes: {
    all: () => ["crimes"] as const,
    list: (params?: { skip?: number; limit?: number }) =>
      ["crimes", "list", params] as const,
    detail: (id: string) => ["crimes", id] as const,
  },

  // Analytics
  analytics: {
    dashboardMetrics: () => ["analytics", "dashboard-metrics"] as const,
    crimeTrends: () => ["analytics", "crime-trends"] as const,
    hotspots: () => ["analytics", "hotspots"] as const,
    seasonality: () => ["analytics", "seasonality"] as const,
    districtsComparison: () => ["analytics", "districts-comparison"] as const,
    threatPaths: (category: string) =>
      ["analytics", "threat-paths", category] as const,
  },

  // Graph
  graph: {
    network: (crimeId: string, minRisk?: number, nodeTypes?: string[]) =>
      ["graph", "network", crimeId, minRisk, nodeTypes] as const,
    search: (q: string) => ["graph", "search", q] as const,
    shortestPath: (start: string, end: string) =>
      ["graph", "shortest-path", start, end] as const,
    mostConnected: (limit: number) => ["graph", "most-connected", limit] as const,
    communities: () => ["graph", "communities"] as const,
    fraudRings: () => ["graph", "fraud-rings"] as const,
    moneyFlow: (minAmount: number) => ["graph", "money-flow", minAmount] as const,
    phoneCallGraph: () => ["graph", "phone-call-graph"] as const,
    vehicleMovement: (plate: string) => ["graph", "vehicle-movement", plate] as const,
    locationCorrelation: () => ["graph", "location-correlation"] as const,
  },

  // Copilot
  copilot: {
    caseSummary: (crimeId: string) => ["copilot", "case-summary", crimeId] as const,
    timeline: (crimeId: string) => ["copilot", "timeline", crimeId] as const,
    evidence: (crimeId: string) => ["copilot", "evidence", crimeId] as const,
    investigation: (crimeId: string) => ["copilot", "investigation", crimeId] as const,
    riskAssessment: (crimeId: string) => ["copilot", "risk", crimeId] as const,
    relatedFirs: (crimeId: string) => ["copilot", "related-firs", crimeId] as const,
  },

  // Reports
  reports: {
    list: () => ["reports"] as const,
    detail: (id: string) => ["reports", id] as const,
  },

  // Notifications
  notifications: {
    logs: () => ["notifications", "logs"] as const,
  },

  // Citizen
  citizen: {
    myCases: () => ["citizen", "my-cases"] as const,
  },
};
