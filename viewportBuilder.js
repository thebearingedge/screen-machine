
'use strict';

/*
 * user-provided state objects come with view keys that refer to viewports.
 * many "views" populate the same viewports at different states. we may want
 * the state to hold references to its viewports. one ocurrence of an implied
 * viewport is all we need to a) instantiate the viewport and b) add it to the
 * implied state. a given state object may imply a viewport that exists on a yet
 * unaccounted-for state, so we will queue info about the viewport until we can
 * actually create it and set it on its state
 */

module.exports = {

  states: {},


  queues: {},



};

