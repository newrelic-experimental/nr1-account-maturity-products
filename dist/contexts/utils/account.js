"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.createAccountMap = createAccountMap;
exports.createAccountMapBatch = createAccountMapBatch;
exports.setNrqlFragmentSubscription = setNrqlFragmentSubscription;
exports.createFetchAccountNRQLFragment = createFetchAccountNRQLFragment;
exports.createAccount = createAccount;
exports.getAgentReleases = getAgentReleases;
exports.getDocEventTypes = getDocEventTypes;
exports.getCloudLinkedAccounts = getCloudLinkedAccounts;
exports.getAccountDetails = getAccountDetails;
exports.assembleResults = assembleResults;
exports.fetchAccountDetailsByProduct = fetchAccountDetailsByProduct;

var _regenerator = _interopRequireDefault(require("@babel/runtime/regenerator"));

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));

var _asyncToGenerator2 = _interopRequireDefault(require("@babel/runtime/helpers/asyncToGenerator"));

var _lodash = _interopRequireDefault(require("lodash"));

var _es6PromisePool = _interopRequireDefault(require("es6-promise-pool"));

var _Account = require("../../modules/Account");

var _EventTypes = require("../../modules/EventTypes");

var _accountGql = require("./account-gql");

var _marked = /*#__PURE__*/_regenerator["default"].mark(getAccountDetails);

function _createForOfIteratorHelper(o) { if (typeof Symbol === "undefined" || o[Symbol.iterator] == null) { if (Array.isArray(o) || (o = _unsupportedIterableToArray(o))) { var i = 0; var F = function F() {}; return { s: F, n: function n() { if (i >= o.length) return { done: true }; return { done: false, value: o[i++] }; }, e: function e(_e) { throw _e; }, f: F }; } throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); } var it, normalCompletion = true, didErr = false, err; return { s: function s() { it = o[Symbol.iterator](); }, n: function n() { var step = it.next(); normalCompletion = step.done; return step; }, e: function e(_e2) { didErr = true; err = _e2; }, f: function f() { try { if (!normalCompletion && it["return"] != null) it["return"](); } finally { if (didErr) throw err; } } }; }

function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(n); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }

