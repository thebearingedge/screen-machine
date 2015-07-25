
'use strict';

var customerApi = require('my-customer-api');
var customerReports = require('my-reports-api');

require('customer-screen-riot-tags');


module.exports = customersScreen;

function customersScreen(machine) {

  machine
    .state('customers', {
      path: '/customers',
      component: 'customers',
      resolve: {
        customers: function (params, query) {
          return customerApi.fetch(query);
        }
      }
    })
    .state('customers.profile', {
      path: '/:customerId',
      component: 'customer-profile',
      defaultChild: 'customer-report',
      resolve: {
        details: function (params) {
          return customerApi.fetchOne(params.customerId);
        },
        report: function (params) {
          return customerReports.fetch({
              type: 'stats',
              customerid: params.customerId
            });
        }
      }
    });

}
