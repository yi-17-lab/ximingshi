import React, { useState, useEffect, useRef } from 'react';
import {
  Sparkles,
  User,
  LogOut,
  Download,
  Share2,
  Calendar,
  Globe,
  Plus,
  Compass,
  MessageSquare,
  BookOpen,
  Send,
  Lock,
  HeartHandshake,
  CheckCircle,
  HelpCircle,
  HelpCircle as HelpIcon,
  MessageCircle,
  Clock,
  MessageSquare as ChatIcon,
  Moon,
  Sun,
  ShieldCheck,
  Award
} from 'lucide-react';
import { collection, query, getDocs, addDoc, updateDoc, doc, setDoc, onSnapshot, orderBy, limit } from 'firebase/firestore';
import { onAuthStateChanged, User as FirebaseUser, signInAnonymously } from 'firebase/auth';
import { db, auth, signInWithGoogle, handleFirestoreError, OperationType } from './lib/firebase';
import { calculateZiWeiChart, getYearStemBranch, PalaceGrid, ZiWeiChart as IZiWeiChart } from './lib/ziwei';
import { DestinyDirectorCartoon } from './components/DestinyDirectorCartoon';
import { PartnerEarnCenter } from './components/PartnerEarnCenter';

interface Comment {
  id: string;
  chartId: string;
  content: string;
  createdAt: string;
}

interface ForumPost {
  id: string;
  userId: string;
  userName: string;
  title: string;
  content: string;
  likesCount: number;
  createdAt: any;
}

interface ChatMessage {
  sender: 'user' | 'bot';
  text: string;
  timestamp: string;
}

