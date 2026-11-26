import uuid

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from app.core.deps import get_current_user, get_workspace_member, require_workspace_admin
from app.db.session import get_db
from app.models.user import User
from app.models.workspace_member import WorkspaceMember
from app.schemas.task import TaskCreate, TaskRead, TaskStatus, TaskUpdate
from app.services import task_service

router = APIRouter(
    prefix="/workspaces/{workspace_id}/projects/{project_id}/tasks",
    tags=["tasks"],
)


@router.post("", response_model=TaskRead, status_code=status.HTTP_201_CREATED)
def create_task(
    workspace_id: uuid.UUID,
    project_id: uuid.UUID,
    data: TaskCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
    _member: WorkspaceMember = Depends(get_workspace_member),
):
    try:
        return task_service.create_task(db, workspace_id, project_id, data, current_user)
    except LookupError as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))


@router.get("", response_model=list[TaskRead])
def list_tasks(
    workspace_id: uuid.UUID,
    project_id: uuid.UUID,
    status_filter: TaskStatus | None = Query(default=None, alias="status"),
    db: Session = Depends(get_db),
    _member: WorkspaceMember = Depends(get_workspace_member),
):
    try:
        return task_service.list_tasks(db, workspace_id, project_id, status_filter)
    except LookupError as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))


@router.get("/{task_id}", response_model=TaskRead)
def get_task(
    workspace_id: uuid.UUID,
    project_id: uuid.UUID,
    task_id: uuid.UUID,
    db: Session = Depends(get_db),
    _member: WorkspaceMember = Depends(get_workspace_member),
):
    try:
        return task_service.get_task(db, workspace_id, project_id, task_id)
    except LookupError as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))


@router.patch("/{task_id}", response_model=TaskRead)
def update_task(
    workspace_id: uuid.UUID,
    project_id: uuid.UUID,
    task_id: uuid.UUID,
    data: TaskUpdate,
    db: Session = Depends(get_db),
    _member: WorkspaceMember = Depends(get_workspace_member),
):
    try:
        return task_service.update_task(db, workspace_id, project_id, task_id, data)
    except LookupError as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))


@router.delete("/{task_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_task(
    workspace_id: uuid.UUID,
    project_id: uuid.UUID,
    task_id: uuid.UUID,
    db: Session = Depends(get_db),
    _admin: WorkspaceMember = Depends(require_workspace_admin),
):
    try:
        task_service.delete_task(db, workspace_id, project_id, task_id)
    except LookupError as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))