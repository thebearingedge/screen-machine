
'use strict';

module.exports = ResolveJob;


function ResolveJob(tasks) {

  this.canceled = false;
  this.wait = 0;
  this.tasks = tasks;
  this.completed = [];
}


ResolveJob.prototype.onComplete = function (callback) {

  this.successHandler = callback;

  return this;
};


ResolveJob.prototype.onError = function (callback) {

  this.errorHandler = callback;

  return this;
};


ResolveJob.prototype.start = function () {

  this.wait = this.tasks.length;

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

      if (self.canceled) return;

      task.result = result;
      self.completed.push(task);

      return --self.wait
        ? self.runDependentsOf(task)
        : self.finish();
    })
    .catch(function (err) {

      if (!self.canceled) {

        return self.abort(err);
      }
    });
};


ResolveJob.prototype.dequeue = function (task) {

  return this.tasks.splice(this.tasks.indexOf(task), 1);
};


ResolveJob.prototype.abort = function (err) {

  this.canceled = true;

  if (err) this.errorHandler.call(null, err);
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

  return this.successHandler.call(null, this.completed);
};
