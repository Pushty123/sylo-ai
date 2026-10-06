"""Real submission used by the hidden test runner: predict(image_path) -> 0 or 1.
Expects dr_model.pt in the same folder (trained with train_on_kaggle.py)."""
import os, torch, torch.nn as nn
from PIL import Image
from torchvision import models, transforms

_HERE = os.path.dirname(os.path.abspath(__file__))
_tf = transforms.Compose([transforms.Resize((224, 224)), transforms.ToTensor(),
                          transforms.Normalize([0.485, 0.456, 0.406], [0.229, 0.224, 0.225])])
_m = models.mobilenet_v3_small(weights=None)
_m.classifier[3] = nn.Linear(_m.classifier[3].in_features, 2)
_m.load_state_dict(torch.load(os.path.join(_HERE, "dr_model.pt"), map_location="cpu"))
_m.eval()

def predict(image_path):
    x = _tf(Image.open(image_path).convert("RGB")).unsqueeze(0)
    with torch.no_grad():
        return int(_m(x).argmax(1).item())
