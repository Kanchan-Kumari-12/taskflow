from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.comment import Comment
from app.models.user import User
from app.models.workspace_member import WorkspaceMember
from app.schemas.comment import CommentCreate
from app.services import task_service


def create_comment(
    db: Session, workspace_id, project_id, task_id, data: CommentCreate, user: User
) -> Comment:
    task_service.get_task(db, workspace_id, project_id, task_id)  # task nahi mila to LookupError

    comment = Comment(task_id=task_id, user_id=user.id, body=data.body)
    db.add(comment)
    db.commit()
    db.refresh(comment)
    return comment


def list_comments(db: Session, workspace_id, project_id, task_id) -> list[Comment]:
    task_service.get_task(db, workspace_id, project_id, task_id)
    stmt = select(Comment).where(Comment.task_id == task_id).order_by(Comment.created_at)
    return list(db.scalars(stmt))


def delete_comment(
    db: Session,
    workspace_id,
    project_id,
    task_id,
    comment_id,
    user: User,
    member: WorkspaceMember,
) -> None:
    task_service.get_task(db, workspace_id, project_id, task_id)
    comment = db.get(Comment, comment_id)
    if comment is None or comment.task_id != task_id:
        raise LookupError("Comment not found")

    if comment.user_id != user.id and member.role != "admin":
        raise PermissionError("Only the author or an admin can delete this comment")

    db.delete(comment)
    db.commit()