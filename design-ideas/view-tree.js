
'use strict';

var tree = {
  $root: {
    $viewports: {}
  }
};


/*
  state('app', {
    component: 'landing'
  })
*/

tree = {
  $root: {
    $viewports: {
      '': {
        $views: {
          'app': {
            component: 'landing'
          }
        }
      }
    }
  }
};


/*
  state('login', {
    component: 'login'
  })
*/

tree = {
  $root: {
    $viewports: {
      '': {
        $views: {
          'app': {
            component: 'landing'
          },
          'login': {
            component: 'login'
          }
        }
      }
    }
  }
};


/*
  state('app.customers', {
    views: {
      'main': {
        component: 'customer-landing'
      }
      sidebar: {
        component: 'customer-list'
      }
    }
  })
*/


tree = {
  $root: {
    $viewports: {
      '': {
        $views: {
          'app': {
            component: 'landing',
            $viewports: {
              '@app': {
                $views: {
                  'app.customers': {
                    component: 'customer-landing',
                    $viewports: {
                      'main@app.customers': {
                        $views: {
                          'app.customers': {
                            component: 'customer-landing'
                          }
                        }
                      },
                      'sidebar@app.customers': {
                        $views: {
                          'app.customers': {
                            component: 'customer-list'
                          }
                        }
                      }
                    }
                  }
                }
              }
            }
          },
          'login': {
            component: 'login'
          }
        }
      }
    }
  }
};


/*
  state('app.customers.profile', {
    views: {
      'main@app.customers': {
        component: 'customer-details'
      }
    }
  })
*/


tree = {
  $root: {
    $viewports: {
      '': {
        $views: {
          'app': {
            component: 'landing',
            $viewports: {
              '@app': {
                $views: {
                  'app.customers': {
                    component: 'customer-landing',
                    $viewports: {
                      'main@app.customers': {
                        $views: {
                          'app.customers': {
                            component: 'customer-landing'
                          },
                          'app.customers.profile': {
                            component: 'customer-details'
                          }
                        }
                      },
                      'sidebar@app.customers': {
                        $views: {
                          'app.customers': {
                            component: 'customer-list'
                          }
                        }
                      }
                    }
                  }
                }
              }
            }
          },
          'login': {
            component: 'login'
          }
        }
      }
    }
  }
};




