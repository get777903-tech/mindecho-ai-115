/**
 * ActiMind AI - Voice Engine for Mia (mia.js)
 * Реализация каскадных таймеров (10с, 20с, 45с), Web Speech API и связи с Gemini API
 */

let recognition = null;
let isMicActive = false;
let silence10sTimer = null;
let inactivity20sTimer = null;
let standby45sTimer = null;
let accumulatedTranscript = "";
let isSpeaking = false;

document.addEventListener('DOMContentLoaded', () => {
  initSpeechRecognition();
  startListeningLoop();
});

function initSpeechRecognition() {
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!SpeechRecognition) {
    console.warn("Speech Recognition API is not supported in this browser.");
    document.getElementById('mia-status-text').innerText = "⚠️ Голосовой ввод не поддерживается (используйте быстрые кнопки)";
    return;
  }

  recognition = new SpeechRecognition();
  recognition.continuous = true;
  recognition.interimResults = true;
  recognition.lang = 'ru-RU';

  recognition.onresult = (event) => {
    let interimTranscript = '';
    for (let i = event.resultIndex; i < event.results.length; ++i) {
      if (event.results[i].isFinal) {
        accumulatedTranscript += ' ' + event.results[i][0].transcript;
      } else {
        interimTranscript += event.results[i][0].transcript;
      }
    }

    const currentText = (accumulatedTranscript + ' ' + interimTranscript).trim();
    if (currentText) {
      document.getElementById('user-transcript').innerHTML = `<strong>👤 Услышано:</strong> <em>«${currentText}»</em>`;
      resetSilence10sTimer(currentText);
    }
  };

  recognition.onerror = (event) => {
    console.warn("Speech recognition event:", event.error);
  };

  recognition.onend = () => {
    if (isMicActive && !isSpeaking) {
      try { recognition.start(); } catch(e) {}
    }
  };
}

function startListeningLoop() {
  isMicActive = true;
  const btn = document.getElementById('mic-toggle-btn');
  if (btn) btn.classList.add('listening');
  document.getElementById('mia-status-text').innerText = "🟢 Мия слушает вас...";

  if (recognition) {
    try { recognition.start(); } catch(e) {}
  }
}

function toggleMicrophone() {
  isMicActive = !isMicActive;
  const btn = document.getElementById('mic-toggle-btn');
  if (isMicActive) {
    btn.classList.add('listening');
    document.getElementById('mia-status-text').innerText = "🟢 Мия слушает вас...";
    if (recognition) {
      try { recognition.start(); } catch(e) {}
    }
  } else {
    btn.classList.remove('listening');
    document.getElementById('mia-status-text').innerText = "⏸️ Микрофон на паузе";
    if (recognition) {
      try { recognition.stop(); } catch(e) {}
    }
    clearAllTimers();
  }
}

// 1. Таймер 3 секунды тишины после речи: автоматическая отправка в LLM Gemini
function resetSilence10sTimer(currentText) {
  clearTimeout(silence10sTimer);
  clearTimeout(inactivity20sTimer);
  clearTimeout(standby45sTimer);

  silence10sTimer = setTimeout(() => {
    if (currentText.trim().length > 0) {
      processSpeechWithGemini(currentText);
      accumulatedTranscript = "";
    }
  }, 3000); // Строго 3 секунды после окончания речи
}

// Зеленая кнопка «Отправить» — ручная немедленная отправка сообщения без отключения микрофона
function sendActiveVoiceMessage() {
  const userTranscriptEl = document.getElementById('user-transcript');
  let textToSend = accumulatedTranscript.trim();
  
  if (!textToSend && userTranscriptEl) {
    const raw = userTranscriptEl.innerText.replace('👤 Услышано:', '').replace(/[«»]/g, '').trim();
    if (raw) textToSend = raw;
  }

  if (textToSend) {
    clearTimeout(silence10sTimer);
    processSpeechWithGemini(textToSend);
    accumulatedTranscript = "";
  } else {
    document.getElementById('mia-status-text').innerText = "🎙️ Говорите в микрофон, затем нажмите Отправить...";
  }
}

