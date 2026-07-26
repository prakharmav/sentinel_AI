// ============================================================
// SentinelAI — Neo4j Performance Indexes Migrations
// ============================================================

// 1. Composite lookup indexes
CREATE INDEX FOR (s:Suspect) ON (s.tenant_id, s.name);
CREATE INDEX FOR (c:Crime) ON (c.tenant_id, c.category);
CREATE INDEX FOR (b:BankAccount) ON (b.tenant_id, b.account_number_masked);
CREATE INDEX FOR (p:PhoneNumber) ON (p.tenant_id, p.number);
CREATE INDEX FOR (l:Location) ON (l.tenant_id, l.address);
CREATE INDEX FOR (v:Vehicle) ON (v.tenant_id, v.plate_number);

// 2. Full-text search index (used by fuzzy search index lookups)
CREATE FULLTEXT INDEX person_fulltext FOR (n:Suspect|PhoneNumber|BankAccount|UPI_VPA) ON EACH [n.name, n.aliases, n.number, n.vpa, n.holder_name];
