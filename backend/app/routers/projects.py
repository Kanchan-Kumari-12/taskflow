import uuid

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.deps import get_current_user, get_workspace_member, require_workspace_admin
from app.db.session import get_db
from app.models.user import User
from app.models.workspace_member import WorkspaceMember
from app.schemas.project import ProjectCreate, ProjectRead
from app.services import project_service

router = APIRouter(prefix="/workspaces/{workspace_id}/projects", tags=["projects"])


@router.post("", response_model=ProjectRead, status_code=status.HTTP_201_CREATED)
def create_project(
    workspace_id: uuid.UUID,
    data: ProjectCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
    _admin: WorkspaceMember = Depends(require_workspace_admin),
):
    return project_service.create_project(db, workspace_id, data, current_user)


@router.get("", response_model=list[ProjectRead])
def list_projects(
    workspace_id: uuid.UUID,
    db: Session = Depends(get_db),
    _member: WorkspaceMember = Depends(get_workspace_member),
):
    return project_service.list_projects(db, workspace_id)


@router.get("/{project_id}", response_model=ProjectRead)
def get_project(
    workspace_id: uuid.UUID,
    project_id: uuid.UUID,
    db: Session = Depends(get_db),
    _member: WorkspaceMember = Depends(get_workspace_member),
):
    project = project_service.get_project(db, workspace_id, project_id)
    if project is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Project not found")
    return project