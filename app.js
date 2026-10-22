/**
 * Word Cloud Application Logic using Apache ECharts & ECharts-WordCloud
 */

document.addEventListener('DOMContentLoaded', () => {
  // DOM Elements
  const chartDom = document.getElementById('chart-container');
  const presetSelect = document.getElementById('preset-select');
  const shapeSelect = document.getElementById('shape-select');
  const paletteSelect = document.getElementById('palette-select');
  const rotationSelect = document.getElementById('rotation-select');
  const pageRatioSelect = document.getElementById('page-ratio-select');
  const btnShuffle = document.getElementById('btn-shuffle');
  const btnDownload = document.getElementById('btn-download');
  const btnPrint = document.getElementById('btn-print');
  const btnEdit = document.getElementById('btn-edit');
  const metaCount = document.getElementById('meta-count');
  const metaTop = document.getElementById('meta-top');
  const metaRatioBadge = document.getElementById('meta-ratio-badge');
  const inspectorWord = document.getElementById('inspector-word');
  const inspectorWeight = document.getElementById('inspector-weight');
  const overlay = document.getElementById('chart-overlay');

  // Modal Elements
  const dataModal = document.getElementById('data-modal');
  const modalClose = document.getElementById('modal-close');
  const dataJsonInput = document.getElementById('data-json-input');
  const btnResetData = document.getElementById('btn-reset-data');
  const btnApplyData = document.getElementById('btn-apply-data');

  // Color Palettes
  const PALETTES = {
    cottonCandy: ['#ec4899', '#f43f5e', '#8b5cf6', '#a855f7', '#06b6d4', '#3b82f6', '#fb7185', '#d946ef'],
    warmSunset: ['#ea580c', '#f97316', '#fb923c', '#e11d48', '#f59e0b', '#d97706', '#be123c', '#ef4444'],
    oceanBreeze: ['#0284c7', '#06b6d4', '#0ea5e9', '#0d9488', '#14b8a6', '#3b82f6', '#2563eb', '#6366f1'],
    neonVibrant: ['#10b981', '#06b6d4', '#8b5cf6', '#ec4899', '#f59e0b', '#f43f5e', '#3b82f6', '#d946ef'],
    royalEmerald: ['#047857', '#059669', '#10b981', '#0d9488', '#0f766e', '#0284c7', '#d97706', '#b45309']
  };

  // State
  // Default to hardcoded data from data.js
  let currentData = Array.isArray(WORD_CLOUD_DATA) ? [...WORD_CLOUD_DATA] : [];
  let currentShape = shapeSelect.value || 'cardioid';
  let currentPalette = paletteSelect.value || 'cottonCandy';
  let currentRotation = rotationSelect.value || 'dynamic';
  let currentOrientation = pageRatioSelect ? pageRatioSelect.value : 'portrait';

  // Initialize ECharts instance
  const myChart = echarts.init(chartDom, null, { renderer: 'canvas' });

  /**
   * Determine rotation configuration based on user selection
   */
  function getRotationConfig(type) {
    switch (type) {
      case 'horizontal':
        return { rotationRange: [0, 0], rotationStep: 0 };
      case 'perpendicular':
        return { rotationRange: [-90, 90], rotationStep: 90 };
      case 'dynamic':
      default:
        return { rotationRange: [-45, 90], rotationStep: 45 };
    }
  }

  /**
   * Pick random color from current palette
   */
  function getRandomPaletteColor() {
    const palette = PALETTES[currentPalette] || PALETTES.cottonCandy;
    return palette[Math.floor(Math.random() * palette.length)];
  }

  /**
   * Update metadata display (total count, top word)
   */
  function updateMetadata(data) {
    if (!data || data.length === 0) {
      metaCount.textContent = '0';
      metaTop.textContent = '-';
      return;
    }
    metaCount.textContent = data.length.toString();
    const sorted = [...data].sort((a, b) => (b.value || 0) - (a.value || 0));
    metaTop.textContent = `${sorted[0].name} (${sorted[0].value})`;
  }

  /**
   * Render word cloud with current options
   */
  function renderChart() {
    overlay.classList.add('visible');

    const rotation = getRotationConfig(currentRotation);

    // Calculate font size range based on container width
    const containerWidth = chartDom.clientWidth || 520;
    const minSize = containerWidth < 450 ? 12 : 15;
    const maxSize = containerWidth < 450 ? 42 : 56;

    const option = {
      backgroundColor: 'transparent',
      tooltip: {
        show: true,
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        borderColor: '#e2e8f0',
        borderWidth: 1,
        borderRadius: 8,
        padding: [8, 12],
        textStyle: {
          color: '#1e293b',
          fontFamily: 'Inter, sans-serif'
        },
        extraCssText: 'box-shadow: 0 10px 25px -5px rgba(0,0,0,0.1); backdrop-filter: blur(8px);',
        formatter: function (params) {
          return `
            <div style="font-weight: 700; font-size: 15px; color: #0f172a; margin-bottom: 2px;">
              ${params.name}
            </div>
            <div style="font-size: 12px; color: #64748b;">
              Weight / Frequency: <strong style="color: #ec4899;">${params.value}</strong>
            </div>
          `;
        }
      },
      series: [
        {
          type: 'wordCloud',
          shape: currentShape,
          keepAspect: false,
          left: 'center',
          top: 'center',
          width: '90%',
          height: '90%',
          right: null,
          bottom: null,
          sizeRange: [minSize, maxSize],
          rotationRange: rotation.rotationRange,
          rotationStep: rotation.rotationStep,
          gridSize: 8,
          drawOutOfBound: false,
          layoutAnimation: true,
          shrinkToFit: true,
          textStyle: {
            fontFamily: 'Outfit, Inter, sans-serif',
            fontWeight: 700,
            color: function () {
              return getRandomPaletteColor();
            }
          },
          emphasis: {
            focus: 'self',
            textStyle: {
              textShadowBlur: 14,
              textShadowColor: 'rgba(0, 0, 0, 0.25)'
            }
          },
          data: currentData
        }
      ]
    };

    myChart.setOption(option, true);
    updateMetadata(currentData);

    setTimeout(() => {
      overlay.classList.remove('visible');
    }, 280);
  }

  // Handle Chart Word Interactions
  myChart.on('mouseover', function (params) {
    if (params && params.name) {
      inspectorWord.textContent = params.name;
      inspectorWeight.innerHTML = `Weight: <strong>${params.value}</strong>`;
    }
  });

  myChart.on('click', function (params) {
    if (params && params.name) {
      inspectorWord.textContent = params.name;
      inspectorWeight.innerHTML = `Weight: <strong>${params.value}</strong> (Clicked)`;
    }
  });

  // Event Listeners for Toolbar Controls
  presetSelect.addEventListener('change', (e) => {
    const key = e.target.value;
    if (THEMED_DATASETS && THEMED_DATASETS[key]) {
      currentData = [...THEMED_DATASETS[key].data];
    } else {
      currentData = [...WORD_CLOUD_DATA];
    }
    renderChart();
  });

  shapeSelect.addEventListener('change', (e) => {
    currentShape = e.target.value;
    renderChart();
  });

  paletteSelect.addEventListener('change', (e) => {
    currentPalette = e.target.value;
    renderChart();
  });

  rotationSelect.addEventListener('change', (e) => {
    currentRotation = e.target.value;
    renderChart();
  });

  // Page Format / Aspect Ratio (8.5 x 11 in US Letter standard)
  if (pageRatioSelect) {
    pageRatioSelect.addEventListener('change', (e) => {
      currentOrientation = e.target.value;
      if (currentOrientation === 'landscape') {
        chartDom.classList.remove('portrait');
        chartDom.classList.add('landscape');
        if (metaRatioBadge) metaRatioBadge.innerHTML = 'Ratio: <strong>11 × 8.5 in (1.294:1)</strong>';
      } else {
        chartDom.classList.remove('landscape');
        chartDom.classList.add('portrait');
        if (metaRatioBadge) metaRatioBadge.innerHTML = 'Ratio: <strong>8.5 × 11 in (1.294:1)</strong>';
      }
      // Re-layout and redraw
      setTimeout(() => {
        myChart.resize();
        renderChart();
      }, 50);
    });
  }

  btnShuffle.addEventListener('click', () => {
    // Re-render generates fresh random colors and layout positions
    renderChart();
  });

  // Direct Print Button
  if (btnPrint) {
    btnPrint.addEventListener('click', () => {
      window.print();
    });
  }

  // High-Resolution 300 DPI Export for standard Letter page
  btnDownload.addEventListener('click', () => {
    try {
      const isLandscape = currentOrientation === 'landscape';
      // 300 DPI Standard Letter dimensions:
      // Portrait: 2550 x 3300 px
      // Landscape: 3300 x 2550 px
      const targetWidth = isLandscape ? 3300 : 2550;
      const currentWidth = chartDom.clientWidth || 520;
      const exportPixelRatio = Math.min(6, Math.max(3, Math.round(targetWidth / currentWidth)));

      const url = myChart.getDataURL({
        type: 'png',
        pixelRatio: exportPixelRatio,
        backgroundColor: '#ffffff'
      });
      const link = document.createElement('a');
      link.download = `wordcloud-letter-${isLandscape ? 'landscape' : 'portrait'}-${Date.now()}.png`;
      link.href = url;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      console.error('Failed to export image:', err);
      alert('Unable to export image. Please check browser permissions.');
    }
  });

  // Modal Handlers
  btnEdit.addEventListener('click', () => {
    dataJsonInput.value = JSON.stringify(currentData, null, 2);
    dataModal.classList.add('open');
  });

  modalClose.addEventListener('click', () => {
    dataModal.classList.remove('open');
  });

  dataModal.addEventListener('click', (e) => {
    if (e.target === dataModal) {
      dataModal.classList.remove('open');
    }
  });

  btnResetData.addEventListener('click', () => {
    currentData = Array.isArray(WORD_CLOUD_DATA) ? [...WORD_CLOUD_DATA] : [];
    dataJsonInput.value = JSON.stringify(currentData, null, 2);
  });

  btnApplyData.addEventListener('click', () => {
    try {
      const parsed = JSON.parse(dataJsonInput.value);
      if (!Array.isArray(parsed)) {
        alert('Data must be an array of objects: [{"name": "word", "value": 50}, ...]');
        return;
      }
      currentData = parsed;
      renderChart();
      dataModal.classList.remove('open');
    } catch (err) {
      alert('Invalid JSON: Please check format syntax before applying.');
    }
  });

  // Window Resize
  let resizeTimeout;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(() => {
      myChart.resize();
    }, 150);
  });

  // Initial Render
  renderChart();
});
