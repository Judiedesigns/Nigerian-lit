import { useState, useMemo, useEffect, useRef } from "react";

let _audioCtx = null;
let _soundEnabled = true;
function getAudioCtx() {
  if (!_audioCtx) _audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  return _audioCtx;
}
function playPageTurn() {
  if (!_soundEnabled) return;
  try {
    const ctx = getAudioCtx();
    const bufSize = ctx.sampleRate * 0.18;
    const buf = ctx.createBuffer(1, bufSize, ctx.sampleRate);
    const data = buf.getChannelData(0);
    for (let i = 0; i < bufSize; i++) data[i] = Math.random() * 2 - 1;
    const src = ctx.createBufferSource();
    src.buffer = buf;
    const bp = ctx.createBiquadFilter();
    bp.type = "bandpass"; bp.frequency.value = 800; bp.Q.value = 0.8;
    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0, ctx.currentTime);
    gain.gain.linearRampToValueAtTime(0.18, ctx.currentTime + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.18);
    src.connect(bp).connect(gain).connect(ctx.destination);
    src.start(); src.stop(ctx.currentTime + 0.2);
  } catch {}
}
function playStamp() {
  if (!_soundEnabled) return;
  try {
    const ctx = getAudioCtx();
    const osc = ctx.createOscillator();
    osc.type = "sine";
    osc.frequency.setValueAtTime(160, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(60, ctx.currentTime + 0.08);
    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.4, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.18);
    const bufSize = ctx.sampleRate * 0.005;
    const buf = ctx.createBuffer(1, bufSize, ctx.sampleRate);
    const data = buf.getChannelData(0);
    for (let i = 0; i < bufSize; i++) data[i] = (Math.random() * 2 - 1) * (1 - i / bufSize);
    const click = ctx.createBufferSource();
    click.buffer = buf;
    const cGain = ctx.createGain(); cGain.gain.value = 0.6;
    click.connect(cGain).connect(ctx.destination); click.start();
    osc.connect(gain).connect(ctx.destination);
    osc.start(); osc.stop(ctx.currentTime + 0.2);
  } catch {}
}
function playTypewriter() {
  if (!_soundEnabled) return;
  try {
    const ctx = getAudioCtx();
    const bufSize = ctx.sampleRate * 0.025;
    const buf = ctx.createBuffer(1, bufSize, ctx.sampleRate);
    const data = buf.getChannelData(0);
    for (let i = 0; i < bufSize; i++) data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufSize * 0.15));
    const src = ctx.createBufferSource();
    src.buffer = buf;
    const hp = ctx.createBiquadFilter();
    hp.type = "highpass"; hp.frequency.value = 2000;
    const gain = ctx.createGain(); gain.gain.value = 0.3;
    src.connect(hp).connect(gain).connect(ctx.destination); src.start();
  } catch {}
}
function playSoftClick() {
  if (!_soundEnabled) return;
  try {
    const ctx = getAudioCtx();
    const osc = ctx.createOscillator();
    osc.type = "sine";
    osc.frequency.setValueAtTime(800, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(300, ctx.currentTime + 0.08);
    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.25, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.1);
    osc.connect(gain).connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.12);
  } catch {}
}
function playChime() {
  if (!_soundEnabled) return;
  try {
    const ctx = getAudioCtx();
    [880, 1320].forEach((freq, i) => {
      const osc = ctx.createOscillator();
      osc.type = "sine"; osc.frequency.value = freq;
      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0, ctx.currentTime + i * 0.06);
      gain.gain.linearRampToValueAtTime(0.12, ctx.currentTime + i * 0.06 + 0.01);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + i * 0.06 + 1.2);
      osc.connect(gain).connect(ctx.destination);
      osc.start(ctx.currentTime + i * 0.06); osc.stop(ctx.currentTime + i * 0.06 + 1.3);
    });
  } catch {}
}

