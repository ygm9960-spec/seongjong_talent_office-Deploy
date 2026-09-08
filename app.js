(() => {
  'use strict';

  const CONFIG = {
    GAME_SECONDS: 300,
    TOTAL_APPLICANTS: 20,
    DIFFICULTY_COUNTS: { '초급': 6, '중급': 8, '고급': 6 },
    RANKING_STORAGE_KEY: 'seongjongRankingsV10_20',
    SETTINGS_STORAGE_KEY: 'seongjongSettingsV1',
    RECOVERY_STORAGE_KEY: 'seongjongRecoveryV1',
    COLLECTION_STORAGE_KEY: 'seongjongSeenProfilesV1',
    DIFFICULTY_BONUS: { '초급': 0, '중급': 35, '고급': 75 },
    WRONG_SCORE_PENALTY: 140,
    WRONG_TIME_PENALTY: 8,
    RUSH_SECONDS: 1.2,
    RUSH_SCORE_PENALTY: 80,
    QUICK_NO_REVIEW_SECONDS: 2.0,
    QUICK_NO_REVIEW_PENALTY: 40,
    SPECIAL_REVIEW_COUNT_NORMAL: 3,
    SPECIAL_REVIEW_BONUS_DEFAULT: 110,
    SUDDEN_EVENT_MIN: 2,
    SUDDEN_EVENT_MAX: 3,
    SUDDEN_EVENT_MIN_GAP: 3,
    FINAL_APPLICANT_BONUS: 120,
    SHARED_RANKING_LIMIT: 20
  };

  const SHARED_API_URL = String(window.APP_CONFIG?.GOOGLE_SHEETS_WEB_APP_URL || '').trim();

  const PORTRAITS = Array.from({ length: 48 }, (_, i) => `assets/portraits/portrait_${String(i + 1).padStart(3, '0')}.webp`);
  const NAMES = ['김도현','이윤호','박세진','최문수','정태윤','윤지호','한유진','서인호','송민재','강도윤','조현우','임성준','오진혁','신우찬','권민석','황준서','안지후','유건우','배준혁','남도현','문지환','백현수','류지훈','심우진','고태민','장민규','허진우','노승현','전도윤','차민호','민재윤','원지후','공현석','양태호','염준혁','진성우','도민재','표지환','방윤재','성도현','마진호','길현우','연민석','위태윤','탁준서','라성진','피윤호','제갈민수','김영수','이경호','박준형','최재원','정성민','윤상호','한재욱','서동진','송기현','강민규','조승현','임태훈'];

  const DOC_BG = {
    '가계기록': 'assets/docs/family.webp',
    '추천서': 'assets/docs/recommend.webp',
    '추천서A': 'assets/docs/recommend.webp',
    '추천서B': 'assets/docs/recommend.webp',
    '추천서 묶음': 'assets/docs/recommend.webp',
    '상소문': 'assets/docs/appeal.webp',
    '재산장부': 'assets/docs/property.webp'
  };


  const DOC_LABELS = {
    '가계기록': '집안 기록',
    '추천서': '추천서',
    '추천서A': '추천서 A',
    '추천서B': '추천서 B',
    '추천서 묶음': '추천서 여러 장',
    '상소문': '왕에게 올린 글',
    '재산장부': '재산 기록',
    '정책문답': '정치 생각',
    '이력서': '벼슬·활동 기록',
    '과거답안': '과거시험 답안',
    '혼인관계표': '혼인 관계',
    '교유기록': '친분·교류 기록',
    '감찰기록': '관리 조사 기록',
    '평판서': '주변 평가',
    '희망관직서': '원하는 관직',
    '학맥기록': '누구에게 배웠는지',
    '학업기록': '공부 기록',
    '편지': '개인 편지',
    '가족서신': '가족 편지',
    '자기소개서': '자기소개',
    '특이사항': '⚠ 특이사항'
  };

  function easyDocTitle(type) { return DOC_LABELS[type] || type; }

  // v9 이미지 통합 자산. 모든 경로는 정적 호스팅에서 그대로 동작한다.
  const OPTIONAL_ASSET_SLOTS = {
    prologue_01: 'assets/prologue/01.webp',
    prologue_02: 'assets/prologue/02.webp',
    prologue_03: 'assets/prologue/03.webp',
    prologue_04: 'assets/prologue/04.webp',
    prologue_05: 'assets/prologue/05.webp',
    special_conflict: 'assets/special/conflict.webp',
    special_missing: 'assets/special/missing.webp',
    special_urgent: 'assets/special/urgent.webp',
    special_seal: 'assets/special/seal.webp',
    special_birthplace: 'assets/special/conflict.webp',
    special_propertyjump: 'assets/special/propertyjump.webp',
    special_joint: 'assets/special/joint.webp',
    special_torn: 'assets/special/torn.webp',
    combo_03: 'assets/combo/03.webp',
    combo_05: 'assets/combo/05.webp',
    combo_08: 'assets/combo/08.webp',
    combo_10: 'assets/combo/10.webp',
    combo_12: 'assets/combo/12.webp',
    combo_end: 'assets/combo/end.webp',
    final_directive: 'assets/banners/final_directive.webp',
    game_end: 'assets/results/hall_of_fame.webp'
  };

  const SPECIAL_DOC_ART = {
    conflict: 'assets/special/conflict.webp',
    missing: 'assets/special/missing.webp',
    urgent: 'assets/special/urgent.webp',
    seal: 'assets/special/seal.webp',
    birthplace: 'assets/special/conflict.webp',
    propertyjump: 'assets/special/propertyjump.webp',
    joint: 'assets/special/joint.webp',
    torn: 'assets/special/torn.webp'
  };

  const PHASE_BANNER_ART = {
    1: 'assets/banners/phase1.webp',
    2: 'assets/banners/phase2.webp',
    3: 'assets/banners/phase3.webp'
  };

  const COMBO_ART = {
    3: 'assets/combo/03.webp', 5: 'assets/combo/05.webp', 8: 'assets/combo/08.webp',
    10: 'assets/combo/10.webp', 12: 'assets/combo/12.webp', end: 'assets/combo/end.webp'
  };

  const GRADE_ART = {
    '견습 심사관': 'assets/results/grade_apprentice.webp',
    '정식 심사관': 'assets/results/grade_regular.webp',
    '능숙한 심사관': 'assets/results/grade_skilled.webp',
    '성종의 신임': 'assets/results/grade_trusted.webp',
    '수석 심사관': 'assets/results/grade_master.webp'
  };

  // v10.6 배경음악: 사용자가 제작한 7개 테마를 화면/상황에 맞춰 자동 전환한다.
  const BGM_TRACKS = {
    main: 'assets/audio/bgm/01_main_theme.mp3',
    prologue: 'assets/audio/bgm/02_prologue_theme.mp3',
    review: 'assets/audio/bgm/03_review_theme.mp3',
    special: 'assets/audio/bgm/04_special_review_theme.mp3',
    sudden: 'assets/audio/bgm/05_sudden_event_theme.mp3',
    final: 'assets/audio/bgm/06_final_review_theme.mp3',
    result: 'assets/audio/bgm/07_result_theme.mp3'
  };
  const BGM_BASE_VOLUME = 0.16;

  const PROLOGUE = [
    ['계유정난', '수양대군은 <strong>계유정난</strong>으로 권력을 잡았습니다. 이때 수양대군을 도운 신하들은 큰 공을 인정받았습니다.'],
    ['훈구의 성장', '왕을 도운 <strong>공신</strong>과 그 후손들은 높은 벼슬과 많은 토지를 얻으며 힘이 커졌습니다. 이렇게 성장한 정치 세력이 <strong>훈구</strong>입니다.'],
    ['강해진 훈구', '시간이 흐르며 훈구는 중앙 정치에서 매우 큰 힘을 가지게 되었습니다. 성종은 이들을 견제할 새로운 관리가 필요했습니다.'],
    ['성종의 고민', '성종은 훈구의 힘을 견제하면서도 나라의 일을 잘 맡을 새로운 인재를 찾았습니다.'],
    ['새로운 인재를 찾아라', '성종은 지방에서 성리학을 공부하고 원칙과 바른말을 중요하게 여기던 <strong>사림</strong>을 관리로 뽑으려 합니다. 이제 그대가 지원자들을 살펴보십시오.']
  ];

  const TUTORIAL_DOCS = [
    {
      type: '가계기록',
      text: '집안의 뿌리가 되는 지역은 경상도.\n아버지는 지방에서 학생들을 가르쳤으며, 공신 집안이라는 기록은 없음.'
    },
    {
      type: '추천서',
      text: '추천한 사람: 영남의 유교 선비 김○○\n“성리학을 잘 알고, 힘이 센 관리도 두려워하지 않으며 바른말을 중요하게 여긴다.”'
    }
  ];

  const REACTIONS = {
    good: ['“판결을 받들겠습니다.”', '조용히 고개를 숙인다.', '서류를 거두며 물러날 채비를 한다.', '“살펴 주셔서 감사합니다.”'],
    bad: ['잠시 굳은 표정으로 판결을 바라본다.', '“……알겠습니다.”', '서류를 바라보다 천천히 고개를 숙인다.', '말없이 도장을 한 번 더 바라본다.']
  };

  const PERSONALITIES = [
    { id:'calm', name:'차분형', arrivals:['“천천히 살펴보셔도 됩니다.”','“서류는 모두 갖추었습니다.”','말없이 두 손을 모으고 기다린다.'], good:['조용히 고개를 숙인다.','“판결을 받들겠습니다.”'], bad:['잠시 생각한 뒤 말없이 물러난다.','“……알겠습니다.”'] },
    { id:'nervous', name:'긴장형', arrivals:['“저, 서류에 빠진 것은 없겠지요?”','주위를 살피며 긴장한 표정을 짓는다.','“부디 꼼꼼히 살펴주십시오.”'], good:['안도한 듯 짧게 숨을 내쉰다.','“감사합니다.”'], bad:['당황한 표정으로 인장을 바라본다.','“제가 놓친 것이 있었습니까…….”'] },
    { id:'proud', name:'거만형', arrivals:['“제 기록이면 충분할 것입니다.”','“오래 기다리게 하지는 마시오.”','자신만만한 표정으로 서류를 내민다.'], good:['당연하다는 듯 고개를 끄덕인다.','“예상한 판결이군.”'], bad:['표정이 굳으며 도장을 다시 바라본다.','“흠…… 그리 판단했소?”'] },
    { id:'scholar', name:'학자형', arrivals:['“기록과 뜻을 함께 살펴주십시오.”','“가문보다 제가 지닌 뜻을 보아주십시오.”','“글에 적힌 바가 제 생각과 다르지 않습니다.”'], good:['“살펴주신 뜻을 잊지 않겠습니다.”','서류를 가지런히 정리해 품에 넣는다.'], bad:['한동안 침묵한 뒤 고개를 숙인다.','“판정의 뜻을 새기겠습니다.”'] },
    { id:'boastful', name:'허세형', arrivals:['“조정에서도 제 이름을 모르는 이는 드뭅니다.”','“추천서를 보면 바로 아실 겁니다.”','괜히 목소리를 크게 내며 인사를 한다.'], good:['크게 고개를 끄덕이며 물러난다.','“역시 알아보시는군요.”'], bad:['헛기침을 하며 시선을 피한다.','“추천서를 다시 보신 것이 맞소?”'] },
    { id:'easygoing', name:'능청형', arrivals:['“심사관 나리도 오늘 바쁘시겠군요.”','“서류가 많아도 너무 겁먹진 마십시오.”','살짝 웃으며 서류를 책상 위에 올린다.'], good:['“좋습니다. 수고 많으십니다.”','가볍게 웃으며 물러난다.'], bad:['“이런, 생각과는 다르군요.”','어깨를 으쓱하고 서류를 챙긴다.'] }
  ];

  const TODAY_RULES = [
    {
      id:'hungu_watch',
      text:'훈구 쪽 높은 관리들이 심사 결과를 지켜보고 있습니다.',
      effect:'청탁·가문 압력·대신 의견 충돌 같은 정치적 압력 사건이 더 자주 등장합니다.',
      suddenCount:3,
      suddenPreferred:['hungu_request','family_pressure','ministers_conflict'],
      suddenPreferredSlots:2
    },
    {
      id:'king_scrutiny',
      text:'성종이 새로운 인재를 평소보다 더 꼼꼼히 살피라고 명했습니다.',
      effect:'특수심사가 1명 더 등장하고, 특수심사 성공 보너스가 +40점 높아집니다.',
      specialExtra:1,
      specialBonusExtra:40
    },
    {
      id:'crowded_office',
      text:'추천서가 많이 들어와 심사소가 크게 붐빕니다.',
      effect:'긴급 심사와 심사 재촉 돌발이벤트가 이번 판에 반드시 등장합니다.',
      specialGuaranteed:['urgent'],
      suddenGuaranteed:['hurry_official'],
      suddenCount:3
    },
    {
      id:'samsa_focus',
      text:'삼사의 비판·견제 활동이 조정에서 크게 주목받고 있습니다.',
      effect:'사림 지원자의 삼사·직언·견제 관련 핵심 서류가 평소보다 더 자주 보입니다.',
      samsaClueBoost:true
    },
    {
      id:'merit_pressure',
      text:'공신 집안에서 특별히 봐 달라는 부탁이 많다는 소문이 퍼졌습니다.',
      effect:'훈구 청탁 사건이 반드시 1회 등장하고, 추천서 관련 특수심사가 더 자주 나옵니다.',
      suddenGuaranteed:['hungu_request'],
      specialPreferred:['joint','conflict','seal'],
      specialPreferredSlots:2,
      suddenCount:3
    }
  ];

  function getTodayRule(id) {
    return TODAY_RULES.find((r) => r.id === id) || TODAY_RULES[0];
  }

  function inferTodayRuleFromFlavor(flavor) {
    const clean = String(flavor || '').replace(/^오늘의 조정:\s*/, '');
    return TODAY_RULES.find((r) => clean.includes(r.text.slice(0, 12))) || TODAY_RULES[0];
  }

  function chooseEventTypes(allEvents, count, guaranteedIds, preferredIds, preferredSlots, rng) {
    const byId = new Map(allEvents.map((e) => [e.id, e]));
    const chosen = [];
    const add = (e) => { if (e && !chosen.some((x) => x.id === e.id) && chosen.length < count) chosen.push(e); };
    (guaranteedIds || []).forEach((id) => add(byId.get(id)));
    const preferred = shuffleWith((preferredIds || []).map((id) => byId.get(id)).filter(Boolean), rng);
    const slots = Math.max(0, Math.min(preferredSlots || 0, count - chosen.length));
    for (let i = 0; i < slots; i++) add(preferred[i]);
    shuffleWith(allEvents, rng).forEach(add);
    return chosen.slice(0, count);
  }

  const COMBO_MESSAGES = {
    3:'연속 판정!',
    5:'날카로운 심사!',
    8:'조정을 꿰뚫는 눈!',
    10:'성종의 신임!',
    12:'대궐의 전설!'
  };

  const $ = (q) => document.querySelector(q);
  const $$ = (q) => [...document.querySelectorAll(q)];

  const state = {
    nickname: '심사관',
    prologueIndex: 0,
    roster: [],
    idx: 0,
    score: 0,
    correct: 0,
    wrong: 0,
    combo: 0,
    maxCombo: 0,
    seconds: CONFIG.GAME_SECONDS,
    timer: null,
    selectedStamp: null,
    locked: false,
    applicantStartedAt: 0,
    reviewed: 0,
    totalDecisionTime: 0,
    warned30: false,
    warned10: false,
    assetsPreloaded: false,
    tutorialStep: 0,
    tutorialActiveDoc: 0,
    tutorialStamp: null,
    tutorialComplete: false,
    decisions: [],
    currentSeed: 0,
    nextSeed: Math.floor(100000 + Math.random() * 900000),
    rng: Math.random,
    currentDocInteractions: 0,
    roundFlavor: '',
    todayRule: 'hungu_watch',
    deadlineAt: 0,
    gameActive: false,
    recoveredRun: false,
    testMode: false,
    testSettings: { count: 20, seconds: 300, difficulty: '혼합', seed: '' },
    settings: { sound: true, vibration: true },
    phasePause: false,
    currentPhase: 1,
    finalDirectiveShown: false,
    runRankEligible: true,
    advanceTimer: null,
    advanceWatchdog: null,
    decisionSerial: 0,
    feedbackPaused: false,
    feedbackPauseTimer: null,
    feedbackPauseStarted: 0,
    suddenEventPauseStarted: 0,
    sharedRankings: [],
    sharedRankingLoaded: false
  };

  let audioCtx = null;
  let bgmAudio = null;
  let bgmCurrentKey = '';
  let bgmUnlocked = false;
  let bgmFadeTimer = null;
  const bgmPositions = {};
  const bgmPreloaders = [];

  function shuffle(a) {
    a = [...a];
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }

  function mulberry32(seed) {
    let t = seed >>> 0;
    return function() {
      t += 0x6D2B79F5;
      let r = Math.imul(t ^ t >>> 15, 1 | t);
      r ^= r + Math.imul(r ^ r >>> 7, 61 | r);
      return ((r ^ r >>> 14) >>> 0) / 4294967296;
    };
  }

  function shuffleWith(a, rng = Math.random) {
    a = [...a];
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(rng() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }

  function pickWith(a, rng = Math.random) {
    return a[Math.floor(rng() * a.length)];
  }

  function randomSeed() {
    return Math.floor(100000 + Math.random() * 900000);
  }

  function comboBonusFor(combo) {
    if (combo <= 1) return 0;
    if (combo === 2) return 25;
    if (combo === 3) return 60;
    if (combo === 4) return 100;
    if (combo === 5) return 150;
    if (combo === 6) return 210;
    if (combo === 7) return 280;
    if (combo === 8) return 360;
    if (combo === 9) return 450;
    return 550 + Math.min(300, (combo - 10) * 50);
  }


  function nextComboMilestone(combo) {
    const milestones = [3, 5, 8, 10];
    const next = milestones.find((m) => m > combo);
    if (!next) return { next: null, text: '최고 단계 유지 중' };
    return { next, text: `${next}콤보까지 ${next - combo}회` };
  }

  function phaseForIndex(index) {
    if (index < 7) return 1;
    if (index < 14) return 2;
    return 3;
  }

  function showPhaseOverlay(completedPhase, callback) {
    const overlay = $('#phase-overlay');
    if (!overlay) { callback?.(); return; }
    const reviewed = state.reviewed;
    const accuracy = reviewed ? Math.round(state.correct / reviewed * 100) : 0;
    $('#phase-kicker').textContent = `${completedPhase}차 심사 완료`;
    $('#phase-title').textContent = completedPhase === 1 ? '난도가 올라갑니다.' : '최종 심사로 들어갑니다.';
    $('#phase-summary').textContent = `현재 ${state.combo}콤보 · 정확도 ${accuracy}% · 점수 ${state.score.toLocaleString()}점`;
    const phaseArt = $('#phase-overlay-art');
    const nextPhase = Math.min(3, completedPhase + 1);
    if (phaseArt) { phaseArt.src = PHASE_BANNER_ART[nextPhase]; phaseArt.alt = `${nextPhase}차 심사`; }
    overlay.classList.add('show');
    overlay.setAttribute('aria-hidden', 'false');
    vibrate('phase');
    state.phasePause = true;
    const pauseStarted = Date.now();
    setTimeout(() => {
      if (state.gameActive) state.deadlineAt += Date.now() - pauseStarted;
      overlay.classList.remove('show');
      overlay.setAttribute('aria-hidden', 'true');
      state.phasePause = false;
      callback?.();
    }, 1150);
  }

  function showFinalDirective(callback) {
    const overlay = $('#final-directive');
    if (!overlay) { callback?.(); return; }
    overlay.classList.add('show');
    overlay.setAttribute('aria-hidden', 'false');
    state.finalDirectiveShown = true;
    state.phasePause = true;
    const pauseStarted = Date.now();
    playBgmKey('final', { restart: true });
    beep('warning');
    vibrate('final');
    setTimeout(() => {
      if (state.gameActive) state.deadlineAt += Date.now() - pauseStarted;
      overlay.classList.remove('show');
      overlay.setAttribute('aria-hidden', 'true');
      state.phasePause = false;
      callback?.();
    }, 1250);
  }

  const TEXT_VARIANTS = [
    ['가승과 호적을 대조한 결과,', ['가계 문서와 호적을 맞추어 보니,', '가승과 호적을 함께 살핀 결과,']],
    ['전답·가옥·노비 장부를 대조함.', ['재산 장부의 전답·가옥·노비 항목을 살펴봄.', '전답과 가옥, 노비 관련 장부를 서로 맞추어 봄.']],
    ['추천서 요지:', ['천거문에 이르기를:', '추천 내용:']],
    ['정난공신 가문의 후손', ['선대가 정난의 공으로 공신에 책록된 집안의 후손', '가문에 정난공신 녹권이 전해지는 후손']],
    ['공신 출신 대신의 강한 추천', ['공신 계열 대신이 적극 천거함', '공신 가문 출신 대신이 강하게 천거함']],
    ['지방 사족', ['향촌의 사족', '지방에서 기반을 둔 사족']],
    ['성리학에 밝고', ['성리학의 이치에 밝고', '성리학 공부가 깊고']],
    ['직언을 중히 여긴다', ['바른말을 아끼지 않는다', '임금에게도 바른말을 해야 한다고 여긴다']],
    ['삼사의 언론 기능을 긍정', ['사헌부·사간원·홍문관의 비판 기능을 중요하게 여김', '삼사가 권력을 견제해야 한다는 의견을 보임']],
    ['삼사 근무를 희망', ['사헌부·사간원·홍문관 가운데 한 곳에서 일하고자 함', '언론과 감찰을 맡는 삼사에서 근무하기를 바람']],
    ['권세가의 전횡을 경계', ['힘 있는 가문이 제멋대로 권세를 쓰는 일을 경계', '권세 있는 자의 사사로운 횡포를 막아야 한다고 주장']],
    ['공신 특권', ['공을 세운 가문에 주어진 특별 대우', '공신 가문의 기존 특혜']],
    ['중앙 관료 가문', ['한양에서 대대로 벼슬한 집안', '조정의 중앙 관직을 이어온 가문']],
    ['향촌에서 후학을 가르침', ['지방에서 젊은 선비들을 가르침', '향촌에 머물며 제자를 길러냄']],
    ['김종직 계열 학문 교류', ['김종직의 학문을 따르는 선비들과 교류', '김종직 계통의 유학자들과 공부하고 서신을 주고받음']],
    ['대규모 토지 보유', ['많은 전답을 소유', '상당한 규모의 토지를 가진 것으로 확인됨']],
    ['한양 중앙 관료 가문', ['한양에서 벼슬을 이어온 집안', '조정 중앙의 관료 집안']]
  ];

  function varyText(text, rng) {
    let out = text;
    for (const [target, variants] of TEXT_VARIANTS) {
      if (out.includes(target) && rng() < 0.7) {
        out = out.replace(target, pickWith(variants, rng));
      }
    }
    return simplifyHistoricalText(out);
  }

  const SPECIAL_EVENTS = [
    { id:'conflict', title:'엇갈린 추천', desc:'추천 내용이 서로 다릅니다. 여러 서류를 직접 대조해야 합니다.', docType:'추천서 묶음', reward:120, rule:'서로 다른 서류 3종 이상을 확인한 뒤 판정하면 특수 보너스 +120점.', docText:'추천서 두 장의 평가가 서로 엇갈린다. 어느 한쪽의 말만 믿지 말고 다른 기록과 함께 살펴야 한다.' },
    { id:'missing', title:'가계 기록 누락', desc:'집안 기록 일부가 빠져 있습니다. 남은 서류를 모두 살펴야 합니다.', docType:'가계기록', reward:120, rule:'남아 있는 서류를 모두 확인한 뒤 판정하면 특수 보너스 +120점.', docText:'집안 기록의 일부가 비어 있어 출신을 단정하기 어렵다. 남은 기록을 모두 살펴야 한다.' },
    { id:'urgent', title:'긴급 심사', desc:'이 지원자는 별도의 긴급 심사 대상입니다.', docType:'특이사항', reward:140, timeLimit:18, rule:'서류 2종 이상을 확인하고 18초 안에 정확히 판정하면 특수 보너스 +140점.', docText:'긴급 심사 대상. 서두르되 한 가지 단서만 보고 판정하지 말 것.' },
    { id:'seal', title:'수상한 인장', desc:'추천서의 인장이 평소와 다릅니다. 추천서만 믿어서는 안 됩니다.', docType:'추천서', reward:110, rule:'추천서 외의 다른 종류 서류를 확인하면 특수 보너스 +110점.', docText:'추천서의 인장이 평소 쓰이던 것과 조금 다르다. 다른 종류의 서류를 함께 확인해야 한다.' },
    { id:'birthplace', title:'엇갈린 출신 기록', desc:'집안의 뿌리와 활동 지역이 서로 다르게 적혀 있습니다.', docType:'가계기록', reward:110, rule:'집안 기록과 다른 서류를 함께 확인하면 특수 보너스 +110점.', docText:'한 문서에는 집안의 뿌리가 되는 지역이, 다른 문서에는 최근 활동한 지역이 적혀 있다. 두 기록을 구분해 살펴야 한다.' },
    { id:'propertyjump', title:'갑자기 늘어난 재산', desc:'최근 재산이 크게 늘었습니다. 재산만 보고 정치 성향을 정하면 안 됩니다.', docType:'재산장부', reward:120, rule:'재산 기록과 다른 핵심 서류를 함께 확인하면 특수 보너스 +120점.', docText:'최근 상속과 혼인 뒤 재산이 크게 늘었다. 재산 규모만으로 판단하지 말고 다른 기록을 함께 살펴야 한다.' },
    { id:'joint', title:'공동 추천', desc:'여러 사람이 함께 추천했습니다. 추천 수가 많다고 정답은 아닙니다.', docType:'추천서 묶음', reward:110, rule:'추천서와 추천서가 아닌 서류를 함께 확인하면 특수 보너스 +110점.', docText:'여러 사람이 함께 추천했다. 추천인의 수보다 지원자의 실제 생각과 활동 기록을 함께 살펴야 한다.' },
    { id:'torn', title:'찢어진 상소문', desc:'왕에게 올린 글 일부가 찢어져 읽을 수 없습니다.', docType:'상소문', reward:130, rule:'찢어진 글 외에 다른 서류 2종 이상을 확인하면 특수 보너스 +130점.', docText:'왕에게 올린 글의 가운데 부분이 찢어져 있다. …일부 내용은 읽을 수 없음… 남은 다른 기록과 함께 판단해야 한다.' }
  ];

  const SUDDEN_EVENTS = [
    { id:'hungu_request', category:'정치적 압력', sigil:'청탁', title:'훈구 대신의 청탁', desc:'서류 사이에서 접힌 쪽지가 떨어졌습니다. “우리와 가까운 집안이니 잘 살펴주게.”', options:['청탁을 치운다','쪽지를 읽어 둔다'] },
    { id:'sarim_protest', category:'정치적 압력', sigil:'항의', title:'사림 유생의 항의', desc:'문밖에서 유생들이 외칩니다. “집안만 보지 말고 그 사람의 뜻과 행동을 보아주십시오!”', options:['서류만 보고 판단한다','항의문을 곁에 둔다'] },
    { id:'family_pressure', category:'정치적 압력', sigil:'압력', title:'가문의 압력', desc:'힘이 센 집안의 사람이 찾아와 낮게 말합니다. “이번 판단은 기억해 두겠소.”', options:['압력을 무시한다','빨리 처리해 본다'] },
    { id:'ministers_conflict', category:'정치적 압력', sigil:'논쟁', title:'두 대신의 의견 충돌', desc:'한 대신은 훈구라 하고, 다른 대신은 사림이라 합니다. 둘 다 자기 말이 맞다고 주장합니다.', options:['훈구 대신의 말을 따른다','사림 대신의 말을 따른다','서류로 직접 판단한다'] },
    { id:'king_retrial', category:'왕의 개입', sigil:'재심', title:'성종의 재심 명령', desc:'성종이 이전 판결 하나를 다시 살펴보라고 명했습니다.', options:['훈구로 고친다','사림으로 고친다','판결을 유지한다'], dynamic:true },
    { id:'king_question', category:'왕의 개입', sigil:'질문', title:'왕의 특별 질문', desc:'성종이 묻습니다. “삼사가 맡아야 할 중요한 일은 무엇인가?”', options:['관리의 잘못을 비판하고 견제한다','세금을 거두고 창고를 관리한다','군사를 훈련하고 성을 지킨다'] },
    { id:'king_praise', category:'왕의 개입', sigil:'칭찬', title:'성종의 중간 평가', desc:'성종이 지금까지의 심사 기록을 잠시 살펴봅니다.', options:['평가를 확인한다'] },
    { id:'hurry_official', category:'심사 방해', sigil:'재촉', title:'심사를 재촉하는 관리', desc:'밖에 기다리는 사람이 많다며 관리가 빨리 처리해 달라고 재촉합니다.', options:['원칙대로 심사한다','빠른 심사에 도전한다'] },
    { id:'anonymous_note', category:'심사 방해', sigil:'쪽지', title:'정체불명의 추천 쪽지', desc:'이름도 도장도 없는 쪽지가 끼어 있습니다. “이 사람은 분명 ○○ 쪽일 것이오.”', options:['쪽지를 버린다','내용을 읽어 본다'] },
    { id:'document_swap', category:'심사 방해', sigil:'혼선', title:'서류 바꿔치기 시도', desc:'접수 번호가 다른 서류 한 장이 섞이려는 것을 발견했습니다.', options:['접수 번호를 대조한다','일단 그대로 심사한다'] },
    { id:'inspector', category:'조사·감찰', sigil:'감찰', title:'감찰관의 불시 점검', desc:'감찰관이 나타나 묻습니다. “한 장만 보고 성급하게 판정한 것은 아니겠지요?”', options:['여러 서류를 확인하겠다','그대로 판정한다'] },
    { id:'hidden_record', category:'조사·감찰', sigil:'발견', title:'숨겨진 추가 기록 발견', desc:'서류함 뒤에서 이 지원자와 관련된 추가 기록 한 장이 발견되었습니다.', options:['추가 기록을 확인한다','현재 서류만으로 계속한다'] }
  ];

  function pickSpacedIndexes(candidates, count, minGap, rng) {
    const shuffled = shuffleWith(candidates, rng);
    const chosen = [];
    for (const idx of shuffled) {
      if (chosen.every((c) => Math.abs(c - idx) >= minGap)) chosen.push(idx);
      if (chosen.length >= count) break;
    }
    if (chosen.length < count && minGap > 1) {
      return pickSpacedIndexes(candidates, count, minGap - 1, rng);
    }
    return chosen.slice(0, count).sort((a,b) => a-b);
  }

  function makeSpecialDoc(evt, rng) {
    return {
      documentType: evt.docType,
      visibility: '특수 상황',
      clueKinds: ['함정'],
      sourceClues: ['특수 심사 상황'],
      gameText: simplifyHistoricalText(evt.docText),
      _rotate: `${(rng() * 2 - 1).toFixed(2)}deg`,
      _eventId: evt.id
    };
  }

  function applySpecialReviewToApplicant(applicant, evt, rng) {
    applicant.specialEvent = { ...evt };
    let docs = applicant.playDocs.map((d) => ({ ...d }));
    const eventDoc = makeSpecialDoc(evt, rng);

    if (evt.id === 'missing') {
      const removable = docs.findIndex((d) => !d.clueKinds?.includes('핵심'));
      if (removable >= 0) docs.splice(removable, 1);
      docs.push(eventDoc);
    } else if (['conflict','birthplace','propertyjump','joint'].includes(evt.id)) {
      docs.push(eventDoc);
    } else {
      const replaceIdx = docs.findIndex((d) => !d.clueKinds?.includes('핵심'));
      if (replaceIdx >= 0) docs.splice(replaceIdx, 1, eventDoc);
      else docs.push(eventDoc);
    }

    applicant.playDocs = docs.slice(0, 5).map((d, k) => ({ ...d, _label:k + 1 }));
    applicant.activeDoc = Math.min(applicant.activeDoc || 0, applicant.playDocs.length - 1);
  }

  function markDocViewed(index) {
    const a = state.roster[state.idx];
    if (!a) return;
    if (!Array.isArray(a._viewedDocs)) a._viewedDocs = [];
    if (!a._viewedDocs.includes(index)) a._viewedDocs.push(index);
  }

  function updateSpecialReviewProgress() {
    const a = state.roster[state.idx];
    const ruleEl = $('#special-event-rule');
    if (!a?.specialEvent || !ruleEl) return;
    const viewed = new Set(a._viewedDocs || []);
    const total = a.playDocs?.length || 0;
    const base = simplifyHistoricalText(a.specialEvent.rule || '');
    ruleEl.textContent = `도전 · ${base} · 확인 ${viewed.size}/${total}`;
  }

  function viewedDocTypes(a) {
    const viewed = new Set(a?._viewedDocs || []);
    return (a?.playDocs || []).filter((_,i) => viewed.has(i)).map((d) => d.documentType);
  }

  function evaluateSpecialReview(a, elapsed) {
    const evt = a?.specialEvent;
    if (!evt) return { passed:true, bonus:0, label:'' };
    const viewed = new Set(a._viewedDocs || [a.activeDoc]);
    const types = viewedDocTypes(a);
    const eventViewed = (a.playDocs || []).some((d,i) => d._eventId === evt.id && viewed.has(i));
    let passed = false;

    switch (evt.id) {
      case 'conflict': passed = viewed.size >= Math.min(3, a.playDocs.length); break;
      case 'missing': passed = viewed.size >= a.playDocs.length; break;
      case 'urgent': passed = viewed.size >= Math.min(2, a.playDocs.length) && elapsed <= (evt.timeLimit || 18); break;
      case 'seal': passed = types.some((t) => !String(t).startsWith('추천서') && t !== '특이사항'); break;
      case 'birthplace': passed = types.includes('가계기록') && viewed.size >= 2; break;
      case 'propertyjump': passed = eventViewed && viewed.size >= 2; break;
      case 'joint': passed = eventViewed && types.some((t) => !String(t).startsWith('추천서')); break;
      case 'torn': passed = eventViewed && viewed.size >= Math.min(3, a.playDocs.length); break;
      default: passed = viewed.size >= 2;
    }
    return { passed, bonus: passed ? (evt.reward || CONFIG.SPECIAL_REVIEW_BONUS_DEFAULT) : 0, label: passed ? `특수심사 성공 +${evt.reward || CONFIG.SPECIAL_REVIEW_BONUS_DEFAULT}` : '특수심사 조건 미달' };
  }

  function getPreviousWrongDecision() {
    for (let i = state.decisions.length - 1; i >= 0; i--) {
      if (!state.decisions[i].correct && !state.decisions[i].retrialCorrected) return state.decisions[i];
    }
    return null;
  }

  function suddenOptionsFor(evt) {
    if (evt.id !== 'king_retrial') return evt.options || ['계속 심사'];
    const prev = getPreviousWrongDecision();
    if (!prev) return ['이전 판결에 문제가 없음을 확인한다'];
    return ['훈구로 고친다','사림으로 고친다','판결을 유지한다'];
  }

  function showSuddenEvent(a) {
    const evt = a?.suddenEvent;
    const overlay = $('#sudden-event-overlay');
    if (!evt || !overlay || a.suddenEventResolved || a.suddenEventTriggered) return;
    a.suddenEventTriggered = true;
    state.phasePause = true;
    state.suddenEventPauseStarted = Date.now();
    overlay.dataset.category = evt.category || '';
    $('#sudden-event-sigil').textContent = evt.sigil || '!';
    $('#sudden-event-title').textContent = evt.title;
    $('#sudden-event-desc').textContent = evt.desc;
    const extra = $('#sudden-event-extra');
    extra.hidden = true;
    extra.textContent = '';

    if (evt.id === 'king_retrial') {
      const prev = getPreviousWrongDecision();
      if (prev) {
        extra.hidden = false;
        extra.textContent = `재심 대상: ${prev.displayName} · 당시 판정 ${prev.chosen}`;
      } else {
        extra.hidden = false;
        extra.textContent = '지금까지 바로잡을 오판이 없습니다.';
      }
    }

    const options = suddenOptionsFor(evt);
    const actions = $('#sudden-event-actions');
    actions.className = `sudden-event-actions ${options.length === 2 ? 'two' : options.length >= 3 ? 'three' : ''}`;
    actions.innerHTML = options.map((label, i) => `<button class="sudden-event-btn ${i === 0 ? 'primary' : ''}" data-sudden-choice="${i}" type="button">${escapeHtml(label)}</button>`).join('');
    actions.querySelectorAll('[data-sudden-choice]').forEach((btn) => btn.addEventListener('click', () => resolveSuddenEvent(Number(btn.dataset.suddenChoice))));
    overlay.classList.add('show');
    overlay.setAttribute('aria-hidden','false');
    playBgmKey('sudden', { restart: true });
    beep('warning');
    vibrate('special');
    saveRecoveryState();
  }

  function maybeTriggerSuddenEvent() {
    const a = state.roster[state.idx];
    if (!a?.suddenEvent || a.suddenEventResolved || a.suddenEventTriggered || state.locked || state.phasePause) return;
    const threshold = a.suddenEvent.triggerAfter || 1;
    if (state.currentDocInteractions >= threshold) showSuddenEvent(a);
  }

  function addSuddenScore(points, message) {
    if (!points) return;
    state.score = Math.max(0, state.score + points);
    updateHud();
    if (message) showToast(`${message} +${points}점`, 'good');
  }

  function addHiddenRecord(a) {
    if (!a?.documents?.length) return false;
    const usedTexts = new Set((a.playDocs || []).map((d) => d.gameText));
    const pool = a.documents.filter((d) => !usedTexts.has(d.gameText));
    const preferred = pool.filter((d) => d.clueKinds?.includes('핵심'));
    const chosen = pickWith(preferred.length ? preferred : pool, state.rng || Math.random);
    if (!chosen) return false;
    const doc = { ...chosen, gameText:varyText(chosen.gameText, state.rng || Math.random), _rotate:'0deg', _label:a.playDocs.length + 1, _hiddenRecord:true };
    a.playDocs.push(doc);
    a.playDocs = a.playDocs.slice(0,5).map((d,i) => ({...d,_label:i+1}));
    updateSpecialReviewProgress();
    renderDocPile();
    updateDocNavigator();
    return true;
  }

  function resolveSuddenEvent(choice) {
    const a = state.roster[state.idx];
    const evt = a?.suddenEvent;
    const overlay = $('#sudden-event-overlay');
    if (!evt || !overlay || a.suddenEventResolved) return;

    let message = '';
    let immediateScore = 0;
    let extraTime = 0;

    switch (evt.id) {
      case 'hungu_request':
        if (choice === 0) { immediateScore = 40; message = '청탁을 치웠습니다'; }
        else { a.externalNote = '청탁 쪽지에는 “훈구 쪽 인물”이라고 적혀 있지만 믿을 수 없는 주장입니다.'; message = '출처가 불분명한 청탁 쪽지를 남겨 두었습니다'; }
        break;
      case 'sarim_protest':
        if (choice === 0) { immediateScore = 35; message = '외부 압력 없이 심사합니다'; }
        else { a.externalNote = '사림 유생들은 “집안보다 뜻과 행동을 보라”고 주장합니다.'; message = '항의문은 참고만 합니다'; }
        break;
      case 'family_pressure':
        if (choice === 0) { immediateScore = 40; message = '가문의 압력을 무시했습니다'; }
        else { a.eventRushChallenge = { limit:10, bonus:90, startedAt:Date.now() }; message = '10초 빠른 심사 도전: 성공 시 +90점'; }
        break;
      case 'ministers_conflict':
        if (choice === 2) { immediateScore = 50; message = '두 대신 대신 서류를 믿기로 했습니다'; }
        else { a.externalNote = choice === 0 ? '훈구 대신의 주장: “훈구일 것이오.”' : '사림 대신의 주장: “사림일 것이오.”'; message = '대신의 의견은 정답을 보장하지 않습니다'; }
        break;
      case 'king_retrial': {
        const prev = getPreviousWrongDecision();
        if (!prev) { immediateScore = 40; message = '이전 판결에 바로잡을 오판이 없습니다'; break; }
        const chosenFaction = choice === 0 ? '훈구' : choice === 1 ? '사림' : null;
        if (chosenFaction && chosenFaction === prev.faction) {
          prev.correct = true;
          prev.chosen = chosenFaction;
          prev.retrialCorrected = true;
          state.wrong = Math.max(0, state.wrong - 1);
          state.correct += 1;
          immediateScore = CONFIG.WRONG_SCORE_PENALTY + 60;
          extraTime = CONFIG.WRONG_TIME_PENALTY;
          message = `재심 성공 · ${prev.displayName} 판결 수정`;
        } else if (chosenFaction) message = '재심에서도 판결을 바로잡지 못했습니다';
        else message = '기존 판결을 유지했습니다';
        break;
      }
      case 'king_question':
        if (choice === 0) { immediateScore = 70; message = '정답! 삼사는 관리의 잘못을 비판하고 견제합니다'; }
        else message = '삼사의 핵심 역할은 비판과 견제입니다';
        break;
      case 'king_praise': {
        const acc = state.reviewed ? Math.round(state.correct / state.reviewed * 100) : 100;
        immediateScore = acc >= 80 ? 70 : 20;
        message = acc >= 80 ? '성종의 칭찬을 받았습니다' : '성종이 더 신중한 심사를 당부했습니다';
        break;
      }
      case 'hurry_official':
        if (choice === 0) { immediateScore = 30; message = '재촉보다 원칙을 택했습니다'; }
        else { a.eventRushChallenge = { limit:8, bonus:100, startedAt:Date.now() }; message = '8초 빠른 심사 도전: 성공 시 +100점'; }
        break;
      case 'anonymous_note':
        if (choice === 0) { immediateScore = 35; message = '출처 없는 쪽지를 버렸습니다'; }
        else {
          const hinted = (state.rng || Math.random)() < .5 ? a.faction : (a.faction === '훈구' ? '사림' : '훈구');
          a.externalNote = `익명 쪽지: “이 사람은 ${hinted}일 것이다.” (정확한지는 알 수 없음)`;
          message = `쪽지에는 “${hinted}”라고 적혀 있습니다 · 신뢰도 불명`;
        }
        break;
      case 'document_swap':
        if (choice === 0) { immediateScore = 60; message = '접수 번호를 대조해 바꿔치기를 막았습니다'; }
        else {
          const fake = { documentType:'추천서', visibility:'돌발 사건', clueKinds:['함정'], sourceClues:['서류 혼선'], gameText:'접수 번호가 다른 추천서가 섞여 있다. 현재 지원자의 기록인지 확인되지 않는다.', _rotate:'1.4deg', _label:a.playDocs.length+1, _foreignDoc:true };
          a.playDocs.push(fake); a.playDocs = a.playDocs.slice(0,5).map((d,i)=>({...d,_label:i+1}));
          renderDocPile(); updateDocNavigator();
          message = '번호가 다른 서류가 한 장 섞였습니다';
        }
        break;
      case 'inspector':
        if (choice === 0) { a.inspectorRequirement = Math.min(3, a.playDocs.length); message = `서류 ${a.inspectorRequirement}종 확인 시 +80점`; }
        else message = '감찰 보너스 없이 그대로 심사합니다';
        break;
      case 'hidden_record':
        if (choice === 0) { message = addHiddenRecord(a) ? '추가 기록 한 장이 서류 더미에 들어왔습니다' : '새로 확인할 기록이 없었습니다'; }
        else { immediateScore = 20; message = '현재 기록만으로 심사를 계속합니다'; }
        break;
    }

    a.suddenEventResolved = true;
    a.suddenChoice = choice;
    a.suddenResult = message;
    if (immediateScore) addSuddenScore(immediateScore, message);
    else if (message) showToast(message, 'warn');
    if (extraTime) state.deadlineAt += extraTime * 1000;

    const pausedFor = state.suddenEventPauseStarted ? Date.now() - state.suddenEventPauseStarted : 0;
    if (state.gameActive) state.deadlineAt += pausedFor;
    state.suddenEventPauseStarted = 0;
    state.phasePause = false;
    overlay.classList.remove('show');
    overlay.setAttribute('aria-hidden','true');
    syncBgmForScreen('game');
    updateHud();
    saveRecoveryState();
  }

  function evaluateSuddenJudgmentBonus(a, elapsed) {
    let bonus = 0;
    const notes = [];
    if (a?.eventRushChallenge) {
      const secs = (Date.now() - a.eventRushChallenge.startedAt) / 1000;
      if (secs <= a.eventRushChallenge.limit) { bonus += a.eventRushChallenge.bonus; notes.push(`빠른 심사 +${a.eventRushChallenge.bonus}`); }
      else notes.push('빠른 심사 시간 초과');
    }
    if (a?.inspectorRequirement) {
      const viewed = new Set(a._viewedDocs || []);
      if (viewed.size >= a.inspectorRequirement) { bonus += 80; notes.push('감찰 점검 +80'); }
      else notes.push('감찰 점검 조건 미달');
    }
    return { bonus, notes };
  }

  function fmtTime(s) {
    s = Math.max(0, Math.floor(s));
    return `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;
  }

  function escapeHtml(s) {
    return String(s).replace(/[&<>'"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[c]));
  }


  // 중학생이 빠르게 읽을 수 있도록 어려운 역사 용어와 문장을 쉬운 표현으로 바꾼다.
  // 별도의 용어 도움말 박스는 사용하지 않고, 필요한 뜻은 본문 안에서 바로 풀어 쓴다.
  const EASY_TEXT_REPLACEMENTS = [
    ['신이 살피건대,', '제가 살펴본 바로는,'],
    ['바라건대 전하께서는 이를 헤아려 주시옵소서.', '전하께서 이 일을 살펴주시기를 바랍니다.'],
    ['이에 조정에서 써 주시기를 청합니다.', '관리로 뽑아 주시기를 요청합니다.'],
    ['공신 대우 유지', '공신을 특별히 대우하는 방식을 유지'],
    ['특권 옹호', '특별한 혜택을 지지'],
    ['권세 견제', '힘 있는 관리도 견제하려는 태도'],
    ['네트워크', '인맥'],
    ['사림 패턴', '사림 쪽 특징'],
    ['집안 계통', '집안 배경'],
    ['정책 입장', '정치에 대한 생각'],
    ['일관되게', '여러 기록에서 계속'],
    ['문하와 학문적 교류', '제자들과 함께 공부하고 생각을 나눔'],
    ['학문적 교류', '함께 공부하고 생각을 나눔'],
    ['친족망', '친척 관계'],
    ['권세보다', '권력보다'],
    ['권세 비판', '힘 있는 관리의 잘못을 비판'],
    ['유력 훈구 대신의 문객으로 활동으로 기록됨', '유력한 훈구 쪽 높은 관리의 집에서 일을 도우며 지냄.'],
    ['한양 체류 기간이 김', '오랫동안 한양에 머묾'],
    ['장인의 추천서으로 기록됨', '장인의 추천서를 받음'],
    ['재산 증가으로 기록됨', '혼인 뒤 재산이 늘어남'],
    ['가계 서류 일부 누락으로 기록됨', '집안 기록 일부가 빠져 있음'],
    ['사림계 인물과 실제 교유 기록 없음으로 기록됨', '사림 쪽 인물과 실제로 교류한 기록은 없음'],
    ['대토지 보유', '많은 토지를 보유'],
    ['재산 다소 많음', '재산이 다소 많음'],
    ['백성 구휼에 힘썼다는 기록', '어려운 백성을 도왔다는 기록'],
    ['공신 녹권과', '공신임을 증명하는 문서와'],
    ['가계 문서에 공신 녹권 기록', '집안 기록에 공신임을 증명하는 문서가 남아 있음'],
    ['공신 녹권 기록', '공신임을 증명하는 문서 기록'],
    ['지방 사족 가문', '지방에서 영향력이 큰 양반 집안'],
    ['권세가 집안', '힘이 센 고위 관리 집안'],
    ['권세가의 전횡을 비판', '힘이 센 고위 관리 집안이 제멋대로 권력을 쓰는 것을 비판'],
    ['학맥과', '스승과 제자로 이어진 학문 관계와'],
    ['한양 유학 경험', '한양에서 공부한 경험'],
    ['왕에게 간언한 상소', '왕에게 바른말을 올린 글'],
    ['여러 문서에서 교차 확인된다', '여러 문서에서 함께 확인된다'],
    ['권세가의 인사 청탁을 비판', '힘이 센 관리가 벼슬자리를 부탁하는 일을 비판'],
    ['추천서의 진위보다', '추천서가 진짜인지 가짜인지보다'],
    ['공개적으로 지적으로 기록됨', '공개적으로 지적한 기록이 있음'],
    ['문객으로 활동', '가까이 지내며 일을 도와줌'],
    ['가승과 호적을 대조한 결과,', '집안 족보와 가족 기록을 함께 살펴보니,'],
    ['가승과 호적을 함께 살핀 결과,', '집안 족보와 가족 기록을 함께 살펴보니,'],
    ['가계 문서와 호적을 맞추어 보니,', '집안 족보와 가족 기록을 함께 살펴보니,'],
    ['전답·가옥·노비 장부를 대조함.', '논밭·집·노비 재산 장부를 서로 맞춰 봄.'],
    ['재산 장부의 전답·가옥·노비 항목을 살펴봄.', '논밭·집·노비 재산 장부를 살펴봄.'],
    ['전답과 가옥, 노비 관련 장부를 서로 맞추어 봄.', '논밭·집·노비 재산 장부를 서로 맞춰 봄.'],
    ['추천서 요지:', '추천서 내용:'],
    ['천거문에 이르기를:', '추천서 내용:'],
    ['천거인:', '추천한 사람:'],
    ['책문 답안 발췌:', '과거시험 논술 답안:'],
    ['관직 및 활동 이력:', '벼슬과 활동 기록:'],
    ['혼인·인척 관계를 조사함.', '혼인으로 맺어진 친척 관계를 살펴봄.'],
    ['감찰관 확인 사항:', '관리의 잘못을 살피는 기록:'],
    ['서신과 왕래 기록을 대조함.', '편지와 만남 기록을 함께 살펴봄.'],
    ['수학·문답·서신 기록을 조사함.', '누구에게 공부했는지와 편지 기록을 살펴봄.'],
    ['지원자가 적어 낸 희망 관직 및 이유:', '지원자가 원하는 관직:'],
    ['향리·동료들의 평을 모음.', '고향 사람과 동료들의 평가:'],
    ['지원자 자필 소개:', '지원자가 직접 쓴 소개:'],
    ['가족 간 서신 발췌:', '가족끼리 주고받은 편지:'],
    ['사적인 편지 발췌:', '개인적으로 주고받은 편지:'],
    ['상소 발췌:', '왕에게 올린 글의 일부:'],
    ['별기에는', '덧붙인 기록에는'],
    ['가승', '집안 족보'],
    ['전답', '논밭'],
    ['구휼', '어려운 백성을 도움'],
    ['천거', '추천'],
    ['책록', '공신으로 이름을 올림'],
    ['공신 녹권', '공신임을 증명하는 문서'],
    ['녹권', '공신임을 증명하는 문서'],
    ['권세가', '힘이 센 고위 관리 집안'],
    ['지방 사족', '지방에서 영향력이 큰 양반 집안'],
    ['향촌의 사족', '지방에서 영향력이 큰 양반 집안'],
    ['사족 가문', '지방에서 영향력이 큰 양반 집안'],
    ['사족 출신', '지방에서 영향력이 큰 양반 집안 출신'],
    ['사족으로', '지방에서 영향력이 큰 양반 집안으로'],
    ['사족', '지방에서 영향력이 큰 양반 집안'],
    ['향촌', '지방 마을'],
    ['후학', '젊은 제자'],
    ['학맥', '스승과 제자로 이어진 학문 관계'],
    ['교유', '교류'],
    ['간언을', '왕에게 바른말을'],
    ['간언한', '왕에게 바른말한'],
    ['간언의', '왕에게 바른말하는 일의'],
    ['간언', '왕에게 바른말하는 일'],
    ['직언을', '윗사람에게도 바른말을'],
    ['직언하는', '윗사람에게도 바른말하는'],
    ['직언한', '윗사람에게도 바른말한'],
    ['직언', '윗사람에게도 바른말하는 일'],
    ['전횡을', '제멋대로 권력을 쓰는 것을'],
    ['전횡', '제멋대로 권력을 쓰는 행동'],
    ['토지 겸병', '힘 있는 사람이 토지를 지나치게 차지하는 일'],
    ['언론 기능', '비판하고 견제하는 역할'],
    ['언론 활동', '비판하고 견제하는 활동'],
    ['성리학적 명분', '성리학의 원칙과 도리'],
    ['명분과 도덕적 기준', '유교의 원칙과 도리'],
    ['명분', '유교의 원칙과 도리'],
    ['문객', '가까이 지내며 일을 돕는 사람'],
    ['인척', '혼인으로 맺어진 친척'],
    ['중앙 요직', '중앙의 중요한 관직'],
    ['공신 중심 인사 질서', '공신 세력이 중심이 되는 관리 임명 방식'],
    ['공신 중심 질서', '공신 세력이 중심이 되는 정치 방식'],
    ['기존 질서', '기존 정치 방식'],
    ['정치적 연속성', '기존 정치 방식을 이어가는 것'],
    ['공신 우대', '공신을 특별히 대우'],
    ['공신 특권', '공신 집안에 주어진 특별한 혜택'],
    ['공신전', '공신에게 준 토지'],
    ['문과 급제', '과거시험 문과에 합격'],
    ['문과 성적', '과거시험 성적'],
    ['한양 유학', '한양에서 공부'],
    ['유학 경험', '공부한 경험'],
    ['유학자', '유교를 공부한 선비'],
    ['유생', '유교를 공부하는 선비'],
    ['수령', '지방 수령(고을 관리)'],
    ['탄핵', '관리의 잘못을 따져 책임을 묻는 일'],
    ['경전', '유교 책'],
    ['중앙 명문가', '한양에서 대대로 높은 벼슬을 한 집안'],
    ['중앙 명문 관료가', '한양에서 대대로 벼슬한 관리 집안'],
    ['관료가', '관리 집안'],
    ['공신 가계', '공신 집안'],
    ['가계', '집안 계통'],
    ['본관', '집안의 뿌리가 되는 지역'],
    ['인사 청탁', '벼슬자리를 부탁하는 사적인 요청'],
    ['사적 청탁', '개인적인 부탁'],
    ['청탁', '개인적인 부탁'],
    ['감찰', '관리의 잘못을 살피는 일'],
    ['관리 한 명을 비판', '관리 한 사람의 잘못을 지적'],
    ['공적인 원칙을 사적 공로보다 앞세움', '개인의 공로보다 나라의 원칙을 먼저 생각함'],
    ['급격한 권력 재편', '권력 구도를 갑자기 크게 바꾸는 것'],
    ['기존 관행의 점진적 유지', '기존 방식을 조금씩 고쳐 가며 유지'],
    ['정치 개입', '정치에 지나치게 관여하는 것'],
    ['실무 연속성', '기존 행정 방식을 이어가는 것'],
    ['정난공신', '계유정난 때 공을 세운 공신'],
    ['좌리공신 계열 인사', '공신 계열 관리'],
    ['공신 출신 대신', '공신 집안 출신의 높은 관리'],
    ['훈구 대신', '훈구 쪽 높은 관리'],
    ['중앙 대신', '중앙의 높은 관리'],
    ['고위 관료', '높은 관리'],
    ['중앙 관료', '중앙 관리'],
    ['관료', '관리'],
    ['사림계', '사림 쪽'],
    ['훈구 관료', '훈구 쪽 관리'],
    ['간언관', '왕에게 바른말하는 태도'],
    ['언론관', '비판·견제에 대한 생각'],
    ['정치적 기반', '어떤 정치 세력과 가까운지'],
    ['중앙 공신 연대', '중앙의 공신 세력과 가까운 관계'],
    ['선정 여부', '백성을 잘 다스렸는지'],
    ['세력 구분', '훈구·사림 구분'],
    ['교차 확인', '여러 문서에서 함께 확인'],
    ['진위', '진짜인지 가짜인지'],
    ['과도한 확대', '지나치게 커지는 것'],
    ['점진적', '조금씩']
  ];

  function simplifyHistoricalText(text) {
    let out = String(text || '');
    for (const [from, to] of EASY_TEXT_REPLACEMENTS) out = out.split(from).join(to);
    // 자동 생성 문장에서 자주 생기는 딱딱한 표현도 부드럽게 바꾼다.
    out = out
      .replace(/으로 기록되어 있음/g, '')
      .replace(/로 기록되어 있음/g, '')
      .replace(/으로 기록됨/g, '')
      .replace(/로 기록됨/g, '')
      .replace(/으로 기록된/g, '')
      .replace(/로 기록된/g, '')
      .replace(/\s+\./g, '.')
      .replace(/\.\./g, '.')
      .replace(/\s{2,}/g, ' ')
      .replace(/\n\s+/g, '\n');
    return out;
  }

  function showScreen(id) {
    $$('.screen').forEach((s) => s.classList.remove('active'));
    $(`#screen-${id}`).classList.add('active');
    syncBgmForScreen(id);
  }


  function applyOptionalArt(el, slotKey) {
    if (!el) return;
    el.dataset.slot = slotKey;
    const src = OPTIONAL_ASSET_SLOTS[slotKey];
    el.classList.remove('has-optional-art');
    el.style.removeProperty('--optional-art');
    if (!src) return;
    const probe = new Image();
    probe.onload = () => {
      el.style.setProperty('--optional-art', `url('${src}')`);
      el.classList.add('has-optional-art');
    };
    probe.onerror = () => {};
    probe.src = src;
  }

  function vibrate(kind = 'tap') {
    if (!state.settings.vibration || !navigator.vibrate) return false;
    const patterns = {
      tap: [12],
      stampGood: [34],
      stampBad: [24, 28, 24],
      special: [28, 42, 28],
      phase: [36, 45, 36],
      final: [62, 50, 62],
      milestone: [20, 30, 20],
      warning: [28, 35, 28]
    };
    try { return navigator.vibrate(patterns[kind] || patterns.tap); }
    catch { return false; }
  }

  function ensureAudio() {
    if (!audioCtx) {
      const Ctx = window.AudioContext || window.webkitAudioContext;
      if (Ctx) audioCtx = new Ctx();
    }
    if (audioCtx && audioCtx.state === 'suspended') audioCtx.resume().catch(() => {});
  }

  function ensureBgmAudio() {
    if (bgmAudio) return bgmAudio;
    bgmAudio = new Audio();
    bgmAudio.preload = 'auto';
    bgmAudio.loop = true;
    bgmAudio.volume = 0;
    bgmAudio.playsInline = true;
    return bgmAudio;
  }

  function preloadBgmTracks() {
    if (bgmPreloaders.length) return;
    Object.values(BGM_TRACKS).forEach((src) => {
      const a = new Audio();
      a.preload = 'auto';
      a.src = src;
      a.load();
      bgmPreloaders.push(a);
    });
  }

  function activeScreenId() {
    const active = document.querySelector('.screen.active');
    return active?.id?.replace(/^screen-/, '') || 'main';
  }

  function desiredBgmKey(screenId = activeScreenId()) {
    if (screenId === 'main') return 'main';
    if (screenId === 'prologue') return 'prologue';
    if (screenId === 'tutorial' || screenId === 'loading') return 'review';
    if (screenId === 'result') return 'result';
    if (screenId === 'game') {
      const a = state.roster[state.idx];
      if ($('#sudden-event-overlay')?.classList.contains('show')) return 'sudden';
      if (a?.isFinalImportant) return 'final';
      if (a?.specialEvent) return 'special';
      return 'review';
    }
    return bgmCurrentKey || 'main';
  }

  function clearBgmFade() {
    if (bgmFadeTimer) clearInterval(bgmFadeTimer);
    bgmFadeTimer = null;
  }

  function fadeBgmTo(target, duration = 180, onDone) {
    const audio = ensureBgmAudio();
    clearBgmFade();
    const start = audio.volume;
    const delta = target - start;
    if (duration <= 0 || Math.abs(delta) < 0.005) {
      audio.volume = Math.max(0, Math.min(1, target));
      onDone?.();
      return;
    }
    const started = performance.now();
    bgmFadeTimer = setInterval(() => {
      const p = Math.min(1, (performance.now() - started) / duration);
      audio.volume = Math.max(0, Math.min(1, start + delta * p));
      if (p >= 1) {
        clearBgmFade();
        onDone?.();
      }
    }, 30);
  }

  function playBgmKey(key, { restart = false, immediate = false } = {}) {
    const src = BGM_TRACKS[key];
    if (!src) return;
    const audio = ensureBgmAudio();
    const previousKey = audio.dataset.key || bgmCurrentKey;
    bgmCurrentKey = key;

    if (!state.settings.sound || !bgmUnlocked) {
      if (audio.src && !audio.paused) audio.pause();
      return;
    }

    const absoluteSrc = new URL(src, location.href).href;
    const sameTrack = audio.src === absoluteSrc;
    if (sameTrack) {
      if (restart) {
        try { audio.currentTime = 0; } catch {}
      }
      audio.play().then(() => fadeBgmTo(BGM_BASE_VOLUME, immediate ? 0 : 150)).catch(() => {});
      return;
    }

    if (audio.src && !audio.paused && previousKey) {
      if (Number.isFinite(audio.currentTime)) bgmPositions[previousKey] = audio.currentTime;
    }

    const swap = () => {
      audio.pause();
      audio.src = src;
      audio.dataset.key = key;
      audio.loop = true;
      audio.preload = 'auto';
      audio.volume = 0;
      audio.load();
      const shouldRestart = restart || ['special','sudden','final','result'].includes(key);
      if (!shouldRestart && Number.isFinite(bgmPositions[key])) {
        try { audio.currentTime = bgmPositions[key]; } catch {}
      }
      audio.play()
        .then(() => fadeBgmTo(BGM_BASE_VOLUME, immediate ? 0 : 220))
        .catch(() => {});
    };

    if (immediate || audio.paused || audio.volume <= 0.01) swap();
    else fadeBgmTo(0, 160, swap);
  }

  function syncBgmForScreen(screenId = activeScreenId(), options = {}) {
    playBgmKey(desiredBgmKey(screenId), options);
  }

  function unlockBgm() {
    ensureAudio();
    bgmUnlocked = true;
    syncBgmForScreen(activeScreenId(), { immediate: true });
    setTimeout(preloadBgmTracks, 1200);
  }

  function pauseBgm() {
    clearBgmFade();
    if (!bgmAudio) return;
    const key = bgmAudio.dataset.key || bgmCurrentKey;
    if (key && Number.isFinite(bgmAudio.currentTime)) bgmPositions[key] = bgmAudio.currentTime;
    bgmAudio.pause();
  }

  function beep(type = 'tap') {
    if (!state.settings.sound || !audioCtx) return;
    const now = audioCtx.currentTime;
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.connect(gain); gain.connect(audioCtx.destination);

    const end = (duration) => {
      gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);
      osc.start(now); osc.stop(now + duration + 0.01);
    };

    if (type === 'tap') {
      osc.type = 'square'; osc.frequency.value = 340; gain.gain.value = 0.018; end(0.045); return;
    }
    if (type === 'good') {
      osc.type = 'square'; osc.frequency.setValueAtTime(390, now); osc.frequency.exponentialRampToValueAtTime(690, now + 0.1); gain.gain.value = 0.025; end(0.12); return;
    }
    if (type === 'bad') {
      osc.type = 'sawtooth'; osc.frequency.setValueAtTime(185, now); osc.frequency.exponentialRampToValueAtTime(115, now + 0.12); gain.gain.value = 0.028; end(0.14); return;
    }
    if (type === 'warning') {
      osc.type = 'triangle'; osc.frequency.value = 520; gain.gain.value = 0.018; end(0.07); return;
    }
    if (type === 'stamp') {
      osc.type = 'triangle'; osc.frequency.value = 135; gain.gain.value = 0.05; end(0.075);
      const osc2 = audioCtx.createOscillator();
      const gain2 = audioCtx.createGain();
      osc2.connect(gain2); gain2.connect(audioCtx.destination);
      osc2.type = 'square'; osc2.frequency.value = 82;
      gain2.gain.setValueAtTime(0.035, now + 0.025);
      gain2.gain.exponentialRampToValueAtTime(0.0001, now + 0.105);
      osc2.start(now + 0.025); osc2.stop(now + 0.11);
    }
  }

  function getRankings() {
    try { return JSON.parse(localStorage.getItem(CONFIG.RANKING_STORAGE_KEY) || '[]'); }
    catch { return []; }
  }

  function saveRanking(entry) {
    const list = getRankings();
    list.push(entry);
    list.sort((a, b) => b.score - a.score || b.accuracy - a.accuracy || b.remaining - a.remaining || a.date.localeCompare(b.date));
    const top = list.slice(0, CONFIG.SHARED_RANKING_LIMIT);
    localStorage.setItem(CONFIG.RANKING_STORAGE_KEY, JSON.stringify(top));
    return top;
  }

  function renderRanking(el, list = getRankings()) {
    el.innerHTML = '';
    if (!list.length) {
      el.innerHTML = '<li class="empty">아직 기록이 없습니다.<br>첫 번째 심사관이 되어보세요.</li>';
      return;
    }
    list.forEach((r) => {
      const li = document.createElement('li');
      const accuracyText = Number.isFinite(Number(r.accuracy)) ? `${Number(r.accuracy)}% · 최대 ${Number(r.combo || 0)}콤보` : '';
      li.innerHTML = `<span><span>${escapeHtml(r.name)}</span>${accuracyText ? `<small class="rank-sub">${escapeHtml(accuracyText)}</small>` : ''}</span><span class="rank-score">${Number(r.score || 0).toLocaleString()}점</span>`;
      el.appendChild(li);
    });
  }


  function sharedApiConfigured() {
    return /^https:\/\/script\.google\.com\/macros\/s\/.+\/exec(?:\?.*)?$/.test(SHARED_API_URL);
  }

  function setLeaderboardStatus(text, type = '') {
    const el = $('#leaderboard-status');
    if (!el) return;
    el.textContent = text;
    el.className = `leaderboard-status ${type}`.trim();
  }

  function setRankingRefreshLoading(loading) {
    ['#btn-refresh-ranking', '#btn-result-refresh-ranking'].forEach((sel) => {
      const btn = $(sel);
      if (!btn) return;
      btn.classList.toggle('loading', loading);
      btn.disabled = loading;
      btn.textContent = loading ? '↻ 불러오는 중' : '↻ 새로고침';
    });
  }

  function jsonpRequest(params = {}, timeoutMs = 9000) {
    return new Promise((resolve, reject) => {
      if (!sharedApiConfigured()) { reject(new Error('not_configured')); return; }
      const callbackName = `__sjRank_${Date.now()}_${Math.floor(Math.random() * 100000)}`;
      const script = document.createElement('script');
      const cleanup = () => {
        clearTimeout(timer);
        script.remove();
        try { delete window[callbackName]; } catch { window[callbackName] = undefined; }
      };
      window[callbackName] = (data) => { cleanup(); resolve(data); };
      const qs = new URLSearchParams({ ...params, callback: callbackName, _: String(Date.now()) });
      script.src = `${SHARED_API_URL}${SHARED_API_URL.includes('?') ? '&' : '?'}${qs}`;
      script.onerror = () => { cleanup(); reject(new Error('network_error')); };
      document.head.appendChild(script);
      const timer = setTimeout(() => { cleanup(); reject(new Error('timeout')); }, timeoutMs);
    });
  }

  function renderSharedRankings(list) {
    state.sharedRankings = Array.isArray(list) ? list.slice(0, CONFIG.SHARED_RANKING_LIMIT) : [];
    state.sharedRankingLoaded = true;
    renderRanking($('#leaderboard-list'), state.sharedRankings);
    renderRanking($('#result-ranking-list'), state.sharedRankings);
  }

  async function refreshSharedRankings(showToastOnSuccess = false) {
    setRankingRefreshLoading(true);
    if (!sharedApiConfigured()) {
      const local = getRankings().slice(0, CONFIG.SHARED_RANKING_LIMIT);
      renderSharedRankings(local);
      setLeaderboardStatus('Google Sheets URL이 아직 설정되지 않아 이 기기의 임시 기록을 표시합니다.', 'offline');
      updateMainModeInfo();
      setRankingRefreshLoading(false);
      return local;
    }
    setLeaderboardStatus('공용 명예의 전당을 불러오는 중...', '');
    try {
      const data = await jsonpRequest({ action: 'leaderboard', limit: String(CONFIG.SHARED_RANKING_LIMIT) });
      if (!data || data.ok !== true || !Array.isArray(data.rankings)) throw new Error(data?.error || 'invalid_response');
      renderSharedRankings(data.rankings);
      setLeaderboardStatus(`Google Sheets 연결됨 · ${data.rankings.length}명 표시 · 학생별 최고점 1개`, 'ok');
      updateMainModeInfo();
      if (showToastOnSuccess) showToast('명예의 전당을 새로고침했습니다.', 'good');
      return data.rankings;
    } catch (err) {
      const local = getRankings().slice(0, CONFIG.SHARED_RANKING_LIMIT);
      renderSharedRankings(local);
      setLeaderboardStatus('연결에 실패해 이 기기의 임시 기록을 표시합니다. Apps Script 배포 상태를 확인하세요.', 'error');
      updateMainModeInfo();
      return local;
    } finally {
      setRankingRefreshLoading(false);
    }
  }

  function submitSharedRanking(entry, extra = {}) {
    if (!sharedApiConfigured()) return Promise.resolve(false);
    const form = new URLSearchParams({
      action: 'submit',
      name: entry.name,
      score: String(entry.score),
      accuracy: String(entry.accuracy),
      combo: String(entry.combo || 0),
      remaining: String(entry.remaining || 0),
      reviewed: String(entry.reviewed || 0),
      seed: String(entry.seed || ''),
      specialSuccess: String(extra.specialSuccess || 0),
      suddenEvents: String(extra.suddenEvents || 0)
    });
    return fetch(SHARED_API_URL, { method: 'POST', mode: 'no-cors', body: form })
      .then(() => true)
      .catch(() => false);
  }

  function updateResultSharedRankMessage(currentEntry) {
    const el = $('#result-rank-message');
    if (!el || !currentEntry || !state.runRankEligible || state.testMode) return;
    if (!sharedApiConfigured()) {
      el.textContent = 'Google Sheets가 아직 연결되지 않아 이 기기의 임시 순위를 표시합니다.';
      return;
    }
    const idx = state.sharedRankings.findIndex((r) => r.name === currentEntry.name);
    if (idx >= 0 && Number(state.sharedRankings[idx].score) === Number(currentEntry.score)) {
      el.textContent = `공용 명예의 전당 ${idx + 1}위! 학생별 최고 기록으로 반영되었습니다.`;
    } else if (idx >= 0) {
      el.textContent = `공용 명예의 전당에는 이전 최고 기록이 유지되고 있습니다. 현재 순위 ${idx + 1}위.`;
    } else {
      el.textContent = '기록은 Google Sheets에 저장되었습니다. TOP 20 진입에 다시 도전해보세요.';
    }
  }

  function getSeenProfiles() {
    try { return new Set(JSON.parse(localStorage.getItem(CONFIG.COLLECTION_STORAGE_KEY) || '[]')); }
    catch { return new Set(); }
  }

  function markProfileSeen(profileId) {
    if (!profileId) return;
    const seen = getSeenProfiles();
    seen.add(profileId);
    localStorage.setItem(CONFIG.COLLECTION_STORAGE_KEY, JSON.stringify([...seen]));
    updateCollectionProgress();
  }

  function updateCollectionProgress() {
    const seen = getSeenProfiles();
    const total = window.PROFILES?.length || 50;
    const text = `${seen.size} / ${total}`;
    const main = $('#main-collection-progress');
    const result = $('#result-collection');
    if (main) main.textContent = text;
    if (result) result.textContent = `누적 ${text}`;
  }


  function loadSettings() {
    try {
      const saved = JSON.parse(localStorage.getItem(CONFIG.SETTINGS_STORAGE_KEY) || '{}');
      state.settings.sound = saved.sound !== false;
      state.settings.vibration = saved.vibration !== false;
    } catch {}
    const sound = $('#setting-sound');
    const vibration = $('#setting-vibration');
    if (sound) sound.checked = state.settings.sound;
    if (vibration) vibration.checked = state.settings.vibration;
  }

  function saveSettings() {
    localStorage.setItem(CONFIG.SETTINGS_STORAGE_KEY, JSON.stringify(state.settings));
  }

  function openSettings() {
    loadSettings();
    const modal = $('#settings-modal');
    modal.classList.add('open');
    modal.setAttribute('aria-hidden', 'false');
    ensureAudio();
    beep('tap');
  }

  function closeSettings() {
    const modal = $('#settings-modal');
    modal.classList.remove('open');
    modal.setAttribute('aria-hidden', 'true');
  }

  function recoverySnapshot() {
    return {
      version: 1,
      savedAt: Date.now(),
      nickname: state.nickname,
      roster: state.roster,
      idx: state.idx,
      score: state.score,
      correct: state.correct,
      wrong: state.wrong,
      combo: state.combo,
      maxCombo: state.maxCombo,
      reviewed: state.reviewed,
      totalDecisionTime: state.totalDecisionTime,
      decisions: state.decisions,
      currentSeed: state.currentSeed,
      roundFlavor: state.roundFlavor,
      todayRule: state.todayRule,
      deadlineAt: state.deadlineAt,
      currentPhase: state.currentPhase
    };
  }

  function saveRecoveryState() {
    if (!state.gameActive || state.testMode) return;
    try { sessionStorage.setItem(CONFIG.RECOVERY_STORAGE_KEY, JSON.stringify(recoverySnapshot())); }
    catch {}
  }

  function clearRecoveryState() {
    try { sessionStorage.removeItem(CONFIG.RECOVERY_STORAGE_KEY); } catch {}
    const card = $('#recovery-card');
    if (card) card.hidden = true;
  }

  function getRecoveryState() {
    try {
      const raw = sessionStorage.getItem(CONFIG.RECOVERY_STORAGE_KEY);
      if (!raw) return null;
      const snap = JSON.parse(raw);
      if (!snap?.roster?.length || !snap.deadlineAt || snap.deadlineAt <= Date.now()) {
        clearRecoveryState();
        return null;
      }
      return snap;
    } catch {
      clearRecoveryState();
      return null;
    }
  }

  function checkRecoveryAvailability() {
    const snap = getRecoveryState();
    const card = $('#recovery-card');
    if (!card) return;
    card.hidden = !snap;
    if (snap) {
      const remaining = Math.max(0, Math.ceil((snap.deadlineAt - Date.now()) / 1000));
      $('#recovery-summary').textContent = `${snap.idx + 1}/${snap.roster.length}번째 지원자 · ${fmtTime(remaining)} 남음 · 복구 판은 순위 미반영`;
    }
  }

  function restoreGameFromRecovery() {
    const snap = getRecoveryState();
    if (!snap) { checkRecoveryAvailability(); return; }
    ensureAudio();
    clearAdvanceTimers();
    state.decisionSerial += 1;
    state.nickname = snap.nickname || '심사관';
    state.roster = snap.roster;
    state.idx = snap.idx || 0;
    const recoveryApplicant = state.roster[state.idx];
    if (recoveryApplicant?.suddenEvent && !recoveryApplicant.suddenEventResolved) recoveryApplicant.suddenEventTriggered = false;
    state.score = snap.score || 0;
    state.correct = snap.correct || 0;
    state.wrong = snap.wrong || 0;
    state.combo = snap.combo || 0;
    state.maxCombo = snap.maxCombo || 0;
    state.reviewed = snap.reviewed || 0;
    state.totalDecisionTime = snap.totalDecisionTime || 0;
    state.decisions = snap.decisions || [];
    state.currentSeed = snap.currentSeed || randomSeed();
    const recoveredRule = snap.todayRule ? getTodayRule(snap.todayRule) : inferTodayRuleFromFlavor(snap.roundFlavor);
    state.todayRule = recoveredRule.id;
    state.roundFlavor = recoveredRule.text;
    state.deadlineAt = snap.deadlineAt;
    state.seconds = Math.max(0, Math.ceil((state.deadlineAt - Date.now()) / 1000));
    state.currentPhase = snap.currentPhase || 1;
    state.selectedStamp = null;
    state.locked = false;
    state.warned30 = state.seconds <= 30;
    state.warned10 = state.seconds <= 10;
    state.gameActive = true;
    state.recoveredRun = true;
    state.runRankEligible = false;
    state.rng = Math.random;
    state.currentDocInteractions = 0;
    showScreen('game');
    setSelectedStampText();
    renderApplicant(true);
    clearInterval(state.timer);
    state.timer = setInterval(syncRoundTimer, 250);
    updateHud();
    saveRecoveryState();
  }

  function renderPrologue() {
    const [title, text] = PROLOGUE[state.prologueIndex];
    $('#prologue-card').innerHTML = `<div class="story-visual optional-art-slot" data-slot="prologue_0${state.prologueIndex + 1}"><span class="story-number">${state.prologueIndex + 1}</span></div><h2>${title}</h2><p>${text}</p>`;
    applyOptionalArt($('#prologue-card .story-visual'), `prologue_0${state.prologueIndex + 1}`);
    $('#prologue-dots').innerHTML = PROLOGUE.map((_, i) => `<i class="dot ${i === state.prologueIndex ? 'on' : ''}"></i>`).join('');
    $('#btn-prologue-next').textContent = state.prologueIndex === PROLOGUE.length - 1 ? '실전 연습' : '다음';
  }

  /* ---------- interactive tutorial ---------- */
  function resetTutorial() {
    state.tutorialStep = 0;
    state.tutorialActiveDoc = 0;
    state.tutorialStamp = null;
    state.tutorialComplete = false;
    $$('.tutorial-stamp').forEach((b) => b.classList.remove('selected'));
    renderTutorialPractice();
  }

  function setTutorialInstruction() {
    const label = $('#tutorial-step-label');
    const title = $('#tutorial-step-title');
    const text = $('#tutorial-step-text');
    const status = $('#tutorial-status');

    if (state.tutorialComplete) {
      label.textContent = '완료';
      title.textContent = '연습 완료!';
      text.textContent = '이제 실제 심사에서 같은 방식으로 지원자를 판정하면 됩니다.';
      status.className = 'tutorial-status good';
      status.innerHTML = '<button id="btn-tutorial-start" class="pixel-btn primary">본 심사 시작</button>';
      $('#btn-tutorial-start').addEventListener('click', prepareGame);
      return;
    }

    label.textContent = `${state.tutorialStep + 1}/3`;
    status.className = 'tutorial-status';
    if (state.tutorialStep === 0) {
      title.textContent = '뒤쪽 서류를 확인하세요';
      text.textContent = '추천서를 눌러 앞으로 가져오세요.';
      status.textContent = '서류는 한 장씩 앞으로 가져와 읽을 수 있습니다.';
    } else if (state.tutorialStep === 1) {
      title.textContent = '사림 도장을 선택하세요';
      text.textContent = '추천서의 “성리학·직언 중시” 단서를 보고 사림 도장을 선택해 보세요.';
      status.textContent = '판정하기 전에 도장을 선택합니다.';
    } else {
      title.textContent = '서류에 도장을 찍으세요';
      text.textContent = '현재 맨 위 추천서를 눌러 판정을 확정하세요.';
      status.textContent = '쾅! 도장이 찍히면 판정이 완료됩니다.';
    }
  }

  function renderTutorialPractice() {
    setTutorialInstruction();
    const pile = $('#tutorial-doc-pile');
    pile.innerHTML = '';
    const ordered = [0, 1].sort((a, b) => a === state.tutorialActiveDoc ? 1 : b === state.tutorialActiveDoc ? -1 : a - b);

    ordered.forEach((docIndex) => {
      const doc = TUTORIAL_DOCS[docIndex];
      const front = docIndex === state.tutorialActiveDoc;
      const el = document.createElement('div');
      el.className = `tutorial-paper ${front ? 'front' : 'back'}`;
      el.dataset.tutorialDoc = String(docIndex);
      el.innerHTML = `<h3>${escapeHtml(easyDocTitle(doc.type))}</h3><p>${escapeHtml(simplifyHistoricalText(doc.text))}</p><div class="tutorial-ink">사림!</div>`;
      el.addEventListener('click', () => tutorialPaperClick(docIndex, el));
      pile.appendChild(el);
    });
  }

  function tutorialPaperClick(index, el) {
    ensureAudio();
    if (state.tutorialComplete) return;
    if (index !== state.tutorialActiveDoc) {
      state.tutorialActiveDoc = index;
      beep('tap');
      if (state.tutorialStep === 0 && index === 1) state.tutorialStep = 1;
      renderTutorialPractice();
      return;
    }
    if (state.tutorialStep < 2) {
      $('#tutorial-status').textContent = state.tutorialStep === 0 ? '뒤쪽 추천서를 먼저 확인해 보세요.' : '먼저 사림 도장을 선택하세요.';
      beep('bad');
      return;
    }
    if (state.tutorialStamp !== '사림') {
      $('#tutorial-status').textContent = '이번 연습 지원자는 사림 단서가 뚜렷합니다. 사림 도장을 선택하세요.';
      beep('bad');
      return;
    }
    el.classList.add('stamped');
    $('#tutorial-dialogue').textContent = '“판결을 받들겠습니다.”';
    document.querySelector('.tutorial-practice-wrap')?.classList.add('stamp-shake');
    setTimeout(() => document.querySelector('.tutorial-practice-wrap')?.classList.remove('stamp-shake'), 190);
    beep('stamp');
    setTimeout(() => beep('good'), 80);
    state.tutorialComplete = true;
    setTimeout(renderTutorialPractice, 420);
  }

  function selectTutorialStamp(faction) {
    if (state.tutorialComplete) return;
    ensureAudio();
    state.tutorialStamp = faction;
    $$('.tutorial-stamp').forEach((b) => b.classList.toggle('selected', b.dataset.tutorialFaction === faction));
    beep('tap');
    if (state.tutorialStep === 1 && faction === '사림') {
      state.tutorialStep = 2;
      setTutorialInstruction();
    } else if (state.tutorialStep === 1 && faction !== '사림') {
      $('#tutorial-status').textContent = '추천서의 성리학·직언 단서를 다시 살펴보세요.';
    }
  }

  /* ---------- preload ---------- */
  function allAssetUrls() {
    return [...new Set([
      ...PORTRAITS,
      ...Object.values(DOC_BG),
      ...Object.values(OPTIONAL_ASSET_SLOTS).filter(Boolean),
      ...Object.values(SPECIAL_DOC_ART),
      ...Object.values(PHASE_BANNER_ART),
      ...Object.values(COMBO_ART),
      ...Object.values(GRADE_ART),
      'assets/banners/today.webp',
      'assets/banners/final_review.webp',
      'assets/special/directive.webp',
      'assets/results/achievement_accuracy.webp',
      'assets/results/achievement_combo.webp',
      'assets/results/achievement_careful.webp',
      'assets/results/new_record.webp',
      'assets/results/hall_of_fame.webp',
      'assets/ui/main_bg.webp',
      'assets/main/main_bg_v2.webp',
      'assets/main/title_frame.webp',
      'assets/main/desk_overlay.webp',
      'assets/main/royal_seal.webp',
      'assets/main/red_seal_mark.webp',
      'assets/main/hall_frame.webp',
      'assets/ui/stamp_hungu.webp',
      'assets/ui/stamp_sarim.webp'
    ])];
  }

  function preloadImage(src) {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => resolve(true);
      img.onerror = () => resolve(false);
      img.src = src;
    });
  }

  async function prepareGame() {
    ensureAudio();
    if (state.assetsPreloaded) {
      startGame();
      return;
    }
    showScreen('loading');
    const urls = allAssetUrls();
    let done = 0;
    $('#loading-bar').style.width = '0%';
    $('#loading-percent').textContent = '0%';
    $('#loading-text').textContent = '지원자와 서류를 불러오고 있습니다.';

    await Promise.all(urls.map(async (url) => {
      await preloadImage(url);
      done += 1;
      const pct = Math.round(done / urls.length * 100);
      $('#loading-bar').style.width = `${pct}%`;
      $('#loading-percent').textContent = `${pct}%`;
    }));

    state.assetsPreloaded = true;
    $('#loading-text').textContent = '심사 준비 완료.';
    await new Promise((r) => setTimeout(r, 250));
    startGame();
  }

  /* ---------- game data ---------- */
  function chooseDocs(profile, rng) {
    const docs = shuffleWith(profile.documents, rng).map(d => ({ ...d, gameText: varyText(d.gameText, rng) }));
    const selected = [];
    const basic = docs.find((d) => d.visibility === '기본 노출');
    const core = docs.filter((d) => d.clueKinds?.includes('핵심'));
    const decoy = docs.filter((d) => d.clueKinds?.includes('함정'));
    const support = docs.filter((d) => d.clueKinds?.includes('보조') && !d.clueKinds?.includes('함정'));

    const add = (d) => { if (d && !selected.includes(d)) selected.push(d); };
    add(basic);

    if (profile.difficulty === '초급') {
      shuffleWith(core, rng).forEach((d) => { if (selected.filter(x => x.clueKinds?.includes('핵심')).length < 2) add(d); });
      shuffleWith(support, rng).forEach((d) => { if (selected.length < 3) add(d); });
      shuffleWith(docs.filter(d => !d.clueKinds?.includes('함정')), rng).forEach((d) => { if (selected.length < 3) add(d); });
    } else if (profile.difficulty === '중급') {
      shuffleWith(core, rng).forEach((d) => { if (selected.filter(x => x.clueKinds?.includes('핵심')).length < 2) add(d); });
      add(pickWith(decoy.length ? decoy : support, rng));
      shuffleWith(docs, rng).forEach((d) => { if (selected.length < 4) add(d); });
    } else {
      shuffleWith(core, rng).forEach((d) => { if (selected.filter(x => x.clueKinds?.includes('핵심')).length < 2) add(d); });
      add(pickWith(decoy.length ? decoy : docs, rng));
      shuffleWith(docs, rng).forEach((d) => { if (selected.length < 4) add(d); });
    }

    // 어떤 난이도든 판단 가능한 핵심 단서는 최소 2개 확보한다.
    if (selected.filter((x) => x.clueKinds?.includes('핵심')).length < 2) {
      shuffleWith(core, rng).forEach((d) => { if (selected.filter(x => x.clueKinds?.includes('핵심')).length < 2) add(d); });
    }

    const limit = profile.difficulty === '초급' ? 3 : 4;
    return shuffleWith(selected.slice(0, limit), rng).map((doc, i) => ({
      ...doc,
      _rotate: `${(rng() * 2 - 1.5).toFixed(2)}deg`,
      _label: i + 1
    }));
  }

  function applySamsaClueBoost(applicant, profile, rng) {
    if (!applicant || applicant.faction !== '사림' || !profile?.documents?.length) return;
    const pattern = /(삼사|사헌부|사간원|홍문관|직언|바른말|견제|비판|감찰)/;
    const candidates = profile.documents.filter((d) => d.clueKinds?.includes('핵심') && pattern.test(String(d.gameText || '')));
    if (!candidates.length || rng() > 0.72) return;
    const chosen = { ...pickWith(candidates, rng) };
    chosen.gameText = varyText(chosen.gameText, rng);
    const already = applicant.playDocs.some((d) => d.gameText === chosen.gameText || (pattern.test(String(d.gameText || '')) && d.clueKinds?.includes('핵심')));
    if (already) return;
    const replaceIndex = applicant.playDocs.findIndex((d) => !d.clueKinds?.includes('핵심'));
    if (replaceIndex >= 0) applicant.playDocs[replaceIndex] = chosen;
    else applicant.playDocs[applicant.playDocs.length - 1] = chosen;
    applicant.playDocs = applicant.playDocs.map((d, i) => ({ ...d, _label:i + 1, _rotate:d._rotate || `${(rng() * 2 - 1.5).toFixed(2)}deg` }));
  }

  function difficultyPlan(total) {
    if (state.testMode && state.testSettings.difficulty !== '혼합') {
      return { [state.testSettings.difficulty]: total };
    }
    if (total === 20) return { '초급': 6, '중급': 8, '고급': 6 };
    if (total === 15) return { '초급': 5, '중급': 6, '고급': 4 };
    if (total === 10) return { '초급': 3, '중급': 4, '고급': 3 };
    if (total === 5) return { '초급': 2, '중급': 2, '고급': 1 };
    return { '초급': Math.ceil(total * .34), '중급': Math.ceil(total * .4), '고급': Math.max(0, total - Math.ceil(total * .34) - Math.ceil(total * .4)) };
  }

  function buildRoster() {
    const rng = state.rng;
    const total = state.testMode ? state.testSettings.count : CONFIG.TOTAL_APPLICANTS;
    const plan = difficultyPlan(total);
    const pools = {};
    Object.entries(plan).forEach(([diff, n]) => {
      const pool = shuffleWith(window.PROFILES.filter((p) => p.difficulty === diff), rng);
      pools[diff] = Array.from({ length: n }, (_, i) => pool[i % pool.length]);
    });

    let selected = [];
    // 일반 20인 혼합모드는 1~7 / 8~14 / 15~20으로 갈수록 난도가 높아진다.
    if (total === 20 && (!state.testMode || state.testSettings.difficulty === '혼합')) {
      const E = [...(pools['초급'] || [])];
      const M = [...(pools['중급'] || [])];
      const H = [...(pools['고급'] || [])];
      // 1차: 초급 4 + 중급 3
      const phase1 = shuffleWith([E.shift(), E.shift(), E.shift(), E.shift(), M.shift(), M.shift(), M.shift()].filter(Boolean), rng);
      // 2차: 초급 2 + 중급 3 + 고급 2
      const phase2 = shuffleWith([E.shift(), E.shift(), M.shift(), M.shift(), M.shift(), H.shift(), H.shift()].filter(Boolean), rng);
      // 3차: 중급 2 + 고급 4, 마지막은 반드시 고급 우선
      const phase3First = shuffleWith([M.shift(), M.shift(), H.shift(), H.shift(), H.shift()].filter(Boolean), rng);
      const finalHard = H.shift() || phase3First.pop() || M.shift() || E.shift();
      selected = [...phase1, ...phase2, ...phase3First, finalHard].filter(Boolean);
    } else {
      Object.entries(pools).forEach(([, arr]) => selected.push(...arr));
      const order = { '초급': 0, '중급': 1, '고급': 2 };
      selected = shuffleWith(selected, rng).sort((a, b) => (order[a.difficulty] ?? 1) - (order[b.difficulty] ?? 1));
    }

    const portraits = shuffleWith(PORTRAITS, rng);
    const names = shuffleWith(NAMES, rng);
    const roster = selected.slice(0, total).map((p, i) => {
      const personality = pickWith(PERSONALITIES, rng);
      const baseDialogue = simplifyHistoricalText((p.dialogue || '').replace(/[“”]/g, ''));
      const personalityLine = pickWith(personality.arrivals, rng).replace(/[“”]/g, '');
      return {
        ...p,
        displayName: names[i % names.length],
        portrait: portraits[i % portraits.length],
        playDocs: chooseDocs(p, rng),
        activeDoc: 0,
        specialEvent: null,
        suddenEvent: null,
        _viewedDocs: [0],
        personality,
        phase: total === 20 ? (i < 7 ? 1 : i < 14 ? 2 : 3) : 1,
        isFinalImportant: total === 20 && i === 19,
        arrivalDialogue: rng() < 0.45 && baseDialogue ? `${personalityLine}\n${baseDialogue}` : personalityLine
      };
    });


    const todayRule = getTodayRule(state.todayRule);
    if (todayRule.samsaClueBoost) {
      roster.forEach((a, i) => applySamsaClueBoost(a, selected[i], rng));
    }

    // 특수 심사: 기본 3명이며 오늘의 심사 규칙에 따라 수와 종류가 달라질 수 있다.
    const baseSpecialCount = total >= 15 ? CONFIG.SPECIAL_REVIEW_COUNT_NORMAL : Math.max(1, Math.min(2, Math.floor(total / 5)));
    const specialCount = Math.min(total - 2, baseSpecialCount + (todayRule.specialExtra || 0));
    const specialCandidates = Array.from({ length: total }, (_, i) => i).filter((i) => i > 0 && i < total - 1);
    const specialIndexes = pickSpacedIndexes(specialCandidates, Math.min(specialCount, specialCandidates.length), 2, rng);
    const specialTypes = chooseEventTypes(
      SPECIAL_EVENTS,
      specialIndexes.length,
      todayRule.specialGuaranteed,
      todayRule.specialPreferred,
      todayRule.specialPreferredSlots || 0,
      rng
    );
    specialIndexes.forEach((idx, j) => {
      const baseEvt = specialTypes[j % specialTypes.length];
      const adjustedEvt = todayRule.specialBonusExtra ? { ...baseEvt, reward:(baseEvt.reward || CONFIG.SPECIAL_REVIEW_BONUS_DEFAULT) + todayRule.specialBonusExtra } : baseEvt;
      applySpecialReviewToApplicant(roster[idx], adjustedEvt, rng);
    });

    // 돌발 이벤트: 12종 풀에서 2~3개. 오늘의 심사 규칙은 특정 유형을 보장하거나 우선 등장시킬 수 있다.
    const randomSuddenCount = Math.min(total >= 10 ? (CONFIG.SUDDEN_EVENT_MIN + Math.floor(rng() * (CONFIG.SUDDEN_EVENT_MAX - CONFIG.SUDDEN_EVENT_MIN + 1))) : 1, 3);
    const suddenCount = Math.min(3, todayRule.suddenCount || randomSuddenCount);
    const specialSet = new Set(specialIndexes);
    const suddenCandidates = Array.from({ length: total }, (_, i) => i).filter((i) => i > 0 && i < total - 1 && !specialSet.has(i));
    const suddenIndexes = pickSpacedIndexes(suddenCandidates, Math.min(suddenCount, suddenCandidates.length), CONFIG.SUDDEN_EVENT_MIN_GAP, rng);
    const suddenTypes = chooseEventTypes(
      SUDDEN_EVENTS,
      suddenIndexes.length,
      todayRule.suddenGuaranteed,
      todayRule.suddenPreferred,
      todayRule.suddenPreferredSlots || 0,
      rng
    );
    suddenIndexes.forEach((idx, j) => {
      roster[idx].suddenEvent = { ...suddenTypes[j % suddenTypes.length], triggerAfter: 1 + Math.floor(rng() * 2) };
      roster[idx].suddenEventTriggered = false;
      roster[idx].suddenEventResolved = false;
    });

    return roster;
  }

  function setSelectedStampText() {
    const preview = $('#selected-stamp-preview');
    const hint = $('#stamp-hint');
    if (state.selectedStamp === '훈구') {
      if (preview) preview.textContent = '선택된 도장 · 훈구';
      if (hint) hint.textContent = '훈구 도장이 선택되었습니다';
    } else if (state.selectedStamp === '사림') {
      if (preview) preview.textContent = '선택된 도장 · 사림';
      if (hint) hint.textContent = '사림 도장이 선택되었습니다';
    } else {
      if (preview) preview.textContent = '선택된 도장 없음';
      if (hint) hint.textContent = '도장을 선택하세요';
    }
  }

  function updateHud() {
    const scoreEl = $('#hud-score'); if (scoreEl) scoreEl.textContent = state.score.toLocaleString();
    const timeEl = $('#hud-time'); if (timeEl) timeEl.textContent = fmtTime(state.seconds);
    const total = state.roster.length || (state.testMode ? state.testSettings.count : CONFIG.TOTAL_APPLICANTS);
    const countEl = $('#hud-count'); if (countEl) countEl.textContent = `${Math.min(state.idx + 1, total)}/${total}`;
    const comboEl = $('#hud-combo'); if (comboEl) comboEl.textContent = state.combo;
    const correctEl = $('#hud-correct'); if (correctEl) correctEl.textContent = state.correct;
    const wrongEl = $('#hud-wrong'); if (wrongEl) wrongEl.textContent = state.wrong;
    const nextCombo = state.combo + 1;
    const preview = comboBonusFor(nextCombo);
    $('#combo-bonus-preview').textContent = `다음 콤보 보너스 +${preview}`;
    const milestone = nextComboMilestone(state.combo);
    $('#combo-next-milestone').textContent = milestone.text;
    $('#combo-fill').style.width = `${Math.min(100, state.combo / 10 * 100)}%`;
    const comboStrip = $('.combo-strip');
    comboStrip.classList.toggle('combo-warm', state.combo >= 3 && state.combo < 5);
    comboStrip.classList.toggle('combo-hot', state.combo >= 5 && state.combo < 8);
    comboStrip.classList.toggle('combo-elite', state.combo >= 8);
    const timerBlock = $('.hud-block.timer'); if (timerBlock) timerBlock.classList.toggle('danger', state.seconds <= 30);

    const specialTimer = $('#special-event-timer');
    const currentApplicant = state.roster[state.idx];
    if (specialTimer && currentApplicant?.specialEvent?.id === 'urgent' && state.gameActive) {
      const elapsed = (Date.now() - state.applicantStartedAt) / 1000;
      const left = Math.max(0, Math.ceil((currentApplicant.specialEvent.timeLimit || 18) - elapsed));
      specialTimer.hidden = false;
      specialTimer.textContent = `긴급 보너스 ${left}초`;
      specialTimer.classList.toggle('danger', left <= 5);
    } else if (specialTimer) {
      specialTimer.hidden = true;
      specialTimer.classList.remove('danger');
    }

    if (state.seconds <= 30 && !state.warned30) {
      state.warned30 = true;
      flashTimeWarning('마지막 30초!');
    }
    if (state.seconds <= 10 && !state.warned10) {
      state.warned10 = true;
      flashTimeWarning('심사 마감 임박!');
    }
    if (state.seconds <= 10 && state.seconds > 0) beep('warning');
  }

  function flashTimeWarning(text) {
    const el = $('#time-warning');
    el.textContent = text;
    el.classList.add('show');
    beep('warning');
    vibrate('warning');
    setTimeout(() => el.classList.remove('show'), 1200);
  }

  function syncRoundTimer() {
    if (!state.gameActive || state.phasePause || state.feedbackPaused) return;
    state.seconds = Math.max(0, Math.ceil((state.deadlineAt - Date.now()) / 1000));
    updateHud();
    if (state.seconds <= 0) finishGame(true);
  }

  function startRoundTimer() {
    clearInterval(state.timer);
    state.deadlineAt = Date.now() + state.seconds * 1000;
    state.timer = setInterval(syncRoundTimer, 250);
  }

  function startGame() {
    clearAdvanceTimers();
    state.decisionSerial += 1;
    const seedValue = state.testMode && state.testSettings.seed
      ? Number(state.testSettings.seed)
      : state.nextSeed;
    state.currentSeed = Number.isFinite(seedValue) && seedValue > 0 ? Math.floor(seedValue) : randomSeed();
    state.rng = mulberry32(state.currentSeed);
    $('#main-round-seed').textContent = String(state.currentSeed);
    const todayRule = pickWith(TODAY_RULES, state.rng);
    state.todayRule = todayRule.id;
    state.roundFlavor = todayRule.text;

    state.roster = buildRoster();
    state.idx = 0;
    state.score = 0;
    state.correct = 0;
    state.wrong = 0;
    state.combo = 0;
    state.maxCombo = 0;
    state.seconds = state.testMode ? state.testSettings.seconds : CONFIG.GAME_SECONDS;
    state.selectedStamp = null;
    state.locked = false;
    state.reviewed = 0;
    state.totalDecisionTime = 0;
    state.warned30 = false;
    state.warned10 = false;
    state.decisions = [];
    state.currentDocInteractions = 0;
    state.gameActive = true;
    state.recoveredRun = false;
    state.runRankEligible = !state.testMode;
    state.phasePause = false;
    state.feedbackPaused = false;
    if (state.feedbackPauseTimer) clearTimeout(state.feedbackPauseTimer);
    state.feedbackPauseTimer = null;
    state.feedbackPauseStarted = 0;
    state.currentPhase = 1;
    state.finalDirectiveShown = false;
    setSelectedStampText();
    closeDocModal();
    showScreen('game');
    updateHud();
    renderApplicant(true);
    startRoundTimer();
    saveRecoveryState();
  }

  function transitionApplicant(applicant, immediate = false) {
    const windowEl = $('#applicant-window');
    const bubbleEl = $('#applicant-dialogue');
    bubbleEl.classList.remove('reaction');
    windowEl.classList.remove('reacted');

    const applyContent = () => {
      const portrait = $('#applicant-portrait');
      windowEl.classList.remove('image-missing');
      portrait.onerror = () => windowEl.classList.add('image-missing');
      portrait.onload = () => windowEl.classList.remove('image-missing');
      portrait.src = applicant.portrait;
      $('#applicant-name').textContent = applicant.displayName;
      $('#applicant-difficulty').textContent = applicant.difficulty;
      $('#applicant-personality').textContent = applicant.personality?.name || '차분형';
      $('#applicant-dialogue').textContent = simplifyHistoricalText(applicant.arrivalDialogue || applicant.dialogue.replace(/[“”]/g, ''));
      windowEl.classList.add('entering');
      bubbleEl.classList.add('entering');
      requestAnimationFrame(() => requestAnimationFrame(() => {
        windowEl.classList.remove('entering');
        bubbleEl.classList.remove('entering');
      }));
    };

    if (immediate) { applyContent(); return; }
    windowEl.classList.add('leaving');
    bubbleEl.classList.add('leaving');
    setTimeout(() => {
      windowEl.classList.remove('leaving');
      bubbleEl.classList.remove('leaving');
      applyContent();
    }, 180);
  }

  function renderDocPile() {
    const a = state.roster[state.idx];
    const pile = $('#doc-pile');
    pile.innerHTML = '';
    const ordered = a.playDocs.map((doc, i) => ({ doc, i }))
      .sort((x, y) => x.i === a.activeDoc ? 1 : y.i === a.activeDoc ? -1 : x.i - y.i);

    ordered.forEach((item, renderIndex) => {
      const { doc, i } = item;
      const layer = Math.max(0, ordered.length - 1 - renderIndex);
      const isActive = i === a.activeDoc;
      const card = document.createElement('div');
      const eventClass = doc._eventId ? ` special-doc event-${doc._eventId}` : '';
      const foreignClass = doc._foreignDoc ? ' foreign-doc' : '';
      card.className = `paper-card ${isActive ? 'active' : ''}${eventClass}${foreignClass}`;
      card.dataset.index = String(i);
      card.dataset.layer = String(layer);
      card.setAttribute('role', 'button');
      card.setAttribute('tabindex', '0');
      card.setAttribute('aria-label', `${easyDocTitle(doc.documentType)} ${isActive ? '선택됨' : '선택 가능'}`);
      card.style.setProperty('--rotate', doc._rotate || '0deg');
      const easyDocText = simplifyHistoricalText(doc.gameText);
      const specialDocArt = doc._eventId ? SPECIAL_DOC_ART[doc._eventId] : '';
      const paperArt = specialDocArt || DOC_BG[doc.documentType] || '';
      card.innerHTML = `
        <div class="doc-index">문서 ${doc._label ?? (i + 1)}</div>
        ${doc._eventId ? '<div class="event-doc-badge">!</div><div class="special-paper-ribbon">특이사항</div>' : ''}
        ${doc._foreignDoc ? '<div class="foreign-doc-ribbon">번호 불일치</div>' : ''}
        <div class="doc-tab">${escapeHtml(easyDocTitle(doc.documentType))}</div>
        <div class="paper-bg ${doc._eventId ? 'special-template-bg' : ''}" style="background-image:${paperArt ? `url('${paperArt}')` : 'none'}"></div>
        <div class="paper-content">
          <div class="doc-heading"><small>심사 서류</small><h3>${escapeHtml(easyDocTitle(doc.documentType))}</h3></div>
          <div class="doc-text">${escapeHtml(easyDocText)}</div>
          <div class="paper-footer">성종 연간 · 인재 선발소 접수</div>
        </div>
        <div class="doc-cue">${isActive ? (state.selectedStamp ? '눌러서 판결' : '현재 확인 중') : '앞으로 보기'}</div>
        <div class="ink-mark"></div>
      `;
      card.addEventListener('click', () => onPaperClick(i));
      card.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onPaperClick(i);
        }
      });
      pile.appendChild(card);
    });
  }

  function updateDocNavigator() {
    const a = state.roster[state.idx];
    const status = $('#doc-nav-status');
    const prevBtn = $('#btn-doc-prev');
    const nextBtn = $('#btn-doc-next');
    if (!a || !status) return;
    const total = a.playDocs?.length || 0;
    status.textContent = total ? `${a.activeDoc + 1} / ${total}` : '- / -';
    const disabled = total <= 1 || state.locked;
    if (prevBtn) prevBtn.disabled = disabled;
    if (nextBtn) nextBtn.disabled = disabled;
  }

  function renderApplicant(immediate = false) {
    const a = state.roster[state.idx];
    if (!a) { finishGame(false); return; }
    state.locked = false;
    state.applicantStartedAt = Date.now();
    state.currentDocInteractions = 0;
    markDocViewed(a.activeDoc || 0);
    state.selectedStamp = null;
    $$('.stamp-choice').forEach((b) => b.classList.remove('selected'));
    setSelectedStampText();
    transitionApplicant(a, immediate);
    state.currentPhase = a.phase || phaseForIndex(state.idx);
    const activeTodayRule = getTodayRule(state.todayRule);
    const flavor = state.roundFlavor || activeTodayRule.text || '기록을 꼼꼼히 살피십시오.';
    $('#round-flavor-text').textContent = simplifyHistoricalText(flavor);
    const roundEffectEl = $('#round-effect-text');
    if (roundEffectEl) roundEffectEl.textContent = `효과 · ${simplifyHistoricalText(activeTodayRule.effect)}`;
    const phaseChip = $('#phase-chip');
    if (phaseChip) phaseChip.textContent = `${state.currentPhase}차 심사`;
    const phaseInlineArt = $('#phase-inline-art');
    if (phaseInlineArt) { phaseInlineArt.src = PHASE_BANNER_ART[state.currentPhase] || PHASE_BANNER_ART[1]; phaseInlineArt.alt = `${state.currentPhase}차 심사`; }
    const eventPanel = $('#special-event-panel');
    if (a.specialEvent) {
      playBgmKey('special', { restart: true });
      eventPanel.hidden = false;
      eventPanel.dataset.event = a.specialEvent.id;
      $('#special-event-title').textContent = simplifyHistoricalText(a.specialEvent.title);
      $('#special-event-desc').textContent = simplifyHistoricalText(a.specialEvent.desc);
      const specialRule = $('#special-event-rule');
      if (specialRule) specialRule.textContent = `도전 · ${simplifyHistoricalText(a.specialEvent.rule || '')}`;
      applyOptionalArt(eventPanel.querySelector('.event-image-placeholder'), `special_${a.specialEvent.id}`);
      eventPanel.classList.remove('event-pulse');
      void eventPanel.offsetWidth;
      eventPanel.classList.add('event-pulse');
      if (!a._specialVibrated) {
        vibrate('special');
        a._specialVibrated = true;
      }
    } else {
      playBgmKey(a.isFinalImportant ? 'final' : 'review', { restart: !!a.isFinalImportant });
      eventPanel.hidden = true;
      delete eventPanel.dataset.event;
      $('#special-event-title').textContent = '';
      $('#special-event-desc').textContent = '';
      const specialRule = $('#special-event-rule'); if (specialRule) specialRule.textContent = '';
      const specialTimer = $('#special-event-timer'); if (specialTimer) specialTimer.hidden = true;
    }
    updateSpecialReviewProgress();
    renderDocPile();
    updateDocNavigator();
    updateHud();
    saveRecoveryState();
  }

  function bringDocToFront(index) {
    if (state.locked) return;
    const a = state.roster[state.idx];
    if (a.activeDoc !== index) {
      a.activeDoc = index;
      state.currentDocInteractions += 1;
      markDocViewed(index);
      updateSpecialReviewProgress();
      renderDocPile();
      updateDocNavigator();
      beep('tap');
      maybeTriggerSuddenEvent();
    }
  }

  function onPaperClick(index) {
    if (state.locked) return;
    const a = state.roster[state.idx];
    if (a.activeDoc !== index) {
      bringDocToFront(index);
      return;
    }
    if (!state.selectedStamp) {
      showToast('도장을 고르면 바로 판결됩니다.', 'warn');
      beep('tap');
      return;
    }
    stampDecision();
  }

  function refreshModalScrollHint() {
    const text = $('#modal-doc-text');
    const hint = $('#modal-scroll-hint');
    if (!text || !hint) return;
    const hasMore = text.scrollHeight > text.clientHeight + 6 && text.scrollTop + text.clientHeight < text.scrollHeight - 5;
    hint.hidden = !hasMore;
  }

  function updateDocModal() {
    const a = state.roster[state.idx];
    if (!a) return;
    const doc = a.playDocs[a.activeDoc];
    $('#modal-doc-title').textContent = easyDocTitle(doc.documentType);
    const easyModalText = simplifyHistoricalText(doc.gameText);
    $('#modal-doc-text').textContent = easyModalText;
    $('#modal-doc-counter').textContent = `${a.activeDoc + 1} / ${a.playDocs.length}`;
    const modal = $('#document-modal');
    const badge = $('#modal-special-badge');
    const isSpecial = !!doc._eventId;
    modal.classList.toggle('special-modal', isSpecial);
    const specialModalArt = isSpecial ? SPECIAL_DOC_ART[doc._eventId] : '';
    if (specialModalArt) modal.style.setProperty('--modal-special-bg', `url('${specialModalArt}')`);
    else modal.style.removeProperty('--modal-special-bg');
    if (badge) badge.hidden = !isSpecial;
    $('#modal-doc-text').scrollTop = 0;
    requestAnimationFrame(refreshModalScrollHint);
  }

  function openDocModal() {
    if (state.locked) return;
    state.currentDocInteractions += 1;
    updateDocModal();
    const modal = $('#document-modal');
    modal.classList.add('open');
    modal.setAttribute('aria-hidden', 'false');
    beep('tap');
  }

  function cycleModalDoc(delta) {
    const a = state.roster[state.idx];
    if (!a || state.locked) return;
    const len = a.playDocs.length;
    a.activeDoc = (a.activeDoc + delta + len) % len;
    state.currentDocInteractions += 1;
    markDocViewed(a.activeDoc);
    updateSpecialReviewProgress();
    renderDocPile();
    updateDocNavigator();
    updateDocModal();
    beep('tap');
    maybeTriggerSuddenEvent();
  }

  function closeDocModal() {
    const modal = $('#document-modal');
    if (!modal) return;
    modal.classList.remove('open');
    modal.setAttribute('aria-hidden', 'true');
  }

  function selectStamp(faction) {
    if (state.locked) return;
    ensureAudio();
    state.selectedStamp = faction;
    $$('.stamp-choice').forEach((b) => b.classList.toggle('selected', b.dataset.faction === faction));
    setSelectedStampText();
    renderDocPile();
    beep('tap');
  }

  function showToast(text, type = '') {
    const t = $('#toast');
    t.className = `toast ${type}`;
    t.innerHTML = escapeHtml(text).replace(/\n/g, '<br>');
    void t.offsetWidth;
    t.classList.add('show');
  }

  function showApplicantReaction(correct) {
    const bubble = $('#applicant-dialogue');
    const windowEl = $('#applicant-window');
    const a = state.roster[state.idx];
    const pool = a?.personality?.[correct ? 'good' : 'bad'] || REACTIONS[correct ? 'good' : 'bad'];
    bubble.textContent = pickWith(pool, state.rng || Math.random);
    bubble.classList.add('reaction');
    windowEl.classList.add('reacted');
  }

  function showComboPop(combo, bonus) {
    if (combo < 2 || bonus <= 0) return;
    let pop = $('#combo-pop');
    if (!pop) {
      pop = document.createElement('div');
      pop.id = 'combo-pop';
      pop.className = 'combo-pop';
      $('#screen-game').appendChild(pop);
    }
    const milestone = COMBO_MESSAGES[combo] || (combo > 12 && combo % 2 === 0 ? '완벽한 흐름!' : '');
    const art = COMBO_ART[combo];
    pop.className = 'combo-pop';
    if (milestone) pop.classList.add('milestone');
    if (combo >= 10) pop.classList.add('legend');
    pop.classList.toggle('image-combo-pop', !!art);
    if (art) {
      pop.innerHTML = `<img src="${art}" alt="${escapeHtml(milestone || `${combo}콤보`)}"><span class="combo-score-chip">+${bonus}점</span>`;
      vibrate('milestone');
    } else {
      pop.textContent = milestone ? `${milestone}\n${combo} COMBO  +${bonus}` : `${combo} COMBO  +${bonus}`;
    }
    pop.classList.remove('show');
    void pop.offsetWidth;
    pop.classList.add('show');
  }

  function showRushBadge(text) {
    const old = $('#rush-badge');
    if (old) old.remove();
    const badge = document.createElement('div');
    badge.id = 'rush-badge';
    badge.className = 'rush-badge';
    badge.textContent = text;
    $('.desk-board').appendChild(badge);
    setTimeout(() => badge.remove(), 950);
  }

  function getDecisionKeyClue(applicant) {
    const clues = [];
    for (const doc of (applicant?.playDocs || [])) {
      const kinds = Array.isArray(doc.clueKinds) ? doc.clueKinds : [];
      const sources = Array.isArray(doc.sourceClues) ? doc.sourceClues : [];
      kinds.forEach((kind, i) => {
        if (kind === '핵심' && sources[i] && !clues.includes(sources[i])) clues.push(sources[i]);
      });
      if (clues.length >= 2) break;
    }
    const fallback = simplifyHistoricalText((applicant?.feedback || '결정적 단서를 다시 확인해 보세요.').replace(/\.$/, ''));
    let text = clues.length ? clues.slice(0, 2).join(' · ') : fallback;
    text = simplifyHistoricalText(text);
    return text.length > 48 ? `${text.slice(0, 47)}…` : text;
  }

  function pauseRoundForFeedback(ms = 1150) {
    if (!state.gameActive || state.feedbackPaused) return;
    state.feedbackPaused = true;
    state.feedbackPauseStarted = Date.now();
    if (state.feedbackPauseTimer) clearTimeout(state.feedbackPauseTimer);
    state.feedbackPauseTimer = setTimeout(() => {
      const pausedFor = Math.max(0, Date.now() - state.feedbackPauseStarted);
      state.deadlineAt += pausedFor;
      state.feedbackPaused = false;
      state.feedbackPauseStarted = 0;
      state.feedbackPauseTimer = null;
      syncRoundTimer();
      saveRecoveryState();
    }, ms);
  }

  function playDecisionResultEffects(correct, activeCard) {
    const screen = $('#screen-game');
    const shell = $('#app');
    const screenClass = correct ? 'decision-correct-flash' : 'decision-wrong-flash';
    const cardClass = correct ? 'decision-card-correct' : 'decision-card-wrong';
    screen?.classList.remove('decision-correct-flash', 'decision-wrong-flash');
    shell?.classList.remove('decision-good-pulse', 'decision-bad-shake', 'stamp-shake');
    activeCard?.classList.remove('decision-card-correct', 'decision-card-wrong');
    if (screen) { void screen.offsetWidth; screen.classList.add(screenClass); }
    if (activeCard) { void activeCard.offsetWidth; activeCard.classList.add(cardClass); }
    if (shell) {
      void shell.offsetWidth;
      shell.classList.add(correct ? 'decision-good-pulse' : 'decision-bad-shake');
    }
    setTimeout(() => {
      screen?.classList.remove(screenClass);
      shell?.classList.remove('decision-good-pulse', 'decision-bad-shake');
      activeCard?.classList.remove(cardClass);
    }, correct ? 620 : 900);
  }

  function clearAdvanceTimers() {
    if (state.advanceTimer) clearTimeout(state.advanceTimer);
    if (state.advanceWatchdog) clearTimeout(state.advanceWatchdog);
    state.advanceTimer = null;
    state.advanceWatchdog = null;
  }

  function scheduleAdvanceAfterDecision(delayMs = 980) {
    clearAdvanceTimers();
    const serial = ++state.decisionSerial;
    const run = () => {
      if (!state.gameActive || serial !== state.decisionSerial) return;
      clearAdvanceTimers();
      try { advanceAfterDecision(); }
      catch (err) {
        console.error('advanceAfterDecision failed', err);
        // Last-resort recovery: skip only this applicant instead of freezing the whole game.
        state.idx += 1;
        if (state.idx >= state.roster.length || state.seconds <= 0) finishGame(state.seconds <= 0);
        else renderApplicant(false);
      }
    };
    state.advanceTimer = setTimeout(run, delayMs);
    state.advanceWatchdog = setTimeout(run, Math.max(delayMs + 850, 1900));
  }

  function showComboBreak(previousCombo) {
    if (previousCombo < 2) return;
    const strip = $('.combo-strip');
    strip?.classList.remove('broken');
    if (strip) { void strip.offsetWidth; strip.classList.add('broken'); setTimeout(() => strip.classList.remove('broken'), 650); }
    const old = $('.combo-break-pop');
    old?.remove();
    const pop = document.createElement('div');
    pop.className = 'combo-break-pop image-combo-break';
    pop.innerHTML = `<img src="${COMBO_ART.end}" alt="연속 판정 종료"><span>${previousCombo}콤보 종료</span>`;
    $('#screen-game').appendChild(pop);
    setTimeout(() => pop.remove(), 980);
  }

  function playStampVisual(activeCard, activeInk, faction) {
    try {
      const chosenButton = $(`.stamp-choice[data-faction="${faction}"]`);
      chosenButton?.classList.add('striking');
      setTimeout(() => chosenButton?.classList.remove('striking'), 320);
      setTimeout(() => {
        if (!activeInk) return;
        activeInk.textContent = `${faction}!`;
        activeInk.style.setProperty('--stamp-angle', `${(Math.random() * 14 - 7).toFixed(1)}deg`);
        activeInk.style.left = `${49 + Math.random() * 7}%`;
        activeInk.style.top = `${34 + Math.random() * 7}%`;
        activeInk.style.opacity = `${0.80 + Math.random() * 0.16}`;
        activeInk.classList.add('show');
        activeCard?.classList.add('stamped');
      }, 95);
    } catch (err) {
      console.warn('Stamp visual skipped', err);
    }
  }

  function stampDecision() {
    if (state.locked) return;
    if (!state.selectedStamp) {
      showToast('도장을 먼저 선택하세요', 'bad');
      beep('bad');
      return;
    }
    const pendingApplicant = state.roster[state.idx];
    if (pendingApplicant?.suddenEvent && !pendingApplicant.suddenEventResolved) {
      if (!pendingApplicant.suddenEventTriggered) showSuddenEvent(pendingApplicant);
      return;
    }
    state.locked = true;
    ensureAudio();
    closeDocModal();

    const a = state.roster[state.idx];
    const activeCard = $(`.paper-card[data-index="${a.activeDoc}"]`);
    const activeInk = activeCard?.querySelector('.ink-mark');
    const correct = state.selectedStamp === a.faction;
    const elapsed = (Date.now() - state.applicantStartedAt) / 1000;
    const hardRush = elapsed < CONFIG.RUSH_SECONDS;
    const quickNoReview = !hardRush && elapsed < CONFIG.QUICK_NO_REVIEW_SECONDS && state.currentDocInteractions === 0;
    const specialReview = evaluateSpecialReview(a, elapsed);
    const suddenJudge = evaluateSuddenJudgmentBonus(a, elapsed);
    let speedBonus = (hardRush || quickNoReview) ? 0 : Math.max(0, Math.round(25 - elapsed * 0.8));
    if (a.specialEvent && !specialReview.passed) speedBonus = 0;
    const difficultyBonus = CONFIG.DIFFICULTY_BONUS[a.difficulty] || 0;
    const specialBonus = correct ? specialReview.bonus : 0;
    const suddenBonus = correct ? suddenJudge.bonus : 0;
    const finalBonus = a.isFinalImportant ? CONFIG.FINAL_APPLICANT_BONUS : 0;
    let gained = 0;
    let comboBonus = 0;
    let rushPenalty = 0;
    const previousCombo = state.combo;

    state.reviewed += 1;
    state.totalDecisionTime += elapsed;

    if (correct) {
      state.correct += 1;
      if (hardRush) {
        state.combo = 0;
        rushPenalty = CONFIG.RUSH_SCORE_PENALTY;
        gained = Math.max(40, 120 + difficultyBonus + specialBonus + suddenBonus + finalBonus - rushPenalty);
        state.score += gained;
        showRushBadge('성급한 판정 · 콤보 초기화');
      } else {
        state.combo += 1;
        state.maxCombo = Math.max(state.maxCombo, state.combo);
        comboBonus = comboBonusFor(state.combo);
        if (a.specialEvent && !specialReview.passed) comboBonus = Math.floor(comboBonus * .5);
        if (quickNoReview) rushPenalty = CONFIG.QUICK_NO_REVIEW_PENALTY;
        gained = Math.max(40, 120 + difficultyBonus + speedBonus + comboBonus + specialBonus + suddenBonus + finalBonus - rushPenalty);
        state.score += gained;
        showComboPop(state.combo, comboBonus);
        if (quickNoReview) showRushBadge('빠른 판정 · 속도 보너스 없음');
        if (a.specialEvent && !specialReview.passed) showRushBadge('특수심사 조건 미달 · 콤보 보너스 절반');
      }
    } else {
      showComboBreak(previousCombo);
      state.combo = 0;
      state.wrong += 1;
      state.score = Math.max(0, state.score - CONFIG.WRONG_SCORE_PENALTY);
      state.deadlineAt -= CONFIG.WRONG_TIME_PENALTY * 1000;
      syncRoundTimer();
      if (state.gameActive) pauseRoundForFeedback(1150);
    }

    state.decisions.push({
      profileId: a.profileId,
      displayName: a.displayName,
      difficulty: a.difficulty,
      personality: a.personality?.name || '',
      chosen: state.selectedStamp,
      faction: a.faction,
      correct,
      elapsed,
      docInteractions: state.currentDocInteractions,
      rushed: hardRush || quickNoReview,
      hardRush,
      feedback: simplifyHistoricalText(a.feedback || ''),
      specialEvent: a.specialEvent ? a.specialEvent.title : '',
      specialReviewPassed: a.specialEvent ? (correct && specialReview.passed) : null,
      specialReviewBonus: specialBonus,
      suddenEvent: a.suddenEvent ? a.suddenEvent.title : '',
      suddenResult: a.suddenResult || '',
      suddenJudgmentBonus: suddenBonus,
      comboAfter: state.combo,
      gained,
      finalImportant: !!a.isFinalImportant,
      documents: a.playDocs.map((d) => ({ type: d.documentType, text: d.gameText }))
    });
    markProfileSeen(a.profileId);

    // 정답은 흐름을 끊지 않고 빠르게, 오답은 약 1초의 학습 피드백 시간을 확보한다.
    // A watchdog retries the transition if a browser animation or event fails.
    scheduleAdvanceAfterDecision(correct ? 920 : 1200);
    playStampVisual(activeCard, activeInk, state.selectedStamp);
    playDecisionResultEffects(correct, activeCard);

    vibrate(correct ? 'stampGood' : 'stampBad');
    beep('stamp');
    setTimeout(() => beep(correct ? 'good' : 'bad'), 80);
    updateHud();
    showApplicantReaction(correct);

    const comboLine = correct && comboBonus > 0 ? ` · 콤보 +${comboBonus}` : '';
    const finalLine = correct && finalBonus > 0 ? ` · 중요심사 +${finalBonus}` : '';
    const specialLine = correct && a.specialEvent && specialReview.passed ? `\n특수심사 성공 +${specialBonus}점` : '';
    const suddenLine = correct && suddenJudge.notes.length ? `\n${suddenJudge.notes.join(' · ')}` : '';
    const rushLine = hardRush ? `\n성급한 판정 · 콤보 초기화` : (quickNoReview ? `\n빠른 판정 · 속도 보너스 없음` : '');
    const keyClue = getDecisionKeyClue(a);
    showToast(
      correct
        ? `정확한 판정!  +${gained}점${comboLine}${finalLine}${rushLine}${specialLine}${suddenLine}`
        : `오판!  정답: ${a.faction}\n핵심 단서 · ${keyClue}\n-${CONFIG.WRONG_SCORE_PENALTY}점 · -${CONFIG.WRONG_TIME_PENALTY}초`,
      correct ? 'good decision-good-toast' : 'bad decision-bad-toast'
    );

    saveRecoveryState();
  }

  function advanceAfterDecision() {
    state.idx += 1;
    if (state.idx >= state.roster.length || state.seconds <= 0) {
      finishGame(state.seconds <= 0);
      return;
    }

    const total = state.roster.length;
    if (total === 20 && state.idx === 7) {
      showPhaseOverlay(1, () => renderApplicant(false));
      return;
    }
    if (total === 20 && state.idx === 14) {
      showPhaseOverlay(2, () => renderApplicant(false));
      return;
    }
    if (total === 20 && state.idx === 19 && !state.finalDirectiveShown) {
      showFinalDirective(() => renderApplicant(false));
      return;
    }
    renderApplicant(false);
  }

  function getGrade(accuracy, score) {
    if (accuracy >= 95 && score >= 7500) return '수석 심사관';
    if (accuracy >= 90 && score >= 5600) return '성종의 신임';
    if (accuracy >= 82 && score >= 4000) return '능숙한 심사관';
    if (accuracy >= 70) return '정식 심사관';
    return '견습 심사관';
  }

  function resultTier(accuracy, score, combo) {
    if (accuracy >= 92 && score >= 6000 && combo >= 8) return 'master';
    if (accuracy >= 80 && score >= 3800) return 'skilled';
    return 'novice';
  }

  function performanceMessage(accuracy, combo, rushed, wrong) {
    if (accuracy >= 95 && combo >= 10) return '정확성과 연속 판정을 모두 잡았습니다. 성종이 믿고 맡길 만한 심사입니다.';
    if (accuracy >= 90 && rushed === 0) return '서두르지 않고 정확하게 판정했습니다. 안정적인 심사가 돋보입니다.';
    if (combo >= 8) return '긴 콤보를 유지했습니다. 한 번의 오판이 점수에 미치는 영향을 잘 막아냈습니다.';
    if (accuracy >= 80) return '대체로 정확했습니다. 몇 번의 오판만 줄이면 상위 기록을 노릴 수 있습니다.';
    if (wrong >= 5) return '빠르게 찍기보다 서류 두 장 이상을 확인해 보세요. 콤보 유지가 점수의 핵심입니다.';
    return '다시 도전하면 기록을 크게 올릴 수 있습니다. 결정적인 단서를 두 개 이상 확인해 보세요.';
  }

  function setAchievement(id, unlocked, label, detail) {
    const el = $(id);
    if (!el) return;
    el.classList.toggle('unlocked', unlocked);
    el.classList.toggle('goal', !unlocked);
    const span = el.querySelector('span');
    const b = el.querySelector('b');
    if (span) span.textContent = label;
    if (b) b.textContent = detail;
  }

  function animateNumber(el, target, duration = 520) {
    if (!el) return;
    const start = performance.now();
    const from = 0;
    const step = (now) => {
      const t = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - t, 3);
      el.textContent = Math.round(from + (target - from) * eased).toLocaleString();
      if (t < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }

  function renderReplayCards() {
    const list = $('#replay-card-list');
    if (!list) return;
    list.innerHTML = '';
    if (!state.decisions.length) {
      list.innerHTML = '<div class="replay-card"><b>기록 없음</b><p>완료된 판정이 없습니다.</p></div>';
      return;
    }
    const corrects = state.decisions.filter((d) => d.correct);
    const fastestCorrect = corrects.length ? [...corrects].sort((a,b) => a.elapsed - b.elapsed)[0] : null;
    const longest = [...state.decisions].sort((a,b) => b.elapsed - a.elapsed)[0];
    const comboHero = corrects.length ? [...corrects].sort((a,b) => (b.comboAfter || 0) - (a.comboAfter || 0) || (b.gained || 0) - (a.gained || 0))[0] : null;
    const final = state.decisions.find((d) => d.finalImportant);
    const cards = [];
    if (comboHero) cards.push({ icon:'🔥', title:'최고 콤보를 이어간 판정', name:comboHero.displayName, meta:`${comboHero.comboAfter || 0}콤보 · +${comboHero.gained || 0}점`, desc:`${comboHero.faction} 판정 성공` });
    if (fastestCorrect) cards.push({ icon:'⚡', title:'가장 빠른 정확 판정', name:fastestCorrect.displayName, meta:`${fastestCorrect.elapsed.toFixed(1)}초`, desc:`${fastestCorrect.difficulty} · ${fastestCorrect.faction}` });
    if (longest) cards.push({ icon:'🔎', title:'가장 오래 고민한 판정', name:longest.displayName, meta:`${longest.elapsed.toFixed(1)}초`, desc:longest.correct ? '끝까지 살펴 정확히 판정' : `정답은 ${longest.faction}` });
    if (final) cards.push({ icon:'👑', title:'성종의 마지막 중요 심사', name:final.displayName, meta:final.correct ? '정확 판정' : '오판', desc:`${final.faction} · ${final.gained || 0}점 획득` });
    cards.slice(0,4).forEach((c) => {
      const el = document.createElement('div');
      el.className = 'replay-card';
      el.innerHTML = `<span class="replay-icon">${c.icon}</span><div><small>${escapeHtml(c.title)}</small><b>${escapeHtml(c.name)}</b><em>${escapeHtml(c.meta)}</em><p>${escapeHtml(c.desc)}</p></div>`;
      list.appendChild(el);
    });
  }

  function renderWrongReview() {
    const wrongs = state.decisions.filter((d) => !d.correct);
    $('#wrong-review-count').textContent = `${wrongs.length}명`;
    const list = $('#wrong-review-list');
    list.innerHTML = '';
    if (!wrongs.length) {
      list.innerHTML = '<div class="review-card"><div class="review-head"><b>완벽한 심사!</b><span>오답 없음</span></div><p>이번 판에서는 틀린 판정이 없습니다.</p></div>';
      return;
    }
    wrongs.forEach((d) => {
      const card = document.createElement('div');
      card.className = 'review-card';
      const decisive = d.documents
        .filter((x) => x.type !== '특이사항')
        .slice(0, 2)
        .map((x) => `${x.type}: ${x.text}`)
        .join('\n');
      card.innerHTML = `
        <div class="review-head"><b>${escapeHtml(d.displayName)}</b><span>${escapeHtml(d.difficulty)}</span></div>
        <div class="review-answer"><i class="wrong">내 판정 ${escapeHtml(d.chosen)}</i><i class="right">정답 ${escapeHtml(d.faction)}</i></div>
        <p>${escapeHtml(simplifyHistoricalText(d.feedback || '결정적 단서를 다시 확인해 보세요.'))}</p>
        <div class="review-docs">${escapeHtml(decisive).replace(/\n/g, '<br>')}</div>
      `;
      list.appendChild(card);
    });
  }

  function finishGame(timedOut) {
    if (!state.gameActive && !state.timer) return;
    state.gameActive = false;
    clearAdvanceTimers();
    if (state.feedbackPauseTimer) clearTimeout(state.feedbackPauseTimer);
    state.feedbackPauseTimer = null;
    state.feedbackPaused = false;
    state.feedbackPauseStarted = 0;
    clearInterval(state.timer);
    state.timer = null;
    clearRecoveryState();

    const reviewed = state.reviewed;
    const accuracy = reviewed ? Math.round((state.correct / reviewed) * 100) : 0;
    const avgDecision = reviewed ? state.totalDecisionTime / reviewed : 0;
    const hungu = state.decisions.filter((d) => d.faction === '훈구');
    const sarim = state.decisions.filter((d) => d.faction === '사림');
    const factionAccuracy = (arr) => arr.length ? Math.round(arr.filter((d) => d.correct).length / arr.length * 100) : 0;
    const fastest = state.decisions.length ? [...state.decisions].sort((a,b) => a.elapsed - b.elapsed)[0] : null;
    const slowest = state.decisions.length ? [...state.decisions].sort((a,b) => b.elapsed - a.elapsed)[0] : null;
    const rushedCount = state.decisions.filter((d) => d.rushed).length;
    const eventCount = state.decisions.filter((d) => d.specialEvent).length;
    const specialSuccessCount = state.decisions.filter((d) => d.specialEvent && d.specialReviewPassed).length;
    const suddenEventCount = state.roster.filter((a) => a.suddenEventResolved).length;
    let ranks = getRankings();
    let pos = 0;
    let isNewBest = false;

    if (!state.testMode && state.runRankEligible) {
      const previousBest = ranks[0]?.score ?? -1;
      const entry = {
        name: state.nickname,
        score: state.score,
        accuracy,
        combo: state.maxCombo,
        remaining: state.seconds,
        reviewed,
        seed: state.currentSeed,
        date: new Date().toISOString()
      };
      ranks = saveRanking(entry);
      pos = ranks.findIndex((r) => r.date === entry.date) + 1;
      isNewBest = state.score > previousBest;
      submitSharedRanking(entry, { specialSuccess: specialSuccessCount, suddenEvents: suddenEventCount }).then(() => {
        setTimeout(async () => {
          await refreshSharedRankings(false);
          updateResultSharedRankMessage(entry);
        }, 700);
      });
    }

    $('#result-score').textContent = '0';
    $('#result-accuracy').textContent = `${accuracy}%`;
    $('#result-combo').textContent = state.maxCombo;
    $('#result-time').textContent = fmtTime(state.seconds);
    $('#result-average').textContent = `${avgDecision.toFixed(1)}초`;
    $('#result-penalty').textContent = `${state.wrong}회`;
    const grade = getGrade(accuracy, state.score);
    $('#result-grade').textContent = grade;
    const gradeArt = $('#result-grade-art');
    if (gradeArt) { gradeArt.src = GRADE_ART[grade] || GRADE_ART['견습 심사관']; gradeArt.alt = `${grade} 등급`; }
    $('#result-hungu-accuracy').textContent = `${factionAccuracy(hungu)}%`;
    $('#result-sarim-accuracy').textContent = `${factionAccuracy(sarim)}%`;
    $('#result-fastest').textContent = fastest ? fastest.displayName : '-';
    $('#result-fastest-time').textContent = fastest ? `${fastest.elapsed.toFixed(1)}초` : '-';
    $('#result-slowest').textContent = slowest ? slowest.displayName : '-';
    $('#result-slowest-time').textContent = slowest ? `${slowest.elapsed.toFixed(1)}초` : '-';
    $('#result-rushed').textContent = `${rushedCount}회`;
    $('#result-events').textContent = `${eventCount}명`;
    const specialSuccessEl = $('#result-special-success'); if (specialSuccessEl) specialSuccessEl.textContent = `성공 ${specialSuccessCount}명`;
    const suddenResultEl = $('#result-sudden-events'); if (suddenResultEl) suddenResultEl.textContent = `${suddenEventCount}회`;
    updateCollectionProgress();
    $('#result-performance-message').textContent = performanceMessage(accuracy, state.maxCombo, rushedCount, state.wrong);
    setAchievement('#achievement-accuracy', accuracy >= 90, '정확', accuracy >= 90 ? '90% 이상 달성' : '목표 90%');
    setAchievement('#achievement-combo', state.maxCombo >= 8, '연속', state.maxCombo >= 8 ? '8콤보 이상 달성' : '목표 8콤보');
    setAchievement('#achievement-careful', rushedCount === 0, '신중', rushedCount === 0 ? '성급한 판정 0' : `성급한 판정 ${rushedCount}회`);
    $('#screen-result').dataset.tier = resultTier(accuracy, state.score, state.maxCombo);
    $('#result-title').textContent = timedOut ? '종이 울렸다!' : '판결 완료';
    $('#result-subtitle').textContent = `${reviewed}명 심사 · ${state.correct}명 정확 판정 · 심사번호 ${state.currentSeed}`;
    $('#result-rank-message').textContent = state.testMode
      ? '교사용 테스트 모드이므로 순위에는 기록되지 않습니다.'
      : (!state.runRankEligible ? '복구된 심사는 공정성을 위해 명예의 전당에 반영되지 않습니다.' : (sharedApiConfigured() ? '기록을 Google Sheets에 전송하고 공용 순위를 확인하는 중입니다...' : (pos ? `이 기기 임시 기록 ${pos}위입니다.` : '명예의 전당 TOP 20 진입에 도전해보세요.')));

    renderReplayCards();
    renderWrongReview();
    const rankingView = state.sharedRankingLoaded ? state.sharedRankings : ranks;
    renderRanking($('#result-ranking-list'), rankingView);
    renderRanking($('#leaderboard-list'), rankingView);
    showScreen('result');
    playBgmKey('result', { restart: true });
    requestAnimationFrame(() => animateNumber($('#result-score'), state.score, 620));

    const banner = $('#record-banner');
    banner.className = 'record-banner';
    banner.innerHTML = '';
    if (state.testMode) {
      banner.textContent = '교사용 테스트 모드';
      requestAnimationFrame(() => banner.classList.add('show'));
    } else if (!state.runRankEligible) {
      banner.textContent = '복구된 심사 · 순위 미반영';
      requestAnimationFrame(() => banner.classList.add('show'));
    } else if (pos === 1 && isNewBest) {
      banner.innerHTML = '<img src="assets/results/new_record.webp" alt="신기록"><span>명예의 전당 1위!</span>';
      requestAnimationFrame(() => banner.classList.add('show', 'first', 'image-record-banner'));
      setTimeout(() => { ensureAudio(); beep('good'); }, 180);
    } else if (pos > 0) {
      banner.innerHTML = `<img src="assets/results/hall_of_fame.webp" alt="명예의 전당 진입"><span>현재 ${pos}위</span>`;
      requestAnimationFrame(() => banner.classList.add('show', 'image-record-banner'));
    }
  }

  function validateProfileBalance() {
    const problems = [];
    let simulationFailures = 0;
    let answerLeaks = 0;
    (window.PROFILES || []).forEach((profile, pi) => {
      const coreDocs = profile.documents.filter((d) => d.clueKinds?.includes('핵심'));
      if (coreDocs.length < 2) problems.push(`${profile.profileId}: 핵심 단서 문서 ${coreDocs.length}개`);
      for (let run = 0; run < 30; run++) {
        const rng = mulberry32((pi + 1) * 1000 + run + 17);
        const chosen = chooseDocs(profile, rng);
        const cores = chosen.filter((d) => d.clueKinds?.includes('핵심')).length;
        if (cores < 2) simulationFailures += 1;
      }
      profile.documents.forEach((d) => {
        if (/정답\s*[:：]?\s*(훈구|사림)/.test(d.gameText || '')) answerLeaks += 1;
      });
    });
    const report = $('#balance-report');
    if (!report) return;
    const total = window.PROFILES?.length || 0;
    const ok = !problems.length && simulationFailures === 0 && answerLeaks === 0;
    report.className = `balance-report teacher-wide ${ok ? 'ok' : 'warn'}`;
    report.innerHTML = ok
      ? `검사 완료 · ${total}개 프로필 / 30회씩 랜덤 조합<br><b>판단 불가 조합 0건 · 직접 정답 노출 0건</b>`
      : `검사 완료 · ${total}개 프로필<br><b>구조 경고 ${problems.length}건 · 랜덤 실패 ${simulationFailures}건 · 정답 노출 ${answerLeaks}건</b>${problems.length ? `<br>${escapeHtml(problems.slice(0,5).join(' / '))}` : ''}`;
  }

  function updateMainModeInfo() {
    const chip = $('#ranking-mode');
    const seedEl = $('#main-round-seed');
    if (state.testMode) {
      chip.textContent = '교사용 테스트';
      chip.classList.add('teacher-mode-chip');
      seedEl.textContent = state.testSettings.seed || '테스트 자동';
    } else {
      chip.textContent = sharedApiConfigured() ? '공용 TOP 20' : '기기 임시 기록';
      chip.classList.remove('teacher-mode-chip');
      seedEl.textContent = String(state.nextSeed);
    }
  }

  function openTeacherMenu() {
    const modal = $('#teacher-modal');
    modal.classList.add('open');
    modal.setAttribute('aria-hidden', 'false');
    $('#teacher-count').value = String(state.testSettings.count);
    $('#teacher-time').value = String(state.testSettings.seconds);
    $('#teacher-difficulty').value = state.testSettings.difficulty;
    $('#teacher-seed').value = state.testSettings.seed || '';
    beep('tap');
  }

  function closeTeacherMenu() {
    const modal = $('#teacher-modal');
    modal.classList.remove('open');
    modal.setAttribute('aria-hidden', 'true');
  }

  function applyTeacherSettings() {
    state.testMode = true;
    state.testSettings = {
      count: Number($('#teacher-count').value) || 20,
      seconds: Number($('#teacher-time').value) || 300,
      difficulty: $('#teacher-difficulty').value || '혼합',
      seed: $('#teacher-seed').value.trim()
    };
    updateMainModeInfo();
    closeTeacherMenu();
  }

  function disableTeacherMode() {
    state.testMode = false;
    state.testSettings = { count: 20, seconds: 300, difficulty: '혼합', seed: '' };
    state.nextSeed = randomSeed();
    updateMainModeInfo();
    closeTeacherMenu();
  }

  function clearRanking() {
    localStorage.removeItem(CONFIG.RANKING_STORAGE_KEY);
    renderRanking($('#leaderboard-list'), []);
    renderRanking($('#result-ranking-list'), []);
    if (sharedApiConfigured()) setTimeout(() => refreshSharedRankings(false), 200);
    showToast('기기 내 순위 기록을 초기화했습니다.', 'warn');
  }

  function initializeRoundSeed() {
    const urlSeed = new URLSearchParams(location.search).get('seed');
    if (urlSeed && /^\d{1,9}$/.test(urlSeed)) state.nextSeed = Number(urlSeed);
    updateMainModeInfo();
  }

  /* ---------- events ---------- */
  function validateStudentName(value) {
    return /^\d{4}\s+\S{2,}$/.test(value.trim());
  }

  function setNicknameHelp(isError = false) {
    const help = $('#nickname-help');
    if (!help) return;
    help.textContent = isError
      ? '학번 4자리와 이름을 띄어 입력해 주세요. 예) 3130 홍길동'
      : '학번 4자리와 이름을 띄어 써 주세요. 예) 3130 홍길동';
    help.classList.toggle('error', isError);
  }

  $('#btn-start').addEventListener('click', () => {
    const input = $('#nickname');
    const value = input.value.trim().replace(/\s+/g, ' ');
    if (!validateStudentName(value)) {
      setNicknameHelp(true);
      input.focus();
      return;
    }
    setNicknameHelp(false);
    input.value = value;
    ensureAudio();
    state.nickname = value;
    state.prologueIndex = 0;
    renderPrologue();
    showScreen('prologue');
    playBgmKey('prologue', { restart: true });
  });

  $('#nickname').addEventListener('input', () => setNicknameHelp(false));
  $('#nickname').addEventListener('keydown', (e) => {
    if (e.key === 'Enter') $('#btn-start').click();
  });

  $('#btn-prologue-next').addEventListener('click', () => {
    if (state.prologueIndex < PROLOGUE.length - 1) {
      state.prologueIndex += 1;
      renderPrologue();
    } else {
      resetTutorial();
      showScreen('tutorial');
      playBgmKey('review', { restart: true });
    }
  });

  $('[data-action="skip-prologue"]').addEventListener('click', () => {
    resetTutorial();
    showScreen('tutorial');
    playBgmKey('review', { restart: true });
  });

  $('[data-action="skip-tutorial"]').addEventListener('click', prepareGame);
  $$('.tutorial-stamp').forEach((b) => b.addEventListener('click', () => selectTutorialStamp(b.dataset.tutorialFaction)));
  $$('.stamp-choice').forEach((b) => b.addEventListener('click', () => selectStamp(b.dataset.faction)));
  const zoomBtn = $('#btn-zoom-doc');
  if (zoomBtn) zoomBtn.addEventListener('click', openDocModal);
  const prevDocBtn = $('#btn-doc-prev');
  const nextDocBtn = $('#btn-doc-next');
  if (prevDocBtn) prevDocBtn.addEventListener('click', () => { if (!state.locked) cycleModalDoc(-1); });
  if (nextDocBtn) nextDocBtn.addEventListener('click', () => { if (!state.locked) cycleModalDoc(1); });
  let pileSwipeStartX = null;
  const pileEl = $('#doc-pile');
  if (pileEl) {
    pileEl.addEventListener('pointerdown', (e) => { pileSwipeStartX = e.clientX; });
    pileEl.addEventListener('pointerup', (e) => {
      if (pileSwipeStartX == null || state.locked) return;
      const dx = e.clientX - pileSwipeStartX;
      pileSwipeStartX = null;
      if (Math.abs(dx) < 38) return;
      cycleModalDoc(dx < 0 ? 1 : -1);
    });
  }
  $$('[data-close-doc]').forEach((el) => el.addEventListener('click', closeDocModal));
  $('#btn-modal-prev').addEventListener('click', () => cycleModalDoc(-1));
  $('#btn-modal-next').addEventListener('click', () => cycleModalDoc(1));
  let modalSwipeStartX = null;
  const modalSheet = $('.document-modal-sheet');
  modalSheet.addEventListener('pointerdown', (e) => { modalSwipeStartX = e.clientX; });
  modalSheet.addEventListener('pointerup', (e) => {
    if (modalSwipeStartX == null) return;
    const dx = e.clientX - modalSwipeStartX;
    modalSwipeStartX = null;
    if (Math.abs(dx) < 45) return;
    cycleModalDoc(dx < 0 ? 1 : -1);
  });
  $('#btn-retry').addEventListener('click', () => {
    if (!(state.testMode && state.testSettings.seed)) state.nextSeed = randomSeed();
    prepareGame();
  });
  $('#btn-home').addEventListener('click', () => {
    if (!state.testMode) state.nextSeed = randomSeed();
    updateMainModeInfo();
    checkRecoveryAvailability();
    showScreen('main');
  });

  const refreshRankingBtn = $('#btn-refresh-ranking');
  if (refreshRankingBtn) refreshRankingBtn.addEventListener('click', () => refreshSharedRankings(true));
  const resultRefreshRankingBtn = $('#btn-result-refresh-ranking');
  if (resultRefreshRankingBtn) resultRefreshRankingBtn.addEventListener('click', () => refreshSharedRankings(true));

  $('#btn-settings').addEventListener('click', openSettings);
  $$('[data-close-settings]').forEach((el) => el.addEventListener('click', closeSettings));
  $('#setting-sound').addEventListener('change', (e) => {
    state.settings.sound = e.target.checked;
    saveSettings();
    if (state.settings.sound) {
      unlockBgm();
      beep('tap');
    } else {
      pauseBgm();
    }
  });
  $('#setting-vibration').addEventListener('change', (e) => {
    state.settings.vibration = e.target.checked;
    saveSettings();
  });
  $('#btn-recover').addEventListener('click', restoreGameFromRecovery);
  $('#btn-discard-recovery').addEventListener('click', () => {
    clearRecoveryState();
    checkRecoveryAvailability();
  });

  let teacherHoldTimer = null;
  const titleLogo = $('#title-logo');
  titleLogo.addEventListener('pointerdown', () => {
    titleLogo.classList.add('teacher-hold');
    teacherHoldTimer = setTimeout(() => {
      openTeacherMenu();
      titleLogo.classList.remove('teacher-hold');
    }, 1200);
  });
  ['pointerup','pointercancel','pointerleave'].forEach((evt) => titleLogo.addEventListener(evt, () => {
    clearTimeout(teacherHoldTimer);
    titleLogo.classList.remove('teacher-hold');
  }));
  $$('[data-close-teacher]').forEach((el) => el.addEventListener('click', closeTeacherMenu));
  $('#btn-teacher-apply').addEventListener('click', applyTeacherSettings);
  $('#btn-teacher-disable').addEventListener('click', disableTeacherMode);
  $('#btn-balance-check').addEventListener('click', validateProfileBalance);
  $('#btn-clear-ranking').addEventListener('click', () => {
    localStorage.removeItem(CONFIG.RANKING_STORAGE_KEY);
    renderRanking($('#leaderboard-list'), []);
    const btn = $('#btn-clear-ranking');
    const old = btn.textContent;
    btn.textContent = '초기화 완료';
    setTimeout(() => { btn.textContent = old; }, 900);
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      closeDocModal();
      closeTeacherMenu();
      closeSettings();
    }
  });

  // 실제 시간이 기준이므로 백그라운드 탭에서도 남은 시간은 공정하게 흐른다.
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      if (state.gameActive) saveRecoveryState();
      pauseBgm();
      return;
    }
    if (state.gameActive) syncRoundTimer();
    if (state.settings.sound && bgmUnlocked) syncBgmForScreen(activeScreenId());
  });

  window.addEventListener('beforeunload', (e) => {
    if (!state.gameActive) return;
    saveRecoveryState();
    e.preventDefault();
    e.returnValue = '';
  });

  history.replaceState({ seongjong: true }, '', location.href);
  history.pushState({ seongjong: true }, '', location.href);
  window.addEventListener('popstate', () => {
    if (state.gameActive) {
      const leave = window.confirm('심사 중입니다. 메인 화면으로 돌아가면 현재 기록은 사라집니다. 종료할까요?');
      if (!leave) {
        history.pushState({ seongjong: true }, '', location.href);
        return;
      }
      state.gameActive = false;
      clearAdvanceTimers();
      if (state.feedbackPauseTimer) clearTimeout(state.feedbackPauseTimer);
      state.feedbackPauseTimer = null;
      state.feedbackPaused = false;
      state.feedbackPauseStarted = 0;
      clearInterval(state.timer);
      state.timer = null;
      clearRecoveryState();
      showScreen('main');
      updateMainModeInfo();
    }
  });

  // 모바일 브라우저의 자동재생 제한을 피하기 위해 첫 사용자 입력에서 음악 재생 권한을 연다.
  const unlockMusicOnce = () => {
    if (!bgmUnlocked && state.settings.sound) unlockBgm();
  };
  document.addEventListener('pointerdown', unlockMusicOnce, { once:true, passive:true });
  document.addEventListener('keydown', unlockMusicOnce, { once:true });

  loadSettings();
  bgmCurrentKey = 'main';
    const modalDocTextEl = $('#modal-doc-text');
  if (modalDocTextEl) modalDocTextEl.addEventListener('scroll', refreshModalScrollHint, { passive: true });

renderRanking($('#leaderboard-list'));
refreshSharedRankings(false);
  updateCollectionProgress();
  checkRecoveryAvailability();
  renderPrologue();
  resetTutorial();
  initializeRoundSeed();
})();
