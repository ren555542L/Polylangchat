
import time

import torch
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel, Field
from transformers import AutoModelForSeq2SeqLM, AutoTokenizer
from IndicTransToolkit.processor import IndicProcessor

MODEL_NAME = "ai4bharat/indictrans2-en-indic-dist-200M"

app = FastAPI(title="Polyglot Chat Translation Service")

device = "cuda" if torch.cuda.is_available() else "cpu"
tokenizer = None
model = None
processor = IndicProcessor(inference=True)


@app.on_event("startup")
def load_model():
    global tokenizer, model

    tokenizer = AutoTokenizer.from_pretrained(
        MODEL_NAME, trust_remote_code=True
    )
    model = AutoModelForSeq2SeqLM.from_pretrained(
        MODEL_NAME, trust_remote_code=True
    ).to(device)
    model.eval()


class TranslationRequest(BaseModel):
    text: str = Field(min_length=1, max_length=2000)
    source_language: str = "eng_Latn"
    target_language: str = "hin_Deva"


class TranslationResponse(BaseModel):
    original_text: str
    translated_text: str
    source_language: str
    target_language: str
    inference_seconds: float


@app.get("/health")
def health():
    return {
        "status": "ok",
        "service": "polyglot-translator",
        "model_loaded": model is not None,
        "device": device,
    }


@app.post("/translate", response_model=TranslationResponse)
def translate(request: TranslationRequest):
    if model is None or tokenizer is None:
        raise HTTPException(status_code=503, detail="Model is not loaded")

    text = request.text.strip()
    if not text:
        raise HTTPException(status_code=422, detail="Text cannot be blank")

    try:
        batch = processor.preprocess_batch(
            [text],
            src_lang=request.source_language,
            tgt_lang=request.target_language,
        )
        inputs = tokenizer(
            batch,
            truncation=True,
            padding="longest",
            return_tensors="pt",
        ).to(device)

        if device == "cuda":
            torch.cuda.synchronize()
        start = time.perf_counter()

        with torch.inference_mode():
            generated = model.generate(
                **inputs,
                num_beams=5,
                num_return_sequences=1,
                max_length=256,
                use_cache=False,
            )

        if device == "cuda":
            torch.cuda.synchronize()

        decoded = tokenizer.batch_decode(
            generated, skip_special_tokens=True
        )
        result = processor.postprocess_batch(
            decoded, lang=request.target_language
        )

        return TranslationResponse(
            original_text=text,
            translated_text=result[0],
            source_language=request.source_language,
            target_language=request.target_language,
            inference_seconds=round(time.perf_counter() - start, 3),
        )
    except Exception:
        raise HTTPException(
            status_code=400,
            detail="Translation failed. Check the language codes and input.",
        )
