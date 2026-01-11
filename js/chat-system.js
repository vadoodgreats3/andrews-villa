// Real-time Chat System for Andrews Villa
class ChatSystem {
    constructor() {
        this.messages = [];
        this.isConnected = false;
        this.adminOnline = true; // Simulated for now
        this.init();
    }
    
    init() {
        this.loadMessages();
        this.setupEventListeners();
        this.simulateAdminMessages();
    }
    
    loadMessages() {
        // Load messages from localStorage
        const savedMessages = localStorage.getItem('chatMessages');
        if (savedMessages) {
            this.messages = JSON.parse(savedMessages);
        } else {
            // Default messages
            this.messages = [
                {
                    id: 1,
                    sender: 'admin',
                    content: 'Hello John! Welcome to Andrews Villa. How can I assist you today?',
                    timestamp: new Date(Date.now() - 3600000).toISOString()
                },
                {
                    id: 2,
                    sender: 'user',
                    content: 'Hi! I\'d like to know more about the Modern Villa in Malibu.',
                    timestamp: new Date(Date.now() - 3540000).toISOString()
                },
                {
                    id: 3,
                    sender: 'admin',
                    content: 'Certainly! The Modern Villa features 4 bedrooms, 3 bathrooms, a swimming pool, and stunning ocean views. Would you like to schedule a virtual tour?',
                    timestamp: new Date(Date.now() - 3480000).toISOString()
                }
            ];
            this.saveMessages();
        }
        
        this.renderMessages();
    }
    
    setupEventListeners() {
        const messageInput = document.getElementById('messageInput');
        const sendButton = document.getElementById('sendMessage');
        
        if (messageInput && sendButton) {
            // Send on button click
            sendButton.addEventListener('click', () => this.sendMessage());
            
            // Send on Enter key
            messageInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    this.sendMessage();
                }
            });
            
            // Auto-resize textarea
            messageInput.addEventListener('input', function() {
                this.style.height = 'auto';
                this.style.height = (this.scrollHeight) + 'px';
            });
        }
    }
    
    sendMessage() {
        const input = document.getElementById('messageInput');
        const content = input.value.trim();
        
        if (!content) return;
        
        // Add message to array
        const message = {
            id: Date.now(),
            sender: 'user',
            content: content,
            timestamp: new Date().toISOString()
        };
        
        this.messages.push(message);
        this.saveMessages();
        this.renderMessages();
        
        // Clear input
        input.value = '';
        input.style.height = 'auto';
        
        // Simulate admin response after delay
        setTimeout(() => this.simulateAdminResponse(content), 2000);
        
        // Mark as unread for admin (simulated)
        this.updateUnreadCount();
    }
    
    simulateAdminResponse(userMessage) {
        // Simple response logic (will be enhanced with AI in Phase 3)
        let response = '';
        
        if (userMessage.toLowerCase().includes('price') || userMessage.includes('$')) {
            response = 'The pricing details vary based on the property. Would you like me to provide specific pricing for a particular listing?';
        } else if (userMessage.toLowerCase().includes('tour') || userMessage.toLowerCase().includes('visit')) {
            response = 'I can schedule a virtual tour for you. Please let me know your preferred date and time.';
        } else if (userMessage.toLowerCase().includes('available') || userMessage.toLowerCase().includes('vacant')) {
            response = 'Availability depends on the property. I can check current availability for any property you\'re interested in.';
        } else {
            response = 'Thank you for your message. Our team will review your inquiry and get back to you with detailed information.';
        }
        
        const adminMessage = {
            id: Date.now() + 1,
            sender: 'admin',
            content: response,
            timestamp: new Date().toISOString()
        };
        
        this.messages.push(adminMessage);
        this.saveMessages();
        this.renderMessages();
    }
    
    simulateAdminMessages() {
        // Send welcome message if no messages exist
        if (this.messages.length === 0) {
            setTimeout(() => {
                const welcomeMessage = {
                    id: Date.now(),
                    sender: 'admin',
                    content: 'Hello! Welcome to Andrews Villa support. How can I assist you today?',
                    timestamp: new Date().toISOString()
                };
                
                this.messages.push(welcomeMessage);
                this.saveMessages();
                this.renderMessages();
            }, 1000);
        }
    }
    
    renderMessages() {
        const container = document.getElementById('chatMessages');
        if (!container) return;
        
        container.innerHTML = '';
        
        this.messages.forEach(message => {
            const messageElement = document.createElement('div');
            messageElement.className = `message ${message.sender}`;
            
            const time = new Date(message.timestamp);
            const timeString = time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
            
            messageElement.innerHTML = `
                <div class="message-content">${this.escapeHtml(message.content)}</div>
                <div class="message-time">${timeString}</div>
            `;
            
            container.appendChild(messageElement);
        });
        
        // Scroll to bottom
        container.scrollTop = container.scrollHeight;
    }
    
    saveMessages() {
        localStorage.setItem('chatMessages', JSON.stringify(this.messages));
    }
    
    updateUnreadCount() {
        // Update unread message count in dashboard
        const unreadCount = this.messages.filter(msg => 
            msg.sender === 'admin' && !msg.read
        ).length;
        
        // Update notification badge (if exists)
        const chatMenuItem = document.querySelector('.menu-item[data-section="chat"]');
        if (chatMenuItem) {
            let badge = chatMenuItem.querySelector('.badge');
            if (!badge) {
                badge = document.createElement('span');
                badge.className = 'badge';
                badge.style.cssText = `
                    background: var(--primary-color);
                    color: white;
                    font-size: 0.75rem;
                    padding: 0.125rem 0.5rem;
                    border-radius: 10px;
                    margin-left: auto;
                `;
                chatMenuItem.appendChild(badge);
            }
            
            badge.textContent = unreadCount > 0 ? unreadCount : '';
            badge.style.display = unreadCount > 0 ? 'block' : 'none';
        }
    }
    
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
}

// Initialize chat system
function initChatSystem() {
    window.chatSystem = new ChatSystem();
    
    // Mark messages as read when chat section is opened
    const chatSection = document.getElementById('chatSection');
    if (chatSection && chatSection.classList.contains('active')) {
        window.chatSystem.updateUnreadCount();
    }
}