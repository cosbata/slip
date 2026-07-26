import { config } from 'dotenv'
config({ path: '.env.local' })
import postgres from 'postgres'
import { randomUUID } from 'crypto'

const COMMENTER_USERNAMES = [
  'silent_reader_throws', 'another_loop_survivor', 'ml_eng_agree',
  'infra_adjacent', 'yoe_8_lurker', 'east_coast_reject', 'senior_ic_note',
  'been_there_2022', 'three_loops_later', 'staff_at_startup_now',
  'oa_anxiety_anon', 'recruiter_side_eye', 'leet_grinder_99',
  'l5_limbo', 'offer_rescinded_club', 'bootcamp_grad_wave',
  'pm_to_swe_fail', 'nda_throwaway_123', 'second_attempt_anon',
  'passed_bar_no_seat',
]

// Comments keyed by post ID (assigned after fetching)
// Each entry: [postId, comment text, commenterIndex]
type CommentSpec = { postId: string; body: string; userIndex: number }

function makeComments(posts: { id: string; title: string; slug: string }[]): CommentSpec[] {
  const out: CommentSpec[] = []

  function add(id: string, body: string, userIndex: number) {
    out.push({ postId: id, body, userIndex: userIndex % COMMENTER_USERNAMES.length })
  }

  function byTitle(title: string) {
    return posts.find(p => p.title.includes(title))
  }

  // ── GOOGLE ──
  const gGraph = byTitle('Four rounds, one No Hire on a graph problem')
  if (gGraph) {
    add(gGraph.id, 'The hint-ignoring trap is real. I did the same thing on a DP problem — recognized it too late. The floor mentality at Google is brutal.', 0)
    add(gGraph.id, 'Optimal beats working is such a Google-specific thing. At every other company I have interviewed at, working with a clear explanation was fine. Reapply in 6 months.', 1)
    add(gGraph.id, '"State the brute force, name the inefficiency, then optimize" — I am writing this on a sticky note. Thank you.', 2)
  }

  const gTeamMatch = byTitle('Three Strong Hires, made it to team matching')
  if (gTeamMatch) {
    add(gTeamMatch.id, 'Team matching evaporating is the worst version of this. You passed the hard part and lost at the administrative part. Genuinely brutal.', 3)
    add(gTeamMatch.id, 'The Googlyness signal is so underweighted in prep resources. Appreciate you flagging it — going into my next loop assuming it counts as much as the coding rounds.', 4)
  }

  const gTwoPointer = byTitle('Overcomplicated a two-pointer problem and ignored the hint')
  if (gTwoPointer) {
    add(gTwoPointer.id, 'The hint-ignoring is so relatable. I anchored on my own approach at Uber and the exact same thing happened. Once you invest in a design it is hard to let go.', 5)
    add(gTwoPointer.id, 'Restating the hint out loud is the move. It forces you to actually process it instead of just acknowledging and continuing. Will use this.', 6)
  }

  const gML = byTitle('Aced the DSA rounds, then answered ML questions like an engineer')
  if (gML) {
    add(gML.id, 'This is the exact thing that happened to me at a different AI company. Every answer I gave was correct in the ML sense and beside the point in the product sense.', 7)
    add(gML.id, '"Is the model good enough" is never a metrics question — this is going in my prep notes immediately.', 8)
  }

  const gNoCode = byTitle('No working code on the graph round, and communication flagged')
  if (gNoCode) {
    add(gNoCode.id, 'Communication as the channel for technical signal — that framing is really useful. If the channel is noisy the interviewer fills in the gaps with doubt.', 9)
    add(gNoCode.id, 'Narrating your plan clearly lets the interviewer help you. I learned this the hard way too. Appreciate you sharing this.', 10)
  }

  const gEligibility = byTitle('Got the personalized "you passed our screen" email')
  if (gEligibility) {
    add(gEligibility.id, 'The "not yet, not this role, not this timeline" reframe is genuinely good. Rejection is data, not destiny — keeping this.', 11)
    add(gEligibility.id, 'A personalized email followed immediately by an eligibility reject is a specific kind of cruel. At least you know the resume was strong enough.', 12)
  }

  // ── AMAZON ──
  const amzNoReason = byTitle('Passed every round I could see, rejected with no reason five days later')
  if (amzNoReason) {
    add(amzNoReason.id, 'Same outcome. LP stories without numbers read as fluff at senior level. Going back and adding metrics to every story I have.', 13)
    add(amzNoReason.id, 'Five days and then nothing — the lack of reason is its own kind of feedback. Did you push the recruiter for specifics?', 14)
    add(amzNoReason.id, 'Every LP story gets a number. Impact without measurement is just a story. This is the most actionable thing I have read this week.', 15)
  }

  const amzDesign = byTitle('Told my system design was weak — the one round I thought I crushed')
  if (amzDesign) {
    add(amzDesign.id, '"That felt great is a flag to interrogate" — I am going to think about this for a while. My self-assessment after interviews is clearly not calibrated.', 0)
    add(amzDesign.id, 'Breadth over depth is such a common trap in system design. Touching everything and sounding fluent hides whether you actually understand the hard tradeoffs.', 1)
  }

  const amzBlank = byTitle('Knew every single problem and still went completely blank on implementation')
  if (amzBlank) {
    add(amzBlank.id, 'Recognition without implementation practice is the exact failure mode I hit at Meta. Empty files, no templates, timer running — that is the only fix.', 2)
    add(amzBlank.id, 'This is the most honest post I have seen on here. Memorizing solutions is not the same as building the muscle. Reapply in 6 months.', 3)
  }

  const amzSatisfied = byTitle('Three rounds, every interviewer seemed satisfied')
  if (amzSatisfied) {
    add(amzSatisfied.id, '"Hope wearing information\'s clothes" — this is a perfect description of the feeling after an interview goes well.', 4)
    add(amzSatisfied.id, 'Satisfied-looking interviewers are not a scorecard. I have to internalize this. The gap between their face and the decision is real.', 5)
  }

  const amzRecycled = byTitle('"Moving forward with other candidates" — recycled, not rejected')
  if (amzRecycled) {
    add(amzRecycled.id, 'The "recycled not rejected" distinction is real and meaningful. Passed the bar, lost the seat. That is a very different starting point for the next attempt.', 6)
    add(amzRecycled.id, 'The other-team conversations evaporating quietly is the part that is hard to process. They said there were options and then there were not.', 7)
  }

  // ── META ──
  const metaBothNoHire = byTitle('Both coding rounds came back No Hire')
  if (metaBothNoHire) {
    add(metaBothNoHire.id, 'Recording yourself solving problems out loud is underrated advice. The gap between what you think you are communicating and what comes out is sometimes enormous.', 8)
    add(metaBothNoHire.id, 'The miscalibration problem is scary because you cannot feel it. You need external signal — mocks, recordings, something.', 9)
  }

  const metaSupplemental = byTitle('Crushed the middle of the loop, then the surprise supplemental round buried me')
  if (metaSupplemental) {
    add(metaSupplemental.id, 'Full five-problem mock days — this is the right call. Interview days are endurance events and you can only train for them by doing the full distance.', 10)
    add(metaSupplemental.id, 'The fatigue factor is real and nobody talks about it. Your performance on round five is not the same as round one. This is why the supplemental round exists.', 11)
    add(metaSupplemental.id, 'Did you know going in that there might be a supplemental? Or was that a surprise on the day?', 12)
  }

  const metaBehavioral = byTitle('My coding was fine. The behavioral rapid-fire is what actually sank me')
  if (metaBehavioral) {
    add(metaBehavioral.id, 'A matrix of conflict, failure, leadership, ambiguity with three recent examples per category — I am building this now. Appreciate the specifics.', 13)
    add(metaBehavioral.id, 'Running out of material at the third prompt is the exact thing that happens when you only prep your greatest hits. The format demands depth.', 14)
  }

  // ── APPLE ──
  const appleComp = byTitle('Passed all six rounds, talked comp, then they selected another candidate')
  if (appleComp) {
    add(appleComp.id, 'Get the level and band pinned before stating a number — this is something I have never heard said explicitly before. Really useful.', 15)
    add(appleComp.id, 'The role being reposted the next day is rough. The whole thing was probably decided before your call happened.', 0)
  }

  const appleFit = byTitle('"Technically fine, fit unconvincing"')
  if (appleFit) {
    add(appleFit.id, '"I love performance work" is exactly the kind of answer I have given. Interchangeable answers to specific teams is something I need to fix before my next onsite.', 1)
    add(appleFit.id, 'Researching the actual team — their talks, releases, public problems — is the right move. Hiring managers can tell immediately when you have done the work.', 2)
  }

  // ── STRIPE ──
  const stripeFollowUps = byTitle('Solved the problem and one follow-up — at Stripe that is not enough')
  if (stripeFollowUps) {
    add(stripeFollowUps.id, 'Correct-but-slow reads as incomplete at Stripe — I learned this the hard way too. The follow-ups are not bonus, they are the bar.', 3)
    add(stripeFollowUps.id, 'The velocity + extensibility combination is what makes Stripe prep different. You have to architect the base so extending it later is fast.', 4)
  }

  const stripeNewGrad = byTitle('New grad, solved 2 of 3 in time')
  if (stripeNewGrad) {
    add(stripeNewGrad.id, '"Leave yourself room for the next part" is such a different optimization target than "make this part perfect." Multi-part practice is essential here.', 5)
    add(stripeNewGrad.id, 'The stacked problem format is brutal because each part depends on the last. If you over-engineer part one, part two is harder to extend. Good luck on the retry.', 6)
  }

  const stripeBugSquash = byTitle('Made it to the Bug Squash round and got lost in a huge unfamiliar codebase')
  if (stripeBugSquash) {
    add(stripeBugSquash.id, 'Practicing on real open-source repos for the Bug Squash is the right call. That round is not about algorithm knowledge — it is about codebase navigation.', 7)
    add(stripeBugSquash.id, 'The Bug Squash round catches people who only prep on blank-file problems. Navigating unfamiliar code under pressure is a completely separate skill.', 8)
  }

  // ── NETFLIX ──
  const netflixNoReturn = byTitle('Five months in, no return offer')
  if (netflixNoReturn) {
    add(netflixNoReturn.id, 'The "mid-level bar from day one" thing is not obvious from the outside. Appreciate you making it explicit. Five months stretching toward that bar is still real growth.', 9)
    add(netflixNoReturn.id, 'Did they give you specific feedback on what to improve before reapplying? Or just the bar framing?', 10)
  }

  const netflixIC = byTitle('Rejected from a senior IC role because I have managed before')
  if (netflixIC) {
    add(netflixIC.id, 'Address the management background head-on before the HM invents the objection — this is really good advice. Better to pre-empt it than wait to rebut it.', 11)
    add(netflixIC.id, 'The logic that management experience disqualifies you from IC is backwards. Frustrating that it played out this way.', 12)
  }

  // ── MICROSOFT ──
  const msftAA = byTitle('Passed every round at Microsoft, then the AA round buried me on system design')
  if (msftAA) {
    add(msftAA.id, 'System design depth is not a vibe — it is drilling failure modes, capacity math, and tradeoffs. Exactly right. The AA round goes five whys deep.', 13)
    add(msftAA.id, 'The AA round being the one that matters most makes the earlier rounds feel like qualifiers. It is rough that you cleared all of them and hit the wall there.', 14)
  }

  const msftInformal = byTitle('Got an informal offer at Microsoft Redmond, then a rejection')
  if (msftInformal) {
    add(msftInformal.id, '"There is no such thing as an intro call" — this applies everywhere. I have made this mistake at multiple companies.', 15)
    add(msftInformal.id, 'The comp discussion followed by a rejection is genuinely awful. That sequence should not happen to anyone.', 0)
  }

  const msftBST = byTitle('Three great onsite rounds at Microsoft, one botched data structure')
  if (msftBST) {
    add(msftBST.id, 'The loop is not averaged. A single round where you visibly struggle on fundamentals can outweigh three where you shine. I had to learn this the hard way too.', 1)
    add(msftBST.id, 'Hand-writing a BST from scratch — I had not done this in months before my interview either. Adding it to the rotation now.', 2)
  }

  const msftProject = byTitle('I solved the coding problem at Microsoft but could not explain my own past project')
  if (msftProject) {
    add(msftProject.id, 'Building the thing is only half. Being able to defend it under interrogation is the other half. This is a great framing.', 3)
    add(msftProject.id, 'Practicing explaining past projects out loud with the decisions and tradeoffs — I have never done this systematically. Doing it this week.', 4)
  }

  // ── AIRBNB ──
  const airbnbBlackBox = byTitle('Airbnb told me I did well, then went with someone else')
  if (airbnbBlackBox) {
    add(airbnbBlackBox.id, 'State your assumptions out loud and lock them in early — "stop me if that is wrong." This is the right move for any interviewer who stays silent.', 5)
    add(airbnbBlackBox.id, 'The late redirect costing you all your remaining time is a process failure on their side. That should have come in the first 10 minutes.', 6)
  }

  const airbnbBehavioral = byTitle('Passed Airbnb coding and system design — sunk by a behavioral round I still disagree with')
  if (airbnbBehavioral) {
    add(airbnbBehavioral.id, 'Own your share first, frame others charitably — even when you are right and they were difficult. The perception of how you talk about coworkers matters more than the facts.', 7)
    add(airbnbBehavioral.id, 'Passing the hard rounds and losing on the behavioral is frustrating. The Code Review time trap sounds like a structural problem with the format.', 8)
  }

  // ── SHOPIFY ──
  const shopifyProd = byTitle('Shopify does not grade LeetCode — they grade whether your code is production-ready')
  if (shopifyProd) {
    add(shopifyProd.id, 'The "is this production-ready" question being the actual rubric, stated out loud — and then losing on it — is rough. They told you exactly what they were grading.', 9)
    add(shopifyProd.id, 'Writing clean, maintainable code under time pressure is a different muscle from solving the problem. Shopify is testing the former and people prep for the latter.', 10)
  }

  const shopifyEarly = byTitle('Crushed Shopify coding challenge, finished 20 minutes early')
  if (shopifyEarly) {
    add(shopifyEarly.id, 'Sometimes you do everything right and it still ends, and you have to be okay closing that tab without an answer. This is the most honest thing on here today.', 11)
    add(shopifyEarly.id, 'Headcount or a stronger candidate the same day — you will never know. That not-knowing is worse than an actionable rejection.', 12)
  }

  const shopifyDSA = byTitle('Shopify called it a real-world implementation problem — it was DSA and I was not ready')
  if (shopifyDSA) {
    add(shopifyDSA.id, '"Practical" and "real-world" mean wildly different things at different companies. Prep for the worst-case format, not the comfortable one you were promised. Good advice.', 13)
    add(shopifyDSA.id, 'The recruiter description setting your prep strategy is a real risk. Always research independently from recent candidate reports.', 14)
  }

  // ── FIGMA ──
  const figmaLong = byTitle('Two months and 8 hours of interviews at Figma')
  if (figmaLong) {
    add(figmaLong.id, 'A long inefficient process does not owe you a legible reason — brutal but true. The gap between "strong enough for you" and "strong enough for them" is real.', 15)
    add(figmaLong.id, 'Eight hours of interviews over two months and then the interviewer no-shows. That is a signal about how they run their process generally.', 0)
  }

  const figmaPair = byTitle('Fun pair-programming round at Figma — but I did not finish part one')
  if (figmaPair) {
    add(figmaPair.id, 'Finish part one completely before reaching for anything fancy. This applies to every staged coding exercise. Good luck on the next attempt.', 1)
    add(figmaPair.id, 'The pair-programming format being enjoyable and still resulting in a reject is a good reminder that it is not graded on vibes.', 2)
  }

  // ── LINKEDIN ──
  const liHints = byTitle('Solved both coding problems in under an hour. Rejected. Then told I needed lots of hints.')
  if (liHints) {
    add(liHints.id, 'Write down what actually happened the same day — this is essential advice. Feedback that does not match reality is not useful and can be actively harmful.', 3)
    add(liHints.id, 'Feedback that is provably disconnected from what happened in the room stops being feedback and starts being a cover story. Frustrating.', 4)
  }

  const liGhosted = byTitle('Ghosted for two weeks after 5 onsite rounds')
  if (liGhosted) {
    add(liGhosted.id, 'Get the recruiter direct contact and a rough timeline in writing before the onsite. When the ghosting starts, you at least know who to escalate to.', 5)
    add(liGhosted.id, 'Five rounds of someone\'s time earns you a response. The fact that you had to go around to a different recruiter is embarrassing on their side.', 6)
    add(liGhosted.id, 'The generic template rejection after five rounds is worse than a phone call. I have been there.', 7)
  }

  const liExperience = byTitle('Infrastructure SWE: passed every round, rejected for "slightly more experience"')
  if (liExperience) {
    add(liExperience.id, '"Slightly more experience" being word-for-word identical to multiple candidates is a mail merge field, not feedback. You identified this correctly.', 8)
    add(liExperience.id, 'Passing every round and being unforgettable in none — that is the real gap. Going one layer deeper than asked is the fix. Appreciate this.', 9)
  }

  // ── UBER ──
  const uberLLD = byTitle('Backend loop: nailed three coding rounds, then burned my LLD round talking instead of typing')
  if (uberLLD) {
    add(uberLLD.id, 'Hard-cap design talk at the halfway mark and force yourself into the editor. I had the same problem at a different company — the discussion is the fun part and the deliverable is what matters.', 10)
    add(uberLLD.id, 'A beautiful design you did not code is worth less than an okay design that runs. This is painful but accurate.', 11)
  }

  const uberKafka = byTitle('Senior SWE: drew a clean Kafka pipeline, rejected for not defending the trade-offs deeply enough')
  if (uberKafka) {
    add(uberKafka.id, 'System design is about defending choices, not just drawing boxes. At senior level the diagram is table stakes and the interview is the five-whys on every decision.', 12)
    add(uberKafka.id, 'Why Kafka over a simpler queue — this is the question that gets everyone at senior level. The answer has to be grounded in the specific constraints, not "Kafka is what you use for streaming."', 13)
  }

  // ── DATADOG ──
  const datadogOneVeto = byTitle('Made it through the full onsite — one interviewer was not satisfied and that was the whole ballgame')
  if (datadogOneVeto) {
    add(datadogOneVeto.id, 'Treat every single round as the one that could end it, because it is. Three enthusiastic yeses do not outvote one firm no at a lot of companies.', 14)
    add(datadogOneVeto.id, 'The recruiter saying they were fighting for you is both kind and haunting. Not knowing which round it was is its own thing.', 15)
  }

  const datadogMismatch = byTitle('Behavioral interviewer kept cutting me off. Tech interviewer quizzed a backend hire on frontend JS trivia.')
  if (datadogMismatch) {
    add(datadogMismatch.id, '"Is the frontend focus intentional?" is exactly the right question to ask. A respectful clarifying question reframes the room without being confrontational.', 0)
    add(datadogMismatch.id, 'Being passive when the interview goes off-script is a mistake I have made too. You can redirect without being combative.', 1)
  }

  const datadogTwoParts = byTitle('The CoderPad exercise had two parts. Nobody told me.')
  if (datadogTwoParts) {
    add(datadogTwoParts.id, 'Before you write a single line, ask how the exercise is structured. Ten seconds of asking would have saved this whole loop. Adding this to my pre-interview checklist.', 2)
    add(datadogTwoParts.id, 'An information gap not a skill gap — and it was completely avoidable. That is the most frustrating kind of rejection.', 3)
    add(datadogTwoParts.id, 'Did you raise this with the recruiter afterward? Seems like a process failure on their side.', 4)
  }

  // ── OPENAI ──
  const openaiEasy = byTitle('Every onsite round felt easy. I got rejected anyway')
  if (openaiEasy) {
    add(openaiEasy.id, 'Smooth answers can still be unremarkable ones. "I solved everything" is not the same as "I cleared the bar" — this is such a hard thing to internalize.', 5)
    add(openaiEasy.id, 'Getting ghosted on a feedback request after a full onsite is its own kind of disrespect.', 6)
  }

  const openaiChat = byTitle('AI companies make you design the systems they actually run')
  if (openaiChat) {
    add(openaiChat.id, 'Study the systems they themselves run — not generic system design. This is specific and actionable. Streaming pipelines and token-level latency are a different prep track.', 7)
    add(openaiChat.id, 'The chat app prompt being "uncomfortably close to the real product" is exactly why it catches people. Interviewers live in that system every day.', 8)
  }

  const openaiOA = byTitle('OA was multi-part and I did not finish the second section')
  if (openaiOA) {
    add(openaiOA.id, 'Read the entire assessment before you start coding. Completeness beats polish when the rubric is "did you finish all of it." Lesson learned the same way.', 9)
    add(openaiOA.id, 'Multi-part OAs are a pacing problem more than a knowledge problem. Getting to "working" on every section before refining any of them is the right strategy.', 10)
  }

  // ── COINBASE ──
  const coinbaseExt = byTitle('New grad backend: ran out of time on the second extension and got cut')
  if (coinbaseExt) {
    add(coinbaseExt.id, 'Execution round means execution — a described solution is not a completed one. Painful lesson but accurately diagnosed.', 11)
    add(coinbaseExt.id, 'Cutting the explanation short on the first extension to bank time for the second is hard to do in the moment when the explanation is going well.', 12)
  }

  const coinbasePhoneScreen = byTitle('Thought I nailed the DSA phone screen — the next call never came')
  if (coinbasePhoneScreen) {
    add(coinbasePhoneScreen.id, 'Silent phone-screen rejections are the hardest because you genuinely cannot tell if you were slower, less clean, or just unlucky against another candidate that day.', 13)
    add(coinbasePhoneScreen.id, 'Correct and clearly explained can still lose to a hair faster. There is no feedback surface to optimize against.', 14)
  }

  // ── BYTEDANCE ──
  const bdHudi = byTitle('One shallow answer on big data tech and the data infrastructure loop ended that day')
  if (bdHudi) {
    add(bdHudi.id, 'Every technology on your resume is fair game for a depth probe. One tool you only half-know can outweigh a clean algorithm round. Updating my resume right now.', 15)
    add(bdHudi.id, 'The depth probe on Hudi specifically — they care about the tools they actually use. Good to know for anyone targeting data infrastructure roles.', 0)
  }

  const bdFormat = byTitle('HR said regular technical — it was system design heavy')
  if (bdFormat) {
    add(bdFormat.id, 'Always research the actual format independently. "Regular technical" means completely different things at different companies and even different teams.', 1)
    add(bdFormat.id, 'Trusting a vague recruiter description cost you weeks of prep aimed at the wrong target. This is a systems failure you had to pay for personally.', 2)
  }

  // ── PALANTIR ──
  const palantirLearning = byTitle('New grad: reached task 3 of the Learning round')
  if (palantirLearning) {
    add(palantirLearning.id, 'The Learning round testing adaptability not knowledge — this is a framing I have not seen before. It makes the prep strategy completely different.', 3)
    add(palantirLearning.id, '"No position matching your skillset" with no actual feedback is a hollow rejection. Appreciate you describing the round in detail.', 4)
  }

  const palantirDepth = byTitle('Onsite day: passed the coding but did not flesh out the answer enough')
  if (palantirDepth) {
    add(palantirDepth.id, 'Treating "it works and it is optimal" as the prompt for a deeper discussion rather than the end of one — Palantir is explicit about wanting this. Good to know going in.', 5)
    add(palantirDepth.id, 'Enumerating alternatives you rejected and why, discussing tradeoffs, failure modes — this is just good engineering communication in general. They formalize it.', 6)
  }

  // ── GITHUB ──
  const githubHC = byTitle('Six rounds, six Hire ratings — the hiring committee said no anyway')
  if (githubHC) {
    add(githubHC.id, 'Six hires from six interviewers and a committee no — this is the outcome that breaks your calibration model entirely. You can run the table and lose.', 7)
    add(githubHC.id, 'Strong per-round signals do not guarantee an offer when there is headcount pressure or a stronger batch. The committee is a separate gate.', 8)
    add(githubHC.id, 'Six Hire ratings and still rejected. Did they give any signal on where in the process the decision was made?', 9)
  }

  const githubRedo = byTitle('Did really well on the Karat redo — they judged me on the first one anyway')
  if (githubRedo) {
    add(githubRedo.id, 'Redo policies may not override the first impression — treating the redo as the real evaluation when it was possibly a formality. This is important to flag.', 10)
    add(githubRedo.id, 'If the first interview is going to be the deciding signal regardless, why offer the redo? That is a legitimate question and I do not have a good answer.', 11)
  }

  // ── DOORDASH ──
  const ddLunch = byTitle('System design interview where the interviewer ate lunch the entire time')
  if (ddLunch) {
    add(ddLunch.id, 'The interview is the best behavior a company will ever show you. If this is the best behavior, the rest of the experience will be worse. That framing is exactly right.', 12)
    add(ddLunch.id, 'I would not have been able to keep my composure in that room. Respect for getting through the whole thing.', 13)
  }

  const ddCanceled = byTitle('Recruiter called it after the system design round and canceled my remaining interviews')
  if (ddCanceled) {
    add(ddCanceled.id, 'Reading the interruptions as a redirect signal and compressing hard instead of being thorough — this is the in-the-moment read that is so hard to make.', 14)
    add(ddCanceled.id, 'The recruiter canceling remaining rounds mid-day is a rough experience. Did you get any feedback on which specific part of the schema caused the problem?', 15)
  }

  // ── NOTION ──
  const notionSix = byTitle('Six rounds of positive feedback, then a mystery rejection on the final UI exercise')
  if (notionSix) {
    add(notionSix.id, 'Stop reading the room as the verdict. The in-room guidance and the actual scoring are two different things and this story makes that concrete.', 0)
    add(notionSix.id, 'They told you to stop doing more, you complied, and then "not strong enough." That is an impossible standard to optimize against.', 1)
  }

  const notionHint = byTitle('No Hire after I defended my solution instead of exploring the interviewer hint')
  if (notionHint) {
    add(notionHint.id, 'When an interviewer offers an alternative approach that is not small talk — it is a lifeline. Defending your solution feels like confidence and reads as rigidity.', 2)
    add(notionHint.id, 'This is the same trap as the Google two-pointer story. The hint is the most valuable signal in the room. Dropping your ego and pivoting is the right move every time.', 3)
  }

  // ── DATABRICKS ──
  const dbOOD = byTitle('New grad loop ended on an OOD/LLD round I had no idea was Amazon-style')
  if (dbOOD) {
    add(dbOOD.id, 'Databricks coding round is OOD/LLD — I had no idea either until reading this. Changing my prep approach for this company immediately.', 4)
    add(dbOOD.id, 'The format mismatch is the most fixable version of a rejection. If you had known, you would have prepped. That is a recruiter communication failure.', 5)
  }

  const dbPositive = byTitle('Interviewers said I solved every problem correctly, then rejected me to improve technical skills')
  if (dbPositive) {
    add(dbPositive.id, 'In-room positivity and the hiring decision are two completely separate processes. Interviewers are nice because it produces better signal. The verdict is written up afterward.', 6)
    add(dbPositive.id, '"Improve your technical skills" after "nice, that is the optimal solution" from the same interviewers is genuinely incoherent feedback.', 7)
    add(dbPositive.id, 'Four weeks instead of two for the decision — that delay alone usually means the news is not good. Did they give you anything more specific than "technical skills"?', 8)
  }

  // ── RAMP ──
  const rampGmail = byTitle('Coding interview delivered through Gmail while I navigated Calendar live on Zoom')
  if (rampGmail) {
    add(rampGmail.id, 'The format surprise alone can cost you the first ten minutes. Knowing they use production tools as the interview environment is genuinely useful information.', 9)
    add(rampGmail.id, 'Fintech startups using production-tool-based assessments makes sense when you think about it — they are literally testing whether you can work in the tools the job uses.', 10)
  }

  // ── BREX ──
  const brexFeedback = byTitle('Solved every phone-screen problem in time, rejected with zero feedback at a non-LeetCode company')
  if (brexFeedback) {
    add(brexFeedback.id, 'At a non-LeetCode company, "did I get the answer" is not the scorecard. The real evaluation is on dimensions you did not know were being graded. This is so useful to understand going in.', 11)
    add(brexFeedback.id, 'Zero feedback at a company that does not do LeetCode means you have no surface area to optimize against. That is genuinely a difficult position.', 12)
  }

  // ── YC ──
  const ycDrafts = byTitle('W25 rejection after 5 drafts and 6 weeks — even strong founder referrals did not save it')
  if (ycDrafts) {
    add(ycDrafts.id, 'YC wants problems you have already solved, not problems you are figuring out — this is such a clean articulation of what the application is actually asking for.', 13)
    add(ycDrafts.id, 'Clarity over cleverness, evidence over vision, solved-it over solving-it. Saving this for the next application cycle.', 14)
    add(ycDrafts.id, 'Did the YC alumni referrals give you any feedback on what the application was missing? Curious if they could see the gap.', 15)
  }

  const ycFirst = byTitle('First YC rejection (S25): four concrete lessons beat one vague disappointment')
  if (ycFirst) {
    add(ycFirst.id, 'Four action items from a rejection is the right frame. This is not a setback is not a cope when you actually have the list.', 0)
    add(ycFirst.id, 'Strengthen the team by making clear why this specific team wins this specific market — this is the hardest one to fix but probably the most important.', 1)
  }

  const ycSolo = byTitle('Three profitable micro-SaaS as a solo founder. YC rejected me: no cofounder.')
  if (ycSolo) {
    add(ycSolo.id, 'A recipe that maximizes the average outcome is not a law of physics — this is a really clear way to understand YC\'s cofounder preference without internalizing it as a verdict on you.', 2)
    add(ycSolo.id, 'Three profitable businesses built solo is more evidence of sustained motivation than a cofounder is. Their filter is not built to catch exceptions. Frustrating but logical.', 3)
  }

  // ── INVESTOR POSTS ──
  const a16zSeries = byTitle('Series A partner meeting went two hours')
  if (a16zSeries) {
    add(a16zSeries.id, '"Not the right moment for us" from a firm like a16z is a specific phrase worth decoding. Usually means the market timing story did not land, not the team or product.', 4)
    add(a16zSeries.id, 'Two hours is a good sign that they were genuinely engaged. Did they give any signal on what "right moment" would look like for them?', 5)
  }

  const a16zSeed = byTitle('Seed pitch: got to term sheet stage, then the market comp killed it')
  if (a16zSeed) {
    add(a16zSeed.id, 'Market comp killing a term sheet at the final stage is brutal. Did you get to negotiate on the comp expectation or was it a hard line?', 6)
    add(a16zSeed.id, 'Getting to term sheet stage is real signal that the investment thesis was there. The comp issue is a structural thing, not a verdict on the startup.', 7)
  }

  const benchmarkSeries = byTitle('Series A: Benchmark loved the market, passed on the team')
  if (benchmarkSeries) {
    add(benchmarkSeries.id, '"Loved the market, passed on the team" is the most actionable rejection you can get from a VC. It tells you exactly what to fix.', 8)
    add(benchmarkSeries.id, 'Benchmark passing on the team while loving the market means they think someone else will execute on this. Worth understanding what specifically gave them pause.', 9)
  }

  const firstRoundSeed = byTitle('First Round seed pass: "too early, come back at $100K MRR"')
  if (firstRoundSeed) {
    add(firstRoundSeed.id, '"Too early, come back at $100K MRR" is a specific milestone they gave you. That is more useful than a generic pass — at least you have a target.', 10)
    add(firstRoundSeed.id, 'Did they give a timeline expectation or just the MRR number? Curious if $100K in 12 months vs 24 months would change the conversation for them.', 11)
  }

  const foundersFund = byTitle('Founders Fund: \'we don\'t invest in software\' — and they meant it')
  if (foundersFund) {
    add(foundersFund.id, 'Founders Fund really does not invest in pure software plays. This is widely known in the community but apparently not communicated before pitches happen.', 12)
    add(foundersFund.id, 'Researching fund thesis before pitching should be standard — their portfolio makes the software stance obvious in retrospect.', 13)
  }

  const sequoiaArc = byTitle('Sequoia Arc application: strong feedback, no follow-up call')
  if (sequoiaArc) {
    add(sequoiaArc.id, 'Strong feedback with no follow-up call is the standard VC soft no. They want to stay warm in case you break out without making a commitment. Reapply when you have more traction.', 14)
    add(sequoiaArc.id, 'Did the feedback give any specific signal on what would change the decision? Or was it encouraging but vague?', 15)
  }

  const ycW24 = byTitle('YC W24 rejection: interviewed twice, no offer')
  if (ycW24) {
    add(ycW24.id, 'Getting to the interview twice means the application was strong. The interview is its own skill to practice. What did the two attempts look like differently?', 0)
    add(ycW24.id, 'Two interviews with no offer is rough but it also means you can get in the room. The gap is in the room, not in the application.', 1)
  }

  const ycDropped = byTitle('YC S25: invited to interview, dropped out before it happened')
  if (ycDropped) {
    add(ycDropped.id, 'Dropping out after getting an interview invite is a hard call to make. Whatever the reason was, getting the invite is real signal.', 2)
    add(ycDropped.id, 'Curious what the decision-making process was. The invite is the hardest part and you had it.', 3)
  }

  return out
}

