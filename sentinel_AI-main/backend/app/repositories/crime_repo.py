from sqlalchemy.orm import Session
from typing import List, Optional
import uuid

from app.repositories.base_repo import BaseRepository
from app.models.pg_models import CrimeModel

class CrimeRepository(BaseRepository[CrimeModel]):
    """
    Transactional database repository executing optimized case queries.
    """
    def __init__(self, db: Session):
        super().__init__(CrimeModel, db)

    def get_by_tenant(self, tenant_id: uuid.UUID, skip: int = 0, limit: int = 100) -> List[CrimeModel]:
        return self.db.query(CrimeModel).filter(
            CrimeModel.tenant_id == tenant_id
        ).offset(skip).limit(limit).all()

    def get_by_severity(self, tenant_id: uuid.UUID, severity: str) -> List[CrimeModel]:
        return self.db.query(CrimeModel).filter(
            CrimeModel.tenant_id == tenant_id,
            CrimeModel.severity == severity
        ).all()

    def get_case_by_number(self, tenant_id: uuid.UUID, case_number: str) -> Optional[CrimeModel]:
        return self.db.query(CrimeModel).filter(
            CrimeModel.tenant_id == tenant_id,
            CrimeModel.case_number == case_number
        ).first()