function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) { arr2[i] = arr[i]; } return arr2; }

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(Object(source), true).forEach(function (key) { (0, _defineProperty2["default"])(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

function createAccountMap(_x, _x2, _x3, _x4) {
  return _createAccountMap.apply(this, arguments);
}

function _createAccountMap() {
  _createAccountMap = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee2(accounts, cloudLinkedAccounts, gqlAPI, _ref) {
    var _ref$nrqlFragment, nrqlFragment, _ref$createAccountFn, createAccountFn, _ref$maxConcurrency, maxConcurrency, accountMap, acctDetailGenerator, pool;

    return _regenerator["default"].wrap(function _callee2$(_context4) {
      while (1) {
        switch (_context4.prev = _context4.next) {
          case 0:
            _ref$nrqlFragment = _ref.nrqlFragment, nrqlFragment = _ref$nrqlFragment === void 0 ? null : _ref$nrqlFragment, _ref$createAccountFn = _ref.createAccountFn, createAccountFn = _ref$createAccountFn === void 0 ? createAccount : _ref$createAccountFn, _ref$maxConcurrency = _ref.maxConcurrency, maxConcurrency = _ref$maxConcurrency === void 0 ? 10 : _ref$maxConcurrency;
            accountMap = new Map();
            acctDetailGenerator = getAccountDetails(accountMap, accounts, cloudLinkedAccounts, gqlAPI, nrqlFragment, createAccountFn);
            pool = new _es6PromisePool["default"](acctDetailGenerator, maxConcurrency);
            _context4.next = 6;
            return pool.start();

          case 6:
            return _context4.abrupt("return", accountMap);

          case 7:
          case "end":
            return _context4.stop();
        }
      }
    }, _callee2);
  }));
  return _createAccountMap.apply(this, arguments);
}

function createAccountMapBatch(_x5, _x6, _x7, _x8) {
  return _createAccountMapBatch.apply(this, arguments);
}

function _createAccountMapBatch() {
  _createAccountMapBatch = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee4(accounts, cloudLinkedAccounts, gqlAPI, _ref2) {
    var _ref2$nrqlFragment, nrqlFragment, _ref2$createAccountFn, createAccountFn, _ref2$maxConcurrency, maxConcurrency, accountMap, query, _getAccountDetails, pool;

    return _regenerator["default"].wrap(function _callee4$(_context8) {
      while (1) {
        switch (_context8.prev = _context8.next) {
          case 0:
            _ref2$nrqlFragment = _ref2.nrqlFragment, nrqlFragment = _ref2$nrqlFragment === void 0 ? null : _ref2$nrqlFragment, _ref2$createAccountFn = _ref2.createAccountFn, createAccountFn = _ref2$createAccountFn === void 0 ? createAccount : _ref2$createAccountFn, _ref2$maxConcurrency = _ref2.maxConcurrency, maxConcurrency = _ref2$maxConcurrency === void 0 ? 10 : _ref2$maxConcurrency;
            accountMap = new Map();
            query = _objectSpread({}, _accountGql.FETCH_ACCOUNT_WITH_ID_GQL_OBJ.createQuery(nrqlFragment));
            _getAccountDetails = /*#__PURE__*/_regenerator["default"].mark(function _getAccountDetails() {
              var _iterator4, _step4, _loop2;

              return _regenerator["default"].wrap(function _getAccountDetails$(_context7) {
                while (1) {
                  switch (_context7.prev = _context7.next) {
                    case 0:
                      _iterator4 = _createForOfIteratorHelper(accounts);
                      _context7.prev = 1;
                      _loop2 = /*#__PURE__*/_regenerator["default"].mark(function _loop2() {
                        var account, queryTmp;
                        return _regenerator["default"].wrap(function _loop2$(_context6) {
                          while (1) {
                            switch (_context6.prev = _context6.next) {
                              case 0:
                                account = _step4.value;
                                queryTmp = _objectSpread({}, query);

                                _setGQLVariables(queryTmp, account);

                                _context6.next = 5;
                                return (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee3() {
                                  var response, accountTmp;
                                  return _regenerator["default"].wrap(function _callee3$(_context5) {
                                    while (1) {
                                      switch (_context5.prev = _context5.next) {
                                        case 0:
                                          _context5.next = 2;
                                          return gqlAPI(queryTmp);

                                        case 2:
                                          response = _context5.sent;
                                          accountTmp = createAccountFn({
                                            response: response,
                                            account: account
                                          });
                                          accountTmp.cloudLinkedAccounts = cloudLinkedAccounts;
                                          _context5.next = 7;
                                          return _getDeploymentList(accountTmp.id, accountTmp.throughputData, gqlAPI);

                                        case 7:
                                          accountTmp.deploymentAppList = _context5.sent;
                                          accountMap.set(accountTmp.id, accountTmp);
                                          return _context5.abrupt("return", Promise.resolve(response));

                                        case 10:
                                        case "end":
                                          return _context5.stop();
                                      }
                                    }
                                  }, _callee3);
                                }))();

                              case 5:
                              case "end":
                                return _context6.stop();
                            }
                          }
                        }, _loop2);
                      });

                      _iterator4.s();

                    case 4:
                      if ((_step4 = _iterator4.n()).done) {
                        _context7.next = 8;
                        break;
                      }

                      return _context7.delegateYield(_loop2(), "t0", 6);

                    case 6:
                      _context7.next = 4;
                      break;

                    case 8:
                      _context7.next = 13;
                      break;

                    case 10:
                      _context7.prev = 10;
                      _context7.t1 = _context7["catch"](1);

                      _iterator4.e(_context7.t1);

                    case 13:
                      _context7.prev = 13;

                      _iterator4.f();

                      return _context7.finish(13);

                    case 16:
                    case "end":
                      return _context7.stop();
                  }
                }
              }, _getAccountDetails, null, [[1, 10, 13, 16]]);
            });
            pool = new _es6PromisePool["default"](_getAccountDetails(), maxConcurrency);
            _context8.next = 7;
            return pool.start();

          case 7:
            return _context8.abrupt("return", accountMap);

          case 8:
          case "end":
            return _context8.stop();
        }
      }
    }, _callee4);
  }));
  return _createAccountMapBatch.apply(this, arguments);
}

