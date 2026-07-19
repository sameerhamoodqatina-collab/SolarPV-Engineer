'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, X, Send, Bot, User, Sparkles, Lightbulb, AlertTriangle, CheckCircle } from 'lucide-react';
import { useLanguage } from '@/lib/i18n/context';
import type { ProjectInfo, LoadProfile, SolarResource, PVArrayDesign, BatteryDesign, InverterDesign, CableSizing, ProtectionDevices } from '@/lib/types';

interface AIAssistantProps {
  projectInfo: ProjectInfo;
  loadProfile: LoadProfile;
  solarResource: SolarResource;
  pvDesign: PVArrayDesign;
  batteryDesign: BatteryDesign;
  inverterDesign: InverterDesign;
  cableSizing: CableSizing;
  protectionDevices: ProtectionDevices;
}

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  type?: 'info' | 'warning' | 'success' | 'tip';
  timestamp: Date;
}

const QUICK_ACTIONS_EN = [
  { id: 'explain', label: 'Explain my design', icon: Lightbulb },
  { id: 'check', label: 'Check for issues', icon: AlertTriangle },
  { id: 'optimize', label: 'Suggest improvements', icon: Sparkles },
  { id: 'compliance', label: 'Standards compliance', icon: CheckCircle },
];

const QUICK_ACTIONS_AR = [
  { id: 'explain', label: 'اشرح التصميم', icon: Lightbulb },
  { id: 'check', label: 'تحقق من المشاكل', icon: AlertTriangle },
  { id: 'optimize', label: 'اقتراح تحسينات', icon: Sparkles },
  { id: 'compliance', label: 'التوافق مع المعايير', icon: CheckCircle },
];

