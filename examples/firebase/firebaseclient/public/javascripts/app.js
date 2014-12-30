var firebaseUrl = 'https://sweltering-heat-5515.firebaseio.com';
var app = angular.module("workitem", ['ngRoute','firebase','ui.bootstrap']);

app.config(function ($routeProvider, $locationProvider) {
    
    console.log('setting up routes');
    $routeProvider.when('/partials/firespec', {
        templateUrl: '/partials/firespec',
        controller: 'workitemCtrl',
        resolve: {
            // I will cause a 1 second delay
            delay: function ($q, $timeout) {
                console.log('loading firespec');
                var delay = $q.defer();
                $timeout(delay.resolve, 1000);
                return delay.promise;
            }
        }
    });
    
    $routeProvider.when('/partials/login', {
        templateUrl: '/partials/login',
        controller: 'loginCtrl'
    });
    
    $routeProvider.when('/partials/signup', {
        templateUrl: '/partials/signup',
        controller: 'signUpCtrl'
    });
    
    $routeProvider.when('/partials/authorize', {
        templateUrl: '/partials/authorize',
        controller: 'authorizeCtrl'
    });
    
    // configure html5 to get links working on jsfiddle
   //$locationProvider.html5Mode(true);
});

app.filter('isArray', function () {
    return function (input) {
        return angular.isArray(input);
    };
});

app.filter('isObject', function () {
    return function (input) {
        return angular.isObject(input);
    };
});

app.filter('isDefined', function () {
    return function (input) {
        return angular.isDefined(input);
    };
});

app.directive('vsoform', function ($compile) {
    function addControl(scope, parent, control) {
        if (angular.isArray(control) && angular.isDefined(control)) {
            for (var i = 0; i < control.length; i++) {
                addControl(scope, parent, control[i]);
            }
        }
        if (angular.isObject(control) && angular.isDefined(control)) {
            if (control._FieldName) {
                var html = $compile('<div class="col-sm-12"><div class="form-group"><label for="' + control._FieldName + '">' + control._FieldName + '</label><input id="' + control._FieldName + '" class="form-control" ng-model="vso.' + control._FieldName.split('.').join('_') + '" /></div></div>')(scope);
                parent.append(html);
            }
        }
    }
    
    function addTabSet(scope, parent, tabSet) {
        console.log("add tabset");
        var html = '<tabset>';
        for (var i = 0; i < tabSet.Tab.length; i++) {
            var tab = tabSet.Tab[i];
            var control = tab.Control;
            html += '<tab heading="' + tab._Label + '">';
            html += '<div class="col-sm-12"><div class="form-group"><label for="' + control._FieldName + '">' + control._FieldName + '</label><input id="' + control._FieldName + '" class="form-control" /></div></div>';
            html += '</tab>';
        }
        html += '</tabset>';
        
        var element = $compile(html)(scope);
        parent.append(element);
    }
    
    function addTab(scope, parent, tab) {
        var html = $compile('<tab heading="bla" />')(scope);
        parent.append(html);
    
    }
    
    return {
        restrict: 'E',
        link: function (scope, element, attrs) {
            var root = $compile('<form name="dynamicform" class="form-horizontal" role="form" />')(scope);
            console.log(scope.groups.Group)
            for (var i = 0; i < scope.groups.Group.length; i++) {
                var group = scope.groups.Group[i];
                if (angular.isObject(group.Column) && angular.isDefined(group.Column.Control)) {
                    var control = group.Column.Control;
                    var html = $compile('<div class="col-sm-12"><div class="form-group"><label for="' + control._FieldName + '">' + control._Label + '</label><input id="' + control._FieldName + '" class="form-control" /></div></div>')(scope);
                    root.append(html);
                }
                if (angular.isArray(group.Column)) {
                    for (var j = 0; j < group.Column.length; j++) {
                        var column = group.Column[j];
                        var columnSize = column._PercentWidth == "50" ? 6 : 12;
                        var html = $compile('<div class="col-sm-' + columnSize + '" />')(scope);
                        if (angular.isDefined(column.Group) && angular.isDefined(column.Group.Column)) {
                            addControl(scope, html, column.Group.Column.Control);
                        }
                        else {
                            addTabSet(scope, html, column.TabGroup);
                        }
                        root.append(html);
                    }
                }
            }
            element.replaceWith(root);
        }
    }
});


app.controller("mainCtrl", function ($scope, $route, $routeParams, $location) {
    $scope.$route = $route;
    $scope.$location = $location;
    $scope.$routeParams = $routeParams;
});

