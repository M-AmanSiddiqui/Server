from apscheduler.schedulers.asyncio import AsyncIOScheduler
from src.tasks.monitor_task import run_monitoring_cycle
from src.core.config import get_settings

settings = get_settings()
scheduler = AsyncIOScheduler()


def start_scheduler():
    scheduler.add_job(
        run_monitoring_cycle,
        "interval",
        seconds=settings.check_interval_seconds,
        id="monitor_servers",
        replace_existing=True
    )
    scheduler.start()


def stop_scheduler():
    scheduler.shutdown()
