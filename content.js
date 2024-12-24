let currentAlpha = 0.1;
let currentWaveWidth = 50;
let currentMean = 128;
let currentStdDev = 32;
let noiseDrawn = false; // Flag to track if noise has been drawn
let initialSettingsLoaded = false; // Flag to track if initial settings have been loaded

// Box-Muller transform
function generateNormalRandom(mean = 0, stdDev = 1) {
  let u = 0, v = 0;
  while (u === 0) u = Math.random();
  while (v === 0) v = Math.random();
  let num = Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
  num = num * stdDev + mean;
  return num;
}

function createNoiseOverlay() {
  const canvas = document.createElement('canvas');
  canvas.id = 'noiseCanvas';

  const ctx = canvas.getContext('2d');

  function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    if (initialSettingsLoaded) {
      drawNoise();
    }
  }

  function drawNoise() {
    // Ensure the page is visible after the first draw

    const imageData = ctx.createImageData(canvas.width, canvas.height);
    const data = imageData.data;

    for (let y = 0; y < canvas.height; y++) {
      for (let x = 0; x < canvas.width; x++) {
        const i = (y * canvas.width + x) * 4;
        const randomValueR = generateNormalRandom(currentMean, currentStdDev);
        const randomValueG = generateNormalRandom(currentMean, currentStdDev);
        const randomValueB = generateNormalRandom(currentMean, currentStdDev);

        // Calculate wave modulation (single wave)
        const waveModulation = Math.sin((x / currentWaveWidth) * Math.PI * 2) * 0.5 + 0.5;

        // Apply wave modulation to alpha
        const alpha = currentAlpha * waveModulation;

        data[i]     = randomValueR; // red
        data[i + 1] = randomValueG; // green
        data[i + 2] = randomValueB; // blue
        data[i + 3] = alpha * 255;
      }
    }

    ctx.putImageData(imageData, 0, 0);
    
    if (!noiseDrawn) {
      document.documentElement.style.visibility = 'visible';
      noiseDrawn = true;
    }
  }

  // Observe changes in the DOM
  const observer = new MutationObserver(async function (mutations) {
    mutations.forEach(async function (mutation) {
      if (document.body) {
        document.body.appendChild(canvas);
        observer.disconnect(); // Stop observing

        // Get initial settings
        await new Promise((resolve) => {
          chrome.storage.sync.get(['alpha', 'waveWidth', 'mean', 'stdDev'], (data) => {
            currentAlpha = data.alpha !== undefined ? data.alpha : currentAlpha;
            currentWaveWidth = data.waveWidth !== undefined ? data.waveWidth : currentWaveWidth;
            currentMean = data.mean !== undefined ? data.mean : currentMean;
            currentStdDev = data.stdDev !== undefined ? data.stdDev : currentStdDev;

            initialSettingsLoaded = true; // Set the flag
            resolve(); // Resolve the Promise
          });
        });

        resizeCanvas(); // Now it's safe to call resizeCanvas and drawNoise

        // Add 'resize' event listener after initial settings are loaded
        window.addEventListener('resize', resizeCanvas);

        // Add the message listener AFTER settings are loaded
        chrome.runtime.onMessage.addListener(onMessageListener);
      }
    });
  });

  // Start observing
  observer.observe(document, { childList: true, subtree: true });
}

// Define the message listener function separately
function onMessageListener(request, sender, sendResponse) {
  let settingsChanged = false;

  if (request.alpha !== undefined) {
    currentAlpha = request.alpha;
    settingsChanged = true;
  }
  if (request.waveWidth !== undefined) {
    currentWaveWidth = request.waveWidth;
    settingsChanged = true;
  }
  if (request.mean !== undefined) {
    currentMean = request.mean;
    settingsChanged = true;
  }
  if (request.stdDev !== undefined) {
    currentStdDev = request.stdDev;
    settingsChanged = true;
  }

  if (settingsChanged && initialSettingsLoaded) {
    // drawNoise();
  }
}

createNoiseOverlay();