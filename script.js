const video = document.getElementById('video');
const bitrateSpan = document.getElementById('bitrate');
const resolutionSpan = document.getElementById('resolution');
const bufferSpan = document.getElementById('buffer');
const fpsSpan = document.getElementById('fps');
const loadVideoButton = document.getElementById('load-video');
const videoInput = document.getElementById('video-url');

let bitrateChart, bufferChart, fpsChart;
const bitrateData = [];
const bufferData = [];
const fpsData = [];

function createCharts() {
  const bitrateCtx = document.getElementById('bitrateChart').getContext('2d');
  const bufferCtx = document.getElementById('bufferChart').getContext('2d');
  const fpsCtx = document.getElementById('fpsChart').getContext('2d');

  bitrateChart = new Chart(bitrateCtx, {
    type: 'line',
    data: {
      labels: [],
      datasets: [{
        label: 'Bitrate (kbps)',
        data: bitrateData,
        borderColor: 'red',
        borderWidth: 1,
      }]
    }
  });

  bufferChart = new Chart(bufferCtx, {
    type: 'line',
    data: {
      labels: [],
      datasets: [{
        label: 'Buffer Level (sec)',
        data: bufferData,
        borderColor: 'green',
        borderWidth: 1,
      }]
    }
  });

  fpsChart = new Chart(fpsCtx, {
    type: 'line',
    data: {
      labels: [],
      datasets: [{
        label: 'FPS',
        data: fpsData,
        borderColor: 'blue',
        borderWidth: 1,
      }]
    }
  });
}

function updateCharts(time, stats) {
  bitrateData.push(stats.bitrate);
  bufferData.push(stats.buffer);
  fpsData.push(stats.fps);

  bitrateChart.data.labels.push(time);
  bufferChart.data.labels.push(time);
  fpsChart.data.labels.push(time);

  bitrateChart.update();
  bufferChart.update();
  fpsChart.update();
}

function getBufferLevel(video) {
  if (video.buffered.length) {
    const currentTime = video.currentTime;
    for (let i = 0; i < video.buffered.length; i++) {
      if (video.buffered.start(i) <= currentTime && video.buffered.end(i) >= currentTime) {
        return video.buffered.end(i) - currentTime;
      }
    }
  }
  return 0;
}

function updateStats(hls) {
  const stats = hls.stats || {};
  const levels = hls.levels[hls.currentLevel] || {};

  const bitrate = levels.bitrate ? levels.bitrate / 1000 : 0;
  const resolution = levels.width && levels.height ? `${levels.width}x${levels.height}` : '-';
  const buffer = getBufferLevel(video);
  const fps = stats.fps || Math.random() * 60; // Placeholder for FPS if unavailable.

  bitrateSpan.textContent = bitrate.toFixed(2);
  resolutionSpan.textContent = resolution;
  bufferSpan.textContent = buffer.toFixed(2);
  fpsSpan.textContent = fps.toFixed(0);

  const now = new Date().toLocaleTimeString();
  updateCharts(now, { bitrate, buffer, fps });
}

function loadStream(url) {
  if (Hls.isSupported()) {
    const hls = new Hls();
    hls.loadSource(url);
    hls.attachMedia(video);

    hls.on(Hls.Events.MANIFEST_PARSED, () => {
      video.play();
      createCharts();
      setInterval(() => updateStats(hls), 1000);
    });

    hls.on(Hls.Events.LEVEL_SWITCHED, () => {
      updateStats(hls);
    });
  } else {
    alert('Twoja przeglądarka nie obsługuje HLS.');
  }
}

loadVideoButton.addEventListener('click', () => {
  const url = videoInput.value.trim();
  if (url) {
    loadStream(url);
  } else {
    alert('Wprowadź poprawny URL.');
  }
});
