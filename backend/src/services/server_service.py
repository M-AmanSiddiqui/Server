from sqlmodel import select
from src.models.server import Server
from src.schemas.server import ServerCreate, ServerUpdate


class ServerService:
    def __init__(self, session):
        self.session = session

    async def get_all(self) -> list[Server]:
        result = await self.session.execute(select(Server))
        return result.scalars().all()

    async def get_by_id(self, server_id: int) -> Server | None:
        result = await self.session.execute(select(Server).where(Server.id == server_id))
        return result.scalar_one_or_none()

    async def create(self, data: ServerCreate, user_id: int) -> Server:
        try:
            # Validate URL format
            if not data.url.startswith(('http://', 'https://')):
                raise ValueError("URL must start with http:// or https://")
            
            server = Server(name=data.name.strip(), url=data.url.strip(), created_by=user_id)
            self.session.add(server)
            await self.session.commit()
            await self.session.refresh(server)
            return server
        except Exception as e:
            await self.session.rollback()
            raise

    async def update(self, server_id: int, data: ServerUpdate) -> Server | None:
        server = await self.get_by_id(server_id)
        if not server:
            return None
        for key, value in data.model_dump(exclude_unset=True).items():
            setattr(server, key, value)
        await self.session.commit()
        await self.session.refresh(server)
        return server

    async def delete(self, server_id: int) -> bool:
        server = await self.get_by_id(server_id)
        if not server:
            return False
        await self.session.delete(server)
        await self.session.commit()
        return True
