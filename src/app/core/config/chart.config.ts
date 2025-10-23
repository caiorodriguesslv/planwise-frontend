import { Chart, registerables } from 'chart.js';

// Registrar todos os componentes necessários do Chart.js
Chart.register(...registerables);

// Configurações globais padrão do Chart.js
Chart.defaults.font.family = 'Roboto, "Helvetica Neue", sans-serif';
Chart.defaults.color = 'rgba(255, 255, 255, 0.9)';
Chart.defaults.borderColor = 'rgba(255, 255, 255, 0.1)';

export default Chart;

