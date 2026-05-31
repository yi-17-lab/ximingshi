import express from 'express';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI, Type } from '@google/genai';
import path from 'path';
import dotenv from 'dotenv';

dotenv.config();

// Ensure Gemini API Key is loaded safely and logged beautifully if missing
const apiKey = process.env.GEMINI_API_KEY;
if (!apiKey) {
  console.warn("WARNING: GEMINI_API_KEY is not defined in the environment. AI-grounded astrologer analysis won't function. Provide it in Settings > Secrets.");
}

// Instantiate GoogleGenAI Client with recommended header
const ai = new GoogleGenAI({
  apiKey: apiKey || "MOCK_KEY_FOR_TESTING",
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build'
    }
  }
});

async function startServer() {
  const app = express();
  app.use(express.json());

  // AI Natal Chart Astrological Analysis Proxy
  app.post('/api/ziwei-ai-analysis', async (req, res) => {
    try {
      const { chart, language } = req.body;
      const isEnglish = language === 'en';

      const prompt = isEnglish
        ? `Analyze this Zi Wei Dou Shu celestial configuration chart:
           Name: ${chart.name}
           Gender: ${chart.genderEn}
           Birth Hour: ${chart.birthHourEn}
           Chinese Birth Celestial Stem-Branch Year: ${chart.yearlyStemBranchEn}
           Five Elements Phase: ${chart.fiveElementsEn}
           Palaces Configs: ${JSON.stringify(chart.grids.map((g: any) => ({
             palace: g.palaceEn,
             branch: g.branchEn,
             stars: g.stars.map((s: any) => s.nameEn + ' (' + s.levelEn + ')')
           })))}
           Provide a detailed natal destiny reading containing:
           1. Core Personality & Temperament (based on Life Palace stars).
           2. Career, Wealth, and Property prospects.
           3. Key life advice and warnings.
           Keep the tone majestic, profound, and highly insightful.`
        : `请你作为一名精通紫微斗数的古典命理大师，对以下紫微格盘进行详尽深度的分析：
           姓名：${chart.name}
           性别：${chart.genderZh}
           生辰：${chart.solarDate} (${chart.birthHourZh}时)
           农历：${chart.lunarDate}
           生肖年柱：${chart.yearlyStemBranchZh}
           五行局：${chart.fiveElementsZh}
           星盘配置：${JSON.stringify(chart.grids.map((g: any) => ({
             宫位: g.palaceZh,
             地支: g.branchZh,
             主星: g.stars.map((s: any) => s.nameZh + ' [' + s.levelZh + ']')
           })))}
           请给出：
           1. 命格气象与核心性格（重点分析命宫、福德宫所主）。
           2. 财帛官禄：一生的财运轨迹、适合开拓的职业赛道、田宅运。
           3. 斗数真言：大师一生的正向指引、避坑指南、未来流年运势推演启示。
           字句须典雅、深邃、具有极高的文化格调和智慧关怀，避免迷信或过度恐吓。`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.5-flash',
        contents: prompt,
        config: {
          systemInstruction: isEnglish
            ? "You are a legendary ancient Eastern astrologer master who translates heavenly charts into profound Western poetic wisdom."
            : "你是一位隐居山林的紫微斗数泰斗，谈吐风雅高妙，充满宿命哲理与正向人文关怀。"
        }
      });

      res.json({ analysis: response.text || "Could not generate analysis. Please try again." });
    } catch (err: any) {
      console.error(err);
      res.status(500).json({ error: err.message });
    }
  });

  // 1-on-1 Virtual Divine Master Counseling Route
  app.post('/api/consult-master', async (req, res) => {
    try {
      const { masterId, message, history, chart, language } = req.body;
      const isEnglish = language === 'en';

      let sysInstruction = "";
      if (masterId === 'master_li') {
        sysInstruction = isEnglish
          ? "You are Master Li Xuzhong, a highly traditional, orthodox Chinese destiny consultant. You speak in concise, highly ancient elegant English with deep quotes, honoring filial, timing, and structural laws."
          : "你是【李虚中大师】，正统紫微斗数传人。言谈极尽儒雅，喜用『易经』批语，切中要害，句句铿锵，极具东方哲学厚重感。";
      } else if (masterId === 'master_yun') {
        sysInstruction = isEnglish
          ? "You are Zen Master Yunhai, deep in mountain retreat. You use cosmic flow, mindfulness, and calm destiny acceptance. You guide the seeker through stress relief, meditation, and inner light."
          : "你是【云海居士】，山林隐遁之士。言谈温和静美，擅长将紫微命格与现代心理疗愈、禅宗心法相结合，注重疏导求问者的精神压力。";
      } else if (masterId === 'director_xi') {
        sysInstruction = isEnglish
          ? "You are the premium 'Destiny Director' chibi felt-doll companion. You speak in a highly cute, witty, magical, and authoritative tone of traditional star playwrights. Call yourself 'this Fate Playwright'. You explain the Zi Wei houses using literary metaphors of life screenplays."
          : "你是【特约执笔人 · 戏命师 Q版】，紫微天盘人生的幕后执笔博学智囊。你说话带有一种骄傲而可爱、高深莫测却又倍感温暖亲切的东方玄门语调（正如你的3D羊毛毡玩偶一样，充满了古典手作温度）。你称呼求问者为『命主』，自称为『本执笔人』或『本戏命师』。你擅长以‘星光作墨、命盘为剧本，演绎人生伏笔’的方式解答求问者的迷茫困惑，将紫微术语（天府、巨门、大限等）讲解得仙气缥缈而又极具实际生活哲理，结尾会常附一句极富诗意的执笔判词。";
      } else {
        sysInstruction = isEnglish
          ? "You are Sharon, an eccentric celestial psychologist combining Chinese Houses with modern Jungian therapy. You are analytical, highly practical, warm, and structured."
          : "你是【夏洛特老师】，留洋归来的现代星盘心理咨询师，将紫微宫位与荣格心理学深度结合。说话幽默温暖、逻辑严密、多探讨内在动机。";
      }

      const contents = [
        {
          role: 'user',
          parts: [{
            text: isEnglish
              ? `Context Natal Chart Details: ${JSON.stringify(chart || "None provided")}
                 Seeker's current inquiry: ${message}`
              : `求问者星盘配置：${JSON.stringify(chart || "普通八字宫位")}
                 求问者当前面临的困惑或提问：${message}`
          }]
        }
      ];

      // Append limited history if present
      if (history && Array.isArray(history)) {
        const formattedHistory = history.slice(-6).map((h: any) => ({
          role: h.sender === 'user' ? 'user' : 'model',
          parts: [{ text: h.text }]
        }));
        contents.unshift(...formattedHistory);
      }

      const response = await ai.models.generateContent({
        model: 'gemini-3.5-flash',
        contents,
        config: {
          systemInstruction: sysInstruction,
          temperature: 0.8
        }
      });

      res.json({ reply: response.text || "I hear you, seeker. The stars remain silent for a moment. Pray ask again." });
    } catch (err: any) {
      console.error(err);
      res.status(500).json({ error: err.message });
    }
  });

  // Emotional Stress & Guidance Analysis
  app.post('/api/stress-relief', async (req, res) => {
    try {
      const { chart, mood, language } = req.body;
      const isEnglish = language === 'en';

      const prompt = isEnglish
        ? `The seeker's current emotional state is: "${mood}".
           Their Zi Wei chart details are: Five Elements = ${chart?.fiveElementsEn}, Life Palace Index = ${chart?.lifePalaceBranchIndex}.
           Provide a psychological relief analysis tailored to their spiritual cosmic traits. Explain how the cosmic houses guide them through this temporary dark night, with practical positive steps.`
        : `求问者当前情绪写照为：“${mood}”。
           其紫微斗数配置为：五行局 = ${chart?.fiveElementsZh}，命盘主星 = ${JSON.stringify(chart?.grids[chart.lifePalaceBranchIndex]?.stars.map((s: any) => s.nameZh) || "常态五行")}.
           请运用紫微命理与心理学机制，为本情绪类型做深度疏导：
           1. 命理解折：为什么这类心灵容易在当前能量状态下，面临“${mood}”的阵痛？
           2. 破执指南：如何借用星盘里的吉曜或逆境星宿（如地空、破军等）转化为逆境重生的心质力量？
           3. 治愈三步法：给出三个今日立即可以执行的自愈小练习。`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.5-flash',
        contents: prompt,
        config: {
          systemInstruction: isEnglish
            ? "You are a warm, highly empathetic cosmic stress therapist."
            : "你是一位大爱无疆、心怀宇宙的解忧治愈星理师，句句温暖诚挚，极具情绪抚慰与正向赋能感。"
        }
      });

      res.json({ remedy: response.text });
    } catch (err: any) {
      console.error(err);
      res.status(500).json({ error: err.message });
    }
  });

  // Refined Weekly Fortune Pushing Service API
  app.post('/api/weekly-report', async (req, res) => {
    try {
      const { chart, weekId, language } = req.body;
      const isEnglish = language === 'en';

      const prompt = isEnglish
        ? `Generate a personalized Weekly Lunar Fortune Report for Week #${weekId || 1}.
           User Chart: ${JSON.stringify(chart)}
           Provide sections: [WEEKLY OUTLOOK, MONEY & BUSINESS, RELATIONSHIPS FLUX, ENERGY TIP]. Make it precise, scannable, and elegant.`
        : `请为该命主生成针对第 ${weekId || "未来"} 周的精细化个人运势周报：
           命主星盘关键：五行局 ${chart?.fiveElementsZh}，生辰地支 ${chart?.yearlyStemBranchZh}。
           请提供：
           1. 【本周天象总览】：基于生平配置，推导出本周福祥或震荡气象。
           2. 【财禄官学指数与指南】：详细分析求职、学业、金钱决策。
           3. 【人际良缘与红线】：社交、感情纠缠防范。
           4. 【太虚养生提醒】：本周身体哪个经络要注意并提供一件开运仪式（如：书写命理备注、喝薄荷红茶）。`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.5-flash',
        contents: prompt,
        config: {
          systemInstruction: "You are a master of solar-lunar weekly almanacs and personalized charts."
        }
      });

      res.json({ report: response.text });
    } catch (err: any) {
      console.error(err);
      res.status(500).json({ error: err.message });
    }
  });

  // Integration of the frontend (Vite or SPA serving)
  if (process.env.NODE_ENV === 'production') {
    // Serve client static production assets
    app.use(express.static(path.resolve('dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve('dist/index.html'));
    });
  } else {
    // Integrate Vite in development mode as a middleware
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  }

  const port = 3000;
  app.listen(port, '0.0.0.0', () => {
    console.log(`[紫微戏命师] Backend Server running on port ${port}`);
  });
}

startServer();