function _setGQLVariables(query, account) {
  var subscriptions = account.subscriptions ? Object.keys(account.subscriptions) : null;
  query.variables = _objectSpread({}, query.variables, {
    id: account.id,
    APM_SUBSCRIBED: subscriptions ? subscriptions.includes('apm') : true,
    BROWSER_SUBSCRIBED: subscriptions ? subscriptions.includes('browser') : true,
    MOBILE_SUBSCRIBED: subscriptions ? subscriptions.includes('mobile') : true,
    INFRA_SUBSCRIBED: subscriptions ? subscriptions.includes('infrastructure') : true,
    INSIGHTS_SUBSCRIBED: subscriptions ? subscriptions.includes('insights') : true,
    SYNTHETICS_SUBSCRIBED: subscriptions ? subscriptions.includes('synthetics') : true,
    LOGGING_SUBSCRIBED: subscriptions ? subscriptions.includes('logging') : true,
    PROGRAMMABILITY_SUBSCRIBED: subscriptions ? subscriptions.includes('programmability') : true
  });

  if (query.variables.withFragment) {
    setNrqlFragmentSubscription(query);
  }
}

function setNrqlFragmentSubscription(query) {
  var queryTmp = query.query;
  var index = queryTmp.lastIndexOf('fragment NRQLFragment on Account {');
  var nrqlFragment = queryTmp.substring(index);
  var queryStart = queryTmp.substring(0, index);

  if (index === 0) {
    return;
  }

  nrqlFragment = nrqlFragment.replace(/\$APM_SUBSCRIBED/g, query.variables.APM_SUBSCRIBED);
  nrqlFragment = nrqlFragment.replace(/\$BROWSER_SUBSCRIBED/g, query.variables.BROWSER_SUBSCRIBED);
  nrqlFragment = nrqlFragment.replace(/\$MOBILE_SUBSCRIBED/g, query.variables.MOBILE_SUBSCRIBED);
  nrqlFragment = nrqlFragment.replace(/\$INFRA_SUBSCRIBED/g, query.variables.INFRA_SUBSCRIBED);
  nrqlFragment = nrqlFragment.replace(/\$INSIGHTS_SUBSCRIBED/g, query.variables.INSIGHTS_SUBSCRIBED);
  nrqlFragment = nrqlFragment.replace(/\$SYNTHETICS_SUBSCRIBED/g, query.variables.SYNTHETICS_SUBSCRIBED);
  nrqlFragment = nrqlFragment.replace(/\$LOGGING_SUBSCRIBED/g, query.variables.LOGGING_SUBSCRIBED);
  nrqlFragment = nrqlFragment.replace(/\$PROGRAMMABILITY_SUBSCRIBED/g, query.variables.PROGRAMMABILITY_SUBSCRIBED);
  query.query = queryStart.concat(nrqlFragment);
} // see FETCH_ACCOUNT_WITH_ID_GQL


function createFetchAccountNRQLFragment(_ref3) {
  var _ref3$nrqlFragments = _ref3.nrqlFragments,
      nrqlFragments = _ref3$nrqlFragments === void 0 ? null : _ref3$nrqlFragments,
      _ref3$fragmentID = _ref3.fragmentID,
      fragmentID = _ref3$fragmentID === void 0 ? 'NRQLFragment' : _ref3$fragmentID;

  if (!nrqlFragments) {
    throw new Error("nrqlFragments param cannot be null");
  }

  return "fragment ".concat(fragmentID, " on Account {\n\n              ").concat(nrqlFragments, "\n\n          }\n");
}

