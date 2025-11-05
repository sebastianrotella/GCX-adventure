// Geocacher RPG
(() => {
  // ========= Elements =========
  const $ = s => document.querySelector(s);
  const el = {
    explore: $('#explore'), story: $('#story'), stats: $('#stats'),
    btnTrain: $('#btnTrain'), btnBoss: $('#btnBoss'), btnCont: $('#btnContinueBoss'),
    // btnDevUnlock: $('#btnDevUnlock'), // uncomment if want the dev button to unlock all moves
    battle: $('#battle'), battleTitle: $('#battleTitle'), eHP: $('#eHP'),
    moves: $('#moves'), btnEscape: $('#btnEscape'), hint: $('#hint'),
    phase: $('#phase'), log: $('#log'), statusBanner: $('#statusBanner')
  };
  const log = t => { el.log.textContent += t + "\n"; el.log.scrollTop = el.log.scrollHeight; };

  // ========= Moves =========
  // Master move list (stable index = id)
  // const MOVES = [
  //   {name:'Avoid Muggles',  power:12, quip:'You casually pretend you’re not weird.'},                  // 0
  //   {name:'Apply Insect Repellent', power:8, quip:'Mosquitoes perish; you smell like victory and chemicals.'}, // 1
  //   {name:'Bushwhack',      power:10, quip:'You karate-chop flora like a confused ninja.'},            // 2
  //   {name:'Bring Snacks',   power:0,  quip:'Morale increases. Calories magically appear.'},            // 3
  //   {name:'Check the Hint', power:6,  quip:'You squint at the cryptic clue… hmm.'},                    // 4
  //   {name:'Compass Consult',power:7,  quip:'You spin dramatically and point with confidence.'},        // 5
  //   {name:'Decrypt Clue',   power:9,  quip:'ROT13 flex engaged.'},                                     // 6
  //   {name:'Eagle-Eye Scan', power:8,  quip:'Hawk vision acquired (you hope).'},                        // 7
  //   {name:'Flashlight',     power:11, quip:'You illuminate mysteries and three spiders.'},             // 8
  //   {name:'Fake a Phone Call',power:0,quip:'“Yes hello I am normal.”'},                                // 9
  //   {name:'Gloves On',      power:0,  quip:'Tactically fearless fingers.'},                            //10
  //   {name:'Hide in Plain Sight', power:13, quip:'You become a bench.'},                                //11
  //   {name:'Investigate Suspicious Rock', power:9, quip:'The rock claims innocence.'},                  //12
  //   {name:'Jam Logbook Closed', power:7, quip:'Micro dominance asserted.'},                            //13
  //   {name:'Lift a Rock',    power:15, quip:'You upend geology like a raccoon god.'},                   //14
  //   {name:'Look Underbench',power:8,  quip:'Classic geocacher posture.'},                              //15
  //   {name:'Phone-a-Friend', power:18, quip:'Your friend solves it instantly. Rude.'},                  //16
  //   {name:'Parkour!!!',     power:12, quip:'Unnecessary flips encouraged.'},                           //17
  //   {name:'Squint Extra Hard', power:10, quip:'Pixels enhance. Brain… not so much.'},                  //18
  //   {name:'Stealth Mode',   power:14, quip:'You are the shrubbery.'},                                  //19
  //   {name:'Tree Climb',     power:16, quip:'Defy gravity & squirrels.'},                               //20
  //   {name:'Tweezers Technique', power:22, quip:'Micros tremble.'},                                     //21
  //   {name:'Trackable Toss', power:22, quip:'A shiny travel bug arcs through destiny.'},                //22
  // ];

   const MOVES = [
    {name:'Check GPS', power:6,  quip:"Your confidence rises. The enemy's ego is hurt."},                                  // 0
    {name:'Phone-a-Friend', power:18, quip:'Your friend jumps in and throws a punch.'},                  // 1
    {name:'Hide in Plain Sight', power:13, quip:'You put on your invisibility cloak and vanish. Enemy is hurt by confusion.'},     // 2
    {name:'Flashlight',     power:11, quip:'You blind the enemy.'},                                   // 3
    {name:'Poke',     power:11, quip:'You poke the enemy in its weak spot.'},                                                        // 4
    {name:'Replacement',     power:0, quip:'You are flustered and look for someone else to take your place. Nothing happens.'},                                  // 5
    {name:'Snack',   power:10,  quip:'Morale increases. Calories magically appear.'},                 // 6
    {name:'Bug Spray', power:8, quip:'Mosquitoes perish; you smell like victory and chemicals.'},     // 7
    {name:'BushWHACK',      power:10, quip:'You charge in and karate-chop like a confused ninja.'},      // 8
    {name:'Eagle-Eye Scan', power:8,  quip:'Hawk vision acquired (you hope).'},                        // 9
  ];

  // Explicit unlock order (by move id). Start with only the FIRST entry as the initial move.
  const UNLOCK_ORDER = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];

  // Training enemies
  const TRAINING = [
    {name:'Mosquito Swarm',      hp:16, power:4, flavor: "An airborne army thirsty for cacher blood."},
    //{name:'Dog Walker', hp:20, power:5, flavor: "HEY! Why are you peering in there?"},
    {name:'GPS Drift',    hp:18, power:5, flavor: "Moves the coordinates every 3 seconds."},
    {name:'False Trail Sign',    hp:18, power:6, flavor: "Laughs as you walk 50m the wrong way."},
    {name:'Big Bush',    hp:10, power:5, flavor: "Looks like it wants you dead."},
    {name:'Spider Web',    hp:10, power:5, flavor: "Hidden in plain sight, will catch you by surprise."},
    {name:'Park Ranger',    hp:10, power:5, flavor: "Suspicious of your every move."},
    {name:'Dark Tunnel',    hp:10, power:5, flavor: "Envelopes you in darkness."},
    {name:'Wild Hog',    hp:10, power:5, flavor: "Not thrilled you are digging in ITS dirt."},
    {name:'Mall Cop',    hp:10, power:5, flavor: "What are you doing behind that dumpster??"},
    {name:'Chatty Tourist',    hp:10, power:5, flavor: "Blocks ground zero with enthusiasm."},
    //{name:'Soggy Log',    hp:10, power:5, flavor: "Nice try, but you can't sign ME."},
    {name:'Solution Checker',    hp:10, power:5, flavor: "Those coordinates are not correct, you have 1 try left."},
    {name:'Menacing Mud',    hp:10, power:5, flavor: "Your clean shoes are a distant memory."},
    //{name:'JeffGamer Puzzle',    hp:10, power:5, flavor: "Thrives on your suffering, solved only by accident."},
    //{name:'Menacing Mud',    hp:10, power:5, flavor: "Your clean shoes are a distant memory."},
    //{name:'Slithering Snake',    hp:10, power:5, flavor: "Eager to catch its next meal."},
    {name:'Devious Bench',    hp:10, power:5, flavor: "Pretends there's no cache under there..."},
    {name:'Cursed Hollow Tree',    hp:10, power:5, flavor: "Hiding something, won't tell you what."},
    //{name:'Banyan Tree',    hp:10, power:5, flavor: "Absolutely full of hidey holes... Looms with smugness."},

  ];

  // ====== Quips ======
  // Keys are "Enemy Name|Move Name". Values can be a string or an object with phases.
const REACTIONS = {
  // Check GPS
  "GPS Drift|Check GPS": {
    use: "You check the coordinates... again.",
    hit: "TODO",
    defeat: "TODO"
  },

  // Phone-a-Friend
  "Solution Checker|Phone-a-Friend": {
    use: "Nudge. Nudge.. Nudge... AHA!",
    hit: "TODO",
    defeat: "TODO"
  },
  "JeffGamer Puzzle|Phone-a-Friend": {
    use: "Your friend solves it instantly!",
    hit: "Your friend solves it instantly! It's SUPER effective!",
    defeat: "TODO"
  },
  "GPS Drift|Phone-a-Friend": {
    use: "Your friend gives you a helpful hint.",
    hit: "TODO",
    defeat: "TODO"
  },
  "False Trail Sign|Phone-a-Friend": {
    use: "Your friend listens to you rant in frustration.",
    hit: "TODO",
    defeat: "TODO"
  },
  "Park Ranger|Phone-a-Friend": {
    use: "You fake a phone call to act normal. Enemy feels bad for misjudging the situation.",
    hit: "TODO",
    defeat: "TODO"
  },
  "Mall Cop|Phone-a-Friend": {
    use: "You fake a phone call to act normal. Enemy feels bad for misjudging the situation.",
    hit: "TODO",
    defeat: "TODO"
  },
  "Chatty Tourist|Phone-a-Friend": {
    use: "You call your friend to pass the time. The enemy's patience wears down.",
    hit: "TODO",
    defeat: "TODO"
  },

  // Flashlight
  "Dark Tunnel|Flashlight": {
    use: "You sweep the beam through the void and illuminate its deepest secrets.",
    hit: "TODO",
    defeat: "TOOD"
  },
  "GPS Drift|Flashlight": {
    use: "Enemy can't understand why you'd use that move against it. It hurt itself in its confusion.",
    hit: "TODO",
    defeat: "TOOD"
  },
  "False Trail Sign|Flashlight": {
    use: "Enemy can't understand why you'd use that move against it. It hurt itself in its confusion.",
    hit: "TODO",
    defeat: "TOOD"
  },
  "Big Bush|Flashlight": {
    use: "Enemy can't understand why you'd use that move against it. It hurt itself in its confusion.",
    hit: "TODO",
    defeat: "TOOD"
  },
  "Spider Web|Flashlight": {
    use: "Enemy can't understand why you'd use that move against it. It hurt itself in its confusion.",
    hit: "TODO",
    defeat: "TOOD"
  },
  "Solution Checker|Flashlight": {
    use: "Enemy can't understand why you'd use that move against it. It hurt itself in its confusion.",
    hit: "TODO",
    defeat: "TOOD"
  },
   "Solution Checker|Flashlight": {
    use: "Enemy can't understand why you'd use that move against it. It hurt itself in its confusion.",
    hit: "TODO",
    defeat: "TOOD"
  },
   "Menacing Mud|Flashlight": {
    use: "Enemy can't understand why you'd use that move against it. It hurt itself in its confusion.",
    hit: "TODO",
    defeat: "TOOD"
  },
   "Devious Bench|Flashlight": {
    use: "Enemy can't understand why you'd use that move against it. It hurt itself in its confusion.",
    hit: "TODO",
    defeat: "TOOD"
  },
   "Cursed Hollow Tree|Flashlight": {
    use: "You shine your light inside. The enemy feels exposed.",
    hit: "TODO",
    defeat: "TOOD"
  },

  // Poke
  "GPS Drift|Poke": {
    use: "You poke the screen of your GPS and it seems to recalibrate itself.",
    hit: "TODO",
    defeat: "TOOD"
  },
  "False Trail Sign|Poke": {
    use: "Enemy can't understand why you'd use that move against it. It hurt itself in its confusion.",
    hit: "TODO",
    defeat: "TOOD"
  },
  "Big Bush|Poke": {
    use: "Its leaves are ruffled.",
    hit: "TODO",
    defeat: "TOOD"
  },
  "Spider Web|Poke": {
    use: "The intricate web is torn apart.",
    hit: "TODO",
    defeat: "TOOD"
  },
  "Dark Tunnel|Poke": {
    use: "Enemy can't understand why you'd use that move against it. It hurt itself in its confusion.",
    hit: "TODO",
    defeat: "TOOD"
  },
  "Solution Checker|Poke": {
    use: "You poke the screen in frustration. The enemy glitches.",
    hit: "TODO",
    defeat: "TOOD"
  },
  "Devious Bench|Poke": {
    use: "Enemy can't understand why you'd use that move against it. It hurt itself in its confusion.",
    hit: "TODO",
    defeat: "TOOD"
  },
  "Menacing Mud|Poke": {
    use: "Enemy can't understand why you'd use that move against it. It hurt itself in its confusion.",
    hit: "TODO",
    defeat: "TOOD"
  },
  "Cursed Hollow Tree|Poke": {
    use: "You poke around with a stick you found on the floor.",
    hit: "TODO",
    defeat: "TOOD"
  },
  "Banyan Tree|Poke": {
    use: "TODO",
    hit: "You poke around with a stick you found on the floor. It's SUPER effective!",
    defeat: "TOOD"
  },
  
  // Replacement
  "Soggy Log|Replacement": {
    use: "TODO",
    hit: "You replace the enmemy with a fresh, clean log. It's SUPER effective!",
    defeat: "TOOD"
  },

};

  // ===== 5-Boss Final Challenge =====
   const BOSS_ORDER = [
    {name:'JeffGamer Puzzle',      hp:50, power:10, correct:'Phone-a-Friend', flavor: "Thrives on your suffering, solved only by accident."},
    {name:'Banyan Tree',           hp:50, power:10, correct:'Poke', flavor: "Absolutely full of hidey holes... Looms with smugness."},
    {name:'Dog Walker',            hp:60, power:10, correct:'Hide in Plain Sight', flavor: "HEY! Why are you peering in there?"},
    {name:'Slithering Snake',      hp:60, power:10, correct:'Check GPS', flavor: "Eager to catch its next meal."},
    {name:'Soggy Log',             hp:70, power:11, correct:'Replacement', flavor: "Nice try, but you can't sign ME."},
  ];
  // IMPORTANT: In this build, the correct move IDs for encryption are:
  // [1, 4, 2, 0, 5]
  // Encrypt your coordinates with exactly: "1-4-2-0-5"

  // ========= Encrypted Coordinates (client-only) =========
  // Replace these using your encryptor with the above sequence.
  const CIPHERTEXT_B64 = "BRup+OMz5d2DdFiKFpmY7zZYI8bboZJxQzL70EShM8/mL8MC/y7m";
  const IV_B64 = "wLMnZjpghT6Pkp8Z";

  // ========= State =========
  const state = {
    player:{
      maxhp:30,
      hp:30,
      lvl:1,
      exp:0,
      moves:[ UNLOCK_ORDER[0] ],  // start with ONE move
      learnPtr: 1
    },
    enemy:null,
    mode:'explore',
    bossActive:false,
    bossQueue:[], // fixed order copy
    isBoss:false,
    bossHistory:[], // sequence of move ids used for defeating bosses
    completed:false
  };

  // ========= Helpers =========
  const rand = n => Math.floor(Math.random()*n);
  function paintStats(){ el.stats.textContent = `LV ${state.player.lvl} • HP ${state.player.hp}/${state.player.maxhp} • EXP ${state.player.exp}`; }
  const moveIdByName = name => MOVES.findIndex(m=>m.name===name);

  function setCompletedUI(){
    state.completed = true;
    el.statusBanner.textContent = "Log — FINAL CHALLENGE COMPLETE ✅";
    el.statusBanner.classList.add('completed');
    el.phase.textContent = 'Completed';
    el.story.textContent = '🎉 Final Challenge complete! Prize awarded.';
    log('🏆 FINAL CHALLENGE COMPLETE — prize awarded. Refresh website to play again.');    
    // After completion, allow free training or replay; keep buttons visible.
  }

  function showExplore(){
    state.mode='explore';
    el.phase.textContent = state.completed ? 'Completed' : 'Exploration';
    el.battle.classList.add('hidden');
    el.explore.classList.remove('hidden');

    if (state.bossActive) {
      el.btnTrain?.classList.add('hidden');
      el.btnBoss?.classList.add('hidden');
      if (state.bossQueue.length) el.btnCont?.classList.remove('hidden');
      else el.btnCont?.classList.add('hidden');
    } else {
      el.btnCont?.classList.add('hidden');
      el.btnTrain?.classList.remove('hidden');
      el.btnBoss?.classList.remove('hidden');
      if (el.btnTrain) el.btnTrain.disabled = false;
      if (el.btnBoss) el.btnBoss.disabled = false;
    }
    paintStats();
  }

  function showBattle(){
    state.mode='battle';
    el.phase.textContent='Battle';
    el.explore.classList.add('hidden');
    el.battle.classList.remove('hidden');
    if (el.btnEscape) {
      el.btnEscape.disabled = !!state.isBoss;
      el.btnEscape.title = state.isBoss ? "No escape from the Final Challenge." : "";
    }
    paintStats();
  }

  function beginBattle(){
    showBattle();
    el.battleTitle.textContent = `Fighting ${state.enemy.name}! ${state.isBoss?'(Final Challenge)':''}`;
    el.eHP.textContent = state.enemy.hp;
    el.hint.textContent = state.isBoss ? 'Choose wisely… a wrong move will lead to your demise' : '';
    el.moves.innerHTML = '';
    state.player.moves.forEach((moveId)=>{
      const m = MOVES[moveId];
      const b = document.createElement('button');
      b.textContent = `${m.name} (${m.power})`;
      b.addEventListener('click',()=> performMove(moveId));
      el.moves.appendChild(b);
    });
    log(`You engage ${state.enemy.name}! ${state.enemy.flavor} What will you do?`);
  }

  function endBattle(win){
    // Always leave battle view
    showExplore();

    if (win) {
      log(`${state.enemy.name} defeated!`);
      if (state.isBoss) {
        if (state.bossQueue.length) {
          el.story.textContent = `Boss stage cleared! ${state.bossQueue.length} to go. Breathe, hero.`;
          el.btnCont?.classList.remove('hidden');
        } else {
          // Completed all 5 bosses — attempt to reveal prize
          // Update UI to completed *before* the blocking alert to ensure it sticks.
          setCompletedUI();
          tryRevealPrize(); // popup
          state.bossActive=false; state.isBoss=false; state.bossQueue=[]; state.bossHistory=[];
        }
      } else {
        const gain=10; state.player.exp+=gain; el.story.textContent=`Training win! You gained ${gain} EXP.`; levelCheck();
      }
    } else {
      // LOSS: exit boss if applicable, and RESTORE HP so player isn't stuck at 0
      if (state.isBoss) { state.bossActive=false; state.isBoss=false; state.bossQueue=[]; state.bossHistory=[]; }
      state.player.hp = state.player.maxhp; // recover at base camp
      el.btnCont?.classList.add('hidden');
      el.btnTrain?.classList.remove('hidden');
      el.btnBoss?.classList.remove('hidden');
      if (el.btnTrain) el.btnTrain.disabled = false;
      if (el.btnBoss) el.btnBoss.disabled = false;
      el.story.textContent='You were forced to log the DNF, then recovered (emotionally and physically) back at your HQ. Train up and try again.';
    }

    paintStats();
  }

  // ========= Combat =========
  function reactLine(enemyName, moveName, phase, fallback) {
    const key = `${enemyName}|${moveName}`;
    const r = REACTIONS[key];
    const prefix = `You use ${moveName}! `;

    // Helper: strip any existing leading "You use XYZ!" to avoid duplicates
    const stripDupPrefix = s => s.replace(/^You use .*?!\s*/i, '');

    if (!r) {
      return prefix + stripDupPrefix(fallback);
    }

    if (typeof r === "string") {
      return prefix + stripDupPrefix(r);
    }

    // phase-specific ("use" | "hit" | "miss" | "defeat")
    const line = r[phase] || fallback;
    return prefix + stripDupPrefix(line);
  }

  function bossTail(enemyName, moveName, phase, fallback) {
    // phase = "hit" | "miss"
    const key = `${enemyName}|${moveName}`;
    const r = REACTIONS[key];
    if (!r) return fallback;
    if (typeof r === "string") return r;         // treat a plain string as the tail
    return r[phase] || r.quip || fallback;       // prefer phase-specific, else generic 'quip', else fallback
  }

  function bossOpener(enemyName, moveName, correct, defaultQuip) {
    const tail = correct
      ? bossTail(enemyName, moveName, "hit", `${defaultQuip} It’s SUPER effective!`)
      : bossTail(enemyName, moveName, "miss", `It’s not the right technique…`);
    return `You use ${moveName}! ${tail}`;
  }

  function performMove(moveId){
    const m = MOVES[moveId];
    const base = m.power;
    const isBoss = state.isBoss;
    const correct = isBoss && (m.name === state.enemy.correct);

    // --- ONE opening line only ---
    if (isBoss) {
      log( bossOpener(state.enemy.name, m.name, correct, m.quip) );
    } else {
      // Non-boss still uses your reactLine system
      log( reactLine(state.enemy.name, m.name, "use", `You use ${m.name}! ${m.quip}`) );
    }

    // damage, defeat, counterattack
    let mult = 1;
    if (isBoss) mult = correct ? 10 : 1;

    const dmg = Math.max(1, Math.floor(base * mult));
    state.enemy.hp = Math.max(0, state.enemy.hp - dmg);
    el.eHP.textContent = state.enemy.hp;
    log(`→ ${state.enemy.name} takes ${dmg} damage. (Enemy HP: ${state.enemy.hp}/${state.enemy.maxhp})`);

    if (state.enemy.hp <= 0) {
      if (isBoss && correct) state.bossHistory.push(moveId);
      endBattle(true);
      return;
    }

    if (isBoss && !correct) {
      state.player.hp = 0;
      log(`${state.enemy.name} unleashes a catastrophic counter! You are forced to log a DNF.`);
    } else {
      state.player.hp -= state.enemy.power;
      log(`→ ${state.enemy.name} hits back for ${state.enemy.power}! (Your HP: ${Math.max(0,state.player.hp)}/${state.player.maxhp})\nWhat will you do?`);
    }

    if (state.player.hp <= 0) { endBattle(false); return; }
    paintStats();
  }

  // ========= Progression =========
  function levelCheck(){
    // Faster leveling: threshold = lvl*8
    while(state.player.exp >= state.player.lvl*8){
      state.player.exp -= state.player.lvl*8;
      state.player.lvl++;
      state.player.maxhp += 5;
      state.player.hp = state.player.maxhp;
      // Unlock the next move in the explicit order (avoid duplicates)
      if(state.player.learnPtr < UNLOCK_ORDER.length){
        const nextId = UNLOCK_ORDER[state.player.learnPtr++];
        if(!state.player.moves.includes(nextId)){
          state.player.moves.push(nextId);
          log(`LEVEL UP! Now LV ${state.player.lvl}. Learned **${MOVES[nextId].name}**!`);
        }
      } else {
        log(`LEVEL UP! Now LV ${state.player.lvl}. No more moves to learn.`);
      }
    }
    paintStats();
  }

  // ========= Encounters =========
  function startTraining(){
    if (state.bossActive) { log("You're in the Final Challenge — no training until you finish or DNF."); return; }
    const base = TRAINING[rand(TRAINING.length)]
    state.enemy = {...base,
                      hp: base.hp, // cuurent hp
                      maxhp: base.hp // max hp
                    };
    state.isBoss = false;
    beginBattle();
  }

  function startBoss(){
    if (state.bossActive) { log("You're already in the Final Challenge. Continue or perish."); return; }
    state.bossQueue = BOSS_ORDER.map(x=>({...x})); // fixed order
    state.bossActive = true; state.isBoss = true;
    state.bossHistory = [];
    state.enemy = state.bossQueue.shift();
    beginBattle();
  }

  function continueBoss(){
    if(state.bossActive && state.bossQueue.length){
      el.btnCont?.classList.add('hidden');
      state.isBoss = true;
      state.enemy = state.bossQueue.shift();
      beginBattle();
    } else {
      el.btnCont?.classList.add('hidden');
    }
  }

  // ========= Prize Reveal (client-only encryption) =========
  async function tryRevealPrize(){
    // Common decode failure reasons will log to console and show actionable hint.
    try {
      if(state.bossHistory.length !== BOSS_ORDER.length){
        alert("Almost! (Sequence incomplete.) Make sure the FINAL BLOW on each boss was the correct move.");
        return;
      }
      const key = await deriveKeyFromSequence(state.bossHistory);
      const coords = await decryptCoords(key);
      // Ensure the UI shows completion even if the user closes the alert instantly
      alert(`🎉 Congrats! Final coordinates:\n${coords}`);
    } catch (e) {
      console.error("Decrypt failed:", e);
      alert([
        "Could not decode prize.",
        "Did you use the correct move against each boss?"
      ].join("\n"));
    }
  }

  async function deriveKeyFromSequence(seq){
    // e.g., "0-1-11-18-20-21-8-16-14-5" -> SHA-256 -> AES-GCM key
    const data = new TextEncoder().encode(seq.join("-"));
    const hash = await crypto.subtle.digest("SHA-256", data);
    return crypto.subtle.importKey("raw", hash, "AES-GCM", false, ["decrypt"]);
  }

  function b64ToBytes(b64){
    const bin = atob(b64);
    const out = new Uint8Array(bin.length);
    for(let i=0;i<bin.length;i++) out[i] = bin.charCodeAt(i);
    return out;
  }

  async function decryptCoords(key){
    const ct = b64ToBytes(CIPHERTEXT_B64);
    const iv = b64ToBytes(IV_B64);
    const plain = await crypto.subtle.decrypt({ name:"AES-GCM", iv }, key, ct);
    return new TextDecoder().decode(plain);
  }

  // ========= Wiring =========
  function wire(){
    el.btnTrain?.addEventListener('click', startTraining);
    el.btnBoss?.addEventListener('click', startBoss);
    el.btnCont?.addEventListener('click', continueBoss);
    el.btnEscape?.addEventListener('click', ()=>{
      if(state.isBoss){
        log("No escape from the Final Challenge. Face your fate.");
        return;
      }
      log('You scurry away...');
      endBattle(false);
    });
    // Dev: unlock all moves instantly for testing
    // el.btnDevUnlock?.addEventListener('click', ()=>{
    //   state.player.moves = MOVES.map((_,i)=>i);
    //   state.player.learnPtr = UNLOCK_ORDER.length;
    //   log('🛠 Dev: All moves unlocked for testing.');
    //   if(state.mode==='battle') beginBattle(); // refresh buttons
    //   else paintStats();
    // });
  }

  // ========= Init =========
  function init(){ paintStats(); log('Welcome, cacher! Beat the 5-boss gauntlet in the Final Challenge to unlock the final coordinates.'); }
  init(); wire();
})();