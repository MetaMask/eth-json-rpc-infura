import nock from 'nock';

beforeEach(() => {
  nock.disableNetConnect();
});

afterEach(() => {
  nock.enableNetConnect();
});
