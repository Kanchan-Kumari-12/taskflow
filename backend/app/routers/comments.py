import uuid

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.deps import get_current_user, get_workspace_member
from app.db.session import get_db
from app.models.user import User
from app.models.workspace_member import WorkspaceMember
from app.schemas.comment import CommentCreate, CommentRead
from app.services import comment_service

router = APIRouter(
    prefix="/workspaces/{workspace_id}/projects/{project_id}/tasks/{task_id}/comments",
    tags=["comments"],
)


@router.post("", response_model=CommentRead, status_code=status.HTTP_201_CREATED)
def create_comment(
    workspace_id: uuid.UUID,
    project_id: uuid.UUID,
    task_id: uuid.UUID,
    data: CommentCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
    _member: WorkspaceMember = Depends(get_workspace_member),
):
    try:
        return comment_service.create_comment(
            db, workspace_id, project_id, task_id, data, current_user
        )
    except LookupError as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))


@router.get("", response_model=list[CommentRead])
def list_comments(
    workspace_id: uuid.UUID,
    project_id: uuid.UUID,
    task_id: uuid.UUID,
    db: Session = Depends(get_db),
    _member: WorkspaceMember = Depends(get_workspace_member),
):
    try:
        return comment_service.list_comments(db, workspace_id, project_id, task_id)
    except LookupError as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))


@router.delete("/{comment_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_comment(
    workspace_id: uuid.UUID,
    project_id: uuid.UUID,
    task_id: uuid.UUID,
    comment_id: uuid.UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
    member: WorkspaceMember = Depends(get_workspace_member),
):
    try:
        comment_service.delete_comment(
            db, workspace_id, project_id, task_id, comment_id, current_user, member
        )
    except LookupError as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))
    except PermissionError as e:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail=str(e))