app.controller("loginCtrl", ["$scope", "$location", "$firebaseAuth", function ($scope, $location, $firebaseAuth) {
    var ref = new Firebase(firebaseUrl);
    var auth = $firebaseAuth(ref);
    
    $scope.username = "dgcaron@gmail.com";
    $scope.password = "testpassword";
    $scope.isAuthenticated = false;
    
    $scope.login = function () {
        auth.$authWithPassword({
            email    : $scope.username,
            password : $scope.password
        }).then(function (authData) {
            $location.path('/partials/authorize');
        }).catch(function (error) {
            console.error("Authentication failed: ", error);
        });
    };
    
    $scope.signup = function () {
        $location.path('/partials/signup');
    };
    
    
    $scope.logoff = function () {
        auth.$unauth();
    }
    
    auth.$onAuth(function (authData) {
        if (authData) {
            $scope.isAuthenticated = true;
            console.log("loginctrl Logged in as:", authData.uid);
        } else {
            $scope.isAuthenticated = false;
            console.log("Logged out");
        }

        //$scope.$apply()
    });
}]);

app.controller("signUpCtrl", ["$scope", "$location", "$firebaseAuth", function ($scope, $location, $firebaseAuth) {
    var ref = new Firebase(firebaseUrl);
    var auth = $firebaseAuth(ref);
    
    $scope.username = "dgcaron@gmail.com";
    $scope.password = "pwd1234";
    $scope.passwordCheck = "pwd1234";
    $scope.message = null;

    $scope.signup = function () {
        $scope.message = null;

        auth.$createUser($scope.username, $scope.password)
        .then(function () {
            console.log("User created successfully!");
            auth.$authWithPassword({
                email    : $scope.username,
                password : $scope.password
            });
        })
        .catch(function (error) {
            console.log(error.code);
            switch (error.code) {
                case 'EMAIL_TAKEN': {
                    console.log(error.message);
                    $scope.message = error.message;
                    break;
                }

                default: { 
                    break;
                }
            }
            console.error("Authentication failed: ", error);
        });
    };
}]);

app.controller("authorizeCtrl", function ($scope, $route, $routeParams, $location) {
    $scope.$route = $route;
    $scope.$location = $location;
    $scope.$routeParams = $routeParams;
});

