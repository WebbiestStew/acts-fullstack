export default async () => {
  // Give async operations time to clean up
  await new Promise(resolve => setTimeout(resolve, 500));
};
