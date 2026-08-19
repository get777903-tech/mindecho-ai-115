/* ==========================================================================
   MindEcho AI 2026 — Main Application Engine (mindecho-ai-113)
   Admin Analytics Dashboard + Full Click Tracking + Scroll/Time Metrics
   ========================================================================== */

// Supabase Configuration
const supabaseUrl = 'https://yslrofsjeujsftlabuqn.supabase.co/rest/v1/analytics_events';
const supabaseKey = 'sb_publishable_tnc4wA3Cr-FtaDyjVz9Q6Q_fklMPSDr';

// Audio Track File Names & External Repositories
const MEDITATION_AUDIO_SRC = "meditation1.mp3";
const MORNING_AUDIO_STANDARD_URL = "https://raw.githubusercontent.com/get777903-tech/mindecho-ai-115/main/audio/meditation%20good%20morning1.mp3";


// Unique session ID for this visit
const SESSION_ID = 'sess_' + Math.random().toString(36).substr(2, 9) + '_' + Date.now();

// Analytics tracking state
const analyticsState = {
  pageStartTime: Date.now(),
  maxScrollDepth: 0,
  engagedTimers: { 30: false, 60: false, 120: false },
  pricingViewed: false
};

// Global Application State
const appState = {
  lang: 'ru',
  isRecording: false,
  mediaRecorder: null,
  recordedChunks: [],
  recordedAudioUrl: null,
  isPlayingAudio: false,
  isAnnualBilling: false,
  selectedPlan: 'Premium',
  selectedPrice: 14.99,
  audioTrack: null,
  currentCustDevScenario: 'burnout',
  signatureCanvas: null,
  signatureCtx: null,
  isDrawingSignature: false
};

// Initialize Signature Canvas & Setup Listeners on Load
document.addEventListener('DOMContentLoaded', () => {
  setupScrollListener();
  registerServiceWorker();
  initAudioPlayer();
  initSignatureCanvas();
  initAnalyticsTracking();
  loadLatestParentVoiceFromSupabase();
});

// Initialize Audio Element
function initAudioPlayer() {
  appState.audioTrack = new Audio(MEDITATION_AUDIO_SRC);

  appState.audioTrack.addEventListener('timeupdate', () => {
    if (appState.audioTrack && appState.audioTrack.duration) {
      const progress = (appState.audioTrack.currentTime / appState.audioTrack.duration) * 100;
      document.getElementById('player-progress').style.width = `${progress}%`;
      
      const currentMin = Math.floor(appState.audioTrack.currentTime / 60);
      const currentSec = Math.floor(appState.audioTrack.currentTime % 60).toString().padStart(2, '0');
      document.getElementById('player-time').innerText = `${currentMin}:${currentSec}`;
    }
  });

  appState.audioTrack.addEventListener('ended', () => {
    appState.isPlayingAudio = false;
    document.getElementById('play-btn').innerText = "▶";
    document.getElementById('player-progress').style.width = "100%";
  });
}

