"""Murder at Mistletoe Manor: a Christmas murder mystery party for 8 players (original story).

THE SOLUTION (host's eyes only): Taylor Snow poisoned Sir Nicholas Whitlock's cocoa with crushed
foxglove at 9:52 pm. Logic the players can follow:
  * Nicholas was alive at 9:50 (he phoned the kitchen) and the cocoa pot was clean -> the poison
    went into his mug in the library between 9:50 and 10:00.
  * Everyone else is accounted for 9:50-10:00 by evidence nobody can fake:
      Jordan + Morgan: together in the kitchen, took the 9:50 call (each confirms the other).
      Casey + Quinn: on Quinn's phone video performing 9:30-10:00 without a break.
      Avery: on a recorded investor video call 9:30-10:10.
      Robin: on the bank's call log 9:35-10:05 AND in Riley's second 9:52 photo (ten seconds after the first) through the hall window.
      Riley: outside on the terrace taking the time-stamped photos.
  * Taylor left the ballroom at 9:45 "for the restroom", but the downstairs restroom was locked with
    an OUT OF ORDER sign since 9:00 (and the only other one is in the locked private wing).
  * Riley's 9:52 photo shows a figure in a red scarf at Nicholas's desk; at dinner only Taylor wore one.
  * The conservatory gardening gloves, stained green and smelling of foxglove, were found in the
    pocket of the coat with initials T.S.; Taylor was seen in the conservatory at 9:05.
  * Motive: Nicholas had patented Taylor's invention, the Twinkle Bot, under his own name.
"""

TITLE = "Murder at Mistletoe Manor"
SUBTITLE = "A Christmas Murder Mystery Party for 8 Players"
VICTIM = "Sir Nicholas Whitlock"

SETTING = ("It is Christmas Eve at Mistletoe Manor, the snowy country home of Sir Nicholas Whitlock, the "
           "charming, ruthless owner of Whitlock Toys. Every year he throws the most glamorous Christmas party in "
           "the county. This year the guest list is small, the snow is deep, and by ten o'clock Sir Nicholas is "
           "found dead in his library, slumped over a mug of hot cocoa. The roads are blocked until morning. "
           "The killer is still in the house, and one of you knows exactly who it is.")

