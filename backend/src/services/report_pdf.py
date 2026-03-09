import io
from reportlab.lib.pagesizes import letter
from reportlab.platypus import SimpleDocTemplate, Table, TableStyle, Paragraph, Spacer
from reportlab.lib.styles import getSampleStyleSheet
from reportlab.lib import colors
from reportlab.lib.units import inch
import pandas as pd
from datetime import datetime


def to_pdf(df: pd.DataFrame, period: str):
    """Generate PDF report from DataFrame"""
    import logging
    logger = logging.getLogger(__name__)
    
    try:
        logger.info(f"📄 Starting PDF generation for period: {period}")
        logger.info(f"📊 DataFrame shape: {df.shape}, empty: {df.empty}")
        buffer = io.BytesIO()
        doc = SimpleDocTemplate(buffer, pagesize=letter, topMargin=0.5*inch, bottomMargin=0.5*inch)
        elements = []
        
        styles = getSampleStyleSheet()
        
        # Title
        title = Paragraph(f"Server Monitoring Report - {period.title()}", styles["Title"])
        elements.append(title)
        elements.append(Spacer(1, 0.3*inch))
        
        # Date info
        date_info = Paragraph(f"Generated on: {datetime.utcnow().strftime('%Y-%m-%d %H:%M:%S UTC')}", styles["Normal"])
        elements.append(date_info)
        elements.append(Spacer(1, 0.2*inch))
        
        if not df.empty and len(df) > 0:
            # Convert DataFrame to list of lists, handling datetime objects
            data = []
            
            # Header row - ensure all columns are strings
            headers = []
            for col in df.columns:
                header = str(col).replace('_', ' ').title()
                headers.append(header)
            data.append(headers)
            
            # Data rows - convert all values to strings safely
            for idx, row in df.iterrows():
                row_data = []
                for col in df.columns:
                    try:
                        value = row[col]
                        if pd.isna(value) or value is None:
                            row_data.append("N/A")
                        elif isinstance(value, datetime):
                            row_data.append(value.strftime('%Y-%m-%d %H:%M:%S'))
                        elif isinstance(value, pd.Timestamp):
                            row_data.append(value.strftime('%Y-%m-%d %H:%M:%S'))
                        elif isinstance(value, (int, float)):
                            row_data.append(str(value))
                        else:
                            # Convert to string, handle any encoding issues
                            row_data.append(str(value).encode('utf-8', errors='ignore').decode('utf-8'))
                    except Exception as e:
                        # If any value conversion fails, use placeholder
                        row_data.append(f"Error: {str(e)[:20]}")
                data.append(row_data)
            
            # Create table
            table = Table(data, repeatRows=1)
            
            # Table styling
            table.setStyle(TableStyle([
                # Header row
                ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor('#475569')),  # Slate-700
                ("TEXTCOLOR", (0, 0), (-1, 0), colors.whitesmoke),
                ("ALIGN", (0, 0), (-1, 0), "CENTER"),
                ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
                ("FONTSIZE", (0, 0), (-1, 0), 10),
                ("BOTTOMPADDING", (0, 0), (-1, 0), 12),
                
                # Data rows
                ("BACKGROUND", (0, 1), (-1, -1), colors.white),
                ("TEXTCOLOR", (0, 1), (-1, -1), colors.black),
                ("ALIGN", (0, 0), (-1, -1), "CENTER"),
                ("FONTNAME", (0, 1), (-1, -1), "Helvetica"),
                ("FONTSIZE", (0, 1), (-1, -1), 9),
                ("GRID", (0, 0), (-1, -1), 0.5, colors.grey),
                ("ROWBACKGROUNDS", (0, 1), (-1, -1), [colors.white, colors.HexColor('#f8fafc')]),
                ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
            ]))
            
            elements.append(table)
        else:
            no_data = Paragraph("No events recorded for this period.", styles["Normal"])
            elements.append(no_data)
        
        # Build PDF
        logger.info("🔨 Building PDF document...")
        doc.build(elements)
        buffer.seek(0)
        
        filename = f"server_report_{period}_{datetime.utcnow().strftime('%Y%m%d')}.pdf"
        logger.info(f"✅ PDF generated successfully: {filename}, size: {len(buffer.getvalue())} bytes")
        return buffer, filename, "application/pdf"
        
    except Exception as e:
        logger.error(f"❌ PDF generation error: {type(e).__name__}: {str(e)}", exc_info=True)
        # If PDF generation fails, create a simple error PDF
        try:
            error_buffer = io.BytesIO()
            error_doc = SimpleDocTemplate(error_buffer, pagesize=letter)
            error_elements = []
            error_styles = getSampleStyleSheet()
            error_elements.append(Paragraph("Error Generating Report", error_styles["Title"]))
            error_elements.append(Spacer(1, 0.3*inch))
            error_elements.append(Paragraph(f"An error occurred while generating the PDF report: {str(e)}", error_styles["Normal"]))
            error_doc.build(error_elements)
            error_buffer.seek(0)
            return error_buffer, f"error_report_{period}.pdf", "application/pdf"
        except Exception as inner_e:
            logger.error(f"❌ Failed to create error PDF: {str(inner_e)}")
            # Last resort: return empty buffer
            empty_buffer = io.BytesIO()
            empty_buffer.write(b"PDF generation failed")
            empty_buffer.seek(0)
            return empty_buffer, f"error_{period}.pdf", "application/pdf"
