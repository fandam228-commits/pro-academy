with open("src/data/grammar-summaries-and-questions.ts", encoding="utf-8") as f:
    text = f.read()

pos = text.find('"questions"')
if pos != -1:
    print(text[pos:pos+500])
else:
    pos = text.find("questions")
    print("Found 'questions' at:", pos)
    print(text[pos:pos+500])