const books = [
  { id: 1, title: "Things Fall Apart", author: "Chinua Achebe", year: 1958, genre: "Novel", description: "A landmark of African literature following Okonkwo, an Igbo wrestler whose world unravels with the arrival of colonialism.", synopsis: "Set in pre-colonial Nigeria, Things Fall Apart tells the story of Okonkwo, a respected leader of the Igbo community of Umuofia. A proud, strong-willed man, Okonkwo fears weakness above all else. When the arrival of European missionaries and colonial governance upends the traditional order, Okonkwo's world collapses around him. Achebe's masterpiece is both an intimate portrait of a man and a sweeping account of the collision between two worlds. It remains one of the most widely read African novels ever written.", cover: "https://covers.openlibrary.org/b/id/8739161-L.jpg", openLibrary: "https://openlibrary.org/works/OL1970426W", tags: ["Classic", "Colonialism", "Igbo Culture"] },
  { id: 2, title: "No Longer at Ease", author: "Chinua Achebe", year: 1960, genre: "Novel", description: "The grandson of Okonkwo navigates a corrupt colonial Nigeria, torn between tradition and modernity.", synopsis: "A sequel to Things Fall Apart, No Longer at Ease follows Obi Okonkwo as he returns to Nigeria after studying in England. Appointed to a prestigious government post, Obi is idealistic and determined to resist pervasive corruption. But life in Lagos — its social pressures, financial demands, and moral compromises — slowly erodes his resolve. Achebe charts the tragedy of a man destroyed not by villains but by small, human failures.", cover: "https://covers.openlibrary.org/b/id/8739163-L.jpg", openLibrary: "https://openlibrary.org/works/OL1970424W", tags: ["Classic", "Colonialism", "Urban Life"] },
  { id: 3, title: "Arrow of God", author: "Chinua Achebe", year: 1964, genre: "Novel", description: "A chief priest of Ulu navigates his people's fate as colonial power and rival clans close in.", synopsis: "Set in the 1920s, Arrow of God centres on Ezeulu, the proud chief priest of the god Ulu in the Igbo village of Umuaro. As colonial administrators extend their reach and neighbouring clans plot against him, Ezeulu must balance his people's welfare against his own pride. Widely considered Achebe's most technically accomplished novel — a tragedy of religious authority, political power, and the dissolution of a way of life.", cover: "https://covers.openlibrary.org/b/id/8739157-L.jpg", openLibrary: "https://openlibrary.org/works/OL1970420W", tags: ["Classic", "Religion", "Colonialism"] },
  { id: 4, title: "Chike and the River", author: "Chinua Achebe", year: 1966, genre: "Novel", description: "A young boy's adventure as he leaves his village for the city and longs to cross the great River Niger.", synopsis: "Written for younger readers, Chike and the River tells the story of eleven-year-old Chike who moves from his village to Onitsha. Fascinated by the River Niger and the mysterious town on the other side, Chike becomes consumed by the dream of crossing it — despite having no money for the ferry fare. His small adventures and eventual lesson in honesty make this a charming tale beloved by generations of Nigerian schoolchildren.", cover: "https://covers.openlibrary.org/b/id/8739159-L.jpg", openLibrary: "https://openlibrary.org/works/OL1970422W", tags: ["Children's", "Coming of Age", "Igbo Culture"] },
  { id: 5, title: "Anthills of the Savannah", author: "Chinua Achebe", year: 1987, genre: "Novel", description: "Three childhood friends navigate power, betrayal, and survival in a military-ruled fictional African state.", synopsis: "Set in the fictional West African country of Kangan, ruled by a military Head of State known only as Sam. Three protagonists — Chris the Commissioner for Information, Ikem the newspaper editor, and Beatrice the civil servant — watch their old friend Sam grow paranoid and dictatorial. Achebe weaves together multiple voices to produce a rich, angry meditation on power, journalism, and the fate of postcolonial Africa. Shortlisted for the Booker Prize.", cover: "https://covers.openlibrary.org/b/id/8228592-L.jpg", openLibrary: "https://openlibrary.org/works/OL1970418W", tags: ["Novel", "Political", "Military Rule", "Postcolonial"] },
  { id: 6, title: "A Man of the People", author: "Chinua Achebe", year: 1966, genre: "Novel", description: "A young idealist takes on a corrupt populist minister — and discovers that the people love the corruption.", synopsis: "Told by Odili, a young teacher, this satirical novel centres on Chief Nanga, a semi-literate but enormously charismatic minister who embodies postcolonial corruption. When Odili tries to oppose him politically and romantically, he discovers that Nanga's constituents are perfectly happy with a man who steals for them. Published just before Nigeria's first military coup in 1966 — which Achebe seemed almost to predict.", cover: "https://covers.openlibrary.org/b/id/8228594-L.jpg", openLibrary: "https://openlibrary.org/works/OL1970416W", tags: ["Novel", "Satire", "Politics", "Postcolonial"] },
  { id: 7, title: "Girls at War and Other Stories", author: "Chinua Achebe", year: 1972, genre: "Short Stories", description: "Achebe's collected short fiction, including devastating stories set during the Nigeria-Biafra War.", synopsis: "Achebe's only short story collection spans his career, but its most powerful pieces are set during the Biafra War. The title story follows a man's encounters with a young female soldier across the arc of the conflict — from idealism to desperation to tragedy. Other stories examine village life, the ironies of colonialism, and the moral compromises of everyday Nigerian existence. Concise, precise, and quietly devastating.", cover: "https://covers.openlibrary.org/b/id/8228596-L.jpg", openLibrary: "https://openlibrary.org/works/OL1970414W", tags: ["Short Stories", "War", "Biafra", "Classic"] },
  { id: 8, title: "Beware, Soul Brother", author: "Chinua Achebe", year: 1971, genre: "Poetry", description: "Poems written in the aftermath of the Nigerian Civil War — grief, anger, and endurance distilled.", synopsis: "Beware, Soul Brother is Achebe's first major poetry collection, written in the wake of the Biafra War. These poems mourn the dead, catalogue atrocity, and insist on the possibility of rebirth. Achebe's poetic voice is spare and grave, deploying Igbo proverb and image in poems that refuse both sentimentality and despair. The collection won the Commonwealth Poetry Prize in 1972.", cover: "https://covers.openlibrary.org/b/id/8228570-L.jpg", openLibrary: "https://openlibrary.org/search?q=beware+soul+brother+achebe", tags: ["Poetry", "War", "Biafra", "Igbo Culture"] },
  { id: 9, title: "Purple Hibiscus", author: "Chimamanda Ngozi Adichie", year: 2003, genre: "Novel", description: "A teenager in a wealthy Nigerian household quietly awakens to her father's religious tyranny and the possibility of freedom.", synopsis: "Fifteen-year-old Kambili lives in privilege but under the iron rule of her devout, domineering father Eugene. When she visits her freethinking aunt in Nsukka, she encounters laughter, open debate, and a version of faith that breathes. Against a backdrop of military coups, Purple Hibiscus is a story about silence, love, abuse, and the terrifying first steps toward personhood. Adichie's debut announced one of the defining voices of her generation.", cover: "https://covers.openlibrary.org/b/id/8228532-L.jpg", openLibrary: "https://openlibrary.org/works/OL17344629W", tags: ["Contemporary", "Family", "Religion", "Coming of Age"] },
  { id: 10, title: "Half of a Yellow Sun", author: "Chimamanda Ngozi Adichie", year: 2006, genre: "Novel", description: "A sweeping novel of love and war set during the Nigeria-Biafra conflict of the late 1960s.", synopsis: "Told through three characters — a village boy turned houseboy, twin sisters from an elite Igbo family, and a British man adrift in Nigeria — this novel traces the years leading to and through the devastating Biafra War. Adichie renders the euphoria of early Nigerian independence and the brutal fragmentation of civil war with extraordinary vividness. Winner of the Orange Prize for Fiction.", cover: "https://covers.openlibrary.org/b/id/8228534-L.jpg", openLibrary: "https://openlibrary.org/works/OL17344627W", tags: ["Historical Fiction", "War", "Biafra", "Love"] },
  { id: 11, title: "Americanah", author: "Chimamanda Ngozi Adichie", year: 2013, genre: "Novel", description: "A sharp, funny, and searching novel about a Nigerian woman navigating race, identity, and love in America.", synopsis: "Ifemelu and Obinze are young and in love in Lagos when they set off separately for the West. Ifemelu heads to America, where she encounters race as a lived reality and begins a wildly popular blog about blackness in America. Obinze goes to London, undocumented and humbled. Years later, both return to a transformed Nigeria. Americanah is at once a love story, a satirical dissection of race and class, and a precise account of what it means to be African abroad.", cover: "https://covers.openlibrary.org/b/id/8228536-L.jpg", openLibrary: "https://openlibrary.org/works/OL17344625W", tags: ["Contemporary", "Diaspora", "Race", "Love"] },
  { id: 12, title: "The Thing Around Your Neck", author: "Chimamanda Ngozi Adichie", year: 2009, genre: "Short Stories", description: "Twelve stories about Nigerians at home and abroad — love, loss, displacement, and the weight of identity.", synopsis: "Adichie's short story collection moves between Nigeria and America with characteristic precision and empathy. Stories range from a young woman navigating American loneliness, to a Lagos couple processing infidelity, to a young man returning from America to a changed Nigeria. The title story captures the experience of isolation that grips many new immigrants — a feeling like a hand around the neck that only loosens in the presence of someone who truly sees you.", cover: "https://covers.openlibrary.org/b/id/8228628-L.jpg", openLibrary: "https://openlibrary.org/works/OL17344623W", tags: ["Short Stories", "Diaspora", "Contemporary", "Women"] },
  { id: 13, title: "The Concubine", author: "Elechi Amadi", year: 1966, genre: "Novel", description: "A beautiful village woman's life is shadowed by a supernatural curse — every man who loves her dies.", synopsis: "Set in a traditional Igbo village, The Concubine centres on Ihuoma, a beautiful, virtuous woman whose husbands and admirers seem cursed to die. The novel weaves together realism and spiritual belief with rare delicacy — what looks like bad luck reveals itself as something far older and stranger. Amadi's prose is spare and assured, capturing the rhythms of communal life while building mounting dread.", cover: "https://covers.openlibrary.org/b/id/240726-L.jpg", openLibrary: "https://openlibrary.org/works/OL4655929W", tags: ["Classic", "Myth", "Igbo Culture", "Tragedy"] },
  { id: 14, title: "The Great Ponds", author: "Elechi Amadi", year: 1969, genre: "Novel", description: "Two villages go to war over fishing rights in a conflict that takes on cosmic proportions.", synopsis: "Two Igbo villages — Chiolu and Aliakoro — escalate a dispute over fishing rights into a bloody, devastating conflict. As the war grinds on and the Spanish Flu pandemic sweeps through, the characters question whether divine forces are punishing their pride. Amadi balances action and reflection, violence and philosophy, in a novel that reads simultaneously as historical record and moral fable.", cover: "https://covers.openlibrary.org/b/id/8228540-L.jpg", openLibrary: "https://openlibrary.org/works/OL4655931W", tags: ["Classic", "War", "Igbo Culture"] },
  { id: 15, title: "The Bride Price", author: "Buchi Emecheta", year: 1976, genre: "Novel", description: "A young Igbo girl falls in love with a man her family forbids — a descendant of slaves — with tragic results.", synopsis: "Set in 1950s Nigeria, The Bride Price follows Aku-nna, a teenage girl whose father dies suddenly, leaving her under her uncle's control. When she falls in love with her teacher Chike — whose ancestral status makes him an unsuitable match — she must choose between love and the rigid social order. Emecheta writes with fierce compassion about the ways tradition can crush young women.", cover: "https://covers.openlibrary.org/b/id/8228542-L.jpg", openLibrary: "https://openlibrary.org/works/OL2834278W", tags: ["Classic", "Women", "Tradition", "Tragedy"] },
  { id: 16, title: "The Joys of Motherhood", author: "Buchi Emecheta", year: 1979, genre: "Novel", description: "A woman sacrifices everything for her children, only to find that motherhood promises more than it delivers.", synopsis: "Nnu Ego's entire identity is built around being a mother. Emecheta follows her from rural Ibuza to colonial Lagos as she raises child after child, enduring poverty, an indifferent husband, and the slow erosion of everything she was promised. Savage in its irony and deeply humane in its portrait of female suffering, this is one of the most important feminist novels to emerge from Africa.", cover: "https://covers.openlibrary.org/b/id/8228544-L.jpg", openLibrary: "https://openlibrary.org/works/OL2834276W", tags: ["Classic", "Feminism", "Motherhood", "Colonial"] },
  { id: 17, title: "Second Class Citizen", author: "Buchi Emecheta", year: 1974, genre: "Novel", description: "A Nigerian woman follows her husband to 1960s London and discovers a life of poverty, racism, and domestic abuse.", synopsis: "Adah has dreamed of going to England since childhood. When she finally arrives in London with her husband Francis and their children, the dream meets brutal reality: cold rooms in Notting Hill, racism at every turn, a husband who burns her manuscripts and resents her ambitions. Emecheta draws directly from her own experience to produce a novel of fierce, unsentimental clarity.", cover: "https://covers.openlibrary.org/b/id/8228618-L.jpg", openLibrary: "https://openlibrary.org/works/OL2834274W", tags: ["Novel", "Diaspora", "Feminism", "Racism", "London"] },
  { id: 18, title: "Death and the King's Horseman", author: "Wole Soyinka", year: 1975, genre: "Play", description: "A Yoruba chief must ritually follow his king in death — but a British colonial officer intervenes.", synopsis: "Based on events in Oyo, Nigeria, in 1946, this play dramatises the collision between Yoruba cosmology and British colonial authority. Elesin, the King's Horseman, is expected to take his own life to accompany his king to the afterlife. But when the British District Officer intervenes to stop what he sees as a suicide, he triggers a catastrophe far worse than the one he sought to prevent. Soyinka insists the play is about the tragic failure of nerve, not colonial contact.", cover: "https://covers.openlibrary.org/b/id/8228546-L.jpg", openLibrary: "https://openlibrary.org/works/OL15149687W", tags: ["Play", "Yoruba Culture", "Colonialism", "Tragedy"] },
  { id: 19, title: "The Lion and the Jewel", author: "Wole Soyinka", year: 1963, genre: "Play", description: "A village beauty is courted by both a young schoolteacher and an old, wily chief — tradition battles modernity.", synopsis: "Set in the Yoruba village of Ilujinle, this comedy pits Lakunle — a young schoolteacher besotted with Western modernity — against Baroka, the cunning old Bale of the village, both competing for the hand of Sidi, the village beauty. Soyinka gleefully skewers both blind tradition and naive Westernisation. Written in verse and prose, it remains one of his most performed and beloved works.", cover: "https://covers.openlibrary.org/b/id/8228548-L.jpg", openLibrary: "https://openlibrary.org/works/OL15149685W", tags: ["Play", "Comedy", "Yoruba Culture", "Modernity"] },
  { id: 20, title: "The Interpreters", author: "Wole Soyinka", year: 1965, genre: "Novel", description: "A group of educated young Nigerians wrestle with independence, identity, and disillusionment in Lagos.", synopsis: "Soyinka's first novel follows five young Nigerian intellectuals — a journalist, an engineer, a sculptor, a doctor, and a civil servant — navigating the heady years following independence. Their conversations crackle with wit and bitterness; their lives shadowed by the gap between the nation they imagined and the one they inhabit. Dense, nonlinear, and demanding, it rewards patience with one of the richest portraits of postcolonial Nigerian society ever written.", cover: "https://covers.openlibrary.org/b/id/8228574-L.jpg", openLibrary: "https://openlibrary.org/works/OL15149681W", tags: ["Classic", "Postcolonial", "Intellectuals", "Lagos"] },
  { id: 21, title: "Season of Anomy", author: "Wole Soyinka", year: 1973, genre: "Novel", description: "A utopian community resists a brutal regime in a novel written partly in response to the Nigerian Civil War.", synopsis: "An allegory of political violence set in a fictional Nigeria clearly shaped by the Biafra War. Ofeyi, an idealistic cocoa company employee, sets out to find his kidnapped lover Iriyise across a country in the grip of murderous state-sanctioned terror. Drawing on the myth of Orpheus and Eurydice, Soyinka writes in dense, poetic prose that demands and rewards careful attention.", cover: "https://covers.openlibrary.org/b/id/8228556-L.jpg", openLibrary: "https://openlibrary.org/works/OL15149683W", tags: ["Novel", "Political", "War", "Allegory"] },
  { id: 22, title: "Wole Soyinka: Collected Poems", author: "Wole Soyinka", year: 1986, genre: "Poetry", description: "Nobel Prize-winning poetry — Soyinka's full poetic voice, from Yoruba mythology to prison verse.", synopsis: "Wole Soyinka was awarded the Nobel Prize in Literature in 1986 — the first African writer to receive the honour. His poetry draws on Yoruba mythology, particularly the god Ogun, deity of iron, creativity, and destruction. His collections — including Idanre and Other Poems and A Shuttle in the Crypt (written in prison) — range from lyrical to political, from densely symbolic to piercingly direct.", cover: "https://covers.openlibrary.org/b/id/8228568-L.jpg", openLibrary: "https://openlibrary.org/search?q=wole+soyinka+poems", tags: ["Poetry", "Nobel Prize", "Yoruba Mythology", "Political"] },
  { id: 23, title: "The Gods Are Not to Blame", author: "Ola Rotimi", year: 1971, genre: "Play", description: "Sophocles' Oedipus Rex transplanted to Yorubaland — a king destroys himself fulfilling a prophecy he tried to escape.", synopsis: "Ola Rotimi's masterwork adapts Oedipus Rex to a pre-colonial Yoruba setting. Odewale, a farmer who becomes king of Kutuje, has unknowingly killed his father and married his mother — just as an oracle foretold. As plague grips the kingdom and the truth surfaces, Odewale's pride and hot temper doom him. Rotimi adds a specifically Nigerian dimension: the tragedy is partly driven by ethnic suspicion. A cornerstone of African drama.", cover: "https://covers.openlibrary.org/b/id/8228588-L.jpg", openLibrary: "https://openlibrary.org/search?q=gods+are+not+to+blame+ola+rotimi", tags: ["Play", "Tragedy", "Yoruba Culture", "Adaptation"] },
  { id: 24, title: "Our Husband Has Gone Mad Again", author: "Ola Rotimi", year: 1977, genre: "Play", description: "A comic play about a Nigerian politician whose two wives — one traditional, one American-educated — collide hilariously.", synopsis: "Ola Rotimi's funniest play follows Lejoka-Brown, a former military officer turned politician whose domestic life is chaos. He has a traditional Nigerian wife in the compound and an American-educated wife returning from abroad — neither knows about the other. As his political pretensions spiral and his household descends into farce, Rotimi skewers Nigerian politics, gender relations, and the comedy of a society caught between worlds.", cover: "https://covers.openlibrary.org/b/id/8228586-L.jpg", openLibrary: "https://openlibrary.org/search?q=our+husband+has+gone+mad+again+rotimi", tags: ["Play", "Comedy", "Politics", "Gender"] },
  { id: 25, title: "Kurunmi", author: "Ola Rotimi", year: 1971, genre: "Play", description: "A historical drama about the proud Ijaye warlord who defied the Oyo Empire and paid with everything.", synopsis: "Based on real events in 19th-century Yorubaland, Kurunmi dramatises the fall of the great warlord of Ijaye, who refuses to accept the succession of a new Alaafin of Oyo. His defiance triggers a devastating war that destroys Ijaye and kills his sons. Rotimi renders Kurunmi as a tragic hero of Shakespearean proportions — fiercely principled, politically outmanoeuvred, and ultimately broken by loyalty to a custom.", cover: "https://covers.openlibrary.org/b/id/8228590-L.jpg", openLibrary: "https://openlibrary.org/search?q=kurunmi+ola+rotimi", tags: ["Play", "Historical", "Yoruba Culture", "War", "Tragedy"] },
  { id: 26, title: "Harvest of Corruption", author: "Frank Ogodo Ogbeche", year: 1997, genre: "Play", description: "A satirical drama exposing corruption at every level of Nigerian government and society.", synopsis: "Set in the fictional Nigerian city of Jabu, Harvest of Corruption follows Aloho, a young university graduate lured by an old classmate into the corrupt orbit of Chief Haladu Ade-Amaka, a minister who runs a criminal network of drug trafficking and bribery. Aloho is arrested, imprisoned, impregnated by the minister, and dies in childbirth. Ogbeche's satire indicts the police, the judiciary, and government alike — corruption always reaps its own harvest.", cover: "https://covers.openlibrary.org/b/id/8228582-L.jpg", openLibrary: "https://openlibrary.org/search?q=harvest+of+corruption+ogbeche", tags: ["Play", "Corruption", "Satire", "Political"] },
  { id: 27, title: "Wedlock of the Gods", author: "Zulu Sofola", year: 1972, genre: "Play", description: "A young widow tries to marry the man she loves — but tradition demands she belong to her dead husband's brother.", synopsis: "Written by Nigeria's first published female playwright, this tragedy is set in a traditional Igbo village. Ogwoma was forced to marry Adigwu — a man she hated — to fund medicine for her sick brother. When Adigwu dies, she hopes to finally be free to marry her true love, Uloko. But custom dictates she must then marry her dead husband's brother. Ogwoma and Uloko defy this, and the consequences are catastrophic for everyone.", cover: "https://covers.openlibrary.org/b/id/8228584-L.jpg", openLibrary: "https://openlibrary.org/search?q=wedlock+of+the+gods+zulu+sofola", tags: ["Play", "Feminism", "Igbo Culture", "Tragedy", "Tradition"] },
  { id: 28, title: "Women of Owu", author: "Femi Osofisan", year: 2006, genre: "Play", description: "A retelling of Euripides' The Trojan Women set in 19th-century Yorubaland after the destruction of the city of Owu.", synopsis: "Femi Osofisan transplants Euripides' The Trojan Women to the ruins of Owu, a Yoruba city destroyed by allied enemies in the early 19th century. The women of Owu — enslaved, bereaved, waiting — mourn their city, their dead, their lost futures. Osofisan's adaptation is both faithful to its Greek source and urgently African. One of the most important works of modern African theatre.", cover: "https://covers.openlibrary.org/b/id/8228552-L.jpg", openLibrary: "https://openlibrary.org/search?q=women+of+owu+osofisan", tags: ["Play", "Yoruba Culture", "War", "Women"] },
  { id: 29, title: "Song of a Goat", author: "J.P. Clark", year: 1961, genre: "Play", description: "An impotent fisherman, his fertile wife, and his brother spiral toward tragedy in a Delta community.", synopsis: "Set among the Ijaw people of the Niger Delta, this verse tragedy follows Zifa, a fisherman rendered impotent by illness, and the devastating consequences when his wife Ebiere turns to his younger brother Tonye. Clark draws on classical Greek tragedy and fuses it with Ijaw oral tradition to create a distinctively Nigerian form. Spare and musical, it is one of the founding texts of Nigerian drama.", cover: "https://covers.openlibrary.org/b/id/8228554-L.jpg", openLibrary: "https://openlibrary.org/search?q=song+of+a+goat+jp+clark", tags: ["Play", "Ijaw Culture", "Tragedy", "Niger Delta"] },
  { id: 30, title: "The Famished Road", author: "Ben Okri", year: 1991, genre: "Novel", description: "Azaro, a spirit child who chooses to stay among the living, wanders between worlds in a mythic, fractured Nigeria.", synopsis: "Azaro is an abiku — a spirit child who keeps dying and returning in the cycle of Yoruba spiritual belief. In The Famished Road, he chooses to stay in the world of the living, but the spirit world won't release him. He wanders through a poverty-stricken Nigerian compound where politicians manipulate the poor and the road itself is a hungry, sentient force. Winner of the Booker Prize in 1991.", cover: "https://covers.openlibrary.org/b/id/8228550-L.jpg", openLibrary: "https://openlibrary.org/works/OL2988041W", tags: ["Magical Realism", "Booker Prize", "Yoruba Culture", "Spirit World"] },
  { id: 31, title: "The Palm-Wine Drinkard", author: "Amos Tutuola", year: 1952, genre: "Novel", description: "A man addicted to palm-wine journeys into the land of the dead to retrieve his favourite tapster.", synopsis: "The Palm-Wine Drinkard is a wild, exhilarating novel — written in Tutuola's idiosyncratic English, which blends Yoruba oral tradition with a kind of visionary naivety. The unnamed narrator travels into Deads' Town to bring back his palm-wine tapster who has died. Along the way, he encounters monsters, tests, and strange beings drawn from Yoruba folklore. It is the first published novel by a Nigerian author.", cover: "https://covers.openlibrary.org/b/id/8228566-L.jpg", openLibrary: "https://openlibrary.org/works/OL2755168W", tags: ["Classic", "Yoruba Folklore", "Fantasy", "Myth"] },
  { id: 32, title: "Christopher Okigbo: Collected Poems", author: "Christopher Okigbo", year: 1986, genre: "Poetry", description: "Collected poems from Nigeria's most celebrated modernist poet, who died fighting in the Biafra War.", synopsis: "Christopher Okigbo is widely regarded as the greatest poet in the Nigerian literary tradition. Labyrinths weaves together classical allusion, Igbo myth, and modernist technique in verse of extraordinary beauty and density. Okigbo was killed in action fighting for Biafra in 1967, at just 35. His work — including 'Heavensgate,' 'Limits,' and 'Path of Thunder' — remains essential reading: lush, difficult, and shot through with premonition.", cover: "https://covers.openlibrary.org/b/id/8228572-L.jpg", openLibrary: "https://openlibrary.org/search?q=christopher+okigbo+labyrinths", tags: ["Poetry", "Modernist", "Biafra", "Igbo Culture"] },
  { id: 33, title: "The Bottled Leopard", author: "Chukwuemeka Ike", year: 1985, genre: "Novel", description: "A secondary school student is haunted by dreams of a leopard — a mystical link he cannot escape.", synopsis: "Amobi is a new secondary school student troubled by recurring dreams of a leopard. When his parents consult a dibia (traditional healer), they learn of a mystical connection between their son and the leopard. As the secret leaks at school, Amobi faces ridicule and ostracism. Chukwuemeka Ike weaves together school life and Igbo spirituality in this beloved coming-of-age novel.", cover: "https://covers.openlibrary.org/b/id/8228558-L.jpg", openLibrary: "https://openlibrary.org/search?q=bottled+leopard+chukwuemeka+ike", tags: ["Coming of Age", "School Life", "Igbo Culture", "Spirituality"] },
  { id: 34, title: "Toads for Supper", author: "Chukwuemeka Ike", year: 1965, genre: "Novel", description: "A university student is caught between competing romantic and family expectations in colonial-era Nigeria.", synopsis: "Set at the University of Ibadan, Toads for Supper follows Chike Obiora, a final-year student in love with Adaeze — a Yoruba girl his Igbo parents will never accept — while also being pursued by the daughter of a powerful Igbo chief. Comic in tone but sharp in its observations about tribalism, class, and parental pressure.", cover: "https://covers.openlibrary.org/b/id/8228560-L.jpg", openLibrary: "https://openlibrary.org/search?q=toads+for+supper+chukwuemeka+ike", tags: ["Comedy", "University Life", "Tribalism", "Love"] },
  { id: 35, title: "Eze Goes to School", author: "Onuora Nzekwu & Michael Crowder", year: 1963, genre: "Novel", description: "A village boy's determined journey to get an education against all odds — a beloved Nigerian childhood classic.", synopsis: "One of the most widely read books in Nigerian primary education. Eze, a bright village boy, is determined to attend school despite poverty and his father's lack of enthusiasm. The novel follows his struggles to raise school fees, navigate the school environment, and prove that education is worth fighting for. Honest, warm, and quietly inspiring, it shaped the reading lives of millions of Nigerian children.", cover: "https://covers.openlibrary.org/b/id/8228562-L.jpg", openLibrary: "https://openlibrary.org/search?q=eze+goes+to+school+nzekwu", tags: ["Children's", "Education", "Coming of Age"] },
  { id: 36, title: "A Woman in Her Prime", author: "Asare Konadu", year: 1967, genre: "Novel", description: "A Ghanaian woman with no children faces social shame — her desperate search for fertility drives the novel.", synopsis: "Pokuwaa is a woman of social standing who has never borne a child — in her community, the deepest possible failure. As she tries remedy after remedy — spiritual, herbal, marital — the novel becomes a moving meditation on womanhood, social expectation, and the cruelty of communities toward those who deviate from the norm. Long taught in Nigerian schools as part of the West African literary tradition.", cover: "https://covers.openlibrary.org/b/id/8228564-L.jpg", openLibrary: "https://openlibrary.org/search?q=a+woman+in+her+prime+konadu", tags: ["West African", "Women", "Tradition", "Ghana"] },
  { id: 37, title: "The Beautyful Ones Are Not Yet Born", author: "Ayi Kwei Armah", year: 1968, genre: "Novel", description: "An unnamed Ghanaian railway clerk resists corruption in a society that despises his integrity.", synopsis: "Set in post-independence Ghana under Kwame Nkrumah, this novel follows an unnamed man who refuses to take bribes despite the scorn of his wife, family, and colleagues. Armah's prose is dense and sensory — decay and rot everywhere, symbols of a nation that exchanged colonial masters for home-grown ones. When a coup arrives, the man watches the same corruption simply reassemble itself under new management.", cover: "https://covers.openlibrary.org/b/id/8228580-L.jpg", openLibrary: "https://openlibrary.org/search?q=beautyful+ones+are+not+yet+born+armah", tags: ["Pan-African", "Corruption", "Postcolonial", "Ghana"] },
  { id: 38, title: "Without a Silver Spoon", author: "Eddie Iroh", year: 1981, genre: "Novel", description: "A poor Nigerian boy's struggle to survive and succeed against the odds — a school classic.", synopsis: "Without a Silver Spoon was one of the most widely read novels in Nigerian secondary schools. It follows a young protagonist from a poor background determined to make something of his life through hard work, education, and resilience. Iroh's frank portrayal of poverty, ambition, and the struggle for dignity in Nigerian society made it enormously relatable to generations of students.", cover: "https://covers.openlibrary.org/b/id/8228598-L.jpg", openLibrary: "https://openlibrary.org/search?q=without+a+silver+spoon+eddie+iroh", tags: ["Novel", "Coming of Age", "Poverty", "School Life"] },
  { id: 39, title: "The Drummer Boy", author: "Cyprian Ekwensi", year: 1960, genre: "Novel", description: "Akin, a blind boy with extraordinary musical talent, navigates Lagos in search of his destiny.", synopsis: "One of Ekwensi's most beloved books for young readers. Akin is a blind boy whose gift for drumming is remarkable. Navigating the streets and social hierarchies of Lagos, Akin uses his music to survive, connect, and eventually find his place in the world. Ekwensi captures the texture of Lagos city life with his characteristic energy and empathy.", cover: "https://covers.openlibrary.org/b/id/8228600-L.jpg", openLibrary: "https://openlibrary.org/search?q=the+drummer+boy+cyprian+ekwensi", tags: ["Children's", "Lagos", "Music", "Coming of Age"] },
  { id: 40, title: "Jagua Nana", author: "Cyprian Ekwensi", year: 1961, genre: "Novel", description: "A glamorous, ageing Lagos woman pursues love and money in the chaos of Nigeria on the eve of independence.", synopsis: "Jagua Nana is Ekwensi's most celebrated novel and one of the great portraits of Lagos. Jagua is a middle-aged woman of stunning charm who makes her living from men — politicians, traders, young lovers — in the bars and dance halls of 1950s Lagos. Her tragic relationship with the young Freddie drives the plot through betrayal, violence, and political intrigue. Groundbreaking in its treatment of female sexuality and urban African life.", cover: "https://covers.openlibrary.org/b/id/8228602-L.jpg", openLibrary: "https://openlibrary.org/works/OL4264782W", tags: ["Novel", "Lagos", "Urban Life", "Women", "Classic"] },
  { id: 41, title: "The Passport of Mallam Ilia", author: "Cyprian Ekwensi", year: 1960, genre: "Novel", description: "A northern Nigerian trader's identity documents bring unexpected trouble in this taut school classic.", synopsis: "The Passport of Mallam Ilia is a compact, fast-moving novel set in northern Nigeria. Mallam Ilia, a simple trader, becomes entangled in trouble when his identity documents attract the wrong attention. Ekwensi illuminates questions of identity, ethnicity, and the vulnerabilities of ordinary Nigerians navigating bureaucratic and criminal systems. Its clarity and pace made it a staple of the secondary school curriculum for decades.", cover: "https://covers.openlibrary.org/b/id/8228604-L.jpg", openLibrary: "https://openlibrary.org/search?q=passport+of+mallam+ilia+ekwensi", tags: ["Novel", "Northern Nigeria", "Identity", "School Classic"] },
  { id: 42, title: "Burning Grass", author: "Cyprian Ekwensi", year: 1962, genre: "Novel", description: "A Fulani cattle herder and his family journey across northern Nigeria in this episodic pastoral novel.", synopsis: "Burning Grass is Ekwensi's lyrical novel of the Fulani people of northern Nigeria. Mai Sunsaye, a respected cattle herder, is struck by the wandering sickness — the 'Sokugo' — that compels him to leave his home. His sons scatter across the savannah trying to find him. Ekwensi renders the landscape of northern Nigeria with beauty and ethnographic care.", cover: "https://covers.openlibrary.org/b/id/8228606-L.jpg", openLibrary: "https://openlibrary.org/search?q=burning+grass+cyprian+ekwensi", tags: ["Novel", "Northern Nigeria", "Fulani Culture", "Pastoral"] },
  { id: 43, title: "Ralia the Sugar Girl", author: "Cyprian Ekwensi", year: 1965, genre: "Novel", description: "A sweet-selling girl navigates Lagos street life in this charming short novel for young readers.", synopsis: "Ralia the Sugar Girl is one of Ekwensi's most charming books for young readers. Ralia is a young girl who sells sweets on the streets of Lagos, navigating the city's energy, dangers, and kindnesses with resourcefulness and warmth. Ekwensi uses the child protagonist to illuminate the textures of Lagos city life — the markets, the street characters, the rhythms of urban survival.", cover: "https://covers.openlibrary.org/b/id/8228612-L.jpg", openLibrary: "https://openlibrary.org/search?q=ralia+the+sugar+girl+ekwensi", tags: ["Children's", "Lagos", "School Classic", "Urban Life"] },
  { id: 44, title: "An African Night's Entertainment", author: "Cyprian Ekwensi", year: 1962, genre: "Novel", description: "A gripping tale of love, jealousy, and generational revenge set in northern Nigeria.", synopsis: "An African Night's Entertainment is a suspenseful story-within-a-story set in the Lake Chad region. Abu Bakir Saddiq, a young man whose father died under mysterious circumstances, embarks on a quest for justice. Told in the tradition of oral storytelling — an elder narrating to a village audience — the novel weaves together love, betrayal, a devastating curse, and revenge in a way that feels both ancient and immediate.", cover: "https://covers.openlibrary.org/b/id/8228614-L.jpg", openLibrary: "https://openlibrary.org/search?q=african+night+entertainment+ekwensi", tags: ["Novel", "Northern Nigeria", "Revenge", "Oral Tradition", "School Classic"] },
  { id: 45, title: "One Week One Trouble", author: "Anezi Okoro", year: 1973, genre: "Novel", description: "The funniest Nigerian school novel — Chike's misadventures at boarding school are relentlessly entertaining.", synopsis: "Widely regarded as the funniest book in the Nigerian school canon, One Week One Trouble follows the irrepressible Chike through escalating scrapes at a Nigerian boarding school. Anezi Okoro writes with a comic touch and a sharp ear for schoolboy dialogue, capturing the hierarchies, pranks, punishments, and solidarity of secondary school life. Generations of Nigerian students have read this book with pure delight — and many rate it their favourite school text, decades later.", cover: "https://covers.openlibrary.org/b/id/8228608-L.jpg", openLibrary: "https://openlibrary.org/search?q=one+week+one+trouble+anezi+okoro", tags: ["Novel", "Comedy", "School Life", "Children's"] },
  { id: 46, title: "The Incorruptible Judge", author: "D. Olu Olagoke", year: 1962, genre: "Play", description: "A bribe-taking defendant meets a judge he cannot buy — a beloved primary school classic.", synopsis: "Written in simple, accessible language, The Incorruptible Judge has been a staple of Nigerian primary and junior secondary school reading lists since 1962. A guilty man on trial attempts every stratagem — bribery, mercy pleas, Shakespeare quotations — to escape justice. The judge refuses every overture and sentences him to three years hard labour. The play's clarity of purpose made it an ideal introduction to drama for young readers.", cover: "https://covers.openlibrary.org/b/id/8228610-L.jpg", openLibrary: "https://openlibrary.org/search?q=incorruptible+judge+olagoke", tags: ["Play", "Children's", "Justice", "School Classic"] },
  { id: 47, title: "The Only Son", author: "John Munonye", year: 1966, genre: "Novel", description: "A widow's fierce love for her only son collides with colonial education and Christian conversion in Igboland.", synopsis: "Set in an Igbo village in the early colonial period. Chiaku is a widow whose entire world revolves around her son Nnanna. When Nnanna is drawn toward the Christian mission school, the novel becomes a quiet, aching drama about the fractures colonialism introduced into family and community. Munonye writes with precision and deep sympathy.", cover: "https://covers.openlibrary.org/b/id/8228616-L.jpg", openLibrary: "https://openlibrary.org/search?q=the+only+son+john+munonye", tags: ["Novel", "Colonialism", "Igbo Culture", "Family", "Religion"] },
  { id: 48, title: "Efuru", author: "Flora Nwapa", year: 1966, genre: "Novel", description: "The first novel published in English by an African woman — a beautiful, independent Igbo woman searches for fulfilment beyond marriage.", synopsis: "Flora Nwapa's Efuru holds a landmark place in African literary history as the first novel in English published by an African woman. Efuru is beautiful, industrious, and admired by all — but her marriages fail and she cannot keep her children alive. Rather than defining herself by these losses, she turns to the worship of Uhamiri, the Woman of the Lake, a childless but universally beloved goddess.", cover: "https://covers.openlibrary.org/b/id/8228620-L.jpg", openLibrary: "https://openlibrary.org/works/OL4534876W", tags: ["Novel", "Feminism", "Igbo Culture", "Women", "Classic"] },
  { id: 49, title: "The Virtuous Woman", author: "Zaynab Alkali", year: 1987, genre: "Novel", description: "A northern Nigerian woman navigates marriage, education, and self-determination in a conservative society.", synopsis: "Zaynab Alkali was the first woman from northern Nigeria to publish a novel in English. The Virtuous Woman follows Nana, a woman trying to carve out a life of dignity and purpose within the constraints of northern Nigerian society. Alkali writes with quiet authority about the interior lives of women whose struggles rarely made it onto the page — their negotiations with tradition, faith, and personal aspiration.", cover: "https://covers.openlibrary.org/b/id/8228622-L.jpg", openLibrary: "https://openlibrary.org/search?q=the+virtuous+woman+zaynab+alkali", tags: ["Novel", "Northern Nigeria", "Women", "Feminism"] },
  { id: 50, title: "So Long a Letter", author: "Mariama Bâ", year: 1979, genre: "Novel", description: "A Senegalese woman writes a long letter to her friend after her husband takes a second wife — a masterpiece of African feminism.", synopsis: "Ramatoulaye has just lost her husband when she writes a long letter to her childhood friend Aissatou. In it she recounts the story of their marriages — each husband eventually taking a second wife. Mariama Bâ's slim novel is one of the most important works in African literature, written in luminous prose that balances grief, anger, solidarity, and hope. Winner of the inaugural Noma Award in 1980.", cover: "https://covers.openlibrary.org/b/id/8228624-L.jpg", openLibrary: "https://openlibrary.org/works/OL7993551W", tags: ["Novel", "Feminism", "Senegal", "West African", "Marriage"] },
  { id: 51, title: "The Secret Lives of Baba Segi's Wives", author: "Lola Shoneyin", year: 2010, genre: "Novel", description: "A boisterous polygamous household in Ibadan is upended when the fourth wife cannot conceive.", synopsis: "Baba Segi is a prosperous, self-satisfied Ibadan man with three wives — until he takes a fourth wife, Bolanle, a university graduate who cannot get pregnant. As fertility investigations threaten to expose secrets each wife has kept carefully hidden, Shoneyin builds a darkly comic and ultimately devastating portrait of a household and a marriage system. Told in rotation through each wife's voice — witty, brutal, and deeply humane.", cover: "https://covers.openlibrary.org/b/id/8228626-L.jpg", openLibrary: "https://openlibrary.org/works/OL15694874W", tags: ["Novel", "Contemporary", "Polygamy", "Women", "Ibadan"] },
  { id: 52, title: "The Blinkards", author: "Kobina Sekyi", year: 1915, genre: "Play", description: "A Ghanaian satirical comedy skewering Africans who abandon their culture to ape European ways.", synopsis: "Written as early as 1915, The Blinkards is one of the earliest African plays in English — a biting satirical comedy by Ghanaian lawyer and nationalist Kobina Sekyi. The play targets Ghanaians who have studied in England and returned with contempt for everything African. Sekyi's targets include fake European manners, the abandonment of indigenous dress and language, and the social pretensions of the colonial-era African middle class. Remarkably prescient and still funny.", cover: "https://covers.openlibrary.org/b/id/8228638-L.jpg", openLibrary: "https://openlibrary.org/search?q=the+blinkards+kobina+sekyi", tags: ["Play", "Ghana", "West African", "Satire", "Colonial", "Comedy"] },
  { id: 53, title: "Marriage of Anansewa", author: "Efua Sutherland", year: 1975, genre: "Play", description: "A crafty Ghanaian father tries to marry off his daughter to four chiefs simultaneously — Anansi the spider trickster as modern comedy.", synopsis: "Efua Sutherland's most celebrated play draws on the Anansi spider story tradition of Ghana to create a delightful modern comedy. Storyteller Ananse has promised his daughter Anansewa to four different chiefs at the same time, collecting bride gifts from all. When the chiefs all arrive to claim their bride, the plot escalates into wonderful chaos. Sutherland keeps the Ghanaian oral tradition alive in theatrical form — warm, funny, and culturally rich.", cover: "https://covers.openlibrary.org/b/id/8228640-L.jpg", openLibrary: "https://openlibrary.org/search?q=marriage+of+anansewa+efua+sutherland", tags: ["Play", "Ghana", "West African", "Comedy", "Oral Tradition"] },
  { id: 54, title: "Sizwe Bansi is Dead", author: "Athol Fugard, John Kani & Winston Ntshona", year: 1972, genre: "Play", description: "A South African man assumes a dead man's identity to escape the apartheid pass laws — a landmark of protest theatre.", synopsis: "Developed collaboratively in apartheid South Africa, Sizwe Bansi is Dead is one of the most powerful political plays of the 20th century. Sizwe Bansi cannot work legally without correct pass documents. When he discovers a dead man's passbook, he faces an agonising choice: assume the dead man's identity and live, or remain himself and face deportation. Performed in Nigerian schools as part of the South African protest literature tradition.", cover: "https://covers.openlibrary.org/b/id/8228642-L.jpg", openLibrary: "https://openlibrary.org/search?q=sizwe+bansi+is+dead+fugard", tags: ["Play", "South Africa", "Apartheid", "Political", "Protest"] },
  { id: 55, title: "The Boy Slave", author: "Kola Onadipe", year: 1966, genre: "Novel", description: "A young boy is sold into slavery in 19th-century Yorubaland and must find his way back to freedom.", synopsis: "A gripping historical adventure for young readers, set in 19th-century Yorubaland during the era of inter-tribal wars and the slave trade. When a young Yoruba boy is captured and sold as a slave, he endures hardship, cruelty, and loss — but never stops seeking freedom and reunion with his family. Onadipe combines historical education with genuine narrative excitement.", cover: "https://covers.openlibrary.org/b/id/8228644-L.jpg", openLibrary: "https://openlibrary.org/search?q=the+boy+slave+kola+onadipe", tags: ["Novel", "Children's", "Slavery", "Historical", "Yoruba Culture"] },
  { id: 56, title: "Akpan and the Smugglers", author: "Rosemary Uwemedimo", year: 1965, genre: "Novel", description: "A young Nigerian boy stumbles upon a smuggling operation and must find the courage to do the right thing.", synopsis: "A classic of Nigerian children's literature. Akpan, a young boy from the Niger Delta, accidentally discovers a gang of smugglers operating in his community. Facing pressure, threats, and his own fear, Akpan must decide whether to report what he knows. Uwemedimo creates a thriller for young readers that asks hard questions about courage and civic responsibility.", cover: "https://covers.openlibrary.org/b/id/8228646-L.jpg", openLibrary: "https://openlibrary.org/search?q=akpan+and+the+smugglers+uwemedimo", tags: ["Novel", "Children's", "Niger Delta", "Adventure"] },
  { id: 57, title: "Lonely Days", author: "Bayo Adebowale", year: 1996, genre: "Novel", description: "A Yoruba widow refuses to submit to the dehumanising rituals demanded of her — a quietly radical novel.", synopsis: "In Lonely Days, Bayo Adebowale portrays Yaremi, a widow in a Yoruba community who resists the traditional rituals widowhood demands — isolation, degradation, remarriage to her dead husband's brother. Unlike the women around her who comply, Yaremi maintains her dignity and lives on her own terms while the community watches and judges. Adebowale's spare prose and quiet radicalism have made this a quietly influential text.", cover: "https://covers.openlibrary.org/b/id/8228648-L.jpg", openLibrary: "https://openlibrary.org/search?q=lonely+days+bayo+adebowale", tags: ["Novel", "Yoruba Culture", "Widowhood", "Women", "Feminism"] },
  { id: 58, title: "The Ugly Ones Refuse to Die", author: "Habib Yakoob", year: 1990, genre: "Novel", description: "A darkly comic Nigerian novel about corruption, survival, and the people who refuse to be destroyed by a broken system.", synopsis: "Habib Yakoob's satirical novel is set in the corrupt landscape of postcolonial Nigeria. Its title captures a bleak but funny truth: in a society that rewards dishonesty and punishes integrity, the morally compromised seem to thrive while the decent struggle. Yakoob writes with a sharp, sardonic wit, producing a novel that makes you laugh at the same things that should make you despair.", cover: "https://covers.openlibrary.org/b/id/8228650-L.jpg", openLibrary: "https://openlibrary.org/search?q=ugly+ones+refuse+to+die+yakoob", tags: ["Novel", "Satire", "Corruption", "Comedy"] },
  { id: 59, title: "Nervous Conditions", author: "Tsitsi Dangarembga", year: 1988, genre: "Novel", description: "A Zimbabwean girl pursues education as her cousin is destroyed by it — one of Africa's essential feminist novels.", synopsis: "Set in 1960s Rhodesia, Nervous Conditions follows Tambudzai, a rural girl who gains access to an elite mission school. As she is absorbed into the colonial education system, her cousin Nyasha — educated in England and furious at the world — is slowly destroyed by an eating disorder and the contradictions of being a colonised, Westernised African woman. One of the most important African texts of the 20th century.", cover: "https://covers.openlibrary.org/b/id/8228652-L.jpg", openLibrary: "https://openlibrary.org/works/OL4296990W", tags: ["Pan-African", "Feminism", "Colonialism", "Zimbabwe", "Education"] },
  { id: 60, title: "God's Bits of Wood", author: "Ousmane Sembène", year: 1960, genre: "Novel", description: "The great strike on the Dakar-Niger railway in 1947 — African workers stand against French colonial power.", synopsis: "Based on the real 1947–48 strike on the Dakar-Niger railway, God's Bits of Wood follows workers and their families across three cities — Bamako, Thiès, and Dakar — as they hold out for months against the French colonial railway company. Sembène builds a vast, polyphonic novel in which women emerge as the strike's most determined force. One of the great political novels of the 20th century.", cover: "https://covers.openlibrary.org/b/id/8228654-L.jpg", openLibrary: "https://openlibrary.org/works/OL4316534W", tags: ["Pan-African", "Senegal", "Labour", "Colonial", "Political"] },
  { id: 61, title: "Ambiguous Adventure", author: "Cheikh Hamidou Kane", year: 1961, genre: "Novel", description: "A Senegalese boy is sent to French school by his people — and loses himself between two worlds.", synopsis: "Samba Diallo is the most gifted student of his generation, steeped in Quranic learning. When his people decide he must be sent to the French colonial school — and ultimately to Paris — to learn the conquerors' tools, the decision sets him on a path of profound cultural and spiritual dislocation. Kane's prose is philosophical and achingly beautiful, making this one of the most searching meditations on colonialism, faith, and identity ever written.", cover: "https://covers.openlibrary.org/b/id/8228656-L.jpg", openLibrary: "https://openlibrary.org/works/OL4655927W", tags: ["Pan-African", "Senegal", "Colonialism", "Faith", "Identity"] },
  { id: 62, title: "Petals of Blood", author: "Ngũgĩ wa Thiong'o", year: 1977, genre: "Novel", description: "Four suspects in the murder of three African directors lead us through Kenya's postcolonial betrayals.", synopsis: "Four residents of the fictional town of Ilmorog are arrested following the murder of three African company directors. As each character's past is revealed through a nonlinear structure, Ngũgĩ builds a panoramic indictment of neocolonialism — the African elite that replaced European oppressors while maintaining their systems of exploitation. Angry, passionate, and formally ambitious.", cover: "https://covers.openlibrary.org/b/id/8228576-L.jpg", openLibrary: "https://openlibrary.org/works/OL2739830W", tags: ["Pan-African", "Postcolonial", "Political", "Kenya"] },
  { id: 63, title: "Weep Not, Child", author: "Ngũgĩ wa Thiong'o", year: 1964, genre: "Novel", description: "A young Kenyan boy's education is shattered by the Mau Mau uprising — the first East African novel in English.", synopsis: "Weep Not, Child tells the story of Njoroge, a boy from a poor Kenyan family who pins his hopes on education as the path to a better life. But as the Mau Mau rebellion against British colonial rule erupts around him, Njoroge's family is torn apart, his school friends are lost to violence, and his faith — in God, in education, in the future — is systematically destroyed. Quietly devastating.", cover: "https://covers.openlibrary.org/b/id/8228578-L.jpg", openLibrary: "https://openlibrary.org/works/OL2739828W", tags: ["Pan-African", "Coming of Age", "Colonialism", "Kenya"] },
  { id: 64, title: "The River Between", author: "Ngũgĩ wa Thiong'o", year: 1965, genre: "Novel", description: "Two rival Kenyan ridges divided by a river — one Christian, one traditional — and the man who tries to bridge them.", synopsis: "Set in Kenya's highlands before the Mau Mau rebellion, The River Between tells the story of Waiyaki, a young man who dreams of uniting the rival ridges of Kameno and Makuyu. Kameno holds to traditional Kikuyu customs; Makuyu has converted to Christianity. When Waiyaki falls in love with the daughter of the most zealous Christian convert, the personal and political become inseparable.", cover: "https://covers.openlibrary.org/b/id/8228636-L.jpg", openLibrary: "https://openlibrary.org/works/OL2739826W", tags: ["Pan-African", "Kenya", "Colonialism", "Religion", "Love"] },
  { id: 65, title: "The Trials of Dedan Kimathi", author: "Ngũgĩ wa Thiong'o & Mĩcere Mũgo", year: 1976, genre: "Play", description: "The trial of Kenya's Mau Mau leader becomes a defiant celebration of anti-colonial resistance.", synopsis: "Written jointly by Ngũgĩ and Mĩcere Githae Mũgo, this play dramatises the imprisonment and trial of the legendary Mau Mau leader. Rejecting the colonial narrative that cast Kimathi as a criminal, the play portrays him as a freedom fighter and martyr. Structured around dream sequences, historical vignettes, and direct confrontation between Kimathi and his British captors, it is one of the most powerful works of African protest theatre.", cover: "https://covers.openlibrary.org/b/id/8228660-L.jpg", openLibrary: "https://openlibrary.org/search?q=trials+of+dedan+kimathi+ngugi", tags: ["Play", "Pan-African", "Kenya", "Resistance", "Colonial"] },
  { id: 66, title: "In Dependence", author: "Sarah Ladipo Manyika", year: 2008, genre: "Novel", description: "A Nigerian student at Oxford falls in love in the 1960s — a relationship that echoes across decades and continents.", synopsis: "Tayo Ajayi arrives at Oxford from Nigeria in 1963, full of optimism about independence, education, and the future. He falls in love with Vanessa, an English girl, and their relationship becomes a lens through which Manyika examines the idealism and disillusionment of post-independence Africa. The novel moves across decades, following the ripples of that early love through Tayo's life in a transforming Nigeria.", cover: "https://covers.openlibrary.org/b/id/8228634-L.jpg", openLibrary: "https://openlibrary.org/search?q=in+dependence+sarah+ladipo+manyika", tags: ["Novel", "Diaspora", "Love", "Independence Era"] },
  { id: 67, title: "The Last Days at Forcados High School", author: "A.H. Mohammed", year: 1994, genre: "Novel", description: "The final year of school brings friendships, rivalries, and moral tests for a group of Nigerian students.", synopsis: "A.H. Mohammed's novel is a vivid portrait of final-year life at a Nigerian secondary school — the friendships, the exam pressure, the petty rivalries, the romantic entanglements, and the ethical choices that test young people approaching adulthood. Written with warmth and authenticity, it captures the texture of Nigerian boarding school life in a way that felt immediately real to thousands of students.", cover: "https://covers.openlibrary.org/b/id/8228632-L.jpg", openLibrary: "https://openlibrary.org/search?q=last+days+forcados+high+school", tags: ["Novel", "School Life", "Coming of Age", "Nigeria"] },
  { id: 68, title: "Daughters Who Walk This Path", author: "Yejide Kilanko", year: 2012, genre: "Novel", description: "A young Nigerian girl's life is shattered by sexual abuse — a novel about trauma, silence, and the possibility of healing.", synopsis: "Set in 1980s Ibadan, Daughters Who Walk This Path follows Morayo and her sister Eniayo growing up in a warm, middle-class family. When Morayo is sexually abused by a trusted family member, the silence that closes around the act slowly poisons everything. Kilanko writes about trauma, complicity, and survival with great care, tracing Morayo's path from silence toward the possibility of speaking and healing.", cover: "https://covers.openlibrary.org/b/id/8228662-L.jpg", openLibrary: "https://openlibrary.org/search?q=daughters+who+walk+this+path+kilanko", tags: ["Novel", "Contemporary", "Trauma", "Women", "Ibadan"] },
  { id: 69, title: "The Death of Vivek Oji", author: "Akwaeke Emezi", year: 2020, genre: "Novel", description: "A dazzling, heartbreaking Nigerian novel about grief, queerness, secrecy, and the struggle to live beyond the identities others impose.", synopsis: "Akwaeke Emezi's novel opens with Vivek Oji's body on his family's doorstep, then circles back through friendships, family tensions, and private awakenings to show how that death came to be. Set in southeastern Nigeria, it is at once a coming-of-age story, a portrait of chosen kinship, and an indictment of the violence done to those who refuse easy categorisation. Tender, urgent, and devastating.", cover: "", openLibrary: "https://openlibrary.org/search?q=the+death+of+vivek+oji+akwaeke+emezi", tags: ["Novel", "Contemporary", "Queer", "Identity", "Nigeria"] },
  { id: 70, title: "Hidden Star", author: "K. Sello Duiker", year: 2006, genre: "Novel", description: "A South African girl discovers a mysterious stone that seems to promise escape from poverty, danger, and ordinary life.", synopsis: "Hidden Star follows Nolitye, a young girl living with her grandmother in a Johannesburg township, after she finds a magical stone that appears to grant wishes. Duiker blends fable, urban realism, and social critique, turning a simple discovery into a story about desire, innocence, and the hard edges of life for children in post-apartheid South Africa. Frequently taught alongside African school texts.", cover: "", openLibrary: "https://openlibrary.org/search?q=hidden+star+k+sello+duiker", tags: ["Novel", "South Africa", "Children's", "Magical Realism", "Urban Life"] },
  { id: 71, title: "Boy on a Swing", author: "Oswald Mbuyiseni Mtshali", year: 1971, genre: "Poetry", description: "A spare, unsettling poem in which the image of a child on a swing opens into the racial violence beneath apartheid normality.", synopsis: "Oswald Mbuyiseni Mtshali's poem is deceptively simple: a child swings through the air while the speaker's mind turns toward the brutal divisions of apartheid South Africa. In a few compressed lines, the poem contrasts motion and innocence with surveillance, separation, and fear. It became a staple of African poetry study because of how much political charge it carries in such a small space.", cover: "", openLibrary: "https://openlibrary.org/search?q=boy+on+a+swing+mtshali", tags: ["Poetry", "South Africa", "Apartheid", "School Classic", "African Poetry"] },
  { id: 72, title: "Oliver Twist", author: "Charles Dickens", year: 1838, genre: "Novel", description: "An orphan survives the brutal machinery of Victorian London, drifting through workhouses, crime, and cruelty in search of a life that can still hold innocence.", synopsis: "Oliver Twist follows an orphan born into poverty and pushed through the grim institutions of Victorian England. Escaping the workhouse, he is drawn into London's underworld by thieves, pickpockets, and exploiters before discovering truths about his own origins. Dickens mixes melodrama, satire, and social criticism to attack the indifference of a society that criminalises the poor while profiting from their misery.", cover: "", openLibrary: "https://openlibrary.org/works/OL46714W", tags: ["Classic", "Victorian", "Orphan", "Social Critique"] },
  { id: 73, title: "Lord of the Flies", author: "William Golding", year: 1954, genre: "Novel", description: "A group of schoolboys stranded on an island build their own society, then watch it collapse into fear, ritual, and violence.", synopsis: "In Lord of the Flies, a plane crash leaves a group of British boys marooned on an uninhabited island. What begins as an attempt at orderly self-government turns into factionalism, superstition, and bloodshed. Golding's novel is a spare, brutal allegory about civilisation, power, and the darkness that can emerge when authority disappears.", cover: "", openLibrary: "https://openlibrary.org/works/OL10327244W", tags: ["Classic", "Allegory", "Survival", "School Classic"] },
  { id: 74, title: "The Tempest", author: "William Shakespeare", year: 1611, genre: "Play", description: "A deposed duke conjures storm, theatre, forgiveness, and revenge on a remote island where power itself becomes a performance.", synopsis: "The Tempest stages the story of Prospero, a duke-magician marooned on an island with his daughter Miranda. When his political enemies sail near, he summons a storm and manipulates everyone into his carefully designed drama of reckoning. The play moves between wonder and menace, colonial tension and reconciliation, and remains one of Shakespeare's richest meditations on authority, illusion, and mercy.", cover: "", openLibrary: "https://openlibrary.org/search?q=the+tempest+shakespeare", tags: ["Play", "Classic", "Shakespeare", "Power"] },
  { id: 75, title: "The Merchant of Venice", author: "William Shakespeare", year: 1600, genre: "Play", description: "Debt, desire, law, and prejudice collide in a play where comedy and cruelty are impossible to separate cleanly.", synopsis: "Set between Venice and Belmont, The Merchant of Venice turns on a dangerous financial bond between Antonio and the moneylender Shylock. Around that central bargain move questions of friendship, romance, justice, and anti-Jewish prejudice. Shakespeare's play remains unsettling because it refuses to stay comfortably comic: wit and beauty sit beside humiliation, exclusion, and the violence of the law.", cover: "", openLibrary: "https://openlibrary.org/search?q=merchant+of+venice+shakespeare", tags: ["Play", "Classic", "Shakespeare", "Law", "Prejudice"] },
  { id: 76, title: "The Old Man and the Sea", author: "Ernest Hemingway", year: 1952, genre: "Novel", description: "An ageing Cuban fisherman wages a solitary battle with a giant marlin, turning endurance itself into an epic.", synopsis: "Hemingway's short novel follows Santiago, an old fisherman who has gone eighty-four days without a catch. When he hooks an enormous marlin far out at sea, the struggle becomes physical, spiritual, and nearly mythic. Written in stripped-down prose, it is a work about pride, loneliness, dignity, and what remains when victory and defeat can no longer be cleanly separated.", cover: "", openLibrary: "https://openlibrary.org/works/OL13637126W", tags: ["Classic", "Sea", "Endurance", "Novella"] },
  { id: 77, title: "The Great Gatsby", author: "F. Scott Fitzgerald", year: 1925, genre: "Novel", description: "A glittering American summer of parties and longing reveals the emptiness beneath wealth, reinvention, and desire.", synopsis: "Narrated by Nick Carraway, The Great Gatsby charts his fascination with the mysterious millionaire Jay Gatsby and Gatsby's obsessive love for Daisy Buchanan. Set in the Jazz Age, the novel moves through spectacle, class anxiety, and emotional ruin to expose the illusions of the American Dream. Fitzgerald's style is luminous and compressed, making the book both seductive and devastating.", cover: "", openLibrary: "https://openlibrary.org/works/OL276501W", tags: ["Classic", "American", "Wealth", "Tragedy"] },
  { id: 78, title: "Hamlet", author: "William Shakespeare", year: 1603, genre: "Play", description: "A prince haunted by murder, grief, and disgust delays revenge until thought itself becomes a trap.", synopsis: "After the ghost of his father reveals he was murdered by Hamlet's uncle, the prince of Denmark struggles to act. Hamlet's intellect turns every moral demand into another question, and the court around him becomes a theatre of spying, performance, and decay. The play's power lies in its psychological intensity: revenge is the plot, but consciousness is the real battlefield.", cover: "", openLibrary: "https://openlibrary.org/search?q=hamlet+shakespeare", tags: ["Play", "Classic", "Shakespeare", "Tragedy"] },
  { id: 79, title: "Robinson Crusoe", author: "Daniel Defoe", year: 1719, genre: "Novel", description: "Shipwreck transforms an impulsive traveller into a solitary empire of one, forcing survival, faith, and colonial fantasy into a single story.", synopsis: "Robinson Crusoe recounts the years its protagonist spends stranded on a remote island after a shipwreck. He builds shelter, domesticates the landscape, interprets hardship through religion, and eventually encounters Friday, whose presence shifts the novel into questions of power and empire. Often called one of the first English novels, it remains influential and deeply revealing about survival and colonial imagination.", cover: "", openLibrary: "https://openlibrary.org/works/OL17130608W", tags: ["Classic", "Adventure", "Survival", "Colonialism"] },
  { id: 80, title: "Heart of Darkness", author: "Joseph Conrad", year: 1899, genre: "Novella", description: "A journey up the Congo River becomes a descent into empire's violence, moral corruption, and the stories Europe tells about itself.", synopsis: "Told through the sailor Marlow, Heart of Darkness follows an expedition into the Belgian Congo to find the elusive ivory agent Kurtz. What begins as a colonial mission becomes an encounter with exploitation, brutality, and the instability of supposedly civilised values. Conrad's novella remains central and controversial, both for its critique of empire and for the limits and distortions of its own gaze.", cover: "", openLibrary: "https://openlibrary.org/works/OL47198W", tags: ["Classic", "Colonialism", "Novella", "Empire"] },
  { id: 81, title: "Tess of the D'Urbervilles", author: "Thomas Hardy", year: 1891, genre: "Novel", description: "A beautiful country girl's life is destroyed by the cruelties of men and the hypocrisies of Victorian moral law.", synopsis: "Tess Durbeyfield is a poor rural girl whose family discovers a distant claim to noble ancestry — a discovery that sets in motion seduction, murder, and flight across Wessex. Hardy traces her story with extraordinary sympathy and controlled fury, subtitling the novel 'A Pure Woman' as a deliberate provocation at his society's double standards. One of the great feminist novels of Victorian literature, taught widely in Nigerian schools for its study of fate, class, and injustice.", cover: "", openLibrary: "https://openlibrary.org/works/OL47513W", tags: ["Classic", "Victorian", "Women", "Tragedy"] },
  { id: 82, title: "Animal Farm", author: "George Orwell", year: 1945, genre: "Novella", description: "A farm's animals overthrow their human farmer, only to find the revolution consumed by the pigs' growing hunger for power.", synopsis: "All animals are equal, but some animals are more equal than others. Orwell's political fable follows the animals of Manor Farm as they rebel against Farmer Jones and establish their own self-governing community. Gradually the pigs — led by the cunning Napoleon — consolidate power, rewrite history, and reproduce every tyranny of the regime they replaced. A satire of the Soviet Union under Stalin, it remains one of the most widely read books in the world and a definitive account of how revolutions betray themselves.", cover: "", openLibrary: "https://openlibrary.org/works/OL1084537W", tags: ["Classic", "Satire", "Political", "Allegory", "Novella"] },
  { id: 83, title: "The Importance of Being Earnest", author: "Oscar Wilde", year: 1895, genre: "Play", description: "Two young men maintain fictional identities to escape social obligations — Wilde's wittiest attack on Victorian propriety.", synopsis: "Jack Worthing invented a troublesome brother called Ernest to excuse trips to London; Algernon Moncrieff invented an invalid friend called Bunbury for similar reasons. When both men wish to be known as Ernest to impress the women they love, their fictions collide with hilarious consequences. Wilde's masterpiece of comic dialogue packs more brilliant epigrams per page than almost any play in English — mocking Victorian morality, class pretension, and the institution of marriage with perfect comic timing.", cover: "", openLibrary: "https://openlibrary.org/works/OL15084846W", tags: ["Play", "Comedy", "Victorian", "Classic", "Satire"] },
  { id: 84, title: "Arms and the Man", author: "George Bernard Shaw", year: 1894, genre: "Play", description: "A Swiss mercenary sheltering in a Bulgarian girl's bedroom dismantles every romantic idea she holds about war and heroism.", synopsis: "Set during the Serbo-Bulgarian War of 1885, Arms and the Man opens as the Swiss mercenary Captain Bluntschli takes refuge in the bedroom of the Bulgarian Raina Petkoff. Raina worships her fiancé Saranoff, hero of a famous cavalry charge. But Bluntschli — who carries chocolate instead of ammunition and considers the charge suicidal folly — deflates every illusion she holds about soldiers and war. Shaw's anti-romantic comedy skewers militarism, class pretension, and sentimental love with characteristic wit.", cover: "", openLibrary: "https://openlibrary.org/search?q=arms+and+the+man+george+bernard+shaw", tags: ["Play", "Comedy", "Classic", "War", "Satire"] },
  { id: 85, title: "She Stoops to Conquer", author: "Oliver Goldsmith", year: 1773, genre: "Play", description: "A man paralysed by shyness before ladies of quality is tricked into treating his beloved's home as an inn — with comic results.", synopsis: "Charles Marlow is witty and confident with women he considers his social inferiors but struck dumb before ladies of quality. When he arrives at the Hardcastle house — having been mischievously told it is an inn — he treats the family as innkeeper and servants, giving Miss Hardcastle the perfect opportunity to pursue him as herself. Goldsmith's comedy of manners is warm, fast, and structurally perfect — one of the great comedies of the English stage and a staple of Nigerian secondary school drama.", cover: "", openLibrary: "https://openlibrary.org/search?q=she+stoops+to+conquer+oliver+goldsmith", tags: ["Play", "Comedy", "Classic", "18th Century"] },
  { id: 86, title: "Othello", author: "William Shakespeare", year: 1603, genre: "Play", description: "A Moorish general's ensign engineers his destruction through jealousy and insinuation — Shakespeare's most intimate tragedy of race and trust.", synopsis: "Othello, a celebrated Moorish general in Venetian service, has married Desdemona. His ensign Iago, passed over for promotion, systematically destroys him through precisely targeted lies and planted evidence. As jealousy consumes Othello's reason, Shakespeare produces one of his most psychologically precise tragedies — a study of how love and trust can be weaponised, and how race shapes every relationship in the play. Taught widely across Africa as a study in manipulation, jealousy, and the cost of otherness.", cover: "", openLibrary: "https://openlibrary.org/search?q=othello+william+shakespeare", tags: ["Play", "Classic", "Shakespeare", "Tragedy", "Race"] },
  { id: 87, title: "Nineteen Eighty-Four", author: "George Orwell", year: 1949, genre: "Novel", description: "In a totalitarian state where even thought is monitored, a clerk's small acts of rebellion are observed before they begin.", synopsis: "Winston Smith lives in Airstrip One, ruled by the Party and its figurehead Big Brother. The Party controls reality itself — rewriting history, monitoring citizens through telescreens, and destroying independent thought through torture. Winston's tentative rebellion — a secret diary, a love affair with Julia, contact with a supposed underground resistance — is watched from the beginning. Orwell's nightmare of permanent surveillance, manufactured consent, and the erasure of objective truth became the defining political dystopia of the twentieth century.", cover: "", openLibrary: "https://openlibrary.org/works/OL1168007W", tags: ["Classic", "Dystopia", "Political", "Satire"] },
  { id: 88, title: "Wuthering Heights", author: "Emily Brontë", year: 1847, genre: "Novel", description: "A foundling's obsessive love and decades of revenge — one of literature's most violent and haunting explorations of passion.", synopsis: "Heathcliff arrives at Wuthering Heights as a mysterious foundling and grows up wild and inseparable from Catherine Earnshaw. When she marries the wealthy Edgar Linton instead of him, he vanishes — returning years later as a rich, cold man bent on destroying both families. Emily Brontë structures the novel through layers of narration that slowly reveal its violence and psychological depth. The novel refuses any comfortable moral framework, making Heathcliff one of literature's most compelling anti-heroes.", cover: "", openLibrary: "https://openlibrary.org/works/OL1168300W", tags: ["Classic", "Victorian", "Gothic", "Tragedy"] },
  { id: 89, title: "The African Child", author: "Camara Laye", year: 1953, genre: "Novel", description: "A Guinean boy's lyrical memoir of childhood in a Malinke village — and the bittersweet price of education and departure.", synopsis: "Camara Laye's autobiographical novel recalls his childhood in Kouroussa, Guinea — his father's goldsmith compound, his mother's spiritual power, the rhythms of Malinke village life, and the long path through school in Conakry and eventually to France. Written with extraordinary tenderness and sensory precision, The African Child is a meditation on belonging, loss, and the irreversibility of education. Published in French as L'Enfant Noir, it is one of the most widely read African memoirs and is taught across both Francophone and Anglophone Africa.", cover: "", openLibrary: "https://openlibrary.org/works/OL1839155W", tags: ["Pan-African", "Memoir", "Coming of Age", "Guinea", "Education"] },
  { id: 90, title: "Woman at Point Zero", author: "Nawal El Saadawi", year: 1975, genre: "Novel", description: "An Egyptian woman on death row for murder tells the story of a life defined by men's violence — and her one act of refusal.", synopsis: "Nawal El Saadawi met the real woman behind this novel in an Egyptian prison. Firdaus has killed a man and refuses to appeal her death sentence. Her story — childhood abuse, forced marriage, survival through prostitution, and a final moment of lethal refusal — is rendered in prose of controlled, devastating clarity. One of the most important novels from the Arab world and from the global feminist tradition; widely taught in Nigeria as part of the African and world literature canon.", cover: "", openLibrary: "https://openlibrary.org/search?q=woman+at+point+zero+nawal+el+saadawi", tags: ["Pan-African", "Feminism", "Egypt", "Women", "Protest"] },
  { id: 91, title: "Murder in the Cathedral", author: "T.S. Eliot", year: 1935, genre: "Play", description: "Archbishop Thomas Becket faces the subtlest temptation — the desire to be martyred for pride, not faith.", synopsis: "T.S. Eliot's verse drama stages the final days of Thomas Becket, Archbishop of Canterbury, before his murder in 1170. The play's psychological core is a series of temptations Becket faces — the last and most insidious being the pride of martyrdom: the desire to will his own death in order to be remembered as a saint. Eliot's grave, liturgical verse elevates the drama toward ritual, producing one of the great religious plays of the twentieth century and a staple of the West African school canon.", cover: "", openLibrary: "https://openlibrary.org/search?q=murder+in+the+cathedral+ts+eliot", tags: ["Play", "Classic", "Historical", "Religion"] },
  { id: 92, title: "Macbeth", author: "William Shakespeare", year: 1606, genre: "Play", description: "A Scottish general murders his way to the throne — and finds that power seized through blood demands more blood to hold.", synopsis: "Three witches prophesy that Macbeth will become King of Scotland. Urged on by his wife, he murders the king and takes the throne, setting in motion a chain of violence that destroys him. Shakespeare compresses a reign of terror into five acts with extraordinary psychological efficiency. Macbeth and Lady Macbeth are among his most fully realised portraits — two people who discover that the act they committed cannot be undone, only compounded, until nothing remains.", cover: "", openLibrary: "https://openlibrary.org/search?q=macbeth+william+shakespeare", tags: ["Play", "Classic", "Shakespeare", "Tragedy"] },
  { id: 93, title: "Native Son", author: "Richard Wright", year: 1940, genre: "Novel", description: "A young Black man in 1930s Chicago kills accidentally and is consumed by the machinery of a racist justice system.", synopsis: "Bigger Thomas works as a chauffeur for a wealthy white Chicago family. When he accidentally kills their daughter, the killing is unintentional — but the racism of the press and justice system cannot allow that complexity. Richard Wright's naturalist novel forces readers to confront not just the act but the social conditions that shaped Bigger: the poverty, segregation, fear, and humiliation of Black life in 1930s America. One of the most important and disturbing novels of the twentieth century.", cover: "", openLibrary: "https://openlibrary.org/works/OL15164U", tags: ["Pan-African", "Diaspora", "Racism", "America", "Classic"] },
  { id: 94, title: "Black Boy", author: "Richard Wright", year: 1945, genre: "Novel", description: "Richard Wright's autobiography — growing up Black in the Jim Crow South, surviving on hunger, anger, and the determination to write.", synopsis: "Black Boy is Richard Wright's autobiographical account of his childhood and adolescence in Mississippi and Tennessee during the era of Jim Crow. He describes literal hunger, the constant threat of white violence, the difficult negotiations required to survive, and the gradual formation of his identity as a writer. His account of leaving the South for Chicago gives the memoir the structure of a liberation narrative — though Wright is honest about the limits of that liberation. Essential reading alongside Native Son.", cover: "", openLibrary: "https://openlibrary.org/works/OL15163U", tags: ["Pan-African", "Memoir", "Diaspora", "Racism", "America"] },
  { id: 95, title: "Great Expectations", author: "Charles Dickens", year: 1861, genre: "Novel", description: "A poor blacksmith's apprentice is secretly given the means to become a gentleman — and learns what those expectations really cost.", synopsis: "Pip grows up poor on the Kent marshes, dreaming of becoming a gentleman and winning the cold, beautiful Estella. When he mysteriously receives money and is sent to London to be educated, he assumes his benefactor is the eccentric Miss Havisham. When the truth arrives — shocking and morally complicated — Pip must re-examine every assumption he has made about class, wealth, and worth. Dickens's most carefully structured novel — an education in conscience, guilt, and the real meaning of a good man.", cover: "", openLibrary: "https://openlibrary.org/works/OL14922951W", tags: ["Classic", "Victorian", "Coming of Age", "Class"] },
  { id: 96, title: "The Trial of Brother Jero", author: "Wole Soyinka", year: 1964, genre: "Play", description: "A self-appointed Lagos beach prophet manipulates his credulous congregation in Soyinka's earliest satire of Nigerian religious charlatanism.", synopsis: "Brother Jero has claimed a stretch of Lagos Bar Beach as his territory and built a loyal congregation around his prophetic performances. He is vain, manipulative, and thoroughly cynical — a fraud who is genuinely expert at his craft. When his old teacher arrives to reclaim him and a bumbling, ambitious politician becomes his most devoted follower, the comedy escalates into farce. Soyinka's first major play established his satirical voice and his enduring concern with the fraudulent uses of religious authority.", cover: "", openLibrary: "https://openlibrary.org/search?q=trial+of+brother+jero+wole+soyinka", tags: ["Play", "Comedy", "Satire", "Lagos", "Religion", "Yoruba Culture"] },
  { id: 97, title: "The Potter's Wheel", author: "Chukwuemeka Ike", year: 1973, genre: "Novel", description: "A boy sent by his ambitious father to a demanding government secondary school learns survival, discipline, and his own shape.", synopsis: "Obu Onuoha is twelve when his determined father wins him a place at a prestigious government secondary school. The novel follows his adjustment to the hierarchies, punishments, friendships, and small cruelties of boarding school life — and his gradual emergence as his own person under sustained pressure. Chukwuemeka Ike draws on deep knowledge of the Nigerian secondary school system to produce a coming-of-age story that generations of students recognised immediately as true to their own experience.", cover: "", openLibrary: "https://openlibrary.org/search?q=the+potter%27s+wheel+chukwuemeka+ike", tags: ["Novel", "School Life", "Coming of Age", "Nigeria", "Education"] },
  { id: 98, title: "To Kill a Mockingbird", author: "Harper Lee", year: 1960, genre: "Novel", description: "A white Alabama lawyer defends a Black man falsely accused of rape — seen through his young daughter's eyes.", synopsis: "Atticus Finch agrees to defend Tom Robinson, a Black man accused of raping a white woman in Depression-era Maycomb, Alabama, where the verdict is predetermined by race. His daughter Scout narrates the events with a child's sharp, unsentimental eye. Harper Lee's novel became one of the most widely read books in the world — taught as a story of moral courage and racial injustice. Later critics have also examined the limits of its portrait of white liberalism as the primary agent of racial progress.", cover: "", openLibrary: "https://openlibrary.org/works/OL450777W", tags: ["Classic", "American", "Race", "Justice", "Coming of Age"] },
  { id: 99, title: "Gulliver's Travels", author: "Jonathan Swift", year: 1726, genre: "Novel", description: "A ship's surgeon visits lands of tiny people, giants, and intelligent horses — Swift's savage satire of human pride and folly.", synopsis: "Lemuel Gulliver's four voyages take him to Lilliput (where tiny people wage absurd wars over egg-cracking), Brobdingnag (where giants find human beings contemptible), the flying island of Laputa with its useless Academy of projectors, and finally to the land of the Houyhnhnms — rational, gentle horses who govern themselves while the brutish Yahoos, unmistakably human, wallow in filth. Swift's satire grows progressively darker, ending with Gulliver unable to tolerate the company of his own species.", cover: "", openLibrary: "https://openlibrary.org/works/OL46803W", tags: ["Classic", "Satire", "Fantasy", "Novel"] },
  { id: 100, title: "The Mayor of Casterbridge", author: "Thomas Hardy", year: 1886, genre: "Novel", description: "A man sells his wife and daughter at a country fair while drunk — and spends the rest of his life unable to outrun that single night.", synopsis: "Michael Henchard, in a moment of drunken recklessness at a country fair, sells his wife and infant daughter. Years later, sober and prosperous, he is Mayor of Casterbridge. When Susan returns with the grown Elizabeth-Jane, and the young Scotsman Farfrae arrives to challenge everything Henchard has built, his pride and stubbornness accelerate a collapse that feels almost self-willed. Hardy's most relentlessly driven study of how a single act and a flawed character together become destiny.", cover: "", openLibrary: "https://openlibrary.org/works/OL47517W", tags: ["Classic", "Victorian", "Tragedy", "Hardy"] },
  { id: 101, title: "Faceless", author: "Amma Darko", year: 2003, genre: "Novel", description: "A teenage girl searches the violent underworld of Accra's streets for her missing sister — a Ghanaian novel of unsparing social honesty.", synopsis: "Fofo is a teenage street girl in Accra who sets out to find her older sister Poison, who has vanished into the city's most dangerous margins. As the search unfolds, Amma Darko reveals the network of poverty, exploitation, and institutional failure that produces Accra's street children — and the violence that keeps them there. One of the most important West African novels of the contemporary era, taught widely in Ghana and Nigeria for its compassionate and unsparing social eye.", cover: "", openLibrary: "https://openlibrary.org/search?q=faceless+amma+darko", tags: ["Pan-African", "Ghana", "West African", "Urban Life", "Women", "Contemporary"] },
  { id: 102, title: "Romeo and Juliet", author: "William Shakespeare", year: 1597, genre: "Play", description: "Two young people from feuding families fall in love and die for it — Shakespeare's most purely lyrical tragedy.", synopsis: "Romeo Montague and Juliet Capulet fall in love at a party without knowing each other's name. Their secret marriage cannot survive the violence of the feud surrounding them: a sequence of misfortunes — each contingent, each avoidable — brings them both to their deaths in the Capulet tomb. Shakespeare's play is a study of love in collision with time, bad luck, and the inherited hatreds of the world. The balcony scene, the marriage, and the final tomb scene are among the most famous passages in English literature.", cover: "", openLibrary: "https://openlibrary.org/search?q=romeo+and+juliet+william+shakespeare", tags: ["Play", "Classic", "Shakespeare", "Tragedy", "Love"] },
  { id: 103, title: "The Return of the Boy Slave", author: "Kola Onadipe", year: 1968, genre: "Novel", description: "The captive Yoruba boy of the first book wins his freedom — and must now rebuild his life in a world that has moved on without him.", synopsis: "The sequel to The Boy Slave picks up after the young protagonist's escape from captivity and his long journey home. Returning to Yorubaland, he finds that freedom brings its own complications: relationships strained by absence, a community that has changed, and the internal scars left by enslavement. Kola Onadipe extends the historical adventure into quieter questions of identity and belonging, making the second book complementary to its more action-driven predecessor. Widely read in Nigerian primary and junior secondary schools alongside the first volume.", cover: "", openLibrary: "https://openlibrary.org/search?q=return+of+the+boy+slave+kola+onadipe", tags: ["Novel", "Children's", "Slavery", "Historical", "Yoruba Culture", "Sequel"] },
  { id: 104, title: "The Wives' Revolt", author: "J.P. Clark-Bekederemo", year: 1985, genre: "Play", description: "The women of a Niger Delta oil community go on strike against polygamy and neglect — a comedy that cuts deeper than it appears.", synopsis: "Set in an oil company community in the Niger Delta, The Wives' Revolt follows the women of Toruseigha as they organise a collective strike to protest their husbands' polygamy, indifference, and mistreatment. J.P. Clark-Bekederemo — best known for the tragedy Song of a Goat — shows a completely different register here: warm, comic, and shrewdly observant about gender and power. The play makes its case for women's dignity through laughter, producing a work that is both funny and quietly serious.", cover: "", openLibrary: "https://openlibrary.org/search?q=the+wives+revolt+jp+clark", tags: ["Play", "Comedy", "Women", "Niger Delta", "Feminism", "Ijaw Culture"] },
  { id: 105, title: "Moremi the Courageous Queen", author: "Segun Thomas Ajayi", year: 1986, genre: "Novel", description: "The legendary Yoruba queen who sacrificed everything to save Ile-Ife — a story of courage, vow, and devastating personal cost.", synopsis: "Based on the Yoruba legend of Moremi Ajasoro, queen of Ile-Ife, who allowed herself to be captured by the enemy Igbo raiders in order to discover the secret of their power. Having learned their weakness, she returned home and helped defeat them — but only after making a vow to the river goddess Esimirin that cost her the life of her only son, Ela. Segun Thomas Ajayi's retelling gives full weight to both the heroism and the tragedy of the story, making it essential reading in Nigerian schools looking for indigenous heroic narratives.", cover: "", openLibrary: "https://openlibrary.org/search?q=moremi+courageous+queen+segun+ajayi", tags: ["Novel", "Historical", "Yoruba Culture", "Women", "Mythology", "Children's"] },
  { id: 106, title: "Eze Goes to College", author: "Onuora Nzekwu", year: 1975, genre: "Novel", description: "The sequel to Eze Goes to School follows a now older Eze through the wider world of college — new freedoms and new tests of character.", synopsis: "The sequel to the beloved Eze Goes to School picks up with Eze now old enough for college, facing the expanded challenges of higher education: greater independence, stronger social pressures, and questions about his future that school could not answer. Nzekwu extends the warmth and accessibility of the first book into a slightly more complex social world, following Eze as he negotiates ambition, friendship, and the responsibilities of becoming an educated Nigerian man. Read widely in Nigerian schools as the natural continuation of Eze's story.", cover: "", openLibrary: "https://openlibrary.org/search?q=eze+goes+to+college+nzekwu", tags: ["Novel", "Children's", "Education", "Coming of Age", "Sequel"] },
  { id: 107, title: "Koku Baboni", author: "Kola Onadipe", year: 1966, genre: "Novel", description: "A young boy's adventures and moral lessons in Yoruba village life — a beloved Nigerian children's classic.", synopsis: "Koku Baboni follows a young Yoruba boy whose curiosity, mischief, and encounters with community life teach him a series of hard-won moral lessons. Kola Onadipe — best known for The Boy Slave — brings the same warmth and accessibility to this shorter novel, rooting Koku's adventures in the rhythms of traditional village life. The book's moral clarity and engaging storytelling made it a staple of Nigerian primary school reading lists, and it remains fondly remembered by generations of readers who encountered it in their early school years.", cover: "", openLibrary: "https://openlibrary.org/search?q=koku+baboni+kola+onadipe", tags: ["Novel", "Children's", "Yoruba Culture", "Moral Lessons", "School Classic"] },
];
const genres = ["All", ...new Set(books.map((b) => b.genre))];
const authors = ["All Authors", ...new Set(books.map((b) => b.author))];
const alphabet = ["All", ..."ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("")];

const CACHE_KEY = "nlitCovers_v1";
function readCoverCache() {
  try { return JSON.parse(localStorage.getItem(CACHE_KEY) || "{}"); } catch { return {}; }
}
function writeCoverCache(key, value) {
  try {
    const cache = readCoverCache();
    cache[key] = value;
    localStorage.setItem(CACHE_KEY, JSON.stringify(cache));
  } catch {}
}

const STATUS_KEY = "nlitStatus_v1";
function readStatusMap() {
  try { return JSON.parse(localStorage.getItem(STATUS_KEY) || "{}"); } catch { return {}; }
}
function writeStatusMap(map) {
  try { localStorage.setItem(STATUS_KEY, JSON.stringify(map)); } catch {}
}

function useFocusTrap(active) {
  const containerRef = useRef(null);
  useEffect(() => {
    if (!active) return;
    const prev = document.activeElement;
    const container = containerRef.current;
    if (!container) return;
    const sel = 'button:not([disabled]),[href],input:not([disabled]),select:not([disabled]),[tabindex]:not([tabindex="-1"])';
    const getFocusable = () => Array.from(container.querySelectorAll(sel));
    const timer = setTimeout(() => { getFocusable()[0]?.focus(); }, 10);
    function onKeyDown(e) {
      if (e.key !== 'Tab') return;
      const els = getFocusable();
      if (!els.length) return;
      if (e.shiftKey) {
        if (document.activeElement === els[0]) { e.preventDefault(); els[els.length - 1].focus(); }
      } else {
        if (document.activeElement === els[els.length - 1]) { e.preventDefault(); els[0].focus(); }
      }
    }
    document.addEventListener('keydown', onKeyDown);
    return () => {
      clearTimeout(timer);
      document.removeEventListener('keydown', onKeyDown);
      prev?.focus();
    };
  }, [active]);
  return containerRef;
}

function BookCover({ book, style, fallbackStyle, delay = 0, letterStyle }) {
  const cacheKey = `${book.title}__${book.author}`;
  const cached = readCoverCache()[cacheKey];
  const initial = book.cover || (cached && cached !== "none" ? cached : null);
  const [coverUrl, setCoverUrl] = useState(initial);
  const [failed, setFailed] = useState(!book.cover && cached === "none");

  useEffect(() => {
    if (book.cover || cached) return;
    let cancelled = false;
    const timer = setTimeout(() => {
      const q = encodeURIComponent(`${book.title} ${book.author}`);
      fetch(`https://openlibrary.org/search.json?q=${q}&fields=cover_i&limit=1`)
        .then((r) => r.json())
        .then((data) => {
          if (cancelled) return;
          const id = data.docs?.[0]?.cover_i;
          if (id) {
            const url = `https://covers.openlibrary.org/b/id/${id}-L.jpg`;
            setCoverUrl(url);
            writeCoverCache(cacheKey, url);
          } else {
            setFailed(true);
            writeCoverCache(cacheKey, "none");
          }
        })
        .catch(() => { if (!cancelled) { setFailed(true); writeCoverCache(cacheKey, "none"); } });
    }, delay);
    return () => { cancelled = true; clearTimeout(timer); };
  }, [book.title, book.author, book.cover, delay, cached, cacheKey]);

  const showImage = coverUrl && !failed;

  return (
    <>
      {coverUrl && (
        <img
          src={coverUrl}
          alt={book.title}
          style={{ ...style, display: showImage ? "block" : "none" }}
          onError={() => setFailed(true)}
        />
      )}
      <div style={{ ...fallbackStyle, display: showImage ? "none" : "flex" }}>
        <span style={letterStyle || s.fallbackLetter}>{book.title[0]}</span>
      </div>
    </>
  );
}

function FilterPill({ label, onClear }) {
  return (
    <button type="button" style={s.pill} onClick={onClear}>
      <span>{label}</span>
      <span style={s.pillX}>×</span>
    </button>
  );
}

function BookCard({ book, onSelect, status, index }) {
  return (
    <button type="button" className="book-card" style={s.card} onClick={() => { playPageTurn(); onSelect(book); }}>
      {status && <div style={{ ...s.statusStrip, background: status === "read" ? "#4CAF7D" : "#E6A817" }} />}
      <div style={s.cardCover}>
        <span style={s.cardCoverLetter}>{book.title[0]}</span>
      </div>
      <div style={s.cardBody}>
        <p style={s.cardGenreTag}>{book.genre}</p>
        <h3 style={s.cardTitle}>{book.title}</h3>
        <p style={s.cardAuthor}>{book.author}</p>
        <p style={s.cardYear}>{book.year}</p>
        <p style={s.cardDesc}>{book.description}</p>
      </div>
    </button>
  );
}

const spineColors = ["#2C3E50","#5B4A3F","#3D6B55","#7B4F3A","#4A5568","#6B5B45","#3B5998","#704214","#2D6A4F","#8B4513","#4A4E69","#6B7355","#3D5A80","#7A5C4E","#4E6B4A","#8E5C3A","#3A5A6B","#6B4A7A"];

function ShelfCard({ book, onSelect, index }) {
  const bg = spineColors[index % spineColors.length];
  const lastName = book.author.split(" ").pop();
  return (
    <button
      type="button"
      className="spine-card"
      style={{ ...s.spine, background: bg }}
      onClick={() => { playPageTurn(); onSelect(book); }}
      title={`${book.title} — ${book.author} (${book.year})`}
    >
      <span style={s.spineAuthor}>{lastName}</span>
      <span style={s.spineTitle}>{book.title}</span>
    </button>
  );
}

function ListRow({ book, onSelect }) {
  return (
    <button type="button" className="list-row" style={s.listRow} onClick={() => { playPageTurn(); onSelect(book); }}>
      <span style={s.listTitle}>{book.title}</span>
      <span style={s.listAuthor}>{book.author}</span>
      <span style={s.listYear}>{book.year}</span>
      <span style={s.listGenreTag}>{book.genre}</span>
    </button>
  );
}

function ViewToggle({ view, onChange }) {
  const opts = [
    {
      id: "cards", label: "Cards",
      icon: <svg aria-hidden="true" width="14" height="14" viewBox="0 0 14 14" fill="none"><rect x="0" y="0" width="6" height="6" rx="1" fill="currentColor"/><rect x="8" y="0" width="6" height="6" rx="1" fill="currentColor"/><rect x="0" y="8" width="6" height="6" rx="1" fill="currentColor"/><rect x="8" y="8" width="6" height="6" rx="1" fill="currentColor"/></svg>,
    },
    {
      id: "shelf", label: "Shelf",
      icon: <svg aria-hidden="true" width="14" height="14" viewBox="0 0 14 14" fill="none"><rect x="0" y="1" width="2.5" height="12" rx="1" fill="currentColor"/><rect x="4" y="3" width="2.5" height="10" rx="1" fill="currentColor"/><rect x="8" y="0" width="2.5" height="13" rx="1" fill="currentColor"/><rect x="11.5" y="2" width="2.5" height="11" rx="1" fill="currentColor"/></svg>,
    },
    {
      id: "list", label: "List",
      icon: <svg aria-hidden="true" width="14" height="14" viewBox="0 0 14 14" fill="none"><rect x="0" y="1" width="14" height="2" rx="1" fill="currentColor"/><rect x="0" y="6" width="14" height="2" rx="1" fill="currentColor"/><rect x="0" y="11" width="14" height="2" rx="1" fill="currentColor"/></svg>,
    },
  ];
  return (
    <div style={s.viewToggle} role="group" aria-label="View mode">
      {opts.map(({ id, label, icon }) => (
        <button
          key={id}
          type="button"
          className={view === id ? "view-active" : undefined}
          style={s.viewBtn}
          aria-pressed={view === id}
          onClick={() => onChange(id)}
        >
          {icon}
          {label}
        </button>
      ))}
    </div>
  );
}

function DetailModal({ book, onClose }) {
  const [showMore, setShowMore] = useState(false);
  const [copied, setCopied] = useState(false);
  const trapRef = useFocusTrap(!!book);
  useEffect(() => { playChime(); }, []);
  useEffect(() => {
    function onEsc(e) { if (e.key === 'Escape') onClose(); }
    document.addEventListener('keydown', onEsc);
    return () => document.removeEventListener('keydown', onEsc);
  }, [onClose]);
  if (!book) return null;
  const q = encodeURIComponent(`${book.title} ${book.author}`);
  const qt = encodeURIComponent(book.title);

  function handleShare() {
    const url = `${window.location.origin}${window.location.pathname}?book=${book.id}`;
    navigator.clipboard.writeText(url).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2200);
    }).catch(() => {});
  }

  return (
    <div style={s.overlay} onClick={onClose} aria-hidden="true">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="detail-modal-title"
        ref={trapRef}
        style={s.modal}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-inner" style={s.modalInner}>
          <div className="modal-left" style={s.modalLeft}>
            <div className="modal-letter-wrap" style={s.modalLetterWrap}>
              <span style={s.modalLetter}>{book.title[0]}</span>
            </div>
            <div style={s.modalLinksWrap}>
              <a href={book.openLibrary || `https://openlibrary.org/search?q=${q}`} target="_blank" rel="noopener noreferrer" style={s.linkPrimary} className="link-btn">
                Read on Open Library →
              </a>
              <a href={`https://okadabooks.com/search/books?title=${qt}`} target="_blank" rel="noopener noreferrer" style={s.linkSecondary} className="link-btn-sec">
                Find on Okadabooks →
              </a>
              <a href={`https://www.amazon.com/s?k=${q}`} target="_blank" rel="noopener noreferrer" style={s.linkSecondary} className="link-btn-sec">
                Buy on Amazon →
              </a>
              {showMore && (
                <>
                  <a href={`https://rhbooks.com.ng/?s=${qt}`} target="_blank" rel="noopener noreferrer" style={s.linkSecondary} className="link-btn-sec">
                    Roving Heights →
                  </a>
                  <a href={`https://sunshinebookseller.com/search?q=${q}`} target="_blank" rel="noopener noreferrer" style={s.linkSecondary} className="link-btn-sec">
                    Sunshine Books →
                  </a>
                  <a href={`https://www.abebooks.com/servlet/SearchResults?kn=${q}`} target="_blank" rel="noopener noreferrer" style={s.linkSecondary} className="link-btn-sec">
                    AbeBooks →
                  </a>
                </>
              )}
              <div style={s.modalMiniRow}>
                <button type="button" style={s.moreToggleMin} onClick={() => setShowMore(v => !v)}>
                  {showMore ? "fewer stores ↑" : "more stores ↓"}
                </button>
                {copied ? (
                  <span style={s.copiedLabel}>Link copied</span>
                ) : (
                  <button type="button" className="share-icon-btn" style={s.shareIconBtn} onClick={handleShare} aria-label="Copy link to share">
                    <svg width="13" height="13" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M8 11V3M5 6l3-3 3 3" />
                      <path d="M3 10v3a1 1 0 001 1h8a1 1 0 001-1v-3" />
                    </svg>
                  </button>
                )}
              </div>
            </div>
          </div>
          <div className="modal-right" style={s.modalRight}>
            <button type="button" style={s.modalCloseBtn} onClick={onClose} aria-label="Close book details">×</button>
            <div style={s.modalMeta}>
              <span style={s.modalGenre}>{book.genre}</span>
              <span style={s.modalYear}>{book.year}</span>
            </div>
            <h2 id="detail-modal-title" style={s.modalTitle}>{book.title}</h2>
            <p style={s.modalAuthor}>{book.author}</p>
            <div style={s.modalTags}>
              {book.tags.map((tag) => (
                <span key={tag} style={s.tag}>{tag}</span>
              ))}
            </div>
            <p style={s.synopsis}>{book.synopsis}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function AboutModal({ onClose }) {
  const trapRef = useFocusTrap(true);
  useEffect(() => {
    function onEsc(e) { if (e.key === 'Escape') onClose(); }
    document.addEventListener('keydown', onEsc);
    return () => document.removeEventListener('keydown', onEsc);
  }, [onClose]);
  return (
    <div style={s.overlay} onClick={onClose} aria-hidden="true">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="about-modal-title"
        ref={trapRef}
        className="about-modal"
        style={s.aboutModal}
        onClick={(e) => e.stopPropagation()}
      >
        <button type="button" style={s.closeBtn} onClick={onClose} aria-label="Close about panel">Close</button>
        <p style={s.eyebrow}>About this archive</p>
        <h2 id="about-modal-title" style={s.aboutModalTitle}>Nigerian &amp; West African Literature</h2>
        <p style={s.aboutModalBody}>
          This started as a Twitter thread — people listing the books they remember from their Nigerian childhoods. Novels, plays, poetry.
        </p>
        <p style={s.aboutModalBody}>
          I went through the responses, pulled out every title, and built this archive so they'd all live somewhere searchable and accessible. Every book links to where you can read or buy it.
        </p>
        <p style={s.aboutModalBody}>Made by <a href="https://mars-portfolio.figma.site/" target="_blank" rel="noopener noreferrer" className="mars-link" style={{color: "var(--text-2)", textDecoration: "none", fontWeight: 500}}>MARS</a>.</p>
      </div>
    </div>
  );
}

function Toolbar({ theme, onTheme, soundEnabled, onSound, onAbout }) {
  const [pickerOpen, setPickerOpen] = useState(false);
  return (
    <div style={s.toolbar}>
      <button type="button" className="toolbar-btn" style={s.toolbarBtn} onClick={onAbout} aria-label="About this archive">
        <svg aria-hidden="true" width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
          <circle cx="8" cy="8" r="6.5" />
          <path d="M8 7.5v4" />
          <circle cx="8" cy="5.5" r="0.6" fill="currentColor" stroke="none" />
        </svg>
      </button>
      <div style={{ position: "relative" }}>
        <button type="button" className="toolbar-btn" style={s.toolbarBtn} onClick={() => setPickerOpen(v => !v)} aria-label="Change theme color" aria-expanded={pickerOpen}>
          <svg aria-hidden="true" width="16" height="16" viewBox="0 0 24 24" fill="none">
            <path d="M19.0847 4.78147C17.663 3.38289 15.8597 2.43573 13.9013 2.05904C11.9429 1.68236 9.91687 1.89295 8.07782 2.66436C6.23877 3.43576 4.66877 4.73356 3.56514 6.39463C2.46151 8.05571 1.8735 10.0059 1.875 12.0002C1.875 16.1927 4.4625 19.7112 8.625 21.1821C9.13405 21.3621 9.67885 21.4173 10.2137 21.3431C10.7485 21.2689 11.2577 21.0675 11.6985 20.7558C12.1394 20.4441 12.499 20.0312 12.7472 19.5517C12.9954 19.0722 13.125 18.5401 13.125 18.0002C13.125 17.7019 13.2435 17.4157 13.4545 17.2047C13.6655 16.9938 13.9516 16.8752 14.25 16.8752H18.5822C19.3479 16.8788 20.0918 16.6204 20.6903 16.1429C21.2889 15.6654 21.7062 14.9976 21.8728 14.2502C22.0467 13.4841 22.1313 12.7005 22.125 11.9149C22.1158 10.5838 21.8422 9.2678 21.3203 8.04325C20.7984 6.8187 20.0385 5.70999 19.0847 4.78147ZM19.6791 13.7505C19.6232 13.9992 19.4839 14.2213 19.2844 14.3799C19.0849 14.5386 18.8371 14.6241 18.5822 14.6224H14.25C13.3549 14.6224 12.4965 14.978 11.8635 15.6109C11.2306 16.2439 10.875 17.1023 10.875 17.9974C10.8748 18.1773 10.8315 18.3545 10.7486 18.5141C10.6658 18.6738 10.5459 18.8113 10.399 18.9151C10.2521 19.0188 10.0824 19.0858 9.90424 19.1105C9.72607 19.1352 9.54459 19.1167 9.375 19.0568C7.81407 18.5055 6.50157 17.5793 5.58 16.3793C4.62267 15.1214 4.11081 13.5809 4.125 12.0002C4.12489 9.9257 4.94337 7.93492 6.40263 6.4604C7.86188 4.98587 9.84403 4.14671 11.9184 4.12522H12C14.0745 4.13367 16.0626 4.95696 17.5357 6.41762C19.0088 7.87828 19.849 9.85932 19.875 11.9337C19.8801 12.5461 19.8144 13.157 19.6791 13.7543V13.7505ZM13.5 7.12522C13.5 7.4219 13.412 7.7119 13.2472 7.95858C13.0824 8.20525 12.8481 8.39751 12.574 8.51104C12.2999 8.62457 11.9983 8.65428 11.7074 8.5964C11.4164 8.53852 11.1491 8.39566 10.9393 8.18588C10.7296 7.9761 10.5867 7.70883 10.5288 7.41786C10.4709 7.12689 10.5007 6.82529 10.6142 6.5512C10.7277 6.27711 10.92 6.04284 11.1666 5.87802C11.4133 5.7132 11.7033 5.62522 12 5.62522C12.3978 5.62522 12.7794 5.78326 13.0607 6.06456C13.342 6.34587 13.5 6.7274 13.5 7.12522ZM9.375 9.37522C9.375 9.67189 9.28703 9.9619 9.12221 10.2086C8.95739 10.4553 8.72312 10.6475 8.44903 10.761C8.17494 10.8746 7.87334 10.9043 7.58237 10.8464C7.2914 10.7885 7.02412 10.6457 6.81434 10.4359C6.60456 10.2261 6.4617 9.95883 6.40382 9.66786C6.34595 9.37689 6.37565 9.07529 6.48918 8.8012C6.60271 8.52711 6.79497 8.29284 7.04165 8.12802C7.28832 7.9632 7.57833 7.87522 7.875 7.87522C8.27283 7.87522 8.65436 8.03326 8.93566 8.31456C9.21697 8.59587 9.375 8.9774 9.375 9.37522ZM9.375 14.6252C9.375 14.9219 9.28703 15.2119 9.12221 15.4586C8.95739 15.7053 8.72312 15.8975 8.44903 16.011C8.17494 16.1246 7.87334 16.1543 7.58237 16.0964C7.2914 16.0385 7.02412 15.8957 6.81434 15.6859C6.60456 15.4761 6.4617 15.2088 6.40382 14.9179C6.34595 14.6269 6.37565 14.3253 6.48918 14.0512C6.60271 13.7771 6.79497 13.5428 7.04165 13.378C7.28832 13.2132 7.57833 13.1252 7.875 13.1252C8.27283 13.1252 8.65436 13.2833 8.93566 13.5646C9.21697 13.8459 9.375 14.2274 9.375 14.6252ZM17.625 9.37522C17.625 9.67189 17.537 9.9619 17.3722 10.2086C17.2074 10.4553 16.9731 10.6475 16.699 10.761C16.4249 10.8746 16.1233 10.9043 15.8324 10.8464C15.5414 10.7885 15.2741 10.6457 15.0643 10.4359C14.8546 10.2261 14.7117 9.95883 14.6538 9.66786C14.5959 9.37689 14.6257 9.07529 14.7392 8.8012C14.8527 8.52711 15.045 8.29284 15.2916 8.12802C15.5383 7.9632 15.8283 7.87522 16.125 7.87522C16.5228 7.87522 16.9044 8.03326 17.1857 8.31456C17.467 8.59587 17.625 8.9774 17.625 9.37522Z" fill="currentColor"/>
          </svg>
        </button>
        {pickerOpen && (
          <div style={s.colorPicker}>
            {THEMES.map(t => (
              <button
                key={t.id}
                type="button"
                title={t.label}
                aria-label={t.label}
                aria-pressed={theme === t.id}
                onClick={() => { onTheme(t.id); setPickerOpen(false); }}
                style={{
                  ...s.colorSwatch,
                  background: t.bg,
                  border: theme === t.id ? "2px solid var(--text)" : "2px solid var(--border-2)",
                }}
              />
            ))}
          </div>
        )}
      </div>
      <button type="button" className="toolbar-btn" style={s.toolbarBtn} onClick={onSound} aria-label={soundEnabled ? "Mute sounds" : "Unmute sounds"}>
        {soundEnabled ? (
          <svg aria-hidden="true" width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M2 5.5h2.5l3.5-3v11l-3.5-3H2z" />
            <path d="M10.5 5.5a3 3 0 010 5" />
          </svg>
        ) : (
          <svg aria-hidden="true" width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
            <path d="M2 5.5h2.5l3.5-3v11l-3.5-3H2z" strokeLinejoin="round" />
            <line x1="10.5" y1="5.5" x2="13.5" y2="8.5" /><line x1="13.5" y1="5.5" x2="10.5" y2="8.5" />
          </svg>
        )}
      </button>
    </div>
  );
}

const PLAYLIST_ID = "PLVZAvcfj6Em9IJ9NQlQ16oAVbAVmONoNm";

const THEMES = [
  { id: "white",      label: "White",       bg: "#FAFAF8", surface: "#F0F0EE", surface2: "#EAEAE8", border: "#E2E2DF", border2: "#D8D8D5", dark: false },
  { id: "sage",       label: "Sage",        bg: "#C8D4B0", surface: "#B8C4A0", surface2: "#A8B490", border: "#94A07C", border2: "#84906C", dark: false },
  { id: "peach",      label: "Peach",       bg: "#FBECDD", surface: "#F5DEC8", surface2: "#EDD0B4", border: "#DFB890", border2: "#D0A070", dark: false },
  { id: "terracotta", label: "Terracotta",  bg: "#F0C8A8", surface: "#E4B890", surface2: "#D8A878", border: "#C49060", border2: "#B07848", dark: false },
  { id: "cream",      label: "Cream",       bg: "#FFF8EE", surface: "#F7F0D8", surface2: "#F0E8CC", border: "#E8DFC0", border2: "#DDD3B0", dark: false },
  { id: "lightBlue",  label: "Light Blue",  bg: "#C4DBEA", surface: "#B0CCE0", surface2: "#9CBCD6", border: "#88AACC", border2: "#74A0C0", dark: false },
  { id: "warmWhite",  label: "Warm White",  bg: "#F8F6F0", surface: "#EEEAE0", surface2: "#E4DED0", border: "#D4CEBC", border2: "#C4BCA8", dark: false },
  { id: "lavender",   label: "Lavender",    bg: "#EDDFF1", surface: "#E0CCE8", surface2: "#D2B8DE", border: "#BFA0CC", border2: "#AC88BB", dark: false },
  { id: "dark",       label: "Gray Black",  bg: "#2A2A2E", surface: "#363638", surface2: "#404044", border: "#4A4A50", border2: "#565660", dark: true  },
];

function SplashScreen({ onEnter }) {
  const trapRef = useFocusTrap(true);
  return (
    <div style={spl.overlay}>
      <div ref={trapRef} style={spl.inner}>
        <p style={spl.eyebrow}>Nigerian &amp; West African Literature Archive</p>
        <h1 style={spl.title}>Words That Shaped a World</h1>
        <p style={spl.body}>
          These are the books that raised us. The ones your literature teacher slapped on the desk on the first day of term — from Achebe's Umuofia to Adichie's Lagos, voices that refused to be quiet. The ones you carried home, read cover to cover, and still remember like old friends.
        </p>
        <p style={spl.body}>
          It started with a tweet. Over 300 Nigerians named every book they remembered from literature class. This is where those titles live now.
        </p>
        <p style={spl.body}>
          A playlist plays while you browse — music chosen to sit beside these books, not above them.
        </p>
        <button type="button" style={spl.enterBtn} onClick={onEnter}>
          Enter the Archive
        </button>
      </div>
    </div>
  );
}

const spl = {
  overlay: {
    position: "fixed", inset: 0, zIndex: 200,
    background: "var(--bg, #FAFAF8)",
    display: "flex", alignItems: "center", justifyContent: "center",
    padding: "40px 24px",
  },
  inner: {
    maxWidth: 600,
    width: "100%",
    textAlign: "center",
    display: "flex", flexDirection: "column", alignItems: "stretch", gap: 20,
  },
  eyebrow: {
    fontFamily: "'Helvetica Neue', Arial, sans-serif",
    fontSize: 11, letterSpacing: "0.12em", textTransform: "uppercase",
    color: "var(--text-3, #525252)", margin: 0,
  },
  title: {
    fontFamily: "'Georgia', 'Times New Roman', serif",
    fontSize: 32, fontWeight: 400, lineHeight: 1.3,
    color: "var(--text, #111)", margin: 0,
  },
  body: {
    fontFamily: "'Georgia', 'Times New Roman', serif",
    fontSize: 16, lineHeight: 1.75,
    color: "var(--text-2, #444)", margin: 0, maxWidth: 520,
  },
  madeBy: {
    fontFamily: "'Georgia', 'Times New Roman', serif",
    fontSize: 16,
    color: "var(--text-2, #444)",
    textDecoration: "none",
    fontWeight: 700,
    outline: "none",
    border: "none",
  },
  enterBtn: {
    marginTop: 12,
    alignSelf: "center",
    fontFamily: "'Helvetica Neue', Arial, sans-serif",
    fontSize: 12, letterSpacing: "0.1em", textTransform: "uppercase",
    background: "transparent",
    color: "var(--text, #111)",
    border: "1px solid var(--text, #111)",
    borderRadius: 100,
    padding: "14px 36px",
    cursor: "pointer",
  },
};

export default function NigerianLit() {
  const [search, setSearch] = useState("");
  const [selectedGenre, setSelectedGenre] = useState("All");
  const [selectedAuthor, setSelectedAuthor] = useState("All Authors");
  const [alphaFilter, setAlphaFilter] = useState("All");
  const [selectedBook, setSelectedBook] = useState(null);
  const [sortOrder, setSortOrder] = useState("az");
  const [viewMode, setViewMode] = useState("cards");
  const [readingStatus, setReadingStatus] = useState(() => readStatusMap());
  const [statusFilter, setStatusFilter] = useState("all");
  const [theme, setTheme] = useState("white");
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [showAbout, setShowAbout] = useState(false);
  const [showSplash, setShowSplash] = useState(true);
  const ytPlayerRef = useRef(null);
  const ytContainerRef = useRef(null);

  useEffect(() => {
    const root = document.documentElement;
    const t = THEMES.find(t => t.id === theme) || THEMES[0];
    root.style.setProperty("--bg", t.bg);
    root.style.setProperty("--bg-hover", t.surface);
    root.style.setProperty("--surface", t.surface);
    root.style.setProperty("--surface-2", t.surface2);
    root.style.setProperty("--surface-3", t.surface2);
    root.style.setProperty("--cover", t.surface2);
    root.style.setProperty("--border", t.border);
    root.style.setProperty("--border-2", t.border2);
    if (t.dark) {
      root.style.setProperty("--text",         "#E8E5DF");
      root.style.setProperty("--text-2",       "#BBBBBB");
      root.style.setProperty("--text-3",       "#888880");
      root.style.setProperty("--text-4",       "#888880");
      root.style.setProperty("--placeholder",  "#555551");
      root.style.setProperty("--cover-letter", "rgba(255,255,255,0.20)");
    } else {
      ["--text","--text-2","--text-3","--text-4","--placeholder","--cover-letter"].forEach(k => root.style.removeProperty(k));
    }
  }, [theme]);

  useEffect(() => {
    if (!window.YT) {
      const tag = document.createElement("script");
      tag.src = "https://www.youtube.com/iframe_api";
      document.head.appendChild(tag);
    }
  }, []);

  function initYTPlayer() {
    if (!ytContainerRef.current) return;
    if (ytPlayerRef.current) { ytPlayerRef.current.playVideo(); return; }
    window.onYouTubeIframeAPIReady = () => {
      ytPlayerRef.current = new window.YT.Player(ytContainerRef.current, {
        width: 1, height: 1,
        playerVars: { listType: "playlist", list: PLAYLIST_ID, autoplay: 1, controls: 0, loop: 1 },
        events: { onReady: (e) => e.target.playVideo() },
      });
    };
    if (window.YT && window.YT.Player) window.onYouTubeIframeAPIReady();
  }

  function handleEnter() {
    setShowSplash(false);
    initYTPlayer();
  }

  function toggleSound() {
    const next = !_soundEnabled;
    _soundEnabled = next;
    setSoundEnabled(next);
    if (ytPlayerRef.current) {
      try { next ? ytPlayerRef.current.playVideo() : ytPlayerRef.current.pauseVideo(); } catch {}
    }
  }

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const bookId = parseInt(params.get("book") || "", 10);
    if (bookId) {
      const found = books.find((b) => b.id === bookId);
      if (found) setSelectedBook(found);
    }
  }, []);

  function handleSelectBook(book) {
    setSelectedBook(book);
    if (book) history.replaceState(null, "", `?book=${book.id}`);
  }

  function handleCloseModal() {
    setSelectedBook(null);
    history.replaceState(null, "", window.location.pathname);
  }

  function handleSetStatus(bookId, newStatus) {
    setReadingStatus((prev) => {
      const updated = { ...prev };
      if (newStatus === null) delete updated[bookId];
      else updated[bookId] = newStatus;
      writeStatusMap(updated);
      return updated;
    });
  }

  const readCount = Object.values(readingStatus).filter((v) => v === "read").length;
  const wantCount = Object.values(readingStatus).filter((v) => v === "want").length;

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();
    const list = books.filter((book) => {
      const matchesSearch =
        !query ||
        book.title.toLowerCase().includes(query) ||
        book.author.toLowerCase().includes(query) ||
        book.tags.some((tag) => tag.toLowerCase().includes(query));
      const matchesGenre = selectedGenre === "All" || book.genre === selectedGenre;
      const matchesAuthor = selectedAuthor === "All Authors" || book.author === selectedAuthor;
      const matchesAlpha = alphaFilter === "All" || book.title.toUpperCase().startsWith(alphaFilter);
      const matchesStatus =
        statusFilter === "all" ||
        (statusFilter === "want" && readingStatus[book.id] === "want") ||
        (statusFilter === "read" && readingStatus[book.id] === "read") ||
        (statusFilter === "unread" && !readingStatus[book.id]);
      return matchesSearch && matchesGenre && matchesAuthor && matchesAlpha && matchesStatus;
    });
    const sorted = [...list];
    if (sortOrder === "az") sorted.sort((a, b) => a.title.localeCompare(b.title));
    if (sortOrder === "za") sorted.sort((a, b) => b.title.localeCompare(a.title));
    if (sortOrder === "oldest") sorted.sort((a, b) => a.year - b.year);
    if (sortOrder === "newest") sorted.sort((a, b) => b.year - a.year);
    return sorted;
  }, [search, selectedGenre, selectedAuthor, alphaFilter, sortOrder, statusFilter, readingStatus]);

  const activeFilters = [
    search ? { label: `"${search}"`, clear: () => setSearch("") } : null,
    selectedGenre !== "All" ? { label: selectedGenre, clear: () => setSelectedGenre("All") } : null,
    selectedAuthor !== "All Authors" ? { label: selectedAuthor, clear: () => setSelectedAuthor("All Authors") } : null,
    alphaFilter !== "All" ? { label: `Letter: ${alphaFilter}`, clear: () => setAlphaFilter("All") } : null,
    statusFilter !== "all" ? { label: statusFilter === "want" ? "Want to Read" : statusFilter === "read" ? "Read" : "Not started", clear: () => setStatusFilter("all") } : null,
  ].filter(Boolean);

  function resetAll() {
    setSearch("");
    setSelectedGenre("All");
    setSelectedAuthor("All Authors");
    setAlphaFilter("All");
    setSortOrder("az");
    setStatusFilter("all");
  }

  return (
    <div style={s.page}>
      <style>{css}</style>

      <header style={s.header}>
        <div style={s.headerInner}>
          <p style={s.eyebrow}>A Reading Archive</p>
          <h1 style={s.title}>Nigerian &amp; West African Literature</h1>
          <p style={s.subtitle}>{books.length} essential works — novels, plays &amp; poetry</p>
          <p style={s.aboutBlurb}>Started from a Twitter thread where people shared books from their Nigerian childhoods. We collected them all in one place so nothing gets lost.</p>
        </div>
      </header>

      <section className="lit-controls" style={s.controlsSection}>
        <div style={s.controlsInner}>
          <div className="search-row" style={s.searchRow}>
            <label style={s.searchWrap} aria-label="Search books">
              <svg aria-hidden="true" style={s.searchIcon} viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8">
                <circle cx="8.5" cy="8.5" r="5.5" />
                <line x1="13" y1="13" x2="18" y2="18" />
              </svg>
              <input
                style={s.searchInput}
                placeholder="Search title, author, tag..."
                value={search}
                onChange={(e) => { playTypewriter(); setSearch(e.target.value); }}
              />
            </label>
            <div className="dropdown-row" style={s.dropdownRow}>
              <select aria-label="Filter by genre" style={s.select} value={selectedGenre} onChange={(e) => { playStamp(); setSelectedGenre(e.target.value); }}>
                {genres.map((genre) => (
                  <option key={genre}>{genre}</option>
                ))}
              </select>
              <select aria-label="Filter by author" style={s.select} value={selectedAuthor} onChange={(e) => { playStamp(); setSelectedAuthor(e.target.value); }}>
                {authors.map((author) => (
                  <option key={author}>{author}</option>
                ))}
              </select>
              <select aria-label="Sort order" style={s.select} value={sortOrder} onChange={(e) => setSortOrder(e.target.value)}>
                <option value="az">A → Z</option>
                <option value="za">Z → A</option>
                <option value="oldest">Oldest first</option>
                <option value="newest">Newest first</option>
              </select>
              <select aria-label="Filter by reading status" style={s.select} value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
                <option value="all">All books</option>
                <option value="want">Want to Read</option>
                <option value="read">Read</option>
                <option value="unread">Not started</option>
              </select>
            </div>
          </div>

          <div style={s.alphaBar} role="group" aria-label="Filter by letter">
            {alphabet.map((letter) => (
              <button
                key={letter}
                type="button"
                className={alphaFilter === letter ? "alpha-active" : undefined}
                style={s.alphaBtn}
                aria-pressed={alphaFilter === letter}
                onClick={() => { playSoftClick(); setAlphaFilter(letter); }}
              >
                {letter}
              </button>
            ))}
          </div>

          {activeFilters.length > 0 && (
            <div style={s.pillRow}>
              {activeFilters.map((item) => (
                <FilterPill key={item.label} label={item.label} onClear={item.clear} />
              ))}
              <button type="button" style={s.clearAll} onClick={resetAll}>
                Clear all
              </button>
            </div>
          )}
        </div>
      </section>

      <section style={s.catalogueSection}>
        <div style={s.catalogueInner}>
          <div style={s.catalogueTopRow}>
            <div>
              <p style={s.bookCount}>{filtered.length} {filtered.length === 1 ? "book" : "books"}</p>
              {(readCount > 0 || wantCount > 0) && (
                <p style={s.statusCount}>
                  {readCount > 0 && `${readCount} read`}
                  {readCount > 0 && wantCount > 0 && " · "}
                  {wantCount > 0 && `${wantCount} want to read`}
                </p>
              )}
            </div>
            <ViewToggle view={viewMode} onChange={setViewMode} />
          </div>

          {filtered.length === 0 ? (
            <div style={s.empty}>
              <p style={s.emptyTitle}>No books match your filters.</p>
              <p style={s.emptyText}>Try clearing a filter or searching by author.</p>
            </div>
          ) : viewMode === "cards" ? (
            <div className="books-grid" style={s.grid}>
              {filtered.map((book, i) => (
                <BookCard key={book.id} book={book} onSelect={handleSelectBook} status={readingStatus[book.id]} index={i} />
              ))}
            </div>
          ) : viewMode === "shelf" ? (
            <div style={s.shelfGrid}>
              {filtered.map((book, i) => (
                <ShelfCard key={book.id} book={book} onSelect={handleSelectBook} index={i} />
              ))}
            </div>
          ) : (
            <div style={s.listGrid}>
              <div style={s.listHeader}>
                <span>Title</span>
                <span>Author</span>
                <span>Year</span>
                <span>Genre</span>
              </div>
              {filtered.map((book) => (
                <ListRow key={book.id} book={book} onSelect={handleSelectBook} />
              ))}
            </div>
          )}
        </div>
      </section>

      <DetailModal book={selectedBook} onClose={handleCloseModal} />
      {showAbout && <AboutModal onClose={() => setShowAbout(false)} />}
      <Toolbar theme={theme} onTheme={setTheme} soundEnabled={soundEnabled} onSound={toggleSound} onAbout={() => setShowAbout(true)} />
      <div ref={ytContainerRef} style={{ position: "fixed", bottom: 0, right: 0, width: 1, height: 1, visibility: "hidden", pointerEvents: "none" }} />
      {showSplash && <SplashScreen onEnter={handleEnter} />}
    </div>
  );
}