function createAccount(event) {
  var response = event.response,
      account = event.account;

  var _ref4 = response ? response.data.actor.account : account,
      id = _ref4.id,
      name = _ref4.name,
      eventType = _ref4.eventType,
      dtData = _ref4.dtData,
      pageActionData = _ref4.pageActionData,
      throughputData = _ref4.throughputData,
      transactionKeyset = _ref4.transactionKeyset,
      pageViewKeyset = _ref4.pageViewKeyset,
      systemSampleKeyset = _ref4.systemSampleKeyset,
      containerSampleKeyset = _ref4.containerSampleKeyset,
      infraDeployedVersions = _ref4.infraDeployedVersions,
      infraHostCount = _ref4.infraHostCount,
      mobileDeployedVersions = _ref4.mobileDeployedVersions,
      apmDeployedVersions = _ref4.apmDeployedVersions,
      awsBilling = _ref4.awsBilling,
      logMessageCount = _ref4.logMessageCount,
      nrqlLoggingAlertCount = _ref4.nrqlLoggingAlertCount,
      programDeployCount = _ref4.programDeployCount,
      programUniqUserDeployment = _ref4.programUniqUserDeployment,
      mobileBreadcrumbs = _ref4.mobileBreadcrumbs,
      mobileHandledExceptions = _ref4.mobileHandledExceptions,
      mobileEvents = _ref4.mobileEvents,
      mobileAppLaunch = _ref4.mobileAppLaunch;

  var accountDetail = {};
  accountDetail.id = id;
  accountDetail.name = name;
  accountDetail.reportingEventTypes = eventType ? eventType.results.map(function (_ref5) {
    var eventType = _ref5.eventType;
    return eventType;
  }) : [];
  accountDetail.dtAppList = dtData ? dtData.results[0]['uniques.appName'] : [];
  accountDetail.throughputData = throughputData ? throughputData.results : [];
  accountDetail.pageActionList = pageActionData ? pageActionData.results[0]['uniques.appName'] : [];
  accountDetail.transactionKeyset = transactionKeyset ? transactionKeyset.results : [];
  accountDetail.pageViewKeyset = pageViewKeyset ? pageViewKeyset.results : []; // [{ hostname:<servername> , allKeys:["attributes","attributes"]}, .... ]

  accountDetail.containerSampleKeyset = containerSampleKeyset ? containerSampleKeyset.results.map(function (_ref6) {
    var entityName = _ref6.entityName,
        allKeys = _ref6.allKeys;
    return {
      entityName: entityName,
      allKeys: allKeys
    };
  }) : [];
  accountDetail.contained = accountDetail.containerSampleKeyset ? accountDetail.containerSampleKeyset.length > 0 : false; // [{ hostname:<servername> , allKeys:["attributes","attributes"]}, .... ]

  accountDetail.systemSampleKeyset = systemSampleKeyset ? systemSampleKeyset.results.map(function (_ref7) {
    var entityName = _ref7.entityName,
        allKeys = _ref7.allKeys;
    return {
      entityName: entityName,
      allKeys: allKeys
    };
  }) : []; //  [ { facet": "1.8.32", "count": 17,  "infrastructureAgentVersion": "1.8.32"}, ...]

  accountDetail.infraDeployedVersions = infraDeployedVersions ? infraDeployedVersions.results : [];
  accountDetail.infraHostCount = infraHostCount ? infraHostCount.results[0].count : 0; //   [{"facet":"5.19.1","appCount":1,"newRelicVersion":"5.19.1","osName":"Android"}]

  accountDetail.mobileDeployedVersions = mobileDeployedVersions ? mobileDeployedVersions.results : []; // [ { "facet": ["ruby", "6.5.0.357" ], "apmLanguageapmAgentVersion": [ "ruby","6.5.0.357" ],"count": 42}]

  accountDetail.apmDeployedVersions = apmDeployedVersions ? apmDeployedVersions.results : [];
  accountDetail.awsBilling = awsBilling ? awsBilling.results[0].count > 0 : false;
  accountDetail.logMessageCount = logMessageCount ? logMessageCount.results[0].count : 0;
  accountDetail.nrqlLoggingAlertCount = nrqlLoggingAlertCount && nrqlLoggingAlertCount.nrqlConditionsSearch ? nrqlLoggingAlertCount.nrqlConditionsSearch.totalCount : 0;
  accountDetail.programDeployCount = programDeployCount ? programDeployCount.results[0].count : 0;
  accountDetail.programUniqUserDeployment = programUniqUserDeployment ? programUniqUserDeployment.results[0].uniqueCount : 0; //  [{ "facet": "Acme Telco -Android", "appName": "Acme Telco -Android", "count": 1809  },...]

  accountDetail.mobileBreadcrumbs = mobileBreadcrumbs ? mobileBreadcrumbs.results : []; //  [{ "facet": "Acme Telco -Android", "appName": "Acme Telco -Android", "count": 1809  },...]

  accountDetail.mobileHandledExceptions = mobileHandledExceptions ? mobileHandledExceptions.results : []; // [{"facet":"Acme Telco -Android","appName":"Acme Telco -Android","count":1911}]

  accountDetail.mobileEvents = mobileEvents ? mobileEvents.results : []; // [{"uniqueSessions": 495496}]
  // store the session count

  accountDetail.mobileAppLaunch = mobileAppLaunch && mobileAppLaunch.results && mobileAppLaunch.results.length > 0 ? mobileAppLaunch.results[0].uniqueSessions : 0;
  return new _Account.Account(accountDetail);
}

