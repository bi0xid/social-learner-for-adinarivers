<?php
	/**
	 * The Header for your theme.
	 *
	 * Displays all of the <head> section and everything up until <div id="main">
	 *
	 * @package WordPress
	 * @subpackage Social Learner
	 * @since Social Learner 1.0.0
	 */
?>

<!DOCTYPE html>
<html <?php if(get_page_template_slug() === 'user-login.php' || get_page_template_slug() === 'profile-page.php') { echo 'data-fullheight="true"'; }; ?> <?php language_attributes(); ?>>

<head>
	<meta charset="<?php bloginfo( 'charset' ); ?>" />
	<meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no">
	<meta name="apple-mobile-web-app-capable" content="yes" />
	<meta name="msapplication-tap-highlight" content="no"/>
	<meta http-equiv="X-UA-Compatible" content="IE=edge" />
	<title><?php wp_title( '|', true, 'right' ); ?></title>
	<link rel="profile" href="http://gmpg.org/xfn/11" />
	<link rel="pingback" href="<?php bloginfo( 'pingback_url' ); ?>" />
	<link rel="shortcut icon" href="<?php echo get_stylesheet_directory_uri(); ?>/images/favicon.ico" type="image/x-icon">
	<!-- BuddyPress and bbPress Stylesheets are called in wp_head, if plugins are activated -->
	<?php wp_head(); ?>
</head>

<?php
	global $rtl;

	$logo	 = ( boss_get_option( 'logo_switch' ) && boss_get_option( 'boss_logo', 'id' ) ) ? '1' : '0';
	$inputs	 = ( boss_get_option( 'boss_inputs' ) ) ? '1' : '0';
	$boxed	 = 'fluid';

	$mts_helpers = new mts_helper;
?>

<body <?php body_class(); ?> data-logo="<?php echo $logo; ?>" data-inputs="<?php echo $inputs; ?>" data-rtl="<?php echo ($rtl) ? 'true' : 'false'; ?>" data-courseid="<?php echo $mts_helpers->get_current_course_id(); ?>">

<div id="main" class="wrapper">