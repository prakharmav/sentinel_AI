// ============================================================
// SentinelAI — Karnataka Crime Graph Dataset Seed Migrations
// ============================================================

MERGE (s0:Suspect {id: '14d21f62-ff8b-42fe-8f0f-23a4dbe5aaad', name: 'Suresh Acharya', tenant_id: '00000000-0000-0000-0000-000000000001', risk_score: 0.90});
MERGE (s1:Suspect {id: '77596e5e-6258-4800-a643-635ab6f06b77', name: 'Ramesh Hegde', tenant_id: '00000000-0000-0000-0000-000000000001', risk_score: 0.90});
MERGE (s2:Suspect {id: '8935c413-c59f-4167-aaf1-00c1ad39c69d', name: 'Ganesh Murthy', tenant_id: '00000000-0000-0000-0000-000000000001', risk_score: 0.90});
MERGE (s3:Suspect {id: '52950830-d881-41c6-a083-54f4906db97a', name: 'Sandhya Nayar', tenant_id: '00000000-0000-0000-0000-000000000001', risk_score: 0.90});
MERGE (s4:Suspect {id: '75b7edf6-4e61-4c9a-b3a3-dbf2f1ec07b0', name: 'Riya Shetty', tenant_id: '00000000-0000-0000-0000-000000000001', risk_score: 0.90});
MERGE (s5:Suspect {id: '8f9b88ad-113a-43f0-94be-e7a9e05dbd8f', name: 'Sunitha Murthy', tenant_id: '00000000-0000-0000-0000-000000000001', risk_score: 0.90});
MERGE (s6:Suspect {id: 'cf87ddd6-11a2-4601-8303-24288ff8bd97', name: 'Sandhya Nayar', tenant_id: '00000000-0000-0000-0000-000000000001', risk_score: 0.90});
MERGE (s7:Suspect {id: 'b8151f48-a4a7-46b3-8dba-890916d292ff', name: 'Priya Hegde', tenant_id: '00000000-0000-0000-0000-000000000001', risk_score: 0.90});
MERGE (s8:Suspect {id: '32a5a1d3-792b-4a3d-be15-b48ee439982e', name: 'Sunitha Bhat', tenant_id: '00000000-0000-0000-0000-000000000001', risk_score: 0.90});
MERGE (s9:Suspect {id: '63eb35c5-9392-4dc7-af4b-73adb3a4d645', name: 'Ganesh Patil', tenant_id: '00000000-0000-0000-0000-000000000001', risk_score: 0.90});

