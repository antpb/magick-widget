<?php
                

/**
* Plugin Name: Magick Widget
* Plugin URI: 
* Description: A connector for Magick IDE
* Version: 0.0.1
* Requires at least: 6.0
* Requires PHP:      7.1.0
* Author:            antpb
* Author URI:        https://3ov.xyz
* License:           GPL v2 or later
* License URI:       https://www.gnu.org/licenses/gpl-2.0.html
* Text Domain:       magick-widget
* Domain Path:       /languages
*/
namespace magick;


// Include magick-chat-widget
include_once dirname( __FILE__ ) . '/blocks/magick-chat-widget/init.php';

include_once dirname( __FILE__ ). '/inc/functions.php';
include_once dirname( __FILE__ ). '/inc/hooks.php';
include_once dirname( __FILE__ ) . '/admin/magick-settings/init.php';


use magick\Core\Plugin;
$main = new Plugin();
$main->init();
