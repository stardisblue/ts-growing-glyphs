export const Constants = {
  /**
   * Minimum width/height of a {@link QuadTree cell}.
   */
  MIN_CELL_SIZE: 1e-8,

  /**
   * Factor of average number of entities a glyph should represent before
   * it is considered to be a {@link Glyph big glyph}.
   */
  BIG_GLYPH_FACTOR: 100,

  /**
   * The maximum number of glyphs that should intersect any leaf
   * {@link QuadTree cell} at any point in time. Cells will split when
   * this constant is about to be violated, and will join when a glyph
   * is removed from a cell and joining would not violate this.
   */
  MAX_GLYPHS_PER_CELL: 10,

  /**
   * Number of merge events that a glyph will record at most. This is not
   * strictly enforced by the glyph itself, but should be respected by the
   * {@link FirstMergeRecorder} and other code that records merges.
   *
   * More merges can be recorded with a glyph when many merges occur at the
   * exact same time.
   */
  MAX_MERGES_TO_RECORD: 4,

  /**
   * Whether the big glyph optimization should be used.
   */
  BIG_GLYPHS: false,

  /**
   * Whether merge events are to be created for all pairs of glyphs, or only
   * the first one. Setting this to `true` implies a performance hit.
   * <p>
   * This constant will also determine whether all out of cell events are
   * put into the global event queue (`true`), or not.
   * <p>
   * high values when setting this to `true`, or you need to allocate
   * more memory to the clustering process for large data sets.
   */
  ROBUST: false,

  /**
   * When {@link #ROBUST} is `false`, this flag toggles behavior where
   * glyphs track which glyphs think they'll merge with them first. Merge
   * events are then updated for tracking glyphs, as glyphs merge.
   * <p>
   * {@link #ROBUST}, except for CPU time instead of memory.
   */
  TRACK: true,

  /**
   * Whether messages should be logged at all. This overrides logging
   * configuration from `logging.properties` (but only negatively,
   *
   * it will not log messages when this is disabled in `logging.properties`.
   */
  LOGGING_ENABLED: true,

  /**
   * Whether some statistics should be collected that may be time-intensive
   * to collect. Disable this before measuing running time, just in case.
   */
  STATS_ENABLED: false,

  /**
   * Whether timers should be used to track wall clock computation time.
   */
  TIMERS_ENABLED: true,
};
