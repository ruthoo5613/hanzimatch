import { useGameStore } from '../hooks/useGame';

export function FAQ() {
  const { setPhase } = useGameStore();

  const handleBack = () => {
    setPhase('home');
  };

  const faqs = [
    {
      question: '订阅后可以取消吗？',
      answer: '是的，您可以随时取消订阅。月付用户可在当前订阅周期结束前取消，年付用户可随时取消但剩余天数不予退款。',
    },
    {
      question: '如何支付？',
      answer: '我们支持 PayPal 支付。如果您没有 PayPal 账户，也可以使用信用卡通过 PayPal 进行支付。',
    },
    {
      question: '订阅后可以多设备使用吗？',
      answer: '是的！您的订阅可以同时在手机、平板和电脑上使用，只需登录同一个账户即可。',
    },
    {
      question: '免费版和付费版有什么区别？',
      answer: '免费版可以学习第一个主题（餐厅场景），付费版可以解锁所有主题、跟读评分功能和AI对话陪练。',
    },
    {
      question: 'AI对话陪练是什么？',
      answer: 'AI对话陪练是一个智能语言伙伴，可以与您进行中文对话练习，提供即时纠正和建议。',
    },
    {
      question: '如何升级或降级订阅？',
      answer: '您可以随时在个人中心更改订阅计划。更改将在下一个计费周期生效。',
    },
  ];

  return (
    <div style={{ padding: 20, minHeight: '100vh', background: '#f5f5f5' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <button onClick={handleBack} style={{ background: 'none', border: 'none', fontSize: 24, cursor: 'pointer' }}>←</button>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 13, color: '#757575' }}>常见问题</div>
          <div style={{ fontSize: 18, fontWeight: 600 }}>FAQ</div>
        </div>
        <div style={{ width: 40 }}></div>
      </div>

      {/* 标题 */}
      <div style={{ textAlign: 'center', marginBottom: 32 }}>
        <h1 style={{ fontSize: 24, fontWeight: 700 }}>常见问题</h1>
        <p style={{ color: '#666', marginTop: 8 }}>Frequently Asked Questions</p>
      </div>

      {/* FAQ 列表 */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {faqs.map((faq, index) => (
          <div
            key={index}
            style={{
              background: 'white',
              borderRadius: 12,
              padding: 16,
              boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
            }}
          >
            <div style={{ fontSize: 16, fontWeight: 600, marginBottom: 8, color: '#333' }}>
              ❓ {faq.question}
            </div>
            <div style={{ fontSize: 14, color: '#666', lineHeight: 1.6 }}>
              {faq.answer}
            </div>
          </div>
        ))}
      </div>

      {/* 联系客服 */}
      <div style={{ 
        marginTop: 32, 
        padding: 20, 
        background: '#E3F2FD', 
        borderRadius: 12, 
        textAlign: 'center' 
      }}>
        <div style={{ fontSize: 16, fontWeight: 600, marginBottom: 8 }}>
          还有其他问题？
        </div>
        <div style={{ fontSize: 14, color: '#666' }}>
          联系我们：support@hanzimatch.com
        </div>
      </div>

      {/* 返回定价 */}
      <div style={{ textAlign: 'center', marginTop: 24 }}>
        <button 
          onClick={() => setPhase('pricing')}
          style={{ background: 'none', border: 'none', color: '#2196F3', cursor: 'pointer', textDecoration: 'underline' }}
        >
          查看定价方案 →
        </button>
      </div>
    </div>
  );
}