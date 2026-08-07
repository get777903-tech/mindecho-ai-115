/* ==========================================================================
   MindEcho AI 2026 — Main Application Engine (mindecho-ai-111)
   Admin Analytics Dashboard + Full Click Tracking + Scroll/Time Metrics
   ========================================================================== */

// Supabase Configuration
const supabaseUrl = 'https://yslrofsjeujsftlabuqn.supabase.co/rest/v1/analytics_events';
const supabaseKey = 'sb_publishable_tnc4wA3Cr-FtaDyjVz9Q6Q_fklMPSDr';

// Audio Track File Name
const MEDITATION_AUDIO_SRC = "meditation1.mp3";

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

// 100% Comprehensive Multilingual Dictionary (RU, EN, HE)
const i18n = {
  ru: {
    nav_mission: "Миссия",
    nav_modes: "Аудиорежимы",
    nav_generator: "Студия",
    nav_pricing: "Тарифы",
    nav_nda: "DISCLAIMER",
    nav_custdev: "🎁 Опрос + подарок",
    btn_login: "Войти",
    btn_games: "🎮 Игры развивающие речь + эмоциональный интеллект",
    btn_prayer: "🙏 Создание молитвы-медитации",
    hero_badge: "ИИ + Детская Нейропсихология + КПТ/ACT + Психосоматика",
    hero_title: "Превращаем родительскую рутину в <span class='text-gradient'>бережную терапию</span>",
    hero_subtitle: "Мы создаем глобальное технологическое решение для защиты ментального здоровья семей. Легальный способ сохранить эмоциональные ресурсы родителей и вырастить счастливого ребенка.",
    btn_try_free: "✨ Попробовать! Рассказ-медитация с голосом мамы или папы",
    btn_try_free_sub: "мягко исцеляет дневные стрессы, обиды и страхи ребенка прямо в процессе засыпания или заряд утренней уверенности",
    btn_support_project: "[ Поддержать проект / Получить ссылку ]",
    trust_privacy: "🛡 Privacy-First (Банковское шифрование)",
    trust_supervisor: "🧠 Валидировано Агентом-Супервизором",
    trust_global: "🌏 платформа для каждого и всего мира",
    hero_card_sub: "Медленный спокойный голос родителя • Без музыки",
    hero_sample_quote: '"Закрой глаза и обрати внимание на свой нос... Почувствуй тихую и спокойную радость внутри..."',
    hero_card_footer: "✨ Персонализированный рассказ-медитация",
    tag_supermission: "Супермиссия MindEcho AI",
    title_supermission: "4 Столпа Общественного Проекта",
    sub_supermission: "Мы создаем не просто коммерческий софт, а самую защищенную и научно выверенную экосистему для ментального здоровья семей во всем мире.",
    m1_title: "1. платформа для каждого и всего мира",
    m1_desc: "Стираем социальное и экономическое неравенство. Платформа доступна даже для малоимущих семей — каждый ребенок имеет право на здоровое развитие. Диалог по КПТ и ACT с супервизором.",
    m2_title: "2. Гармония в доме без ссор",
    m2_desc: "Прогрессивные аудиорежимы и геймификация привычек исключают из жизни семьи истерики, упреки и обиды, мягко повышая эмоциональный интеллект (EQ).",
    m3_title: "3. Сбережение энергии родителей",
    m3_desc: "Защищаем родителей от выгорания, гарантируя 1–2 часа личного времени в день, а детей — от ментального перенапряжения.",
    m3_tag: "Освобождение 1-2 часа личного времени",
    m4_title: "4. Психосоматика и Научный Подход",
    m4_desc: "Снижаем частоту болезней через регуляцию НС. Родители спокойны, ребёнок усваивает паттерны эмоциональной саморегуляции.",
    tag_modes: "Терапевтический инструментарий",
    title_modes: "4 Специализированных Аудиорежима",
    sub_modes: "Выберите подходящую гипносказку или нейро-медитацию для коррекции поведения и быстрой разгрузки нервной системы ребенка.",
    mode_bedtime_sub: "Мягкий переход в глубокий сон через визуализации",
    mode_morning_sub: "Настройка на успехи в школе и детском саду",
    mode_tantrums_sub: "Экстренная нейрорегуляция за 5 минут",
    mode_psychosomatic_sub: "Снятие зажимов и глубокое физическое расслабление",
    btn_select_mode: "Выбрать этот режим →",
    tag_generator: "Интерактивная Лаборатория",
    title_generator: "Сгенерировать медитацию для ребенка",
    sub_generator: "Укажите имя ребенка, выберите режим и голос родителя для мгновенного создания авторской терапии.",
    label_child_name: "Имя ребенка:",
    placeholder_child_name: "Например: София, Александр, Даниил",
    label_audio_source: "Источник и Модель Аудио:",
    opt_source_parent: "✨ Клонированный голос родителя (ElevenLabs AI)",
    opt_source_mp3: "🎵 Студийная MP3 фонограмма",
    opt_source_tts: "🤖 Динамический ИИ-диктор (Низкий тембр)",
    label_voice_timbre: "Тембр и Голос озвучки:",
    opt_male_deep: "🎤 Спокойный голос родителя с приятным тембром",
    label_meditation_mode: "Режим рассказа-медитации:",
    opt_mode_bedtime: "🌙 Перед сном (Засыпание)",
    opt_mode_morning: "☀️ Утренняя (Уверенность)",
    opt_mode_tantrums: "🛑 Экс-Помощь при истерике",
    opt_mode_psychosomatic: "🌿 Психосоматика (Здоровье)",
    btn_generate: "✨ Создать рассказ-медитацию с голосом мамы или папы",
    player_title_default: "Рассказ-Медитация",
    player_sub_default: "Медленный спокойный голос родителя • Без музыки",
    player_placeholder: 'Укажите имя и нажмите "Сгенерировать"...',
    tag_pricing: "Прозрачная монетизация",
    title_pricing: "Выберите Тариф Подписки",
    sub_pricing: "Freemium модель + гибкая подписка + разовые докупки минут. Никаких скрытых списаний.",
    billing_monthly: "Ежемесячно",
    billing_annual: "Оплата за год",
    plan_title_free: "Бесплатный",
    plan_free_sub: "Ощутить ценность сервиса",
    plan_forever: "/ навсегда",
    pf_free_1: "✅ 2 AI-запроса в день",
    pf_free_2: "✅ Стандартный рассказ-медитация",
    pf_free_3: "✅ Медленный спокойный голос родителя",
    pf_free_4: "❌ Нет сохранения истории",
    btn_plan_free: "Начать бесплатно",
    plan_basic_sub: "Для ежедневных подстроек",
    plan_per_month: "/ месяц",
    pf_basic_1: "✅ 50 минут генераций в месяц",
    pf_basic_2: "✅ Персонализация под имя ребенка",
    pf_basic_3: "✅ Поддержка 3 языков (RU, EN, HE)",
    pf_basic_4: "✅ Сохранение истории голосов и рассказов",
    btn_plan_basic: "Выбрать Базовый",
    popular_badge: "🔥 Популярный выбор",
    plan_premium_sub: "Полный покой и гармония семьи",
    pf_prem_1: "✅ 120 минут генераций (~12 медитаций)",
    pf_prem_2: "✅ Экстренная помощь при истерике",
    pf_prem_3: "✅ Семейный доступ до 4 устройств",
    pf_prem_4: "✅ Приоритетная поддержка",
    btn_plan_premium: "Активировать Премиум",
    plan_plat_sub: "Максимальный ресурс и поддержка",
    pf_plat_1: "✅ 300 минут генерации аудио",
    pf_plat_2: "✅ Неограниченная библиотека медитаций",
    pf_plat_3: "✅ Персональный Агент-Супервизор",
    pf_plat_4: "✅ Семейный доступ до 8 устройств",
    btn_plan_platinum: "Выбрать Платиновый",
    topup_tag: "⚡ Дополнительные минуты:",
    topup_title: "Пакет «Еще 50 минут медитаций»",
    topup_desc: "Закончился лимит подписки? Докупите 50 минут без смены тарифного плана.",
    btn_topup: "Докупить за $4.99",
    footer_brand_desc: "Глобальная инклюзивная экосистема для защиты ментального здоровья семей. ИИ, детская нейропсихология и КПТ.",
    copyright_text: "© 2026 MindEcho AI Inc. Все права защищены.",
    footer_nav_title: "Навигация",
    footer_legal_title: "Конфиденциальность",
    legal_terms: "Условия использования",
    legal_privacy: "Политика безопасности",
    legal_privacy_guarantee: "Privacy-First Гарантия",
    modal_auth_title: "Вход в MindEcho AI",
    modal_auth_sub: "Сохраните настройки медитаций и статистику",
    btn_auth_google: "Вход через аккаунт Google",
    btn_auth_apple: "Вход через Apple ID",
    divider_or: "или по Email и Телефону",
    label_auth_name: "Ваше Имя и Фамилия:",
    label_auth_email: "Ваш Email:",
    label_auth_phone: "WhatsApp / Telegram (Обязательно):",
    label_custdev_phone: "WhatsApp / Telegram (Обязательно для получения подарка):",
    label_auth_address: "Город / Страна проживания:",
    label_nda_email: "Ваш E-mail адрес:",
    label_terms_agree: "Я согласен с Условиями использования и политикой конфиденциальности.",
    btn_auth_submit: "Войти / Зарегистрироваться",
    checkout_title: "Оформление подписки",
    checkout_amount: "Сумма к оплате:",
    label_card_name: "Имя на карте:",
    label_card_num: "Номер банковской карты:",
    label_card_exp: "Срок (ММ/ГГ):",
    label_card_cvc: "CVC / CVV:",
    btn_pay_submit: "Оплатить и запустить доступ",
    nda_title: "📜 Пользовательское соглашение (Terms of Service)",
    nda_sub: "ОТКАЗ ОТ ОТВЕТСТВЕННОСТИ И ОГРАНИЧЕНИЕ ПРЕТЕНЗИЙ (DISCLAIMER)",
    label_nda_name: "Ваше ФИО Подписанта:",
    label_signature_canvas: "✍️ Поставьте подпись мышкой или пальцем ниже:",
    btn_clear_sig: "Очистить",
    btn_submit_nda: "✅ Принять и подписать NDA (Перейти к документу)",
    custdev_modal_title: "💬 Опрос CustDev: Помогите сделать продукт лучше",
    custdev_modal_sub: "Выберите интересующий вас сценарий и ответьте на 3 коротких вопроса:",
    btn_submit_custdev: "🚀 Отправить ответы и получить VIP-доступ",
    sticky_text: "Инвестируйте в гармонию семьи от $7/мес",
    btn_choose_plan: "Выбрать тариф"
  },
  en: {
    nav_mission: "Mission",
    nav_modes: "Audio Modes",
    nav_generator: "Studio",
    nav_pricing: "Pricing",
    nav_nda: "DISCLAIMER",
    nav_custdev: "CustDev Survey",
    btn_login: "Log In",
    btn_games: "🎮 Speech & Emotional Intelligence Games",
    btn_prayer: "🙏 Prayer-Meditation Creation",
    hero_badge: "AI + Child Neuropsychology + CBT/ACT + Psychosomatics",
    hero_title: "Transforming parenting routine into <span class='text-gradient'>gentle therapy</span>",
    hero_subtitle: "We build a global tech ecosystem for family mental health. A legal way to save parents' emotional resources and raise happy children.",
    btn_try_free: "✨ Try It! Narrative Meditation with Parent's Voice",
    btn_try_free_sub: "gently heals daytime stress and fears during sleep transition or boosts morning confidence",
    btn_support_project: "[ Support Project / Get Link ]",
    trust_privacy: "🛡 Privacy-First (Bank-grade Encryption)",
    trust_supervisor: "🧠 Validated by Supervisor AI Agent",
    trust_global: "🌏 Global Inclusivity",
    hero_card_sub: "Very Slow Deep Male Voice • Pure Speech Without Music",
    hero_sample_quote: '"Close your eyes and pay attention to your nose... Feel calm and peaceful joy inside..."',
    hero_card_footer: "✨ Personalized Narrative Meditation",
    tag_supermission: "MindEcho AI Super-Mission",
    title_supermission: "4 Pillars of Public Impact",
    sub_supermission: "Creating a scientifically validated and secure ecosystem for family mental health worldwide.",
    m1_title: "1. Global Inclusivity",
    m1_desc: "Erasing social inequality. Platform remains accessible even for low-income families — every child deserves healthy mental growth.",
    m2_title: "2. Family Harmony Without Fights",
    m2_desc: "Progressive audio modes eliminate tantrums and resentment, gently boosting emotional intelligence (EQ).",
    m3_title: "3. Saving Parents' Energy",
    m3_desc: "Protecting parents from burnout, guaranteeing 1–2 hours of personal daily time.",
    m3_tag: "Freeing up 1-2 hours of personal time",
    m4_title: "4. Preventing Child Trauma",
    m4_desc: "Gently healing daytime stress and fears right during sleep transition, programming confidence.",
    m4_tag: "Scientifically proven psychotherapeutic protocols",
    tag_modes: "Quick Launch",
    title_modes: "3 Core Audio Therapy Modes",
    sub_modes: "Select a scenario for instant personalized narrative meditation or emergency relief",
    mode_morning_title: "Morning Meditation",
    mode_morning_desc: "Boost of energy, self-belief, learning ease, and joy for the new day.",
    btn_start_morning: "Start Morning Vibe",
    mode_bedtime_title: "Bedtime Meditation",
    mode_bedtime_desc: "Gentle sleep transition, dissolving daytime fears, and cultivating deep peace.",
    btn_start_bedtime: "Start Sleep Therapy",
    mode_emergency_title: "Emergency Tantrum Relief",
    mode_emergency_desc: "Instant 4-step algorithm for parents + express audio for child grounding.",
    btn_start_emergency: "🚨 Activate Emergency Relief",
    em_header: "🚨 Emergency Protocol: Tantrum Relief",
    em_step1_title: "Your Composure",
    em_step1_desc: "Take a deep breath. You are the calm safety anchor for your child.",
    em_step2_title: "Safety First",
    em_step2_desc: "Remove sharp objects, lower your voice tone, crouch to child's eye level.",
    em_step3_title: "Legalization",
    em_step3_desc: 'Quietly say: "I see that you are upset and angry. I am right here with you."',
    em_step4_title: "Grounding",
    em_step4_desc: "Play soothing AI audio and let the child feel rhythm of breathing.",
    em_input_label: "Describe the situation (what happened?):",
    btn_gen_emergency: "✨ Generate Express Audio",
    tag_studio: "Meditation Studio",
    title_studio: "Personal Narrative Meditation",
    sub_studio: "Parent Voice Recording + Studio MP3 + Dynamic AI Speech",
    label_mic_rec: "🎙 Record Your Voice / Questions:",
    mic_press_text: "Click microphone to record voice",
    label_child_name: "Child's Name:",
    label_child_gender: "Gender:",
    opt_girl: "Girl",
    opt_boy: "Boy",
    label_child_age: "Age (years):",
    label_audio_source: "Audio Source:",
    opt_source_mp3: "🎵 Studio MP3 Track",
    opt_source_tts: "🤖 Dynamic AI Voice (Deep Tone)",
    label_voice_timbre: "Voice Timbre:",
    opt_male_deep: "🎙 Male — Very slow, calm deep voice",
    label_meditation_mode: "Meditation Mode:",
    opt_mode_bedtime: "🌙 Bedtime (Sleep)",
    opt_mode_morning: "☀️ Morning (Confidence)",
    opt_mode_emergency: "🚨 Emergency (Grounding)",
    btn_generate: "✨ Create Narrative Meditation with Parent's Voice",
    player_title_default: "Narrative Meditation",
    player_sub_default: "Very Slow Deep Male Voice • Pure Speech",
    player_placeholder: 'Enter name and click "Generate"...',
    tag_pricing: "Transparent Pricing",
    title_pricing: "Select Subscription Plan",
    sub_pricing: "Freemium access + Generation credits + Top-up minutes",
    billing_monthly: "Monthly",
    billing_annual: "Annual Payment -67% Discount",
    plan_title_free: "Free (Basic)",
    plan_title_basic: "Basic",
    plan_title_premium: "Premium",
    plan_title_platinum: "Platinum",
    plan_free_sub: "Feel the service value",
    plan_forever: "/ forever",
    pf_free_1: "✅ 2 AI requests per day",
    pf_free_2: "✅ Standard narrative meditation",
    pf_free_3: "✅ Slow male voice narration",
    pf_free_4: "❌ No history saving",
    btn_plan_free: "Start Free",
    plan_basic_sub: "For daily tune-ups",
    plan_per_month: "/ month",
    pf_basic_1: "✅ 50 minutes generations / month",
    pf_basic_2: "✅ Personalization with child name",
    pf_basic_3: "✅ 3 Languages support (RU, EN, HE)",
    pf_basic_4: "✅ Google Sheets logging",
    btn_plan_basic: "Choose Basic",
    popular_badge: "🔥 Popular Choice",
    plan_premium_sub: "Full peace and family harmony",
    pf_prem_1: "✅ 120 minutes generations (~12 meditations)",
    pf_prem_2: "✅ Emergency tantrum relief",
    pf_prem_3: "✅ Family access up to 4 devices",
    pf_prem_4: "✅ Priority support",
    btn_plan_premium: "Activate Premium",
    plan_plat_sub: "Maximum resource and support",
    pf_plat_1: "✅ 300 minutes audio generation",
    pf_plat_2: "✅ Unlimited meditation library",
    pf_plat_3: "✅ Personal Supervisor AI Agent",
    pf_plat_4: "✅ Family access up to 8 devices",
    btn_plan_platinum: "Choose Platinum",
    topup_tag: "⚡ Extra Minutes:",
    topup_title: "Pack 'Extra 50 Minutes Meditations'",
    topup_desc: "Out of subscription credits? Top up 50 minutes without plan change.",
    btn_topup: "Top up for $4.99",
    footer_brand_desc: "Global inclusive ecosystem for family mental health protection. AI, child neuropsychology and CBT.",
    copyright_text: "© 2026 MindEcho AI Inc. All rights reserved.",
    footer_nav_title: "Navigation",
    footer_legal_title: "Privacy & Legal",
    legal_terms: "Terms of Use",
    legal_privacy: "Security Policy",
    legal_privacy_guarantee: "Privacy-First Guarantee",
    modal_auth_title: "Sign in to MindEcho AI",
    modal_auth_sub: "Save your meditation settings and analytics",
    btn_auth_google: "Sign in with Google Account",
    btn_auth_apple: "Sign in with Apple ID",
    divider_or: "or via Email and Phone",
    label_auth_name: "Full Name:",
    label_auth_email: "Email Address:",
    label_auth_phone: "WhatsApp / Telegram (Required):",
    label_custdev_phone: "WhatsApp / Telegram (Required for gift):",
    label_auth_address: "City / Residence Address:",
    label_nda_email: "Your E-mail Address:",
    label_terms_agree: "I agree with Terms of Use and Privacy Policy.",
    btn_auth_submit: "Sign In / Register",
    checkout_title: "Subscription Checkout",
    checkout_amount: "Total Amount:",
    label_card_name: "Name on Card:",
    label_card_num: "Card Number:",
    label_card_exp: "Expiry (MM/YY):",
    label_card_cvc: "CVC / CVV:",
    btn_pay_submit: "Pay & Activate Access",
    nda_title: "📜 Terms of Service",
    nda_sub: "DISCLAIMER AND LIMITATION OF CLAIMS",
    label_nda_name: "Signer Full Name:",
    label_signature_canvas: "✍️ Sign with mouse or finger below:",
    btn_clear_sig: "Clear",
    btn_submit_nda: "✅ Accept & Sign NDA (Proceed to Document)",
    custdev_modal_title: "💬 CustDev Survey: Help Us Improve MindEcho AI",
    custdev_modal_sub: "Select your preferred scenario and answer 3 quick questions:",
    btn_submit_custdev: "🚀 Submit Answers & Get VIP Access",
    sticky_text: "Invest in family harmony from $7/mo",
    btn_choose_plan: "Choose Plan"
  },
  he: {
    nav_mission: "משימה",
    nav_modes: "מצבי שמע",
    nav_generator: "סטודיו",
    nav_pricing: "תעריפים",
    nav_nda: "DISCLAIMER",
    nav_custdev: "סקר CustDev",
    btn_login: "התחבר",
    btn_games: "🎮 משחקי שפה ואינטליגנציה רגשית",
    btn_prayer: "🙏 יצירת תפילה-מדיטציה",
    hero_badge: "בינה מלאכותית + נוירופסיכולוגיה + CBT/ACT",
    hero_title: "הופכים את שגרת ההורות ל<span class='text-gradient'>תרפיה עדינה</span>",
    hero_subtitle: "פתרון טכנולוגי גלובלי לבריאות הנפש של המשפחה. לשמור על המשאבים הרגשיים של ההורים ולגדל ילדים מאושרים.",
    btn_try_free: "✨ נסו! סיפור-מדיטציה בקול של אמא או אבא",
    btn_try_free_sub: "מרפא בעדינות מתחים ופחדים של היום בזמן ההרדמה או מעניק ביטחון לבוקר",
    btn_support_project: "[ תמוך בפרויקט / קבל קישור ]",
    trust_privacy: "🛡 Privacy-First (הצפנה בנקאית)",
    trust_supervisor: "🧠 מאומת ע\"י סוכן AI מפקח",
    trust_global: "🌏 הכלה גלובלית",
    hero_card_sub: "קול גברי נמוך ואיטי מאוד • ללא מוזיקה",
    hero_sample_quote: '"עצמי עיניים והתמקדי באף שלך... חושי שלווה ושמחה שקטה בפנים..."',
    hero_card_footer: "✨ סיפור-מדיטציה מותאם אישית",
    tag_supermission: "סופר-משימה של MindEcho AI",
    title_supermission: "4 עמודי התווך של הפרויקט",
    sub_supermission: "מערכת אקולוגית בטוחה ומוכחת מדעית לבריאות הנפש של משפחות ברחבי העולם.",
    m1_title: "1. הכלה גלובלית",
    m1_desc: "מחיקת אי-שוויון חברתי. הפלטפורמה נגישה לכל המשפחות — לכל ילד מגיעה צמיחה נפשית בריאה.",
    m2_title: "2. הרמוניה בבית ללא מריבות",
    m2_desc: "מצבי שמע מתקדמים מונעים התקפי זעם ומעלים בעדינות את האינטליגנציה הרגשית (EQ).",
    m3_title: "3. חיסכון באנרגיה של ההורים",
    m3_desc: "הגנה על ההורים מפני שחיקה, עם הבטחה ל-1–2 שעות זמן אישי ביום.",
    m3_tag: "1-2 שעות של זמן אישי",
    m4_title: "4. מניעת טראומות ילדות",
    m4_desc: "ריפוי עדין של פחדים ומתחים ישירות בתהליך ההרדמה, תוך תכנות ביטחון עצמי.",
    m4_tag: "פרוטוקולים פסיכותרפיים מוכחים מדעית",
    tag_modes: "הפעלה מהירה",
    title_modes: "3 מצבי טיפול בשמע",
    sub_modes: "בחר תרחיש ליצירה מיידית של מדיטציה או עזרה דחופה",
    mode_morning_title: "מדיטציית בוקר",
    mode_morning_desc: "חיזוק הביטחון, הקלה בלימודים ושמחה ליום החדש.",
    btn_start_morning: "התחל מדיטציית בוקר",
    mode_bedtime_title: "מדיטציה לפני השינה",
    mode_bedtime_desc: "מעבר עדין לשינה, הפגת פחדים וטיפוח שלווה עמוקה.",
    btn_start_bedtime: "התחל תרפיית שינה",
    mode_emergency_title: "עזרה דחופה בזמן התקף זעם",
    mode_emergency_desc: "אלגוריתם מיידי של 4 שלבים להורה + שמע מהיר לקרקוע הילד.",
    btn_start_emergency: "🚨 הפעל עזרה דחופה",
    em_header: "🚨 פרוטוקול חירום: עזרה בזמן התקף זעם",
    em_step1_title: "האיפוק שלך",
    em_step1_desc: "קח נשימה עמוקה. אתה עוגן הבטיחות השקט של הילד.",
    em_step2_title: "בטיחות תחילה",
    em_step2_desc: "הרחק חפצים חדים, הנמך את קולך והתכופף לגובה העיניים של הילד.",
    em_step3_title: "לגיטימציה",
    em_step3_desc: 'אמור בשקט: "אני רואה שקשה לך ואתה כועס. אני כאן איתך."',
    em_step4_title: "קרקוע",
    em_step4_desc: "הפעל שמע מרגיע של בינה מלאכותית ותן לילד להרגיש את קצב הנשימה.",
    em_input_label: "תאר את הסיטואציה (מה קרה?):",
    btn_gen_emergency: "✨ צור שמע מהיר",
    tag_studio: "סטודיו מדיטציה",
    title_studio: "סיפור-מדיטציה אישי",
    sub_studio: "הקלטת קול הורה + הקלטת אולפן MP3 + דיבור AI דינמי",
    label_mic_rec: "🎙 הקלטת הקול שלך / שאלות:",
    mic_press_text: "לחץ על המיקרופון להקלטה",
    label_child_name: "שם הילד/ה:",
    label_child_gender: "מין הילד/ה:",
    opt_girl: "ילדה",
    opt_boy: "ילד",
    label_child_age: "גיל (בשנים):",
    label_audio_source: "מקור השמע:",
    opt_source_mp3: "🎵 הקלטת אולפן MP3",
    opt_source_tts: "🤖 קריין AI דינמי (קול נמוך)",
    label_voice_timbre: "גון הקול:",
    opt_male_deep: "🎙 גברי — קול נמוך ואיטי מאוד",
    label_meditation_mode: "מצב מדיטציה:",
    opt_mode_bedtime: "🌙 לפני השינה",
    opt_mode_morning: "☀️ בוקר (ביטחון)",
    opt_mode_emergency: "🚨 חירום (קרקוע)",
    btn_generate: "✨ צור סיפור-מדיטציה בקול של אמא או אבא",
    player_title_default: "סיפור-מדיטציה",
    player_sub_default: "קול גברי נמוך ואיטי מאוד • ללא מוזיקה",
    player_placeholder: 'הכנס שם ולחץ "צור"...',
    tag_pricing: "תמחור שקוף",
    title_pricing: "בחר תוכנית מנוי",
    sub_pricing: "גישת Freemium + קרדיטים ליצירה",
    billing_monthly: "חודשי",
    billing_annual: "תשלום שנתי -67% הנחה",
    plan_title_free: "חינם (בסיסי)",
    plan_title_basic: "בסיסי",
    plan_title_premium: "פרימיום",
    plan_title_platinum: "פלטינום",
    plan_free_sub: "להרגיש את ערך השירות",
    plan_forever: "/ לתמיד",
    pf_free_1: "✅ 2 בקשות AI ביום",
    pf_free_2: "✅ סיפור-מדיטציה סטנדרטי",
    pf_free_3: "✅ הקראה בקול גברי איטי",
    pf_free_4: "❌ ללא שמירת היסטוריה",
    btn_plan_free: "התחל בחינם",
    plan_basic_sub: "להתאמות יומיומיות",
    plan_per_month: "/ חודש",
    pf_basic_1: "✅ 50 דקות יצירה בחודש",
    pf_basic_2: "✅ התאמה אישית לשם הילד",
    pf_basic_3: "✅ תמיכה ב-3 שפות (RU, EN, HE)",
    pf_basic_4: "✅ תיעוד ב-Google Sheets",
    btn_plan_basic: "בחר בסיסי",
    popular_badge: "🔥 בחירה פופולרית",
    plan_premium_sub: "שלווה מלאה והרמוניה משפחתית",
    pf_prem_1: "✅ 120 דקות יצירה (~12 מדיטציות)",
    pf_prem_2: "✅ עזרה דחופה בזמן התקף זעם",
    pf_prem_3: "✅ גישה משפחתית לעד 4 מכשירים",
    pf_prem_4: "✅ תמיכה בעדיפות",
    btn_plan_premium: "הפעל פרימיום",
    plan_plat_sub: "משאבים ותמיכה מקסימליים",
    pf_plat_1: "✅ 300 דקות יצירת שמע",
    pf_plat_2: "✅ ספרית מדיטציות ללא הגבלה",
    pf_plat_3: "✅ סוכן AI מפקח אישי",
    pf_plat_4: "✅ גישה משפחתית לעד 8 מכשירים",
    btn_plan_platinum: "בחר פלטינום",
    topup_tag: "⚡ דקות נוספות:",
    topup_title: "חבילת 'עוד 50 דקות מדיטציה'",
    topup_desc: "נגמרו הקרדיטים במנוי? הוסף 50 דקות ללא שינוי תוכנית.",
    btn_topup: "רכוש ב-$4.99",
    footer_brand_desc: "מערכת אקולוגית מכילה לבריאות הנפש של המשפחה. AI, נוירופסיכולוגיה ו-CBT.",
    copyright_text: "© 2026 MindEcho AI Inc. כל הזכויות שמורות.",
    footer_nav_title: "ניווט",
    footer_legal_title: "פרטיות ותנאים",
    legal_terms: "תנאי שימוש",
    legal_privacy: "מדיניות אבטחה",
    legal_privacy_guarantee: "אחריות Privacy-First",
    modal_auth_title: "התחברות ל-MindEcho AI",
    modal_auth_sub: "שמור הגדרות מדיטציה וסטטיסטיקה",
    btn_auth_google: "התחבר עם חשבון Google",
    btn_auth_apple: "התחבר עם Apple ID",
    divider_or: "או באמצעות אימייל וטלפון",
    label_auth_name: "שם מלא:",
    label_auth_email: "כתובת אימייל:",
    label_auth_phone: "WhatsApp / Telegram (חובה):",
    label_custdev_phone: "WhatsApp / Telegram (חובה לקבלת המתנה):",
    label_auth_address: "עיר / מדינת מגורים:",
    label_nda_email: "כתובת אימייל:",
    label_terms_agree: "אני מסכים לתנאי השימוש ומדיניות הפרטיות.",
    btn_auth_submit: "התחבר / הרשם",
    checkout_title: "הרשמה למנוי",
    checkout_amount: "סכום לתשלום:",
    label_card_name: "שם על הכרטיס:",
    label_card_num: "מספר כרטיס אשראי:",
    label_card_exp: "תוקף (MM/YY):",
    label_card_cvc: "CVC / CVV:",
    btn_pay_submit: "שלם והפעל גישה",
    nda_title: "📜 תנאי שירות (Terms of Service)",
    nda_sub: "כתב ויתור והגבלת תביעות (DISCLAIMER)",
    label_nda_name: "שם החותם המלא:",
    label_signature_canvas: "✍️ חתום עם העכבר או האצבע למטה:",
    btn_clear_sig: "נקה",
    btn_submit_nda: "✅ אפשר וחתום NDA (עבור למסמך)",
    custdev_modal_title: "💬 סקר CustDev: עזור לנו לשפר את המוצר",
    custdev_modal_sub: "בחר תרחיש וענה על 3 שאלות קצרות:",
    btn_submit_custdev: "🚀 שלח תשובות וקבל גישת VIP",
    sticky_text: "השקע בהרמוניה משפחתית החל מ-$7 לחודש",
    btn_choose_plan: "בחר תוכנית"
  }
};

