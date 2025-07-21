from fastapi import APIRouter, File, UploadFile, HTTPException, Form
from fastapi.responses import JSONResponse
from utils.gemini import GeminiVisionAnalyzer
from PIL import Image
import io

router = APIRouter()

# Initialize Gemini Vision analyzer
gemini_analyzer = GeminiVisionAnalyzer()

@router.post("/analyze-drawing")
async def analyze_drawing(
    image: UploadFile = File(...),
    prompt: str = "Describe what you see in this drawing. Be creative and engaging in your response."
):
    """
    Analyze a drawing using Gemini Vision API
    
    Args:
        image: Canvas screenshot as image file
        prompt: Optional custom prompt for the AI analysis
        
    Returns:
        JSON response with AI analysis of the drawing
    """
    try:
        # Validate file type
        if not image.content_type.startswith('image/'):
            raise HTTPException(status_code=400, detail="File must be an image")
        
        # Read and process the image
        contents = await image.read()
        pil_image = Image.open(io.BytesIO(contents))
        
        # Convert to RGB if necessary
        if pil_image.mode != 'RGB':
            pil_image = pil_image.convert('RGB')
        
        # Analyze the drawing with Gemini
        analysis = await gemini_analyzer.analyze_image(pil_image, prompt)
        
        return JSONResponse(content={
            "success": True,
            "analysis": analysis,
            "prompt_used": prompt,
            "image_info": {
                "filename": image.filename,
                "size": f"{pil_image.width}x{pil_image.height}",
                "format": pil_image.format
            }
        })
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error analyzing drawing: {str(e)}")

@router.post("/analyze-drawing-with-context")
async def analyze_drawing_with_context(
    image: UploadFile = File(...),
    conversation_history: str = "",
    user_question: str = ""
):
    """
    Analyze a drawing with conversation context
    
    Args:
        image: Canvas screenshot as image file
        conversation_history: Previous conversation context
        user_question: Specific question about the drawing
        
    Returns:
        JSON response with contextual AI analysis
    """
    try:
        if not image.content_type.startswith('image/'):
            raise HTTPException(status_code=400, detail="File must be an image")
        
        contents = await image.read()
        pil_image = Image.open(io.BytesIO(contents))
        
        if pil_image.mode != 'RGB':
            pil_image = pil_image.convert('RGB')
        
        # Create contextual prompt
        context_prompt = f"""
        Previous conversation: {conversation_history}
        
        Current user question: {user_question}
        
        Please analyze this drawing and respond to the user's question while considering our previous conversation.
        Be conversational, helpful, and engaging.
        """
        
        analysis = await gemini_analyzer.analyze_image(pil_image, context_prompt)
        
        return JSONResponse(content={
            "success": True,
            "analysis": analysis,
            "context_used": bool(conversation_history),
            "user_question": user_question
        })
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error analyzing drawing with context: {str(e)}")

@router.post("/text-chat")
async def text_chat(
    message: str = Form(...),
    conversation_history: str = Form(default="")
):
    """
    Chat with AI using text only (no image required)
    
    Args:
        message: User's text message
        conversation_history: Previous conversation context
        
    Returns:
        JSON response with AI text response
    """
    try:
        # Create contextual prompt for text-only conversation
        context_prompt = f"""
        You are an AI art assistant helping users with their creative projects.
        
        Previous conversation: {conversation_history}
        
        Current user message: {message}
        
        Please respond in a helpful, encouraging, and creative way. If the user asks about 
        drawing or art techniques, provide specific advice. If they ask general questions, 
        relate your response back to art and creativity when possible.
        """
        
        # Use text-only analysis
        response_text = await gemini_analyzer.analyze_text_only(context_prompt)
        
        return JSONResponse(content={
            "success": True,
            "analysis": response_text,
            "message_processed": message,
            "context_used": bool(conversation_history)
        })
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error in text chat: {str(e)}") 