async function main() {
  const sql = postgres(process.env.DATABASE_URL!, { ssl: 'require', max: 3 })

  // Fetch all posts
  console.log('Fetching posts...')
  const posts = await sql<{ id: string; title: string; slug: string }[]>`
    SELECT p.id, p.title, c.slug FROM posts p JOIN communities c ON p.community_id = c.id
  `
  console.log(`Found ${posts.length} posts`)

  // Create commenter users
  console.log('Creating commenter users...')
  const commenterIds: string[] = []
  for (const username of COMMENTER_USERNAMES) {
    const rows = await sql`
      INSERT INTO users (id, username, supabase_auth_id, karma)
      VALUES (${randomUUID()}, ${username}, ${randomUUID()}, 0)
      ON CONFLICT (username) DO UPDATE SET username = EXCLUDED.username
      RETURNING id
    `
    commenterIds.push(rows[0].id as string)
  }
  console.log(`${commenterIds.length} commenter users ready`)

  // Build comment specs
  const specs = makeComments(posts)
  console.log(`Inserting ${specs.length} comments...`)

  let inserted = 0
  let skipped = 0
  for (const spec of specs) {
    const authorId = commenterIds[spec.userIndex % commenterIds.length]
    const score = Math.floor(Math.random() * 12)
    try {
      await sql`
        INSERT INTO comments (id, body, post_id, author_id, vote_score)
        VALUES (${randomUUID()}, ${spec.body}, ${spec.postId}, ${authorId}, ${score})
      `
      inserted++
    } catch (err) {
      console.warn(`Skip comment on ${spec.postId}: ${err}`)
      skipped++
    }
    if (inserted % 20 === 0 && inserted > 0) {
      process.stdout.write(`\r  ${inserted} inserted, ${skipped} skipped`)
    }
  }

  console.log(`\nDone. Inserted: ${inserted}, Skipped: ${skipped}`)
  await sql.end()
}

main().catch(console.error)
