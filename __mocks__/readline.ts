module.exports = {
  createInterface: jest.fn().mockReturnValue({
    question: jest.fn().mockImplementationOnce((_questionTest, cb) => cb("RRF")),
    close: jest.fn().mockImplementationOnce(() => undefined),
  }),
}
