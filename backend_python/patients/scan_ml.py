# # patients/scan_ml.py
# from PIL import Image
# import torch
# from torchvision import transforms

# # 🔹 Charger ton modèle PyTorch entraîné
# model = torch.load('path_to_your_model.pth', map_location='cpu')
# model.eval()

# # 🔹 Préprocessing
# preprocess = transforms.Compose([
#     transforms.Resize((224, 224)),
#     transforms.ToTensor(),
#     transforms.Normalize(mean=[0.485, 0.456, 0.406],
#                          std=[0.229, 0.224, 0.225]),
# ])

# # 🔹 Mapping index -> nom réel de maladies / blessures
# disease_map = {
#     0: 'Brûlure',
#     1: 'Coupure',
#     2: 'Eczéma',
#     3: 'Psoriasis',
#     4: 'Normal'
# }

# def predict_from_image(file):
#     """Retourne toutes les probabilités pour chaque maladie"""
#     image = Image.open(file).convert('RGB')
#     img_tensor = preprocess(image).unsqueeze(0)  # batch size 1

#     with torch.no_grad():
#         outputs = model(img_tensor)
#         probs = torch.softmax(outputs, dim=1).squeeze(0).tolist()

#     probabilities = {disease_map[i]: round(prob*100,2) for i, prob in enumerate(probs)}
#     # 🔹 optionnel : classe la plus probable
#     top_disease = max(probabilities, key=probabilities.get)
#     top_probability = probabilities[top_disease]

#     return top_disease, top_probability, probabilities
