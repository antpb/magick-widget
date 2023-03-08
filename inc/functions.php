<?php 
/** Functions **/
namespace magick\Core;

add_action( 'wp_footer', function() {
    global $wp_scripts;
    $registered_scripts = $wp_scripts->queue;
    echo "<pre>";
    print_r( $registered_scripts );
    echo "</pre>";
});
class Plugin
{
	public function init() {
        // Add actions and filters
		add_action('wp_enqueue_scripts',  array( $this, 'magick_widget_frontend_assets'));
		add_action( 'rest_api_init',  array( $this, 'callAI' ));
		add_action('enqueue_block_editor_assets',  array( $this, 'magick_widget_editor_assets'));
    }	  
	
	// Registers a new REST API endpoint for calling AI/Alchemy services.
	function callAI() {
		register_rest_route( 'wp/v2', '/callAI', array(
		  'methods' => 'POST',
		  'callback' => array( $this, 'call_ai_request'),
		  'permission_callback' => array( $this, 'check_bearer_token'),
		  'args' => array(
		  ),
		) );
	  }
	  function rest_magick_decrypt($value = ""){
		if( empty( $value ) ) {
			return $value;
		}
	
		$output = null;
		$secret_key = defined('AUTH_KEY') ? AUTH_KEY : "";
		$secret_iv = defined('SECURE_AUTH_KEY') ? SECURE_AUTH_KEY : "";
		$key = hash('sha256',$secret_key);
		$iv = substr(hash('sha256',$secret_iv),0,16);
	
		return openssl_decrypt(base64_decode($value),"AES-256-CBC",$key,0,$iv);
	}
	
	  // The function that is called when the endpoint is hit
	  function call_ai_request( $request ) {	
		$worker_url = get_option( 'magick_mp_networkWorker', '' );
		$api_key = $this->rest_magick_decrypt( get_option( 'magick_ai_magickApiKey', '' ) );
		$json_blob = $request->get_params();
		// grab the route parameter out of the request and remove it from the blob
		$agent_route = $json_blob['agentRoute'];
		unset($json_blob['agentRoute']);
		$agent_id = $json_blob['agentId'];
		// turn $json_blob['id'] into a string
		$json_blob['content']['id'] = $agent_id;
		$json_blob['apiKey'] = $api_key;

		$new_blob = json_encode($json_blob);

		// combine the worker url with the agent route
		$worker_url = $worker_url . $agent_route;
		
		if ($api_key != '') {
		$response = wp_remote_post( $worker_url, array(
			'headers' => array(
				'Content-Type' => 'application/json',
				'Authorization' => "Bearer $api_key"
			),
			'timeout'   => 100,
			'body'      => $new_blob,
			'sslverify' => false,
		) );
		} else {
			$response = wp_remote_post( $worker_url, array(
				'headers' => array(
					'Content-Type' => 'application/json',
				),
				'timeout'     => 100,
				'body'        => $new_blob,
				'sslverify'   => false,
			) );
		}
		// Check for error
		if ( is_wp_error( $response ) ) {
		  // WP_Error object
		  $error_message = $response->get_error_message();
		  return new \WP_Error( 'api_call_failed', $error_message, array( 'status' => 500 ) );
		}
	
		// Check for non-200 status code
		// check that response code is not 200 or 201
		if( wp_remote_retrieve_response_code( $response ) != 200 && wp_remote_retrieve_response_code( $response ) != 201 ) {
		  return new \WP_Error( 'api_call_failed' . wp_remote_retrieve_response_code( $response ), 'Non-200 status code returned', array( 'status' => wp_remote_retrieve_response_code( $response ) ) );
		}
	
		$body = wp_remote_retrieve_body( $response );
		return $body;
	}
	
	// The function that checks the bearer token. Make the bearer token a secret using get_option(). This is a crude example.
	  function check_bearer_token( $request ) {
		$nonce = $request->get_header( 'X-WP-Nonce' );
		if ( ! $nonce || ! wp_verify_nonce( $nonce, 'wp_rest' ) ) {
		  return new \WP_Error( 'invalid_nonce', 'The nonce provided in the X-WP-Nonce header is invalid', array( 'status' => 401 ) );
		}
		return true;
	  }
	  
	/**
	 * Enqueue block frontend JavaScript
	 */
	function magick_widget_frontend_assets() {
	
		// Enqueue frontend JavaScript
		$default_frontend_js_magick = "../build/assets/js/blocks.magick.js.js";
	
		$current_user = wp_get_current_user();
		if ( is_user_logged_in() && get_option('magick_ai_allow') === "loggedIn" ) {
			$user_data_passed = array(
			  'userId' => $current_user->user_login,
			  'banner' => $current_user->custom_banner,
			  'profileImage' => get_avatar_url( $current_user->ID, ['size' => '500'] ),
			  'nonce' => wp_create_nonce( 'wp_rest' )
			);
		} else if ( get_option('magick_ai_allow') === "public") {
			$user_data_passed = array(
				'userId' => $current_user->user_login,
				'banner' => $current_user->custom_banner,
				'profileImage' => get_avatar_url( $current_user->ID, ['size' => '500'] ),
				'nonce' => wp_create_nonce( 'wp_rest' )
			  );  
		}
		else {
			$user_data_passed = array(
			  'userId' => $current_user->user_login,
			  'banner' => $current_user->custom_banner,
			  'profileImage' => get_avatar_url( $current_user->ID, ['size' => '500'] ),
			  'nonce' => wp_create_nonce( 'wp_rest' )
			);
		}
		// $user_data_passed = array(
		//     'userId' => 'something',
		//     'userName' => 'someone',
		//  );
		global $post;
		$post_slug = $post->post_name;
		$openbrush_enabled = false;
			if (!function_exists('is_plugin_active')) {
				include_once(ABSPATH . 'wp-admin/includes/plugin.php');
			}
	
			//We only want the script if it's a singular page
			$id = get_the_ID();
				wp_register_script( 'magick-chat-widget-save', plugin_dir_url( __FILE__ ) . $default_frontend_js_magick, ['wp-element', 'wp-data', 'wp-hooks'], '', true );
				wp_localize_script( 'magick-chat-widget-save', 'magickUserData', $user_data_passed );
				wp_enqueue_script( 
					"magick-chat-widget-save"
				);	  	
	}
	/**
	 * Enqueue block frontend JavaScript
	 */
	function magick_widget_editor_assets() {
		$magick_widget_plugin = plugins_url() . '/magick-widget/build/';

		$current_user = wp_get_current_user();
		if ( is_user_logged_in() && get_option('magick_ai_allow') === "loggedIn" ) {
			$user_data_passed = array(
			  'userId' => $current_user->user_login,
			  'nonce' => wp_create_nonce( 'wp_rest' )
			);
		} else if ( get_option('magick_ai_allow') === "public") {
			$user_data_passed = array(
				'userId' => $current_user->user_login,
				'nonce' => wp_create_nonce( 'wp_rest' )
			  );  
		}
		else {
			$user_data_passed = array(
			  'userId' => $current_user->user_login,
			  'nonce' => wp_create_nonce( 'wp_rest' )
			);
		}

		wp_localize_script( 'magick-widget-magick-chat-widget-editor-script', 'magickWidgetPlugin', $magick_widget_plugin );	
		wp_localize_script( 'magick-widget-magick-chat-widget-editor-script', 'magickUserData', $user_data_passed );	
		wp_localize_script( 'magick-widget-magick-chat-widget-editor-script', 'allowed_blocks', $ALLOWED_BLOCKS );
	
	}

}