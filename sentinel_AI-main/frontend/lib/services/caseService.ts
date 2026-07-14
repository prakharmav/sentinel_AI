export type CaseStatus = "Active" | "Pending" | "Closed" | "Archived";
export type CasePriority = "Low" | "Medium" | "High" | "Critical";

export interface CaseEvidence {
  id: string;
  type: "document" | "image" | "link";
  title: string;
  url: string;
  dateAdded: string;
}

export interface CaseTimelineEvent {
  id: string;
  title: string;
  description: string;
  date: string;
  type: "status_change" | "note" | "evidence_added" | "assignment";
  actor: string;
}

export interface Case {
  id: string;
  title: string;
  description: string;
  status: CaseStatus;
  priority: CasePriority;
  assignee: string;
  dateOpened: string;
  lastUpdated: string;
  location: string;
  timeline: CaseTimelineEvent[];
  evidence: CaseEvidence[];
}

export const mockCases: Case[] = [
  {
    id: "CAS-2023-0891",
    title: "Downtown Armed Robbery",
    description: "Armed robbery at a convenience store on 5th Ave. Suspects fled in a black sedan.",
    status: "Active",
    priority: "Critical",
    assignee: "Det. Sarah Jenkins",
    dateOpened: "2023-10-15T08:30:00Z",
    lastUpdated: "2023-10-16T14:20:00Z",
    location: "Sector 4, Downtown",
    timeline: [
      {
        id: "t1",
        title: "Case Opened",
        description: "Initial report filed by patrol unit.",
        date: "2023-10-15T08:30:00Z",
        type: "status_change",
        actor: "Officer M. Ross",
      },
      {
        id: "t2",
        title: "Evidence Collected",
        description: "CCTV footage retrieved from the store.",
        date: "2023-10-15T10:15:00Z",
        type: "evidence_added",
        actor: "Det. Sarah Jenkins",
      },
    ],
    evidence: [
      {
        id: "e1",
        type: "image",
        title: "CCTV Suspect Snapshot",
        url: "/images/evidence/cctv-01.jpg",
        dateAdded: "2023-10-15T10:15:00Z",
      },
    ],
  },
  {
    id: "CAS-2023-0892",
    title: "Suspicious Activity - Port Authority",
    description: "Repeated unauthorized access attempts at the Port Authority cargo bay 7.",
    status: "Pending",
    priority: "High",
    assignee: "Agent R. Cole",
    dateOpened: "2023-10-14T22:15:00Z",
    lastUpdated: "2023-10-15T09:00:00Z",
    location: "Port Authority",
    timeline: [
      {
        id: "t3",
        title: "Case Opened",
        description: "Automated alert from perimeter sensors.",
        date: "2023-10-14T22:15:00Z",
        type: "status_change",
        actor: "System",
      },
      {
        id: "t4",
        title: "Agent Assigned",
        description: "Assigned to Agent R. Cole for investigation.",
        date: "2023-10-15T09:00:00Z",
        type: "assignment",
        actor: "Dispatcher T. Vance",
      },
    ],
    evidence: [
      {
        id: "e2",
        type: "document",
        title: "Access Logs",
        url: "/docs/access-logs-bay7.pdf",
        dateAdded: "2023-10-15T09:05:00Z",
      },
    ],
  },
  {
    id: "CAS-2023-0885",
    title: "Vandalism at Central Park",
    description: "Graffiti and property damage reported near the east entrance.",
    status: "Closed",
    priority: "Low",
    assignee: "Officer L. Kim",
    dateOpened: "2023-10-10T06:45:00Z",
    lastUpdated: "2023-10-12T16:30:00Z",
    location: "Central Park, East",
    timeline: [
      {
        id: "t5",
        title: "Case Closed",
        description: "Suspects identified and apprehended. Damages documented.",
        date: "2023-10-12T16:30:00Z",
        type: "status_change",
        actor: "Officer L. Kim",
      },
    ],
    evidence: [],
  },
  {
    id: "CAS-2023-0895",
    title: "Cyber Intrusions - City Hall",
    description: "Multiple failed login attempts from foreign IPs detected on internal servers.",
    status: "Active",
    priority: "High",
    assignee: "Cyber Unit",
    dateOpened: "2023-10-16T01:10:00Z",
    lastUpdated: "2023-10-16T15:45:00Z",
    location: "City Hall Network",
    timeline: [
      {
        id: "t6",
        title: "Intrusion Alert",
        description: "Firewall flagged suspicious traffic.",
        date: "2023-10-16T01:10:00Z",
        type: "status_change",
        actor: "SentinelAI System",
      },
    ],
    evidence: [
       {
        id: "e3",
        type: "document",
        title: "Network Traffic Dump",
        url: "/docs/pcap-1016.zip",
        dateAdded: "2023-10-16T02:00:00Z",
      },
    ],
  },
];

export const getCases = async (): Promise<Case[]> => {
  // Simulate network delay
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(mockCases);
    }, 500);
  });
};
