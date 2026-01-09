from __future__ import annotations
import requests
from io import BytesIO
from PIL import Image

import torch
from transformers import CLIPProcessor, CLIPModel

from config import CLIP_MODEL_NAME

# Load model 1 lần (cache trong RAM)
_DEVICE = "cpu"
_MODEL = CLIPModel.from_pretrained(CLIP_MODEL_NAME)
_PROCESSOR = CLIPProcessor.from_pretrained(CLIP_MODEL_NAME, use_fast=False)
_MODEL.eval()
_MODEL.to(_DEVICE)

@torch.inference_mode()
def embed_image_pil(img: Image.Image) -> list[float]:
    """
    Input: PIL Image (RGB)
    Output: embedding vector list[float]
    """
    if img.mode != "RGB":
        img = img.convert("RGB")

    inputs = _PROCESSOR(images=img, return_tensors="pt")
    inputs = {k: v.to(_DEVICE) for k, v in inputs.items()}

    # CLIP image features
    image_features = _MODEL.get_image_features(**inputs)  # shape [1, D]
    # Normalize để cosine stable
    image_features = image_features / image_features.norm(dim=-1, keepdim=True)

    return image_features[0].cpu().float().tolist()

def embed_image_from_url(url: str) -> list[float]:
    r = requests.get(url, timeout=30)
    r.raise_for_status()
    img = Image.open(BytesIO(r.content)).convert("RGB")
    return embed_image_pil(img)

def embed_image_from_bytes(b: bytes) -> list[float]:
    img = Image.open(BytesIO(b)).convert("RGB")
    return embed_image_pil(img)