MERGE (c0:Crime {id: '904d58ab-ecd2-4950-b809-c3a36260cea5', case_number: 'CYB/KA/2026/1042', tenant_id: '00000000-0000-0000-0000-000000000001', category: 'PHISHING', risk_score: 0.85});
MERGE (c1:Crime {id: '6bd43cb9-42cf-4b65-8706-dbc8beb76542', case_number: 'CYB/KA/2026/1043', tenant_id: '00000000-0000-0000-0000-000000000001', category: 'IDENTITY_THEFT', risk_score: 0.85});
MERGE (c2:Crime {id: '4546ff95-35f2-4fe8-bcd6-effc6ab85a36', case_number: 'CYB/KA/2026/1044', tenant_id: '00000000-0000-0000-0000-000000000001', category: 'UPI_FRAUD', risk_score: 0.85});
MERGE (c3:Crime {id: 'a97d1d2e-5e7f-48a3-9e85-86f81f9931cb', case_number: 'CYB/KA/2026/1045', tenant_id: '00000000-0000-0000-0000-000000000001', category: 'IDENTITY_THEFT', risk_score: 0.85});
MERGE (c4:Crime {id: 'c198b2ce-0eea-46f2-85e5-60f4a0e04347', case_number: 'CYB/KA/2026/1046', tenant_id: '00000000-0000-0000-0000-000000000001', category: 'RANSOMWARE', risk_score: 0.85});
MERGE (c5:Crime {id: '2ac1e5fe-a6d6-44d7-9bfe-75159277c71d', case_number: 'CYB/KA/2026/1047', tenant_id: '00000000-0000-0000-0000-000000000001', category: 'PHISHING', risk_score: 0.85});
MERGE (c6:Crime {id: 'f8f24a0f-6135-4c8c-abe5-290db8543159', case_number: 'CYB/KA/2026/1048', tenant_id: '00000000-0000-0000-0000-000000000001', category: 'RANSOMWARE', risk_score: 0.85});
MERGE (c7:Crime {id: 'aba166d9-2dd2-4830-b5be-dd360789e5c1', case_number: 'CYB/KA/2026/1049', tenant_id: '00000000-0000-0000-0000-000000000001', category: 'PHISHING', risk_score: 0.85});
MERGE (c8:Crime {id: '03436f27-42f2-43f7-a493-de99f63f9855', case_number: 'CYB/KA/2026/1050', tenant_id: '00000000-0000-0000-0000-000000000001', category: 'RANSOMWARE', risk_score: 0.85});
MERGE (c9:Crime {id: '4d936954-f929-4776-935f-c57371b3bc4c', case_number: 'CYB/KA/2026/1051', tenant_id: '00000000-0000-0000-0000-000000000001', category: 'PHISHING', risk_score: 0.85});
MERGE (c10:Crime {id: '46966312-1864-48e0-9814-b59de7532675', case_number: 'CYB/KA/2026/1052', tenant_id: '00000000-0000-0000-0000-000000000001', category: 'RANSOMWARE', risk_score: 0.85});
MERGE (c11:Crime {id: '3b246c15-379e-4250-af6e-9d3b1342a3d0', case_number: 'CYB/KA/2026/1053', tenant_id: '00000000-0000-0000-0000-000000000001', category: 'UPI_FRAUD', risk_score: 0.85});
MERGE (c12:Crime {id: '561522ef-7233-43b3-8a1f-8d48a1535497', case_number: 'CYB/KA/2026/1054', tenant_id: '00000000-0000-0000-0000-000000000001', category: 'IDENTITY_THEFT', risk_score: 0.85});
MERGE (c13:Crime {id: '66d0fb35-9797-4a04-b8b7-2d56bce7de77', case_number: 'CYB/KA/2026/1055', tenant_id: '00000000-0000-0000-0000-000000000001', category: 'IDENTITY_THEFT', risk_score: 0.85});
MERGE (c14:Crime {id: '80cb20aa-d758-4677-bd76-a42fcf6c33e4', case_number: 'CYB/KA/2026/1056', tenant_id: '00000000-0000-0000-0000-000000000001', category: 'PHISHING', risk_score: 0.85});