// Internationalization Dictionary (RU, EN, HE)
const translations = {
  ru: {
    nav_mission: "Миссия",
    nav_modes: "Эмоциональная помощь",
    nav_generator: "Студия",
    nav_pricing: "Тарифы",
    nav_nda: "DISCLAIMER",
    nav_custdev: "🎁 Опрос + подарок",
    btn_login: "Войти",
    sticky_text: "Инвестируйте в гармонию семьи от $7/мес",
    btn_choose_plan: "Выбрать тариф",
    hero_badge: "ИИ + Детская Нейропсихология + КПТ/ACT + Эмоциональная безопасность",
    hero_title: "Превращаем родительскую рутину в <span class=\"text-gradient\">бережную психологическую поддержку</span>",
    hero_subtitle: "Экосистема эмоциональной безопасности семьи и превентивная психологическая поддержка детей родным голосом. Легальный способ сохранить эмоциональные ресурсы родителей и вырастить счастливого ребенка.",
    btn_try_free: "✨ Попробовать! Сказка для расслабления с голосом мамы, папы или бабушки",
    btn_try_free_sub: "мягко растворяет дневной стресс, снятие тревог и развитие эмоционального интеллекта (EQ) ребенка прямо в процессе засыпания .",
    btn_games: "🎮 Игры развивающие речь + эмоциональный интеллект",
    btn_games_combined: "🎮 Игры развивающая речь и эмоциональный интеллект",
    btn_prayer: "🙏 Создание молитвы-медитации",
    trust_privacy: "🛡 Privacy-First (Банковское шифрование)",
    trust_supervisor: "🧠 Валидировано Агентом-Супервизором",
    trust_global: "🌏 платформа для каждого и всего мира",
    hero_card_sub: "Самый родной и успокаивающий голос • Без музыки",
    hero_sample_quote: "\"Закрой глаза и обрати внимание на свой нос... Почувствуй тихую и спокойную радость внутри...\"",
    hero_card_footer: "✨ Персонализированный рассказ для расслабления",
    tag_supermission: "Супермиссия MindEcho AI",
    title_supermission: "Студия Медитации разработка на основе методов детской нейропсихологии",
    sub_supermission: "Мы создаем не просто IT проект, а самую защищенную экосистему для ментального здоровья и эмоциональной безопасности семей во всем мире.",
    m1_title: "1. платформа для каждого и всего мира",
    m1_tag: "CBT & ACT Framework. Нейропсихологический подход к эмоциональной саморегуляции ребенка",
    m2_title: "2. Гармония в семье и развитие эмоционального интеллекта",
    m2_desc: "Прогрессивные аудиорежимы и геймификация привычек исключают из жизни семьи истерики, упреки и обиды, мягко повышая эмоциональный интеллект (EQ) и укрепляя авторитет родителей.",
    m2_tag: "гармония в семье и развитие эмоционального интеллекта",
    m3_title: "3. Сбережение энергии родителей",
    m3_desc: "Защищаем родителей от выгорания, гарантируя 1–2 часа личного времени в день, а детей — от ментального перенапряжения, сохраняя силы для искренней радости и живого общения на основе практик развивающей нейропсихологии. Одобрено детскими нейропсихологами",
    m3_tag: "Освобождение 1-2 часа личного времени на основе практик развивающей нейропсихологии ",
    m4_title: "4. Развитие эмоционального интеллекта (EQ)",
    m4_desc: "Мягко снимаем дневной стресс, тревоги и обиды ребенка прямо в процессе засыпания, программируя его на абсолютную уверенность в себе и психологическую устойчивость.",
    m4_tag: "CBT & ACT Framework. Нейропсихологический подход к эмоциональной саморегуляции ребенка",
    footer_legal_title: "Конфиденциальность",
    btn_quick_test: "▶️ Быстрое тестирование рассказа-медитации (Включить аудио)",
    mic_story_reader_title: "📖 Текст для чтения вслух при записи (читать медленно с паузами):",
    btn_toggle_story_text: "Развернуть весь текст 📖",
    btn_toggle_story_text_collapse: "Свернуть текст 🔼",
    story_snippet_text: "«…Я хочу взять тебя с собой в небольшое путешествие… в волшебное место, где мысли становятся реальностью… Слушай меня внимательно, расслабься… и давай отправимся в путь…»",
    story_full_text: "«…Я хочу взять тебя с собой в небольшое путешествие… в волшебное место, где мысли становятся реальностью… Слушай меня внимательно, расслабься… и давай отправимся в путь…<br><br>…Закрой глаза… и начни дышать спокойно и ровно… Почувствуй, как приятное тепло разливается по всему телу… Ощути пространство вокруг себя… оно мягкое, доброе и безопасное… словно невидимое облако уюта…<br><br>…А теперь представь самое красивое и спокойное место на свете… Найди его мысленно и побудь там… Знай, что в этом месте мама и папа всегда рядом с тобой… мы тебя очень-очень сильно любим и так рады, что ты у нас есть…<br><br>…В этом волшебном мире ты — настоящая волшебница… Здесь всё, во что ты веришь, обязательно сбывается… Поверь всем сердцем, что ты очень умная и легко учишься новому… Поверь, что твое тело сильное и здоровое…<br><br>…Пусть все неприятности растают, как снег под ласковым солнышком… С каждым твоим длинным выдохом… все страхи и тревоги просто испаряются…<br><br>…Поверь в себя… Ты можешь стать кем захочешь и достичь любых высот… Ощути свою уникальность, ведь ты — настоящее сокровище… И помни: что бы ни случилось в жизни, наша любовь всегда будет защищать тебя…<br><br>…А теперь давай научим твое тело новым, чудесным чувствам… Почувствуй прямо сейчас, каково это — быть совершенно храброй и бесстрашной… Почувствуй, как это — быть абсолютно свободной и счастливой… Ощути внутри себя безграничную энергию и вдохновение…<br><br>…Положи руку на сердце… прислушайся к его ритму… Поблагодари свою жизнь, которая полна удивительных приключений и радости… Улыбнись мысленно… и почувствуй огромную нежность к самой себе…<br><br>…Сохрани это мягкое состояние покоя и уверенности… Сделай глубокий вдох… сладко-сладко потянись всем телом… и медленно открой глаза с широкой улыбкой… Завтра тебя ждет чудесный и очень счастливый день…»",
    tag_modes: "Быстрый запуск позитивных изменений",
    title_modes: "4 Специализированных Режима Эмоциональной Помощи и Поддержки",
    sub_modes: "Выберите требуемый сценарий для мгновенной генерации сказки для расслабления или помощи",
    mode_morning_title: "Утренняя настройка",
    mode_morning_desc: "Заряд бодрости, веры в свои силы, лёгкости в учебе и радости перед новым днем.",
    btn_start_morning: "Запустить утренний настрой",
    mode_bedtime_title: "Сказка перед сном",
    mode_bedtime_desc: "Мягкий уход в сон, снятие дневных обид, растворение тревог и выработка глубинного покоя.",
    btn_start_bedtime: "Запустить режим расслабления перед сном",
    mode_prayer_title: "Молитва-медитация",
    mode_prayer_desc: "Духовный покой, благодарность, умиротворение и благословение светлого настроя для семьи.",
    btn_start_prayer: "Включить Молитву-Медитацию",
    mode_emergency_title: "Экстренная помощь при истерике",
    mode_emergency_desc: "Мгновенный 4-шаговый алгоритм для родителя + экспресс-генерация аудио для заземления ребенка.",
    btn_start_emergency: "🚨 Активировать скорую помощь",
    em_header: "🚨 Экстренный протокол: Помощь при истерике",
    em_step1_title: "Ваша выдержка",
    em_step1_desc: "Сделайте глубокий вдох. Вы — спокойный якорь безопасности для ребенка.",
    em_step2_title: "Безопасность",
    em_step2_desc: "Уберите острое, снизьте громкость голоса, присядьте на уровень глаз ребенка.",
    em_step3_title: "Легализация",
    em_step3_desc: "Тихо скажите: «Я вижу, что тебе очень тяжело и ты злишься. Я рядом».",
    em_step4_title: "Заземление",
    em_step4_desc: "Включите успокаивающее ИИ-аудио и дайте ребенку почувствовать ритм дыхания.",
    em_input_label: "Опишите в чем смысл ситуации (что произошло?):",
    btn_gen_emergency: "✨ Сгенерировать экспресс-аудио",
    tag_studio: "Студия Медитации - разработка на основе методов детской нейропсихологии",
    title_studio: "Персональный Рассказ-Медитация",
    sub_studio: "Запись вашего голоса + Студийная MP3 фонограмма + Динамическая ИИ-озвучка",
    label_child_name: "Имя ребенка:",
    label_child_gender: "Пол ребенка:",
    opt_girl: "Девочка",
    opt_boy: "Мальчик",
    label_child_age: "Возраст (лет):",
    label_audio_source: "Источник аудио-озвучки:",
    opt_source_parent: "🎙 голос мамы или папы",
    opt_source_mp3: "🎵 Студийная MP3 фонограмма",
    opt_source_tts: "🤖 Динамический ИИ-диктор (Низкий тембр)",
    label_voice_timbre: "Тембр и Голос озвучки:",
    opt_male_deep: "🎙 мужской - низкий спокойный голос",
    opt_female_calm: "🎙 женский спокойный голос",
    opt_generated_parent: "🎙 сгенерированный голос мамы или папы",
    label_meditation_mode: "Режим рассказа-медитации:",
    opt_mode_bedtime: "🌙 Перед сном (Засыпание)",
    opt_mode_morning: "☀️ Утренняя (Уверенность)",
    opt_mode_emergency: "🚨 Экстренная (Заземление)",
    opt_mode_prayer: "🙏 Молитва-медитация (Духовный покой)",
    label_mic_rec: "🎙 Запись голоса родителя (60 секунд для ElevenLabs):",
    mic_press_text: "Нажмите для записи голоса родителя или бабушки (60 секунд)",
    btn_generate: "✨ Создать рассказ-медитацию с голосом мамы, папы или бабушки",
    player_title_default: "Рассказ-Медитация",
    player_sub_default: "Самый родной и успокаивающий голос • Без музыки",
    tag_pricing: "Прозрачная монетизация",
    title_pricing: "Выберите Тариф Подписки",
    sub_pricing: "Freemium доступ + Лимиты генерации + Докупка минут",
    plan_title_free: "Free (Базовый)",
    plan_free_sub: "Ощутить ценность сервиса",
    plan_forever: "/ навсегда",
    pf_free_1: "✅ 2 AI-запроса в день",
    pf_free_2: "✅ Стандартный рассказ-медитация",
    pf_free_3: "✅ Озвучка спокойным приятным голосом",
    pf_free_3_extra: "✅ Нейрогимнастика и упражнения для баланса эмоций",
    pf_free_3_emergency: "✅ Экстренная помощь при истерике",
    pf_free_4: "❌ Нет сохранения истории",
    btn_plan_free: "Начать бесплатно",
    plan_title_basic: "Базовый",
    plan_basic_sub: "Для ежедневных подстроек",
    billing_monthly: "Ежемесячно",
    billing_annual: "Оплата за год <span class=\"discount-badge\">-67% Скидка</span>",
    plan_per_month: "/ месяц",
    pf_basic_1: "✅ 50 минут генераций в месяц",
    pf_basic_2: "✅ Персонализация под имя ребенка",
    pf_basic_3: "✅ Поддержка 3 языков (RU, EN, HE)",
    pf_basic_4: "✅ Сохранение истории голосов и рассказов",
    btn_plan_basic: "Выбрать Базовый",
    popular_badge: "🔥 Популярный выбор",
    plan_title_premium: "Премиум",
    plan_premium_sub: "Полный покой и гармония семьи",
    pf_prem_1: "✅ 120 минут генераций (~12 медитаций)",
    pf_prem_2: "✅ Экстренная помощь при истерике",
    pf_prem_3: "✅ Семейный доступ до 4 устройств",
    pf_prem_4: "✅ Приоритетная поддержка",
    btn_plan_premium: "Активировать Премиум",
    plan_title_platinum: "Платиновый",
    plan_plat_sub: "Максимальный ресурс и поддержка",
    pf_plat_1: "✅ 300 минут генерации аудио",
    pf_plat_2: "✅ Неограниченная библиотека медитаций",
    pf_plat_3: "✅ Персональный Агент-Супервизор",
    pf_plat_4: "✅ Семейный доступ до 8 устройств",
    btn_plan_platinum: "Активировать Платиновый",
    topup_tag: "⚡ Дополнительные минуты:",
    topup_title: "Пакет «Еще 50 минут медитаций»",
    topup_desc: "Закончился лимит подписки? Докупите 50 минут без смены тарифного плана.",
    btn_topup: "Докупить за $4.99",
    nda_title: "📜 Пользовательское соглашение (Terms of Service)",
    nda_sub: "ОТКАЗ ОТ ОТВЕТСТВЕННОСТИ И ОГРАНИЧЕНИЕ ПРЕТЕНЗИЙ (DISCLAIMER)",
    label_nda_name: "Ваше ФИО Подписанта:",
    label_auth_phone: "WhatsApp / Telegram (Обязательно):",
    label_nda_email: "Ваш E-mail адрес:",
    label_signature_canvas: "✍️ Поставьте подпись мышкой или пальцем ниже:",
    btn_clear_sig: "Очистить",
    btn_submit_nda: "✅ Принять и подписать NDA (Перейти к документу)",
    custdev_modal_title: "💬 Опрос + подарок: Помогите сделать продукт лучше",
    custdev_modal_sub: "Выберите интересующий вас сценарий, ответьте на 3 вопроса и получите свой подарок:",
    cd_btn_burnout: "🟢 1. Выгорание",
    cd_btn_tantrums: "🔵 2. Истерики",
    cd_btn_confidence: "🟡 3. Уверенность",
    cd_btn_expert: "🟣 4. Эксперт",
    label_custdev_phone: "WhatsApp / Telegram (Обязательно для получения подарка):",
    btn_submit_custdev: "🚀 Отправить ответы и получить подарок",
    modal_auth_title: "Вход в MindEcho AI",
    modal_auth_sub: "Сохраните настройки медитаций и статистику",
    btn_auth_google: "Вход через аккаунт Google",
    btn_auth_apple: "Вход через Apple ID",
    label_terms_agree: "Я согласен с Условиями использования и политикой конфиденциальности.",
    btn_auth_submit: "Войти / Зарегистрироваться",
    footer_brand_desc: "Глобальная инклюзивная экосистема для защиты ментального здоровья семей. ИИ, детская нейропсихология и КПТ.",
    footer_nav_title: "Навигация",
    legal_terms: "Условия использования",
    copyright_text: "© 2026 MindEcho AI Inc. Все права защищены.",
    link_admin_login: "🔐 Вход в административную часть \"admin\"",
    label_voice_consent: "Даю согласие на обработку записи голоса для клонирования ИИ",
    btn_edu_tutoring: "📚 ИИ репетиторство и Внешкольное образование",
    btn_edu_school: "🚀 Удалённая система образования",
    edu_tag_header: "🎓 Специализированные Тарифы Обучения",
    edu_title_header: "Внешкольное Обучение и Удалённая ИИ-Школа",
    edu_sub_header: "Многократное усиление развития достижений ребёнка по предметам без дорогих репетиторов за $50/час",
    edu_badge_tutoring: "📚 Предметное ИИ-Репетиторство",
    edu_title_tutoring: "Внешкольное Обучение",
    edu_sub_tutoring: "Выбор предмета для точечной ликвидации пробелов и многократного усиления развития достижений",
    edu_label_select_subject: "Выберите предмет для обучения:",
    edu_opt_english: "🇬🇧 Английский и другие языки",
    edu_opt_math: "📐 Математика",
    edu_opt_physics: "🔬 Физика",
    edu_opt_coding: "💻 Программирование",
    edu_opt_it_projects: "🚀 IT и интернет-проекты (Стартапы)",
    edu_cycle_monthly: "За месяц",
    edu_cycle_annual_tutoring: "За год <span class=\"discount-badge\">-$290 Скидка</span>",
    edu_discount_tutoring: "-$290 Скидка",
    edu_price_per_subject: "/ месяц за предмет",
    edu_annual_subtext_tutoring: "($65.8/мес)",
    edu_pf_tutoring_1: "✅ 15-минутная экспресс-ликвидация пробелов",
    edu_pf_tutoring_2: "✅ Многократное усиление развития уникальных талантов",
    edu_pf_tutoring_3: "✅ Беседы с ИИ-ассистентом репетитором",
    edu_pf_tutoring_4: "✅ Озвучка родным спокойным голосом родителя",
    edu_pf_tutoring_5: "✅ 3 часа учебы в день со 100% успеваемостью",
    edu_btn_order_tutoring: "💎 Выбрать предмет и оплатить ($90 / $790)",
    edu_badge_school: "🚀 Полноценная ИИ-Школа",
    edu_title_school: "Удалённое Школьное Обучение",
    edu_sub_school: "Полная автономная экосистема семейного обучения по всей школьной программе",
    edu_cycle_annual_school: "За год <span class=\"discount-badge\">-$820 Скидка</span>",
    edu_discount_school: "-$820 Скидка",
    edu_annual_subtext_school: "($408.3/мес)",
    edu_pf_school_1: "✅ Все школьные предметы (Языки, Математика, Физика, IT)",
    edu_pf_school_2: "✅ Учёба за 3 часа в день со 100% успеваемостью",
    edu_pf_school_3: "✅ ИИ-коуч состояний и защиты от выгорания",
    edu_pf_school_4: "✅ Развитие мышления Создателя (Creator Mindset)",
    edu_pf_school_5: "✅ Прозрачный дашборд для родителей в 1 клик",
    edu_btn_order_school: "🚀 Активировать Школьное Обучение ($340 / $4,900)"
  },
  en: {
    nav_mission: "Mission",
    nav_modes: "Emotional Support",
    nav_generator: "Studio",
    nav_pricing: "Pricing",
    nav_nda: "DISCLAIMER",
    nav_custdev: "🎁 Survey + Gift",
    btn_login: "Sign In",
    sticky_text: "Invest in family harmony from $7/mo",
    btn_choose_plan: "Choose Plan",
    hero_badge: "AI + Child Neuropsychology + CBT/ACT + Emotional Safety",
    hero_title: "Transforming parenting routine into <span class=\"text-gradient\">gentle psychological support</span>",
    hero_subtitle: "Family emotional safety ecosystem & preventive psychological support for children in a native voice. A legal way to save parents' resources and raise a happy child.",
    btn_try_free: "✨ Try it! Relaxation story with Mom's, Dad's, or Grandma's voice",
    btn_try_free_sub: "gently dissolves daytime stress, alleviates anxiety, and develops child's emotional intelligence (EQ) right during bedtime .",
    btn_games: "🎮 Speech development & Emotional Intelligence games",
    btn_games_combined: "🎮 Speech development & Emotional Intelligence games",
    btn_prayer: "🙏 Create Prayer-Meditation",
    trust_privacy: "🛡 Privacy-First (Bank-grade encryption)",
    trust_supervisor: "🧠 Validated by Supervisor AI Agent",
    trust_global: "🌏 Platform for everyone worldwide",
    hero_card_sub: "Native soothing voice • No background music",
    hero_sample_quote: "\"Close your eyes and focus on your breathing... Feel quiet and calm joy inside...\"",
    hero_card_footer: "✨ Personalized relaxation story",
    tag_supermission: "MindEcho AI Super-Mission",
    title_supermission: "Meditation Studio - developed based on child neuropsychology methods",
    sub_supermission: "We create not just an IT project, but the safest ecosystem for family mental wellness and emotional security worldwide.",
    m1_title: "1. Platform for everyone worldwide",
    m1_tag: "CBT & ACT Framework. Neuropsychological approach to child emotional self-regulation",
    m2_title: "2. Family harmony & emotional intelligence development",
    m2_desc: "Progressive audio modes and habit gamification eliminate tantrums, boosting emotional intelligence (EQ) and strengthening parents' authority.",
    m2_tag: "Family harmony and emotional intelligence development",
    m3_title: "3. Saving parents' energy",
    m3_desc: "Protecting parents from burnout with 1-2 hours of personal time daily, and children from mental stress based on developmental neuropsychology. Approved by child neuropsychologists.",
    m3_tag: "1-2 hours of personal time based on developmental neuropsychology",
    m4_title: "4. Emotional Intelligence (EQ) Development",
    m4_desc: "Gently relieving daytime stress, anxieties, and grievances during bedtime, fostering self-confidence and psychological resilience.",
    m4_tag: "CBT & ACT Framework. Neuropsychological approach to child emotional self-regulation",
    footer_legal_title: "Privacy & Confidentiality",
    btn_quick_test: "▶️ Quick Meditation Story Test (Play Audio)",
    mic_story_reader_title: "📖 Text for reading aloud while recording (read slowly with pauses):",
    btn_toggle_story_text: "Expand full text 📖",
    btn_toggle_story_text_collapse: "Collapse text 🔼",
    story_snippet_text: "“Know that Mom and Dad love you very much… Now let’s go to a friendly little place… Imagine there is a place in your mind… where you feel so good…”",
    story_full_text: "“Know that Mom and Dad love you very much… Now let’s go to a friendly little place… Imagine there is a place in your mind… where you feel so good… Find it and stay there for a while… Imagine the most beautiful and safe place you can imagine… where Mom and Dad are always by your side, helping you…<br><br>…Because this is the world you built yourself, where everything you believe in is true. This is the very world where everything really comes true… where thoughts become real and where everything you believe in can happen… Think about how in this place you are a true magician and everything obeys your will…<br><br>…Believe that you are smart, and that you learn very quickly and easily. Believe in this, and everything will come true. Feel confidence in your strength, think about how easily any new knowledge comes to you.<br><br>Believe that you are loved so very deeply, feel it with all your heart, and let your soul fill with happiness. Imagine a warm glow in your chest, breathe in this feeling of love with every cell, ... Mom and Dad are so glad to have you in their lives…”",
    tag_modes: "Quick Launch of Positive Changes",
    title_modes: "4 Specialized Modes of Emotional Help & Support",
    sub_modes: "Select a scenario for instant generation of relaxation stories or emergency support",
    mode_morning_title: "Morning Tune-up",
    mode_morning_desc: "Boost of energy, self-belief, ease in learning, and joy for the new day.",
    btn_start_morning: "Start Morning Tune-up",
    mode_bedtime_title: "Bedtime Story",
    mode_bedtime_desc: "Gentle transition into sleep, relieving daytime stress and cultivating deep peace.",
    btn_start_bedtime: "Start Bedtime Relaxation Mode",
    mode_prayer_title: "Prayer Meditation",
    mode_prayer_desc: "Spiritual peace, gratitude, serenity, and blessing of a bright mindset for the family.",
    btn_start_prayer: "Start Prayer-Meditation",
    mode_emergency_title: "Emergency Tantrum Relief",
    mode_emergency_desc: "Instant 4-step algorithm for parents + express AI audio generation for child grounding.",
    btn_start_emergency: "🚨 Activate Emergency Support",
    em_header: "🚨 Emergency Protocol: Tantrum Support",
    em_step1_title: "Your Composure",
    em_step1_desc: "Take a deep breath. You are a calm anchor of safety for your child.",
    em_step2_title: "Safety First",
    em_step2_desc: "Lower your voice, remove sharp items, get down to eye level with your child.",
    em_step3_title: "Validation",
    em_step3_desc: "Softly say: 'I see it's really hard right now and you're upset. I am here with you.'",
    em_step4_title: "Grounding",
    em_step4_desc: "Play soothing AI audio and guide your child into a steady breathing rhythm.",
    em_input_label: "Describe the situation (what happened?):",
    btn_gen_emergency: "✨ Generate Express Audio",
    tag_studio: "Meditation Studio - developed based on child neuropsychology methods",
    title_studio: "Personalized Meditation Story",
    sub_studio: "Voice recording + Studio MP3 track + Dynamic AI voiceover",
    label_child_name: "Child's Name:",
    label_child_gender: "Child's Gender:",
    opt_girl: "Girl",
    opt_boy: "Boy",
    label_child_age: "Age (years):",
    label_audio_source: "Audio Voice Source:",
    opt_source_parent: "🎙 Mom's or Dad's Voice",
    opt_source_mp3: "🎵 Studio MP3 Track",
    opt_source_tts: "🤖 Dynamic AI Narrator (Deep Voice)",
    label_voice_timbre: "Voice Timbre & Tone:",
    opt_male_deep: "🎙 Male - Deep Calm Voice",
    opt_female_calm: "🎙 Female Calm Voice",
    opt_generated_parent: "🎙 Generated Parent Voice",
    label_meditation_mode: "Meditation Mode:",
    opt_mode_bedtime: "🌙 Bedtime (Sleep)",
    opt_mode_morning: "☀️ Morning (Confidence)",
    opt_mode_emergency: "🚨 Emergency (Grounding)",
    opt_mode_prayer: "🙏 Prayer-Meditation (Spiritual Peace)",
    label_mic_rec: "🎙 Parent Voice Recording (60 seconds for ElevenLabs):",
    mic_press_text: "Click to record parent's or grandmother's voice (60 seconds)",
    btn_generate: "✨ Create meditation story with Mom's, Dad's, or Grandma's voice",
    player_title_default: "Meditation Story",
    player_sub_default: "Native soothing voice • No music",
    tag_pricing: "Transparent Monetization",
    title_pricing: "Select Subscription Plan",
    sub_pricing: "Freemium access + Generation limits + Top-up minutes",
    plan_title_free: "Free (Basic)",
    plan_free_sub: "Experience service value",
    plan_forever: "/ forever",
    pf_free_1: "✅ 2 AI requests per day",
    pf_free_2: "✅ Standard meditation story",
    pf_free_3: "✅ Voiceover in a calm, pleasant voice",
    pf_free_3_extra: "✅ Neurogymnastics & emotional balance exercises",
    pf_free_3_emergency: "✅ Emergency tantrum help",
    pf_free_4: "❌ No history storage",
    btn_plan_free: "Start Free",
    plan_title_basic: "Basic",
    plan_basic_sub: "For daily adjustments",
    billing_monthly: "Monthly",
    billing_annual: "Annual Billing <span class=\"discount-badge\">-67% OFF</span>",
    plan_per_month: "/ month",
    pf_basic_1: "✅ 50 generation minutes/month",
    pf_basic_2: "✅ Personalization with child's name",
    pf_basic_3: "✅ 3 Languages support (RU, EN, HE)",
    pf_basic_4: "✅ Voice & story history storage",
    btn_plan_basic: "Choose Basic",
    popular_badge: "🔥 Most Popular",
    plan_title_premium: "Premium",
    plan_premium_sub: "Total peace and family harmony",
    pf_prem_1: "✅ 120 generation minutes (~12 stories)",
    pf_prem_2: "✅ Emergency tantrum support",
    pf_prem_3: "✅ Family access up to 4 devices",
    pf_prem_4: "✅ Priority support",
    btn_plan_premium: "Activate Premium",
    plan_title_platinum: "Platinum",
    plan_plat_sub: "Maximum resources & VIP care",
    pf_plat_1: "✅ 300 audio generation minutes",
    pf_plat_2: "✅ Unlimited meditation library",
    pf_plat_3: "✅ Personal Supervisor AI Agent",
    pf_plat_4: "✅ Family access up to 8 devices",
    btn_plan_platinum: "Activate Platinum",
    topup_tag: "⚡ Additional Minutes:",
    topup_title: "Extra 50 Minutes Pack",
    topup_desc: "Reached your plan limit? Buy 50 extra minutes without changing your subscription.",
    btn_topup: "Buy for $4.99",
    nda_title: "📜 Terms of Service & User Agreement",
    nda_sub: "DISCLAIMER & LIMITATION OF LIABILITY",
    label_nda_name: "Your Full Name:",
    label_auth_phone: "WhatsApp / Telegram (Required):",
    label_nda_email: "Your E-mail address:",
    label_signature_canvas: "✍️ Sign with your mouse or finger below:",
    btn_clear_sig: "Clear",
    btn_submit_nda: "✅ Accept & Sign NDA (Proceed to document)",
    custdev_modal_title: "💬 Survey + Gift: Help us improve MindEcho AI",
    custdev_modal_sub: "Choose a scenario, answer 3 questions, and claim your gift:",
    cd_btn_burnout: "🟢 1. Burnout",
    cd_btn_tantrums: "🔵 2. Tantrums",
    cd_btn_confidence: "🟡 3. Confidence",
    cd_btn_expert: "🟣 4. Expert",
    label_custdev_phone: "WhatsApp / Telegram (Required to receive gift):",
    btn_submit_custdev: "🚀 Submit answers & receive gift",
    modal_auth_title: "Sign In to MindEcho AI",
    modal_auth_sub: "Save your meditation settings and progress",
    btn_auth_google: "Sign in with Google",
    btn_auth_apple: "Sign in with Apple ID",
    label_terms_agree: "I agree to Terms of Service and Privacy Policy.",
    btn_auth_submit: "Sign In / Register",
    footer_brand_desc: "Global inclusive ecosystem for family mental wellness. AI, child neuropsychology, and CBT.",
    footer_nav_title: "Navigation",
    legal_terms: "Terms of Use",
    copyright_text: "© 2026 MindEcho AI Inc. All rights reserved.",
    link_admin_login: "🔐 Admin Portal Login \"admin\"",
    label_voice_consent: "I consent to the processing of my voice recording for AI voice cloning",
    btn_edu_tutoring: "📚 AI Tutoring & Extracurricular Learning",
    btn_edu_school: "🚀 Remote AI School System",
    edu_tag_header: "🎓 Specialized Education Plans",
    edu_title_header: "Extracurricular Learning & Remote AI School",
    edu_sub_header: "Multiple enhancement of child academic achievements without expensive $50/hr tutors",
    edu_badge_tutoring: "📚 Subject AI Tutoring",
    edu_title_tutoring: "Extracurricular Learning",
    edu_sub_tutoring: "Choose a subject for targeted gap elimination & achievement acceleration",
    edu_label_select_subject: "Select a subject for tutoring:",
    edu_opt_english: "🇬🇧 English & World Languages",
    edu_opt_math: "📐 Mathematics",
    edu_opt_physics: "🔬 Physics",
    edu_opt_coding: "💻 Coding & Software",
    edu_opt_it_projects: "🚀 IT & Internet Startups",
    edu_cycle_monthly: "Monthly",
    edu_cycle_annual_tutoring: "Annual <span class=\"discount-badge\">-$290 Discount</span>",
    edu_discount_tutoring: "-$290 Discount",
    edu_price_per_subject: "/ month per subject",
    edu_annual_subtext_tutoring: "($65.8/mo)",
    edu_pf_tutoring_1: "✅ 15-minute express gap elimination",
    edu_pf_tutoring_2: "✅ Multiple enhancement of unique talents",
    edu_pf_tutoring_3: "✅ Interactive sessions with AI Tutor",
    edu_pf_tutoring_4: "✅ Native soothing parent voiceover",
    edu_pf_tutoring_5: "✅ 3 hours study/day with 100% excellence",
    edu_btn_order_tutoring: "💎 Select Subject & Pay ($90 / $790)",
    edu_badge_school: "🚀 Full AI Remote School",
    edu_title_school: "Remote School Education",
    edu_sub_school: "Complete autonomous home education ecosystem across K-12 curriculum",
    edu_cycle_annual_school: "Annual <span class=\"discount-badge\">-$820 Discount</span>",
    edu_discount_school: "-$820 Discount",
    edu_annual_subtext_school: "($408.3/mo)",
    edu_pf_school_1: "✅ All school subjects (Languages, Math, Physics, IT)",
    edu_pf_school_2: "✅ 3 hours/day studying with 100% academic success",
    edu_pf_school_3: "✅ AI State & Burnout Protection Coach",
    edu_pf_school_4: "✅ Fostering Creator Mindset",
    edu_pf_school_5: "✅ Transparent parent dashboard in 1 click",
    edu_btn_order_school: "🚀 Activate Remote School ($340 / $4,900)"
  },
  he: {
    nav_mission: "משימה",
    nav_modes: "תמיכה רגשית",
    nav_generator: "סטודיו",
    nav_pricing: "מחירון",
    nav_nda: "הצהרה",
    nav_custdev: "🎁 סקר + מתנה",
    btn_login: "התחברות",
    sticky_text: "השקיעו בהרמוניה משפחתית החל מ-$7 לחודש",
    btn_choose_plan: "בחר מסלול",
    hero_badge: "בינה מלאכותית + נוירופסיכולוגיה של הילד + CBT/ACT + בטיחות רגשית",
    hero_title: "הופכים את שגרת ההורות ל<span class=\"text-gradient\">תמיכה פסיכולוגית עדינה</span>",
    hero_subtitle: "מערכת אקולוגית לבטיחות רגשית של המשפחה ותמיכה פסיכולוגית מונעת לילדים בקול מוקלט. דרך חוקית לשמור על משאבי ההורים ולגדל ילד מאושר.",
    btn_try_free: "✨ נסו עכשיו! סיפור הרגעה בקולם של אמא, אבא או סבתא",
    btn_try_free_sub: "מפיג בעדינות מתח יומי, מפיג חרדות ומפתח את האינטליגנציה הרגשית (EQ) של הילד ישירות בזמן ההרדמה .",
    btn_games: "🎮 משחקים לפיתוח דיבור ואינטליגנציה רגשית",
    btn_games_combined: "🎮 משחקים לפיתוח דיבור ואינטליגנציה רגשית",
    btn_prayer: "🙏 יצירת מדיטציית תפילה",
    trust_privacy: "🛡 פרטיות תחילה (הצפנה בנקאית)",
    trust_supervisor: "🧠 מאומת על ידי סוכן מפקח AI",
    trust_global: "🌏 פלטפורמה לכולם ברחבי העולם",
    hero_card_sub: "קול מרגיע ומוכר • ללא מוזיקת רקע",
    hero_sample_quote: "\"עצום עיניים והתמקד בנשימה שלך... חוש שמחה שקטה ורגועה מבפנים...\"",
    hero_card_footer: "✨ סיפור הרגעה מותאם אישית",
    tag_supermission: "סופר-משימה של MindEcho AI",
    title_supermission: "סטודיו למדיטציה - פיתוח המבוסס על שיטות נוירופסיכולוגיה של הילד",
    sub_supermission: "אנו יוצרים לא רק פרויקט IT, אלא את המערכת האקולוגית המוגנת ביותר לבריאות נפשית ובטיחות רגשית של משפחות בעולם.",
    m1_title: "1. פלטפורמה לכולם ברחבי העולם",
    m1_tag: "מסגרת CBT & ACT. גישה נוירופסיכולוגית לוויסות רגשי של הילד",
    m2_title: "2. הרמוניה במשפחה ופיתוח אינטליגנציה רגשית",
    m2_desc: "מצבי שמע מתקדמים ומשחוק הרגלים מעלימים התקפי זעם, מחזקים אינטליגנציה רגשית (EQ) ומחזקים את סמכות ההורים.",
    m2_tag: "הרמוניה במשפחה ופיתוח אינטליגנציה רגשית",
    m3_title: "3. חיסכון באנרגיה של ההורים",
    m3_desc: "הגנה על ההורים משחיקה עם 1-2 שעות של זמן אישי ביום, והגנה על ילדים ממתח נפשי מבוסס נוירופסיכולוגיה התפתחותית. אושר על ידי נוירופסיכולוגים לילדים.",
    m3_tag: "1-2 שעות זמן אישי מבוסס נוירופסיכולוגיה התפתחותית",
    m4_title: "4. פיתוח אינטליגנציה רגשית (EQ)",
    m4_desc: "הפחתה עדינה של מתח יומי, חרדות וכעסים בזמן השינה, בניית ביטחון עצמי וחוסן נפשי.",
    m4_tag: "מסגרת CBT & ACT. גישה נוירופסיכולוגית לוויסות רגשי של הילד",
    footer_legal_title: "פרטיות וסודיות",
    btn_quick_test: "▶️ בדיקה מהירה של סיפור המדיטציה (הפעל שמע)",
    mic_story_reader_title: "📖 טקסט לקריאה בקול בזמן ההקלטה (לקרוא לאט עם הפסקות):",
    btn_toggle_story_text: "השתרע את כל הטקסט 📖",
    btn_toggle_story_text_collapse: "צמצם טקסט 🔼",
    story_snippet_text: "“דע שאמא ואבא אוהבים אותך מאוד… עכשיו בוא נצא למקום ידידותי… דמיין שיש מקום כזה בראשך… שבו טוב לך…”",
    story_full_text: "“דע שאמא ואבא אוהבים אותך מאוד… עכשיו בוא נצא למקום ידידותי… דמיין שיש מקום כזה בראשך… שבו טוב לך… מצא אותו והישאר שם קצת… דמיין את המקום היפה והבטוח ביותר שאתה יכול לדמיין… שבו אמא ואבא תמיד לצידך ועוזרים לך…<br><br>…כי זה העולם שבנית בעצמך, שבו כל מה שאתה מאמין בו הוא אמת. זה העולם שבו הכל באמת מתגשם… שבו מחשבות הופכות למציאות ושבו כל מה שאתה מאמין בו יכול לקרות… חשוב על כך שבמקום הזה אתה קוסם אמיתי וכל הרצונות שלך מתגשמים…<br><br>…האמן שאתה חכם, ושאתה לומד מהר מאוד ובקלות. האמן בזה, והכל יתגשם. חוש ביטחון בכוחותיך, חשוב על כך שכל ידע חדש מגיע אליך בקלות.<br><br>האמן שאוהבים אותך מאוד עמוק, חוש זאת בכל ליבך, ותן לנשמה שלך להתמלא באושר. דמיין זוהר חם בחזה, נשום את תחושת האהבה הזו בכל תא, ... אמא ואבא שמחים כל כך שיש להם אותך…”",
    tag_modes: "הפעלה מהירה של שינויים חיוביים",
    title_modes: "4 מצבים מיוחדים לעזרה ותמיכה רגשית",
    sub_modes: "בחרו תרחיש ליצירה מיידית של סיפורי הרגעה או עזרה דחופה",
    mode_morning_title: "כוון בוקר",
    mode_morning_desc: "זריקת מרץ, אמונה עצמית, קלות בלימודים ושמחה לקראת יום חדש.",
    btn_start_morning: "הפעל כוון בוקר",
    mode_bedtime_title: "סיפור לפני השינה",
    mode_bedtime_desc: "מעבר עדין לשינה, שחרור מועקות יומיות וטיפוח שלווה עמוקה.",
    btn_start_bedtime: "הפעל מצב הרגעה לפני השינה",
    mode_prayer_title: "מדיטציית תפילה",
    mode_prayer_desc: "שלווה רוחנית, הודיה, רוגע וברכה של הלך רוח מואר למשפחה.",
    btn_start_prayer: "הפעל מדיטציית תפילה",
    mode_emergency_title: "עזרה דחופה בזמן התקף זעם",
    mode_emergency_desc: "אלגוריתם 4 שלבים מיידי להורה + יצירת שמע AI מהירה לקרקוע הילד.",
    btn_start_emergency: "🚨 הפעל עזרה דחופה",
    em_header: "🚨 פרוטוקול חירום: תמיכה בזמן התקף זעם",
    em_step1_title: "איפוק ושליטה",
    em_step1_desc: "קחו נשימה עמוקה. אתם עוגן רגוע של ביטחון עבור ילדכם.",
    em_step2_title: "בטיחות תחילה",
    em_step2_desc: "הנמיכו את הקול, הרחיקו חפצים חדים, רדו לגובה העיניים של הילד.",
    em_step3_title: "תיקוף רגשי",
    em_step3_desc: "אמרו בשקט: 'אני רואה שקשה לך עכשיו ואתה כועס. אני כאן איתך.'",
    em_step4_title: "קרקוע",
    em_step4_desc: "הפעילו שמע מרגיע של AI והנחו את הילד לקצב נשימה סדיר.",
    em_input_label: "תארו את הסיטואציה (מה קרה?):",
    btn_gen_emergency: "✨ צור שמע מהיר",
    tag_studio: "סטודיו למדיטציה - פיתוח המבוסס על שיטות נוירופסיכולוגיה של הילד",
    title_studio: "סיפור מדיטציה מותאם אישית",
    sub_studio: "הקלטת קולכם + רצועת MP3 באולפן + קריינות AI דינמית",
    label_child_name: "שם הילד/ה:",
    label_child_gender: "מין הילד/ה:",
    opt_girl: "ילדה",
    opt_boy: "ילד",
    label_child_age: "גיל (בשנים):",
    label_audio_source: "מקור הקריינות:",
    opt_source_parent: "🎙 קול של אמא או אבא",
    opt_source_mp3: "🎵 רצועת MP3 אולפנית",
    opt_source_tts: "🤖 קריין AI דינמי (קול עמוק)",
    label_voice_timbre: "גון וסגנון הקול:",
    opt_male_deep: "🎙 גברי - קול עמוק ורגוע",
    opt_female_calm: "🎙 נשי - קול רגוע",
    opt_generated_parent: "🎙 קול הורה מחולל",
    label_meditation_mode: "מצב מדיטציה:",
    opt_mode_bedtime: "🌙 לפני השינה (הרדמה)",
    opt_mode_morning: "☀️ בוקר (ביטחון עצמי)",
    opt_mode_emergency: "🚨 חירום (קרקוע)",
    opt_mode_prayer: "🙏 מדיטציית תפילה (שלווה רוחנית)",
    label_mic_rec: "🎙 הקלטת קול הורה (60 שניות עבור ElevenLabs):",
    mic_press_text: "לחץ להקלטת קול של הורה או סבתא (60 שניות)",
    btn_generate: "✨ צור סיפור מדיטציה בקול של אמא, אבא או סבתא",
    player_title_default: "סיפור מדיטציה",
    player_sub_default: "קול מרגיע ומוכר • ללא מוזיקה",
    tag_pricing: "מונטיזציה שקופה",
    title_pricing: "בחרו מסלול מנוי",
    sub_pricing: "גישת Freemium + מכסות יצירה + תוספת דקות",
    plan_title_free: "חינם (בסיסי)",
    plan_free_sub: "להרגיש את ערך השירות",
    plan_forever: "/ לתמיד",
    pf_free_1: "✅ 2 בקשות AI ביום",
    pf_free_2: "✅ סיפור מדיטציה סטנדרטי",
    pf_free_3: "✅ קריינות בקול רגוע ונעים",
    pf_free_3_extra: "✅ נוירוגימנסטיקה ותרגילים לאיזון רגשי",
    pf_free_3_emergency: "✅ עזרה דחופה בזמן התקף זעם",
    pf_free_4: "❌ ללא שמירת היסטוריה",
    btn_plan_free: "התחל בחינם",
    plan_title_basic: "בסיסי",
    plan_basic_sub: "לכוונים יומיומיים",
    billing_monthly: "חודשי",
    billing_annual: "תשלום שנתי <span class=\"discount-badge\">-67% הנחה</span>",
    plan_per_month: "/ חודש",
    pf_basic_1: "✅ 50 דקות יצירה בחודש",
    pf_basic_2: "✅ התאמה אישית לשם הילד",
    pf_basic_3: "✅ תמיכה ב-3 שפות (RU, EN, HE)",
    pf_basic_4: "✅ שמירת היסטוריית קולות וסיפורים",
    btn_plan_basic: "בחר בסיסי",
    popular_badge: "🔥 הבחירה הפופולרית",
    plan_title_premium: "פרימיום",
    plan_premium_sub: "שלווה מלאה והרמוניה משפחתית",
    pf_prem_1: "✅ 120 דקות יצירה (~12 סיפורים)",
    pf_prem_2: "✅ תמיכה בזמן התקפי זעם",
    pf_prem_3: "✅ גישה משפחתית עד 4 מכשירים",
    pf_prem_4: "✅ תמיכה בסדר עדיפויות",
    btn_plan_premium: "הפעל פרימיום",
    plan_title_platinum: "פלטינום",
    plan_plat_sub: "מקסימום משאבים ותמיכת VIP",
    pf_plat_1: "✅ 300 דקות יצירת שמע",
    pf_plat_2: "✅ ספריית מדיטציות ללא הגבלה",
    pf_plat_3: "✅ סוכן מפקח אישי AI",
    pf_plat_4: "✅ גישה משפחתית עד 8 מכשירים",
    btn_plan_platinum: "הפעל פלטינום",
    topup_tag: "⚡ דקות נוספות:",
    topup_title: "חבילת 50 דקות נוספות",
    topup_desc: "הסתיימה המכסה? רכשו 50 דקות נוספות ללא שינוי מסלול המנוי.",
    btn_topup: "רכשו ב-$4.99",
    nda_title: "📜 תנאי שירות והסכם משתמש",
    nda_sub: "הצהרת ויתור והגבלת אחריות (DISCLAIMER)",
    label_nda_name: "שם מלא של החותם:",
    label_auth_phone: "WhatsApp / Telegram (חובה):",
    label_nda_email: "כתובת דוא\"ל:",
    label_signature_canvas: "✍️ חתום בעזרת העכבר או האצבע למטה:",
    btn_clear_sig: "נקה",
    btn_submit_nda: "✅ אישור וחתימה על NDA (המשך במסמך)",
    custdev_modal_title: "💬 סקר + מתנה: עזרו לנו לשפר את המוצר",
    custdev_modal_sub: "בחרו תרחיש, ענו על 3 שאלות וקבלו מתנה:",
    cd_btn_burnout: "🟢 1. שחיקה",
    cd_btn_tantrums: "🔵 2. התקפי זעם",
    cd_btn_confidence: "🟡 3. ביטחון עצמי",
    cd_btn_expert: "🟣 4. מומחה",
    label_custdev_phone: "WhatsApp / Telegram (חובה לקבלת מתנה):",
    btn_submit_custdev: "🚀 שלח תשובות וקבל מתנה",
    modal_auth_title: "התחברות ל-MindEcho AI",
    modal_auth_sub: "שמרו את הגדרות המדיטציה וההתקדמות שלכם",
    btn_auth_google: "התחברות עם Google",
    btn_auth_apple: "התחברות עם Apple ID",
    label_terms_agree: "אני מסכים לתנאי השימוש ומדיניות הפרטיות.",
    btn_auth_submit: "התחבר / הרשם",
    footer_brand_desc: "מערכת אקולוגית גלובלית לבריאות נפשית של המשפחה. בינה מלאכותית, נוירופסיכולוגיה ו-CBT.",
    footer_nav_title: "ניווט",
    copyright_text: "© 2026 MindEcho AI Inc. כל הזכויות שמורות.",
    link_admin_login: "🔐 כניסה לאזור ניהול \"admin\"",
    label_voice_consent: "אני מסכים/ה לעיבוד הקלטת הקול עבור שפול קול בבינה מלאכותית",
    btn_edu_tutoring: "📚 למידה חוץ-בית ספרית ושיעורים פרטיים ב-AI",
    btn_edu_school: "🚀 מערכת חינוך בית-ספרית מרחוק ב-AI",
    edu_tag_header: "🎓 מסלולי לימוד מיוחדים",
    edu_title_header: "למידה חוץ-בית ספרית ובית ספר מרוחק ב-AI",
    edu_sub_header: "שדרוג מרובה בהישגי הילד במקצועות ללא מורים פרטיים יקרים ב-$50 לשעה",
    edu_badge_tutoring: "📚 שיעורי AI לפי נושאים",
    edu_title_tutoring: "למידה חוץ-בית ספרית",
    edu_sub_tutoring: "בחירת מקצוע לסגירת פערים ממוקדת והאצת הישגים",
    edu_label_select_subject: "בחרו מקצוע ללימוד:",
    edu_opt_english: "🇬🇧 אנגלית ושפות נוספות",
    edu_opt_math: "📐 מתמטיקה",
    edu_opt_physics: "🔬 פיזיקה",
    edu_opt_coding: "💻 תכנות ופיתוח",
    edu_opt_it_projects: "🚀 IT ומיזמי אינטרנט (סטארטאפים)",
    edu_cycle_monthly: "חודשי",
    edu_cycle_annual_tutoring: "שנתי <span class=\"discount-badge\">-$290 הנחה</span>",
    edu_discount_tutoring: "-$290 הנחה",
    edu_price_per_subject: "/ חודש למקצוע",
    edu_annual_subtext_tutoring: "($65.8/חודש)",
    edu_pf_tutoring_1: "✅ חיסול פערים אקספרס ב-15 דקות",
    edu_pf_tutoring_2: "✅ חיזוק מרובה של כשרונות ייחודיים",
    edu_pf_tutoring_3: "✅ שיחות אינטראקטיביות עם מורה AI",
    edu_pf_tutoring_4: "✅ קריינות בקול הורה מרגיע ומוכר",
    edu_pf_tutoring_5: "✅ 3 שעות לימוד ביום עם 100% הצלחה",
    edu_btn_order_tutoring: "💎 בחרו מקצוע ושלמו ($90 / $790)",
    edu_badge_school: "🚀 בית ספר AI מלא מרחוק",
    edu_title_school: "למידה בית-ספרית מרחוק",
    edu_sub_school: "מערכת אקולוגית אוטונומית מלאה לחינוך ביתי בכל תכנית הלימודים",
    edu_cycle_annual_school: "שנתי <span class=\"discount-badge\">-$820 הנחה</span>",
    edu_discount_school: "-$820 הנחה",
    edu_annual_subtext_school: "($408.3/חודש)",
    edu_pf_school_1: "✅ כל מקצועות הלימוד (שפות, מתמטיקה, פיזיקה, IT)",
    edu_pf_school_2: "✅ לימוד ב-3 שעות ביום עם 100% הצלחה לימודית",
    edu_pf_school_3: "✅ מאמן AI למניעת שחיקה ואיזון רגשי",
    edu_pf_school_4: "✅ פיתוח חשיבת יוצר (Creator Mindset)",
    edu_pf_school_5: "✅ לוח בקרה שקוף להורים בלחיצה אחת",
    edu_btn_order_school: "🚀 הפעילו בית ספר מרחוק ($340 / $4,900)"
  }
};

