"""Add full_name to users

Revision ID: 5bb9bee66d6e
Revises: 6b243f1a366a
Create Date: 2026-03-02 17:38:13.511178

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '5bb9bee66d6e'
down_revision: Union[str, Sequence[str], None] = '6b243f1a366a'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Добавляем колонку full_name в таблицу users
    op.add_column('users', sa.Column('full_name', sa.String(), nullable=True))

def downgrade() -> None:
    # Удаляем колонку full_name
    op.drop_column('users', 'full_name')