MERGE (b0:BankAccount {id: 'dee4b378-0129-4588-8513-0a153be0125e', label: 'Canara Bank XXXX7951', tenant_id: '00000000-0000-0000-0000-000000000001', risk_score: 0.77});
MERGE (p0:PhoneNumber {id: '5327bc18-51b5-4737-9132-b2c14c457faf', label: '+91-938990435', tenant_id: '00000000-0000-0000-0000-000000000001', risk_score: 0.70});
MERGE (v0:Vehicle {id: '6562ec83-e04c-46fb-a82b-62e0ab03861d', label: 'KA-05-HG-3054', tenant_id: '00000000-0000-0000-0000-000000000001'});
MERGE (b1:BankAccount {id: 'a43afef3-c43d-4677-9e05-d46a282d3d5e', label: 'Canara Bank XXXX3947', tenant_id: '00000000-0000-0000-0000-000000000001', risk_score: 0.61});
MERGE (p1:PhoneNumber {id: 'b4379615-47d2-4ff0-b538-f70cd917be51', label: '+91-935546476', tenant_id: '00000000-0000-0000-0000-000000000001', risk_score: 0.70});
MERGE (v1:Vehicle {id: '1cb297b1-3a1d-4540-8cfb-d235b953152b', label: 'KA-19-PR-2912', tenant_id: '00000000-0000-0000-0000-000000000001'});
MERGE (b2:BankAccount {id: '1939e49b-a872-43d1-a363-63d313865c04', label: 'Canara Bank XXXX5343', tenant_id: '00000000-0000-0000-0000-000000000001', risk_score: 0.64});
MERGE (p2:PhoneNumber {id: 'a7cb9a4d-d0b7-4286-a56f-7e86c72d76f2', label: '+91-926405737', tenant_id: '00000000-0000-0000-0000-000000000001', risk_score: 0.70});
MERGE (v2:Vehicle {id: '5a8efdae-bdda-434f-ab99-16ce628aa48b', label: 'KA-02-OL-3192', tenant_id: '00000000-0000-0000-0000-000000000001'});
MERGE (b3:BankAccount {id: '7037da50-9e31-4575-8e6c-ac385232b1e8', label: 'Canara Bank XXXX2428', tenant_id: '00000000-0000-0000-0000-000000000001', risk_score: 0.85});
MERGE (p3:PhoneNumber {id: '24091e4a-a14d-4361-a54c-dcefa5e98b74', label: '+91-958598918', tenant_id: '00000000-0000-0000-0000-000000000001', risk_score: 0.70});
MERGE (v3:Vehicle {id: '54135670-e246-4ff6-b283-68a92b749032', label: 'KA-29-IL-6389', tenant_id: '00000000-0000-0000-0000-000000000001'});
MERGE (b4:BankAccount {id: '02fb485e-0dcd-4d90-aae3-3eb05a4054a2', label: 'Canara Bank XXXX6517', tenant_id: '00000000-0000-0000-0000-000000000001', risk_score: 0.89});
MERGE (p4:PhoneNumber {id: '28a00dee-ab3f-4239-a38d-4987b7779c23', label: '+91-916280378', tenant_id: '00000000-0000-0000-0000-000000000001', risk_score: 0.70});
MERGE (v4:Vehicle {id: '3f724781-89f6-4e0c-ba0a-3897c742cf1b', label: 'KA-36-SA-6126', tenant_id: '00000000-0000-0000-0000-000000000001'});
MERGE (b5:BankAccount {id: 'c6dbd3e5-542f-4439-81c3-4ec49c0bf7bb', label: 'Canara Bank XXXX6406', tenant_id: '00000000-0000-0000-0000-000000000001', risk_score: 0.71});
MERGE (p5:PhoneNumber {id: 'ff740d69-9612-4f45-a23c-235293ba82e7', label: '+91-968000330', tenant_id: '00000000-0000-0000-0000-000000000001', risk_score: 0.70});
MERGE (v5:Vehicle {id: '0a5d8ead-8c93-4abc-b0b1-81976d056482', label: 'KA-25-TU-6099', tenant_id: '00000000-0000-0000-0000-000000000001'});
MERGE (b6:BankAccount {id: 'd109ffb0-8535-4e8f-82b7-5f8e322115e6', label: 'Canara Bank XXXX1741', tenant_id: '00000000-0000-0000-0000-000000000001', risk_score: 0.63});
MERGE (p6:PhoneNumber {id: '641b74cf-b849-4ccd-9d48-dcc3c4b2bbf3', label: '+91-962994095', tenant_id: '00000000-0000-0000-0000-000000000001', risk_score: 0.70});
MERGE (v6:Vehicle {id: '76244d67-0d70-435d-ab9e-46c9e89b5f60', label: 'KA-26-SX-5099', tenant_id: '00000000-0000-0000-0000-000000000001'});
MERGE (b7:BankAccount {id: 'a6003e7b-6b8c-4030-b182-de51ee668b68', label: 'Canara Bank XXXX4181', tenant_id: '00000000-0000-0000-0000-000000000001', risk_score: 0.79});
MERGE (p7:PhoneNumber {id: '6f8aebc9-24f0-4539-9745-e2e76b93f3e4', label: '+91-920457166', tenant_id: '00000000-0000-0000-0000-000000000001', risk_score: 0.70});
MERGE (v7:Vehicle {id: 'c196da4c-1a86-4db2-87b2-04bc4e2a1306', label: 'KA-54-WN-1835', tenant_id: '00000000-0000-0000-0000-000000000001'});
MERGE (b8:BankAccount {id: '55040315-7355-4eff-bfe4-b14ec1d9d033', label: 'Canara Bank XXXX8914', tenant_id: '00000000-0000-0000-0000-000000000001', risk_score: 0.78});
MERGE (p8:PhoneNumber {id: '1cd4d304-692e-4d83-bb5c-7de26c707514', label: '+91-985562542', tenant_id: '00000000-0000-0000-0000-000000000001', risk_score: 0.70});
MERGE (v8:Vehicle {id: 'd6050101-ebb7-44df-88b0-d9d3eb69c97b', label: 'KA-41-EP-3265', tenant_id: '00000000-0000-0000-0000-000000000001'});
MERGE (b9:BankAccount {id: 'e0313e0f-de53-4499-ba31-5cf5ce51fab6', label: 'Canara Bank XXXX8484', tenant_id: '00000000-0000-0000-0000-000000000001', risk_score: 0.82});
MERGE (p9:PhoneNumber {id: '47b7c043-c616-419a-9387-ed62208b810e', label: '+91-959806933', tenant_id: '00000000-0000-0000-0000-000000000001', risk_score: 0.70});
MERGE (v9:Vehicle {id: 'a392b26e-e399-4f14-a4c8-a8f23c4cda7b', label: 'KA-17-XC-7927', tenant_id: '00000000-0000-0000-0000-000000000001'});

