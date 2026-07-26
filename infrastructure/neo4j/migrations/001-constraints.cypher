// ============================================================
// SentinelAI — Neo4j Unique Constraints Migrations
// ============================================================

CREATE CONSTRAINT FOR (s:Suspect) REQUIRE s.id IS UNIQUE;
CREATE CONSTRAINT FOR (c:Crime) REQUIRE c.id IS UNIQUE;
CREATE CONSTRAINT FOR (b:BankAccount) REQUIRE b.id IS UNIQUE;
CREATE CONSTRAINT FOR (p:PhoneNumber) REQUIRE p.id IS UNIQUE;
CREATE CONSTRAINT FOR (l:Location) REQUIRE l.id IS UNIQUE;
CREATE CONSTRAINT FOR (v:Vehicle) REQUIRE v.id IS UNIQUE;
CREATE CONSTRAINT FOR (u:UPI_VPA) REQUIRE u.id IS UNIQUE;
