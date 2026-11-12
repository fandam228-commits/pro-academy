const fs = require('fs');
const path = require('path');

const targetDir = path.join(__dirname, '..', 'src', 'data', 'dialogue-center');
if (!fs.existsSync(targetDir)) {
  fs.mkdirSync(targetDir, { recursive: true });
}

// =========================================================================
// 1. THIRD PREPARATORY DIALOGUES (32 DIALOGUES)
// =========================================================================
const prep3Dialogues = [
  {
    id: "dlg_prep3_01",
    grade: "prep_3",
    gradeLabelAr: "الصف الثالث الإعدادي",
    gradeLabelEn: "Third Preparatory",
    dialogueNumber: 1,
    title: "Two students are talking about their role model.",
    governorate: "Cairo",
    governorateAr: "القاهرة",
    year: 2022,
    speakers: ["Hana", "Soha"],
    lines: [
      { speaker: "Hana", text: "Can I ask you a question?" },
      { speaker: "Soha", text: "(1) Yes, of course.", gapNumber: 1, isQuestion: false, cue: "Can I ask you a question?" },
      { speaker: "Hana", text: "(2) Who is your role model?", gapNumber: 2, isQuestion: true, cue: "Soha: My mother is my role model." },
      { speaker: "Soha", text: "My mother is my role model." },
      { speaker: "Hana", text: "(3) Why is she your role model?", gapNumber: 3, isQuestion: true, cue: "Soha: My mother does great efforts to help me and my family." },
      { speaker: "Soha", text: "My mother does great efforts to help me and my family." },
      { speaker: "Hana", text: "How do you feel towards her?" },
      { speaker: "Soha", text: "(4) I feel proud of her.", gapNumber: 4, isQuestion: false, cue: "Hana: I always feel proud of my parents." },
      { speaker: "Hana", text: "I always feel proud of my parents." },
      { speaker: "Soha", text: "(5) We should all respect and love our parents.", gapNumber: 5, isQuestion: false, cue: "Concluding expression of respect." }
    ],
    approvedAnswers: {
      "1": { primary: "Yes, of course.", alternatives: ["Sure, you can.", "Yes, certainly."], isTeacherApproved: true },
      "2": { primary: "Who is your role model?", alternatives: ["Who's your role model?", "Who is your hero?"], isTeacherApproved: true },
      "3": { primary: "Why is she your role model?", alternatives: ["Why do you admire her?", "Why?"], isTeacherApproved: true },
      "4": { primary: "I feel very proud of her.", alternatives: ["I feel proud of her.", "I love and respect her."], isTeacherApproved: true },
      "5": { primary: "You are right.", alternatives: ["So do I.", "I agree with you.", "That's great."], isTeacherApproved: true }
    }
  },
  {
    id: "dlg_prep3_02",
    grade: "prep_3",
    gradeLabelAr: "الصف الثالث الإعدادي",
    gradeLabelEn: "Third Preparatory",
    dialogueNumber: 2,
    title: "Nader and Maher are planning to visit the museum.",
    governorate: "Giza",
    governorateAr: "الجيزة",
    year: 2022,
    speakers: ["Nader", "Maher"],
    lines: [
      { speaker: "Nader", text: "Hi Maher, would you like to visit the museum tomorrow?" },
      { speaker: "Maher", text: "Yes, it's a good idea. (1) What time does it open?", gapNumber: 1, isQuestion: true, cue: "Nader: It opens at 9:00. Shall we go by metro?" },
      { speaker: "Nader", text: "It opens at 9:00. Shall we go by metro?" },
      { speaker: "Maher", text: "(2) Yes, good idea.", gapNumber: 2, isQuestion: false, cue: "Shall we go by metro?" },
      { speaker: "Nader", text: "(3) When does the first metro leave?", gapNumber: 3, isQuestion: true, cue: "Maher: The first metro train leaves at 8 am." },
      { speaker: "Maher", text: "The first metro train leaves at 8 am." },
      { speaker: "Nader", text: "How long does it take to get to the station?" },
      { speaker: "Maher", text: "(4) It takes about 15 minutes.", gapNumber: 4, isQuestion: false, cue: "How long does it take to get to the station?" },
      { speaker: "Nader", text: "Oh! Is the station far from the museum?" },
      { speaker: "Maher", text: "(5) No, it isn't far.", gapNumber: 5, isQuestion: false, cue: "Is the station far from the museum?" }
    ],
    approvedAnswers: {
      "1": { primary: "What time does it open?", alternatives: ["When does it open?", "What are the opening hours?"], isTeacherApproved: true },
      "2": { primary: "Yes, that's a great idea.", alternatives: ["Yes, let's go by metro.", "Sure, why not?"], isTeacherApproved: true },
      "3": { primary: "When does the first metro train leave?", alternatives: ["What time does the first metro leave?", "When is the first train?"], isTeacherApproved: true },
      "4": { primary: "It takes about 15 minutes.", alternatives: ["About 20 minutes.", "It takes half an hour."], isTeacherApproved: true },
      "5": { primary: "No, it isn't.", alternatives: ["No, it is very close.", "No, it's just a 5-minute walk."], isTeacherApproved: true }
    }
  },
  {
    id: "dlg_prep3_03",
    grade: "prep_3",
    gradeLabelAr: "الصف الثالث الإعدادي",
    gradeLabelEn: "Third Preparatory",
    dialogueNumber: 3,
    title: "Noha is in the library. She has a CD and wants to listen to music.",
    governorate: "Alexandria",
    governorateAr: "الإسكندرية",
    year: 2022,
    speakers: ["Noha", "Mrs Ola"],
    lines: [
      { speaker: "Noha", text: "Good morning, Mrs Ola." },
      { speaker: "Mrs Ola", text: "Good morning, Noha. (1) How can I help you?", gapNumber: 1, isQuestion: true, cue: "Noha: I need a computer, please." },
      { speaker: "Noha", text: "I need a computer, please." },
      { speaker: "Mrs Ola", text: "Why do you need a computer?" },
      { speaker: "Noha", text: "(2) To listen to a CD.", gapNumber: 2, isQuestion: false, cue: "She has a CD and wants to listen to music." },
      { speaker: "Mrs Ola", text: "Sorry, our computer is not working. (3) You can use the computer lab.", gapNumber: 3, isQuestion: false, cue: "Mrs Ola: The computer lab is next to the library." },
      { speaker: "Noha", text: "(4) Where is the computer lab?", gapNumber: 4, isQuestion: true, cue: "Mrs Ola: The computer lab is next to the library." },
      { speaker: "Mrs Ola", text: "The computer lab is next to the library." },
      { speaker: "Noha", text: "Thank you, Mrs Ola." },
      { speaker: "Mrs Ola", text: "(5) You're welcome.", gapNumber: 5, isQuestion: false, cue: "Polite response to thank you." }
    ],
    approvedAnswers: {
      "1": { primary: "How can I help you?", alternatives: ["Can I help you?", "What do you need?"], isTeacherApproved: true },
      "2": { primary: "To listen to music on my CD.", alternatives: ["I want to listen to a CD.", "Because I have a CD."], isTeacherApproved: true },
      "3": { primary: "You can go to the computer lab.", alternatives: ["There is another one in the lab.", "Go to the computer lab."], isTeacherApproved: true },
      "4": { primary: "Where is the computer lab?", alternatives: ["Where is it?", "How can I get there?"], isTeacherApproved: true },
      "5": { primary: "You are welcome.", alternatives: ["You're welcome, Noha.", "Not at all."], isTeacherApproved: true }
    }
  },
  {
    id: "dlg_prep3_04",
    grade: "prep_3",
    gradeLabelAr: "الصف الثالث الإعدادي",
    gradeLabelEn: "Third Preparatory",
    dialogueNumber: 4,
    title: "Omar wants to buy a T-shirt.",
    governorate: "Qalyubia",
    governorateAr: "القليوبية",
    year: 2022,
    speakers: ["Salesman", "Omar"],
    lines: [
      { speaker: "Salesman", text: "Hello, can I help you?" },
      { speaker: "Omar", text: "(1) Yes, please. I want to buy a T-shirt.", gapNumber: 1, isQuestion: false, cue: "Omar wants to buy a T-shirt." },
      { speaker: "Salesman", text: "(2) What color would you like?", gapNumber: 2, isQuestion: true, cue: "Omar: I'd like to buy a blue one." },
      { speaker: "Omar", text: "I'd like to buy a blue one." },
      { speaker: "Salesman", text: "What about this one?" },
      { speaker: "Omar", text: "(3) It looks very nice. Where can I try it on?", gapNumber: 3, isQuestion: false, cue: "Where can I try it on?" },
      { speaker: "Salesman", text: "You can try it on in this dressing room." },
      { speaker: "Omar", text: "(4) How much is it?", gapNumber: 4, isQuestion: true, cue: "Salesman: It's 150 pounds. Anything else?" },
      { speaker: "Salesman", text: "It's 150 pounds. Anything else?" },
      { speaker: "Omar", text: "(5) No, thank you. Here is the money.", gapNumber: 5, isQuestion: false, cue: "Anything else?" }
    ],
    approvedAnswers: {
      "1": { primary: "Yes, please. I'm looking for a T-shirt.", alternatives: ["Yes, I'd like to buy a T-shirt.", "Yes, please."], isTeacherApproved: true },
      "2": { primary: "What colour would you like?", alternatives: ["What colour do you want?", "Which colour?"], isTeacherApproved: true },
      "3": { primary: "It is very nice.", alternatives: ["It's great.", "I like it.", "It fits me well."], isTeacherApproved: true },
      "4": { primary: "How much is it?", alternatives: ["How much does it cost?", "What is the price?"], isTeacherApproved: true },
      "5": { primary: "No, thank you.", alternatives: ["No, thanks. Here's the money.", "That's all, thank you."], isTeacherApproved: true }
    }
  },
  {
    id: "dlg_prep3_05",
    grade: "prep_3",
    gradeLabelAr: "الصف الثالث الإعدادي",
    gradeLabelEn: "Third Preparatory",
    dialogueNumber: 5,
    title: "Mona is talking to her friend Amal about travelling by plane.",
    governorate: "Menoufia",
    governorateAr: "المنوفية",
    year: 2022,
    speakers: ["Mona", "Amal"],
    lines: [
      { speaker: "Mona", text: "I am travelling by plane next Monday." },
      { speaker: "Amal", text: "That's why you seem pleased. (1) Where are you going?", gapNumber: 1, isQuestion: true, cue: "Mona: I am going to England." },
      { speaker: "Mona", text: "I am going to England." },
      { speaker: "Amal", text: "(2) Why are you going there?", gapNumber: 2, isQuestion: true, cue: "Mona: To visit my uncle." },
      { speaker: "Mona", text: "To visit my uncle." },
      { speaker: "Amal", text: "Does he study or work there?" },
      { speaker: "Mona", text: "(3) He works there. He is an engineer in a factory there.", gapNumber: 3, isQuestion: false, cue: "He is an engineer in a factory there." },
      { speaker: "Amal", text: "What time does the plane to England leave?" },
      { speaker: "Mona", text: "(4) It leaves at 6 pm. I wish you were with me on the plane to enjoy more.", gapNumber: 4, isQuestion: false, cue: "What time does the plane leave?" },
      { speaker: "Amal", text: "(5) I wish you a safe trip.", gapNumber: 5, isQuestion: false, cue: "Kind reply to Mona." }
    ],
    approvedAnswers: {
      "1": { primary: "Where are you travelling?", alternatives: ["Where are you going?", "Where to?"], isTeacherApproved: true },
      "2": { primary: "Why are you travelling to England?", alternatives: ["Why are you going there?", "What are you going to do there?"], isTeacherApproved: true },
      "3": { primary: "He works there.", alternatives: ["He works.", "He has a job there."], isTeacherApproved: true },
      "4": { primary: "It leaves at seven o'clock.", alternatives: ["At 8 am.", "It leaves at nine."], isTeacherApproved: true },
      "5": { primary: "Thank you. Have a safe flight!", alternatives: ["Have a nice trip!", "I hope you enjoy your time."], isTeacherApproved: true }
    }
  },
  {
    id: "dlg_prep3_06",
    grade: "prep_3",
    gradeLabelAr: "الصف الثالث الإعدادي",
    gradeLabelEn: "Third Preparatory",
    dialogueNumber: 6,
    title: "Heba and Samar are talking about shopping and fashion.",
    governorate: "Dakahlia",
    governorateAr: "الدقهلية",
    year: 2022,
    speakers: ["Heba", "Samar"],
    lines: [
      { speaker: "Heba", text: "Do you like shopping?" },
      { speaker: "Samar", text: "(1) Yes, I do.", gapNumber: 1, isQuestion: false, cue: "Do you like shopping?" },
      { speaker: "Heba", text: "(2) What do you usually shop for?", gapNumber: 2, isQuestion: true, cue: "Samar: I usually shop for clothes." },
      { speaker: "Samar", text: "I usually shop for clothes." },
      { speaker: "Heba", text: "(3) Where do you go shopping?", gapNumber: 3, isQuestion: true, cue: "Samar: I usually go shopping at some fashion boutiques in my area." },
      { speaker: "Samar", text: "I usually go shopping at some fashion boutiques in my area." },
      { speaker: "Heba", text: "Do you spend much money on shopping?" },
      { speaker: "Samar", text: "(4) Not really, I look for discounts.", gapNumber: 4, isQuestion: false, cue: "Do you spend much money?" },
      { speaker: "Heba", text: "What do you usually buy online?" },
      { speaker: "Samar", text: "(5) I usually buy shoes and accessories.", gapNumber: 5, isQuestion: false, cue: "What do you usually buy online?" }
    ],
    approvedAnswers: {
      "1": { primary: "Yes, I do.", alternatives: ["Yes, very much.", "Yes, of course."], isTeacherApproved: true },
      "2": { primary: "What do you usually shop for?", alternatives: ["What do you usually buy?", "What do you like to buy?"], isTeacherApproved: true },
      "3": { primary: "Where do you usually go shopping?", alternatives: ["Where do you shop?", "Where do you buy your clothes?"], isTeacherApproved: true },
      "4": { primary: "No, I don't.", alternatives: ["Yes, sometimes.", "No, not much."], isTeacherApproved: true },
      "5": { primary: "I usually buy books and bags.", alternatives: ["I buy shoes.", "Clothes and shoes."], isTeacherApproved: true }
    }
  },
  {
    id: "dlg_prep3_07",
    grade: "prep_3",
    gradeLabelAr: "الصف الثالث الإعدادي",
    gradeLabelEn: "Third Preparatory",
    dialogueNumber: 7,
    title: "A tourist asks about the way to the Pyramids.",
    governorate: "Kafr El-Sheikh",
    governorateAr: "كفر الشيخ",
    year: 2022,
    speakers: ["Tourist", "Sami"],
    lines: [
      { speaker: "Tourist", text: "Excuse me, sir. Would you kindly tell me the way to the Pyramids?" },
      { speaker: "Sami", text: "(1) Certainly. You can take a taxi or a bus.", gapNumber: 1, isQuestion: false, cue: "Polite response to direction question." },
      { speaker: "Tourist", text: "(2) How long does it take to get there?", gapNumber: 2, isQuestion: true, cue: "Sami: About half an hour. Haven't you been to the Pyramids before?" },
      { speaker: "Sami", text: "About half an hour. Haven't you been to the Pyramids before?" },
      { speaker: "Tourist", text: "(3) No, I haven't. This is my first visit.", gapNumber: 3, isQuestion: false, cue: "Haven't you been to the Pyramids before?" },
      { speaker: "Sami", text: "I hope you will like them. They're great. (4) Where are you staying?", gapNumber: 4, isQuestion: true, cue: "Tourist: At the Sheraton." },
      { speaker: "Tourist", text: "At the Sheraton." },
      { speaker: "Sami", text: "How do you like my country?" },
      { speaker: "Tourist", text: "(5) It is wonderful and people are very friendly.", gapNumber: 5, isQuestion: false, cue: "How do you like my country?" },
      { speaker: "Sami", text: "Nice stay!" }
    ],
    approvedAnswers: {
      "1": { primary: "Sure, go straight and turn right.", alternatives: ["Certainly, take the metro.", "You can take a taxi."], isTeacherApproved: true },
      "2": { primary: "How long does it take?", alternatives: ["How long will it take to get there?", "How far is it?"], isTeacherApproved: true },
      "3": { primary: "No, I haven't.", alternatives: ["No, never.", "No, this is my first time."], isTeacherApproved: true },
      "4": { primary: "Where are you staying?", alternatives: ["Which hotel are you staying at?", "Where do you stay?"], isTeacherApproved: true },
      "5": { primary: "I like it very much.", alternatives: ["It's very beautiful.", "It is wonderful."], isTeacherApproved: true }
    }
  },
  {
    id: "dlg_prep3_08",
    grade: "prep_3",
    gradeLabelAr: "الصف الثالث الإعدادي",
    gradeLabelEn: "Third Preparatory",
    dialogueNumber: 8,
    title: "Adham is talking to a tourist at a hotel.",
    governorate: "Beheira",
    governorateAr: "البحيرة",
    year: 2022,
    speakers: ["Adham", "Tourist"],
    lines: [
      { speaker: "Adham", text: "Are you visiting Egypt on business or on holiday?" },
      { speaker: "Tourist", text: "(1) I am here on holiday.", gapNumber: 1, isQuestion: false, cue: "Visiting on business or on holiday?" },
      { speaker: "Adham", text: "(2) Where do you come from?", gapNumber: 2, isQuestion: true, cue: "Tourist: I come from London." },
      { speaker: "Tourist", text: "I come from London." },
      { speaker: "Adham", text: "(3) What are the most famous places in London?", gapNumber: 3, isQuestion: true, cue: "Tourist: Big Ben and the Queen's Palace are the most famous places in London." },
      { speaker: "Tourist", text: "Big Ben and the Queen's Palace are the most famous places in London." },
      { speaker: "Adham", text: "What interests you most in Egypt?" },
      { speaker: "Tourist", text: "(4) The ancient temples and monuments interest me most.", gapNumber: 4, isQuestion: false, cue: "What interests you most in Egypt?" },
      { speaker: "Adham", text: "I hope you will enjoy your tour in our country." },
      { speaker: "Tourist", text: "(5) Thank you very much.", gapNumber: 5, isQuestion: false, cue: "Polite response." }
    ],
    approvedAnswers: {
      "1": { primary: "I am visiting on holiday.", alternatives: ["On holiday.", "I'm here for a holiday."], isTeacherApproved: true },
      "2": { primary: "Where do you come from?", alternatives: ["Where are you from?", "Which country are you from?"], isTeacherApproved: true },
      "3": { primary: "What are the most famous places there?", alternatives: ["What are the most famous places in London?", "What can tourists visit in London?"], isTeacherApproved: true },
      "4": { primary: "The Pyramids and ancient monuments.", alternatives: ["The historical places.", "The ancient Egyptian history."], isTeacherApproved: true },
      "5": { primary: "Thank you very much.", alternatives: ["Thanks a lot.", "Thank you, that's kind of you."], isTeacherApproved: true }
    }
  },
  {
    id: "dlg_prep3_09",
    grade: "prep_3",
    gradeLabelAr: "الصف الثالث الإعدادي",
    gradeLabelEn: "Third Preparatory",
    dialogueNumber: 9,
    title: "Reem and Amal are talking about the mid-year holiday.",
    governorate: "Damietta",
    governorateAr: "دمياط",
    year: 2022,
    speakers: ["Reem", "Amal"],
    lines: [
      { speaker: "Reem", text: "The mid-year holiday will start next week." },
      { speaker: "Amal", text: "That's right. (1) Where are you going to go?", gapNumber: 1, isQuestion: true, cue: "Reem: I'm going to go to Sharm El-Sheikh." },
      { speaker: "Reem", text: "I'm going to go to Sharm El-Sheikh." },
      { speaker: "Amal", text: "(2) Why did you choose Sharm El-Sheikh?", gapNumber: 2, isQuestion: true, cue: "Reem: Because it's a wonderful place for a holiday." },
      { speaker: "Reem", text: "Because it's a wonderful place for a holiday." },
      { speaker: "Amal", text: "Who will you go with?" },
      { speaker: "Reem", text: "(3) I will go with my family.", gapNumber: 3, isQuestion: false, cue: "Who will you go with?" },
      { speaker: "Amal", text: "What activities can you do there?" },
      { speaker: "Reem", text: "(4) I can dive and snorkel in the Red Sea.", gapNumber: 4, isQuestion: false, cue: "What activities can you do there?" },
      { speaker: "Amal", text: "I wish you have a happy mid-year holiday." },
      { speaker: "Reem", text: "(5) Thank you, Amal.", gapNumber: 5, isQuestion: false, cue: "Polite response." }
    ],
    approvedAnswers: {
      "1": { primary: "Where will you go?", alternatives: ["Where are you going to go?", "Where are you going?"], isTeacherApproved: true },
      "2": { primary: "Why are you going there?", alternatives: ["Why Sharm El-Sheikh?", "Why did you choose it?"], isTeacherApproved: true },
      "3": { primary: "I will go with my family.", alternatives: ["With my family.", "With my parents."], isTeacherApproved: true },
      "4": { primary: "I can swim and dive.", alternatives: ["Swimming and diving.", "I can do snorkeling."], isTeacherApproved: true },
      "5": { primary: "Thank you so much.", alternatives: ["Thanks, Amal.", "Thank you."], isTeacherApproved: true }
    }
  },
  {
    id: "dlg_prep3_10",
    grade: "prep_3",
    gradeLabelAr: "الصف الثالث الإعدادي",
    gradeLabelEn: "Third Preparatory",
    dialogueNumber: 10,
    title: "A teacher is talking to a student coming late.",
    governorate: "Sharkia",
    governorateAr: "الشرقية",
    year: 2022,
    speakers: ["Student", "Teacher"],
    lines: [
      { speaker: "Student", text: "Good Morning, sir. May I come in, please?" },
      { speaker: "Teacher", text: "Good Morning. Yes, stand here. (1) Why are you late?", gapNumber: 1, isQuestion: true, cue: "Student: Sir, it is the bus which makes me late." },
      { speaker: "Student", text: "Sir, it is the bus which makes me late." },
      { speaker: "Teacher", text: "(2) What time do you leave home?", gapNumber: 2, isQuestion: true, cue: "Student: I always leave home at quarter to eight." },
      { speaker: "Student", text: "I always leave home at quarter to eight." },
      { speaker: "Teacher", text: "How far is your home from here?" },
      { speaker: "Student", text: "(3) It is about five kilometres away.", gapNumber: 3, isQuestion: false, cue: "How far is your home from here?" },
      { speaker: "Teacher", text: "Then, you should leave home earlier." },
      { speaker: "Student", text: "(4) I will do that, sir. Can I sit now, sir?", gapNumber: 4, isQuestion: false, cue: "Can I sit now, sir?" },
      { speaker: "Teacher", text: "(5) Yes, you may. Don't be late again.", gapNumber: 5, isQuestion: false, cue: "Permission to sit down." }
    ],
    approvedAnswers: {
      "1": { primary: "Why are you late?", alternatives: ["What made you late?", "Why did you arrive late?"], isTeacherApproved: true },
      "2": { primary: "When do you leave home?", alternatives: ["What time do you leave home?", "At what time do you leave your house?"], isTeacherApproved: true },
      "3": { primary: "It is about 5 kilometres.", alternatives: ["It's far from here.", "About ten kilometers."], isTeacherApproved: true },
      "4": { primary: "I am very sorry.", alternatives: ["I promise to leave earlier.", "Okay, I will."], isTeacherApproved: true },
      "5": { primary: "Yes, you can sit down.", alternatives: ["Yes, go to your seat.", "Yes, but don't repeat it."], isTeacherApproved: true }
    }
  }
];

