from fastapi import FastAPI, File, UploadFile, Request
from fastapi.responses import JSONResponse
from fastapi.templating import Jinja2Templates
from fastapi.staticfiles import StaticFiles



import os
import spacy
from pydantic import BaseModel
from pathlib import Path
import json
#from .model_processing import process_file
from model_processing import process_file


# Load the Spacy model
model_path = Path(__file__).parent / 'model-best'
model_ner = spacy.load(model_path)

app = FastAPI()

# Serve HTML templates (equivalent to Django's templates)
templates = Jinja2Templates(directory="templates")

# Serve static files (like uploaded PDFs)
app.mount("/static", StaticFiles(directory="static"), name="static")


@app.get("/")
async def home(request: Request):
    return templates.TemplateResponse("upload.html", {"request": request})

@app.post("/upload_pdf/")
async def upload_pdf(pdf_file: UploadFile = File(...)):
    try:
        # Save uploaded file to local storage
        file_path = os.path.join("static", pdf_file.filename)
        with open(file_path, "wb") as f:
            f.write(pdf_file.file.read())
        return JSONResponse(content={"file_url": file_path, "message": "File uploaded successfully"})
    except Exception as e:
        return JSONResponse(status_code=400, content={"error": str(e)})

@app.post("/api/process_pdf/")
async def process_pdf(pdf_file: UploadFile = File(...)):
    try:
        # Save uploaded file to local storage
        file_path = os.path.join("static", pdf_file.filename)
        with open(file_path, "wb") as f:
            f.write(pdf_file.file.read())

        # Process the file
        annotated_entities = process_file(file_path, model_ner)

        # Save the annotated entities to a JSON file
        json_dir = Path("static") / "json"
        json_dir.mkdir(parents=True, exist_ok=True)
        annotated_file_path = json_dir / f"annotated_{pdf_file.filename}.json"
        
        with open(annotated_file_path, 'w', encoding='utf-8') as f:
            json.dump(annotated_entities, f, ensure_ascii=False, indent=4)

        return JSONResponse(content=annotated_entities)

    except Exception as e:
        return JSONResponse(status_code=400, content={"error": str(e)})

