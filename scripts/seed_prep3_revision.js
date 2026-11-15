const fs = require('fs');
const path = require('path');

const targetDir = path.join(__dirname, '..', 'src', 'data', 'dialogue-center');
if (!fs.existsSync(targetDir)) {
  fs.mkdirSync(targetDir, { recursive: true });
}

// =========================================================================
// 1. THIRD PREP EXAM REVISION DIALOGUES (10 DIALOGUES - 2023 GOVERNORATES)
// =========================================================================
const prep3RevisionDialogues = [
  {
    id: "dlg_prep3_rev_01",
    grade: "prep_3_rev",
    gradeLabelAr: "الصف الثالث الإعدادي (مراجعة نهائية)",
    gradeLabelEn: "Third Preparatory (Revision)",
    dialogueNumber: 1,
    title: "Faten and Huda are talking about spending their last mid-year holiday.",
    governorate: "Giza",
    governorateAr: "الجيزة",
    year: 2023,
    speakers: ["Faten", "Huda"],
    lines: [
      { speaker: "Faten", text: "Good morning, Huda." },
      { speaker: "Huda", text: "Good morning, Faten. Where did you go last Mid-year holiday?" },
      { speaker: "Faten", text: "(1) I went to Alexandria.", gapNumber: 1, isQuestion: false, cue: "Where did you go last Mid-year holiday? -> Huda: Alexandria!" },
      { speaker: "Huda", text: "Alexandria! Which places did you visit there?" },
      { speaker: "Faten", text: "(2) I visited the Citadel of Qaitbay and the beach.", gapNumber: 2, isQuestion: false, cue: "Which places did you visit there?" },
      { speaker: "Huda", text: "(3) Who did you go with?", gapNumber: 3, isQuestion: true, cue: "Faten: I went with my family." },
      { speaker: "Faten", text: "I went with my family." },
      { speaker: "Huda", text: "(4) Can I come with you next holiday?", gapNumber: 4, isQuestion: true, cue: "Faten: Of course, you can come with us next holiday." },
      { speaker: "Faten", text: "Of course, you can come with us next holiday." },
      { speaker: "Huda", text: "(5) Thank you so much.", gapNumber: 5, isQuestion: false, cue: "Expressing gratitude." }
    ],
    approvedAnswers: {
      "1": {
        primary: "I went to Alexandria.",
        alternatives: ["I went to Alex.", "We went to Alexandria.", "To Alexandria."],
        isTeacherApproved: true
      },
      "2": {
        primary: "I visited the Citadel of Qaitbay.",
        alternatives: ["I visited the Bibliotheca Alexandrina.", "I visited the beach and the library.", "I visited Alexandria Library."],
        isTeacherApproved: true
      },
      "3": {
        primary: "Who did you go with?",
        alternatives: ["With whom did you go?", "Who went with you?"],
        isTeacherApproved: true
      },
      "4": {
        primary: "Can I come with you next holiday?",
        alternatives: ["Could I go with you next holiday?", "May I join you next time?", "Can I go with you?"],
        isTeacherApproved: true
      },
      "5": {
        primary: "Thank you very much.",
        alternatives: ["Thanks a lot.", "That's very kind of you.", "Great, thank you!"],
        isTeacherApproved: true
      }
    }
  },
  {
    id: "dlg_prep3_rev_02",
    grade: "prep_3_rev",
    gradeLabelAr: "الصف الثالث الإعدادي (مراجعة نهائية)",
    gradeLabelEn: "Third Preparatory (Revision)",
    dialogueNumber: 2,
    title: "Essam and Adel are talking about next summer holiday.",
    governorate: "Qalyubia",
    governorateAr: "القليوبية",
    year: 2023,
    speakers: ["Essam", "Adel"],
    lines: [
      { speaker: "Essam", text: "Hello, Adel. Where will you go next summer holiday?" },
      { speaker: "Adel", text: "(1) I will go to Sharm El-Sheikh.", gapNumber: 1, isQuestion: false, cue: "Essam: Sharm ElSheikh!" },
      { speaker: "Essam", text: "Sharm ElSheikh! (2) Who will you go with?", gapNumber: 2, isQuestion: true, cue: "Adel: I will go with my friend, Asser." },
      { speaker: "Adel", text: "I will go with my friend, Asser." },
      { speaker: "Essam", text: "(3) Will you stay with relatives / in a flat?", gapNumber: 3, isQuestion: true, cue: "Adel: No, we will stay in a hotel." },
      { speaker: "Adel", text: "No, we will stay in a hotel." },
      { speaker: "Essam", text: "How will you go?" },
      { speaker: "Adel", text: "(4) We will go by bus.", gapNumber: 4, isQuestion: false, cue: "How will you go?" },
      { speaker: "Essam", text: "How long will you stay?" },
      { speaker: "Adel", text: "(5) We will stay for a week.", gapNumber: 5, isQuestion: false, cue: "How long will you stay?" }
    ],
    approvedAnswers: {
      "1": {
        primary: "I will go to Sharm El-Sheikh.",
        alternatives: ["To Sharm El-Sheikh.", "I'm going to Sharm El-Sheikh."],
        isTeacherApproved: true
      },
      "2": {
        primary: "Who will you go with?",
        alternatives: ["With whom will you go?", "Who will go with you?"],
        isTeacherApproved: true
      },
      "3": {
        primary: "Will you stay in a flat?",
        alternatives: ["Will you stay with your uncle?", "Will you rent an apartment?", "Are you staying in a flat?"],
        isTeacherApproved: true
      },
      "4": {
        primary: "We will go by bus.",
        alternatives: ["By bus.", "By plane.", "By car."],
        isTeacherApproved: true
      },
      "5": {
        primary: "We will stay for a week.",
        alternatives: ["For a week.", "For ten days.", "We'll stay for two weeks."],
        isTeacherApproved: true
      }
    }
  },
  {
    id: "dlg_prep3_rev_03",
    grade: "prep_3_rev",
    gradeLabelAr: "الصف الثالث الإعدادي (مراجعة نهائية)",
    gradeLabelEn: "Third Preparatory (Revision)",
    dialogueNumber: 3,
    title: "Hagar is talking to Reem about some interesting animals.",
    governorate: "Fayoum",
    governorateAr: "الفيوم",
    year: 2023,
    speakers: ["Hagar", "Reem"],
    lines: [
      { speaker: "Hagar", text: "Are you interested in animals, Reem?" },
      { speaker: "Reem", text: "(1) Yes, I am.", gapNumber: 1, isQuestion: false, cue: "Are you interested in animals?" },
      { speaker: "Hagar", text: "(2) Which animal do you like most?", gapNumber: 2, isQuestion: true, cue: "Reem: I like orangutans most." },
      { speaker: "Reem", text: "I like orangutans most." },
      { speaker: "Hagar", text: "(3) Where do they live?", gapNumber: 3, isQuestion: true, cue: "Reem: They live in rainforests." },
      { speaker: "Reem", text: "They live in rainforests. Have you ever seen an orangutan?" },
      { speaker: "Hagar", text: "(4) No, I haven't.", gapNumber: 4, isQuestion: false, cue: "Have you ever seen an orangutan?" },
      { speaker: "Reem", text: "What about you? Which animal do you like most?" },
      { speaker: "Hagar", text: "(5) I like polar bears most. They live in polar habitats.", gapNumber: 5, isQuestion: false, cue: "Reem: I wonder how the polar bears can live there." },
      { speaker: "Reem", text: "I wonder how the polar bears can live there." }
    ],
    approvedAnswers: {
      "1": {
        primary: "Yes, I am.",
        alternatives: ["Yes, very much.", "Yes, of course."],
        isTeacherApproved: true
      },
      "2": {
        primary: "Which animal do you like most?",
        alternatives: ["What is your favourite animal?", "Which animal is your favourite?"],
        isTeacherApproved: true
      },
      "3": {
        primary: "Where do they live?",
        alternatives: ["What habitat do they live in?", "Where do orangutans live?"],
        isTeacherApproved: true
      },
      "4": {
        primary: "No, I haven't.",
        alternatives: ["No, never.", "No, I haven't seen one before."],
        isTeacherApproved: true
      },
      "5": {
        primary: "I like polar bears.",
        alternatives: ["I like polar bears most.", "My favourite animal is the polar bear."],
        isTeacherApproved: true
      }
    }
  },
  {
    id: "dlg_prep3_rev_04",
    grade: "prep_3_rev",
    gradeLabelAr: "الصف الثالث الإعدادي (مراجعة نهائية)",
    gradeLabelEn: "Third Preparatory (Revision)",
    dialogueNumber: 4,
    title: "Atef is talking to a tourist about his visit to Egypt.",
    governorate: "Damietta",
    governorateAr: "دمياط",
    year: 2023,
    speakers: ["Atef", "Tourist"],
    lines: [
      { speaker: "Atef", text: "Hello." },
      { speaker: "Tourist", text: "Hello." },
      { speaker: "Atef", text: "Is it your first visit to Egypt?" },
      { speaker: "Tourist", text: "(1) No, it isn't. I came here with my wife before.", gapNumber: 1, isQuestion: false, cue: "I came here with my wife before." },
      { speaker: "Atef", text: "(2) Where do you come from?", gapNumber: 2, isQuestion: true, cue: "Tourist: I come from Ireland." },
      { speaker: "Tourist", text: "I come from Ireland." },
      { speaker: "Atef", text: "(3) How long will you stay in Egypt?", gapNumber: 3, isQuestion: true, cue: "Tourist: I will stay in Egypt for two weeks." },
      { speaker: "Tourist", text: "I will stay in Egypt for two weeks." },
      { speaker: "Atef", text: "What cities are you going to visit?" },
      { speaker: "Tourist", text: "(4) I am going to visit Aswan and Luxor.", gapNumber: 4, isQuestion: false, cue: "Atef: Sure, Aswan and Luxor are interesting places to visit." },
      { speaker: "Atef", text: "Sure, Aswan and Luxor are interesting places to visit. I wish you an enjoyable visit." },
      { speaker: "Tourist", text: "(5) Thank you very much.", gapNumber: 5, isQuestion: false, cue: "Polite response to wish." }
    ],
    approvedAnswers: {
      "1": {
        primary: "No, it isn't.",
        alternatives: ["No, it's not my first visit.", "No, I have visited Egypt before."],
        isTeacherApproved: true
      },
      "2": {
        primary: "Where do you come from?",
        alternatives: ["Where are you from?", "What is your nationality?"],
        isTeacherApproved: true
      },
      "3": {
        primary: "How long will you stay in Egypt?",
        alternatives: ["How long will you stay here?", "How long are you staying?"],
        isTeacherApproved: true
      },
      "4": {
        primary: "I am going to visit Aswan and Luxor.",
        alternatives: ["Aswan and Luxor.", "I will visit Luxor and Aswan."],
        isTeacherApproved: true
      },
      "5": {
        primary: "Thank you very much.",
        alternatives: ["Thanks a lot.", "Thank you.", "That's very kind of you."],
        isTeacherApproved: true
      }
    }
  },
  {
    id: "dlg_prep3_rev_05",
    grade: "prep_3_rev",
    gradeLabelAr: "الصف الثالث الإعدادي (مراجعة نهائية)",
    gradeLabelEn: "Third Preparatory (Revision)",
    dialogueNumber: 5,
    title: "Sabah is talking to Maged who is planting a tree.",
    governorate: "Suez",
    governorateAr: "السويس",
    year: 2023,
    speakers: ["Sabah", "Maged"],
    lines: [
      { speaker: "Sabah", text: "Hello, Maged. (1) What are you doing?", gapNumber: 1, isQuestion: true, cue: "Maged: I'm planting a tree." },
      { speaker: "Maged", text: "I'm planting a tree." },
      { speaker: "Sabah", text: "Do you know how to plant a tree?" },
      { speaker: "Maged", text: "(2) Yes, of course.", gapNumber: 2, isQuestion: false, cue: "Do you know how to plant a tree?" },
      { speaker: "Sabah", text: "Who taught you how to plant a tree?" },
      { speaker: "Maged", text: "(3) My father / my teacher taught me.", gapNumber: 3, isQuestion: false, cue: "Who taught you how to plant a tree?" },
      { speaker: "Sabah", text: "Are trees useful for our environment?" },
      { speaker: "Maged", text: "(4) Yes, they are.", gapNumber: 4, isQuestion: false, cue: "Are trees useful for our environment?" },
      { speaker: "Sabah", text: "(5) Why are they useful?", gapNumber: 5, isQuestion: true, cue: "Maged: Trees are useful because they keep the air clean." },
      { speaker: "Maged", text: "Trees are useful because they keep the air clean." }
    ],
    approvedAnswers: {
      "1": {
        primary: "What are you doing?",
        alternatives: ["What are you doing here?", "What are you making?"],
        isTeacherApproved: true
      },
      "2": {
        primary: "Yes, I do.",
        alternatives: ["Yes, of course.", "Yes, I know."],
        isTeacherApproved: true
      },
      "3": {
        primary: "My father taught me.",
        alternatives: ["My teacher taught me.", "My grandfather taught me.", "My science teacher taught me."],
        isTeacherApproved: true
      },
      "4": {
        primary: "Yes, they are.",
        alternatives: ["Yes, very useful.", "Yes, of course they are."],
        isTeacherApproved: true
      },
      "5": {
        primary: "Why are they useful?",
        alternatives: ["Why are trees useful?", "How do they help the environment?"],
        isTeacherApproved: true
      }
    }
  },
  {
    id: "dlg_prep3_rev_06",
    grade: "prep_3_rev",
    gradeLabelAr: "الصف الثالث الإعدادي (مراجعة نهائية)",
    gradeLabelEn: "Third Preparatory (Revision)",
    dialogueNumber: 6,
    title: "Ahmed and Adel are talking about the next holiday.",
    governorate: "Beni Suef",
    governorateAr: "بني سويف",
    year: 2023,
    speakers: ["Ahmed", "Adel"],
    lines: [
      { speaker: "Ahmed", text: "Hello, Adel. Where will you spend the next holiday?" },
      { speaker: "Adel", text: "(1) I will spend it in Alexandria / Hurghada.", gapNumber: 1, isQuestion: false, cue: "Where will you spend the next holiday?" },
      { speaker: "Ahmed", text: "How long will you stay there?" },
      { speaker: "Adel", text: "(2) I will stay for two weeks.", gapNumber: 2, isQuestion: false, cue: "How long will you stay there?" },
      { speaker: "Ahmed", text: "(3) Will you stay in a hotel?", gapNumber: 3, isQuestion: true, cue: "Adel: No, I won't stay in a hotel." },
      { speaker: "Adel", text: "No, I won't stay in a hotel." },
      { speaker: "Ahmed", text: "Where will you stay?" },
      { speaker: "Adel", text: "(4) I will stay in my uncle's flat.", gapNumber: 4, isQuestion: false, cue: "Where will you stay?" },
      { speaker: "Ahmed", text: "(5) Who will you go there with?", gapNumber: 5, isQuestion: true, cue: "Adel: I will go there with my family." },
      { speaker: "Adel", text: "I will go there with my family." }
    ],
    approvedAnswers: {
      "1": {
        primary: "I will spend it in Alexandria.",
        alternatives: ["In Alexandria.", "I will go to Alexandria.", "In Hurghada."],
        isTeacherApproved: true
      },
      "2": {
        primary: "I will stay for a week.",
        alternatives: ["For a week.", "For two weeks.", "About two weeks."],
        isTeacherApproved: true
      },
      "3": {
        primary: "Will you stay in a hotel?",
        alternatives: ["Are you going to stay in a hotel?", "Will you book a hotel?"],
        isTeacherApproved: true
      },
      "4": {
        primary: "I will stay in my uncle's flat.",
        alternatives: ["At my uncle's house.", "In our flat.", "With my relatives."],
        isTeacherApproved: true
      },
      "5": {
        primary: "Who will you go there with?",
        alternatives: ["Who will you go with?", "With whom will you go?"],
        isTeacherApproved: true
      }
    }
  },
  {
    id: "dlg_prep3_rev_07",
    grade: "prep_3_rev",
    gradeLabelAr: "الصف الثالث الإعدادي (مراجعة نهائية)",
    gradeLabelEn: "Third Preparatory (Revision)",
    dialogueNumber: 7,
    title: "Ashraf is telling Adel about his tennis training.",
    governorate: "Minya",
    governorateAr: "المنيا",
    year: 2023,
    speakers: ["Adel", "Ashraf"],
    lines: [
      { speaker: "Adel", text: "Where are you going, Ashraf?" },
      { speaker: "Ashraf", text: "(1) I am going to the sports club.", gapNumber: 1, isQuestion: false, cue: "Adel: What will you do there?" },
      { speaker: "Adel", text: "What will you do there?" },
      { speaker: "Ashraf", text: "(2) I will play / practice tennis.", gapNumber: 2, isQuestion: false, cue: "Adel: Do you like tennis? -> Ashraf: Yes, I like tennis." },
      { speaker: "Adel", text: "(3) Do you like tennis?", gapNumber: 3, isQuestion: true, cue: "Ashraf: Yes. I like tennis." },
      { speaker: "Ashraf", text: "Yes. I like tennis." },
      { speaker: "Adel", text: "(4) Who is your trainer?", gapNumber: 4, isQuestion: true, cue: "Ashraf: Captain Mohammed is my trainer." },
      { speaker: "Ashraf", text: "Captain Mohammed is my trainer." },
      { speaker: "Adel", text: "May I come with you next training?" },
      { speaker: "Ashraf", text: "(5) Yes, of course.", gapNumber: 5, isQuestion: false, cue: "Polite acceptance to join." }
    ],
    approvedAnswers: {
      "1": {
        primary: "I am going to the club.",
        alternatives: ["To the sports club.", "I'm going to the sports club.", "To the tennis court."],
        isTeacherApproved: true
      },
      "2": {
        primary: "I will have tennis training.",
        alternatives: ["I will play tennis.", "I am going to play tennis.", "To train tennis."],
        isTeacherApproved: true
      },
      "3": {
        primary: "Do you like tennis?",
        alternatives: ["Do you enjoy playing tennis?", "Is tennis your favourite sport?"],
        isTeacherApproved: true
      },
      "4": {
        primary: "Who is your trainer?",
        alternatives: ["Who trains you?", "Who is your coach?"],
        isTeacherApproved: true
      },
      "5": {
        primary: "Yes, of course.",
        alternatives: ["Sure, you are welcome.", "Certainly.", "Yes, you can."],
        isTeacherApproved: true
      }
    }
  },
  {
    id: "dlg_prep3_rev_08",
    grade: "prep_3_rev",
    gradeLabelAr: "الصف الثالث الإعدادي (مراجعة نهائية)",
    gradeLabelEn: "Third Preparatory (Revision)",
    dialogueNumber: 8,
    title: "Heba and Sara are talking in the library.",
    governorate: "Assiut",
    governorateAr: "أسيوط",
    year: 2023,
    speakers: ["Heba", "Sara"],
    lines: [
      { speaker: "Heba", text: "Hello, Sara. What are you doing here?" },
      { speaker: "Sara", text: "Hello, Heba. (1) I am reading a book.", gapNumber: 1, isQuestion: false, cue: "Heba: Reading a book!" },
      { speaker: "Heba", text: "Reading a book! (2) What is it about?", gapNumber: 2, isQuestion: true, cue: "Sara: It's about the Pyramids at Giza." },
      { speaker: "Sara", text: "It's about the Pyramids at Giza." },
      { speaker: "Heba", text: "Have you ever visited the Pyramids?" },
      { speaker: "Sara", text: "(3) Yes, I have.", gapNumber: 3, isQuestion: false, cue: "Heba: When did you visit them? -> Sara: I visited them last holiday." },
      { speaker: "Heba", text: "(4) When did you visit them?", gapNumber: 4, isQuestion: true, cue: "Sara: I visited them last holiday." },
      { speaker: "Sara", text: "I visited them last holiday." },
      { speaker: "Heba", text: "How did you go there?" },
      { speaker: "Sara", text: "(5) I went there by bus / by car.", gapNumber: 5, isQuestion: false, cue: "How did you go there?" }
    ],
    approvedAnswers: {
      "1": {
        primary: "I am reading a book.",
        alternatives: ["I'm reading a book.", "Reading a book."],
        isTeacherApproved: true
      },
      "2": {
        primary: "What is it about?",
        alternatives: ["What is this book about?", "What are you reading about?"],
        isTeacherApproved: true
      },
      "3": {
        primary: "Yes, I have.",
        alternatives: ["Yes, I visited them before.", "Yes, of course."],
        isTeacherApproved: true
      },
      "4": {
        primary: "When did you visit them?",
        alternatives: ["When did you go there?", "When was that?"],
        isTeacherApproved: true
      },
      "5": {
        primary: "I went by bus.",
        alternatives: ["By bus.", "By car.", "I went by car."],
        isTeacherApproved: true
      }
    }
  },
  {
    id: "dlg_prep3_rev_09",
    grade: "prep_3_rev",
    gradeLabelAr: "الصف الثالث الإعدادي (مراجعة نهائية)",
    gradeLabelEn: "Third Preparatory (Revision)",
    dialogueNumber: 9,
    title: "Huda and Salma are talking about Salma's new mobile.",
    governorate: "Red Sea",
    governorateAr: "البحر الأحمر",
    year: 2023,
    speakers: ["Huda", "Salma"],
    lines: [
      { speaker: "Huda", text: "Is this mobile new?" },
      { speaker: "Salma", text: "(1) Yes, it is.", gapNumber: 1, isQuestion: false, cue: "Huda: Who bought it for you?" },
      { speaker: "Huda", text: "Who bought it for you?" },
      { speaker: "Salma", text: "(2) My father bought it for me.", gapNumber: 2, isQuestion: false, cue: "Huda: Why did he buy it for you? -> Salma: Because I have passed my final exams." },
      { speaker: "Huda", text: "(3) Why did he buy it for you?", gapNumber: 3, isQuestion: true, cue: "Salma: Because I have passed my final exams." },
      { speaker: "Salma", text: "Because I have passed my final exams." },
      { speaker: "Huda", text: "(4) How much is it?", gapNumber: 4, isQuestion: true, cue: "Salma: It's L.E. 2500." },
      { speaker: "Salma", text: "It's L.E. 2500." },
      { speaker: "Huda", text: "What colour is it?" },
      { speaker: "Salma", text: "(5) It is black / blue.", gapNumber: 5, isQuestion: false, cue: "What colour is it?" }
    ],
    approvedAnswers: {
      "1": {
        primary: "Yes, it is.",
        alternatives: ["Yes, it's new.", "Yes, I got it recently."],
        isTeacherApproved: true
      },
      "2": {
        primary: "My father bought it for me.",
        alternatives: ["My parents bought it.", "My dad.", "My father."],
        isTeacherApproved: true
      },
      "3": {
        primary: "Why did he buy it for you?",
        alternatives: ["Why did he buy it?", "On what occasion did he buy it?"],
        isTeacherApproved: true
      },
      "4": {
        primary: "How much is it?",
        alternatives: ["How much did it cost?", "How much does it cost?"],
        isTeacherApproved: true
      },
      "5": {
        primary: "It is black.",
        alternatives: ["It's blue.", "Black.", "It's silver."],
        isTeacherApproved: true
      }
    }
  },
  {
    id: "dlg_prep3_rev_10",
    grade: "prep_3_rev",
    gradeLabelAr: "الصف الثالث الإعدادي (مراجعة نهائية)",
    gradeLabelEn: "Third Preparatory (Revision)",
    dialogueNumber: 10,
    title: "Esraa is asking Basma about her future job.",
    governorate: "Qena",
    governorateAr: "قنا",
    year: 2023,
    speakers: ["Esraa", "Basma"],
    lines: [
      { speaker: "Esraa", text: "Hi, Basma. Where have you been?" },
      { speaker: "Basma", text: "(1) I have been to the library.", gapNumber: 1, isQuestion: false, cue: "Esraa: The library!" },
      { speaker: "Esraa", text: "The library! (2) Why did you go there?", gapNumber: 2, isQuestion: true, cue: "Basma: Because I am doing research about media." },
      { speaker: "Basma", text: "Because I am doing research about media." },
      { speaker: "Esraa", text: "What job would you like to do in the future?" },
      { speaker: "Basma", text: "(3) I would like to be a journalist.", gapNumber: 3, isQuestion: false, cue: "Basma: Sure, a journalist needs special skills." },
      { speaker: "Esraa", text: "Why do you want to do this job?" },
      { speaker: "Basma", text: "(4) Because I like writing and meeting people.", gapNumber: 4, isQuestion: false, cue: "Why do you want to do this job?" },
      { speaker: "Esraa", text: "Great! (5) Does a journalist need special skills?", gapNumber: 5, isQuestion: true, cue: "Basma: Sure, a journalist needs special skills." },
      { speaker: "Basma", text: "Sure, a journalist needs special skills." }
    ],
    approvedAnswers: {
      "1": {
        primary: "I have been to the library.",
        alternatives: ["To the library.", "I was at the library."],
        isTeacherApproved: true
      },
      "2": {
        primary: "Why were you there?",
        alternatives: ["Why did you go there?", "What were you doing there?"],
        isTeacherApproved: true
      },
      "3": {
        primary: "I would like to be a journalist.",
        alternatives: ["I want to be a journalist.", "A journalist.", "I'd like to work as a journalist."],
        isTeacherApproved: true
      },
      "4": {
        primary: "Because I like writing and helping people.",
        alternatives: ["Because it is an exciting job.", "Because I love media.", "Because it's interesting."],
        isTeacherApproved: true
      },
      "5": {
        primary: "Does a journalist need special skills?",
        alternatives: ["Does it need special skills?", "Do you need special skills for this job?"],
        isTeacherApproved: true
      }
    }
  }
];

fs.writeFileSync(
  path.join(targetDir, 'prep3-revision-dialogues.json'),
  JSON.stringify(prep3RevisionDialogues, null, 2)
);
console.log('Saved prep3-revision-dialogues.json (10 dialogues)');
