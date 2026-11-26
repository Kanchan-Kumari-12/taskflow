from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.user import User
from app.models.workspace import Workspace
from app.models.workspace_member import WorkspaceMember
from app.schemas.workspace import WorkspaceCreate
from app.schemas.workspace_member import MemberAdd, MemberRead
from app.services import user_service


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


def get_membership(db: Session, workspace_id, user_id) -> WorkspaceMember | None:
    return db.get(WorkspaceMember, (workspace_id, user_id))


def add_member(db: Session, workspace_id, data: MemberAdd) -> MemberRead:
    user = user_service.get_user_by_email(db, data.email.lower())
    if user is None:
        raise LookupError("User with this email not found")
    if get_membership(db, workspace_id, user.id):
        raise ValueError("User is already a member")

    member = WorkspaceMember(workspace_id=workspace_id, user_id=user.id, role=data.role)
    db.add(member)
    db.commit()
    db.refresh(member)
    return MemberRead(
        user_id=user.id,
        name=user.name,
        email=user.email,
        role=member.role,
        joined_at=member.joined_at,
    )


def list_members(db: Session, workspace_id) -> list[MemberRead]:
    stmt = (
        select(WorkspaceMember, User)
        .join(User, User.id == WorkspaceMember.user_id)
        .where(WorkspaceMember.workspace_id == workspace_id)
        .order_by(WorkspaceMember.joined_at)
    )
    return [
        MemberRead(
            user_id=user.id,
            name=user.name,
            email=user.email,
            role=member.role,
            joined_at=member.joined_at,
        )
        for member, user in db.execute(stmt)
    ]