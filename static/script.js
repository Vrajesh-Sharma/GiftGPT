// Function to display typing indicator
const showTyping = () => {
    document.getElementById("typing-indicator").style.display = "block";
};

// Function to hide typing indicator
const hideTyping = () => {
    document.getElementById("typing-indicator").style.display = "none";
};

// Function to safely escape HTML
const escapeHTML = (str) => {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
};

// Function to format bot message
const formatBotMessage = (message) => {
    // Convert asterisk bullet points and bold text
    return message.replace(/\* (.*)/g, '• $1')  // Convert * to bullet points
                 .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>'); // Convert **text** to <strong>text</strong>
};

// Function to append messages to the chat
const appendMessage = (message, type) => {
    const messageElement = document.createElement("div");
    messageElement.classList.add("chat-message", `${type}-message`);
    
    // Format message if it's from bot
    const formattedMessage = type === 'bot' 
        ? formatBotMessage(escapeHTML(message))
            .replace(/\n/g, '<br>')
            .replace(/(https?:\/\/[^\s]+)/g, '<a href="$1" target="_blank">$1</a>')
        : escapeHTML(message)
            .replace(/\n/g, '<br>')
            .replace(/(https?:\/\/[^\s]+)/g, '<a href="$1" target="_blank">$1</a>');
    
    messageElement.innerHTML = formattedMessage;
    document.getElementById("chat-window").appendChild(messageElement);
    messageElement.scrollIntoView({ behavior: 'smooth', block: 'end' });
};

// Function to disable/enable input during processing
const setInputState = (disabled) => {
    document.getElementById("user-input").disabled = disabled;
    document.getElementById("send-button").disabled = disabled;
};

// Function to send a message to the server
const sendMessage = async () => {
    const userInput = document.getElementById("user-input").value.trim();
    if (userInput === "") return;

    // Disable input while processing
    setInputState(true);
    
    appendMessage(userInput, "user");
    document.getElementById("user-input").value = "";
    showTyping();

    try {
        const response = await fetch("/message", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ message: userInput }),
        });
        
        if (!response.ok) throw new Error('Network response was not ok');
        
        const data = await response.json();
        hideTyping();
        appendMessage(data.bot_message, "bot");
    } catch (error) {
        console.error("Error:", error);
        hideTyping();
        appendMessage("I apologize, but I'm having trouble connecting right now. Please try again in a moment.", "bot");
    } finally {
        setInputState(false);
        document.getElementById("user-input").focus();
    }
};

// Add event listener for "Send" button
document.getElementById("send-button").addEventListener("click", sendMessage);

// Add event listener for "Enter" key
document.getElementById("user-input").addEventListener("keydown", (event) => {
    if (event.key === "Enter" && !event.shiftKey) {
        event.preventDefault();
        sendMessage();
    }
});

// Display welcome message on load
window.addEventListener('load', () => {
    appendMessage("Hi there! 🎉 I'm your AI-powered gift assistant. I can help you find the perfect gift for any occasion! Tell me about who you're shopping for and your budget, and I'll provide personalized suggestions. How can I help you today? 🎁", "bot");
});

// Add theme switching functionality
const themeToggle = document.getElementById('theme-toggle');
const htmlElement = document.documentElement;

// Check for saved theme preference
const savedTheme = localStorage.getItem('theme') || 'light';
htmlElement.setAttribute('data-theme', savedTheme);
themeToggle.checked = savedTheme === 'dark';

// Theme switch handler
themeToggle.addEventListener('change', () => {
    if (themeToggle.checked) {
        htmlElement.setAttribute('data-theme', 'dark');
        localStorage.setItem('theme', 'dark');
    } else {
        htmlElement.setAttribute('data-theme', 'light');
        localStorage.setItem('theme', 'light');
    }
});

// Add ripple effect function
const createRipple = (e) => {
    const ripple = document.createElement('div');
    ripple.classList.add('ripple');
    
    // Set ripple color based on theme
    const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
    ripple.style.background = `radial-gradient(circle, ${isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'} 0%, transparent 70%)`;
    
    // Position the ripple
    ripple.style.left = `${e.clientX}px`;
    ripple.style.top = `${e.clientY}px`;
    
    document.body.appendChild(ripple);
    
    // Remove ripple after animation
    ripple.addEventListener('animationend', () => {
        ripple.remove();
    });
};

// Add throttled mousemove handler for performance
let lastMove = 0;
document.addEventListener('mousemove', (e) => {
    const now = Date.now();
    if (now - lastMove > 50) {  // Throttle to every 50ms
        lastMove = now;
        const x = (e.clientX / window.innerWidth) * 100;
        const y = (e.clientY / window.innerHeight) * 100;
        
        document.documentElement.style.setProperty('--mouse-x', `${x}%`);
        document.documentElement.style.setProperty('--mouse-y', `${y}%`);
        
        createRipple(e);
    }
}); 