const s = {
  page: {
    fontFamily: "'Georgia', 'Times New Roman', serif",
    background: "var(--bg)",
    minHeight: "100vh",
    color: "var(--text)",
  },
  header: {
    background: "var(--surface)",
    padding: "52px 40px 44px",
    borderBottom: "1px solid var(--border)",
  },
  headerInner: {
    maxWidth: 1200,
    margin: "0 auto",
    textAlign: "center",
  },
  eyebrow: {
    fontFamily: "'Helvetica Neue', Arial, sans-serif",
    fontSize: 11,
    letterSpacing: "0.18em",
    textTransform: "uppercase",
    color: "var(--text-3)",
    margin: "0 0 16px",
    fontWeight: 500,
  },
  title: {
    fontSize: "clamp(48px, 7vw, 96px)",
    lineHeight: 0.95,
    letterSpacing: "-0.04em",
    fontWeight: 400,
    margin: "0 0 20px",
    color: "var(--text)",
  },
  subtitle: {
    margin: 0,
    fontFamily: "'Helvetica Neue', Arial, sans-serif",
    fontSize: 16,
    color: "var(--text-2)",
    lineHeight: 1.5,
  },
  controlsSection: {
    background: "var(--surface)",
    padding: "18px 40px 20px",
    borderBottom: "1px solid var(--border)",
    position: "sticky",
    top: 0,
    zIndex: 10,
  },
  controlsInner: {
    maxWidth: 1200,
    margin: "0 auto",
    display: "flex",
    flexDirection: "column",
    gap: 12,
  },
  searchRow: {
    display: "flex",
    gap: 10,
    alignItems: "center",
  },
  searchWrap: {
    display: "flex",
    alignItems: "center",
    gap: 10,
    border: "1px solid var(--border-2)",
    borderRadius: 6,
    padding: "9px 14px",
    background: "var(--surface)",
    flex: "1 1 200px",
    minWidth: 0,
    cursor: "text",
  },
  searchIcon: {
    width: 15,
    height: 15,
    color: "var(--text-4)",
    flexShrink: 0,
  },
  searchInput: {
    border: "none",
    background: "transparent",
    fontSize: 14,
    fontFamily: "'Helvetica Neue', Arial, sans-serif",
    color: "var(--text)",
    outline: "none",
    width: "100%",
    minWidth: 0,
  },
  dropdownRow: {
    display: "flex",
    gap: 8,
    flexWrap: "wrap",
    minWidth: 0,
  },
  select: {
    border: "1px solid var(--border-2)",
    borderRadius: 6,
    padding: "9px 12px 9px 10px",
    fontSize: 13,
    fontFamily: "'Helvetica Neue', Arial, sans-serif",
    background: "var(--surface)",
    color: "var(--text-2)",
    cursor: "pointer",
    outline: "none",
  },
  alphaBar: {
    display: "flex",
    gap: 1,
    flexWrap: "wrap",
  },
  alphaBtn: {
    minWidth: 30,
    borderRadius: 999,
    padding: "5px 7px",
    border: "none",
    background: "transparent",
    color: "var(--text-2)",
    cursor: "pointer",
    fontFamily: "'Helvetica Neue', Arial, sans-serif",
    fontSize: 13,
    fontWeight: 500,
    lineHeight: 1,
  },
  alphaBtnActive: {},
  pillRow: {
    display: "flex",
    flexWrap: "wrap",
    gap: 6,
    alignItems: "center",
  },
  pill: {
    display: "inline-flex",
    alignItems: "center",
    gap: 6,
    border: "1px solid var(--border-2)",
    borderRadius: 999,
    background: "var(--surface-2)",
    padding: "4px 12px",
    cursor: "pointer",
    fontFamily: "'Helvetica Neue', Arial, sans-serif",
    fontSize: 12,
    color: "var(--text-2)",
  },
  pillX: {
    fontSize: 14,
    lineHeight: 1,
    opacity: 0.45,
  },
  clearAll: {
    border: "none",
    background: "transparent",
    fontFamily: "'Helvetica Neue', Arial, sans-serif",
    fontSize: 12,
    color: "var(--text-3)",
    cursor: "pointer",
    padding: "4px 2px",
    textDecoration: "underline",
  },
  catalogueSection: {
    padding: "28px 40px 72px",
  },
  catalogueInner: {
    maxWidth: 1200,
    margin: "0 auto",
  },
  catalogueTopRow: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  viewToggle: {
    display: "flex",
    background: "var(--surface-3)",
    borderRadius: 999,
    padding: 3,
    gap: 2,
  },
  viewBtn: {
    display: "flex",
    alignItems: "center",
    gap: 6,
    padding: "7px 14px",
    borderRadius: 999,
    border: "none",
    background: "transparent",
    cursor: "pointer",
    fontFamily: "'Helvetica Neue', Arial, sans-serif",
    fontSize: 11,
    fontWeight: 600,
    letterSpacing: "0.08em",
    textTransform: "uppercase",
    color: "var(--text-3)",
    transition: "background 0.15s, color 0.15s",
  },
  viewBtnActive: {},
  shelfGrid: {
    display: "flex",
    flexWrap: "wrap",
    gap: 4,
    alignItems: "flex-start",
  },
  spine: {
    width: 76,
    height: 270,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "flex-start",
    border: "none",
    cursor: "pointer",
    padding: "14px 8px 12px",
    borderRadius: 2,
    flexShrink: 0,
    writingMode: "vertical-rl",
    textOrientation: "mixed",
    transform: "rotate(180deg)",
    transition: "opacity 0.15s",
    boxShadow: "inset 1px 0 0 rgba(255,255,255,0.1), inset -2px 0 0 rgba(0,0,0,0.1)",
  },
  spineCircle: {
    width: 10,
    height: 10,
    borderRadius: "50%",
    border: "1.5px solid rgba(255,255,255,0.35)",
    flexShrink: 0,
    marginBottom: 10,
  },
  spineTitle: {
    fontFamily: "Georgia, serif",
    fontSize: 13,
    color: "rgba(255,255,255,0.95)",
    lineHeight: 1.4,
    flex: 1,
    overflow: "hidden",
  },
  spineAuthor: {
    fontFamily: "'Helvetica Neue', Arial, sans-serif",
    fontSize: 10,
    color: "rgba(255,255,255,0.55)",
    marginTop: 8,
    flexShrink: 0,
  },
  listGrid: {
    display: "flex",
    flexDirection: "column",
  },
  listHeader: {
    display: "grid",
    gridTemplateColumns: "1fr 200px 64px 100px",
    gap: 16,
    padding: "0 0 10px",
    borderBottom: "2px solid var(--border)",
    fontFamily: "'Helvetica Neue', Arial, sans-serif",
    fontSize: 10,
    letterSpacing: "0.15em",
    textTransform: "uppercase",
    color: "var(--text-4)",
    fontWeight: 600,
  },
  listRow: {
    display: "grid",
    gridTemplateColumns: "1fr 200px 64px 100px",
    gap: 16,
    alignItems: "center",
    padding: "13px 0",
    borderBottom: "1px solid var(--border)",
    background: "none",
    border: "none",
    borderBottom: "1px solid var(--border)",
    cursor: "pointer",
    textAlign: "left",
    width: "100%",
  },
  listTitle: {
    fontFamily: "Georgia, serif",
    fontSize: 14,
    color: "var(--text)",
    fontWeight: 400,
  },
  listAuthor: {
    fontFamily: "'Helvetica Neue', Arial, sans-serif",
    fontSize: 13,
    color: "var(--text-2)",
  },
  listYear: {
    fontFamily: "'Helvetica Neue', Arial, sans-serif",
    fontSize: 12,
    color: "var(--text-4)",
  },
  listGenreTag: {
    fontFamily: "'Helvetica Neue', Arial, sans-serif",
    fontSize: 10,
    color: "var(--text-3)",
    background: "var(--surface-2)",
    padding: "3px 8px",
    borderRadius: 3,
    textTransform: "uppercase",
    letterSpacing: "0.08em",
    display: "inline-block",
  },
  bookCount: {
    fontFamily: "'Helvetica Neue', Arial, sans-serif",
    fontSize: 13,
    color: "var(--text-3)",
    margin: 0,
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(4, minmax(0, 1fr))",
    gap: "16px 16px",
    background: "transparent",
  },
  card: {
    textAlign: "left",
    background: "var(--surface)",
    border: "none",
    cursor: "pointer",
    padding: 0,
    color: "inherit",
    display: "flex",
    flexDirection: "column",
  },
  statusStrip: {
    height: 3,
    width: "100%",
    flexShrink: 0,
  },
  cardCover: {
    background: "var(--cover)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    height: 164,
    flexShrink: 0,
  },
  cardCoverLetter: {
    fontFamily: "Georgia, 'Times New Roman', serif",
    fontSize: 64,
    fontWeight: 400,
    color: "var(--cover-letter)",
    lineHeight: 1,
    userSelect: "none",
  },
  cardBody: {
    padding: "14px 16px 18px",
    display: "flex",
    flexDirection: "column",
  },
  cardYear: {
    fontFamily: "'Helvetica Neue', Arial, sans-serif",
    fontSize: 12,
    color: "var(--text-4)",
    margin: "0 0 10px",
  },
  cardTopRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: 12,
    padding: "18px 20px 10px",
  },
  yearStamp: {
    fontFamily: "'Courier New', monospace",
    fontSize: 11,
    color: "var(--text-3)",
    border: "1.5px solid #AAAAAA",
    borderRadius: 3,
    padding: "2px 7px",
    letterSpacing: "0.05em",
    opacity: 0.75,
    flexShrink: 0,
    lineHeight: 1.6,
  },
  cardGenreTag: {
    fontFamily: "'Helvetica Neue', Arial, sans-serif",
    fontSize: 9,
    letterSpacing: "0.2em",
    textTransform: "uppercase",
    color: "var(--text-3)",
    margin: "0 0 4px",
    fontWeight: 400,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: 400,
    margin: "0 0 4px",
    lineHeight: 1.25,
    letterSpacing: "-0.01em",
    color: "var(--text)",
  },
  cardAuthor: {
    fontFamily: "'Helvetica Neue', Arial, sans-serif",
    fontSize: 12,
    color: "var(--text-2)",
    margin: "0 0 2px",
  },
  cardDesc: {
    fontFamily: "'Helvetica Neue', Arial, sans-serif",
    fontSize: 12,
    color: "var(--text-2)",
    lineHeight: 1.6,
    margin: 0,
    padding: 0,
    display: "-webkit-box",
    WebkitLineClamp: 3,
    WebkitBoxOrient: "vertical",
    overflow: "hidden",
  },
  cardFooter: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "10px 20px 14px",
    borderTop: "1px dashed #E4E0D8",
    marginTop: "auto",
  },
  accession: {
    fontFamily: "'Courier New', monospace",
    fontSize: 9,
    color: "var(--text-4)",
    letterSpacing: "0.08em",
  },
  cardTagRow: {
    display: "flex",
    gap: 4,
  },
  cardTagChip: {
    fontFamily: "'Helvetica Neue', Arial, sans-serif",
    fontSize: 9,
    letterSpacing: "0.1em",
    textTransform: "uppercase",
    color: "var(--text-3)",
    background: "var(--surface-2)",
    borderRadius: 2,
    padding: "2px 6px",
  },
  empty: {
    padding: "80px 24px",
    textAlign: "center",
  },
  emptyTitle: {
    margin: "0 0 8px",
    fontSize: 22,
    color: "var(--text)",
  },
  emptyText: {
    margin: 0,
    fontFamily: "'Helvetica Neue', Arial, sans-serif",
    color: "var(--text-3)",
    fontSize: 14,
  },
  overlay: {
    position: "fixed",
    inset: 0,
    background: "rgba(0, 0, 0, 0.5)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 100,
    padding: 16,
    backdropFilter: "blur(3px)",
  },
  modal: {
    borderRadius: 12,
    maxWidth: 860,
    width: "100%",
    maxHeight: "90vh",
    overflowY: "auto",
    position: "relative",
    boxShadow: "0 32px 80px rgba(0, 0, 0, 0.22)",
    display: "flex",
    flexDirection: "column",
  },
  closeBtn: {
    position: "absolute",
    top: 14,
    right: 14,
    background: "var(--surface-3)",
    border: "none",
    color: "var(--text-2)",
    borderRadius: 999,
    padding: "6px 14px",
    fontFamily: "'Helvetica Neue', Arial, sans-serif",
    fontSize: 11,
    letterSpacing: "0.08em",
    textTransform: "uppercase",
    cursor: "pointer",
    zIndex: 10,
    fontWeight: 500,
  },
  modalCloseBtn: {
    position: "absolute",
    top: 16,
    right: 20,
    background: "none",
    border: "none",
    color: "var(--text-3)",
    fontSize: 24,
    lineHeight: 1,
    cursor: "pointer",
    padding: "2px 6px",
    zIndex: 10,
  },
  modalInner: {
    display: "grid",
    gridTemplateColumns: "280px minmax(0, 1fr)",
    flex: 1,
    minHeight: 540,
  },
  modalLeft: {
    background: "var(--surface-2)",
    padding: "48px 20px 32px",
    display: "flex",
    flexDirection: "column",
    borderRadius: "12px 0 0 12px",
  },
  modalLetterWrap: {
    flex: 1,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "16px 0 24px",
  },
  modalCoverImg: {
    width: 140,
    borderRadius: 3,
    boxShadow: "0 6px 24px rgba(0,0,0,0.22)",
  },
  modalCoverFallback: {
    width: 140,
    aspectRatio: "2 / 3",
    background: "var(--cover)",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 3,
  },
  modalLetter: {
    fontSize: 128,
    fontFamily: "Georgia, serif",
    color: "var(--cover-letter)",
    fontWeight: 400,
    lineHeight: 1,
    userSelect: "none",
  },
  statusToggleWrap: {
    display: "flex",
    flexDirection: "row",
    gap: 8,
  },
  statusBtn: {
    flex: 1,
    padding: "9px 8px",
    borderRadius: 8,
    border: "1px solid var(--border-2)",
    background: "var(--surface)",
    cursor: "pointer",
    fontFamily: "'Helvetica Neue', Arial, sans-serif",
    fontSize: 12,
    color: "var(--text-2)",
    textAlign: "center",
    transition: "all 0.15s",
  },
  statusBtnWant: {
    background: "#FEF3C7",
    borderColor: "#D97706",
    color: "#92400E",
  },
  statusBtnRead: {
    background: "#D1FAE5",
    borderColor: "#059669",
    color: "#065F46",
  },
  shareBtn: {
    background: "none",
    border: "1px solid var(--border-2)",
    borderRadius: 999,
    padding: "7px 14px",
    cursor: "pointer",
    fontFamily: "'Helvetica Neue', Arial, sans-serif",
    fontSize: 12,
    color: "var(--text-2)",
    letterSpacing: "0.02em",
    textAlign: "center",
  },
  aboutBlurb: {
    margin: "16px auto 0",
    fontFamily: "'Helvetica Neue', Arial, sans-serif",
    fontSize: 14,
    color: "var(--text-3)",
    lineHeight: 1.65,
    maxWidth: 540,
    textAlign: "center",
  },
  toolbar: {
    position: "fixed",
    bottom: 24,
    right: 24,
    display: "flex",
    gap: 8,
    zIndex: 50,
  },
  colorPicker: {
    position: "absolute",
    bottom: 48,
    right: 0,
    background: "var(--surface)",
    border: "1px solid var(--border-2)",
    borderRadius: 12,
    padding: 10,
    display: "grid",
    gridTemplateColumns: "repeat(3, 1fr)",
    gap: 8,
    boxShadow: "0 4px 20px rgba(0,0,0,0.12)",
    zIndex: 100,
  },
  colorSwatch: {
    width: 28,
    height: 28,
    borderRadius: "50%",
    cursor: "pointer",
    padding: 0,
    transition: "transform 0.15s",
  },
  toolbarBtn: {
    width: 40,
    height: 40,
    borderRadius: "50%",
    border: "none",
    background: "var(--surface-3)",
    color: "var(--text-3)",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  aboutModal: {
    background: "var(--surface)",
    borderRadius: 12,
    maxWidth: 460,
    width: "100%",
    padding: "52px 44px 48px",
    position: "relative",
    boxShadow: "0 32px 80px rgba(0,0,0,0.2)",
  },
  aboutModalTitle: {
    fontFamily: "Georgia, serif",
    fontSize: 28,
    fontWeight: 400,
    letterSpacing: "-0.02em",
    lineHeight: 1.15,
    color: "var(--text)",
    margin: "12px 0 24px",
  },
  aboutModalBody: {
    fontFamily: "'Helvetica Neue', Arial, sans-serif",
    fontSize: 15,
    lineHeight: 1.75,
    color: "var(--text-2)",
    margin: "0 0 14px",
  },
  statusCount: {
    fontFamily: "'Helvetica Neue', Arial, sans-serif",
    fontSize: 11,
    color: "var(--text-4)",
    margin: "3px 0 0",
    letterSpacing: "0.02em",
  },
  modalLinksWrap: {
    display: "flex",
    flexDirection: "column",
    gap: 10,
  },
  modalMiniRow: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 8,
    paddingTop: 12,
    borderTop: "1px solid var(--border)",
  },
  copiedLabel: {
    fontFamily: "'Helvetica Neue', Arial, sans-serif",
    fontSize: 11,
    color: "var(--text-3)",
    letterSpacing: "0.06em",
  },
  moreToggleMin: {
    background: "none",
    border: "none",
    cursor: "pointer",
    fontSize: 11,
    fontFamily: "'Helvetica Neue', Arial, sans-serif",
    letterSpacing: "0.04em",
    color: "var(--text-3)",
    padding: "4px 0",
  },
  shareIconBtn: {
    background: "transparent",
    border: "1px solid var(--border-2)",
    borderRadius: "50%",
    width: 30,
    height: 30,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
    color: "var(--text-3)",
    flexShrink: 0,
    padding: 0,
  },
  moreToggle: {
    background: "none",
    border: "none",
    cursor: "pointer",
    fontSize: 11,
    fontFamily: "'Helvetica Neue', Arial, sans-serif",
    letterSpacing: "0.08em",
    color: "var(--text-3)",
    textAlign: "center",
    padding: "4px 0",
  },
  modalCoverWrap: { display: "none" },
  modalImg: { display: "none" },
  modalFallback: { display: "none" },
  modalLinks: { display: "none" },
  linkPrimary: {
    display: "block",
    textAlign: "center",
    background: "var(--text)",
    color: "var(--bg)",
    padding: "11px 16px",
    borderRadius: 8,
    textDecoration: "none",
    fontSize: 14,
    fontFamily: "'Helvetica Neue', Arial, sans-serif",
    fontWeight: 400,
    lineHeight: 1.4,
  },
  linkSecondary: {
    display: "block",
    textAlign: "center",
    background: "transparent",
    color: "var(--text-2)",
    border: "1px solid var(--border-2)",
    padding: "11px 16px",
    borderRadius: 8,
    textDecoration: "none",
    fontSize: 14,
    fontFamily: "'Helvetica Neue', Arial, sans-serif",
  },
  modalRight: {
    background: "var(--surface)",
    padding: "52px 48px 48px 44px",
    display: "flex",
    flexDirection: "column",
    borderRadius: "0 12px 12px 0",
    position: "relative",
    overflowY: "auto",
  },
  modalMeta: {
    display: "flex",
    gap: 16,
    alignItems: "center",
    marginBottom: 16,
  },
  modalGenre: {
    fontFamily: "'Helvetica Neue', Arial, sans-serif",
    fontSize: 11,
    letterSpacing: "0.15em",
    textTransform: "uppercase",
    color: "var(--text-3)",
    fontWeight: 500,
  },
  modalYear: {
    fontFamily: "'Helvetica Neue', Arial, sans-serif",
    fontSize: 11,
    color: "var(--text-3)",
    letterSpacing: "0.05em",
  },
  modalTitle: {
    fontSize: 40,
    fontFamily: "Georgia, 'Times New Roman', serif",
    fontWeight: 400,
    margin: "0 0 12px",
    letterSpacing: "-0.03em",
    lineHeight: 1.08,
    color: "var(--text)",
    textAlign: "left",
  },
  modalAuthor: {
    fontFamily: "'Helvetica Neue', Arial, sans-serif",
    fontSize: 15,
    color: "var(--text-2)",
    margin: "0 0 20px",
    textAlign: "left",
  },
  modalTags: {
    display: "flex",
    gap: 8,
    flexWrap: "nowrap",
    overflowX: "auto",
    WebkitOverflowScrolling: "touch",
    marginBottom: 28,
    paddingBottom: 4,
  },
  tag: {
    fontFamily: "'Helvetica Neue', Arial, sans-serif",
    fontSize: 13,
    background: "transparent",
    color: "var(--text-2)",
    padding: "5px 14px",
    borderRadius: 100,
    border: "1px solid var(--border-2)",
  },
  synopsis: {
    fontSize: 18,
    lineHeight: 1.8,
    color: "var(--text-2)",
    margin: 0,
    fontFamily: "Georgia, 'Times New Roman', serif",
    textAlign: "left",
  },
};

