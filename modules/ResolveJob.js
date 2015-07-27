
'use strict';

module.exports = ResolveJob;


function ResolveJob(tasks, transition, Promise) {

  this.tasks = tasks;
  this.transition = transition;
  this.Promise = Promise;
}


ResolveJob.prototype.run = function run() {

  var queue = this.tasks.slice();
  var wait = queue.length;
  var complete = [];
  var transition = this.transition;

  var Promise = this.Promise;

  var next = queue
    .filter(function (task) {

      return task.isReady();
    })
    .map(function (ready) {

      return ready.execute(queue, wait, complete, transition);
    });

  return Promise
    .all(next)
    .then(function () {

      return Promise.resolve(complete);
    });
};
