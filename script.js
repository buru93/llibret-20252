// This file contains additional JavaScript that could be separated from the HTML
// for better organization. You can include this file in your HTML with:
// <script src="script.js"></script>

// Enhanced parallax effect
window.addEventListener('scroll', function() {
    const parallaxSections = document.querySelectorAll('.parallax-section');
    
    parallaxSections.forEach(section => {
        const bg = section.querySelector('.parallax-bg');
        const content = section.querySelector('.content');
        const sectionTop = section.offsetTop;
        const scrollPosition = window.pageYOffset;
        const windowHeight = window.innerHeight;
        
        // Check if section is in viewport
        if (scrollPosition + windowHeight > sectionTop && 
            scrollPosition < sectionTop + section.offsetHeight) {
            
            // Calculate parallax offset for background
            const yOffset = (scrollPosition - sectionTop) * 0.4;
            bg.style.transform = `translateY(${yOffset}px)`;
            
            // Add subtle parallax to content
            const contentOffset = (scrollPosition - sectionTop) * 0.1;
            content.style.transform = `translateY(${-contentOffset}px)`;
            
            // Add opacity effect based on scroll position
            const opacity = 1 - Math.abs((scrollPosition - sectionTop) / windowHeight * 0.8);
            content.style.opacity = Math.max(0.3, Math.min(1, opacity));
        }
    });
});

// Intersection Observer for animations
const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            
            // Auto-play audio when section becomes visible (optional)
            // Uncomment the following lines to enable auto-play
            /*
            const audio = entry.target.querySelector('audio');
            if (audio) {
                // Pause all other audios first
                document.querySelectorAll('audio').forEach(a => a.pause());
                // Play this section's audio
                audio.play().catch(e => console.log('Auto-play prevented by browser'));
            }
            */
        } else {
            entry.target.classList.remove('visible');
        }
    });
}, {
    threshold: 0.3
});

// Observe all sections
document.querySelectorAll('.parallax-section').forEach(section => {
    observer.observe(section);
});

// Smooth scrolling with easing function
document.querySelectorAll('nav a').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
        e.preventDefault();
        
        const targetId = this.getAttribute('href');
        const targetElement = document.querySelector(targetId);
        
        // Get current scroll position
        const startPosition = window.pageYOffset;
        const targetPosition = targetElement.offsetTop;
        const distance = targetPosition - startPosition;
        const duration = 1000; // ms
        let start = null;
        
        // Easing function
        function easeInOutCubic(t) {
            return t < 0.5 
                ? 4 * t * t * t 
                : (t - 1) * (2 * t - 2) * (2 * t - 2) + 1;
        }
        
        function animation(currentTime) {
            if (start === null) start = currentTime;
            const timeElapsed = currentTime - start;
            const progress = Math.min(timeElapsed / duration, 1);
            const easing = easeInOutCubic(progress);
            
            window.scrollTo(0, startPosition + distance * easing);
            
            if (timeElapsed < duration) {
                requestAnimationFrame(animation);
            }
        }
        
        requestAnimationFrame(animation);
    });
});

// Audio visualization (if you want to add it)
function setupAudioVisualization() {
    document.querySelectorAll('audio').forEach(audio => {
        // Create audio context and analyzer
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const analyzer = audioContext.createAnalyser();
        const source = audioContext.createMediaElementSource(audio);
        
        source.connect(analyzer);
        analyzer.connect(audioContext.destination);
        
        // Configure analyzer
        analyzer.fftSize = 256;
        const bufferLength = analyzer.frequencyBinCount;
        const dataArray = new Uint8Array(bufferLength);
        
        // Create canvas for visualization
        const canvas = document.createElement('canvas');
        canvas.width = audio.offsetWidth;
        canvas.height = 60;
        canvas.style.marginTop = '10px';
        canvas.style.display = 'block';
        canvas.style.borderRadius = '8px';
        
        // Insert canvas after audio element
        audio.parentNode.insertBefore(canvas, audio.nextSibling);
        
        const canvasCtx = canvas.getContext('2d');
        
        // Visualization function
        function draw() {
            requestAnimationFrame(draw);
            
            analyzer.getByteFrequencyData(dataArray);
            
            canvasCtx.fillStyle = 'rgba(255, 255, 255, 0.2)';
            canvasCtx.fillRect(0, 0, canvas.width, canvas.height);
            
            const barWidth = (canvas.width / bufferLength) * 2.5;
            let x = 0;
            
            for (let i = 0; i < bufferLength; i++) {
                const barHeight = dataArray[i] / 2;
                
                // Get section color
                const section = audio.closest('.parallax-section');
                const computedStyle = window.getComputedStyle(section);
                const backgroundColor = computedStyle.backgroundColor;
                
                canvasCtx.fillStyle = backgroundColor;
                canvasCtx.fillRect(x, canvas.height - barHeight, barWidth, barHeight);
                
                x += barWidth + 1;
            }
        }
        
        // Start visualization when playing
        audio.addEventListener('play', function() {
            if (audioContext.state === 'suspended') {
                audioContext.resume();
            }
            draw();
        });
    });
}

// Call this function after the page loads
window.addEventListener('load', setupAudioVisualization);