function switchLanguage(langKey, btnEl) {
  appState.lang = langKey;
  document.querySelectorAll('.lang-btn').forEach(btn => btn.classList.remove('active'));

  if (btnEl) {
    btnEl.classList.add('active');
  } else {
    document.querySelectorAll('.lang-btn').forEach(btn => {
      const onclickAttr = btn.getAttribute('onclick');
      if (onclickAttr && onclickAttr.includes(`'${langKey}'`)) {
        btn.classList.add('active');
      }
    });
  }

  if (langKey === 'he') {
    document.documentElement.setAttribute('dir', 'rtl');
    document.documentElement.setAttribute('lang', 'he');
  } else {
    document.documentElement.setAttribute('dir', 'ltr');
    document.documentElement.setAttribute('lang', langKey);
  }

  const langDict = translations[langKey];
  if (langDict) {
    document.querySelectorAll('[data-i18n]').forEach(el => {
      const key = el.getAttribute('data-i18n');
      if (langDict[key]) {
        if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') {
          el.placeholder = langDict[key];
        } else {
          el.innerHTML = langDict[key];
        }
      }
    });
  }

  // Re-render CustDev survey questions in active language
  if (typeof selectCustDevScenario === 'function') {
    selectCustDevScenario(appState.currentCustDevScenario || 'burnout');
  }

  logClickAnalytics('Language_Switched', langKey, 0);
}

