from fastapi import APIRouter, Depends, Query, Request
from fastapi.responses import StreamingResponse, Response
from src.services.report_service import ReportService
from src.api.dependencies import require_admin
from src.db.session import get_session

router = APIRouter(prefix="/reports", tags=["Reports"])


@router.options("/download")
async def download_report_options():
    """Handle CORS preflight requests - CORS middleware will automatically add headers"""
    # Just return 200, CORS middleware will add all necessary headers
    return Response(status_code=200)


@router.get("/download")
async def download_report(
    request: Request,
    period: str = Query(..., pattern="^(daily|weekly|monthly)$"),
    format: str = Query(..., pattern="^(csv|pdf)$"),
    session=Depends(get_session)
    # ⚠️ AUTHENTICATION TEMPORARILY REMOVED FOR TESTING
    # _=Depends(require_admin)  # Commented out
):
    import logging
    logger = logging.getLogger(__name__)
    
    try:
        origin = request.headers.get("origin")
        logger.info(f"📥 Report download request: period={period}, format={format}, origin={origin}")
        
        service = ReportService(session)
        content, filename, media_type = await service.generate(period, format)
        
        logger.info(f"✅ Report generated: filename={filename}, type={media_type}")
        
        # Read BytesIO content
        if hasattr(content, 'read'):
            content.seek(0)
            file_content = content.read()
            logger.info(f"📄 File content size: {len(file_content)} bytes")
        else:
            file_content = content
        
        # Use Response with proper headers - CORS middleware will add CORS headers automatically
        response = Response(
            content=file_content,
            media_type=media_type,
            headers={
                "Content-Disposition": f'attachment; filename="{filename}"',
                "Content-Length": str(len(file_content)),
            }
        )
        
        logger.info(f"✅ Response created, sending file: {filename}")
        return response
        
    except Exception as e:
        logger.error(f"❌ Error generating report: {type(e).__name__}: {str(e)}", exc_info=True)
        from fastapi import HTTPException
        # Let CORS middleware handle headers for errors too
        raise HTTPException(status_code=500, detail=f"Failed to generate report: {str(e)}")
