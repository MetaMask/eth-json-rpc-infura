const { createInfuraMiddleware } = require('.');

describe('createInfuraMiddleware (JS-only tests)', () => {
  it('throws when the projectId is a number', () => {
    expect(() => createInfuraMiddleware({ projectId: 42 })).toThrow(
      /Invalid value for 'projectId'/u,
    );
  });

  it('throws when the projectId is undefined', () => {
    expect(() => createInfuraMiddleware({ projectId: undefined })).toThrow(
      /Invalid value for 'projectId'/u,
    );
  });

  it('throws when the projectId is null', () => {
    expect(() => createInfuraMiddleware({ projectId: null })).toThrow(
      /Invalid value for 'projectId'/u,
    );
  });

  it('throws when headers is null', () => {
    expect(() =>
      createInfuraMiddleware({ projectId: 'foo', headers: null }),
    ).toThrow(/Invalid value for 'headers'/u);
  });

  it('throws when headers is a number', () => {
    expect(() =>
      createInfuraMiddleware({ projectId: 'foo', headers: 42 }),
    ).toThrow(/Invalid value for 'headers'/u);
  });

  it('throws when headers is an empty string', () => {
    expect(() =>
      createInfuraMiddleware({ projectId: 'foo', headers: '' }),
    ).toThrow(/Invalid value for 'headers'/u);
  });
});
