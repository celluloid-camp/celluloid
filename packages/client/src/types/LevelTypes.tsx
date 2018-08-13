enum Level {
  CYCLE1,
  CYCLE2,
  CYCLE3,
  COLLEGE,
  LYCEE,
  SUPERIEUR,
  RECHERCHE
}

const levelLabel = (level: Level) => {
  switch (level) {
    case Level.CYCLE1:
      return 'Cycle 1';
    case Level.CYCLE2:
      return 'Cycle 2';
    case Level.CYCLE3:
      return 'Cycle 3';
    case Level.COLLEGE:
      return 'Collège';
    case Level.LYCEE:
      return 'Lycée';
    case Level.SUPERIEUR:
      return 'Supérieur';
    case Level.RECHERCHE:
      return 'Recherche';
    default:
      return 'N/A';
  }
};

const levelsCount = Object.keys(Level).length / 2;

export {Level, levelLabel, levelsCount};