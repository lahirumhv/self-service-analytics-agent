import ChatUI from '../components/ChatUI';

export default function Home() {
    return (
        <main>
            <div style={{ marginBottom: '2rem', textAlign: 'center' }}>
                <h1 style={{ fontSize: '2.5rem', fontWeight: 800, letterSpacing: '-0.025em', background: 'linear-gradient(to right, #818cf8, #c084fc)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                    Analytics Agent
                </h1>
                <p style={{ color: '#94a3b8', marginTop: '0.5rem' }}>
                    Translate your questions into data insights. Powered by AI and SQLite.
                </p>
            </div>
            <ChatUI />
        </main>
    );
}