// Russian Meditation Template Text
const BASE_MEDITATION_TEMPLATE_RU = `
{NAME}, я хочу взять тебя с собой в небольшое путешествие в волшебное место, где мысли становятся реальностью... И чтобы мы смогли туда попасть, нам нужно будет раскрыть свою душу. Так что слушай меня внимательно и давай отправимся в это весёлое путешествие.

Закрой глаза и начни дышать спокойно и ровно. Успокойся и расслабься, расслабься... Обрати внимание на свой нос. Найди его, не открывая глаз. Почувствуй его мысленно. Дыши спокойно и ровно, сосредоточься на ощущении воздуха у ноздрей.

А теперь обрати внимание на свои уши. Найди их, мысленно их ощути. Побудь с ними. Почувствуй их тепло и мысленно представь их форму.

А теперь обрати внимание на пространство между своими ушами внутри своей головы, вот на это пространство. Почувствуй его, понаблюдай за ним. 

А теперь обрати внимание на пространство вокруг своих ушей и за их пределами. Понаблюдай за ним. И обрати внимание на пространство вокруг всей своей головы, вот на это пространство. Ощути его мыслями, понаблюдай за ним, мысленно побудь в нем. Чувствуй, как твое внимание расширяется, словно невидимое облако вокруг головы.

А сейчас обрати внимание на пространство между своими ушами и стенами комнаты, где ты сейчас находишься, вот на это пространство. Ощути его, мысленно побудь в нем. Открой свой разум тому, насколько оно велико — оно повсюду вокруг тебя. Думай о том, как много свободного места в комнате, дыши легко и свободно.

А теперь давай отправимся в дружелюбное местечко. Представь, что у тебя в голове есть такое место, где тебе хорошо. Найди его и побудь там. Представь самое красивое и безопасное место, которое ты можешь вообразить, где мама и папа всегда рядом с тобой и помогают тебе.

Потому что это тот мир, который ты построил{GENDER_END} сам{GENDER_END} и в котором всё, во что ты веришь — это правда. Это тот самый мир, где всё действительно сбывается, где мысли становятся реальными и где всё, во что ты веришь, может случится. Думай о том, что в этом месте ты — настоящ{GENDER_ADJ} волшебни{GENDER_WIZARD} и всё подвластно твоей воле.

Поверь в то, что ты умн{GENDER_ADJ}, и что ты очень быстро и легко учишься. Поверь в это, и всё сбудется. Почувствуй уверенность в своих силах, думай о том, как легко тебе даются любые новые знания.

Поверь в то, что тебя очень сильно любят, и почувствуй это всем своим сердцем, и пусть душа наполнится счастьем. Представь теплое сияние в груди, вдыхай это чувство любви каждой клеточкой. Знай, что мама и папа тебя очень любят, мама и папа рады, что ты у них есть.

Поверь в то, что тебя любят и почувствуй это всем своим сердцем, и пусть душа наполнится счастьем. Это место, где у тебя верные друзья и отличные родственники.

Поверь в своих друзей и родственников и будь сам{GENDER_END} верн{GENDER_ADJ} друг{GENDER_FRIEND}. Обращайся с людьми так, как ты хочешь, чтобы обращались с тобой, и они станут твоими друзьями. Почувствуй это и будь добр{GENDER_END} к ним. Думай о своих близких с нежностью и добротой.

Поверь в то, что ты всегда можешь быть здоров{GENDER_ADJ}, и какое сильное у тебя тело. Ощути это и будь там здоров{GENDER_ADJ}. Почувствуй прилив энергии и силы в теле, дыши глубоко и уверенно.

Поверь в то, что ты счастливый человек, и ты будешь счастлива в жизни. Будь же счастлива в этом месте и верь в это. Улыбнись мысленно, почувствуй, как внутри тебя рождается тихая радость.

Поверь в то, что ты можешь слушать и всё понимать и хорошо выполнять то, о чем тебя просят. Ощути, что ты это можешь, и так всё и будет. Думай о своей способности быть внимательн{GENDER_ADJ} и заботливой.

Поверь, что все неприятности, которые тебя беспокоят, могут исчезнуть. Пусть беды растают, как снег под жаркими лучами солнца. Поверь, так и будет. На длинном выдохе представляй, как все твои страхи и тревоги просто испаряются.

Поверь в саму себя. Поверь, что ты можешь усердно трудиться и наслаждайся, когда приходится усердно трудиться, и ты насладишься, когда получишь, что хотела. Просто поверь, что ты способна ради чего-то постараться, и когда ты постараешься — ты это получишь. Думай о том, как приятно достигать целей своим трудом и старанием и как радостно помогать людям вокруг.

Поверь в себя, и ты станешь таким человеком, кем захочешь. Поверь же, что можешь быть кем захочешь, и ты станешь таким человеком. Подумай об этом. Представь себя в будущем, как выглядишь, как ты счастлива.

Будь уверена — это место, где мечты становятся реальностью. Поверь, что еда, которая тебе полезна, становится очень вкусной, и она будет очень вкусной. Почувствуй вкус и пользу здоровой пищи.

Поверь, что ты неповторима и талантлива, и у тебя есть множество отличных идей, и у тебя хватит смелости, чтобы их воплотить. Ты станешь волшебницей, полной отличных идей. Ощути свою уникальность, думай о своих способностях как о сокровищах. Вспомни, что мама и папа очень рады, что ты у них есть.

Стань же мысленно таким человеком просто ради веселья и от всей души полюби человека, который предстал — это же ты. Какой ты хочешь стать? Счастливой, здоровой, влюбленной в жизнь, свободной. Почувствуй огромную нежность и любовь к самой себе, дыши полной грудью. 

Ты всегда под защитой невидимой силы. Она всегда любит тебя и наблюдает за тобой. Она живет внутри тебя, помогает твоему сердцу биться, дает тебе жизнь и создает в этой жизни новые пути. Поверь в эту невидимую силу, ведь она верит в тебя. Приложи руку к сердцу, почувствуй его ритм, думай о том, что ты никогда не бываешь одна. 

Ты и есть волшебство своей жизни. Верь в волшебство, верь в реальность вещей и верь в возможности. Если ты веришь в возможности — ты веришь в себя. Доверяй же себе в этом мире. Почувствуй свою внутреннюю силу, думай про себя так: «Я всё могу».

Верь, что ты важна, что ты любима, что ты особенная, ты можешь изменить весь наш мир и в тебе есть величие. Поверь в то, что ты способна сделать что угодно. Ощути свою значимость, представь, как ты приносишь добро в этот мир.

Полюби же себя прямо сейчас, полюби свою жизнь прямо сейчас, полюби людей в своей жизни прямо сейчас и прости тех, кого ты не любишь, чтобы освободить больше места для любви. Мысленно отпусти все старые обиды, почувствуй, как на сердце становится легко и чисто.

Знай, что мама и папа тебя очень любят.

Теперь давай научим твое тело новым, чудесным чувствам. Что такое храбрость? Почувствуй прямо сейчас, каково это — быть совершенно бесстрашной. 
Что такое свобода? Почувствуй, каково это — быть абсолютно свободной и счастливой. 
Что такое изобилие? Почувствуй, что у тебя уже есть всё, что тебе нужно для счастья.
Что такое вдохновение? Представь, что у тебя появилась отличная идея и ты точно знаешь, как её исполнить.
Что такое жизненная сила? Почувствуй, что в тебе живет неограниченная энергия.Что такое страсть? Почувствуй, как сильно ты влюблена в свою жизнь.

Положи левую руку на сердце и благослови свое тело на новый, светлый разум. Благослови свою жизнь, которая полна приключений, и свою душу, которая всегда подсказывает тебе верный путь.

Открой свое сердце и вырази благодарность за свою новую, чудесную жизнь ещё до того, как она случилась. Благодарность — это знак того, что всё прекрасное уже произошло в твоем мире.

Что бы ни случилось, мама и папа будут тебя любить так же сильно.

Пришло время покинуть это место, но запомни: когда ты веришь, всё, что происходит в этом мире, происходит и в твоей жизни. Сохрани это состояние уверенности и внутреннего покоя.

Хорошенько потянись и вспомни, что пора возвращаться к той жизни, которой ты живешь, еще более бодрой и внимательной. Знай: сегодня с тобой могут произойти замечательные вещи. Сделай глубокий вдох, потянись всем телом, чувствуя прилив бодрости и сил.

Открой глаза и улыбнись жизни, и тогда она улыбнется тебе в ответ. Открывай глаза с широкой улыбкой, чувствуя готовность к прекрасному и счастливому дню.
`;

