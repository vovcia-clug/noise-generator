const alphaSlider = document.getElementById('alphaSlider');
const alphaValue = document.getElementById('alphaValue');
const waveWidthSlider = document.getElementById('waveWidthSlider');
const waveWidthValue = document.getElementById('waveWidthValue');
const meanSlider = document.getElementById('meanSlider');
const meanValue = document.getElementById('meanValue');
const stdDevSlider = document.getElementById('stdDevSlider');
const stdDevValue = document.getElementById('stdDevValue');

function saveSettings(settings) {
  chrome.storage.sync.set(settings, () => {
    console.log('Settings saved:', settings);
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
      chrome.tabs.sendMessage(tabs[0].id, settings);
    });
  });
}

function loadSettings() {
  chrome.storage.sync.get(['alpha', 'waveWidth', 'mean', 'stdDev'], (data) => {
    const alpha = data.alpha || 0.1; // Default alpha value
    const waveWidth = data.waveWidth || 50;
    const mean = data.mean || 128;
    const stdDev = data.stdDev || 32;

    alphaSlider.value = alpha;
    alphaValue.textContent = alpha;
    waveWidthSlider.value = waveWidth;
    waveWidthValue.textContent = waveWidth;
    meanSlider.value = mean;
    meanValue.textContent = mean;
    stdDevSlider.value = stdDev;
    stdDevValue.textContent = stdDev;

    console.log('Settings loaded:', { alpha, waveWidth, mean, stdDev });
  });
}

alphaSlider.addEventListener('input', () => {
  const alpha = parseFloat(alphaSlider.value);
  alphaValue.textContent = alpha;
  saveSettings({ alpha: alpha });
});

waveWidthSlider.addEventListener('input', () => {
  const waveWidth = waveWidthSlider.value;
  waveWidthValue.textContent = waveWidth;
  saveSettings({ waveWidth: waveWidth });
});

meanSlider.addEventListener('input', () => {
  const mean = parseInt(meanSlider.value);
  meanValue.textContent = mean;
  saveSettings({ mean: mean });
});

stdDevSlider.addEventListener('input', () => {
  const stdDev = parseInt(stdDevSlider.value);
  stdDevValue.textContent = stdDev;
  saveSettings({ stdDev: stdDev });
});

loadSettings();