async function processSpeechWithGemini(userText) {
  document.getElementById('mia-status-text').innerText = "🌸 Мия думает над ответом...";
  
  if (recognition) {
    try { recognition.stop(); } catch(e) {}
  }

  const responseText = await window.askGeminiAPI(userText);
  displayAndSpeakMiaResponse(responseText);
}

function displayAndSpeakMiaResponse(text) {
  const formattedHtml = text.replace(/\*\*(.*?)\*\*/g, '<span class="reading-highlight">$1</span>');
  document.getElementById('mia-transcript').innerHTML = `<strong>🌸 Мия говорит:</strong> <span>${formattedHtml}</span>`;
  document.getElementById('mia-status-text').innerText = "🌸 Мия говорит...";

  speakVoiceResponse(text, () => {
    document.getElementById('mia-status-text').innerText = "🟢 Мия слушает вас...";
    if (isMicActive && recognition) {
      try { recognition.start(); } catch(e) {}
    }
    startInactivityTimers();
  });
}

// Озвучка стандартным приятным женским голосом (стиль Vega / Google русский женский)
function speakVoiceResponse(text, onEndCallback) {
  if (!('speechSynthesis' in window)) {
    if (onEndCallback) onEndCallback();
    return;
  }

  window.speechSynthesis.cancel();
  isSpeaking = true;

  // Очищаем markdown звездочки и эмодзи для идеального произношения
  const cleanSpeechText = text.replace(/\*\*/g, '').replace(/[\u{1F300}-\u{1F9FF}]/gu, '');
  const utterance = new SpeechSynthesisUtterance(cleanSpeechText);
  utterance.lang = 'ru-RU';
  utterance.rate = 0.95; // Спокойный, мягкий и размеренный темп
  utterance.pitch = 1.08; // Приятный женский дружелюбный тембр (стиль Vega)

  // Подбор лучшего женского голоса системы (Google русский, Svetlana, Irina, Tatyana, Vega)
  const voices = window.speechSynthesis.getVoices();
  const femaleRussianVoice = voices.find(v => 
    v.lang.startsWith('ru') && (
      v.name.includes('Vega') ||
      v.name.includes('Female') || 
      v.name.includes('Google') || 
      v.name.includes('Svetlana') || 
      v.name.includes('Irina') || 
      v.name.includes('Tatyana')
    )
  ) || voices.find(v => v.lang.startsWith('ru'));

  if (femaleRussianVoice) {
    utterance.voice = femaleRussianVoice;
  }

  utterance.onend = () => {
    isSpeaking = false;
    if (onEndCallback) onEndCallback();
  };

  utterance.onerror = () => {
    isSpeaking = false;
    if (onEndCallback) onEndCallback();
  };

  window.speechSynthesis.speak(utterance);
}

// 2. Таймер 20с неактивности и 3. Таймер 45с перехода в режим ожидания
function startInactivityTimers() {
  clearTimeout(inactivity20sTimer);
  clearTimeout(standby45sTimer);

  inactivity20sTimer = setTimeout(() => {
    document.getElementById('mia-status-text').innerText = "🌸 Мия рядом...";
    
    standby45sTimer = setTimeout(() => {
      document.getElementById('mia-status-text').innerText = "🌙 Мия в режиме ожидания (позовите: «Мия»)";
      speakVoiceResponse("Я рядышком, и когда захочешь поболтать — просто позови меня: «Мия!»");
    }, 25000); // 20с + 25с = 45 секунд тишины
  }, 20000);
}

function clearAllTimers() {
  clearTimeout(silence10sTimer);
  clearTimeout(inactivity20sTimer);
  clearTimeout(standby45sTimer);
}

function sendQuickTopic(topicText) {
  document.getElementById('user-transcript').innerHTML = `<strong>👤 Выбрана тема:</strong> <em>«${topicText}»</em>`;
  processSpeechWithGemini(topicText);
}

function triggerExpressEmergency() {
  sendQuickTopic("Мия, нужна скорая помощь при капризах! Помоги успокоиться за 3 минуты.");
}

