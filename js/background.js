export default function initBackground() {
    const canvas = document.getElementById('animeCanvas');
    
    // Salir si el canvas no existe, para evitar errores en otros contextos
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    
    let width, height;
    let clouds = [];
    let stars = [];
    let shootingStars = [];

    let cloudCount;
    let cloudSizeMultiplier;
    
    const keyframes = [
        // --- NOCHE PROFUNDA (LUNA DESCENDIENDO) ---
        { hour: 0,     state: "Noche",     sky: ['#0c0a1a', '#1c1a32', '#2a2a4a', '#4a4a7a'], sunY: 0.15, color: '#f5f5f5', night: 1.0 },
        { hour: 4.75,  state: "Noche",     sky: ['#0c0a1a', '#1c1a32', '#2a2a4a', '#4a4a7a'], sunY: 1.1,  color: '#f5f5f5', night: 1.0 }, // 4:45am. Punto de inicio para la transición del cielo. Luna ya oculta.

        // --- AMANECER (TRANSICIÓN DE CIELO Y SALIDA DEL SOL) ---
        { hour: 5.5,   state: "Amanecer",  sky: ['#4a69bd', '#e84393', '#f6e58d', '#ffbe76'], sunY: 1.1,  color: '#f1c40f', night: 0.9 }, // 5:30am. Cielo de amanecer listo. Sol aún oculto.
        { hour: 5.52,  state: "Amanecer",  sky: ['#4a69bd', '#e84393', '#f6e58d', '#ffbe76'], sunY: 1.1,  color: '#f1c40f', night: 0.8 }, // 5:31am. Sol comienza a salir.
        { hour: 8,     state: "Mañana",    sky: ['#75b6e0', '#a4cceb', '#c1dff5', '#d3e8f5'], sunY: 0.4,  color: '#f9f9f9', night: 0.0 },

        // --- DÍA Y ATARDECER ---
        { hour: 14,    state: "Mediodía",  sky: ['#3498db', '#5ea7e2', '#85c1e9', '#a3d2f0'], sunY: 0.15, color: '#ffffff', night: 0.0 },
        { hour: 18,    state: "Tarde",     sky: ['#5ea7e2', '#a3d2f0', '#fde49c', '#fdf5e6'], sunY: 0.5,  color: '#f9f9f9', night: 0.1 },
        { hour: 19.83, state: "Atardecer", sky: ['#4a69bd', '#e67e22', '#f1c40f', '#f9e79f'], sunY: 1.1,  color: '#f39c12', night: 0.9 }, // 19:50pm Sol se oculta
        { hour: 19.84, state: "Atardecer", sky: ['#2c3e50', '#8e44ad', '#d35400', '#f39c12'], sunY: 1.1,  color: '#f39c12', night: 0.95},
        { hour: 20.33, state: "Noche",     sky: ['#0c0a1a', '#1c1a32', '#2a2a4a', '#4a4a7a'], sunY: 1.1,  color: '#f5f5f5', night: 1.0 }, // 20:20pm Cielo de noche listo
        { hour: 20.35, state: "Noche",     sky: ['#0c0a1a', '#1c1a32', '#2a2a4a', '#4a4a7a'], sunY: 1.1,  color: '#f5f5f5', night: 1.0 }, // 20:21pm Luna comienza a salir
        { hour: 24,    state: "Noche",     sky: ['#0c0a1a', '#1c1a32', '#2a2a4a', '#4a4a7a'], sunY: 0.15, color: '#f5f5f5', night: 1.0 }
    ];

    function lerp(a, b, t) { return a + (b - a) * t; }

    function parseColorToRgb(color) {
        let r, g, b;
        if (color.startsWith('#')) {
            r = parseInt(color.slice(1, 3), 16);
            g = parseInt(color.slice(3, 5), 16);
            b = parseInt(color.slice(5, 7), 16);
        } else {
            const parts = color.substring(color.indexOf('(') + 1, color.lastIndexOf(')')).split(/,\s*/);
            r = parseInt(parts[0]); g = parseInt(parts[1]); b = parseInt(parts[2]);
        }
        return { r, g, b };
    }

    function lerpColor(color1, color2, t) {
        const c1 = parseColorToRgb(color1); const c2 = parseColorToRgb(color2);
        const r = Math.round(lerp(c1.r, c2.r, t)); const g = Math.round(lerp(c1.g, c2.g, t)); const b = Math.round(lerp(c1.b, c2.b, t));
        return `rgb(${r},${g},${b})`;
    }
    
    function lerpPalette(paletteA, paletteB, t) { return paletteA.map((color, i) => lerpColor(color, paletteB[i], t)); }

    function resizeCanvas() {
        width = canvas.width = window.innerWidth;
        height = canvas.height = window.innerHeight;

        if (width <= 425) {
            cloudCount = 3; // cantidad de nubes para la pantalla
            cloudSizeMultiplier = 0.6; // tamaño de la nube
        } else if (width <= 600) {
            cloudCount = 4; 
            cloudSizeMultiplier = 0.7; 
        } else if (width <= 768) {
            cloudCount = 6; 
            cloudSizeMultiplier = 0.8; 
        } else if (width <= 1024) {
            cloudCount = 8; 
            cloudSizeMultiplier = 0.9; 
        } else {
            cloudCount = 10; 
            cloudSizeMultiplier = 1.0; 
        }

        initElements();
    }

    class Star {
        constructor() {
            this.x = Math.random() * width; this.y = Math.random() * height * 0.9;
            this.size = Math.random() * 1.5 + 0.5; this.baseOpacity = Math.random() * 0.8 + 0.2;
        }
        draw(nightFactor) {
            const opacity = this.baseOpacity * nightFactor;
            if (opacity > 0.1) {
                ctx.fillStyle = `rgba(255, 255, 240, ${opacity})`;
                ctx.beginPath(); ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2); ctx.fill();
            }
        }
    }
    
    class ShootingStar {
        constructor() { this.reset(); }
        reset() {
            this.x = Math.random() * width; this.y = 0;
            this.len = Math.random() * 80 + 10; this.speed = Math.random() * 15 + 8;
            this.size = Math.random() * 1 + 0.5; this.active = true;
        }
        update() {
            if (this.active) {
                this.x -= this.speed; this.y += this.speed;
                if (this.x < 0 || this.y > height) { this.active = false; }
            }
        }
        draw() {
            if (this.active) {
                ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)'; ctx.lineWidth = this.size;
                ctx.beginPath(); ctx.moveTo(this.x, this.y);
                ctx.lineTo(this.x + this.len, this.y - this.len); ctx.stroke();
            }
        }
    }

    class Cloud {
        constructor() {
            this.x = Math.random() * width * 1.5 - width * 0.25; this.y = Math.random() * height * 0.6;
            // --- INICIO DE CAMBIOS: Aplicar multiplicador de tamaño ---
            this.size = (Math.random() * 80 + 100) * cloudSizeMultiplier;
            // --- FIN DE CAMBIOS ---
            this.speed = Math.random() * 0.2 + 0.1; this.opacity = Math.random() * 0.4 + 0.3;
        }
        update() {
            this.x += this.speed;
            if (this.x > width + this.size * 2) { this.x = -this.size * 2; }
        }
        draw(sunColor, nightFactor) {
            const topColor = lerpColor('rgb(64,64,92)', 'rgb(255,255,255)', 1 - nightFactor);
            const bottomColor = lerpColor(sunColor, 'rgb(128,128,144)', nightFactor);
            const cloudGradient = ctx.createLinearGradient(0, this.y - this.size * 0.4, 0, this.y + this.size * 0.4);
            cloudGradient.addColorStop(0, topColor); cloudGradient.addColorStop(1, bottomColor);
            ctx.fillStyle = cloudGradient; ctx.globalAlpha = this.opacity;
            ctx.beginPath();
            ctx.ellipse(this.x, this.y, this.size, this.size * 0.4, 0, 0, Math.PI * 2);
            ctx.ellipse(this.x + this.size * 0.5, this.y + this.size * 0.1, this.size * 0.8, this.size * 0.5, 0, 0, Math.PI * 2);
            ctx.ellipse(this.x - this.size * 0.5, this.y + this.size * 0.1, this.size * 0.7, this.size * 0.4, 0, 0, Math.PI * 2);
            ctx.fill(); ctx.globalAlpha = 1;
        }
    }

    function initElements() {
        stars = []; clouds = []; shootingStars = [];
        for (let i = 0; i < 150; i++) stars.push(new Star());
        // --- INICIO DE CAMBIOS: Usar la cantidad de nubes responsiva ---
        for (let i = 0; i < cloudCount; i++) clouds.push(new Cloud());
        // --- FIN DE CAMBIOS ---
        for (let i = 0; i < 2; i++) shootingStars.push(new ShootingStar());
    }

    function getInterpolatedValues(hour) {
        let currentFrameIndex = keyframes.findIndex(frame => frame.hour > hour) - 1;
        if (currentFrameIndex < 0) { currentFrameIndex = keyframes.length - 2; hour += 24; }
        const fromFrame = keyframes[currentFrameIndex]; const toFrame = keyframes[currentFrameIndex + 1];
        const phaseDuration = toFrame.hour - fromFrame.hour; const timeIntoPhase = hour - fromFrame.hour;
        const progress = phaseDuration === 0 ? 0 : timeIntoPhase / phaseDuration;
        return {
            state: fromFrame.state,
            sky: lerpPalette(fromFrame.sky, toFrame.sky, progress),
            sunY: lerp(fromFrame.sunY, toFrame.sunY, progress) * height,
            color: lerpColor(fromFrame.color, toFrame.color, progress),
            night: lerp(fromFrame.night, toFrame.night, progress)
        };
    }

    function animate() {
        const now = new Date();
        const realHour = now.getHours() + now.getMinutes() / 60 + now.getSeconds() / 3600;
        
        const values = getInterpolatedValues(realHour);

        const skyGradient = ctx.createLinearGradient(0, 0, 0, height);
        values.sky.forEach((color, index) => { skyGradient.addColorStop(index / (values.sky.length - 1), color); });
        ctx.fillStyle = skyGradient; ctx.fillRect(0, 0, width, height);

        stars.forEach(star => star.draw(values.night));

        if (values.night > 0.95) {
            shootingStars.forEach(ss => {
                if (ss.active) {
                    ss.update();
                    ss.draw();
                } else if (Math.random() < 0.0005) {
                    ss.reset();
                }
            });
        }

        const radiusMultiplier = lerp(0.10, 0.07, values.night);
        const sunRadius = Math.min(width, height) * radiusMultiplier;
        const glowGradient = ctx.createRadialGradient(width / 2, values.sunY, 0, width / 2, values.sunY, sunRadius * 3);
        const sunRgb = parseColorToRgb(values.color);
        glowGradient.addColorStop(0, `rgba(${sunRgb.r}, ${sunRgb.g}, ${sunRgb.b}, 0.4)`);
        glowGradient.addColorStop(1, `rgba(${sunRgb.r}, ${sunRgb.g}, ${sunRgb.b}, 0)`);
        ctx.fillStyle = glowGradient; ctx.fillRect(0, 0, width, height);
        
        ctx.fillStyle = values.color; ctx.beginPath();
        ctx.arc(width / 2, values.sunY, sunRadius, 0, Math.PI * 2); ctx.fill();

        clouds.forEach(cloud => { cloud.update(); cloud.draw(values.color, values.night); });

        requestAnimationFrame(animate);
    }

    window.addEventListener('resize', resizeCanvas);
    resizeCanvas();
    animate();
}