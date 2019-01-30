<?php

/**
 * Template Name: Finished Course Page
 *
 * @package WordPress
 * @subpackage social-learner
 * @author Alejandro Orta
 * @since 1.0
 */

if( ! defined('ABSPATH') ) {
	exit;
}

get_header();

global $woothemes_sensei, $current_user, $woocommerce;

$post_id = $_REQUEST['post_id'];

// Get User Meta
get_currentuserinfo();

// Check if the user is taking the course
$is_user_taking_course = WooThemes_Sensei_Utils::user_started_course( $post_id, $current_user->ID );

// Content Access Permissions
$access_permission = false;
if ((isset( $woothemes_sensei->settings->settings['access_permission'] ) && ! $woothemes_sensei->settings->settings['access_permission'] ) || sensei_all_access()) {
	$access_permission = true;
}

?>

<script charset="ISO-8859-1" src="//fast.wistia.com/assets/external/E-v1.js"></script>

<article <?php post_class( array( 'course', 'post' ) ); ?>>
	<section class="header-course">
		<?php
			// Top Header
			get_template_part('template-parts/header-custom');

			// Lessons Progress
			get_template_part('template-parts/lessons-progress');
		?>

		<div id="wistia-video-wrapper" data-id="<?php echo get_post_meta( $post_id, 'end_video_id', true ); ?>">
			<div id="wistia_<?php echo get_post_meta( $post_id, 'end_video_id', true ); ?>" class="wistia_embed"></div>
		</div>
	</section>

	<?php
	if ( ( is_user_logged_in() && $is_user_taking_course ) || $access_permission || 'full' == $woothemes_sensei->settings->settings[ 'course_single_content_display' ] ) {
		echo '<section class="entry-content">';
			echo '<div class="icon"><i class="fa fa-heart" aria-hidden="true"></i></div>';
			echo '<h1>Congratulations!</h1>';
			echo '<p>'.get_post_meta( $post_id, 'end_course_text', true ).'</p>';
		echo '</section>';
	}
	?>
</article><!-- .post -->

<?php
	get_footer();
?>