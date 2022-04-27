import { createInfuraMiddleware } from '.';

describe('createInfuraMiddleware', () => {
  it('throws when an empty set of options is given', () => {
    expect(() => createInfuraMiddleware({} as any)).toThrow(
      /Invalid value for 'projectId'/u,
    );
  });

  it('throws when the projectId is null', () => {
    expect(() => createInfuraMiddleware({ projectId: null } as any)).toThrow(
      /Invalid value for 'projectId'/u,
    );
  });

  it('throws when the projectId is undefined', () => {
    expect(() =>
      createInfuraMiddleware({ projectId: undefined } as any),
    ).toThrow(/Invalid value for 'projectId'/u);
  });

  it('throws when the projectId is an empty string', () => {
    expect(() => createInfuraMiddleware({ projectId: '' })).toThrow(
      /Invalid value for 'projectId'/u,
    );
  });

  it('throws when the projectId is not a string', () => {
    expect(() => createInfuraMiddleware({ projectId: 42 } as any)).toThrow(
      /Invalid value for 'projectId'/u,
    );
  });

  it('throws when headers is null', () => {
    expect(() =>
      createInfuraMiddleware({ projectId: 'foo', headers: null } as any),
    ).toThrow(/Invalid value for 'headers'/u);
  });

  it('throws when headers is an empty string', () => {
    expect(() =>
      createInfuraMiddleware({ projectId: 'foo', headers: '' } as any),
    ).toThrow(/Invalid value for 'headers'/u);
  });

  it('throws when headers is not an object', () => {
    expect(() =>
      createInfuraMiddleware({ projectId: 'foo', headers: 42 } as any),
    ).toThrow(/Invalid value for 'headers'/u);
  });
});
