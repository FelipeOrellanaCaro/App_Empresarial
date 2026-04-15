from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import cm
from reportlab.lib import colors
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, HRFlowable, PageBreak, Preformatted
)
from reportlab.pdfgen import canvas

# --- CONFIGURACIÓN DE COLORES Y ESTILOS ---
OUTPUT = "Documentacion_Control_Inventario.pdf"
AZUL_DARK = colors.HexColor("#1e3a8a")
AZUL = colors.HexColor("#1a56db")
GRIS_LIGHT = colors.HexColor("#f9fafb")
GRIS_BORDE = colors.HexColor("#e5e7eb")
TEXTO = colors.HexColor("#111827")
TEXTO_SEC = colors.HexColor("#4b5563")

def draw_header_footer(canvas, doc):
    """Dibuja el encabezado y pie de página en todas las páginas excepto la portada."""
    canvas.saveState()
    
    # No dibujar en la primera página (Portada)
    if doc.page > 1:
        # Encabezado
        canvas.setStrokeColor(AZUL)
        canvas.setLineWidth(0.5)
        canvas.line(2.5*cm, A4[1]-2*cm, A4[0]-2.5*cm, A4[1]-2*cm)
        
        canvas.setFont("Helvetica-Bold", 8)
        canvas.setFillColor(AZUL_DARK)
        canvas.drawString(2.5*cm, A4[1]-1.8*cm, "CONTROL DE INVENTARIO")
        
        canvas.setFont("Helvetica", 8)
        canvas.setFillColor(TEXTO_SEC)
        canvas.drawRightString(A4[0]-2.5*cm, A4[1]-1.8*cm, "Documentación Técnica")

        # Pie de página
        canvas.line(2.5*cm, 2*cm, A4[0]-2.5*cm, 2*cm)
        canvas.drawCentredString(A4[0]/2.0, 1.5*cm, f"Página {doc.page}")
        
    canvas.restoreState()

# --- DEFINICIÓN DE DOCUMENTO ---
doc = SimpleDocTemplate(
    OUTPUT,
    pagesize=A4,
    leftMargin=2.5*cm, rightMargin=2.5*cm,
    topMargin=3*cm, bottomMargin=3*cm,
)

styles = getSampleStyleSheet()

# Estilos Personalizados
style_titulo = ParagraphStyle("titulo",
    fontSize=32, fontName="Helvetica-Bold",
    textColor=AZUL_DARK, spaceAfter=20, leading=38, alignment=1)

style_subtitulo = ParagraphStyle("subtitulo",
    fontSize=16, fontName="Helvetica",
    textColor=TEXTO_SEC, spaceAfter=30, alignment=1)

style_info = ParagraphStyle("info",
    fontSize=11, fontName="Helvetica",
    textColor=TEXTO, leading=16, alignment=1)

style_h1 = ParagraphStyle("h1",
    fontSize=18, fontName="Helvetica-Bold",
    textColor=AZUL, spaceBefore=20, spaceAfter=12)

style_h2 = ParagraphStyle("h2",
    fontSize=13, fontName="Helvetica-Bold",
    textColor=TEXTO, spaceBefore=12, spaceAfter=6)

style_body = ParagraphStyle("body",
    fontSize=10, fontName="Helvetica",
    textColor=TEXTO, leading=15, spaceAfter=8)

style_code = ParagraphStyle("code",
    fontSize=9, fontName="Courier",
    textColor=colors.black,
    backColor=GRIS_LIGHT, leading=14,
    leftIndent=10, rightIndent=10,
    spaceBefore=14, spaceAfter=14,
    borderPadding=10,
    borderRadius=4,
    borderWidth=0.5,
    borderColor=GRIS_BORDE)

style_bullet = ParagraphStyle("bullet",
    fontSize=10, fontName="Helvetica",
    textColor=TEXTO, leading=15,
    leftIndent=20, spaceAfter=4,
    bulletIndent=10)

story = []

# --- PORTADA ---
story.append(Spacer(1, 4*cm))
story.append(Paragraph("Control de Inventario", style_titulo))
story.append(Paragraph("Sistema de Gestión Empresarial Full-Stack", style_subtitulo))
story.append(Spacer(1, 1*cm))
story.append(HRFlowable(width="60%", thickness=1, color=AZUL, spaceAfter=2*cm))

