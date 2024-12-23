import warnings
import os
import platform
import pytesseract
from pdf2image import convert_from_path
from pathlib import Path
from tempfile import TemporaryDirectory
import cv2
import spacy
import logging

# Setup logging (optional, for better error reporting)
logger = logging.getLogger(__name__)
logging.basicConfig(level=logging.INFO)

# Initialize the Spacy model (ensure it's loaded once, globally)
model_ner = spacy.load(Path(__file__).parent / 'model-best')

def process_file(PDF_file_path: str, model_ner) -> dict:
    warnings.filterwarnings('ignore')
    warnings.filterwarnings("ignore", message="numpy.dtype size changed")
    warnings.filterwarnings("ignore", message="numpy.ufunc size changed")

    # Path for Tesseract (make sure Tesseract is correctly installed)
    pytesseract.pytesseract.tesseract_cmd = "tesseract.exe"  # Update path as needed
    path_to_poppler_exe = Path(r"C:\Program Files\poppler-24.07.0\Library\bin")

    try:
        with TemporaryDirectory() as tempdir:
            if platform.system() == "Windows":
                pdf_pages = convert_from_path(PDF_file_path, 500, poppler_path=path_to_poppler_exe)
            else:
                pdf_pages = convert_from_path(PDF_file_path, 500)
            
            image_file_list = []
            for page_enumeration, page in enumerate(pdf_pages, start=1):
                filename = os.path.join(tempdir, f"page_{page_enumeration:03}.jpg")
                page.save(filename, "JPEG")
                image_file_list.append(filename)

            full_text = ""
            for image_file in image_file_list:
                img = cv2.imread(image_file)
                text = pytesseract.image_to_string(img, lang='mar')
                full_text += text + "\n"

            # Process text with Spacy NER model
            doc = model_ner(full_text)

            annotated_entities = {
                'COURT NAME': [],
                'ORDER DATE': [],
                'ORDER NO': [],
                'PERSON NAME': [],
                'ACT': []
            }

            for ent in doc.ents:
                if ent.label_ in annotated_entities:
                    annotated_entities[ent.label_].append(ent.text)

            return annotated_entities

    except Exception as e:
        logger.error(f"Error processing file {PDF_file_path}: {e}")
        raise ValueError("An error occurred while processing the PDF")  # Custom error message