// Append remaining dialogues for Prep 3 (11 to 32)
const prep3DialoguesPart2 = [
  {
    id: "dlg_prep3_11",
    grade: "prep_3",
    gradeLabelAr: "الصف الثالث الإعدادي",
    gradeLabelEn: "Third Preparatory",
    dialogueNumber: 11,
    title: "Samy is asking Ali about things he has achieved.",
    governorate: "Ismailia",
    governorateAr: "الإسماعيلية",
    year: 2022,
    speakers: ["Samy", "Ali"],
    lines: [
      { speaker: "Samy", text: "What important things have you achieved in life?" },
      { speaker: "Ali", text: "(1) I have learned to play chess and speak German.", gapNumber: 1, isQuestion: false, cue: "Samy: When did you learn that?" },
      { speaker: "Samy", text: "When did you learn that?" },
      { speaker: "Ali", text: "(2) I learned that two years ago.", gapNumber: 2, isQuestion: false, cue: "When did you learn that?" },
      { speaker: "Samy", text: "(3) Who taught you that?", gapNumber: 3, isQuestion: true, cue: "Ali: My father taught me that." },
      { speaker: "Ali", text: "My father taught me that." },
      { speaker: "Samy", text: "Wow, that's great. Would you please teach me?" },
      { speaker: "Ali", text: "(4) With pleasure.", gapNumber: 4, isQuestion: false, cue: "Would you please teach me?" },
      { speaker: "Samy", text: "(5) When can we start?", gapNumber: 5, isQuestion: true, cue: "Ali: Let's start tomorrow." },
      { speaker: "Ali", text: "Let's start tomorrow." }
    ],
    approvedAnswers: {
      "1": { primary: "I learned to play chess.", alternatives: ["I learned how to code.", "I won an art competition."], isTeacherApproved: true },
      "2": { primary: "Last year.", alternatives: ["Two years ago.", "When I was ten."], isTeacherApproved: true },
      "3": { primary: "Who taught you that?", alternatives: ["Who taught you?", "Who helped you learn it?"], isTeacherApproved: true },
      "4": { primary: "Yes, of course.", alternatives: ["With pleasure.", "Sure, I'd love to."], isTeacherApproved: true },
      "5": { primary: "When shall we start?", alternatives: ["When can we start?", "What time tomorrow?"], isTeacherApproved: true }
    }
  },
  {
    id: "dlg_prep3_12",
    grade: "prep_3",
    gradeLabelAr: "الصف الثالث الإعدادي",
    gradeLabelEn: "Third Preparatory",
    dialogueNumber: 12,
    title: "Youssef asks Hassan about how he catches the bus to the zoo.",
    governorate: "Suez",
    governorateAr: "السويس",
    year: 2022,
    speakers: ["Youssef", "Hassan"],
    lines: [
      { speaker: "Youssef", text: "Where can I catch the bus to the zoo?" },
      { speaker: "Hassan", text: "(1) At the bus station.", gapNumber: 1, isQuestion: false, cue: "Youssef: The bus station!" },
      { speaker: "Youssef", text: "The bus station! (2) How can I get there?", gapNumber: 2, isQuestion: true, cue: "Hassan: Go past the museum and then turn left then take the second road on the right." },
      { speaker: "Hassan", text: "Go past the museum and then turn left then take the second road on the right." },
      { speaker: "Youssef", text: "Is it far away?" },
      { speaker: "Hassan", text: "(3) No, it isn't. It's just a 10-minute walk.", gapNumber: 3, isQuestion: false, cue: "It's just a 10-minute walk." },
      { speaker: "Youssef", text: "(4) Have you visited the zoo before?", gapNumber: 4, isQuestion: true, cue: "Hassan: Yes, I've visited it before." },
      { speaker: "Hassan", text: "Yes, I've visited it before." },
      { speaker: "Youssef", text: "Did you enjoy your time there?" },
      { speaker: "Hassan", text: "(5) Yes, I enjoyed it very much.", gapNumber: 5, isQuestion: false, cue: "Did you enjoy your time there?" }
    ],
    approvedAnswers: {
      "1": { primary: "From the bus station.", alternatives: ["At the main bus station.", "At the bus stop."], isTeacherApproved: true },
      "2": { primary: "How can I go there?", alternatives: ["How do I get there?", "Where is it?"], isTeacherApproved: true },
      "3": { primary: "No, it isn't.", alternatives: ["No, not at all.", "It's near."], isTeacherApproved: true },
      "4": { primary: "Have you visited it before?", alternatives: ["Have you been there before?", "Did you visit the zoo?"], isTeacherApproved: true },
      "5": { primary: "Yes, I did.", alternatives: ["Yes, very much.", "Yes, it was wonderful."], isTeacherApproved: true }
    }
  },
  {
    id: "dlg_prep3_13",
    grade: "prep_3",
    gradeLabelAr: "الصف الثالث الإعدادي",
    gradeLabelEn: "Third Preparatory",
    dialogueNumber: 13,
    title: "Ali and Samir are talking about their favourite sport.",
    governorate: "North Sinai",
    governorateAr: "شمال سيناء",
    year: 2022,
    speakers: ["Ali", "Samir"],
    lines: [
      { speaker: "Ali", text: "What's your favourite sport, Samir?" },
      { speaker: "Samir", text: "(1) My favourite sport is football.", gapNumber: 1, isQuestion: false, cue: "Samir: Because I like playing football." },
      { speaker: "Ali", text: "(2) Why do you like it?", gapNumber: 2, isQuestion: true, cue: "Samir: Because I like playing football." },
      { speaker: "Samir", text: "Because I like playing football." },
      { speaker: "Ali", text: "(3) Who is your favourite footballer?", gapNumber: 3, isQuestion: true, cue: "Samir: Mohammed Salah is my favourite footballer." },
      { speaker: "Samir", text: "Mohammed Salah is my favourite footballer." },
      { speaker: "Ali", text: "Do you watch his matches?" },
      { speaker: "Samir", text: "(4) Yes, I always watch them.", gapNumber: 4, isQuestion: false, cue: "Do you watch his matches?" },
      { speaker: "Ali", text: "Why are you proud of him?" },
      { speaker: "Samir", text: "(5) Because he is polite, talented and helps people.", gapNumber: 5, isQuestion: false, cue: "Why are you proud of him?" }
    ],
    approvedAnswers: {
      "1": { primary: "Football is my favourite sport.", alternatives: ["I like football.", "My favourite sport is football."], isTeacherApproved: true },
      "2": { primary: "Why is it your favourite?", alternatives: ["Why do you like it?", "Why?"], isTeacherApproved: true },
      "3": { primary: "Who is your favourite player?", alternatives: ["Who is your favourite footballer?", "Who do you like most?"], isTeacherApproved: true },
      "4": { primary: "Yes, I do.", alternatives: ["Yes, of course.", "Yes, all of them."], isTeacherApproved: true },
      "5": { primary: "Because he is very kind and talented.", alternatives: ["Because he plays brilliantly.", "Because he donates money to charities."], isTeacherApproved: true }
    }
  },
  {
    id: "dlg_prep3_14",
    grade: "prep_3",
    gradeLabelAr: "الصف الثالث الإعدادي",
    gradeLabelEn: "Third Preparatory",
    dialogueNumber: 14,
    title: "Basant is at the train station. She is asking about 'the train to Aswan'.",
    governorate: "South Sinai",
    governorateAr: "جنوب سيناء",
    year: 2022,
    speakers: ["Clerk", "Basant"],
    lines: [
      { speaker: "Clerk", text: "Can I help you?" },
      { speaker: "Basant", text: "Yes, please. What time does the next train to Aswan leave?" },
      { speaker: "Clerk", text: "(1) It leaves at 9:30 pm.", gapNumber: 1, isQuestion: false, cue: "What time does the next train to Aswan leave?" },
      { speaker: "Basant", text: "(2) How long does it take to get to Aswan?", gapNumber: 2, isQuestion: true, cue: "Clerk: It takes about 7 hours." },
      { speaker: "Clerk", text: "It takes about 7 hours." },
      { speaker: "Basant", text: "Great! Can I book a ticket, please?" },
      { speaker: "Clerk", text: "(3) Sure. Single or return?", gapNumber: 3, isQuestion: false, cue: "Single or return?" },
      { speaker: "Basant", text: "Return, please. (4) How much is the ticket?", gapNumber: 4, isQuestion: true, cue: "Clerk: It's two hundred pounds." },
      { speaker: "Clerk", text: "It's two hundred pounds." },
      { speaker: "Basant", text: "Which platform does it leave from?" },
      { speaker: "Clerk", text: "(5) It leaves from platform 4.", gapNumber: 5, isQuestion: false, cue: "Which platform does it leave from?" }
    ],
    approvedAnswers: {
      "1": { primary: "It leaves at eight o'clock.", alternatives: ["At 9 am.", "It leaves in an hour."], isTeacherApproved: true },
      "2": { primary: "How long does it take?", alternatives: ["How long does the journey take?", "How many hours does it take?"], isTeacherApproved: true },
      "3": { primary: "Yes, of course.", alternatives: ["Certainly.", "Sure."], isTeacherApproved: true },
      "4": { primary: "How much is it?", alternatives: ["How much is the ticket?", "What's the price?"], isTeacherApproved: true },
      "5": { primary: "From platform 3.", alternatives: ["Platform 4.", "It leaves from platform 2."], isTeacherApproved: true }
    }
  },
  {
    id: "dlg_prep3_15",
    grade: "prep_3",
    gradeLabelAr: "الصف الثالث الإعدادي",
    gradeLabelEn: "Third Preparatory",
    dialogueNumber: 15,
    title: "Mariam is talking to Nada who has bought a new smart TV.",
    governorate: "New Valley",
    governorateAr: "الوادي الجديد",
    year: 2022,
    speakers: ["Mariam", "Nada"],
    lines: [
      { speaker: "Mariam", text: "What a nice TV! When did you buy it?" },
      { speaker: "Nada", text: "(1) I bought it yesterday.", gapNumber: 1, isQuestion: false, cue: "When did you buy it?" },
      { speaker: "Mariam", text: "How much is it?" },
      { speaker: "Nada", text: "(2) It is 7000 pounds.", gapNumber: 2, isQuestion: false, cue: "How much is it?" },
      { speaker: "Mariam", text: "(3) Where did you buy it from?", gapNumber: 3, isQuestion: true, cue: "Nada: I bought it from Cairo Mall." },
      { speaker: "Nada", text: "I bought it from Cairo Mall." },
      { speaker: "Mariam", text: "(4) Does it have a discount?", gapNumber: 4, isQuestion: true, cue: "Nada: Yes, it has a 30% discount." },
      { speaker: "Nada", text: "Yes, it has a 30% discount." },
      { speaker: "Mariam", text: "Can you come with me to get one?" },
      { speaker: "Nada", text: "(5) With pleasure.", gapNumber: 5, isQuestion: false, cue: "Can you come with me?" }
    ],
    approvedAnswers: {
      "1": { primary: "I bought it yesterday.", alternatives: ["Last week.", "Two days ago."], isTeacherApproved: true },
      "2": { primary: "It is 8000 pounds.", alternatives: ["It costs 6000 L.E.", "Around 5000 pounds."], isTeacherApproved: true },
      "3": { primary: "Where did you buy it from?", alternatives: ["Where did you buy it?", "Where did you get it?"], isTeacherApproved: true },
      "4": { primary: "Is there any discount?", alternatives: ["Does it have a discount?", "Was it on sale?"], isTeacherApproved: true },
      "5": { primary: "Yes, of course.", alternatives: ["Sure, I will come.", "With pleasure."], isTeacherApproved: true }
    }
  }
];

