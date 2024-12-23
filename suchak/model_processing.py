import warnings
import os
import platform
import pytesseract
from pdf2image import convert_from_path
from pathlib import Path
from tempfile import TemporaryDirectory
import cv2
import spacy

# def process_file(PDF_file_path, model_ner):
#     warnings.filterwarnings('ignore')
#     warnings.filterwarnings("ignore", message="numpy.dtype size changed")
#     warnings.filterwarnings("ignore", message="numpy.ufunc size changed")
#     pytesseract.pytesseract.tesseract_cmd = (r"C:\Program Files\Tesseract-OCR\tesseract.exe")
#     path_to_poppler_exe = Path(r"D:\Summer Internship NIC\Release-24.02.0-0\poppler-24.02.0\Library\bin")

#     with TemporaryDirectory() as tempdir:
#         if platform.system() == "Windows":
#             pdf_pages = convert_from_path(PDF_file_path, 500, poppler_path=path_to_poppler_exe)
#         else:
#             pdf_pages = convert_from_path(PDF_file_path, 500)
#         image_file_list = []
#         for page_enumeration, page in enumerate(pdf_pages, start=1):
#             filename = os.path.join(tempdir, f"page_{page_enumeration:03}.jpg")
#             page.save(filename, "JPEG")
#             image_file_list.append(filename)

#         full_text = ""
#         for image_file in image_file_list:
#             img = cv2.imread(image_file)
#             text = pytesseract.image_to_string(img, lang='mar')
#             full_text += text + "\n"

#         doc = model_ner(full_text)
        
#         annotated_entities = {}
#         for ent in doc.ents:
#             if ent.label_ == "COURT NAME":
#                 annotated_entities['COURT NAME'] = ent.text
#             elif ent.label_ == "ORDER DATE":
#                 annotated_entities['ORDER DATE'] = ent.text
#             elif ent.label_ == "ORDER NO":
#                 annotated_entities['ORDER NO'] = ent.text
#             elif ent.label_ == "PERSON NAME":
#                 annotated_entities['PERSON NAME'] = ent.text
#             elif ent.label_ == "ACT":
#                 annotated_entities['ACT'] = ent.text

#         return annotated_entities


def process_file(PDF_file_path, model_ner):
    warnings.filterwarnings('ignore')
    warnings.filterwarnings("ignore", message="numpy.dtype size changed")
    warnings.filterwarnings("ignore", message="numpy.ufunc size changed")
    #pytesseract.pytesseract.tesseract_cmd = (r"C:\Program Files\Tesseract-OCR\tesseract.exe")
    pytesseract.pytesseract.tesseract_cmd = (r"tesseract.exe")
    path_to_poppler_exe = Path(r"D:\Summer Internship NIC\Release-24.02.0-0\poppler-24.02.0\Library\bin")

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
