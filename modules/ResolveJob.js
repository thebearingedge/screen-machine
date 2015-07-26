
'use strict';

module.exports = ResolveJob;


function ResolveJob(tasks, transition) {

  this.tasks = tasks;
  this.transition = transition;
  this.remaining = tasks.length;
  this.completed = [];
  this.stop = false;
}


ResolveJob.prototype.callback = null;


ResolveJob.prototype.start = function (callback) {

  var self = this;

  self.callback = callback;

  self
    .tasks
    .filter(function (task) {

      return task.isReady();
    })
    .forEach(function (ready) {

      self.run(ready);
    });

  return self;
};


ResolveJob.prototype.run = function (task) {

  var self = this;

  return self
    .dequeue(task)
    .execute()
    .then(function (result) {

      if (self.stop) return;

      if (self.transition.isSuperceded()) {

        return self.abort();
      }

      task.stash(result);
      self.completed.push(task);

      return --self.remaining
        ? self.runDependentsOf(task)
        : self.callback.call(null, null, self.completed);
    })
    .catch(function (err) {

      if (!self.stop) {

        return self.abort(err);
      }
    });
};


ResolveJob.prototype.dequeue = function (task) {

  return this.tasks.splice(this.tasks.indexOf(task), 1);
};


ResolveJob.prototype.abort = function (err) {

  this.stop = true;

  if (err) this.callback.call(null, err);
};


ResolveJob.prototype.runDependentsOf = function (task) {

  var self = this;

  return self
    .tasks
    .filter(function (waiting) {

      return waiting.isWaitingFor(task.name);
    })
    .forEach(function (dependent) {

      return dependent
        .setDependency(task.name, task.result)
        .isReady()
          ? self.run(dependent)
          : undefined;
    });
};
