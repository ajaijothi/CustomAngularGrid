<!DOCTYPE html>
<html lang="en">
<html>
<head>
  <meta http-equiv="content-type" content="text/html; charset=UTF-8">
  <title>Grid</title>
  
  <link rel="stylesheet" type="text/css" href="grid.css">
  <link rel="stylesheet" type="text/css" href="http://cdnjs.cloudflare.com/ajax/libs/font-awesome/4.2.0/css/font-awesome.css">  
  
  <script type="text/javascript" src="https://code.jquery.com/jquery-1.9.1.js"></script>
  <script type="text/javascript" src="http://code.jquery.com/ui/1.9.2/jquery-ui.js"></script>
  <script src="http://code.jquery.com/jquery-migrate-1.2.1.js"></script>
  <script type="text/javascript" src="https://ajax.googleapis.com/ajax/libs/angularjs/1.2.26/angular.min.js"></script>
  <script src="https://ajax.googleapis.com/ajax/libs/angularjs/1.2.26/angular-sanitize.js"></script>
  <script src="underscore-min.js"></script>  
  <script src="grid.js"></script>
  <script src="example.js"></script>
  <!--fix for ie8-->
  <script>
      document.createElement('grid');
    </script>
</head>
<body>
	<div ng-app="mygrid" ng-controller="gridController">
		<grid config="gridOptions" ng-model="MyGrid"></grid>
		<div class="well">
		{{MyGrid}}
		</div>
	</div>
	<?php include('grid.template'); ?>
	<script src="http://maxcdn.bootstrapcdn.com/bootstrap/3.2.0/js/bootstrap.min.js"></script>  
</body>
</html>