function setupScrollListener() {
  const stickyBar = document.getElementById('sticky-bar');
  window.addEventListener('scroll', () => {
    if (window.scrollY > 450) {
      stickyBar.classList.remove('hidden');
    } else {
      stickyBar.classList.add('hidden');
    }
  });
}

function scrollToSection(sectionId) {
  const target = document.getElementById(sectionId);
  if (target) {
    target.scrollIntoView({ behavior: 'smooth' });
  }
}

function selectAudioMode(modeKey) {
  const typeSelect = document.getElementById('meditation-type');
  if (typeSelect) typeSelect.value = modeKey;

  const emergencyPanel = document.getElementById('emergency-panel');
  if (modeKey === 'emergency') {
    emergencyPanel.classList.remove('hidden');
    emergencyPanel.scrollIntoView({ behavior: 'smooth' });
  } else {
    emergencyPanel.classList.add('hidden');
    scrollToSection('generator');
  }

  logClickAnalytics('AudioMode_Select', modeKey, 0);
}

function closeEmergencyPanel() {
  document.getElementById('emergency-panel').classList.add('hidden');
}

function toggleFullStoryText() {
  const fullStory = document.getElementById('story-full-text');
  const snippetStory = document.getElementById('story-snippet-text');
  const btn = document.getElementById('btn-toggle-story-text');
  const langDict = translations[appState.lang || 'ru'] || translations.ru;

  if (fullStory) {
    if (fullStory.classList.contains('hidden')) {
      fullStory.classList.remove('hidden');
      if (snippetStory) snippetStory.classList.add('hidden');
      if (btn) btn.innerText = langDict.btn_toggle_story_text_collapse || "Свернуть текст 🔼";
    } else {
      fullStory.classList.add('hidden');
      if (snippetStory) snippetStory.classList.remove('hidden');
      if (btn) btn.innerText = langDict.btn_toggle_story_text || "Развернуть весь текст 📖";
    }
  }
}

// MediaRecorder — Real Parent Microphone Recording with 60s Countdown & Audio Level Visualizer
let micAudioContext = null;
let micAnalyser = null;
let micAnimFrame = null;
let maxAudioVolumeRecorded = 0;

