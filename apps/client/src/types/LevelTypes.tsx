enum Level {
  KINDERGARTEN,
  ELEMENTARY_SCHOOL_1,
  ELEMENTARY_SCHOOL_2,
  MIDDLE_SCHOOL,
  HIGH_SCHOOL,
  HIGHER_EDUCATION,
  RESEARCH
}

const levelLabel = (level: Level) => {
  switch (level) {
    case Level.KINDERGARTEN:
      return 'levels.kinderGarten';
    case Level.ELEMENTARY_SCHOOL_1:
      return 'levels.elementarySchool1';
    case Level.ELEMENTARY_SCHOOL_2:
      return 'levels.elementarySchool2';
    case Level.MIDDLE_SCHOOL:
      return 'levels.middleSchool';
    case Level.HIGH_SCHOOL:
      return 'levels.highSchool';
    case Level.HIGHER_EDUCATION:
      return 'levels.higherEducation';
    case Level.RESEARCH:
      return 'levels.research';
    default:
      return '';
  }
};

const levelsCount = Object.keys(Level).length / 2;

export { Level, levelLabel, levelsCount };
