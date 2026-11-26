from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.project import Project
from app.models.user import User
from app.schemas.project import ProjectCreate


def create_project(db: Session, workspace_id, data: ProjectCreate, user: User) -> Project:
    project = Project(
        workspace_id=workspace_id,
        name=data.name,
        description=data.description,
        created_by=user.id,
    )
    db.add(project)
    db.commit()
    db.refresh(project)
    return project


def list_projects(db: Session, workspace_id) -> list[Project]:
    stmt = (
        select(Project)
        .where(Project.workspace_id == workspace_id)
        .order_by(Project.created_at)
    )
    return list(db.scalars(stmt))


def get_project(db: Session, workspace_id, project_id) -> Project | None:
    project = db.get(Project, project_id)
    if project is None or project.workspace_id != workspace_id:
        return None
    return project