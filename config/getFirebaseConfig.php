<?php
    $firebaseConfig = array(
        'apiKey' => 'AIzaSyDeXlKk7p7EFbOVLJoJJvp8Jl6udDoXazc',
        'authDomain' => 'myemoteapp.firebaseapp.com',
        'projectId' => 'myemoteapp',
        'storageBucket' => 'myemoteapp.appspot.comt',
        'messagingSenderId' => '161180412325',
        'appId' => '1:161180412325:web:d5db3ee91b99f96515a04c'
    );
    echo json_encode(array('firebaseConfig' => $firebaseConfig));
?>