# name, role, short public description (invitation), costume idea, secret, what to admit if pressed,
# rumour (round 1), alibi statement (round 2), round 3 note, is_murderer
CHARACTERS = [
    dict(name="Robin Whitlock", role="Nicholas's younger sibling and the company's money manager",
         public="Smart, stylish and always on the phone. Runs the finances of Whitlock Toys and has lived in Nicholas's shadow forever.",
         costume="Sharp suit or elegant dress, a phone always in hand, a little too much gold jewellery.",
         secret="You have been quietly moving money from Whitlock Toys into your own account: $200,000 so far. Yesterday Nicholas found out and told you he would show the evidence to the board on Monday.",
         admit="If someone reads out Nicholas's letter about the board meeting, admit that you 'borrowed' money and planned to pay it back. Insist you would never hurt your own brother.",
         rumour="You saw Dr. Casey Hollins and Nicholas arguing in the hall before dinner. Nicholas said: 'December 31st, Casey. Not one day later.'",
         alibi="From 9:35 until 10:05 you were on the phone with the bank in the front hall, trying to move money before Monday. You stood by the hall window the whole time. At about 9:40 you saw Jordan carry a mug into the library and come out again a minute later, and you heard Nicholas call out 'Perfect cocoa, Jordan!'. At 10:05 you heard Jordan scream and ran into the library.",
         r3="You noticed that Taylor's red scarf was gone when everyone gathered in the library after 10:05. Mention it if nobody else does.",
         murderer=False),
    dict(name="Jordan Mistle", role="The butler who has run Mistletoe Manor for 30 years",
         public="Loyal, proper and quietly sarcastic. Knows every secret in the house and every creak in the floorboards.",
         costume="Black waistcoat or suit, white gloves, a silver tray, a very straight back.",
         secret="Nicholas was selling Mistletoe Manor in February. After 30 years you would lose your job and your home with only a month's notice. You were furious.",
         admit="If the estate agent's notice is read out, admit you were angry, but say you have been looking for a new job and would never risk prison for that man.",
         rumour="Earlier this evening you saw Taylor Snow come out of the conservatory at about 9:05, brushing something off their sleeves. Nobody goes in there in winter.",
         alibi="At 9:00 you locked the downstairs restroom and hung an OUT OF ORDER sign on it because of a leaking pipe. The only other restroom is in the private wing upstairs, which is always locked. At 9:40 you took Nicholas his cocoa in his silver holly mug; he took a sip and said it was perfect. Then you went back to the kitchen and stayed with Morgan. At 9:50 Nicholas phoned the kitchen asking for extra marshmallows. At 10:05 you took them to the library and found him dead.",
         r3="You can confirm the gardening gloves usually hang on a hook in the conservatory. They were there at 8:30 when you watered the plants.",
         murderer=False),
    dict(name="Morgan Ember", role="The celebrity chef catering the party",
         public="Talented, proud and fiery. Runs the most fashionable catering company in town.",
         costume="Chef's whites or an apron, a wooden spoon, a dramatic scarf or bandana.",
         secret="Ten years ago Nicholas wrote a cruel newspaper review that closed your first restaurant, Ember's Bistro. You took this job just to see his face when he tasted your food.",
         admit="If the old newspaper clipping is read out, admit the review ruined you, but say you are a success now and that revenge is 'a dish best served at a much better restaurant'.",
         rumour="While you were looking for a spoon you overheard Avery Gold on the phone saying: 'Don't worry, after tonight Whitlock Toys will be ours.'",
         alibi="At 9:30 you made a big pot of hot cocoa. You tasted it at 9:38 and poured Nicholas's mug from the same pot; the rest of the pot was served to the guests. From 9:45 to 10:05 you were in the kitchen with Jordan the whole time. You answered the house phone at 9:50: it was Nicholas, alive and grumpy, asking for more marshmallows.",
         r3="As a chef you know your plants: foxglove is beautiful but deadly. Nobody would use it in a kitchen. There is none in yours.",
         murderer=False),
    dict(name="Dr. Casey Hollins", role="The family doctor and a talented pianist",
         public="Calm, kind and respected. Has been the Whitlock family doctor for twenty years.",
         costume="Smart blazer or cocktail dress, a doctor's bag, reading glasses on a chain.",
         secret="You have a gambling problem. You owe Nicholas $50,000, and he demanded every cent by December 31st or he would tell the medical board.",
         admit="If the IOU is read out, admit the debt with embarrassment, but say Nicholas dying does not cancel it: the debt passes to his family.",
         rumour="You noticed Robin Whitlock nervously checking their bank app all evening and muttering 'Monday, Monday'.",
         alibi="From 9:30 until 10:00 you played the piano in the ballroom while Quinn sang carols. Quinn filmed the whole set on their phone. You did not stop playing once.",
         r3="You carry heart pills made from digitalis, the same substance found in foxglove. Before anyone accuses you, show that your bottle is still sealed and full: 30 out of 30 pills.",
         murderer=False),
    dict(name="Quinn Carroll", role="The jazz singer performing at the party",
         public="Glamorous, witty and unforgettable. Has the voice of an angel and a past with Nicholas.",
         costume="Sparkly dress or velvet jacket, a microphone, red lipstick or a bow tie.",
         secret="Years ago you were engaged to Nicholas. He left you at the altar on your wedding day and married his company instead. You came tonight to show him how well you are doing without him.",
         admit="If the torn wedding invitation is read out, admit it with a dramatic sigh, but say you got over him years ago 'mostly'.",
         rumour="At dinner you saw Riley Penn pocket a letter from Nicholas's desk. It had a lawyer's logo on it.",
         alibi="From 9:30 to 10:00 you sang carols in the ballroom with Dr. Casey on the piano. You filmed the whole performance on your phone because you post your shows online. At 9:45 Taylor left the ballroom, saying they were going to the restroom. Taylor came back at about 9:58, from the direction of the library corridor.",
         r3="Show everyone your phone video: 30 minutes, no breaks, both you and Casey in every frame.",
         murderer=False),
    dict(name="Avery Gold", role="The CEO of Whitlock Toys' biggest rival, Gold Star Games",
         public="Confident, ambitious and always negotiating. Wants to own every toy shelf in the country.",
         costume="Power suit, gold tie or gold jewellery, a briefcase, a confident smile.",
         secret="You planted a spy inside Whitlock Toys to steal their designs. Nicholas found out, rejected your offer to buy the company and threatened to call the police after Christmas.",
         admit="If the email is read out, admit the business war, but say you are a businessperson, not a killer. Deals can always be made.",
         rumour="You saw Morgan Ember staring at Nicholas during dinner and whispering 'ten years, ten years'.",
         alibi="From 9:30 to 10:10 you were in the study on a video call with your investors in Tokyo. The call was recorded and you never left the screen.",
         r3="You can confirm the study window looks onto the terrace. You saw Riley outside with a camera the whole time you were on the call.",
         murderer=False),
    dict(name="Riley Penn", role="An investigative journalist writing a story on Whitlock Toys",
         public="Curious, clever and never without a notebook or a camera. Says they are here for a 'festive feature'.",
         costume="Trench coat, notebook and pen, a camera around the neck, a press badge.",
         secret="You are really writing an exposé about dangerous toys made by Whitlock Toys. Nicholas's lawyers sent your newspaper a letter threatening to sue you into poverty.",
         admit="If the lawyer's letter is read out, admit you are writing the story, and say the truth matters more than Nicholas's money.",
         rumour="You heard Jordan Mistle tell Nicholas: 'Thirty years, sir. Thirty years, and this is how you repay me?'",
         alibi="From 9:40 to 10:00 you were outside on the snowy terrace taking photos of the manor for your article. Your camera stamps the time on every photo. At 9:52 you took a photo of the library window and, ten seconds later from the same corner of the terrace, one of the front hall window.",
         r3="Point out that in the 8 o'clock dinner photo only one person is wearing a red scarf.",
         murderer=False),
    dict(name="Taylor Snow", role="Whitlock Toys' brilliant chief toy designer",
         public="Creative, cheerful and a little bit nervous. Designed most of Whitlock Toys' bestsellers, including this year's hit, the Twinkle Bot.",
         costume="Colourful knitwear, a red scarf, a sketchbook, a toy robot or two.",
         secret="You invented the Twinkle Bot, but this morning you discovered that Nicholas had patented it in his own name and was keeping all the money.",
         admit="If the patent is read out, admit you were upset, but say you were going to talk to a lawyer, not do anything foolish.",
         rumour="You saw Quinn Carroll crying in the corridor before dinner, holding an old photo of Nicholas.",
         alibi="Say that at 9:45 you left the ballroom to go to the downstairs restroom and stayed there until about 9:58. (This is a lie: the restroom was locked.)",
         r3="If anyone asks about the gloves or your scarf, say you lost your scarf earlier and anyone could have taken it, and that you went to the conservatory at 9:05 only for fresh air.",
         murderer=True),
]

