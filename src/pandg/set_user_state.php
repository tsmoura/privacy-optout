<?php

# yes, this is messy

header('content-type: application/json; charset=utf-8');

$user = $_GET['user'];
$state = $_GET['state'];

$json = array( 'user' => $user, 'state' => $state );

$callback = $_GET['jsonp'];

exit( "{$callback}(" . json_encode( $json ) . ")" );
    
?>