<?php
//Register assets for Magick Settings
add_action('init', function () {
    $handle = 'magick-settings';
    if( file_exists(dirname(__FILE__, 3). "/build/admin-page-$handle.asset.php" ) ){
        $assets = include dirname(__FILE__, 3). "/build/admin-page-$handle.asset.php";
        $dependencies = $assets['dependencies'];
        wp_register_script(
            $handle,
            plugins_url("/build/admin-page-$handle.js", dirname(__FILE__, 2)),
            $dependencies,
            $assets['version']
        );
    }
});

//Register API Route to read and update settings.
add_action('rest_api_init', function (){
    //Register route
    register_rest_route( 'magick-widget/v1' , '/magick-settings/', [
        //Endpoint to get settings from
        [
            'methods' => ['GET'],
			'callback' => function($request){
				return rest_ensure_response( [
					'enabled' => get_option( 'magick_ai_enabled', false ),
					'networkWorker' => get_option( 'magick_mp_networkWorker', '' ),
					'magickApiKey' => magick_decrypt ( get_option( 'magick_ai_magickApiKey', '' ) ),
					'allowPublicAI' => get_option( 'magick_ai_allow', '' ),
				], 200);
			},
					'permission_callback' => function(){
                return current_user_can('manage_options');
            }
        ],
        //Endpoint to update settings at
        [
            'methods' => ['POST'],
			'callback' => function($request){
				$data = $request->get_json_params();
				update_option( 'magick_ai_enabled', $data['enabled'] );
				update_option( 'magick_mp_networkWorker', $data['networkWorker'] );
				update_option( 'magick_ai_allow', $data['allowPublicAI'] );
				update_option( 'magick_ai_magickApiKey', magick_encrypt( $data['magickApiKey'] ) );
				return rest_ensure_response( $data, 200);
			},
			'permission_callback' => function(){
                return current_user_can('manage_options');
            }
        ]
    ]);
});

//Enqueue assets for Magick Settings on admin page only
add_action('admin_enqueue_scripts', function ($hook) {
    if ('toplevel_page_magick-settings' != $hook) {
        return;
    }
    wp_enqueue_script('magick-settings');
});

//Register Magick Settings menu page
add_action('admin_menu', function () {
    add_menu_page(
        __('Magick Settings', 'magick-widget'),
        __('Magick Settings', 'magick-widget'),
        'manage_options',
        'magick-settings',
        function () {
            //React root
            echo '<div id="magick-settings"></div>';
        }
    );
});

function magick_encrypt($value = ""){
    if( empty( $value ) ) {
        return $value;
    }
    
    $output = null;
    $secret_key = defined('AUTH_KEY') ? AUTH_KEY : "";
    $secret_iv = defined('SECURE_AUTH_KEY') ? SECURE_AUTH_KEY : "";
    $key = hash('sha256',$secret_key);
    $iv = substr(hash('sha256',$secret_iv),0,16);
    return base64_encode(openssl_encrypt($value,"AES-256-CBC",$key,0,$iv));
}


function magick_decrypt($value = ""){
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