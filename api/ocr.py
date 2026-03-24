import os
import requests

def handler(request):
    if request.method != "POST":
        return {
            "statusCode": 405,
            "body": "Method Not Allowed"
        }

    OCR_API_KEY = os.environ.get("OCR_API_KEY")

    file = request.files.get("file")

    if not file:
        return {
            "statusCode": 400,
            "body": "No file uploaded"
        }

    payload = {
        "apikey": OCR_API_KEY,
        "language": "eng",
        "ocrengine": 3,
    }

    response = requests.post(
        "https://api.ocr.space/parse/image",
        files={"file": (file.filename, file.stream, file.mimetype)},
        data=payload
    )

    result = response.json()

    try:
        text = result["ParsedResults"][0]["ParsedText"]
    except:
        text = "Error extracting text"

    return {
        "statusCode": 200,
        "headers": {"Content-Type": "application/json"},
        "body": text
    }