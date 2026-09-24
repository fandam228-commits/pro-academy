export type CurriculumUnit = {
  id: string;
  unit: number;
  title: string;
  concept?: string;
  grammar?: string;
  lessons?: string[];
};

export type CurriculumTrack = {
  stage: string;
  grade: string;
  curriculum: string;
  term: string;
  academicYear: string;
  sourceLabel: string;
  units: CurriculumUnit[];
};

export const CURRENT_ACADEMIC_YEAR = "2026/2027";

export const currentCurriculumTracks: CurriculumTrack[] = [
  {
    stage: "Secondary",
    grade: "First Secondary",
    curriculum: "Ministry",
    term: "First",
    academicYear: CURRENT_ACADEMIC_YEAR,
    sourceLabel: "Ministry English textbook",
    units: [
      { id:"fs-u1", unit:1, title:"Egypt's Heritage", grammar:"Past Simple & Past Continuous", lessons:["Taking Pride in Our Beloved Egypt","Moments That Shaped Us","Now Starts Long Ago","Where Pride Begins","An Essay about Technology"] },
      { id:"fs-u2", unit:2, title:"Hands Help, Hearts Care", grammar:"Modal Verbs (must / have to)", lessons:["The Warm Bread"] },
      { id:"fs-u3", unit:3, title:"Truth Vs. Lies", grammar:"Conditional Sentences" },
      { id:"fs-u4", unit:4, title:"Save and Shine", grammar:"Verbs + infinitive / -ing forms" },
      { id:"fs-u5", unit:5, title:"Using Technology at Schools", grammar:"Countable & Uncountable Nouns" },
      { id:"fs-u6", unit:6, title:"Job Hunting", grammar:"Definite & Indefinite Articles" },
    ],
  },
  {
    stage: "Secondary",
    grade: "Second Secondary",
    curriculum: "Baccalaureate",
    term: "First",
    academicYear: CURRENT_ACADEMIC_YEAR,
    sourceLabel: "Baccalaureate English Part 1",
    units: [
      { id:"bac2-u1", unit:1, title:"Living Well in a Complex World", concept:"Well-being", lessons:["1.1 Social Media and Self-Image","1.2 Exploring Modern Lifestyle","1.3 Whose Responsibility Is It?","1.4 Understanding Mental Health"] },
      { id:"bac2-u2", unit:2, title:"Leisure Time", concept:"Experiences", lessons:["2.1 Screen Time and Young People","2.2 Creative Arts as Leisure Activities","2.3 Sport and Physical Activity as Leisure","2.4 Not Exactly a Relaxing Day"] },
      { id:"bac2-u3", unit:3, title:"Echoes of the Past", concept:"Identity", lessons:["3.1 Sites of Memory","3.2 The Museum as a Storyteller","3.3 The Viral Past","3.4 Social Media and Historical Events"] },
      { id:"bac2-u4", unit:4, title:"The Power of Choice", concept:"Consumption and Choice", lessons:["4.1 Food Waste","4.2 Beyond the Brand","4.3 Digital Consumption","4.4 Black Friday and Sales Culture"] },
      { id:"bac2-u5", unit:5, title:"The Greenhouse Effect", concept:"Sharing the Planet", lessons:["5.1 The Climate Crisis","5.2 Renewable Energy - Powering a Sustainable Future","5.3 Greening Projects in Egypt","5.4 Individual and Collective Actions"] },
    ],
  },
  {
    stage: "Secondary",
    grade: "Third Secondary",
    curriculum: "Ministry",
    term: "First",
    academicYear: CURRENT_ACADEMIC_YEAR,
    sourceLabel: "Ministry English textbook",
    units: [
      { id:"ts-u1", unit:1, title:"Inside the World of Care", grammar:"Present Perfect Simple & Present Perfect Continuous" },
      { id:"ts-u2", unit:2, title:"The Power of Machines", grammar:"Reported Speech — statements & commands" },
      { id:"ts-u3", unit:3, title:"Protect Nature, Protect Future", grammar:"Modal verbs for deduction, regret & blame" },
      { id:"ts-u4", unit:4, title:"Marine Life", grammar:"Compound Adjectives" },
      { id:"ts-u5", unit:5, title:"From Muscles to Mindset", grammar:"Causative verbs — have / get" },
      { id:"ts-u6", unit:6, title:"Let's Hang Out!", grammar:"Reported Questions" },
    ],
  },
  {
    stage: "Preparatory",
    grade: "Third Prep",
    curriculum: "Connect Plus",
    term: "First",
    academicYear: CURRENT_ACADEMIC_YEAR,
    sourceLabel: "Connect Plus track — unit order",
    units: [1,2,3,4,5,6].map(n => ({ id:`tp-u${n}`, unit:n, title:`Unit ${n}` })),
  },
];

export function getCurriculumTrack(stage: string, grade: string, curriculum: string, term: string) {
  return currentCurriculumTracks.find(
    t => t.stage === stage && t.grade === grade && t.curriculum === curriculum && t.term === term
  );
}