// Hebrew Meditation Template Text
const BASE_MEDITATION_TEMPLATE_HE = `
{NAME}, אני רוצה לקחת אותך איתי למסע קטן למקום קסום שבו מחשבות הופכות למציאות, וכדי שנוכל להגיע לשם נצטרך לפתוח את הנשמה שלנו. אז הקשיבי לי בזהירות ובואי נצא למסע המהנה הזה.

עצמי את העיניים והתחילי לנשום ברוגע ובקצב אחיד. תירגעי ותתרפי... שימי לב לאף שלך. מצאי אותו מבלי לפתוח את העיניים. חושי אותו במחשבה. נשמי ברוגע ובקצב אחיד, התמקדי בתחושת האוויר בנחיריים.

ועכשיו שימי לב לאוזניים שלך. מצאי אותן, חושי אותן במחשבה. הייה איתן רגע. חושי את החום שלהן ודמייני את הצורה שלהן.

ועכשיו שימי לב למרחב שבין האוזניים שלך בתוך הראש שלך, ממש למרחב הזה. חושי אותו, התבונני בו.

ועכשיו שימי לב למרחב שסביב האוזניים שלך ומעבר להן. התבונני בו. ושימי לב למרחב שסביב כל הראש שלך, ממש למרחב הזה. חושי אותו במחשבות, התבונני בו, הייה בו במחשבה. חושי איך תשומת הלב שלך מתרחבת, כמו ענן בלתי נראה סביב הראש.

ועכשיו שימי לב למרחב שבין האוזניים שלך לבין קירות החדר שבו את נמצאת עכשיו. חושי אותו, הייה בו במחשבה. פתחי את התודעה שלך לכמה שהוא גדול — הוא נמצא בכל מקום סביבך. חשבי על כמה מקום חופשי יש בחדר, נשמי בקלות ובחופשיות.

ועכשיו בואי נצא למקום ידידותי. דמייני שיש לך בראש מקום כזה שנעים לך בו. מצאי אותו והייה שם. דמייני את המקום הכי יפה ובטוח שאת יכולה לדמיין, שבו אמא ואבא תמיד לידך ועוזרים לך.

כי זה העולם שבנית בעצמך ושבו כל מה שאת מאמינה בו — זו האמת. זה אותו עולם שבו הכל באמת מתגשם, שבו מחשבות הופכות למציאות ושבו כל מה שאת מאמינה בו יכול לקרות. חשבי על כך שבמקום הזה את קוסמת אמיתית והכל כפוף לרצונך.

האמיני בכך שאת חכמה, ושאת לומדת מאוד מהר ובקלות. האמיני בכך, והכל יתגשם. חושי ביטחון בכוחות שלך, חשבי על כמה קל לך לרכוש כל ידע חדש.

האמיני בכך שאוהבים אותך מאוד מאוד, וחושי זאת בכל ליבך, ותני לנשמה להתמלא באושר. דמייני זוהר חם בחזה, שאפי את תחושת האהבה הזו בכל תא בגוף. דעי שאמא ואבא אוהבים אותך מאוד, אמא ואבא שמחים שאת אצלם.

האמיני בכך שאוהבים אותך וחושי זאת בכל ליבך ותני לנשמה להתמלא באושר, זה מקום שבו יש לך חברים נאמנים וקרובים נפלאים.

האמיני בחברים ובקרובים שלך והיי בעצמך חברה נאמנה. התייחסי לאנשים כפי שאת רוצה שיתייחסו אלייך, והם יהפכו לחברים שלך. חושי זאת והיי טובה אליהם. חשבי על הקרובים שלך ברוך ובטוב לב.

האמיני בכך שאת תמיד יכולה להיות בריאה, וכמה גוף חזק יש לך. חושי זאת והיי בריאה שם. חושי גל של אנרגיה וכוח בגוף, נשמי עמוק ובביטחון.

האמיני בכך שאת אדם מאושר, ואת תהיי מאושרת בחיים. היי מאושרת במקום הזה והאמיני בכך. חייכי במחשבה, חושי איך בתוכך נולדת שמחה שקטה.

האמיני בכך שאת יכולה להקשיב ולהבין הכל ולבצע היטב את מה שמבקשים ממך. חושי שאת יכולה לעשות זאת, וכך הכל יהיה. חשבי על היכולת שלך להיות קשובה ואכפתית.

האמיני שכל הצרות שמטרידות אותך יכולות להיעלם. תני לצרות לנשור כמו שלג תחת קרני שמש חמות. האמיני, כך יהיה. בנשיפה ארוכה דמייני איך כל הפחדים והדאגות שלך פשוט מתאדים.

האמיני בעצמך. האמיני שאת יכולה לעבוד בעבודה קשה ותהני כשצריך לעבוד קשה, ותהני שתקבלי את מה שרצית. פשוט האמיני שאת מסוגלת להתאמץ למען משהו, וכשתתאמצי — תקבלי את זה. חשבי על כמה נעים להשיג מטרות בעבודה קשה ובמאמץ וכמה משמח לעזור לאנשים מסביב.

האמיני בעצמך, ותהפכי לאדם כזה שתרצי להיות. האמיני שאת יכולה להיות מי שתרצי, ותהפכי לאדם כזה. חשבי על זה. דמייני את עצמך בעתיד, איך את נראית, כמה את מאושרת.

היי בטוחה — זה מקום שבו חלומות הופכים למציאות. האמיני שהאוכל שטוב לך הופך לטעים מאוד, והוא יהיה טעים מאוד. חושי את הטעם והתועלת של אוכל בריא.

האמיני שאת ייחודית ומוכשרת, ויש לך המון רעיונות מצוינים, ויהיה לך מספיק אומץ כדי להגשים אותם. תהפכי לקוסמת מלאת רעיונות מצוינים. חושי את הייחודיות שלך, חשבי על היכולות שלך כמו על אוצרות. היזכרי שאמא ואבא מאוד שמחים שאת אצלם.

הפכי במחשבה לאדם כזה פשוט לשם הכיף ומכל הלב אהבי את האדם שהופיע — זו את. איזו את רוצה להיות? מאושרת, בריאה, מאוהבת בחיים, חופשייה. חושי רוך רב ואהבה כלפי עצמך, נשמי במלוא החזה.

את תמיד תחת הגנה של כוח בלתי נראה. הוא תמיד אוהב אותך וצופה בך. הוא חי בתוכך, עוזר ללב שלך לפעום, מעניק לך חיים ויוצר בחיים האלה נתיבים חדשים. האמיני בכוח הבלתי נראה הזה, כי הוא מאמין בך. הניחי יד על הלב, חושי את המקצב שלו, חשבי על כך שאת לעולם לא לבד.

את היא הקסם של החיים שלך. האמיני בקסם, האמיני במציאות של הדברים והאמיני באפשרויות. אם את מאמינה באפשרויות — את מאמינה בעצמך. סמכי על עצמך בעולם הזה. חושי את הכוח הפנימי שלך, חשבי לעצמך כך: "אני יכולה הכל".

האמיני שאת חשובה, שאת אהובה, שאת מיוחדת, את יכולה לשנות את כל העולם שלנו ויש בך גדולה. האמיני בכך שאת מסוגלת לעשות כל דבר. חושי את החשיבות שלך, דמייני איך את מביאה טוב לעולם הזה.

אהבי את עצמך ממש עכשיו, אהבי את החיים שלך ממש עכשיו, אהבי את האנשים בחיים שלך ממש עכשיו וסלחי לאלה שאת לא אוהבת, כדי לפנות יותר מקום לאהבה. במחשבה שחררי את כל הטינות הישנות, חושי איך בלב נהיה קל ונקי.

דעי שאמא ואבא אוהבים אותך מאוד.

עכשיו בואי נלמד את הגוף שלך רגשות חדשים ונפלאים. מה זה אומץ? חושי ממש עכשיו איך זה להיות לחלוטין ללא פחד.
מה זה חופש? חושי איך זה להיות חופשייה ומאושרת לחלוטין.
מה זה שפע? חושי שכבר יש לך כל מה שאת צריכה בשביל אושר.
מה זו השראה? דמייני שצץ לך רעיון מצוין ואת יודעת בדיוק איך לבצע אותו.
מה זה כוח חיים? חושי שחי בך כוח בלתי מוגבל. מה זו תשוקה? חושי כמה חזק את מאוהבת בחיים שלך.

הניחי את יד שמאל על הלב וברכי את הגוף שלך לתודעה חדשה ובהירה. ברכי את החיים שלך שלל הרפתקאות, ואת הנשמה שלך שתמיד מראה לך את הדרך הנכונה.

פתחי את הלב שלך והביעי תודה על החיים החדשים והנפלאים שלך עוד לפני שזה קרה. תודה היא סימן לכך שכל מה שפנטסטי כבר קרה בעולם שלך.

מה שלא יקרה, אמא ואבא יאהבו אותך באותה עוצמה.

הגיע הזמן לעזוב את המקום הזה, אבל זכרי: כשאת מאמינה, כל מה שקורה בעולם הזה קורה גם בחיים שלך. שמרי על מצב הביטחון והשלווה הפנימית הזו.

התמתחי היטב והיזכרי שהגיע הזמן לחזור לחיים שאת חיה, ערנית וקשובה עוד יותר. דעי: היום יכולים לקרות לך דברים נפלאים. קחי נשימה עמוקה, התמתחי בכל הגוף, תוך תחושת רעננות וכוח.

פקחי עיניים וחייכי לחיים, ואז הם יחייכו אלייך בחזרה. פקחי עיניים עם חיוך רחב, תוך תחושת מוכנות ליום נפלא ומאושר.
`;

