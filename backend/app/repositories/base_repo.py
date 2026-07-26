from sqlalchemy.orm import Session
from typing import Generic, TypeVar, Type, List, Optional, Any
import logging

logger = logging.getLogger("sentinelai")
T = TypeVar("T")

class BaseRepository(Generic[T]):
    """
    Base generic repository defining standard CRUD transaction paradigms with rollbacks.
    """
    def __init__(self, model: Type[T], db: Session):
        self.model = model
        self.db = db

    def get_by_id(self, id: Any) -> Optional[T]:
        return self.db.query(self.model).filter(self.model.id == id).first()

    def get_all(self, skip: int = 0, limit: int = 100) -> List[T]:
        return self.db.query(self.model).offset(skip).limit(limit).all()

    def create(self, obj: T) -> T:
        try:
            self.db.add(obj)
            self.db.commit()
            self.db.refresh(obj)
            return obj
        except Exception as e:
            self.db.rollback()
            logger.error(f"Failed transaction create on model {self.model.__name__}: {e}")
            raise e

    def update(self, obj: T) -> T:
        try:
            self.db.commit()
            self.db.refresh(obj)
            return obj
        except Exception as e:
            self.db.rollback()
            logger.error(f"Failed transaction update on model {self.model.__name__}: {e}")
            raise e

    def delete(self, obj: T) -> None:
        try:
            self.db.delete(obj)
            self.db.commit()
        except Exception as e:
            self.db.rollback()
            logger.error(f"Failed transaction delete on model {self.model.__name__}: {e}")
            raise e