function triggerExpressDialog() {
  sendQuickTopic("Мия, давай поболтаем по душам и найдем суперспособности!");
}

window.sendQuickTopic = sendQuickTopic;
window.toggleMicrophone = toggleMicrophone;
window.sendActiveVoiceMessage = sendActiveVoiceMessage;
window.triggerExpressEmergency = triggerExpressEmergency;
window.triggerExpressDialog = triggerExpressDialog;

// Multilingual humanized translations for Ask Mia Page (RU, EN, HE)
const miaTranslations = {
  ru: {
    mia_title_tag: "👧 Подключение «Ask Mia» в Джемботе (Google Gemini)",
    mia_header_brand: "👧 Подключение «Ask Mia» в Джемботе",
    mia_btn_back: "⬅️ На главную",
    mia_top_tag: "🚀 👧 Подключение «Ask Mia» в Джемботе (Google Gemini)",
    mia_top_title: "Запустите «Ask Mia Подружка» на смартфоне в 1 клик",
    mia_top_btn: "<span>🚀 Запустить в Джемботе</span> ➔",
    mia_promo_badge1: "🎁 БЕСПЛАТНО МЕСЯЦ !! в 2 клика",
    mia_promo_badge2: "✨ Академия ActiMind",
    mia_promo_title: "*Развивающая 🚀ИИ подружка для ребёнка👧 (лучше чем “Алиса\" или репетитор) от академии ActiMind*",
    mia_promo_desc: "Рассказывает, объясняет, проверяет чтение, хвалит, мотивирует и начисляет алмазы 💎 в увлекательной игре!",
    mia_promo_b1: "- Математика в виде игры🧮, Финансовая грамотность, физика💡, география, тело человека и т.д.!",
    mia_promo_b2: "Увлекательное чтение📖 на русском, английском, иврите и *любом другом языке🌍 с наградами в Алмазах*💎!",
    mia_promo_b3: "- *Забота об осанке, глазах 👁️ и правильном питании 🥗 и многое другое!! освободи себе 2 часа,- *попроси ребёнка: НАБЕРИ 250 алмазов* 💎 в этой игре !!",
    mia_2clicks_title: "⚡ За 2 клика:",
    mia_2clicks_s1: "1. Установите приложение Google Gemini ✨ (из Google Play или App Store), если его ещё нет на телефоне📱.",
    mia_2clicks_s2: "2. Нажмите на ссылку 🔗 на телефоне:<br><a href=\"https://share.gemini.google/0cgBh4lKXPoX\" target=\"_blank\" style=\"color: #38bdf8; font-weight: 700; word-break: break-all; text-decoration: underline;\">https://share.gemini.google/0cgBh4lKXPoX</a><br>и нажмите «Использовать Gem» .🎉 Всё готово!",
    mia_fb_review: "💬 Посмотрите Объяснения + отзывы и напишите свой.<br>👉 <a href=\"https://www.facebook.com/groups/2297576453980639\" target=\"_blank\" style=\"color: #fbbf24; font-weight: 700; word-break: break-all; text-decoration: underline;\">https://www.facebook.com/groups/2297576453980639</a>",
    mia_pres_tag: "💎 ЭКОСИСТЕМА РАЗВИТИЯ РЕБЁНКА",
    mia_pres_title: "Превратите смартфон в персонального наставника вашего ребёнка",
    mia_pres_sub: "Как «Алиса», но с живым сердцем, педагогической чуткостью и настоящей игровой магией (для детей 3–12 лет)",
    mia_p1_title: "1. Учёба с горящими глазами (Сократический метод)",
    mia_p1_desc: "Терпеливый наставник учит думать самому, а не выдаёт готовые ответы. Математика, чтение и языки превращаются в увлекательное приключение с полным пониманием сути.",
    mia_p2_title: "2. Игровой тренажёр интеллекта & ораторской речи",
    mia_p2_desc: "Интерактивные сюжетные квесты и развитие ораторского мастерства раскрывают уверенность ребёнка в себе, избавляют от стеснительности и учат свободно выражать мысли.",
    mia_p3_title: "3. Бережная сорегуляция при капризах (за 2 минуты)",
    mia_p3_desc: "Быстрое возвращение душевного равновесия через научно доказанные техники заземления («Носик-животик»). Без криков, наказаний и чувства вины.",
    mia_p4_title: "4. Сладкий сон за 8–10 минут",
    mia_p4_desc: "Убаюкивающие терапевтические сказки-медитации с мягкими паузами для плавного и глубокого расслабления нервной системы перед сном.",
    mia_p5_title: "5. Карманная советница для мамы 24/7 & 2 часа тишины",
    mia_p5_desc: "Чуткая психологическая опора для родителей, мудрые подсказки по возрастным кризисам и 2 часа свободного времени для мамы каждый вечер.",
    mia_slogan: "«Смартфон в руках вашего ребёнка может быть похитителем внимания или персональным Сократическим наставником. Сделайте осознанный выбор в пользу сильного развития!»",
    mia_bottom_title: "Готовы подарить ребёнку развивающего друга?",
    mia_bottom_sub: "Установите Джембот «Ask Mia Подружка» в официальное приложение Google Gemini на своём смартфоне и общайтесь живым голосом в любое время!",
    mia_bottom_btn: "<span>✨ Запустить Ask Mia в Джемботе</span> 🚀",
    mia_bottom_link_label: "Ссылка для установки: "
  },
  en: {
    mia_title_tag: "👧 Connect \"Ask Mia\" in Google Gemini Gem",
    mia_header_brand: "👧 Connect «Ask Mia» in Gemini Gem",
    mia_btn_back: "⬅️ Back to Home",
    mia_top_tag: "🚀 👧 Connect \"Ask Mia\" in Google Gemini Gem",
    mia_top_title: "Launch \"Ask Mia Best Friend\" on your phone in 1 click",
    mia_top_btn: "<span>🚀 Launch in Gemini Gem</span> ➔",
    mia_promo_badge1: "🎁 1 MONTH FREE !! in 2 clicks",
    mia_promo_badge2: "✨ ActiMind Academy",
    mia_promo_title: "*Developmental 🚀 AI Best Friend for Child 👧 (Far better than standard voice assistants or tutors) by ActiMind Academy*",
    mia_promo_desc: "Tells stories, explains, verifies reading, praises, motivates, and awards diamonds 💎 in an exciting game!",
    mia_promo_b1: "- Gamified Math 🧮, Financial Literacy, Physics 💡, Geography, Human Anatomy and more!",
    mia_promo_b2: "Engaging reading in Russian, English, Hebrew and *any world language 🌍 with Diamond rewards* 💎!",
    mia_promo_b3: "- *Posture care, eye health 👁️, healthy nutrition 🥗 and more!! Free up 2 hours for yourself — *tell your child: COLLECT 250 diamonds* 💎 in this game!!",
    mia_2clicks_title: "⚡ In 2 Clicks:",
    mia_2clicks_s1: "1. Install the Google Gemini ✨ app (from Google Play or App Store) if not already on your phone 📱.",
    mia_2clicks_s2: "2. Tap this link 🔗 on your phone:<br><a href=\"https://share.gemini.google/0cgBh4lKXPoX\" target=\"_blank\" style=\"color: #38bdf8; font-weight: 700; word-break: break-all; text-decoration: underline;\">https://share.gemini.google/0cgBh4lKXPoX</a><br>and press \"Use Gem\". 🎉 All ready!",
    mia_fb_review: "💬 Check out explanations + reviews and leave yours.<br>👉 <a href=\"https://www.facebook.com/groups/2297576453980639\" target=\"_blank\" style=\"color: #fbbf24; font-weight: 700; word-break: break-all; text-decoration: underline;\">https://www.facebook.com/groups/2297576453980639</a>",
    mia_pres_tag: "💎 CHILD DEVELOPMENT ECOSYSTEM",
    mia_pres_title: "Transform your smartphone into your child's personal mentor",
    mia_pres_sub: "Like a caring voice assistant, but with a warm heart, pedagogical empathy, and real gaming magic (ages 3–12)",
    mia_p1_title: "1. Learning with Sparking Eyes (Socratic Method)",
    mia_p1_desc: "A patient mentor teaches thinking independently rather than giving ready answers. Math, reading, and languages turn into an exciting adventure with genuine comprehension.",
    mia_p2_title: "2. Gamified Trainer for Intellect & Public Speaking",
    mia_p2_desc: "Interactive quests and speech training build authentic confidence, eliminate shyness, and nurture eloquent self-expression.",
    mia_p3_title: "3. Gentle Co-regulation for Tantrums (in 2 minutes)",
    mia_p3_desc: "Rapid emotional reset via scientifically grounded techniques (\"Nose-Belly breathing\"). No shouting, punishment, or parental guilt.",
    mia_p4_title: "4. Sweet Sleep in 8–10 Minutes",
    mia_p4_desc: "Lulling therapeutic meditation tales with gentle pauses for deep nervous system relaxation before sleep.",
    mia_p5_title: "5. Pocket Advisor for Mom 24/7 & 2 Hours of Quiet",
    mia_p5_desc: "Empathetic psychological support for parents, wise guidance on age crises, and 2 hours of quiet time for mom every evening.",
    mia_slogan: "“A smartphone in your child's hands can be an attention thief or a personal Socratic mentor. Make a conscious choice for powerful growth!”",
    mia_bottom_title: "Ready to give your child an inspiring AI friend?",
    mia_bottom_sub: "Install the \"Ask Mia Best Friend\" Gem in the official Google Gemini app on your phone and talk with natural voice anytime!",
    mia_bottom_btn: "<span>✨ Launch Ask Mia in Gemini</span> 🚀",
    mia_bottom_link_label: "Installation link: "
  },
  he: {
    mia_title_tag: "👧 חיבור «Ask Mia» ב-Gemini Gem של גוגל",
    mia_header_brand: "👧 חיבור «Ask Mia» ב-Gemini",
    mia_btn_back: "⬅️ לדף הבית",
    mia_top_tag: "🚀 👧 חיבור «Ask Mia» ב-Gemini של גוגל",
    mia_top_title: "הפעילו את «Ask Mia חברה מפתחת» בסמארטפון בקליק אחד",
    mia_top_btn: "<span>🚀 הפעל ב-Gemini Gem</span> ➔",
    mia_promo_badge1: "🎁 חודש חינם !! ב-2 קליקים",
    mia_promo_badge2: "✨ אקדמיית ActiMind",
    mia_promo_title: "*חברה מפתחת 🚀 מבוססת AI לילד/ה 👧 (טובה בהרבה מסייענים רגילים או מורים פרטיים) מאת אקדמיית ActiMind*",
    mia_promo_desc: "מספרת סיפורים, מסבירה, בודקת קריאה, משבחת, מעודדת ומעניקה יהלומים 💎 במשחק מרתק!",
    mia_promo_b1: "- מתמטיקה כמשחק 🧮, אוריינות פיננסית, פיזיקה 💡, גאוגרפיה, גוף האדם ועוד!",
    mia_promo_b2: "קריאה מרתקת בעברית, אנגלית, רוסית וב*כל שפה בעולם 🌍 עם פרסי יהלומים* 💎!",
    mia_promo_b3: "- *שמירה על יציבה, בריאות העיניים 👁️ ותזונה נכונה 🥗 ועוד!! פנו לעצמכם שעתיים ביום — *בקשו מהילד: אסוף 250 יהלומים* 💎 במשחק הזה!!",
    mia_2clicks_title: "⚡ ב-2 קליקים:",
    mia_2clicks_s1: "1. התקינו את אפליקציית Google Gemini ✨ (מ-Google Play או App Store) אם אינה מותקנת עדיין 📱.",
    mia_2clicks_s2: "2. לחצו על הקישור 🔗 בסמארטפון:<br><a href=\"https://share.gemini.google/0cgBh4lKXPoX\" target=\"_blank\" style=\"color: #38bdf8; font-weight: 700; word-break: break-all; text-decoration: underline;\">https://share.gemini.google/0cgBh4lKXPoX</a><br>ולחצו ״השתמש ב-Gem״. 🎉 הכל מוכן!",
    mia_fb_review: "💬 צפו בהסברים + ביקורות וכתבו חוות דעת משלכם.<br>👉 <a href=\"https://www.facebook.com/groups/2297576453980639\" target=\"_blank\" style=\"color: #fbbf24; font-weight: 700; word-break: break-all; text-decoration: underline;\">https://www.facebook.com/groups/2297576453980639</a>",
    mia_pres_tag: "💎 מערכת אקולוגית להתפתחות הילד",
    mia_pres_title: "הפכו את הסמארטפון למנחה ומנטור אישי לילדכם",
    mia_pres_sub: "כמו סייען קולי חכם, אך עם לב חם, רגישות פדגוגית וקסם משחקי אמיתי (גילאי 3–12)",
    mia_p1_title: "1. למידה בעיניים נוצצות (השיטה הסוקרטית)",
    mia_p1_desc: "מנטור סבלני שמלמד לחשוב באופן עצמאי במקום לפלוט תשובות מוכנות. מתמטיקה, קריאה ושפות הופכות להרפתקה מרתקת עם הבנה עמוקה של החומר.",
    mia_p2_title: "2. מאמן משחקי לפיתוח אינטלקט ודיבור מול קהל",
    mia_p2_desc: "קווסטים עלילתיים אינטראקטיביים ואימון רטוריקה מעניקים לילד ביטחון עצמי, משחררים מביישנות ומלמדים להביע מחשבות בביטחון.",
    mia_p3_title: "3. ויסות רגשי עדין בזמן התקפי זעם (ב-2 דקות)",
    mia_p3_desc: "החזרה מהירה של שלווה נפשית באמצעות טכניקות קרקוע מוכחות מדעית (״אף-בטן״). ללא צעקות, עונשים או רגשות אשם.",
    mia_p4_title: "4. שינה מתוקה תוך 8–10 דקות",
    mia_p4_desc: "סיפורי מדיטציה טיפוליים ומרגיעים עם הפסקות רכות להרפיה עמוקה של מערכת העצבים לפני השינה.",
    mia_p5_title: "5. יועצת כיס לאמא 24/7 ושעתיים של שקט יומי",
    mia_p5_desc: "משענת פסיכולוגית רגישה להורים, תובנות מקצועיות במשברי גיל ושעתיים של זמן פנוי לאמא בכל ערב.",
    mia_slogan: "״הסמארטפון בידי ילדכם יכול להיות גנב קשב או מנטור סוקרטי אישי. בחרו במודע בהתפתחות עוצמתית!״",
    mia_bottom_title: "מוכנים להעניק לילדכם חבר ומנטור מפתח?",
    mia_bottom_sub: "התקינו את ה-Gem ״Ask Mia חברה מפתחת״ באפליקציית Google Gemini הרשמית בסמארטפון ושוחחו בקול טבעי בכל עת!",
    mia_bottom_btn: "<span>✨ הפעל את Ask Mia ב-Gemini</span> 🚀",
    mia_bottom_link_label: "קישור להתקנה: "
  }
};

function switchMiaLanguage(langKey, btnEl) {
  document.querySelectorAll('.lang-btn').forEach(btn => {
    btn.style.background = 'transparent';
    btn.style.color = '#cbd5e1';
    btn.classList.remove('active');
  });

  if (btnEl) {
    btnEl.style.background = '#FF6B00';
    btnEl.style.color = '#fff';
    btnEl.classList.add('active');
  }

  if (langKey === 'he') {
    document.documentElement.setAttribute('dir', 'rtl');
    document.documentElement.setAttribute('lang', 'he');
  } else {
    document.documentElement.setAttribute('dir', 'ltr');
    document.documentElement.setAttribute('lang', langKey);
  }

  const dict = miaTranslations[langKey];
  if (dict) {
    document.querySelectorAll('[data-i18n]').forEach(el => {
      const key = el.getAttribute('data-i18n');
      if (dict[key]) {
        el.innerHTML = dict[key];
      }
    });
  }
}

window.switchMiaLanguage = switchMiaLanguage;