function _getDeploymentList(accountId, throughputData, gqlAPI) {
  // creating guid strings and removing = buffer as graphql doesn't accept this ¯\_(ツ)_/¯
  var guid = "".concat(accountId, "|APM|APPLICATION|");

  if (typeof throughputData === 'undefined' || throughputData && throughputData.length === 0) {
    return Promise.resolve([]);
  }

  var throughputList = throughputData.map(function (app) {
    return btoa(guid + app.appId).split('=').join('');
  });
  return fetchDeployments(throughputList, gqlAPI);
}

function fetchDeployments(_x9, _x10) {
  return _fetchDeployments.apply(this, arguments);
}

function _fetchDeployments() {
  _fetchDeployments = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee5(throughputList, gqlAPI) {
    var lastMonth, startTime, endTime, query, results, deploymentList;
    return _regenerator["default"].wrap(function _callee5$(_context9) {
      while (1) {
        switch (_context9.prev = _context9.next) {
          case 0:
            lastMonth = new Date();
            lastMonth.setMonth(new Date().getMonth() - 1);
            startTime = lastMonth.getTime();
            endTime = Date.now();
            query = _objectSpread({}, _accountGql.APM_DEPLOYMENTS_GQL, {
              variables: {
                endTime: endTime,
                startTime: startTime,
                guids: throughputList
              }
            });
            _context9.next = 7;
            return gqlAPI(query);

          case 7:
            results = _context9.sent;
            deploymentList = [];

            if (results.data.actor.entities) {
              _context9.next = 11;
              break;
            }

            return _context9.abrupt("return", deploymentList);

          case 11:
            // eslint-disable-next-line array-callback-return
            results.data.actor.entities.map(function (app) {
              if (app.deployments && app.deployments.length > 0) {
                deploymentList.push(app.applicationId);
              }
            });
            return _context9.abrupt("return", deploymentList);

          case 13:
          case "end":
            return _context9.stop();
        }
      }
    }, _callee5);
  }));
  return _fetchDeployments.apply(this, arguments);
}

function getAgentReleases(_x11) {
  return _getAgentReleases.apply(this, arguments);
}

