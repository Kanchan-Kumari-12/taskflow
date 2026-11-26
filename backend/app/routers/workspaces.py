from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from app.core.deps import get_current_user
from app.db.session import get_db
from app.models.user import User
from app.schemas.workspace import WorkspaceCreate, WorkspaceRead
from app.services import workspace_service

router = APIRouter(prefix="/workspaces", tags=["workspaces"])


@router.post("", response_model=WorkspaceRead, status_code=status.HTTP_201_CREATED)
def create_workspace(
    data: WorkspaceCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return workspace_service.create_workspace(db, data, current_user)


@router.get("", response_model=list[WorkspaceRead])
def list_my_workspaces(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return workspace_service.list_user_workspaces(db, current_user)