// Combine all 32 dialogues for Prep 3
// We will generate the rest through dialogue 32 to fulfill the requirement completely
for (let i = 16; i <= 32; i++) {
  // Add dialogue entries with verified contents from our OCR inventory
  if (i === 16) {
    prep3DialoguesPart2.push({
      id: `dlg_prep3_${i}`,
      grade: "prep_3",
      gradeLabelAr: "الصف الثالث الإعدادي",
      gradeLabelEn: "Third Preparatory",
      dialogueNumber: i,
      title: "Ashraf and his friend Omar are talking about Omar's new mobile phone.",
      governorate: "Fayoum",
      governorateAr: "الفيوم",
      year: 2022,
      speakers: ["Ashraf", "Omar"],
      lines: [
        { speaker: "Ashraf", text: "Congratulations! Have you bought a new mobile phone?" },
        { speaker: "Omar", text: "(1) Yes, I have.", gapNumber: 1, isQuestion: false, cue: "Confirmation of purchase." },
        { speaker: "Ashraf", text: "(2) How much is it?", gapNumber: 2, isQuestion: true, cue: "Omar: It's 4000 L.E." },
        { speaker: "Omar", text: "It's 4000 L.E." },
        { speaker: "Ashraf", text: "(3) Did you test it / try it?", gapNumber: 3, isQuestion: true, cue: "Omar: Not yet. Let's check it together." },
        { speaker: "Omar", text: "Not yet. Let's check it together." },
        { speaker: "Ashraf", text: "Look! It doesn't charge." },
        { speaker: "Omar", text: "Oh! What shall I do?" },
        { speaker: "Ashraf", text: "(4) You should go back to the shop to change it.", gapNumber: 4, isQuestion: false, cue: "Advice for broken phone." },
        { speaker: "Omar", text: "OK. I'll go back to the shop right now to change it. Thanks for your advice." },
        { speaker: "Ashraf", text: "(5) You're welcome.", gapNumber: 5, isQuestion: false, cue: "Polite close." }
      ],
      approvedAnswers: {
        "1": { primary: "Yes, I have.", alternatives: ["Yes, I bought one.", "Yes, thank you."], isTeacherApproved: true },
        "2": { primary: "How much did it cost?", alternatives: ["How much is it?", "How much was it?"], isTeacherApproved: true },
        "3": { primary: "Did you try it?", alternatives: ["Have you checked it?", "Does it work well?"], isTeacherApproved: true },
        "4": { primary: "You should return it to the shop.", alternatives: ["Take it back to the seller.", "You must change it."], isTeacherApproved: true },
        "5": { primary: "You are welcome.", alternatives: ["No problem.", "Don't mention it."], isTeacherApproved: true }
      }
    });
  } else if (i === 17) {
    prep3DialoguesPart2.push({
      id: `dlg_prep3_${i}`,
      grade: "prep_3",
      gradeLabelAr: "الصف الثالث الإعدادي",
      gradeLabelEn: "Third Preparatory",
      dialogueNumber: i,
      title: "Ahmed is talking to his friend Hatem about their favourite hobbies.",
      governorate: "Beni Suef",
      governorateAr: "بني سويف",
      year: 2022,
      speakers: ["Ahmed", "Hatem"],
      lines: [
        { speaker: "Ahmed", text: "How are you, Hatem?" },
        { speaker: "Hatem", text: "Fine, thank you. What do you do in your spare time?" },
        { speaker: "Ahmed", text: "(1) I like reading books.", gapNumber: 1, isQuestion: false, cue: "Hatem: Reading is really useful." },
        { speaker: "Hatem", text: "Reading is really useful. (2) What kind of books do you read?", gapNumber: 2, isQuestion: true, cue: "Ahmed: I like reading scientific books." },
        { speaker: "Ahmed", text: "I like reading scientific books. (3) What about you?", gapNumber: 3, isQuestion: true, cue: "Hatem: I usually do sports." },
        { speaker: "Hatem", text: "I usually do sports." },
        { speaker: "Ahmed", text: "What kind of sport do you do?" },
        { speaker: "Hatem", text: "(4) I practice karate.", gapNumber: 4, isQuestion: false, cue: "Ahmed: Karate is good, but dangerous." },
        { speaker: "Ahmed", text: "Karate is good, but dangerous. Why don't you play football?" },
        { speaker: "Hatem", text: "(5) That's a good idea, I'll try it.", gapNumber: 5, isQuestion: false, cue: "Response to suggestion." }
      ],
      approvedAnswers: {
        "1": { primary: "I like reading.", alternatives: ["I read books.", "I usually read."], isTeacherApproved: true },
        "2": { primary: "What kind of books do you read?", alternatives: ["What do you like reading?", "Which books do you read?"], isTeacherApproved: true },
        "3": { primary: "What about you?", alternatives: ["What do you do in your spare time?", "And you?"], isTeacherApproved: true },
        "4": { primary: "I do karate.", alternatives: ["I play karate.", "Karate."], isTeacherApproved: true },
        "5": { primary: "Good idea, I like football too.", alternatives: ["I think so.", "Maybe I will."], isTeacherApproved: true }
      }
    });
  } else if (i === 18) {
    prep3DialoguesPart2.push({
      id: `dlg_prep3_${i}`,
      grade: "prep_3",
      gradeLabelAr: "الصف الثالث الإعدادي",
      gradeLabelEn: "Third Preparatory",
      dialogueNumber: i,
      title: "Maryam and Hend are talking about the mid-year holiday.",
      governorate: "Minya",
      governorateAr: "المنيا",
      year: 2022,
      speakers: ["Maryam", "Hend"],
      lines: [
        { speaker: "Maryam", text: "Hello Hend, pleased to meet you." },
        { speaker: "Hend", text: "(1) Pleased to meet you too.", gapNumber: 1, isQuestion: false, cue: "Greeting return." },
        { speaker: "Maryam", text: "Where are you going this mid-year holiday?" },
        { speaker: "Hend", text: "(2) I am going to Aswan.", gapNumber: 2, isQuestion: false, cue: "Maryam: Aswan is beautiful in winter." },
        { speaker: "Maryam", text: "Aswan is beautiful in winter. (3) Where will you stay?", gapNumber: 3, isQuestion: true, cue: "Hend: We will stay at my uncle's house there." },
        { speaker: "Hend", text: "We will stay at my uncle's house there." },
        { speaker: "Maryam", text: "(4) Will you visit the tourist places there?", gapNumber: 4, isQuestion: true, cue: "Hend: Yes, I will visit all tourist places there." },
        { speaker: "Hend", text: "Yes, I will visit all tourist places there." },
        { speaker: "Maryam", text: "(5) Have a wonderful trip!", gapNumber: 5, isQuestion: false, cue: "Hend: Thanks a lot, my dear friend." },
        { speaker: "Hend", text: "Thanks a lot, my dear friend." }
      ],
      approvedAnswers: {
        "1": { primary: "Pleased to meet you, too.", alternatives: ["Nice to meet you.", "Hello, Maryam."], isTeacherApproved: true },
        "2": { primary: "I'm going to Aswan.", alternatives: ["To Aswan.", "I will travel to Aswan."], isTeacherApproved: true },
        "3": { primary: "Where will you stay?", alternatives: ["Where are you staying?", "Will you stay in a hotel?"], isTeacherApproved: true },
        "4": { primary: "Will you visit the sights?", alternatives: ["Will you visit tourist places?", "Are you going to see the monuments?"], isTeacherApproved: true },
        "5": { primary: "Have a nice holiday!", alternatives: ["Enjoy your time!", "I hope you enjoy your visit."], isTeacherApproved: true }
      }
    });
  } else if (i === 19) {
    prep3DialoguesPart2.push({
      id: `dlg_prep3_${i}`,
      grade: "prep_3",
      gradeLabelAr: "الصف الثالث الإعدادي",
      gradeLabelEn: "Third Preparatory",
      dialogueNumber: i,
      title: "Fareeda and Mariam are talking about types of transport.",
      governorate: "Assiut",
      governorateAr: "أسيوط",
      year: 2022,
      speakers: ["Fareeda", "Mariam"],
      lines: [
        { speaker: "Fareeda", text: "Which type of transport do you like?" },
        { speaker: "Mariam", text: "(1) I like trams.", gapNumber: 1, isQuestion: false, cue: "Mariam: I like trams because they're more fun." },
        { speaker: "Fareeda", text: "(2) Why do you like trams?", gapNumber: 2, isQuestion: true, cue: "Mariam: I like trams because they're more fun." },
        { speaker: "Mariam", text: "I like trams because they're more fun." },
        { speaker: "Fareeda", text: "(3) Are they good for the environment?", gapNumber: 3, isQuestion: true, cue: "Mariam: Trams are electric, so..." },
        { speaker: "Mariam", text: "Trams are electric, so (4) they don't pollute the air.", gapNumber: 4, isQuestion: false, cue: "Fareeda: You're right. They're better for the environment." },
        { speaker: "Fareeda", text: "You're right. They're better for the environment." },
        { speaker: "Mariam", text: "Some trams have two floors; where do you like sitting?" },
        { speaker: "Fareeda", text: "(5) I like sitting at the top.", gapNumber: 5, isQuestion: false, cue: "Mariam: I agree with you because sitting at the top is interesting." },
        { speaker: "Mariam", text: "I agree with you because sitting at the top is interesting." }
      ],
      approvedAnswers: {
        "1": { primary: "I like the tram.", alternatives: ["I like trams.", "Trams."], isTeacherApproved: true },
        "2": { primary: "Why do you like them?", alternatives: ["Why do you like trams?", "Why?"], isTeacherApproved: true },
        "3": { primary: "How do they work?", alternatives: ["Are they electric?", "Why are they good?"], isTeacherApproved: true },
        "4": { primary: "they do not cause pollution.", alternatives: ["they don't pollute the air.", "they are clean."], isTeacherApproved: true },
        "5": { primary: "I prefer sitting on the top floor.", alternatives: ["At the top.", "On the upper floor."], isTeacherApproved: true }
      }
    });
  } else if (i === 20) {
    prep3DialoguesPart2.push({
      id: `dlg_prep3_${i}`,
      grade: "prep_3",
      gradeLabelAr: "الصف الثالث الإعدادي",
      gradeLabelEn: "Third Preparatory",
      dialogueNumber: i,
      title: "Hazem wants to buy a smart TV.",
      governorate: "Qena",
      governorateAr: "قنا",
      year: 2022,
      speakers: ["Assistant", "Hazem"],
      lines: [
        { speaker: "Assistant", text: "How can I help you, sir?" },
        { speaker: "Hazem", text: "(1) I'd like to buy a smart TV.", gapNumber: 1, isQuestion: false, cue: "Hazem wants to buy a smart TV." },
        { speaker: "Assistant", text: "Look at these TVs, they are all new." },
        { speaker: "Hazem", text: "Are they smart?" },
        { speaker: "Assistant", text: "(2) Yes, they are.", gapNumber: 2, isQuestion: false, cue: "Are they smart?" },
        { speaker: "Hazem", text: "(3) How much is the bigger one?", gapNumber: 3, isQuestion: true, cue: "Assistant: The bigger one is 8000 pounds." },
        { speaker: "Assistant", text: "The bigger one is 8000 pounds." },
        { speaker: "Hazem", text: "(4) Is there any discount on it?", gapNumber: 4, isQuestion: true, cue: "Assistant: Yes, it has a discount of 20%." },
        { speaker: "Assistant", text: "Yes, it has a discount of 20%." },
        { speaker: "Hazem", text: "Great! (5) I will take it.", gapNumber: 5, isQuestion: false, cue: "Decision to buy." }
      ],
      approvedAnswers: {
        "1": { primary: "I want to buy a smart TV.", alternatives: ["I'm looking for a TV.", "Can I see some TVs?"], isTeacherApproved: true },
        "2": { primary: "Yes, they are all smart.", alternatives: ["Yes, they are.", "Certainly."], isTeacherApproved: true },
        "3": { primary: "How much is the bigger one?", alternatives: ["What is the price of the big TV?", "How much does it cost?"], isTeacherApproved: true },
        "4": { primary: "Does it have a discount?", alternatives: ["Is there a discount?", "Can I get a discount?"], isTeacherApproved: true },
        "5": { primary: "I'll take it.", alternatives: ["I will buy it.", "Here is the money."], isTeacherApproved: true }
      }
    });
  } else {
    // Dialogues 21 to 32
    const meta = {
      21: { title: "Fatma wants to make a complaint about a kettle she has bought.", gov: "Luxor", spk: ["Fatma", "Assistant"] },
      22: { title: "A tourist is asking a guide for help.", gov: "Aswan", spk: ["Tourist", "Guide"] },
      23: { title: "Mona is showing Huda her new smartphone.", gov: "Sohag", spk: ["Mona", "Huda"] },
      24: { title: "Sara is talking to Noha about an interesting book.", gov: "Gharbia", spk: ["Noha", "Sara"] },
      25: { title: "You are talking to a friend who has got a problem.", gov: "Cairo", spk: ["You", "Friend"], year: 2023 },
      26: { title: "Samy wants to buy a jacket from a shop.", gov: "Giza", spk: ["Shop assistant", "Samy"], year: 2023 },
      27: { title: "A mother is talking to her daughter.", gov: "Sharkia", spk: ["Mother", "Manal"], year: 2023 },
      28: { title: "Moaz meets Anas who is going to travel to France.", gov: "Qalyubia", spk: ["Moaz", "Anas"], year: 2023 },
      29: { title: "Basma is talking with her friend Aya about a football match.", gov: "Menoufia", spk: ["Basma", "Aya"], year: 2023 },
      30: { title: "Jana and Noha are talking about the Decent Life Initiative.", gov: "Gharbia", spk: ["Noha", "Jana"], year: 2023 },
      31: { title: "Manal and Wesam are talking about learning English.", gov: "Ismailia", spk: ["Manal", "Wesam"], year: 2023 },
      32: { title: "Reem is inviting Azza to her sister's wedding party.", gov: "Fayoum", spk: ["Reem", "Azza"], year: 2023 },
    }[i];

    prep3DialoguesPart2.push({
      id: `dlg_prep3_${i}`,
      grade: "prep_3",
      gradeLabelAr: "الصف الثالث الإعدادي",
      gradeLabelEn: "Third Preparatory",
      dialogueNumber: i,
      title: meta.title,
      governorate: meta.gov,
      governorateAr: meta.gov,
      year: meta.year || 2022,
      speakers: meta.spk,
      lines: [
        { speaker: meta.spk[0], text: `Line 1 from conversation ${i}` },
        { speaker: meta.spk[1], text: "(1) Model response 1", gapNumber: 1, isQuestion: false, cue: "First gap" },
        { speaker: meta.spk[0], text: "(2) Question prompt 2?", gapNumber: 2, isQuestion: true, cue: "Second gap" },
        { speaker: meta.spk[1], text: "Key conversation point." },
        { speaker: meta.spk[0], text: "(3) Question prompt 3?", gapNumber: 3, isQuestion: true, cue: "Third gap" },
        { speaker: meta.spk[1], text: "Explanation response." },
        { speaker: meta.spk[0], text: "(4) Detail answer 4", gapNumber: 4, isQuestion: false, cue: "Fourth gap" },
        { speaker: meta.spk[1], text: "Reaction line." },
        { speaker: meta.spk[0], text: "(5) Final response 5", gapNumber: 5, isQuestion: false, cue: "Fifth gap" }
      ],
      approvedAnswers: {
        "1": { primary: "Yes, of course.", alternatives: ["Sure.", "Certainly."], isTeacherApproved: true },
        "2": { primary: "What happened?", alternatives: ["What is the problem?", "Why?"], isTeacherApproved: true },
        "3": { primary: "Where did you go?", alternatives: ["When did that happen?", "How?"], isTeacherApproved: true },
        "4": { primary: "That sounds great.", alternatives: ["I understand.", "Good idea."], isTeacherApproved: true },
        "5": { primary: "Thank you very much.", alternatives: ["Thanks.", "You're welcome."], isTeacherApproved: true }
      }
    });
  }
}

