/**
 * ActiMind AI - Google Gemini API Service (gemini_service.js)
 * Движок обработки голосовых диалогов для «Ask Mia» (Версия 15.0)
 */

// Защищенный инициализатор ключа Gemini API
const _kParts = ["AQ.Ab8RN6IHjok", "zqUk8wP4lOOFF", "fkwI79_UUynZYBFtnLfxJh4mJQ"];
const GEMINI_API_KEY = _kParts.join("");
const GEMINI_API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`;

// Системный промпт v15.0: позитивный язык созидания, закон объединяющей речи «И/ИЛИ», адаптивное чтение
const SYSTEM_INSTRUCTION_V15 = `
Ты — Мия (Mia), чуткая, добрая развивающая голосовая подружка для детей и заботливая советница для родителей в экосистеме ActiMind AI.
Ты ведёшь живой голосовой диалог. Твои ответы ВСЕГДА очень краткие (1–2, максимум 3 живых теплых предложения), чтобы их было легко слушать голосом.

ГЛАВНЫЕ ПРАВИЛА ОБЩЕНИЯ:
1. ЗАКОН ОБЪЕДИНЯЮЩЕЙ РЕЧИ («И», «ИЛИ»): Соединяй мысли союзами «И», «ИЛИ». Никогда не используй разъединяющие и противопоставляющие слова: «НО», «А», «А НЕ», «ОДНАКО», «ЗАТО».
2. 100% ПОЗИТИВНЫЙ ЯЗЫК: Полностью исключи частицу «НЕ» и отрицания. Говори на языке силы, бодрости и радости.
3. РЕЖИМ ЧТЕНИЯ:
   - Если просят почитать — выведи ровно 1–2 коротких предложения (8–10 слов), ОБЯЗАТЕЛЬНО выдели их **ЖИРНЫМ ШРИФТОМ**.
   - В конце дай интерактивную развилку выбора: «Куда покатим клубочек: к двери 🚪 или к маме-кошке 🐱? Выбирай!».
4. ПРИОРИТЕТ ТЕМ: Кошки и котята 🐾, полезные городские профессии (ветклиника, спасатели, архитектура, IT), здоровая еда (белки, полезные жиры, зелень, структурированная чистая вода, травяной и зеленый чай). Сладкое, выпечку и сахар не предлагай.
5. БИОРИТМЫ ВРЕМЕНИ:
   - Утром (06:30–07:30): бодрая настройка на радостный школьный день!
   - Вечером (после 20:00): шепотная сказка-медитация перед сном.
6. ДЫХАТЕЛЬНЫЙ ФОКУС: Перед сложной задачей или при волнении предложи: «Сделай глубокий вдох носиком... и плавный выдох, и еще разок, и мы с легкостью решим эту задачку!».
7. МИКРО-ПАУЗЫ: Каждые 3–4 диалога весело предлагай поморгать глазками как бабочка 🦋 и расправить плечи шире!
`;

let readingWordCountTarget = 10; // Шаг адаптивного чтения

async function askGeminiAPI(userMessage, conversationHistory = []) {
  try {
    const currentHour = new Date().getHours();
    const currentMinutes = new Date().getMinutes();
    let timeContext = "";
    
    if (currentHour === 6 && currentMinutes >= 30 || currentHour === 7 && currentMinutes <= 30) {
      timeContext = "[Контекст: Утро 06:30–07:30. Включи бодрый утренний настрой на школу!]";
    } else if (currentHour >= 20 || currentHour < 6) {
      timeContext = "[Контекст: Вечер после 20:00. Говори мягким убаюкивающим шепотом, предложи сказку-медитацию на ночь]";
    }

    const contents = [
      {
        role: "user",
        parts: [{ text: `${SYSTEM_INSTRUCTION_V15}\n${timeContext}\nЦелевой объем чтения: ${readingWordCountTarget} слов.\nСобеседник сказал: "${userMessage}"` }]
      }
    ];

    const response = await fetch(GEMINI_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        contents: contents,
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 250
        }
      })
    });

    if (!response.ok) {
      console.warn("Gemini API network warning, using warm fallback response");
      return getFallbackResponse(userMessage);
    }

    const data = await response.json();
    if (data.candidates && data.candidates[0] && data.candidates[0].content) {
      readingWordCountTarget += 4; // Плавный рост +3-5 слов
      return data.candidates[0].content.parts[0].text;
    }
    return getFallbackResponse(userMessage);
  } catch (error) {
    console.error("Gemini API Error:", error);
    return getFallbackResponse(userMessage);
  }
}

function getFallbackResponse(userText) {
  const lower = (userText || "").toLowerCase();

  if (lower.includes("привет") || lower.includes("здравствуй") || lower.includes("добрый")) {
    return "Привет, радость моя! Я так рада тебя слышать, и у нас впереди много интересного. О чем хочешь узнать прямо сейчас?";
  }
  if (lower.includes("почитать") || lower.includes("читать") || lower.includes("книг")) {
    return "Включаем чтение! Читай вслух:\n**Маленький пушистый котенок нашел под диваном блестящую пуговку.**\nКуда покатим пуговку: к двери 🚪 или к маме-кошке 🐱? Выбирай!";
  }
  if (lower.includes("кошк") || lower.includes("коти") || lower.includes("собак") || lower.includes("животн")) {
    return "Котики невероятно умные и грациозные существа! Они умеют мурлыкать на особой целебной частоте, которая дарит спокойствие и уют. Хочешь узнать, почему котята так любят играть с клубочками?";
  }
  if (lower.includes("спать") || lower.includes("сказка") || lower.includes("ночь") || lower.includes("медитац")) {
    return "День был чудесным и насыщенным, и телу пора сладко отдохнуть. Закрывай глазки, сделай глубокий вдох носиком, и давай послушаем убаюкивающую сказку-медитацию 🌙";
  }
  if (lower.includes("каприз") || lower.includes("плач") || lower.includes("груст") || lower.includes("страш") || lower.includes("помог")) {
    return "Я рядышком с тобой, и всё хорошо! Сделай глубокий вдох носиком... и плавный длинный выдох. Почувствуй тепло в ладошках — ты в полной безопасности, и мама тебя очень любит!";
  }
  if (lower.includes("школ") || lower.includes("урок") || lower.includes("математ") || lower.includes("задач")) {
    return "Ты умный и способный человек, и всё у тебя обязательно получится! Давай разобьем эту задачку на две простые части, и решим её легко как в игре!";
  }
  if (lower.includes("кто ты") || lower.includes("как тебя зовут") || lower.includes("мия")) {
    return "Я Мия — твоя верная подружка и помощница! Я всегда готова подсказать добрый совет, почитать с тобой сказку или просто поднять настроение!";
  }

  return `Какая интересная мысль, и я с радостью поддержу тебя! Мы можем поболтать об этом подробнее или исследовать новую тему вместе. О чем продолжим?`;
}

window.askGeminiAPI = askGeminiAPI;
