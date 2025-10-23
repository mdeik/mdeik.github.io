/**
 * Fit-to-viewport functionality
 * Dynamically adjusts font size to ensure content fits within viewport on desktop
 * On mobile, allows natural scrolling and uses maximum font size
 */
(function fitToViewport() {
    const MIN_FONT = 10;  // Minimum font size in pixels
    const MAX_FONT = 18;  // Maximum font size in pixels
    const root = document.documentElement;
    const timeline = document.getElementById('timeline');
    const projectsTimeline = document.getElementById('projects-timeline');

    /**
     * Check if current viewport is mobile size
     * @returns {boolean} True if mobile breakpoint is matched
     */
    function isMobile() {
        return window.matchMedia('(max-width:560px)').matches;
    }

    /**
     * Adjust font size and scrolling behavior based on viewport
     */
    function adjust() {
        // On mobile, use max font and allow natural scrolling
        if (isMobile()) {
            root.style.setProperty('--base-font', MAX_FONT);
            if (timeline) timeline.style.overflow = 'visible';
            if (projectsTimeline) projectsTimeline.style.overflow = 'visible';
            return;
        }

        // Start with maximum font size
        root.style.setProperty('--base-font', MAX_FONT);
        
        requestAnimationFrame(() => {
            const fullHeight = document.documentElement.scrollHeight;
            const viewH = window.innerHeight;
            
            // If content already fits, keep max font size
            if (fullHeight <= viewH) {
                root.style.setProperty('--base-font', MAX_FONT);
                if (timeline) timeline.style.overflow = 'auto';
                if (projectsTimeline) projectsTimeline.style.overflow = 'auto';
                return;
            }
            
            // Scale font size based on viewport to content ratio
            const scale = viewH / fullHeight;
            const newFont = Math.max(MIN_FONT, Math.floor(MAX_FONT * Math.min(1, scale)));
            root.style.setProperty('--base-font', newFont);
            
            // Final check to ensure proper scrolling behavior
            requestAnimationFrame(() => {
                if (timeline) timeline.style.overflow = 'auto';
                if (projectsTimeline) projectsTimeline.style.overflow = 'auto';
            });
        });
    }

    // Set up event listeners for responsive adjustments
    window.addEventListener('load', adjust);
    window.addEventListener('resize', adjust);
    
    // Observe DOM changes that might affect layout
    const ro = new ResizeObserver(adjust);
    ro.observe(document.body);
})();

/**
 * Enhanced keyboard accessibility for interactive elements
 * Adds Enter/Space key support for chips and icon buttons
 */
document.querySelectorAll('.chip, .icon-btn').forEach(el => {
    el.setAttribute('tabindex', '0');
    
    el.addEventListener('keydown', e => {
        // Trigger click on Enter or Space key
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            el.click?.();
            
            // Visual feedback for keyboard activation
            el.classList.add('active');
            setTimeout(() => el.classList.remove('active'), 180);
        }
    });
});