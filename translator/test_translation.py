
import time
import torch

from transformers import AutoModelForSeq2SeqLM, AutoTokenizer
from IndicTransToolkit.processor import IndicProcessor

MODEL_NAME = "ai4bharat/indictrans2-en-indic-dist-200M"

device = "cuda" if torch.cuda.is_available() else "cpu"

tokenizer = AutoTokenizer.from_pretrained(
    MODEL_NAME,
    trust_remote_code=True,
)

model = AutoModelForSeq2SeqLM.from_pretrained(
    MODEL_NAME,
    trust_remote_code=True,
).to(device)

processor = IndicProcessor(inference=True)

source_text = "Hello, how are you?"

# Official IndicTrans2 preprocessing adds the required language tags.
batch = processor.preprocess_batch(
    [source_text],
    src_lang="eng_Latn",
    tgt_lang="hin_Deva",
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
    generated,
    skip_special_tokens=True,
)

translations = processor.postprocess_batch(
    decoded,
    lang="hin_Deva",
)

print("Original:", source_text)
print("Translation:", translations[0])
print(f"Inference time: {time.perf_counter() - start:.2f} seconds")

if device == "cuda":
    print(
        "GPU memory:",
        f"{torch.cuda.memory_allocated() / 1024**3:.2f} GB",
    )