MURDERER_NOTE = ("After you found the patent, you decided Nicholas had to pay. At 9:05 you "
                 "slipped into the conservatory, put on the gardening gloves and picked foxglove leaves, which are "
                 "deadly poison. At 9:45 you left the ballroom saying you needed the restroom, went to the library "
                 "and, while Nicholas looked out of the window, crushed the leaves into his cocoa at about 9:52. You "
                 "stuffed the gloves into your coat pocket in the cloakroom and returned to the ballroom at 9:58. "
                 "You may lie about anything except the facts printed on the evidence cards. Stay calm, act shocked, "
                 "and point suspicion at the others: everyone had a reason to hate Nicholas.")

OPENING = ("Ladies and gentlemen, thank you for coming to Mistletoe Manor. I'm afraid I have terrible news. At "
           "five past ten this evening, our host, Sir Nicholas Whitlock, was found dead in his library by the "
           "butler, Jordan Mistle. He was slumped over his favourite silver mug, the one engraved with holly, "
           "half full of hot cocoa. The doctor says he was poisoned. The snow has blocked the roads and the "
           "police cannot reach us until morning. That means the killer is in this room. Tonight, we will find "
           "out who it is.")

ROUND_INTROS = [
    ("Round 1: Secrets", "Everyone hated Nicholas a little, but who hated him enough to kill? Introduce your "
     "character, share the rumour from your booklet, and read the evidence card you were given. Ask questions! "
     "If someone's secret comes out, they must answer, but they don't have to tell the whole truth."),
    ("Round 2: Where Were You?", "Nicholas phoned the kitchen at 9:50 asking for marshmallows, so he was alive "
     "then. By 10:05 he was dead. Each player now tells everyone where they were between 9:30 and 10:05. "
     "Then read your Round 2 evidence card. Compare stories: who can prove where they were?"),
    ("Round 3: The Evidence", "The doctor has finished examining the body and the house has been searched. "
     "Read the Round 3 evidence cards aloud. Everything on these cards is true. Then it's time to decide."),
]

