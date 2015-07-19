
'use strict';

module.exports = ResolveJob;


function ResolveJob(tasks, transition) {

  this.tasks = tasks;
  this.transition = transition;
  this.remaining = tasks.length;
  this.completed = [];
  this.stop = false;
  this.promise = new ResolveJob.Promise(this.finish, this.abort);
}


ResolveJob.prototype.start = function () {

  var self = this;

  self
    .tasks
    .filter(function (task) {

      return task.isReady();
    })
    .forEach(function (ready) {

      return self.run(ready);
    });

  return self.promise;
};


ResolveJob.prototype.run = function (task) {

  var self = this;

  return self
    .dequeueTask(task)
    .execute()
    .then(function (result) {

      if (self.stop) return;

      if (self.transition.isSuperceded()) {

        self.stop = true;

        return self.promise.reject();
      }

      task.result = result;
      self.completed.push(task);

      return --self.remaining
        ? self.runDependentsOf(task)
        : self.promise.resolve(self.completed);
    })
    .catch(function (err) {

      if (!self.stop) {

        self.stop = true;

        return self.promise.reject(err);
      }
    });
};


ResolveJob.prototype.dequeueTask = function (task) {

  return this.tasks.splice(this.tasks.indexOf(task), 1);
};


ResolveJob.prototype.abort = function (err) {

  return err;
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


ResolveJob.prototype.finish = function (completed) {

  return completed;
};
