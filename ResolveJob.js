
'use strict';

module.exports = ResolveJob;


function ResolveJob(tasks, transition, callback) {

  this.tasks = tasks;
  this.wait = tasks.length;
  this.transition = transition;
  this.callback = callback;
  this.completed = [];
  this.cancelled = false;
}


ResolveJob.prototype.start = function () {

  var self = this;

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
    .dequeue(task)
    .execute()
    .then(function (result) {

      if (self.cancelled) return;

      if (self.transition.isSuperceded()) {

        return self.abort();
      }

      task.result = result;
      self.completed.push(task);

      return --self.wait
        ? self.runDependentsOf(task)
        : self.finish();
    })
    .catch(function (err) {

      if (!self.cancelled) {

        return self.abort(err);
      }
    });
};


ResolveJob.prototype.dequeue = function (task) {

  return this.tasks.splice(this.tasks.indexOf(task), 1);
};


ResolveJob.prototype.runDependentsOf = function (task) {

  var self = this;

  return self
    .tasks
    .filter(function (remaining) {

      return remaining.isDependentOn(task.name);
    })
    .forEach(function (dependent) {

      return dependent
        .setInjectable(task.name, task.result)
        .isReady()
          ? self.run(dependent)
          : undefined;
    });
};


ResolveJob.prototype.finish = function () {

  return this.callback.call(null, null, this.completed);
};


ResolveJob.prototype.abort = function (err) {

  this.cancelled = true;

  if (err) this.callback.call(null, err);
};