# Evidence cards: (round, given_to, title, text)
EVIDENCE = [
    (1, "Robin Whitlock", "Letter on Nicholas's desk", "To the Board of Whitlock Toys: Please attend an emergency meeting on Monday. I have evidence that ROBIN has taken $200,000 from the company. - N.W."),
    (1, "Jordan Mistle", "Estate agent's notice", "Mistletoe Manor: SOLD subject to contract. Completion 1 February. All staff, including the house manager, to vacate the property by that date."),
    (1, "Morgan Ember", "Old newspaper clipping", "'Ember's Bistro: Overcooked, Overpriced, Over.' A review by N. Whitlock. Ember's Bistro closed three weeks later."),
    (1, "Dr. Casey Hollins", "An IOU found in Nicholas's wallet", "I, Dr. Casey Hollins, owe Nicholas Whitlock the sum of $50,000, to be repaid in full by 31 December."),
    (1, "Quinn Carroll", "A torn wedding invitation", "'Quinn Carroll and Nicholas Whitlock request the pleasure of your company…' Someone has torn it right through the middle."),
    (1, "Avery Gold", "Printed email", "From: N. Whitlock. To: A. Gold. 'Your offer is rejected. And I know all about your spy in my design team. Enjoy Christmas. The police will call in January.'"),
    (1, "Riley Penn", "Lawyer's letter", "To the editor: If you publish Riley Penn's article about Whitlock Toys, our client will sue your newspaper for every penny it has."),
    (1, "Taylor Snow", "A patent certificate", "Patent granted: the TWINKLE BOT, invented by Sir Nicholas Whitlock. Clipped to it: Taylor Snow's original sketches of the Twinkle Bot, dated two years ago."),
    (2, "Jordan Mistle", "Kitchen phone log", "Incoming call at 9:50 pm from the LIBRARY extension, 1 minute. Answered in the kitchen. (Nicholas was alive at 9:50.)"),
    (2, "Riley Penn", "Riley's camera: photo at 9:52 pm", "Taken from the terrace through the library window: a blurry figure wearing a RED SCARF leans over Nicholas's desk, right next to the silver holly mug. Nicholas stands at the far window with his back turned."),
    (2, "Riley Penn", "Riley's camera: photo at 9:52 pm, ten seconds later", "Taken from the same corner of the terrace through the front hall window: Robin Whitlock, on the phone, standing by the coat stand."),
    (2, "Robin Whitlock", "Bank call record", "First National Bank. Call with R. Whitlock: started 9:35 pm, ended 10:05 pm. Duration: 30 minutes."),
    (2, "Quinn Carroll", "Quinn's phone video", "9:30 to 10:00 pm, 30 minutes, no breaks. Quinn singing and Dr. Casey Hollins at the piano in every frame. At 9:45 Taylor Snow can be seen leaving the ballroom."),
    (2, "Avery Gold", "Investor call recording", "Video call, Gold Star Games investors: 9:30 to 10:10 pm. Avery Gold is on screen the whole time, sitting in the study."),
    (2, "Jordan Mistle", "A sign on the downstairs restroom door", "OUT OF ORDER. Leaking pipe. Door locked at 9:00 pm. - J.M. (The only other restroom, in the private upstairs wing, is always locked.)"),
    (3, "Dr. Casey Hollins", "The doctor's report", "Cause of death: poisoning by foxglove (digitalis). Crushed leaves were found in Nicholas's mug. The cocoa left in the kitchen pot is clean, so the poison was added to the mug in the library."),
    (3, "Morgan Ember", "The conservatory", "A row of tall purple foxgloves has freshly snapped stems. The hook where the gardening gloves usually hang is empty."),
    (3, "Robin Whitlock", "Found in the cloakroom", "A pair of gardening gloves, stained green and smelling of foxglove, stuffed into the pocket of a long coat. The coat's lining is embroidered with the initials T.S."),
    (3, "Dr. Casey Hollins", "Dr. Hollins's medicine bottle", "Heart pills (digitalis). Bottle sealed by the pharmacy. 30 pills prescribed, 30 pills inside. None are missing."),
    (3, "Riley Penn", "Dinner photo, 8:00 pm", "All eight guests and Nicholas around the table. Only one person is wearing a red scarf: Taylor Snow."),
]

SOLUTION = ("Taylor Snow killed Sir Nicholas Whitlock. That morning Taylor discovered that Nicholas had patented "
            "the Twinkle Bot, Taylor's own invention, under his name. At 9:05 Taylor slipped into the conservatory, "
            "put on the gardening gloves and picked foxglove. Nicholas was still alive at 9:50, when he phoned the "
            "kitchen, and the cocoa pot was clean, so the poison went into his mug in the library after that. "
            "At that moment Jordan and Morgan were together in the kitchen, Casey and Quinn were on Quinn's video, "
            "Avery was on the recorded investor call, Riley was outside taking photos, and Riley's photo ten seconds after "
            "the first shows Robin on the phone in the hall. Only Taylor had no alibi: Taylor claimed to be in the downstairs "
            "restroom, but it had been locked with an OUT OF ORDER sign since 9:00. Riley's 9:52 photo shows a "
            "figure in a red scarf at Nicholas's desk, and only Taylor wore a red scarf. Finally, the foxglove-stained "
            "gloves were hidden in the coat with Taylor's initials. Case closed, and a very merry Christmas to all "
            "the innocent!")
