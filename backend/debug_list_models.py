from google import genai
from config import settings

client = genai.Client(api_key=settings.GOOGLE_API_KEY)

print("\nAVAILABLE MODELS:\n")

for model in client.models.list():
    print("MODEL NAME:", model.name)
    print("SUPPORTED METHODS:", model.supported_generation_methods)
    print("-" * 40)
