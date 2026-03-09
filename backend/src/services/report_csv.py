import io
import pandas as pd


def to_csv(df: pd.DataFrame, period: str):
    buffer = io.StringIO()
    df.to_csv(buffer, index=False)
    buffer.seek(0)
    
    filename = f"server_report_{period}.csv"
    return io.BytesIO(buffer.getvalue().encode()), filename, "text/csv"
