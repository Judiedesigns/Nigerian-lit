// Mirrors isPlausibleCoverMatch from src/NigerianLit.jsx
const norm = v => (v||"").toLowerCase().replace(/[‘’'`]/g,"").replace(/[^a-z0-9]+/g," ").trim();
const titleKey = v => norm(v).replace(/^(the|a|an) /,"");
const nameParts = v => norm(v).split(" ").filter(p=>p.length>2);
function plausible(book, doc){
  const want=titleKey(book.title), got=titleKey(doc.title);
  if(!want||!got) return false;
  if(!(got===want||got.startsWith(want)||want.startsWith(got))) return false;
  const wanted=nameParts(book.author), found=(doc.author_name||[]).flatMap(nameParts);
  if(!wanted.length||!found.length) return false;
  return wanted.some(p=>found.includes(p));
}

const cases = [
  ["exact match",              {title:"Things Fall Apart",author:"Chinua Achebe"}, {title:"Things Fall Apart",author_name:["Chinua Achebe"],cover_i:1}, true],
  ["subtitle drift",           {title:"Things Fall Apart",author:"Chinua Achebe"}, {title:"Things Fall Apart: A Novel",author_name:["Chinua Achebe"],cover_i:1}, true],
  ["leading article differs",  {title:"The Beggars' Strike",author:"Aminata Sow Fall"}, {title:"Beggars' Strike",author_name:["Aminata Sow Fall"],cover_i:1}, true],
  ["apostrophe differs",       {title:"The Potter's Wheel",author:"Chukwuemeka Ike"}, {title:"The Potters Wheel",author_name:["Chukwuemeka Ike"],cover_i:1}, true],
  ["author initials",          {title:"Arrow of God",author:"Chinua Achebe"}, {title:"Arrow of God",author_name:["C. Achebe"],cover_i:1}, true],
  ["multiple authors listed",  {title:"Hero's Welcome",author:"Femi Osofisan"}, {title:"Hero's Welcome",author_name:["Femi Osofisan","Ed Smith"],cover_i:1}, true],

  ["UNRELATED BOOK (the bug)", {title:"Hero's Welcome",author:"Femi Osofisan"}, {title:"Hawaii",author_name:["James A. Michener"],cover_i:1}, false],
  ["unrelated, spanish",       {title:"The Worshippers",author:"Segun Oyekunle"}, {title:"Don Enrique Zumel",author_name:["Anon"],cover_i:1}, false],
  ["same title, wrong author", {title:"Native Son",author:"Richard Wright"}, {title:"Native Son",author_name:["Ann Petry"],cover_i:1}, false],
  ["no author in result",      {title:"Faceless",author:"Amma Darko"}, {title:"Faceless",author_name:[],cover_i:1}, false],
  ["title is a prefix only",   {title:"The Trial of Brother Jero",author:"Wole Soyinka"}, {title:"The Trials of Brother Jero and The Strong Breed",author_name:["Wole Soyinka"],cover_i:1}, false],
];

let pass=0, fail=0;
for(const [name,book,doc,want] of cases){
  const got = plausible(book,doc);
  const ok = got===want;
  ok?pass++:fail++;
  console.log(`${ok?'PASS':'FAIL'}  ${name.padEnd(28)} expected ${String(want).padEnd(5)} got ${got}`);
}
console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail?1:0);
