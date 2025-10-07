<?php
	/**
	 * Render callback for the WP API Search block.
	 *
	 * @param array $attributes Block attributes.
	 */

	$post_types = isset( $attributes['postTypes'] ) && is_array( $attributes['postTypes'] )
		? $attributes['postTypes']
		: [];

	$data_attrs = array(
		'class'           => 'wp-rest-api-search',
		'data-post-types' => esc_attr( wp_json_encode( $post_types ) ),
	);
?>

<div <?php echo get_block_wrapper_attributes( $data_attrs ); ?>>
	<div class="searchbar">
		<input
			type="text"
			aria-label="Search input"
			placeholder="Search…"
		/>

		<button
			type="button"
			class="search-clear"
			aria-label="Clear search"
		>
			<svg viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
				<path
					d="M14.348 5.652a.5.5 0 0 0-.707 0L10 9.293 6.36 5.652a.5.5 0 1 0-.707.707L9.293 10l-3.64 3.64a.5.5 0 1 0 .707.707L10 10.707l3.64 3.64a.5.5 0 0 0 .707-.707L10.707 10l3.64-3.64a.5.5 0 0 0 0-.708z"/>
			</svg>
		</button>
	</div>

	<div class="search-results"></div>
</div>
