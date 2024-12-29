interface PrizeStats {
  totalSpins: number;
  prizesWon: {
    [key: number]: {
      count: number;
      name: string;
      lastWon: number;
    };
  };
  claimedPrizes: number;
  totalPrizesValue: number;
}

const STATS_KEY = 'pintemas_stats';

const defaultStats: PrizeStats = {
  totalSpins: 0,
  prizesWon: {},
  claimedPrizes: 0,
  totalPrizesValue: 0
};

export const StatsService = {
  getStats: (): PrizeStats => {
    const statsJson = localStorage.getItem(STATS_KEY);
    return statsJson ? JSON.parse(statsJson) : defaultStats;
  },

  recordSpin: (): void => {
    const stats = StatsService.getStats();
    stats.totalSpins += 1;
    localStorage.setItem(STATS_KEY, JSON.stringify(stats));
  },

  recordPrize: (prizeId: number, prizeName: string, value: number): void => {
    const stats = StatsService.getStats();
    
    if (!stats.prizesWon[prizeId]) {
      stats.prizesWon[prizeId] = {
        count: 0,
        name: prizeName,
        lastWon: Date.now()
      };
    }

    stats.prizesWon[prizeId].count += 1;
    stats.prizesWon[prizeId].lastWon = Date.now();
    stats.totalPrizesValue += value;

    localStorage.setItem(STATS_KEY, JSON.stringify(stats));
  },

  recordClaim: (): void => {
    const stats = StatsService.getStats();
    stats.claimedPrizes += 1;
    localStorage.setItem(STATS_KEY, JSON.stringify(stats));
  },

  getWinRates: () => {
    const stats = StatsService.getStats();
    const winRates: { [key: number]: number } = {};
    
    for (const [prizeId, prizeStats] of Object.entries(stats.prizesWon)) {
      winRates[Number(prizeId)] = stats.totalSpins > 0 
        ? (prizeStats.count / stats.totalSpins) * 100 
        : 0;
    }

    return winRates;
  },

  getClaimRate: () => {
    const stats = StatsService.getStats();
    const totalPrizes = Object.values(stats.prizesWon)
      .reduce((sum, prize) => sum + prize.count, 0);
    
    return totalPrizes > 0 
      ? (stats.claimedPrizes / totalPrizes) * 100 
      : 0;
  },

  resetStats: (): void => {
    localStorage.setItem(STATS_KEY, JSON.stringify(defaultStats));
  }
};

export default StatsService; 