'use client';

import { useState, useRef, useCallback, useEffect } from "react";
import { NP } from "@/lib/playerData";
import { WC2026_GROUPS } from "@/lib/wc2026Groups";
import { OPP_PLAYERS_2026 } from "@/lib/oppPlayers2026";

const FORMATIONS = ["4-3-3","4-4-2","4-2-3-1","3-5-2","3-4-3","5-3-2","4-5-1"];
const FORMATION_LAYOUT = {
  "4-3-3":  [{pos:"GK",r:0,c:.5},{pos:"LB",r:1,c:.1},{pos:"CB",r:1,c:.35},{pos:"CB",r:1,c:.65},{pos:"RB",r:1,c:.9},{pos:"CM",r:2,c:.2},{pos:"CM",r:2,c:.5},{pos:"CM",r:2,c:.8},{pos:"LW",r:3,c:.1},{pos:"ST",r:3,c:.5},{pos:"RW",r:3,c:.9}],
  "4-4-2":  [{pos:"GK",r:0,c:.5},{pos:"LB",r:1,c:.1},{pos:"CB",r:1,c:.35},{pos:"CB",r:1,c:.65},{pos:"RB",r:1,c:.9},{pos:"LM",r:2,c:.1},{pos:"CM",r:2,c:.37},{pos:"CM",r:2,c:.63},{pos:"RM",r:2,c:.9},{pos:"ST",r:3,c:.35},{pos:"ST",r:3,c:.65}],
  "4-2-3-1":[{pos:"GK",r:0,c:.5},{pos:"LB",r:1,c:.1},{pos:"CB",r:1,c:.35},{pos:"CB",r:1,c:.65},{pos:"RB",r:1,c:.9},{pos:"CDM",r:2,c:.35},{pos:"CDM",r:2,c:.65},{pos:"LW",r:3,c:.1},{pos:"CAM",r:3,c:.5},{pos:"RW",r:3,c:.9},{pos:"ST",r:4,c:.5}],
  "3-5-2":  [{pos:"GK",r:0,c:.5},{pos:"CB",r:1,c:.2},{pos:"CB",r:1,c:.5},{pos:"CB",r:1,c:.8},{pos:"LWB",r:2,c:.05},{pos:"CM",r:2,c:.3},{pos:"CM",r:2,c:.5},{pos:"CM",r:2,c:.7},{pos:"RWB",r:2,c:.95},{pos:"ST",r:3,c:.35},{pos:"ST",r:3,c:.65}],
  "3-4-3":  [{pos:"GK",r:0,c:.5},{pos:"CB",r:1,c:.2},{pos:"CB",r:1,c:.5},{pos:"CB",r:1,c:.8},{pos:"LM",r:2,c:.1},{pos:"CM",r:2,c:.37},{pos:"CM",r:2,c:.63},{pos:"RM",r:2,c:.9},{pos:"LW",r:3,c:.1},{pos:"ST",r:3,c:.5},{pos:"RW",r:3,c:.9}],
  "5-3-2":  [{pos:"GK",r:0,c:.5},{pos:"LWB",r:1,c:.05},{pos:"CB",r:1,c:.27},{pos:"CB",r:1,c:.5},{pos:"CB",r:1,c:.73},{pos:"RWB",r:1,c:.95},{pos:"CM",r:2,c:.2},{pos:"CM",r:2,c:.5},{pos:"CM",r:2,c:.8},{pos:"ST",r:3,c:.35},{pos:"ST",r:3,c:.65}],
  "4-5-1":  [{pos:"GK",r:0,c:.5},{pos:"LB",r:1,c:.1},{pos:"CB",r:1,c:.35},{pos:"CB",r:1,c:.65},{pos:"RB",r:1,c:.9},{pos:"LM",r:2,c:.05},{pos:"CM",r:2,c:.27},{pos:"CM",r:2,c:.5},{pos:"CM",r:2,c:.73},{pos:"RM",r:2,c:.95},{pos:"ST",r:3,c:.5}],
};
// Map NP to NATION_POOL format
// Expand a player's pos array with all natural aliases.
// LB → also LWB. RB → also RWB. LW → also LM. RW → also RM.
// LWB → also LB. RWB → also RB. LM → also LW. RM → also RW.
// This runs once at startup so all matching (slot chooser, eligibility, modal filter) just uses .includes()
const expandPos=(posArr)=>{
  const aliases={"LB":["LWB"],"RB":["RWB"],"LW":["LM"],"RW":["RM"],"LWB":["LB"],"RWB":["RB"],"LM":["LW"],"RM":["RW"]};
  const out=new Set(posArr);
  posArr.forEach(p=>{(aliases[p]||[]).forEach(a=>out.add(a));});
  return Array.from(out);
};
// Build NATION_POOL: strip underscore suffixes (e.g. "Argentina_1978" → "Argentina")
// so all entries for a nation are grouped under the clean name
const NATION_POOL = (()=>{
  const pool={};
  Object.entries(NP).forEach(([rawKey, entries])=>{
    // Strip _YEAR suffix if present (e.g. "Brazil_1958" → "Brazil", "West Germany" stays)
    const nation=rawKey.replace(/_\d{4}$/,'');
    if(!pool[nation])pool[nation]=[];
    entries.forEach(e=>{
      pool[nation].push({
        year:e.y,
        players:e.p.map(pl=>({name:pl.n,pos:expandPos(pl.pos),rating:pl.r}))
      });
    });
  });
  return pool;
})();
// Base nation years — all combinations
const ALL_NATION_YEARS = Object.entries(NATION_POOL).flatMap(([nation,entries])=>entries.map(e=>({nation,year:e.year})));

// All nation-years get equal weight. The pool is now large enough (~50 nations, multiple eras)
// that natural shuffling provides variety without biasing toward any group.
const buildShuffledPool=()=>{
  const pool=[...ALL_NATION_YEARS]; // equal weight — one copy each
  // Fisher-Yates shuffle for true randomness
  for(let i=pool.length-1;i>0;i--){
    const j=Math.floor(Math.random()*(i+1));
    [pool[i],pool[j]]=[pool[j],pool[i]];
  }
  return pool;
};
// Used during draft — rebuilt each time a new draft starts
let NATION_YEARS=buildShuffledPool();


const getFallbackPlayers = (oppName) => {
  const pool = OPP_PLAYERS_2026[oppName] || ["Keeper","Defender","Midfielder","Attacker","Striker","Forward","Winger","Fullback","Stopper","Creator","Finisher"];
  return pool.map(n=>({name:n}));
};

// ── Bot squad enrichment ──────────────────────────────────────────────────────
// The 2026 bot rosters (OPP_PLAYERS_2026) are flat name lists with no positions.
// We derive a role (GK/DEF/MID/FWD) + a designated keeper for every bot team by
// matching each name to the rich NP player data (which carries pos + rating).
// Matching is diacritic- and word-order-insensitive. Where no GK matches, a small
// curated fallback keeper (a name that exists in that nation's roster) is used.

// Nation-name normaliser (letters only) for matching display names to NP keys.
const npNorm=s=>s.toLowerCase().normalize("NFD").replace(/[^a-z]/g,"");
// Player-name normaliser: diacritic-stripped, punctuation→space, tokens sorted,
// 'jr'/'junior' dropped → order-insensitive key ("Neymar Jr"=="Neymar", "Doan Ritsu"=="Ritsu Doan").
const normName=s=>s.toLowerCase().normalize("NFD").replace(/\p{M}/gu,"")
  .replace(/[^a-z ]/g," ").split(/\s+/)
  .filter(t=>t&&t!=="jr"&&t!=="junior").sort().join(" ");

// NP entries indexed by normalised nation → [{year, players:[raw NP players]}]
const NP_BY_NATION=(()=>{
  const out={};
  Object.entries(NP).forEach(([rawKey,entries])=>{
    const nk=npNorm(rawKey.replace(/_\d{4}$/,"").replace(/_/g," "));
    entries.forEach(e=>{(out[nk]||(out[nk]=[])).push({year:e.y,players:e.p});});
  });
  return out;
})();
// Display names whose NP nation spelling differs from a letters-only match.
const NATION_ALIAS={"Bosnia-Herz.":"bosniaandherzegovina","Czechia":"czechrepublic","Turkiye":"turkey"};
const resolveNpEntries=display=>NP_BY_NATION[NATION_ALIAS[display]]||NP_BY_NATION[npNorm(display)]||[];

// Role classification from raw NP positions.
const FWD_POS=new Set(["ST","CF","LW","RW"]);
const MID_POS=new Set(["CAM","CM","CDM","LM","RM","AM","DM"]);
const roleOf=pos=>{
  if(pos.includes("GK"))return"GK";
  if(pos.some(p=>FWD_POS.has(p)))return"FWD";
  if(pos.some(p=>MID_POS.has(p)))return"MID";
  return"DEF";
};

// Curated keeper per nation — used only when no GK is matched from NP.
// Every value MUST be a name present in that nation's OPP_PLAYERS_2026 list.
const FALLBACK_KEEPERS={
  "Mexico":"Guillermo Ochoa","South Korea":"Jo Hyeon-woo","South Africa":"Ronwen Williams",
  "Czechia":"Jindřich Staněk","Bosnia-Herz.":"Nikola Vasilj","Morocco":"Bounou Yassine",
  "United States":"Matt Turner","Turkiye":"Uğurcan Çakır","Ivory Coast":"Alban Lafont",
  "Japan":"Suzuki Zion","Sweden":"Kristoffer Nordfeldt","Belgium":"Thibaut Courtois",
  "New Zealand":"Paulsen Alex","Cape Verde":"Vozinha","Saudi Arabia":"Mohammed Al-Owais",
  "Uruguay":"Sergio Rochet","Senegal":"Édouard Mendy","DR Congo":"Lionel Mpasi",
  "Colombia":"Camilo Vargas","Croatia":"Dominik Livaković","Ghana":"Lawrence Ati-Zigi",
};

// BOT_SQUADS[nation] = { players:[{name,role,rating}], keeper, byRole:{GK,DEF,MID,FWD} }
const BOT_SQUADS=(()=>{
  const out={};
  Object.entries(OPP_PLAYERS_2026).forEach(([nation,names])=>{
    const entries=resolveNpEntries(nation);
    let best=null;
    entries.forEach(e=>{
      if(!best)best=e;
      else if(e.year===2026)best=e;
      else if(best.year!==2026&&e.year>best.year)best=e;
    });
    const lookup={};
    (best?best.players:[]).forEach(pl=>{lookup[normName(pl.n)]={role:roleOf(pl.pos),rating:pl.r};});
    const players=names.map(n=>{const m=lookup[normName(n)];return{name:n,role:m?m.role:"MID",rating:m?m.rating:70};});
    const byRole={GK:[],DEF:[],MID:[],FWD:[]};
    players.forEach(p=>byRole[p.role].push(p));
    let keeper=null;
    byRole.GK.forEach(p=>{if(!keeper||p.rating>keeper.rating)keeper=p;});
    const keeperName=keeper?keeper.name
      :(FALLBACK_KEEPERS[nation]||names[0]);
    out[nation]={players,keeper:keeperName,byRole};
  });
  return out;
})();
// Resolve a bot squad by team name, handling KO-pool aliases.
const KO_NAME_ALIAS={"USA":"United States"};
const getBotSquad=name=>BOT_SQUADS[KO_NAME_ALIAS[name]||name]||null;

const DIFFICULTIES = {
  "Amateur":    {respins:5, chaos:6,  oppMod:-6, desc:"Weaker opponents · plenty of respins to help build your squad"},
  "Pro":        {respins:3, chaos:9,  oppMod:-3, desc:"Balanced challenge · limited respins to keep it interesting"},
  "World Class":{respins:1, chaos:12, oppMod:0,  desc:"Tough opponents · one respin — make it count"},
  "Legendary":  {respins:0, chaos:15, oppMod:+5, desc:"Elite difficulty · no respins · squad quality is everything"},
};

const KO_POOLS=[
  [{name:"Scotland",rating:74,flag:"🏴󠁧󠁢󠁳󠁣󠁴󠁿"},{name:"Haiti",rating:63,flag:"🇭🇹"},{name:"Qatar",rating:70,flag:"🇶🇦"},{name:"Curacao",rating:62,flag:"🇨🇼"},{name:"Ecuador",rating:75,flag:"🇪🇨"},{name:"Tunisia",rating:72,flag:"🇹🇳"},{name:"New Zealand",rating:65,flag:"🇳🇿"},{name:"Cape Verde",rating:69,flag:"🇨🇻"},{name:"Iraq",rating:68,flag:"🇮🇶"},{name:"Jordan",rating:67,flag:"🇯🇴"},{name:"DR Congo",rating:70,flag:"🇨🇩"},{name:"Panama",rating:67,flag:"🇵🇦"},{name:"Canada",rating:76,flag:"🇨🇦"},{name:"South Africa",rating:72,flag:"🇿🇦"},{name:"Bosnia-Herz.",rating:74,flag:"🇧🇦"},{name:"Uzbekistan",rating:68,flag:"🇺🇿"}],
  [{name:"Mexico",rating:80,flag:"🇲🇽"},{name:"Switzerland",rating:81,flag:"🇨🇭"},{name:"Morocco",rating:80,flag:"🇲🇦"},{name:"Senegal",rating:79,flag:"🇸🇳"},{name:"Norway",rating:77,flag:"🇳🇴"},{name:"Austria",rating:78,flag:"🇦🇹"},{name:"Japan",rating:78,flag:"🇯🇵"},{name:"South Korea",rating:78,flag:"🇰🇷"},{name:"Ivory Coast",rating:76,flag:"🇨🇮"},{name:"Australia",rating:74,flag:"🇦🇺"},{name:"Algeria",rating:74,flag:"🇩🇿"},{name:"Paraguay",rating:75,flag:"🇵🇾"},{name:"Uruguay",rating:82,flag:"🇺🇾"},{name:"Ghana",rating:72,flag:"🇬🇭"},{name:"Czechia",rating:76,flag:"🇨🇿"},{name:"Turkiye",rating:77,flag:"🇹🇷"}],
  [{name:"Netherlands",rating:82,flag:"🇳🇱"},{name:"Belgium",rating:82,flag:"🇧🇪"},{name:"Colombia",rating:82,flag:"🇨🇴"},{name:"Portugal",rating:86,flag:"🇵🇹"},{name:"England",rating:85,flag:"🏴󠁧󠁢󠁥󠁮󠁧󠁿"},{name:"Croatia",rating:80,flag:"🇭🇷"},{name:"USA",rating:79,flag:"🇺🇸"},{name:"Denmark",rating:79,flag:"🇩🇰"}],
  [{name:"Germany",rating:84,flag:"🇩🇪"},{name:"Spain",rating:86,flag:"🇪🇸"},{name:"Brazil",rating:85,flag:"🇧🇷"},{name:"France",rating:87,flag:"🇫🇷"},{name:"England",rating:85,flag:"🏴󠁧󠁢󠁥󠁮󠁧󠁿"},{name:"Portugal",rating:86,flag:"🇵🇹"}],
  [{name:"Argentina",rating:86,flag:"🇦🇷"},{name:"France",rating:87,flag:"🇫🇷"},{name:"Spain",rating:86,flag:"🇪🇸"},{name:"Brazil",rating:85,flag:"🇧🇷"},{name:"Germany",rating:84,flag:"🇩🇪"},{name:"England",rating:85,flag:"🏴󠁧󠁢󠁥󠁮󠁧󠁿"}],
];

// ── Helpers ───────────────────────────────────────────────────────────────────
const avgRating=sq=>{const f=sq.filter(s=>s.player);return f.length?Math.round(f.reduce((a,s)=>a+s.player.rating,0)/f.length):70;};
const ATK_POS_SET=new Set(["ST","LW","RW","CAM","LM","RM","CM"]);
const DEF_POS_SET=new Set(["GK","CB","LB","RB","LWB","RWB","CDM","CM"]);
const atkRating=sq=>{const f=sq.filter(s=>s.player&&s.player.pos.some(p=>ATK_POS_SET.has(p)));return f.length?Math.round(f.reduce((a,s)=>a+s.player.rating,0)/f.length):70;};
const defRating=sq=>{const f=sq.filter(s=>s.player&&s.player.pos.some(p=>DEF_POS_SET.has(p)));return f.length?Math.round(f.reduce((a,s)=>a+s.player.rating,0)/f.length):70;};
const pickRandom=arr=>arr[Math.floor(Math.random()*arr.length)];
const rng=(min,max)=>Math.floor(Math.random()*(max-min+1))+min;

const simMatch=(myAtk,myDef,oppAtk,oppDef,chaos)=>{
  const g=bias=>Math.max(0,Math.round(Math.random()*2.2+bias));
  const swA=(Math.random()*chaos*2)-chaos;
  const effA=(myAtk-oppDef)+swA;
  const myGoals=effA>12?g(1.1):effA>5?g(0.5):effA>-5?g(0.1):effA>-12?g(0):g(-0.4);
  const swB=(Math.random()*chaos*2)-chaos;
  const effB=(oppAtk-myDef)+swB;
  const oppGoals=effB>12?g(1.1):effB>5?g(0.5):effB>-5?g(0.1):effB>-12?g(0):g(-0.4);
  return{myGoals,oppGoals};
};

// ── Goal attribution ──────────────────────────────────────────────────────────
// Pools are role-tagged [{name,role}]. Scorer/assist drawn by role weight (FWD ≫
// MID > DEF, GK never) with a uniform floor so any outfielder can occasionally
// score — mirroring real upsets. Goal COUNTS come from the scoreline; only WHICH
// player is credited is the draw.
const ROLE_W={FWD:10,MID:4,DEF:1.2,GK:0};
const weightedPick=(pool,exclude)=>{
  // Exclude the scorer by NORMALISED name, not object identity — a squad can hold the
  // same real player under two era spellings ("Son Heung-min"/"Heung-min Son"), which
  // are distinct objects; reference-only exclusion let one assist the other (self-assist).
  const exKey=exclude?normName(exclude.name):null;
  const cand=pool.filter(p=>p.role!=="GK"&&(!exKey||normName(p.name)!==exKey));
  if(!cand.length)return null;
  // Role dominates; rating nudges (gentle — a 95 vs 78 forward differ ~1.2×, so
  // upsets and surprise top-scorers stay possible). Applies to user & bot alike.
  const w=cand.map(p=>((ROLE_W[p.role]??1)*((p.rating||80)/80))+0.5);
  let r=Math.random()*w.reduce((a,b)=>a+b,0);
  for(let i=0;i<cand.length;i++){if((r-=w[i])<0)return cand[i];}
  return cand[cand.length-1];
};
// Bot squad as a role-tagged pool (fallback: generic mids if nation unknown).
const botPool=name=>{const sq=getBotSquad(name);return sq?sq.players:getFallbackPlayers(name).map(p=>({name:p.name,role:"MID"}));};
// Generate named goal events (no cards) for a bot-vs-bot fixture.
const attributeEvents=({aPool,bPool,aGoals,bGoals})=>{
  const events=[];const usedMins=new Set();
  const getMin=()=>{let m;do{m=rng(1,90);}while(usedMins.has(m));usedMins.add(m);return m;};
  const gen=(pool,n,team)=>{for(let i=0;i<n;i++){
    const sc=weightedPick(pool);const as=sc?weightedPick(pool,sc):null;
    events.push({type:"goal",team,name:sc?sc.name:"Player",assist:as&&Math.random()<0.75?as.name:null,min:getMin()});
  }};
  gen(aPool,aGoals,"a");gen(bPool,bGoals,"b");
  return{events:events.sort((x,y)=>x.min-y.min)};
};
// Bot-vs-bot fixture: real scoreline + attributed scorers. {a,b,ag,bg,events}
const simFixtureWithEvents=(teamA,teamB,chaos)=>{
  const r=simMatch(teamA.rating,teamA.rating,teamB.rating,teamB.rating,chaos);
  const{events}=attributeEvents({aPool:botPool(teamA.name),bPool:botPool(teamB.name),aGoals:r.myGoals,bGoals:r.oppGoals});
  return{a:teamA.name,b:teamB.name,ag:r.myGoals,bg:r.oppGoals,events};
};