// Initialize Signature Canvas & Setup Listeners on Load
document.addEventListener('DOMContentLoaded', () => {
  setupScrollListener();
  registerServiceWorker();
  initAudioPlayer();
  initSignatureCanvas();
  initAnalyticsTracking(); // 📊 Full analytics: Page_View, scroll %, time, pricing view
});

// Explicit Global Window Binds for HTML Inline Event Handlers
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
window.openGamesModal = openGamesModal;
window.closeGamesModal = closeGamesModal;
window.playQuickTestAudio = playQuickTestAudio;
window.selectAudioMode = selectAudioMode;
window.toggleBillingCycle = toggleBillingCycle;
window.switchLanguage = switchLanguage;
window.scrollToSection = scrollToSection;
window.simulateSocialAuth = simulateSocialAuth;
window.generatePersonalMeditation = generatePersonalMeditation;
window.toggleVoiceRecord = toggleVoiceRecord;
window.clearSignatureCanvas = clearSignatureCanvas;

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

// 100% Multilingual Switcher (RU, EN, HE)
function switchLanguage(langKey, btnEl) {
  appState.lang = langKey;
  
  document.querySelectorAll('.lang-btn').forEach(btn => btn.classList.remove('active'));
  if (btnEl) {
    btnEl.classList.add('active');
  } else if (typeof event !== 'undefined' && event && event.target) {
    event.target.classList.add('active');
  }

  if (langKey === 'he') {
    document.documentElement.setAttribute('dir', 'rtl');
    document.documentElement.setAttribute('lang', 'he');
  } else {
    document.documentElement.setAttribute('dir', 'ltr');
    document.documentElement.setAttribute('lang', langKey);
  }

  const dictionary = i18n[langKey] || i18n.ru;
  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.getAttribute('data-i18n');
    if (dictionary[key]) {
      el.innerHTML = dictionary[key];
    }
  });
}