function _getAgentReleases() {
  _getAgentReleases = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee6(gqlAPI) {
    var _yield$gqlAPI, data, docAgentLatestVersion;

    return _regenerator["default"].wrap(function _callee6$(_context10) {
      while (1) {
        switch (_context10.prev = _context10.next) {
          case 0:
            _context10.next = 2;
            return gqlAPI(_accountGql.DOC_AGENT_RELEASES_GQL);

          case 2:
            _yield$gqlAPI = _context10.sent;
            data = _yield$gqlAPI.data;
            docAgentLatestVersion = {};

            try {
              // {"android":"5.24.3","browser":"1167","dotnet":"8.24.244.0","elixir":"0.0.0","go":"3.3.0","infrastructure":"1.10.26","ios":"3.53.1","java":"5.10.0","nodejs":"6.4.2","php":"9.7.0.258","python":"5.8.0.136","ruby":"V6.9.0","skd":"1.3.0"}
              docAgentLatestVersion = {
                android: _getAgentRelease(data.androidReleases),
                browser: _getAgentRelease(data.browserReleases),
                dotnet: _getAgentRelease(data.dotnetReleases),
                dotnet_legacy: _getAgentRelease(data.dotnetReleases, 'dotnet_legacy'),
                elixir: _getAgentRelease(data.elixirReleases),
                go: _getAgentRelease(data.goReleases),
                infrastructure: _getAgentRelease(data.infraReleases),
                ios: _getAgentRelease(data.iosReleases),
                java: _getAgentRelease(data.javaReleases),
                nodejs: _getAgentRelease(data.nodejsReleases),
                php: _getAgentRelease(data.phpReleases),
                python: _getAgentRelease(data.pythonReleases),
                ruby: _getAgentRelease(data.rubyReleases),
                c: _getAgentRelease(data.sdkReleases)
              };
            } catch (err) {
              console.error(err);
            }

            return _context10.abrupt("return", docAgentLatestVersion);

          case 7:
          case "end":
            return _context10.stop();
        }
      }
    }, _callee6);
  }));
  return _getAgentReleases.apply(this, arguments);
}

function getDocEventTypes() {
  var docEventTypes = {};

  if (_EventTypes.EventTypes) {
    // docs > dataDictionary is not available for GQL customer schema
    // using static list see EventTypes.js
    // [{attributes:[{label:"", name: ""},{...}], name:"Transaction"}]
    var eventTypes = _EventTypes.EventTypes.data.docs.dataDictionary.eventTypes;
    eventTypes.forEach(function (eventType) {
      var name = eventType.name;
      docEventTypes[name] = _objectSpread({}, eventType); // { "Transaction" : {name:"Transaction", dataSources:["APM"], attributes:[{ name:< Attribute name>, label: "<Attribute label>"}, ... ]}}
    });
  }

  return docEventTypes;
}

function getCloudLinkedAccounts(_x12) {
  return _getCloudLinkedAccounts.apply(this, arguments);
}

function _getCloudLinkedAccounts() {
  _getCloudLinkedAccounts = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee7(gqlAPI) {
    var accountId,
        cloudQuery,
        _yield$gqlAPI2,
        data,
        errors,
        cloudLinkedAccounts,
        _ref10,
        linkedAccounts,
        _args11 = arguments;

    return _regenerator["default"].wrap(function _callee7$(_context11) {
      while (1) {
        switch (_context11.prev = _context11.next) {
          case 0:
            accountId = _args11.length > 1 && _args11[1] !== undefined ? _args11[1] : null;
            cloudQuery = accountId ? _objectSpread({}, _accountGql.CLOUD_LINKED_ACCTS_WITH_ID_GQL, {
              variables: {
                id: accountId
              }
            }) : _accountGql.CLOUD_LINKED_ACCTS_GQL;
            _context11.next = 4;
            return gqlAPI(cloudQuery);

          case 4:
            _yield$gqlAPI2 = _context11.sent;
            data = _yield$gqlAPI2.data;
            errors = _yield$gqlAPI2.errors;
            cloudLinkedAccounts = {};

            if (!errors) {
              _context11.next = 10;
              break;
            }

            return _context11.abrupt("return", cloudLinkedAccounts);

          case 10:
            _context11.prev = 10;
            _ref10 = accountId ? data.actor.account.cloud : data.actor.cloud, linkedAccounts = _ref10.linkedAccounts;

            if (linkedAccounts) {
              _context11.next = 14;
              break;
            }

            return _context11.abrupt("return", cloudLinkedAccounts);

          case 14:
            linkedAccounts.forEach(function (linkedAccount) {
              var nrAccountId = linkedAccount.nrAccountId;

              if (!cloudLinkedAccounts[nrAccountId]) {
                cloudLinkedAccounts[nrAccountId] = [];
              } // generate this obj
              // cloudLinkedAccounts[nrAccountId]
              // cloudLinkedAccounts[10245]: [ {"disabled": false,"name": "MyTestNewRelicAccount", "nrAccountId": 1100964,"provider": {"id": 1, "name": "Amazon Web Services" }}]


              cloudLinkedAccounts[nrAccountId].push(linkedAccount);
            });
            _context11.next = 20;
            break;

          case 17:
            _context11.prev = 17;
            _context11.t0 = _context11["catch"](10);
            console.error(_context11.t0);

          case 20:
            return _context11.abrupt("return", cloudLinkedAccounts);

          case 21:
          case "end":
            return _context11.stop();
        }
      }
    }, _callee7, null, [[10, 17]]);
  }));
  return _getCloudLinkedAccounts.apply(this, arguments);
}

