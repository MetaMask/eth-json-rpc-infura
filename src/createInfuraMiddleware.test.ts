import { createInfuraMiddleware } from '.';

describe('createInfuraMiddleware', () => {
  it('throws when the projectId is an empty string', () => {
    expect(() => createInfuraMiddleware({ projectId: '' })).toThrow(
      /Invalid value for 'projectId'/u,
    );
  });
});
