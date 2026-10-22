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
  const metaPlaced = document.getElementById('meta-placed');
  const metaTop = document.getElementById('meta-top');
  const metaRatioBadge = document.getElementById('meta-ratio-badge');
  const sourceBadge = document.getElementById('source-badge');
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
  let sourceData = Array.isArray(WORD_CLOUD_DATA) ? [...WORD_CLOUD_DATA] : [];
  let currentData = [...sourceData];
  let currentShape = shapeSelect.value || 'circle';
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
      if (metaPlaced) metaPlaced.textContent = '0';
      metaCount.textContent = '0';
      metaTop.textContent = '-';
      return;
    }
    metaCount.textContent = data.length.toString();
    const sorted = [...data].sort((a, b) => (b.value || 0) - (a.value || 0));
    metaTop.textContent = `${sorted[0].name} (${sorted[0].value})`;
  }

  /** Words the layout actually drew (many entries can fail to fit). */
  function countPlacedWords() {
    const series = myChart.getModel().getSeriesByIndex(0);
    if (!series) return 0;
    const data = series.getData();
    let placed = 0;
    for (let i = 0; i < data.count(); i++) {
      if (data.getItemGraphicEl(i)) placed++;
    }
    return placed;
  }

  let renderGeneration = 0;

  /**
   * Wait until the async word-cloud layout stops changing.
   * @returns {Promise<number>} count of placed words when stable
   */
  function waitForLayoutStable(activeGeneration) {
    return new Promise((resolve) => {
      const startedAt = Date.now();
      let lastPlaced = -1;
      let stableTicks = 0;

      const poll = () => {
        if (activeGeneration !== renderGeneration) {
          resolve(countPlacedWords());
          return;
        }
        const placed = countPlacedWords();
        const total = currentData.length;
        if (metaPlaced) metaPlaced.textContent = placed.toString();

        if (placed === lastPlaced) {
          stableTicks++;
        } else {
          stableTicks = 0;
          lastPlaced = placed;
        }

        const layoutDone =
          stableTicks >= 4 || placed === total || Date.now() - startedAt > 8000;
        if (!layoutDone) {
          setTimeout(poll, 80);
          return;
        }
        resolve(placed);
      };

      setTimeout(poll, 50);
    });
  }

  function getFontSizeRange(containerWidth, wordCount) {
    let minSize = containerWidth < 450 ? 22 : 26;
    let maxSize = containerWidth < 450 ? 42 : 56;
    if (wordCount > 200) {
      minSize = containerWidth < 450 ? 9 : 10;
      maxSize = containerWidth < 450 ? 22 : 26;
    } else if (wordCount > 120) {
      minSize = containerWidth < 450 ? 12 : 14;
      maxSize = containerWidth < 450 ? 28 : 32;
    } else if (wordCount > 60) {
      minSize = containerWidth < 450 ? 16 : 18;
      maxSize = containerWidth < 450 ? 34 : 40;
    } else if (wordCount > 35) {
      minSize = containerWidth < 450 ? 14 : 16;
      maxSize = containerWidth < 450 ? 30 : 36;
    }
    return { minSize, maxSize };
  }

  function getGridSize(wordCount, attemptIndex = 0) {
    let size = 4;
    if (wordCount > 200) size = 2;
    else if (wordCount > 100) size = 3;
    else if (wordCount > 40) size = 3;
    return Math.max(2, size - Math.floor(attemptIndex / 2));
  }

  function scaleFontRange(range, scale) {
    const minSize = Math.max(6, Math.round(range.minSize * scale));
    const maxSize = Math.max(minSize + 4, Math.round(range.maxSize * scale));
    return { minSize, maxSize };
  }

  function buildChartData(minSize, maxSize) {
    const sortedValues = currentData
      .map((entry) => (Number.isFinite(entry.value) ? entry.value : 0))
      .sort((a, b) => a - b);
    const minimumValue = sortedValues[0] || 0;
    const maximumValue = sortedValues[sortedValues.length - 1] || 0;
    const largestRegularValue = sortedValues[sortedValues.length - 2] ?? minimumValue;
    const regularSizeRange = Math.max(0, maxSize - minSize - 8);
    const getWordFontSize = (value) => {
      if (value === maximumValue && maximumValue > largestRegularValue) return maxSize;
      if (largestRegularValue <= minimumValue) return maxSize;
      const normalized = Math.min(
        1,
        Math.max(0, (value - minimumValue) / (largestRegularValue - minimumValue))
      );
      return minSize + normalized * regularSizeRange;
    };
    const span = Math.max(1, maxSize - minSize);
    return currentData.map((entry) => ({
      ...entry,
      originalValue: entry.value,
      value: ((getWordFontSize(entry.value) - minSize) / span) * 100
    }));
  }

  function buildChartOption({ minSize, maxSize, gridSize, rotation, shape }) {
    return {
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
          Weight / Frequency: <strong style="color: #ec4899;">${params.data.originalValue}</strong>
            </div>
          `;
        }
      },
      series: [
        {
          type: 'wordCloud',
          shape,
          keepAspect: false,
          left: 'center',
          top: 'center',
          width: '98%',
          height: '98%',
          right: null,
          bottom: null,
          sizeRange: [minSize, maxSize],
          rotationRange: rotation.rotationRange,
          rotationStep: rotation.rotationStep,
          gridSize,
          drawOutOfBound: false,
          layoutAnimation: false,
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
          data: buildChartData(minSize, maxSize)
        }
      ]
    };
  }

  /**
   * Render word cloud; retries with smaller type / denser grid until every name is placed.
   */
  async function renderChart() {
    const activeGeneration = ++renderGeneration;
    overlay.classList.add('visible');
    updateMetadata(currentData);
    if (metaPlaced) metaPlaced.textContent = '…';

    const containerWidth = chartDom.clientWidth || 520;
    const baseRange = getFontSizeRange(containerWidth, currentData.length);
    const total = currentData.length;
    const maxAttempts = 12;
    let scale = 1;
    let placed = 0;

    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      if (activeGeneration !== renderGeneration) return;

      const { minSize, maxSize } = scaleFontRange(baseRange, scale);
      const gridSize = getGridSize(total, attempt);
      const useHorizontal = attempt >= 2;
      const rotation = useHorizontal
        ? getRotationConfig('horizontal')
        : getRotationConfig(currentRotation);
      const shape = attempt >= 5 ? 'square' : currentShape;

      myChart.setOption(
        buildChartOption({ minSize, maxSize, gridSize, rotation, shape }),
        true
      );

      placed = await waitForLayoutStable(activeGeneration);
      if (activeGeneration !== renderGeneration) return;

      if (total === 0 || placed >= total) break;
      scale *= 0.86;
    }

    if (metaPlaced) metaPlaced.textContent = placed.toString();
    if (total > 0 && placed < total) {
      console.warn(
        `Word cloud placed ${placed} of ${total} names after fit retries; try horizontal rotation or a smaller dataset.`
      );
    }

    overlay.classList.remove('visible');
  }

  // Handle Chart Word Interactions
  myChart.on('mouseover', function (params) {
    if (params && params.name) {
      inspectorWord.textContent = params.name;
      inspectorWeight.innerHTML = `Weight: <strong>${params.data.originalValue}</strong>`;
    }
  });

  myChart.on('click', function (params) {
    if (params && params.name) {
      inspectorWord.textContent = params.name;
      inspectorWeight.innerHTML = `Weight: <strong>${params.data.originalValue}</strong> (Clicked)`;
    }
  });

  // Event Listeners for Toolbar Controls
  presetSelect.addEventListener('change', (e) => {
    const key = e.target.value;
    if (THEMED_DATASETS && THEMED_DATASETS[key]) {
      currentData = [...sourceData];
    } else {
      currentData = [...sourceData];
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
    currentData = [...sourceData];
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
      renderChart();
    }, 150);
  });

  fetch('word-cloud-data/swaminarayan-names.json')
    .then((response) => {
      if (!response.ok) {
        throw new Error(`Dataset request failed with status ${response.status}`);
      }
      return response.json();
    })
    .then((data) => {
      if (!Array.isArray(data) || !data.every((entry) =>
        entry && typeof entry.name === 'string' && Number.isFinite(entry.value)
      )) {
        throw new Error('Dataset JSON must be an array of names and numeric values.');
      }
      sourceData = data;
      currentData = [...sourceData];
      if (sourceBadge) sourceBadge.innerHTML = 'Loaded from <code>word-cloud-data/swaminarayan-names.json</code>';
      renderChart();
    })
    .catch((error) => {
      console.error('Could not load the Swaminarayan names JSON:', error);
      if (sourceBadge) sourceBadge.textContent = 'JSON unavailable; using fallback data';
    });

  // Initial Render
  renderChart();
});