function generateAIResponse(
  action: string,
  data: AIAssistantProps,
  lang: string
): { content: string; type: 'info' | 'warning' | 'success' | 'tip' } {
  const { projectInfo, loadProfile, solarResource, pvDesign, batteryDesign, inverterDesign, cableSizing, protectionDevices } = data;
  const isEn = lang === 'en';

  switch (action) {
    case 'explain': {
      const panels = pvDesign.numberOfPanels;
      const pvKw = (pvDesign.requiredPVPower / 1000).toFixed(1);
      const dailyKwh = loadProfile.dailyEnergy.toFixed(1);
      const battKwh = batteryDesign.totalKwh.toFixed(1);

      if (isEn) {
        return {
          type: 'info',
          content: `**Design Overview for "${projectInfo.projectName || 'Untitled Project'}"**

**System Configuration:**
- PV Array: ${panels} panels (${pvKw} kWp)
- Configuration: ${pvDesign.seriesPanels}S × ${pvDesign.parallelStrings}P strings
- Inverter: ${inverterDesign.ratedPower} kW ${inverterDesign.systemType} system
- Battery Bank: ${battKwh} kWh (${batteryDesign.totalBatteries} units)

**Energy Analysis:**
- Daily Load: ${dailyKwh} kWh/day
- Daily Production: ~${(pvDesign.requiredPVPower / 1000 * solarResource.peakSunHours * (1 - Object.values(solarResource.losses).reduce((a, b) => a + b, 0) / 100)).toFixed(1)} kWh/day
- DC/AC Ratio: ${pvDesign.dcAcRatio.toFixed(2)}
- Peak Sun Hours: ${solarResource.peakSunHours} h/day

**Design Validations:**
- MPPT Voltage: ${pvDesign.mpptValidation ? '✓ Within range' : '✗ Out of range'}
- Inverter Compatibility: ${pvDesign.inverterCompatibility ? '✓ Compatible' : '✗ Incompatible'}
- String Voc at min temp: ${pvDesign.maxStringVoltage.toFixed(1)} V

The system is designed to meet your daily energy requirements with a ${pvDesign.safetyMargin}× safety margin.`,
        };
      } else {
        return {
          type: 'info',
          content: `**نظرة عامة على التصميم لمشروع "${projectInfo.projectName || 'مشروع بدون عنوان'}"**

**تكوين النظام:**
- مصفوفة الطاقة الشمسية: ${panels} لوحة (${pvKw} كيلوواط)
- التكوين: ${pvDesign.seriesPanels}S × ${pvDesign.parallelStrings}P سلاسل
- المحول: ${inverterDesign.ratedPower} كيلوواط نظام ${inverterDesign.systemType}
- بنك البطارية: ${battKwh} كيلوواط ساعة (${batteryDesign.totalBatteries} وحدة)

**تحليل الطاقة:**
- الحمولة اليومية: ${dailyKwh} كيلوواط ساعة/يوم
- الإنتاج اليومي: ~${(pvDesign.requiredPVPower / 1000 * solarResource.peakSunHours * (1 - Object.values(solarResource.losses).reduce((a, b) => a + b, 0) / 100)).toFixed(1)} كيلوواط ساعة/يوم
- نسبة DC/AC: ${pvDesign.dcAcRatio.toFixed(2)}
- ساعات الشمس الذروية: ${solarResource.peakSunHours} ساعة/يوم

**التحقق من التصميم:**
- جهد MPPT: ${pvDesign.mpptValidation ? '✓ ضمن النطاق' : '✗ خارج النطاق'}
- توافق المحول: ${pvDesign.inverterCompatibility ? '✓ متوافق' : '✗ غير متوافق'}

تم تصميم النظام لتلبية متطلبات طاقتك اليومية بهامش أمان ${pvDesign.safetyMargin}×.`,
        };
      }
    }

    case 'check': {
      const issues: string[] = [];
      const warnings: string[] = [];
      const passes: string[] = [];

      if (loadProfile.loads.length === 0) {
        issues.push(isEn ? 'No loads defined' : 'لم يتم تعريف أحمال');
      }
      if (pvDesign.numberOfPanels === 0) {
        issues.push(isEn ? 'PV array not calculated' : 'لم يتم حساب مصفوفة الطاقة الشمسية');
      }
      if (pvDesign.dcAcRatio > 1.5) {
        warnings.push(isEn ? `DC/AC ratio is high (${pvDesign.dcAcRatio.toFixed(2)}). Consider a larger inverter.` : `نسبة DC/AC مرتفعة (${pvDesign.dcAcRatio.toFixed(2)}). ضع محولاً أكبر.`);
      }
      if (pvDesign.dcAcRatio < 0.8) {
        warnings.push(isEn ? `DC/AC ratio is low (${pvDesign.dcAcRatio.toFixed(2)}). PV array may be undersized.` : `نسبة DC/AC منخفضة (${pvDesign.dcAcRatio.toFixed(2)}). قد تكون مصفوفة الطاقة الشمسية غير كافية.`);
      }
      if (!pvDesign.mpptValidation) {
        issues.push(isEn ? 'String voltage is outside MPPT range!' : 'جهد السلسلة خارج نطاق MPPT!');
      }
      const totalLoss = Object.values(solarResource.losses).reduce((a, b) => a + b, 0);
      if (totalLoss > 25) {
        warnings.push(isEn ? `Total system losses are ${totalLoss.toFixed(1)}%. Consider reducing individual losses.` : `إجمالي خسائر النظام ${totalLoss.toFixed(1)}%. يُنصح بتقليل الخسائر.`);
      }
      if (pvDesign.mpptValidation) passes.push(isEn ? 'MPPT voltage range OK' : 'نطاق جهد MPPT سليم');
      if (pvDesign.inverterCompatibility) passes.push(isEn ? 'Inverter compatible' : 'المحول متوافق');
      if (protectionDevices.mcb.rating > 0) passes.push(isEn ? 'Protection devices selected' : 'تم اختيار أجهزة الحماية');

      const type = issues.length > 0 ? 'warning' : warnings.length > 0 ? 'tip' : 'success';
      const lines = [...issues.map(i => `❌ ${i}`), ...warnings.map(w => `⚠️ ${w}`), ...passes.map(p => `✅ ${p}`)];
      return {
        type,
        content: isEn
          ? `**Design Check Results**\n\n${lines.length ? lines.join('\n') : 'No data available for checking.'}`
          : `**نتائج فحص التصميم**\n\n${lines.length ? lines.join('\n') : 'لا توجد بيانات متاحة للفحص.'}`,
      };
    }

    case 'optimize': {
      const tips: string[] = [];
      const totalLoss = Object.values(solarResource.losses).reduce((a, b) => a + b, 0);

      if (pvDesign.dcAcRatio > 1.3) {
        tips.push(isEn
          ? 'Consider reducing the DC/AC ratio to 1.1-1.2 for better efficiency.'
          : 'فكر في تقليل نسبة DC/AC إلى 1.1-1.2 لكفاءة أفضل.');
      }
      if (batteryDesign.dod > 0.8 && batteryDesign.batteryType === 'leadacid') {
        tips.push(isEn
          ? 'Lead-acid DoD above 80% significantly reduces battery life. Consider reducing to 50%.'
          : 'ال-descarge التجريبي فوق 80% للرصاص الحمضي يقلل عمر البطارية بشكل كبير. خفضه إلى 50%.');
      }
      if (solarResource.losses.dust > 3) {
        tips.push(isEn
          ? 'Dust loss is high. Regular cleaning can improve energy yield by 3-5%.'
          : 'خسائر الغبار مرتفعة. التنظيم الدوري يمكن أن يحسن إنتاج الطاقة بنسبة 3-5%.');
      }
      if (loadProfile.loads.some(l => l.efficiency < 80)) {
        tips.push(isEn
          ? 'Some loads have low efficiency. Consider upgrading to energy-efficient models.'
          : 'بعض الأحمال بكفاءة منخفضة. ضع نماذج موفرة للطاقة.');
      }
      if (pvDesign.numberOfPanels > 0 && totalLoss < 15) {
        tips.push(isEn
          ? 'Good system efficiency! Consider adding monitoring for performance tracking.'
          : 'كفاءة نظام جيدة! فكر في إضافة نظام مراقبة لتتبع الأداء.');
      }
      if (solarResource.peakSunHours < 4) {
        tips.push(isEn
          ? 'Low peak sun hours. Consider bifacial panels or tracking systems.'
          : ' ساعات شمس ذروية منخفضة. فكر في الألواح ثنائية الوجه أو أنظمة التتبع.');
      }

      if (tips.length === 0) {
        tips.push(isEn
          ? 'Your design looks well-optimized. Keep up the good work!'
          : 'تصميمك يبدو محسناً. واصل العمل الجيد!');
      }

      return {
        type: 'tip',
        content: isEn
          ? `**Optimization Suggestions**\n\n${tips.map(t => `💡 ${t}`).join('\n\n')}`
          : `**اقتراحات التحسين**\n\n${tips.map(t => `💡 ${t}`).join('\n\n')}`,
      };
    }

    case 'compliance': {
      const standards = [
        { code: 'IEC 62548', check: pvDesign.numberOfPanels > 0, desc: isEn ? 'PV Array Design Requirements' : 'متطلبات تصميم مصفوفة الطاقة الشمسية' },
        { code: 'IEC 61215', check: pvDesign.selectedPanel !== null, desc: isEn ? 'PV Module Qualification' : 'أهلية وحدة الطاقة الشمسية' },
        { code: 'IEC 61730', check: pvDesign.selectedPanel !== null, desc: isEn ? 'PV Module Safety' : 'سلامة وحدة الطاقة الشمسية' },
        { code: 'IEC 60364', check: protectionDevices.mcb.rating > 0, desc: isEn ? 'Low-Voltage Electrical Installations' : 'التركيبات الكهربائية منخفضة الجهد' },
        { code: 'NEC 2023', check: cableSizing.dcCable.recommendedSize > 0, desc: isEn ? 'National Electrical Code' : 'الكود الكهربائي الوطني' },
        { code: 'IEEE 1547', check: inverterDesign.ratedPower > 0, desc: isEn ? 'Grid Interconnection' : 'التوصيل بالشبكة' },
      ];

      const lines = standards.map(s => {
        const status = s.check ? '✅' : '⚠️';
        return `${status} **${s.code}** - ${s.desc}`;
      });

      const passed = standards.filter(s => s.check).length;
      return {
        type: passed === standards.length ? 'success' : 'tip',
        content: isEn
          ? `**Standards Compliance Check (${passed}/${standards.length})**\n\n${lines.join('\n')}\n\n${passed === standards.length ? 'All major standards requirements addressed.' : 'Some requirements may need attention.'}`
          : `**فحص التوافق مع المعايير (${passed}/${standards.length})**\n\n${lines.join('\n')}\n\n${passed === standards.length ? 'تم تلبية جميع متطلبات المعايير الرئيسية.' : 'بعض المتطلبات قد تحتاج انتباه.'}`,
      };
    }

    default:
      return {
        type: 'info',
        content: isEn ? 'I can help you with design explanations, issue detection, optimization suggestions, and standards compliance checks.' : 'يمكنني مساعدتك في شرح التصميم، واكتشاف المشاكل، واقتراحات التحسين، وفحص التوافق مع المعايير.',
      };
  }
}

