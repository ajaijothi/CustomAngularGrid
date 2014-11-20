angular.module('grid', ['ngSanitize'])
    .factory('CustomGridService', ['$q', '$http', function ($q, $http) {
        var CustomGridService = {};
        CustomGridService.loadDataSet = function (url, data, method, headers) {
            var dObj = $q.defer();
            $http({
                url: url,
                method: method || 'POST',
                data: data,
                headers: headers || ''
            }).success(function (data, status) {
                dObj.resolve(data);
            }).error(function (data, status) {
                dObj.reject({ data: data, status: status });
            });
            return dObj.promise;
        };
        CustomGridService.loadHierarchy = function (url, method, headers) {
            var dObj = $q.defer();
            $http({
                url: url,
                method: method || 'GET',
                headers: headers || ''
            }).success(function (data, status) {
                dObj.resolve(data);
            }).error(function (data, status) {
                dObj.reject({ data: data, status: status });
            });
            return dObj.promise;
        };
        CustomGridService.loadFilter = function (url, data, method, headers) {
            var dObj = $q.defer();
            $http({
                url: url,
                params:data,
                method: method || 'GET',
                headers: headers || '',                
            }).success(function (data, status) {
                dObj.resolve(data);
            }).error(function (data, status) {
                dObj.reject({ data: data, status: status });
            });
            return dObj.promise;
        };
        CustomGridService.saveFilter = function (url, data, method, headers) {
            var dObj = $q.defer();
            $http({
                url: url,
                method: method || 'GET',
                headers: headers || '',
                data:data
            }).success(function (data, status) {
                dObj.resolve(data);
            }).error(function (data, status) {
                dObj.reject({ data: data, status: status });
            });
            return dObj.promise;
        };
        CustomGridService.deleteFilter = function (url, data, method, headers) {
            var dObj = $q.defer();
            $http({
                url: url,
                method: method || 'GET',
                headers: headers || '',
                params:data
            }).success(function (data, status) {
                dObj.resolve(data);
            }).error(function (data, status) {
                dObj.reject({ data: data, status: status });
            });
            return dObj.promise;
        };
        return CustomGridService;
    }])
    .filter('groupBy', function () {
        return function (input, group) {
            var output = input;
            if (group) {
                var _output = _.groupBy(input, group);
                output = [];
                for (o in _output) {
                    output.push({ groupName: o, value: _output[o] });
                }
            }
            return output;
        };
    })
    .filter('groupfilter', function () {
        return function (input, search, limit, page, serverPaging) {
            var output = [];
            page = page || 0;
            search = search.toLowerCase() || "";
            output = _.filter(input, function (row) {
                return row[0].toString().toLowerCase().indexOf(search) >= 0;
            });

            if(serverPaging)
                return _.size(input) > limit && limit > 0 ? output.splice(0, limit) : output;
            
            return _.size(input) > limit && limit > 0 ? output.splice(page * limit, limit) : output;
        };
    })
    .filter('gridfilter', function () {
        return function (input, search, limit, page, serverPaging) {
            var output = [],
                k;
            page = page || 0;
            search = search.toLowerCase() || "";
            var hasSearch = false;
            output = _.filter(input, function (row) {
                hasSearch = false;
                for (k in row) {
                    if (k != '_hierarchy' && row[k] && row[k].toString().toLowerCase().indexOf(search) >= 0) {
                        hasSearch = true;
                    }
                }
                return hasSearch;
            });
            
            if(serverPaging)
                return _.size(input) > limit && limit > 0 ? output.splice(0, limit) : output;

            return _.size(input) > limit && limit > 0 ? output.splice(page * limit, limit) : output;
        };
    })
    .filter('columnFilter', function () {
        return function (input, columnFilters) {
            if (!columnFilters)
                return input;

            var output = [],
                k;
            var keys = _.keys(columnFilters);

            output = _.filter(input, function (row) {
                var count = 0;
                for (k in columnFilters) {
                    var s = $.trim(columnFilters[k]).toLowerCase();
                    if (!s)
                        count++;
                    else if (row[k].toString().toLowerCase().indexOf(s) >= 0 || row[k] == s)
                        count++;
                }
                return (count == keys.length);
            });
            return output;
        };
    })
    .directive('grid', ['CustomGridService', function (CustomGridService) {
        var gridTemplate = ['<div class="_grid-container">',
                    '<div class="_grid-loader" ng-if="grid.isLoading"><span><i class="fa fa-3x fa-refresh fa-spin"></i></span></div>',
                    '<div class="row _grid-control" ng-show="showTools">',
                        '<div class="col-md-6">',
                            '<div ng-if="pagination.showPaging">Page Size <input size="1" maxlength="3" type="text" class="_showperpage form-control" ng-model="pagination.pageSize"/> ',
                                ' <a ng-if="filter.showFilter" title="Column Filter" class="btn gbtn-default filter-btn" ng-class="{active:filter.columnFilterActive}" ng-click="filter.columnFilterActive=!filter.columnFilterActive"><i class="fa fa-filter"></i></a>',
                                ' <a ng-if="filter.showFilterExpression" class="btn gbtn-default filter-btn" ng-class="{active:filter.filterExpressionActive}" ng-click="filter.filterExpressionActive=!filter.filterExpressionActive"><i class="fa fa-lg fa-code"></i>   <i class="fa fa-filter"></i></a>', 
                                ' <span class="btn-group filter-select" ng-show="filter.filterList.length>1 && filter.showFilterExpression">',
                                    '<span class="btn gbtn-default filter-btn"><i class="fa fa-filter"></i></span>',
                                    '<span class="btn gbtn-default filter-btn fselect">',
                                        '<select ng-options="f.ID as f.Name for f in filter.filterList" ng-model="filter.currentFilterExpression" ng-change="filter.loadExpression($event)">',                                            
                                        '</select>',
                                    '</span>',
                                    '<span class="btn gbtn-default filter-btn" ng-click="filter.editExpression()"><i class="fa fa-pencil"></i></span>',
                                    '<span class="btn gbtn-default filter-btn" ng-click="filter.deleteExpression()"><i class="fa fa-trash"></i></span>',
                                '</span>', 
                            '</div>',
                        '</div>',
                        '<div class="col-md-6 text-right">',
                            ' <span ng-show="showGroupBy&&!grid.hierarchy">',
                                ' <span class="btn-group filter-select" title="Group by column value">',
                                    '<span class="btn gbtn-default filter-btn"><i class="fa fa-th-large"></i></span>',
                                    '<span class="btn gbtn-default filter-btn fselect">',
                                        '<select ng-options="col.value as col.name for col in grid.columns" ng-model="groupBy"><option value=""> </option></select>',
                                    '</span>',
                                '</span>',
                            '</span>',
                            ' <input size="50" type="text" class="_search form-control" ng-model="filter.search"/>',                                                       
                        '</div>',
                    '</div>',
                    '<div class="_grid-box" ng-include="groupBy?\'gridGroup.html\':\'gridDefault.html\'"></div>',
                '</div>'].join('');

        return {
            restrict: 'EA',
            replace: true,
            require: "ngModel",
            transclude: false,
            scope: {
                gridOptions: '=config',
                model: "=ngModel",
            },
            template: gridTemplate,
            link: function (scope, element, attrs) {

            },
            controller: function ($scope) {
                $scope.templatePath = path + 'Scripts/lib/ui-templates/';
                $scope.pagination = {
                    showPaging: false,
                    pageSize: 0,
                    currentPage: 0,
                    lastPage: 0,
                    pages: [0],
                    totalRecords: 0,
                    init: function () {
                        //set page size
                        $scope.pagination.showPaging && ($scope.pagination.pageSize = $scope.gridOptions.pageSize || 10);
                        $scope.pagination.update();
                        $scope.pagination.currentPage = 0;
                    },
                    update: function () {
                        var rowLength = $scope.grid.rows?$scope.grid.rows.length:0;
                        var rowLength = $scope.grid.rows ? $scope.grid.rows.length : 0;
                        var total = 0;
                        if ($scope.grid.serverPaging) {
                            $scope.pagination.totalRecords = $scope.pagination.totalRecords || ($scope.gridOptions.totalRecords || rowLength);
                        }
                        else {
                            $scope.pagination.totalRecords = rowLength;
                        }
                        total = $scope.pagination.totalRecords;
                        
                        $scope.pagination.pageSize = $scope.pagination.pageSize || 10;
                        if ($scope.pagination.pageSize > 0) {
                            $scope.pagination.pages = _.range(Math.ceil(total / $scope.pagination.pageSize));
                            _.map($scope.pagination.pages, function (p) {
                                return p + 1;
                            });
                        }
                        else {
                            $scope.pagination.pages = [1];
                        }
                        $scope.pagination.lastPage = $scope.pagination.pages[$scope.pagination.pages.length - 1];
                    },
                    setCurrentPage: function (page) {
                        if (page < $scope.pagination.pages.length && page >= 0 && page!=$scope.pagination.currentPage){
                            $scope.pagination.currentPage = page;                 
                            $scope.model = [];
                            $scope.grid.serverPaging && $scope.grid.loadDataSet();
                        }
                    },
                    getPages: function () {
                        var pages = [];
                        if (($scope.pagination.lastPage - $scope.pagination.currentPage) >= 10)
                            pages = _.clone($scope.pagination.pages).splice($scope.pagination.currentPage, 10);
                        else {
                            var sIndex = $scope.pagination.currentPage+1 - 10;
                            pages = _.clone($scope.pagination.pages).splice((sIndex >= 0 ? sIndex : 0), 10);
                        }
                        return pages;
                    }
                };


                $scope.initLoad = true;


                $scope.grid = {
                    resultSet:[],
                    isLoading:false,
                    serverPaging:false,
                    hierarchy:false,
                    columns: [],
                    rows: [],
                    groupArray: [],
                    showGrouping: false,
                    actions: [],
                    rowActions: [],
                    groupActions:[],
                    generateColumns: function () {
                        if ($scope.gridOptions.columns && $scope.gridOptions.columns.length) {
                            $scope.grid.columns = [];
                            $.each($scope.gridOptions.columns, function (i, c) {
                                var obj = {};
                                obj.name = c.name || c.value;
                                obj.value = c.value || c.name;
                                obj.type = c.type || "";
                                obj.url = c.url || "";
                                obj.style = c.style || {};
                                obj.modalProperties = c.modalProperties || {};
                                obj.asideProperties = c.asideProperties || {};
                                obj.modalTitle = c.modalTitle || "";
                                obj.asideTitle = c.asideTitle || "";
                                obj.dataType = c.dataType || '';
                                $scope.grid.columns.push(obj);
                                $scope.filter.columns[obj.value] = '';
                            });
                        }
                        else if ($scope.grid.rows && $scope.grid.rows.length) {
                            $scope.grid.columns = [];
                            for (var k in $scope.grid.rows[0]) {
                                if (k !== '_hierarchy' && k !== '$$hactive' && k!='_rowColor' && k!='$$hashKey') {
                                    var obj = {};
                                    obj.name = k;
                                    obj.value = k;
                                    obj.type = "";
                                    $scope.grid.columns.push(obj);
                                    $scope.filter.columns[obj.value] = '';
                                }
                            }
                        }

                        return $scope.grid.columns;
                    },
                    getUniqueColumnValues: function (col) {
                        return _.uniq(_.map($scope.grid.rows, _.iteratee(col.value)));
                    },
                    getURL: function (url, r) {
                        if(r)
                        return url.replace(/\[(.*?)\]/g, function (a, b) {
                            return r[b];
                        });
                    },
                    selectRow: function (row) {
                        if (!($scope.model instanceof Array))
                            $scope.model = [];

                        var index = $scope.grid.inSelection(row);

                        if (index < 0) {
                            if (!$scope.gridOptions.multiSelect)
                                $scope.model = [];

                            $scope.model.push(row);
                        }
                        else
                            $scope.model.splice(index, 1);                        
                    },
                    inSelection: function (row) {
                        return $.inArray(row, $scope.model);
                    },
                    refresh: function(){
                        $scope.grid.rows = $scope.gridOptions.rows;
                        $scope.grid.generateColumns();
                        $scope.pagination.update();
                    },
                    loadDataSet:function(){
                        $scope.grid.isLoading=true;
                        
                        var defaultData = { pagingEnabled: $scope.grid.serverPaging, pageSize: $scope.pagination.pageSize, pageIndex: $scope.pagination.currentPage };
                        
                        $scope.grid.extendedObject.filterExp = $scope.filter.buildQuery();

                        var data = $.extend(true, $scope.grid.extendedObject, defaultData);

                        CustomGridService.loadDataSet($scope.gridOptions.dataUrl, data, $scope.method, $scope.headers).then(function (data) {
                            $scope.gridOptions.rows = data.rows || [];
                            $scope.pagination.totalRecords = data.totalRecords;
                            $scope.grid.isLoading=false;
                        }, function (data) {
                            $scope.grid.isLoading=false;
                            console.error('unable to retrive data');
                        });
                    },
                    loadHierarchy:function(row){
                        row.$$hactive=!row.$$hactive;
                        
                        if($scope.grid.serverPaging && row._hierarchy)
                            row._hierarchy.rows = [];
                        
                        if(!row.$$hactive || !$scope.grid.hierarchy)
                            return false;
                        
                        if($scope.gridOptions.hierarchyUrl){
                            $scope.grid.isLoading = true;
                            CustomGridService.loadHierarchy($scope.grid.getURL($scope.gridOptions.hierarchyUrl, row), $scope.method, $scope.headers).then(function(config){
                                row._hierarchy = config;
                                config.headers = $scope.headers;
                                config.extendedObject = config.extendedObject || {};
                                config.showTools = false;
                                $scope.initLoad = false;
                                $scope.grid.isLoading = false;
                            });
                        }
                    },
                    init: function () {
                        if ($scope.gridOptions) {
                            $scope.method = $scope.gridOptions.method;
                            $scope.headers = $scope.gridOptions.headers;
                            
                            $scope.groupBy = $scope.gridOptions.groupBy;
                            $scope.actionRef = $scope.gridOptions.actionReference;
                            $scope.showTools = $scope.gridOptions.showTools === false ? false : true;
                            $scope.showGroupBy = $scope.gridOptions.showGroupBy === false ? false : true;
                            $scope.showHeaders = $scope.gridOptions.showHeaders === false ? false : true;
                            
                            $scope.filter.showFilter = $scope.gridOptions.filter==false? false : true;
                            $scope.filter.showFilterExpression = $scope.gridOptions.showFilterExpression || false;

                            $scope.grid.extendedObject = $scope.gridOptions.extendedObject || {};
                            $scope.grid.showGrouping = $scope.gridOptions.showGrouping || false;
                            $scope.grid.serverPaging = $scope.gridOptions.serverPaging || false;
                            $scope.grid.hierarchy = $scope.gridOptions.hierarchy || false;
                            
                            $scope.pagination.pageSize = $scope.gridOptions.pageSize || 10;
                            $scope.pagination.showPaging = $scope.gridOptions.showPaging === false ? false : true;
                            
                            $scope.grid.actions = $scope.gridOptions.actions || [];
                            $scope.grid.groupActions = [];
                            $scope.grid.rowActions = [];
                            $scope.grid.rows = [];
                            
                            $.each($scope.grid.actions, function(i,action){
                                action.isGeneralAction = !!action.isGeneralAction;
                                if(!action.isGeneralAction)
                                    $scope.grid.rowActions.push(action);
                                else
                                    $scope.grid.groupActions.push(action);
                            });
                            
                            if ($scope.grid.serverPaging || $scope.gridOptions.dataUrl) {
                                if ($scope.filter.showFilterExpression)
                                    $scope.filter.init();
                                else {
                                    $scope.grid.loadDataSet();
                                }
                            }
                            else {
                                $scope.grid.rows = $scope.gridOptions.rows || [];                                                                
                            }
                        }
                    },
                    actionHandler: function ($event, isGeneralAction, actionName, row) {
                        if (typeof actionName == 'function') {
                            actionName($event, isGeneralAction ? $scope.model : [row], $scope);
                        }
                        else {
                            var action = $scope.actionRef[actionName];
                            if (typeof action == 'function')
                                action($event, isGeneralAction ? $scope.model : [row], $scope);
                        }
                    }
                };

                $scope.groupArray = [];

                $scope.setGroup = function (group) {
                    var _output = _.groupBy($scope.grid.rows, group);
                    var output = [],
                        o;
                    for (o in _output) {
                        output.push([o, _output[o], false]);
                    }
                    $scope.grid.groupArray = output;
                };


                $scope.sort = {
                    column: "",
                    reverse: false
                };

                
                 
                $scope.filter = {
                    search: '',
                    showFilter: true,
                    showFilterExpression:false,
                    columnFilterActive: false,
                    filterExpressionActive:false,
                    currentFilterExpression:0,
                    filterExpression:[],
                    filterList: [{ID:0}],
                    setAsDefault:false,
                    columns: {
                    },
                    getDataType: function(colValue){
                        var dType = '';
                        $.each($scope.grid.columns, function(i, col){
                            if(col.value == colValue){
                                dType = col.dataType || '';
                            }
                        });
                        return dType;
                    },
                    columnChange: function(exp){
                        exp.dataType = $scope.filter.getDataType(exp.column);
                        exp.value = '';
                    },
                    addChild: function(index, exp){
                        var obj = {
                            boolean:'',
                            column:'',
                            operator:'',
                            dataType:'',
                            value1:'',
                            value2:'',
                            parent:exp || $scope.filter.filterExpression,
                            children:[]
                        };
                        
                        obj.parent.splice(index+1,0,obj);                        
                    },
                    deleteChild: function(exp){
                       var index = $.inArray(exp, exp.parent);
                        (index>=0) && exp.parent.splice(index, 1);
                    },
                    editExpression:function(){
                        if($scope.filter.currentFilterExpression>0)
                            $scope.filter.filterExpressionActive = true;
                        else
                            $scope.filter.filterExpression = [];
                    },
                    deleteExpression: function(){
                        var data={id: $scope.filter.currentFilterExpression};
                        CustomGridService.deleteFilter(path + 'api/grid/DeleteGridFilter', data, 'POST', $scope.headers).then(function () {
                            $scope.filter.init();                            
                        });
                    },                    
                    buildQuery: function(){
                        var queryString = '';
                        
                        function iterate(e){
                            var str = '';
                            if(e.column){
                                str = ' ' + e.boolean + ' ([' + e.column + '] ';

                                switch(e.operator){
                                    case 'Between':
                                    case 'NotBetween':                                    
                                        if(e.dataType == 'date')
                                            str = str + e.operator.toUpperCase() + ' \'' + moment(e.value1).format('YYYY-MM-DD') + '\' ' + 'AND' + ' \'' + moment(e.value2).format('YYYY-MM-DD') + '\'';
                                        else
                                            str = str + e.operator.toUpperCase() + ' \'' + e.value1 + '\' ' + 'AND' + ' \'' + e.value2 + '\'';
                                        break;
                                    case 'IsNull':
                                        str = ' ' + e.boolean + ' ([' + e.column + '] ' +'IS NULL';
                                        break;
                                    case 'IsNotNull':
                                        str = ' ' + e.boolean + ' ([' + e.column + '] ' +'IS NOT NULL';
                                        break;
                                    case 'EqualTo':
                                        str = ' ' + e.boolean + ' ([' + e.column + '] = \'' + e.value1 + '\'';
                                        break;
                                    case 'NotEqualTo':
                                        str = ' ' + e.boolean + ' ([' + e.column + '] <> \'' + e.value1 + '\'';
                                        break;
                                    case 'Like':
                                        str = ' ' + e.boolean + ' ([' + e.column + '] LIKE \'%' + e.value1 + '%\'';
                                        break;
                                    case 'GreaterThan':
                                        str = ' ' + e.boolean + ' ([' + e.column + '] > ' + e.value1;
                                        break;
                                    case 'GreaterThanOrEqualTo':
                                        str = ' ' + e.boolean + ' ([' + e.column + '] >= ' + e.value1;
                                        break;
                                    case 'LessThan':
                                        str = ' ' + e.boolean + ' ([' + e.column + '] < ' + e.value1;
                                        break;
                                    case 'LessThanOrEqualTo':
                                        str = ' ' + e.boolean + ' ([' + e.column + '] <= ' + e.value1;
                                        break;                                
                                    default:
                                        str = str + e.value1 + '\'';
                                        break;
                                }

                                if(e.children.length){
                                    $.each(e.children, function(i, exp){
                                        str = str + iterate(exp);
                                    });
                                }
                                str = str + ') ';
                            }
                            return str;
                        }
                        
                        $.each($scope.filter.filterExpression, function(i, e){
                            if(e.column)
                                queryString = queryString + iterate(e);
                        });
                        
                        return queryString;
                    },
                    applyFilter:function(){
                        $scope.grid.loadDataSet();
                    },
                    prepareFilterSave: function(){
                         var expressions = [];
                         (function iterate(exp, dest){
                            $.each(exp, function(i,e){
                                var obj = {
                                    boolean:e.boolean,
                                    column:e.column,
                                    operator:e.operator,
                                    dataType:e.dataType,
                                    value1:e.value1,
                                    value2:e.value2,
                                    children:[]
                                };
                                
                                if(e.children.length)
                                    iterate(e.children, obj.children);
                                
                                dest.push(obj);
                            });
                        })($scope.filter.filterExpression, expressions);
                        
                        return expressions;
                    },
                    getFilterById:function(id){
                        var fObj = {};
                        $.each($scope.filter.filterList, function (i, filter) {
                            if(filter.ID == id)
                                fObj = filter;
                        });
                        return fObj;
                    },
                    saveFilter:function(saveAs){
                        var id = 0;
                        if($scope.filter.currentFilterExpression>0 && !saveAs){
                            id = $scope.filter.currentFilterExpression;
                            var fObj = $scope.filter.getFilterById(id);
                            $scope.filter.saveHandler(id, fObj.Name, JSON.stringify($scope.filter.prepareFilterSave()), $scope.filter.setAsDefault);
                        }
                        else{
                            $.prompt('Enter Filter Name', {
                                onComplete:function(res, value){
                                    if(res == 'Ok'){
                                        var fname = $.trim(value);
                                        if(fname == '')
                                            return false;
                                        $scope.filter.saveHandler(id, fname, JSON.stringify($scope.filter.prepareFilterSave()), $scope.filter.setAsDefault);
                                    }
                                }
                            });
                        }
                    },
                    saveHandler:function(id, fname, fvalue, isDefault){
                        var data = {};
                        data.ID = id;
                        data.Name = fname;
                        data.FilterType = 1;
                        data.GridID = $scope.grid.extendedObject.GridID;
                        data.UserID = null;
                        data.UpdatedOn = null;
                        data.Expression = fvalue;
                        data.IsDefault = !!isDefault;

                        CustomGridService.saveFilter(path + 'api/grid/CreateOrUpdateFilter', data, 'POST', $scope.headers).then(function (data) {
                            $.notify('Filter saved successfully', {type:'success'});
                            $scope.filter.init();
                        });
                    },
                    loadExpression: function (e) {
                        if ($scope.filter.currentFilterExpression > 0) {
                            var fObj = $scope.filter.getFilterById($scope.filter.currentFilterExpression);
                            if (fObj) {
                                $scope.filter.filterExpression = $.parseJSON(fObj.Expression);
                                $scope.filter.currentFilterExpression = fObj.ID;
                                $scope.filter.setAsDefault = fObj.IsDefault;
                                (function iterate(exp) {
                                    $.each(exp, function (i, e) {
                                        e.parent = exp;
                                        if (e.children.length)
                                            iterate(e.children);
                                    });
                                })($scope.filter.filterExpression);
                            }
                        }
                        else {
                            $scope.filter.filterExpression = [];
                            $scope.filter.setAsDefault = false;
                        }

                        $scope.grid.loadDataSet();
                    },
                    init: function () {
                        if ($scope.filter.showFilterExpression) {
                            $scope.filter.filterExpression = [];
                            $scope.filter.filterExpressionActive = false;
                            $scope.filter.currentFilterExpression = 0;
                            $scope.filter.setAsDefault = false;

                            var data = { gridId: $scope.grid.extendedObject.GridID };
                            CustomGridService.loadFilter(path + 'api/grid/GetGridFilters', data, 'GET', $scope.headers).then(function (data) {
                                $scope.filter.filterList = data;
                                $scope.filter.filterList.splice(0,0,{ID:0, Name:''});
                                $scope.initLoad = false;
                                var hasDefault = false;
                                $.each($scope.filter.filterList, function () {
                                    if (this.IsDefault) {
                                        $scope.filter.currentFilterExpression = this.ID;
                                        hasDefault = true;
                                    }
                                });
                                if (hasDefault)
                                    $scope.filter.loadExpression();
                                else
                                    $scope.grid.loadDataSet();
                            });                            
                        }
                    }
                };

                $scope.orderby = function (col) {
                    $scope.sort.reverse = ($scope.sort.column == col) ? !$scope.sort.reverse : false;
                    $scope.sort.column = col;
                };

                //watch
                $scope.$watch('gridOptions', function (v) {
                    $scope.grid.init();
                    $scope.pagination.init();
                });

                $scope.$watch('gridOptions.rows', function (v) {
                    $scope.grid.refresh();
                });

                $scope.$watch('groupBy', function (v) {
                    if ($scope.groupBy) {
                        $scope.setGroup($scope.groupBy);
                        $scope.pagination.update();
                    }
                });

                $scope.$watch('filter', function (v) {
                    $scope.pagination.update();
                });

                $scope.$watch('pagination.pageSize', function (v) {
                    $scope.pagination.update();
                    if ($scope.grid.serverPaging && !$scope.grid.isLoading && !$scope.initLoad) {
                         $scope.grid.loadDataSet();
                    }
                });
                
                /*$scope.$watch('filter.search', function(ov , nv){
                    if(nv!=ov){
                        if($scope.grid.serverPaging)
                            $scope.grid.loadDataSet();
                    }
                });
                $scope.$watch('filter.columns', function(ov , nv){
                    if(nv!=ov){
                        if($scope.grid.serverPaging)
                            $scope.grid.loadDataSet();
                    }
                });*/
            }
        };
    }]);
