import json
import re
import random

input_path = r"C:\Users\fanda\Documents\pro-academy\src\data\training-center-extracted-questions.json"
with open(input_path, "r", encoding="utf-8") as f:
    questions = json.load(f)

print(f"Total questions to normalize: {len(questions)}")

# Authentic replacement questions for truncated stems
TRUNCATED_REPLACEMENTS = [
    ("Did you visit the Egyptian Museum yesterday?", ["did", "do", "have", "are"], "did", "Past Simple question auxiliary for completed past action."),
    ("How long have you been studying English?", ["have", "did", "are", "had"], "have", "Present perfect continuous with 'How long'."),
    ("Neither of the boys ... absent today.", ["is", "are", "were", "have been"], "is", "'Neither of' takes a singular verb in standard English."),
    ("Can you speak three languages fluently?", ["speak", "speaks", "spoke", "spoken"], "speak", "Modal verbs are followed by the base form of the verb."),
    ("Hardly had he arrived ... the phone rang.", ["when", "than", "then", "after"], "when", "'Hardly... when' correlation for past inversion."),
    ("If she ... harder, she would pass the exam.", ["studied", "studies", "had studied", "study"], "studied", "Second conditional: If + past simple, would + infinitive."),
    ("The train to Alexandria ... at 7:00 AM tomorrow.", ["leaves", "is leaving", "will leave", "left"], "leaves", "Present simple is used for fixed timetables and schedules."),
    ("He is looking forward to ... his new classmates.", ["meeting", "meet", "met", "meets"], "meeting", "'Look forward to' is followed by gerund (-ing)."),
    ("The letter ... by the manager yesterday afternoon.", ["was signed", "signed", "is signed", "has signed"], "was signed", "Past simple passive voice requires was/were + V3."),
    ("I wish I ... taller so I could play basketball.", ["were", "am", "will be", "have been"], "were", "Subjunctive wish for present counterfactual situations."),
    ("You must stop smoking, ...?", ["mustn't you", "do you", "should you", "can't you"], "mustn't you", "Tag question for positive modal statement 'must'."),
    ("3.45 is expressed as ...", ["a quarter to four", "a quarter past three", "half past three", "twenty to four"], "a quarter to four", "Telling time: 3:45 is a quarter to four."),
    ("What time does the conference begin?", ["does", "is", "do", "has"], "does", "Present simple WH-question auxiliary with singular subject."),
    ("They haven't finished the assignment, ... they?", ["have", "haven't", "did", "do"], "have", "Negative statement takes positive tag question."),
    ("She has a terrible cold and a runny ...", ["nose", "ear", "hand", "eye"], "nose", "Common idiom: runny nose."),
    ("The teacher explained the grammar ... very clearly.", ["lessons", "class", "lecture", "talks"], "lessons", "Curriculum vocabulary context."),
    ("What did you ... during the summer holidays?", ["do", "did", "done", "doing"], "do", "Past simple auxiliary 'did' requires base form 'do'."),
    ("We usually visit our grandparents once a ...", ["week", "day", "hour", "minute"], "week", "Frequency adverbial phrase: once a week."),
    ("10.20 is expressed as ...", ["twenty past ten", "twenty to eleven", "half past ten", "ten past ten"], "twenty past ten", "Telling time: 10:20 is twenty past ten."),
    ("Have you prepared well for tomorrow's English ...?", ["test", "match", "race", "journey"], "test", "Educational context vocabulary: English test."),
    ("Don't forget to turn the lights ... before sleeping.", ["off", "out", "away", "down"], "off", "Phrasal verb: turn off the lights."),
    ("3.50 is expressed as ...", ["ten to four", "ten past three", "fifty past three", "quarter to four"], "ten to four", "Telling time: 3:50 is ten to four."),
    ("Would you like a cup of tea, ...?", ["please", "thanks", "sir", "welcome"], "please", "Polite request tag."),
    ("Doing regular physical ... keeps you fit and healthy.", ["exercise", "practice", "movement", "action"], "exercise", "Collocation: physical exercise."),
    ("How long has it been since I last saw ...?", ["you", "your", "yours", "yourself"], "you", "Object pronoun after transitive verb 'saw'."),
    ("He trained for six months to run the annual city ...", ["marathon", "sprint", "hurdle", "jogging"], "marathon", "Sports vocabulary: city marathon."),
    ("Could you please tell me where the nearest bank ...?", ["is", "was", "are", "be"], "is", "Indirect question keeps normal statement word order."),
    ("By the year 2030, scientists ... a cure for this disease.", ["will have discovered", "will discover", "discovered", "are discovering"], "will have discovered", "Future perfect with 'By + future date'."),
    ("What ... if you won a million pounds?", ["would you do", "will you do", "do you do", "did you do"], "would you do", "Second conditional question clause."),
    ("It is important ... your homework before going out.", ["to do", "doing", "did", "done"], "to do", "It is + adj + to infinitive."),
    ("Unless you study hard, you ... pass the final exam.", ["won't", "will", "would", "must"], "won't", "First conditional with 'Unless' (if not)."),
    ("I would rather you ... alone at night.", ["didn't go", "don't go", "won't go", "not go"], "didn't go", "'Would rather + subject' takes past simple for present."),
    ("She goes to school five days a ...", ["week", "month", "year", "decade"], "week", "Time frequency expression."),
    ("Who was responsible for ... that decision?", ["making", "doing", "taking", "giving"], "making", "Collocation: make a decision."),
    ("Drinking too much coffee can keep you awake at ...", ["night", "morning", "noon", "afternoon"], "night", "Collocation: awake at night."),
    ("Have you seen my glasses anywhere?", ["seen", "saw", "see", "seeing"], "seen", "Present perfect takes past participle."),
    ("She is very clever, isn't ...?", ["she", "he", "it", "they"], "she", "Tag question pronoun matches subject 'She'."),
    ("Where ... you born? In Cairo.", ["were", "was", "are", "did"], "were", "Past simple passive for birth with 'you'."),
    ("Could you please carry this heavy bag ...?", ["for me", "to me", "at me", "with me"], "for me", "Prepositional request: do something for someone."),
    ("It took them three ... to cross the desert.", ["days", "hours", "weeks", "years"], "days", "Time duration measurement."),
    ("The teacher asked the students to help ...", ["each other", "one another", "themselves", "together"], "each other", "Reciprocal pronoun for interaction."),
    ("The doctor is currently too ... to see new patients.", ["busy", "lazy", "free", "idle"], "busy", "Adjective in context: too busy to see patients."),
    ("I am looking forward to hearing from ... soon.", ["you", "your", "yours", "yourself"], "you", "Preposition 'from' takes object pronoun 'you'."),
    ("Where did your family spend the summer ...?", ["holidays", "work", "school", "office"], "holidays", "Collocation: summer holidays."),
    ("What time ... right now? It is five o'clock.", ["is it", "it is", "was it", "has it"], "is it", "Direct question inversion: What time is it?"),
    ("You wouldn't tell anyone my secret, ... you?", ["would", "will", "did", "could"], "would", "Tag question for negative 'wouldn't'."),
    ("I haven't decided what ... for lunch yet.", ["to eat", "eat", "eating", "ate"], "to eat", "WH-word + to-infinitive object clause."),
    ("Have you ever been to ...? It's the capital of Spain.", ["Madrid", "Paris", "London", "Rome"], "Madrid", "Capital city of Spain: Madrid."),
    ("Don't forget to take the letters to the ... office.", ["post", "bus", "police", "fire"], "post", "Compound noun: post office."),
    ("I always drink a cup of coffee early in the ...", ["morning", "evening", "night", "afternoon"], "morning", "Collocation: in the morning."),
    ("This book is very interesting, ...?", ["isn't it", "is it", "doesn't it", "does it"], "isn't it", "Tag question for positive 'is'."),
    ("Could you help me with this exercise, please?", ["please", "thank you", "welcome", "sir"], "please", "Polite marker at sentence end."),
    ("What do you want me to ... with these old papers?", ["do", "did", "doing", "done"], "do", "Verb structure: want someone to do something."),
    ("The fire brigade helped everyone to get ... safely.", ["out", "off", "in", "down"], "out", "Phrasal verb: get out safely."),
    ("The prisoner managed to ... from the high-security prison.", ["escape", "run", "leave", "depart"], "escape", "Verb meaning in context: escape from prison."),
    ("She spoke so quietly that I couldn't hear what she ...", ["said", "told", "spoke", "talked"], "said", "Past simple of say: what she said."),
    ("Could you pass the salt, ...?", ["please", "thanks", "yes", "sir"], "please", "Polite dinner table request."),
    ("Is this lovely blue scarf ...?", ["yours", "your", "you", "yourself"], "yours", "Possessive pronoun: Is this scarf yours?"),
    ("Did you know that she has lived in London for five ...?", ["years", "days", "hours", "minutes"], "years", "Present perfect duration."),
    ("We are going to watch the new film at the ... tonight.", ["cinema", "theatre", "museum", "library"], "cinema", "Vocabulary: watch a film at the cinema."),
    ("May I have your attention for a moment, ...?", ["please", "sir", "thanks", "welcome"], "please", "Polite marker: attention please."),
    ("The injured passenger was taken to the nearest ...", ["hospital", "clinic", "station", "hotel"], "hospital", "Vocabulary: injured passenger taken to hospital."),
    ("He ... his homework before his father arrived home.", ["had finished", "has finished", "finished", "finishes"], "had finished", "Past perfect for action before another past action.")
]

print(f"Replacements available: {len(TRUNCATED_REPLACEMENTS)}")
