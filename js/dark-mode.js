// Dark/Light Mode Toggle Functionality
document.addEventListener('DOMContentLoaded', function() {
    const themeToggle = document.getElementById('themeToggle');
    const darkModeCSS = document.querySelector('link[href="css/dark-mode.css"]');
    
    // Check for saved theme or system preference
    const savedTheme = localStorage.getItem('theme');
    const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    // Set initial theme
    if (savedTheme === 'dark' || (!savedTheme && systemPrefersDark)) {
        enableDarkMode();
    } else {
        enableLightMode();
    }
    
    // Toggle theme on button click
    if (themeToggle) {
        themeToggle.addEventListener('click', function() {
            const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
            
            if (isDark) {
                enableLightMode();
            } else {
                enableDarkMode();
            }
            
            // Add animation effect
            this.style.transform = 'rotate(360deg)';
            setTimeout(() => {
                this.style.transform = '';
            }, 300);
        });
    }
    
    // Listen for system theme changes
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', function(e) {
        if (!localStorage.getItem('theme')) {
            if (e.matches) {
                enableDarkMode();
            } else {
                enableLightMode();
            }
        }
    });
    
    // Function to enable dark mode
    function enableDarkMode() {
        document.documentElement.setAttribute('data-theme', 'dark');
        darkModeCSS.removeAttribute('disabled');
        localStorage.setItem('theme', 'dark');
        
        // Update toggle button icon
        if (themeToggle) {
            const icon = themeToggle.querySelector('i');
            if (icon) {
                icon.className = 'fas fa-sun';
            }
        }
        
        // Dispatch event for other components
        document.dispatchEvent(new CustomEvent('themeChanged', { detail: 'dark' }));
    }
    
    // Function to enable light mode
    function enableLightMode() {
        document.documentElement.setAttribute('data-theme', 'light');
        darkModeCSS.setAttribute('disabled', 'true');
        localStorage.setItem('theme', 'light');
        
        // Update toggle button icon
        if (themeToggle) {
            const icon = themeToggle.querySelector('i');
            if (icon) {
                icon.className = 'fas fa-moon';
            }
        }
        
        // Dispatch event for other components
        document.dispatchEvent(new CustomEvent('themeChanged', { detail: 'light' }));
    }
    
    // Add smooth transition when theme changes
    document.documentElement.style.transition = 'background-color 0.3s ease, color 0.3s ease';
    
    // Add keyboard shortcut (Ctrl/Cmd + D to toggle theme)
    document.addEventListener('keydown', function(e) {
        if ((e.ctrlKey || e.metaKey) && e.key === 'd') {
            e.preventDefault();
            themeToggle?.click();
        }
    });
});