story.append(Paragraph("<b>Autores:</b><br/>Felipe Orellana<br/>Claudio Gonzales", style_info))
story.append(Spacer(1, 0.5*cm))
story.append(Paragraph("<b>Docente:</b><br/>Gaston Contreras", style_info))
story.append(Spacer(1, 2*cm))

story.append(PageBreak())

# --- CONTENIDO ---

# 1. Descripción
story.append(Paragraph("1. Descripción del Proyecto", style_h1))
story.append(Paragraph(
    "Esta aplicación es una solución integral diseñada para el control eficiente de existencias. "
    "Permite el seguimiento en tiempo real de entradas y salidas, gestión de alertas por stock bajo "
    "y administración detallada de productos mediante una arquitectura desacoplada.", style_body))

# Tecnologías
story.append(Paragraph("Stack Tecnológico", style_h2))
tech_data = [
    ["Componente", "Tecnología", "Propósito"],
    ["Backend", "Node.js + Express", "Lógica de negocio y API REST"],
    ["Persistencia", "SQLite", "Base de datos relacional ligera"],
    ["Frontend", "React + Vite", "Interfaz reactiva y moderna"],
    ["Estilo", "Vanilla CSS", "Diseño personalizado y ligero"],
]
t = Table(tech_data, colWidths=[4*cm, 5*cm, 7*cm])
t.setStyle(TableStyle([
    ('BACKGROUND', (0, 0), (-1, 0), AZUL),
    ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
    ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
    ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
    ('FONTSIZE', (0, 0), (-1, -1), 9),
    ('BOTTOMPADDING', (0, 0), (-1, -1), 10),
    ('TOPPADDING', (0, 0), (-1, -1), 10),
    ('GRID', (0, 0), (-1, -1), 0.5, GRIS_BORDE),
    ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.white, GRIS_LIGHT]),
]))
story.append(t)

# 2. Instalación
story.append(Paragraph("2. Instalación y Puesta en Marcha", style_h1))
story.append(Paragraph("Para desplegar el entorno de desarrollo, siga estos pasos:", style_body))

story.append(Paragraph("<b>Paso 1: Clonar e instalar backend</b>", style_h2))
story.append(Paragraph("cd backend<br/>npm install", style_code))

story.append(Paragraph("<b>Paso 2: Instalar frontend</b>", style_h2))
story.append(Paragraph("cd ../frontend<br/>npm install", style_code))

story.append(Paragraph("<b>Ejecución rápida (Windows)</b>", style_h2))
story.append(Paragraph(
    "Utilice el archivo ejecutador ubicado en la raíz para iniciar ambos servicios simultáneamente:", style_body))
story.append(Paragraph(r".\iniciar.bat", style_code))

# 3. Características Principales
story.append(PageBreak())
story.append(Paragraph("3. Características y Vistas", style_h1))

features = [
    ("Dashboard de Stock", "Visualización crítica de niveles con alertas visuales dinámicas."),
    ("Gestión de Productos", "Registro completo, edición y eliminación (CRUD) de artículos."),
    ("Historial de Movimientos", "Registro de auditoría de cada entrada y salida con opción de anulación."),
    ("Validación Inteligente", "Prevención automática de quiebres de stock en el registro de salidas.")
]

for tit, desc in features:
    story.append(Paragraph(f"<b>{tit}:</b> {desc}", style_bullet))

# 4. Estructura de Archivos
story.append(Paragraph("4. Arquitectura de Archivos", style_h1))
tree_text = (
    "App_Empresarial/\n"
    "|-- backend/             # Servidor API REST (:3001)\n"
    "|   |-- src/app.js       # Punto de entrada\n"
    "|   |-- src/routes/      # Endpoints de productos/movimientos\n"
    "|-- frontend/            # Interfaz React (:5173)\n"
    "|   |-- src/pages/       # Vistas principales\n"
    "|   |-- src/api/client.js # Cliente HTTP\n"
    "|-- iniciar.bat          # Script de arranque dual"
)
from reportlab.lib.styles import ParagraphStyle as PS
style_pre = PS("pre",
    fontSize=9, fontName="Courier",
    textColor=colors.black,
    backColor=GRIS_LIGHT,
    leading=15,
    leftIndent=10, rightIndent=10,
    spaceBefore=14, spaceAfter=14,
    borderPadding=10,
    borderWidth=0.5,
    borderColor=GRIS_BORDE)
story.append(Preformatted(tree_text, style_pre))

# Finalizar
doc.build(story, onFirstPage=draw_header_footer, onLaterPages=draw_header_footer)
print(f"PDF generado con éxito: {OUTPUT}")
