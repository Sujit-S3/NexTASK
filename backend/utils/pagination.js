const DEFAULT_LIMIT = 20;
const MAX_LIMIT = 100;

/**
 * Clamp page/limit query params to sane bounds so a bad value (page=0,
 * negative, limit=0, non-numeric) can't produce a negative skip (Mongo throws),
 * an unbounded result set (limit=0 means "no limit" in Mongo), or an
 * Infinity/NaN `pages` value in the response.
 */
const getPagination = ({ page, limit } = {}, defaultLimit = DEFAULT_LIMIT) => {
  const parsedPage = Math.max(1, Math.trunc(Number(page)) || 1);
  const parsedLimit = Math.min(MAX_LIMIT, Math.max(1, Math.trunc(Number(limit)) || defaultLimit));

  return {
    page: parsedPage,
    limit: parsedLimit,
    skip: (parsedPage - 1) * parsedLimit,
  };
};

module.exports = { getPagination };
