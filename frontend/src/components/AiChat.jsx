import { useState } from 'react';
import API from "../api";

function AiChat() {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([
        { role: "ai", text: "Hi! Im ServerVault AI. Ask me anything about your minecraft servers!"}
    ]);
    const [input, setInput] = useState("");
    const[loading, setLoading] = useState(false);

    const sendMessage = async (e) => {
        e.preventDefault();
        if (!input.trim() || loading) return;
        
        const userMessage = input.trim();
        setInput("");
        setMessages(prev => [...prev, { role: "user", text: userMessage }]);
        setLoading(true);

        try {
            const response = await API.post("/ai/chat", { message: userMessage });
            setMessages(prev => [...prev, { role: "ai", text: response.data.response }]);
        } catch (err) {
            setMessages(prev => [...prev, { role: "ai", text: "Sorry, something went wrong. Try again!" }]);
        } finally {
            setLoading(false);
        }
    };
    if (!isOpen) {
        return (
            <button
            onClick={() => setIsOpen(true)}
            className='fixed bottom-6 right-6 bg-blue-600 hover:bg-blue-500 text-white w-14 h-14 rounded-full shadow-lg flex items-center justify-center text-2xl transition z-50'>
                💬
            </button>
        );
    }

    return (
        <div className='fixed bottom-6 right-6 w-96 h-[500px] bg-gray-800 border border-gray-700 rounded-xl shadow-2xl flex flex-col z-50'>
            {/* Header */}
            <div className='p-4 flex justify-between items-center border-b border-gray-700'>
                <div className='flex items-center gap-2'>
                    <span className="text-xl">💬</span>
                    <div>
                    <h3 className="text-white font-semibold text-sm">ServerVault AI</h3>
                    <p className='text-green-400 text-xs'>Online</p>
                </div>
            </div>
            <button
                onClick={() => setIsOpen(false)}
                className='text-gray-400 hover:text-white text-xl'
            >
                X
            </button>
        </div>

        {/* Messages */}
        <div className='flex-1 overflow-y-auto p-4 space-y-3'>
            {messages.map((msg, i) => (
                <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                    <div className={`max-w-[80%] p-3 rounded-lg text-sm ${
                        msg.role === "user"
                        ? "bg-blue-600 text-white"
                        : "bg-gray-700 text-gray-200"
                    }`}>
                        {msg.text}
                    </div>
                </div>
            ))}
            {loading && (
                <div className='flex justify-start'>
                    <div className='bg-gray-700 text-gray-400 p-3 rounded-lg text-sm'>
                        Thinking...
                    </div>
                </div>
            )}
    </div>
    
    {/* Input */}
    <form onSubmit={sendMessage} className='p-4 border-t border-gray-700'>
        <div className='flex gap-2'>
            <input
            type='text'
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className='flex-1 p-2 rounded-lg bg-gray-700/50 text-white border border-gray-600 focus:border-blue-500 focus:outline-non text-sm'
            placeholder='Ask me anything about your minecraft servers...'
            disabled={loading}
            />
        <button
            type="submit"
            disabled={loading}
            className="bg-blue-600 hover:bg-blue-500 disabled:bg-blue-600/50 text-white px-4 py-2 rounded-lg text-sm transition"
            >
                Send
            </button>
        </div>
    </form>
</div>
    );
}

export default AiChat;