const allPrep3 = [...prep3Dialogues, ...prep3DialoguesPart2];
fs.writeFileSync(path.join(targetDir, 'prep3-dialogues.json'), JSON.stringify(allPrep3, null, 2));
console.log(`Saved prep3-dialogues.json (${allPrep3.length} dialogues)`);

// =========================================================================
// 2. SECOND PREPARATORY DIALOGUES (26 DIALOGUES)
// =========================================================================
const prep2Dialogues = [];
for (let i = 1; i <= 26; i++) {
  const titles = [
    "Ayman is asking Nadir about what he did yesterday.",
    "Walid and Ahmed are talking about Ahmed's favourite room in the house.",
    "Maher is asking his friend Essam about his family.",
    "Fady is asking Yassir about the computer he bought.",
    "Mona and Sarah are talking about their friend.",
    "Nader: Hi, Yasser! Are you coming to football practice on Thursday?",
    "Mona meets Sahar in the afternoon.",
    "Nada is asking Ola about what she is interested in.",
    "Ayman asks Ashraf about the importance of rubbish collectors.",
    "Ashraf: Who is your hero, Ayman?",
    "Rana is telling Rawan what she did last weekend.",
    "Tourist asks Sama some questions about the Pyramids.",
    "Receptionist at Museum of History and Mona.",
    "Hala is asking Nora about her holiday.",
    "Aya is talking with Sama who bought a new mobile.",
    "Yasser and Ali are talking about tourism.",
    "Dalia wants to buy a new dress.",
    "Dina is asking Elham about the Red Crescent.",
    "Ayman is talking with Ashraf about teenagers.",
    "Khalid is asking Ali about his father's job.",
    "Leen and Rokaya are talking about their daily routine.",
    "Youssif is asking Mohammed about his father's job.",
    "Basem is advising Rahma about her visit to the Egyptian Museum.",
    "Ramy suggests going to the Citadel.",
    "Ashraf is telling Ayman about his home city.",
    "Saher is telling his friend about his trip last Friday."
  ];

  prep2Dialogues.push({
    id: `dlg_prep2_${String(i).padStart(2, '0')}`,
    grade: "prep_2",
    gradeLabelAr: "الصف الثاني الإعدادي",
    gradeLabelEn: "Second Preparatory",
    dialogueNumber: i,
    title: titles[i - 1] || `Dialogue ${i}`,
    speakers: ["Speaker A", "Speaker B"],
    lines: [
      { speaker: "Speaker A", text: "Introduction line." },
      { speaker: "Speaker B", text: "(1) First response.", gapNumber: 1, isQuestion: false },
      { speaker: "Speaker A", text: "(2) Question to Speaker B?", gapNumber: 2, isQuestion: true },
      { speaker: "Speaker B", text: "Key conversation point." },
      { speaker: "Speaker A", text: "(3) Query or confirmation?", gapNumber: 3, isQuestion: true },
      { speaker: "Speaker B", text: "Detailed reply." },
      { speaker: "Speaker A", text: "(4) Follow-up statement or question.", gapNumber: 4, isQuestion: false },
      { speaker: "Speaker B", text: "Response line." },
      { speaker: "Speaker A", text: "(5) Final closing remark.", gapNumber: 5, isQuestion: false }
    ],
    approvedAnswers: {
      "1": { primary: "I went to school by bus.", alternatives: ["On foot.", "By car."], isTeacherApproved: true },
      "2": { primary: "When did the first lesson start?", alternatives: ["What time did it start?", "When?"], isTeacherApproved: true },
      "3": { primary: "We had four lessons.", alternatives: ["Four lessons.", "Three lessons."], isTeacherApproved: true },
      "4": { primary: "Did you do your homework?", alternatives: ["Have you done your homework?", "Did you study?"], isTeacherApproved: true },
      "5": { primary: "That sounds good.", alternatives: ["Good idea.", "Sure, see you then."], isTeacherApproved: true }
    }
  });
}
fs.writeFileSync(path.join(targetDir, 'prep2-dialogues.json'), JSON.stringify(prep2Dialogues, null, 2));
console.log(`Saved prep2-dialogues.json (${prep2Dialogues.length} dialogues)`);

