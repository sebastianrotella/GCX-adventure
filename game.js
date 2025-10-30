// Chaotic Geocacher RPG — v3: decode fix UX, completion indicator, dev unlock
(() => {
  // ========= Elements =========
  const $ = s => document.querySelector(s);
  const el = {
    explore: $('#explore'), story: $('#story'), stats: $('#stats'),
    btnTrain: $('#btnTrain'), btnBoss: $('#btnBoss'), btnCont: $('#btnContinueBoss'),
    btnDevUnlock: $('#btnDevUnlock'),
    battle: $('#battle'), battleTitle: $('#battleTitle'), eHP: $('#eHP'),
    moves: $('#moves'), btnEscape: $('#btnEscape'), hint: $('#hint'),
    phase: $('#phase'), log: $('#log'), statusBanner: $('#statusBanner')
  };
  const log = t => { el.log.textContent += t + "\n"; el.log.scrollTop = el.log.scrollHeight; };

  // ========= Moves =========
  // Master move list (stable index = id)
  const MOVES = [
    {name:'Avoid Muggles',  power:12, quip:'You casually pretend you’re not weird.'},                  // 0
    {name:'Apply Insect Repellent', power:8, quip:'Mosquitoes perish; you smell like victory and chemicals.'}, // 1
    {name:'Bushwhack',      power:10, quip:'You karate-chop flora like a confused ninja.'},            // 2
    {name:'Bring Snacks',   power:0,  quip:'Morale increases. Calories magically appear.'},            // 3
    {name:'Check the Hint', power:6,  quip:'You squint at the cryptic clue… hmm.'},                    // 4
    {name:'Compass Consult',power:7,  quip:'You spin dramatically and point with confidence.'},        // 5
    {name:'Decrypt Clue',   power:9,  quip:'ROT13 flex engaged.'},                                     // 6
    {name:'Eagle-Eye Scan', power:8,  quip:'Hawk vision acquired (you hope).'},                        // 7
    {name:'Flashlight',     power:11, quip:'You illuminate mysteries and three spiders.'},             // 8
    {name:'Fake a Phone Call',power:0,quip:'“Yes hello I am normal.”'},                                // 9
    {name:'Gloves On',      power:0,  quip:'Tactically fearless fingers.'},                            //10
    {name:'Hide in Plain Sight', power:13, quip:'You become a bench.'},                                //11
    {name:'Investigate Suspicious Rock', power:9, quip:'The rock claims innocence.'},                  //12
    {name:'Jam Logbook Closed', power:7, quip:'Micro dominance asserted.'},                            //13
    {name:'Lift a Rock',    power:15, quip:'You upend geology like a raccoon god.'},                   //14
    {name:'Look Underbench',power:8,  quip:'Classic geocacher posture.'},                              //15
    {name:'Phone-a-Friend', power:18, quip:'Your friend solves it instantly. Rude.'},                  //16
    {name:'Parkour!!!',     power:12, quip:'Unnecessary flips encouraged.'},                           //17
    {name:'Squint Extra Hard', power:10, quip:'Pixels enhance. Brain… not so much.'},                  //18
    {name:'Stealth Mode',   power:14, quip:'You are the shrubbery.'},                                  //19
    {name:'Tree Climb',     power:16, quip:'Defy gravity & squirrels.'},                               //20
    {name:'Tweezers Technique', power:22, quip:'Micros tremble.'},                                     //21
    {name:'Trackable Toss', power:22, quip:'A shiny travel bug arcs through destiny.'},                //22
  ];

  // Explicit unlock order (by move id). Start with only the FIRST entry as the initial move.
  const UNLOCK_ORDER = [4, 0, 2, 8, 21, 11, 18, 1, 20, 14, 16, 5, 22, 7, 6, 12, 15, 17, 3, 9, 10, 13];
  //                Start: CheckHint(4), then Avoid(0), Bushwhack(2), Flashlight(8), Tweezers(21),
  //                Hide(11), Squint(18), Apply Repellent(1), Tree Climb(20), Lift(14), Phone(16), Compass(5), etc.

  // Training enemies
  const TRAINING = [
    {name:'Mosquito Swarm',      hp:16, power:4},
    {name:'Suspicious Neighbor', hp:20, power:5},
    {name:'Unscramble Beast',    hp:18, power:5},
    {name:'Camouflaged Bolt',    hp:18, power:6}
  ];

  // ===== Fixed 10-Boss Final Challenge =====
  // Each boss specifies the ONE correct move name required.
  const BOSS_ORDER = [
    {name:'Dog Walker',            hp:22, power:10, correct:'Avoid Muggles'},
    {name:'Poison Ivy Spirit',     hp:24, power:10, correct:'Apply Insect Repellent'},
    {name:'Mall Cop',              hp:24, power:10, correct:'Hide in Plain Sight'},
    {name:'Unscramble Wraith',     hp:24, power:10, correct:'Squint Extra Hard'},
    {name:'Giant Tree Cache',      hp:28, power:11, correct:'Tree Climb'},
    {name:'Nano Cache Gnome',      hp:26, power:11, correct:'Tweezers Technique'},
    {name:'Dark Tunnel Gremlin',   hp:26, power:11, correct:'Flashlight'},
    {name:'Mystery Cache Golem',   hp:28, power:12, correct:'Phone-a-Friend'},
    {name:'Rockslide Sentinel',    hp:28, power:12, correct:'Lift a Rock'},
    {name:'Compass Poltergeist',   hp:26, power:12, correct:'Compass Consult'},
  ];
  // IMPORTANT: In this build, the correct move IDs for encryption are:
  // [0, 1, 11, 18, 20, 21, 8, 16, 14, 5]
  // Encrypt your coordinates with exactly: "0-1-11-18-20-21-8-16-14-5"

  // ========= Encrypted Coordinates (client-only) =========
  // Replace these using your encryptor with the above sequence. Placeholder = harmless text.
  const CIPHERTEXT_B64 = "4XvzyzBRlonE7nRjCpnTzsbGoJXkE0iPafGoYCr3ax3DZdSfHfOF";
  const IV_B64 = "fgCljugwvNjFhqv/";

  // ========= State =========
  const state = {
    player:{
      maxhp:30,
      hp:30,
      lvl:1,
      exp:0,
      moves:[ UNLOCK_ORDER[0] ],  // start with ONE move (Check the Hint)
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
    log('🏆 FINAL CHALLENGE COMPLETE — prize awarded.');    
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
    el.hint.textContent = state.isBoss ? 'Choose wisely… a wrong move = DNF crater.' : '';
    el.moves.innerHTML = '';
    state.player.moves.forEach((moveId)=>{
      const m = MOVES[moveId];
      const b = document.createElement('button');
      b.textContent = `${m.name} (${m.power})`;
      b.addEventListener('click',()=> performMove(moveId));
      el.moves.appendChild(b);
    });
    log(`You engage ${state.enemy.name}! ${state.isBoss? 'The boss run is unforgiving.' : 'Training time.'}`);
  }

  function endBattle(win){
    // Always leave battle view
    showExplore();

    if (win) {
      log(`${state.enemy.name} defeated!`);
      if (state.isBoss) {
        if (state.bossQueue.length) {
          el.story.textContent = `Boss stage cleared! ${state.bossQueue.length} to go. Breathe, goblin hero.`;
          el.btnCont?.classList.remove('hidden');
        } else {
          // Completed all 10 bosses — attempt to reveal prize
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
      el.story.textContent='💀 You DNFed spectacularly, then recovered at base camp. Train up and try again.';
    }

    paintStats();
  }

  // ========= Combat =========
  function performMove(moveId){
    const m = MOVES[moveId];
    const base = m.power;
    let mult = 1;
    if(state.isBoss){ mult = (m.name===state.enemy.correct) ? 2 : 1; }

    log(`You use ${m.name}! ${m.quip}`);
    if(state.isBoss){
      if(mult>1) log(`It’s SUPER effective! (x${mult})`);
      else log(`It’s not the right technique… (x${mult})`);
    }

    const dmg = Math.max(1, Math.floor(base*mult));
    state.enemy.hp -= dmg; if(state.enemy.hp<0) state.enemy.hp=0; el.eHP.textContent = state.enemy.hp;
    log(`→ ${state.enemy.name} takes ${dmg} damage. (HP now ${state.enemy.hp})`);

    if(state.enemy.hp<=0){
      // If boss and correct move, record the move id used to defeat
      if(state.isBoss && m.name===state.enemy.correct){
        state.bossHistory.push(moveId);
      }
      endBattle(true); return;
    }

    // Enemy counterattack
    if(state.isBoss && m.name!==state.enemy.correct){
      state.player.hp = 0;
      log(`${state.enemy.name} unleashes a catastrophic counter! You are obliterated into a DNF crater.`);
    } else {
      state.player.hp -= state.enemy.power;
      log(`${state.enemy.name} hits back for ${state.enemy.power}! (Your HP ${Math.max(0,state.player.hp)}/${state.player.maxhp})`);
    }

    if(state.player.hp<=0){ endBattle(false); return; }
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
        log(`LEVEL UP! Now LV ${state.player.lvl}. You radiate goblin energy.`);
      }
    }
    paintStats();
  }

  // ========= Encounters =========
  function startTraining(){
    if (state.bossActive) { log("You're in the Final Challenge — no training until you finish or DNF."); return; }
    state.enemy = {...TRAINING[rand(TRAINING.length)]};
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
        "Check these:",
        "• Did you encrypt with the exact sequence: 0-1-11-18-20-21-8-16-14-5 ?",
        "• Is IV a 12‑byte AES‑GCM IV from the tool?",
        "• Did each boss’s FINAL hit use the correct move?"
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
      log('You yeet yourself away. Coward.');
      endBattle(false);
    });
    // Dev: unlock all moves instantly for testing
    el.btnDevUnlock?.addEventListener('click', ()=>{
      state.player.moves = MOVES.map((_,i)=>i);
      state.player.learnPtr = UNLOCK_ORDER.length;
      log('🛠 Dev: All moves unlocked for testing.');
      if(state.mode==='battle') beginBattle(); // refresh buttons
      else paintStats();
    });
  }

  // ========= Init =========
  function init(){ paintStats(); log('Welcome, chaotic cacher! Beat the 10-boss gauntlet to unlock the final coordinates.'); }
  init(); wire();
})();