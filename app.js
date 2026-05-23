/* ==========================================================================
   Caring Bear Dreamworld - Core Logic & Audio Engine
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
  // Reveal body once elements are loaded
  gsap.set(document.body, { opacity: 1 });

  /* ==========================================================================
     DOM Selectors
     ========================================================================== */
  const $RAIN = document.querySelector('.rain');
  const $BACKDROP = document.querySelector('.backdrop');
  const $HEARTS = document.querySelector('.hearts');
  const $BEAR = document.querySelector('#main-bear-svg');
  const $BEAR_ARM_LEFT = document.querySelector('.care-bear__arm--left');
  const $BEAR_ARM_RIGHT = document.querySelector('.care-bear__arm--right');
  const $BEAR_EAR_LEFT = document.querySelector('.care-bear__ear--left');
  const $BEAR_EAR_RIGHT = document.querySelector('.care-bear__ear--right');
  const $BEAR_MOUTH = document.querySelector('.care-bear__mouth');
  const $BEAR_NOSE = document.querySelector('.care-bear__nose');
  const $BEAR_CHEEK_LEFT = document.querySelector('.care-bear__cheek--left');
  const $BEAR_CHEEK_RIGHT = document.querySelector('.care-bear__cheek--right');
  const $BEAR_EYE_LEFT = document.querySelector('.care-bear__eye--left');
  const $BEAR_EYE_RIGHT = document.querySelector('.care-bear__eye--right');
  const $BEAR_PUPIL_LEFT = document.querySelector('.care-bear__pupil--left');
  const $BEAR_PUPIL_RIGHT = document.querySelector('.care-bear__pupil--right');
  const $BEAR_BELLY = document.querySelector('.care-bear__belly');
  const $BEAR_MUZZLE = document.querySelector('.care-bear__muzzle');
  const $BEAR_HEART = document.querySelector('.care-bear__heart');
  
  // UI Panels & Inputs
  const $PRESETS = document.querySelectorAll('.preset-card');
  const $HUE_SLIDER = document.querySelector('#hue-slider');
  const $SAT_SLIDER = document.querySelector('#sat-slider');
  const $LIGHT_SLIDER = document.querySelector('#light-slider');
  const $HUE_VAL = document.querySelector('#hue-val');
  const $SAT_VAL = document.querySelector('#sat-val');
  const $LIGHT_VAL = document.querySelector('#light-val');
  
  const $WEATHER_BTNS = document.querySelectorAll('.weather-btn');
  const $SOUND_TOGGLE = document.querySelector('#sound-toggle');
  const $RAIN_VOL = document.querySelector('#rain-vol');
  const $CHIME_VOL = document.querySelector('#chime-vol');
  const $RAIN_VOL_VAL = document.querySelector('#rain-vol-val');
  const $CHIME_VOL_VAL = document.querySelector('#chime-vol-val');
  
  const $QUOTE = document.querySelector('#bear-quote');
  const $STARE_CTA = document.querySelector('#care-stare-btn');
  const $STARE_AURA = document.querySelector('#stare-aura');
  
  const $THEME_BTN = document.querySelector('#theme-btn');
  const $HELP_BTN = document.querySelector('#help-btn');
  const $MODAL = document.querySelector('#help-modal');
  const $MODAL_CLOSE = document.querySelector('#modal-close-btn');
  const $MODAL_START = document.querySelector('#modal-start-btn');
  
  const $MOBILE_TOGGLE = document.querySelector('#mobile-control-toggle');
  const $LEFT_PANEL = document.querySelector('#customizer-panel');
  const $RIGHT_PANEL = document.querySelector('#environment-panel');
  
  const $LOADING = document.querySelector('#loading-overlay');

  /* ==========================================================================
     Animation Configuration Speeds
     ========================================================================== */
  const SPEEDS = {
    BACKDROP: {
      SCALE: 0.35,
      SPIN: 0.95,
    },
    BREATHING: 1.6,
    SWITCH: 0.12,
  };

  const STATE = {
    FIRING: false,
    CLOSING: false,
    ACTIVE_BEAR: 'cheer',
    WEATHER: 'drizzle',
    LIGHTS: 'light',
    DRAWER_OPEN: false,
    HUE: 330,
    SATURATION: 90,
    LIGHTNESS: 60,
  };

  /* ==========================================================================
     Speech Quotes Database
     ========================================================================== */
  const QUOTES = {
    cheer: {
      sad: "I lost my rainbow cheer... Can you help me find it?",
      happy: "Hurray! The rainbow is back! Spread joy everywhere!",
    },
    grumpy: {
      sad: "Hmph. It's raining, and my tummy is rumbling. Typical.",
      happy: "Oh! This warmth... it's actually not bad. Let's send a storm of care!",
    },
    bedtime: {
      sad: "Yawn... I'm too tired to dream. Goodnight...",
      happy: "Sweet dreams! Let's send sleepy stardust to the world!",
    },
    funshine: {
      sad: "Without sunshine, my shine is all gone...",
      happy: "Feel the sunshine power! Let's light up the sky!",
    },
    share: {
      sad: "I want to share my treats, but no one is around...",
      happy: "Sharing is caring! Let's send treats and love to all!",
    },
    tenderheart: {
      sad: "My heart is feeling a little lonely...",
      happy: "Love is the greatest power! Sending huge warm hugs!",
    },
    custom: {
      sad: "I'm a unique bear, but I'm feeling a little bit blue...",
      happy: "Wow, I feel so special! Feel my glowing energy!",
    }
  };

  // Sound Synth Toggle State
  let audioContext = null;
  let rainNoiseSource = null;
  let rainFilter = null;
  let rainGain = null;
  let chimeGainNode = null;
  let synthesizerActive = true;

  /* ==========================================================================
     Care Bear Animation System (GSAP)
     ========================================================================== */
  
  // Set the backdrop scale to 0 initially
  gsap.set($BACKDROP, { scale: 0 });
  
  // Set bear to initial custom defaults (Pink Cheer Bear)
  updateBearThemeColor(330, 90, 60);

  // Set the default initial states for GSAP elements
  gsap.set($BEAR_ARM_LEFT, {
    transformOrigin: '85% 80%',
    scale: 0.85,
    rotate: -110,
  });
  gsap.set($BEAR_ARM_RIGHT, {
    transformOrigin: '15% 80%',
    scale: 0.85,
    rotate: 110,
  });
  gsap.set($BEAR_EAR_LEFT, { transformOrigin: '70% 85%', rotate: -60 });
  gsap.set($BEAR_EAR_RIGHT, { transformOrigin: '30% 85%', rotate: 60 });
  gsap.set($BEAR_MOUTH, { transformOrigin: '50% 0%', scaleY: 0, y: '+=2' });
  gsap.set($BEAR_NOSE, { transformOrigin: '50% 50%', y: '+=2' });
  gsap.set($BEAR_BELLY, { transformOrigin: '50% 50%' });
  gsap.set($BEAR_MUZZLE, { transformOrigin: '50% 50%' });
  gsap.set($BEAR_HEART, { transformOrigin: '50% 50%' });
  gsap.set([$BEAR_CHEEK_LEFT, $BEAR_CHEEK_RIGHT], {
    transformOrigin: '50% 50%',
    opacity: 0,
    y: '+=2',
  });
  gsap.set([$BEAR_EYE_LEFT, $BEAR_EYE_RIGHT], {
    transformOrigin: '50% 50%',
    y: '+=2',
    clipPath: 'inset(50% 0 0 0)',
  });
  gsap.set([$BEAR_PUPIL_LEFT, $BEAR_PUPIL_RIGHT], {
    transformOrigin: '50% 50%',
    z: 1,
    y: '+=1.25',
  });

  // TIMELINE: Backdrop Rotating Conics
  const OPEN_BACKDROP_TL = gsap.timeline({ paused: true })
    .to($BACKDROP, { scale: 1.5, duration: SPEEDS.BACKDROP.SCALE, ease: 'power2.out' })
    .to($BACKDROP, {
      rotate: 360,
      duration: SPEEDS.BACKDROP.SPIN,
      repeat: -1,
      ease: 'none',
    }, 0);

  // TIMELINE: Close Backdrop
  const CLOSE_BACKDROP_TL = gsap.timeline({
    paused: true,
    onComplete: () => {
      if (OPEN_BACKDROP_TL) {
        STATE.CLOSING = false;
        STATE.FIRING = false;
        OPEN_BACKDROP_TL.pause();
        BREATHING_TL.play();
      }
    },
  }).to($BACKDROP, { scale: 0, duration: SPEEDS.BACKDROP.SCALE, ease: 'power2.in' });

  // TIMELINE: Stare Activation / Bear cheer up
  const RAISE_TL = gsap.timeline({ paused: true })
    .add([
      gsap.to([$BEAR_ARM_LEFT, $BEAR_ARM_RIGHT], {
        duration: SPEEDS.SWITCH,
        scale: 1,
        rotate: 0,
        ease: 'back.out(1.7)'
      }),
      gsap.to([$BEAR_EAR_LEFT, $BEAR_EAR_RIGHT], {
        duration: SPEEDS.SWITCH,
        rotate: 0,
        ease: 'back.out(1.7)'
      }),
      gsap.to($BEAR_HEART, {
        duration: SPEEDS.SWITCH,
        scale: 1.25,
        ease: 'back.out(2)'
      }),
      gsap.to($BEAR_NOSE, { duration: SPEEDS.SWITCH, y: 0 }),
      gsap.to($BEAR_MOUTH, { duration: SPEEDS.SWITCH, y: 0, scaleY: 1 }),
      gsap.to([$BEAR_CHEEK_LEFT, $BEAR_CHEEK_RIGHT], {
        duration: SPEEDS.SWITCH,
        opacity: 1,
        y: 0
      }),
      gsap.to([$BEAR_EYE_LEFT, $BEAR_EYE_RIGHT], {
        duration: SPEEDS.SWITCH,
        clipPath: 'inset(0% 0% 0% 0%)',
        y: 0
      }),
      gsap.to([$BEAR_PUPIL_LEFT, $BEAR_PUPIL_RIGHT], {
        duration: SPEEDS.SWITCH,
        y: 0
      }),
      gsap.to($BEAR_HEART, { duration: SPEEDS.SWITCH, '--saturation': 100 }),
      gsap.to($BEAR, { duration: SPEEDS.SWITCH, '--saturation': 100 })
    ]);

  // TIMELINE: Idle Breathing loop
  const BREATHING_TL = gsap.timeline({ repeat: -1, yoyo: true })
    .add(gsap.to($BEAR_BELLY, { scale: 1.03, duration: SPEEDS.BREATHING, ease: 'sine.inOut' }))
    .add(gsap.to($BEAR_ARM_RIGHT, { rotate: 108, duration: SPEEDS.BREATHING, ease: 'sine.inOut' }, 0))
    .add(gsap.to($BEAR_ARM_LEFT, { rotate: -108, duration: SPEEDS.BREATHING, ease: 'sine.inOut' }, 0))
    .add(gsap.to($BEAR_NOSE, { y: '-=0.4', duration: SPEEDS.BREATHING, ease: 'sine.inOut' }, 0))
    .add(gsap.to([$BEAR_EYE_LEFT, $BEAR_EYE_RIGHT], { y: '-=0.4', duration: SPEEDS.BREATHING, ease: 'sine.inOut' }, 0))
    .add(gsap.to([$BEAR_EAR_LEFT, $BEAR_EAR_RIGHT], { y: '-=0.4', duration: SPEEDS.BREATHING, ease: 'sine.inOut' }, 0))
    .add(gsap.to($BEAR_MUZZLE, { y: '-=0.4', duration: SPEEDS.BREATHING, ease: 'sine.inOut' }, 0));

  // Blinking loop logic
  let BLINKING_TL;
  const blink = () => {
    const DELAY = Math.floor(Math.random() * 5) + 2;
    if (STATE.FIRING) return;
    
    BLINKING_TL = gsap.timeline().add(
      gsap.to([$BEAR_EYE_LEFT, $BEAR_EYE_RIGHT], {
        delay: DELAY,
        scaleY: 0,
        duration: SPEEDS.SWITCH,
        repeat: 1,
        yoyo: true,
        onComplete: blink,
        transformOrigin: '50% 50%'
      })
    );
  };
  blink();

  // Teasing / Hover State
  const tease = () => {
    if (STATE.FIRING || STATE.CLOSING) return;
    if (BLINKING_TL) {
      BLINKING_TL.seek(0);
      BLINKING_TL.pause();
    }
    gsap.to([$BEAR_EYE_RIGHT, $BEAR_EYE_LEFT], {
      duration: SPEEDS.SWITCH,
      clipPath: 'inset(0% 0% 0% 0%)',
    });
  };

  // Sad / Sulking State (Default Rest)
  const sadden = () => {
    if (STATE.FIRING || STATE.CLOSING) return;
    if (BLINKING_TL) {
      BLINKING_TL.restart();
    }
    gsap.to([$BEAR_EYE_RIGHT, $BEAR_EYE_LEFT], {
      clipPath: 'inset(50% 0% 0% 0%)',
      duration: SPEEDS.SWITCH
    });
  };

  /* ==========================================================================
     Color Customization & Preset Handlers
     ========================================================================== */
  function updateBearThemeColor(h, s, l) {
    STATE.HUE = h;
    STATE.SATURATION = s;
    STATE.LIGHTNESS = l;
    
    // Animate variables on bear directly using GSAP
    gsap.to($BEAR, {
      duration: 0.3,
      '--hue': h,
      '--saturation': s,
      '--lightness': l
    });

    // Set variable on SVG root for glows
    const hslString = `hsl(${h}, ${s}%, ${l}%)`;
    $BEAR.style.setProperty('--bear-glow-color', convertHslToRgb(h, s, l));
  }

  // Helper: HSL to RGB approximation for glow filters
  function convertHslToRgb(h, s, l) {
    s /= 100;
    l /= 100;
    let c = (1 - Math.abs(2 * l - 1)) * s;
    let x = c * (1 - Math.abs((h / 60) % 2 - 1));
    let m = l - c/2;
    let r = 0, g = 0, b = 0;

    if (0 <= h && h < 60) { r = c; g = x; b = 0; }
    else if (60 <= h && h < 120) { r = x; g = c; b = 0; }
    else if (120 <= h && h < 180) { r = 0; g = c; b = x; }
    else if (180 <= h && h < 240) { r = 0; g = x; b = c; }
    else if (240 <= h && h < 300) { r = x; g = 0; b = c; }
    else if (300 <= h && h < 360) { r = c; g = 0; b = x; }

    return `${Math.round((r + m) * 255)}, ${Math.round((g + m) * 255)}, ${Math.round((b + m) * 255)}`;
  }

  // Handle preset clicks
  $PRESETS.forEach(card => {
    card.addEventListener('click', () => {
      // Remove active from all
      $PRESETS.forEach(c => c.classList.remove('active'));
      card.classList.add('active');

      const preset = card.dataset.preset;
      const hue = parseInt(card.dataset.hue);
      const sat = parseInt(card.dataset.sat);
      const light = parseInt(card.dataset.light);

      STATE.ACTIVE_BEAR = preset;

      // Sync color workshop sliders
      $HUE_SLIDER.value = hue;
      $SAT_SLIDER.value = sat;
      $LIGHT_SLIDER.value = light;
      
      $HUE_VAL.innerText = hue + '°';
      $SAT_VAL.innerText = sat + '%';
      $LIGHT_VAL.innerText = light + '%';

      // Update bear visual properties
      updateBearThemeColor(hue, sat, light);

      // Trigger dialogue speech bubble
      updateQuoteBubble();

      // Trigger quick ear wiggle feedback animation
      gsap.fromTo([$BEAR_EAR_LEFT, $BEAR_EAR_RIGHT], 
        { rotate: (i) => i === 0 ? -15 : 15 },
        { rotate: 0, duration: 0.5, ease: 'elastic.out(1, 0.3)' }
      );
    });
  });

  // Handle color workshop sliders changes
  function onSliderUpdate() {
    const h = parseInt($HUE_SLIDER.value);
    const s = parseInt($SAT_SLIDER.value);
    const l = parseInt($LIGHT_SLIDER.value);

    $HUE_VAL.innerText = h + '°';
    $SAT_VAL.innerText = s + '%';
    $LIGHT_VAL.innerText = l + '%';

    STATE.ACTIVE_BEAR = 'custom';
    // Remove active state from presets
    $PRESETS.forEach(c => c.classList.remove('active'));

    updateBearThemeColor(h, s, l);
    updateQuoteBubble();
  }

  $HUE_SLIDER.addEventListener('input', onSliderUpdate);
  $SAT_SLIDER.addEventListener('input', onSliderUpdate);
  $LIGHT_SLIDER.addEventListener('input', onSliderUpdate);

  // Update speech bubble text
  function updateQuoteBubble() {
    const speakState = STATE.FIRING ? 'happy' : 'sad';
    const bearKey = STATE.ACTIVE_BEAR;
    $QUOTE.innerText = QUOTES[bearKey][speakState];
  }

  /* ==========================================================================
     Magic Hearts Particle Launcher System
     ========================================================================== */
  const HEART_SVG = `
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 7.258088 6.7122535">
    <path d="M2.56864 1.32292c-.31816 0-.63626.12209-.88005.36587-.48757.48758-.48757 1.27253 0 1.7601l.18035.18035 1.7601 1.7601 1.7601-1.7601.18035-.18035c.48757-.48757.48757-1.27252 0-1.7601-.24379-.24378-.56189-.36587-.88005-.36587-.31815 0-.63626.12209-.88005.36587l-.18035.18035-.18035-.18035c-.24379-.24378-.5619-.36587-.88005-.36587z" fill="red"/>
  </svg>
  `;

  const fireHearts = () => {
    if (!STATE.FIRING || STATE.CLOSING) {
      $HEARTS.innerHTML = '';
      return;
    }

    const newHeart = document.createElement('div');
    newHeart.className = 'heart';
    
    // Choose size and randomized HSL attributes
    const size = Math.floor(Math.random() * 30) + 12;
    newHeart.style.setProperty('--size', size);
    
    // Hue: Mix of bear color and high-fidelity sparks
    const heartHue = Math.random() > 0.4 ? STATE.HUE : Math.floor(Math.random() * 360);
    newHeart.style.setProperty('--hue', heartHue);
    newHeart.innerHTML = HEART_SVG;

    const svg = newHeart.querySelector('svg');
    $HEARTS.appendChild(newHeart);

    // Initial random rotation and positioning
    gsap.set(newHeart, {
      rotate: 'random(0, 360)',
      transformOrigin: '50% 50%',
      x: 'random(-40, 40)',
      y: 'random(40, 70)' // start slightly behind the belly heart
    });

    // Animate particle shooting upward and fading away
    const angleX = (Math.random() - 0.5) * 600; // side drift
    gsap.to(newHeart, {
      x: `+=${angleX}`,
      y: '-105vh',
      rotation: 'random(-720, 720)',
      opacity: 0,
      duration: Math.random() * 1.5 + 0.8,
      ease: 'power1.out',
      onComplete: () => {
        newHeart.remove();
      }
    });

    // Synthesize sparkling chime sound if enabled
    playChimeSynthTone();

    // Loop particle request
    requestAnimationFrame(fireHearts);
  };

  /* ==========================================================================
     Environmental Weather Engine (Rain, Storms, Clouds)
     ========================================================================== */
  
  function applyWeather(type) {
    STATE.WEATHER = type;

    // Remove active from all weather buttons
    $WEATHER_BTNS.forEach(b => b.classList.remove('active'));
    // Set matching button active
    const btn = document.querySelector(`.weather-btn[data-weather="${type}"]`);
    if (btn) btn.classList.add('active');

    // Reset weather container
    $RAIN.innerHTML = '';

    // Adjust Clouds overlay visuals
    const cloudsContainer = document.querySelector('#clouds-bg');
    if (type === 'storm') {
      gsap.to(cloudsContainer, { opacity: 0.9, duration: 1 });
      triggerStormWeather();
    } else if (type === 'drizzle') {
      gsap.to(cloudsContainer, { opacity: 0.6, duration: 1 });
      triggerRainyWeather(25);
    } else if (type === 'hearts') {
      gsap.to(cloudsContainer, { opacity: 0.2, duration: 1 });
      triggerHeartShower();
    } else {
      // Clear sky
      gsap.to(cloudsContainer, { opacity: 0, duration: 1 });
    }

    // Refresh audio synthesizer weather hum
    adjustWeatherAmbientSound();
  }

  function triggerRainyWeather(density) {
    for (let d = 0; d < density; d++) {
      const droplet = document.createElement('svg');
      droplet.setAttribute('viewBox', '0 0 5 50');
      droplet.setAttribute(
        'style',
        `--x: ${Math.floor(Math.random() * 100)}; --y: ${Math.floor(
          Math.random() * 100
        )}; --o: ${Math.random() * 0.7 + 0.3}; --a: ${Math.random() * 0.8 +
          0.4}; --d: ${Math.random() * 2}; --s: ${Math.random() * 0.8 + 0.2}`
      );
      droplet.innerHTML = `<path d="M 2.5,0 C 2.6949458,3.5392017 3.344765,20.524571 4.4494577,30.9559 5.7551357,42.666753 4.5915685,50 2.5,50 0.40843152,50 -0.75513565,42.666753 0.55054234,30.9559 1.655235,20.524571 2.3050542,3.5392017 2.5,0 Z"></path>`;
      $RAIN.appendChild(droplet);
    }
  }

  function triggerStormWeather() {
    triggerRainyWeather(55);
    
    // Synthesize occasional lightning flashes in browser
    scheduleLightningFlash();
  }

  function scheduleLightningFlash() {
    if (STATE.WEATHER !== 'storm') return;
    
    const nextFlash = Math.random() * 7000 + 4000;
    setTimeout(() => {
      if (STATE.WEATHER !== 'storm') return;
      
      // Perform flash animation on body background using GSAP
      const flashTl = gsap.timeline();
      flashTl.to(document.body, { background: '#ffffff', duration: 0.05 })
             .to(document.body, { background: 'rgba(255, 255, 255, 0.4)', duration: 0.15 })
             .to(document.body, { background: '#ffffff', duration: 0.05 })
             .to(document.body, { background: STATE.LIGHTS === 'dark' ? 'hsl(220, 25%, 10%)' : 'hsl(220, 60%, 94%)', duration: 0.8 });

      // Storm audio synthesis thunder boom
      playThunderSynthSound();
      
      scheduleLightningFlash();
    }, nextFlash);
  }

  function triggerHeartShower() {
    // Generate soft floating hearts that slowly drizzle down
    for (let d = 0; d < 20; d++) {
      const heartDrop = document.createElement('div');
      heartDrop.className = 'heart';
      heartDrop.innerHTML = HEART_SVG;

      const size = Math.floor(Math.random() * 15) + 6;
      heartDrop.style.setProperty('--size', size);
      heartDrop.style.setProperty('--hue', Math.floor(Math.random() * 360));
      
      $RAIN.appendChild(heartDrop);

      gsap.set(heartDrop, {
        x: `${Math.random() * 100}vw`,
        y: `-${Math.random() * 50 + 20}px`,
        opacity: Math.random() * 0.6 + 0.4,
        rotate: 'random(0, 360)',
        scale: Math.random() * 0.6 + 0.4
      });

      // Animate sliding down slowly
      gsap.to(heartDrop, {
        y: '105vh',
        x: `+=${(Math.random() - 0.5) * 150}`,
        rotation: 'random(-360, 360)',
        duration: Math.random() * 5 + 4,
        repeat: -1,
        ease: 'none',
        delay: Math.random() * -5
      });
    }
  }

  // Add click events to weather selector buttons
  $WEATHER_BTNS.forEach(b => {
    b.addEventListener('click', () => {
      applyWeather(b.dataset.weather);
    });
  });

  // Initial Weather
  applyWeather('drizzle');

  /* ==========================================================================
     Interaction Handlers & Logic Trigger Functions
     ========================================================================== */
  
  const start = (e) => {
    if (STATE.CLOSING) return;
    if (e && e.cancelable) e.preventDefault();

    // Initialize Audio context on first user interaction gesture
    initAudioContext();
    
    document.body.removeEventListener('keypress', handleKeyDown);
    
    STATE.FIRING = true;

    // Reset backdrop
    OPEN_BACKDROP_TL.restart();
    RAISE_TL.play();
    
    BREATHING_TL.pause();
    if (BLINKING_TL) {
      BLINKING_TL.pause();
      BLINKING_TL.seek(0);
    }

    // Hide ambient rain rain containers dynamically when staring
    gsap.to($RAIN, { opacity: 0.15, duration: 0.3 });

    // Animate glowing aura expanding
    gsap.to($STARE_AURA, {
      opacity: 0.9,
      scale: 1.9,
      duration: 0.4,
      ease: 'back.out(1.5)',
      backgroundColor: `rgba(${convertHslToRgb(STATE.HUE, STATE.SATURATION, STATE.LIGHTNESS)}, 0.85)`
    });

    // Wiggle dialogue
    gsap.to($QUOTE, { scale: 1.05, duration: 0.2, yoyo: true, repeat: 1 });

    updateQuoteBubble();
    
    // Launch particles
    fireHearts();
  };

  const end = (e) => {
    if (STATE.CLOSING || !STATE.FIRING) return;
    if (e && e.cancelable) e.preventDefault();

    document.body.addEventListener('keypress', handleKeyDown);
    
    STATE.CLOSING = true;

    // Collapse components back to rest
    CLOSE_BACKDROP_TL.restart();
    if (BLINKING_TL) BLINKING_TL.restart();
    RAISE_TL.reverse();

    // Return weather container
    gsap.to($RAIN, { opacity: 1, duration: 0.4 });

    // Shrink glowing aura
    gsap.to($STARE_AURA, {
      opacity: 0.15,
      scale: 0.75,
      duration: 0.5,
      ease: 'power2.inOut',
      backgroundColor: `rgba(255, 105, 180, 0.7)`
    });

    sadden();
    updateQuoteBubble();
  };

  // Keyboard Space bar event handlers
  const handleKeyDown = e => {
    if (e.keyCode === 32 && !STATE.FIRING && !STATE.CLOSING) {
      // space key down
      e.preventDefault();
      start();
    }
  };

  const handleKeyUp = e => {
    if (e.keyCode === 32 && STATE.FIRING && !STATE.CLOSING) {
      e.preventDefault();
      end();
    }
  };

  // Setup Bear core listeners
  const triggerArea = document.querySelector('.bear-trigger-wrapper');
  triggerArea.addEventListener('mousedown', start);
  triggerArea.addEventListener('touchstart', start, { passive: false });
  
  // Attach end release events globally to cover mouse drag outs
  window.addEventListener('mouseup', end);
  window.addEventListener('touchend', end);
  
  triggerArea.addEventListener('mouseover', tease);
  triggerArea.addEventListener('mouseleave', sadden);
  
  document.body.addEventListener('keydown', handleKeyDown);
  document.body.addEventListener('keyup', handleKeyUp);

  // Magic stare button CTA
  $STARE_CTA.addEventListener('mousedown', start);
  $STARE_CTA.addEventListener('mouseup', end);
  $STARE_CTA.addEventListener('touchstart', start, { passive: false });
  $STARE_CTA.addEventListener('touchend', end);

  /* ==========================================================================
     Web Audio API Sound Synthesis Engine
     ========================================================================== */
  
  function initAudioContext() {
    if (audioContext) return; // already initialized
    
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return;

    audioContext = new AudioContext();

    // Create Main gain controller for Magic chimes
    chimeGainNode = audioContext.createGain();
    chimeGainNode.gain.setValueAtTime(parseFloat($CHIME_VOL.value) / 100, audioContext.currentTime);
    chimeGainNode.connect(audioContext.destination);

    // Create rain volume gain controller
    rainGain = audioContext.createGain();
    rainGain.gain.setValueAtTime(0, audioContext.currentTime); // fade in gracefully
    rainGain.connect(audioContext.destination);

    // Synthesize Brown/Pink noise for rain
    createRainSynthBuffer();
    
    // Fade in rain weather audio hum
    adjustWeatherAmbientSound();
  }

  function createRainSynthBuffer() {
    if (!audioContext) return;

    // Buffer length of 2 seconds
    const bufferSize = audioContext.sampleRate * 2;
    const noiseBuffer = audioContext.createBuffer(1, bufferSize, audioContext.sampleRate);
    const output = noiseBuffer.getChannelData(0);

    // Fill buffer with random samples (White Noise)
    for (let i = 0; i < bufferSize; i++) {
      output[i] = Math.random() * 2 - 1;
    }

    rainNoiseSource = audioContext.createBufferSource();
    rainNoiseSource.buffer = noiseBuffer;
    rainNoiseSource.loop = true;

    // Lowpass filter rain to make it sound muffled and cozy
    rainFilter = audioContext.createBiquadFilter();
    rainFilter.type = 'lowpass';
    rainFilter.frequency.setValueAtTime(1000, audioContext.currentTime);

    // Connect node chain
    rainNoiseSource.connect(rainFilter);
    rainFilter.connect(rainGain);
    
    rainNoiseSource.start(0);
  }

  function adjustWeatherAmbientSound() {
    if (!audioContext || !rainGain || !rainFilter) return;

    const baseRainVolSetting = parseFloat($RAIN_VOL.value) / 100;
    
    if (!synthesizerActive) {
      // Synth globally muted
      gsap.to(rainGain.gain, { value: 0, duration: 0.5 });
      return;
    }

    if (STATE.WEATHER === 'clear') {
      // Clear sky, mute rain synth
      gsap.to(rainGain.gain, { value: 0, duration: 0.6 });
    } else if (STATE.WEATHER === 'drizzle') {
      // Soft ambient rain lowpass
      rainFilter.frequency.setValueAtTime(1200, audioContext.currentTime);
      gsap.to(rainGain.gain, { value: baseRainVolSetting * 0.4, duration: 0.6 });
    } else if (STATE.WEATHER === 'storm') {
      // Deeper heavier storm lowpass
      rainFilter.frequency.setValueAtTime(700, audioContext.currentTime);
      gsap.to(rainGain.gain, { value: baseRainVolSetting * 0.8, duration: 0.6 });
    } else if (STATE.WEATHER === 'hearts') {
      // Soft high pass hum for dreamy sparkling stars
      rainFilter.frequency.setValueAtTime(1800, audioContext.currentTime);
      gsap.to(rainGain.gain, { value: baseRainVolSetting * 0.25, duration: 0.6 });
    }
  }

  // Play magical random chime tone (C Major Pentatonic sparks)
  function playChimeSynthTone() {
    if (!audioContext || !synthesizerActive || !chimeGainNode) return;

    // Throttled chimes trigger probability to avoid audio clutter
    if (Math.random() > 0.18) return;

    const now = audioContext.currentTime;
    
    // Sparkly chime pentatonic frequencies
    const scale = [523.25, 587.33, 659.25, 783.99, 880.00, 1046.50, 1174.66, 1318.51, 1567.98];
    const freq = scale[Math.floor(Math.random() * scale.length)];

    // Play sparkling chime chord note
    const osc = audioContext.createOscillator();
    const noteGain = audioContext.createGain();

    // Mix Triangle and Sine oscillators for beautiful glass tone
    osc.type = Math.random() > 0.5 ? 'sine' : 'triangle';
    osc.frequency.setValueAtTime(freq, now);

    // Fast envelope attack with smooth exponential decay release
    noteGain.gain.setValueAtTime(0, now);
    noteGain.gain.linearRampToValueAtTime(0.35, now + 0.02);
    noteGain.gain.exponentialRampToValueAtTime(0.001, now + Math.random() * 0.8 + 0.4);

    osc.connect(noteGain);
    noteGain.connect(chimeGainNode);

    osc.start(now);
    osc.stop(now + 1.3);
  }

  // Play storm thunder synthesis deep rumble sound effect
  function playThunderSynthSound() {
    if (!audioContext || !synthesizerActive) return;

    const now = audioContext.currentTime;
    const osc = audioContext.createOscillator();
    const filter = audioContext.createBiquadFilter();
    const gain = audioContext.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(55, now); // deep bass frequency

    // Filter out top frequencies to make it a deep rumble
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(100, now);
    filter.Q.setValueAtTime(10, now);

    // Deep thunder rumble gain envelope
    gain.gain.setValueAtTime(0, now);
    gain.gain.linearRampToValueAtTime(0.45, now + 0.15); // soft rumble entry
    gain.gain.exponentialRampToValueAtTime(0.001, now + 3.0); // rumble decays slowly

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(audioContext.destination);

    osc.start(now);
    osc.stop(now + 3.2);
  }

  // UI Sound Toggle Settings
  $SOUND_TOGGLE.addEventListener('change', () => {
    synthesizerActive = $SOUND_TOGGLE.checked;
    
    // Toggle sliders disabled states
    $RAIN_VOL.disabled = !synthesizerActive;
    $CHIME_VOL.disabled = !synthesizerActive;

    initAudioContext();
    adjustWeatherAmbientSound();
  });

  $RAIN_VOL.addEventListener('input', () => {
    const val = $RAIN_VOL.value;
    $RAIN_VOL_VAL.innerText = val + '%';
    
    if (rainGain && audioContext) {
      adjustWeatherAmbientSound();
    }
  });

  $CHIME_VOL.addEventListener('input', () => {
    const val = $CHIME_VOL.value;
    $CHIME_VOL_VAL.innerText = val + '%';

    if (chimeGainNode && audioContext) {
      chimeGainNode.gain.setValueAtTime(parseFloat(val) / 100, audioContext.currentTime);
    }
  });

  /* ==========================================================================
     Modal, Collapsible Drawers & Theme Toggles
     ========================================================================== */

  // Help instruction Modal triggers
  $HELP_BTN.addEventListener('click', () => {
    $MODAL.classList.add('open');
  });

  $MODAL_CLOSE.addEventListener('click', () => {
    $MODAL.classList.remove('open');
  });

  $MODAL_START.addEventListener('click', () => {
    $MODAL.classList.remove('open');
    initAudioContext(); // safely trigger user audio consent on modal close click
  });

  // Automatically show help instructions modal after 1.5s initial load
  setTimeout(() => {
    $LOADING.style.opacity = 0;
    setTimeout(() => $LOADING.remove(), 500);
    $MODAL.classList.add('open');
  }, 1600);

  // Theme light/dark mode switch logic
  $THEME_BTN.addEventListener('click', () => {
    if (STATE.LIGHTS === 'light') {
      STATE.LIGHTS = 'dark';
      document.body.classList.add('dark-theme');
      $THEME_BTN.innerHTML = '<i class="fa-solid fa-sun"></i>';
    } else {
      STATE.LIGHTS = 'light';
      document.body.classList.remove('dark-theme');
      $THEME_BTN.innerHTML = '<i class="fa-solid fa-moon"></i>';
    }
  });

  // Mobile Bottom drawer controls collapse/reveal triggers
  $MOBILE_TOGGLE.addEventListener('click', () => {
    initAudioContext();
    STATE.DRAWER_OPEN = !STATE.DRAWER_OPEN;
    
    if (STATE.DRAWER_OPEN) {
      $LEFT_PANEL.classList.add('drawer-open');
      $RIGHT_PANEL.classList.add('drawer-open');
      $MOBILE_TOGGLE.innerHTML = '<i class="fa-solid fa-circle-xmark"></i> Close Settings';
    } else {
      $LEFT_PANEL.classList.remove('drawer-open');
      $RIGHT_PANEL.classList.remove('drawer-open');
      $MOBILE_TOGGLE.innerHTML = '<i class="fa-solid fa-sliders"></i> Customize World';
    }
  });
  
  // Close mobile drawer when user clicks anywhere on center display
  document.querySelector('.bear-display').addEventListener('click', () => {
    if (STATE.DRAWER_OPEN) {
      STATE.DRAWER_OPEN = false;
      $LEFT_PANEL.classList.remove('drawer-open');
      $RIGHT_PANEL.classList.remove('drawer-open');
      $MOBILE_TOGGLE.innerHTML = '<i class="fa-solid fa-sliders"></i> Customize World';
    }
  });

});
