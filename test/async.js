
const promiseTimeout = async (timeout) => {
  return new Promise((resolve) => {
    setTimeout(resolve, timeout)
  });
}

const promiseArray = async (myArray) => {
  console.log('fetching myArray...')
  await promiseTimeout(1000);
  return myArray;
}

(async () => {
  console.log('starting');

  // Fetch from a promiseArray
  const promise = promiseArray([1, 2, 3]);
  const myArray = await promise;
  console.log(myArray);

  // async myArray.map() example
  const mapPromise = myArray.map(async (current, index, array) => {
    const newValue = current * 2;
    await promiseTimeout(1000); // Something that takes time
    return newValue;
  });
  const mapArray = await Promise.all(mapPromise);
  console.log(mapArray);

  // async myArray.reduce() example for sum
  const initialValue = 0;
  const reducePromise = myArray.reduce(async (accumulatorPromise, current, index, array) => {
    const accumulator = await accumulatorPromise;
    const newValue = accumulator + current;
    await promiseTimeout(1000); // Something that takes time
    return newValue;
  }, Promise.resolve(initialValue));
  const reduceSum = await reducePromise;
  console.log(reduceSum);

  // async myArray.reduce() example for filter
  const initialList = [];
  const filterPromise = myArray.reduce(async (accumulatorPromise, current, index, array) => {
    const accumulator = await accumulatorPromise;
    if (current % 2 != 0) {
      accumulator.push(current);
      return accumulator;
    }
    return accumulator;
  }, Promise.resolve(initialList));
  const reduceFilter = await filterPromise;
  console.log(reduceFilter);

  console.log('ending...');
})();