const css = `
  :root {
    --text:       #111111;
    --text-2:     #444444;
    --text-3:     #525252;
    --text-4:     #585858;
    --bg:         #F8F7F4;
    --bg-hover:   #F5F3EF;
    --surface:    #FFFFFF;
    --surface-2:  #F0EDE7;
    --cover:        #E8E4DC;
    --cover-letter: rgba(0,0,0,0.22);
    --surface-3:  #ECEAE4;
    --border:     #E4E0D8;
    --border-2:   #D8D5CF;
    --placeholder:#767676;
  }
  * { box-sizing: border-box; }
  body { margin: 0; background: var(--bg); }
  .book-card { transition: background 0.15s; }
  .book-card:hover { background: var(--bg-hover) !important; }
  .link-btn:hover { opacity: 0.82; }
  .spine-card:hover { opacity: 0.75; }
  .list-row:hover { background: var(--bg-hover) !important; }
  .link-btn-sec:hover { background: var(--cover) !important; }
  .status-btn:hover { opacity: 0.82; }
  .share-icon-btn:hover { background: var(--surface-2) !important; }
  .toolbar-btn:hover { background: var(--surface-3) !important; }
  input::placeholder { color: var(--placeholder); }
  ::-webkit-scrollbar { width: 6px; }
  ::-webkit-scrollbar-thumb { background: var(--border); border-radius: 999px; }
  button:focus-visible, a:focus-visible, select:focus-visible, input:focus-visible {
    outline: 2px solid var(--text);
    outline-offset: 2px;
    border-radius: 2px;
  }
  .alpha-active { background: var(--text) !important; color: var(--bg) !important; }
  .view-active  { background: var(--text) !important; color: var(--bg) !important; }
  @keyframes rainbowSweep {
    0%   { background-position: 0% 50%; }
    50%  { background-position: 100% 50%; }
    100% { background-position: 0% 50%; }
  }
  .mars-link {
    background: linear-gradient(90deg, currentColor 0%, currentColor 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    transition: background 0.3s ease;
  }
  .mars-link:hover {
    background: linear-gradient(90deg, #5c5c5c, #a78bfa, #60a5fa, #34d399, #fbbf24, #f87171, #5c5c5c, #a78bfa, #60a5fa);
    background-size: 300% 100%;
    -webkit-background-clip: text;
    background-clip: text;
    animation: rainbowSweep 3s ease infinite;
  }
  @media (prefers-reduced-motion: reduce) {
    *, *::before, *::after { transition-duration: 0.01ms !important; animation-duration: 0.01ms !important; }
  }
  @media (max-width: 1024px) {
    .books-grid { grid-template-columns: repeat(3, minmax(0, 1fr)) !important; }
    .lit-controls { padding-left: 24px !important; padding-right: 24px !important; }
    [style*="padding: 52px 40px 44px"] { padding: 40px 24px 36px !important; }
    [style*="padding: 28px 40px 72px"] { padding: 24px 24px 56px !important; }
  }
  @media (max-width: 768px) {
    .books-grid { grid-template-columns: repeat(2, minmax(0, 1fr)) !important; }
    .search-row { flex-wrap: wrap !important; }
    .dropdown-row { width: 100% !important; flex-wrap: wrap !important; }
    .dropdown-row select { flex: 1 1 calc(50% - 4px) !important; min-width: 0 !important; box-sizing: border-box !important; }
    .modal-inner { grid-template-columns: 1fr !important; min-height: 0 !important; }
    .modal-left { order: 2 !important; border-radius: 0 0 12px 12px !important; padding: 20px 28px 32px !important; }
    .modal-right { order: 1 !important; border-radius: 12px 12px 0 0 !important; padding: 36px 28px 32px !important; }
    .modal-letter-wrap { display: none !important; }
  }
  @media (max-width: 480px) {
    .books-grid { grid-template-columns: repeat(1, minmax(0, 1fr)) !important; gap: 0 !important; }
    .lit-controls { padding-left: 16px !important; padding-right: 16px !important; }
    .dropdown-row select { flex: 1 1 100% !important; }
    [style*="padding: 52px 40px 44px"] { padding: 32px 16px 28px !important; }
    [style*="padding: 28px 40px 72px"] { padding: 20px 16px 48px !important; }
    [style*="font-size: 34px"] { font-size: 26px !important; }
    [style*="padding: 36px 32px 40px 28px"] { padding: 24px 16px 28px !important; }
    .about-modal { padding: 40px 16px 28px !important; }
    .modal-left { padding-left: 16px !important; padding-right: 16px !important; }
    .modal-right { padding-left: 16px !important; padding-right: 16px !important; }
  }
`;