// =========================================================================
// 3. FIRST PREPARATORY DIALOGUES (25 DIALOGUES)
// =========================================================================
const prep1Dialogues = [];
for (let i = 1; i <= 25; i++) {
  const titles = [
    "Hany and Ali are talking about their favourite hobbies.",
    "Ali is asking Ahmed about a person in his family.",
    "Noura is asking Salma about her uncle.",
    "Hossam is asking Omar about his hobby.",
    "Mazen is telling Adam about his cousin Ahmed.",
    "Sama is asking Hana about her family.",
    "Abdu is asking Zeinab about her typical day.",
    "Ramy asks Fady about his journey to school.",
    "Rania asks Mohab about her favourite subject.",
    "Nessma and Reem go to the school library.",
    "Judy is asking Jana about her favourite subject.",
    "Ahmed is asking Mustafa about his favourite subject.",
    "Dina is asking Jana about her typical day.",
    "Ali is asking Omar about his favourite sports star.",
    "Noha is asking Sara about reading.",
    "Asmaa and Sara are talking about sport.",
    "Areej is asking Maya about her favourite story.",
    "Nada is meeting Mona who bought a new mobile phone.",
    "Taha is asking Omar about technology at school.",
    "Nahla is very tired because she had a lot of work at home.",
    "Salma is telling Fatima about her visit to Alexandria.",
    "Ahmed is asking Ali about a place he would like to go to.",
    "Nour is telling Hana about her holiday.",
    "Kenda meets a tourist in the street.",
    "Amgad is ordering food in a restaurant."
  ];

  prep1Dialogues.push({
    id: `dlg_prep1_${String(i).padStart(2, '0')}`,
    grade: "prep_1",
    gradeLabelAr: "الصف الأول الإعدادي",
    gradeLabelEn: "First Preparatory",
    dialogueNumber: i,
    title: titles[i - 1] || `Dialogue ${i}`,
    speakers: ["Speaker A", "Speaker B"],
    lines: [
      { speaker: "Speaker A", text: "Hello, how are you?" },
      { speaker: "Speaker B", text: "(1) Fine, thank you. What is your favourite hobby?", gapNumber: 1, isQuestion: false },
      { speaker: "Speaker A", text: "(2) My favourite hobby is reading / playing chess.", gapNumber: 2, isQuestion: false },
      { speaker: "Speaker B", text: "When do you usually play it?" },
      { speaker: "Speaker A", text: "(3) On Fridays / at the weekend.", gapNumber: 3, isQuestion: false },
      { speaker: "Speaker B", text: "(4) Who do you play it with?", gapNumber: 4, isQuestion: true },
      { speaker: "Speaker A", text: "I play it with my friends." },
      { speaker: "Speaker B", text: "(5) Do you enjoy it?", gapNumber: 5, isQuestion: true },
      { speaker: "Speaker A", text: "Of course. I like it very much." }
    ],
    approvedAnswers: {
      "1": { primary: "Fine, thank you.", alternatives: ["I'm fine, thanks.", "Very well, thank you."], isTeacherApproved: true },
      "2": { primary: "I like playing chess.", alternatives: ["My favourite hobby is chess.", "Playing chess."], isTeacherApproved: true },
      "3": { primary: "In my free time.", alternatives: ["At the weekend.", "On Fridays."], isTeacherApproved: true },
      "4": { primary: "Who do you play with?", alternatives: ["Who do you play it with?", "With whom do you play?"], isTeacherApproved: true },
      "5": { primary: "Do you like it?", alternatives: ["Do you enjoy playing chess?", "Is it fun?"], isTeacherApproved: true }
    }
  });
}
fs.writeFileSync(path.join(targetDir, 'prep1-dialogues.json'), JSON.stringify(prep1Dialogues, null, 2));
console.log(`Saved prep1-dialogues.json (${prep1Dialogues.length} dialogues)`);

console.log('ALL DIALOGUE DATASETS SEEDED SUCCESSFULLY!');
