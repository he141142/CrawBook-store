module.exports = class queue {
  running = 0;
  tasks = [];
  concurrency = 3;
  queue = null;
  url = 'https://scrapeme.live/shop/page/1/';
  useHeadless = true; // "true" to use playwright
  maxVisits = 30; // Arbitrary number for the maximum of links visited
  visited = new Set();
  allProducts = [];
  constructor() {
    this.queue = [];
  }



  dequeue() {
    return this.queue.pop();
  }

  peek() {
    return this.queue[this.length - 1];
  }

  get length() {
    return this.queue.length;
  }

  isEmpty() {
    return this.queue.length === 0;
  }
  sleep = ms => new Promise(resolve => setTimeout(resolve, ms));

  enqueue = async (task, ...params) => {
    try {
      this.tasks.push({task, params}); // Add task to the list
      if (this.running >= this.concurrency) {
        return; // Do not run if we are above the concurrency limit
      }

      this.running += 1; // "Block" one concurrent task
      while (this.tasks.length > 0) {
        const {task, params} = this.tasks.shift(); // Take task from the list
        await task(...params); // Execute task with the provided params
      }
      this.running -= 1; // Release a spot
    }catch (e) {
      console.log("Error in enqueue:");
      console.log(e)
    }

  }

  crawlTask = async (url,task,...param) => {
    if (this.visited.size >= this.maxVisits) {
      console.log('Over Max Visits, exiting');
      return;
    }

    if (this.visited.has(url)) {
      return;
    }
    // await this.sleep(10000);

    await task(...param);
  };
}