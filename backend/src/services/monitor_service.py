import asyncio
import logging
import time

import aiohttp

from src.core.config import get_settings
from src.core.constants import HTTP_TIMEOUT, STATUS_DOWN, STATUS_SLOW, STATUS_UP

settings = get_settings()
logger = logging.getLogger(__name__)


class MonitorService:
    async def check_server(self, url: str) -> tuple[str, int | None]:
        """Returns (status, response_time_ms)."""
        try:
            start = time.time()
            timeout = aiohttp.ClientTimeout(total=HTTP_TIMEOUT, connect=5)
            connector = aiohttp.TCPConnector(ssl=False, limit=10)

            async with aiohttp.ClientSession(timeout=timeout, connector=connector) as session:
                try:
                    async with session.get(
                        url,
                        allow_redirects=True,
                        ssl=False,
                        headers={"User-Agent": "ServerMonitor/1.0"},
                    ) as resp:
                        elapsed_ms = int((time.time() - start) * 1000)

                        if 200 <= resp.status < 400:
                            if elapsed_ms >= settings.slow_threshold_ms:
                                return STATUS_SLOW, elapsed_ms
                            return STATUS_UP, elapsed_ms

                        logger.warning("Server %s returned HTTP %s", url, resp.status)
                        return STATUS_DOWN, elapsed_ms
                except asyncio.TimeoutError:
                    elapsed_ms = int((time.time() - start) * 1000)
                    logger.warning("Timeout for %s after %sms", url, elapsed_ms)
                    return STATUS_DOWN, None
        except asyncio.TimeoutError:
            logger.warning("Connection timeout for %s", url)
            return STATUS_DOWN, None
        except aiohttp.ClientConnectorError as e:
            logger.warning("Connection error for %s: %s", url, str(e))
            return STATUS_DOWN, None
        except aiohttp.ClientError as e:
            logger.warning("Client error for %s: %s", url, str(e))
            return STATUS_DOWN, None
        except Exception as e:
            logger.error("Unexpected error checking %s: %s: %s", url, type(e).__name__, str(e))
            return STATUS_DOWN, None
