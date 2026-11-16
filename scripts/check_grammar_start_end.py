with open("src/data/grammar-summaries-and-questions.ts", encoding="utf-8") as f:
    text = f.read()

print("File start:")
print(text[:300])
print("\nFile end:")
print(text[-200:])