MATCH (s:Suspect {id: '14d21f62-ff8b-42fe-8f0f-23a4dbe5aaad'}), (b:BankAccount {id: 'dee4b378-0129-4588-8513-0a153be0125e'}) MERGE (s)-[:CONTROLS]->(b);
MATCH (s:Suspect {id: '14d21f62-ff8b-42fe-8f0f-23a4dbe5aaad'}), (p:PhoneNumber {id: '5327bc18-51b5-4737-9132-b2c14c457faf'}) MERGE (s)-[:OWNS]->(p);
MATCH (s:Suspect {id: '14d21f62-ff8b-42fe-8f0f-23a4dbe5aaad'}), (v:Vehicle {id: '6562ec83-e04c-46fb-a82b-62e0ab03861d'}) MERGE (s)-[:OWNS]->(v);
MATCH (s:Suspect {id: '14d21f62-ff8b-42fe-8f0f-23a4dbe5aaad'}), (c:Crime {id: '2ac1e5fe-a6d6-44d7-9bfe-75159277c71d'}) MERGE (s)-[:INVOLVED_IN]->(c);
MATCH (s:Suspect {id: '77596e5e-6258-4800-a643-635ab6f06b77'}), (b:BankAccount {id: 'a43afef3-c43d-4677-9e05-d46a282d3d5e'}) MERGE (s)-[:CONTROLS]->(b);
MATCH (s:Suspect {id: '77596e5e-6258-4800-a643-635ab6f06b77'}), (p:PhoneNumber {id: 'b4379615-47d2-4ff0-b538-f70cd917be51'}) MERGE (s)-[:OWNS]->(p);
MATCH (s:Suspect {id: '77596e5e-6258-4800-a643-635ab6f06b77'}), (v:Vehicle {id: '1cb297b1-3a1d-4540-8cfb-d235b953152b'}) MERGE (s)-[:OWNS]->(v);
MATCH (s:Suspect {id: '77596e5e-6258-4800-a643-635ab6f06b77'}), (c:Crime {id: '3b246c15-379e-4250-af6e-9d3b1342a3d0'}) MERGE (s)-[:INVOLVED_IN]->(c);
MATCH (s:Suspect {id: '8935c413-c59f-4167-aaf1-00c1ad39c69d'}), (b:BankAccount {id: '1939e49b-a872-43d1-a363-63d313865c04'}) MERGE (s)-[:CONTROLS]->(b);
MATCH (s:Suspect {id: '8935c413-c59f-4167-aaf1-00c1ad39c69d'}), (p:PhoneNumber {id: 'a7cb9a4d-d0b7-4286-a56f-7e86c72d76f2'}) MERGE (s)-[:OWNS]->(p);
MATCH (s:Suspect {id: '8935c413-c59f-4167-aaf1-00c1ad39c69d'}), (v:Vehicle {id: '5a8efdae-bdda-434f-ab99-16ce628aa48b'}) MERGE (s)-[:OWNS]->(v);
MATCH (s:Suspect {id: '8935c413-c59f-4167-aaf1-00c1ad39c69d'}), (c:Crime {id: 'c198b2ce-0eea-46f2-85e5-60f4a0e04347'}) MERGE (s)-[:INVOLVED_IN]->(c);
MATCH (s:Suspect {id: '52950830-d881-41c6-a083-54f4906db97a'}), (b:BankAccount {id: '7037da50-9e31-4575-8e6c-ac385232b1e8'}) MERGE (s)-[:CONTROLS]->(b);
MATCH (s:Suspect {id: '52950830-d881-41c6-a083-54f4906db97a'}), (p:PhoneNumber {id: '24091e4a-a14d-4361-a54c-dcefa5e98b74'}) MERGE (s)-[:OWNS]->(p);
MATCH (s:Suspect {id: '52950830-d881-41c6-a083-54f4906db97a'}), (v:Vehicle {id: '54135670-e246-4ff6-b283-68a92b749032'}) MERGE (s)-[:OWNS]->(v);
MATCH (s:Suspect {id: '52950830-d881-41c6-a083-54f4906db97a'}), (c:Crime {id: '6bd43cb9-42cf-4b65-8706-dbc8beb76542'}) MERGE (s)-[:INVOLVED_IN]->(c);
MATCH (s:Suspect {id: '75b7edf6-4e61-4c9a-b3a3-dbf2f1ec07b0'}), (b:BankAccount {id: '02fb485e-0dcd-4d90-aae3-3eb05a4054a2'}) MERGE (s)-[:CONTROLS]->(b);
MATCH (s:Suspect {id: '75b7edf6-4e61-4c9a-b3a3-dbf2f1ec07b0'}), (p:PhoneNumber {id: '28a00dee-ab3f-4239-a38d-4987b7779c23'}) MERGE (s)-[:OWNS]->(p);
MATCH (s:Suspect {id: '75b7edf6-4e61-4c9a-b3a3-dbf2f1ec07b0'}), (v:Vehicle {id: '3f724781-89f6-4e0c-ba0a-3897c742cf1b'}) MERGE (s)-[:OWNS]->(v);
MATCH (s:Suspect {id: '75b7edf6-4e61-4c9a-b3a3-dbf2f1ec07b0'}), (c:Crime {id: '2ac1e5fe-a6d6-44d7-9bfe-75159277c71d'}) MERGE (s)-[:INVOLVED_IN]->(c);
MATCH (s:Suspect {id: '8f9b88ad-113a-43f0-94be-e7a9e05dbd8f'}), (b:BankAccount {id: 'c6dbd3e5-542f-4439-81c3-4ec49c0bf7bb'}) MERGE (s)-[:CONTROLS]->(b);
MATCH (s:Suspect {id: '8f9b88ad-113a-43f0-94be-e7a9e05dbd8f'}), (p:PhoneNumber {id: 'ff740d69-9612-4f45-a23c-235293ba82e7'}) MERGE (s)-[:OWNS]->(p);
MATCH (s:Suspect {id: '8f9b88ad-113a-43f0-94be-e7a9e05dbd8f'}), (v:Vehicle {id: '0a5d8ead-8c93-4abc-b0b1-81976d056482'}) MERGE (s)-[:OWNS]->(v);
MATCH (s:Suspect {id: '8f9b88ad-113a-43f0-94be-e7a9e05dbd8f'}), (c:Crime {id: '561522ef-7233-43b3-8a1f-8d48a1535497'}) MERGE (s)-[:INVOLVED_IN]->(c);
MATCH (s:Suspect {id: 'cf87ddd6-11a2-4601-8303-24288ff8bd97'}), (b:BankAccount {id: 'd109ffb0-8535-4e8f-82b7-5f8e322115e6'}) MERGE (s)-[:CONTROLS]->(b);
MATCH (s:Suspect {id: 'cf87ddd6-11a2-4601-8303-24288ff8bd97'}), (p:PhoneNumber {id: '641b74cf-b849-4ccd-9d48-dcc3c4b2bbf3'}) MERGE (s)-[:OWNS]->(p);
MATCH (s:Suspect {id: 'cf87ddd6-11a2-4601-8303-24288ff8bd97'}), (v:Vehicle {id: '76244d67-0d70-435d-ab9e-46c9e89b5f60'}) MERGE (s)-[:OWNS]->(v);
MATCH (s:Suspect {id: 'cf87ddd6-11a2-4601-8303-24288ff8bd97'}), (c:Crime {id: '3b246c15-379e-4250-af6e-9d3b1342a3d0'}) MERGE (s)-[:INVOLVED_IN]->(c);
MATCH (s:Suspect {id: 'b8151f48-a4a7-46b3-8dba-890916d292ff'}), (b:BankAccount {id: 'a6003e7b-6b8c-4030-b182-de51ee668b68'}) MERGE (s)-[:CONTROLS]->(b);
MATCH (s:Suspect {id: 'b8151f48-a4a7-46b3-8dba-890916d292ff'}), (p:PhoneNumber {id: '6f8aebc9-24f0-4539-9745-e2e76b93f3e4'}) MERGE (s)-[:OWNS]->(p);
MATCH (s:Suspect {id: 'b8151f48-a4a7-46b3-8dba-890916d292ff'}), (v:Vehicle {id: 'c196da4c-1a86-4db2-87b2-04bc4e2a1306'}) MERGE (s)-[:OWNS]->(v);
MATCH (s:Suspect {id: 'b8151f48-a4a7-46b3-8dba-890916d292ff'}), (c:Crime {id: '66d0fb35-9797-4a04-b8b7-2d56bce7de77'}) MERGE (s)-[:INVOLVED_IN]->(c);
MATCH (s:Suspect {id: '32a5a1d3-792b-4a3d-be15-b48ee439982e'}), (b:BankAccount {id: '55040315-7355-4eff-bfe4-b14ec1d9d033'}) MERGE (s)-[:CONTROLS]->(b);
MATCH (s:Suspect {id: '32a5a1d3-792b-4a3d-be15-b48ee439982e'}), (p:PhoneNumber {id: '1cd4d304-692e-4d83-bb5c-7de26c707514'}) MERGE (s)-[:OWNS]->(p);
MATCH (s:Suspect {id: '32a5a1d3-792b-4a3d-be15-b48ee439982e'}), (v:Vehicle {id: 'd6050101-ebb7-44df-88b0-d9d3eb69c97b'}) MERGE (s)-[:OWNS]->(v);
MATCH (s:Suspect {id: '32a5a1d3-792b-4a3d-be15-b48ee439982e'}), (c:Crime {id: '2ac1e5fe-a6d6-44d7-9bfe-75159277c71d'}) MERGE (s)-[:INVOLVED_IN]->(c);
MATCH (s:Suspect {id: '63eb35c5-9392-4dc7-af4b-73adb3a4d645'}), (b:BankAccount {id: 'e0313e0f-de53-4499-ba31-5cf5ce51fab6'}) MERGE (s)-[:CONTROLS]->(b);
MATCH (s:Suspect {id: '63eb35c5-9392-4dc7-af4b-73adb3a4d645'}), (p:PhoneNumber {id: '47b7c043-c616-419a-9387-ed62208b810e'}) MERGE (s)-[:OWNS]->(p);
MATCH (s:Suspect {id: '63eb35c5-9392-4dc7-af4b-73adb3a4d645'}), (v:Vehicle {id: 'a392b26e-e399-4f14-a4c8-a8f23c4cda7b'}) MERGE (s)-[:OWNS]->(v);
MATCH (s:Suspect {id: '63eb35c5-9392-4dc7-af4b-73adb3a4d645'}), (c:Crime {id: '561522ef-7233-43b3-8a1f-8d48a1535497'}) MERGE (s)-[:INVOLVED_IN]->(c);

MATCH (b1:BankAccount {id: 'dee4b378-0129-4588-8513-0a153be0125e'}), (b2:BankAccount {id: 'a43afef3-c43d-4677-9e05-d46a282d3d5e'})
MERGE (b1)-[:TRANSFERRED {amount: 36000.0, timestamp: '2026-06-05T11:00:00Z'}]->(b2);
MATCH (b1:BankAccount {id: 'a43afef3-c43d-4677-9e05-d46a282d3d5e'}), (b2:BankAccount {id: '1939e49b-a872-43d1-a363-63d313865c04'})
MERGE (b1)-[:TRANSFERRED {amount: 210000.0, timestamp: '2026-06-23T11:00:00Z'}]->(b2);