async function toggleVoiceRecord() {
  const micBtn = document.getElementById('mic-btn');
  const micText = document.getElementById('mic-text');
  const micWave = document.getElementById('mic-wave');
  const micLevelBox = document.getElementById('mic-level-box');
  const micLevelFill = document.getElementById('mic-level-fill');

  // Auto-expand full story text for reading (and hide duplicate snippet)
  const fullStory = document.getElementById('story-full-text');
  const snippetStory = document.getElementById('story-snippet-text');
  const btnStory = document.getElementById('btn-toggle-story-text');
  if (fullStory && fullStory.classList.contains('hidden')) {
    fullStory.classList.remove('hidden');
    if (snippetStory) snippetStory.classList.add('hidden');
    if (btnStory) btnStory.innerText = "Свернуть текст 🔼";
  }

  if (!appState.isRecording) {
    try {
      // Explicit audio constraints to ensure noise suppression & active audio input
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        }
      });

      // Initialize Web Audio API Analyser for real-time volume VU Meter
      try {
        micAudioContext = new (window.AudioContext || window.webkitAudioContext)();
        if (micAudioContext && micAudioContext.state === 'suspended') {
          await micAudioContext.resume();
        }
        const source = micAudioContext.createMediaStreamSource(stream);
        micAnalyser = micAudioContext.createAnalyser();
        micAnalyser.fftSize = 256;
        source.connect(micAnalyser);

        const dataArray = new Uint8Array(micAnalyser.frequencyBinCount);
        maxAudioVolumeRecorded = 0;

        function updateMicVolumeLevel() {
          if (!appState.isRecording) return;
          micAnalyser.getByteFrequencyData(dataArray);
          let sum = 0;
          for (let i = 0; i < dataArray.length; i++) {
            sum += dataArray[i];
          }
          const average = sum / dataArray.length;
          if (average > maxAudioVolumeRecorded) maxAudioVolumeRecorded = average;

          const levelPercent = Math.min(100, Math.round((average / 128) * 100));
          if (micLevelFill) micLevelFill.style.width = `${levelPercent}%`;

          micAnimFrame = requestAnimationFrame(updateMicVolumeLevel);
        }

        if (micLevelBox) micLevelBox.classList.remove('hidden');
        updateMicVolumeLevel();
      } catch (audioCtxErr) {
        console.warn("AudioContext visualizer notice:", audioCtxErr);
      }

      // Check supported MIME type
      let mimeType = 'audio/webm;codecs=opus';
      if (!MediaRecorder.isTypeSupported(mimeType)) {
        mimeType = MediaRecorder.isTypeSupported('audio/webm') ? 'audio/webm' : '';
      }
      
      appState.mediaRecorder = mimeType ? new MediaRecorder(stream, { mimeType }) : new MediaRecorder(stream);
      appState.recordedChunks = [];

      appState.mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) appState.recordedChunks.push(e.data);
      };

      appState.mediaRecorder.onstop = () => {
      // Stop AudioContext & Analyser
      if (micAnimFrame) cancelAnimationFrame(micAnimFrame);
      if (micAudioContext) {
        micAudioContext.close().catch(() => {});
        micAudioContext = null;
      }
      if (micLevelBox) micLevelBox.classList.add('hidden');
      if (micLevelFill) micLevelFill.style.width = '0%';

      const blob = new Blob(appState.recordedChunks, { type: appState.mediaRecorder.mimeType || 'audio/webm' });

      // STRICT FILE SIZE CHECK: 15 MB MAX (15 * 1024 * 1024 bytes)
      const MAX_FILE_SIZE = 15 * 1024 * 1024;
      if (blob.size > MAX_FILE_SIZE) {
        micText.innerText = "⚠️ Размер файла превышает 15 МБ";
        alert("⚠️ Размер файла превышает 15 МБ. Пожалуйста, запишите аудиозапись меньшего размера.");
        return;
      }

      appState.recordedAudioBlob = blob;
      appState.clonedVoiceId = null; // Force fresh cloning for new recording
      appState.recordedAudioUrl = URL.createObjectURL(blob);

      // Robust check: If blob size is valid (>= 1000 bytes), recording is successful
      if (blob.size < 1000) {
        micText.innerText = "⚠️ Внимание: Запись оказалась тихой/пустой";
        alert("⚠️ Внимание: Запись оказалась пустой. Пожалуйста, убедитесь, что микрофон включён в настройках браузера!");
      } else {
        micText.innerText = "🟢 Запись голоса завершена!";
        const uploadStatus = document.getElementById('upload-file-status');
        if (uploadStatus) uploadStatus.innerText = "🟢 Запись голоса завершена!";

        const btnCreate = document.getElementById('btn-create-meditation');
        if (btnCreate) {
          btnCreate.disabled = false;
          btnCreate.innerText = "🎧 Слушать сказку-медиацию сгенерированую Заданным голосом";
          btnCreate.style.opacity = "1";
          btnCreate.style.cursor = "pointer";
          btnCreate.style.background = "linear-gradient(135deg, #10B981 0%, #059669 100%)";
          btnCreate.onclick = playParentRecordedVoice;
        }
      }

      // Save voice recording to Supabase database (Preserving History)
      const childName = document.getElementById('child-name')?.value || 'Ребенок';
      saveParentVoiceToSupabase(blob, null, childName);
    };

    appState.mediaRecorder.start(250); // Slice chunks every 250ms
    appState.isRecording = true;
    micBtn.classList.add('recording');
    micWave.classList.remove('hidden');

    let remainingSec = 60;
    micText.innerText = `🔴 Идет запись голоса... Говорите в микрофон! (${remainingSec} сек)`;
    
    const recordTimerInterval = setInterval(() => {
      remainingSec--;
      if (remainingSec > 0 && appState.isRecording) {
        micText.innerText = `🔴 Идет запись голоса... Говорите в микрофон! (${remainingSec} сек)`;
      } else {
        clearInterval(recordTimerInterval);
        if (appState.isRecording) {
          toggleVoiceRecord();
        }
      }
    }, 1000);

  } catch (err) {
    console.warn("Microphone access denied or missing:", err);
    micText.innerText = "⚠️ Доступ к микрофону заблокирован";
    alert("⚠️ Разрешение на микрофон заблокировано! Кликните по иконке замочка 🔒 слева от адресной строки и разрешите доступ к микрофону.");
  }
} else {
  if (appState.mediaRecorder && appState.mediaRecorder.state !== 'inactive') {
    appState.mediaRecorder.stop();
  }
  appState.isRecording = false;
  micBtn.classList.remove('recording');
  micWave.classList.add('hidden');
}

logClickAnalytics('VoiceRecord_Toggled', appState.isRecording ? 'Start' : 'Stop', 0);
}

// 📁 1. Custom Parent Audio File Handler (WebM / MP3 / WAV Upload) with 15 MB Size Limit
function handleParentAudioUpload(event) {
  const file = event.target.files[0];
  if (!file) return;

  const statusSpan = document.getElementById('upload-file-status');
  const micText = document.getElementById('mic-text');

  // STRICT FILE SIZE CHECK: 15 MB MAX (15 * 1024 * 1024 bytes)
  const MAX_FILE_SIZE = 15 * 1024 * 1024;
  if (file.size > MAX_FILE_SIZE) {
    if (statusSpan) statusSpan.innerText = `⚠️ Размер файла превышает 15 МБ`;
    alert("⚠️ Размер файла превышает 15 МБ. Пожалуйста, загрузите аудиозапись меньшего размера.");
    event.target.value = '';
    return;
  }

  if (statusSpan) statusSpan.innerText = `⏳ Загрузка "${file.name}"...`;

  const reader = new FileReader();
  reader.readAsDataURL(file);
  reader.onloadend = () => {
    appState.recordedAudioBlob = file;
    appState.clonedVoiceId = null; // Force new Instant Voice Cloning for uploaded file
    appState.recordedAudioUrl = URL.createObjectURL(file);

    if (statusSpan) statusSpan.innerText = `🟢 Ваша аудиозапись загружена!`;
    if (micText) micText.innerText = `🟢 Загружена аудиозапись: ${file.name} (${Math.round(file.size / 1024)} KB)`;

    const btnCreate = document.getElementById('btn-create-meditation');
    if (btnCreate) {
      btnCreate.disabled = false;
      btnCreate.innerText = "🎧 Слушать сказку-медиацию сгенерированую Заданным голосом";
      btnCreate.style.opacity = "1";
      btnCreate.style.cursor = "pointer";
      btnCreate.style.background = "linear-gradient(135deg, #10B981 0%, #059669 100%)";
      btnCreate.onclick = playParentRecordedVoice;
    }

    const childName = document.getElementById('child-name')?.value || 'Ребенок';
    saveParentVoiceToSupabase(file, null, childName);

    alert(`🟢 Ваша аудиозапись загружена! "${file.name}" (${Math.round(file.size / 1024)} KB) сохранена и готова к прослушиванию.`);
  };
}

// 🗄️ 3. Save Parent Voice to Supabase Database & Local App Storage Directory (Preserving Full History without deletion)
async function saveParentVoiceToSupabase(fileOrBlob, voiceId = null, childName = 'Ребенок') {
  const userEmail = localStorage.getItem('userEmail') || document.getElementById('auth-email')?.value || 'get777903@gmail.com';
  const userContact = document.getElementById('nda-user-contact')?.value || document.getElementById('checkout-phone')?.value || '-';

  const reader = new FileReader();
  reader.readAsDataURL(fileOrBlob);
  reader.onloadend = () => {
    const base64Audio = reader.result;

    // Save audio payload into isolated application local storage directory
    try {
      localStorage.setItem('mindecho_latest_parent_voice_b64', base64Audio);
      localStorage.setItem('mindecho_latest_parent_voice_time', new Date().toISOString());
    } catch (storageErr) {
      console.warn('Local app storage limit notice:', storageErr);
    }

    const voiceRecordPayload = {
      timestamp: new Date().toISOString(),
      created_at: new Date().toISOString(),
      event_type: 'Parent_Voice_Saved',
      session_id: (typeof SESSION_ID !== 'undefined' ? SESSION_ID : 'GUEST'),
      user_name: childName,
      email: userEmail,
      phone: userContact,
      voice_id: voiceId || appState.clonedVoiceId || 'C0qT9fWAA22Nx02a6QJY',
      file_name: fileOrBlob.name || `recording_${Date.now()}.webm`,
      file_size_bytes: fileOrBlob.size,
      page_section: base64Audio ? base64Audio.substring(0, 150000) : ''
    };

    fetch(supabaseUrl, {
      method: 'POST',
      headers: {
        'apikey': supabaseKey,
        'Authorization': 'Bearer ' + supabaseKey,
        'Content-Type': 'application/json',
        'Prefer': 'return=minimal'
      },
      body: JSON.stringify(voiceRecordPayload)
    }).then(res => {
      console.log('✅ Supabase parent voice record saved successfully!');
    }).catch(err => console.warn('Supabase voice save warning:', err));
  };
}

// 🔄 4. Auto-Load Latest Voice Default (LATEST VOICE) from App Local Storage & Supabase
async function loadLatestParentVoiceFromSupabase(childName = '') {
  // First check isolated application local storage directory for cached parent voice
  const cachedB64 = localStorage.getItem('mindecho_latest_parent_voice_b64');
  if (cachedB64 && cachedB64.startsWith('data:audio')) {
    appState.recordedAudioUrl = cachedB64;
    const btnCreate = document.getElementById('btn-create-meditation');
    if (btnCreate) {
      btnCreate.disabled = false;
      btnCreate.innerText = "🎧 Слушать сказку-медиацию сгенерированую Заданным голосом";
      btnCreate.style.opacity = "1";
      btnCreate.style.cursor = "pointer";
      btnCreate.style.background = "linear-gradient(135deg, #10B981 0%, #059669 100%)";
      btnCreate.onclick = playParentRecordedVoice;
    }
  }

  try {
    const queryUrl = `${supabaseUrl}?event_type=eq.Parent_Voice_Saved&order=created_at.desc&limit=1`;
    const res = await fetch(queryUrl, {
      method: 'GET',
      headers: {
        'apikey': supabaseKey,
        'Authorization': 'Bearer ' + supabaseKey,
        'Accept': 'application/json'
      }
    });

    if (res.ok) {
      const data = await res.json();
      if (data && data.length > 0) {
        const latestVoice = data[0];
        if (latestVoice.voice_id) {
          appState.clonedVoiceId = latestVoice.voice_id;
          console.log(`🔄 Auto-loaded latest voice from Supabase: ${latestVoice.voice_id}`);
        }
        if (latestVoice.page_section && latestVoice.page_section.startsWith('data:audio')) {
          appState.recordedAudioUrl = latestVoice.page_section;
        }
        const micText = document.getElementById('mic-text');
        if (micText) {
          micText.innerText = `🟢 Автоматически подгружен последний голос из базы данных Supabase`;
        }

        const btnCreate = document.getElementById('btn-create-meditation');
        if (btnCreate) {
          btnCreate.disabled = false;
          btnCreate.innerText = "🎧 Слушать сказку-медиацию сгенерированую Заданным голосом";
          btnCreate.style.opacity = "1";
          btnCreate.style.cursor = "pointer";
          btnCreate.style.background = "linear-gradient(135deg, #10B981 0%, #059669 100%)";
          btnCreate.onclick = playParentRecordedVoice;
        }
      }
    }
  } catch (err) {
    console.warn('Load latest voice from Supabase warning:', err);
  }
}

// 🎙 5. Instant Voice Cloning API Call (/v1/voices/add) to ElevenLabs
async function cloneParentVoiceElevenLabs(audioBlob) {
  const apiKey = "sk_b8c575f3959e2a5860e1b7a93b6ee45e869d19f6c6a6063d";
  const formData = new FormData();
  formData.append("name", `Parent_Recorded_Voice_${Date.now()}`);
  formData.append("files", audioBlob, audioBlob.name || "parent_recorded_voice.webm");
  formData.append("description", "Родительский голос из приложения MindEcho AI (Instant Voice Cloning)");

  const micText = document.getElementById('mic-text');

  try {
    if (micText) micText.innerText = "⏳ Клонирование голоса родителя в ElevenLabs...";

    const res = await fetch("https://api.elevenlabs.io/v1/voices/add", {
      method: "POST",
      headers: { "xi-api-key": apiKey },
      // Do NOT set Content-Type — browser sets multipart boundary automatically
      body: formData
    });

    if (res.ok) {
      const data = await res.json();
      if (data && data.voice_id) {
        console.log(`🎉 ElevenLabs Instant Voice Cloning Success: ${data.voice_id}`);
        appState.clonedVoiceId = data.voice_id;

        // Update voice record in Supabase with newly assigned voice_id
        const childName = document.getElementById('child-name')?.value || 'Ребенок';
        saveParentVoiceToSupabase(audioBlob, data.voice_id, childName);

        if (micText) micText.innerText = "🟢 Голос родителя клонирован в ElevenLabs!";
        return data.voice_id;
      }
    } else {
      const errText = await res.text();
      console.warn("ElevenLabs voice cloning API error:", errText);
      if (micText) micText.innerText = "⚠️ Клонирование голоса недоступно. Используется стандартный голос.";
    }
  } catch (err) {
    // CORS or network error — acceptable for MVP on GitHub Pages
    console.warn("ElevenLabs cloning unavailable (CORS/network), using fallback voice:", err.message);
    if (micText) micText.innerText = "⚠️ Клонирование голоса недоступно. Используется стандартный голос.";
  }
  return null;
}

// ✂️ Helper: split long text into chunks at paragraph/sentence boundaries for ElevenLabs
function chunkTextForElevenLabs(text, maxChars = 8000) {
  if (text.length <= maxChars) return [text];

  const chunks = [];
  const paragraphs = text.split(/\n\n+/);
  let current = '';

  for (const para of paragraphs) {
    if ((current + '\n\n' + para).length > maxChars) {
      if (current.trim()) chunks.push(current.trim());
      // If a single paragraph exceeds limit, split at sentence boundaries
      if (para.length > maxChars) {
        const sentences = para.match(/[^.!?…]+[.!?…]+/g) || [para];
        let sentChunk = '';
        for (const s of sentences) {
          if ((sentChunk + s).length > maxChars) {
            if (sentChunk.trim()) chunks.push(sentChunk.trim());
            sentChunk = s;
          } else {
            sentChunk += s;
          }
        }
        if (sentChunk.trim()) current = sentChunk;
        else current = '';
      } else {
        current = para;
      }
    } else {
      current = current ? current + '\n\n' + para : para;
    }
  }
  if (current.trim()) chunks.push(current.trim());
  return chunks;
}

