
const promiseTimeout = async (timeout) => {
  return new Promise((resolve) => {
    // console.log('sleep...');
    setTimeout(resolve, timeout)
  });
}

const promiseArray = async (array) => {
  console.log('fetching array...')
  await promiseTimeout(1000);
  return array;
}

(async () => {
  console.log('starting');

  const array = await promiseArray([1, 2, 3]);
  console.log(array);
  const sum = await array.reduce(async (ppr, pr) => {
    const total = await ppr;
    const current = await pr;
    await promiseTimeout(1000);
    return total + current;
  }, Promise.resolve(0));
  console.log(sum);
  //await promiseTimeout(1000);

  console.log('ending...');
})();
