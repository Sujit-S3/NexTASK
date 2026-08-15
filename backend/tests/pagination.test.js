const { getPagination } = require('../utils/pagination');

describe('getPagination', () => {
  it('defaults to page 1 / the given default limit', () => {
    expect(getPagination({})).toEqual({ page: 1, limit: 20, skip: 0 });
  });

  it('clamps page=0 and negative pages up to 1 (would otherwise produce a negative skip)', () => {
    expect(getPagination({ page: 0 })).toMatchObject({ page: 1, skip: 0 });
    expect(getPagination({ page: -5 })).toMatchObject({ page: 1, skip: 0 });
  });

  it('falls back to the default for limit=0 instead of passing it through (Mongo treats limit(0) as "no limit")', () => {
    expect(getPagination({ limit: 0 })).toMatchObject({ limit: 20 });
  });

  it('clamps a negative limit up to 1', () => {
    expect(getPagination({ limit: -10 })).toMatchObject({ limit: 1 });
  });

  it('caps an excessively large limit at 100', () => {
    expect(getPagination({ limit: 100000 })).toMatchObject({ limit: 100 });
  });

  it('ignores non-numeric input and falls back to defaults', () => {
    expect(getPagination({ page: 'abc', limit: 'xyz' })).toEqual({ page: 1, limit: 20, skip: 0 });
  });

  it('computes skip correctly for a valid page/limit', () => {
    expect(getPagination({ page: 3, limit: 10 })).toEqual({ page: 3, limit: 10, skip: 20 });
  });

  it('honors a custom default limit', () => {
    expect(getPagination({}, 50)).toMatchObject({ limit: 50 });
  });
});
