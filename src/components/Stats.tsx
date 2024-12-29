import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import StatsService from '../services/stats';
import Icons from './Icons';
import '../styles/Stats.css';

const Stats: React.FC = () => {
  const [stats, setStats] = useState(StatsService.getStats());
  const [winRates, setWinRates] = useState<{ [key: number]: number }>({});
  const [claimRate, setClaimRate] = useState(0);

  useEffect(() => {
    updateStats();
  }, []);

  const updateStats = () => {
    setStats(StatsService.getStats());
    setWinRates(StatsService.getWinRates());
    setClaimRate(StatsService.getClaimRate());
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleString('es-AR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <motion.div
      className="stats-container"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <motion.h2 variants={itemVariants}>Estadísticas</motion.h2>

      <motion.div className="stats-grid" variants={itemVariants}>
        <div className="stat-card total-spins">
          <Icons name="celebration" size={32} />
          <h3>Total de Giros</h3>
          <p className="stat-value">{stats.totalSpins}</p>
        </div>

        <div className="stat-card claimed-prizes">
          <Icons name="gift" size={32} />
          <h3>Premios Canjeados</h3>
          <p className="stat-value">{stats.claimedPrizes}</p>
          <p className="stat-subtitle">
            {claimRate.toFixed(1)}% de tasa de canje
          </p>
        </div>
      </motion.div>

      <motion.div className="prize-stats" variants={itemVariants}>
        <h3>Premios Ganados</h3>
        {Object.entries(stats.prizesWon).map(([prizeId, prize]) => (
          <div key={prizeId} className="prize-stat-row">
            <div className="prize-info">
              <Icons name={Number(prizeId) === 5 ? 'gift' : 'discount'} size={24} />
              <span className="prize-name">{prize.name}</span>
            </div>
            <div className="prize-details">
              <span className="prize-count">{prize.count}x</span>
              <span className="win-rate">
                ({winRates[Number(prizeId)]?.toFixed(1)}%)
              </span>
            </div>
            <div className="last-won">
              Último: {formatDate(prize.lastWon)}
            </div>
          </div>
        ))}
      </motion.div>

      <motion.button
        className="reset-button"
        onClick={() => {
          StatsService.resetStats();
          updateStats();
        }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        variants={itemVariants}
      >
        Reiniciar Estadísticas
      </motion.button>
    </motion.div>
  );
};

export default Stats; 