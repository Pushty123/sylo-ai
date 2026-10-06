"""Run in a Kaggle notebook with the 'aptos2019-blindness-detection' dataset added and GPU on.
Trains a real binary classifier: 0 = no diabetic retinopathy, 1 = DR present.
Outputs (in /kaggle/working): dr_model.pt, hidden_tests/ (25 images + labels.csv)."""
import os, shutil, random, pandas as pd, torch, torch.nn as nn
from PIL import Image
from torchvision import models, transforms
from torch.utils.data import Dataset, DataLoader

ROOT = "/kaggle/input/aptos2019-blindness-detection"
OUT = "/kaggle/working"
random.seed(7); torch.manual_seed(7)
dev = "cuda" if torch.cuda.is_available() else "cpu"

df = pd.read_csv(f"{ROOT}/train.csv")
df["label"] = (df["diagnosis"] > 0).astype(int)
df = df.sample(frac=1, random_state=7)
hidden = pd.concat([df[df.label == 0].head(12), df[df.label == 1].head(13)])   # never used in training
rest = df.drop(hidden.index)
val = rest.head(300); train = rest.iloc[300:2300]

tf_train = transforms.Compose([transforms.Resize((224, 224)), transforms.RandomHorizontalFlip(),
                               transforms.RandomRotation(15), transforms.ToTensor(),
                               transforms.Normalize([0.485, 0.456, 0.406], [0.229, 0.224, 0.225])])
tf_eval = transforms.Compose([transforms.Resize((224, 224)), transforms.ToTensor(),
                              transforms.Normalize([0.485, 0.456, 0.406], [0.229, 0.224, 0.225])])

class DS(Dataset):
    def __init__(s, d, tf): s.d, s.tf = d.reset_index(drop=True), tf
    def __len__(s): return len(s.d)
    def __getitem__(s, i):
        r = s.d.iloc[i]
        img = Image.open(f"{ROOT}/train_images/{r.id_code}.png").convert("RGB")
        return s.tf(img), r.label

dl_t = DataLoader(DS(train, tf_train), batch_size=32, shuffle=True, num_workers=2)
dl_v = DataLoader(DS(val, tf_eval), batch_size=64, num_workers=2)

m = models.mobilenet_v3_small(weights=models.MobileNet_V3_Small_Weights.DEFAULT)
m.classifier[3] = nn.Linear(m.classifier[3].in_features, 2)
m = m.to(dev)
opt = torch.optim.AdamW(m.parameters(), lr=3e-4)
lossf = nn.CrossEntropyLoss()

best = 0
for epoch in range(6):
    m.train()
    for x, y in dl_t:
        x, y = x.to(dev), y.to(dev)
        opt.zero_grad(); lossf(m(x), y).backward(); opt.step()
    m.eval(); ok = n = 0
    with torch.no_grad():
        for x, y in dl_v:
            p = m(x.to(dev)).argmax(1).cpu(); ok += (p == y).sum().item(); n += len(y)
    acc = 100 * ok / n
    print(f"epoch {epoch+1}: validation accuracy {acc:.1f}%")
    if acc > best:
        best = acc; torch.save(m.state_dict(), f"{OUT}/dr_model.pt")
print("best validation accuracy:", round(best, 1))

os.makedirs(f"{OUT}/hidden_tests", exist_ok=True)
rows = []
for r in hidden.itertuples():
    name = f"{r.id_code}.png"
    Image.open(f"{ROOT}/train_images/{name}").convert("RGB").resize((448, 448)).save(f"{OUT}/hidden_tests/{name}")
    rows.append({"file": name, "label": r.label})
pd.DataFrame(rows).to_csv(f"{OUT}/hidden_tests/labels.csv", index=False)
shutil.make_archive(f"{OUT}/hidden_tests", "zip", f"{OUT}/hidden_tests")
print("Download dr_model.pt and hidden_tests.zip from the Output panel.")