// 🎵 6. ElevenLabs Text-to-Speech Generation API Call (/v1/text-to-speech/{voice_id})
// Supports chunked synthesis for long meditation scripts (> 8000 chars)
async function synthesizeElevenLabsAudio(text, voiceId = "C0qT9fWAA22Nx02a6QJY") {
  const apiKey = "sk_b8c575f3959e2a5860e1b7a93b6ee45e869d19f6c6a6063d";
  const micText = document.getElementById('mic-text');

  // Clean SSML break tags to natural pauses for ElevenLabs speech engine
  const cleanText = text
    .replace(/<break\s+time=["'][^"']+["']\/>/gi, " ... ")
    .replace(/—/g, ", ")
    .replace(/…/g, "...");

  // Split text into chunks if it exceeds 8000 chars (eleven_multilingual_v2 limit: 10,000)
  const chunks = chunkTextForElevenLabs(cleanText, 8000);
  const audioBuffers = [];

  for (let i = 0; i < chunks.length; i++) {
    if (micText && chunks.length > 1) {
      micText.innerText = `⏳ Синтез голоса: часть ${i + 1} из ${chunks.length}...`;
    }

    try {
      // output_format as query param: mp3_44100_128 — best for browser playback
      const url = `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}?output_format=mp3_44100_128`;

      const res = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "xi-api-key": apiKey,
          "accept": "audio/mpeg"
        },
        body: JSON.stringify({
          text: chunks[i],
          model_id: "eleven_multilingual_v2",
          voice_settings: {
            stability: 0.65,          // Steady, consistent delivery — no pitch jumps
            similarity_boost: 0.80,   // Close to parent voice without artifacts
            style: 0.05,              // Minimal dramatic inflection — calm bedtime tone
            use_speaker_boost: true   // Enhances clarity, compensates mic quality
          }
        })
      });

      if (res.ok) {
        const arrayBuffer = await res.arrayBuffer();
        audioBuffers.push(arrayBuffer);
        console.log(`🎉 ElevenLabs TTS chunk ${i + 1}/${chunks.length} success: ${Math.round(arrayBuffer.byteLength / 1024)} KB`);
      } else {
        const errText = await res.text();
        console.warn(`ElevenLabs TTS chunk ${i + 1} error:`, errText);
        if (micText) micText.innerText = "⚠️ Синтез голоса недоступен. Используется записанный голос.";
        return null;
      }
    } catch (err) {
      // CORS or network error — acceptable for MVP on GitHub Pages
      console.warn(`ElevenLabs TTS chunk ${i + 1} unavailable (CORS/network):`, err.message);
      if (micText) micText.innerText = "⚠️ Синтез через ElevenLabs недоступен. Используется записанный голос.";
      return null;
    }
  }

  // Merge all audio chunk buffers into one MP3 Blob
  if (audioBuffers.length === 0) return null;
  const mergedBlob = new Blob(audioBuffers, { type: 'audio/mpeg' });
  console.log(`🎉 ElevenLabs Meditation Synthesis Complete! Total size: ${Math.round(mergedBlob.size / 1024)} KB (${chunks.length} chunk(s))`);
  return mergedBlob;
}

window.handleParentAudioUpload = handleParentAudioUpload;
window.saveParentVoiceToSupabase = saveParentVoiceToSupabase;
window.loadLatestParentVoiceFromSupabase = loadLatestParentVoiceFromSupabase;
window.cloneParentVoiceElevenLabs = cloneParentVoiceElevenLabs;
window.chunkTextForElevenLabs = chunkTextForElevenLabs;
window.synthesizeElevenLabsAudio = synthesizeElevenLabsAudio;

// Stage 3: LLM System Prompt Generator & Guardrail Safety Agent Configuration
const llmSystemPromptConfig = {
  role: "ИИ-генератор добрых сказок для расслабления и психологической поддержки детей",
  promptTemplate: "Напиши добрую аудио-сказку для расслабления и психологической поддержки ребенка, которая мягко показывает победу над страхом темноты, растворяет тревоги и наполняет уверенностью.",
  guardrailSafetyFilter: function(inputText) {
    const medicalKeywords = ["диагноз", "лечение", "препарат", "психотерапия", "патология", "симптом"];
    const containsMedicalAdvice = medicalKeywords.some(kw => inputText.toLowerCase().includes(kw));
    if (containsMedicalAdvice) {
      return {
        safe: false,
        message: "Сервис MindEcho AI не является медицинским средством и не предоставляет медицинских услуг. Сгенерирован развлекательный и развивающий аудио-контент для эмоциональной поддержки и расслабления."
      };
    }
    return { safe: true };
  }
};
window.llmSystemPromptConfig = llmSystemPromptConfig;

function buildScriptText(childName, mins) {
  const targetMinutes = parseInt(mins, 10) || 10;
  const cleanName = (childName && childName.trim()) ? childName.trim() : '';

  const introGreeting = cleanName
    ? `Дорогой мой... <break time="1.5s"/> родной человечек, ${cleanName}... <break time="3.0s"/>`
    : `Дорогой мой... <break time="1.5s"/> родной человечек... <break time="3.0s"/>`;

  // ВСТУПЛЕНИЕ (всегда, 2 блока)
  const baseIntro = [
    introGreeting,
    `…Я хочу взять тебя с собой в небольшое путешествие… <break time="2.0s"/> в волшебное место, где мысли становятся реальностью… <break time="2.0s"/> Слушай меня внимательно, расслабься… <break time="2.0s"/> и давай отправимся в путь… <break time="3.5s"/>`,
    `…Закрой глаза… <break time="2.0s"/> и начни дышать спокойно и ровно… <break time="2.0s"/> Почувствуй, как приятное тепло разливается по всему телу… <break time="2.5s"/> Ощути пространство вокруг себя… <break time="1.5s"/> оно мягкое, доброе и безопасное… <break time="2.0s"/> словно невидимое облако уюта… <break time="3.5s"/>`
  ];

  // ОСНОВНЫЕ БЛОКИ (повторяются по длительности, 6 уникальных блоков)
  const bodyBlocks = [
    `…А теперь представь самое красивое и спокойное место на свете… <break time="2.0s"/> Найди его мысленно и побудь там… <break time="2.5s"/> Знай, что в этом месте мама и папа всегда рядом с тобой… <break time="2.0s"/> мы тебя очень-очень сильно любим… <break time="1.5s"/> и так рады, что ты у нас есть… <break time="3.5s"/>`,
    `…В этом волшебном мире ты — настоящая волшебница… <break time="2.0s"/> Здесь всё, во что ты веришь, обязательно сбывается… <break time="2.5s"/> Поверь всем сердцем, что ты очень умная и легко учишься новому… <break time="2.0s"/> Поверь, что твоё тело сильное и здоровое… <break time="3.5s"/>`,
    `…Пусть все неприятности растают, как снег под ласковым солнышком… <break time="2.5s"/> С каждым твоим длинным выдохом… <break time="2.0s"/> все страхи и тревоги просто испаряются… <break time="3.5s"/>`,
    `…Поверь в себя… <break time="2.0s"/> Ты можешь стать кем захочешь и достичь любых высот… <break time="2.0s"/> Ощути свою уникальность, ведь ты — настоящее сокровище… <break time="2.0s"/> И помни: что бы ни случилось в жизни, наша любовь всегда будет защищать тебя… <break time="3.5s"/>`,
    `…А теперь давай научим твоё тело новым, чудесным чувствам… <break time="2.0s"/> Почувствуй прямо сейчас, каково это — быть совершенно храброй и бесстрашной… <break time="2.5s"/> Почувствуй, как это — быть абсолютно свободной и счастливой… <break time="2.0s"/> Ощути внутри себя безграничную энергию и вдохновение… <break time="3.5s"/>`,
    `…Положи руку на сердце… <break time="2.0s"/> прислушайся к его ритму… <break time="2.5s"/> Поблагодари свою жизнь, которая полна удивительных приключений и радости… <break time="2.0s"/> Улыбнись мысленно… <break time="1.5s"/> и почувствуй огромную нежность к самой себе… <break time="3.5s"/>`
  ];

  // ЗАВЕРШЕНИЕ (всегда, 1 блок)
  const outro = [
    `…Сохрани это мягкое состояние покоя и уверенности… <break time="2.0s"/> Сделай глубокий вдох… <break time="1.5s"/> сладко-сладко потянись всем телом… <break time="2.0s"/> и медленно открой глаза с широкой улыбкой… <break time="2.5s"/> Завтра тебя ждёт чудесный и очень счастливый день… <break time="3.0s"/>`
  ];

  // Масштабирование: 5 мин = 1 повтор, 10 мин = 2, 30 мин = 6 (все 6 блоков × повторы)
  const repeatCount = Math.max(1, Math.min(6, Math.round(targetMinutes / 5)));
  let scriptBody = [];

  for (let i = 0; i < repeatCount; i++) {
    scriptBody.push(...bodyBlocks);
  }

  return [...baseIntro, ...scriptBody, ...outro].join("\n\n");
}

async function generatePersonalMeditation() {
  const nameInput = document.getElementById('child-name');
  const rawName = nameInput ? nameInput.value : '';
  const displayName = (rawName && rawName.trim()) ? rawName.trim() : 'без имени';

  const durationSelect = document.getElementById('meditation-duration');
  const selectedDuration = durationSelect ? durationSelect.value : '10';

  const btnCreate = document.getElementById('btn-create-meditation');

  // STEP 4: Instant Button State Shift to Loading State
  if (btnCreate) {
    btnCreate.disabled = true;
    btnCreate.innerText = "⏳ Выполняется генерация сказки-медитации, подождите...";
    btnCreate.style.opacity = "0.75";
    btnCreate.style.cursor = "wait";
  }

  logClickAnalytics('Generate_Click', displayName, 0, { section: 'generator', duration_mins: selectedDuration });

  // Guardrail Safety check
  const safetyCheck = llmSystemPromptConfig.guardrailSafetyFilter(displayName);
  if (!safetyCheck.safe) {
    console.log(safetyCheck.message);
  }

  // 1. Perform Instant Voice Cloning if user recorded/uploaded audio in current session
  let activeVoiceId = appState.clonedVoiceId;
  if (appState.recordedAudioBlob && !activeVoiceId) {
    const micText = document.getElementById('mic-text');
    if (micText) micText.innerText = "⏳ Клонирование голоса родителя в ElevenLabs...";
    const clonedId = await cloneParentVoiceElevenLabs(appState.recordedAudioBlob);
    if (clonedId) {
      activeVoiceId = clonedId;
    }
  }

  // 2. Fallback voice ID if API cloning quota exceeded
  if (!activeVoiceId) {
    activeVoiceId = "C0qT9fWAA22Nx02a6QJY";
  }

  // Build dynamic text script for target duration (5 to 30 mins) with SSML breaks (1.5s & 3.0s)
  const customText = buildScriptText(rawName, selectedDuration);

  document.getElementById('meditation-text-box').innerText = customText;
  document.getElementById('player-title').innerText = `${displayName} — Сказка-Медитация (${selectedDuration} мин)`;

  // 3. Synthesize Meditation Audio Track via ElevenLabs API
  const micText = document.getElementById('mic-text');
  if (micText) micText.innerText = "⏳ Озвучивание сказки-медитации в ElevenLabs...";

  const synthesizedBlob = await synthesizeElevenLabsAudio(customText, activeVoiceId);

  if (synthesizedBlob && synthesizedBlob.size > 1000) {
    // Successfully synthesized — use ElevenLabs audio
    appState.recordedAudioBlob = synthesizedBlob;
    appState.recordedAudioUrl = URL.createObjectURL(synthesizedBlob);

    // Save to Supabase
    saveParentVoiceToSupabase(synthesizedBlob, activeVoiceId, displayName);

    // Save to localStorage ONLY if blob is small enough (< 4 MB to stay within localStorage limit)
    if (synthesizedBlob.size < 4 * 1024 * 1024) {
      try {
        const reader = new FileReader();
        reader.onloadend = () => {
          try {
            localStorage.setItem('mindecho_latest_parent_voice_b64', reader.result);
            localStorage.setItem('mindecho_latest_parent_voice_time', new Date().toISOString());
          } catch (e) {
            console.warn('localStorage save skipped (size limit):', e.message);
          }
        };
        reader.readAsDataURL(synthesizedBlob);
      } catch (e) {
        console.warn('localStorage write error:', e.message);
      }
    } else {
      // Too large for localStorage — store only the ObjectURL reference
      localStorage.setItem('mindecho_latest_parent_voice_time', new Date().toISOString());
      console.log('Synthesized audio too large for localStorage — playing via ObjectURL only');
    }

    if (micText) micText.innerText = "🟢 Сказка-медитация успешно сгенерирована в ElevenLabs!";
  } else if (appState.recordedAudioUrl) {
    // ElevenLabs unavailable — play the original parent recording directly
    if (micText) micText.innerText = "🟡 Воспроизводится голос родителя (без синтеза ElevenLabs)";
    console.log('ElevenLabs synthesis skipped — using previously recorded parent voice for playback');
  } else {
    if (micText) micText.innerText = "⚠️ Запись голоса не найдена. Нажмите микрофон для записи.";
  }

  appState.isPlayingAudio = false;

  // STEP 5: Instant Button State Shift to Ready Active State upon completion
  if (btnCreate) {
    btnCreate.disabled = false;
    btnCreate.innerText = "🎧 Слушать сказку-медиацию сгенерированую Заданным голосом";
    btnCreate.style.opacity = "1";
    btnCreate.style.cursor = "pointer";
    btnCreate.style.background = "linear-gradient(135deg, #10B981 0%, #059669 100%)";
    btnCreate.onclick = playParentRecordedVoice;
  }

  // DO NOT AUTO-START PLAYBACK! Wait for user to explicitly click "🎧 Слушать сказку-медиацию сгенерированую Заданным голосом"
  const playerSubtitle = document.getElementById('player-subtitle');
  if (playerSubtitle) {
    playerSubtitle.innerText = `🟢 Сказка-медитация готова! Нажмите зеленую кнопку «Слушать сказку-медиацию» для воспроизведения.`;
  }

  logClickAnalytics('Meditation_Generated', displayName, 0, { active_voice_id: activeVoiceId, duration_mins: selectedDuration });
}

function playParentRecordedVoice() {
  if (window.speechSynthesis) window.speechSynthesis.cancel();
  
  // Stop background MP3 meditation1 track if playing
  if (appState.audioTrack) {
    appState.audioTrack.pause();
    appState.isPlayingAudio = false;
    const playBtn = document.getElementById('play-btn');
    if (playBtn) playBtn.innerText = "▶";
  }

  const btnCreate = document.getElementById('btn-create-meditation');

  if (appState.recordedAudioUrl) {
    // Reuse existing parent audio element to allow smooth Pause/Resume
    if (!appState.parentAudioTrack || appState.parentAudioTrack.src !== appState.recordedAudioUrl) {
      if (appState.parentAudioTrack) {
        appState.parentAudioTrack.pause();
      }
      appState.parentAudioTrack = new Audio(appState.recordedAudioUrl);
    }

    const parentAudio = appState.parentAudioTrack;

    // TOGGLE LOGIC: If playing -> PAUSE; If paused -> PLAY/RESUME
    if (!parentAudio.paused && !parentAudio.ended && parentAudio.currentTime > 0) {
      parentAudio.pause();
      appState.isPlayingParentVoice = false;
      if (btnCreate) {
        btnCreate.innerText = "🎧 Продолжить прослушивание сказки-медиации Заданным голосом";
        btnCreate.style.background = "linear-gradient(135deg, #10B981 0%, #059669 100%)";
      }
      const playerSubtitle = document.getElementById('player-subtitle');
      if (playerSubtitle) playerSubtitle.innerText = "⏸ Пауза воспроизведения родительского голоса";
    } else {
      parentAudio.play().then(() => {
        appState.isPlayingParentVoice = true;
        if (btnCreate) {
          btnCreate.innerText = "⏸ Поставить на паузу сказку-медиацию Заданного голоса";
          btnCreate.style.background = "linear-gradient(135deg, #EF4444 0%, #DC2626 100%)";
        }
        const playerSubtitle = document.getElementById('player-subtitle');
        if (playerSubtitle) playerSubtitle.innerText = "🎙 Озвучивание записанным голосом родителя!";
      }).catch(err => {
        console.warn("Parent recorded audio play error:", err);
        playMP3AudioTrack(true);
      });

      parentAudio.onended = () => {
        appState.isPlayingParentVoice = false;
        if (btnCreate) {
          btnCreate.innerText = "🎧 Слушать сказку-медиацию сгенерированую Заданным голосом";
          btnCreate.style.background = "linear-gradient(135deg, #10B981 0%, #059669 100%)";
        }
        const playerSubtitle = document.getElementById('player-subtitle');
        if (playerSubtitle) playerSubtitle.innerText = "✨ Воспроизведение завершено";
      };
    }
  } else {
    alert("🎙 Вы еще не записали свой голос! Нажмите микрофон слева для записи отрывка вашего голоса.");
    playMP3AudioTrack(true);
  }
}