export default function App() {
  // Locale State: 'zh' (Chinese/Simpl.) vs 'en' (English)
  const [lang, setLang] = useState<'zh' | 'en'>('zh');

  // Multi-Language Strings
  const text = {
    zh: {
      title: "戏命师 · 紫微斗数",
      subTitle: "执笔写命，演绎人生剧本",
      inputSection: "命盘设立",
      nameLabel: "求测姓名",
      genderLabel: "性别",
      male: "乾造 (男)",
      female: "坤造 (女)",
      birthLabel: "公历生辰",
      hourLabel: "时辰",
      btnCalculate: "推算紫微天盘",
      btnExport: "个性化报告生成",
      btnCloudSync: "手机设备免密登录",
      btnLogout: "退出设备登录",
      synced: "📱 手机设备免密登录中",
      notSynced: "📱 建立设备登录中...",
      chartDetailTitle: "宫位详析 & 人生批注",
      notesPlaceholder: "记录以此宫位对照您人生重要节拍（如：2024年购房、感情婚姻波动），备注将自动保存在您的本地手机上，安全免密无需注册...",
      aiAnalysisBtn: "AI 紫薇命理大运解析",
      aiAnalyzing: "正在沟通北斗星宿，织绣宏大命书...",
      aiResultTitle: "紫曜极速命理大运书",
      tabStarMap: "紫微天盘",
      tabConsult: "1v1 高级模拟咨询",
      tabStress: "AI 情绪压力破执",
      tabForum: "命理研学社区",
      tabVip: "会员案例经阁",
      tabEarn: "🔑 戏命合伙人 (分享赚赏金)",
      weeklyTitle: "精细化流年运势周报推送",
      weeklyBtn: "生成本周推运周报",
      weeklyAnalyzing: "岁运流转，正在推演周度星轨占兆...",
      weeklyResult: "流年周报星谶",
      stressTitle: "基于AI的命格与压力共生分析",
      stressDesc: "紫微不仅能算命运，更是心灵宣泄口。告知我们您今日的情绪困惑，AI将结命盘的五行局，为您推演出独一无二的心灵救赎仪轨：",
      stressPlaceholder: "例如：最近工作变动太大，感觉心里很焦虑迷茫...",
      stressBtn: "星气化劫 & 智能疏导",
      forumTitle: "中华命理辩辩论道论坛",
      forumPostTitle: "发帖分享人生哲理 / 命理学习心得",
      forumTitlePl: "帖子主题...",
      forumContentPl: "阐述学理心得，结缘法友...",
      btnForumPost: "合印发布",
      vipTitle: "紫薇至尊阁 - 经典真实命理案例库",
      vipLocks: "升级 VIP 会员，立享全库深度解盘，特约咨询 7 折优惠",
      vipBtn: "模拟支付 ¥19.9 结缘升级",
      vipSuccess: "您已升级为尊贵至尊阁 VIP 成员",
      stars: "主辅众星",
      ageRange: "大限十年",
      fourTransform: "流年化星",
      selectGridTip: "【点击天盘中任意 12 宫，此栏目将即刻展开该宫位高维解析及个人运势备忘录】",
      paymentTitle: "解锁高级付费命理预测报告",
      paymentText: "本应用集成了 AI 计算阵，包含‘财官重器详解’、‘大限流年防范报告’、‘夫妻合婚姻劫’服务。",
      shareSuccess: "命盘链接已生成，可分享给好友探讨命盘！"
    },
    en: {
      title: "Destiny Director · Zi Wei",
      subTitle: "Writing destiny with stars, acting out your life script",
      inputSection: "Establish Chart",
      nameLabel: "Seeker Name",
      genderLabel: "Gender",
      male: "Male (Yang)",
      female: "Female (Yin)",
      birthLabel: "Solar Birthdate",
      hourLabel: "Birth Hour",
      btnCalculate: "Forecast Celestial Chart",
      btnExport: "Aesthetic Report Export",
      btnCloudSync: "Device Speed Login",
      btnLogout: "Exit Device Mode",
      synced: "📱 Mobile device logged in",
      notSynced: "📱 Linking device...",
      chartDetailTitle: "House Detail & Personal Notes",
      notesPlaceholder: "Record milestones related to this palace (e.g. 2024 college graduate, relocations). Notes are stored on your local phone/device, password-free & offline-safe...",
      aiAnalysisBtn: "AI Destiny & Decadal Insight",
      aiAnalyzing: "Whispering to the Northern Dipper Stars to write your epic report...",
      aiResultTitle: "AI Imperial Golden Destiny Book",
      tabStarMap: "Astrology Chart",
      tabConsult: "1v1 Master Lounge",
      tabStress: "AI Emotional Therapy",
      tabForum: "Wisdom Forum",
      tabVip: "Elite VIP Cases",
      tabEarn: "🔑 Partner & Earn",
      weeklyTitle: "A almanac-refined Weekly Fortune Push",
      weeklyBtn: "Compute My Weekly Almanac",
      weeklyAnalyzing: "Wheeling the cosmos. Running weekly calculations...",
      weeklyResult: "Weekly Astro Almanac Reading",
      stressTitle: "AI Coping & Astral Stress Release",
      stressDesc: "Zi Wei is not just a layout of luck, but a conduit for psychological wellness. Reveal your emotional trouble, and AI will balance your Five Elements to yield custom rituals:",
      stressPlaceholder: "E.g., Relocated to another city last week, feeling terribly unsettled and anxious...",
      stressBtn: "Alleviate Stress via Stars",
      forumTitle: "Astro-Wisdom Discourse Community",
      forumPostTitle: "Post New Philosophical / Astro Lesson",
      forumTitlePl: "Post title...",
      forumContentPl: "Explain code elements, share thoughts with friends...",
      btnForumPost: "Publish to Bulletin",
      vipTitle: "Elite Vault - Authentic Case Histories Database",
      vipLocks: "Unlock VIP membership for full access to study database + 30% discount on personalized consultation.",
      vipBtn: "Mocking checkout of ¥19.9 to unlock Eliteness",
      vipSuccess: "You are recognized as an Elite VIP Patron",
      stars: "Stars inside House",
      ageRange: "Decade Range",
      fourTransform: "Yearly transform",
      selectGridTip: "【Click on any of the 12 celestial houses layout to detailedly inspect that house's description & customize your notes】",
      paymentTitle: "Purchase Premium Predictive Astrological Reports",
      paymentText: "Unlock the advanced AI computational astrology reports for wealth targets, spouse matching blueprints and critical years warnings.",
      shareSuccess: "Chart link successfully copyable! Share with friends to discuss destiny!"
    }
  };

  const t = text[lang];

  // Application Domain State
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [isPremium, setIsPremium] = useState<boolean>(false);
  const [profileName, setProfileName] = useState<string>("");
  const [selectedTab, setSelectedTab] = useState<'map' | 'consult' | 'stress' | 'forum' | 'vip' | 'earn'>('map');

  // 戏命合伙人 (Affiliate Partner System) States
  const [partnerJoined, setPartnerJoined] = useState<boolean>(false);
  const [partnerReferralCode, setPartnerReferralCode] = useState<string>("");
  const [partnerClicks, setPartnerClicks] = useState<number>(12); // start with a small realistic touch
  const [partnerSignups, setPartnerSignups] = useState<number>(3);
  const [partnerUnlocks, setPartnerUnlocks] = useState<number>(1);
  const [partnerBalance, setPartnerBalance] = useState<number>(12.80); // some small initial incentive or demo balance
  const [partnerWithdrawn, setPartnerWithdrawn] = useState<number>(0.00);
  const [cashoutAmount, setCashoutAmount] = useState<string>("");
  const [cashoutAccount, setCashoutAccount] = useState<string>("");
  const [cashoutMethod, setCashoutMethod] = useState<'alipay' | 'wechat'>('alipay');
  const [cashoutMessage, setCashoutMessage] = useState<string>("");
  const [isPosterOpen, setIsPosterOpen] = useState<boolean>(false);
  const [partnerTier, setPartnerTier] = useState<'bronze' | 'silver' | 'gold'>('bronze');
  const [partnerTransactions, setPartnerTransactions] = useState<any[]>([
    { id: 1, label: "合伙人注册福利礼金", amount: 12.80, date: "2026-05-31", status: "已入账" }
  ]);

  // Input profile form
  const [name, setName] = useState<string>("李明 (Li Ming)");
  const [solarDate, setSolarDate] = useState<string>("1995-10-18");
  const [birthHour, setBirthHour] = useState<string>("子");
  const [gender, setGender] = useState<'male' | 'female'>('male');

  // Computed Chart Active State
  const [chart, setChart] = useState<IZiWeiChart | null>(null);
  const [selectedGridIdx, setSelectedGridIdx] = useState<number | null>(null);
  const [selectedDecade, setSelectedDecade] = useState<string>("Current Decadal Flow");

  // Fleeting fortune years calculation slider
  const [fleetingYear, setFleetingYear] = useState<number>(2026);

  // Notes state
  const [palaceNotes, setPalaceNotes] = useState<{ [gridIdx: number]: string }>({});

  // AI Output areas
  const [aiAnalysis, setAiAnalysis] = useState<string>("");
  const [aiAnalyzing, setAiAnalyzing] = useState<boolean>(false);

  // Weekly fortune
  const [weeklyReport, setWeeklyReport] = useState<string>("");
  const [weeklyAnalyzing, setWeeklyAnalyzing] = useState<boolean>(false);

  // Stress therapy state
  const [userStressText, setUserStressText] = useState<string>("");
  const [stressTherapyResult, setStressTherapyResult] = useState<string>("");
  const [stressAnalyzing, setStressAnalyzing] = useState<boolean>(false);

  // Forum collection state
  const [forumPosts, setForumPosts] = useState<ForumPost[]>([]);
  const [newPostTitle, setNewPostTitle] = useState<string>("");
  const [newPostContent, setNewPostContent] = useState<string>("");

  // Virtual Masters Lounge state
  const [selectedMaster, setSelectedMaster] = useState<'master_li' | 'master_yun' | 'master_sharon' | 'director_xi'>('director_xi');
  const [masterChats, setMasterChats] = useState<{ [masterId: string]: ChatMessage[] }>({
    director_xi: [
      { sender: 'bot', text: lang === 'zh' ? "命主在上，请受本执笔人一礼！吾乃紫微斗数天盘戏命师（Q版手工羊毛毡限定款，嘻嘻 ✨）。星光作墨、命盘为剧本，本执笔人已将您一生的起伏了然于胸。大限沉浮、流年运数、十二宫玄妙，本戏命师皆可落笔为您拆解，演绎属于您的璀璨戏局。且说，今日有何人生疑惑或命途关隘？" : "Greetings, Seeker! I am the supreme Destiny Director (3D Chibi Felt-Doll Edition, hehe ✨). Drawing from your celestial natal houses, I have all keylife scripts well aligned. Ask me anything about your 12 houses patterns, decadal transits, or fleeting blockages!", timestamp: "11:58" }
    ],
    master_li: [
      { sender: 'bot', text: "礼敬命主。老朽李虚中，研习紫微五行半载人生。君有何身家因果、官运财富之问？", timestamp: "11:58" }
    ],
    master_yun: [
      { sender: 'bot', text: "阿弥陀佛，贫僧云海。乾坤大化，苦乐皆在心相。告知贫僧你今日心中的挂碍处与负面压力，定助你于五行盘中找到归宿。", timestamp: "11:58" }
    ],
    master_sharon: [
      { sender: 'bot', text: "Hello there! I'm Sharon. Let's merge the elegant traditional Zi Wei charts with modern Jungian deep psychology to heal your life nodes.", timestamp: "11:58" }
    ]
  });
  const [chatInputValue, setChatInputValue] = useState<string>("");
  const [chatSending, setChatSending] = useState<boolean>(false);

  // Destiny Director Manual / Interactive Playground state
  const [isManualOpen, setIsManualOpen] = useState<boolean>(false);
  const [manualExpression, setManualExpression] = useState<'observing' | 'analyzing' | 'writing' | 'guiding'>('guiding');

  // Helper to retrieve or create a persistent unique local-only mobile ID
  const getOrCreateLocalDeviceUser = () => {
    let uId = localStorage.getItem('local_device_uid');
    if (!uId) {
      uId = 'device_' + Math.random().toString(36).substring(2, 15);
      localStorage.setItem('local_device_uid', uId);
    }
    return {
      uid: uId,
      displayName: lang === 'zh' ? '本地手机用户' : 'Local Mobile Seeker',
      isAnonymous: true,
      email: null
    };
  };

  // Initial calculation hook to display default chart and restore local notes
  useEffect(() => {
    const defaultChart = calculateZiWeiChart(name, solarDate, birthHour, gender);
    setChart(defaultChart);
    setSelectedGridIdx(defaultChart.lifePalaceBranchIndex);
    
    // Warm-up local notes from mobile storage immediately
    try {
      const localNotes: { [gridIdx: number]: string } = {};
      for (let i = 0; i < 12; i++) {
        const saved = localStorage.getItem(`local_note_${i}`);
        if (saved) {
          localNotes[i] = saved;
        }
      }
      setPalaceNotes(localNotes);

      // Warm up premium status from local storage
      const savedPremium = localStorage.getItem('local_is_premium');
      if (savedPremium === 'true') {
        setIsPremium(true);
      }

      // Generate or retrieve referral code & partner affiliation for viral earning
      let refCode = localStorage.getItem('local_referral_code');
      if (!refCode) {
        refCode = "PLAY-" + Math.floor(1000 + Math.random() * 9000);
        localStorage.setItem('local_referral_code', refCode);
      }
      setPartnerReferralCode(refCode);

      const savedPartnerJoined = localStorage.getItem('local_partner_joined');
      if (savedPartnerJoined === 'true') {
        setPartnerJoined(true);
      }
    } catch (e) {
      console.warn("Storage failed to load initial state:", e);
    }
  }, []);

  // Monitor Auth Changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setCurrentUser(user);
        // Load custom profile properties from database
        try {
          const userDocRef = doc(db, 'users', user.uid);
          onSnapshot(userDocRef, (snap) => {
            if (snap.exists()) {
              const data = snap.data();
              setIsPremium(data.isPremium || false);
              setProfileName(data.name || "");
            } else { 
              // Create user record inside database
              const initialName = user.displayName || (user.isAnonymous ? (lang === 'zh' ? '本地手机用户' : 'Local Mobile Seeker') : 'Unnamed seeker');
              setProfileName(initialName);
              setDoc(userDocRef, {
                uid: user.uid,
                name: initialName,
                email: user.email || '',
                isPremium: false,
                createdAt: new Date().toISOString()
              });
            }
          });
          
          // Load existing saved charts / notes for this user
          const chartsQuery = query(collection(db, 'users', user.uid, 'charts'));
          onSnapshot(chartsQuery, (querySnapshot) => {
            const notesObj: { [gridIdx: number]: string } = {};
            querySnapshot.forEach((doc) => {
              const chartData = doc.data();
              if (chartData.notes && chartData.gridIndex !== undefined) {
                notesObj[chartData.gridIndex] = chartData.notes;
              }
            });
            setPalaceNotes(prev => ({ ...prev, ...notesObj }));
          });
        } catch (err) {
          console.error("Failed loading synced user info: ", err);
        }
      } else {
        // Fallback to local device virtual user configuration
        const localDevUser = getOrCreateLocalDeviceUser();
        setCurrentUser(localDevUser);
        setProfileName(localDevUser.displayName);
        
        // Load localized premium status
        const savedPremium = localStorage.getItem('local_is_premium');
        setIsPremium(savedPremium === 'true');

        // Trigger auto-login with phone/device anonymously for zero-barrier session config
        try {
          await signInAnonymously(auth);
        } catch (e: any) {
          // Gracefully log warning instead of throwing unhandled error if anonymous provider is administratively restricted or disabled
          console.warn("Frictionless cloud device login restricted, continuing with secure local device profile:", e.message || e);
        }
      }
    });
    return () => unsubscribe();
  }, [lang]);

  // Monitor forum updates
  useEffect(() => {
    try {
      const q = query(collection(db, 'forum_posts'), orderBy('createdAt', 'desc'), limit(15));
      const unsubscribe = onSnapshot(q, (snapshot) => {
        const postsList: ForumPost[] = [];
        snapshot.forEach((doc) => {
          const d = doc.data();
          postsList.push({
            id: doc.id,
            userId: d.userId,
            userName: d.userName,
            title: d.title,
            content: d.content,
            likesCount: d.likesCount || 0,
            createdAt: d.createdAt
          });
        });
        setForumPosts(postsList);
      }, (err) => {
        handleFirestoreError(err, OperationType.LIST, 'forum_posts');
      });
      return () => unsubscribe();
    } catch (e) {
      console.error(e);
    }
  }, []);

  // Core trigger for new calculation
  const handleRecalculate = () => {
    const computed = calculateZiWeiChart(name, solarDate, birthHour, gender);
    setChart(computed);
    setSelectedGridIdx(computed.lifePalaceBranchIndex);
    // Clear notes when recalculating on client side to load new ones
    setPalaceNotes({});
    setAiAnalysis("");
    setWeeklyReport("");
  };

  // Device/Local Authentication trigger for zero-barrier setup and sign-out
  const handleAuth = async () => {
    if (currentUser && !currentUser.uid.startsWith('device_')) {
      await auth.signOut();
    } else {
      try {
        await signInAnonymously(auth);
      } catch (err: any) {
        console.warn("Frictionless cloud device login restricted, continuing with secure local device profile.", err.message || err);
      }
    }
  };

  // Save specific note (Backing up to local storage or Cloud Firestore)
  const savePalaceNote = async (gridIndex: number, textContent: string) => {
    setPalaceNotes(prev => ({ ...prev, [gridIndex]: textContent }));
    const docId = `grid_${gridIndex}`;

    // Always keep records on the local device storage
    try {
      localStorage.setItem(`local_note_${gridIndex}`, textContent);
    } catch (e) {
      console.warn("localStorage write failed:", e);
    }

    if (currentUser && !currentUser.uid.startsWith('device_')) {
      try {
        await setDoc(doc(db, 'users', currentUser.uid, 'charts', docId), {
          id: docId,
          userId: currentUser.uid,
          gridIndex,
          name: chart?.name || name,
          gender: chart?.genderZh || gender,
          solarDate: chart?.solarDate || solarDate,
          lunarDate: chart?.lunarDate || "",
          birthHour: chart?.birthHourZh || birthHour,
          notes: textContent,
          createdAt: new Date().toISOString()
        });
      } catch (err) {
        handleFirestoreError(err, OperationType.CREATE, `users/${currentUser.uid}/charts/${docId}`);
      }
    }
  };

  // Invoke Gemini Core for natal reading analysis
  const handleGenerateAiAnalysis = async () => {
    if (!chart) return;
    setAiAnalyzing(true);
    setAiAnalysis("");
    try {
      const response = await fetch('/api/ziwei-ai-analysis', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chart, language: lang })
      });
      const data = await response.json();
      if (data.analysis) {
        setAiAnalysis(data.analysis);
      } else {
        setAiAnalysis(data.error || "An astronomical anomaly occurred. Try again.");
      }
    } catch (err: any) {
      console.error(err);
      setAiAnalysis("Network connection interrupted during forecast: " + err.message);
    } finally {
      setAiAnalyzing(false);
    }
  };

  // Weekly prophecy generator
  const handleWeeklyProphecy = async () => {
    if (!chart) return;
    setWeeklyAnalyzing(true);
    try {
      const resp = await fetch('/api/weekly-report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chart, weekId: 23, language: lang })
      });
      const data = await resp.json();
      setWeeklyReport(data.report || "Stars coordinates missing. Resetting tracking.");
    } catch (err: any) {
      console.error(err);
      setWeeklyReport("Failed generating week push: " + err.message);
    } finally {
      setWeeklyAnalyzing(false);
    }
  };

  // AI Stress Release therapy invoke
  const handleStressAlleviate = async () => {
    if (!userStressText.trim()) return;
    setStressAnalyzing(true);
    try {
      const resp = await fetch('/api/stress-relief', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chart, mood: userStressText, language: lang })
      });
      const data = await resp.json();
      setStressTherapyResult(data.reremedy || data.remedy || "Therapeutic stars aligning. Retry.");
    } catch (err) {
      console.error(err);
      setStressTherapyResult("Could not process elements balance. Retry.");
    } finally {
      setStressAnalyzing(false);
    }
  };

  // Create forum post
  const handleCreateForumPost = async () => {
    if (!newPostTitle.trim() || !newPostContent.trim()) return;
    if (!currentUser || currentUser.uid.startsWith('device_')) {
      alert(lang === 'zh' 
        ? "📱 手机端免注册体验模式下无法向论坛发表公共帖子。若要与同参道友互动，请使用谷歌账号等云端登录！" 
        : "📱 Public forum posts are locked in local device mode. Sync via verified cloud account to engage with peers!");
      return;
    }
    try {
      const payload = {
        title: newPostTitle,
        content: newPostContent,
        userId: currentUser?.uid || 'anonymous_seeker',
        userName: profileName || currentUser?.displayName || (lang === 'zh' ? '本地手机用户' : 'Local Mobile Seeker'),
        likesCount: 0,
        createdAt: new Date().toISOString()
      };
      await addDoc(collection(db, 'forum_posts'), payload);
      setNewPostTitle("");
      setNewPostContent("");
    } catch (err) {
      try {
        handleFirestoreError(err, OperationType.CREATE, 'forum_posts');
      } catch (e: any) {
        alert("Firestore Post Error: Make sure you are signed in to publish posts!");
      }
    }
  };

  // Like a post
  const handleLikePost = async (pId: string, currentLikes: number) => {
    if (!currentUser || currentUser.uid.startsWith('device_')) {
      alert(lang === 'zh' ? "请开启云端登录同步后为同参道友的心得点赞！" : "Verify cloud sync to like postings!");
      return;
    }
    try {
      const docRef = doc(db, 'forum_posts', pId);
      await updateDoc(docRef, { likesCount: currentLikes + 1 });
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `forum_posts/${pId}`);
    }
  };

  // Payment mock
  const triggerUpgradeVip = async () => {
    if (!currentUser) {
      alert(lang === 'zh' ? "请先登录账户以实现云端案例库永久授权及VIP特权绑定！" : "Please log in first to tie extreme VIP privileges.");
      return;
    }
    
    if (currentUser.uid.startsWith('device_')) {
      // Allow seamless virtual premium upgrade saved under local device space
      setIsPremium(true);
      try {
        localStorage.setItem('local_is_premium', 'true');
      } catch (e) {}
      alert(lang === 'zh' 
        ? "恭喜！物理手机端极速升级模拟成功！已开通本设备至尊端极速终生特权（保存在此硬件中）！" 
        : "Brilliant! Desktop/Mobile simulation successful! Lifetime full VIP status activated on this device!");
      return;
    }

    // Simulate real database update for logged-in Firebase users
    try {
      const userDocRef = doc(db, 'users', currentUser.uid);
      await updateDoc(userDocRef, { isPremium: true });
      setIsPremium(true);
      alert(lang === 'zh' ? "支付结缘模拟成功！已升级至尊阁极速终生命理特权！" : "Checkout Simulated successfully! VIP privileges granted.");
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `users/${currentUser.uid}`);
    }
  };

  // Active virtual master chat submission
  const handleSendMasterChat = async () => {
    if (!chatInputValue.trim()) return;
    const currentMsg = chatInputValue;
    setChatInputValue("");
    
    const userMsgObj: ChatMessage = { sender: 'user', text: currentMsg, timestamp: new Date().toLocaleTimeString().slice(0, 5) };
    setMasterChats(prev => ({
      ...prev,
      [selectedMaster]: [...prev[selectedMaster], userMsgObj]
    }));

    setChatSending(true);
    try {
      const response = await fetch('/api/consult-master', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          masterId: selectedMaster,
          message: currentMsg,
          history: masterChats[selectedMaster],
          chart,
          language: lang
        })
      });
      const data = await response.json();
      const botMsgObj: ChatMessage = { sender: 'bot', text: data.reply, timestamp: new Date().toLocaleTimeString().slice(0, 5) };
      setMasterChats(prev => ({
        ...prev,
        [selectedMaster]: [...prev[selectedMaster], botMsgObj]
      }));
    } catch (err: any) {
      console.error(err);
      const botErrObj: ChatMessage = { sender: 'bot', text: "天机蒙蔽，通信不畅，请重整阵法再度提问。", timestamp: new Date().toLocaleTimeString().slice(0, 5) };
      setMasterChats(prev => ({
        ...prev,
        [selectedMaster]: [...prev[selectedMaster], botErrObj]
      }));
    } finally {
      setChatSending(false);
    }
  };

  // Multi-dimensional print export
  const handleExportPrint = () => {
    window.print();
  };

  // Share link copy
  const handleShareLink = () => {
    const mockUrl = `${window.location.origin}/?name=${encodeURIComponent(name)}&dob=${solarDate}&hour=${encodeURIComponent(birthHour)}&gender=${gender}`;
    navigator.clipboard.writeText(mockUrl);
    alert(t.shareSuccess);
  };

  // Decadal Fortune Ranges label calculation
  const getDecadeRangesOfSelectedPalace = (gridIdx: number) => {
    if (!chart) return "";
    const grid = chart.grids[gridIdx];
    return `${grid.decadeStart} - ${grid.decadeEnd}`;
  };

  // Selected Palace grid details render
  const selectedPalaceGrid = chart && selectedGridIdx !== null ? chart.grids[selectedGridIdx] : null;

  return (
    <div className="min-h-screen bg-[#070b12] text-[#e0e6f2] font-sans selection:bg-[#c084fc] selection:text-[#0c0f1a] print:bg-white print:text-black">
      
      {/* HEADER SECTION */}
      <header className="border-b border-[#1e293b]/60 bg-[#0c1424] px-4 py-3 sticky top-0 z-50 shadow-md backdrop-blur-md">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-gradient-to-tr from-[#9333ea] via-[#c084fc] to-[#e9d5ff] flex items-center justify-center shadow-lg shadow-purple-500/20">
              <Compass className="h-6 w-6 text-[#070b12] animate-spin" style={{ animationDuration: '40s' }} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl md:text-2xl font-bold tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 via-pink-400 to-[#c084fc]">
                  {t.title}
                </h1>
                <span className="text-[10px] bg-red-950 border border-red-800 text-red-400 px-1.5 py-0.5 rounded uppercase tracking-widest font-mono">
                  Beta v3.5
                </span>
                {isPremium && (
                  <span className="text-[10px] bg-yellow-950 border border-yellow-600 text-yellow-400 px-1.5 py-0.5 rounded font-mono font-bold flex items-center gap-1">
                    <Award className="h-3 w-3" /> VIP
                  </span>
                )}
              </div>
              <p className="text-xs text-[#94a3b8]">{t.subTitle}</p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            
            {/* Lang toggler */}
            <button
              onClick={() => setLang(l => l === 'zh' ? 'en' : 'zh')}
              className="flex items-center gap-1.5 text-xs bg-[#1e293b] hover:bg-[#334155] text-[#cbd5e1] px-3 py-1.5 rounded-lg border border-[#334155] transition-colors"
            >
              <Globe className="h-3.5 w-3.5" />
              <span>{lang === 'zh' ? 'English' : '简体中文'}</span>
            </button>

            {/* Cloud Sync State */}
            {currentUser ? (
              <div className="flex items-center gap-2 bg-[#0d2a1f] border border-[#065f46] px-3 py-1.5 rounded-lg text-emerald-400 text-xs">
                <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
                <span>{t.synced}</span>
              </div>
            ) : (
              <div className="flex items-center gap-2 bg-[#1e293b] border border-[#334155] px-3 py-1.5 rounded-lg text-[#94a3b8] text-xs">
                <span className="h-2 w-2 rounded-full bg-gray-500"></span>
                <span>{t.notSynced}</span>
              </div>
            )}

            {/* login component */}
            <button
              onClick={handleAuth}
              className="flex items-center gap-2 text-xs bg-[#c084fc]/10 hover:bg-[#c084fc]/20 text-[#c084fc] px-4 py-1.5 rounded-lg border border-[#c084fc]/40 transition-all font-semibold"
            >
              <User className="h-3.5 w-3.5" />
              <span>{currentUser ? `${profileName || currentUser.displayName || (currentUser.isAnonymous ? (lang === 'zh' ? '本地手机用户' : 'Local Mobile Seeker') : 'Seeker')} (${t.btnLogout})` : t.btnCloudSync}</span>
            </button>
          </div>
        </div>
      </header>

      {/* WORKSPACE & LAYOUT */}
      <main className="max-w-7xl mx-auto p-4 flex flex-col lg:flex-row gap-6 relative">
        
        {/* VIEW COLUMN 1: CONTROLS & FORMS (Left static layout) */}
        <section className="w-full lg:w-1/4 flex flex-col gap-6 print:hidden">
          
          {/* Chart inputs container */}
          <div className="bg-[#0f172a]/95 border-2 border-purple-950/40 p-5 rounded-2xl shadow-xl space-y-4 border-felt-stitching felt-texture">
            <h2 className="text-sm font-bold tracking-widest text-[#a855f7] border-b border-purple-500/10 pb-2 uppercase font-calligraphy flex items-center gap-2">
              <Compass className="h-4 w-4" style={{ animationDuration: '25s' }} /> {t.inputSection}
            </h2>

            <div className="space-y-3 text-xs">
              
              <div>
                <label className="block text-[#94a3b8] mb-1 font-medium">{t.nameLabel}</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-[#0a0f1d] border border-[#1e293b] rounded-lg px-3 py-2 text-white focus:outline-none focus:border-[#a855f7] transition-all"
                />
              </div>

              <div>
                <label className="block text-[#94a3b8] mb-1 font-medium">{t.genderLabel}</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => setGender('male')}
                    className={`py-2 rounded-lg border text-center transition-all ${
                      gender === 'male'
                        ? 'border-[#a855f7] bg-[#a855f7]/10 text-white'
                        : 'border-[#1e293b] bg-[#0a0f1d] text-[#64748b] hover:text-[#e2e8f0]'
                    }`}
                  >
                    {t.male}
                  </button>
                  <button
                    onClick={() => setGender('female')}
                    className={`py-2 rounded-lg border text-center transition-all ${
                      gender === 'female'
                        ? 'border-[#a855f7] bg-[#a855f7]/10 text-white'
                        : 'border-[#1e293b] bg-[#0a0f1d] text-[#64748b] hover:text-[#e2e8f0]'
                    }`}
                  >
                    {t.female}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-[#94a3b8] mb-1 font-medium">{t.birthLabel}</label>
                <input
                  type="date"
                  value={solarDate}
                  onChange={(e) => setSolarDate(e.target.value)}
                  className="w-full bg-[#0a0f1d] border border-[#1e293b] rounded-lg px-3 py-2 text-white focus:outline-none focus:border-[#a855f7] transition-all"
                />
              </div>

              <div>
                <label className="block text-[#94a3b8] mb-1 font-medium">{t.hourLabel}</label>
                <select
                  value={birthHour}
                  onChange={(e) => setBirthHour(e.target.value)}
                  className="w-full bg-[#0a0f1d] border border-[#1e293b] rounded-lg px-3 py-2 text-white focus:outline-none focus:border-[#a855f7] transition-all"
                >
                  <option value="子">子时 (23:00-01:00)</option>
                  <option value="丑">丑时 (01:00-03:00)</option>
                  <option value="寅">寅时 (03:00-05:00)</option>
                  <option value="卯">卯时 (05:00-07:00)</option>
                  <option value="辰">辰时 (07:00-09:00)</option>
                  <option value="巳">巳时 (09:00-11:00)</option>
                  <option value="午">午时 (11:00-13:00)</option>
                  <option value="未">未时 (13:00-15:00)</option>
                  <option value="申">申时 (15:00-17:00)</option>
                  <option value="酉">酉时 (17:00-19:00)</option>
                  <option value="戌">戌时 (19:00-21:00)</option>
                  <option value="亥">亥时 (21:00-23:00)</option>
                </select>
              </div>

            </div>

            <button
              onClick={handleRecalculate}
              className="w-full bg-gradient-to-r from-[#7c3aed] to-[#a855f7] hover:from-[#6d28d9] hover:to-[#9333ea] text-white py-2.5 rounded-lg text-xs font-semibold shadow-lg shadow-purple-950/40 transition-all flex items-center justify-center gap-2"
            >
              <Compass className="h-4 w-4 animate-spin-slow" />
              <span>{t.btnCalculate}</span>
            </button>

            <div className="flex gap-2 text-xs pt-1">
              <button
                onClick={handleShareLink}
                className="flex-1 bg-[#1e293b] hover:bg-[#334155] text-white py-2 rounded-lg text-center font-medium transition-colors border border-[#334155] flex items-center justify-center gap-1"
              >
                <Share2 className="h-3 w-3" /> Discuss
              </button>
              <button
                onClick={handleExportPrint}
                className="flex-1 bg-[#1e293b] hover:bg-[#334155] text-white py-2 rounded-lg text-center font-medium transition-colors border border-[#334155] flex items-center justify-center gap-1"
              >
                <Download className="h-3 w-3" /> Export
              </button>
            </div>
          </div>

          {/* Decadal / fleeting fortune dynamic timeline sliders */}
          <div className="bg-[#0f172a]/95 border-2 border-purple-950/40 p-5 rounded-2xl shadow-xl space-y-3 border-felt-stitching felt-texture">
            <h3 className="text-xs font-bold uppercase tracking-widest text-[#a855f7] flex items-center gap-1.5 font-calligraphy">
              <Calendar className="h-3.5 w-3.5" />
              <span>{lang === 'zh' ? '流年运势大运推算' : 'Annals Temporal Flux'}</span>
            </h3>

            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-[11px] mb-1">
                  <span className="text-[#94a3b8]">{lang === 'zh' ? '推演特定流年' : 'Specific Fleeting Year'}:</span>
                  <span className="text-yellow-400 font-bold font-mono">{fleetingYear} 年</span>
                </div>
                <input
                  type="range"
                  min="2024"
                  max="2035"
                  value={fleetingYear}
                  onChange={(e) => setFleetingYear(parseInt(e.target.value))}
                  className="w-full accent-purple-500 h-1 bg-[#0a0f1d] rounded-lg appearance-none cursor-pointer"
                />
                <div className="flex justify-between text-[9px] text-[#64748b] mt-1 font-mono">
                  <span>2024 (甲辰)</span>
                  <span>2029 (己酉)</span>
                  <span>2035 (乙卯)</span>
                </div>
              </div>

              <div className="bg-[#0a0f1d] border border-[#1e293b] p-2.5 rounded-lg text-[11px] text-[#94a3b8]">
                <p className="text-xs text-yellow-500 font-semibold mb-1 flex items-center gap-1">
                  <Clock className="h-3.5 w-3.5" />
                  {fleetingYear} {lang === 'zh' ? '流年天干地支' : 'Celestial Year-Pillar'} : {getYearStemBranch(fleetingYear).zh} ({getYearStemBranch(fleetingYear).en})
                </p>
                <p className="leading-relaxed">
                  {lang === 'zh'
                    ? `此年份运势焦点移入 ${chart ? chart.grids[(fleetingYear % 12 + 6) % 12].palaceZh : "流年"}，四化引动核心力量运转。`
                    : `Focus shifts into ${chart ? chart.grids[(fleetingYear % 12 + 6) % 12].palaceEn : "Yearly House"} according to year-branches.`}
                </p>
              </div>
            </div>
          </div>

          {/* Quick instructions or traditional references */}
          <div className="bg-gradient-to-br from-[#0c1424] to-[#0f172a] border border-blue-950/60 p-5 rounded-xl text-xs space-y-2.5">
            <h4 className="font-semibold text-sky-400 flex items-center gap-1">
              <Sparkles className="h-3.5 w-3.5" />
              <span>{lang === 'zh' ? '中华命理提示库' : 'Destiny Rulebook'}</span>
            </h4>
            <p className="text-[#94a3b8] leading-relaxed">
              {lang === 'zh'
                ? "紫微十二宫环状排列代表十二个星系空域。通过顺时针与逆时针的轮动，命格、大限十载、流年一岁的三重盘叠交在一起，展示人生命运沉浮。"
                : "The Ring of 12 Houses depicts 12 sectors of space. Triple alignments of Life, Decadal Flows, and Fleeting fortunes define human destiny orbits."}
            </p>
          </div>

        </section>

        {/* CONTROLLER SECTION FOR TABS */}
        <section className="w-full lg:w-3/4 flex flex-col gap-6">

          {/* Tab switches */}
          <div className="flex border-b border-[#1e293b] bg-[#0c1424]/90 p-1 rounded-xl gap-1 overflow-x-auto select-none print:hidden">
            <button
              onClick={() => setSelectedTab('map')}
              className={`flex items-center gap-2 px-4 py-2.5 text-xs font-semibold rounded-lg transition-all whitespace-nowrap ${
                selectedTab === 'map'
                  ? 'bg-gradient-to-r from-purple-950 to-indigo-950 text-white shadow-md shadow-purple-500/10 border-b border-[#a855f7]'
                  : 'text-[#94a3b8] hover:text-[#cbd5e1] hover:bg-[#1e293b]/40'
              }`}
            >
              <Compass className="h-4 w-4" />
              <span>{t.tabStarMap}</span>
            </button>
            <button
              onClick={() => setSelectedTab('consult')}
              className={`flex items-center gap-2 px-4 py-2.5 text-xs font-semibold rounded-lg transition-all whitespace-nowrap ${
                selectedTab === 'consult'
                  ? 'bg-gradient-to-r from-purple-950 to-indigo-950 text-white shadow-md shadow-purple-500/10 border-b border-[#a855f7]'
                  : 'text-[#94a3b8] hover:text-[#cbd5e1] hover:bg-[#1e293b]/40'
              }`}
            >
              <MessageSquare className="h-4 w-4" />
              <span>{t.tabConsult}</span>
            </button>
            <button
              onClick={() => setSelectedTab('stress')}
              className={`flex items-center gap-2 px-4 py-2.5 text-xs font-semibold rounded-lg transition-all whitespace-nowrap ${
                selectedTab === 'stress'
                  ? 'bg-gradient-to-r from-purple-950 to-indigo-950 text-white shadow-md shadow-purple-500/10 border-b border-[#a855f7]'
                  : 'text-[#94a3b8] hover:text-[#cbd5e1] hover:bg-[#1e293b]/40'
              }`}
            >
              <HeartHandshake className="h-4 w-4" />
              <span>{t.tabStress}</span>
            </button>
            <button
              onClick={() => setSelectedTab('forum')}
              className={`flex items-center gap-2 px-4 py-2.5 text-xs font-semibold rounded-lg transition-all whitespace-nowrap ${
                selectedTab === 'forum'
                  ? 'bg-gradient-to-r from-purple-950 to-indigo-950 text-white shadow-md shadow-purple-500/10 border-b border-[#a855f7]'
                  : 'text-[#94a3b8] hover:text-[#cbd5e1] hover:bg-[#1e293b]/40'
              }`}
            >
              <Globe className="h-4 w-4" />
              <span>{t.tabForum}</span>
            </button>
            <button
              onClick={() => setSelectedTab('vip')}
              className={`flex items-center gap-2 px-4 py-2.5 text-xs font-semibold rounded-lg transition-all whitespace-nowrap ${
                selectedTab === 'vip'
                  ? 'bg-gradient-to-r from-purple-950 to-indigo-950 text-white shadow-md shadow-purple-500/10 border-b border-[#a855f7]'
                  : 'text-[#94a3b8] hover:text-[#cbd5e1] hover:bg-[#1e293b]/40'
              }`}
            >
              <BookOpen className="h-4 w-4" />
              <span>{t.tabVip}</span>
            </button>
            <button
              onClick={() => setSelectedTab('earn')}
              className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold rounded-lg transition-all whitespace-nowrap border ${
                selectedTab === 'earn'
                  ? 'bg-gradient-to-r from-amber-950 to-yellow-950 text-yellow-300 shadow-md shadow-yellow-500/15 border-yellow-500'
                  : 'bg-yellow-950/10 text-yellow-400 border-yellow-500/20 hover:text-yellow-200 hover:bg-yellow-950/30'
              } relative`}
            >
              <Award className="h-4 w-4 text-yellow-400" />
              <span>{t.tabEarn}</span>
              <span className="absolute -top-1 -right-0.5 flex h-1.5 w-1.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-red-500"></span>
              </span>
            </button>
          </div>

          {/* TAB CONTENT 1: TRADITIONAL ZI WEI STAR GRID MAP */}
          {selectedTab === 'map' && chart && (
            <div className="space-y-6">
              
              {/* Essential elements overview */}
              <div className="bg-[#0b1324] border border-[#1e293b] p-4 rounded-xl flex flex-wrap md:flex-nowrap justify-between items-center gap-4 text-xs">
                <div className="flex flex-wrap gap-4">
                  <div>
                    <span className="text-[#94a3b8] block">{lang === 'zh' ? '求测贵人' : 'Astral Seeker'}</span>
                    <strong className="text-yellow-400 font-medium text-sm">{chart.name}</strong>
                  </div>
                  <div>
                    <span className="text-[#94a3b8] block">{lang === 'zh' ? '性别' : 'Gender'}</span>
                    <strong className="text-white font-medium text-sm">{lang === 'zh' ? chart.genderZh : chart.genderEn}</strong>
                  </div>
                  <div>
                    <span className="text-[#94a3b8] block">{lang === 'zh' ? '公历出生' : 'Gregorian Birth'}</span>
                    <strong className="text-white font-medium text-sm font-mono">{chart.solarDate}</strong>
                  </div>
                  <div>
                    <span className="text-[#94a3b8] block">{lang === 'zh' ? '时辰' : 'Hour'}</span>
                    <strong className="text-white font-medium text-sm">{lang === 'zh' ? chart.birthHourZh : chart.birthHourEn}</strong>
                  </div>
                  <div>
                    <span className="text-[#94a3b8] block">{lang === 'zh' ? '运局' : 'Cosmic Phase'}</span>
                    <strong className="text-fuchsia-400 font-medium text-sm">{lang === 'zh' ? chart.fiveElementsZh : chart.fiveElementsEn}</strong>
                  </div>
                </div>
                <div className="bg-[#1e1b4b] border border-[#312e81] px-3 py-1.5 rounded text-fuchsia-300 font-mono scale-95 uppercase tracking-wide">
                  {lang === 'zh' ? `农历日期：${chart.lunarDate}` : `Lunar Calendar Equivalent`}
                </div>
              </div>

              {/* AUTHENTIC DUAL CHINESE TRADITIONAL 4x4 GRID LAYOUT */}
              <div className="grid grid-cols-4 grid-rows-4 gap-2 bg-[#090f1d] p-3 rounded-2xl border border-double border-[#3b0764]/40 shadow-inner">
                
                {/* GRID 0: 巳 (Top Left) */}
                <div
                  onClick={() => setSelectedGridIdx(5)}
                  className={`border p-2.5 rounded-lg text-xs cursor-pointer min-h-[105px] flex flex-col justify-between transition-all select-none hover:border-[#a855f7] ${
                    selectedGridIdx === 5
                      ? 'bg-purple-950/20 border-[#c084fc] shadow-lg shadow-purple-500/10'
                      : ((fleetingYear - 4) % 12) === 5
                      ? 'bg-[#1b121e] border-red-500/70 ring-1 ring-red-500/30'
                      : 'bg-[#111827]/70 border-[#1f2937]/70'
                  }`}
                >
                  <div className="flex justify-between items-start gap-1">
                    <span className="text-[10px] text-fuchsia-400/90 font-mono font-bold uppercase">{chart.grids[5].stemZh}{chart.grids[5].branchZh}</span>
                    <span className="text-yellow-400 text-xs font-semibold px-1 rounded bg-[#3b0764]/20 border border-[#c084fc]/10 flex items-center gap-1">
                      <span>{lang === 'zh' ? chart.grids[5].palaceZh : chart.grids[5].palaceEn}</span>
                      {((fleetingYear - 4) % 12) === 5 && (
                        <span className="text-[8px] bg-red-950 border border-red-800 text-red-400 px-0.5 rounded font-sans leading-none font-bold">流</span>
                      )}
                    </span>
                  </div>
                  <div className="my-1 text-[11px] flex flex-wrap gap-1">
                    {chart.grids[5].stars.map((star, idx) => (
                      <span key={idx} className={`px-1 py-0.5 rounded text-[10px] ${star.type === 'major' ? 'text-red-400 font-bold bg-red-950/20' : star.type === 'lucky' ? 'text-emerald-400' : 'text-[#94a3b8]'}`}>
                        {lang === 'zh' ? star.nameZh : star.nameEn.split(' ')[0]}<span className="text-[8px] text-yellow-500/80">({star.levelZh})</span>
                      </span>
                    ))}
                  </div>
                  <div className="flex justify-between text-[9px] text-[#475569] font-mono mt-0.5">
                    <span>{getDecadeRangesOfSelectedPalace(5)} {lang === 'zh' ? '岁' : 'y/o'} </span>
                    {chart.grids[5].yearlyFourStarsZh.length > 0 && (
                      <span className="text-pink-400 font-bold">{chart.grids[5].yearlyFourStarsZh.join('')}</span>
                    )}
                  </div>
                </div>

                {/* GRID 1: 午 (Top Row Middle Left) */}
                <div
                  onClick={() => setSelectedGridIdx(6)}
                  className={`border p-2.5 rounded-lg text-xs cursor-pointer min-h-[105px] flex flex-col justify-between transition-all select-none hover:border-[#a855f7] ${
                    selectedGridIdx === 6
                      ? 'bg-purple-950/20 border-[#c084fc] shadow-lg shadow-purple-500/10'
                      : ((fleetingYear - 4) % 12) === 6
                      ? 'bg-[#1b121e] border-red-500/70 ring-1 ring-red-500/30'
                      : 'bg-[#111827]/70 border-[#1f2937]/70'
                  }`}
                >
                  <div className="flex justify-between items-start gap-1">
                    <span className="text-[10px] text-fuchsia-400/90 font-mono font-bold uppercase">{chart.grids[6].stemZh}{chart.grids[6].branchZh}</span>
                    <span className="text-yellow-400 text-xs font-semibold px-1 rounded bg-[#3b0764]/20 border border-[#c084fc]/10 flex items-center gap-1">
                      <span>{lang === 'zh' ? chart.grids[6].palaceZh : chart.grids[6].palaceEn}</span>
                      {((fleetingYear - 4) % 12) === 6 && (
                        <span className="text-[8px] bg-red-950 border border-red-800 text-red-400 px-0.5 rounded font-sans leading-none font-bold">流</span>
                      )}
                    </span>
                  </div>
                  <div className="my-1 text-[11px] flex flex-wrap gap-1">
                    {chart.grids[6].stars.map((star, idx) => (
                      <span key={idx} className={`px-1 py-0.5 rounded text-[10px] ${star.type === 'major' ? 'text-red-400 font-bold bg-red-950/20' : star.type === 'lucky' ? 'text-emerald-400' : 'text-[#94a3b8]'}`}>
                        {lang === 'zh' ? star.nameZh : star.nameEn.split(' ')[0]}<span className="text-[8px] text-yellow-500/80">({star.levelZh})</span>
                      </span>
                    ))}
                  </div>
                  <div className="flex justify-between text-[9px] text-[#475569] font-mono mt-0.5">
                    <span>{getDecadeRangesOfSelectedPalace(6)} {lang === 'zh' ? '岁' : 'y/o'} </span>
                    {chart.grids[6].yearlyFourStarsZh.length > 0 && (
                      <span className="text-pink-400 font-bold">{chart.grids[6].yearlyFourStarsZh.join('')}</span>
                    )}
                  </div>
                </div>

                {/* GRID 2: 未 (Top Row Middle Right) */}
                <div
                  onClick={() => setSelectedGridIdx(7)}
                  className={`border p-2.5 rounded-lg text-xs cursor-pointer min-h-[105px] flex flex-col justify-between transition-all select-none hover:border-[#a855f7] ${
                    selectedGridIdx === 7
                      ? 'bg-purple-950/20 border-[#c084fc] shadow-lg shadow-purple-500/10'
                      : ((fleetingYear - 4) % 12) === 7
                      ? 'bg-[#1b121e] border-red-500/70 ring-1 ring-red-500/30'
                      : 'bg-[#111827]/70 border-[#1f2937]/70'
                  }`}
                >
                  <div className="flex justify-between items-start gap-1">
                    <span className="text-[10px] text-fuchsia-400/90 font-mono font-bold uppercase">{chart.grids[7].stemZh}{chart.grids[7].branchZh}</span>
                    <span className="text-yellow-400 text-xs font-semibold px-1 rounded bg-[#3b0764]/20 border border-[#c084fc]/10 flex items-center gap-1">
                      <span>{lang === 'zh' ? chart.grids[7].palaceZh : chart.grids[7].palaceEn}</span>
                      {((fleetingYear - 4) % 12) === 7 && (
                        <span className="text-[8px] bg-red-950 border border-red-800 text-red-400 px-0.5 rounded font-sans leading-none font-bold">流</span>
                      )}
                    </span>
                  </div>
                  <div className="my-1 text-[11px] flex flex-wrap gap-1">
                    {chart.grids[7].stars.map((star, idx) => (
                      <span key={idx} className={`px-1 py-0.5 rounded text-[10px] ${star.type === 'major' ? 'text-red-400 font-bold bg-red-950/20' : star.type === 'lucky' ? 'text-emerald-400' : 'text-[#94a3b8]'}`}>
                        {lang === 'zh' ? star.nameZh : star.nameEn.split(' ')[0]}<span className="text-[8px] text-yellow-500/80">({star.levelZh})</span>
                      </span>
                    ))}
                  </div>
                  <div className="flex justify-between text-[9px] text-[#475569] font-mono mt-0.5">
                    <span>{getDecadeRangesOfSelectedPalace(7)} {lang === 'zh' ? '岁' : 'y/o'} </span>
                    {chart.grids[7].yearlyFourStarsZh.length > 0 && (
                      <span className="text-pink-400 font-bold">{chart.grids[7].yearlyFourStarsZh.join('')}</span>
                    )}
                  </div>
                </div>

                {/* GRID 3: 申 (Top Right) */}
                <div
                  onClick={() => setSelectedGridIdx(8)}
                  className={`border p-2.5 rounded-lg text-xs cursor-pointer min-h-[105px] flex flex-col justify-between transition-all select-none hover:border-[#a855f7] ${
                    selectedGridIdx === 8
                      ? 'bg-purple-950/20 border-[#c084fc] shadow-lg shadow-purple-500/10'
                      : ((fleetingYear - 4) % 12) === 8
                      ? 'bg-[#1b121e] border-red-500/70 ring-1 ring-red-500/30'
                      : 'bg-[#111827]/70 border-[#1f2937]/70'
                  }`}
                >
                  <div className="flex justify-between items-start gap-1">
                    <span className="text-[10px] text-fuchsia-400/90 font-mono font-bold uppercase">{chart.grids[8].stemZh}{chart.grids[8].branchZh}</span>
                    <span className="text-yellow-400 text-xs font-semibold px-1 rounded bg-[#3b0764]/20 border border-[#c084fc]/10 flex items-center gap-1">
                      <span>{lang === 'zh' ? chart.grids[8].palaceZh : chart.grids[8].palaceEn}</span>
                      {((fleetingYear - 4) % 12) === 8 && (
                        <span className="text-[8px] bg-red-950 border border-red-800 text-red-400 px-0.5 rounded font-sans leading-none font-bold">流</span>
                      )}
                    </span>
                  </div>
                  <div className="my-1 text-[11px] flex flex-wrap gap-1">
                    {chart.grids[8].stars.map((star, idx) => (
                      <span key={idx} className={`px-1 py-0.5 rounded text-[10px] ${star.type === 'major' ? 'text-red-400 font-bold bg-red-950/20' : star.type === 'lucky' ? 'text-emerald-400' : 'text-[#94a3b8]'}`}>
                        {lang === 'zh' ? star.nameZh : star.nameEn.split(' ')[0]}<span className="text-[8px] text-yellow-500/80">({star.levelZh})</span>
                      </span>
                    ))}
                  </div>
                  <div className="flex justify-between text-[9px] text-[#475569] font-mono mt-0.5">
                    <span>{getDecadeRangesOfSelectedPalace(8)} {lang === 'zh' ? '岁' : 'y/o'} </span>
                    {chart.grids[8].yearlyFourStarsZh.length > 0 && (
                      <span className="text-pink-400 font-bold">{chart.grids[8].yearlyFourStarsZh.join('')}</span>
                    )}
                  </div>
                </div>

                {/* ROW 2, COLUMN 1: 辰 */}
                <div
                  onClick={() => setSelectedGridIdx(4)}
                  className={`border p-2.5 rounded-lg text-xs cursor-pointer min-h-[105px] flex flex-col justify-between transition-all select-none hover:border-[#a855f7] ${
                    selectedGridIdx === 4
                      ? 'bg-purple-950/20 border-[#c084fc] shadow-lg shadow-purple-500/10'
                      : ((fleetingYear - 4) % 12) === 4
                      ? 'bg-[#1b121e] border-red-500/70 ring-1 ring-red-500/30'
                      : 'bg-[#111827]/70 border-[#1f2937]/70'
                  }`}
                >
                  <div className="flex justify-between items-start gap-1">
                    <span className="text-[10px] text-fuchsia-400/90 font-mono font-bold uppercase">{chart.grids[4].stemZh}{chart.grids[4].branchZh}</span>
                    <span className="text-yellow-400 text-xs font-semibold px-1 rounded bg-[#3b0764]/20 border border-[#c084fc]/10 flex items-center gap-1">
                      <span>{lang === 'zh' ? chart.grids[4].palaceZh : chart.grids[4].palaceEn}</span>
                      {((fleetingYear - 4) % 12) === 4 && (
                        <span className="text-[8px] bg-red-950 border border-red-800 text-red-400 px-0.5 rounded font-sans leading-none font-bold">流</span>
                      )}
                    </span>
                  </div>
                  <div className="my-1 text-[11px] flex flex-wrap gap-1">
                    {chart.grids[4].stars.map((star, idx) => (
                      <span key={idx} className={`px-1 py-0.5 rounded text-[10px] ${star.type === 'major' ? 'text-red-400 font-bold bg-red-950/20' : star.type === 'lucky' ? 'text-emerald-400' : 'text-[#94a3b8]'}`}>
                        {lang === 'zh' ? star.nameZh : star.nameEn.split(' ')[0]}<span className="text-[8px] text-yellow-500/80">({star.levelZh})</span>
                      </span>
                    ))}
                  </div>
                  <div className="flex justify-between text-[9px] text-[#475569] font-mono mt-0.5">
                    <span>{getDecadeRangesOfSelectedPalace(4)} {lang === 'zh' ? '岁' : 'y/o'} </span>
                    {chart.grids[4].yearlyFourStarsZh.length > 0 && (
                      <span className="text-pink-400 font-bold">{chart.grids[4].yearlyFourStarsZh.join('')}</span>
                    )}
                  </div>
                </div>

                {/* ROW 2 SPECIAL: CENTRAL SUMMARY BLOCKSPAN (spanning 2 columns & 2 rows in the center of 4x4) */}
                <div className="col-span-2 row-span-2 bg-gradient-to-b from-[#0f0920] to-[#06040d] border-2 border-yellow-600/50 rounded-2xl p-4 flex flex-col justify-between text-center overflow-auto border-felt-stitching felt-texture shadow-[0_0_20px_rgba(168,85,247,0.15)] premium-border-glow select-none">
                  
                  <div className="space-y-1.5 py-0.5 relative z-10">
                    <div className="text-[9px] font-mono tracking-widest text-[#cbd5e1] bg-purple-950/50 border border-purple-500/20 px-2 py-0.5 rounded-full inline-block font-black uppercase mb-1">
                      {lang === 'zh' ? '✨ 乾坤中枢天盘 ✨' : '✨ CENTRAL ALIGNMENT 天盘 ✨'}
                    </div>
                    <h3 className="text-sm font-bold text-yellow-400 font-calligraphy tracking-widest flex items-center justify-center gap-1">
                      <span>{chart.name}</span>
                      <span className="text-slate-400 text-xs">({lang === 'zh' ? chart.genderZh : chart.genderEn})</span>
                    </h3>
                    <div className="text-[10px] text-[#cbd5e1] space-y-0.5 font-mono">
                      <p>{lang === 'zh' ? `公历生辰：${chart.solarDate}` : `Solar Birth: ${chart.solarDate}`}</p>
                      <p className="text-[#a78bfa]">{chart.lunarDate} (时辰：{chart.birthHourZh}时)</p>
                      <p className="text-cyan-400">{lang === 'zh' ? `五行局：${chart.fiveElementsZh}` : `Phase: ${chart.fiveElementsEn}`}</p>
                      <p className="text-yellow-400 font-bold">{lang === 'zh' ? `流年柱：${getYearStemBranch(fleetingYear).zh} (${fleetingYear})` : `Year: ${getYearStemBranch(fleetingYear).en} (${fleetingYear})`}</p>
                    </div>
                  </div>

                  {/* Cute small interactive mascot presence inside the center hub */}
                  <div className="flex items-center justify-center -my-3">
                    <DestinyDirectorCartoon 
                      expression={aiAnalyzing ? "writing" : selectedGridIdx !== null ? "observing" : "guiding"} 
                      size="xs" 
                      className="scale-90 hover:scale-100 transition-transform duration-300"
                    />
                  </div>

                  <div className="border-t border-[#1e293b]/60 pt-2 flex justify-center gap-2 print:hidden relative z-10">
                    <button
                      onClick={handleGenerateAiAnalysis}
                      disabled={aiAnalyzing}
                      className="w-full py-1.5 rounded-xl bg-gradient-to-r from-purple-800 to-indigo-800 hover:from-purple-700 hover:to-indigo-700 text-yellow-300 border border-purple-500/30 font-bold text-xs transition-all flex items-center justify-center gap-1.5 shadow-[0_4px_10px_rgba(0,0,0,0.3)] hover:scale-105 active:scale-95"
                    >
                      <Sparkles className="h-3 w-3 text-yellow-400 animate-pulse" />
                      <span>{aiAnalyzing ? t.aiAnalyzing : t.aiAnalysisBtn}</span>
                    </button>
                  </div>

                </div>

                {/* ROW 2, COLUMN 4: 酉 */}
                <div
                  onClick={() => setSelectedGridIdx(9)}
                  className={`border p-2.5 rounded-lg text-xs cursor-pointer min-h-[105px] flex flex-col justify-between transition-all select-none hover:border-[#a855f7] ${
                    selectedGridIdx === 9
                      ? 'bg-purple-950/20 border-[#c084fc] shadow-lg shadow-purple-500/10'
                      : ((fleetingYear - 4) % 12) === 9
                      ? 'bg-[#1b121e] border-red-500/70 ring-1 ring-red-500/30'
                      : 'bg-[#111827]/70 border-[#1f2937]/70'
                  }`}
                >
                  <div className="flex justify-between items-start gap-1">
                    <span className="text-[10px] text-fuchsia-400/90 font-mono font-bold uppercase">{chart.grids[9].stemZh}{chart.grids[9].branchZh}</span>
                    <span className="text-yellow-400 text-xs font-semibold px-1 rounded bg-[#3b0764]/20 border border-[#c084fc]/10 flex items-center gap-1">
                      <span>{lang === 'zh' ? chart.grids[9].palaceZh : chart.grids[9].palaceEn}</span>
                      {((fleetingYear - 4) % 12) === 9 && (
                        <span className="text-[8px] bg-red-950 border border-red-800 text-red-400 px-0.5 rounded font-sans leading-none font-bold">流</span>
                      )}
                    </span>
                  </div>
                  <div className="my-1 text-[11px] flex flex-wrap gap-1">
                    {chart.grids[9].stars.map((star, idx) => (
                      <span key={idx} className={`px-1 py-0.5 rounded text-[10px] ${star.type === 'major' ? 'text-red-400 font-bold bg-red-950/20' : star.type === 'lucky' ? 'text-emerald-400' : 'text-[#94a3b8]'}`}>
                        {lang === 'zh' ? star.nameZh : star.nameEn.split(' ')[0]}<span className="text-[8px] text-yellow-500/80">({star.levelZh})</span>
                      </span>
                    ))}
                  </div>
                  <div className="flex justify-between text-[9px] text-[#475569] font-mono mt-0.5">
                    <span>{getDecadeRangesOfSelectedPalace(9)} {lang === 'zh' ? '岁' : 'y/o'} </span>
                    {chart.grids[9].yearlyFourStarsZh.length > 0 && (
                      <span className="text-pink-400 font-bold">{chart.grids[9].yearlyFourStarsZh.join('')}</span>
                    )}
                  </div>
                </div>

                {/* ROW 3, COLUMN 1: 卯 */}
                <div
                  onClick={() => setSelectedGridIdx(3)}
                  className={`border p-2.5 rounded-lg text-xs cursor-pointer min-h-[105px] flex flex-col justify-between transition-all select-none hover:border-[#a855f7] ${
                    selectedGridIdx === 3
                      ? 'bg-purple-950/20 border-[#c084fc] shadow-lg shadow-purple-500/10'
                      : ((fleetingYear - 4) % 12) === 3
                      ? 'bg-[#1b121e] border-red-500/70 ring-1 ring-red-500/30'
                      : 'bg-[#111827]/70 border-[#1f2937]/70'
                  }`}
                >
                  <div className="flex justify-between items-start gap-1">
                    <span className="text-[10px] text-fuchsia-400/90 font-mono font-bold uppercase">{chart.grids[3].stemZh}{chart.grids[3].branchZh}</span>
                    <span className="text-yellow-400 text-xs font-semibold px-1 rounded bg-[#3b0764]/20 border border-[#c084fc]/10 flex items-center gap-1">
                      <span>{lang === 'zh' ? chart.grids[3].palaceZh : chart.grids[3].palaceEn}</span>
                      {((fleetingYear - 4) % 12) === 3 && (
                        <span className="text-[8px] bg-red-950 border border-red-800 text-red-400 px-0.5 rounded font-sans leading-none font-bold">流</span>
                      )}
                    </span>
                  </div>
                  <div className="my-1 text-[11px] flex flex-wrap gap-1">
                    {chart.grids[3].stars.map((star, idx) => (
                      <span key={idx} className={`px-1 py-0.5 rounded text-[10px] ${star.type === 'major' ? 'text-red-400 font-bold bg-red-950/20' : star.type === 'lucky' ? 'text-emerald-400' : 'text-[#94a3b8]'}`}>
                        {lang === 'zh' ? star.nameZh : star.nameEn.split(' ')[0]}<span className="text-[8px] text-yellow-500/80">({star.levelZh})</span>
                      </span>
                    ))}
                  </div>
                  <div className="flex justify-between text-[9px] text-[#475569] font-mono mt-0.5">
                    <span>{getDecadeRangesOfSelectedPalace(3)} {lang === 'zh' ? '岁' : 'y/o'} </span>
                    {chart.grids[3].yearlyFourStarsZh.length > 0 && (
                      <span className="text-pink-400 font-bold">{chart.grids[3].yearlyFourStarsZh.join('')}</span>
                    )}
                  </div>
                </div>

                {/* ROW 3, COLUMN 4: 戌 */}
                <div
                  onClick={() => setSelectedGridIdx(10)}
                  className={`border p-2.5 rounded-lg text-xs cursor-pointer min-h-[105px] flex flex-col justify-between transition-all select-none hover:border-[#a855f7] ${
                    selectedGridIdx === 10
                      ? 'bg-purple-950/20 border-[#c084fc] shadow-lg shadow-purple-500/10'
                      : ((fleetingYear - 4) % 12) === 10
                      ? 'bg-[#1b121e] border-red-500/70 ring-1 ring-red-500/30'
                      : 'bg-[#111827]/70 border-[#1f2937]/70'
                  }`}
                >
                  <div className="flex justify-between items-start gap-1">
                    <span className="text-[10px] text-fuchsia-400/90 font-mono font-bold uppercase">{chart.grids[10].stemZh}{chart.grids[10].branchZh}</span>
                    <span className="text-yellow-400 text-xs font-semibold px-1 rounded bg-[#3b0764]/20 border border-[#c084fc]/10 flex items-center gap-1">
                      <span>{lang === 'zh' ? chart.grids[10].palaceZh : chart.grids[10].palaceEn}</span>
                      {((fleetingYear - 4) % 12) === 10 && (
                        <span className="text-[8px] bg-red-950 border border-red-800 text-red-400 px-0.5 rounded font-sans leading-none font-bold">流</span>
                      )}
                    </span>
                  </div>
                  <div className="my-1 text-[11px] flex flex-wrap gap-1">
                    {chart.grids[10].stars.map((star, idx) => (
                      <span key={idx} className={`px-1 py-0.5 rounded text-[10px] ${star.type === 'major' ? 'text-red-400 font-bold bg-red-950/20' : star.type === 'lucky' ? 'text-emerald-400' : 'text-[#94a3b8]'}`}>
                        {lang === 'zh' ? star.nameZh : star.nameEn.split(' ')[0]}<span className="text-[8px] text-yellow-500/80">({star.levelZh})</span>
                      </span>
                    ))}
                  </div>
                  <div className="flex justify-between text-[9px] text-[#475569] font-mono mt-0.5">
                    <span>{getDecadeRangesOfSelectedPalace(10)} {lang === 'zh' ? '岁' : 'y/o'} </span>
                    {chart.grids[10].yearlyFourStarsZh.length > 0 && (
                      <span className="text-pink-400 font-bold">{chart.grids[10].yearlyFourStarsZh.join('')}</span>
                    )}
                  </div>
                </div>

                {/* ROW 4, COLUMN 1: 寅 (Lower Left) */}
                <div
                  onClick={() => setSelectedGridIdx(2)}
                  className={`border p-2.5 rounded-lg text-xs cursor-pointer min-h-[105px] flex flex-col justify-between transition-all select-none hover:border-[#a855f7] ${
                    selectedGridIdx === 2
                      ? 'bg-purple-950/20 border-[#c084fc] shadow-lg shadow-purple-500/10'
                      : ((fleetingYear - 4) % 12) === 2
                      ? 'bg-[#1b121e] border-red-500/70 ring-1 ring-red-500/30'
                      : 'bg-[#111827]/70 border-[#1f2937]/70'
                  }`}
                >
                  <div className="flex justify-between items-start gap-1">
                    <span className="text-[10px] text-fuchsia-400/90 font-mono font-bold uppercase">{chart.grids[2].stemZh}{chart.grids[2].branchZh}</span>
                    <span className="text-yellow-400 text-xs font-semibold px-1 rounded bg-[#3b0764]/20 border border-[#c084fc]/10 flex items-center gap-1">
                      <span>{lang === 'zh' ? chart.grids[2].palaceZh : chart.grids[2].palaceEn}</span>
                      {((fleetingYear - 4) % 12) === 2 && (
                        <span className="text-[8px] bg-red-950 border border-red-800 text-red-200 px-0.5 rounded font-sans leading-none font-bold">流</span>
                      )}
                    </span>
                  </div>
                  <div className="my-1 text-[11px] flex flex-wrap gap-1">
                    {chart.grids[2].stars.map((star, idx) => (
                      <span key={idx} className={`px-1 py-0.5 rounded text-[10px] ${star.type === 'major' ? 'text-red-400 font-bold bg-red-950/20' : star.type === 'lucky' ? 'text-emerald-400' : 'text-[#94a3b8]'}`}>
                        {lang === 'zh' ? star.nameZh : star.nameEn.split(' ')[0]}<span className="text-[8px] text-yellow-500/80">({star.levelZh})</span>
                      </span>
                    ))}
                  </div>
                  <div className="flex justify-between text-[9px] text-[#475569] font-mono mt-0.5">
                    <span>{getDecadeRangesOfSelectedPalace(2)} {lang === 'zh' ? '岁' : 'y/o'} </span>
                    {chart.grids[2].yearlyFourStarsZh.length > 0 && (
                      <span className="text-pink-400 font-bold">{chart.grids[2].yearlyFourStarsZh.join('')}</span>
                    )}
                  </div>
                </div>

                {/* ROW 4, COLUMN 2: 丑 */}
                <div
                  onClick={() => setSelectedGridIdx(1)}
                  className={`border p-2.5 rounded-lg text-xs cursor-pointer min-h-[105px] flex flex-col justify-between transition-all select-none hover:border-[#a855f7] ${
                    selectedGridIdx === 1
                      ? 'bg-purple-950/20 border-[#c084fc] shadow-lg shadow-purple-500/10'
                      : ((fleetingYear - 4) % 12) === 1
                      ? 'bg-[#1b121e] border-red-500/70 ring-1 ring-red-500/30'
                      : 'bg-[#111827]/70 border-[#1f2937]/70'
                  }`}
                >
                  <div className="flex justify-between items-start gap-1">
                    <span className="text-[10px] text-fuchsia-400/90 font-mono font-bold uppercase">{chart.grids[1].stemZh}{chart.grids[1].branchZh}</span>
                    <span className="text-yellow-400 text-xs font-semibold px-1 rounded bg-[#3b0764]/20 border border-[#c084fc]/10 flex items-center gap-1">
                      <span>{lang === 'zh' ? chart.grids[1].palaceZh : chart.grids[1].palaceEn}</span>
                      {((fleetingYear - 4) % 12) === 1 && (
                        <span className="text-[8px] bg-red-950 border border-red-800 text-red-400 px-0.5 rounded font-sans leading-none font-bold">流</span>
                      )}
                    </span>
                  </div>
                  <div className="my-1 text-[11px] flex flex-wrap gap-1">
                    {chart.grids[1].stars.map((star, idx) => (
                      <span key={idx} className={`px-1 py-0.5 rounded text-[10px] ${star.type === 'major' ? 'text-red-400 font-bold bg-red-950/20' : star.type === 'lucky' ? 'text-emerald-400' : 'text-[#94a3b8]'}`}>
                        {lang === 'zh' ? star.nameZh : star.nameEn.split(' ')[0]}<span className="text-[8px] text-yellow-500/80">({star.levelZh})</span>
                      </span>
                    ))}
                  </div>
                  <div className="flex justify-between text-[9px] text-[#475569] font-mono mt-0.5">
                    <span>{getDecadeRangesOfSelectedPalace(1)} {lang === 'zh' ? '岁' : 'y/o'} </span>
                    {chart.grids[1].yearlyFourStarsZh.length > 0 && (
                      <span className="text-pink-400 font-bold">{chart.grids[1].yearlyFourStarsZh.join('')}</span>
                    )}
                  </div>
                </div>

                {/* ROW 4, COLUMN 3: 子 */}
                <div
                  onClick={() => setSelectedGridIdx(0)}
                  className={`border p-2.5 rounded-lg text-xs cursor-pointer min-h-[105px] flex flex-col justify-between transition-all select-none hover:border-[#a855f7] ${
                    selectedGridIdx === 0
                      ? 'bg-purple-950/20 border-[#c084fc] shadow-lg shadow-purple-500/10'
                      : ((fleetingYear - 4) % 12) === 0
                      ? 'bg-[#1b121e] border-red-500/70 ring-1 ring-red-500/30'
                      : 'bg-[#111827]/70 border-[#1f2937]/70'
                  }`}
                >
                  <div className="flex justify-between items-start gap-1">
                    <span className="text-[10px] text-fuchsia-400/90 font-mono font-bold uppercase">{chart.grids[0].stemZh}{chart.grids[0].branchZh}</span>
                    <span className="text-yellow-400 text-xs font-semibold px-1 rounded bg-[#3b0764]/20 border border-[#c084fc]/10 flex items-center gap-1">
                      <span>{lang === 'zh' ? chart.grids[0].palaceZh : chart.grids[0].palaceEn}</span>
                      {((fleetingYear - 4) % 12) === 0 && (
                        <span className="text-[8px] bg-red-950 border border-red-800 text-red-400 px-0.5 rounded font-sans leading-none font-bold">流</span>
                      )}
                    </span>
                  </div>
                  <div className="my-1 text-[11px] flex flex-wrap gap-1">
                    {chart.grids[0].stars.map((star, idx) => (
                      <span key={idx} className={`px-1 py-0.5 rounded text-[10px] ${star.type === 'major' ? 'text-red-400 font-bold bg-red-950/20' : star.type === 'lucky' ? 'text-emerald-400' : 'text-[#94a3b8]'}`}>
                        {lang === 'zh' ? star.nameZh : star.nameEn.split(' ')[0]}<span className="text-[8px] text-yellow-500/80">({star.levelZh})</span>
                      </span>
                    ))}
                  </div>
                  <div className="flex justify-between text-[9px] text-[#475569] font-mono mt-0.5">
                    <span>{getDecadeRangesOfSelectedPalace(0)} {lang === 'zh' ? '岁' : 'y/o'} </span>
                    {chart.grids[0].yearlyFourStarsZh.length > 0 && (
                      <span className="text-pink-400 font-bold">{chart.grids[0].yearlyFourStarsZh.join('')}</span>
                    )}
                  </div>
                </div>

                {/* ROW 4, COLUMN 4: 亥 (Lower Right) */}
                <div
                  onClick={() => setSelectedGridIdx(11)}
                  className={`border p-2.5 rounded-lg text-xs cursor-pointer min-h-[105px] flex flex-col justify-between transition-all select-none hover:border-[#a855f7] ${
                    selectedGridIdx === 11
                      ? 'bg-purple-950/20 border-[#c084fc] shadow-lg shadow-purple-500/10'
                      : ((fleetingYear - 4) % 12) === 11
                      ? 'bg-[#1b121e] border-red-500/70 ring-1 ring-red-500/30'
                      : 'bg-[#111827]/70 border-[#1f2937]/70'
                  }`}
                >
                  <div className="flex justify-between items-start gap-1">
                    <span className="text-[10px] text-fuchsia-400/90 font-mono font-bold uppercase">{chart.grids[11].stemZh}{chart.grids[11].branchZh}</span>
                    <span className="text-yellow-400 text-xs font-semibold px-1 rounded bg-[#3b0764]/20 border border-[#c084fc]/10 flex items-center gap-1">
                      <span>{lang === 'zh' ? chart.grids[11].palaceZh : chart.grids[11].palaceEn}</span>
                      {((fleetingYear - 4) % 12) === 11 && (
                        <span className="text-[8px] bg-red-950 border border-red-800 text-red-200 px-0.5 rounded font-sans leading-none font-bold">流</span>
                      )}
                    </span>
                  </div>
                  <div className="my-1 text-[11px] flex flex-wrap gap-1">
                    {chart.grids[11].stars.map((star, idx) => (
                      <span key={idx} className={`px-1 py-0.5 rounded text-[10px] ${star.type === 'major' ? 'text-red-400 font-bold bg-red-950/20' : star.type === 'lucky' ? 'text-emerald-400' : 'text-[#94a3b8]'}`}>
                        {lang === 'zh' ? star.nameZh : star.nameEn.split(' ')[0]}<span className="text-[8px] text-yellow-500/80">({star.levelZh})</span>
                      </span>
                    ))}
                  </div>
                  <div className="flex justify-between text-[9px] text-[#475569] font-mono mt-0.5">
                    <span>{getDecadeRangesOfSelectedPalace(11)} {lang === 'zh' ? '岁' : 'y/o'} </span>
                    {chart.grids[11].yearlyFourStarsZh.length > 0 && (
                      <span className="text-pink-400 font-bold">{chart.grids[11].yearlyFourStarsZh.join('')}</span>
                    )}
                  </div>
                </div>

              </div>
              
              {/* DISPLAY OF AI IMPERIAL DECAY PROPHECIES OF OVERALL LIFE (if requested) */}
              {aiAnalysis && (
                <div className="bg-gradient-to-r from-purple-950/40 to-indigo-950/40 border border-purple-500/30 p-6 rounded-2xl shadow-xl space-y-4">
                  <div className="flex items-center justify-between border-b border-[#3b0764] pb-3">
                    <h3 className="text-sm font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 via-pink-300 to-indigo-300 uppercase tracking-widest font-mono flex items-center gap-2">
                      <Sparkles className="h-5 w-5 text-yellow-400" />
                      <span>{t.aiResultTitle}</span>
                    </h3>
                    <div className="h-2 w-2 rounded-full bg-yellow-400 animate-ping"></div>
                  </div>
                  
                  <div className="text-xs leading-relaxed text-[#cbd5e1] space-y-4 whitespace-pre-line text-justify max-h-[400px] overflow-y-auto pr-2">
                    {aiAnalysis}
                  </div>
                </div>
              )}

              {/* TWO PANEL SPLIT FOR NOTE-TAKING AND GENERAL HOUSE DETAILS */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-6">
                
                {/* Active detailed Palace display info */}
                <div className="bg-[#0f172a]/90 border-2 border-purple-950/40 p-5 rounded-2xl shadow-xl flex flex-col justify-between border-felt-stitching felt-texture">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between border-b border-[#1e293b] pb-3">
                      <div className="flex items-center gap-2">
                        <div className="h-2 w-2 rounded-full bg-yellow-400 animate-pulse"></div>
                        <h4 className="text-sm font-bold text-white flex items-center gap-2">
                          <span>{t.chartDetailTitle} :</span>
                          <span className="text-yellow-400">
                            {selectedPalaceGrid ? (lang === 'zh' ? selectedPalaceGrid.palaceZh : selectedPalaceGrid.palaceEn) : 'No Palace Selected'}
                          </span>
                        </h4>
                      </div>
                      {selectedPalaceGrid && (
                        <div className="scale-75 -my-4 -mr-4 flex items-center gap-1 bg-[#150a21]/50 border border-purple-500/20 rounded-full px-2 py-0.5">
                          <span className="text-[9px] text-[#c084fc] font-mono">{lang === 'zh' ? '戏命师观测中' : 'Director Peering'}</span>
                          <DestinyDirectorCartoon expression="observing" size="xs" />
                        </div>
                      )}
                    </div>

                    {selectedPalaceGrid ? (
                      <div className="space-y-3 text-xs leading-relaxed">
                        <div>
                          <span className="text-[#94a3b8] block mb-1">{t.stars}</span>
                          <div className="flex flex-wrap gap-2">
                            {selectedPalaceGrid.stars.map((star, idx) => (
                              <span
                                key={idx}
                                className={`px-2 py-1 rounded text-xs border ${
                                  star.type === 'major'
                                    ? 'bg-red-950/10 border-red-900/60 text-red-300'
                                    : star.type === 'lucky'
                                    ? 'bg-emerald-950/10 border-emerald-900/60 text-emerald-300'
                                    : 'bg-[#1e293b] border-[#334155] text-slate-300'
                                }`}
                              >
                                {lang === 'zh' ? star.nameZh : star.nameEn} ({lang === 'zh' ? star.levelZh : star.levelEn})
                              </span>
                            ))}
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4 pt-2 border-t border-[#1e293b]/50">
                          <div>
                            <span className="text-[#94a3b8] block">{t.ageRange}</span>
                            <strong className="text-white font-mono">{getDecadeRangesOfSelectedPalace(selectedGridIdx || 0)} {lang === 'zh' ? '岁' : 'years old'}</strong>
                          </div>
                          <div>
                            <span className="text-[#94a3b8] block">{t.fourTransform}</span>
                            <strong className="text-pink-400 font-mono">
                              {selectedPalaceGrid.yearlyFourStarsZh.length > 0
                                ? (lang === 'zh' ? selectedPalaceGrid.yearlyFourStarsZh.join(', ') : selectedPalaceGrid.yearlyFourStarsEn.join(', '))
                                : (lang === 'zh' ? '无化星' : 'None')}
                            </strong>
                          </div>
                        </div>

                        <div className="pt-2">
                          <span className="text-[#94a3b8] block font-medium mb-1">
                            {lang === 'zh' ? '本宫能量特性及命引' : 'Palace Energetic Prophecy'}
                          </span>
                          <p className="text-[#cbd5e1] text-justify text-[11px] leading-relaxed">
                            {lang === 'zh'
                              ? `命盘中该 ${selectedPalaceGrid.palaceZh} 坐落于地支【${selectedPalaceGrid.branchZh}】。天干【${selectedPalaceGrid.stemZh}】。主要蕴含了『${selectedPalaceGrid.stars.map(s => s.nameZh).join('与')}』的波动机制，主导您 ${selectedPalaceGrid.decadeStart}-${selectedPalaceGrid.decadeEnd} 岁十载大限。此宫位格局气象丰盈，适宜谋定而后动。`
                              : `This ${selectedPalaceGrid.palaceEn} Palace situated over the Earthly branch '${selectedPalaceGrid.branchEn}' with the Heavenly stem of '${selectedPalaceGrid.stemEn}'. Dominated primarily by ${selectedPalaceGrid.stars.map(s => s.nameEn).join(', ')} representing destiny patterns around ages ${selectedPalaceGrid.decadeStart}-${selectedPalaceGrid.decadeEnd}.`}
                          </p>
                        </div>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center py-6 text-center space-y-4">
                        <DestinyDirectorCartoon 
                          expression="observing" 
                          size="md" 
                          withBubble={true} 
                          bubbleText={lang === 'zh' ? "天星流转，命书已就！速速点击上方的命学 12 宫，看本戏命师为您执笔细探此宫机局！" : "The heavenly wheel is aligned! Click on any of the 12 astrology houses above, and I shall parse its secret paths for you!"} 
                        />
                      </div>
                    )}
                  </div>

                  {/* NOTE-TAKING AREA SYNCHRONIZING TO CLOUDFIRESTORE/LOCALSTORAGE */}
                  {selectedPalaceGrid && (
                    <div className="mt-4 pt-4 border-t border-[#1e293b] space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-[11px] text-[#94a3b8] font-semibold uppercase font-mono tracking-widest flex items-center gap-1">
                          <Plus className="h-3 w-3" />
                          <span>{lang === 'zh' ? '个人行年备注' : 'Personal Astro Notes'}</span>
                        </span>
                        <span className="text-[9px] text-[#64748b]">
                          {currentUser ? '☁️ Sync Automatic' : '💾 Save to sandbox'}
                        </span>
                      </div>
                      <textarea
                        value={palaceNotes[selectedGridIdx || 0] || ""}
                        onChange={(e) => savePalaceNote(selectedGridIdx || 0, e.target.value)}
                        placeholder={t.notesPlaceholder}
                        rows={3}
                        className="w-full bg-[#0a0f1d] border border-[#1e293b] rounded-lg p-2.5 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-[#a855f7] focus:ring-1 focus:ring-[#a855f7]/30 transition-all resize-none"
                      />
                    </div>
                  )}

                </div>

                {/* WEEKLY REFINED ASTRO ALMANAC PUSH TAB */}
                <div className="bg-[#0f172a]/90 border-2 border-purple-950/40 p-5 rounded-2xl shadow-xl flex flex-col justify-between border-felt-stitching felt-texture">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between border-b border-[#1e293b] pb-3">
                      <div className="flex items-center gap-1.5">
                        <Calendar className="h-4 w-4 text-[#a855f7]" />
                        <h4 className="text-sm font-bold text-white uppercase tracking-wider font-mono">
                          {t.weeklyTitle}
                        </h4>
                      </div>
                      <div className="scale-75 -my-4 -mr-4">
                        <DestinyDirectorCartoon expression="analyzing" size="xs" />
                      </div>
                    </div>

                    <p className="text-xs text-[#cbd5e1] leading-relaxed text-justify">
                      {lang === 'zh'
                        ? "岁运流转，天时不同。基于您当前的紫微排盘特征，我们可以推断出本周流曜运转、吉凶休咎，助您趋吉避凶。"
                        : "Astronomical transits map differently for each person. Given your unique natal constellations, we can calculate customized transits for the current week."}
                    </p>

                    {/* Interactive cartoon display during calculations */}
                    {weeklyAnalyzing ? (
                      <div className="flex flex-col items-center justify-center py-2 animate-pulse">
                        <DestinyDirectorCartoon 
                          expression="analyzing" 
                          size="sm" 
                          withBubble={true} 
                          bubbleText={lang === 'zh' ? "岁度合璧，正在勾勒本周曜运星谶！极细至精，且等我推演片刻..." : "Calculating cosmic transits for the upcoming week... One second!"} 
                        />
                      </div>
                    ) : weeklyReport ? (
                      <div className="bg-[#0a0f1d] border border-[#1e293b] rounded-xl p-3 max-h-[170px] overflow-y-auto text-xs text-slate-300 space-y-2 text-justify scrollbar-thin">
                        <div className="text-yellow-500 font-bold mb-1 border-b border-[#1e293b]/60 pb-1 font-mono uppercase tracking-widest text-[9px] flex items-center justify-between">
                          <span>{t.weeklyResult}</span>
                          <span className="text-[8px] bg-purple-950 text-purple-300 px-1 rounded border border-purple-800">戏命笔批句</span>
                        </div>
                        <p className="whitespace-pre-line text-[11px] leading-relaxed">{weeklyReport}</p>
                      </div>
                    ) : (
                      <div className="flex justify-center py-2 opacity-60">
                        <span className="text-[11px] text-fuchsia-400/80 italic">🔮 点击下方按钮，让戏命师运用星墨，为您书写本周演绎指南</span>
                      </div>
                    )}
                  </div>

                  <button
                    onClick={handleWeeklyProphecy}
                    disabled={weeklyAnalyzing}
                    className="w-full mt-4 bg-gradient-to-r from-purple-900 to-indigo-900 hover:from-purple-800 hover:to-indigo-800 border-2 border-purple-600/30 text-white font-bold py-2.5 px-4 rounded-xl text-xs uppercase tracking-widest transition-all shadow-[0_4px_12px_rgba(168,85,247,0.15)] flex items-center justify-center gap-2"
                  >
                    <Calendar className="h-4 w-4 animate-pulse text-yellow-400" />
                    <span>{weeklyAnalyzing ? t.weeklyAnalyzing : t.weeklyBtn}</span>
                  </button>

                </div>

              </div>

            </div>
          )}

          {/* TAB CONTENT 2: 1v1 PRIVATE DIGITAL MASTER CHATROOM COUNSELING */}
          {selectedTab === 'consult' && (
            <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-6">
              
              <div className="bg-[#0f172a]/95 border-2 border-purple-950/40 rounded-2xl shadow-xl p-6 space-y-6 flex flex-col justify-between border-felt-stitching felt-texture">
                
                <div className="flex flex-col md:flex-row items-center justify-between border-b border-[#1e293b] pb-4 gap-4">
                  <div>
                    <h3 className="text-base font-bold text-white tracking-widest">{lang === 'zh' ? '1v1 紫徽名师私塾房' : 'Elite Masters Private Parlor'}</h3>
                    <p className="text-xs text-[#cbd5e1] mt-0.5">{lang === 'zh' ? '三位虚实玄学大师常驻，基于您的专属格盘提供极具深度的私人引导解答。' : 'Three virtual diviners with bespoke counseling styles tied to your destiny map.'}</p>
                  </div>

                  {/* Master Picker elements */}
                  <div className="flex flex-wrap items-center gap-2 select-none">
                    <button
                      onClick={() => setSelectedMaster('director_xi')}
                      className={`px-3 py-1.5 rounded-lg border text-xs font-semibold transition-all flex items-center gap-1 ${
                        selectedMaster === 'director_xi'
                          ? 'bg-gradient-to-r from-fuchsia-950/80 to-purple-950/80 border-yellow-500 text-yellow-300 ring-1 ring-yellow-500/20'
                          : 'bg-[#0a0f1d] border-[#1e293b] text-[#cbd5e1] hover:text-white'
                      }`}
                    >
                      <span className="text-[10px]">🔮</span>
                      {lang === 'zh' ? '戏命师 (特约主笔)' : 'Destiny Director (Felt)'}
                    </button>
                    <button
                      onClick={() => setSelectedMaster('master_li')}
                      className={`px-3 py-1.5 rounded-lg border text-xs font-semibold transition-all ${
                        selectedMaster === 'master_li'
                          ? 'bg-purple-950/45 border-[#a855f7] text-[#c084fc]'
                          : 'bg-[#0a0f1d] border-[#1e293b] text-[#cbd5e1] hover:text-white'
                      }`}
                    >
                      {lang === 'zh' ? '传：李虚中大师' : 'Trad: Master Li'}
                    </button>
                    <button
                      onClick={() => setSelectedMaster('master_yun')}
                      className={`px-3 py-1.5 rounded-lg border text-xs font-semibold transition-all ${
                        selectedMaster === 'master_yun'
                          ? 'bg-purple-950/45 border-[#a855f7] text-[#c084fc]'
                          : 'bg-[#0a0f1d] border-[#1e293b] text-[#cbd5e1] hover:text-white'
                      }`}
                    >
                      {lang === 'zh' ? '修：云海居士' : 'Zen: Master Yun'}
                    </button>
                    <button
                      onClick={() => setSelectedMaster('master_sharon')}
                      className={`px-3 py-1.5 rounded-lg border text-xs font-semibold transition-all ${
                        selectedMaster === 'master_sharon'
                          ? 'bg-purple-950/45 border-[#a855f7] text-[#c084fc]'
                          : 'bg-[#0a0f1d] border-[#1e293b] text-[#cbd5e1] hover:text-white'
                      }`}
                    >
                      {lang === 'zh' ? '理：夏洛特老师' : 'Psych: Sharon'}
                    </button>
                  </div>
                </div>

                {/* Chat log displays */}
                <div className="bg-[#050912] border border-[#1e293b] rounded-xl h-[340px] flex flex-col justify-between p-4 relative shadow-inner">
                  
                  <div className="overflow-y-auto space-y-4 pr-1 max-h-[300px] scrollbar-thin">
                    {masterChats[selectedMaster].map((msg, idx) => (
                      <div
                        key={idx}
                        className={`flex gap-3 items-start ${msg.sender === 'user' ? 'flex-row-reverse' : 'flex-row'}`}
                      >
                        {/* Interactive Mascot Avatar if bot response from the Destiny Director */}
                        {msg.sender === 'bot' && selectedMaster === 'director_xi' && (
                          <div className="flex-shrink-0 bg-[#160a2d] border border-purple-500/30 rounded-xl p-0.5 shadow-md">
                            <DestinyDirectorCartoon expression="writing" size="xs" />
                          </div>
                        )}

                        <div className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'} flex-1`}>
                          <div className="flex items-center gap-1.5">
                            <span className="text-[9px] text-[#64748b] font-mono">{msg.timestamp}</span>
                            <span className="text-[10px] font-bold text-[#b07df0]">
                              {msg.sender === 'user' 
                                ? (lang === 'zh' ? '您' : 'User') 
                                : selectedMaster === 'director_xi'
                                ? (lang === 'zh' ? '✍️ 戏命师 (执笔人)' : '✍️ Destiny Director')
                                : selectedMaster === 'master_li' 
                                ? (lang === 'zh' ? '李虚中大师' : 'Master Li') 
                                : selectedMaster === 'master_yun' 
                                ? (lang === 'zh' ? '云海居士' : 'Master Yun') 
                                : (lang === 'zh' ? '夏洛特老师' : 'Sharon')}
                            </span>
                          </div>
                          <div
                            className={`text-xs p-3 rounded-xl mt-1 leading-relaxed text-justify relative ${
                              msg.sender === 'user'
                                ? 'bg-gradient-to-r from-purple-900 to-indigo-900 text-white border border-purple-800/40 rounded-tr-none shadow-[0_4px_12px_rgba(147,51,234,0.15)]'
                                : 'bg-slate-950 border border-slate-800 text-slate-100 rounded-tl-none shadow-[0_4px_12px_rgba(0,0,0,0.3)]'
                            }`}
                          >
                            {msg.text}
                          </div>
                        </div>
                      </div>
                    ))}

                    {chatSending && (
                      <div className="flex items-center gap-2 text-slate-500 text-xs italic">
                        <div className="h-1 w-1 bg-yellow-400 rounded-full animate-ping"></div>
                        <span>{lang === 'zh' ? '大师正在拨算天星，徐徐叙述...' : 'Master computing astrological charts...'}</span>
                      </div>
                    )}
                  </div>

                  {/* Input area */}
                  <div className="border-t border-[#1e293b]/70 pt-3 flex gap-2">
                    <input
                      type="text"
                      value={chatInputValue}
                      onChange={(e) => setChatInputValue(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleSendMasterChat()}
                      placeholder={lang === 'zh' ? "向大师打招呼，问婚姻缘分、官禄抉择..." : "Say hello dynamically. Ask detail variables..."}
                      className="flex-1 bg-[#0a0f1d] border border-[#1e293b] rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-[#a855f7] transition-all"
                    />
                    <button
                      onClick={handleSendMasterChat}
                      disabled={chatSending || !chatInputValue.trim()}
                      className="bg-[#c084fc] hover:bg-[#a855f7] text-[#070b12] font-semibold text-xs px-4 rounded-lg flex items-center justify-center gap-1 transition-all shadow-md shadow-purple-950/20"
                    >
                      <Send className="h-3.5 w-3.5" />
                      <span>{lang === 'zh' ? '呈送' : 'Transmit'}</span>
                    </button>
                  </div>

                </div>

              </div>

              {/* RIGHT SIDEBAR: MASTER WEB GRAPHICAL CARTOON COMPASS */}
              <div className="bg-[#0b0f19] border-2 border-purple-950/40 rounded-2xl p-6 flex flex-col justify-between items-center text-center shadow-xl relative overflow-hidden border-felt-stitching felt-texture">
                <div className="absolute top-0 right-0 bg-[#c084fc]/10 text-[#c084fc] text-[9px] font-bold px-2 py-0.5 rounded-bl uppercase tracking-widest border-l border-b border-purple-500/10">
                  {lang === 'zh' ? '在线客服' : 'Active'}
                </div>
                
                <div className="my-auto py-4">
                  <DestinyDirectorCartoon 
                    expression="guiding" 
                    size="md" 
                    withBubble={true} 
                    bubbleText={lang === 'zh' ? '天星归轨，我在执笔聆听您的每一句疑惑。问财子、问宿契、问生涯，皆能指引未来！' : 'Astro pathways aligned. I am listening to outline your best life chapters!'}
                  />
                </div>

                <div className="border-t border-[#1e293b]/60 pt-4 w-full text-justify text-xs space-y-2 text-slate-400">
                  <p className="font-bold text-[#c084fc] flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                    <span>{lang === 'zh' ? '1v1 在线命理私塾' : '1v1 Personal Lounge'}</span>
                  </p>
                  <p className="text-[11px] leading-relaxed text-slate-400/90">
                    {lang === 'zh' 
                      ? '本周已有 2,341 位手机端同修在此化开烦恼。我们结合紫微格局的五行气数、十二宫缠度，免费提供智能对酌。' 
                      : 'Over 2,340 seekers optimized their decadal pivots here this week. Instant calculations tailored to your personal 12-grids.'}
                  </p>
                </div>
              </div>
            </div>
          )}

            {/* TAB CONTENT 3: AI EMOTIONAL STRESS ALIGNMENT THERAPIST */}
          {selectedTab === 'stress' && (
            <div className="bg-[#0f172a]/95 border-2 border-purple-950/40 rounded-2xl shadow-xl p-6 space-y-6 border-felt-stitching felt-texture">
              
              <div>
                <h3 className="text-base font-bold text-white tracking-widest">{t.stressTitle}</h3>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed">{t.stressDesc}</p>
              </div>

              {/* Stress interactive Selector */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5">
                {[
                  { zh: '深感焦虑 迷茫不已', en: 'Severe Anxiety & Dislocation_Lost', color: 'border-amber-600/50 text-amber-300' },
                  { zh: '狂躁多变 举步维艰', en: 'Irritability & Chaotic Fluctuations', color: 'border-red-600/50 text-red-300' },
                  { zh: '抑郁消沉 心池失能', en: 'Isolation & Emotional Voidness', color: 'border-indigo-600/50 text-indigo-300' },
                  { zh: '万事无感 机械枯燥', en: 'Apathy & Burnout Mechanics', color: 'border-sky-600/50 text-sky-300' },
                ].map((item, idx) => (
                  <div
                    key={idx}
                    onClick={() => setUserStressText(lang === 'zh' ? item.zh : item.en)}
                    className={`border p-3 rounded-xl cursor-pointer text-center text-xs transition-all hover:bg-[#1e293b]/40 ${item.color} ${
                      userStressText === item.zh || userStressText === item.en ? 'ring-2 ring-[#a855f7] bg-purple-950/10' : 'bg-[#0a0f1d]'
                    }`}
                  >
                    {lang === 'zh' ? item.zh : item.en}
                  </div>
                ))}
              </div>

              {/* Text Input area */}
              <div className="space-y-3">
                <textarea
                  value={userStressText}
                  onChange={(e) => setUserStressText(e.target.value)}
                  placeholder={t.stressPlaceholder}
                  rows={4}
                  className="w-full bg-[#0a0f1d] border border-[#1e293b] rounded-xl p-4 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-[#a855f7] focus:ring-1 focus:ring-[#a855f7]/30 transition-all font-mono"
                />

                <div className="flex items-center justify-between">
                  <span className="text-[11px] text-fuchsia-400 font-mono">
                    {lang === 'zh' ? `五行属性关联：${chart?.fiveElementsZh || "天盘常德"}` : `Associated Phase: ${chart?.fiveElementsEn || "Universal System"}`}
                  </span>
                  
                  <button
                    onClick={handleStressAlleviate}
                    disabled={stressAnalyzing || !userStressText.trim()}
                    className="bg-gradient-to-r from-pink-900 to-indigo-900 hover:from-pink-850 hover:to-indigo-850 border border-fuchsia-800 text-white px-6 py-2.5 rounded-xl text-xs font-semibold shadow-lg shadow-purple-950 transition-all flex items-center gap-1.5"
                  >
                    <HeartHandshake className="h-4 w-4 text-pink-300" />
                    <span>{stressAnalyzing ? (lang === 'zh' ? '正在祈宣破执仪轨...' : 'Re-aligning Celestial Channels...') : t.stressBtn}</span>
                  </button>
                </div>
              </div>

              {/* Stress alleviate remedy report result */}
              {stressTherapyResult && (
                <div className="bg-[#050912] border border-double border-pink-900/40 rounded-2xl p-5 space-y-4">
                  <h4 className="text-xs font-bold font-mono tracking-widest text-[#a855f7] uppercase flex items-center gap-1 border-b border-[#1e293b] pb-2">
                    <CheckCircle className="h-4 w-4 text-pink-400 animate-spin" style={{ animationDuration: '60s' }} />
                    <span>{lang === 'zh' ? '✨ 避厄开运 · 五行治愈心灵法旨' : '🌟 Spiritual Reconciliation & Element Balance Ritual'}</span>
                  </h4>
                  <div className="text-slate-300 text-xs leading-relaxed text-justify whitespace-pre-line space-y-3">
                    {stressTherapyResult}
                  </div>
                </div>
              )}

            </div>
          )}

          {/* TAB CONTENT 4: ASTRO-DISCOURSE COMMUNITY FORUM */}
          {selectedTab === 'forum' && (
            <div className="bg-[#0f172a]/95 border-2 border-purple-950/40 rounded-2xl shadow-xl p-6 space-y-6 border-felt-stitching felt-texture">
              
              <div className="border-b border-[#1e293b] pb-3">
                <h3 className="text-base font-bold text-white tracking-widest">{t.forumTitle}</h3>
                <p className="text-xs text-slate-400 mt-1">{lang === 'zh' ? '发布学习心得、询问疑难孤宿星，与全球同道共同探讨千古玄奥哲理。' : 'Publish insights, study codes, and debate with global astro practitioners.'}</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                
                {/* Submit Panel */}
                <div className="bg-[#0a0f1d] border border-slate-900 rounded-xl p-4 h-fit space-y-4">
                  <h4 className="text-xs font-bold text-[#c084fc] flex items-center gap-1.5 uppercase tracking-wider">
                    <Plus className="h-4 w-4" />
                    <span>{t.forumPostTitle}</span>
                  </h4>

                  <div className="space-y-3">
                    <input
                      type="text"
                      placeholder={t.forumTitlePl}
                      value={newPostTitle}
                      onChange={(e) => setNewPostTitle(e.target.value)}
                      className="w-full bg-[#050912] border border-[#1e293b] rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-[#a855f7] transition-all"
                    />
                    <textarea
                      placeholder={t.forumContentPl}
                      rows={5}
                      value={newPostContent}
                      onChange={(e) => setNewPostContent(e.target.value)}
                      className="w-full bg-[#050912] border border-[#1e293b] rounded-lg p-3 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-[#a855f7] transition-all resize-none"
                    />
                    
                    <button
                      onClick={handleCreateForumPost}
                      className="w-full bg-gradient-to-r from-purple-900 to-indigo-900 hover:from-purple-800 hover:to-[#5c13c7] text-white py-2 rounded-lg text-xs font-semibold shadow-md transition-all flex items-center justify-center gap-1.5"
                    >
                      <Send className="h-3.5 w-3.5" />
                      <span>{t.btnForumPost}</span>
                    </button>
                  </div>
                </div>

                {/* Listing posts boards */}
                <div className="md:col-span-2 space-y-4 max-h-[440px] overflow-y-auto pr-2 scrollbar-thin">
                  {forumPosts.length > 0 ? (
                    forumPosts.map((post) => (
                      <div
                        key={post.id}
                        className="bg-slate-900/10 border border-[#1e293b] p-4.5 rounded-xl space-y-3 text-justify hover:border-[#334155] transition-all"
                      >
                        <div className="flex justify-between items-start gap-4">
                          <div>
                            <h5 className="text-xs font-bold text-white leading-normal hover:text-purple-400 transition-colors uppercase">
                              {post.title}
                            </h5>
                            <span className="text-[10px] text-fuchsia-400 mt-1 block">
                              {lang === 'zh' ? '同修：' : 'Disciple: '}{post.userName}
                            </span>
                          </div>
                          
                          <button
                            onClick={() => handleLikePost(post.id, post.likesCount)}
                            className="bg-[#1e293b] hover:bg-[#334155] text-[#cbd5e1] border border-[#334155] text-[10px] px-2.5 py-1 rounded transition-colors flex items-center gap-1"
                          >
                            <span>👍 {post.likesCount}</span>
                          </button>
                        </div>

                        <p className="text-slate-300 text-xs leading-relaxed whitespace-pre-wrap font-sans">
                          {post.content}
                        </p>
                      </div>
                    ))
                  ) : (
                    <div className="text-slate-500 text-xs italic text-center py-16">
                      {lang === 'zh' ? '命河静悄悄，暂无同好讲经解盘。快发布您的第一帖，合印论道！' : 'Silence... Be the first to initiate astrological discussions!'}
                    </div>
                  )}
                </div>

              </div>

            </div>
          )}

          {/* TAB CONTENT 5: VIP ACCESS TO STUDY DATA CASE LIBRARY */}
          {selectedTab === 'vip' && (
            <div className="bg-[#0f172a]/95 border-2 border-purple-950/40 rounded-2xl shadow-xl p-6 space-y-6 border-felt-stitching felt-texture">
              
              <div className="border-b border-[#1e293b] pb-4">
                <h3 className="text-base font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 to-pink-500 tracking-wider flex items-center gap-2">
                  <Award className="h-6 w-6 text-yellow-400" />
                  <span>{t.vipTitle}</span>
                </h3>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed">{lang === 'zh' ? '探寻历史上数百位古代名仕大贤、富商巨贾的经典紫微格宿原件盘，参悟生灭轨迹。' : 'Sieve through classical astro profiles of historical nobles, wealthy merchants to deduce cosmic structures.'}</p>
              </div>

              {/* VIP check condition */}
              {!isPremium ? (
                <div className="relative overflow-hidden border border-double border-yellow-700/50 rounded-2xl p-8 text-center space-y-5 bg-gradient-to-b from-yellow-950/15 to-[#0f172a]">
                  <div className="absolute top-0 right-0 h-28 w-28 bg-yellow-500/5 rounded-full blur-3xl"></div>
                  
                  <div className="mx-auto h-12 w-12 bg-yellow-505/20 rounded-full border border-yellow-600 flex items-center justify-center text-yellow-400 shadow-md">
                    <Lock className="h-6 w-6 animate-bounce" />
                  </div>

                  <div className="space-y-2">
                    <h4 className="text-sm font-bold text-yellow-500 uppercase tracking-widest">{t.paymentTitle}</h4>
                    <p className="text-xs text-slate-300 max-w-md mx-auto leading-relaxed">{t.paymentText}</p>
                    <p className="text-[11px] text-fuchsia-300">{t.vipLocks}</p>
                  </div>

                  <button
                    onClick={triggerUpgradeVip}
                    className="bg-gradient-to-tr from-yellow-500 via-amber-400 to-yellow-300 hover:from-yellow-600 hover:to-amber-500 text-slate-950 font-bold text-xs py-2.5 px-8 rounded-xl shadow-lg shadow-yellow-500/10 transition-all animate-pulse"
                  >
                    {t.vipBtn}
                  </button>
                </div>
              ) : (
                <div className="space-y-6 animate-fade-in">
                  
                  <div className="bg-[#050912] border border-[#065f46] text-emerald-400 p-4 rounded-xl flex items-center gap-3">
                    <ShieldCheck className="h-6 w-6" />
                    <div>
                      <h4 className="text-xs font-bold">{t.vipSuccess}!</h4>
                      <p className="text-[10px] text-emerald-500/80 mt-0.5">{lang === 'zh' ? '您目前拥有无限次读取古今案例阁特约批语及AI极速全幅大运报告的权利。' : 'Unlimited authorizations enabled globally.'}</p>
                    </div>
                  </div>

                  {/* Elite vaults library cases */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {[
                      {
                        title: "古之圣贤：诸葛孔明 (Zhuge Liang Layout)",
                        structure: "【石中隐玉 / 极向离明格】",
                        desc: "命宫坐申，太阴得。主星紫微失陷。生平巨门引偏，一生智虑极绝，操劳成瘁之结构象义批斗。",
                        tips: "后进批语：太阴失陷需左辅右弼相扶，宜在北方、西南开拓大功。"
                      },
                      {
                        title: "汉高祖：刘邦大格局 (Emperor Liu Bang)",
                        structure: "【紫府朝垣格 / 双禄夹命】",
                        desc: "命宫寅，武曲破军合星大开，左右吉星夹拱。生平多震荡而终能归于一统天枢大宿。",
                        tips: "后进批语：禄存见天马，一生成就极快得大贵人相扶，但防儿女刑克。"
                      }
                    ].map((item, id) => (
                      <div
                        key={id}
                        className="bg-slate-900/30 border border-yellow-950/40 hover:border-yellow-600/30 p-5 rounded-2xl space-y-3 transition-colors"
                      >
                        <div className="flex justify-between items-start border-b border-yellow-950/20 pb-2">
                          <h5 className="text-xs font-bold text-yellow-500 uppercase">{item.title}</h5>
                          <span className="text-[10px] text-fuchsia-400 font-mono italic">{item.structure}</span>
                        </div>
                        <p className="text-slate-300 text-xs leading-relaxed text-justify">{item.desc}</p>
                        <div className="bg-[#111c38]/20 border border-[#1e293b] p-2.5 rounded-lg text-[11px] text-[#cbd5e1] text-justify font-sans">
                          {item.tips}
                        </div>
                      </div>
                    ))}
                  </div>

                </div>
              )}

            </div>
          )}

          {/* TAB CONTENT 6: VIRAL SHARE TO EARN SYSTEM */}
          {selectedTab === 'earn' && (
            <PartnerEarnCenter
              lang={lang}
              chart={chart}
              partnerJoined={partnerJoined}
              setPartnerJoined={setPartnerJoined}
              partnerReferralCode={partnerReferralCode}
              setPartnerReferralCode={setPartnerReferralCode}
              partnerClicks={partnerClicks}
              setPartnerClicks={setPartnerClicks}
              partnerSignups={partnerSignups}
              partnerUnlocks={partnerUnlocks}
              partnerBalance={partnerBalance}
              setPartnerBalance={setPartnerBalance}
              partnerWithdrawn={partnerWithdrawn}
              setPartnerWithdrawn={setPartnerWithdrawn}
            />
          )}

        </section>

      </main>

      {/* FOOTER SECTION */}
      <footer className="border-t border-[#1e293b]/60 bg-[#070b12] py-8 text-center text-xs text-[#64748b] print:hidden">
        <div className="max-w-7xl mx-auto px-4 space-y-2">
          <p>© 2026 紫微戏命师 Divination Studio. All Celestial Coordinates Synchronized.</p>
          <p className="text-[10px] text-fuchsia-600/80">本软件属于中华传统命理文化数值排盘研究，提供积极主动的人文智慧关怀，请理性参考人生命运，正向生活。</p>
        </div>
      </footer>

      {/* 🔮 戏命师说明书 & 3D玩偶互动中心 / CHARACTER MANUAL MODAL */}
      {isManualOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in print:hidden">
          <div className="bg-[#090514] border-2 border-[#a855f7]/80 rounded-3xl max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-[0_0_50px_rgba(168,85,247,0.4)] relative flex flex-col md:flex-row">
            
            {/* Close button */}
            <button 
              onClick={() => setIsManualOpen(false)}
              className="absolute top-4 right-4 text-[#c084fc] hover:text-white bg-[#1e0f33] border border-purple-500/20 p-2 rounded-full transition-all hover:scale-110 z-10"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            {/* Left Box: 3D-Felt Doll Expression Playground */}
            <div className="w-full md:w-2/5 bg-gradient-to-b from-[#180930] to-[#0a0316] p-6 flex flex-col items-center justify-center border-b md:border-b-0 md:border-r border-purple-500/10">
              <span className="text-[10px] text-yellow-400 font-mono tracking-widest uppercase mb-1">Interactive Felt Toy</span>
              <h3 className="text-sm font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 to-pink-500 font-sans tracking-wide">3D绒球玩偶心境</h3>
              
              {/* Dynamic Cartoon Model */}
              <div className="my-6">
                <DestinyDirectorCartoon 
                  expression={manualExpression} 
                  size="xl" 
                  withBubble={true}
                  bubbleText={
                    manualExpression === 'observing'
                      ? (lang === 'zh' ? '天星运转，紫微为墨！老夫来看本殿星局盘线 🔭' : 'Heavenly transits mapped closely. Peer into this house line!')
                      : manualExpression === 'analyzing'
                      ? (lang === 'zh' ? '推演命运星图，洞见先机避过浮生惊涛呢！' : 'Calculating destiny transits to navigate the stormy waters!')
                      : manualExpression === 'writing'
                      ? (lang === 'zh' ? '大运虽至，运笔在手。写下心头压力，一笔勾销 ✍️' : 'Write down your stress notes, and I shall cross it off cleanly!')
                      : (lang === 'zh' ? '指引漫漫路，顺缘而行。您就是人生的剧本主角！' : 'You are the supreme master player of your own life script!')
                  }
                />
              </div>

              {/* Expression selectors / Poses List */}
              <div className="grid grid-cols-2 gap-2 w-full mt-4">
                {[
                  { id: 'observing', label: '观察命盘', desc: 'Peering chart', icon: '🔭' },
                  { id: 'analyzing', label: '解析运势', desc: 'Analyzing', icon: '✨' },
                  { id: 'writing', label: '执笔批命', desc: 'Writing Desk', icon: '✍️' },
                  { id: 'guiding', label: '指引未来', desc: 'Guiding', icon: '🔮' }
                ].map((pos) => (
                  <button
                    key={pos.id}
                    onClick={() => setManualExpression(pos.id as any)}
                    className={`p-2 rounded-xl text-center border transition-all text-xs flex flex-col items-center justify-center gap-1 ${
                      manualExpression === pos.id
                        ? 'bg-gradient-to-tr from-[#701a75]/70 to-[#4c1d95]/70 border-yellow-500 text-yellow-300 font-bold'
                        : 'bg-[#120822] border-purple-500/10 text-slate-400 hover:text-white hover:border-purple-500/30'
                    }`}
                  >
                    <span className="text-lg">{pos.icon}</span>
                    <span className="font-bold">{lang === 'zh' ? pos.label : pos.desc}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Right Box: Immersive character introduction profile */}
            <div className="w-full md:w-3/5 p-8 flex flex-col justify-between space-y-6">
              
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="bg-yellow-500 text-slate-950 font-black px-2.5 py-1 text-xs rounded-lg uppercase tracking-wider shadow-inner font-mono">
                    3D Mascot
                  </div>
                  <h2 className="text-lg font-black text-white tracking-widest font-sans">
                    戏命师 <span className="text-yellow-400">·</span> 灵笈秘录
                  </h2>
                </div>

                <div className="bg-[#120822] border border-purple-500/15 p-4 rounded-2xl relative">
                  <span className="absolute top-0 right-4 translate-y-[-50%] text-[8px] bg-[#3b0764] text-purple-300 px-2 py-0.5 rounded-full uppercase font-mono border border-purple-500/30">Introduction</span>
                  <p className="text-xs text-[#cbd5e1] leading-relaxed text-left text-justify">
                    我是 **戏命师**，紫微斗数的金牌执笔掌盘人。我以星宿作墨，以命盘为剧本，为您解读运程之宿命伏笔，拨看前途雾影。
                  </p>
                  <p className="text-xs text-[#a78bfa] mt-2 leading-relaxed text-justify">
                    “在这盘星辰交叠的主角剧本里，天宫斗转，福禄连缀。每个人都是自己宇宙的终极执笔人！✍️”
                  </p>
                </div>

                {/* Craft highlight specifications panel */}
                <div className="space-y-3">
                  <h4 className="text-xs font-bold text-yellow-400 tracking-wider flex items-center gap-1">
                    <span>🌟 手工立体羊毛毡材质规格 / 3D Felt Specifications:</span>
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    <div className="bg-slate-900/40 p-3 rounded-xl border border-slate-800">
                      <span className="text-fuchsia-400 font-bold block mb-1">🧶 3D羊毛变微糙滤镜</span>
                      <p className="text-[10px] text-slate-400 leading-relaxed">组件中包含微型噪点运算，边缘模拟毛茸纹理，凸显极高现实手作质感。</p>
                    </div>
                    <div className="bg-slate-900/40 p-3 rounded-xl border border-slate-800">
                      <span className="text-fuchsia-400 font-bold block mb-1">🔮 福源阴阳佩</span>
                      <p className="text-[10px] text-slate-400 leading-relaxed">前襟配带白墨双鱼阴阳坠，在五格命理计算中防凶化吉，守护好运气场。</p>
                    </div>
                    <div className="bg-slate-900/40 p-3 rounded-xl border border-slate-800">
                      <span className="text-fuchsia-400 font-bold block mb-1">✨ 天星紫霞眸</span>
                      <p className="text-[10px] text-slate-400 leading-relaxed">运用深紫径向渐变，极高反差双星高光，直观烘托博学仙侠气质。</p>
                    </div>
                    <div className="bg-slate-900/40 p-3 rounded-xl border border-slate-800">
                      <span className="text-fuchsia-400 font-bold block mb-1">✍️ 精英顾问多态切换</span>
                      <p className="text-[10px] text-slate-400 leading-relaxed">完美囊括观察、推演、抚慰等深度国潮动画形象，体验倍增温暖。</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action buttons */}
              <div className="border-t border-purple-500/10 pt-4 flex flex-col sm:flex-row gap-3">
                <button
                  onClick={() => {
                    setSelectedTab('consult');
                    setSelectedMaster('director_xi');
                    setIsManualOpen(false);
                  }}
                  className="flex-1 bg-gradient-to-r from-purple-600 to-fuchsia-600 hover:from-purple-700 hover:to-fuchsia-700 text-white text-xs font-bold py-2.5 px-4 rounded-xl text-center shadow-lg transition-all"
                >
                  💬 立即与本戏命师 1v1 私聊对话
                </button>
                <button
                  onClick={() => setIsManualOpen(false)}
                  className="flex-1 bg-slate-900 hover:bg-slate-800 text-[#c084fc] text-xs font-bold py-2.5 px-4 rounded-xl text-center border border-purple-500/20 transition-all"
                >
                  📖 退出并自掌星盘
                </button>
              </div>

            </div>

          </div>
        </div>
      )}

      {/* 🔮 FLOATING MASCOT BUTTON */}
      <button
        onClick={() => {
          setIsManualOpen(true);
        }}
        className="fixed bottom-6 right-6 z-40 bg-gradient-to-tr from-fuchsia-700 to-indigo-700 hover:from-fuchsia-600 hover:to-indigo-600 text-white font-bold p-3 rounded-full shadow-[0_8px_30px_rgba(168,85,247,0.4)] border-2 border-yellow-400/80 transition-all hover:scale-110 flex items-center gap-2 group print:hidden animate-pulse"
      >
        <span className="text-lg">🔮</span>
        <span className="text-xs font-black tracking-widest max-w-0 overflow-hidden group-hover:max-w-[120px] transition-all duration-300 whitespace-nowrap">
          {lang === 'zh' ? '戏命馆秘籍' : 'Companion Manual'}
        </span>
      </button>

    </div>
  );
}
