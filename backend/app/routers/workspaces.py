import uuid

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.deps import get_current_user, get_workspace_member, require_workspace_admin
from app.db.session import get_db
from app.models.user import User
from app.models.workspace_member import WorkspaceMember
from app.schemas.workspace import WorkspaceCreate, WorkspaceRead
from app.schemas.workspace_member import MemberAdd, MemberRead
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


@router.post(
    "/{workspace_id}/members",
    response_model=MemberRead,
    status_code=status.HTTP_201_CREATED,
)
def add_member(
    workspace_id: uuid.UUID,
    data: MemberAdd,
    db: Session = Depends(get_db),
    _admin: WorkspaceMember = Depends(require_workspace_admin),
):
    try:
        return workspace_service.add_member(db, workspace_id, data)
    except LookupError as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail=str(e))


@router.get("/{workspace_id}/members", response_model=list[MemberRead])
def list_members(
    workspace_id: uuid.UUID,
    db: Session = Depends(get_db),
    _member: WorkspaceMember = Depends(get_workspace_member),
):
    return workspace_service.list_members(db, workspace_id)