function _getAgentRelease(agentReleaseNode) {
  var name = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : null;

  if (!agentReleaseNode) {
    return '0.0.0';
  }

  var refPoint = 0;
  if (agentReleaseNode.agentReleases.length > 0 && agentReleaseNode.agentReleases[0].version == ""){
    for (var i = 0; i < agentReleaseNode.agentReleases.length; i++) {
      if (agentReleaseNode.agentReleases[i].version != ""){
        refPoint = i;
      }
    }
  }

  if (!name) {
    return agentReleaseNode.agentReleases && agentReleaseNode.agentReleases.length > 0 ? agentReleaseNode.agentReleases[refPoint].version : '0.0.0';
  } // this logic is specific to dotnet_legacy


  return agentReleaseNode.agentReleases && agentReleaseNode.agentReleases.length > 0 ? agentReleaseNode.agentReleases.filter(function (release) {
    return release.version.startsWith('6');
  }).shift().version : '0.0.0';
} // see FETCH_ACCOUNT_WITH_ID_GQL_OBJ


var subscriptionGQLVarDict = {
  apm: 'APM_SUBSCRIBED',
  browser: 'BROWSER_SUBSCRIBED',
  mobile: 'MOBILE_SUBSCRIBED',
  infrastructure: 'INFRA_SUBSCRIBED',
  insights: 'INSIGHTS_SUBSCRIBED',
  synthetics: 'SYNTHETICS_SUBSCRIBED',
  logging: 'LOGGING_SUBSCRIBED',
  eventTypeInclude: 'EVENT_TYPES_INCLUDE',
  programmability: 'PROGRAMMABILITY_SUBSCRIBED'
};

