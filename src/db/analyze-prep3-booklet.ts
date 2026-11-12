import { db } from "./index";
import {
  curriculumAnalysisJobs,
  analyzedCurriculumQuestions,
  analyzedCurriculumQuizzes,
  users,
} from "./schema";
import { eq } from "drizzle-orm";
import { ensureDbSetup } from "./migrate-and-seed";
import { executeCurriculumAnalysisPipeline } from "../lib/curriculum-analyzer-engine";

/**
 * Real Document Ingestion Script: Preparatory 3 Curriculum Booklet (Units 1 - 6)
 * Author: Mr. Hossam Riad (مستر حسام رياض)
 * Pages: 1 - 79
 */
export async function ingestPrep3Booklet() {
  await ensureDbSetup();

  // Find or use admin/teacher user
  const adminUsers = await db.select().from(users).where(eq(users.role, "admin"));
  const teacherId = adminUsers[0]?.id || "usr_admin_1";

  console.log("🚀 Starting AI Full Curriculum Analysis for Preparatory 3 Booklet...");

  // Construct structured text corresponding directly to the PDF pages
  const bookletDocumentText = `
[Page 1]
Unit 1: Self-Discovery, Identity & Personal Strength
Vocabulary & Key Words:
• strength: the quality of being physically or mentally strong
• self-discovery: learning more about who you are
• unique: special, one of a kind, opposite of ordinary
• influence: having an effect on someone or something
• honest: always telling the truth
• patient: able to accept delay or problems without becoming annoyed
Grammar: Present Perfect vs Past Simple, Suffixes (-ful, -ness, -ity, -ly)
1 Choose the Correct Answer
1. A/An ............ helps you overcome life's challenges.
(a) Background (b) A belief (c) Strength (d) An opinion
Answer: c

2. So much homework usually makes students feel ............ .
(a) unique (b) useful (c) simple (d) stressed
Answer: d

3. It's Ahmed's first day in a new school and he can't fit ............ easily.
(a) on (b) at (c) in (d) for
Answer: c

4. "............" means learning more about who you are.
(a) Curiosity (b) Self-discovery (c) Value (d) Popular
Answer: b

5. We add the suffix "............" to the verb "use" to get the adjective.
(a) -er (b) -ity (c) -ful (d) -ly
Answer: c

6. Soha had the strength to win the gold medal. The antonym of the word "strength" is "............".
(a) energy (b) confidence (c) weakness (d) activity
Answer: c

7. The coach's bad comment had a ............ effect on the team.
(a) positive (b) negative (c) popular (d) loud
Answer: b

8. When we add the suffix "............" to the adjective "kind", we get the noun.
(a) -ness (b) -ed (c) -ent (d) -ful
Answer: a

9. After practice, she finally had the ............ to speak in front of people.
(a) importance (b) confidence (c) kindness (d) value
Answer: b

10. The word "............" is the opposite of "unique".
(a) useful (b) certain (c) final (d) ordinary
Answer: d

11. Oliver is the main ............ in the story I read yesterday.
(a) reader (b) character (c) listener (d) buyer
Answer: b

12. Identity isn't ............ - it grows and your differences are your power.
(a) fixed (b) stressed (c) popular (d) useful
Answer: a

13. The antonym of the verb "realize" is "............".
(a) misunderstand (b) understand (c) know (d) blame
Answer: a

14. The word "............" means always telling the truth.
(a) curious (b) honest (c) shy (d) nervous
Answer: b

15. We should be ............ with young children when they are learning something difficult.
(a) discouraging (b) fixed (c) patient (d) inspiring
Answer: c

16. Teachers has a big ............ on students' minds.
(a) influence (b) question (c) journey (d) curiosity
Answer: a

[Page 14]
Unit 2: Communication, Relationships & Conflict Resolution
Vocabulary & Key Words:
• misunderstanding: failure to understand correctly
• siblings: brothers and sisters
• resolve: to find a solution to a problem or conflict
• communication: sharing thoughts, feelings, or information
• active: lively and energetic
• respectful: showing care and regard for others
Grammar: Prefixes (mis-, un-, dis-), Past Continuous & Time Clauses
1 Choose the Correct Answer
1. ............ is failure to understand correctly.
(a) Conversation (b) Connection (c) Communication (d) Misunderstanding
Answer: d

2. I have three ............; two brothers and a sister.
(a) thoughts (b) solutions (c) mothers (d) siblings
Answer: d

3. When my brother and I have a conflict, my mother always ............ it.
(a) thinks (b) resolves (c) helps (d) allows
Answer: b

4. The internet ............ was very slow last night.
(a) direction (b) invention (c) connection (d) solution
Answer: c

5. Good ............ helps people understand each other better.
(a) decoration (b) competition (c) communication (d) imagination
Answer: c

6. From my point of ............ , this is a great idea.
(a) review (b) view (c) communication (d) connection
Answer: b

7. Mahmoud was ............ about his mistake and apologized to his teacher.
(a) curious (b) honest (c) interested (d) joyful
Answer: b

8. The manager held a meeting to discuss the new rules. To form the noun of "discuss", add the suffix "............".
(a) -ion (b) -ment (c) -en (d) -ful
Answer: a

9. The boy is very active and likes to play many games. The synonym of "active" is "............".
(a) lively (b) lazy (c) upset (d) thoughtful
Answer: a

10. We must be ............ to our teachers and parents because they help us a lot in life.
(a) lazy (b) upset (c) respected (d) respectful
Answer: d

11. We must take this ............ matter carefully.
(a) calm (b) closer (c) serious (d) honest
Answer: c

12. When we talk ............ person, it is easier to understand each other.
(a) over (b) at (c) on (d) in
Answer: d

13. Listening, being honest, and ............ calm really helps.
(a) staying (b) joining (c) making (d) leaving
Answer: a

14. Yesterday, we saw a terrible ............ on the road while we were going home.
(a) exhibition (b) topic (c) accident (d) title
Answer: c

15. Good drivers always try to ............ driving very fast to keep everyone safe.
(a) avoid (b) realize (c) move (d) prefer
Answer: a

16. The old man has a serious disease. The synonym of "serious" is "............".
(a) calm (b) dangerous (c) incorrect (d) safe
Answer: b

[Page 28]
Unit 3: Technology, Artificial Intelligence & Modern Tools
Vocabulary & Key Words:
• virtual: existing on the internet or computer software
• compose: to create a song or story using imagination
• innovation: invention and improvement of ideas
• robot: a machine that can move and do tasks
• advanced: developed, state-of-the-art
• artificial intelligence: computer systems able to perform human-like tasks
Grammar: Future with will and be going to, Suffix -able / -ive
1 Choose the Correct Answer
1. We talked to our teacher in a/an ............ classroom on the internet.
(a) virtual (b) historical (c) empty (d) ancient
Answer: a

2. You can ............ a song or a story using your imagination.
(a) compose (b) destroy (c) limit (d) behave
Answer: a

3. ............ often begins with a creative idea.
(a) Tradition (b) Innovation (c) Invitation (d) Emotion
Answer: b

4. ............ are jobs or actions that need to be done.
(a) Jokes (b) Tasks (c) Crimes (d) Tusks
Answer: b

5. A ............ is a machine that can move and do tasks.
(a) limit (b) robot (c) sibling (d) partner
Answer: b

6. Some robots are more advanced. The word "advanced" here means "............".
(a) developed (b) lazy (c) silly (d) ancient
Answer: a

7. Ahmed is very ............ . He always finds new ideas to solve problems.
(a) lazy (b) creative (c) rude (d) stupid
Answer: b

8. Artificial Intelligence allows the robot to ............ decisions.
(a) do (b) make (c) put (d) sell
Answer: b

9. A robot can move and ............ tasks.
(a) play (b) dream (c) do (d) dry
Answer: c

10. "Creative" and "imaginative" are ............ .
(a) synonyms (b) antonyms (c) different (d) opposites
Answer: a

11. This TV is very "expensive". The opposite of "expensive" is "............".
(a) costly (b) valuable (c) cheap (d) high-priced
Answer: c

12. ............ are people; men, women, and children.
(a) Humans (b) Behaviors (c) Poems (d) Hopes
Answer: a

13. ............ means invention and improvement.
(a) Diving (b) Innovation (c) Firing (d) Pollution
Answer: b

14. The company developed a/an ............ system to improve communication.
(a) local (b) empty (c) common (d) advanced
Answer: d

15. Smart machines can reduce the time we spend on hard jobs. The word "reduce" means "............".
(a) increase (b) decrease (c) invent (d) allow
Answer: b

16. Some AI programs can ............ art from simple instructions.
(a) do (b) make (c) get (d) take
Answer: b

[Page 42]
Unit 4: Screen Time, Distraction & Digital Balance
Vocabulary & Key Words:
• expert: a person who knows a lot about something
• physical: relating to the body
• distraction: something that stops you from paying attention
• screen time: the time spent looking at digital screens
• notifications: alerts or messages from apps
• scroll: moving through digital content or social media
Grammar: Modals of Advice (should / shouldn't), Conjunctions (Although, Because, While)
1 Choose the Correct Answer
1. A/An ............ is a person who knows a lot about something.
(a) student (b) expert (c) learner (d) beginner
Answer: b

2. Things that are related to the body are called ............ .
(a) social (b) physical (c) mental (d) emotional
Answer: b

3. ............ means something that stops you from paying attention.
(a) Focus (b) Concentration (c) Distraction (d) Quietness
Answer: c

4. ............ means the time spent looking at a screen.
(a) Screen time (b) Balance (c) Entertainment (d) Drought
Answer: a

5. ............ means using technology wisely or being advanced.
(a) Ancient (b) Greedy (c) Smart (d) Delicious
Answer: c

6. To ............ means to move through social media or digital content.
(a) scroll (b) focus (c) limit (d) build
Answer: a

7. ............ means feeling worried or nervous.
(a) Surprised (b) Stressed (c) Weak (d) Dangerous
Answer: b

8. ............ are alerts or messages from social media or digital apps.
(a) Plans (b) Journals (c) Notifications (d) Reports
Answer: c

9. Too much ............ time affects your mental health.
(a) free (b) school (c) screen (d) work
Answer: c

10. Sara wants to be a graphic ............ when she grows up.
(a) designer (b) lawyer (c) dentist (d) athlete
Answer: a

11. Reading books is very ............ because it helps you gain knowledge and understand different cultures.
(a) dangerous (b) useful (c) boring (d) noisy
Answer: b

12. Amazing projects are built with cutting-edge technology. This means with ............ technology.
(a) old (b) ancient (c) bad (d) advanced
Answer: d

13. Stress affects your mental health badly. The word "mental" is related to your ............ .
(a) heart (b) emotions (c) body (d) mind
Answer: d

14. You should be careful about the ............ effects of the medicine to stay safe.
(a) good (b) useful (c) side (d) smart
Answer: c

15. They were ............ after hearing the bad news.
(a) happy (b) calm (c) shocked (d) relaxed
Answer: c

16. Scientists try to ............ dangerous diseases by developing vaccines.
(a) grow (b) create (c) spread (d) control
Answer: d

[Page 56]
Unit 5: Design Thinking, Sprints & Engineering Prototypes
Vocabulary & Key Words:
• prototype: a simple model of a design
• stylish: attractive in a fashionable way
• solution: a way to solve a problem
• schedule: a list of planned activities and times
• ideation: brainstorming and generating ideas
• sprint: a process of solving complex problems in a short time
• buddy: a partner assigned to help someone feel welcome
Grammar: Causatives (have / get), Prefix in- and un-
1 Choose the Correct Answer
1. A ............ is a simple model of a design.
(a) sprint (b) schedule (c) process (d) prototype
Answer: d

2. ............ means attractive in a fashionable way.
(a) Traditional (b) Ancient (c) Crazy (d) Stylish
Answer: d

3. A ............ is a way to solve a problem.
(a) dream (b) solution (c) design (d) hobby
Answer: b

4. A ............ is a list of planned activities.
(a) menu (b) recipe (c) ticket (d) schedule
Answer: d

5. ............ means brainstorming or coming up with ideas.
(a) Imagination (b) Pollution (c) Ideation (d) Migration
Answer: c

6. ............ is a process of solving complex problems in a short time.
(a) Prototype (b) Sprint (c) Ideation (d) Thinking
Answer: b

7. ............ is a partner assigned to help someone feel welcome.
(a) Model (b) Buddy (c) Head (d) Colleague
Answer: b

8. ............ means as good as possible; ideal.
(a) Perfect (b) Wrong (c) Negative (d) Lazy
Answer: a

9. A/An ............ is a series of steps or actions taken to achieve something.
(a) flight (b) drone (c) process (d) advertisement
Answer: c

10. The word "practical" means "............".
(a) hard (b) effective (c) imaginative (d) unreal
Answer: b

11. The synonym of "safety" is "............".
(a) pain (b) harm (c) security (d) danger
Answer: c

12. "Disinterest" is the antonym of "............".
(a) difficulty (b) curiosity (c) function (d) view
Answer: b

13. The suffix "-ish" turns the word "style" into a/an ............ .
(a) adjective (b) verb (c) noun (d) preposition
Answer: a

14. The suffix "-er" forms the ............ from the word "design".
(a) adverb (b) adjective (c) verb (d) noun
Answer: d

15. The word "greet" has the same meaning as "............".
(a) quit (b) leave (c) see off (d) welcome
Answer: d

16. The synonym of the word "nervous" is "............".
(a) relaxed (b) welcomed (c) worried (d) tired
Answer: c

[Page 69]
Unit 6: Moral Values, Empathy & Narrative Storytelling
Vocabulary & Key Words:
• moral: concerned with the principles of right and wrong
• conflicts: serious disagreements or arguments
• spark: to start or cause something to happen
• empathy: ability to understand and share someone else's feelings
• aware: knowing or noticing something
• various: many different kinds or types
Grammar: Reported Speech, Relative Pronouns (who, which, whose)
1 Choose the Correct Answer
1. Students should learn ............ values such as respect and kindness.
(a) moral (b) problem (c) digital (d) medical
Answer: a

2. Good communication can help solve ............ between friends.
(a) benefits (b) conflicts (c) stories (d) hobbies
Answer: b

3. Stories can ............ our imagination and make learning more enjoyable.
(a) stop (b) spark (c) reduce (d) end
Answer: b

4. His teacher gave him some ............ on how to be a better speaker.
(a) arguments (b) invitations (c) recommendations (d) predictions
Answer: c

5. ............ means knowing or noticing something.
(a) Aware (b) Asleep (c) Silly (d) Unaware
Answer: a

6. ............ means the ability to understand and share someone else's feeling.
(a) Creation (b) Empathy (c) Hesitation (d) Evil
Answer: b

7. ............ means to start or cause something to happen.
(a) Spark (b) Damage (c) Stop (d) Hurt
Answer: a

8. ............ means many different kinds or types; many and not the same.
(a) Typical (b) Similar (c) Alone (d) Various
Answer: d

9. The children have ............ types of toys. They have many types of them.
(a) awful (b) new (c) empty (d) various
Answer: d

10. Reading stories is a powerful way to become wiser. "Powerful" here means "............".
(a) useless (b) ineffective (c) unimportant (d) effective
Answer: d

11. Nadia listened carefully when her sister was sad. Nadia showed ............ .
(a) imagination (b) doubt (c) empathy (d) journey
Answer: c

12. She didn't lie about her mistakes. This means that she spoke ............ .
(a) unkindly (b) honestly (c) lazily (d) negatively
Answer: b

13. In a story, characters can ............ conflicts or make decisions.
(a) solve (b) dry (c) mix (d) draw
Answer: a

14. What helped Ali ............ calm during the debate?
(a) make (b) give (c) go (d) stay
Answer: d

15. My doctor told me to ............ a breath and relax.
(a) have (b) take (c) do (d) bring
Answer: b

16. The opposite of fair is "............".
(a) unfair (b) confident (c) practical (d) determined
Answer: a
`;

  const jobId = `job_prep3_hossam_${Date.now()}`;

  // 1. Create Job record in PostgreSQL
  await db.insert(curriculumAnalysisJobs).values({
    id: jobId,
    teacherId,
    fileName: "Prep_3_Exercise_on_Units_1_to_6_Hossam_Riad.pdf",
    fileType: "pdf",
    fileSize: bookletDocumentText.length * 2,
    gradeCode: "prep_3",
    stage: "Preparatory",
    term: "First",
    status: "extracting_text",
    currentStep: "Analyzing Preparatory 3 Curriculum Units 1-6",
    progressPercent: 20,
    questionsPerLesson: 20,
    checkpointData: {},
    summaryReport: {},
  });

  // 2. Execute pipeline
  const pipelineResult = await executeCurriculumAnalysisPipeline({
    jobId,
    bufferOrText: bookletDocumentText,
    fileType: "txt",
    fileName: "Prep_3_Exercise_on_Units_1_to_6_Hossam_Riad.pdf",
    questionsPerLesson: 20,
  });

  const cp = pipelineResult.checkpoint;
  const summary = pipelineResult.summary;

  // 3. Batch insert questions staged pending teacher approval
  const allQuestions = [...(cp.originalQuestions || []), ...(cp.generatedQuestions || [])];
  console.log(`📝 Inserting ${allQuestions.length} staged questions (${summary.totalOriginalQuestions} original, ${summary.totalAiQuestions} AI-generated)...`);

  const chunkSize = 50;
  for (let i = 0; i < allQuestions.length; i += chunkSize) {
    const chunk = allQuestions.slice(i, i + chunkSize);
    await db.insert(analyzedCurriculumQuestions).values(
      chunk.map((q) => ({
        id: q.id,
        jobId,
        sourceType: q.sourceType,
        pageNumber: q.pageNumber,
        unitNumber: q.unitNumber,
        unitTitle: q.unitTitle,
        lessonTitle: q.lessonTitle,
        sectionType: q.sectionType,
        questionText: q.questionText,
        questionType: q.questionType,
        options: q.options,
        correctAnswer: q.correctAnswer,
        explanation: q.explanation,
        difficulty: q.difficulty,
        sourceReference: q.sourceReference,
        approvalStatus: "pending",
        isPublished: false,
      }))
    );
  }

  // 4. Batch insert assembled quizzes
  const allQuizzes = cp.quizzes || [];
  console.log(`🏆 Inserting ${allQuizzes.length} staged automated quizzes...`);
  if (allQuizzes.length > 0) {
    await db.insert(analyzedCurriculumQuizzes).values(
      allQuizzes.map((qz) => ({
        id: qz.id,
        jobId,
        quizType: qz.quizType,
        titleAr: qz.titleAr,
        titleEn: qz.titleEn,
        unitNumber: qz.unitNumber,
        unitsCovered: qz.unitsCovered,
        lessonTitle: qz.lessonTitle,
        questionIds: qz.questionIds,
        durationMinutes: qz.durationMinutes,
        passPercentage: qz.passPercentage,
        totalPoints: qz.totalPoints,
        approvalStatus: "pending",
        isPublished: false,
      }))
    );
  }

  // 5. Update job to completed
  await db
    .update(curriculumAnalysisJobs)
    .set({
      status: "completed",
      currentStep: "Analysis Completed Successfully",
      progressPercent: 100,
      checkpointData: {
        unitsCount: (cp.units || []).length,
        units: cp.units,
        warnings: cp.warnings,
      },
      summaryReport: summary,
      updatedAt: new Date(),
    })
    .where(eq(curriculumAnalysisJobs.id, jobId));

  console.log("✅ Analysis complete! Summary Report:", JSON.stringify(summary, null, 2));
  return { jobId, summary, units: cp.units };
}

// Direct execution when invoked via tsx/node
if (process.argv[1]?.includes("analyze-prep3-booklet")) {
  ingestPrep3Booklet()
    .then((r) => {
      console.log(`🎉 Finished successfully. Job ID: ${r.jobId}`);
      process.exit(0);
    })
    .catch((err) => {
      console.error("❌ Ingestion error:", err);
      process.exit(1);
    });
}
