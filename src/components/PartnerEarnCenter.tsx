import React, { useState } from 'react';
import { Award, Share2, Clipboard, CheckCircle, Gift, ArrowRight, Download, CreditCard } from 'lucide-react';
import { DestinyDirectorCartoon } from './DestinyDirectorCartoon';
import { playAstroAudio } from '../lib/audio';

interface PartnerEarnCenterProps {
  lang: 'zh' | 'en';
  chart: any;
  partnerJoined: boolean;
  setPartnerJoined: (joined: boolean) => void;
  partnerReferralCode: string;
  setPartnerReferralCode: (code: string) => void;
  partnerClicks: number;
  setPartnerClicks: React.Dispatch<React.SetStateAction<number>>;
  partnerSignups: number;
  partnerUnlocks: number;
  partnerBalance: number;
  setPartnerBalance: React.Dispatch<React.SetStateAction<number>>;
  partnerWithdrawn: number;
  setPartnerWithdrawn: React.Dispatch<React.SetStateAction<number>>;
}

export function PartnerEarnCenter({
  lang,
  chart,
  partnerJoined,
  setPartnerJoined,
  partnerReferralCode,
  setPartnerReferralCode,
  partnerClicks,
  setPartnerClicks,
  partnerSignups,
  partnerUnlocks,
  partnerBalance,
  setPartnerBalance,
  partnerWithdrawn,
  setPartnerWithdrawn
}: PartnerEarnCenterProps) {
  
  // Internal view & interactive states
  const [partnerTier, setPartnerTier] = useState<'bronze' | 'silver' | 'gold'>('bronze');
  const [cashoutAmount, setCashoutAmount] = useState<string>("");
  const [cashoutAccount, setCashoutAccount] = useState<string>("");
  const [cashoutMethod, setCashoutMethod] = useState<'alipay' | 'wechat'>('alipay');
  const [cashoutMessage, setCashoutMessage] = useState<string>("");
  const [isPosterSaved, setIsPosterSaved] = useState<boolean>(false);
  const [partnerTransactions, setPartnerTransactions] = useState<any[]>([
    { id: 1, label: lang === 'zh' ? "合伙人零门槛注册激活礼金" : "Zero-barrier Registration Bonus", amount: 12.80, date: "2026-05-31", status: lang === 'zh' ? "已到账" : "Credited" }
  ]);

  // Live rotating news ticker withdrawals to boost FOMO psychological desire
  const liveWithdrawals = [
    { id: 1, name: "梦金陵**", amount: "￥88.00", time: "2分钟前", m: "支付宝" },
    { id: 2, name: "命不孤单", amount: "￥12.80", time: "4分钟前", m: "微信零钱" },
    { id: 3, name: "天星居士", amount: "￥199.00", time: "9分钟前", m: "支付宝" },
    { id: 4, name: "紫阳洞天", amount: "￥45.00", time: "15分钟前", m: "微信钱包" },
    { id: 5, name: "Olivia_S", amount: "￥120.00", time: "28分钟前", m: "支付宝" }
  ];

  // Join Action
  const handleJoinPartner = () => {
    playAstroAudio('success');
    setPartnerJoined(true);
    localStorage.setItem('local_partner_joined', 'true');
    setPartnerBalance(12.80);
    
    // Generate code
    let generatedCode = localStorage.getItem('local_referral_code');
    if (!generatedCode) {
      generatedCode = "PLAY-" + Math.floor(1000 + Math.random() * 9000);
      localStorage.setItem('local_referral_code', generatedCode);
    }
    setPartnerReferralCode(generatedCode);
  };

  // Upgradable mechanism when criteria met
  const handleUpgradeTier = (target: 'silver' | 'gold') => {
    playAstroAudio('success');
    if (target === 'silver') {
      setPartnerTier('silver');
      setPartnerBalance(prev => prev + 10.00); // ￥10 bonus on upgrade
      setPartnerTransactions(prev => [
        { id: Date.now(), label: lang === 'zh' ? "晋升‘银牌星官’特权大礼包" : "Elite Silver Tier Promotion Bonus", amount: 10.00, date: "2026-05-31", status: lang === 'zh' ? "已到账" : "Credited" },
        ...prev
      ]);
      alert(lang === 'zh' 
        ? "🎊 恭喜！您已无门槛一键满足升级！成功册封为‘银牌执掌星官’，返佣分成率由 20% 调高至 35%，并为您打入 ￥10.00 奖励金！" 
        : "🎊 Congrats! Upgraded to Silver Messenger! Commission rate raised to 35%, and +$10.00 bonus credited into your wallet!");
    } else {
      setPartnerTier('gold');
      setPartnerBalance(prev => prev + 25.00); // ￥25 bonus on gold upgrade
      setPartnerTransactions(prev => [
        { id: Date.now(), label: lang === 'zh' ? "册封‘金牌天之骄子国师’大印礼包" : "Imperial Gold Tier Sovereign Bonus", amount: 25.00, date: "2026-05-31", status: lang === 'zh' ? "已到账" : "Credited" },
        ...prev
      ]);
      alert(lang === 'zh' 
        ? "☀️ 宏图大展！您成功晋升为终极‘黄金至尊国师’，返佣比例疯狂调高至 50%，并享有 ￥25.00 元国师授玺奖金！" 
        : "☀️ Celestial Peak! Upgraded to Gold Sovereign! Enjoy the ultimate 50% commission rate with a +$25.00 bonus!");
    }
  };

  // Execute payout withdrawal instantly
  const handleExecuteWithdrawal = () => {
    const amt = parseFloat(cashoutAmount);
    if (!cashoutAccount.trim()) {
      playAstroAudio('swoosh');
      alert(lang === 'zh' ? "⚠️ 请先输入打款收款账号。" : "⚠️ Please enter your receiving account.");
      return;
    }
    if (isNaN(amt) || amt < 1.0) {
      playAstroAudio('swoosh');
      alert(lang === 'zh' ? "⚠️ 最小提取起兑金额为 ￥1.00 元。" : "⚠️ Minimum cashout is ￥1.00.");
      return;
    }
    if (amt > partnerBalance) {
      playAstroAudio('swoosh');
      alert(lang === 'zh' ? `⚠️ 余额不足。当前最大可额度为 ￥${partnerBalance.toFixed(2)}。` : `⚠️ Insufficient Balance. Maximum is ￥${partnerBalance.toFixed(2)}.`);
      return;
    }

    playAstroAudio('cashout');
    setPartnerBalance(prev => prev - amt);
    setPartnerWithdrawn(prev => prev + amt);
    setPartnerTransactions(prev => [
      { id: Date.now(), label: lang === 'zh' ? `一键极速出纳到-[${cashoutMethod === 'alipay' ? '支付宝' : '微信钱包'}]` : `Auto-withdrawn to [${cashoutMethod === 'alipay' ? 'Alipay' : 'WeChat'}]`, amount: -amt, date: "2026-05-31", status: lang === 'zh' ? "到账成功" : "Success" },
      ...prev
    ]);
    
    setCashoutMessage(lang === 'zh' 
      ? `💸 免签闪电划款成功！星曜网关已成功将 ￥${amt.toFixed(2)} 打入账号 [${cashoutAccount}]（免受任何手续费），请及时在 1-3 分钟内核实对账。` 
      : `💸 Flash cashout succeeded! $${amt.toFixed(2)} has been forwarded to account [${cashoutAccount}] at zero service cost.`);
    setCashoutAmount("");
  };

  // Referral Copywriting Link
  const getReferralLink = () => {
    return `${window.location.origin}/?ref=${partnerReferralCode}`;
  };

  const handleCopyLink = () => {
    playAstroAudio('bell');
    const textToCopy = lang === 'zh'
      ? `🔮【我惊呆了，这AI紫微排大运太准了！】我刚刚用「紫微戏命师」排了命宫和流年盘，3D手工毛茸玩具执笔人解盘实在太一针见血了！现在扫码或点击连线可享 9 折限时结缘福利，一起看看你的福禄：\n👉 ${getReferralLink()}`
      : `🔮【This is spot-on !】I just checked my Zi Wei decadal chart with 'Destiny Director'. The interactive Felt doll guide solved all my stress nodes! Connect under my partner link for an exclusive 10% discount:\n👉 ${getReferralLink()}`;
    
    navigator.clipboard.writeText(textToCopy);
    setPartnerClicks(prev => prev + 1); // increment simulated click activity
    alert(lang === 'zh' 
      ? "📋 裂变推广软文已成功存入您的剪贴板！可以直接发送给好友或者微信群，朋友每次测算您都躺收高额佣金！" 
      : "📋 Referral copywriting copied to clipboard! Share it with friends or groups to secure massive split rewards.");
  };

  return (
    <div className="space-y-6">
      
      {/* FOMO Live horizontal ticker banner */}
      <div className="bg-[#050814] border border-yellow-500/10 rounded-xl px-4 py-2 flex items-center gap-3 select-none">
        <span className="animate-pulse bg-red-950 text-red-400 font-mono text-[9px] px-2 py-0.5 rounded-full font-black uppercase tracking-wider border border-red-500/10 shrink-0">
          Live Cashouts
        </span>
        <div className="h-5 overflow-hidden w-full text-[11px] text-slate-400 font-mono">
          <div className="animate-marquee space-y-1" style={{ animation: 'tickerSlides 14s linear infinite' }}>
            {liveWithdrawals.map((item) => (
              <div key={item.id} className="flex justify-between items-center text-left">
                <span>
                  🎉 {lang === 'zh' ? '合伙人' : 'Partner'} <strong className="text-yellow-400 font-bold">{item.name}</strong> {lang === 'zh' ? '通过' : 'via'} {item.m} {lang === 'zh' ? '极速提取' : 'cashed'} <strong className="text-emerald-400">{item.amount}</strong>
                </span>
                <span className="text-slate-500 text-[10px]">{item.time}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* NOT IN THE PROGRAM -> LANDING SCREEN */}
      {!partnerJoined ? (
        <div className="bg-gradient-to-b from-[#150a31] to-[#04010a] border-2 border-yellow-600/35 rounded-2xl p-8 text-center space-y-6 relative overflow-hidden border-felt-stitching felt-texture shadow-[0_0_40px_rgba(245,158,11,0.15)] animate-fade-in text-left">
          
          <div className="absolute top-[-25px] left-[-25px] opacity-10 font-calligraphy text-8xl text-yellow-500 select-none">福</div>
          <div className="absolute bottom-[-25px] right-[-25px] opacity-10 font-calligraphy text-8xl text-yellow-500 select-none">财</div>

          <div className="flex justify-center -my-2 select-none">
            <DestinyDirectorCartoon 
              expression="guiding" 
              size="xl" 
              withBubble={true} 
              bubbleText={lang === 'zh' ? "来和老夫一起赚赏金学易理，动动手指就提现！🪙" : "Earn passive gold together with me while guiding people! 🪙"} 
            />
          </div>

          <div className="text-center space-y-2">
            <h4 className="text-lg font-black text-yellow-400 font-calligraphy tracking-widest">
              {lang === 'zh' ? '🔑 开启紫微戏命阁 · 零门槛拼图赚金计划' : '🔑 Activate Free Destiny Partner Commission Circle'}
            </h4>
            <p className="text-xs text-slate-300 max-w-xl mx-auto leading-relaxed text-justify md:text-center">
              {lang === 'zh' 
                ? '在这里，人人都是天盘批命执笔人！无需投入任何资金与个人隐私，只需动动手指邀请同好测算。好友测算享特惠折扣，您可坐享高至 50% 阶梯分红，即提即到，快乐套现，病毒式自发传播裂变！' 
                : 'Zero assets down, zero privacy leaks. Help friends unlock their astral potentials while enjoying up to 50% scaling rewards. Cashout starts instantly on AliPay/WeChat.'}
            </p>
          </div>

          {/* Core incentives list */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-4xl mx-auto pt-2">
            <div className="bg-slate-950/70 border border-slate-800 p-4 rounded-xl space-y-1 hover:border-yellow-600/20 transition-all">
              <span className="text-yellow-400 font-bold block text-xs">① 免注册秒开通 🗝️</span>
              <p className="text-[10px] text-slate-400 leading-relaxed">无需手机号验证，一键绑定并获取独一无一的星轨代号，开启赚赏通道。</p>
            </div>
            <div className="bg-slate-950/70 border border-slate-800 p-4 rounded-xl space-y-1 hover:border-yellow-600/20 transition-all">
              <span className="text-yellow-400 font-bold block text-xs">② 文创海报吸睛 🎆</span>
              <p className="text-[10px] text-slate-400 leading-relaxed">一键生成Q版羊毛毡执笔人萌翻海报，自带二维码与趣味段子，转化率裂变暴增。</p>
            </div>
            <div className="bg-slate-950/70 border border-slate-800 p-4 rounded-xl space-y-1 hover:border-yellow-600/20 transition-all">
              <span className="text-yellow-400 font-bold block text-xs">③ ￥1.0 无门槛秒提 🧧</span>
              <p className="text-[10px] text-slate-400 leading-relaxed">提现没有套路！只要大于1元随时发起兑换，支付宝与微信实时到账通知。</p>
            </div>
          </div>

          <div className="text-center pt-3 space-y-3">
            <button
              onClick={handleJoinPartner}
              className="bg-gradient-to-r from-yellow-500 via-amber-400 to-yellow-300 hover:from-yellow-600 hover:to-amber-500 text-slate-950 font-black text-xs py-3.5 px-8 rounded-xl shadow-[0_4px_25px_rgba(245,158,11,0.25)] transition-all hover:scale-105 active:scale-95 animate-pulse uppercase tracking-wider block mx-auto"
            >
              🎉 {lang === 'zh' ? '一键开启合伙人名册（立送 ¥12.8 内测金）' : 'Activate Free Affiliate Hub (+ ¥12.8 Bonus) ✨'}
            </button>
            <p className="text-[10px] text-slate-500 font-mono">© ALL EARNING SYSTEMS ARE PROTECTED BY SHA256 DEVICE CRYPTO LOCKS.</p>
          </div>

        </div>
      ) : (
        
        // REWARDS MANAGEMENT CONTROL BOARD
        <div className="space-y-6 animate-fade-in text-left">
          
          {/* STATS OVERVIEW CARDS */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            
            {/* Wallet Balance box */}
            <div className="md:col-span-2 bg-[#090a18] border border-yellow-600/30 p-5 rounded-2xl flex flex-col justify-between relative overflow-hidden shadow-inner">
              <div className="absolute top-0 right-0 bg-yellow-500/10 text-yellow-400 text-[8px] font-bold px-2 py-0.5 rounded-bl font-mono">
                CURRENT BAG
              </div>
              <div className="space-y-1">
                <span className="text-slate-400 text-[10px] uppercase font-bold tracking-wider">{lang === 'zh' ? '可自主提现奖金' : 'Withdrawable Rewards'}</span>
                <div className="flex items-baseline gap-1.5 font-mono">
                  <span className="text-sm text-yellow-500 font-bold">￥</span>
                  <strong className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 to-amber-200">
                    {partnerBalance.toFixed(2)}
                  </strong>
                </div>
              </div>
              <div className="mt-3 text-[10px] text-slate-500 flex justify-between pr-2 border-t border-purple-500/5 pt-2 font-mono">
                <span>{lang === 'zh' ? '已提取总额:' : 'Total Cashed:'} ￥{partnerWithdrawn.toFixed(2)}</span>
                <span className="text-emerald-400">{lang === 'zh' ? '提现零扣费' : '0 Fee Cashout'}</span>
              </div>
            </div>

            {/* Promo Code Box */}
            <div className="bg-slate-900/60 border border-slate-800 p-5 rounded-2xl flex flex-col justify-between relative font-mono">
              <div className="absolute top-0 right-0 text-slate-600 text-[8px] p-0.5 select-none font-bold">ID CODE</div>
              <div className="space-y-0.5">
                <span className="text-slate-400 text-[10px] font-sans block">{lang === 'zh' ? '本命专属御命代号' : 'Referral ID Code'}</span>
                <strong className="text-lg text-yellow-400 font-black block tracking-widest">{partnerReferralCode}</strong>
              </div>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(partnerReferralCode);
                  alert(lang === 'zh' ? `代号 [${partnerReferralCode}] 已成功复制，好友在排盘时填入即享9折福利优惠。` : `Code [${partnerReferralCode}] Copied!`);
                }}
                className="text-[9px] text-[#cbd5e1] hover:text-white border border-purple-500/20 px-2 py-1 rounded bg-[#1e0f33]/30 transition-colors mt-2 text-center"
              >
                {lang === 'zh' ? '复制优惠码' : 'Copy Code'}
              </button>
            </div>

            {/* Simulated Live Traffic Ledger Box */}
            <div className="bg-[#0b0c1b]/80 border border-slate-800 p-5 rounded-2xl flex flex-col justify-between relative font-mono">
              <span className="text-slate-400 text-[10px] font-sans block">{lang === 'zh' ? '我的星流战报' : 'My Campaign Traffic'}</span>
              <div className="grid grid-cols-3 gap-1 grid-flow-row text-center mt-2">
                <div>
                  <strong className="text-white text-sm block">{partnerClicks}</strong>
                  <span className="text-[8px] text-slate-500">点击</span>
                </div>
                <div>
                  <strong className="text-fuchsia-400 text-sm block">{partnerSignups}</strong>
                  <span className="text-[8px] text-slate-500">学徒</span>
                </div>
                <div>
                  <strong className="text-yellow-400 text-sm block">{partnerUnlocks}</strong>
                  <span className="text-[8px] text-slate-500">裂变单</span>
                </div>
              </div>
              <span className="text-[8px] text-emerald-400 mt-2 block font-sans">转化效率超越全国 95% 盟主</span>
            </div>

          </div>

          {/* STEP TIER MAP WITH ONE-CLICK INTERACTIVE DEMO ACCELERATORS */}
          <div className="bg-[#140a2f]/20 border border-purple-500/10 p-5 rounded-2xl space-y-4">
            
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-purple-500/10 pb-3">
              <div className="space-y-1">
                <h5 className="text-xs font-bold text-slate-100 flex items-center gap-1.5">
                  <span>🌟 {lang === 'zh' ? '当前盟主封赏星阶：' : 'Current Rank:'}</span>
                  <span className={`px-2 py-0.5 rounded text-[10px] uppercase font-mono font-black ${
                    partnerTier === 'bronze' 
                      ? 'bg-amber-950 text-amber-300 border border-amber-600/30 animate-pulse' 
                      : partnerTier === 'silver' 
                      ? 'bg-slate-800 text-slate-300 border border-slate-500/30' 
                      : 'bg-yellow-950 text-yellow-300 border border-yellow-500/40 font-bold'
                  }`}>
                    {partnerTier === 'bronze' ? '铜牌执命人' : partnerTier === 'silver' ? '银牌掌理星使' : '招财至尊黄金国师'}
                  </span>
                </h5>
                <p className="text-[10px] text-slate-400 leading-relaxed text-justify">
                  {partnerTier === 'bronze' 
                    ? '基本提成扣率：20%（每次好友解锁报告，您得 ￥4.0 元）。检测到您当前裂变学徒数已达标 (3 / 3 人)！快升级得银牌 35% 返佣提成：' 
                    : partnerTier === 'silver'
                    ? '中阶提成率：35%（好友购买您直得 ￥7.0 提成）。学徒人数达到10名即可突破解锁 Gold 黄金国师，专享 50% （得¥10元/单）高分红！'
                    : '至高黄金国师：享受终极 50% 分佣（每位好友购买您直接在支付宝/微信分成 ￥9.95 元！）'
                  }
                </p>
              </div>

              {/* Action Interactive upgraders: ZERO frictional hurdles */}
              {partnerTier === 'bronze' && (
                <button
                  onClick={() => handleUpgradeTier('silver')}
                  className="bg-gradient-to-r from-yellow-500 to-amber-500 hover:from-yellow-600 hover:to-amber-600 text-slate-950 font-black text-[10px] py-1.5 px-3 rounded-lg transition-all shadow-[0_0_15px_rgba(245,158,11,0.25)] hover:scale-105 active:scale-95 shrink-0"
                >
                  ⚡ {lang === 'zh' ? '点击尊享一键免费晋升银牌 (+10.0金)' : 'Interactive Level Up (+ $10.0 Bonus)'}
                </button>
              )}

              {partnerTier === 'silver' && (
                <button
                  onClick={() => handleUpgradeTier('gold')}
                  className="bg-gradient-to-r from-yellow-500 to-amber-500 hover:from-yellow-600 hover:to-amber-600 text-slate-950 font-black text-[10px] py-1.5 px-3 rounded-lg transition-all shadow-[0_0_15px_rgba(245,158,11,0.25)] hover:scale-105 active:scale-95 shrink-0"
                >
                  👑 {lang === 'zh' ? '一键登顶黄金国师段位 (+25.0金)' : 'Imperial Sovereign Ascension (+ $25.0)'}
                </button>
              )}

            </div>

            {/* Visual Progress Line */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-[10px] text-slate-500">
                <span>裂变关系链注册树 (Member progress)</span>
                <span className="font-mono text-yellow-400">{partnerTier === 'bronze' ? '3 / 3 (达标)' : partnerTier === 'silver' ? '3 / 10 满额解锁' : '10 / 10 (国师神坛已至)'}</span>
              </div>
              <div className="w-full bg-[#120822] h-2.5 rounded-full overflow-hidden border border-purple-500/10 relative">
                <div 
                  className="bg-gradient-to-r from-yellow-500 via-amber-400 to-yellow-300 h-full transition-all duration-700" 
                  style={{ width: partnerTier === 'bronze' ? '100%' : partnerTier === 'silver' ? '35%' : '100%' }}
                ></div>
              </div>
            </div>

          </div>

          {/* TWO MAIN COLUMNS: CONTENT SPLIT COPY AND SMARTPHONE CARD GENERATOR */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-3">
            
            {/* Writing Copy Panel */}
            <div className="bg-slate-900/40 border border-slate-800 p-5 rounded-2xl flex flex-col justify-between space-y-4">
              <div className="space-y-1">
                <h6 className="text-xs font-bold text-yellow-400 flex items-center gap-1">
                  <Share2 className="h-4 w-4" />
                  <span>📲 必发爆款裂变软文文案</span>
                </h6>
                <p className="text-[10px] text-slate-400 leading-relaxed text-justify">
                  点击按钮自动复制独创的国潮传统与搞笑双向裂变辞文，极易引起小红书、微信朋友圈、情感互助群广泛讨论。
                </p>
              </div>

              {/* Raw preview area */}
              <div className="bg-[#050813] border border-purple-500/15 p-3 rounded-xl font-mono text-[10px] text-slate-300 leading-relaxed max-h-32 overflow-y-auto block select-all select-none">
                🏮 【震惊，这盘算得太准了！】我刚刚用「紫微戏命师」精算了我的财禄十年大限流年！这个3D微糙羊毛毡执笔师把各种命理关卡和心灵压力算得太准了！快来看看你的福泽：
                <br />
                <span className="text-yellow-400 block mt-1 tracking-wider font-mono bg-yellow-400/5 py-1 px-1.5 rounded">{getReferralLink()}</span>
              </div>

              <button
                onClick={handleCopyLink}
                className="w-full bg-gradient-to-r from-purple-800 via-fuchsia-800 to-indigo-800 hover:from-purple-700 hover:to-indigo-700 text-white text-xs font-bold py-2.5 px-4 rounded-xl flex items-center justify-center gap-2 shadow-md transition-all active:scale-95"
              >
                <Clipboard className="h-3.5 w-3.5 text-yellow-300" />
                <span>一键复制锁客推广语</span>
              </button>
            </div>

            {/* Poster Canvas block */}
            <div className="bg-[#05030e] border-2 border-yellow-600/35 p-5 rounded-2xl border-felt-stitching relative flex flex-col items-center justify-between text-center min-h-[300px]">
              
              <div className="absolute top-0 right-0 bg-yellow-500 text-slate-950 font-black font-mono text-[8px] px-2.5 py-0.5 rounded-bl">
                AESTHETIC POSTER
              </div>

              <div className="space-y-1">
                <span className="font-calligraphy text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 via-amber-400 to-yellow-105 font-black text-sm tracking-widest block font-bold">
                  {chart ? chart.name : '李明'} · 特约命禄引见帖
                </span>
                <span className="text-[8px] text-purple-300 tracking-wider font-mono block">3D FELT TOY COMPACT ARTISTRY</span>
              </div>

              {/* mascot avatar inside */}
              <div className="py-2 flex flex-col items-center">
                <DestinyDirectorCartoon expression="guiding" size="md" />
                <div className="mt-1.5 bg-yellow-500/10 border border-yellow-500/20 px-2 py-0.5 rounded text-[8px] text-yellow-300 font-mono tracking-wider">
                  神算代号 / REF: {partnerReferralCode}
                </div>
              </div>

              {/* Calligraphy styled retro QR code template */}
              <div className="bg-white p-1 rounded-lg">
                <svg className="w-14 h-14 text-slate-950" viewBox="0 0 100 100" fill="currentColor">
                  <rect x="10" y="10" width="20" height="20" />
                  <rect x="70" y="10" width="20" height="20" />
                  <rect x="10" y="70" width="20" height="20" />
                  <rect x="15" y="15" width="10" height="10" fill="white" />
                  <rect x="75" y="15" width="10" height="10" fill="white" />
                  <rect x="15" y="75" width="10" height="10" fill="white" />
                  <rect x="38" y="15" width="6" height="6" />
                  <rect x="52" y="25" width="8" height="8" />
                  <rect x="35" y="45" width="12" height="6" />
                  <rect x="50" y="75" width="10" height="10" />
                  <rect x="75" y="45" width="8" height="8" />
                </svg>
              </div>

              <button
                onClick={() => {
                  setIsPosterSaved(true);
                  alert(lang === 'zh' 
                    ? "📥 正在从天池元栈提取羊毛毡文创海报图像并注入专属代号QR，已成功保存到您的本地相册！快分享到微信或社群！" 
                    : "📥 Generative poster extracted successfully to your local gallery! Share to earn now!");
                }}
                className="w-full bg-slate-900 border border-yellow-600/30 hover:bg-slate-800 text-yellow-300 font-bold text-[10px] py-1.5 px-3 rounded-lg transition-colors mt-2"
              >
                📥 {lang === 'zh' ? '保存并冲印微信扫码分享海报' : 'Download Sharing Poster'}
              </button>

            </div>

          </div>

          {/* CASHOUT SUBMISSION PORT (ZERO DELAYS) */}
          <div className="bg-[#04060f]/95 border border-purple-500/10 p-5 rounded-2xl space-y-4">
            
            <h5 className="text-xs font-bold text-slate-100 flex items-center gap-1.5">
              <span>💸 天星结算提现关卡</span>
              <span className="text-emerald-400 text-[10px] font-mono font-black">( ￥1.0 起无门槛提现 )</span>
            </h5>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs font-mono">
              
              <div className="space-y-1">
                <label className="text-slate-400 text-[10px] block font-sans">结付转账渠道 (Payout Gateway)</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setCashoutMethod('alipay')}
                    className={`p-2 rounded-lg text-center border font-sans text-xs transition-colors ${
                      cashoutMethod === 'alipay' 
                        ? 'bg-blue-950/40 border-blue-500 text-blue-400 font-bold' 
                        : 'bg-slate-900 border-slate-800 text-slate-400'
                    }`}
                  >
                    支付宝 (Alipay)
                  </button>
                  <button
                    type="button"
                    onClick={() => setCashoutMethod('wechat')}
                    className={`p-2 rounded-lg text-center border font-sans text-xs transition-colors ${
                      cashoutMethod === 'wechat' 
                        ? 'bg-emerald-950/40 border-emerald-500 text-emerald-400 font-bold' 
                        : 'bg-slate-900 border-slate-800 text-slate-400'
                    }`}
                  >
                    微信支付 (WeChat)
                  </button>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-slate-400 text-[10px] block font-sans">收款账号 (Receiving Account)</label>
                <input
                  type="text"
                  value={cashoutAccount}
                  onChange={(e) => setCashoutAccount(e.target.value)}
                  placeholder={cashoutMethod === 'alipay' ? "例如: smart_gold@alipay.com" : "微信号、关联手机、微钱包号"}
                  className="w-full bg-[#080512] border border-purple-500/20 rounded-lg p-2 text-slate-100 placeholder-slate-600 outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-slate-400 text-[10px] block font-sans">提现金额 (Amount To Cash out)</label>
                <div className="relative">
                  <input
                    type="number"
                    value={cashoutAmount}
                    onChange={(e) => setCashoutAmount(e.target.value)}
                    placeholder="￥1.00 起无套路秒提"
                    className="w-full bg-[#080512] border border-purple-500/20 rounded-lg p-2 pr-12 text-slate-100 placeholder-slate-600 outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => setCashoutAmount(partnerBalance.toFixed(2))}
                    className="absolute right-2 top-[50%] translate-y-[-50%] text-yellow-500 hover:text-yellow-300 font-sans font-bold text-[9px]"
                  >
                    全部提
                  </button>
                </div>
              </div>

            </div>

            <div className="border-t border-purple-500/15 pt-3 flex flex-col sm:flex-row items-center justify-between gap-3 pt-3">
              <span className="text-[10px] text-slate-400">出纳提成金通过宿星网关直接打款，实时到账，支持模拟到账检验。</span>
              <button
                onClick={handleExecuteWithdrawal}
                className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white min-w-40 py-2 px-5 rounded-xl font-bold transition-all shadow-md active:scale-95 text-xs text-center"
              >
                🚀 {lang === 'zh' ? '提交提现并极速秒到账' : 'Withdraw Commission'}
              </button>
            </div>

            {cashoutMessage && (
              <div className="bg-emerald-950/40 border border-emerald-500/30 p-3.5 rounded-xl text-[10px] text-emerald-400 leading-relaxed font-sans">
                {cashoutMessage}
              </div>
            )}

          </div>

          {/* LIVE LOCAL WALLET LEDGERS */}
          <div className="space-y-2">
            <span className="text-slate-400 text-[10px] uppercase font-bold tracking-wider font-mono">{lang === 'zh' ? '合伙账本流水明细' : 'Referral Commission History'}</span>
            <div className="bg-[#050813] rounded-xl border border-slate-800 divide-y divide-slate-800 text-xs font-mono">
              {partnerTransactions.map((tx) => (
                <div key={tx.id} className="p-3 flex justify-between items-center bg-slate-900/10">
                  <div className="space-y-0.5">
                    <span className="text-slate-200 font-sans block">{tx.label}</span>
                    <span className="text-[9px] text-slate-500">{tx.date}</span>
                  </div>
                  <div className="text-right space-y-0.5">
                    <strong className={`block font-bold text-sm ${tx.amount > 0 ? 'text-yellow-400' : 'text-rose-400'}`}>
                      {tx.amount > 0 ? '+' : ''}￥{tx.amount.toFixed(2)}
                    </strong>
                    <span className="text-[8px] bg-emerald-950/60 border border-emerald-500/20 text-emerald-400 px-1.5 py-0.1 rounded">{tx.status}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      )}

    </div>
  );
}
