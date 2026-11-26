from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.task import Task
from app.models.user import User
from app.schemas.task import TaskCreate, TaskUpdate
from app.services import project_service, workspace_service

NULLABLE_FIELDS = {"description", "assignee_id", "due_date"}


def _check_assignee(db: Session, workspace_id, assignee_id) -> None:
    if assignee_id is None:
        return
    if workspace_service.get_membership(db, workspace_id, assignee_id) is None:
        raise ValueError("Assignee must be a member of this workspace")


def _require_project(db: Session, workspace_id, project_id) -> None:
    if project_service.get_project(db, workspace_id, project_id) is None:
        raise LookupError("Project not found")


def create_task(db: Session, workspace_id, project_id, data: TaskCreate, user: User) -> Task:
    _require_project(db, workspace_id, project_id)
    _check_assignee(db, workspace_id, data.assignee_id)

    task = Task(
        project_id=project_id,
        title=data.title,
        description=data.description,
        status=data.status,
        assignee_id=data.assignee_id,
        due_date=data.due_date,
        created_by=user.id,
    )
    db.add(task)
    db.commit()
    db.refresh(task)
    return task


def list_tasks(db: Session, workspace_id, project_id, status: str | None = None) -> list[Task]:
    _require_project(db, workspace_id, project_id)
    stmt = select(Task).where(Task.project_id == project_id)
    if status is not None:
        stmt = stmt.where(Task.status == status)
    return list(db.scalars(stmt.order_by(Task.created_at)))


def get_task(db: Session, workspace_id, project_id, task_id) -> Task:
    _require_project(db, workspace_id, project_id)
    task = db.get(Task, task_id)
    if task is None or task.project_id != project_id:
        raise LookupError("Task not found")
    return task


def update_task(db: Session, workspace_id, project_id, task_id, data: TaskUpdate) -> Task:
    task = get_task(db, workspace_id, project_id, task_id)
    changes = data.model_dump(exclude_unset=True)

    if "assignee_id" in changes:
        _check_assignee(db, workspace_id, changes["assignee_id"])

    for field, value in changes.items():
        if value is None and field not in NULLABLE_FIELDS:
            continue  # title/status khali nahi ho sakte
        setattr(task, field, value)

    db.commit()
    db.refresh(task)
    return task


def delete_task(db: Session, workspace_id, project_id, task_id) -> None:
    task = get_task(db, workspace_id, project_id, task_id)
    db.delete(task)
    db.commit()