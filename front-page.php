<!DOCTYPE html>

<?php
/**
 * Template Name: Courses Loop Dashboard
 * @author Alejandro Orta
 * @package WordPress
 * @subpackage social-learner
 * @since 1.1
 */

// This template is only temporal for the 5th June start

global $woothemes_sensei, $post, $current_user, $front_page;

// Variable to use it on multiple places
$front_page = true;

$video_was_viewed = get_user_meta(get_current_user_id(), '_welcome_video_viewed')[0]['video_viewed'];
$mts_helpers = new mts_helper();

?>

<script charset="ISO-8859-1" src="//fast.wistia.com/assets/external/E-v1.js"></script>

<?php
	get_header();
?>

<div id="dashboard_page">
	<div class="header">
		<?php
			// Menu
			get_template_part('template-parts/header-custom');
		?>
	</div>

	<div id="top-header">
		<div class="left-image">
			<img src="<?php echo get_stylesheet_directory_uri().'/images/for_women_2.jpg'; ?>" alt="Adina">
		</div>

		<div class="right-content">
			<h1>Boo, You Did It!</h1>
			<p>
				The Pussy Massage Course will start, one day after the Enrollment has closed. In the meantime please leave us a comment. I would love to hear from you.
				<br><br>
				Much Love,
				<br>
				Adina.
			</p>

			<div class="course_counter_block">
				<div class="background" style="background-image:url(<?php echo get_stylesheet_directory_uri().'/images/sp7.jpg'; ?>)"></div>
				<h4>Pussy Massage Course</h4>
				<div class="counter"></div>
			</div>
		</div>
	</div>

	<div class="dashboard-comment">
		<div class="comments-count">
			<h2>Comments</h2>
			<h4>total <?php do_action( 'get_total_comments_label' ); ?></h4>
		</div>

		<?php
			// Comments form
			get_template_part('template-parts/ajax_comments/send_comment_form');
		?>

		<div id="ajax-comments" data-post="<?php echo $post->ID; ?>">
			<div class="comment-list">
				<?php do_action('get_first_comments'); ?>
			</div>
			<?php do_action( 'ajax_comments_pagination' ); ?>
		</div>
	</div>
</div>

<?php if ( function_exists( 'the_zendesk_webwidget' ) ) the_zendesk_webwidget(); ?>

<?php
	if(wp_is_mobile() && get_current_user_id() && !$front_page) {
		get_template_part('template-parts/fixed-footer');
	}
?>