function playMP3AudioTrack(forceStart = false) {
  if (window.speechSynthesis) window.speechSynthesis.cancel();

  if (!appState.audioTrack) {
    initAudioPlayer();
  }

  if (forceStart) {
    appState.audioTrack.currentTime = 0;
    appState.audioTrack.play().then(() => {
      appState.isPlayingAudio = true;
      document.getElementById('play-btn').innerText = "⏸";
    }).catch(err => {
      console.warn("MP3 playback fallback to speech synth:", err);
      const text = document.getElementById('meditation-text-box').innerText;
      speakTextTTS(text);
    });
    return;
  }

  if (appState.isPlayingAudio) {
    appState.audioTrack.pause();
    appState.isPlayingAudio = false;
    document.getElementById('play-btn').innerText = "▶";
  } else {
    appState.audioTrack.play().then(() => {
      appState.isPlayingAudio = true;
      document.getElementById('play-btn').innerText = "⏸";
    }).catch(err => {
      console.warn("MP3 playback fallback to speech synth:", err);
      const text = document.getElementById('meditation-text-box').innerText;
      speakTextTTS(text);
    });
  }
}

function playQuickTestAudio() {
  const playerCard = document.querySelector('.player-card') || document.getElementById('generator');
  if (playerCard) {
    playerCard.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }
  playMP3AudioTrack(true);
  logClickAnalytics('QuickTestAudio_Clicked', 'Hero Quick Test Button', 0);
}

function togglePlayAudio() {
  if (appState.isPlayingAudio) {
    if (appState.audioTrack) appState.audioTrack.pause();
    if (window.speechSynthesis) window.speechSynthesis.pause();
    appState.isPlayingAudio = false;
    document.getElementById('play-btn').innerText = "▶";
  } else {
    if (appState.audioTrack && appState.audioTrack.currentTime > 0) {
      playMP3AudioTrack(false);
    } else {
      generatePersonalMeditation();
    }
  }
}

function speakTextTTS(text) {
  if (appState.audioTrack) appState.audioTrack.pause();
  if (!window.speechSynthesis) {
    playMP3AudioTrack(true);
    return;
  }

  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.rate = 0.6;
  utterance.pitch = 0.75;
  utterance.lang = appState.lang === 'he' ? 'he-IL' : 'ru-RU';

  utterance.onstart = () => {
    appState.isPlayingAudio = true;
    document.getElementById('play-btn').innerText = "⏸";
  };

  utterance.onend = () => {
    appState.isPlayingAudio = false;
    document.getElementById('play-btn').innerText = "▶";
  };

  window.speechSynthesis.speak(utterance);
}

function generateEmergencyAudio() {
  const contextInput = document.getElementById('emergency-context').value || "Ребенок растревожен";
  const name = document.getElementById('child-name').value || "Ребенок";

  const emergencyScript = `
    ${name}, сделай глубокий выдох вместе со мной... Один... два... три... 
    Я знаю, что ситуация: "${contextInput}" вызывает много эмоций. 
    Но сейчас ты находишься в полной безопасности.
  `;

  document.getElementById('meditation-text-box').innerHTML = `<p><strong>🚨 ЭКСТРЕННОЕ АУДИО ЗАЗЕМЛЕНИЯ:</strong><br><br>${emergencyScript}</p>`;
  playMP3AudioTrack();
  logClickAnalytics('EmergencyAudio_Generated', contextInput, 0);
}

function initSignatureCanvas() {
  appState.signatureCanvas = document.getElementById('signature-canvas');
  if (!appState.signatureCanvas) return;

  const canvas = appState.signatureCanvas;

  // Set internal resolution matching bounding rect
  const rect = canvas.getBoundingClientRect();
  if (rect.width > 0 && rect.height > 0) {
    canvas.width = rect.width;
    canvas.height = rect.height;
  } else {
    canvas.width = 400;
    canvas.height = 140;
  }

  const ctx = canvas.getContext('2d');
  appState.signatureCtx = ctx;

  ctx.strokeStyle = '#0F172A'; // Dark stroke on white canvas
  ctx.lineWidth = 3;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';

  if (canvas.getAttribute('data-initialized') === 'true') return;
  canvas.setAttribute('data-initialized', 'true');

  function getPos(e) {
    const r = canvas.getBoundingClientRect();
    const scaleX = canvas.width / r.width;
    const scaleY = canvas.height / r.height;

    let clientX, clientY;
    if (e.touches && e.touches.length > 0) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      clientX = e.clientX;
      clientY = e.clientY;
    }

    return {
      x: (clientX - r.left) * scaleX,
      y: (clientY - r.top) * scaleY
    };
  }

  function startDrawing(e) {
    e.preventDefault();
    appState.isDrawingSignature = true;
    const pos = getPos(e);
    ctx.beginPath();
    ctx.moveTo(pos.x, pos.y);
  }

  function draw(e) {
    if (!appState.isDrawingSignature) return;
    e.preventDefault();
    const pos = getPos(e);
    ctx.lineTo(pos.x, pos.y);
    ctx.stroke();

    appState.hasSignature = true;
    const sigStatus = document.getElementById('sig-status');
    if (sigStatus) {
      sigStatus.style.color = '#22C55E';
      sigStatus.innerText = '✍️ Подпись поставлена';
    }
  }

  function stopDrawing(e) {
    if (appState.isDrawingSignature) {
      appState.isDrawingSignature = false;
      ctx.closePath();
    }
  }

  // Mouse event listeners
  canvas.addEventListener('mousedown', startDrawing);
  canvas.addEventListener('mousemove', draw);
  canvas.addEventListener('mouseup', stopDrawing);
  canvas.addEventListener('mouseleave', stopDrawing);

  // Touch event listeners (mobile/tablet)
  canvas.addEventListener('touchstart', startDrawing, { passive: false });
  canvas.addEventListener('touchmove', draw, { passive: false });
  canvas.addEventListener('touchend', stopDrawing, { passive: false });
  canvas.addEventListener('touchcancel', stopDrawing, { passive: false });
}

function clearSignatureCanvas() {
  if (appState.signatureCtx && appState.signatureCanvas) {
    appState.signatureCtx.clearRect(0, 0, appState.signatureCanvas.width, appState.signatureCanvas.height);
    appState.hasSignature = false;
    const sigStatus = document.getElementById('sig-status');
    if (sigStatus) {
      sigStatus.style.color = 'var(--text-muted)';
      sigStatus.innerText = 'Подпись пуста';
    }
  }
}

function openNDAModal() {
  const modal = document.getElementById('nda-modal');
  if (modal) modal.classList.remove('hidden');
  setTimeout(() => {
    initSignatureCanvas();
  }, 50);
  logClickAnalytics('NDAModal_Opened', 'NDA_Form', 0);
}

function closeNDAModal() {
  const modal = document.getElementById('nda-modal');
  if (modal) modal.classList.add('hidden');
}

async function submitNDASignature() {
  const name = document.getElementById('nda-user-name').value || 'Анонимный Подписант';
  const contact = document.getElementById('nda-user-contact')?.value.trim() || '';
  const email = document.getElementById('nda-user-email')?.value.trim() || '';

  if (!contact) {
    alert("⚠️ Пожалуйста, укажите ваш номер WhatsApp или Telegram для продолжения!");
    return;
  }

  const voiceConsent = document.getElementById('nda-voice-consent')?.checked;
  if (!voiceConsent) {
    const lang = appState.lang || 'ru';
    let msg = "⚠️ Пожалуйста, поставьте галочку согласия на обработку записи голоса для клонирования ИИ!";
    if (lang === 'en') msg = "⚠️ Please check the box to consent to voice recording processing for AI voice cloning!";
    if (lang === 'he') msg = "⚠️ אנא סמן/י את תיבת ההסכמה לעיבוד הקלטת הקול עבור שפול קול בבינה מלאכותית!";
    alert(msg);
    document.getElementById('nda-voice-consent')?.focus();
    return;
  }

  localStorage.setItem('ndaSigned', 'true');
  alert(`🎉 Соглашение успешно подписано!\nПодписант: ${name}`);
  closeNDAModal();

  logClickAnalytics('NDA_Signed', name, 0, {
    user_name: name,
    contact: contact,
    email: email,
    phone: contact
  });

  if (appState.pendingCheckout && appState.selectedPrice > 0 && appState.selectedPlan !== 'Free') {
    appState.pendingCheckout = false;
    document.getElementById('checkout-plan-name').innerText = appState.selectedPlan;
    document.getElementById('checkout-plan-price').innerText = `$${appState.selectedPrice}`;
    document.getElementById('checkout-modal').classList.remove('hidden');
  } else {
    appState.pendingCheckout = false;
    scrollToSection('generator');
  }
}

// CustDev Survey Scenarios with 3 questions per scenario (RU, EN, HE) like in mindecho-ai-114
const CUSTDEV_SCENARIOS = {
  burnout: {
    ru: [
      { label: "1. Сколько времени занимает укладывание ребенка и насколько вы чувствуете выгорание к вечеру (1-10)?", placeholder: "Например: 1.5 часа, выгорание 8/10" },
      { label: "2. Что больше всего мешает нормальному сну ребенка?", placeholder: "Например: Капризы, просит посидеть рядом, перевозбуждение..." },
      { label: "3. Готовы ли вы попробовать инструмент, дарящий 1-2 часа личного времени?", placeholder: "Да, хочу протестировать" }
    ],
    en: [
      { label: "1. How long does bedtime take and how burnt out do you feel by evening (1-10)?", placeholder: "e.g. 1.5 hours, burnout 8/10" },
      { label: "2. What interferes most with your child's healthy sleep?", placeholder: "e.g. Tantrums, asking to sit nearby, overexcitation..." },
      { label: "3. Are you ready to try a tool that gives you 1-2 hours of personal time?", placeholder: "Yes, I want to test it" }
    ],
    he: [
      { label: "1. כמה זמן לוקחת הרדמת הילד וכמה שחיקה אתם מרגישים בערב (1-10)?", placeholder: "למשל: שעה וחצי, שחיקה 8/10" },
      { label: "2. מה הכי מפריע לשינה תקינה של הילד?", placeholder: "למשל: תסכולים, בקשה לשבת לידו, עוררות יתר..." },
      { label: "3. האם אתם מוכנים לנסות כלי המעניק 1-2 שעות של זמן אישי?", placeholder: "כן, אשמח לבדוק" }
    ]
  },
  tantrums: {
    ru: [
      { label: "1. Как часто ребенок впадает в истерики и ссоры?", placeholder: "Например: Каждый день при уходе с детской площадки..." },
      { label: "2. Что вы обычно испытываете в этот момент?", placeholder: "Например: Бессилие, вину, раздражение..." },
      { label: "3. Хотите протестировать 4-шаговый экстренный протокол заземления?", placeholder: "Да, очень актуально" }
    ],
    en: [
      { label: "1. How often does your child experience tantrums or conflicts?", placeholder: "e.g. Every day when leaving the playground..." },
      { label: "2. What do you usually feel at that moment?", placeholder: "e.g. Helplessness, guilt, irritation..." },
      { label: "3. Would you like to test the 4-step emergency grounding protocol?", placeholder: "Yes, very relevant" }
    ],
    he: [
      { label: "1. באיזו תדירות הילד נכנס להתקפי זעם ומריבות?", placeholder: "למשל: כל יום בעת עזיבת גן המשחקים..." },
      { label: "2. מה אתם מרגישים בדרך כלל באותו רגע?", placeholder: "למשל: חוסר אונים, אשמה, תסכול..." },
      { label: "3. האם תרצו לבדוק פרוטוקול חירום 4-שלבים לקרקוע?", placeholder: "כן, רלוונטי מאוד" }
    ]
  },
  confidence: {
    ru: [
      { label: "1. Какие качества вы мечтаете развивать в ребенке?", placeholder: "Например: Уверенность, легкая учеба, верные друзья" },
      { label: "2. Замечаете ли страхи или сомнения в своих силах у ребенка?", placeholder: "Иногда боится отвечать у доски..." },
      { label: "3. Хотите посмотреть утренний рассказ-настрой на успех?", placeholder: "Да, хочу попробовать" }
    ],
    en: [
      { label: "1. What qualities do you dream of fostering in your child?", placeholder: "e.g. Confidence, easy learning, loyal friends" },
      { label: "2. Do you notice fears or self-doubt in your child?", placeholder: "e.g. Sometimes afraid to speak in public..." },
      { label: "3. Would you like to try the morning success mindset story?", placeholder: "Yes, I want to try" }
    ],
    he: [
      { label: "1. אילו תכונות הייתם חולמים לפתח בילד?", placeholder: "למשל: ביטחון עצמי, למידה קלה, חברים נאמנים" },
      { label: "2. האם אתם מזהים פחדים או ספקות עצמיים אצל הילד?", placeholder: "למשל: לפעמים חושש לדבר בכיתה..." },
      { label: "3. האם תרצו לבדוק סיפור כוונון בוקר להצלחה?", placeholder: "כן, אשמח לנסות" }
    ]
  },
  expert: {
    ru: [
      { label: "1. Насколько вам близка идея ИИ + КПТ экосистемы для семей?", placeholder: "Очень поддерживаю проект" },
      { label: "2. Чего не хватает современным сервисам для родителей?", placeholder: "Например: Качественной персонализации" },
      { label: "3. Готовы дать экспертный отзыв после тестирования?", placeholder: "Да, готова написать отзыв" }
    ],
    en: [
      { label: "1. How resonant is the AI + CBT family ecosystem idea for you?", placeholder: "Strongly support the project" },
      { label: "2. What is missing in modern parenting services?", placeholder: "e.g. High-quality personalization" },
      { label: "3. Are you ready to provide expert feedback after testing?", placeholder: "Yes, ready to write a review" }
    ],
    he: [
      { label: "1. עד כמה רעיון המערכת האקולוגית AI + CBT למשפחות קרוב ללבכם?", placeholder: "תומך מאוד בפרויקט" },
      { label: "2. מה חסר בשירותים מודרניים להורים?", placeholder: "למשל: התאמה אישית איכותית" },
      { label: "3. האם אתם מוכנים לתת חוות דעת מקצועית לאחר הבדיקה?", placeholder: "כן, אשמח לכתוב חוות דעת" }
    ]
  }
};

