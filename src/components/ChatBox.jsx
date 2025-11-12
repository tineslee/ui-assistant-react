import { useState, useEffect, useRef } from 'react';
import styles from './ChatBox.module.css';
import { pipeline } from '@xenova/transformers';

function ChatBox() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // 👇 Função para gerar resposta com IA
  const gerarResposta = async (mensagem) => {
    const generator = await pipeline('text-generation', 'Xenova/gpt2');
    const resposta = await generator(mensagem, {
      max_new_tokens: 50,
      clean_up_tokenization_spaces: true,
    });
    return resposta[0].generated_text.replace(/Â/g, '').trim();
  };

  // 👇 Função para enviar mensagem
  const sendMessage = async () => {
    if (!input.trim()) return;

    const userMessage = { text: input, sender: 'user' };
    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      const reply = await gerarResposta(input);
      const assistantMessage = { text: reply, sender: 'assistant' };
      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      const fallbackMessage = {
        text: 'Ops! Não consegui responder agora. Tente novamente em instantes.',
        sender: 'assistant',
      };
      setMessages((prev) => [...prev, fallbackMessage]);
      console.error('Erro ao gerar resposta:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.messages}>
        {messages.map((msg, index) => (
          <div
            key={index}
            className={`${styles.message} ${
              msg.sender === 'assistant' ? styles.assistant : styles.user
            }`}
          >
            {msg.text}
          </div>
        ))}
        {loading && (
          <div className={`${styles.message} ${styles.assistant}`}>
            Digitando...
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className={styles.inputArea}>
        <input
          className={styles.input}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Digite sua mensagem..."
        />
        <button className={styles.button} onClick={sendMessage}>
          ✈️ Enviar
        </button>
      </div>
    </div>
  );
}

export default ChatBox;
