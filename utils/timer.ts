const resolveIn = (ms: number) =>
  new Promise((resolve) => setTimeout(resolve, ms))

export default { resolveIn }
