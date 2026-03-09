from datetime import datetime, timedelta
from src.core.constants import STATUS_UP, LOG_INTERVALS


class SmartLogger:
    def __init__(self):
        # {server_id: {"last_log": datetime, "interval_index": int, "last_status": str}}
        self.state = {}

    def should_log(self, server_id: int, status: str) -> bool:
        if status == STATUS_UP:
            self._reset_state(server_id)
            return False
        
        now = datetime.utcnow()
        state = self.state.get(server_id)
        
        if not state or state["last_status"] == STATUS_UP:
            self._init_state(server_id, status, now)
            return True
        
        interval = LOG_INTERVALS[state["interval_index"]]
        next_log_time = state["last_log"] + timedelta(seconds=interval)
        
        if now >= next_log_time:
            self._advance_state(server_id, status, now)
            return True
        return False

    def _init_state(self, server_id: int, status: str, now: datetime):
        self.state[server_id] = {"last_log": now, "interval_index": 1, "last_status": status}

    def _advance_state(self, server_id: int, status: str, now: datetime):
        state = self.state[server_id]
        state["last_log"] = now
        state["last_status"] = status
        if state["interval_index"] < len(LOG_INTERVALS) - 1:
            state["interval_index"] += 1

    def _reset_state(self, server_id: int):
        if server_id in self.state:
            del self.state[server_id]
