
'use strict';

module.exports = ResolveJob;


function ResolveJob(resolveTasks, currentTransition) {

  this.tasks = resolveTasks;
  this.remaining = resolveTasks.length;
  this.transition = currentTransition;
  this.completed = [];
  this.results = {};
  this.cancelled = false;
}


ResolveJob.prototype.start = function (callback) {

  var self = this;

  self.callback = callback;

  return self
    .tasks
    .filter(function (task) {

      return task.isReady();
    })
    .forEach(function (ready) {

      return self.run(ready);
    });
};


ResolveJob.prototype.run = function (task) {

  var self = this;

  return self
    .dequeueTask(task)
    .execute()
    .then(function (result) {

      if (self.cancelled) return;

      if (self.transition.isSuperceded()) {

        return self.abort();
      }

      task.result = self.results[task.name] = result;
      self.completed.push(task);

      return --self.remaining
        ? self.runDependentsOf(task)
        : self.finish();
    })
    .catch(function (err) {

      if (!self.cancelled) {

        return self.abort(err);
      }
    });
};


ResolveJob.prototype.dequeueTask = function (task) {

  return this.tasks.splice(this.tasks.indexOf(task), 1);
};


ResolveJob.prototype.abort = function (err) {

  this.cancelled = true;

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


ResolveJob.prototype.finish = function () {

  return this.callback.call(null, null, this.completed, this.results);
};
