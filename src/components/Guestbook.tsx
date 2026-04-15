import { useState, useEffect } from 'react';
import { useGameStore } from '../hooks/useGame';
import { useAuthStore } from '../hooks/useAuth';

interface Message {
  id: number;
  name: string;
  content: string;
  date: string;
}

export function Guestbook() {
  const { setPhase } = useGameStore();
  const { user, isAuthenticated } = useAuthStore();
  const [messages, setMessages] = useState<Message[]>([]);
  const [newContent, setNewContent] = useState('');

  // 自动获取Google用户名并保存到localStorage
  useEffect(() => {
    if (isAuthenticated && user?.displayName) {
      localStorage.setItem('hanzimatch_username', user.displayName);
    }
  }, [isAuthenticated, user]);

  // 获取保存的用户名
  const getUserName = () => {
    return localStorage.getItem('hanzimatch_username') || 'Anonymous';
  };

  useEffect(() => {
    // 从 localStorage 读取留言
    const saved = localStorage.getItem('hanzimatch_messages');
    if (saved) {
      setMessages(JSON.parse(saved));
    } else {
      // 默认留言 - 社交证明
      const defaultMessages: Message[] = [
        { id: 1, name: 'Sarah M.', content: 'AI pronunciation feedback is amazing! Finally found a fun way to learn Chinese 🎯', date: '2026-04-10' },
        { id: 2, name: 'David L.', content: 'Learning for 2 weeks, already know 50+ words. Highly recommend!', date: '2026-04-08' },
        { id: 3, name: 'Maria K.', content: '场景化学习真的很有帮助，中文进步了很多', date: '2026-04-05' },
        { id: 4, name: 'James T.', content: 'Great app! The gamification keeps me motivated every day', date: '2026-04-01' },
        { id: 5, name: 'Anonymous', content: 'Best Chinese learning app I have tried', date: '2026-03-28' },
      ];
      setMessages(defaultMessages);
      localStorage.setItem('hanzimatch_messages', JSON.stringify(defaultMessages));
    }
  }, []);

  const handleAddMessage = () => {
    if (!newContent.trim()) return;

    const newMessage: Message = {
      id: Date.now(),
      name: getUserName(),
      content: newContent.trim(),
      date: new Date().toISOString().split('T')[0],
    };

    const updated = [newMessage, ...messages];
    setMessages(updated);
    localStorage.setItem('hanzimatch_messages', JSON.stringify(updated));
    setNewContent('');
  };

  const handleBack = () => {
    setPhase('home');
  };

  return (
    <div style={{ padding: 20, minHeight: '100vh', background: '#fff' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <button onClick={handleBack} style={{ background: 'none', border: 'none', fontSize: 22, cursor: 'pointer', color: '#333' }}>←</button>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 13, color: '#757575' }}>留言板 Guestbook</div>
          <div style={{ fontSize: 15, fontWeight: 600 }}>Guestbook</div>
        </div>
        <div style={{ width: 40 }}></div>
      </div>

      {/* 新增留言 */}
      <div style={{ marginBottom: 24, padding: 16, background: '#F5F5F5', borderRadius: 12 }}>
        <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 12 }}>发表留言 / Leave a message</div>
        <textarea
          placeholder="写下您的建议 / Your feedback"
          value={newContent}
          onChange={(e) => setNewContent(e.target.value)}
          rows={3}
          style={{
            width: '100%',
            padding: '10px 12px',
            marginBottom: 8,
            border: '1px solid #E0E0E0',
            borderRadius: 8,
            fontSize: 14,
            resize: 'none',
          }}
        />
        <button
          onClick={handleAddMessage}
          disabled={!newContent.trim()}
          style={{
            width: '100%',
            padding: '12px',
            background: newContent.trim() ? '#4CAF50' : '#BDBDBD',
            color: 'white',
            border: 'none',
            borderRadius: 8,
            fontSize: 14,
            cursor: newContent.trim() ? 'pointer' : 'not-allowed',
          }}
        >
          提交 / Submit
        </button>
      </div>

      {/* 留言列表 */}
      <div>
        <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 12 }}>用户留言 / Messages ({messages.length})</div>
        {messages.map((msg) => (
          <div
            key={msg.id}
            style={{
              padding: 16,
              marginBottom: 12,
              background: '#fff',
              border: '1px solid #E0E0E0',
              borderRadius: 12,
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
              <span style={{ fontWeight: 600, color: '#333' }}>{msg.name}</span>
              <span style={{ fontSize: 12, color: '#9E9E9E' }}>{msg.date}</span>
            </div>
            <div style={{ fontSize: 14, color: '#555', lineHeight: 1.5 }}>{msg.content}</div>
          </div>
        ))}
      </div>
    </div>
  );
}