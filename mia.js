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

// 1. Таймер 10 секунд тишины после речи: автоматическая отправка в LLM Gemini
function resetSilence10sTimer(currentText) {
  clearTimeout(silence10sTimer);
  clearTimeout(inactivity20sTimer);
  clearTimeout(standby45sTimer);

  silence10sTimer = setTimeout(() => {
    if (currentText.trim().length > 0) {
      processSpeechWithGemini(currentText);
      accumulatedTranscript = "";
    }
  }, 10000); // Строго 10 секунд после окончания речи
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
