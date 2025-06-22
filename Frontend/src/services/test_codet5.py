from transformers import AutoTokenizer, AutoModelForSeq2SeqLM

tokenizer = AutoTokenizer.from_pretrained("Salesforce/codet5-base")
model = AutoModelForSeq2SeqLM.from_pretrained("Salesforce/codet5-base")

code = "def multiply(a, b):\n    return a * b"
inputs = tokenizer("summarize: " + code, return_tensors="pt", truncation=True, max_length=512)
outputs = model.generate(inputs["input_ids"], max_length=64)

print("🔍 Explanation:", tokenizer.decode(outputs[0], skip_special_tokens=True))
