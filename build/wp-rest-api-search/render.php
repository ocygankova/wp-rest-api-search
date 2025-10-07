<?php
	/**
	 * Render callback for the WP API Search block.
	 *
	 * @param array $attributes Block attributes.
	 */

	$post_types = isset( $attributes['postTypes'] ) && is_array( $attributes['postTypes'] )
		? $attributes['postTypes']
		: [ 'post' ];

	$data_attrs = array(
		'class'           => 'rest-api-searchbar',
		'data-post-types' => esc_attr( wp_json_encode( $post_types ) ),
	);
?>

<div <?php echo get_block_wrapper_attributes( $data_attrs ); ?>>
	<label>
		<input type="search" placeholder="<?php esc_attr_e( 'Search…', 'wp-rest-api-search' ); ?>" />
	</label>
	<div class="search-results"></div>
</div>