app.controller("workitemCtrl", function ($scope, $routeParams, $firebase) {
    var ref = new Firebase("https://sweltering-heat-5515.firebaseio.com/firepads/-JdmPrw6sIHdye2NR5-x");
    var sync = $firebase(ref);
    
    // download the data into a local object
    var syncObject = sync.$asObject();
    
    var x2js = new X2JS();
    
    var form = x2js.xml_str2json("<FORM><Layout HideReadOnlyEmptyFields=\"true\" HideControlBorders=\"true\"><Group Margin=\"(4,0,0,0)\"><Column PercentWidth=\"100\"><Control FieldName=\"System.Title\" Type=\"FieldControl\" ControlFontSize=\"large\" EmptyText=\"&amp;lt;Enter title here&amp;gt;\" /></Column></Group><Group Margin=\"(10,0,0,0)\"><Column PercentWidth=\"100\"><Control FieldName=\"System.IterationPath\" Type=\"WorkItemClassificationControl\" Label=\"Ite&amp;amp;ration\" LabelPosition=\"Left\" /></Column></Group><Group Margin=\"(10,0,0,0)\"><Column PercentWidth=\"50\"><Group Label=\"Status\"><Column PercentWidth=\"100\"><Control FieldName=\"System.AssignedTo\" Type=\"FieldControl\" Label=\"Assi&amp;amp;gned To\" LabelPosition=\"Left\" /><Control FieldName=\"System.State\" Type=\"FieldControl\" Label=\"Stat&amp;amp;e\" LabelPosition=\"Left\" /><Control FieldName=\"System.Reason\" Type=\"FieldControl\" Label=\"Reason\" LabelPosition=\"Left\" /></Column></Group></Column><Column PercentWidth=\"50\"><Group Label=\"Details\"><Column PercentWidth=\"100\"><Control FieldName=\"Microsoft.VSTS.Scheduling.Effort\" Type=\"FieldControl\" Label=\"Effort\" LabelPosition=\"Left\" /><Control FieldName=\"Microsoft.VSTS.Common.Severity\" Type=\"FieldControl\" Label=\"Severity\" LabelPosition=\"Left\" /><Control FieldName=\"System.AreaPath\" Type=\"WorkItemClassificationControl\" Label=\"&amp;amp;Area\" LabelPosition=\"Left\" /></Column></Group></Column></Group><Group><Column PercentWidth=\"50\"><TabGroup><Tab Label=\"Steps to Reproduce\"><Control FieldName=\"Microsoft.VSTS.TCM.ReproSteps\" Type=\"HtmlFieldControl\" Label=\"\" LabelPosition=\"Top\" MinimumSize=\"(100,200)\" Dock=\"Fill\" /></Tab><Tab Label=\"System\"><Group Label=\"Build\"><Column PercentWidth=\"100\"><Control FieldName=\"Microsoft.VSTS.Build.FoundIn\" Type=\"FieldControl\" Label=\"Found in Build\" LabelPosition=\"Left\" /><Control FieldName=\"Microsoft.VSTS.Build.IntegrationBuild\" Type=\"FieldControl\" Label=\"Integrated in Build\" LabelPosition=\"Left\" /></Column></Group><Control FieldName=\"Microsoft.VSTS.TCM.SystemInfo\" Type=\"HtmlFieldControl\" Label=\"System Info\" LabelPosition=\"Top\" Dock=\"Fill\" /></Tab><Tab Label=\"Test Cases\"><Control Type=\"LinksControl\" Name=\"TestedBy\" Label=\"\" LabelPosition=\"Top\"><LinksControlOptions><LinkColumns><LinkColumn RefName=\"System.Id\" /><LinkColumn RefName=\"System.WorkItemType\" /><LinkColumn RefName=\"System.Title\" /><LinkColumn RefName=\"System.AssignedTo\" /><LinkColumn RefName=\"System.State\" /></LinkColumns><WorkItemLinkFilters FilterType=\"include\"><Filter LinkType=\"Microsoft.VSTS.Common.TestedBy\" FilterOn=\"forwardname\" /></WorkItemLinkFilters><ExternalLinkFilters FilterType=\"excludeAll\" /><WorkItemTypeFilters FilterType=\"include\"><Filter WorkItemType=\"Test Case\" /></WorkItemTypeFilters></LinksControlOptions></Control></Tab><Tab Label=\"Tasks\"><Control Type=\"LinksControl\" Label=\"\" LabelPosition=\"Top\" Name=\"TaskLinks\"><LinksControlOptions><LinkColumns><LinkColumn RefName=\"System.Id\" /><LinkColumn RefName=\"System.WorkItemType\" /><LinkColumn RefName=\"System.Title\" /><LinkColumn RefName=\"System.AssignedTo\" /><LinkColumn RefName=\"System.State\" /></LinkColumns><WorkItemLinkFilters FilterType=\"include\"><Filter LinkType=\"System.LinkTypes.Hierarchy\" FilterOn=\"forwardname\" /></WorkItemLinkFilters><ExternalLinkFilters FilterType=\"excludeAll\" /><WorkItemTypeFilters FilterType=\"include\"><Filter WorkItemType=\"Task\" /></WorkItemTypeFilters></LinksControlOptions></Control></Tab></TabGroup></Column><Column PercentWidth=\"50\"><TabGroup Margin=\"(5,0,0,0)\"><Tab Label=\"Acceptance Criteria\"><Control FieldName=\"Microsoft.VSTS.Common.AcceptanceCriteria\" Type=\"HtmlFieldControl\" Label=\"\" LabelPosition=\"Top\" Dock=\"Fill\" MinimumSize=\"(100,200)\" /></Tab><Tab Label=\"History\"><Control FieldName=\"System.History\" Type=\"WorkItemLogControl\" Label=\"\" LabelPosition=\"Top\" Dock=\"Fill\" /></Tab><Tab Label=\"Links\"><Control Type=\"LinksControl\" Name=\"GeneralLinks\" LabelPosition=\"Top\"><LinksControlOptions><LinkColumns><LinkColumn RefName=\"System.Id\" /><LinkColumn RefName=\"System.WorkItemType\" /><LinkColumn RefName=\"System.Title\" /><LinkColumn RefName=\"System.AssignedTo\" /><LinkColumn RefName=\"System.State\" /><LinkColumn LinkAttribute=\"System.Links.Comment\" /></LinkColumns><WorkItemLinkFilters FilterType=\"includeAll\" /><ExternalLinkFilters FilterType=\"includeAll\" /><WorkItemTypeFilters FilterType=\"includeAll\" /></LinksControlOptions></Control></Tab><Tab Label=\"Attachments\"><Control Type=\"AttachmentsControl\" LabelPosition=\"Top\" /></Tab></TabGroup></Column></Group></Layout></FORM>");
    console.log(form.FORM.Layout);
    $scope.groups = form.FORM.Layout;
    $scope.vso = { System_Reason: "test" };
    // synchronize the object with a three-way data binding
    // click on `index.html` above to see it used in the DOM!
    syncObject.$bindTo($scope, "data");
});