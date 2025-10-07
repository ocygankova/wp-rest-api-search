<?php
// This file is generated. Do not modify it manually.
return array(
	'wp-rest-api-search' => array(
		'$schema' => 'https://schemas.wp.org/trunk/block.json',
		'apiVersion' => 3,
		'name' => 'create-block/wp-rest-api-search',
		'version' => '0.1.0',
		'title' => 'Rest API Searchbar',
		'category' => 'widgets',
		'icon' => 'search',
		'description' => 'Live searchbar by post types, utilizing WordPress REST API.',
		'example' => array(
			
		),
		'supports' => array(
			'html' => false
		),
		'textdomain' => 'wp-rest-api-search',
		'editorScript' => 'file:./index.js',
		'editorStyle' => 'file:./index.css',
		'style' => 'file:./style-index.css',
		'render' => 'file:./render.php',
		'viewScript' => 'file:./view.js',
		'attributes' => array(
			'postTypes' => array(
				'type' => 'array',
				'default' => array(
					
				)
			)
		)
	)
);