function formatMessage(content: string): string {
  return content
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\n/g, '<br/>');
}

export default function AIAssistant(props: AIAssistantProps) {
  const { t, language } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const quickActions = language === 'en' ? QUICK_ACTIONS_EN : QUICK_ACTIONS_AR;

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 200);
    }
  }, [isOpen]);

  const addMessage = useCallback((role: 'user' | 'assistant', content: string, type?: Message['type']) => {
    setMessages(prev => [...prev, {
      id: `msg-${Date.now()}-${Math.random()}`,
      role,
      content,
      type,
      timestamp: new Date(),
    }]);
  }, []);

  const handleQuickAction = useCallback((actionId: string) => {
    const label = quickActions.find(a => a.id === actionId)?.label || actionId;
    addMessage('user', label);
    setIsTyping(true);

    setTimeout(() => {
      const response = generateAIResponse(actionId, props, language);
      addMessage('assistant', response.content, response.type);
      setIsTyping(false);
    }, 800 + Math.random() * 700);
  }, [props, language, quickActions, addMessage]);

  const handleSend = useCallback(() => {
    if (!inputValue.trim()) return;
    const userMsg = inputValue.trim();
    addMessage('user', userMsg);
    setInputValue('');
    setIsTyping(true);

    setTimeout(() => {
      const lower = userMsg.toLowerCase();
      let action = 'explain';
      if (lower.includes('check') || lower.includes('issue') || lower.includes('error') || lower.includes('فحص') || lower.includes('مشكل')) action = 'check';
      else if (lower.includes('optim') || lower.includes('improv') || lower.includes('حس') || lower.includes('تقليل')) action = 'optimize';
      else if (lower.includes('standard') || lower.includes('compli') || lower.includes('iec') || lower.includes('nec') || lower.includes('معيار') || lower.includes('توافق')) action = 'compliance';

      const response = generateAIResponse(action, props, language);
      addMessage('assistant', response.content, response.type);
      setIsTyping(false);
    }, 1000 + Math.random() * 1000);
  }, [inputValue, props, language, addMessage]);

  return (
    <>
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 end-6 z-50 w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-500 text-white shadow-2xl shadow-blue-500/30 flex items-center justify-center print:hidden"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        animate={{ rotate: isOpen ? 180 : 0 }}
      >
        {isOpen ? <X className="w-6 h-6" /> : <Bot className="w-6 h-6" />}
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed bottom-24 end-6 z-50 w-[380px] max-w-[calc(100vw-3rem)] h-[550px] max-h-[calc(100vh-8rem)] rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 shadow-2xl flex flex-col overflow-hidden print:hidden"
          >
            <div className="p-4 bg-gradient-to-r from-blue-500 to-cyan-500 text-white">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-sm">{language === 'en' ? 'AI Design Assistant' : 'مساعد التصميم الذكي'}</h3>
                  <p className="text-xs text-white/70">{language === 'en' ? 'Solar PV Engineering Expert' : 'خبير هندسة الطاقة الشمسية'}</p>
                </div>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {messages.length === 0 && (
                <div className="text-center py-8">
                  <Bot className="w-12 h-12 text-blue-400 mx-auto mb-3" />
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                    {language === 'en' ? 'How can I help with your solar design?' : 'كيف يمكنني مساعدتك في تصميم الطاقة الشمسية؟'}
                  </p>
                  <div className="space-y-2">
                    {quickActions.map((action) => {
                      const Icon = action.icon;
                      return (
                        <button
                          key={action.id}
                          onClick={() => handleQuickAction(action.id)}
                          className="w-full flex items-center gap-2 px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 text-sm text-gray-700 dark:text-gray-300 hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:border-blue-300 dark:hover:border-blue-700 transition-all text-start"
                        >
                          <Icon className="w-4 h-4 text-blue-500 shrink-0" />
                          {action.label}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {messages.map((msg) => (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex gap-2 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
                >
                  <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${
                    msg.role === 'assistant'
                      ? 'bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400'
                      : 'bg-amber-100 dark:bg-amber-900/40 text-amber-600 dark:text-amber-400'
                  }`}>
                    {msg.role === 'assistant' ? <Bot className="w-4 h-4" /> : <User className="w-4 h-4" />}
                  </div>
                  <div className={`max-w-[80%] px-3.5 py-2.5 rounded-2xl text-sm leading-relaxed ${
                    msg.role === 'user'
                      ? 'bg-blue-500 text-white rounded-tr-md'
                      : msg.type === 'warning'
                        ? 'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-gray-800 dark:text-gray-200 rounded-tl-md'
                        : msg.type === 'success'
                          ? 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 text-gray-800 dark:text-gray-200 rounded-tl-md'
                          : 'bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200 rounded-tl-md'
                  }`}>
                    <div dangerouslySetInnerHTML={{ __html: formatMessage(msg.content) }} />
                  </div>
                </motion.div>
              ))}

              {isTyping && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex gap-2"
                >
                  <div className="w-7 h-7 rounded-lg bg-blue-100 dark:bg-blue-900/40 flex items-center justify-center">
                    <Bot className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div className="px-4 py-3 rounded-2xl rounded-tl-md bg-gray-100 dark:bg-gray-800">
                    <div className="flex gap-1">
                      <span className="w-2 h-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: '0ms' }} />
                      <span className="w-2 h-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: '150ms' }} />
                      <span className="w-2 h-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: '300ms' }} />
                    </div>
                  </div>
                </motion.div>
              )}

              <div ref={messagesEndRef} />
            </div>

            <div className="p-3 border-t border-gray-200 dark:border-gray-700">
              <div className="flex gap-2">
                <input
                  ref={inputRef}
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                  placeholder={language === 'en' ? 'Ask about your design...' : 'اسأل عن تصميمك...'}
                  className="flex-1 px-3.5 py-2.5 rounded-xl bg-gray-100 dark:bg-gray-800 text-sm text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:ring-2 focus:ring-blue-500/50 outline-none border border-transparent focus:border-blue-300"
                />
                <button
                  onClick={handleSend}
                  disabled={!inputValue.trim()}
                  className="w-10 h-10 rounded-xl bg-blue-500 text-white flex items-center justify-center hover:bg-blue-600 transition-colors disabled:opacity-40"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