// User match events: role-weighted attribution for both sides, plus card flavor
// and the red-card goal adjustment. events.length stays == adjusted goal counts.
const buildEvents=(myG,opG,mySquad,oppName)=>{
  const userPool=mySquad.filter(s=>s.player).map(s=>({name:s.player.name,role:roleOf(s.player.pos),rating:s.player.rating}));
  const oppSquad=getBotSquad(oppName);
  const oppPool=oppSquad?oppSquad.players:getFallbackPlayers(oppName).map(p=>({name:p.name,role:"MID"}));
  const usedMins=new Set();
  const getMin=()=>{let m;do{m=rng(1,90);}while(usedMins.has(m));usedMins.add(m);return m;};
  const rawEvents=[];

  // Cards first — assign random minutes
  let usRedName=null;let themRedName=null;let usRedMin=999;let themRedMin=999;
  if(Math.random()<0.5&&userPool.length){rawEvents.push({type:"yellow",team:"us",name:pickRandom(userPool).name,min:getMin()});}
  if(Math.random()<0.4&&oppPool.length){rawEvents.push({type:"yellow",team:"them",name:pickRandom(oppPool).name,min:getMin()});}
  if(Math.random()<0.08){
    const redTeam=Math.random()>.5?"us":"them";
    const redName=redTeam==="us"&&userPool.length?pickRandom(userPool).name:pickRandom(oppPool).name;
    const redMin=getMin();
    rawEvents.push({type:"red",team:redTeam,name:redName,min:redMin});
    if(redTeam==="us"){usRedName=redName;usRedMin=redMin;}
    else{themRedName=redName;themRedMin=redMin;}
  }

  // Red card disadvantages the penalised team's goal count (earlier = bigger impact).
  let adjMyG=myG;let adjOpG=opG;
  if(usRedName&&usRedMin<999){
    const minsWithTen=90-usRedMin;
    if(minsWithTen>45&&Math.random()<0.7){adjMyG=Math.max(0,adjMyG-1);adjOpG=Math.min(adjOpG+(Math.random()<0.5?1:0),adjOpG+1);}
    else if(minsWithTen>20&&Math.random()<0.5){adjMyG=Math.max(0,adjMyG-rng(0,1));if(Math.random()<0.35)adjOpG=adjOpG+1;}
    else if(Math.random()<0.25){adjMyG=Math.max(0,adjMyG-1);}
  }
  if(themRedName&&themRedMin<999){
    const minsWithTen=90-themRedMin;
    if(minsWithTen>45&&Math.random()<0.6){adjMyG=adjMyG+(Math.random()<0.5?1:0);adjOpG=Math.max(0,adjOpG-rng(0,1));}
    else if(minsWithTen>20&&Math.random()<0.4){adjMyG=adjMyG+(Math.random()<0.3?1:0);}
  }

  // Goals — exclude a player red-carded before this minute from scoring/assisting.
  const genGoals=(pool,n,team,redName,redMin)=>{for(let i=0;i<n;i++){
    const min=getMin();
    const eff=pool.filter(p=>!(p.name===redName&&redMin<min));
    const usePool=eff.length?eff:pool;
    const sc=weightedPick(usePool);
    const as=sc?weightedPick(usePool,sc):null;
    rawEvents.push({type:"goal",team,name:sc?sc.name:"Player",assist:as&&Math.random()<0.75?as.name:null,min});
  }};
  genGoals(userPool,adjMyG,"us",usRedName,usRedMin);
  genGoals(oppPool,adjOpG,"them",themRedName,themRedMin);

  return{events:rawEvents.sort((a,b)=>a.min-b.min),myG:adjMyG,opG:adjOpG};
};

// ── Pre-Tournament Odds (Monte Carlo) ─────────────────────────────────────────
// Runs the real match engine N times from the squad's ATK/DEF to derive honest
// probabilities for each stage. Mirrors the live tournament: a 4-team group
// (top 2 auto-qualify, 3rd qualifies ~8-of-12 of the time) then a 5-round KO
// where opponents are sampled from KO_POOLS by round strength.
const STAGE_LABELS=["Group Stage","Round of 32","Round of 16","Quarter-Finals","Semi-Finals","The Final","World Champions"];
const simOneTournament=(myAtk,myDef,chaos,oppMod)=>{
  // Group: sample a real 2026 group, take its three strongest as your opponents
  const g=pickRandom(WC2026_GROUPS);
  const weakest=g.teams.reduce((a,b)=>a.rating<b.rating?a:b);
  const opps=g.teams.filter(t=>t.name!==weakest.name);
  const teams=[{name:"YOU",atk:myAtk,def:myDef},
    ...opps.map(o=>({name:o.name,atk:o.rating+oppMod,def:o.rating+oppMod}))];
  const st={};let wins=0;
  teams.forEach(t=>st[t.name]={pts:0,gf:0,ga:0});
  for(let i=0;i<teams.length;i++)for(let j=i+1;j<teams.length;j++){
    const r=simMatch(teams[i].atk,teams[i].def,teams[j].atk,teams[j].def,chaos);
    const A=st[teams[i].name];const B=st[teams[j].name];
    A.gf+=r.myGoals;A.ga+=r.oppGoals;B.gf+=r.oppGoals;B.ga+=r.myGoals;
    if(r.myGoals>r.oppGoals){A.pts+=3;if(i===0)wins++;}
    else if(r.myGoals===r.oppGoals){A.pts++;B.pts++;}
    else{B.pts+=3;}
  }
  const table=Object.entries(st).map(([name,v])=>({name,...v,gd:v.gf-v.ga}))
    .sort((a,b)=>b.pts-a.pts||b.gd-a.gd||b.gf-a.gf);
  const pos=table.findIndex(t=>t.name==="YOU");
  const qualified=pos<2||(pos===2&&Math.random()<8/12);
  if(!qualified)return{stage:0,wins};
  // Knockout: win to advance, sampling opponents from progressively tougher pools
  let stage=1; // reached R32
  for(let round=0;round<5;round++){
    const pool=KO_POOLS[round]||KO_POOLS[KO_POOLS.length-1];
    const oppR=pickRandom(pool).rating+oppMod;
    const r=simMatch(myAtk,myDef,oppR,oppR,chaos);
    const won=r.myGoals===r.oppGoals?Math.random()<0.5:r.myGoals>r.oppGoals;
    if(!won)return{stage,wins};
    wins++;stage++; // advanced one round
  }
  return{stage:6,wins}; // won the final
};
const computeOdds=(myAtk,myDef,chaos,oppMod,runs=4000)=>{
  const tally=[0,0,0,0,0,0,0];let winsSum=0;const stages=[];
  for(let i=0;i<runs;i++){
    const{stage,wins}=simOneTournament(myAtk,myDef,chaos,oppMod);
    tally[stage]++;winsSum+=wins;stages.push(stage);
  }
  const pct=n=>Math.round((n/runs)*1000)/10;
  // Cumulative "reached at least this far" probabilities
  const atLeast=k=>pct(tally.slice(k).reduce((a,b)=>a+b,0));
  stages.sort((a,b)=>a-b);
  const median=stages[Math.floor(runs/2)];
  // Likely range (25th–75th percentile) — the projection clusters at the median for most
  // squads, so we surface a band + lean on the per-stage % bars rather than one flat label.
  const projLowIdx=stages[Math.floor(runs*0.25)];
  const projHighIdx=stages[Math.floor(runs*0.75)];
  return{
    runs,
    projected:STAGE_LABELS[median],
    projStageIdx:median,
    projLowIdx,
    projHighIdx,
    projLow:STAGE_LABELS[projLowIdx],
    projHigh:STAGE_LABELS[projHighIdx],
    expWins:Math.round((winsSum/runs)*10)/10,
    champion:atLeast(6),
    final:atLeast(5),
    semis:atLeast(4),
    quarters:atLeast(3),
    last16:atLeast(2),
    qualify:atLeast(1),
    groupExit:pct(tally[0]),
  };
};

const simGroup=(teams,chaos)=>{
  const st={};
  teams.forEach(t=>{st[t.name]={...t,p:0,w:0,d:0,l:0,gf:0,ga:0,pts:0};});
  for(let a=0;a<teams.length;a++)for(let b=a+1;b<teams.length;b++){
    const rA=teams[a].rating;const rB=teams[b].rating;
    const r=simMatch(rA,rA,rB,rB,chaos);
    const[ta,tb]=[st[teams[a].name],st[teams[b].name]];
    ta.p++;tb.p++;ta.gf+=r.myGoals;ta.ga+=r.oppGoals;tb.gf+=r.oppGoals;tb.ga+=r.myGoals;
    if(r.myGoals>r.oppGoals){ta.w++;ta.pts+=3;tb.l++;}
    else if(r.myGoals===r.oppGoals){ta.d++;ta.pts+=1;tb.d++;tb.pts+=1;}
    else{tb.w++;tb.pts+=3;ta.l++;}
  }
  return Object.values(st).sort((a,b)=>b.pts-a.pts||(b.gf-b.ga)-(a.gf-a.ga)||b.gf-a.gf);
};

// Compute standings from pre-seeded match results (both user and non-user).
// oppFixtures: [{a: teamName, b: teamName, ag: goals, bg: goals}] — all non-user matches for the group
// userResults: [{myGoals, oppGoals, opp}] — user's matches played so far
// matchday: which matchday we're displaying (1,2,3) — only include fixtures from that matchday and before
const computeStandings=(userResults,userTeam,groupTeams,oppFixtures,matchday)=>{
  const st={};
  groupTeams.forEach(t=>{st[t.name]={...t,p:0,w:0,d:0,l:0,gf:0,ga:0,pts:0,isUser:t.name===userTeam.name};});
  // Apply user results (matchday 1=result[0], matchday 2=result[1], matchday 3=result[2])
  userResults.forEach((r,i)=>{
    if(i+1>matchday)return; // only up to this matchday
    const opp=r.opp;
    const[tu,to]=[st[userTeam.name],st[opp.name]];
    tu.p++;to.p++;tu.gf+=r.myGoals;tu.ga+=r.oppGoals;to.gf+=r.oppGoals;to.ga+=r.myGoals;
    if(r.myGoals>r.oppGoals){tu.w++;tu.pts+=3;to.l++;}
    else if(r.myGoals===r.oppGoals){tu.d++;tu.pts+=1;to.d++;to.pts+=1;}
    else{to.w++;to.pts+=3;tu.l++;}
  });
  // Apply non-user fixtures up to this matchday
  (oppFixtures||[]).forEach(f=>{
    if(f.matchday>matchday)return;
    const[ta,tb]=[st[f.a],st[f.b]];
    if(!ta||!tb)return;
    ta.p++;tb.p++;ta.gf+=f.ag;ta.ga+=f.bg;tb.gf+=f.bg;tb.ga+=f.ag;
    if(f.ag>f.bg){ta.w++;ta.pts+=3;tb.l++;}
    else if(f.ag===f.bg){ta.d++;ta.pts+=1;tb.d++;tb.pts+=1;}
    else{tb.w++;tb.pts+=3;ta.l++;}
  });
  return Object.values(st).sort((a,b)=>b.pts-a.pts||(b.gf-b.ga)-(a.gf-a.ga)||b.gf-a.gf);
};

// Seed all non-user fixtures for a group once at tournament start.
// 4-team group [user=U, A=opps[0], B=opps[1], C=opps[2]]:
//   Matchday 1: U vs A,  B vs C
//   Matchday 2: U vs B,  A vs C
//   Matchday 3: U vs C,  A vs B
const seedOppFixtures=(opps,chaos)=>{
  const pairs=[{a:opps[0].name,b:opps[1].name,rA:opps[0].rating,rB:opps[1].rating,matchday:1},
               {a:opps[0].name,b:opps[2].name,rA:opps[0].rating,rB:opps[2].rating,matchday:2},
               {a:opps[1].name,b:opps[2].name,rA:opps[1].rating,rB:opps[2].rating,matchday:3}];
  // Wait: MD1: U-A + B-C; MD2: U-B + A-C; MD3: U-C + A-B
  // So: pair (B,C) = matchday 1; pair (A,C) = matchday 2; pair (A,B) = matchday 3
  const fixtures=[
    {a:opps[1].name,b:opps[2].name,rA:opps[1].rating,rB:opps[2].rating,matchday:1},
    {a:opps[0].name,b:opps[2].name,rA:opps[0].rating,rB:opps[2].rating,matchday:2},
    {a:opps[0].name,b:opps[1].name,rA:opps[0].rating,rB:opps[1].rating,matchday:3},
  ];
  return fixtures.map(f=>{
    const r=simMatch(f.rA,f.rA,f.rB,f.rB,chaos);
    return{a:f.a,b:f.b,ag:r.myGoals,bg:r.oppGoals,matchday:f.matchday};
  });
};

// Seed EVERY group's full round-robin (6 fixtures) WITH attributed events at setup,
// so the global stats + all-groups results UI have real data. In the user's group,
// the 3 fixtures involving YOUR TEAM are left empty (played live, merged later).
const seedAllGroups=(allGroups,userGroupIdx,chaos)=>{
  const botFx=(x,y,md)=>({...simFixtureWithEvents(x,y,chaos),matchday:md,isUserFixture:false});
  return allGroups.map((g,gi)=>{
    const teams=g.teams;
    let fixtures;
    if(gi===userGroupIdx){
      const user=teams.find(t=>t.isUser);
      const opps=teams.filter(t=>!t.isUser);
      fixtures=[
        {a:user.name,b:opps[0].name,ag:null,bg:null,events:[],matchday:1,isUserFixture:true},
        {a:user.name,b:opps[1].name,ag:null,bg:null,events:[],matchday:2,isUserFixture:true},
        {a:user.name,b:opps[2].name,ag:null,bg:null,events:[],matchday:3,isUserFixture:true},
        botFx(opps[1],opps[2],1),
        botFx(opps[0],opps[2],2),
        botFx(opps[0],opps[1],3),
      ];
    }else{
      const[t0,t1,t2,t3]=teams;
      fixtures=[botFx(t0,t1,1),botFx(t2,t3,1),botFx(t0,t2,2),botFx(t1,t3,2),botFx(t0,t3,3),botFx(t1,t2,3)];
    }
    return{groupId:g.id,fixtures};
  });
};

// Standings for any group, computed straight from its fixtures (unplayed user
// fixtures have ag==null and are skipped). Same sort tuple as computeStandings.
const computeStandingsFromFixtures=(teams,fixtures,uptoMatchday,userTeamName)=>{
  const st={};
  teams.forEach(t=>{st[t.name]={...t,p:0,w:0,d:0,l:0,gf:0,ga:0,pts:0,isUser:t.name===userTeamName};});
  (fixtures||[]).forEach(f=>{
    if(f.matchday>uptoMatchday||f.ag==null||f.bg==null)return;
    const ta=st[f.a];const tb=st[f.b];if(!ta||!tb)return;
    ta.p++;tb.p++;ta.gf+=f.ag;ta.ga+=f.bg;tb.gf+=f.bg;tb.ga+=f.ag;
    if(f.ag>f.bg){ta.w++;ta.pts+=3;tb.l++;}
    else if(f.ag===f.bg){ta.d++;ta.pts++;tb.d++;tb.pts++;}
    else{tb.w++;tb.pts+=3;ta.l++;}
  });
  return Object.values(st).sort((a,b)=>b.pts-a.pts||(b.gf-b.ga)-(a.gf-a.ga)||b.gf-a.gf);
};

// ── Formation Pitch ───────────────────────────────────────────────────────────
const ROW_BOT={0:88,1:68,2:50,3:30,4:12};
const Pitch=({formation,slots,activeIdx,onSlot,clickable=true})=>{
  const layout=FORMATION_LAYOUT[formation]||[];
  return(
    <div style={{position:"relative",width:"100%",maxWidth:360,margin:"0 auto",aspectRatio:"0.65",background:"linear-gradient(180deg,#dfe6d2 0%,#d4ddc2 50%,#dfe6d2 100%)",border:"1.5px solid #191710",borderRadius:2,overflow:"hidden",boxShadow:"3px 3px 0 rgba(25,23,16,0.1)"}}>
      {/* Halftone-print dot field */}
      <div style={{position:"absolute",inset:0,background:"radial-gradient(rgba(47,111,67,0.12) 1px,transparent 1px)",backgroundSize:"6px 6px",pointerEvents:"none"}}/>
      {/* Chalk tactics lines */}
      <svg style={{position:"absolute",inset:0,width:"100%",height:"100%",opacity:.55}} viewBox="0 0 100 154">
        <rect x="7" y="4" width="86" height="146" fill="none" stroke="#2f6f43" strokeWidth="0.8"/>
        <circle cx="50" cy="77" r="13" fill="none" stroke="#2f6f43" strokeWidth=".7"/>
        <line x1="7" y1="77" x2="93" y2="77" stroke="#2f6f43" strokeWidth=".5"/>
        <rect x="23" y="4" width="54" height="19" fill="none" stroke="#2f6f43" strokeWidth=".6"/>
        <rect x="23" y="131" width="54" height="19" fill="none" stroke="#2f6f43" strokeWidth=".6"/>
        <circle cx="50" cy="77" r="1.4" fill="#2f6f43"/>
      </svg>
      {layout.map((item,i)=>{
        const s=slots[i];const filled=!!s?.player;const active=activeIdx===i;
        const isLegend=filled&&s.player.rating>=90;
        const dotColor=isLegend?"#cf2e2e":filled?"#2f6f43":"rgba(25,23,16,0.25)";
        const borderColor=active?"#cf2e2e":isLegend?"#cf2e2e":filled?"rgba(47,111,67,0.7)":"rgba(25,23,16,0.2)";
        const bgColor=active?"rgba(207,46,46,0.25)":isLegend?"rgba(207,46,46,0.15)":filled?"rgba(47,111,67,0.12)":"rgba(25,23,16,0.05)";
        return(
          <div key={i} onClick={()=>clickable&&onSlot&&onSlot(i)} style={{position:"absolute",left:`${item.c*100}%`,bottom:`${ROW_BOT[item.r]}%`,transform:"translate(-50%,50%)",display:"flex",flexDirection:"column",alignItems:"center",gap:2,cursor:clickable?"pointer":"default",zIndex:active?10:1}}>
            <div style={{width:44,height:44,borderRadius:"50%",background:bgColor,border:`2px solid ${borderColor}`,display:"flex",alignItems:"center",justifyContent:"center",boxShadow:active?"0 0 12px rgba(207,46,46,.5)":(isLegend?"0 0 8px rgba(207,46,46,.3)":"none"),transition:"all .18s"}}>
              {filled
                ?<span style={{fontSize:"0.52rem",lineHeight:1.15,textAlign:"center",color:isLegend?"#cf2e2e":"#1f5130",fontWeight:700,padding:"1px",fontFamily:"var(--font-sans)",letterSpacing:"0.3px"}}>{s.player.name.split(" ").pop().substring(0,9)}</span>
                :<span style={{fontSize:"0.65rem",color:active?"#cf2e2e":"rgba(25,23,16,.4)",fontWeight:700,fontFamily:"var(--font-sans)",letterSpacing:"0.5px"}}>{item.pos}</span>}
            </div>
            {filled&&<div style={{fontSize:"0.72rem",color:isLegend?"#cf2e2e":"#2f6f43",fontWeight:700,background:"rgba(25,23,16,.9)",padding:"2px 5px",borderRadius:2,fontFamily:"var(--font-mono)",letterSpacing:"0.5px",lineHeight:1.2}}>{s.player.rating}</div>}
          </div>
        );
      })}
    </div>
  );
};

// Flag abbreviations — reliable fallback when emoji flags don't render
const FLAG_ABBR={"Brazil":"BR","Morocco":"MA","Haiti":"HT","Scotland":"SCO","Mexico":"MX","South Korea":"KOR","South Africa":"RSA","Czechia":"CZE","Canada":"CAN","Switzerland":"SUI","Qatar":"QAT","Bosnia-Herz.":"BIH","United States":"USA","Paraguay":"PAR","Australia":"AUS","Turkiye":"TUR","Germany":"GER","Curacao":"CUR","Ivory Coast":"CIV","Ecuador":"ECU","Netherlands":"NED","Japan":"JPN","Sweden":"SWE","Tunisia":"TUN","Belgium":"BEL","Egypt":"EGY","Iran":"IRN","New Zealand":"NZL","Spain":"ESP","Cape Verde":"CPV","Saudi Arabia":"KSA","Uruguay":"URU","France":"FRA","Senegal":"SEN","Iraq":"IRQ","Norway":"NOR","Argentina":"ARG","Algeria":"ALG","Austria":"AUT","Jordan":"JOR","Portugal":"POR","DR Congo":"COD","Uzbekistan":"UZB","Colombia":"COL","England":"ENG","Croatia":"CRO","Ghana":"GHA","Panama":"PAN","Nigeria":"NGA","Cameroon":"CMR","Denmark":"DEN","YOUR TEAM":"YOU"};
const FLAG_CODE={"Mexico":"mx","South Korea":"kr","South Africa":"za","Czechia":"cz","Canada":"ca","Switzerland":"ch","Qatar":"qa","Bosnia-Herz.":"ba","Brazil":"br","Morocco":"ma","Haiti":"ht","Scotland":"gb-sct","United States":"us","Paraguay":"py","Australia":"au","Turkiye":"tr","Germany":"de","Curacao":"cw","Ivory Coast":"ci","Ecuador":"ec","Netherlands":"nl","Japan":"jp","Sweden":"se","Tunisia":"tn","Belgium":"be","Egypt":"eg","Iran":"ir","New Zealand":"nz","Spain":"es","Cape Verde":"cv","Saudi Arabia":"sa","Uruguay":"uy","France":"fr","Senegal":"sn","Iraq":"iq","Norway":"no","Argentina":"ar","Algeria":"dz","Austria":"at","Jordan":"jo","Portugal":"pt","DR Congo":"cd","Uzbekistan":"uz","Colombia":"co","England":"gb-eng","Croatia":"hr","Ghana":"gh","Panama":"pa","Nigeria":"ng","Cameroon":"cm","Denmark":"dk"};
const FlagBadge=({name})=>{
  const isUser=name==="YOUR TEAM";
  if(isUser)return(
    <span style={{display:"inline-flex",alignItems:"center",justifyContent:"center",width:32,height:18,fontSize:"0.46rem",fontWeight:700,background:"rgba(207,46,46,0.15)",color:"#cf2e2e",borderRadius:3,marginRight:6,flexShrink:0,fontFamily:"var(--font-sans)",border:"1px solid rgba(207,46,46,0.35)"}}>★</span>
  );
  const code=FLAG_CODE[name];
  if(code)return(
    <img src={`https://flagcdn.com/w80/${code}.png`} width={32} height={18}
      style={{borderRadius:2,objectFit:"cover",marginRight:6,flexShrink:0,display:"inline-block",verticalAlign:"middle"}}
      alt={FLAG_ABBR[name]||name?.substring(0,3)||""}/>
  );
  const abbr=FLAG_ABBR[name]||name?.substring(0,3).toUpperCase()||"???";
  return(
    <span style={{display:"inline-flex",alignItems:"center",justifyContent:"center",width:32,height:18,fontSize:"0.46rem",fontWeight:700,letterSpacing:"0.5px",background:"rgba(25,23,16,0.06)",color:"#6f6755",borderRadius:3,marginRight:6,flexShrink:0,fontFamily:"var(--font-sans)",border:"1px solid rgba(25,23,16,0.1)"}}>
      {abbr}
    </span>
  );
};