function openCustDevModal() {
  document.getElementById('custdev-modal').classList.remove('hidden');
  selectCustDevScenario(appState.currentCustDevScenario || 'burnout');
  logClickAnalytics('CustDevModal_Opened', 'CustDev', 0);
}

function closeCustDevModal() {
  document.getElementById('custdev-modal').classList.add('hidden');
}

function selectCustDevScenario(scenarioKey) {
  appState.currentCustDevScenario = scenarioKey;

  document.querySelectorAll('.custdev-btn').forEach(btn => btn.classList.remove('active'));
  const activeBtn = document.getElementById(`cd-btn-${scenarioKey}`);
  if (activeBtn) activeBtn.classList.add('active');

  const lang = appState.lang || 'ru';
  const scenarioObj = CUSTDEV_SCENARIOS[scenarioKey] || CUSTDEV_SCENARIOS.burnout;
  const questions = (scenarioObj && scenarioObj[lang]) ? scenarioObj[lang] : (scenarioObj['ru'] || []);

  const container = document.getElementById('custdev-q-container');
  if (!container) return;
  container.innerHTML = '';

  questions.forEach((q, idx) => {
    const qDiv = document.createElement('div');
    qDiv.className = 'custdev-q-item';
    qDiv.style.marginBottom = '12px';
    qDiv.innerHTML = `
      <label style="display:block; margin-bottom:6px; font-weight:600; font-size:13px;">${q.label}</label>
      <input type="text" id="cd-input-${idx}" placeholder="${q.placeholder}" class="form-input" style="width:100%; border:1px solid rgba(255,255,255,0.2);">
    `;
    container.appendChild(qDiv);
  });
}

function handleCustDevSubmit(e) {
  e.preventDefault();
  const contact = document.getElementById('cd-input-contact')?.value.trim() || '-';
  const scenario = appState.currentCustDevScenario || 'burnout';
  const lang = appState.lang || 'ru';
  const scenarioObj = CUSTDEV_SCENARIOS[scenario] || CUSTDEV_SCENARIOS.burnout;
  const questions = (scenarioObj && scenarioObj[lang]) ? scenarioObj[lang] : (scenarioObj['ru'] || []);

  const answers = [];
  questions.forEach((q, idx) => {
    const val = document.getElementById(`cd-input-${idx}`)?.value || '';
    answers.push(`${q.label}: ${val}`);
  });

  const formattedAnswers = answers.join(" | ");
  const isEmail = contact.includes('@');

  // Primary Analytics Event
  logClickAnalytics('CustDev_Submitted', scenario, 0, {
    user_name: contact,
    email: isEmail ? contact : '-',
    phone: contact,
    section: formattedAnswers,
    page_section: formattedAnswers
  });

  // Dedicated separate log entry for WhatsApp/Telegram contact
  logClickAnalytics('WhatsApp_Telegram_Captured', 'CustDev_Survey', 0, {
    phone: contact,
    user_name: contact,
    plan_name: scenario,
    page_section: formattedAnswers
  });

  // Direct fail-safe Supabase Post
  try {
    const payload = {
      timestamp: new Date().toLocaleString('ru-RU'),
      event_type: 'CustDev_Submitted',
      session_id: (typeof SESSION_ID !== 'undefined' ? SESSION_ID : 'GUEST'),
      user_name: contact,
      email: isEmail ? contact : '-',
      phone: contact,
      plan_name: scenario,
      price: 0,
      language: lang,
      page_section: formattedAnswers
    };
    fetch(supabaseUrl, {
      method: 'POST',
      headers: {
        'apikey': supabaseKey,
        'Authorization': 'Bearer ' + supabaseKey,
        'Content-Type': 'application/json',
        'Prefer': 'return=minimal'
      },
      body: JSON.stringify(payload)
    }).catch(err => console.warn('Direct Supabase CustDev post warning:', err));
  } catch(ex) {
    console.warn('Fail-safe Supabase error:', ex);
  }

  let thankMsg = "🎉 Спасибо за ваши ответы! Ваши ответы сохранены в системе. Вам предоставлен приоритетный VIP-доступ.";
  if (lang === 'en') thankMsg = "🎉 Thank you for your answers! Your responses have been saved. You have been granted priority VIP access.";
  if (lang === 'he') thankMsg = "🎉 תודה על תשובותיך! התשובות נשמרו במערכת. הוענקה לך גישת VIP בעדיפות.";

  alert(thankMsg);
  closeCustDevModal();
}

/* ==========================================================================
   Pricing Card Billing Toggle Handler (Individual Card Scoped)
   ========================================================================== */
function setCardBilling(btnEl, planName, cycle) {
  const isAnnual = (cycle === 'annual');
  const card = btnEl ? btnEl.closest('.pricing-card') : null;

  if (card) {
    const monthlyBtn = card.querySelector('.btn-monthly');
    const annualBtn  = card.querySelector('.btn-annual');
    if (isAnnual) {
      if (annualBtn)  annualBtn.classList.add('active');
      if (monthlyBtn) monthlyBtn.classList.remove('active');
    } else {
      if (monthlyBtn) monthlyBtn.classList.add('active');
      if (annualBtn)  annualBtn.classList.remove('active');
    }

    const priceEl = card.querySelector('.plan-price');
    const subtextEl = card.querySelector('.annual-subtext');

    if (planName === 'Basic') {
      if (isAnnual) {
        if (priceEl) priceEl.innerHTML = "$29.99 <span>/ год</span>";
        if (subtextEl) subtextEl.classList.remove('hidden');
      } else {
        if (priceEl) priceEl.innerHTML = "$7 <span>/ месяц</span>";
        if (subtextEl) subtextEl.classList.add('hidden');
      }
    } else if (planName === 'Premium') {
      if (isAnnual) {
        if (priceEl) priceEl.innerHTML = "$59.99 <span>/ год</span>";
        if (subtextEl) subtextEl.classList.remove('hidden');
      } else {
        if (priceEl) priceEl.innerHTML = "$14.99 <span>/ месяц</span>";
        if (subtextEl) subtextEl.classList.add('hidden');
      }
    } else if (planName === 'Platinum') {
      if (isAnnual) {
        if (priceEl) priceEl.innerHTML = "$99.99 <span>/ год</span>";
        if (subtextEl) subtextEl.classList.remove('hidden');
      } else {
        if (priceEl) priceEl.innerHTML = "$24.99 <span>/ месяц</span>";
        if (subtextEl) subtextEl.classList.add('hidden');
      }
    }
  }

  if (!appState.cardBillingState) appState.cardBillingState = {};
  appState.cardBillingState[planName] = isAnnual;

  logClickAnalytics('CardBillingCycle_Toggled', planName + '_' + (isAnnual ? 'Annual' : 'Monthly'), 0);
}

function selectPlan(planName, price) {
  appState.selectedPlan = planName;
  const isAnnual = appState.cardBillingState ? appState.cardBillingState[planName] : false;
  let finalPrice = price;

  if (isAnnual && price > 0) {
    if (planName === 'Basic') finalPrice = 29.99;
    else if (planName === 'Premium') finalPrice = 59.99;
    else if (planName === 'Platinum') finalPrice = 99.99;
  }
  appState.selectedPrice = finalPrice;

  logClickAnalytics('TariffButton_Click', planName + (isAnnual ? '_Annual' : '_Monthly'), finalPrice);

  if (price === 0 || planName === 'Free') {
    appState.pendingCheckout = false;
  } else {
    appState.pendingCheckout = true;
  }
  openNDAModal();
}

function closeCheckoutModal() {
  document.getElementById('checkout-modal').classList.add('hidden');
}

function handlePaymentSubmit(e) {
  e.preventDefault();
  alert(`🎉 Подписка "${appState.selectedPlan}" успешно активирована!`);
  closeCheckoutModal();
}

function openAuthModal(type = 'login') {
  appState.pendingAuthModal = type;
  openNDAModal();
}

function closeAuthModal() {
  document.getElementById('auth-modal').classList.add('hidden');
}

function simulateSocialAuth(provider) {
  alert(`🎉 Вход через ${provider} выполнен успешно!`);
  closeAuthModal();
}

function handleAuthSubmit(e) {
  e.preventDefault();
  closeAuthModal();
}

function logClickAnalytics(eventType, planName, priceAmount, extraData = {}) {
  const timeOnPage = Math.round((Date.now() - analyticsState.pageStartTime) / 1000);
  const payload = {
    timestamp: new Date().toLocaleString('ru-RU'),
    event_type: eventType,
    session_id: SESSION_ID,
    user_name: extraData.user_name || '-',
    email: extraData.email || '-',
    phone: extraData.phone || '-',
    plan_name: planName || '-',
    price: priceAmount || 0,
    language: appState.lang || 'ru',
    scroll_depth: analyticsState.maxScrollDepth,
    time_on_page: timeOnPage,
    page_section: extraData.page_section || extraData.section || extraData.answers || '-'
  };

  fetch(supabaseUrl, {
    method: 'POST',
    headers: {
      'apikey': supabaseKey,
      'Authorization': 'Bearer ' + supabaseKey,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(payload)
  }).catch(err => console.warn('Supabase analytics fetch error:', err));
}

function initAnalyticsTracking() {
  logClickAnalytics('Page_View', '-', 0, { section: 'hero' });
}

function registerServiceWorker() {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('sw.js').catch(err => console.log('SW error:', err));
  }
}

// Global Window Binds
window.openNDAModal = openNDAModal;
window.closeNDAModal = closeNDAModal;
window.submitNDASignature = submitNDASignature;
window.openAuthModal = openAuthModal;
window.closeAuthModal = closeAuthModal;
window.handleAuthSubmit = handleAuthSubmit;
window.openCustDevModal = openCustDevModal;
window.closeCustDevModal = closeCustDevModal;
window.handleCustDevSubmit = handleCustDevSubmit;
window.selectCustDevScenario = selectCustDevScenario;
window.selectPlan = selectPlan;
window.closeCheckoutModal = closeCheckoutModal;
window.handlePaymentSubmit = handlePaymentSubmit;
window.playQuickTestAudio = playQuickTestAudio;
window.selectAudioMode = selectAudioMode;
window.switchLanguage = switchLanguage;
window.scrollToSection = scrollToSection;
window.simulateSocialAuth = simulateSocialAuth;
window.generatePersonalMeditation = generatePersonalMeditation;
window.toggleVoiceRecord = toggleVoiceRecord;
window.clearSignatureCanvas = clearSignatureCanvas;
window.setCardBilling = setCardBilling;
window.toggleFullStoryText = toggleFullStoryText;

// Educational Modals and Conversion Event Trackers
function openEduTutoringModal() {
  logClickAnalytics('Click_Btn_Tutoring', 'Tutoring_Page_Open', 0, { section: 'edu_tutoring' });
  const modal = document.getElementById('edu-tutoring-modal');
  if (modal) modal.classList.remove('hidden');
}

function closeEduTutoringModal() {
  const modal = document.getElementById('edu-tutoring-modal');
  if (modal) modal.classList.add('hidden');
}

function openEduSchoolModal() {
  logClickAnalytics('Click_Btn_School', 'School_Page_Open', 0, { section: 'edu_school' });
  const modal = document.getElementById('edu-school-modal');
  if (modal) modal.classList.remove('hidden');
}

function closeEduSchoolModal() {
  const modal = document.getElementById('edu-school-modal');
  if (modal) modal.classList.add('hidden');
}

function trackAndSelectPlan(position, serviceName) {
  logClickAnalytics('Click_Choose_Plan', serviceName + '_' + position, 0, { section: serviceName });
  closeEduTutoringModal();
  closeEduSchoolModal();
  scrollToSection('pricing');
}

window.openEduTutoringModal = openEduTutoringModal;
window.closeEduTutoringModal = closeEduTutoringModal;
window.openEduSchoolModal = openEduSchoolModal;
window.closeEduSchoolModal = closeEduSchoolModal;
window.trackAndSelectPlan = trackAndSelectPlan;

// Educational Billing Toggle & Subject Payment Handlers
appState.eduBillingState = {
  Tutoring: 'monthly',
  School: 'monthly'
};

function setEduBillingCycle(btnEl, planType, cycle) {
  const parentToggle = btnEl.parentElement;
  if (parentToggle) {
    parentToggle.querySelectorAll('.card-cycle-btn').forEach(b => b.classList.remove('active'));
  }
  btnEl.classList.add('active');

  if (!appState.eduBillingState) appState.eduBillingState = {};
  appState.eduBillingState[planType] = cycle;

  const card = btnEl.closest('.pricing-card');
  if (card) {
    const monthlyPriceEl = card.querySelector(`.price-${planType.toLowerCase()}-monthly`);
    const annualPriceEl = card.querySelector(`.price-${planType.toLowerCase()}-annual`);

    if (cycle === 'annual') {
      if (monthlyPriceEl) monthlyPriceEl.classList.add('hidden');
      if (annualPriceEl) annualPriceEl.classList.remove('hidden');
    } else {
      if (monthlyPriceEl) monthlyPriceEl.classList.remove('hidden');
      if (annualPriceEl) annualPriceEl.classList.add('hidden');
    }
  }

  logClickAnalytics('EduBillingCycle_Toggled', planType + '_' + cycle, 0);
}

function submitEduSubjectOrder(planType) {
  const cycle = (appState.eduBillingState && appState.eduBillingState[planType]) ? appState.eduBillingState[planType] : 'monthly';
  let price = 0;
  let planName = '';

  if (planType === 'Tutoring') {
    const subjectEl = document.getElementById('extracurricular-subject-select');
    const subjectText = subjectEl ? subjectEl.options[subjectEl.selectedIndex].text : 'Предметное ИИ-Репетиторство';
    price = (cycle === 'annual') ? 790 : 90;
    planName = `Внешкольное Обучение: ${subjectText}`;
  } else {
    price = (cycle === 'annual') ? 4900 : 340;
    planName = 'Удалённое Школьное Обучение';
  }

  appState.selectedPlan = planName;
  appState.selectedPrice = price;

  logClickAnalytics('EduPlan_Selected', planName + '_' + (cycle === 'annual' ? 'Annual' : 'Monthly'), price);
  openNDAModal();
}

function downloadStandardMorningAudio() {
  logClickAnalytics('Download_Standard_Morning_Audio', 'meditation_good_morning1.mp3', 0);
  const link = document.createElement('a');
  link.href = MORNING_AUDIO_STANDARD_URL;
  link.download = 'meditation_good_morning1.mp3';
  link.target = '_blank';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

window.setEduBillingCycle = setEduBillingCycle;
window.submitEduSubjectOrder = submitEduSubjectOrder;
window.downloadStandardMorningAudio = downloadStandardMorningAudio;


