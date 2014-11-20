angular.module('mygrid', ['grid']).controller('gridController', ['$scope', function ($scope) {
        $scope.data=[];
        $scope.ReAssign = function(e, r){
            if(r)                
            r._hierarchy = [];
        }
		$scope.columns = [{
			name: 'CustomName',
			value: 'Name',
			type:'link',
			url:'http://www.google.com/?q=[Id]',
			modalProperties:{
				fullscreen: true				
			},
			modalTitle: "Sample Modal",
			style:{
				width:'10%'
			}
		},
		{
			name: 'UG',
			value: 'Degree',
			type:"",
            url:"[Degree]",
            style:{
				width:'20%'
			},
            filter:{
                type:'dropdown'
            }
		},
		{
			name: 'Status',
			value: 'Status',
			type:"icon",
            style:{
				width:'20%'
			},
            filter:{
                type:'dropdown'
            }
		},
		{
			name: 'Temp Column',
			value: 'Id',
			type:"",            
			style:{
				width:'10%'
			},
            filter:{
                type:'number',
                fromTo:true
            }
		},
		{
			name: 'Date of Entry',
			value: 'Date',
			type:"",
            dataType:'date',
            filter:{
                type:'date',
                fromTo:true
            }
		}];
        
        $scope.actions = [{
            name:'Delete',
            displayType: 'button', //link, button, 
            iconClass: 'fa fa-wrench',
            textTemplate:'',
            actionType: 'link', //link, modal, function
            action: "http://www.google.com",  //handler(rowObj),
            modalSettings:{}
        },
        {
            name:'ExportAsExcel',
            displayType: 'button', //link, button, 
            //iconClass: 'fa fa-file-excel-o',
            textTemplate:'<i class="fa fa-lg fa-file-excel-o green"></i>',
            actionType: 'function', //link, modal, function
            action: $scope.ReAssign,  //handler(rowObj),
            isGeneralAction:true,
            modalSettings:{}
        },
        {
            name:'ExportAsWord',
            displayType: 'button', //link, button, 
            //iconClass: 'fa fa-file-excel-o',
            customClass:'blue',
            textTemplate:'<i class="fa fa-lg fa-file-word-o"></i>',
            actionType: 'function', //link, modal, function
            action: $scope.ReAssign,  //handler(rowObj),
            isGeneralAction:true,
            modalSettings:{}
        },{
            name:'ExportAsPDF',
            displayType: 'button', //link, button, 
            //iconClass: 'fa fa-file-excel-o',
            textTemplate:'<i class="fa fa-lg fa-file-pdf-o red"></i>',
            actionType: 'function', //link, modal, function
            action: $scope.ReAssign,  //handler(rowObj),
            isGeneralAction:true,
            modalSettings:{}
        }];        

        $scope.gridOptions = {
           // hierarchy:true,
            hierarchyUrl:'config.json?[Id]',
            dataUrl:'grid.json',
            serverPaging:true,
			multiSelect:false,
            pageSize:5,
            totalRecords:500,
            multiSelect:true,
			columns:$scope.columns,
            actions:$scope.actions
        };
    }]);