// ── Group Table ───────────────────────────────────────────────────────────────
const GTable=({standings})=>(
  <table style={{width:"100%",borderCollapse:"collapse",fontFamily:"var(--font-sans)"}}>
    <thead><tr style={{color:"#a99f88",fontSize:"0.62rem",letterSpacing:"1.5px",textTransform:"uppercase"}}>
      {["","TEAM","P","W","D","L","GD","PTS"].map((h,i)=>(
        <th key={i} style={{textAlign:i<=1?"left":"center",padding:"5px 4px",borderBottom:"1px solid rgba(25,23,16,0.07)",fontWeight:600}}>{h}</th>
      ))}
    </tr></thead>
    <tbody>{standings.map((t,i)=>{
      const q=i<2;
      const gd=t.gf-t.ga;
      return(
        <tr key={t.name} style={{background:t.isUser?"rgba(207,46,46,0.07)":"transparent",borderTop:"1px solid rgba(25,23,16,0.04)"}}>
          <td style={{padding:"5px 4px",textAlign:"center"}}>
            <span style={{display:"inline-block",width:7,height:7,borderRadius:"50%",background:q?"#cf2e2e":"rgba(25,23,16,0.12)",boxShadow:q?"0 0 5px rgba(207,46,46,0.5)":"none"}}/>
          </td>
          <td style={{padding:"5px 4px",maxWidth:110,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>
            <span style={{display:"inline-flex",alignItems:"center"}}>
              <FlagBadge name={t.name}/>
              <span style={{fontWeight:t.isUser?700:400,color:t.isUser?"#cf2e2e":"#2a261c",fontSize:"0.78rem"}}>{t.name}</span>
            </span>
          </td>
          {[t.p,t.w,t.d,t.l].map((v,j)=><td key={j} style={{textAlign:"center",padding:"5px 3px",color:"#a99f88",fontSize:"0.76rem"}}>{v}</td>)}
          <td style={{textAlign:"center",padding:"5px 3px",color:gd>0?"#2f6f43":gd<0?"#cf2e2e":"#a99f88",fontWeight:gd!==0?600:400,fontSize:"0.76rem"}}>{gd>0?"+":""}{gd}</td>
          <td style={{textAlign:"center",padding:"5px 3px",fontWeight:700,color:t.isUser?"#cf2e2e":"#191710",fontSize:"0.95rem",fontFamily:"var(--font-mono)",letterSpacing:"0.5px"}}>{t.pts}</td>
        </tr>
      );
    })}</tbody>
  </table>
);

// ── Group results with scorers ────────────────────────────────────────────────
const lastName=n=>(n||"").split(" ").pop();
const fixtureScorers=f=>{
  const a=[];const b=[];
  (f.events||[]).forEach(e=>{if(e.type==="goal")((e.team==="a"||e.team==="us")?a:b).push(e);});
  return{a,b};
};
const ScorerLine=({goals,align,size="0.64rem"})=>(
  <div style={{flex:1,minWidth:0,textAlign:align,fontFamily:"var(--font-sans)",fontSize:size,color:"#6f6755",lineHeight:1.4}}>
    {goals.map((g,i)=><span key={i} style={{display:"block",whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>⚽ {lastName(g.name)}{g.assist?<span style={{color:"#a99f88"}}> ({lastName(g.assist)})</span>:null}</span>)}
  </div>
);
const GroupResultsList=({fixtures,uptoMatchday})=>{
  const shown=(fixtures||[]).filter(f=>f.matchday<=uptoMatchday&&f.ag!=null&&f.bg!=null);
  if(!shown.length)return<div style={{textAlign:"center",padding:"12px 0",fontFamily:"var(--font-sans)",fontSize:"0.74rem",color:"#a99f88"}}>No matches played yet.</div>;
  const mds=[1,2,3].filter(md=>shown.some(f=>f.matchday===md));
  return(
    <div>
      {mds.map(md=>(
        <div key={md} style={{marginBottom:8}}>
          <div style={{fontFamily:"var(--font-mono)",fontSize:"0.58rem",letterSpacing:"2px",color:"#a99f88",marginBottom:4,textTransform:"uppercase"}}>Matchday {md}</div>
          {shown.filter(f=>f.matchday===md).map((f,i)=>{
            const{a,b}=fixtureScorers(f);
            const aWin=f.ag>f.bg;const bWin=f.bg>f.ag;
            return(
              <div key={i} style={{padding:"6px 8px",background:"rgba(25,23,16,0.02)",border:"1px solid rgba(25,23,16,0.05)",borderRadius:3,marginBottom:4}}>
                <div style={{display:"flex",alignItems:"center",gap:6}}>
                  <span style={{flex:1,display:"flex",alignItems:"center",gap:4,minWidth:0,justifyContent:"flex-end"}}>
                    <span style={{fontFamily:"var(--font-sans)",fontSize:"0.74rem",fontWeight:aWin?700:400,color:f.a==="YOUR TEAM"?"#cf2e2e":aWin?"#191710":"#6f6755",whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{f.a}</span>
                    <FlagBadge name={f.a}/>
                  </span>
                  <span style={{fontFamily:"var(--font-mono)",fontSize:"1rem",color:"#2a261c",letterSpacing:"1px",flexShrink:0}}>{f.ag}–{f.bg}</span>
                  <span style={{flex:1,display:"flex",alignItems:"center",gap:4,minWidth:0}}>
                    <FlagBadge name={f.b}/>
                    <span style={{fontFamily:"var(--font-sans)",fontSize:"0.74rem",fontWeight:bWin?700:400,color:f.b==="YOUR TEAM"?"#cf2e2e":bWin?"#191710":"#6f6755",whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{f.b}</span>
                  </span>
                </div>
                {(a.length||b.length)?(
                  <div style={{display:"flex",gap:8,marginTop:3}}>
                    <ScorerLine goals={a} align="right"/>
                    <span style={{width:1,background:"rgba(25,23,16,0.05)"}}/>
                    <ScorerLine goals={b} align="left"/>
                  </div>
                ):null}
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );
};

// ── All-groups browser (tabbed standings + results) ───────────────────────────
const AllGroupsBrowser=({allGroupFixtures,allGroups,userGroupIdx,uptoMatchday})=>{
  const[tab,setTab]=useState(userGroupIdx||0);
  if(!allGroupFixtures||!allGroups)return null;
  const teams=allGroups[tab].teams;
  const fixtures=allGroupFixtures[tab].fixtures;
  const standings=computeStandingsFromFixtures(teams,fixtures,uptoMatchday,"YOUR TEAM");
  return(
    <div style={{marginBottom:16}}>
      <div className="tag" style={{marginBottom:8}}>All Groups · Standings & Results</div>
      <div style={{display:"flex",flexWrap:"wrap",gap:4,marginBottom:10}}>
        {allGroups.map((g,i)=>{
          const isU=i===userGroupIdx;const active=i===tab;
          return(
            <button key={g.id} onClick={()=>setTab(i)} style={{flex:"1 0 auto",minWidth:34,padding:"5px 0",borderRadius:3,cursor:"pointer",
              fontFamily:"var(--font-mono)",fontSize:"0.8rem",letterSpacing:"1px",
              border:`1px solid ${active?"rgba(207,46,46,0.6)":isU?"rgba(207,46,46,0.25)":"rgba(25,23,16,0.07)"}`,
              background:active?"rgba(207,46,46,0.14)":"rgba(25,23,16,0.02)",color:active?"#cf2e2e":isU?"#cf2e2e":"#6f6755"}}>{g.id}{isU?"★":""}</button>
          );
        })}
      </div>
      <GTable standings={standings}/>
      <div style={{marginTop:10}}><GroupResultsList fixtures={fixtures} uptoMatchday={uptoMatchday}/></div>
    </div>
  );
};

// ── Match Sim ─────────────────────────────────────────────────────────────────
// simPenalties: returns {myScore, oppScore} using realistic shootout rules.
// Each team takes up to 5 kicks (~75% conversion). If still level, sudden death.
// We also early-terminate if the result is already mathematically decided.
const simPenalties=()=>{
  let myS=0;let oppS=0;
  const myKicks=[];const oppKicks=[];
  for(let i=0;i<5;i++){
    const mk=Math.random()<0.75;const ok=Math.random()<0.75;
    myKicks.push(mk);oppKicks.push(ok);
    if(mk)myS++;if(ok)oppS++;
    // Early termination: if one side can't catch up with remaining kicks
    const rem=4-i;
    if(myS>oppS+rem||oppS>myS+rem)break;
  }
  if(myS===oppS){
    // Sudden death — keep going until someone misses and other scores
    for(let sd=0;sd<10;sd++){
      const mk=Math.random()<0.75;const ok=Math.random()<0.75;
      if(mk)myS++;if(ok)oppS++;
      if(myS!==oppS)break;
    }
  }
  return{myScore:myS,oppScore:oppS};
};

const MatchSim=({myG,opG,events,opp,onComplete,isKO})=>{
  const [shown,setShown]=useState([]);
  const [clock,setClock]=useState(0);
  const [simPhase,setSimPhase]=useState("regulation");
  const [penResult,setPenResult]=useState(null);
  const evRef=useRef(events);
  const isDraw=myG===opG;

  useEffect(()=>{
    if(simPhase!=="regulation")return;
    const iv=setInterval(()=>setClock(p=>{
      const n=p+0.9;
      if(n>=90){
        clearInterval(iv);
        setShown([...evRef.current]); // flush — reveal any 90' goal so the score matches the result
        if(isKO&&isDraw){
          const pr=simPenalties();
          setPenResult(pr);
          setSimPhase("pens");
        } else {
          setSimPhase("done");
        }
        return 90;
      }
      return n;
    }),170);
    return()=>clearInterval(iv);
  },[simPhase]);

  useEffect(()=>{
    if(simPhase!=="regulation")return;
    const due=evRef.current.filter(e=>e.min<=clock&&!shown.includes(e));
    if(due.length)setShown(p=>[...p,...due]);
  },[clock,simPhase]);

  const regScoreUs=shown.filter(e=>e.type==="goal"&&e.team==="us").length;
  const regScoreThem=shown.filter(e=>e.type==="goal"&&e.team==="them").length;
  const myWonPens=penResult&&penResult.myScore>penResult.oppScore;
  const isLive=simPhase==="regulation";
  const usWin=regScoreUs>regScoreThem;
  const themWin=regScoreThem>regScoreUs;

  return(
    <div>
      {/* Printed scoreline header */}
      <div style={{background:"#f4efe1",border:"1.5px solid #191710",borderRadius:2,padding:"16px 14px",marginBottom:12,position:"relative",overflow:"hidden",boxShadow:"3px 3px 0 rgba(25,23,16,0.12)"}}>
        {/* Status */}
        <div style={{textAlign:"center",marginBottom:8,position:"relative"}}>
          <span style={{fontFamily:"var(--font-mono)",fontSize:"0.8rem",fontWeight:600,letterSpacing:"4px",color:isLive?"#cf2e2e":simPhase==="pens"?"#cf2e2e":"#2f6f43",textTransform:"uppercase"}}>
            {isLive&&<span style={{animation:"pulse 1s infinite",display:"inline-block",marginRight:6,fontSize:"0.7rem"}}>●</span>}
            {isLive?`${Math.floor(clock)}'  LIVE`:""}
            {simPhase==="pens"?"PENALTY SHOOTOUT":""}
            {simPhase==="done"?<span style={{display:"inline-block",border:"2px solid #191710",padding:"2px 12px",transform:"rotate(-2deg)",color:"#191710"}}>FULL TIME</span>:""}
          </span>
        </div>
        {/* Score */}
        <div style={{display:"flex",alignItems:"center",justifyContent:"center",gap:8,position:"relative",borderTop:"1px solid #d6ccb4",borderBottom:"1px solid #d6ccb4",padding:"8px 0"}}>
          <div style={{flex:1,textAlign:"center"}}>
            <div style={{fontFamily:"var(--font-sans)",fontSize:"0.64rem",fontWeight:700,letterSpacing:"2px",color:"#cf2e2e",marginBottom:4,textTransform:"uppercase"}}>Your Squad</div>
            <div style={{fontFamily:"var(--font-mono)",fontSize:"5rem",lineHeight:0.9,fontWeight:700,color:usWin?"#2f6f43":themWin?"#a99f88":"#191710",letterSpacing:"-2px"}}>{regScoreUs}</div>
          </div>
          <div style={{fontFamily:"var(--font-mono)",fontSize:"1.8rem",color:"#a99f88",fontWeight:400,paddingBottom:8}}>–</div>
          <div style={{flex:1,textAlign:"center"}}>
            <div style={{fontFamily:"var(--font-sans)",fontSize:"0.64rem",fontWeight:700,letterSpacing:"2px",color:"#6f6755",marginBottom:4,textTransform:"uppercase",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{opp.name}</div>
            <div style={{fontFamily:"var(--font-mono)",fontSize:"5rem",lineHeight:0.9,fontWeight:700,color:themWin?"#cf2e2e":usWin?"#c8bda2":"#191710",letterSpacing:"-2px"}}>{regScoreThem}</div>
          </div>
        </div>
        <div style={{textAlign:"center",marginTop:6}}>
          <span style={{fontFamily:"var(--font-mono)",fontSize:"0.64rem",color:"#6f6755",letterSpacing:"2px"}}>{opp.rating} OVR</span>
        </div>
      </div>

      {/* Event feed */}
      <div style={{marginBottom:12,display:"flex",flexDirection:"column",gap:3}}>
        {shown.map((e,i)=>{
          const isUs=e.team==="us";
          const isGoal=e.type==="goal";
          return(
            <div key={i} style={{display:"flex",gap:10,alignItems:"center",padding:"8px 12px",background:isGoal?(isUs?"rgba(47,111,67,0.06)":"rgba(207,46,46,0.06)"):"rgba(25,23,16,0.02)",border:`1px solid ${isGoal?(isUs?"rgba(47,111,67,0.18)":"rgba(207,46,46,0.18)"):"rgba(25,23,16,0.05)"}`,borderRadius:4,animation:"slideIn .3s ease",borderLeft:`3px solid ${isGoal?(isUs?"#2f6f43":"#cf2e2e"):"rgba(25,23,16,0.08)"}`}}>
              <span style={{fontFamily:"var(--font-mono)",fontSize:"1rem",color:"#a99f88",minWidth:28,flexShrink:0,lineHeight:1}}>{e.min}'</span>
              <span style={{flexShrink:0,fontSize:"1rem"}}>{isGoal?"⚽":e.type==="yellow"?"🟨":"🟥"}</span>
              <div style={{flex:1,minWidth:0}}>
                <div style={{fontFamily:"var(--font-display)",fontSize:"0.85rem",fontWeight:600,color:isGoal?(isUs?"#2f6f43":"#cf2e2e"):isUs?"#cf2e2e":"#6f6755",letterSpacing:"0.5px",whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{e.name}</div>
                {isGoal&&e.assist&&<div style={{fontFamily:"var(--font-sans)",fontSize:"0.65rem",color:"#a99f88",marginTop:1}}>↳ {e.assist}</div>}
              </div>
              <div style={{fontFamily:"var(--font-mono)",fontSize:"0.72rem",color:isUs?"#cf2e2e":"#a99f88",letterSpacing:"1px",flexShrink:0}}>{isUs?"YOU":FLAG_ABBR[opp.name]||opp.name?.substring(0,3).toUpperCase()}</div>
            </div>
          );
        })}
        {!shown.length&&simPhase==="regulation"&&(
          <div style={{textAlign:"center",padding:"20px 0",fontFamily:"var(--font-sans)",fontSize:"0.82rem",color:"#6f6755",letterSpacing:"3px"}}>MATCH IN PROGRESS…</div>
        )}
      </div>

      {/* Penalties */}
      {simPhase==="pens"&&penResult&&(
        <div style={{background:"linear-gradient(135deg,#eae2cf,#e1d8c1)",border:"1px solid rgba(207,46,46,0.3)",borderRadius:6,padding:"16px",textAlign:"center",marginBottom:12}}>
          <div style={{fontFamily:"var(--font-mono)",fontSize:"0.75rem",letterSpacing:"4px",color:"#cf2e2e",marginBottom:10}}>PENALTY SHOOTOUT</div>
          <div style={{display:"flex",alignItems:"center",justifyContent:"center",gap:16}}>
            <div style={{fontFamily:"var(--font-mono)",fontSize:"4rem",lineHeight:1,color:myWonPens?"#2f6f43":"#191710"}}>{penResult.myScore}</div>
            <div style={{fontFamily:"var(--font-sans)",fontSize:"0.75rem",color:"#a99f88",letterSpacing:"2px"}}>PEN</div>
            <div style={{fontFamily:"var(--font-mono)",fontSize:"4rem",lineHeight:1,color:!myWonPens?"#cf2e2e":"#191710"}}>{penResult.oppScore}</div>
          </div>
          <div style={{fontFamily:"var(--font-display)",fontSize:"1rem",fontWeight:600,color:myWonPens?"#2f6f43":"#cf2e2e",marginTop:8,letterSpacing:"1px"}}>
            {myWonPens?"YOUR SQUAD WIN":opp.name.toUpperCase()+" WIN"}
          </div>
        </div>
      )}

      {simPhase==="done"&&<button className="sb" style={{width:"100%"}} onClick={()=>onComplete(null,regScoreUs,regScoreThem)}>FULL TIME → CONTINUE</button>}
      {simPhase==="pens"&&penResult&&<button className="sb" style={{width:"100%",marginTop:8}} onClick={()=>onComplete(penResult,regScoreUs,regScoreThem)}>RESULT → CONTINUE</button>}
    </div>
  );
};

// ── Knockout Stage System ─────────────────────────────────────────────────────
const KO_LABELS=["R32","R16","QF","SF","FINAL"];

// A Bracket is a full 32-slot tree. Each slot = {name, abbr, isUser, rating, score:null|number, winner:bool}
// The tree is stored as an array of 32 R32 matchups: [{teamA, teamB}]
// After each round, winners advance. YOUR TEAM's slot is tracked so you always know who you face next.

// Build 32-team bracket from group results.
// Returns: { r32Pairs: [{a,b}×16], yourSlot: index 0-31 }
const buildBracket=(allFinalStandings,userGroupIdx,userTeamName,chaos)=>{
  // 2026 WC: 12 groups of 4. Top 2 from each = 24, best 8 third-placed = 8 → 32 total
  const winners=[];const runners=[];const thirds=[];
  const GRP_LABELS=["A","B","C","D","E","F","G","H","I","J","K","L"];
  allFinalStandings.forEach((gs,gi)=>{
    const gid=GRP_LABELS[gi];
    if(gs[0])winners.push({name:gs[0].name,abbr:FLAG_ABBR[gs[0].name]||gs[0].name.substring(0,3).toUpperCase(),isUser:gs[0].isUser,rating:gs[0].rating||78,group:gid,pos:1});
    if(gs[1])runners.push({name:gs[1].name,abbr:FLAG_ABBR[gs[1].name]||gs[1].name.substring(0,3).toUpperCase(),isUser:gs[1].isUser,rating:gs[1].rating||75,group:gid,pos:2});
    if(gs[2])thirds.push({...gs[2],abbr:FLAG_ABBR[gs[2].name]||gs[2].name.substring(0,3).toUpperCase(),group:gid,pos:3});
  });
  // Pick 8 best thirds
  thirds.sort((a,b)=>b.pts-a.pts||(b.gf-b.ga)-(a.gf-a.ga)||b.gf-a.gf);
  const top8thirds=thirds.slice(0,8).map(t=>({...t,rating:t.rating||72}));

  // Build exactly 16 R32 matchups = 32 teams:
  // 12 winners + 12 runners-up + 8 best thirds = 32
  // Pairing structure (2026 simplified):
  //   Match  1: W1  vs T1   Match  2: W2  vs T2
  //   Match  3: W3  vs T3   Match  4: W4  vs T4
  //   Match  5: W5  vs T5   Match  6: W6  vs T6
  //   Match  7: W7  vs T7   Match  8: W8  vs T8
  //   Match  9: R1  vs R12  Match 10: R2  vs R11
  //   Match 11: R3  vs R10  Match 12: R4  vs R9
  //   Match 13: W9  vs R8   Match 14: W10 vs R7
  //   Match 15: W11 vs R6   Match 16: W12 vs R5
  // Total: 8+4+4 = 16 matches = 32 teams ✓
  const pairs=[];
  // Matches 1-8: winners[0-7] vs top8thirds[0-7]
  for(let i=0;i<8;i++)pairs.push({a:winners[i],b:top8thirds[i]});
  // Matches 9-12: runners[0-3] vs runners[11-8]
  for(let i=0;i<4;i++)pairs.push({a:runners[i],b:runners[11-i]});
  // Matches 13-16: winners[8-11] vs runners[7-4]
  for(let i=0;i<4;i++)pairs.push({a:winners[8+i],b:runners[7-i]});

  // Find YOUR slot
  let yourPairIdx=-1;let yourSide="a";
  pairs.forEach((p,i)=>{
    if(p.a&&p.a.isUser){yourPairIdx=i;yourSide="a";}
    if(p.b&&p.b.isUser){yourPairIdx=i;yourSide="b";}
  });

  // Simulate all NON-user R32 matchups immediately
  const r32Results=pairs.map((p,i)=>{
    if(i===yourPairIdx)return null; // user plays this one
    const rA=p.a?p.a.rating:75;const rB=p.b?p.b.rating:72;
    const aWins=simMatch(rA,rA,rB,rB,chaos);
    const aWon=aWins.myGoals>aWins.oppGoals;
    const draw=aWins.myGoals===aWins.oppGoals;
    const penWin=draw?Math.random()>0.47:null;
    const finallyAWon=draw?penWin:aWon;
    return{winner:finallyAWon?p.a:p.b,scoreA:aWins.myGoals,scoreB:aWins.oppGoals,pens:draw};
  });

  return{pairs,r32Results,yourPairIdx,yourSide};
};

// Full bracket display component — shows all 16 R32 matches in a grid
// ── Full Tournament Bracket — All 32 teams, all rounds ───────────────────────
// Stored as: bracketRounds = [R32matches, R16matches, QFmatches, SFmatches, Final]
// Each match: {a:{name,abbr,isUser}, b:{name,abbr,isUser}, winner, scoreA, scoreB, pens, done, isUserMatch}
// Bot matches are simulated round by round after the user plays theirs.
// This ensures all teams are visible advancing — no "backend manipulation" feel.

const simKOMatch=(rA,rB,chaos)=>{
  const eA=rA||75;const eB=rB||75;
  const r=simMatch(eA,eA,eB,eB,chaos);
  const draw=r.myGoals===r.oppGoals;
  const penWin=draw?Math.random()>0.47:null;
  const aWon=draw?penWin:r.myGoals>r.oppGoals;
  return{scoreA:r.myGoals,scoreB:r.oppGoals,draw,aWon,pens:draw};
};

// After user plays their match in a round, simulate all other matches of that round
// Returns updated roundMatches with all results filled in
const simulateBotMatches=(roundMatches,userMatchIdx,userResult,chaos)=>{
  return roundMatches.map((m,i)=>{
    if(i===userMatchIdx){
      // User's match — apply their result. Remap "us"/"them" events to "a"/"b"
      // (a==m.a) so all match events share one convention for stats.
      const won=userResult.won;
      const uev=(userResult.events||[]).map(e=>({...e,team:((e.team==="us")===m.isUserA)?"a":"b"}));
      return{
        ...m,
        scoreA:m.isUserA?userResult.myG:userResult.oppG,
        scoreB:m.isUserA?userResult.oppG:userResult.myG,
        pens:userResult.pens,
        winner:won?(m.isUserA?m.a:m.b):(m.isUserA?m.b:m.a),
        done:true,events:uev,aName:m.a?.name,bName:m.b?.name,
      };
    }
    if(m.done)return m;
    // Bot match — real scoreline + attributed scorers
    const f=simFixtureWithEvents(m.a||{name:m.a?.name||"?",rating:75},m.b||{name:m.b?.name||"?",rating:75},chaos);
    const draw=f.ag===f.bg;const penWin=draw?Math.random()>0.47:null;const aWon=draw?penWin:f.ag>f.bg;
    return{
      ...m,
      scoreA:f.ag,scoreB:f.bg,pens:draw,
      winner:aWon?m.a:m.b,
      done:true,events:f.events,aName:m.a?.name,bName:m.b?.name,
    };
  });
};

// Build next round from winners of current round, pairing 1vs2, 3vs4, etc.
const buildNextRound=(completedRound)=>{
  const winners=completedRound.map(m=>m.winner).filter(Boolean);
  const next=[];
  for(let i=0;i<winners.length;i+=2){
    const a=winners[i];const b=winners[i+1];
    const isUserMatch=a?.isUser||b?.isUser;
    next.push({
      a,b,
      isUserA:!!a?.isUser,
      isUserMatch,
      winner:null,scoreA:null,scoreB:null,pens:false,done:false,
      events:[],aName:a?.name,bName:b?.name,
    });
  }
  return next;
};

// Find user's match index in a round
const findUserMatchIdx=(roundMatches)=>
  roundMatches.findIndex(m=>m.isUserMatch||m.a?.isUser||m.b?.isUser);

// Build initial R32 from bracketData
const buildInitialR32=(bracketData)=>{
  if(!bracketData)return[];
  const{pairs,r32Results,yourPairIdx}=bracketData;
  return pairs.map((p,i)=>{
    const isUserMatch=i===yourPairIdx;
    return{
      a:p.a||{name:"TBD",abbr:"TBD",isUser:false},
      b:p.b||{name:"TBD",abbr:"TBD",isUser:false},
      isUserA:!!p.a?.isUser,
      isUserMatch,
      winner:null,scoreA:null,scoreB:null,pens:false,done:false,
      events:[],aName:p.a?.name,bName:p.b?.name,
    };
  });
};

// Finish the whole bracket regardless of where the user exited, so awards aggregate
// the full tournament and an eventual champion is always crowned. Reuses the same
// pure helpers the live flow uses; `simulateBotMatches(round,-1,...)` leaves already
// -played (done) matches untouched and bot-simulates the rest.
const completeTournament=(rounds,bracketData,allFinalStandings,userGroupIdx,chaos)=>{
  let r=(rounds||[]).map(x=>x?[...x]:x);
  if(!r[0]||r[0].length===0){
    const bd=bracketData||buildBracket(allFinalStandings,userGroupIdx,"YOUR TEAM",chaos);
    r[0]=buildInitialR32(bd);
  }
  for(let i=0;i<5;i++){
    if(!r[i]||r[i].length===0)r[i]=buildNextRound(r[i-1]);
    if(r[i].some(m=>!m.done))r[i]=simulateBotMatches(r[i],-1,null,chaos);
  }
  const finalM=r[4]&&r[4][0];
  return{rounds:r,champion:finalM?finalM.winner:null};
};

// ── Bracket Match Card ────────────────────────────────────────────────────────
const BMatch=({m,isCurrent})=>{
  if(!m)return<div style={{height:32,background:"rgba(25,23,16,0.02)",border:"1px solid rgba(25,23,16,0.05)",marginBottom:2,borderRadius:3}}/>;
  const{a,b,done,scoreA,scoreB,pens,winner,isUserMatch}=m;
  const aW=done&&winner?.name===a?.name;
  const bW=done&&winner?.name===b?.name;
  const border=isUserMatch?"rgba(207,46,46,0.55)":isCurrent&&!done?"rgba(25,23,16,0.15)":"rgba(25,23,16,0.06)";
  const bg=isUserMatch?"rgba(207,46,46,0.06)":"rgba(25,23,16,0.02)";
  return(
    <div style={{border:`1px solid ${border}`,background:bg,padding:"3px 5px",marginBottom:2,borderRadius:3,borderLeft:isUserMatch?"3px solid #cf2e2e":""}}>
      {isUserMatch&&!done&&<div style={{fontFamily:"var(--font-mono)",fontSize:"0.52rem",color:"#cf2e2e",letterSpacing:"1.5px",lineHeight:1.3}}>★ YOU</div>}
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",gap:2}}>
        <span style={{fontFamily:"var(--font-sans)",fontSize:"0.58rem",fontWeight:a?.isUser?700:400,color:a?.isUser?"#cf2e2e":aW?"#2f6f43":done&&!aW?"#a99f88":"#6f6755",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap",flex:1}}>{a?.isUser?"YOU":a?.abbr||"TBD"}</span>
        <span style={{fontFamily:"var(--font-mono)",fontSize:"0.65rem",color:done?"#6f6755":"#a99f88",flexShrink:0,minWidth:18,textAlign:"center",letterSpacing:"0.5px"}}>{done&&scoreA!=null?`${scoreA}-${scoreB}`:"v"}</span>
        <span style={{fontFamily:"var(--font-sans)",fontSize:"0.58rem",fontWeight:b?.isUser?700:400,color:b?.isUser?"#cf2e2e":bW?"#2f6f43":done&&!bW?"#a99f88":"#6f6755",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap",flex:1,textAlign:"right"}}>{b?.isUser?"YOU":b?.abbr||"TBD"}</span>
      </div>
      {done&&pens&&<div style={{fontFamily:"var(--font-mono)",fontSize:"0.46rem",color:"#cf2e2e",textAlign:"center",letterSpacing:"1px"}}>PENS</div>}
      {done&&(()=>{
        const{a:ag,b:bg}=fixtureScorers(m);
        if(!ag.length&&!bg.length)return null;
        return(
          <div style={{display:"flex",gap:4,marginTop:2}}>
            <ScorerLine goals={ag} align="right" size="0.5rem"/>
            <span style={{width:1,background:"rgba(25,23,16,0.05)"}}/>
            <ScorerLine goals={bg} align="left" size="0.5rem"/>
          </div>
        );
      })()}
    </div>
  );
};

// ── Full Tournament Bracket Display ──────────────────────────────────────────
const RoundLabels=["R32","R16","QF","SF","FINAL"];
const TournamentBracket=({allRounds,currentRound})=>{
  if(!allRounds||!allRounds[0])return null;
  const displayRounds=allRounds.filter(Boolean);
  return(
    <div style={{marginBottom:16}}>
      <div style={{fontFamily:"var(--font-sans)",fontSize:"0.6rem",letterSpacing:"4px",color:"#a99f88",marginBottom:10,textAlign:"center",textTransform:"uppercase"}}>Tournament Bracket</div>
      {displayRounds.map((round,ri)=>{
        const label=RoundLabels[ri]||"";
        const isCurrent=ri===currentRound;
        return(
          <div key={ri} style={{marginBottom:10}}>
            <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:5}}>
              <div style={{height:"1px",flex:1,background:`linear-gradient(90deg,transparent,${isCurrent?"rgba(207,46,46,0.3)":"rgba(25,23,16,0.06)"})`}}/>
              <div style={{fontFamily:"var(--font-mono)",fontSize:"0.62rem",letterSpacing:"3px",color:isCurrent?"#cf2e2e":"#6f6755",fontWeight:400,flexShrink:0}}>{label}{isCurrent&&<span style={{color:"#cf2e2e",marginLeft:6}}>▶ NOW</span>}</div>
              <div style={{height:"1px",flex:1,background:`linear-gradient(90deg,${isCurrent?"rgba(207,46,46,0.3)":"rgba(25,23,16,0.06)"},transparent)`}}/>
            </div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:4,alignItems:"start"}}>
              {round.map((m,mi)=>(
                <BMatch key={mi} m={m} isCurrent={isCurrent&&!m.done}/>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
};


// ── Pre-Tournament Odds bar row ───────────────────────────────────────────────
const OddsBar=({label,pct,color})=>(
  <div style={{marginBottom:14}}>
    <div style={{display:"flex",justifyContent:"space-between",alignItems:"baseline",marginBottom:5}}>
      <span style={{fontFamily:"var(--font-sans)",fontSize:"0.82rem",color:"#2a261c",letterSpacing:"0.5px"}}>{label}</span>
      <span style={{fontFamily:"var(--font-mono)",fontSize:"1.1rem",fontWeight:500,color:"#191710",letterSpacing:"0.5px"}}>{pct}%</span>
    </div>
    <div style={{height:6,borderRadius:3,background:"rgba(25,23,16,0.06)",overflow:"hidden"}}>
      <div style={{height:"100%",width:`${Math.max(pct,1.5)}%`,background:color,borderRadius:3,transition:"width .6s cubic-bezier(.17,.67,.3,1)"}}/>
    </div>
  </div>
);

// ── End-of-Tournament Summary ─────────────────────────────────────────────────
// finishedStage: 0=group exit, 1=lost R32, 2=lost R16, 3=lost QF, 4=lost SF,
//                5=lost final, 6=champion. (matches odds STAGE_LABELS indexing)
const FINISH_TITLE=["Group-Stage Exit","Out in the Round of 32","Out in the Round of 16","Quarter-Final Exit","Semi-Final Heartbreak","Runners-Up","World Champions"];
const CS_POS_SET=new Set(["GK","CB","LB","RB","LWB","RWB"]);
const natTag=(nat)=>nat?(FLAG_ABBR[nat]||nat.substring(0,3).toUpperCase()):"";

// ── Global tournament stats ───────────────────────────────────────────────────
// Reduce every resolved fixture's events into per-player goals/assists/clean-sheets
// across ALL 48 teams. Events use team "a"/"b" (bot + normalised user KO) or
// "us"/"them" (live user group fixture, where the user is always side a).
const keeperFor=(team,userKeeperName)=>team==="YOUR TEAM"?userKeeperName:(getBotSquad(team)?.keeper||null);
const accumulateStats=(allGroupFixtures,allRounds,userKeeperName)=>{
  const stats={};
  const bump=(team,player,field)=>{
    if(!team||!player)return;
    const k=`${team}|${player}`;
    (stats[k]||(stats[k]={team,player,goals:0,assists:0,cleanSheets:0}))[field]++;
  };
  const processMatch=(aName,bName,ag,bg,events)=>{
    if(aName==null||bName==null)return;
    (events||[]).forEach(e=>{
      if(e.type!=="goal")return;
      const team=(e.team==="a"||e.team==="us")?aName:bName;
      bump(team,e.name,"goals");
      if(e.assist)bump(team,e.assist,"assists");
    });
    if(ag!=null&&bg!=null){
      if(bg===0)bump(aName,keeperFor(aName,userKeeperName),"cleanSheets");
      if(ag===0)bump(bName,keeperFor(bName,userKeeperName),"cleanSheets");
    }
  };
  (allGroupFixtures||[]).forEach(g=>(g.fixtures||[]).forEach(f=>{
    if(f.ag==null||f.bg==null)return;
    processMatch(f.a,f.b,f.ag,f.bg,f.events);
  }));
  (allRounds||[]).forEach(round=>(round||[]).forEach(m=>{
    if(!m||!m.done)return;
    processMatch(m.aName||m.a?.name,m.bName||m.b?.name,m.scoreA,m.scoreB,m.events);
  }));
  return stats;
};
const topN=(stats,field,n=5)=>Object.values(stats).filter(s=>s[field]>0)
  .sort((a,b)=>b[field]-a[field]||b.goals-a.goals||b.assists-a.assists).slice(0,n);
const deriveAwards=stats=>{
  const v=Object.values(stats);
  const max=(arr,...keys)=>arr.slice().sort((a,b)=>{for(const k of keys){if(b[k]!==a[k])return b[k]-a[k];}return 0;})[0]||null;
  return{
    boot:max(v,"goals","assists"),
    playmaker:max(v,"assists","goals"),
    glove:max(v.filter(s=>s.cleanSheets>0),"cleanSheets","goals")||max(v,"cleanSheets"),
    potm:max(v.map(s=>({...s,ga:s.goals+s.assists})),"ga","goals"),
  };
};

// Derive every player & team stat for the run from the persisted match log.
const buildSummary=(matchLog,slots)=>{
  const players=slots.filter(s=>s.player).map(s=>({
    name:s.player.name,pos:s.player.pos,rating:s.player.rating,
    nat:s.player.nat,yr:s.player.yr,slotPos:s.pos,
    goals:0,assists:0,cs:0,
  }));
  const byName={};players.forEach(p=>{byName[p.name]=p;});
  let gf=0,ga=0,wins=0,draws=0,losses=0,cleanSheets=0,streak=0,longestStreak=0;
  let biggest=null,highest=null;
  matchLog.forEach(m=>{
    gf+=m.myGoals;ga+=m.oppGoals;
    const win=m.isKO?m.won:m.myGoals>m.oppGoals;
    const draw=!m.isKO&&m.myGoals===m.oppGoals;
    if(win){wins++;streak++;if(streak>longestStreak)longestStreak=streak;}
    else{streak=0;draw?draws++:losses++;}
    if(m.oppGoals===0){cleanSheets++;players.forEach(p=>{if(p.pos.some(x=>CS_POS_SET.has(x)))p.cs++;});}
    (m.events||[]).forEach(e=>{
      if(e.type==="goal"&&e.team==="us"){
        if(byName[e.name])byName[e.name].goals++;
        if(e.assist&&byName[e.assist])byName[e.assist].assists++;
      }
    });
    const margin=m.myGoals-m.oppGoals;
    if(win&&(!biggest||margin>biggest.margin))biggest={margin,my:m.myGoals,opp:m.oppGoals,oppName:m.oppName};
    const total=m.myGoals+m.oppGoals;
    if(!highest||total>highest.total)highest={total,my:m.myGoals,opp:m.oppGoals,oppName:m.oppName};
  });
  const topScorer=[...players].sort((a,b)=>b.goals-a.goals||b.assists-a.assists)[0];
  const topAssist=[...players].sort((a,b)=>b.assists-a.assists||b.goals-a.goals)[0];
  const gk=([...players].filter(p=>p.pos.includes("GK")).sort((a,b)=>b.cs-a.cs)[0])||
           [...players].sort((a,b)=>b.cs-a.cs)[0];
  const potm=[...players].sort((a,b)=>(b.goals+b.assists)-(a.goals+a.assists)||b.goals-a.goals||b.rating-a.rating)[0];
  const table=[...players].sort((a,b)=>(b.goals+b.assists)-(a.goals+a.assists)||b.goals-a.goals||b.cs-a.cs||b.rating-a.rating);
  return{players:table,gf,ga,wins,draws,losses,cleanSheets,longestStreak,biggest,highest,topScorer,topAssist,gk,potm,matches:matchLog.length};
};

const AwardCard=({icon,label,color,name,sub})=>(
  <div style={{border:`1px solid ${color}33`,background:`${color}0d`,borderRadius:5,padding:"11px 12px"}}>
    <div style={{display:"flex",alignItems:"center",gap:6,marginBottom:5}}>
      <span style={{fontSize:"0.85rem"}}>{icon}</span>
      <span style={{fontFamily:"var(--font-sans)",fontSize:"0.56rem",letterSpacing:"2px",color,textTransform:"uppercase"}}>{label}</span>
    </div>
    <div style={{fontFamily:"var(--font-display)",fontSize:"1rem",fontWeight:600,color:"#191710",lineHeight:1.1,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{name||"—"}</div>
    <div style={{fontFamily:"var(--font-sans)",fontSize:"0.7rem",color:"#6f6755",marginTop:2}}>{sub}</div>
  </div>
);

const StatTile=({value,label,color="#191710",small})=>(
  <div style={{border:"1px solid rgba(25,23,16,0.06)",background:"rgba(25,23,16,0.02)",borderRadius:5,padding:"12px 8px",textAlign:"center"}}>
    <div style={{fontFamily:small?"var(--font-display)":"var(--font-mono)",fontSize:small?"0.95rem":"1.9rem",fontWeight:small?600:500,color,lineHeight:1,letterSpacing:small?"0":"0.5px"}}>{value}</div>
    <div style={{fontFamily:"var(--font-sans)",fontSize:"0.6rem",letterSpacing:"1.5px",color:"#6f6755",textTransform:"uppercase",marginTop:5}}>{label}</div>
  </div>
);

// ── Top-5 leaderboard (Goals / Assists / Clean Sheets tabs) — global, all teams ─
const LB_TABS=[{key:"goals",label:"Goals",color:"#2f6f43"},{key:"assists",label:"Assists",color:"#6f6755"},{key:"cleanSheets",label:"Clean Sheets",color:"#cf2e2e"}];
const Leaderboard=({stats,title="Golden Boot Race"})=>{
  const[tab,setTab]=useState("goals");
  const meta=LB_TABS.find(t=>t.key===tab);
  const rows=topN(stats,tab,5);
  return(
    <div style={{marginBottom:16}}>
      <div className="tag" style={{marginBottom:8}}>{title}</div>
      <div style={{display:"flex",gap:6,marginBottom:8}}>
        {LB_TABS.map(t=>(
          <button key={t.key} onClick={()=>setTab(t.key)} style={{flex:1,padding:"6px 4px",borderRadius:4,cursor:"pointer",
            fontFamily:"var(--font-sans)",fontSize:"0.66rem",letterSpacing:"1px",textTransform:"uppercase",
            border:`1px solid ${tab===t.key?t.color+"66":"rgba(25,23,16,0.07)"}`,
            background:tab===t.key?t.color+"14":"rgba(25,23,16,0.02)",color:tab===t.key?t.color:"#6f6755"}}>{t.label}</button>
        ))}
      </div>
      <div className="panel" style={{padding:"4px 10px"}}>
        {rows.length?rows.map((r,i)=>(
          <div key={r.team+r.player} style={{display:"flex",alignItems:"center",gap:8,padding:"7px 0",borderTop:i?"1px solid rgba(25,23,16,0.04)":"none"}}>
            <span style={{fontFamily:"var(--font-mono)",fontSize:"0.95rem",color:i===0?meta.color:"#a99f88",minWidth:16,textAlign:"center"}}>{i+1}</span>
            <FlagBadge name={r.team}/>
            <span style={{flex:1,fontFamily:"var(--font-display)",fontSize:"0.84rem",fontWeight:600,color:r.team==="YOUR TEAM"?"#cf2e2e":"#191710",whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{r.player}</span>
            <span style={{fontFamily:"var(--font-mono)",fontSize:"1.25rem",color:meta.color,letterSpacing:"0.5px"}}>{r[tab]}</span>
          </div>
        )):(
          <div style={{textAlign:"center",padding:"14px 0",fontFamily:"var(--font-sans)",fontSize:"0.78rem",color:"#a99f88"}}>No data yet.</div>
        )}
      </div>
    </div>
  );
};

// ── Shareable result card (native canvas, cross-platform) ─────────────────────
const SHARE_URL="beaworldchampion.com";
const POS_GROUP={GK:"#a9802b",
  CB:"#191710",LB:"#191710",RB:"#191710",LWB:"#191710",RWB:"#191710",
  CDM:"#2f6f43",CM:"#2f6f43",CAM:"#2f6f43",LM:"#2f6f43",RM:"#2f6f43",
  LW:"#cf2e2e",RW:"#cf2e2e",ST:"#cf2e2e",CF:"#cf2e2e"};
const posColor=p=>POS_GROUP[p]||"#191710";

const cardRoundRect=(ctx,x,y,w,h,r)=>{
  ctx.beginPath();
  ctx.moveTo(x+r,y);
  ctx.arcTo(x+w,y,x+w,y+h,r);
  ctx.arcTo(x+w,y+h,x,y+h,r);
  ctx.arcTo(x,y+h,x,y,r);
  ctx.arcTo(x,y,x+w,y,r);
  ctx.closePath();
};
const cardEllipsize=(ctx,text,maxW)=>{
  if(ctx.measureText(text).width<=maxW)return text;
  let t=text;
  while(t.length>1&&ctx.measureText(t+"…").width>maxW)t=t.slice(0,-1);
  return t+"…";
};

async function drawShareCard({finishedStage,myRating,difficulty,slots,sm,awards,champion}){
  try{
    await Promise.all([
      document.fonts.load('900 84px "Spline Sans Mono"'),
      document.fonts.load('700 30px "Archivo"'),
      document.fonts.load('600 italic 26px "Fraunces"'),
    ]);
    await document.fonts.ready;
  }catch{}
  const W=720,H=1020,S=2;
  const canvas=document.createElement("canvas");
  canvas.width=W*S;canvas.height=H*S;
  const ctx=canvas.getContext("2d");
  ctx.scale(S,S);
  ctx.textBaseline="alphabetic";
  const SANS='"Archivo","Helvetica Neue",Arial,sans-serif';
  const MONO='"Spline Sans Mono",ui-monospace,monospace';
  const DISP='"Fraunces",Georgia,serif';
  const INK="#191710",SOFT="#6f6755",FAINT="#a99f88",PAPER="#f4efe1",ACCENT="#cf2e2e",PITCH="#2f6f43",GOLD="#a9802b",RULE="#d6ccb4";
  const champ=finishedStage===6;

  // background + frame
  ctx.fillStyle=PAPER;ctx.fillRect(0,0,W,H);
  ctx.strokeStyle=INK;ctx.lineWidth=2;ctx.strokeRect(14,14,W-28,H-28);

  const PAD=44;
  const center=W/2;
  const rule=(y,x1=PAD,x2=W-PAD,col=RULE)=>{ctx.strokeStyle=col;ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(x1,y);ctx.lineTo(x2,y);ctx.stroke();};

  // ── Masthead ──
  let y=58;
  ctx.fillStyle=INK;ctx.font=`800 19px ${SANS}`;ctx.textAlign="left";
  ctx.save();
  let mx=PAD;const mast="BE A WORLD CHAMPION";
  for(const ch of mast){ctx.fillText(ch,mx,y);mx+=ctx.measureText(ch).width+1.5;}
  ctx.restore();
  // right pills
  ctx.textAlign="left";ctx.font=`700 13px ${SANS}`;
  const pill=(label,x,col)=>{
    const w=ctx.measureText(label).width+22;
    cardRoundRect(ctx,x-w,y-16,w,23,11);ctx.strokeStyle=col;ctx.lineWidth=1.4;ctx.stroke();
    ctx.fillStyle=col;ctx.fillText(label,x-w+11,y);
    return w;
  };
  let px=W-PAD;
  px-=pill(`OVR ${myRating}`,px,GOLD)+8;
  pill(difficulty.toUpperCase(),px,SOFT);
  rule(y+22);

  // ── Result block ──
  y=210;
  ctx.textAlign="center";
  ctx.fillStyle=INK;ctx.font=`900 92px ${MONO}`;
  ctx.fillText(`${sm.wins}-${sm.draws}-${sm.losses}`,center,y);
  y+=34;
  ctx.fillStyle=SOFT;ctx.font=`700 15px ${SANS}`;
  ctx.save();
  let lx=center-ctx.measureText("WON   DRAWN   LOST").width/2-6;
  // letter-spaced label, centered
  const lbl="WON · DRAWN · LOST";
  let total=0;for(const ch of lbl)total+=ctx.measureText(ch).width+2;
  lx=center-total/2;
  for(const ch of lbl){ctx.fillText(ch,lx,y);lx+=ctx.measureText(ch).width+2;}
  ctx.restore();
  y+=34;
  ctx.fillStyle=INK;ctx.font=`600 19px ${DISP}`;
  ctx.fillText(`${sm.wins*3+sm.draws} pts · ${sm.gf}:${sm.ga} goals`,center,y);

  // ── Finish badge ──
  y+=52;
  const badge=champ?"WORLD CHAMPIONS":(FINISH_TITLE[finishedStage]||"Tournament Over").toUpperCase();
  const bcol=champ?GOLD:(finishedStage>=3?PITCH:INK);
  ctx.font=`800 20px ${SANS}`;
  const bw=ctx.measureText(badge).width+44;
  cardRoundRect(ctx,center-bw/2,y-26,bw,38,19);
  ctx.strokeStyle=bcol;ctx.lineWidth=2;ctx.stroke();
  ctx.fillStyle=bcol;ctx.textAlign="center";ctx.fillText(badge,center,y);
  y+=44;rule(y);

  // ── Starting XI (two columns) ──
  y+=42;
  const xi=slots.filter(s=>s.player).map(s=>({pos:s.pos,name:s.player.name,rating:s.player.rating}));
  const colW=(W-PAD*2-30)/2;
  const rowH=42;
  const drawRow=(p,cx,ry)=>{
    // position chip
    ctx.font=`700 11px ${SANS}`;
    const chW=Math.max(34,ctx.measureText(p.pos).width+14);
    cardRoundRect(ctx,cx,ry-15,chW,21,4);ctx.fillStyle=posColor(p.pos);ctx.fill();
    ctx.fillStyle="#f4efe1";ctx.textAlign="center";ctx.fillText(p.pos,cx+chW/2,ry);
    // rating (right)
    ctx.font=`700 17px ${MONO}`;ctx.fillStyle=INK;ctx.textAlign="right";
    ctx.fillText(String(p.rating),cx+colW,ry);
    const ratW=ctx.measureText(String(p.rating)).width;
    // name
    ctx.font=`600 17px ${SANS}`;ctx.fillStyle=INK;ctx.textAlign="left";
    const nameX=cx+chW+10;
    const nameMax=colW-(chW+10)-ratW-12;
    ctx.fillText(cardEllipsize(ctx,p.name,nameMax),nameX,ry);
  };
  const leftX=PAD,rightX=PAD+colW+30;
  const startY=y;
  xi.forEach((p,i)=>{
    const col=i<6?leftX:rightX;
    const rowIdx=i<6?i:i-6;
    drawRow(p,col,startY+rowIdx*rowH);
  });
  y=startY+6*rowH+6;
  rule(y);

  // ── Award cards ──
  y+=24;
  const awCardW=(W-PAD*2-20)/2;
  const awH=86;
  const awCard=(x,label,col,name,sub)=>{
    cardRoundRect(ctx,x,y,awCardW,awH,6);
    ctx.fillStyle=col+"14";ctx.fill();
    ctx.strokeStyle=col+"55";ctx.lineWidth=1;ctx.stroke();
    ctx.textAlign="left";
    ctx.fillStyle=col;ctx.font=`800 11px ${SANS}`;
    let tx=x+16,ty=y+26;const sp=1.2;
    for(const ch of label){ctx.fillText(ch,tx,ty);tx+=ctx.measureText(ch).width+sp;}
    ctx.fillStyle=INK;ctx.font=`700 19px ${DISP}`;
    ctx.fillText(cardEllipsize(ctx,name||"—",awCardW-32),x+16,y+52);
    ctx.fillStyle=SOFT;ctx.font=`500 13px ${SANS}`;
    ctx.fillText(sub,x+16,y+72);
  };
  // Global tournament awards (match the in-game Tournament Awards exactly)
  const boot=awards?.boot;
  const potm=awards?.potm;
  const bootTag=boot?natTag(boot.team):"";
  const potmTag=potm?natTag(potm.team):"";
  awCard(PAD,"GOLDEN BOOT",ACCENT,boot?.player,`${boot?.goals||0} goal${(boot?.goals||0)===1?"":"s"}${bootTag?` · ${bootTag}`:""}`);
  awCard(PAD+awCardW+20,"PLAYER OF THE TOURNAMENT",GOLD,potm?.player,`${potm?.goals||0}G · ${potm?.assists||0}A${potmTag?` · ${potmTag}`:""}`);
  y+=awH+30;

  // ── Footer ──
  rule(y);y+=30;
  if(champion&&!champion.isUser){
    ctx.textAlign="center";ctx.fillStyle=GOLD;ctx.font=`700 14px ${SANS}`;
    ctx.fillText(`Won by ${champion.name}`,center,y);
    y+=26;
  }
  ctx.textAlign="center";
  ctx.fillStyle=SOFT;ctx.font=`500 15px ${SANS}`;
  ctx.fillText("Think you can beat this?",center,y);
  y+=30;
  ctx.fillStyle=ACCENT;ctx.font=`600 italic 22px ${DISP}`;
  ctx.fillText(SHARE_URL,center,y);

  return canvas;
}

const TournamentSummary=({matchLog,slots,finishedStage,projStageIdx,myRating,difficulty,allRounds,champion,allGroupFixtures,onReset})=>{
  const s=buildSummary(matchLog,slots);
  const userKeeper=slots.find(x=>x.player&&x.player.pos.includes("GK"))?.player?.name;
  const globalStats=accumulateStats(allGroupFixtures,allRounds,userKeeper);
  const awards=deriveAwards(globalStats);
  const champ=finishedStage===6;
  const proj=projStageIdx??finishedStage;
  const verdict=finishedStage>proj?{label:"OVERPERFORMED",color:"#2f6f43"}
    :finishedStage<proj?{label:"UNDERPERFORMED",color:"#cf2e2e"}
    :{label:"AS PROJECTED",color:"#6f6755"};
  const finishLabel=FINISH_TITLE[finishedStage]||"Tournament Over";
  // Headline + prose
  const recap=(()=>{
    const wdl=`${s.wins}W · ${s.draws}D · ${s.losses}L`;
    if(champ)return{head:"KINGS OF THE WORLD",body:`Champions. ${wdl}, ${s.gf} scored and only ${s.ga} conceded across ${s.matches} matches. They will tell this story forever.`};
    if(finishedStage===5)return{head:"AGONY IN THE FINAL",body:`One game from glory. ${wdl}, ${s.gf} goals for, ${s.ga} against. So near, and yet the trophy slipped away in the last act.`};
    if(finishedStage===4)return{head:"INTO THE LAST FOUR",body:`A semi-final run to be proud of. ${wdl} with ${s.gf} scored. The dream ended a step short of the showpiece.`};
    if(finishedStage===3)return{head:"QUARTER-FINAL EXIT",body:`The last eight is where the road ended. ${wdl}, ${s.gf} for and ${s.ga} against. A respectable run with regrets.`};
    if(finishedStage===2)return{head:"OUT IN THE LAST 16",body:`Through the group, undone in the knockouts. ${wdl} across ${s.matches} matches. The fine margins did not fall your way.`};
    if(finishedStage===1)return{head:"FIRST-HURDLE FALL",body:`Qualified, then fell at the first knockout test. ${wdl}. A bitter end to a brief campaign.`};
    return{head:"GROUP-STAGE DOLDRUMS",body:`The tournament ended before the knockouts began. ${wdl}, ${s.gf} scored, ${s.ga} conceded. Home early, lessons learned.`};
  })();
  const quip=s.topScorer?.goals
    ?`${s.topScorer.name.split(" ").pop()} carried the goals; ${s.gk?.name.split(" ").pop()||"the keeper"} held the line.`
    :"A campaign that never quite caught fire up front.";

  const[sharing,setSharing]=useState(false);
  const[shareModal,setShareModal]=useState(null); // {url, blob}
  const canShareFiles=typeof navigator!=="undefined"&&!!navigator.canShare&&(()=>{
    try{return navigator.canShare({files:[new File([new Blob()],"x.png",{type:"image/png"})]});}catch{return false;}
  })();
  const FILE_NAME="be-a-world-champion.png";

  // Render the card, then open an in-app preview before any download/share.
  const openSharePreview=async()=>{
    setSharing(true);
    try{
      const canvas=await drawShareCard({finishedStage,myRating,difficulty,slots,sm:s,awards,champion});
      await new Promise(res=>canvas.toBlob(blob=>{
        if(blob)setShareModal({url:URL.createObjectURL(blob),blob});
        res();
      },"image/png"));
    }catch(e){console.error("card render failed",e);}
    setSharing(false);
  };
  const closeShare=()=>{if(shareModal)URL.revokeObjectURL(shareModal.url);setShareModal(null);};
  const downloadCard=()=>{
    if(!shareModal)return;
    const a=document.createElement("a");
    a.href=shareModal.url;a.download=FILE_NAME;
    document.body.appendChild(a);a.click();a.remove();
  };
  const shareCardFile=async()=>{
    if(!shareModal)return;
    const file=new File([shareModal.blob],FILE_NAME,{type:"image/png"});
    try{await navigator.share({files:[file],title:"My tournament result"});}
    catch(e){if(e?.name!=="AbortError")console.error("share failed",e);}
  };

  return(
    <div style={{textAlign:"left"}}>
      {/* Header */}
      <div style={{textAlign:"center",marginBottom:18}}>
        <div className={champ?"tb":""} style={{fontSize:champ?"4.5rem":"3.2rem",marginBottom:8}}>{champ?"🏆":finishedStage>=3?"🥈":"💔"}</div>
        <div className="h1" style={{color:champ?"#cf2e2e":finishedStage>=3?"#2f6f43":"#cf2e2e",marginBottom:4,animation:champ?"none":"none"}}>{champ?"WORLD CHAMPIONS!":finishLabel}</div>
      </div>

      {/* Eventual winners — shown only when YOU didn't lift the trophy */}
      {champion&&!champion.isUser&&(
        <div style={{display:"flex",alignItems:"center",justifyContent:"center",gap:12,border:"1.5px solid #a9802b",background:"rgba(169,128,43,0.08)",borderRadius:6,padding:"12px 16px",marginBottom:16}}>
          <span style={{fontSize:"1.5rem"}}>🏆</span>
          <div style={{textAlign:"left"}}>
            <div style={{fontFamily:"var(--font-sans)",fontSize:"0.58rem",letterSpacing:"2px",color:"#a9802b",textTransform:"uppercase",fontWeight:800,marginBottom:2}}>Tournament Winners</div>
            <div style={{fontFamily:"var(--font-display)",fontSize:"1.35rem",fontWeight:700,color:"#191710",lineHeight:1}}>{champion.name} <span style={{fontFamily:"var(--font-mono)",fontSize:"0.8rem",color:"#6f6755"}}>{natTag(champion.name)}</span></div>
          </div>
        </div>
      )}

      {/* Finished · Projected · Verdict */}
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1.3fr",gap:8,marginBottom:16}}>
        <div style={{border:"1px solid rgba(25,23,16,0.07)",background:"rgba(25,23,16,0.02)",borderRadius:5,padding:"11px 8px"}}>
          <div style={{fontFamily:"var(--font-sans)",fontSize:"0.56rem",letterSpacing:"2px",color:"#6f6755",textTransform:"uppercase",marginBottom:3}}>Finished</div>
          <div style={{fontFamily:"var(--font-mono)",fontSize:"1.5rem",fontWeight:500,color:"#191710",lineHeight:1}}>{STAGE_LABELS[finishedStage]}</div>
        </div>
        <div style={{border:"1px solid rgba(25,23,16,0.07)",background:"rgba(25,23,16,0.02)",borderRadius:5,padding:"11px 8px"}}>
          <div style={{fontFamily:"var(--font-sans)",fontSize:"0.56rem",letterSpacing:"2px",color:"#6f6755",textTransform:"uppercase",marginBottom:3}}>Projected</div>
          <div style={{fontFamily:"var(--font-mono)",fontSize:"1.5rem",fontWeight:500,color:"#6f6755",lineHeight:1}}>{STAGE_LABELS[proj]}</div>
        </div>
        <div style={{border:`1px solid ${verdict.color}55`,background:`${verdict.color}12`,borderRadius:5,padding:"11px 8px",display:"flex",alignItems:"center",justifyContent:"center"}}>
          <div style={{fontFamily:"var(--font-display)",fontSize:"0.95rem",fontWeight:700,color:verdict.color,letterSpacing:"0.5px",textAlign:"center",lineHeight:1.1}}>{verdict.label}</div>
        </div>
      </div>

      {/* Narrative */}
      <div className="panel" style={{marginBottom:16}}>
        <div style={{fontFamily:"var(--font-display)",fontSize:"1.05rem",fontWeight:700,color:"#191710",letterSpacing:"0.5px",marginBottom:8}}>{recap.head}</div>
        <div style={{fontFamily:"var(--font-sans)",fontSize:"0.92rem",color:"#6f6755",lineHeight:1.55}}>{recap.body}</div>
        <div style={{height:1,background:"rgba(25,23,16,0.06)",margin:"12px 0"}}/>
        <div style={{fontFamily:"var(--font-sans)",fontSize:"0.82rem",color:"#a99f88",fontStyle:"italic"}}>{quip}</div>
      </div>

      {/* Awards — global across all 48 teams */}
      <div className="tag" style={{marginBottom:10}}>Tournament Awards</div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:16}}>
        <AwardCard icon="⚽" label="Golden Boot" color="#cf2e2e" name={awards.boot?.player} sub={`${awards.boot?.goals||0} goals · ${natTag(awards.boot?.team)}`}/>
        <AwardCard icon="🎯" label="Playmaker" color="#6f6755" name={awards.playmaker?.player} sub={`${awards.playmaker?.assists||0} assists · ${natTag(awards.playmaker?.team)}`}/>
        <AwardCard icon="🧤" label="Golden Glove" color="#2f6f43" name={awards.glove?.player} sub={`${awards.glove?.cleanSheets||0} clean sheets · ${natTag(awards.glove?.team)}`}/>
        <AwardCard icon="🏆" label="Player of the Tournament" color="#cf2e2e" name={awards.potm?.player} sub={`${awards.potm?.goals||0}G · ${awards.potm?.assists||0}A · ${natTag(awards.potm?.team)}`}/>
      </div>

      {/* Global Top-5 leaderboard */}
      <Leaderboard stats={globalStats} title="Tournament Leaders"/>

      {/* Your XI table */}
      <div className="tag" style={{marginBottom:8}}>Your XI</div>
      <div className="panel" style={{marginBottom:16,padding:"6px 10px"}}>
        <table style={{width:"100%",borderCollapse:"collapse",fontFamily:"var(--font-sans)"}}>
          <thead><tr style={{color:"#a99f88",fontSize:"0.58rem",letterSpacing:"1.5px",textTransform:"uppercase"}}>
            <th style={{textAlign:"left",padding:"6px 4px",fontWeight:600}}>Player</th>
            <th style={{textAlign:"center",padding:"6px 4px",fontWeight:600}}>G</th>
            <th style={{textAlign:"center",padding:"6px 4px",fontWeight:600}}>A</th>
            <th style={{textAlign:"center",padding:"6px 4px",fontWeight:600}}>CS</th>
          </tr></thead>
          <tbody>{s.players.map((p,i)=>{
            const isDef=p.pos.some(x=>CS_POS_SET.has(x));
            return(
              <tr key={i} style={{borderTop:"1px solid rgba(25,23,16,0.04)"}}>
                <td style={{padding:"6px 4px"}}>
                  <div style={{display:"flex",alignItems:"center",gap:6}}>
                    <span style={{fontFamily:"var(--font-mono)",fontSize:"0.6rem",color:"#6f6755",minWidth:26,padding:"1px 0",textAlign:"center",background:"rgba(25,23,16,0.04)",borderRadius:2,letterSpacing:"0.5px"}}>{p.slotPos}</span>
                    <span style={{fontFamily:"var(--font-display)",fontSize:"0.82rem",fontWeight:600,color:"#191710",whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis",maxWidth:118}}>{p.name}</span>
                    {p.yr&&<span style={{fontFamily:"var(--font-sans)",fontSize:"0.58rem",color:"#a99f88",letterSpacing:"0.5px",flexShrink:0}}>{natTag(p.nat)} {p.yr}</span>}
                  </div>
                </td>
                <td style={{textAlign:"center",padding:"6px 4px",fontFamily:"var(--font-mono)",fontSize:"0.95rem",color:p.goals?"#2f6f43":"#c8bda2"}}>{p.goals||"·"}</td>
                <td style={{textAlign:"center",padding:"6px 4px",fontFamily:"var(--font-mono)",fontSize:"0.95rem",color:p.assists?"#6f6755":"#c8bda2"}}>{p.assists||"·"}</td>
                <td style={{textAlign:"center",padding:"6px 4px",fontFamily:"var(--font-mono)",fontSize:"0.95rem",color:isDef&&p.cs?"#cf2e2e":"#c8bda2"}}>{isDef?p.cs:"·"}</td>
              </tr>
            );
          })}</tbody>
        </table>
      </div>

      {/* Team stat tiles */}
      <div className="tag" style={{marginBottom:10}}>By the Numbers</div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:8,marginBottom:8}}>
        <StatTile value={s.wins} label="Wins" color="#2f6f43"/>
        <StatTile value={s.draws} label="Draws" color="#cf2e2e"/>
        <StatTile value={s.losses} label="Losses" color="#cf2e2e"/>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:8,marginBottom:8}}>
        <StatTile value={s.gf} label="Goals For" color="#2f6f43"/>
        <StatTile value={s.ga} label="Goals Against" color="#cf2e2e"/>
        <StatTile value={s.cleanSheets} label="Clean Sheets"/>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:16}}>
        <StatTile small value={s.biggest?`${s.biggest.my}-${s.biggest.opp} vs ${s.biggest.oppName}`:"—"} label="Biggest Win" color="#2f6f43"/>
        <StatTile small value={s.highest?`${s.highest.my}-${s.highest.opp} vs ${s.highest.oppName}`:"—"} label="Highest-Scoring"/>
      </div>

      {/* Your knockout road — user's KO matches with scorers */}
      {matchLog.some(m=>m.isKO)&&(
        <div style={{marginBottom:16}}>
          <div className="tag" style={{marginBottom:8}}>Your Knockout Road</div>
          {matchLog.filter(m=>m.isKO).map((m,i)=>{
            const us=(m.events||[]).filter(e=>e.type==="goal"&&e.team==="us");
            const them=(m.events||[]).filter(e=>e.type==="goal"&&e.team==="them");
            return(
              <div key={i} style={{padding:"7px 10px",background:"rgba(25,23,16,0.02)",border:`1px solid ${m.won?"rgba(47,111,67,0.18)":"rgba(207,46,46,0.18)"}`,borderLeft:`3px solid ${m.won?"#2f6f43":"#cf2e2e"}`,borderRadius:3,marginBottom:4}}>
                <div style={{display:"flex",alignItems:"center",gap:8}}>
                  <span style={{fontFamily:"var(--font-mono)",fontSize:"0.66rem",color:"#6f6755",letterSpacing:"1px",minWidth:34}}>{m.stage}</span>
                  <span style={{flex:1,fontFamily:"var(--font-sans)",fontSize:"0.78rem",color:"#cf2e2e",fontWeight:600,textAlign:"right"}}>YOU</span>
                  <span style={{fontFamily:"var(--font-mono)",fontSize:"1.1rem",color:m.won?"#2f6f43":"#cf2e2e",letterSpacing:"1px"}}>{m.myGoals}–{m.oppGoals}</span>
                  <span style={{flex:1,fontFamily:"var(--font-sans)",fontSize:"0.78rem",color:"#6f6755"}}>{m.oppName}{m.pens?" (p)":""}</span>
                </div>
                {(us.length||them.length)?(
                  <div style={{display:"flex",gap:8,marginTop:3}}>
                    <ScorerLine goals={us} align="right"/>
                    <span style={{width:1,background:"rgba(25,23,16,0.05)"}}/>
                    <ScorerLine goals={them} align="left"/>
                  </div>
                ):null}
              </div>
            );
          })}
        </div>
      )}

      {/* Bracket (knockout runs only) */}
      {allRounds&&allRounds[0]&&<TournamentBracket allRounds={allRounds} currentRound={Math.min(finishedStage,4)}/>}

      <div style={{display:"flex",alignItems:"center",gap:8,justifyContent:"space-between",marginTop:4}}>
        <span style={{fontFamily:"var(--font-sans)",fontSize:"0.78rem",color:"#6f6755"}}>Squad OVR <span style={{fontFamily:"var(--font-mono)",fontSize:"1.3rem",color:"#cf2e2e",letterSpacing:"1px"}}>{myRating}</span> · {difficulty}</span>
        <div style={{display:"flex",gap:8}}>
          <button className="sb" onClick={openSharePreview} disabled={sharing}>{sharing?"…":"SHARE RESULT ↗"}</button>
          <button className="sb" onClick={onReset}>PLAY AGAIN ↺</button>
        </div>
      </div>

      {/* Share preview modal */}
      {shareModal&&(
        <div onClick={closeShare} style={{position:"fixed",inset:0,zIndex:200,background:"rgba(25,23,16,0.72)",display:"flex",alignItems:"center",justifyContent:"center",padding:16}}>
          <div onClick={e=>e.stopPropagation()} style={{background:"var(--paper)",border:"2px solid #191710",boxShadow:"6px 6px 0 #191710",borderRadius:8,padding:"16px 16px 14px",maxWidth:380,width:"100%",display:"flex",flexDirection:"column",alignItems:"center",gap:12}}>
            <div style={{fontFamily:"var(--font-sans)",fontSize:"0.62rem",letterSpacing:"3px",color:"#6f6755",textTransform:"uppercase",alignSelf:"flex-start"}}>Your Result Card</div>
            <img src={shareModal.url} alt="Result card" style={{width:"100%",maxHeight:"64vh",objectFit:"contain",border:"1px solid #d6ccb4",borderRadius:4}}/>
            <div style={{display:"flex",gap:8,width:"100%"}}>
              <button className="sb" style={{flex:1}} onClick={downloadCard}>DOWNLOAD ↓</button>
              {canShareFiles&&<button className="sb" style={{flex:1}} onClick={shareCardFile}>SHARE ↗</button>}
            </div>
            <button onClick={closeShare} style={{fontFamily:"var(--font-sans)",fontSize:"0.7rem",letterSpacing:"1px",color:"#6f6755",background:"none",border:"none",cursor:"pointer",textTransform:"uppercase"}}>Close</button>
          </div>
        </div>
      )}
    </div>
  );
};

// ── Main Component ────────────────────────────────────────────────────────────
export default function WorldCupDraft(){
  const[phase,setPhase]=useState("difficulty");
  const[difficulty,setDifficulty]=useState(null);
  const[formation,setFormation]=useState(null);
  const[draftMode,setDraftMode]=useState(null);
  const[slots,setSlots]=useState([]);
  const[activeIdx,setActiveIdx]=useState(null);
  const[sfPick,setSfPick]=useState(null);
  const[spinning,setSpinning]=useState(false);
  const[spinResult,setSpinResult]=useState(null);
  const[showModal,setShowModal]=useState(false);
  const[squad,setSquad]=useState([]);
  const[respins,setRespins]=useState(0);
  const[usedCombos,setUsedCombos]=useState({});// {key:count}
  const[boostTriggered,setBoostTriggered]=useState(false);// silent quality boost for WC/Legendary
  

  const[oddsData,setOddsData]=useState(null);
  const[matchLog,setMatchLog]=useState([]); // persisted per-match data for the end summary
  const[finishedStage,setFinishedStage]=useState(null); // 0-6, set when the run ends

  const[userGroup,setUserGroup]=useState(null);
  const[userGroupIdx,setUserGroupIdx]=useState(null);
  const[allGroups,setAllGroups]=useState(null);
  const[oppFixtures,setOppFixtures]=useState([]); // pre-seeded non-user match results
  const[allGroupFixtures,setAllGroupFixtures]=useState(null); // all 12 groups' fixtures + events
  const[matchIdx,setMatchIdx]=useState(0);
  const[groupResults,setGroupResults]=useState([]);
  const[liveStandings,setLiveStandings]=useState(null);
  const[simState,setSimState]=useState(null);
  const[finalStandings,setFinalStandings]=useState(null);
  const[allFinalStandings,setAllFinalStandings]=useState(null);
  const[qualStatus,setQualStatus]=useState(null);

  const[koDraws,setKoDraws]=useState([]);
  const[bracketData,setBracketData]=useState(null);
  const[allRounds,setAllRounds]=useState([]); // [R32matches, R16matches, QFmatches, SFmatches, Final]
  const[koResults,setKoResults]=useState([]);
  const[koRound,setKoRound]=useState(0);
  const[koSim,setKoSim]=useState(null);
  const[eliminated,setEliminated]=useState(false);
  const[finalRounds,setFinalRounds]=useState([]); // full bracket (all 5 rounds) after any exit
  const[champion,setChampion]=useState(null);      // eventual tournament winner

  const wheelRef=useRef(null);
  const spinAngle=useRef(0);

  const myRating=avgRating(squad);
  const myAtk=atkRating(squad);
  const myDef=defRating(squad);
  const chaos=DIFFICULTIES[difficulty]?.chaos??15;
  const oppMod=DIFFICULTIES[difficulty]?.oppMod??0;
  const filled=slots.filter(s=>s.player).length;

  // ── Draft Helpers ──────────────────────────────────────────────────────────
  // compatibleWithSlot: since player pos arrays are pre-expanded by expandPos(),
  // a simple .includes() check is all that's needed everywhere.
  const compatibleWithSlot=(playerPosArr, slotPos)=>playerPosArr.includes(slotPos);

  const getEligible=(forPos)=>{
    const drafted=new Set(slots.filter(s=>s.player).map(s=>`${s.player.name}|${s.player.rating}`));
    const emptySlotPositions=slots.filter(s=>!s.player).map(s=>s.pos);
    return NATION_YEARS.filter(ny=>{
      const key=`${ny.nation}-${ny.year}`;
      if((usedCombos[key]||0)>=2)return false;
      const entry=NATION_POOL[ny.nation]?.find(e=>e.year===ny.year);
      if(!entry)return false;
      if(forPos){
        // Position-First: must have an undrafted player compatible with the specific slot
        return entry.players.some(p=>compatibleWithSlot(p.pos,forPos)&&!drafted.has(`${p.name}|${p.rating}`));
      }
      // Spin-First: must have an undrafted player compatible with at least one remaining empty slot
      if(emptySlotPositions.length>0){
        return entry.players.some(p=>!drafted.has(`${p.name}|${p.rating}`)&&emptySlotPositions.some(pos=>compatibleWithSlot(p.pos,pos)));
      }
      // Fallback: no empty slots tracked yet, just check any undrafted player exists
      return entry.players.some(p=>!drafted.has(`${p.name}|${p.rating}`));
    });
  };

  const doSpin=useCallback((forPos)=>{
    if(spinning)return;
    const eligible=getEligible(forPos);
    if(!eligible.length){setActiveIdx(null);alert("No eligible nations for this position — try another slot.");return;}
    setSpinning(true);setSpinResult(null);

    // ── Silent quality boost for World Class / Legendary ──────────────────
    // Activates when: hard difficulty + 3+ picks made + squad OVR drops below 83
    // Stays on in the 83-84 band once triggered (hysteresis)
    // Deactivates silently when squad OVR reaches 85+
    // Effect: nation-years with an 85+ player for any unfilled slot
    //         get 4 extra entries in the pool (5x more likely to be picked)
    const filledCount=slots.filter(s=>s.player).length;
    const currentOvr=avgRating(slots);
    const isHardDiff=difficulty==="World Class"||difficulty==="Legendary";
    const shouldTrigger=isHardDiff&&filledCount>=3&&currentOvr<83;
    const shouldExit=currentOvr>=85;
    const newBoostState=shouldExit?false:(shouldTrigger?true:boostTriggered);
    if(newBoostState!==boostTriggered)setBoostTriggered(newBoostState);
    let pool=eligible;
    if(newBoostState){
      const emptySlotPositions=slots.filter(s=>!s.player).map(s=>s.pos);
      const checkPos=forPos?[forPos]:emptySlotPositions;
      const boosted=eligible.filter(ny=>{
        const entry=NATION_POOL[ny.nation]?.find(e=>e.year===ny.year);
        if(!entry)return false;
        return entry.players.some(p=>p.rating>=85&&checkPos.some(pos=>compatibleWithSlot(p.pos,pos)));
      });
      // Only apply weighting if boosted options exist
      if(boosted.length>0){
        pool=[...eligible,...boosted,...boosted,...boosted,...boosted];
      }
    }
    const pick=pickRandom(pool);
    const dur=1600+Math.random()*700;
    spinAngle.current+=(4+Math.floor(Math.random()*3))*360;
    if(wheelRef.current){wheelRef.current.style.transition=`transform ${dur}ms cubic-bezier(.17,.67,.12,.99)`;wheelRef.current.style.transform=`rotate(${spinAngle.current}deg)`;}
    setTimeout(()=>{
      const entry=NATION_POOL[pick.nation]?.find(e=>e.year===pick.year);
      if(entry){
        setSpinResult({nation:pick.nation,year:pick.year,players:entry.players});
        setUsedCombos(p=>{const k=`${pick.nation}-${pick.year}`;return{...p,[k]:(p[k]||0)+1};});
      }
      setSpinning(false);setShowModal(true);
    },dur);
  },[spinning,slots,usedCombos,boostTriggered,difficulty]);

  const doRespin=()=>{
    if(respins<=0&&difficulty)return;
    setShowModal(false);setSpinResult(null);
    if(difficulty)setRespins(r=>r-1);
    const pos=draftMode==="position-first"?slots[activeIdx]?.pos:null;
    setTimeout(()=>doSpin(pos),150);
  };

  const assignPlayer=(slotIdx,player)=>{
    const ns=slots.map(s=>s.idx===slotIdx?{...s,player}:s);
    setSlots(ns);setSquad(ns);setShowModal(false);setSpinResult(null);setSfPick(null);setActiveIdx(null);
  };

  const initFormation=f=>{
    const s=FORMATION_LAYOUT[f].map((item,i)=>({pos:item.pos,idx:i,player:null}));
    setFormation(f);setSlots(s);setSquad(s);setUsedCombos({});setBoostTriggered(false);
    NATION_YEARS=buildShuffledPool(); // fresh shuffle every draft
    setPhase("draftmode");
  };

  // ── Pre-Tournament Odds ──────────────────────────────────────────────────────
  const showOdds=()=>{
    setOddsData(computeOdds(myAtk,myDef,chaos,oppMod));
    setPhase("odds");
  };

  // ── Tournament ─────────────────────────────────────────────────────────────
  const setupTournament=()=>{
    const gi=Math.floor(Math.random()*WC2026_GROUPS.length);
    const base=WC2026_GROUPS[gi];
    const weakest=base.teams.reduce((a,b)=>a.rating<b.rating?a:b);
    const myTeam={name:"YOUR TEAM",flag:"⭐",rating:myRating,isUser:true};
    const newTeams=base.teams.map(t=>t.name===weakest.name?myTeam:t);
    const myGrp={...base,teams:newTeams};
    const all=WC2026_GROUPS.map((g,i)=>i===gi?myGrp:g);
    // Seed EVERY group (all 12) with attributed events ONCE — never re-randomised.
    const agf=seedAllGroups(all,gi,chaos);
    // Derive the user group's non-user fixtures for the existing live-standings path.
    const seededFixtures=agf[gi].fixtures.filter(f=>!f.isUserFixture)
      .map(f=>({a:f.a,b:f.b,ag:f.ag,bg:f.bg,matchday:f.matchday}));
    setAllGroupFixtures(agf);
    setUserGroupIdx(gi);setUserGroup(myGrp);setAllGroups(all);
    setOppFixtures(seededFixtures);
    setMatchIdx(0);setGroupResults([]);setLiveStandings(null);
    setPhase("allgroups");
  };

  const getOpps=()=>userGroup?userGroup.teams.filter(t=>!t.isUser):[];

  const playGroupMatch=()=>{
    const opp=getOpps()[matchIdx];
    const oppR=opp.rating+oppMod;
    const r=simMatch(myAtk,myDef,oppR,oppR,chaos);
    const built=buildEvents(r.myGoals,r.oppGoals,squad,opp.name);
    setSimState({myG:built.myG,opG:built.opG,events:built.events,opp});
  };

  const resolveGroupMatch=()=>{
    const newRes=[...groupResults,{myGoals:simState.myG,oppGoals:simState.opG,opp:simState.opp}];
    const matchday=newRes.length; // 1, 2, or 3
    setMatchLog(prev=>[...prev,{stage:`GROUP · MD${matchday}`,oppName:simState.opp.name,myGoals:simState.myG,oppGoals:simState.opG,events:simState.events,isKO:false}]);
    // Merge the live result (event-count ground truth) into the user fixture for this matchday.
    const mergedAGF=(allGroupFixtures||[]).map((g,gi)=>{
      if(gi!==userGroupIdx)return g;
      return{...g,fixtures:g.fixtures.map(f=>(f.isUserFixture&&f.matchday===matchday)
        ?{...f,ag:simState.myG,bg:simState.opG,events:simState.events}:f)};
    });
    setAllGroupFixtures(mergedAGF);
    setGroupResults(newRes);setSimState(null);
    const myTeam={name:"YOUR TEAM",flag:"⭐",rating:myRating,isUser:true};
    const standing=computeStandings(newRes,myTeam,userGroup.teams,oppFixtures,matchday);
    setLiveStandings(standing);
    if(matchIdx<2){setMatchIdx(i=>i+1);setPhase("groupmatch");}
    else{
      // All 3 matchdays done — final standings for every group come from allGroupFixtures.
      const allS=allGroups.map((g,gi)=>{
        const teams=gi===userGroupIdx?userGroup.teams:g.teams;
        return computeStandingsFromFixtures(teams,mergedAGF[gi].fixtures,3,"YOUR TEAM").map(t=>({...t,groupId:g.id}));
      });
      const standingU=allS[userGroupIdx];
      setFinalStandings(standingU);setAllFinalStandings(allS);
      const pos=standingU.findIndex(t=>t.isUser);
      let qs;
      if(pos===0)qs="1st";
      else if(pos===1)qs="2nd";
      else if(pos===2){
        const thirds=allS.map(gs=>gs[2]).filter(Boolean);
        thirds.sort((a,b)=>b.pts-a.pts||(b.gf-b.ga)-(a.gf-a.ga)||b.gf-a.gf);
        qs=thirds.slice(0,8).some(t=>t.isUser)?"3rd-ok":"eliminated";
      }else qs="eliminated";
      setQualStatus(qs);
      if(qs==="eliminated"){
        const fin=completeTournament([],null,allS,userGroupIdx,chaos);
        setFinalRounds(fin.rounds);setChampion(fin.champion);
        setFinishedStage(0);setEliminated(true);setPhase("done");
      }
      else setPhase("groupdone");
    }
  };

  

  const startKO=()=>{
    const bracket=buildBracket(allFinalStandings,userGroupIdx,"YOUR TEAM",chaos);
    setBracketData(bracket);
    const r32=buildInitialR32(bracket);
    const userMatch=r32.find(m=>m.isUserMatch);
    const r32Opp=userMatch?.isUserA?userMatch.b:userMatch?.a;
    setAllRounds([r32]);
    setKoDraws([{opp:{name:r32Opp?.name||"Opponent",rating:r32Opp?.rating||75,abbr:r32Opp?.abbr||"OPP"}}]);
    setKoResults([]);setKoRound(0);setEliminated(false);
    setPhase("kodraw");
  };

  const playKOMatch=()=>{
    const opp=koDraws[koRound].opp;
    const oppR=opp.rating+oppMod;
    const r=simMatch(myAtk,myDef,oppR,oppR,chaos);
    const built=buildEvents(r.myGoals,r.oppGoals,squad,opp.name);
    setKoSim({myG:built.myG,opG:built.opG,events:built.events,opp,penResult:null});
    setPhase("komatch");
  };

  const resolveKOMatch=(penResult,actualMyG,actualOpG)=>{
    const opp=koDraws[koRound].opp;
    // Use the scores actually shown on screen (event counts) — these are the ground truth
    // This prevents any mismatch between the display and what gets recorded in the bracket
    const finalMyG=actualMyG!==undefined?actualMyG:koSim.myG;
    const finalOpG=actualOpG!==undefined?actualOpG:koSim.opG;
    const draw=finalMyG===finalOpG;
    // If penalties: use the result from MatchSim's simPenalties (passed in)
    const penWin=draw&&penResult?penResult.myScore>penResult.oppScore:(draw?Math.random()>0.47:null);
    const won=draw?penWin:finalMyG>finalOpG;
    const userResult={myG:finalMyG,oppG:finalOpG,myGoals:finalMyG,oppGoals:finalOpG,opp,pens:draw,penWin,won,events:koSim.events};
    const koRes={...userResult,opG:finalOpG};
    const nr=[...koResults,koRes];
    setKoResults(nr);setKoSim(null);
    setMatchLog(prev=>[...prev,{stage:KO_LABELS[koRound],oppName:opp.name,myGoals:finalMyG,oppGoals:finalOpG,events:koSim.events,isKO:true,won,pens:draw}]);

    // Complete this round for ALL teams, then build the next — computed PURELY from the
    // current-render allRounds (no side effects inside a setState updater). Nesting
    // setKoRound/setKoDraws/etc. inside setAllRounds' updater made it impure, so React's
    // StrictMode double-invoke desynced koRound from allRounds → empty round → crash.
    const curRound=allRounds[koRound]||[];
    const userIdx=findUserMatchIdx(curRound);
    const completed=simulateBotMatches(curRound,userIdx,userResult,chaos);
    const next=[...allRounds];
    next[koRound]=completed;

    if(!won){
      const fin=completeTournament(next,bracketData,allFinalStandings,userGroupIdx,chaos);
      setAllRounds(next);setFinalRounds(fin.rounds);setChampion(fin.champion);
      setFinishedStage(koRound+1);setEliminated(true);setPhase("done");
      return;
    }
    if(koRound>=4){
      const fin=completeTournament(next,bracketData,allFinalStandings,userGroupIdx,chaos);
      setAllRounds(next);setFinalRounds(fin.rounds);setChampion(fin.champion);
      setFinishedStage(6);setPhase("done");
      return;
    }

    const nextRound=buildNextRound(completed);
    next[koRound+1]=nextRound;
    const nextUserMatch=nextRound.find(m=>m.isUserMatch);
    const nextOpp=nextUserMatch?.isUserA?nextUserMatch.b:nextUserMatch?.a;
    setAllRounds(next);
    setKoDraws(d=>[...d,{opp:{name:nextOpp?.name||"Opponent",rating:nextOpp?.rating||80,abbr:nextOpp?.abbr||"OPP"}}]);
    setKoRound(r=>r+1);
    setPhase("kostart");
  };

  const reset=()=>{
    setPhase("difficulty");setDifficulty(null);setFormation(null);setDraftMode(null);
    setSlots([]);setSquad([]);setActiveIdx(null);setSfPick(null);setSpinResult(null);setShowModal(false);setRespins(0);setUsedCombos({});setBoostTriggered(false);
    setOddsData(null);setMatchLog([]);setFinishedStage(null);setUserGroup(null);setUserGroupIdx(null);setAllGroups(null);setOppFixtures([]);setAllGroupFixtures(null);setMatchIdx(0);setGroupResults([]);setLiveStandings(null);setSimState(null);setFinalStandings(null);setAllFinalStandings(null);setQualStatus(null);
    setKoDraws([]);setBracketData(null);setAllRounds([]);setKoResults([]);setKoRound(0);setKoSim(null);setEliminated(false);setFinalRounds([]);setChampion(null);
    if(wheelRef.current){wheelRef.current.style.transform="rotate(0deg)";wheelRef.current.style.transition="none";}
    spinAngle.current=0;
  };

  // ── Render ─────────────────────────────────────────────────────────────────
  return(
    <div style={{minHeight:"100vh",background:"transparent",fontFamily:"var(--font-sans)",color:"#2a261c",overflowX:"hidden"}}>

      {/* HEADER — editorial masthead */}
      <div style={{textAlign:"center",padding:"20px 16px 14px",borderBottom:"3px double #191710",position:"relative",overflow:"hidden",maxWidth:560,margin:"0 auto"}}>
        {/* dateline rule */}
        <div style={{display:"flex",alignItems:"center",justifyContent:"center",gap:10,fontFamily:"var(--font-mono)",fontSize:"0.56rem",letterSpacing:"3px",color:"#6f6755",textTransform:"uppercase",marginBottom:8}}>
          <span style={{flex:1,height:1,background:"#b9ab8a"}}/>
          <span>The Matchday · No. 26</span>
          <span style={{flex:1,height:1,background:"#b9ab8a"}}/>
        </div>
        <h1 style={{fontFamily:"var(--font-display)",fontSize:"clamp(2rem,8.5vw,3.4rem)",fontWeight:900,letterSpacing:"-1px",lineHeight:0.92,color:"#191710"}}>
          Be A<br/><span style={{color:"#cf2e2e",fontStyle:"italic"}}>World Champion</span>
        </h1>
        <div style={{fontFamily:"var(--font-sans)",fontSize:"0.58rem",fontWeight:600,letterSpacing:"4px",color:"#6f6755",marginTop:8,textTransform:"uppercase"}}>2026 Format · All-Era Legends</div>
      </div>

      {/* DIFFICULTY */}
      {phase==="difficulty"&&(
        <div className="sec">
          <div className="tag">Step 1 of 4</div>
          <div className="h1" style={{marginBottom:16}}>Choose Difficulty</div>
          <div style={{display:"flex",flexDirection:"column",gap:10}}>
            {Object.entries(DIFFICULTIES).map(([k,d])=>{
              const spinLabel=d.respins===0?"No respins":d.respins===1?"1 respin":`${d.respins} respins`;
              return(
                <button key={k} className="cb" onClick={()=>{setDifficulty(k);setRespins(d.respins);setPhase("formation");}}>
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"baseline",marginBottom:5,gap:10}}>
                    <div style={{fontFamily:"var(--font-display)",fontSize:"1.5rem",fontWeight:900,letterSpacing:"-0.3px",color:"#cf2e2e",lineHeight:1}}>{k}</div>
                    <div style={{fontFamily:"var(--font-mono)",fontSize:"0.66rem",fontWeight:600,letterSpacing:"1.5px",color:"#6f6755",whiteSpace:"nowrap",flexShrink:0}}>{spinLabel.toUpperCase()}</div>
                  </div>
                  <div style={{fontFamily:"var(--font-sans)",fontSize:"0.78rem",color:"#6f6755",lineHeight:1.4}}>{d.desc}</div>
                </button>
              );
            })}
          </div>

          {/* Legal footer — credit, copyright & fan-made disclaimer */}
          <footer style={{maxWidth:560,margin:"34px auto 0",paddingTop:18,borderTop:"3px double #b9ab8a",textAlign:"center"}}>
            <div style={{fontFamily:"var(--font-sans)",fontSize:"0.72rem",color:"#6f6755",marginBottom:10}}>
              Inspired by and with thanks to <a href="https://38-0.app" target="_blank" rel="noopener noreferrer" style={{color:"#cf2e2e",textDecoration:"underline",textUnderlineOffset:2}}>38-0.app</a>
            </div>
            <div style={{fontFamily:"var(--font-mono)",fontSize:"0.62rem",letterSpacing:"1px",color:"#a99f88",marginBottom:14}}>
              © 2026 Be A World Champion · All rights reserved
            </div>
            <p style={{fontFamily:"var(--font-sans)",fontSize:"0.66rem",lineHeight:1.65,color:"#a99f88",margin:0}}>
              Be A World Champion is an independent, fan-made game. It is not affiliated with, endorsed by, sponsored by, licensed by, or otherwise associated with any football club, national team, competition, league, governing body, organisation, game publisher, or ratings provider. All team names, player names, ratings and statistics are used for informational, descriptive and editorial purposes only. No official logos, crests, player images, likenesses or other official branding are used. All trademarks, trade names and other intellectual property rights remain the property of their respective owners.
            </p>
          </footer>
        </div>
      )}

      {/* FORMATION */}
      {phase==="formation"&&(
        <div className="sec">
          <div className="tag">Step 2 of 4 · {difficulty}</div>
          <div className="h1" style={{marginBottom:16}}>Formation</div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
            {FORMATIONS.map(f=>(
              <button key={f} className="cb" style={{textAlign:"center",padding:"18px 6px"}} onClick={()=>initFormation(f)}>
                <div style={{fontFamily:"var(--font-mono)",fontSize:"2rem",fontWeight:400,letterSpacing:"3px",color:"#191710",lineHeight:1}}>{f}</div>
              </button>
            ))}
          </div>
          <button className="gb" style={{marginTop:14,width:"100%"}} onClick={()=>setPhase("difficulty")}>← Back</button>
        </div>
      )}

      {/* DRAFT MODE */}
      {phase==="draftmode"&&(
        <div className="sec">
          <div className="tag">Step 3 of 4 · {formation}</div>
          <div className="h1" style={{marginBottom:16}}>Draft Style</div>
          <div style={{display:"flex",flexDirection:"column",gap:10}}>
            {[{mode:"position-first",icon:"🎯",label:"POSITION-FIRST",desc:"Tap a slot on the pitch first, then spin. Only compatible players shown — guaranteed to fill."},
              {mode:"spin-first",icon:"🎰",label:"SPIN-FIRST",desc:"Spin freely, browse the full squad from that nation & year, pick any player then place them."}
            ].map(({mode,icon,label,desc})=>(
              <button key={mode} className="cb" onClick={()=>{setDraftMode(mode);setPhase("draft");}}>
                <div style={{display:"flex",gap:10,alignItems:"center",marginBottom:6}}>
                  <span style={{fontSize:"1.5rem"}}>{icon}</span>
                  <div style={{fontFamily:"var(--font-mono)",fontSize:"1.2rem",fontWeight:500,color:"#cf2e2e",letterSpacing:"2px"}}>{label}</div>
                </div>
                <div style={{fontFamily:"var(--font-sans)",fontSize:"0.76rem",color:"#a99f88",lineHeight:1.5}}>{desc}</div>
              </button>
            ))}
          </div>
          <button className="gb" style={{marginTop:14,width:"100%"}} onClick={()=>setPhase("formation")}>← Back</button>
        </div>
      )}

      {/* DRAFT — stacked: pitch full width, wheel below */}
      {phase==="draft"&&(
        <div style={{maxWidth:480,margin:"0 auto",padding:"16px 14px"}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14,flexWrap:"wrap",gap:8}}>
            <div style={{display:"flex",alignItems:"center",gap:8,flexWrap:"wrap"}}>
              <span style={{fontFamily:"var(--font-mono)",fontSize:"1.4rem",color:"#cf2e2e",letterSpacing:"2px",lineHeight:1}}>{formation}</span>
              <span className="chip chip-slate" style={{fontSize:"0.62rem"}}>{draftMode==="position-first"?"POS-FIRST":"SPIN-FIRST"}</span>
              <span style={{fontFamily:"var(--font-sans)",fontSize:"0.88rem",color:"#6f6755",fontWeight:600}}>{filled}/11</span>
            </div>
            <div style={{display:"flex",alignItems:"center",gap:8}}>
              {respins>0&&<span className="chip chip-amber" style={{fontSize:"0.7rem"}}>↺ {respins} left</span>}
              {filled===11&&<button className="sb" style={{fontSize:"0.95rem",padding:"9px 20px"}} onClick={()=>setPhase("lineup")}>DONE →</button>}
            </div>
          </div>
          {(draftMode==="spin-first"||activeIdx!==null)&&filled<11&&(
            <div style={{display:"flex",flexDirection:"column",alignItems:"center",gap:14,padding:"6px 0 18px"}}>
              {draftMode==="spin-first"&&(
                <div style={{fontFamily:"var(--font-sans)",fontSize:"0.72rem",color:"#6f6755",letterSpacing:"2px",textAlign:"center",textTransform:"uppercase"}}>Spin · Pick a player · Place on pitch</div>
              )}
              <div style={{position:"relative",width:220,height:220}}>
                <div style={{position:"absolute",inset:-5,borderRadius:"50%",border:"1px solid rgba(207,46,46,0.12)",pointerEvents:"none"}}/>
                <div style={{position:"absolute",top:-14,left:"50%",transform:"translateX(-50%)",width:0,height:0,borderLeft:"11px solid transparent",borderRight:"11px solid transparent",borderTop:"22px solid #cf2e2e",zIndex:10,filter:"drop-shadow(1px 2px 0 #191710)"}}/>
                <div ref={wheelRef} style={{position:"relative",width:220,height:220,borderRadius:"50%",border:"3px solid #191710",overflow:"hidden",
                  background:`conic-gradient(${Array.from({length:12}).map((_,i)=>{const c=["#191710","#cf2e2e","#2f6f43"][i%3];const s=(i/12*100).toFixed(2);const e=((i+1)/12*100).toFixed(2);return`${c} ${s}% ${e}%`;}).join(",")})`,
                  boxShadow:spinning?"4px 4px 0 rgba(25,23,16,0.18)":"3px 3px 0 rgba(25,23,16,0.12)",transition:"box-shadow 0.3s"}}>
                  <svg style={{position:"absolute",inset:0,width:220,height:220,pointerEvents:"none"}} viewBox="0 0 220 220">
                    {Array.from({length:12}).map((_,i)=>{const a=(i/12)*Math.PI*2-Math.PI/2;return(<line key={i} x1="110" y1="110" x2={110+110*Math.cos(a)} y2={110+110*Math.sin(a)} stroke="#f4efe1" strokeWidth="2.5"/>);})}
                  </svg>
                  <div style={{position:"absolute",top:"50%",left:"50%",transform:"translate(-50%,-50%)",width:52,height:52,borderRadius:"50%",background:"#f4efe1",border:"3px solid #191710",display:"flex",alignItems:"center",justifyContent:"center",fontSize:"1.3rem",boxShadow:"inset 0 0 0 4px #d6ccb4"}}>⚽</div>
                </div>
              </div>
              <button className="sb" style={{minWidth:180,fontSize:"1.05rem"}} onClick={()=>doSpin(draftMode==="position-first"?slots[activeIdx]?.pos:null)} disabled={spinning}>
                {spinning?"SPINNING…":"SPIN THE WHEEL"}
              </button>
              {spinning&&<div className="pulse" style={{fontFamily:"var(--font-mono)",color:"#cf2e2e",fontSize:"0.75rem",letterSpacing:"4px"}}>DRAWING…</div>}
            </div>
          )}
          <div style={{marginBottom:16}}>
            {draftMode==="position-first"&&(
              <div style={{fontFamily:"var(--font-sans)",fontSize:"0.66rem",letterSpacing:"3px",color:"#6f6755",marginBottom:8,textTransform:"uppercase",textAlign:"center"}}>
                {activeIdx!==null?<span>Filling: <strong style={{color:"#cf2e2e",fontSize:"0.8rem"}}>{slots[activeIdx]?.pos}</strong> — spin above</span>:"Tap a position to select it, then spin"}
              </div>
            )}
            <Pitch formation={formation} slots={slots} activeIdx={activeIdx}
              onSlot={i=>{if(draftMode==="position-first"&&!slots[i]?.player)setActiveIdx(i);}}
              clickable={draftMode==="position-first"}/>
          </div>
          {draftMode==="position-first"&&activeIdx===null&&filled<11&&(
            <div style={{textAlign:"center",padding:"24px 0",fontFamily:"var(--font-sans)",color:"#6f6755",fontSize:"0.82rem",letterSpacing:"2px"}}>↑ TAP A POSITION ABOVE TO DRAFT</div>
          )}
        </div>
      )}

      {/* LINEUP */}
      {phase==="lineup"&&(
        <div className="sec">
          <div className="tag">Step 4 of 4</div>
          <div className="h1" style={{marginBottom:10}}>Your Lineup</div>
          <div style={{display:"flex",gap:8,marginBottom:16,flexWrap:"wrap"}}>
            <span className="chip chip-amber"><span style={{fontFamily:"var(--font-mono)",fontSize:"1.1rem",lineHeight:1}}>{myRating}</span> OVR</span>
            <span className="chip chip-teal">ATK <span style={{fontFamily:"var(--font-mono)",fontSize:"1.1rem",lineHeight:1,marginLeft:3}}>{myAtk}</span></span>
            <span className="chip chip-blue">DEF <span style={{fontFamily:"var(--font-mono)",fontSize:"1.1rem",lineHeight:1,marginLeft:3}}>{myDef}</span></span>
          </div>
          <Pitch formation={formation} slots={slots} clickable={false}/>
          <div style={{display:"flex",gap:8,marginTop:16}}>
            <button className="gb" style={{flex:1}} onClick={()=>setPhase("draft")}>← Edit</button>
            <button className="sb" style={{flex:2}} onClick={showOdds}>VIEW ODDS →</button>
          </div>
        </div>
      )}

      {/* PRE-TOURNAMENT ODDS */}
      {phase==="odds"&&oddsData&&(
        <div className="sec">
          <div style={{textAlign:"center",marginBottom:18}}>
            <div className="tb" style={{fontSize:"3rem",marginBottom:8}}>🏆</div>
            <div className="h1" style={{marginBottom:6}}>Squad Complete</div>
            <div style={{fontFamily:"var(--font-sans)",color:"#6f6755",fontSize:"0.82rem",lineHeight:1.5,maxWidth:380,margin:"0 auto"}}>
              Here's what the bookies make of your XI. Play the tournament and chase the impossible.
            </div>
          </div>

          <div className="panel" style={{marginBottom:16,padding:"16px 16px 6px"}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14}}>
              <span style={{fontFamily:"var(--font-sans)",fontSize:"0.6rem",letterSpacing:"3px",color:"#cf2e2e",textTransform:"uppercase"}}>Pre-Tournament Odds</span>
            </div>

            <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-end",marginBottom:16,paddingBottom:14,borderBottom:"1px solid rgba(25,23,16,0.07)"}}>
              <div>
                <div style={{fontFamily:"var(--font-sans)",fontSize:"0.6rem",letterSpacing:"2px",color:"#6f6755",textTransform:"uppercase",marginBottom:2}}>Likely Finish</div>
                <div style={{fontFamily:"var(--font-display)",fontSize:"1.35rem",fontWeight:700,color:"#191710",lineHeight:1.05}}>
                  {oddsData.projLowIdx===oddsData.projHighIdx
                    ?oddsData.projected
                    :<>{oddsData.projLow} <span style={{color:"#cf2e2e"}}>→</span> {oddsData.projHigh}</>}
                </div>
                <div style={{fontFamily:"var(--font-sans)",fontSize:"0.66rem",color:"#6f6755",marginTop:3}}>Most likely: <span style={{color:"#191710",fontWeight:600}}>{oddsData.projected}</span></div>
              </div>
              <div style={{textAlign:"right"}}>
                <div style={{fontFamily:"var(--font-sans)",fontSize:"0.6rem",letterSpacing:"2px",color:"#6f6755",textTransform:"uppercase",marginBottom:2}}>Expected Wins</div>
                <div style={{fontFamily:"var(--font-mono)",fontSize:"2rem",fontWeight:500,color:"#2f6f43",lineHeight:1}}>{oddsData.expWins}</div>
              </div>
            </div>

            <OddsBar label="Win the Tournament" pct={oddsData.champion} color="linear-gradient(90deg,#cf2e2e,#cf2e2e)"/>
            <OddsBar label="Reach the Final"  pct={oddsData.final}    color="linear-gradient(90deg,#2f6f43,#2f6f43)"/>
            <OddsBar label="Reach the Semis"  pct={oddsData.semis}    color="linear-gradient(90deg,#6f6755,#a99f88)"/>
            <OddsBar label="Reach the Last 16" pct={oddsData.last16}  color="linear-gradient(90deg,#6f6755,#a99f88)"/>
            <OddsBar label="Group-Stage Exit" pct={oddsData.groupExit} color="linear-gradient(90deg,#cf2e2e,#cf2e2e)"/>

            <div style={{fontFamily:"var(--font-sans)",fontSize:"0.68rem",color:"#a99f88",lineHeight:1.5,marginTop:6}}>
              What your <span style={{color:"#cf2e2e"}}>{myRating} OVR</span> squad <em>should</em> produce on {difficulty}. Play it out to beat the odds.
            </div>
          </div>

          <div style={{display:"flex",gap:8}}>
            <button className="gb" style={{flex:1}} onClick={()=>setPhase("lineup")}>← Edit Squad</button>
            <button className="sb" style={{flex:2}} onClick={setupTournament}>ENTER THE TOURNAMENT →</button>
          </div>
        </div>
      )}

      {/* ALL GROUPS */}
      {phase==="allgroups"&&(
        <div className="sec">
          <div className="tag">Group Stage Draw</div>
          <div className="h1" style={{marginBottom:6}}>The Draw</div>
          <div style={{fontFamily:"var(--font-sans)",color:"#a99f88",fontSize:"0.78rem",marginBottom:16}}>
            You're in <span style={{color:"#cf2e2e",fontWeight:600}}>Group {userGroup?.id}</span>, replacing the weakest team.
          </div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:16}}>
            {WC2026_GROUPS.map((g,gi)=>{
              const isU=gi===userGroupIdx;
              const teams=isU?userGroup.teams:g.teams;
              return(
                <div key={g.id} style={{border:`1px solid ${isU?"rgba(207,46,46,0.4)":"rgba(25,23,16,0.06)"}`,padding:"9px 10px",background:isU?"rgba(207,46,46,0.04)":"rgba(25,23,16,0.015)",borderRadius:4}}>
                  <div style={{fontFamily:"var(--font-mono)",fontSize:"0.88rem",letterSpacing:"2px",color:isU?"#cf2e2e":"#6f6755",marginBottom:6,fontWeight:500}}>GROUP {g.id}{isU&&<span style={{marginLeft:5}}>★</span>}</div>
                  {teams.map(t=>(
                    <div key={t.name} style={{display:"flex",alignItems:"center",gap:4,padding:"2px 0"}}>
                      <FlagBadge name={t.name}/>
                      <span style={{fontFamily:"var(--font-sans)",fontSize:"0.76rem",color:t.isUser?"#cf2e2e":isU?"#2a261c":"#a99f88",fontWeight:t.isUser?600:400,flex:1,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{t.name}</span>
                      <span style={{fontFamily:"var(--font-mono)",fontSize:"0.85rem",color:"#6f6755",letterSpacing:"0.5px"}}>{t.rating}</span>
                    </div>
                  ))}
                </div>
              );
            })}
          </div>
          <div style={{textAlign:"center"}}>
            <button className="sb" onClick={()=>{setMatchIdx(0);setPhase("groupmatch");}}>BEGIN GROUP STAGE →</button>
          </div>
        </div>
      )}

      {/* GROUP MATCH */}
      {phase==="groupmatch"&&userGroup&&(
        <div className="sec">
          <div className="tag">Group {userGroup.id} — Match {matchIdx+1} of 3</div>
          {!simState?(
            <>
              <div className="panel" style={{marginBottom:12}}>
                <div style={{fontFamily:"var(--font-sans)",color:"#6f6755",marginBottom:5,letterSpacing:"2px",fontSize:"0.65rem",textTransform:"uppercase"}}>Your Group</div>
                <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>{userGroup.teams.map(t=><span key={t.name} style={{fontFamily:"var(--font-sans)",fontSize:"0.78rem",color:t.isUser?"#cf2e2e":"#a99f88",display:"flex",alignItems:"center",gap:3}}><FlagBadge name={t.name}/>{t.name}</span>)}</div>
              </div>
              {matchIdx>0&&(
                <AllGroupsBrowser allGroupFixtures={allGroupFixtures} allGroups={allGroups} userGroupIdx={userGroupIdx} uptoMatchday={matchIdx}/>
              )}
              <div style={{textAlign:"center",marginBottom:14,padding:"18px",background:"linear-gradient(135deg,#eae2cf,#e1d8c1)",border:"1px solid rgba(25,23,16,0.08)",borderRadius:6,position:"relative",overflow:"hidden"}}>
                <div style={{position:"absolute",inset:0,background:"radial-gradient(ellipse at 50% 0%,rgba(207,46,46,0.05) 0%,transparent 65%)",pointerEvents:"none"}}/>
                <div style={{fontFamily:"var(--font-sans)",fontSize:"0.6rem",letterSpacing:"3px",color:"#6f6755",marginBottom:6,textTransform:"uppercase"}}>Next Opponent</div>
                <div style={{fontFamily:"var(--font-display)",fontSize:"1.6rem",fontWeight:600,color:"#191710",letterSpacing:"0.5px",display:"flex",alignItems:"center",justifyContent:"center",gap:8}}><FlagBadge name={getOpps()[matchIdx]?.name}/>{getOpps()[matchIdx]?.name}</div>
                <div style={{fontFamily:"var(--font-mono)",fontSize:"1.1rem",color:"#a99f88",marginTop:4,letterSpacing:"1px"}}>{getOpps()[matchIdx]?.rating} <span style={{fontSize:"0.75rem",letterSpacing:"2px",opacity:0.6}}>OVR</span></div>
              </div>
              {groupResults.length>0&&(
                <div style={{marginBottom:14}}>
                  <div style={{fontFamily:"var(--font-mono)",fontSize:"0.62rem",letterSpacing:"3px",color:"#6f6755",marginBottom:8,textTransform:"uppercase"}}>Results So Far</div>
                  {groupResults.map((r,i)=>(
                    <div key={i} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"7px 10px",background:"rgba(25,23,16,0.02)",border:"1px solid rgba(25,23,16,0.05)",borderRadius:3,marginBottom:4}}>
                      <span style={{fontFamily:"var(--font-sans)",fontSize:"0.78rem",color:"#cf2e2e",fontWeight:600}}>★ You</span>
                      <span style={{fontFamily:"var(--font-mono)",fontSize:"1.4rem",fontWeight:400,color:r.myGoals>r.oppGoals?"#2f6f43":r.myGoals<r.oppGoals?"#cf2e2e":"#2a261c",letterSpacing:"1px"}}>{r.myGoals}–{r.oppGoals}</span>
                      <span style={{fontFamily:"var(--font-sans)",fontSize:"0.78rem",color:"#a99f88",display:"flex",alignItems:"center"}}><FlagBadge name={r.opp.name}/>{r.opp.name}</span>
                    </div>
                  ))}
                </div>
              )}
              <div style={{textAlign:"center"}}><button className="sb" onClick={playGroupMatch}>KICK OFF ⚽</button></div>
            </>
          ):(
            <MatchSim myG={simState.myG} opG={simState.opG} events={simState.events} opp={simState.opp} onComplete={resolveGroupMatch}/>
          )}
        </div>
      )}

      {/* GROUP DONE */}
      {phase==="groupdone"&&finalStandings&&(
        <div className="sec">
          <div className="tag">Group Stage Complete</div>
          {qualStatus==="eliminated"?(
            <div style={{textAlign:"center",paddingTop:22}}>
              <div style={{fontSize:"3.5rem",marginBottom:12}}>💔</div>
              <div className="h1" style={{color:"#cf2e2e",marginBottom:8}}>ELIMINATED</div>
              <div style={{fontFamily:"var(--font-sans)",color:"#a99f88",fontSize:"0.82rem",marginBottom:22}}>You didn't qualify from Group {userGroup?.id}.</div>
              <button className="sb" onClick={reset}>PLAY AGAIN ↺</button>
            </div>
          ):(
            <>
              <div style={{marginBottom:10}}>
                <span style={{fontFamily:"var(--font-mono)",fontSize:"1.1rem",letterSpacing:"2px",color:qualStatus==="1st"?"#cf2e2e":qualStatus==="2nd"?"#2f6f43":"#cf2e2e"}}>
                  {qualStatus==="1st"&&"★ GROUP WINNERS — INTO R32!"}
                  {qualStatus==="2nd"&&"● RUNNERS-UP — INTO R32!"}
                  {qualStatus==="3rd-ok"&&"◐ 3RD PLACE — QUALIFIED!"}
                </span>
              </div>
              <div className="div"/>
              <AllGroupsBrowser allGroupFixtures={allGroupFixtures} allGroups={allGroups} userGroupIdx={userGroupIdx} uptoMatchday={3}/>
              <Leaderboard stats={accumulateStats(allGroupFixtures,[],slots.find(x=>x.player&&x.player.pos.includes("GK"))?.player?.name)} title="Golden Boot Race"/>
              <button className="sb" style={{width:"100%"}} onClick={startKO}>BEGIN KNOCKOUT STAGE →</button>
            </>
          )}
        </div>
      )}

      {/* KO DRAW */}
      {phase==="kodraw"&&(
        <div className="sec">
          <div className="tag">Knockout Stage — The Draw</div>
          <div className="h1" style={{marginBottom:6}}>Round of 32</div>
          <div style={{fontFamily:"var(--font-sans)",color:"#a99f88",fontSize:"0.78rem",marginBottom:14}}>All 32 teams set. Your match is highlighted in amber.</div>
          <TournamentBracket allRounds={allRounds} currentRound={0}/>
          <div className="panel" style={{marginBottom:14,textAlign:"center"}}>
            <div className="tag" style={{marginBottom:5}}>Your R32 Opponent</div>
            <div style={{fontFamily:"var(--font-display)",fontSize:"1.4rem",fontWeight:600,color:"#191710"}}>{koDraws[0]&&koDraws[0].opp?koDraws[0].opp.name:""}</div>
            {koDraws[0]&&koDraws[0].opp&&<div style={{fontFamily:"var(--font-mono)",fontSize:"1rem",color:"#a99f88",marginTop:4,letterSpacing:"1px"}}>{koDraws[0].opp.rating} OVR</div>}
          </div>
          <button className="sb" style={{width:"100%"}} onClick={()=>setPhase("kostart")}>PLAY R32 →</button>
        </div>
      )}

      {/* KO START */}
      {phase==="kostart"&&(
        <div className="sec">
          <div className="tag">Bracket — {KO_LABELS[koRound]} Up Next</div>
          <div className="h1" style={{marginBottom:12}}>{KO_LABELS[koRound]}</div>
          <TournamentBracket allRounds={allRounds} currentRound={koRound}/>
          {koDraws[koRound]&&(
            <div className="panel" style={{marginBottom:14,textAlign:"center"}}>
              <div className="tag" style={{marginBottom:5}}>Your {KO_LABELS[koRound]} Opponent</div>
              <div style={{fontFamily:"var(--font-display)",fontSize:"1.4rem",fontWeight:600,color:"#191710"}}>{koDraws[koRound].opp.name}</div>
              <div style={{fontFamily:"var(--font-mono)",fontSize:"1rem",color:"#a99f88",marginTop:4,letterSpacing:"1px"}}>{koDraws[koRound].opp.rating} OVR</div>
            </div>
          )}
          <button className="sb" style={{width:"100%"}} onClick={playKOMatch}>PLAY {KO_LABELS[koRound]} →</button>
        </div>
      )}

      {/* KO MATCH */}
      {phase==="komatch"&&koSim&&(
        <div className="sec">
          <div className="tag">{KO_LABELS[koRound]}</div>
          <TournamentBracket allRounds={allRounds} currentRound={koRound}/>
          <div style={{fontFamily:"var(--font-display)",fontSize:"1.4rem",fontWeight:600,marginBottom:2,color:"#191710"}}>{koSim.opp.name}</div>
          <div style={{fontFamily:"var(--font-mono)",fontSize:"0.9rem",color:"#a99f88",marginBottom:12,letterSpacing:"1px"}}>{koSim.opp.rating} OVR</div>
          <MatchSim myG={koSim.myG} opG={koSim.opG} events={koSim.events} opp={koSim.opp} onComplete={resolveKOMatch} isKO={true}/>
        </div>
      )}

      {/* DONE — end-of-tournament summary */}
      {phase==="done"&&finishedStage!==null&&(
        <div className="sec">
          <TournamentSummary
            matchLog={matchLog} slots={slots}
            finishedStage={finishedStage}
            projStageIdx={oddsData?.projStageIdx}
            myRating={myRating} difficulty={difficulty}
            allRounds={finalRounds&&finalRounds.length?finalRounds:allRounds}
            champion={champion}
            allGroupFixtures={allGroupFixtures} onReset={reset}/>
        </div>
      )}

      {/* PLAYER PICK MODAL */}
      {showModal&&spinResult&&(
        <div style={{position:"fixed",inset:0,background:"rgba(25,23,16,0.55)",zIndex:100,display:"flex",alignItems:"center",justifyContent:"center",padding:14,backdropFilter:"blur(4px)"}}>
          <div style={{background:"#eae2cf",border:"1px solid rgba(25,23,16,0.1)",maxWidth:400,width:"100%",maxHeight:"88vh",overflowY:"auto",borderRadius:6,padding:18}}>
            <div style={{textAlign:"center",marginBottom:16,paddingBottom:14,borderBottom:"1px solid rgba(25,23,16,0.07)"}}>
              <div className="tag" style={{marginBottom:4}}>Wheel Result</div>
              <div style={{fontFamily:"var(--font-display)",fontSize:"1.6rem",fontWeight:600,color:"#191710",letterSpacing:"0.5px"}}>{spinResult.nation}</div>
              <div style={{fontFamily:"var(--font-mono)",fontSize:"1.1rem",color:"#cf2e2e",letterSpacing:"2px",marginBottom:3}}>WC {spinResult.year}</div>
              <div style={{fontFamily:"var(--font-sans)",fontSize:"0.75rem",color:"#6f6755"}}>
                {draftMode==="position-first"?<>Showing players for <strong style={{color:"#6f6755"}}>{slots[activeIdx]?.pos}</strong></>:"Pick any player, then assign a slot"}
              </div>
              {respins>0&&<div style={{fontFamily:"var(--font-sans)",fontSize:"0.72rem",color:"#6f6755",marginTop:4}}>Respins remaining: <span style={{color:"#cf2e2e",fontFamily:"var(--font-mono)",fontSize:"1rem"}}>{respins}</span></div>}
            </div>
            <div style={{display:"flex",flexDirection:"column",gap:5}}>
              {(()=>{
                const slotPos=draftMode==="position-first"?slots[activeIdx]?.pos:null;
                const drafted=new Set(slots.filter(s=>s.player).map(s=>`${s.player.name}|${s.player.rating}`));
                const visible=slotPos
                  ?spinResult.players.filter(p=>compatibleWithSlot(p.pos,slotPos)&&!drafted.has(`${p.name}|${p.rating}`))
                  :spinResult.players.filter(p=>!drafted.has(`${p.name}|${p.rating}`));
                if(!visible.length)return(
                  <div style={{textAlign:"center",fontFamily:"var(--font-sans)",color:"#cf2e2e",padding:"18px 0",fontSize:"0.82rem"}}>
                    No available players{slotPos?` for ${slotPos}`:""}<br/>
                    <span style={{color:"#6f6755",fontSize:"0.72rem"}}>Use a respin to try another nation.</span>
                  </div>
                );
                return visible.map((p,i)=>{
                  const openSlots=draftMode==="spin-first"?slots.filter(s=>!s.player&&compatibleWithSlot(p.pos,s.pos)):[];
                  const canPlace=(draftMode==="position-first")||(openSlots.length>0);
                  const rColor=p.rating>=90?"#cf2e2e":p.rating>=80?"#2f6f43":"#6f6755";
                  return(
                    <button key={i} className="pr" disabled={!canPlace} style={{opacity:canPlace?1:0.18}}
                      onClick={()=>{
                        if(!canPlace)return;
                        const pp={...p,nat:spinResult.nation,yr:spinResult.year};
                        if(draftMode==="position-first")assignPlayer(activeIdx,pp);
                        else{setSfPick({player:pp});setShowModal(false);}
                      }}>
                      <div style={{flex:1,minWidth:0}}>
                        <div style={{fontFamily:"var(--font-display)",fontWeight:600,fontSize:"0.95rem",color:canPlace?"#191710":"#cbbfa3",letterSpacing:"0.3px",whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{p.name}</div>
                        <div style={{fontFamily:"var(--font-sans)",fontSize:"0.7rem",color:"#6f6755",marginTop:1}}>{p.pos.join(" · ")}{draftMode==="spin-first"&&canPlace&&<span style={{color:"rgba(207,46,46,0.5)",marginLeft:6}}>{openSlots.length} slot{openSlots.length!==1?"s":""}</span>}</div>
                      </div>
                      <div style={{textAlign:"right",flexShrink:0,marginLeft:10}}>
                        <div style={{fontFamily:"var(--font-mono)",fontSize:"1.6rem",fontWeight:400,color:canPlace?rColor:"#cbbfa3",lineHeight:1,letterSpacing:"-0.5px"}}>{p.rating}</div>
                        <div style={{fontFamily:"var(--font-sans)",fontSize:"0.62rem",color:"#6f6755",letterSpacing:"1px"}}>OVR</div>
                      </div>
                    </button>
                  );
                });
              })()}
            </div>
            <div style={{marginTop:14}}>
              <button onClick={doRespin} disabled={respins<=0&&!!difficulty}
                style={{width:"100%",background:respins>0||!difficulty?"rgba(207,46,46,0.05)":"rgba(25,23,16,0.01)",border:`1px solid ${respins>0||!difficulty?"rgba(207,46,46,0.2)":"rgba(25,23,16,0.04)"}`,color:respins>0||!difficulty?"#cf2e2e":"#cbbfa3",fontFamily:"var(--font-mono)",padding:"10px",cursor:respins>0||!difficulty?"pointer":"not-allowed",fontSize:"1rem",letterSpacing:"3px",opacity:respins<=0&&difficulty?.25:1,borderRadius:3}}>
                RESPIN ({respins}) ↺
              </button>
            </div>
          </div>
        </div>
      )}

      {/* SPIN-FIRST SLOT CHOOSER */}
      {sfPick&&(
        <div style={{position:"fixed",inset:0,background:"rgba(25,23,16,0.55)",zIndex:110,display:"flex",alignItems:"center",justifyContent:"center",padding:14,backdropFilter:"blur(4px)"}}>
          <div style={{background:"#eae2cf",border:"1px solid rgba(25,23,16,0.1)",maxWidth:340,width:"100%",maxHeight:"84vh",overflowY:"auto",borderRadius:6,padding:18}}>
            <div style={{textAlign:"center",marginBottom:14,paddingBottom:12,borderBottom:"1px solid rgba(25,23,16,0.07)"}}>
              <div className="tag" style={{marginBottom:4}}>Assign Player</div>
              <div style={{fontFamily:"var(--font-display)",fontSize:"1.3rem",fontWeight:600,color:"#191710"}}>{sfPick.player.name}</div>
              <div style={{fontFamily:"var(--font-sans)",fontSize:"0.72rem",color:"#a99f88",marginTop:3}}>{sfPick.player.pos.join(" · ")} · <span style={{color:"#cf2e2e",fontFamily:"var(--font-mono)",fontSize:"1rem"}}>{sfPick.player.rating}</span> OVR</div>
            </div>
            <div style={{display:"flex",flexDirection:"column",gap:5}}>
              {slots.map((slot,i)=>{
                const ok=compatibleWithSlot(sfPick.player.pos,slot.pos)&&!slot.player;
                return(
                  <button key={i} onClick={()=>ok&&assignPlayer(slot.idx,sfPick.player)}
                    style={{background:ok?"rgba(207,46,46,0.05)":"rgba(25,23,16,0.01)",border:`1px solid ${ok?"rgba(207,46,46,0.2)":"rgba(25,23,16,0.04)"}`,color:ok?"#2a261c":"#cbbfa3",cursor:ok?"pointer":"not-allowed",padding:"8px 12px",display:"flex",alignItems:"center",gap:10,width:"100%",fontFamily:"var(--font-sans)",borderRadius:3,transition:"all .15s"}}>
                    <span style={{background:ok?"rgba(207,46,46,0.1)":"rgba(25,23,16,0.02)",color:ok?"#cf2e2e":"#cbbfa3",fontFamily:"var(--font-mono)",fontSize:"0.78rem",fontWeight:500,padding:"3px 6px",minWidth:36,textAlign:"center",borderRadius:2,letterSpacing:"1px"}}>{slot.pos}</span>
                    <span style={{fontSize:"0.82rem"}}>{slot.player?<span style={{color:"#c8bda2"}}>{slot.player.name}</span>:ok?<span style={{color:"#6f6755"}}>empty</span>:<span style={{color:"#cbbfa3"}}>incompatible</span>}</span>
                  </button>
                );
              })}
            </div>
            <button className="gb" style={{marginTop:12,width:"100%"}} onClick={()=>{setSfPick(null);setShowModal(true);}}>← Back</button>
          </div>
        </div>
      )}
    </div>
  );
}