function getAccountDetails(accountMap, accounts, cloudLinkedAccounts, gqlAPI, nrqlFragment, createAccountFn) {
  var query, _iterator, _step, _loop;

  return _regenerator["default"].wrap(function getAccountDetails$(_context3) {
    while (1) {
      switch (_context3.prev = _context3.next) {
        case 0:
          query = _objectSpread({}, _accountGql.FETCH_ACCOUNT_WITH_ID_GQL_OBJ.createQuery(nrqlFragment));
          _iterator = _createForOfIteratorHelper(accounts);
          _context3.prev = 2;
          _loop = /*#__PURE__*/_regenerator["default"].mark(function _loop() {
            var account;
            return _regenerator["default"].wrap(function _loop$(_context2) {
              while (1) {
                switch (_context2.prev = _context2.next) {
                  case 0:
                    account = _step.value;
                    _context2.next = 3;
                    return (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee() {
                      var subscriptions, promises, _iterator2, _step2, productLine, results, response, accountTmp;

                      return _regenerator["default"].wrap(function _callee$(_context) {
                        while (1) {
                          switch (_context.prev = _context.next) {
                            case 0:
                              subscriptions = account.subscriptions ? Object.keys(account.subscriptions) : Object.keys(subscriptionGQLVarDict);

                              if (account.subscriptions) {
                                // includes not based on subscriptions
                                // see FETCH_ACCOUNT_WITH_ID_GQL_OBJ
                                // see subscriptionGQLVarDict
                                subscriptions.push('eventTypeInclude');
                                subscriptions.push('programmability');
                              }

                              promises = [];
                              _iterator2 = _createForOfIteratorHelper(subscriptions);

                              try {
                                for (_iterator2.s(); !(_step2 = _iterator2.n()).done;) {
                                  productLine = _step2.value;
                                  // group GQL requests by product to create smaller GQL payload and minimize timeouts
                                  promises.push(fetchAccountDetailsByProduct(account, productLine, query, gqlAPI));
                                }
                              } catch (err) {
                                _iterator2.e(err);
                              } finally {
                                _iterator2.f();
                              }

                              _context.next = 7;
                              return Promise.all(promises);

                            case 7:
                              results = _context.sent;
                              response = assembleResults(results);
                              accountTmp = createAccountFn({
                                response: response,
                                account: account
                              });
                              accountTmp.cloudLinkedAccounts = cloudLinkedAccounts;
                              _context.next = 13;
                              return _getDeploymentList(accountTmp.id, accountTmp.throughputData, gqlAPI);

                            case 13:
                              accountTmp.deploymentAppList = _context.sent;
                              accountMap.set(accountTmp.id, accountTmp);
                              return _context.abrupt("return", Promise.resolve(accountMap));

                            case 16:
                            case "end":
                              return _context.stop();
                          }
                        }
                      }, _callee);
                    }))();

                  case 3:
                  case "end":
                    return _context2.stop();
                }
              }
            }, _loop);
          });

          _iterator.s();

        case 5:
          if ((_step = _iterator.n()).done) {
            _context3.next = 9;
            break;
          }

          return _context3.delegateYield(_loop(), "t0", 7);

        case 7:
          _context3.next = 5;
          break;

        case 9:
          _context3.next = 14;
          break;

        case 11:
          _context3.prev = 11;
          _context3.t1 = _context3["catch"](2);

          _iterator.e(_context3.t1);

        case 14:
          _context3.prev = 14;

          _iterator.f();

          return _context3.finish(14);

        case 17:
        case "end":
          return _context3.stop();
      }
    }
  }, _marked, null, [[2, 11, 14, 17]]);
}

function assembleResults(results) {
  // console.log(`assembleResults results=${JSON.stringify(results)}`);
  var response = {
    data: {
      actor: {
        account: null
      }
    }
  };
  var ctr = 0;

  var _iterator3 = _createForOfIteratorHelper(results),
      _step3;

  try {
    for (_iterator3.s(); !(_step3 = _iterator3.n()).done;) {
      var result = _step3.value;

      if (result.errors) {
        console.log("warning: assembleResults() Error found in results. Error=", result.errors, " result=", result);
      } // we need to continue/check if partial results were returned even if there were errors


      if (result.data && result.data.actor && result.data.actor.account !== null) {
        ctr++;
        response.data.actor.account = _objectSpread({}, response.data.actor.account, {}, result.data.actor.account);
      }
    } // return null if all nrql fragments for the account had errors

  } catch (err) {
    _iterator3.e(err);
  } finally {
    _iterator3.f();
  }

  return ctr > 0 ? response : null;
}

function fetchAccountDetailsByProduct(account, productLine, query, gqlAPI) {
  var queryTmp = _lodash["default"].cloneDeep(query);

  var gqlKey = subscriptionGQLVarDict[productLine];

  if (typeof queryTmp.variables[gqlKey] === 'undefined') {
    // ignore unsupported products
    return Promise.resolve(true);
  }

  queryTmp.variables.id = account.id;
  queryTmp.variables[gqlKey] = true; // workaround to enable use of 'if' in fragment
  // import this call must be made after setting queryTmp.variables[gqlKey]= true;

  setNrqlFragmentSubscription(queryTmp);
  return gqlAPI(queryTmp);
}