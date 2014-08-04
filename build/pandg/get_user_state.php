<?php

# yes, this is messy

header('content-type: application/json; charset=utf-8');

$users = array(
  
  '1' => array(
    'user' => '1',
    'state' => 'opted_in'
  ),

  '2' => array(
    'user' => '2',
    'state' => 'opted_out'
  ),

  '3' => array(
    'user' => '3',
    'state' => 'make_choice'
  )

);

if ( array_key_exists( $_GET['user'], $users ) ) {
  $json = $users[$_GET['user']];
} else {
  $json = array( 'state' => 'make_choice' );
}

$callback = $_GET['jsonp'];

exit( "{$callback}(" . json_encode( $json ) . ")" );
    
?>