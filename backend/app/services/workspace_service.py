from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.user import User
from app.models.workspace import Workspace
from app.models.workspace_member import WorkspaceMember
from app.schemas.workspace import WorkspaceCreate


def create_workspace(db: Session, data: WorkspaceCreate, user: User) -> Workspace:
    workspace = Workspace(name=data.name, created_by=user.id)
    db.add(workspace)
    db.flush()  # id mil jaye, par abhi commit nahi

    db.add(WorkspaceMember(workspace_id=workspace.id, user_id=user.id, role="admin"))
    db.commit()
    db.refresh(workspace)
    return workspace


def list_user_workspaces(db: Session, user: User) -> list[Workspace]:
    stmt = (
        select(Workspace)
        .join(WorkspaceMember, WorkspaceMember.workspace_id == Workspace.id)
        .where(WorkspaceMember.user_id == user.id)
        .order_by(Workspace.created_at)
    )
    return list(db.scalars(stmt))