// Scroll & Sticky Bar
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

// Select 3 Primary Audio Modes
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

// MediaRecorder — Real Parent Microphone Recording
async function toggleVoiceRecord() {
  const micBtn = document.getElementById('mic-btn');
  const micText = document.getElementById('mic-text');
  const micWave = document.getElementById('mic-wave');

  if (!appState.isRecording) {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      appState.mediaRecorder = new MediaRecorder(stream);
      appState.recordedChunks = [];

      appState.mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) appState.recordedChunks.push(e.data);
      };

      appState.mediaRecorder.onstop = () => {
        const blob = new Blob(appState.recordedChunks, { type: 'audio/webm' });
        appState.recordedAudioUrl = URL.createObjectURL(blob);
        micText.innerText = appState.lang === 'he' ? "ההקלטה הושלמה! (ניתן להקשיב)" : "Запись голоса завершена! (Сохранено)";
      };

      appState.mediaRecorder.start();
      appState.isRecording = true;
      micBtn.classList.add('recording');
      micText.innerText = appState.lang === 'he' ? "מקליט קול... דבר עכשיו" : "Идет запись вашего голоса... Говорите";
      micWave.classList.remove('hidden');

      // Auto stop after 5 seconds
      setTimeout(() => {
        if (appState.isRecording) toggleVoiceRecord();
      }, 5000);

    } catch (err) {
      console.warn("Microphone access denied:", err);
      micText.innerText = "Голос проанализирован (ИИ слепок)";
      alert("Доступ к микрофону не предоставлен. Используется демо-слепок ИИ.");
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

// Generate Personal Meditation Text & Play Audio Track
function generatePersonalMeditation() {
  const name = document.getElementById('child-name').value || (appState.lang === 'he' ? "סופיה" : "София");
  const gender = document.getElementById('child-gender').value;
  const audioSource = document.getElementById('audio-mode-source').value;

  logClickAnalytics('Generate_Click', '-', 0, { section: 'generator' });

  const isGirl = (gender === 'girl');
  let customText = "";

  if (appState.lang === 'he') {
    customText = BASE_MEDITATION_TEMPLATE_HE.replace(/{NAME}/g, name);
  } else {
    const genderEnd = isGirl ? 'а' : '';
    const genderAdj = isGirl ? 'ая' : 'ый';
    const genderWizard = isGirl ? 'ца' : '';
    const genderFriend = isGirl ? 'ой' : 'ом';

    customText = BASE_MEDITATION_TEMPLATE_RU
      .replace(/{NAME}/g, name)
      .replace(/{GENDER_END}/g, genderEnd)
      .replace(/{GENDER_ADJ}/g, genderAdj)
      .replace(/{GENDER_WIZARD}/g, genderWizard)
      .replace(/{GENDER_FRIEND}/g, genderFriend);
  }

  const typeSelect = document.getElementById('meditation-type');
  const meditationType = typeSelect ? typeSelect.value : 'bedtime';

  if (meditationType === 'prayer') {
    if (appState.lang === 'he') {
      customText = `🙏 תפילה-מדיטציה לשלווה, אור וברכה:\n\n` + customText;
    } else {
      customText = `🙏 Молитва-медитация о духовном покое, благодарности и защите для ${name}:\n\n` + customText;
    }
  }

  document.getElementById('meditation-text-box').innerText = customText;
  const modeLabel = meditationType === 'prayer' ? (appState.lang === 'he' ? 'תפילה-מדיטציה' : 'Молитва-Медитация') : (appState.lang === 'he' ? 'סיפור-מדיטציה' : 'Рассказ-Медитация');
  document.getElementById('player-title').innerText = `${name} — ${modeLabel}`;
  
  // Smooth scroll to player card
  const playerCard = document.querySelector('.player-card');
  if (playerCard) {
    playerCard.scrollIntoView({ behavior: 'smooth', block: 'center' });
    playerCard.style.boxShadow = '0 0 40px rgba(255, 107, 0, 0.5)';
    setTimeout(() => { playerCard.style.boxShadow = ''; }, 2000);
  }

  appState.isPlayingAudio = false;

  if (appState.recordedAudioUrl) {
    playParentRecordedVoice();
  } else if (audioSource === 'tts') {
    document.getElementById('player-subtitle').innerText = `🤖 Динамический ИИ-диктор • Низкий тембр`;
    speakTextTTS(customText);
  } else {
    document.getElementById('player-subtitle').innerText = `🎵 Студийная MP3 фонограмма • Без музыки`;
    playMP3AudioTrack(true);
  }

  logClickAnalytics('Meditation_Generated', name, 0, { audio_source: audioSource });
}

// Play Parent's Actual Recorded Voice Audio
function playParentRecordedVoice() {
  if (window.speechSynthesis) window.speechSynthesis.cancel();
  if (appState.audioTrack) appState.audioTrack.pause();

  if (appState.recordedAudioUrl) {
    const parentAudio = new Audio(appState.recordedAudioUrl);
    appState.isPlayingAudio = true;
    document.getElementById('play-btn').innerText = "⏸";
    document.getElementById('player-subtitle').innerText = "🎙 Озвучивание записанным голосом родителя!";

    parentAudio.play().then(() => {
      console.log("▶ Playing parent recorded audio...");
    }).catch(err => {
      console.warn("Parent recorded audio play error:", err);
      playMP3AudioTrack(true);
    });

    parentAudio.onended = () => {
      appState.isPlayingAudio = false;
      document.getElementById('play-btn').innerText = "▶";
    };
  } else {
    alert("🎙 Вы еще не записали свой голос! Нажмите микрофон слева для записи отрывка вашего голоса.");
    const micBtn = document.getElementById('mic-btn');
    if (micBtn) {
      micBtn.classList.add('recording');
      setTimeout(() => micBtn.classList.remove('recording'), 3000);
    }
    document.getElementById('player-subtitle').innerText = "🎵 Студийная MP3 фонограмма (Голос не записан)";
    playMP3AudioTrack(true);
  }
}

// Play Studio Audio Track (meditation1.mp3)
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

// Quick Test Audio Button Handler
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

// Speech Synthesis TTS (Slow calm voice with dynamic voice selection)
function speakTextTTS(text) {
  if (appState.audioTrack) appState.audioTrack.pause();
  if (!window.speechSynthesis) {
    alert("В вашем браузере недоступен SpeechSynthesis. Проигрывается MP3 фонограмма.");
    playMP3AudioTrack(true);
    return;
  }

  window.speechSynthesis.cancel();
  if (window.speechSynthesis.resume) {
    window.speechSynthesis.resume();
  }

  const utterance = new SpeechSynthesisUtterance(text);
  utterance.rate = 0.6;
  utterance.pitch = 0.75;
  utterance.lang = appState.lang === 'he' ? 'he-IL' : 'ru-RU';

  utterance.onstart = () => {
    appState.isPlayingAudio = true;
    document.getElementById('play-btn').innerText = "⏸";
    document.getElementById('player-progress').style.width = "30%";
  };

  utterance.onend = () => {
    appState.isPlayingAudio = false;
    document.getElementById('play-btn').innerText = "▶";
    document.getElementById('player-progress').style.width = "100%";
  };

  utterance.onerror = (e) => {
    console.warn("SpeechSynthesis error:", e);
    appState.isPlayingAudio = false;
    document.getElementById('play-btn').innerText = "▶";
    playMP3AudioTrack(true);
  };

  window.speechSynthesis.speak(utterance);
}

// Generate Emergency Tantrum Audio
function generateEmergencyAudio() {
  const contextInput = document.getElementById('emergency-context').value || "Ребенок растревожен";
  const name = document.getElementById('child-name').value || "Ребенок";

  const emergencyScript = `
    ${name}, сделай глубокий выдох вместе со мной... Один... два... три... 
    Я знаю, что ситуация: "${contextInput}" вызывает много эмоций. 
    Но сейчас ты находишься в полной безопасности. 
    Почувствуй, как мягкая волна покоя наполняет твое тело. Ты сильный, ты любимый, ты справишься.
  `;

  document.getElementById('meditation-text-box').innerHTML = `<p><strong>🚨 ЭКСТРЕННОЕ АУДИО ЗАЗЕМЛЕНИЯ:</strong><br><br>${emergencyScript}</p>`;
  playMP3AudioTrack();

  logClickAnalytics('EmergencyAudio_Generated', contextInput, 0);
}

// Interactive Signature Canvas (NDA Signature)
function initSignatureCanvas() {
  appState.signatureCanvas = document.getElementById('signature-canvas');
  if (!appState.signatureCanvas) return;
  appState.signatureCtx = appState.signatureCanvas.getContext('2d');

  appState.signatureCtx.strokeStyle = '#000000';
  appState.signatureCtx.lineWidth = 2.5;
  appState.signatureCtx.lineCap = 'round';

  const canvas = appState.signatureCanvas;

  function startDrawing(e) {
    appState.isDrawingSignature = true;
    appState.signatureCtx.beginPath();
    const pos = getCanvasPos(e);
    appState.signatureCtx.moveTo(pos.x, pos.y);
  }

  function draw(e) {
    if (!appState.isDrawingSignature) return;
    const pos = getCanvasPos(e);
    appState.signatureCtx.lineTo(pos.x, pos.y);
    appState.signatureCtx.stroke();
    document.getElementById('sig-status').innerText = "Подпись поставлена ✓";
    document.getElementById('sig-status').style.color = "#10B981";
  }

  function stopDrawing() {
    appState.isDrawingSignature = false;
  }

  function getCanvasPos(e) {
    const rect = canvas.getBoundingClientRect();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    return {
      x: clientX - rect.left,
      y: clientY - rect.top
    };
  }

  canvas.addEventListener('mousedown', startDrawing);
  canvas.addEventListener('mousemove', draw);
  canvas.addEventListener('mouseup', stopDrawing);
  canvas.addEventListener('mouseleave', stopDrawing);

  canvas.addEventListener('touchstart', startDrawing, { passive: true });
  canvas.addEventListener('touchmove', draw, { passive: true });
  canvas.addEventListener('touchend', stopDrawing);
}

function clearSignatureCanvas() {
  if (appState.signatureCtx && appState.signatureCanvas) {
    appState.signatureCtx.clearRect(0, 0, appState.signatureCanvas.width, appState.signatureCanvas.height);
    document.getElementById('sig-status').innerText = "Подпись пуста";
    document.getElementById('sig-status').style.color = "var(--text-muted)";
  }
}

function openNDAModal() {
  const modal = document.getElementById('nda-modal');
  if (modal) modal.classList.remove('hidden');
  initSignatureCanvas();
  logClickAnalytics('NDAModal_Opened', 'NDA_Form', 0);
}

function closeNDAModal() {
  const modal = document.getElementById('nda-modal');
  if (modal) modal.classList.add('hidden');
}

async function submitNDASignature() {
  const name = document.getElementById('nda-user-name').value || 'Анонимный Подписант';
  const contact = document.getElementById('nda-user-contact') ? document.getElementById('nda-user-contact').value.trim() : '';
  const email = document.getElementById('nda-user-email') ? document.getElementById('nda-user-email').value.trim() : '';
  const sigData = appState.signatureCanvas ? appState.signatureCanvas.toDataURL() : '';

  if (!contact) {
    alert("⚠️ Пожалуйста, укажите ваш номер WhatsApp или Telegram для продолжения!");
    document.getElementById('nda-user-contact')?.focus();
    return;
  }

  localStorage.setItem('ndaSigned', 'true');
  if (typeof hasSignedNDA !== 'undefined') {
    hasSignedNDA = true;
  }

  let pdfBase64 = '';
  if (window.html2pdf) {
    const pdfDiv = document.createElement('div');
    pdfDiv.style.padding = '20px';
    pdfDiv.style.fontFamily = 'Arial, sans-serif';
    pdfDiv.innerHTML = `
      <h2>Пользовательское соглашение (Terms of Service)</h2>
      <p>ОТКАЗ ОТ ОТВЕТСТВЕННОСТИ И ОГРАНИЧЕНИЕ ПРЕТЕНЗИЙ (DISCLAIMER)</p>
      <hr/>
      <p><b>ФИО:</b> ${name}</p>
      <p><b>Email:</b> ${email}</p>
      <p><b>WhatsApp/TG:</b> ${contact}</p>
      <p><b>Дата:</b> ${new Date().toLocaleString('ru-RU')}</p>
      <br/>
      <p>Я, ${name}, подтверждаю свое согласие с правилами сервиса MindEcho AI.</p>
      <br/><br/>
      <p><b>Электронная подпись:</b></p>
      ${sigData ? `<img src="${sigData}" style="max-height: 100px; border: 1px solid #000;" />` : ''}
      <br/><br/>
      <h2>TERMS OF SERVICE AND USER AGREEMENT</h2>
      <p>Effective Date: July 28, 2026</p>
      <p>Welcome to MindEcho AI. Please read these Terms of Service ("Agreement") carefully before using our application, website, or associated services (collectively, the "Service").</p>
      <p>This Agreement is entered into by and between Konstantyn Shlomovich (Passport No. 35260680), sole developer and rights holder of MindEcho AI ("Company", "We", "Us"), and any individual or entity accessing or using the Service ("User", "You").</p>
      <p><b>1. ACCEPTANCE OF TERMS AND ELECTRONIC SIGNATURE</b></p>
      <p>By creating an account, accessing, or using the Service, You agree to be bound by all terms and conditions of this Agreement. Execution Procedure and Digital Footprint Tracking: This Agreement is executed in electronic form. The Receiving Party's details are entered manually or generated automatically upon authorization. Acceptance is confirmed by checking an electronic box or clicking the confirmation button. The Parties acknowledge that recording the Full Name, email address, date, exact timestamp, IP address, and confirmation of consent into an electronic register constitutes a valid digital footprint, which holds the legal status of a simple electronic signature with full legal effect.</p>
    `;
    try {
      pdfBase64 = await html2pdf().set({ margin: 1, filename: 'NDA.pdf' }).from(pdfDiv).outputPdf('datauristring');
    } catch(e) { console.error('PDF Generation error', e); }
  }

  alert(`🎉 Соглашение успешно подписано!\nПодписант: ${name}\nФайл NDA (PDF) сохранен на Google Диск.`);
  closeNDAModal();

  logClickAnalytics('NDA_Signed', name, 0, {
    user_name: name,
    contact: contact,
    email: email,
    phone: contact,
    signature_data: sigData ? 'Signature Captured' : 'Empty',
    pdf_base64: pdfBase64
  });

  // Dedicated separate log entry for WhatsApp/Telegram contact
  logClickAnalytics('WhatsApp_Telegram_Captured', 'NDA_Signature', 0, {
    phone: contact,
    user_name: name,
    email: email,
    page_section: 'NDA_Modal'
  });

  if (appState.pendingCheckout) {
    appState.pendingCheckout = false;
    if (appState.selectedPrice === 0) {
      const modal = document.getElementById('auth-modal');
      if (modal) modal.classList.remove('hidden');
      logClickAnalytics('AuthModal_Opened', 'free', 0);
    } else {
      document.getElementById('checkout-plan-name').innerText = appState.selectedPlan;
      document.getElementById('checkout-plan-price').innerText = `$${appState.selectedPrice}`;
      document.getElementById('checkout-modal').classList.remove('hidden');
    }
  } else if (appState.pendingAuthModal) {
    const type = appState.pendingAuthModal;
    appState.pendingAuthModal = null;
    const modal = document.getElementById('auth-modal');
    if (modal) modal.classList.remove('hidden');
    logClickAnalytics('AuthModal_Opened', type, 0);
  } else {
    scrollToSection('generator');
  }
}

// CustDev Survey Modal & Scenarios
const CUSTDEV_SCENARIOS = {
  burnout: [
    { label: "1. Сколько времени занимает укладывание ребенка и насколько вы чувствуете выгорание к вечеру (1-10)?", placeholder: "Например: 1.5 часа, выгорание 8/10" },
    { label: "2. Что больше всего мешает нормальному сну ребенка?", placeholder: "Например: Капризы, просит посидеть рядом, перевозбуждение..." },
    { label: "3. Готовы ли вы попробовать инструмент, дарящий 1-2 часа личного времени?", placeholder: "Да, хочу протестировать" }
  ],
  tantrums: [
    { label: "1. Как часто ребенок впадает в истерики и ссоры?", placeholder: "Например: Каждый день при уйде с детской площадки..." },
    { label: "2. Что вы обычно испытываете в этот момент?", placeholder: "Например: Бессилие, вину, раздражение..." },
    { label: "3. Хотите протестировать 4-шаговый экстренный протокол заземления?", placeholder: "Да, очень актуально" }
  ],
  confidence: [
    { label: "1. Какие качества вы мечтаете развивать в ребенке?", placeholder: "Например: Уверенность, легкая учеба, верные друзья" },
    { label: "2. Замечаете ли страхи или сомнения в своих силах у ребенка?", placeholder: "Иногда боится отвечать у доски..." },
    { label: "3. Хотите посмотреть утренний рассказ-настрой на успех?", placeholder: "Да, хочу попробовать" }
  ],
  expert: [
    { label: "1. Насколько вам близка идея ИИ + КПТ экосистемы для семей?", placeholder: "Очень поддерживаю проект" },
    { label: "2. Чего не хватает современным сервисам для родителей?", placeholder: "Например: Качественной персонализации" },
    { label: "3. Готовы дать экспертный отзыв после тестирования?", placeholder: "Да, готова написать отзыв" }
  ]
};

function openCustDevModal() {
  document.getElementById('custdev-modal').classList.remove('hidden');
  selectCustDevScenario('burnout');
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

  const questions = CUSTDEV_SCENARIOS[scenarioKey] || CUSTDEV_SCENARIOS.burnout;
  const container = document.getElementById('custdev-q-container');
  container.innerHTML = '';

  questions.forEach((q, idx) => {
    const qDiv = document.createElement('div');
    qDiv.className = 'custdev-q-item';
    qDiv.innerHTML = `
      <label>${q.label}</label>
      <input type="text" id="cd-input-${idx}" placeholder="${q.placeholder}" class="form-input">
    `;
    container.appendChild(qDiv);
  });
}

function handleCustDevSubmit(e) {
  e.preventDefault();
  const answers = [];
  const questions = CUSTDEV_SCENARIOS[appState.currentCustDevScenario] || [];

  questions.forEach((q, idx) => {
    const val = document.getElementById(`cd-input-${idx}`)?.value || '';
    answers.push(`${q.label}: ${val}`);
  });

  alert("🎉 Спасибо за ваши ответы! Ответы записаны. Вам предоставлен приоритетный VIP-доступ.");
  closeCustDevModal();

  const contact = document.getElementById('cd-input-contact')?.value || '-';
  const isEmail = contact.includes('@');

  logClickAnalytics('CustDev_Submitted', appState.currentCustDevScenario, 0, {
    section: answers.join(" | "), // Packing answers here so Google Sheets saves them
    email: isEmail ? contact : '-',
    phone: !isEmail ? contact : contact
  });

  // Dedicated separate log entry for WhatsApp/Telegram contact
  logClickAnalytics('WhatsApp_Telegram_Captured', 'CustDev_Survey', 0, {
    phone: contact,
    plan_name: appState.currentCustDevScenario,
    page_section: 'CustDev_Modal'
  });
}

// Pricing Toggle (Monthly vs Annual)
function toggleBillingCycle() {
  const isAnnual = document.getElementById('billing-switch').checked;
  appState.isAnnualBilling = isAnnual;

  const basicPrice   = document.querySelector('.price-basic');
  const premiumPrice = document.querySelector('.price-premium');
  const platinumPrice= document.querySelector('.price-platinum');

  const basicAnnualSub   = document.querySelector('.price-basic-annual');
  const premiumAnnualSub = document.querySelector('.price-premium-annual');
  const platinumAnnualSub= document.querySelector('.price-platinum-annual');

  const monthLabel = document.getElementById('label-monthly');
  const annualLabel = document.getElementById('label-annual');

  if (isAnnual) {
    if (basicPrice)    basicPrice.innerHTML   = "$29.99 <span>/ год</span>";
    if (premiumPrice)  premiumPrice.innerHTML = "$59.99 <span>/ год</span>";
    if (platinumPrice) platinumPrice.innerHTML= "$99.99 <span>/ год</span>";
    if (basicAnnualSub)    basicAnnualSub.classList.remove('hidden');
    if (premiumAnnualSub)  premiumAnnualSub.classList.remove('hidden');
    if (platinumAnnualSub) platinumAnnualSub.classList.remove('hidden');
    if (monthLabel)  monthLabel.classList.remove('active');
    if (annualLabel) annualLabel.classList.add('active');
  } else {
    if (basicPrice)    basicPrice.innerHTML   = "$7 <span>/ месяц</span>";
    if (premiumPrice)  premiumPrice.innerHTML = "$14.99 <span>/ месяц</span>";
    if (platinumPrice) platinumPrice.innerHTML= "$24.99 <span>/ месяц</span>";
    if (basicAnnualSub)    basicAnnualSub.classList.add('hidden');
    if (premiumAnnualSub)  premiumAnnualSub.classList.add('hidden');
    if (platinumAnnualSub) platinumAnnualSub.classList.add('hidden');
    if (monthLabel)  monthLabel.classList.add('active');
    if (annualLabel) annualLabel.classList.remove('active');
  }

  logClickAnalytics('BillingCycle_Toggled', isAnnual ? 'Annual' : 'Monthly', 0);
}

// Plan Selection & Checkout Modal
function selectPlan(planName, price) {
  appState.selectedPlan = planName;
  
  // Dynamic annual price calculation
  let finalPrice = price;
  if (appState.isAnnualBilling && price > 0) {
    if (planName === 'Basic') finalPrice = 29.99;
    else if (planName === 'Premium') finalPrice = 59.99;
    else if (planName === 'Platinum') finalPrice = 99.99;
  }
  appState.selectedPrice = finalPrice;

  logClickAnalytics('TariffButton_Click', planName, finalPrice);

  // ALWAYS open DISCLAIMER first!
  appState.pendingCheckout = true;
  openNDAModal();
}

function closeCheckoutModal() {
  document.getElementById('checkout-modal').classList.add('hidden');
}

function handlePaymentSubmit(e) {
  e.preventDefault();
  const phone = document.getElementById('checkout-phone')?.value || 'Не указан';
  alert(`🎉 Подписка "${appState.selectedPlan}" успешно активирована! Добро пожаловать в экосистему MindEcho AI.`);
  closeCheckoutModal();
  logClickAnalytics('Payment_Completed', appState.selectedPlan, appState.selectedPrice, { phone: phone });

  // Dedicated separate log entry for WhatsApp/Telegram contact
  logClickAnalytics('WhatsApp_Telegram_Captured', 'Checkout_Payment', appState.selectedPrice, {
    phone: phone,
    plan_name: appState.selectedPlan,
    page_section: 'Checkout_Modal'
  });
}

// Auth Modal Handlers
function openAuthModal(type = 'login') {
  if (!localStorage.getItem('ndaSigned')) {
    appState.pendingAuthModal = type;
    openNDAModal();
  } else {
    const modal = document.getElementById('auth-modal');
    if (modal) modal.classList.remove('hidden');
    logClickAnalytics('AuthModal_Opened', type, 0);
  }
}

function closeAuthModal() {
  document.getElementById('auth-modal').classList.add('hidden');
}

// Games Modal Handlers
function openGamesModal() {
  const modal = document.getElementById('games-modal');
  if (modal) modal.classList.remove('hidden');
  logClickAnalytics('GamesModal_Opened', 'Games', 0);
}

function closeGamesModal() {
  const modal = document.getElementById('games-modal');
  if (modal) modal.classList.add('hidden');
}

function simulateSocialAuth(provider) {
  const userId = 'USER-' + Math.floor(100000 + Math.random() * 900000);
  const sampleName = provider === 'Google' ? 'Google User' : 'Apple User';
  const sampleEmail = provider.toLowerCase() + '_user@mindecho.ai';

  alert(`🎉 Вход через ${provider} выполнен успешно!\nВаш ID: ${userId}`);
  closeAuthModal();

  logClickAnalytics('Social_Registration', provider, 0, {
    user_id: userId,
    user_name: sampleName,
    email: sampleEmail,
    phone: 'Не указан',
    address: 'Облачный профиль ' + provider,
    auth_provider: provider
  });
}

function handleAuthSubmit(e) {
  e.preventDefault();
  const userId = 'USER-' + Math.floor(100000 + Math.random() * 900000);
  const name = document.getElementById('auth-name').value || 'Анонимный пользователь';
  const email = document.getElementById('auth-email').value;
  localStorage.setItem('userEmail', email);
  const phone = document.getElementById('auth-phone').value || 'Не указан';

  alert(`🎉 Спасибо, ${name}! Аккаунт зарегистрирован.\nВаш ID: ${userId}`);
  closeAuthModal();

  logClickAnalytics('Email_Registration', 'Email Form', 0, {
    user_id: userId,
    user_name: name,
    email: email,
    phone: phone,
    auth_provider: 'Email/Phone Form'
  });

  // Dedicated separate log entry for WhatsApp/Telegram contact
  if (phone && phone !== 'Не указан') {
    logClickAnalytics('WhatsApp_Telegram_Captured', 'Auth_Registration', 0, {
      phone: phone,
      user_name: name,
      email: email,
      page_section: 'Auth_Modal'
    });
  }
}

// Google Sheets Webhook Click & Onboarding Logger
// ─── Core Analytics Logger (v2 — 16 fields) ────────────────────────────────
function logClickAnalytics(eventType, planName, priceAmount, extraData = {}) {
  const timeOnPage = Math.round((Date.now() - analyticsState.pageStartTime) / 1000);
  const referrer = document.referrer
    ? (document.referrer.includes('instagram') ? 'Instagram'
      : document.referrer.includes('google') ? 'Google'
      : document.referrer.includes('facebook') ? 'Facebook'
      : document.referrer.includes('telegram') ? 'Telegram'
      : document.referrer)
    : 'direct';
  const ua = navigator.userAgent;
  const deviceType = /Mobile|Android|iPhone/i.test(ua) ? 'mobile'
    : /iPad|Tablet/i.test(ua) ? 'tablet' : 'desktop';

  const payload = {
    timestamp:      new Date().toLocaleString('ru-RU'),
    event_type:     eventType,
    session_id:     SESSION_ID,
    user_name:      extraData.user_name  || '-',
    email:          extraData.email      || '-',
    phone:          extraData.phone      || '-',
    plan_name:      planName             || '-',
    price:          priceAmount          || 0,
    language:       appState.lang        || 'ru',
    device_type:    deviceType,
    referrer:       referrer,
    page_section:   extraData.section    || detectSection(),
    scroll_depth:   analyticsState.maxScrollDepth,
    time_on_page:   timeOnPage,
    child_name:     extraData.child_name || '-',
    payment_intent: extraData.payment_intent || false,
    user_agent:     ua
  };

  console.log('📊 [MindEcho Supabase Analytics]', eventType, payload);

  try {
    fetch(supabaseUrl, {
      method: 'POST',
      headers: {
        'apikey': supabaseKey,
        'Authorization': 'Bearer ' + supabaseKey,
        'Content-Type': 'application/json',
        'Prefer': 'return=minimal'
      },
      body: JSON.stringify(payload)
    }).then(res => {
      if(!res.ok) console.error('🔥 Supabase HTTP error:', res.status);
    }).catch(err => {
      console.error('🔥 Supabase network error:', err);
    });
  } catch (err) {
    console.warn('Analytics fetch error:', err);
  }
}

// Detect which section of page user is viewing
function detectSection() {
  const sections = ['pricing', 'generator', 'modes', 'mission', 'nda', 'custdev'];
  const scrollY = window.scrollY + window.innerHeight / 2;
  for (const id of sections) {
    const el = document.getElementById(id);
    if (el && scrollY >= el.offsetTop && scrollY < el.offsetTop + el.offsetHeight) return id;
  }
  return 'hero';
}

// ─── Full Scroll & Time Tracking Init ──────────────────────────────────────
function initAnalyticsTracking() {
  // Page View on load
  logClickAnalytics('Page_View', '-', 0, { section: 'hero' });

  // Scroll depth tracking (max % reached)
  window.addEventListener('scroll', function() {
    const scrolled = window.scrollY;
    const total = document.body.scrollHeight - window.innerHeight;
    const pct = total > 0 ? Math.round((scrolled / total) * 100) : 0;
    if (pct > analyticsState.maxScrollDepth) {
      analyticsState.maxScrollDepth = pct;
    }

    // Pricing section visibility
    const pricingEl = document.getElementById('pricing');
    if (pricingEl && !analyticsState.pricingViewed) {
      const rect = pricingEl.getBoundingClientRect();
      if (rect.top < window.innerHeight * 0.75) {
        analyticsState.pricingViewed = true;
        logClickAnalytics('Pricing_Viewed', '-', 0, { section: 'pricing' });
      }
    }
  }, { passive: true });

  // Time engagement milestones
  [30, 60, 120].forEach(function(secs) {
    setTimeout(function() {
      if (!analyticsState.engagedTimers[secs]) {
        analyticsState.engagedTimers[secs] = true;
        logClickAnalytics('Engaged_' + secs + 's', '-', 0);
      }
    }, secs * 1000);
  });

  // Track Play button click
  const playBtn = document.getElementById('play-btn');
  if (playBtn) {
    playBtn.addEventListener('click', function() {
      logClickAnalytics('Play_Click', '-', 0, { section: 'generator' });
    });
  }

  // Track Buy buttons
  document.querySelectorAll('[onclick*="selectPlan"], [onclick*="TariffButton"], .pricing-section .btn').forEach(function(btn) {
    btn.addEventListener('click', function() {
      const text = btn.innerText || '';
      const ev = (text.includes('Базов') || text.includes('Basic')) ? 'Buy_Basic_Click'
        : (text.includes('Платин') || text.includes('Platinum')) ? 'Buy_Pro_Click'
        : (text.includes('бесплат') || text.includes('Free')) ? 'Buy_Free_Click'
        : 'Buy_Premium_Click';
      logClickAnalytics(ev, text.trim(), 0, { section: 'pricing', payment_intent: true });
    });
  });

  // Track ALL button clicks globally for the new Admin Panel Table
  document.addEventListener('click', function(e) {
    const btn = e.target.closest('button, .btn, .btn-icon, nav a, .nav-custdev-btn');
    if (btn) {
      let btnText = (btn.innerText || btn.getAttribute('aria-label') || btn.title || btn.id || 'unnamed_btn').trim().replace(/[\r\n]+/g, ' ').substring(0, 45);
      if(!btnText) btnText = 'icon_button';
      logClickAnalytics('BtnClick_' + btnText, btnText, 0, { section: detectSection() });
    }
  });
}

// Register PWA Service Worker
function registerServiceWorker() {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('sw.js')
      .then(() => console.log('📱 [PWA 111] Service Worker registered'))
      .catch(err => console.log('PWA SW registration failed:', err));
  }
}
